// Tournament night: build the list in the lobby, play two games, places turn into tournament points
// (ties share), the champion screen on the table and on an English and a Kannada phone.
// Usage: node tests/e2e-tour.cjs <base-url> <screenshot-dir>
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://127.0.0.1:8765/upper-room/';
const SHOTS = process.argv[3] || '/tmp/ur-shots';
(async () => {
  const browser = await chromium.launch(), errors = [];
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mk = async (label) => { const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(label + ': ' + e.message)); return p; };
  const host = await mk('host');
  await host.goto(BASE + '?net=local'); await host.evaluate(() => localStorage.clear()); await host.goto(BASE + '?net=local');
  await host.click('[data-act="host"]'); await host.waitForSelector('.code');
  const code = (await host.textContent('.code')).trim();
  const join = async (label, name, color, lang) => {
    const p = await mk(label);
    await p.goto(BASE + '?net=local&join=' + code);
    await p.click(`[data-act="lang"][data-v="${lang}"]`);
    await p.fill('#name', name); await p.click(`[data-act="color"][data-c="${color}"]`); await p.click('[data-act="join"]');
    await p.waitForSelector(lang === 'kn' ? 'text=ನೀವು ಸೇರಿದ್ದೀರಿ.' : "text=You're in.");
    return p;
  };
  const ben = await join('ben', 'Ben', 'sapphire', 'kn');
  const cara = await join('cara', 'Cara', 'emerald', 'en');
  await host.click('[data-act="addBot"]');
  await host.waitForFunction(() => Object.keys(__ur.room.players).length === 3);
  const uids = await host.evaluate(() => Object.fromEntries(Object.entries(__ur.room.players).map(([u, p]) => [p.name, u])));
  const bot = Object.keys(uids).find((n) => n !== 'Ben' && n !== 'Cara');
  // lobby: turn on, add games, remove one
  await host.click('[data-act="tourOn"]');
  await host.click('[data-act="pick"][data-g="tr"]'); await host.click('[data-act="pick"][data-g="em"]');
  await host.click('[data-act="tourDel"][data-g="em"]');
  await host.waitForFunction(() => JSON.stringify(Object.values(__ur.room.meta.tour.games)) === '["vs","tr"]');
  const startTxt = (await host.textContent('[data-act="start"]')).trim();
  if (startTxt !== 'Start tournament · 2 games') errors.push('start ' + startTxt);
  await host.locator('[data-k="tour"]').scrollIntoViewIfNeeded();
  await host.screenshot({ path: `${SHOTS}/tour-01-lobby.png` });
  await cara.waitForSelector('text=Tournament night'); await cara.screenshot({ path: `${SHOTS}/tour-02-cara-wait.png` });
  await host.click('[data-act="start"]');
  const play = async (g, scores, k) => {
    await host.waitForFunction((g) => __ur.room.meta.status === 'playing' && __ur.room.round && __ur.room.round.game === g, g);
    if (k === 0) { await ben.waitForSelector('text=2ರಲ್ಲಿ 1ನೇ ಆಟ'); }
    const upd = {}; for (const [n, v] of Object.entries(scores)) upd[`players/${uids[n]}/score`] = v;
    await host.evaluate(([c, upd]) => __ur.net.update('rooms/' + c, upd), [code, upd]);
    await host.click('[data-act="endGame"]');
    await host.waitForFunction(() => __ur.room.meta.status === 'results');
    return host.evaluate((k) => __ur.room.meta.tour.hist[k], k);
  };
  const h0 = await play('vs', { Ben: 500, Cara: 300, [bot]: 0 }, 0);
  if (h0[uids.Ben] !== 10 || h0[uids.Cara] !== 8 || h0[uids[bot]] !== 0) errors.push('game 1 ' + JSON.stringify(h0));
  await host.screenshot({ path: `${SHOTS}/tour-03-host-results.png` });
  await cara.waitForSelector('text=Tournament'); await cara.screenshot({ path: `${SHOTS}/tour-04-cara-results.png` });
  const nextTxt = (await host.textContent('[data-act="tourNext"]')).trim();
  if (nextTxt !== 'Next: Twelve Tribes') errors.push('next ' + nextTxt);
  await host.click('[data-act="tourNext"]');
  const h1 = await play('tr', { Ben: 100, Cara: 200, [bot]: 200 }, 1);
  if (h1[uids.Cara] !== 10 || h1[uids[bot]] !== 10 || h1[uids.Ben] !== 6) errors.push('game 2 ' + JSON.stringify(h1));
  // ending the game again must not add the points twice
  const again = await host.evaluate(() => JSON.stringify(__ur.room.meta.tour.hist));
  if (await host.$('[data-act="tourNext"]')) errors.push('next shown on last game');
  await host.click('[data-act="tourEnd"] >> nth=1');
  await host.waitForFunction(() => __ur.room.meta.status === 'final');
  const head = await host.textContent('[data-k="h"]');
  if (!head.includes('Cara wins the night!')) errors.push('champion ' + head);
  const tot = await host.evaluate(() => [...document.querySelectorAll('.tour-row:not(.tour-head)')].map((r) => r.querySelector('.li-name').textContent + ':' + r.querySelector('.tt').textContent).join(','));
  if (tot !== `Cara:18,Ben:16,${bot}:10`) errors.push('totals ' + tot);
  if (again !== await host.evaluate(() => JSON.stringify(__ur.room.meta.tour.hist))) errors.push('hist changed');
  const ov = (p) => p.evaluate(() => { const v = document.getElementById('view'); return v.scrollHeight - v.clientHeight; });
  console.log('final overflow host', await ov(host));
  await host.screenshot({ path: `${SHOTS}/tour-05-host-final.png` });
  await ben.waitForSelector('text=ಪಂದ್ಯಾವಳಿಯಲ್ಲಿ ನಿಮ್ಮ ಸ್ಥಾನ'); console.log('final overflow ben', await ov(ben));
  await ben.screenshot({ path: `${SHOTS}/tour-06-ben-final-kn.png` });
  await host.click('[data-act="tourDone"]');
  await host.waitForFunction(() => __ur.room.meta.status === 'lobby' && !__ur.room.meta.tour.hist && __ur.room.meta.tour.on);
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'E2E TOUR OK');
  await browser.close(); process.exit(errors.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
