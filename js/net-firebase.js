// Firebase Realtime Database + anonymous sign-in, loaded from Google's CDN only when needed.
// Every call takes a path string such as 'rooms/LAMP/players/abc'.

const SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';

export async function createFirebaseNet(config) {
  const [appMod, authMod, dbMod] = await Promise.all([
    import(SDK + 'firebase-app.js'),
    import(SDK + 'firebase-auth.js'),
    import(SDK + 'firebase-database.js')
  ]);
  const app = appMod.initializeApp(config);
  const auth = authMod.getAuth(app);
  const db = dbMod.getDatabase(app);
  const { ref, onValue, set, update, remove, get, runTransaction, serverTimestamp, onDisconnect } = dbMod;

  const user = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Sign-in timed out')), 15000);
    const off = authMod.onAuthStateChanged(auth, (u) => {
      if (u) { clearTimeout(timer); off(); resolve(u); }
    }, (e) => { clearTimeout(timer); reject(e); });
    authMod.signInAnonymously(auth).catch((e) => { clearTimeout(timer); reject(e); });
  });

  let offset = 0;
  onValue(ref(db, '.info/serverTimeOffset'), (s) => { offset = Number(s.val()) || 0; });
  let connected = true;
  const connWatchers = new Set();
  onValue(ref(db, '.info/connected'), (s) => {
    connected = !!s.val();
    connWatchers.forEach((fn) => fn(connected));
  });

  return {
    kind: 'firebase',
    uid: user.uid,
    TS: serverTimestamp(),
    now: () => Date.now() + offset,
    isConnected: () => connected,
    onConnection(fn) { connWatchers.add(fn); return () => connWatchers.delete(fn); },
    watch(path, cb, onErr) {
      return onValue(ref(db, path), (s) => cb(s.val()), (e) => onErr && onErr(e));
    },
    async get(path) { return (await get(ref(db, path))).val(); },
    set: (path, v) => set(ref(db, path), v),
    update: (path, obj) => update(ref(db, path), obj),
    remove: (path) => remove(ref(db, path)),
    async create(path, value) {
      const r = await runTransaction(ref(db, path), (cur) => (cur === null ? value : undefined), { applyLocally: false });
      return r.committed;
    },
    /** Keeps `path` set to onlineVal while connected; the server writes offlineVal if this phone drops. */
    presence(path, onlineVal, offlineVal) {
      const r = ref(db, path);
      const off = onValue(ref(db, '.info/connected'), (s) => {
        if (!s.val()) return;
        onDisconnect(r).set(offlineVal).then(() => set(r, onlineVal)).catch(() => {});
      });
      return () => { off(); onDisconnect(r).cancel().catch(() => {}); };
    }
  };
}
