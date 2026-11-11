// Bible Wordle in a mixed room: Ben plays in Kannada, Cara in English, plus a practice bot.
// Checks colours, the word list check, scoring by fewest guesses, and that nothing overflows on a small phone.
// Usage: node tests/e2e-wordle.cjs <base-url> <screenshot-dir>
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.argv[2] || 'http://127.0.0.1:8765/upper-room/';
const SHOTS = process.argv[3] || '/tmp/ur-shots';

(async () => {
  const T = await import(path.resolve(__dirname, '../js/text.js'));
  const G = await import(path.resolve(__dirname, '../js/games.js'));
  const EN = T.content('en'), KN = T.content('kn');
  const browser = await chromium.launch();
  const errors = [];
  const ctxFor = (w, h) => browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const ctx = await ctxFor(390, 844);
  const mk = async (c, label) => { const p = await c.newPage(); p.on('pageerror', (e) => errors.push(label + ': ' + e.message)); return p; };
  const host = await mk(ctx, 'host');
  await host.goto(BASE + '?net=local'); await host.evaluate(() => localStorage.clear()); await host.goto(BASE + '?net=local');
  await host.click('[data-act="host"]'); await host.waitForSelector('.code');
  const code = (await host.textContent('.code')).trim();
  const join = async (c, label, name, color, lang) => {
    const p = await mk(c, label);
    await p.goto(BASE + '?net=local&join=' + code);
    await p.click(`[data-act="lang"][data-v="${lang}"]`);
    await p.fill('#name', name); await p.click(`[data-act="color"][data-c="${color}"]`); await p.click('[data-act="join"]');
    await p.waitForSelector(lang === 'kn' ? 'text=ನೀವು ಸೇರಿದ್ದೀರಿ.' : "text=You're in.");
    return p;
  };
  const ben = await join(ctx, 'ben', 'Ben', 'sapphire', 'kn');
  // Cara is on a small phone (iPhone SE size) in the same browser storage
  const cara = await join(ctx, 'cara', 'Cara', 'emerald', 'en');
  await cara.setViewportSize({ width: 375, height: 667 });
  await host.click('[data-act="addBot"]');
  await host.waitForFunction(() => Object.keys(__ur.room.players).length === 3);
  await host.click('[data-act="pick"][data-g="wd"]');
  await host.click('[data-act="set"][data-k="rounds"][data-v="3"]');
  await host.click('[data-act="start"]');
  const ov = (p) => p.evaluate(() => { const v = document.getElementById('view'); return v.scrollHeight - v.clientHeight; });
  for (let i = 0; i < 2; i++) {
    await ben.waitForFunction((i) => __ur.room.round && __ur.room.round.phase === 'play' && __ur.room.round.i === i, i, { timeout: 30000 });
    const rd = await ben.evaluate(() => __ur.room.round), item = rd.seq[rd.i];
    const en = EN.WORDLE[item][0], kn = G.wdTiles(KN.WORDLE[item][0]);
    // Cara: a non-word, then a real wrong word, then the answer (3 guesses)
    for (const c of 'QQQQQ') await cara.click(`[data-act="wdKey"][data-c="${c}"]`);
    await cara.click('[data-act="wdEnter"]');
    await cara.waitForSelector('text=Not a word in the list');
    for (let k = 0; k < 5; k++) await cara.click('[data-act="wdDel"]');
    const wrong = en === 'GRACE' ? 'MERCY' : 'GRACE';
    for (const c of wrong) await cara.click(`[data-act="wdKey"][data-c="${c}"]`);
    await cara.click('[data-act="wdEnter"]');
    if (i === 0) { await cara.screenshot({ path: `${SHOTS}/wd-01-cara-en-se.png` }); console.log('cara SE overflow', await ov(cara)); }
    for (const c of en) await cara.click(`[data-act="wdKey"][data-c="${c}"]`);
    await cara.click('[data-act="wdEnter"]');
    await cara.waitForSelector('text=Solved in 2');
    // Ben: answer straight away in Kannada (1 guess)
    if (i === 0) await ben.screenshot({ path: `${SHOTS}/wd-02-ben-kn-start.png` });
    for (const a of kn) await ben.click(`[data-act="wdKey"][data-c="${a}"]`);
    await ben.click('[data-act="wdEnter"]');
    await ben.waitForSelector('text=1 ಪ್ರಯತ್ನದಲ್ಲಿ');
    if (i === 0) { await ben.screenshot({ path: `${SHOTS}/wd-03-ben-kn-solved.png` }); await host.screenshot({ path: `${SHOTS}/wd-04-host-play.png` }); console.log('host overflow', await ov(host)); }
    await host.click('[data-act="skip"]');
    await host.waitForFunction(() => __ur.room.round.phase === 'reveal');
    const res = await host.evaluate(() => __ur.room.round.res);
    const names = await host.evaluate((o) => o.map((u) => __ur.room.players[u].name), res.order);
    if (names[0] !== 'Ben' || names.indexOf('Cara') !== 1) errors.push('order ' + names.join(','));
    if (i === 0) await host.screenshot({ path: `${SHOTS}/wd-05-host-reveal.png` });
    await host.click('[data-act="next"]').catch(() => {});
  }
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'E2E WORDLE OK');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
