// Exodus Escape: Ben (Kannada) and Cara (English) hold different clues, a wrong code locks a phone,
// the right code opens the lock for everyone and both score. Usage: node tests/e2e-escape.cjs <base-url> <screenshot-dir>
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.argv[2] || 'http://127.0.0.1:8765/upper-room/';
const SHOTS = process.argv[3] || '/tmp/ur-shots';

(async () => {
  const G = await import(path.resolve(__dirname, '../js/games.js'));
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errors = [];
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
  const ben = await join('ben', 'Ben', 'sapphire', 'kn'), cara = await join('cara', 'Cara', 'emerald', 'en');
  await cara.setViewportSize({ width: 375, height: 667 });
  await host.click('[data-act="pick"][data-g="ex"]');
  await host.click('[data-act="set"][data-k="rounds"][data-v="3"]');
  await host.click('[data-act="start"]');
  const ov = (p) => p.evaluate(() => { const v = document.getElementById('view'); return v.scrollHeight - v.clientHeight; });
  await ben.waitForFunction(() => __ur.room.round && __ur.room.round.phase === 'play', null, { timeout: 30000 });
  const rd = await host.evaluate(() => __ur.room.round);
  const secret = G.exCode(rd.data.facts);
  if (secret.length !== 3) errors.push('code length ' + secret.length);
  const benClues = await ben.locator('[data-k="clues"] .li').count(), caraClues = await cara.locator('[data-k="clues"] .li').count();
  if (benClues + caraClues !== 3 || !benClues || !caraClues) errors.push(`clues split ${benClues}/${caraClues}`);
  // Cara tries a wrong code
  const wrong = secret.split('').map((c) => (Number(c) + 1) % 10).join('');
  for (const c of wrong) await cara.click(`[data-act="exKey"][data-c="${c}"]`);
  await cara.click('[data-act="exTry"]');
  await cara.waitForSelector('text=Wrong code');
  if (!(await cara.locator('[data-act="exKey"][data-c="1"]').isDisabled())) errors.push('pad should lock after a wrong code');
  await cara.screenshot({ path: `${SHOTS}/ex-01-cara-wrong-se.png` });
  console.log('cara SE overflow', await ov(cara));
  await ben.waitForSelector(`text=${wrong} ✗`);
  await ben.screenshot({ path: `${SHOTS}/ex-02-ben-kn.png` });
  await host.screenshot({ path: `${SHOTS}/ex-03-host.png` });
  for (const c of secret) await ben.click(`[data-act="exKey"][data-c="${c}"]`);
  await ben.click('[data-act="exTry"]');
  await host.waitForFunction(() => __ur.room.round.phase === 'reveal', null, { timeout: 10000 });
  const pts = await host.evaluate(() => Object.fromEntries(Object.entries(__ur.room.round.res.pts).map(([u, v]) => [__ur.room.players[u].name, v])));
  console.log('points', JSON.stringify(pts));
  if (pts.Ben !== 300 || pts.Cara !== 300) errors.push('shared points ' + JSON.stringify(pts));
  await host.screenshot({ path: `${SHOTS}/ex-04-host-reveal.png` });
  await cara.screenshot({ path: `${SHOTS}/ex-05-cara-reveal.png` });
  // let the other locks time out quickly: end the game and check the summary line
  await host.click('[data-act="endGame"]');
  await host.waitForSelector('text=1 of 3 locks opened', { timeout: 15000 }).catch(() => errors.push('no lock summary on results'));
  await host.screenshot({ path: `${SHOTS}/ex-06-results.png` });
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'E2E ESCAPE OK');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
