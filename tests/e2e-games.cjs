// End-to-end run of the five 1.2 games: host + Ben (always right) + Cara (always wrong at first).
// Usage: node tests/e2e-games.cjs <base-url> <screenshot-dir>
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.argv[2] || 'http://127.0.0.1:8765/upper-room/';
const SHOTS = process.argv[3] || '/tmp/ur-shots';

(async () => {
  const C = await import(path.resolve(__dirname, '../js/content.js'));
  const G = await import(path.resolve(__dirname, '../js/games.js'));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
  const mk = async (label) => {
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errors.push(label + ': ' + e.message));
    p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(label + ' console: ' + m.text()); });
    return p;
  };
  const host = await mk('host');
  await host.goto(BASE + '?net=local'); await host.evaluate(() => localStorage.clear()); await host.goto(BASE + '?net=local');
  await host.click('[data-act="host"]'); await host.waitForSelector('.code');
  const code = (await host.textContent('.code')).trim();
  const join = async (label, name, color) => {
    const p = await mk(label);
    await p.goto(BASE + '?net=local&join=' + code);
    await p.fill('#name', name); await p.click(`[data-act="color"][data-c="${color}"]`); await p.click('[data-act="join"]');
    await p.waitForSelector("text=You're in.");
    return p;
  };
  const ben = await join('ben', 'Ben', 'sapphire'), cara = await join('cara', 'Cara', 'emerald');
  const round = (p) => p.evaluate(() => __ur.room.round);
  const waitPlay = async (p, i) => p.waitForFunction((i) => __ur.room.round && __ur.room.round.phase === 'play' && __ur.room.round.i === i, i, { timeout: 15000 });
  const waitReveal = () => host.waitForFunction(() => __ur.room.round.phase === 'reveal', null, { timeout: 45000 });
  const scores = () => host.evaluate(() => Object.fromEntries(Object.values(__ur.room.players).map((p) => [p.name, p.score])));
  const start = async (g, rounds, secs) => {
    await host.click(`[data-act="pick"][data-g="${g}"]`);
    await host.click(`[data-act="set"][data-k="rounds"][data-v="${rounds}"]`);
    await host.click(`[data-act="set"][data-k="secs"][data-v="${secs}"]`);
    await host.click('[data-act="start"]');
  };
  let lastRound = null;
  const finish = async (g) => { await host.waitForSelector("text=Tonight's table", { timeout: 30000 }); const s = await scores(); lastRound = await round(host); console.log(g, JSON.stringify(s)); if (g === 'fv' || g === 'tt') await host.screenshot({ path: `${SHOTS}/${g}-host-results.png` }); await host.click('[data-act="toLobby"]'); return s; };
  const expect = (cond, msg) => { if (!cond) errors.push(msg); };

  // ---------- choice games: fv, tt, tl ----------
  for (const [g, rounds, secs] of [['fv', 5, 30], ['tt', 4, 30], ['tl', 5, 30]]) {
    if (g === 'fv') { const t = await host.evaluate(() => Object.values(__ur.room.players).map((p) => p.team)); if (t[0] === t[1]) await cara.click('[data-act="switchTeam"]'); }
    await start(g, rounds, secs);
    for (let i = 0; i < rounds; i++) {
      await waitPlay(ben, i);
      const rd = await round(ben), item = rd.seq[rd.i];
      const right = G.correctOption(g, item, rd.data), n = g === 'tl' ? 5 : g === 'tt' ? 3 : 4;
      if (g === 'tt') {
        // Cara votes for the lie, then changes her mind after everyone has voted (inside the 3 s grace).
        await cara.click(`[data-act="answer"][data-i="${right}"]`);
        await ben.click(`[data-act="answer"][data-i="${right}"]`);
        await cara.waitForTimeout(1000);
        await cara.click(`[data-act="answer"][data-i="${(right + 1) % n}"]`, { timeout: 2000 });
        if (i === 0) await ben.screenshot({ path: `${SHOTS}/${g}-player-play.png` });
      } else {
        await ben.click(`[data-act="answer"][data-i="${right}"]`);
        if (i === 0) await ben.screenshot({ path: `${SHOTS}/${g}-player-play.png` });
        await cara.click(`[data-act="answer"][data-i="${(right + 1) % n}"]`, { timeout: 2000 });
      }
      await waitReveal();
      if (i === 0) { await host.screenshot({ path: `${SHOTS}/${g}-host-reveal.png` }); await cara.screenshot({ path: `${SHOTS}/${g}-player-wrong.png` }); }
      await host.click('[data-act="nextNow"]');
    }
    const s = await finish(g);
    const want = g === 'tt' ? 200 * rounds : 200 * rounds;
    expect(s.Ben === want && s.Cara === 0, `${g}: expected Ben ${want}, Cara 0; got ${JSON.stringify(s)}`);
    if (g === 'fv') { const tp = lastRound.teamPts; expect(tp && (tp.ruby + tp.sapphire) === want, 'fv team points ' + JSON.stringify(tp)); }
  }

  // ---------- Bible Hangman ----------
  await start('hg', 3, 60);
  for (let i = 0; i < 3; i++) {
    await waitPlay(ben, i);
    const rd = await round(ben), word = C.HANGMAN[rd.seq[rd.i]][0];
    const wrongs = 'QXZJVKWYFBPGMHUCDLNSTROIEA'.split('').filter((c) => !word.includes(c)).slice(0, 6);
    for (const c of wrongs) await cara.click(`[data-act="letter"][data-c="${c}"]`);
    await cara.waitForSelector('text=Out of lives');
    for (const c of [...new Set(word.replace(/ /g, '').split(''))]) await ben.click(`[data-act="letter"][data-c="${c}"]`);
    await ben.waitForSelector('text=Solved ·');
    if (i === 0) { await cara.screenshot({ path: `${SHOTS}/hg-player-out.png` }); }
    await waitReveal();
    if (i === 0) await host.screenshot({ path: `${SHOTS}/hg-host-reveal.png` });
    await host.click('[data-act="nextNow"]');
  }
  const sh = await finish('hg');
  expect(sh.Ben === 900 && sh.Cara === 0, 'hg scores ' + JSON.stringify(sh));

  // ---------- Books Sort (tap-swap for Ben, a real drag for Cara, wrong check first) ----------
  await start('bk', 3, 60);
  for (let i = 0; i < 3; i++) {
    await waitPlay(ben, i);
    const rd = await round(ben), d = rd.data;
    const target = [0, 1, 2, 3, 4, 5].sort((a, b) => d.order[a] - d.order[b]);
    const solveByTaps = async (p) => {
      for (let k = 0; k < 6; k++) {
        const arr = await p.evaluate(() => __ur.local.arr.slice());
        if (arr[k] === target[k]) continue;
        const j = arr.indexOf(target[k]);
        await p.click(`[data-bk="${k}"]`); await p.click(`[data-bk="${j}"]`);
      }
    };
    // Cara: check while wrong (penalty), then drag the first row to the bottom, then finish with taps
    await cara.click('[data-act="bkCheck"]');
    await cara.waitForSelector('text=of 6 in place');
    const before = await cara.evaluate(() => __ur.local.arr.slice());
    const r0 = await cara.locator('[data-bk="0"]').boundingBox(), r5 = await cara.locator('[data-bk="5"]').boundingBox();
    await cara.mouse.move(r0.x + 40, r0.y + r0.height / 2); await cara.mouse.down();
    for (let y = r0.y + r0.height / 2; y <= r5.y + r5.height / 2; y += 12) await cara.mouse.move(r0.x + 40, y);
    await cara.mouse.up();
    const after = await cara.evaluate(() => __ur.local.arr.slice());
    expect(JSON.stringify(after) === JSON.stringify([...before.slice(1), before[0]]), `drag should move row 0 to the end: ${before} -> ${after}`);
    if (i === 0) await cara.screenshot({ path: `${SHOTS}/bk-player-after-drag.png` });
    await solveByTaps(ben); await ben.click('[data-act="bkCheck"]'); await ben.waitForSelector('text=All six in order');
    if (i === 0) await ben.screenshot({ path: `${SHOTS}/bk-player-done.png` });
    await solveByTaps(cara); await cara.click('[data-act="bkCheck"]');
    await waitReveal();
    if (i === 0) await host.screenshot({ path: `${SHOTS}/bk-host-reveal.png` });
    await host.click('[data-act="nextNow"]');
  }
  const sb = await finish('bk');
  expect(sb.Ben === 900 && sb.Cara === 600, 'bk scores ' + JSON.stringify(sb));

  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'E2E GAMES OK');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
