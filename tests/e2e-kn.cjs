// Mixed-language room: the host and Ben use Kannada, Cara uses English, plus one practice bot.
// Ben plays every game in Kannada and should score in each. Usage: node tests/e2e-kn.cjs <base-url> <screenshot-dir>
const { chromium } = require('playwright');
const path = require('path');
const BASE = process.argv[2] || 'http://127.0.0.1:8765/upper-room/';
const SHOTS = process.argv[3] || '/tmp/ur-shots';

(async () => {
  const T = await import(path.resolve(__dirname, '../js/text.js'));
  const G = await import(path.resolve(__dirname, '../js/games.js'));
  const KN = T.content('kn');
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
  await host.click('[data-act="lang"][data-v="kn"]');
  await host.waitForSelector('text=ರೂಮ್ ಆಯೋಜಿಸಿ');
  await host.screenshot({ path: `${SHOTS}/kn-01-home.png` });
  await host.click('[data-act="host"]'); await host.waitForSelector('.code');
  const code = (await host.textContent('.code')).trim();
  const join = async (label, name, color, lang) => {
    const p = await mk(label);
    await p.goto(BASE + '?net=local&join=' + code);
    // All pages share one browser storage here, so each phone picks its language after loading.
    await p.click(`[data-act="lang"][data-v="${lang}"]`);
    await p.fill('#name', name); await p.click(`[data-act="color"][data-c="${color}"]`); await p.click('[data-act="join"]');
    await p.waitForSelector(lang === 'kn' ? 'text=ನೀವು ಸೇರಿದ್ದೀರಿ.' : "text=You're in.");
    return p;
  };
  const ben = await join('ben', 'Ben', 'sapphire', 'kn'), cara = await join('cara', 'Cara', 'emerald', 'en');
  await host.click('[data-act="addBot"]');
  await host.waitForFunction(() => Object.keys(__ur.room.players).length === 3);
  await host.screenshot({ path: `${SHOTS}/kn-02-lobby.png` });
  await ben.screenshot({ path: `${SHOTS}/kn-03-player-wait.png` });

  const round = (p) => p.evaluate(() => __ur.room.round);
  const waitPlay = (p, i) => p.waitForFunction((i) => __ur.room.round && __ur.room.round.phase === 'play' && __ur.room.round.i === i, i, { timeout: 25000 });
  const waitReveal = () => host.waitForFunction(() => __ur.room.round.phase === 'reveal', null, { timeout: 60000 });
  const scores = () => host.evaluate(() => Object.fromEntries(Object.values(__ur.room.players).map((p) => [p.name, p.score])));
  const start = async (g, rounds, secs) => {
    await host.click(`[data-act="pick"][data-g="${g}"]`);
    await host.click(`[data-act="set"][data-k="rounds"][data-v="${rounds}"]`);
    await host.click(`[data-act="set"][data-k="secs"][data-v="${secs}"]`);
    await host.click('[data-act="start"]');
  };
  const ov = (p) => p.evaluate(() => { const v = document.getElementById('view'); return v.scrollHeight - v.clientHeight; });
  const over = [];
  const ROUNDS = { vs: 3, tr: 6, fv: 5, tt: 4, tl: 5, hg: 3, bk: 3, em: 5 };
  const SECS = { vs: 30, tr: 15, fv: 30, tt: 30, tl: 30, hg: 60, bk: 60, em: 30 };

  for (const g of ['vs', 'tr', 'fv', 'tt', 'tl', 'hg', 'bk', 'em']) {
    const before = await scores();
    await start(g, ROUNDS[g], SECS[g]);
    if (g === 'vs') { await ben.waitForSelector('text=ಆರಂಭಕ್ಕೆ'); await ben.screenshot({ path: `${SHOTS}/kn-04-intro.png` }); }
    await waitPlay(ben, 0);
    const rd = await round(ben), item = rd.seq[0], d = rd.data || {};
    if (G.CHOICE.includes(g)) {
      await ben.click(`[data-act="answer"][data-i="${G.correctOption(g, item, d)}"]`);
      await cara.click(`[data-act="answer"][data-i="${(G.correctOption(g, item, d) + 1) % (g === 'tt' ? 3 : 4)}"]`);
    } else if (g === 'vs') {
      for (const pi of [...KN.VERSES[item].parts.keys()]) await ben.click(`[data-act="piece"][data-p="${pi}"]`);
      await ben.waitForSelector('text=ಖಚಿತವಾಯಿತು ·');
    } else if (g === 'hg') {
      const word = KN.HANGMAN[item][0];
      await ben.screenshot({ path: `${SHOTS}/kn-hg-player-start.png` });
      for (const c of new Set(G.hangTokens(word).flat())) await ben.click(`[data-act="letter"][data-c="${c}"]`);
      await ben.waitForSelector('text=ಬಿಡಿಸಿದರು ·');
      await cara.click('[data-act="letter"][data-c="Q"]');
    } else if (g === 'bk') {
      const target = [0, 1, 2, 3, 4, 5].sort((a, b) => d.order[a] - d.order[b]);
      for (let k = 0; k < 6; k++) {
        const arr = await ben.evaluate(() => __ur.local.arr.slice());
        if (arr[k] === target[k]) continue;
        await ben.click(`[data-bk="${k}"]`); await ben.click(`[data-bk="${arr.indexOf(target[k])}"]`);
      }
      await ben.click('[data-act="bkCheck"]'); await ben.waitForSelector('text=ಆರೂ ಕ್ರಮದಲ್ಲಿವೆ');
    } else if (g === 'em') {
      await ben.fill('#guess', KN.EMOJI[item].a); await ben.press('#guess', 'Enter');
      await ben.waitForSelector('text=ಸರಿ! ·');
    }
    await ben.screenshot({ path: `${SHOTS}/kn-${g}-player.png` });
    await cara.screenshot({ path: `${SHOTS}/kn-${g}-cara-en.png` });
    await host.screenshot({ path: `${SHOTS}/kn-${g}-host-play.png` });
    over.push(`${g} play: ben ${await ov(ben)} host ${await ov(host)}`);
    await host.click('[data-act="skip"]');
    await waitReveal();
    await host.screenshot({ path: `${SHOTS}/kn-${g}-host-reveal.png` });
    over.push(`${g} reveal: host ${await ov(host)} ben-reveal ${await ov(ben)}`);
    await ben.screenshot({ path: `${SHOTS}/kn-${g}-player-reveal.png` });
    await host.click('[data-act="endGame"]');
    await host.waitForSelector('text=ಇಂದಿನ ಮೇಜು', { timeout: 30000 });
    const after = await scores();
    console.log(g, JSON.stringify(after));
    if (!(after.Ben > 0)) errors.push(`${g}: Ben (Kannada) should have scored`);
    if (g === 'em') await host.screenshot({ path: `${SHOTS}/kn-99-results.png` });
    await host.click('[data-act="toLobby"]');
  }
  await ben.click('[data-act="menu"]'); await ben.waitForSelector('.sheet'); await ben.screenshot({ path: `${SHOTS}/kn-98-settings.png` });
  console.log('overflow px (0 = fits):\n' + over.join('\n'));
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'E2E KN OK');
  await browser.close();
  process.exit(errors.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
