// Heads Up: Ben (Kannada, Team Ruby) and Cara (English, Team Sapphire) plus a bot.
// The guesser marks Got it / Pass; the others see the word in their own language; team points add up.
// Usage: node tests/e2e-headsup.cjs <base-url> <screenshot-dir>
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.argv[2] || 'http://127.0.0.1:8765/upper-room/';
const SHOTS = process.argv[3] || '/tmp/ur-shots';

(async () => {
  const T = await import(path.resolve(__dirname, '../js/text.js'));
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
  await host.click('[data-act="addBot"]');
  await host.waitForFunction(() => Object.keys(__ur.room.players).length === 3);
  await host.click('[data-act="pick"][data-g="hu"]');
  // Ben on Ruby, Cara and the bot on Sapphire
  const teams = await host.evaluate(() => Object.fromEntries(Object.values(__ur.room.players).map((p) => [p.name, p.team])));
  console.log('teams', JSON.stringify(teams));
  await host.screenshot({ path: `${SHOTS}/hu-00-lobby.png` });
  await host.click('[data-act="set"][data-k="rounds"][data-v="4"]');
  await host.click('[data-act="set"][data-k="secs"][data-v="45"]');
  await host.click('[data-act="start"]');
  const pages = { Ben: ben, Cara: cara };
  const ov = (p) => p.evaluate(() => { const v = document.getElementById('view'); return v.scrollHeight - v.clientHeight; });
  let expect = { ruby: 0, sapphire: 0 };
  for (let i = 0; i < 2; i++) {
    await ben.waitForFunction((i) => __ur.room.round && __ur.room.round.phase === 'play' && __ur.room.round.i === i, i, { timeout: 30000 });
    const rd = await host.evaluate(() => __ur.room.round);
    const gName = await host.evaluate((u) => __ur.room.players[u].name, rd.data.guesser);
    const team = rd.data.team;
    console.log('turn', i, 'guesser', gName, team);
    const gp = pages[gName], other = gp === ben ? cara : ben;
    if (!gp) { errors.push('expected a human guesser on turn ' + i); continue; }
    await gp.waitForSelector('[data-act="huGot"]');
    const w0 = await other.textContent('.hu-word');
    const want = (other === ben ? G.huWord(rd.data.cards[0], T.content('kn')) : G.huWord(rd.data.cards[0], T.content('en')));
    if (w0.trim() !== want) errors.push(`word shown ${w0} != ${want}`);
    await gp.click('[data-act="huGot"]'); await gp.click('[data-act="huGot"]'); await gp.click('[data-act="huPass"]'); await gp.click('[data-act="huGot"]');
    await other.waitForFunction(() => document.body.textContent.includes('3'));
    if (i === 0) { await gp.screenshot({ path: `${SHOTS}/hu-01-guesser.png` }); await other.screenshot({ path: `${SHOTS}/hu-02-clue.png` }); await host.screenshot({ path: `${SHOTS}/hu-03-host.png` });
      console.log('overflow guesser', await ov(gp), 'clue', await ov(other), 'host', await ov(host)); }
    await host.click('[data-act="skip"]');
    await host.waitForFunction(() => __ur.room.round.phase === 'reveal');
    expect[team] += 300;
    const tp = await host.evaluate(() => __ur.room.round.teamPts);
    if ((tp[team] || 0) !== expect[team]) errors.push('team points ' + JSON.stringify(tp) + ' expected ' + JSON.stringify(expect));
    if (i === 0) await host.screenshot({ path: `${SHOTS}/hu-04-host-reveal.png` });
  }
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'E2E HEADS UP OK');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
