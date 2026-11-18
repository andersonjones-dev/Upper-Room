// Your Quiz: a quiz master writes questions (typed and pasted), the quiz gets a code and is saved
// online, it's played in a room (an English and a Kannada phone plus a practice bot), answers can be
// changed, and another phone opens the same quiz with its code.
// Usage: node tests/e2e-yourquiz.cjs <base-url> <screenshot-dir>
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://127.0.0.1:8765/upper-room/';
const SHOTS = process.argv[3] || '/tmp/ur-shots';
(async () => {
  const browser = await chromium.launch(), errors = [];
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mk = async (label, c = ctx) => { const p = await c.newPage(); p.on('pageerror', (e) => errors.push(label + ': ' + e.message)); return p; };
  const ov = (p) => p.evaluate(() => { const v = document.getElementById('view'); return [v.scrollHeight - v.clientHeight, document.documentElement.scrollWidth - innerWidth]; });
  const host = await mk('host');
  await host.goto(BASE + '?net=local'); await host.evaluate(() => localStorage.clear()); await host.goto(BASE + '?net=local');
  const homeOv = await ov(host);
  if (homeOv[0] > 0 || homeOv[1] > 0) errors.push('home overflow ' + homeOv); // 390×844
  await host.setViewportSize({ width: 375, height: 667 });
  const seOv = await ov(host);
  console.log('home overflow 844/667', homeOv[0], seOv[0]);
  await host.screenshot({ path: `${SHOTS}/qz-00-home-se.png` });
  await host.setViewportSize({ width: 390, height: 844 });

  // ---- write a quiz ----
  await host.click('[data-act="myQuizzes"]'); await host.waitForSelector('text=No quizzes on this phone yet.');
  await host.screenshot({ path: `${SHOTS}/qz-01-list-empty.png` });
  await host.click('[data-act="qzNew"]');
  await host.waitForSelector('text=Your quiz gets its code');
  await host.fill('[data-qf="name"]', 'Sunday class · Acts 1–4');
  await host.fill('[data-qf="q.0.q"]', 'Where were the disciples told to wait?');
  for (const [k, v] of ['Jerusalem', 'Galilee', 'Bethany'].entries()) await host.fill(`[data-qf="q.0.o.${k}"]`, v);
  await host.fill('[data-qf="q.0.r"]', 'Acts 1:4');
  // typing keeps focus (fields are never redrawn under the finger)
  await host.click('[data-qf="q.0.o.3"]'); await host.keyboard.type('Emmaus', { delay: 20 });
  const focused = await host.evaluate(() => document.activeElement && document.activeElement.dataset.qf);
  if (focused !== 'q.0.o.3') errors.push('focus lost while typing: ' + focused);
  await host.waitForFunction(() => __ur.qz && __ur.qz.code, null, { timeout: 8000 });
  const code = await host.evaluate(() => __ur.qz.code);
  if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code)) errors.push('code ' + code);
  await host.waitForSelector('text=Write your quiz code down');
  await host.screenshot({ path: `${SHOTS}/qz-02-edit-first.png` });
  await host.click('[data-act="qzToggle"][data-i="0"]'); // Done
  await host.click('[data-act="qzAdd"]');
  await host.fill('[data-qf="q.1.q"]', 'Who was chosen in place of Judas?');
  await host.fill('[data-qf="q.1.o.0"]', 'Barsabas'); await host.fill('[data-qf="q.1.o.1"]', 'Matthias');
  await host.click('[data-act="qzMark"][data-i="1"][data-k="1"]');
  await host.screenshot({ path: `${SHOTS}/qz-03-edit-second.png` });
  await host.click('[data-act="qzToggle"][data-i="1"]');
  // paste two more, one with a problem
  await host.click('[data-act="qzPaste"]');
  await host.fill('[data-qf="paste"]', 'How many were added at Pentecost?\nAbout 120\n*About 3000\nAbout 5000\nRef: Acts 2:41\n\nAt which gate was the lame man laid?\nSheep\nBeautiful\nFish');
  await host.waitForSelector('text=1 ready · 1 to fix');
  await host.screenshot({ path: `${SHOTS}/qz-04-paste.png` });
  await host.fill('[data-qf="paste"]', 'How many were added at Pentecost?\nAbout 120\n*About 3000\nAbout 5000\nRef: Acts 2:41\n\nAt which gate was the lame man laid?\nSheep\n*Beautiful\nFish\nRef: Acts 3:2');
  await host.waitForSelector('text=Add 2 questions');
  await host.click('[data-act="qzPasteAdd"]');
  await host.waitForSelector('text=4 questions · 4 ready to play');
  await host.waitForFunction(() => __ur.qz.status === 'saved');
  const saved = await host.evaluate((c) => JSON.parse(localStorage.getItem('ur.localdb')).quizzes[c], code);
  if (!saved || saved.qs.length !== 4 || saved.qs[1].a !== 1 || saved.qs[2].r !== 'Acts 2:41' || saved.name !== 'Sunday class · Acts 1–4') errors.push('saved ' + JSON.stringify(saved));
  await host.evaluate(() => document.getElementById('view').scrollTo(0, 0));
  await host.screenshot({ path: `${SHOTS}/qz-05-edit-all.png` });
  const edOv = await ov(host); if (edOv[1] > 0) errors.push('editor sideways ' + edOv);

  // ---- play it: straight into a new room ----
  await host.click('[data-act="qzPlay"]');
  await host.waitForSelector('.code');
  const room = (await host.textContent('.code')).trim();
  const meta = await host.evaluate(() => __ur.room.meta);
  if (meta.game !== 'qm' || meta.qz.code !== code || meta.qz.n !== 4) errors.push('meta ' + JSON.stringify(meta.qz));
  const join = async (label, name, color, lang) => {
    const p = await mk(label);
    await p.goto(BASE + '?net=local&join=' + room);
    await p.click(`[data-act="lang"][data-v="${lang}"]`);
    await p.fill('#name', name); await p.click(`[data-act="color"][data-c="${color}"]`); await p.click('[data-act="join"]');
    await p.waitForSelector(lang === 'kn' ? 'text=ನೀವು ಸೇರಿದ್ದೀರಿ.' : "text=You're in.");
    return p;
  };
  const ben = await join('ben', 'Ben', 'sapphire', 'en');
  const cara = await join('cara', 'Cara', 'emerald', 'kn');
  await cara.setViewportSize({ width: 375, height: 667 });
  await host.click('[data-act="addBot"]');
  await host.waitForFunction(() => Object.keys(__ur.room.players).length === 3);
  await host.click('[data-act="set"][data-k="secs"][data-v="15"]');
  await host.locator('.gwide').scrollIntoViewIfNeeded();
  await host.screenshot({ path: `${SHOTS}/qz-06-lobby.png` });
  await host.locator('[data-act="qzFromLobby"]').scrollIntoViewIfNeeded();
  await host.screenshot({ path: `${SHOTS}/qz-07-lobby-card.png` });
  const startTxt = (await host.textContent('[data-act="start"]')).trim();
  if (startTxt !== 'Start Your Quiz') errors.push('start ' + startTxt);
  await host.click('[data-act="start"]');
  const uids = await host.evaluate(() => Object.fromEntries(Object.entries(__ur.room.players).map(([u, p]) => [p.name, u])));
  for (let i = 0; i < 4; i++) {
    await ben.waitForFunction((i) => __ur.room.round && __ur.room.round.phase === 'play' && __ur.room.round.i === i, i, { timeout: 30000 });
    const rd = await ben.evaluate(() => __ur.room.round), y = rd.qz.qs[rd.seq[rd.i]];
    const wrong = y.a === 0 ? 1 : 0;
    // Cara (Kannada phone) sees the quiz master's own words; picks wrong first, then changes
    await cara.click(`[data-act="answer"][data-i="${wrong}"]`);
    await ben.waitForTimeout(150);
    await ben.click(`[data-act="answer"][data-i="${y.a}"]`);
    await cara.waitForTimeout(150);
    await cara.click(`[data-act="answer"][data-i="${y.a}"]`);
    if (i === 0) {
      const q = await cara.textContent('.qzqt'); if (q.trim() !== y.q) errors.push('cara question ' + q);
      await cara.screenshot({ path: `${SHOTS}/qz-08-cara-kn-se.png` }); console.log('cara SE overflow', (await ov(cara))[0]);
      await host.screenshot({ path: `${SHOTS}/qz-09-host-play.png` });
    }
    await host.waitForFunction(() => __ur.room.round.phase === 'reveal', null, { timeout: 20000 });
    const res = await host.evaluate(() => __ur.room.round.res);
    if (res.first !== uids.Ben || res.pts[uids.Ben] !== 200 || res.pts[uids.Cara] !== 100) errors.push(`q${i} ` + JSON.stringify(res));
    if (i === 1) {
      await host.screenshot({ path: `${SHOTS}/qz-10-host-reveal.png` }); await ben.screenshot({ path: `${SHOTS}/qz-11-ben-reveal.png` });
      console.log('host reveal overflow', (await ov(host))[0]);
    }
    await host.click('[data-act="nextNow"]').catch(() => {});
  }
  await host.waitForFunction(() => __ur.room.meta.status === 'results', null, { timeout: 20000 });
  const sc = await host.evaluate(() => Object.fromEntries(Object.values(__ur.room.players).map((p) => [p.name, p.score])));
  if (sc.Ben !== 800 || sc.Cara !== 400) errors.push('scores ' + JSON.stringify(sc));
  await host.screenshot({ path: `${SHOTS}/qz-12-results.png` });

  // ---- a second phone opens the same quiz with its code ----
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const other = await mk('other', ctx2);
  // same browser storage is needed for the test backend, so copy the database across
  const db = await host.evaluate(() => localStorage.getItem('ur.localdb'));
  await other.goto(BASE + '?net=local'); await other.evaluate((db) => { localStorage.clear(); localStorage.setItem('ur.localdb', db); }, db); await other.goto(BASE + '?net=local');
  await other.click('[data-act="myQuizzes"]'); await other.click('[data-act="qzOpenCode"]');
  await other.fill('[data-qf="openCode"]', 'zzzz22'); await other.click('[data-act="qzOpenGo"]');
  await other.waitForSelector('text=No quiz has the code ZZZZ22');
  await other.fill('[data-qf="openCode"]', code.toLowerCase().slice(0, 3) + '-' + code.toLowerCase().slice(3));
  await other.click('[data-act="qzOpenGo"]');
  await other.waitForSelector('text=4 questions · 4 ready to play');
  if ((await other.inputValue('[data-qf="name"]')) !== 'Sunday class · Acts 1–4') errors.push('opened name');
  await other.click('[data-act="qzList"]');
  await other.waitForSelector(`text=4 questions · code ${code}`);
  await other.screenshot({ path: `${SHOTS}/qz-13-other-list.png` });
  // remove from this phone (two taps); the quiz stays online
  await other.click(`[data-act="qzOpen"][data-code="${code}"]`); await other.waitForSelector('[data-act="qzForget"]');
  await other.click('[data-act="qzForget"]'); await other.click('[data-act="qzForget"]');
  await other.waitForSelector('text=No quizzes on this phone yet.');
  const online = await other.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('ur.localdb')).quizzes));
  if (online.join() !== code) errors.push('quizzes online (one, never deleted, no copies): ' + online.join());

  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'E2E YOURQUIZ OK');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
