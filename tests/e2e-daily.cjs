// Daily Bible Wordle: today's word, tap-to-clear, solving, stats, streak, share text, resume after reload, Kannada.
// Usage: node tests/e2e-daily.cjs <base-url> <screenshot-dir>
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.argv[2] || 'http://127.0.0.1:8765/upper-room/';
const SHOTS = process.argv[3] || '/tmp/ur-shots';

(async () => {
  const T = await import(path.resolve(__dirname, '../js/text.js'));
  const G = await import(path.resolve(__dirname, '../js/games.js'));
  const L = await import(path.resolve(__dirname, '../js/logic.js'));
  const EN = T.content('en'), KN = T.content('kn');
  const item = L.dailyItem(L.dayNumber(), EN.WORDLE.length), word = EN.WORDLE[item][0], knTiles = G.wdTiles(KN.WORDLE[item][0]);
  const browser = await chromium.launch();
  const errors = [];
  const ov = (p) => p.evaluate(() => { const v = document.getElementById('view'); return v.scrollHeight - v.clientHeight; });
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: new URL(BASE).origin });
  const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(BASE); await p.evaluate(() => localStorage.clear()); await p.goto(BASE);
  if (!(await p.textContent('[data-act="daily"]')).includes("today's word is ready")) errors.push('home card');
  await p.screenshot({ path: `${SHOTS}/dw-00-home.png` });
  await p.click('[data-act="daily"]');
  await p.waitForSelector('.wd-slot');
  console.log('word', word, 'start overflow', await ov(p));
  const wrong = word === 'QXZJV' ? 'ZZZZZ' : 'QXZJV';
  for (const c of wrong) await p.click(`[data-act="wdKey"][data-c="${c}"]`);
  await p.click('[data-act="wdSlot"][data-i="2"]'); await p.click('[data-act="wdKey"][data-c="M"]');
  await p.click('[data-act="wdEnter"]');
  await p.screenshot({ path: `${SHOTS}/dw-01-guess.png` });
  // reload: the guess is kept
  await p.reload(); await p.click('[data-act="daily"]'); await p.waitForSelector('.wd-slot');
  const kept = await p.evaluate(() => document.querySelectorAll('.wd-row')[0].textContent);
  if (kept !== wrong.slice(0, 2) + 'M' + wrong.slice(3)) errors.push('kept ' + kept);
  for (const c of word) await p.click(`[data-act="wdKey"][data-c="${c}"]`);
  await p.click('[data-act="wdEnter"]');
  await p.waitForSelector('text=Solved in 2!');
  const st = await p.evaluate(() => JSON.parse(localStorage.getItem('ur.dailyStats')));
  if (st.played !== 1 || st.streak !== 1 || st.dist[1] !== 1) errors.push('stats ' + JSON.stringify(st));
  console.log('solved overflow', await ov(p));
  await p.screenshot({ path: `${SHOTS}/dw-02-solved.png` });
  await p.click('[data-act="dailyShare"]');
  await p.waitForTimeout(300);
  const clip = await p.evaluate(() => navigator.clipboard.readText());
  if (!clip.includes('2/6') || clip.includes(word) || !clip.includes('?daily')) errors.push('share ' + clip);
  console.log(clip);
  // no more typing once solved
  const keys = await p.$$('[data-act="wdKey"]'); if (keys.length) errors.push('keyboard still shown');
  await p.click('[data-act="back"]');
  if (!(await p.textContent('[data-act="daily"]')).includes('Solved in 2 · streak 1')) errors.push('home after solve');
  // Kannada: a separate puzzle for the same word, stats counted once a day
  await p.click('[data-act="daily"]'); await p.click('[data-act="lang"][data-v="kn"]');
  await p.waitForSelector('.wd-slot');
  for (const a of knTiles) await p.click(`[data-act="wdKey"][data-c="${a}"]`);
  await p.screenshot({ path: `${SHOTS}/dw-03-kn-typed.png` });
  await p.click('[data-act="wdEnter"]');
  await p.waitForSelector('text=1 ಪ್ರಯತ್ನದಲ್ಲಿ ಬಿಡಿಸಿದಿರಿ!');
  const st2 = await p.evaluate(() => JSON.parse(localStorage.getItem('ur.dailyStats')));
  if (st2.played !== 1) errors.push('counted twice ' + JSON.stringify(st2));
  console.log('kn overflow', await ov(p));
  await p.screenshot({ path: `${SHOTS}/dw-04-kn-solved.png` });
  // big phone, light check of the open-link path
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto(BASE + '?daily'); await p.waitForSelector('[data-act="dailyShare"]');
  console.log('390 overflow', await ov(p));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'E2E DAILY OK');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
