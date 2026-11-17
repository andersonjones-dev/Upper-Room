// Old-room cleanup: when a phone hosts again, it deletes its own rooms unused for a day, and nothing else.
// Usage: node tests/e2e-cleanup.cjs <base-url>
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://127.0.0.1:8765/upper-room/';
(async () => {
  const browser = await chromium.launch(), errors = [];
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(BASE + '?net=local'); await p.evaluate(() => localStorage.clear()); await p.goto(BASE + '?net=local');
  await p.click('[data-act="host"]'); await p.waitForSelector('.code');
  const first = (await p.textContent('.code')).trim();
  const uid = await p.evaluate(() => __ur.net.uid);
  // pretend: my room is 2 days old, a fresh room of mine, another host's room, and a room already gone
  await p.evaluate(([first, uid]) => {
    const db = JSON.parse(localStorage.getItem('ur.localdb'));
    db.rooms.FRSH = { meta: { host: uid, status: 'lobby' } };
    db.rooms.THEM = { meta: { host: 'someoneelse', status: 'lobby' } };
    localStorage.setItem('ur.localdb', JSON.stringify(db));
    const old = Date.now() - 2 * 24 * 3600 * 1000;
    localStorage.setItem('ur.myRooms', JSON.stringify({ [first]: old, FRSH: Date.now() - 3600 * 1000, THEM: old, GONE: old }));
  }, [first, uid]);
  // close nothing: just leave locally and host again
  await p.evaluate(() => { localStorage.setItem('ur.session', 'null'); });
  await p.goto(BASE + '?net=local'); await p.click('[data-act="host"]'); await p.waitForSelector('.code');
  await p.waitForTimeout(500);
  const second = (await p.textContent('.code')).trim();
  const rooms = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('ur.localdb')).rooms).sort());
  const mine = await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('ur.myRooms'))).sort());
  console.log('rooms', rooms.join(','), '| remembered', mine.join(','));
  if (rooms.includes(first)) errors.push('old room not deleted');
  if (!rooms.includes('FRSH') || !rooms.includes('THEM') || !rooms.includes(second)) errors.push('deleted too much');
  if (mine.join() !== ['FRSH', second].sort().join()) errors.push('list ' + mine);
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'E2E CLEANUP OK');
  await browser.close(); process.exit(errors.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
