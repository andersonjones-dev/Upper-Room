// Test-only stand-in for Firebase: shares one database between tabs of the same browser
// using localStorage + BroadcastChannel. Used when the app is opened with ?net=local.

const KEY = 'ur.localdb';
const TS = { '.sv': 'timestamp' };

function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
function write(db) { localStorage.setItem(KEY, JSON.stringify(db)); }
const parts = (p) => String(p).split('/').filter(Boolean);
function getAt(db, p) { let n = db; for (const k of parts(p)) { if (n == null || typeof n !== 'object') return null; n = n[k]; } return n === undefined ? null : n; }
function resolveTs(v) {
  if (v && typeof v === 'object') {
    if (v['.sv'] === 'timestamp') return Date.now();
    const o = Array.isArray(v) ? [] : {};
    for (const k of Object.keys(v)) o[k] = resolveTs(v[k]);
    return o;
  }
  return v;
}
function prune(n) {
  if (n && typeof n === 'object') {
    for (const k of Object.keys(n)) {
      n[k] = prune(n[k]);
      if (n[k] === null || (typeof n[k] === 'object' && !Array.isArray(n[k]) && !Object.keys(n[k]).length)) delete n[k];
    }
  }
  return n;
}
function setAt(db, p, v) {
  const ks = parts(p);
  if (!ks.length) return resolveTs(v) || {};
  let n = db;
  for (const k of ks.slice(0, -1)) { if (!n[k] || typeof n[k] !== 'object') n[k] = {}; n = n[k]; }
  const last = ks[ks.length - 1];
  if (v === null || v === undefined) delete n[last]; else n[last] = resolveTs(v);
  return db;
}

export async function createLocalNet() {
  let uid = sessionStorage.getItem('ur.localuid');
  if (!uid) { uid = 'u' + Math.random().toString(36).slice(2, 10); sessionStorage.setItem('ur.localuid', uid); }
  const chan = new BroadcastChannel('ur.localdb');
  const watchers = new Set();
  const notify = () => watchers.forEach((w) => w());
  chan.onmessage = notify;
  const commit = (db) => { write(prune(db)); notify(); chan.postMessage(1); };

  return {
    kind: 'local',
    uid,
    TS,
    now: () => Date.now(),
    isConnected: () => true,
    onConnection() { return () => {}; },
    watch(path, cb) {
      let last;
      const run = () => { const v = getAt(read(), path); const s = JSON.stringify(v); if (s !== last) { last = s; cb(v); } };
      watchers.add(run); run();
      return () => watchers.delete(run);
    },
    async get(path) { return getAt(read(), path); },
    async set(path, v) { commit(setAt(read(), path, v)); },
    async update(path, obj) { let db = read(); for (const k of Object.keys(obj)) db = setAt(db, path + '/' + k, obj[k]); commit(db); },
    async remove(path) { commit(setAt(read(), path, null)); },
    async create(path, value) { const db = read(); if (getAt(db, path) !== null) return false; commit(setAt(db, path, value)); return true; },
    presence(path, onlineVal) { this.set(path, onlineVal); return () => {}; }
  };
}
