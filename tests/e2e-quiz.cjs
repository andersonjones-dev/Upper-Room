// Quiz book + difficulty: the host picks Ruth and Hard. Every round must come from Ruth, Verse Scramble
// shows two stray pieces, Hangman has four lives, the timer is shorter, and nothing repeats between games.
// Usage: node tests/e2e-quiz.cjs <base-url> <screenshot-dir>
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.argv[2] || 'http://127.0.0.1:8765/upper-room/';
const SHOTS = process.argv[3] || '/tmp/ur-shots';

(async () => {
  const C = await import(path.resolve(__dirname, '../js/content.js'));
  const P = await import(path.resolve(__dirname, '../js/pool.js'));
  const G = await import(path.resolve(__dirname, '../js/games.js'));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  const mk = async (label) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(label + ': ' + e.message)); return p; };
  const host = await mk('host');
  await host.goto(BASE + '?net=local'); await host.evaluate(() => localStorage.clear()); await host.goto(BASE + '?net=local');
  await host.click('[data-act="host"]'); await host.waitForSelector('.code');
  const code = (await host.textContent('.code')).trim();
  const ben = await mk('ben');
  await ben.goto(BASE + '?net=local&join=' + code);
  await ben.fill('#name', 'Ben'); await ben.click('[data-act="color"][data-c="sapphire"]'); await ben.click('[data-act="join"]');
  await ben.waitForSelector("text=You're in.");
  await host.click('[data-act="quizBook"][data-v="Ruth"]');
  await host.click('[data-act="level"][data-v="h"]');
  await host.waitForFunction(() => __ur.room.meta.book === 'Ruth' && __ur.room.meta.level === 'h');
  await host.locator('[data-k="quiz"]').scrollIntoViewIfNeeded();
  await host.screenshot({ path: `${SHOTS}/quiz-01-lobby.png` });
  const ov = (p) => p.evaluate(() => { const v = document.getElementById('view'); return v.scrollHeight - v.clientHeight; });

  const playGame = async (g, rounds) => {
    await host.click(`[data-act="pick"][data-g="${g}"]`);
    await host.click(`[data-act="set"][data-k="rounds"][data-v="${rounds}"]`);
    await host.click('[data-act="start"]');
    await ben.waitForFunction(() => __ur.room.round && __ur.room.round.phase === 'play', null, { timeout: 25000 });
    const rd = await ben.evaluate(() => __ur.room.round);
    if (rd.level !== 'h' || rd.book !== 'Ruth') errors.push(g + ': round settings ' + rd.level + ' ' + rd.book);
    rd.seq.forEach((i) => { if (P.tagOf(g, i, C).book !== 'Ruth') errors.push(`${g}: item ${i} is not from Ruth`); });
    return rd;
  };
  const end = async () => { await host.click('[data-act="endGame"]'); await host.waitForSelector('text=Tonight', { timeout: 30000 }).catch(() => {}); await host.click('[data-act="toLobby"]'); };

  // Verse Scramble with stray pieces
  let rd = await playGame('vs', 3);
  const vsSeq = rd.seq;
  const d = rd.data, n = C.VERSES[rd.seq[0]].parts.length;
  if (d.order.length !== n + G.DECOYS) errors.push('vs: expected stray pieces');
  if (rd.secs !== G.secsFor(45, 'h')) errors.push('vs: timer not shortened ' + rd.secs);
  await ben.waitForSelector("text=Two of them don’t belong");
  await ben.screenshot({ path: `${SHOTS}/quiz-02-vs-hard.png` });
  for (let pi = 0; pi < n; pi++) await ben.click(`[data-act="piece"][data-p="${pi}"]`);
  await ben.waitForSelector('text=Locked in ·');
  console.log('vs play overflow', await ov(ben));
  await end();
  // Again: no repeats
  rd = await playGame('vs', 3);
  if (rd.seq.some((i) => vsSeq.includes(i))) errors.push('vs: repeated an item before the pool ran out ' + vsSeq + ' / ' + rd.seq);
  await end();
  // Hangman: four lives
  rd = await playGame('hg', 3);
  const lives = await ben.locator('.life').count();
  if (lives !== 4) errors.push('hg: lives ' + lives);
  await ben.screenshot({ path: `${SHOTS}/quiz-03-hg-hard.png` });
  await end();
  // Timeline from Ruth only
  rd = await playGame('tl', 5);
  rd.data.anchors.forEach((a) => { if (P.tagOf('tl', a, C).book !== 'Ruth') errors.push('tl anchor not from Ruth'); });
  await ben.screenshot({ path: `${SHOTS}/quiz-04-tl-ruth.png` });
  await end();
  for (const g of ['tr', 'em', 'tt', 'fv']) { await playGame(g, g === 'tr' ? 6 : g === 'tt' ? 4 : 5); await end(); }
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'E2E QUIZ OK');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
