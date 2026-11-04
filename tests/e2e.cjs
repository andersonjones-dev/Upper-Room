// End-to-end run: one host phone + two player phones, all three games, on the local test backend.
// Usage: node tests/e2e.cjs <base-url> <screenshot-dir>
const { chromium } = require('playwright');
const path = require('path');

const BASE = process.argv[2] || 'http://127.0.0.1:8765/upper-room/';
const SHOTS = process.argv[3] || '/tmp/ur-shots';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const content = await import(path.resolve(__dirname, '../js/content.js'));
  const logic = await import(path.resolve(__dirname, '../js/logic.js'));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  });
  const errors = [];
  const mk = async (label) => {
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errors.push(label + ': ' + e.message));
    p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(label + ' console: ' + m.text()); });
    return p;
  };
  const host = await mk('host');
  await host.goto(BASE + '?net=local');
  await host.evaluate(() => { localStorage.clear(); });
  await host.goto(BASE + '?net=local');
  await host.click('[data-act="host"]');
  await host.waitForSelector('.code');
  const code = (await host.textContent('.code')).trim();
  console.log('room', code);

  const join = async (label, name, color) => {
    const p = await mk(label);
    await p.goto(BASE + '?net=local&join=' + code);
    await p.fill('#name', name);
    await p.click(`[data-act="color"][data-c="${color}"]`);
    await p.click('[data-act="join"]');
    await p.waitForSelector('text=You\'re in.');
    return p;
  };
  const b = await join('ben', 'Ben', 'sapphire');
  const c = await join('cara', 'Cara', 'emerald');
  await host.waitForFunction(() => document.querySelectorAll('.roster .pl').length === 2);
  await host.screenshot({ path: SHOTS + '/01-host-lobby.png' });
  await b.screenshot({ path: SHOTS + '/02-player-wait.png' });

  // ---------- Verse Scramble ----------
  await host.click('[data-act="set"][data-k="rounds"][data-v="3"]');
  await host.click('[data-act="set"][data-k="secs"][data-v="30"]');
  await host.click('[data-act="start"]');
  await b.waitForSelector('text=Starting in');
  await b.screenshot({ path: SHOTS + '/03-player-intro.png' });
  for (let round = 0; round < 3; round++) {
    await b.waitForSelector('[data-act="piece"]', { timeout: 10000 });
    const rd = await b.evaluate(() => __ur.room.round);
    const parts = content.VERSES[rd.seq[rd.i]].parts;
    // Cara: wrong order first, then fix it
    const pool = await c.$$eval('[data-act="piece"]', (els) => els.map((e) => e.textContent));
    for (const t of pool) await c.click(`[data-act="piece"]:text-is(${JSON.stringify(t)})`);
    const wrong = await c.waitForSelector('text=Not quite', { timeout: 5000 }).then(() => true).catch(() => false);
    // Ben: right order
    for (const t of parts) await b.click(`[data-act="piece"]:text-is(${JSON.stringify(t)})`);
    await b.waitForSelector('text=Locked in ·');
    if (round === 0) { await host.screenshot({ path: SHOTS + '/04-host-race.png' }); await c.screenshot({ path: SHOTS + '/05-player-wrong.png' }); }
    if (wrong) {
      await c.click('[data-act="clearPieces"]');
      for (const t of parts) await c.click(`[data-act="piece"]:text-is(${JSON.stringify(t)})`);
    }
    await host.waitForFunction(() => __ur.room.round.phase === 'reveal', null, { timeout: 45000 });
    if (round === 0) { await host.screenshot({ path: SHOTS + '/06-host-reveal.png' }); await b.screenshot({ path: SHOTS + '/07-player-reveal.png' }); }
    await host.click('[data-act="nextNow"]');
  }
  await host.waitForSelector('text=Tonight\'s table');
  const st = await host.evaluate(() => Object.values(__ur.room.players).map((p) => [p.name, p.score]));
  console.log('scramble scores', JSON.stringify(st));
  if (!st.find(([n, s]) => n === 'Ben' && s === 900)) errors.push('Ben should have 900 after 3 wins: ' + JSON.stringify(st));
  await host.screenshot({ path: SHOTS + '/08-host-results.png' });
  await b.screenshot({ path: SHOTS + '/09-player-results.png' });

  // ---------- Twelve Tribes ----------
  await host.click('[data-act="toLobby"]');
  await host.click('[data-act="pick"][data-g="tr"]');
  await host.waitForSelector('text=Shuffle teams');
  await host.click('[data-act="set"][data-k="rounds"][data-v="6"]');
  await host.click('[data-act="set"][data-k="secs"][data-v="15"]');
  // make sure Ben and Cara are on different teams
  const teams = await host.evaluate(() => Object.values(__ur.room.players).map((p) => p.team));
  if (teams[0] === teams[1]) await c.click('[data-act="switchTeam"]');
  await host.screenshot({ path: SHOTS + '/10-host-lobby-tribes.png' });
  await host.click('[data-act="start"]');
  for (let q = 0; q < 6; q++) {
    await b.waitForSelector('[data-act="answer"]:not([disabled])', { timeout: 12000 });
    const rd = await b.evaluate(() => __ur.room.round);
    const right = content.TRIVIA[rd.seq[rd.i]].a;
    await b.click(`[data-act="answer"][data-i="${right}"]`);
    await sleep(60);
    await c.click(`[data-act="answer"][data-i="${(right + 1) % 4}"]`);
    await host.waitForFunction(() => __ur.room.round.phase === 'reveal', null, { timeout: 45000 });
    if (q === 0) { await host.screenshot({ path: SHOTS + '/11-host-tribes-reveal.png' }); await b.screenshot({ path: SHOTS + '/12-player-tribes-right.png' }); await c.screenshot({ path: SHOTS + '/13-player-tribes-wrong.png' }); }
    await host.click('[data-act="nextNow"]');
  }
  await host.waitForSelector('text=Tonight\'s table');
  const claims = await host.evaluate(() => __ur.room.round.claims);
  const cc = logic.countClaims(claims);
  console.log('tribes claims', JSON.stringify(cc));
  if (cc.ruby + cc.sapphire !== 12) errors.push('All 12 tribes should be claimed: ' + JSON.stringify(cc));
  await host.screenshot({ path: SHOTS + '/14-host-tribes-results.png' });

  // ---------- Emoji Bible ----------
  await host.click('[data-act="toLobby"]');
  await host.click('[data-act="pick"][data-g="em"]');
  await host.click('[data-act="set"][data-k="rounds"][data-v="5"]');
  await host.click('[data-act="start"]');
  for (let r = 0; r < 5; r++) {
    await b.waitForSelector('#guess', { timeout: 12000 });
    const rd = await b.evaluate(() => __ur.room.round);
    const e = content.EMOJI[rd.seq[rd.i]];
    await c.fill('#guess', 'zzz not it');
    await c.press('#guess', 'Enter');
    await c.waitForSelector('text=Not it');
    if (r === 0) await c.screenshot({ path: SHOTS + '/15-player-emoji-wrong.png' });
    await b.fill('#guess', e.a);
    await b.press('#guess', 'Enter');
    await b.waitForSelector('text=You got it');
    await c.fill('#guess', e.keys[0]);
    await c.press('#guess', 'Enter');
    await host.waitForFunction(() => __ur.room.round.phase === 'reveal', null, { timeout: 45000 });
    if (r === 0) { await host.screenshot({ path: SHOTS + '/16-host-emoji-reveal.png' }); }
    await host.click('[data-act="nextNow"]');
  }
  await host.waitForSelector('text=Tonight\'s table');
  const st2 = await host.evaluate(() => Object.values(__ur.room.players).map((p) => [p.name, p.score]));
  console.log('emoji scores', JSON.stringify(st2));
  if (!st2.find(([n, s]) => n === 'Ben' && s === 1500)) errors.push('Ben should have 1500 after 5 firsts: ' + JSON.stringify(st2));
  if (!st2.find(([n, s]) => n === 'Cara' && s === 1000)) errors.push('Cara should have 1000 after 5 seconds: ' + JSON.stringify(st2));

  // ---------- Sheets, leave, close ----------
  await host.click('[data-act="toLobby"]');
  await host.click('[data-act="qr"]');
  await host.waitForSelector('.qr-frame svg');
  await host.screenshot({ path: SHOTS + '/17-host-qr.png' });
  await host.click('[data-act="closeSheet"]');
  await c.click('[data-act="menu"]');
  await c.waitForSelector('.sheet');
  await c.screenshot({ path: SHOTS + '/17b-player-menu.png' });
  await c.click('.sheet [data-act="leave"]');
  await host.waitForFunction(() => Object.keys(__ur.room.players || {}).length === 1);
  await host.click('[data-act="closeRoom"]');
  await host.click('[data-act="closeRoom"]');
  await b.waitForSelector('text=This room has closed');
  await b.screenshot({ path: SHOTS + '/18-player-closed.png' });

  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'E2E OK');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
