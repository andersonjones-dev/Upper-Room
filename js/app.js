import { APP_VERSION, firebaseConfig, DEFAULT_THEME } from './config.js';
import { VERSES, TRIVIA, EMOJI, TRIBES, BOOKS, HANGMAN, TWO_TRUTHS, TIMELINE } from './content.js';
import * as G from './games.js';
import * as L from './logic.js';
import { qrSvg } from './qr.js';

/* =================== State =================== */
const load = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } };
const params = new URLSearchParams(location.search);
if (params.get('net') === 'local') { try { sessionStorage.setItem('ur.net', 'local'); } catch {} }
const useLocalNet = (() => { try { return sessionStorage.getItem('ur.net') === 'local'; } catch { return false; } })();

const S = {
  net: null, netBusy: false, netErr: '',
  view: 'home', role: null, code: null, room: undefined, unwatch: null, unpresence: null,
  profile: load('ur.profile', { name: '', color: 'amethyst' }),
  prefs: load('ur.prefs', { theme: DEFAULT_THEME, mode: 'auto' }),
  drafts: { code: '', name: '', guess: '' },
  sheet: null, joinErr: '', busy: false, toast: '', toastTimer: 0,
  offline: false, confirmClose: 0, local: null, hostBusy: false,
  waitingSW: null, updateReady: false, updating: false, ttWait: {}
};
S.drafts.name = S.profile.name || '';
if (params.get('join')) { S.view = 'join'; S.drafts.code = L.cleanCode(params.get('join')); }
if (!['noir', 'cyber', 'glass'].includes(S.prefs.theme)) S.prefs.theme = DEFAULT_THEME;

const $view = document.getElementById('view');
const $overlay = document.getElementById('overlay');
const $bar = document.getElementById('bar');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const vibrate = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch {} };

/* =================== Theme =================== */
const mq = window.matchMedia('(prefers-color-scheme: dark)');
const BG = { noir: ['#FFFFFF', '#000000'], cyber: ['#EEEDE8', '#0A0A0F'], glass: ['#F4EFE6', '#1B1530'] };
const FONTS = {
  noir: 'family=Bodoni+Moda:ital,wght@0,400;0,700;1,400&family=Josefin+Sans:wght@400;600;700',
  cyber: 'family=Chakra+Petch:wght@400;600;700',
  glass: 'family=Cinzel:wght@400;700&family=Crimson+Pro:wght@400;600;700'
};
let lastThemeKey = '', lastThemeColor = '';
function activeTheme() {
  const rt = S.room && S.room.meta && S.room.meta.theme;
  return ['noir', 'cyber', 'glass'].includes(rt) ? rt : S.prefs.theme;
}
function applyTheme() {
  const theme = activeTheme();
  const dark = S.prefs.mode === 'dark' || (S.prefs.mode === 'auto' && mq.matches);
  const key = theme + (dark ? ' dark' : '');
  if (key === lastThemeKey) return;
  lastThemeKey = key;
  document.documentElement.className = key;
  if (!document.getElementById('font-' + theme)) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.id = 'font-' + theme;
    l.href = 'https://fonts.googleapis.com/css2?' + FONTS[theme] + '&display=swap';
    document.head.appendChild(l);
  }
  const color = BG[theme][dark ? 1 : 0];
  if (color !== lastThemeColor) {
    lastThemeColor = color;
    document.querySelector('meta[name="theme-color"]').setAttribute('content', color);
  }
}
mq.addEventListener('change', () => { applyTheme(); });

/* =================== Small HTML helpers =================== */
const ICONS = {
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  share: '<path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5"/>',
  qr: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><path d="M14 14h2v2h-2zM18 18h2v2h-2z"/>'
};
const icon = (name) => `<span class="pane"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg></span>`;
const iconBtn = (act, name, label, extra = '') => `<button class="iconbtn" data-act="${act}" aria-label="${label}" ${extra}>${icon(name)}</button>`;
const initial = (name) => esc((String(name || '?').trim()[0] || '?').toUpperCase());
const avatar = (p, size = '') => `<div class="av ${size} jf c-${esc(p.color || 'amethyst')}" aria-hidden="true">${initial(p.name)}</div>`;
const markers = (i) => `<span class="mk mk-roman">${L.roman(i + 1)}</span><span class="mk mk-slash" aria-hidden="true">//</span><span class="mk mk-gem" aria-hidden="true"></span>`;
const note = (ok, title, body) => `<div class="note jf ${ok ? 'c-ok' : 'c-bad'}" role="status"><span class="note-t">${title}</span>${body ? `<span class="note-b">${body}</span>` : ''}</div>`;
const clockNow = (endsAt) => L.fmtClock(L.secondsLeft(endsAt, S.net ? S.net.now() : Date.now()));
const timer = (endsAt, cls = 'timer') => `<div class="${cls}" data-ends="${endsAt}" aria-label="Time left">${clockNow(endsAt)}</div>`;
const head = (title, det, endsAt, cls) => `<div class="row between"><div class="col"><h1 class="title">${title}</h1><span class="det small muted">${det}</span></div>${endsAt ? timer(endsAt, cls) : ''}</div>`;
const players = () => (S.room && S.room.players) || {};
const playerList = () => Object.entries(players()).filter(([, p]) => p && p.name).map(([uid, p]) => ({ uid, ...p }))
  .sort((a, b) => (a.joined || 0) - (b.joined || 0));
const activeUids = () => playerList().filter((p) => p.online !== false).map((p) => p.uid);
const pName = (uid) => (players()[uid] && players()[uid].name) || 'Someone';
const settingsFor = (g) => ({ ...(L.SETTINGS[g] ? L.SETTINGS[g].def : {}), ...(((S.room || {}).meta || {}).settings || {})[g] });

/* =================== Rendering =================== */
function sectionsFor() {
  if (S.view === 'join') return viewJoin();
  if (S.view === 'room') return viewRoom();
  return viewHome();
}
function paint() {
  if (S.dragging) return;
  applyTheme();
  const { cls, secs } = sectionsFor();
  $view.className = 'scr' + (cls ? ' ' + cls : '');
  const keys = secs.map((s) => s[0]).join('|');
  if ($view.dataset.keys !== keys) {
    const firstChanged = ($view.dataset.keys || '').split('|')[0] !== secs[0][0];
    $view.dataset.keys = keys;
    $view.innerHTML = secs.map(([k, h]) => `<div class="sec" data-k="${k}">${h}</div>`).join('');
    [...$view.children].forEach((c, i) => { c._h = secs[i][1]; });
    if (firstChanged) $view.scrollTop = 0;
  } else {
    secs.forEach(([, h], i) => { const c = $view.children[i]; if (c._h !== h) { c.innerHTML = h; c._h = h; } });
  }
  $view.querySelectorAll('[data-draft]').forEach((el) => {
    const v = S.drafts[el.dataset.draft] || '';
    if (el.dataset.draft === 'guess' && S.clearGuess) { el.value = ''; S.clearGuess = false; }
    else if (el !== document.activeElement && el.value !== v) el.value = v;
  });
  paintChrome();
  tickTimers();
}
function paintChrome() {
  // Update bar
  const barHtml = S.updateReady
    ? `<div class="update" role="status"><span>A new version is ready</span><button class="btn btn-p btn-sm" data-act="update">${S.updating ? 'Updating…' : 'Update'}</button></div>`
    : (S.toast ? `<div class="update toast" role="status"><span>${esc(S.toast)}</span></div>` : '');
  if ($bar._h !== barHtml) { $bar.innerHTML = barHtml; $bar._h = barHtml; }
  // Sheets
  const sh = S.sheet === 'menu' ? sheetMenu() : S.sheet === 'qr' ? sheetQr() : '';
  if ($overlay._h !== sh) {
    const opening = !$overlay._h && sh;
    $overlay.innerHTML = sh; $overlay._h = sh;
    if (opening) { const t = $overlay.querySelector('#sheetTitle'); t && t.focus(); }
  }
}
function tickTimers() {
  const now = S.net ? S.net.now() : Date.now();
  document.querySelectorAll('[data-ends]').forEach((el) => {
    const t = L.fmtClock(L.secondsLeft(Number(el.dataset.ends), now));
    if (el.textContent !== t) el.textContent = t;
  });
}
setInterval(tickTimers, 250);
function toast(msg) {
  S.toast = msg; clearTimeout(S.toastTimer);
  S.toastTimer = setTimeout(() => { S.toast = ''; paintChrome(); }, 4000);
  paintChrome();
}

/* =================== Views: home & join =================== */
function viewHome() {
  const tiles = L.GAMES.map((g) => `<div class="tile jf c-${g.c}">${esc(g.sym)}</div>`).join('');
  return {
    cls: 'spread',
    secs: [
      ['hdr', `<div class="hdr"><span class="only-noir hdr-sp" aria-hidden="true"></span><span class="brand">Upper Room</span>${iconBtn('menu', 'menu', 'Settings')}</div>`],
      ['deco', `<div class="hazard only-cyber" aria-hidden="true"></div>
        <div class="homegrid" aria-hidden="true"><div class="win"><div class="arch only-glass"><div class="rose"></div></div><div class="grid4">${tiles}</div></div><span class="syscode only-cyber">SYS//UR-12 · ROOM</span></div>
        <div class="orn only-noir" aria-hidden="true"><span class="hair"></span><span class="gem"></span><span class="mono">UR</span><span class="gem"></span><span class="hair"></span></div>`],
      ['hero', `<div class="hero"><h1 class="h1">Gather<br>the room.</h1><p class="sub">Everyone plays on their own phone. This one becomes the table.</p></div>`],
      ['btns', `<div class="btns"><button class="btn btn-p" data-act="host" ${S.netBusy ? 'disabled' : ''}>${S.netBusy ? 'Connecting…' : 'Host a room'}</button><button class="btn btn-s" data-act="goJoin">Join with a code</button>${S.netErr ? `<p class="small muted center" role="alert">${esc(S.netErr)}</p>` : ''}</div>`],
      ['card', `<div class="card row between"><div class="col"><span class="card-title">Ready to play</span><span class="det small muted">Verse Scramble · Twelve Tribes · Emoji Bible</span></div><div class="wtiles" aria-hidden="true"><span class="wt hit"></span><span class="wt near"></span><span class="wt"></span><span class="wt hit"></span><span class="wt"></span></div></div>`]
    ]
  };
}

function viewJoin() {
  const sw = L.COLORS.map((c) => `<button class="sw jf c-${c} ${S.profile.color === c ? 'is-sel' : ''}" data-act="color" data-c="${c}" aria-label="${c[0].toUpperCase() + c.slice(1)}" aria-pressed="${S.profile.color === c}"><span class="sw-dot"></span></button>`).join('');
  return {
    cls: '',
    secs: [
      ['jhdr', `<div class="row" style="gap:8px">${iconBtn('back', 'back', 'Back')}<h1 class="title grow">Join a room</h1></div><p class="muted" style="margin:0">Type the code on the host's screen.</p>`],
      ['jcode', `<div class="col" style="gap:10px"><label class="lbl" for="code">Room code</label><input id="code" class="field code-input" data-draft="code" maxlength="4" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false" enterkeyhint="next" aria-describedby="joinErr"></div>`],
      ['jname', `<div class="col" style="gap:10px"><label class="lbl" for="name">Your name</label><input id="name" class="field" data-draft="name" maxlength="16" autocomplete="nickname" enterkeyhint="go"></div>`],
      ['jcol', `<div class="col" style="gap:10px"><span class="lbl" id="colLbl">Your colour</span><div class="row swrow" role="group" aria-labelledby="colLbl">${sw}</div></div>`],
      ['jerr', `<div id="joinErr">${S.joinErr ? note(false, esc(S.joinErr), '') : ''}</div>`],
      ['jgo', `<div class="grow"></div><button class="btn btn-p" data-act="join" ${S.busy ? 'disabled' : ''}>${S.busy ? 'Joining…' : 'Join'}</button><p class="small muted center" style="margin:0;text-align:center">No account needed. iPhone and Android, right in the browser.</p>`]
    ]
  };
}

/* =================== Views: room =================== */
function viewRoom() {
  const r = S.room;
  const conn = S.offline ? [['conn', `<div class="pill" role="status">Reconnecting to the game server…</div>`]] : [];
  if (r === undefined) return { cls: 'center-v', secs: [['load', `<div class="col" style="align-items:center;gap:12px;text-align:center"><span class="lbl">Room ${esc(S.code)}</span><h1 class="title">Connecting…</h1></div>`]] };
  if (r === null || !r.meta) {
    return { cls: 'center-v', secs: [['gone', `<div class="col" style="align-items:center;gap:14px;text-align:center"><h1 class="title">This room has closed</h1><p class="muted" style="margin:0">The host ended room ${esc(S.code)}.</p><button class="btn btn-p" data-act="home">Back to start</button></div>`]] };
  }
  const st = r.meta.status;
  let out;
  if (S.role === 'host') out = st === 'playing' ? hostPlay() : st === 'results' ? hostResults() : hostLobby();
  else {
    if (!players()[S.net.uid]) return { cls: 'center-v', secs: [['out', `<div class="col" style="align-items:center;gap:14px;text-align:center"><h1 class="title">You're not in this room</h1><button class="btn btn-p" data-act="home">Back to start</button></div>`]] };
    out = st === 'playing' ? playerPlay() : st === 'results' ? playerResults() : playerWait();
  }
  if (S.role === 'player' && r.meta.hostOnline === false) conn.push(['hostoff', `<div class="pill" role="status">The host's phone is offline. Waiting for it to come back…</div>`]);
  out.secs = conn.concat(out.secs);
  return out;
}

function hostLobby() {
  const r = S.room, meta = r.meta, list = playerList();
  const game = L.gameById(meta.game || 'vs'), set = settingsFor(game.id), opts = L.SETTINGS[game.id];
  const roster = list.length
    ? `<div class="roster">${list.map((p) => `<div class="pl">${avatar(p)}<span class="pl-n">${esc(p.name)}</span><span class="pl-s">${p.bot ? 'Bot' : p.online === false ? 'Away' : p.ready ? 'Ready' : ''}</span></div>`).join('')}</div>`
    : `<p class="small muted" style="margin:0">Waiting for players. Share the code or let them scan the QR.</p>`;
  const nBots = list.filter((p) => p.bot).length;
  const botRow = `<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn btn-s btn-sm" data-act="addBot" ${list.length >= L.MAX_PLAYERS ? 'disabled' : ''}>Add practice bot</button>${nBots ? `<button class="btn btn-s btn-sm" data-act="removeBots">Remove ${nBots === 1 ? 'bot' : 'bots'}</button>` : ''}</div>`;
  const tiles = L.GAMES.map((g) => g.ready
    ? `<button class="gtile jf c-${g.c} ${g.id === game.id ? 'is-sel' : ''}" data-act="pick" data-g="${g.id}" aria-pressed="${g.id === game.id}"><span class="gn"><span>${g.n}</span><span>${g.mode}</span></span><span class="gs">${esc(g.sym)}</span><span class="gname">${esc(g.name)}</span></button>`
    : `<button class="gtile jf c-${g.c}" disabled aria-label="${esc(g.name)}, coming soon"><span class="gn"><span>${g.n}</span><span>Soon</span></span><span class="gs">${esc(g.sym)}</span><span class="gname">${esc(g.name)}</span></button>`).join('');
  const seg = (k, vals, unit) => `<div class="seg" role="group" aria-label="${k}">${vals.map((v) => `<button class="chip ${set[k] === v ? 'on' : ''}" data-act="set" data-k="${k}" data-v="${v}" aria-pressed="${set[k] === v}">${v}${unit}</button>`).join('')}</div>`;
  const secs = [
    ['top', `<div class="card col" style="gap:14px"><div class="row between"><div class="col"><span class="lbl">Room code</span><span class="code">${esc(S.code)}</span></div><div class="row" style="gap:6px">${iconBtn('share', 'share', 'Share invite')}${iconBtn('qr', 'qr', 'Show QR code')}${iconBtn('menu', 'menu', 'Settings')}</div></div>${roster}${botRow}</div>`],
    ['glbl', `<div class="row between"><h2 class="title sm">Pick a game</h2><span class="small muted">${list.length} ${list.length === 1 ? 'player' : 'players'}</span></div>`],
    ['grid', `<div class="win"><div class="grid3">${tiles}</div></div>`],
    ['set', `<div class="card col" style="gap:12px"><span class="card-title">${esc(game.name)}</span><span class="small">${esc(game.how)}</span><span class="lbl">${game.id === 'tr' ? 'Questions' : 'Rounds'}</span>${seg('rounds', opts.rounds, '')}<span class="lbl">Seconds each</span>${seg('secs', opts.secs, 's')}</div>`]
  ];
  if (game.teams) {
    const col = (t) => {
      const ps = list.filter((p) => p.team === t);
      return `<div class="team-col jf c-${t === 'ruby' ? 'ruby' : 'sapphire'}"><span class="team-n">${L.TEAMS[t]}</span>${ps.length ? ps.map((p) => `<span class="small">${esc(p.name)}</span>`).join('') : '<span class="small">No one yet</span>'}</div>`;
    };
    secs.push(['teams', `<div class="col" style="gap:10px"><div class="row between"><span class="lbl">Teams</span><button class="btn btn-s btn-sm" data-act="shuffleTeams" ${list.length < 2 ? 'disabled' : ''}>Shuffle teams</button></div><div class="grid2">${col('ruby')}${col('sapphire')}</div><p class="small muted" style="margin:0">Players can also switch team on their own phone.</p></div>`]);
  }
  const closeLbl = Date.now() - S.confirmClose < 4000 ? 'Tap again to close the room' : 'Close room';
  secs.push(['start', `<button class="btn btn-p" data-act="start" ${list.length ? '' : 'disabled'}>${list.length ? 'Start ' + esc(game.name) : 'Waiting for players'}</button><button class="btn btn-s" data-act="closeRoom">${closeLbl}</button>`]);
  return { cls: '', secs };
}

function introSecs(rd, forPlayer) {
  const g = L.gameById(rd.game);
  let extra = '';
  if (forPlayer && g.teams) {
    const me = players()[S.net.uid] || {};
    extra = `<div class="team jf c-${me.team === 'sapphire' ? 'sapphire' : 'ruby'}"><span class="team-n">You're on</span><span class="team-s sm">${L.TEAMS[me.team] || L.TEAMS.ruby}</span></div>`;
  }
  return [
    ['h', head(esc(g.name), forPlayer ? 'Get ready' : `${rd.n} ${['tr', 'fv', 'tt'].includes(g.id) ? 'questions' : 'rounds'} · ${rd.secs}s each`)],
    ['intro', `<div class="card col" style="gap:12px;align-items:center;text-align:center"><span class="lbl">Starting in</span><span class="big" data-ends="${rd.endsAt}">${clockNow(rd.endsAt)}</span><span class="small">${esc(g.how)}</span></div>${extra}`]
  ];
}

function hostControls(rd) {
  if (rd.phase === 'play') return ['ctl', `<div class="grow"></div><div class="pair"><button class="btn btn-s" data-act="endGame">End game</button><button class="btn btn-p" data-act="skip">Reveal now</button></div>`];
  if (rd.phase === 'reveal') return ['ctl', `<div class="grow"></div><div class="row between"><span class="lbl">${rd.i + 1 < rd.n ? 'Next round in' : 'Results in'}</span><span class="tpill" data-ends="${rd.endsAt}">${clockNow(rd.endsAt)}</span></div><div class="pair"><button class="btn btn-s" data-act="endGame">End game</button><button class="btn btn-p" data-act="nextNow">${rd.i + 1 < rd.n ? 'Next now' : 'See results'}</button></div>`];
  return ['ctl', `<div class="grow"></div><button class="btn btn-s" data-act="endGame">End game</button>`];
}

const OPT_C = ['ruby', 'sapphire', 'emerald', 'amber', 'teal'];
const LETTERS = 'ABCDE';
const itemOf = (rd) => rd.seq[rd.i];
const roundWord = (rd) => (['tr', 'fv', 'tt'].includes(rd.game) ? 'Question' : 'Round');
const countIn = (ans) => Object.values(ans).filter((a) => typeof a.a === 'number').length;
const answeredRow = (ans, label = 'Answers in') => `<div class="row between"><span class="lbl">${label}</span><span class="small">${countIn(ans)} of ${activeUids().length}</span></div>`;
const teamTotals = (rd) => ({ ruby: ((rd.teamPts || {}).ruby) || 0, sapphire: ((rd.teamPts || {}).sapphire) || 0 });
const teamCards = (a, b, label) => `<div class="grid2"><div class="team jf c-ruby"><span class="team-n">Team Ruby</span><span class="team-s">${a}</span></div><div class="team jf c-sapphire"><span class="team-n">Team Sapphire</span><span class="team-s">${b}</span></div></div>${label ? `<span class="small muted">${label}</span>` : ''}`;

/** Options as shown on the table (not tappable). Shows vote counts at the reveal when asked. */
function optRows(opts, right, reveal, ans, showVotes, long) {
  return `<div class="col" style="gap:8px">${opts.map((o, i) => {
    const votes = Object.values(ans).filter((a) => a.a === i).length;
    return `<div class="opt jf c-${OPT_C[i]} ${reveal && i === right ? 'is-right' : ''}"><span class="opt-l">${LETTERS[i]}</span><span class="opt-t ${long ? 'long' : ''}">${esc(o)}</span>${reveal && showVotes ? `<span class="opt-v">${votes}</span>` : ''}</div>`;
  }).join('')}</div>`;
}
/** Options on a player's phone. `canChange` lets the player move their vote until the reveal. */
function optButtons(opts, picked, right, reveal, canChange, long) {
  return `<div class="col" style="gap:10px">${opts.map((o, i) => {
    let st = '';
    if (reveal) st = i === right ? 'is-right' : i === picked ? 'is-wrong' : '';
    else if (i === picked) st = 'is-sel';
    const off = reveal || (picked !== null && !canChange);
    return `<button class="opt jf c-${OPT_C[i]} ${st}" data-act="answer" data-i="${i}" ${off ? 'disabled' : ''} aria-pressed="${i === picked}"><span class="opt-l">${LETTERS[i]}</span><span class="opt-t ${long ? 'long' : ''}">${esc(o)}</span></button>`;
  }).join('')}</div>`;
}
function raceRows(rows) {
  return `<div class="list">${rows.map((r, i) => `<div class="li c-${esc(r.p.color)} ${r.done ? 'is-done' : ''}">${markers(i)}${avatar(r.p, 'sm')}<div class="grow col" style="gap:6px"><div class="row between"><span class="li-name">${esc(r.p.name)}</span><span class="li-det">${r.status}</span></div>${r.pct === undefined ? '' : `<div class="track"><div class="fill" style="width:${r.pct}%"></div></div>`}</div></div>`).join('')}</div>`;
}
function timelineLine(anchors, card, insertAt, gapLabels) {
  const rows = [];
  anchors.forEach((ix, k) => {
    if (gapLabels) rows.push(`<div class="gapmark">${k + 1}</div>`);
    if (insertAt === k) rows.push(`<div class="ev is-new"><span class="ev-n">${esc(TIMELINE[card][0])}</span><span class="ev-r">${esc(TIMELINE[card][1])}</span></div>`);
    rows.push(`<div class="ev"><span class="ev-n">${esc(TIMELINE[ix][0])}</span><span class="ev-r">${esc(TIMELINE[ix][1])}</span></div>`);
  });
  if (gapLabels) rows.push(`<div class="gapmark">${anchors.length + 1}</div>`);
  if (insertAt === anchors.length) rows.push(`<div class="ev is-new"><span class="ev-n">${esc(TIMELINE[card][0])}</span><span class="ev-r">${esc(TIMELINE[card][1])}</span></div>`);
  return `<div class="col tline" style="gap:6px">${rows.join('')}</div>`;
}
/** `show` reveals every letter; `markMissed` colours the letters this player didn't find. */
function hangSlots(word, guessed, show, markMissed) {
  return `<div class="hang" aria-label="Hidden word">${word.split(' ').map((w) => `<span class="hang-w">${w.split('').map((c) => `<span class="hang-c ${guessed.includes(c) ? 'on' : show && markMissed ? 'missed' : ''}">${guessed.includes(c) || show ? c : ''}</span>`).join('')}</span>`).join('')}</div>`;
}
const lives = (wrong) => `<div class="lives" role="img" aria-label="${G.MAX_WRONG - wrong} of ${G.MAX_WRONG} lives left">${[...Array(G.MAX_WRONG).keys()].map((k) => `<span class="life ${k < G.MAX_WRONG - wrong ? 'on' : ''}"></span>`).join('')}</div>`;

function hostPlay() {
  const rd = S.room.round;
  if (!rd) return { cls: '', secs: [['wait', '<p class="muted">Setting up…</p>']] };
  if (rd.phase === 'intro') return { cls: '', secs: introSecs(rd, false).concat([hostControls(rd)]) };
  const ans = ((S.room.answers || {})[rd.i]) || {};
  const g = L.gameById(rd.game), item = itemOf(rd), data = rd.data || {};
  const reveal = rd.phase === 'reveal';
  const secs = [['h', head(esc(g.name), `${roundWord(rd)} ${rd.i + 1} of ${rd.n}`, reveal ? null : rd.endsAt)]];
  const list = playerList();
  const res = rd.res || { pts: {}, order: [] };
  const firstNote = (ok, title, body) => secs.push(['rn', ok ? note(true, title, body) : note(false, 'No one got it', body)]);

  if (rd.game === 'vs') {
    const v = VERSES[item];
    if (!reveal) {
      secs.push(['card', `<div class="card col"><span class="lbl">Rebuild this verse</span><span class="title md">${esc(v.ref)}</span><span class="small">${v.parts.length} pieces · fastest correct order wins</span></div>`]);
      const rows = list.map((p) => { const a = ans[p.uid] || {}; return { p, done: !!a.ok, ms: a.ms, pct: a.ok ? 100 : Math.min(95, Math.round(((a.placed || 0) / v.parts.length) * 100)), status: a.ok ? 'Done · ' + L.fmtSecs(a.ms) : a.placed ? 'Placing…' : 'Thinking…' }; })
        .sort((x, y) => (y.done ? 1e9 - y.ms : y.pct) - (x.done ? 1e9 - x.ms : x.pct));
      secs.push(['race', raceRows(rows)]);
    } else {
      secs.push(['card', `<div class="card col" style="gap:8px"><span class="lbl">${esc(v.ref)}</span><span class="verse">${esc(v.parts.join(' '))}</span></div>`]);
      secs.push(['res', resultList(res.order, (uid) => 'Done · ' + L.fmtSecs((ans[uid] || {}).ms || 0), res.pts)]);
    }
  }

  if (rd.game === 'tr') {
    const q = TRIVIA[item], opts = G.options('tr', item, data), right = G.correctOption('tr', item, data);
    const cc = L.countClaims(rd.claims || {});
    secs.push(['teams', teamCards(cc.ruby, cc.sapphire)]);
    secs.push(['q', `<div class="card"><span class="title md" style="line-height:1.25">${esc(q.q)}</span></div>`]);
    secs.push(['opts', optRows(opts, right, reveal, ans, false)]);
    if (reveal) {
      const t = res.first ? (players()[res.first] || {}).team || 'ruby' : null;
      const won = L.tribesFor(rd.i, rd.n).map((x) => TRIBES[x]).join(' and ');
      firstNote(!!res.first, `${esc(pName(res.first))} was first`, res.first ? `${L.TEAMS[t]} claims ${esc(won)}. ${esc(q.ref)}.` : `The answer was ${esc(opts[right])}. ${esc(q.ref)}.`);
    } else secs.push(['cnt', answeredRow(ans)]);
    const claims = rd.claims || {}, fresh = reveal && res.first ? L.tribesFor(rd.i, rd.n) : [];
    secs.push(['map', `<span class="lbl">The land · north to south</span><div class="win"><div class="grid3">${TRIBES.map((name, i) => { const c = claims[i]; return `<div class="trb ${c ? 'jf c-' + c : 'open'} ${fresh.includes(i) ? 'is-new' : ''}"><span class="trb-n">${name}</span><span class="trb-o">${c ? L.TEAMS[c] : 'Open'}</span></div>`; }).join('')}</div></div>`]);
  }

  if (rd.game === 'fv') {
    const v = VERSES[item], [start] = G.verseHalves(v), opts = G.options('fv', item, data), right = G.correctOption('fv', item, data);
    const tt = teamTotals(rd);
    secs.push(['teams', teamCards(tt.ruby, tt.sapphire)]);
    secs.push(['q', reveal
      ? `<div class="card col" style="gap:8px"><span class="lbl">${esc(v.ref)}</span><span class="verse">${esc(v.parts.join(' '))}</span></div>`
      : `<div class="card col" style="gap:8px"><span class="lbl">Finish the verse · ${esc(v.ref)}</span><span class="verse">${esc(start)} …</span></div>`]);
    if (reveal) {
      const t = res.first ? (players()[res.first] || {}).team || 'ruby' : null;
      firstNote(!!res.first, `${esc(pName(res.first))} was first`, res.first ? `Bonus to ${L.TEAMS[t]}. The answer was ${LETTERS[right]}.` : `The answer was ${LETTERS[right]}.`);
      if (res.order.length) secs.push(['res', resultList(res.order, (uid) => L.TEAMS[(players()[uid] || {}).team === 'sapphire' ? 'sapphire' : 'ruby'], res.pts)]);
    } else {
      secs.push(['opts', optRows(opts, right, false, ans, false, true)]);
      secs.push(['cnt', answeredRow(ans)]);
    }
  }

  if (rd.game === 'tt') {
    const x = TWO_TRUTHS[item], opts = G.options('tt', item, data), right = G.correctOption('tt', item, data);
    secs.push(['who', `<div class="card col" style="align-items:center;text-align:center"><span class="lbl">Two truths and a lie about</span><span class="title lg glitch">${esc(x.who)}</span></div>`]);
    secs.push(['opts', optRows(opts, right, reveal, ans, reveal)]);
    if (reveal) {
      const refs = data.opt.map((k) => (k < 2 ? x.t[k][1] : null));
      secs.push(['refs', `<div class="col" style="gap:4px">${refs.map((r, i) => (r ? `<span class="small muted">${LETTERS[i]} is true · ${esc(r)}</span>` : '')).join('')}</div>`]);
      secs.push(['rn', note(true, `${LETTERS[right]} was the lie`, esc(x.lie[1]))]);
      secs.push(['res', `<span class="lbl">Spotted it</span>${resultList(res.order, () => 'Spotted the lie', res.pts)}`]);
    } else secs.push(['cnt', answeredRow(ans, 'Votes in')]);
  }

  if (rd.game === 'tl') {
    const right = G.correctOption('tl', item, data);
    secs.push(['card', `<div class="card col" style="gap:6px"><span class="lbl">Where does it go?</span><span class="title md">${esc(TIMELINE[item][0])}</span><span class="det small muted">${reveal ? esc(TIMELINE[item][1]) : 'Pick the gap on your phone'}</span></div>`]);
    secs.push(['line', timelineLine(data.anchors, item, reveal ? right : -1, !reveal)]);
    if (reveal) firstNote(!!res.first, `${esc(pName(res.first))} was first`, res.first ? `${res.order.length} placed it right, in gap ${right + 1}.` : `It goes in gap ${right + 1}.`);
    else secs.push(['cnt', answeredRow(ans)]);
  }

  if (rd.game === 'hg') {
    const [word, cat] = HANGMAN[item], total = G.hangLetters(word);
    secs.push(['card', `<div class="card col" style="gap:10px;align-items:center;text-align:center"><span class="lbl">${esc(cat)} · ${word.replace(/ /g, '').length} letters</span>${hangSlots(word, '', reveal)}</div>`]);
    const rows = list.map((p) => { const a = ans[p.uid] || {}; const gs = a.g || ''; const wrong = G.hangWrong(word, gs);
      return { p, done: !!a.ok, ms: a.ms || 0, pct: Math.round((G.hangFound(word, gs) / total) * 100), status: a.ok ? 'Solved · ' + L.fmtSecs(a.ms) : a.out ? 'Out' : `${G.MAX_WRONG - wrong} lives` }; })
      .sort((x, y) => (y.done ? 1e9 - y.ms : y.pct) - (x.done ? 1e9 - x.ms : x.pct));
    secs.push(['race', reveal ? resultList(res.order, (uid) => 'Solved · ' + L.fmtSecs((ans[uid] || {}).ms || 0), res.pts) : raceRows(rows)]);
  }

  if (rd.game === 'bk') {
    const books = data.set.map((b) => BOOKS[b]);
    if (!reveal) {
      secs.push(['card', `<div class="card col" style="gap:8px"><span class="lbl">Put these in Bible order</span><span class="small">${data.order.map((k) => esc(BOOKS[data.set[k]])).join(' · ')}</span></div>`]);
      const rows = list.map((p) => { const a = ans[p.uid] || {}; return { p, done: !!a.ok, ms: a.ms || 0, status: a.ok ? 'Done · ' + L.fmtSecs(a.ms) : a.checks ? `Checked ${a.checks}×` : 'Sorting…' }; })
        .sort((x, y) => (y.done ? 1e9 - y.ms : 0) - (x.done ? 1e9 - x.ms : 0));
      secs.push(['race', raceRows(rows)]);
    } else {
      secs.push(['card', `<div class="card col" style="gap:4px"><span class="lbl">Bible order</span>${books.map((b, i) => `<span class="li-name">${L.roman(i + 1)}. ${esc(b)}</span>`).join('')}</div>`]);
      secs.push(['res', resultList(res.order, (uid) => 'Done · ' + L.fmtSecs((ans[uid] || {}).ms || 0), res.pts)]);
    }
  }

  if (rd.game === 'em') {
    const e = EMOJI[item];
    if (!reveal) {
      const solved = L.scoreEmoji(ans).order;
      secs.push(['card', `<div class="card col" style="align-items:center;text-align:center;gap:6px"><span class="lbl">Which Bible story?</span><span class="emoji" role="img" aria-label="Emoji clue">${e.e}</span></div>`]);
      secs.push(['solved', `<div class="row between"><span class="lbl">Solved</span><span class="small">${solved.length} of ${activeUids().length}</span></div>${solved.length ? `<div class="list">${solved.map((uid, i) => { const p = players()[uid] || {}; return `<div class="li c-${esc(p.color)} is-done">${markers(i)}${avatar(p, 'sm')}<span class="li-name grow">${esc(p.name)}</span><span class="li-det">${L.ordinal(i + 1)}</span></div>`; }).join('')}</div>` : '<p class="small muted" style="margin:0">No one yet. Answers appear here as they come in.</p>'}`]);
    } else {
      secs.push(['card', `<div class="card col" style="align-items:center;text-align:center;gap:6px"><span class="emoji" aria-hidden="true">${e.e}</span><span class="title md">${esc(e.a)}</span><span class="det small muted">${esc(e.ref)}</span></div>`]);
      secs.push(['res', resultList(res.order, (uid, i) => L.ordinal(i + 1), res.pts)]);
    }
  }
  secs.push(hostControls(rd));
  return { cls: '', secs };
}

function resultList(order, detFn, pts) {
  if (!order || !order.length) return `<p class="muted" style="margin:0">No one got this one.</p>`;
  return `<div class="list">${order.map((uid, i) => { const p = players()[uid] || {}; return `<div class="li c-${esc(p.color)} is-done">${markers(i)}${avatar(p, 'sm')}<div class="grow col"><span class="li-name">${esc(p.name)}</span><span class="li-det">${detFn(uid, i)}</span></div><span class="li-name">+${pts[uid] || 0}</span></div>`; }).join('')}</div>`;
}

function podiumHtml(rows) {
  const slots = [[1, 120], [0, 160], [2, 92]].filter(([i]) => rows[i]);
  return `<div class="podium">${slots.map(([i, h]) => { const p = rows[i]; return `<div class="pod-col">${avatar(p)}<span class="li-name">${esc(p.name)}</span><div class="pod jf c-${esc(p.color)}" style="height:${h}px">${i + 1}</div></div>`; }).join('')}</div>`;
}

function teamLine(a, b, what) {
  if (a === b) return `The teams are level, ${a}–${b}${what}.`;
  return `${a > b ? 'Team Ruby' : 'Team Sapphire'} wins, ${Math.max(a, b)}–${Math.min(a, b)}${what}.`;
}
function hostResults() {
  const rows = L.standings(players());
  const rd = S.room.round || {};
  const top = rows[0];
  const line = top ? `${esc(top.name)} takes it.` : 'Game over.';
  let sub = '';
  if (rd.game === 'tr') { const cc = L.countClaims(rd.claims); sub = teamLine(cc.ruby, cc.sapphire, ' in tribes'); }
  if (rd.game === 'fv') { const tt = teamTotals(rd); sub = teamLine(tt.ruby, tt.sapphire, ' in points'); }
  return {
    cls: '',
    secs: [
      ['h', `<div class="col center"><span class="lbl">Tonight's table</span><h1 class="title lg glitch">${line}</h1>${sub ? `<span class="small muted">${sub}</span>` : ''}</div><div class="hazard only-cyber" aria-hidden="true"></div>`],
      ['pod', podiumHtml(rows)],
      ['board', `<div class="card list">${rows.map((p, i) => `<div class="li c-${esc(p.color)}">${markers(i)}${avatar(p, 'xs')}<span class="li-name grow">${esc(p.name)}</span><span class="li-det strong">${p.score}</span></div>`).join('')}</div>`],
      ['ctl', `<div class="grow"></div><div class="pair"><button class="btn btn-s" data-act="toLobby">Another game</button><button class="btn btn-p" data-act="again">Play again</button></div>`]
    ]
  };
}

/* ----- Player screens ----- */
function playerWait() {
  const meta = S.room.meta, me = players()[S.net.uid];
  const g = L.gameById(meta.game || 'vs');
  const secs = [
    ['pill', `<div class="row between"><div class="pill">Room <span class="accent">${esc(S.code)}</span> · ${playerList().length} ${playerList().length === 1 ? 'player' : 'players'}</div>${iconBtn('menu', 'menu', 'Settings and leave room')}</div>`],
    ['me', `<div class="grow col" style="align-items:center;justify-content:center;gap:16px;text-align:center">${avatar(me, 'lg')}<h1 class="title lg glitch">You're in.</h1><span class="muted">The host is choosing a game</span></div>`],
    ['next', `<div class="card row" style="gap:14px"><div class="tile jf c-${g.c} tile-lg" aria-hidden="true">${esc(g.sym)}</div><div class="col"><span class="lbl">Up next</span><span class="card-title">${esc(g.name)}</span><span class="det small muted">${esc(g.mode)}</span></div></div>`]
  ];
  if (g.teams) secs.push(['team', `<div class="team jf c-${me.team === 'sapphire' ? 'sapphire' : 'ruby'}"><span class="team-n">${L.TEAMS[me.team] || L.TEAMS.ruby}</span><button class="btn btn-s btn-sm" data-act="switchTeam">Switch team</button></div>`]);
  secs.push(['ready', `<button class="btn ${me.ready ? 'btn-s' : 'btn-p'}" data-act="ready" aria-pressed="${!!me.ready}">${me.ready ? 'Ready · waiting for the host' : "I'm ready"}</button>`]);
  return { cls: '', secs };
}

function ensureLocal(rd) {
  const key = `${rd.game}:${rd.i}:${rd.startedAt || 0}`;
  if (S.local && S.local.key === key) return S.local;
  const mine = (((S.room.answers || {})[rd.i]) || {})[S.net.uid] || {};
  S.local = { key, placed: [], wrong: 0, done: !!mine.ok, ms: mine.ms || 0, guessWrong: false, tries: 0,
    guessed: mine.g || '', arr: [...Array(G.BOOK_SET).keys()], sel: null, bkMiss: null };
  if (rd.game === 'vs' && mine.ok) S.local.placed = VERSES[itemOf(rd)].parts.map((_, i) => i);
  if (rd.game === 'bk' && mine.ok && rd.data) S.local.arr = [...Array(G.BOOK_SET).keys()].sort((a, b) => rd.data.order[a] - rd.data.order[b]);
  S.drafts.guess = '';
  S.clearGuess = true;
  return S.local;
}

function playerPlay() {
  const rd = S.room.round;
  if (!rd) return { cls: '', secs: [['wait', '<p class="muted">Getting ready…</p>']] };
  if (rd.phase === 'intro') return { cls: '', secs: introSecs(rd, true) };
  const uid = S.net.uid, me = players()[uid] || {};
  const ans = ((S.room.answers || {})[rd.i]) || {}, mine = ans[uid] || {};
  const loc = ensureLocal(rd);
  const res = rd.res || { pts: {}, order: [] };
  const myPts = res.pts[uid] || 0;
  const det = `${roundWord(rd)} ${rd.i + 1} of ${rd.n}`;
  const g = L.gameById(rd.game), item = itemOf(rd), data = rd.data || {};
  const reveal = rd.phase === 'reveal';
  const picked = typeof mine.a === 'number' ? mine.a : null;
  const team = me.team === 'sapphire' ? 'sapphire' : 'ruby';
  const secs = [];
  const choiceResult = (right, okBody, badBody) => {
    if (picked === right) secs.push(['n', note(true, res.first === uid ? `First right answer · +${myPts}` : `Right · +${myPts}`, okBody)]);
    else secs.push(['n', note(false, picked === null ? 'Out of time' : 'Not this time', badBody)]);
  };

  if (rd.game === 'vs') {
    const v = VERSES[item], n = v.parts.length;
    if (!reveal) {
      secs.push(['h', head(esc(v.ref), `${esc(g.name)} · ${det}`, rd.endsAt, 'tpill')]);
      secs.push(['lbl', `<span class="lbl">${loc.done ? 'Locked in' : 'Tap the pieces in order'}</span>`]);
      const placed = loc.placed.map((pi, k) => `<button class="piece placed jf c-${esc(me.color || 'amethyst')}" data-act="unpiece" data-k="${k}" ${loc.done ? 'disabled' : ''}>${esc(v.parts[pi])}</button>`).join('');
      secs.push(['zone', `<div class="zone" aria-label="Your verse">${placed || '<span class="muted">Your verse builds here. Tap a placed piece to take it back.</span>'}</div>`]);
      const pool = data.order.filter((pi) => !loc.placed.includes(pi)).map((pi) => `<button class="piece" data-act="piece" data-p="${pi}">${esc(v.parts[pi])}</button>`).join('');
      secs.push(['pool', `<div class="pieces">${pool}</div>`]);
      if (loc.done) secs.push(['n', note(true, `Locked in · ${L.fmtSecs(loc.ms)}`, 'Watch the table.')]);
      else if (loc.placed.length === n) secs.push(['n', note(false, 'Not quite', 'Plus 3 seconds. Tap a piece to take it back and try again.')]);
      if (!loc.done) secs.push(['clr', `<div class="grow"></div><button class="btn btn-s" data-act="clearPieces" ${loc.placed.length ? '' : 'disabled'}>Clear my answer</button>`]);
    } else {
      secs.push(['h', head('Round over', `${esc(g.name)} · ${det}`)]);
      secs.push(['you', myPts ? note(true, `+${myPts} · ${L.ordinal(res.order.indexOf(uid) + 1)}`, `You finished in ${L.fmtSecs(mine.ms || loc.ms)}.`) : note(false, 'No points this round', 'Be quicker next time.')]);
      secs.push(['card', `<div class="card col" style="gap:8px"><span class="lbl">${esc(v.ref)}</span><span class="verse">${esc(v.parts.join(' '))}</span></div>`]);
    }
  }

  if (rd.game === 'tr') {
    const q = TRIVIA[item], opts = G.options('tr', item, data), right = G.correctOption('tr', item, data);
    secs.push(['team', `<div class="team jf c-${team}"><span class="team-n">${L.TEAMS[team]}</span>${reveal ? `<span class="small">${det}</span>` : timer(rd.endsAt, 'tpill')}</div>`]);
    secs.push(['q', `<h1 class="title md" style="line-height:1.2">${esc(q.q)}</h1>`]);
    secs.push(['opts', optButtons(opts, picked, right, reveal, false)]);
    if (reveal) choiceResult(right, res.first === uid ? `You claimed land for ${L.TEAMS[team]}. ${esc(q.ref)}.` : esc(q.ref) + '.', `It was ${esc(opts[right])}. ${esc(q.ref)}.`);
    else if (picked !== null) secs.push(['n', `<div class="pill" role="status">Answer in · waiting for the others</div>`]);
  }

  if (rd.game === 'fv') {
    const v = VERSES[item], [start] = G.verseHalves(v), opts = G.options('fv', item, data), right = G.correctOption('fv', item, data);
    secs.push(['team', `<div class="team jf c-${team}"><span class="team-n">${L.TEAMS[team]}</span>${reveal ? `<span class="small">${det}</span>` : timer(rd.endsAt, 'tpill')}</div>`]);
    secs.push(['q', `<div class="card col" style="gap:6px"><span class="lbl">${esc(v.ref)}</span><span class="verse">${esc(start)} …</span></div>`]);
    secs.push(['opts', optButtons(opts, picked, right, reveal, false, true)]);
    if (reveal) choiceResult(right, `Points for ${L.TEAMS[team]}.`, `It ends: ${esc(opts[right])}`);
    else if (picked !== null) secs.push(['n', `<div class="pill" role="status">Answer in · waiting for the others</div>`]);
  }

  if (rd.game === 'tt') {
    const x = TWO_TRUTHS[item], opts = G.options('tt', item, data), right = G.correctOption('tt', item, data);
    secs.push(['h', head(esc(x.who), `Spot the lie · ${det}`, reveal ? null : rd.endsAt, 'tpill')]);
    secs.push(['opts', optButtons(opts, picked, right, reveal, true)]);
    if (reveal) choiceResult(right, esc(x.lie[1]), `${LETTERS[right]} was the lie. ${esc(x.lie[1])}`);
    else if (picked !== null) secs.push(['n', `<div class="pill" role="status">Vote in · you can change it until the reveal</div>`]);
    else secs.push(['n', `<span class="lbl">Tap the lie · your vote is secret</span>`]);
  }

  if (rd.game === 'tl') {
    const right = G.correctOption('tl', item, data), anchors = data.anchors;
    secs.push(['h', head('Where does it go?', `${esc(g.name)} · ${det}`, reveal ? null : rd.endsAt, 'tpill')]);
    secs.push(['card', `<div class="card col" style="gap:4px"><span class="lbl">Your card</span><span class="title md">${esc(TIMELINE[item][0])}</span>${reveal ? `<span class="det small muted">${esc(TIMELINE[item][1])}</span>` : ''}</div>`]);
    if (reveal) {
      secs.push(['line', timelineLine(anchors, item, right, false)]);
      choiceResult(right, `Gap ${right + 1}.`, `It goes in gap ${right + 1}.`);
    } else {
      const rows = [];
      anchors.forEach((ix, k) => {
        rows.push(`<button class="gapbtn ${picked === k ? 'is-sel' : ''}" data-act="answer" data-i="${k}" ${picked !== null ? 'disabled' : ''} aria-pressed="${picked === k}">${picked === k ? 'Your answer' : 'Place here'}</button>`);
        rows.push(`<div class="ev"><span class="ev-n">${esc(TIMELINE[ix][0])}</span><span class="ev-r">${esc(TIMELINE[ix][1])}</span></div>`);
      });
      const k = anchors.length;
      rows.push(`<button class="gapbtn ${picked === k ? 'is-sel' : ''}" data-act="answer" data-i="${k}" ${picked !== null ? 'disabled' : ''} aria-pressed="${picked === k}">${picked === k ? 'Your answer' : 'Place here'}</button>`);
      secs.push(['line', `<div class="col tline" style="gap:5px">${rows.join('')}</div>`]);
      if (picked !== null) secs.push(['n', `<div class="pill" role="status">Answer in · waiting for the others</div>`]);
    }
  }

  if (rd.game === 'hg') {
    const [word, cat] = HANGMAN[item];
    const gs = loc.guessed || mine.g || '';
    const wrong = G.hangWrong(word, gs), solved = !!mine.ok || G.hangSolved(word, gs), out = !solved && (mine.out || wrong >= G.MAX_WRONG);
    secs.push(['h', head(esc(cat), `${esc(g.name)} · ${det}`, reveal ? null : rd.endsAt, 'tpill')]);
    secs.push(['word', `<div class="card col" style="gap:12px;align-items:center">${hangSlots(word, gs, reveal || out, true)}${lives(Math.min(wrong, G.MAX_WRONG))}</div>`]);
    if (reveal) secs.push(['n', myPts ? note(true, `+${myPts} · ${L.ordinal(res.order.indexOf(uid) + 1)}`, `Solved in ${L.fmtSecs(mine.ms || 0)}.`) : note(false, 'No points this round', `The answer was ${esc(word)}.`)]);
    else if (solved) secs.push(['n', note(true, `Solved · ${L.fmtSecs(mine.ms || loc.ms)}`, 'Watch the table.')]);
    else if (out) secs.push(['n', note(false, 'Out of lives', `It was ${esc(word)}.`)]);
    if (!reveal && !solved && !out) {
      const keys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((c) => {
        const used = gs.includes(c), hit = used && word.includes(c);
        return `<button class="hkey ${used ? (hit ? 'hit' : 'miss') : ''}" data-act="letter" data-c="${c}" ${used ? 'disabled' : ''} aria-label="${c}${used ? (hit ? ', in the word' : ', not in the word') : ''}">${c}</button>`;
      }).join('');
      secs.push(['keys', `<div class="grow"></div><div class="hkeys">${keys}</div>`]);
    }
  }

  if (rd.game === 'bk') {
    const inPlace = G.booksInPlace(data, loc.arr);
    if (!reveal) {
      secs.push(['h', head('Bible order', `${esc(g.name)} · ${det}`, rd.endsAt, 'tpill')]);
      secs.push(['lbl', `<span class="lbl">${loc.done ? 'Locked in' : 'Drag a book, or tap two to swap'}</span>`]);
      secs.push(['books', `<div class="col bklist" style="gap:8px">${loc.arr.map((p, i) => `<div class="bk c-${esc(me.color || 'amethyst')} ${loc.sel === i ? 'is-sel' : ''} ${loc.done ? 'is-done' : ''}" data-bk="${i}" role="button" tabindex="0" aria-label="${esc(BOOKS[data.set[data.order[p]]])}, position ${i + 1}">${markers(i)}<span class="grow">${esc(BOOKS[data.set[data.order[p]]])}</span><svg class="grip" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 9h14M5 15h14"></path></svg></div>`).join('')}</div>`]);
      if (loc.done) secs.push(['n', note(true, `All six in order · ${L.fmtSecs(loc.ms)}`, 'Watch the table.')]);
      else if (loc.bkMiss !== null) secs.push(['n', note(false, `${loc.bkMiss} of 6 in place`, 'Plus 3 seconds. Keep going and check again.')]);
      if (!loc.done) secs.push(['chk', `<div class="grow"></div><button class="btn btn-p" data-act="bkCheck">Check my order</button>`]);
    } else {
      secs.push(['h', head('Round over', `${esc(g.name)} · ${det}`)]);
      secs.push(['n', myPts ? note(true, `+${myPts} · ${L.ordinal(res.order.indexOf(uid) + 1)}`, `You finished in ${L.fmtSecs(mine.ms || loc.ms)}.`) : note(false, 'No points this round', `${inPlace} of 6 were in place.`)]);
      secs.push(['card', `<div class="card col" style="gap:4px"><span class="lbl">Bible order</span>${data.set.map((b, i) => `<span class="li-name">${L.roman(i + 1)}. ${esc(BOOKS[b])}</span>`).join('')}</div>`]);
    }
  }

  if (rd.game === 'em') {
    const e = EMOJI[item];
    if (!reveal) {
      secs.push(['h', head(esc(g.name), det, rd.endsAt, 'tpill')]);
      secs.push(['e', `<div class="card col" style="align-items:center;text-align:center;gap:6px"><span class="lbl">Which Bible story?</span><span class="emoji" role="img" aria-label="Emoji clue">${e.e}</span></div>`]);
      if (loc.done || mine.ok) {
        const place = L.scoreEmoji(ans).order.indexOf(uid);
        secs.push(['form-done', note(true, `You got it · ${L.ordinal(place + 1)}`, 'Wait for the others or the timer.')]);
      } else {
        secs.push(['form', `<form class="col" style="gap:10px" data-form="guess"><label class="lbl" for="guess">Your answer</label><div class="row" style="gap:10px"><input id="guess" class="field" data-draft="guess" maxlength="60" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="send"><button class="btn btn-p btn-fit" type="submit">Guess</button></div></form>`]);
        secs.push(['n', loc.guessWrong ? note(false, 'Not it', 'Try again. Spelling close enough counts if the key name is right.') : '']);
      }
    } else {
      secs.push(['h', head('Round over', `${esc(g.name)} · ${det}`)]);
      secs.push(['e', `<div class="card col" style="align-items:center;text-align:center;gap:6px"><span class="emoji" aria-hidden="true">${e.e}</span><span class="title md">${esc(e.a)}</span><span class="det small muted">${esc(e.ref)}</span></div>`]);
      secs.push(['you', myPts ? note(true, `+${myPts} · ${L.ordinal(res.order.indexOf(uid) + 1)}`, '') : note(false, 'No points this round', '')]);
    }
  }
  return { cls: '', secs };
}

function playerResults() {
  const rows = L.standings(players());
  const idx = rows.findIndex((p) => p.uid === S.net.uid);
  const me = rows[idx] || { score: 0, correct: 0 };
  return {
    cls: '',
    secs: [
      ['big', `<div class="grow col" style="align-items:center;justify-content:center;gap:8px;text-align:center"><span class="lbl">You finished</span><div class="orn only-noir" style="width:100%" aria-hidden="true"><span class="hair"></span><span class="gem"></span><span class="hair"></span></div><span class="big">${idx >= 0 ? L.ordinal(idx + 1) : '–'}</span><span class="title sm">${me.score} points</span></div>`],
      ['stats', `<div class="grid3" style="gap:8px"><div class="stat"><span class="stat-v">${me.score}</span><span class="stat-l">Points</span></div><div class="stat"><span class="stat-v">${me.correct || 0}</span><span class="stat-l">Rounds scored</span></div><div class="stat"><span class="stat-v">${rows.length}</span><span class="stat-l">Players</span></div></div>`],
      ['wait', `<p class="small muted center" style="margin:0;text-align:center">The host can start another game. Stay here to play again.</p><button class="btn btn-s" data-act="leave">Leave room</button>`]
    ]
  };
}

/* ----- Sheets ----- */
function sheetWrap(inner) {
  return `<div class="sheet-wrap" data-act="closeSheetBg"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle"><div class="sheet-mono only-noir" aria-hidden="true">UR</div>${inner}<button class="btn btn-s" data-act="closeSheet">Close</button></div></div>`;
}
function sheetMenu() {
  const inRoom = S.view === 'room' && S.room && S.room.meta;
  const chips = (act, cur, vals) => `<div class="seg">${vals.map(([v, l]) => `<button class="chip ${cur === v ? 'on' : ''}" data-act="${act}" data-v="${v}" aria-pressed="${cur === v}">${l}</button>`).join('')}</div>`;
  let roomNote = '', roomBtn = '';
  if (inRoom && S.role === 'host') {
    roomNote = '<p class="small muted" style="margin:0">Your theme shows on every phone in this room.</p>';
    roomBtn = `<button class="btn btn-s" data-act="closeRoom">${Date.now() - S.confirmClose < 4000 ? 'Tap again to close the room' : 'Close room'}</button>`;
  } else if (inRoom) {
    roomNote = `<p class="small muted" style="margin:0">While you're in a room, the host's theme is shown. Your choice applies outside rooms.</p>`;
    roomBtn = '<button class="btn btn-s" data-act="leave">Leave room</button>';
  }
  return sheetWrap(`<h2 class="title md" id="sheetTitle" tabindex="-1">Settings</h2>
    <div class="col" style="gap:10px"><span class="lbl">Theme</span>${chips('theme', S.prefs.theme, [['noir', 'Luxury Noir'], ['cyber', 'Cyberpunk'], ['glass', 'Stained Glass']])}${roomNote}</div>
    <div class="col" style="gap:10px"><span class="lbl">Light or dark</span>${chips('mode', S.prefs.mode, [['auto', 'Auto'], ['light', 'Light'], ['dark', 'Dark']])}</div>
    ${roomBtn}
    <p class="small muted center" style="margin:0;text-align:center">Upper Room ${APP_VERSION} · © 2026 Anderson Jones<br>Scripture from the King James Version (public domain)</p>`);
}
function joinUrl() { return location.origin + location.pathname + '?join=' + S.code; }
function sheetQr() {
  let svg = '';
  try { svg = qrSvg(joinUrl(), { label: 'QR code to join room ' + S.code }); } catch { svg = ''; }
  return sheetWrap(`<h2 class="title md center" id="sheetTitle" tabindex="-1">Scan to join</h2>
    <div class="qr-frame">${svg}</div>
    <div class="col" style="align-items:center;gap:4px"><span class="lbl">Room code</span><span class="code">${esc(S.code)}</span><span class="small muted" style="word-break:break-all;text-align:center">${esc(joinUrl())}</span></div>
    <button class="btn btn-p" data-act="share">Share invite</button>`);
}

/* =================== Network & rooms =================== */
async function ensureNet() {
  if (S.net) return S.net;
  S.netBusy = true; S.netErr = ''; paint();
  try {
    if (useLocalNet) { const m = await import('./net-local.js'); S.net = await m.createLocalNet(); }
    else { const m = await import('./net-firebase.js'); S.net = await m.createFirebaseNet(firebaseConfig); }
    S.net.onConnection((ok) => { S.offline = !ok; paint(); });
    return S.net;
  } catch (e) {
    console.error(e);
    S.netErr = navigator.onLine === false ? "You're offline. Hosting and joining need the internet." : "Can't reach the game server. Check your internet and try again.";
    throw e;
  } finally { S.netBusy = false; paint(); }
}

function enterRoom(code, role) {
  S.code = code; S.role = role; S.view = 'room'; S.room = undefined; S.local = null;
  save('ur.session', { code, role });
  if (S.unwatch) S.unwatch();
  S.unwatch = S.net.watch('rooms/' + code, (val) => {
    S.room = val;
    if (val === null) save('ur.session', null);
    paint();
  }, () => { S.room = null; paint(); });
  if (S.unpresence) S.unpresence();
  S.unpresence = role === 'host'
    ? S.net.presence(`rooms/${code}/meta/hostOnline`, true, false)
    : S.net.presence(`rooms/${code}/players/${S.net.uid}/online`, true, false);
  paint();
}
function leaveRoomLocal() {
  if (S.unwatch) S.unwatch();
  if (S.unpresence) S.unpresence();
  S.unwatch = S.unpresence = null;
  S.code = S.role = null; S.room = undefined; S.view = 'home'; S.sheet = null; S.local = null;
  save('ur.session', null);
  paint();
}

async function startHost() {
  try { await ensureNet(); } catch { return; }
  for (let tries = 0; tries < 8; tries++) {
    const code = L.makeCode();
    const meta = { host: S.net.uid, created: Date.now(), status: 'lobby', game: 'vs', theme: S.prefs.theme, v: 1 };
    try {
      if (await S.net.create(`rooms/${code}/meta`, meta)) { enterRoom(code, 'host'); return; }
    } catch (e) { console.error(e); S.netErr = "Couldn't create a room. Check the database rules are published."; paint(); return; }
  }
  S.netErr = "Couldn't find a free room code. Try again."; paint();
}

async function doJoin() {
  const code = L.cleanCode(S.drafts.code);
  const name = String(S.drafts.name || '').trim().slice(0, 16);
  S.joinErr = '';
  if (code.length !== 4) { S.joinErr = 'Room codes have four letters.'; paint(); return; }
  if (!name) { S.joinErr = 'Type your name so others know who you are.'; paint(); return; }
  S.busy = true; paint();
  try {
    await ensureNet();
    const meta = await S.net.get(`rooms/${code}/meta`);
    if (!meta) { S.joinErr = `No room with code ${code}. Check the host's screen.`; return; }
    S.profile = { name, color: S.profile.color || 'amethyst' }; save('ur.profile', S.profile);
    const existing = await S.net.get(`rooms/${code}/players/${S.net.uid}`);
    if (existing) await S.net.update(`rooms/${code}/players/${S.net.uid}`, { name, color: S.profile.color, online: true });
    else {
      const ps = await S.net.get(`rooms/${code}/players`);
      await S.net.set(`rooms/${code}/players/${S.net.uid}`, { name, color: S.profile.color, team: L.smallerTeam(ps), score: 0, correct: 0, ready: false, online: true, joined: S.net.TS });
    }
    enterRoom(code, 'player');
  } catch (e) {
    console.error(e);
    if (!S.joinErr) S.joinErr = S.netErr || "Couldn't join. Check your internet and try again.";
  } finally { S.busy = false; paint(); }
}

const roomPath = () => 'rooms/' + S.code;
const write = (p) => p.catch((e) => { console.error(e); toast("Couldn't reach the game server. Trying again may help."); });

/* ----- Host game control ----- */
const contentLength = G.contentLength;

function hostStartGame() {
  const meta = S.room.meta, g = meta.game || 'vs', set = settingsFor(g), now = S.net.now();
  const n = Math.min(set.rounds, contentLength(g));
  const upd = {
    'meta/status': 'playing', answers: null,
    round: { game: g, phase: 'intro', i: -1, n, secs: set.secs, seq: L.pickSeq(contentLength(g), n), endsAt: now + L.INTRO_MS, claims: null, teamPts: null }
  };
  playerList().forEach((p) => {
    upd[`players/${p.uid}/score`] = 0; upd[`players/${p.uid}/correct`] = 0; upd[`players/${p.uid}/ready`] = false;
    if (L.gameById(g).teams && p.team !== 'ruby' && p.team !== 'sapphire') upd[`players/${p.uid}/team`] = 'ruby';
  });
  write(S.net.update(roomPath(), upd));
}
function hostStartRound(i) {
  const rd = S.room.round, now = S.net.now();
  return S.net.update(roomPath() + '/round', { phase: 'play', i, startedAt: now, endsAt: now + rd.secs * 1000, data: G.roundData(rd.game, rd.seq[i]), res: null });
}
function scoreRound(rd, ans) {
  const item = rd.seq[rd.i];
  if (['vs', 'bk', 'hg'].includes(rd.game)) return L.scoreScramble(ans);
  if (rd.game === 'em') return L.scoreEmoji(ans);
  const right = G.correctOption(rd.game, item, rd.data || {});
  return rd.game === 'tt' ? L.scoreVote(ans, right) : L.scoreTrivia(ans, right);
}
function hostReveal() {
  const rd = S.room.round, ans = ((S.room.answers || {})[rd.i]) || {};
  const res = scoreRound(rd, ans);
  const upd = { 'round/phase': 'reveal', 'round/endsAt': S.net.now() + L.REVEAL_MS, 'round/res': { pts: res.pts, order: res.order, first: res.first } };
  const teamAdd = { ruby: 0, sapphire: 0 };
  Object.entries(res.pts).forEach(([uid, pts]) => {
    const p = players()[uid];
    if (!p) return;
    upd[`players/${uid}/score`] = (p.score || 0) + pts;
    upd[`players/${uid}/correct`] = (p.correct || 0) + 1;
    teamAdd[p.team === 'sapphire' ? 'sapphire' : 'ruby'] += pts;
  });
  if (rd.game === 'tr' && res.first) {
    const team = (players()[res.first] || {}).team === 'sapphire' ? 'sapphire' : 'ruby';
    L.tribesFor(rd.i, rd.n).forEach((t) => { upd[`round/claims/${t}`] = team; });
  }
  if (rd.game === 'fv') {
    const tp = rd.teamPts || {};
    upd['round/teamPts/ruby'] = (tp.ruby || 0) + teamAdd.ruby;
    upd['round/teamPts/sapphire'] = (tp.sapphire || 0) + teamAdd.sapphire;
  }
  return S.net.update(roomPath(), upd);
}
function hostAdvance() {
  const rd = S.room.round;
  return rd.i + 1 < rd.n ? hostStartRound(rd.i + 1) : hostResultsWrite();
}
const hostResultsWrite = () => S.net.update(roomPath(), { 'meta/status': 'results', 'round/phase': 'results' });

async function hostStep(fn) {
  if (S.hostBusy) return;
  S.hostBusy = true;
  try { await fn(); } catch (e) { console.error(e); toast("Couldn't reach the game server."); } finally { S.hostBusy = false; }
}
function hostTick() {
  const r = S.room;
  if (S.role !== 'host' || !r || !r.meta || r.meta.status !== 'playing' || !r.round || S.hostBusy || !S.net) return;
  const rd = r.round, now = S.net.now();
  if (rd.phase === 'intro' && now >= rd.endsAt) hostStep(() => hostStartRound(0));
  else if (rd.phase === 'play') {
    const ans = ((r.answers || {})[rd.i]) || {};
    const all = L.allDone(rd.game, ans, activeUids());
    if (now >= rd.endsAt) hostStep(hostReveal);
    else if (all && rd.game === 'tt') {
      // Two Truths: votes can change, so wait 3 s after everyone has voted (any change restarts it).
      const sig = rd.i + ':' + JSON.stringify(ans);
      if (S.ttWait.sig !== sig) S.ttWait = { sig, at: now };
      else if (now - S.ttWait.at >= L.VOTE_GRACE_MS) hostStep(hostReveal);
    } else if (all) hostStep(hostReveal);
  } else if (rd.phase === 'reveal' && now >= rd.endsAt) hostStep(hostAdvance);
  if (rd.phase === 'play') botsPlay(rd, now);
}

/* ----- Practice bots: the host's phone answers for them ----- */
const botSent = new Set();
function botsPlay(rd, now) {
  const data = rd.data || {};
  if (G.CHOICE.includes(rd.game) && !rd.data) return;
  const ans = ((S.room.answers || {})[rd.i]) || {};
  const key = `${rd.game}:${rd.i}:${rd.startedAt}`;
  const elapsed = now - rd.startedAt;
  const item = rd.seq[rd.i];
  playerList().filter((p) => p.bot).forEach((p) => {
    if (G.isDone(rd.game, ans[p.uid])) return;
    const correct = G.CHOICE.includes(rd.game) ? G.correctOption(rd.game, item, data) : 0;
    const plan = L.botPlan(rd.game, key, p.uid, rd.secs, correct);
    const send = (stage, val) => {
      const id = key + p.uid + stage;
      if (botSent.has(id)) return;
      botSent.add(id);
      write(S.net.set(`${roomPath()}/answers/${rd.i}/${p.uid}`, val));
    };
    if (rd.game === 'vs') {
      const n = VERSES[item].parts.length;
      if (elapsed >= plan.at / 2) send('half', { placed: Math.max(1, Math.floor(n / 2)), ok: false });
      if (plan.ok && elapsed >= plan.at) send('done', { placed: n, ok: true, ms: plan.at });
    } else if (G.CHOICE.includes(rd.game)) {
      if (elapsed >= plan.at) send('ans', { a: plan.a, at: S.net.TS });
    } else if (rd.game === 'bk') {
      if (elapsed >= plan.at / 2) send('half', { ok: false, checks: 1 });
      if (plan.ok && elapsed >= plan.at) send('done', { ok: true, ms: plan.at, checks: 2 });
    } else if (rd.game === 'hg') {
      const word = G.hangWord(item);
      const letters = [...new Set(word.replace(/ /g, '').split(''))];
      if (elapsed >= plan.at / 2) send('half', { g: letters.slice(0, Math.ceil(letters.length / 2)).join('') });
      if (elapsed >= plan.at) send('end', plan.ok ? { g: letters.join(''), ok: true, ms: plan.at } : { g: letters.slice(0, 1).join('') + 'QXZJKV'.slice(0, G.MAX_WRONG), out: true });
    } else if (plan.ok && elapsed >= plan.at) send('ok', { ok: true, at: S.net.TS, tries: 1 });
  });
}
setInterval(hostTick, 300);

/* ----- Player answers ----- */
const myAnsPath = () => `${roomPath()}/answers/${S.room.round.i}/${S.net.uid}`;
function placePiece(pi) {
  const rd = S.room.round, loc = ensureLocal(rd), n = VERSES[rd.seq[rd.i]].parts.length;
  if (loc.done || loc.placed.includes(pi) || rd.phase !== 'play') return;
  loc.placed.push(pi);
  if (loc.placed.length === n) {
    if (L.isOrderCorrect(loc.placed, n)) {
      loc.done = true;
      loc.ms = Math.max(0, S.net.now() - rd.startedAt) + loc.wrong * L.WRONG_PENALTY_MS;
      vibrate(40);
      write(S.net.set(myAnsPath(), { placed: n, ok: true, ms: loc.ms }));
    } else {
      loc.wrong++; vibrate([20, 40, 20]);
      write(S.net.set(myAnsPath(), { placed: n, ok: false }));
    }
  } else write(S.net.set(myAnsPath(), { placed: loc.placed.length, ok: false }));
  paint();
}
function unplacePiece(k) {
  const rd = S.room.round, loc = ensureLocal(rd);
  if (loc.done) return;
  loc.placed.splice(k, 1);
  write(S.net.set(myAnsPath(), { placed: loc.placed.length, ok: false }));
  paint();
}
function submitGuess() {
  const rd = S.room.round;
  if (!rd || rd.game !== 'em' || rd.phase !== 'play') return;
  const loc = ensureLocal(rd), guess = S.drafts.guess || '';
  if (!guess.trim() || loc.done) return;
  loc.tries++;
  if (L.emojiMatches(guess, EMOJI[rd.seq[rd.i]].keys)) {
    loc.done = true; loc.guessWrong = false; vibrate(40);
    const el = document.getElementById('guess'); if (el) el.blur();
    write(S.net.set(myAnsPath(), { ok: true, at: S.net.TS, tries: loc.tries }));
  } else { loc.guessWrong = true; vibrate([20, 40, 20]); }
  paint();
}
function guessLetter(c) {
  const rd = S.room.round;
  if (!rd || rd.game !== 'hg' || rd.phase !== 'play' || S.net.now() >= rd.endsAt) return;
  const loc = ensureLocal(rd), word = G.hangWord(rd.seq[rd.i]);
  if (loc.done || loc.guessed.includes(c) || G.hangWrong(word, loc.guessed) >= G.MAX_WRONG) return;
  loc.guessed += c;
  const val = { g: loc.guessed };
  if (G.hangSolved(word, loc.guessed)) { loc.done = true; loc.ms = Math.max(0, S.net.now() - rd.startedAt); val.ok = true; val.ms = loc.ms; vibrate(40); }
  else if (!word.includes(c)) { vibrate([20, 40, 20]); if (G.hangWrong(word, loc.guessed) >= G.MAX_WRONG) val.out = true; }
  write(S.net.set(myAnsPath(), val));
  paint();
}

/* ----- Books Sort: tap two to swap, or press and drag ----- */
function bkMove(from, to) {
  const rd = S.room.round, loc = ensureLocal(rd);
  if (loc.done || from === to) return;
  const [x] = loc.arr.splice(from, 1);
  loc.arr.splice(to, 0, x);
  loc.bkMiss = null;
}
function bkTap(i) {
  const rd = S.room.round, loc = ensureLocal(rd);
  if (loc.done || rd.phase !== 'play') return;
  if (loc.sel === null) loc.sel = i;
  else if (loc.sel === i) loc.sel = null;
  else { const a = loc.arr; [a[loc.sel], a[i]] = [a[i], a[loc.sel]]; loc.sel = null; loc.bkMiss = null; vibrate(10); }
  paint();
}
function bkCheck() {
  const rd = S.room.round, loc = ensureLocal(rd);
  if (loc.done || rd.phase !== 'play') return;
  const n = G.booksInPlace(rd.data, loc.arr);
  loc.tries++;
  if (n === G.BOOK_SET) {
    loc.done = true; loc.sel = null;
    loc.ms = Math.max(0, S.net.now() - rd.startedAt) + loc.wrong * L.WRONG_PENALTY_MS;
    vibrate(40);
    write(S.net.set(myAnsPath(), { ok: true, ms: loc.ms, checks: loc.tries }));
  } else {
    loc.wrong++; loc.bkMiss = n; vibrate([20, 40, 20]);
    write(S.net.set(myAnsPath(), { ok: false, checks: loc.tries }));
  }
  paint();
}
const drag = { on: false, el: null, from: -1, to: -1, y0: 0, moved: false, rows: [], step: 0, pid: null };
document.addEventListener('pointerdown', (ev) => {
  const el = ev.target.closest('[data-bk]');
  if (!el || !S.room || !S.room.round || S.room.round.game !== 'bk' || (S.local && S.local.done)) return;
  const rows = [...document.querySelectorAll('[data-bk]')];
  const r0 = rows[0].getBoundingClientRect(), r1 = rows[1] ? rows[1].getBoundingClientRect() : r0;
  Object.assign(drag, { on: true, el, from: Number(el.dataset.bk), to: Number(el.dataset.bk), y0: ev.clientY, moved: false, rows, step: r1.top - r0.top || r0.height + 8, pid: ev.pointerId });
  try { el.setPointerCapture(ev.pointerId); } catch {}
});
document.addEventListener('pointermove', (ev) => {
  if (!drag.on || ev.pointerId !== drag.pid) return;
  const dy = ev.clientY - drag.y0;
  if (!drag.moved && Math.abs(dy) < 8) return;
  if (!drag.moved) { drag.moved = true; S.dragging = true; drag.el.classList.add('dragging'); if (S.local) S.local.sel = null; drag.rows.forEach((r) => r.classList.remove('is-sel')); }
  ev.preventDefault();
  drag.to = Math.max(0, Math.min(drag.rows.length - 1, drag.from + Math.round(dy / drag.step)));
  drag.el.style.transform = `translateY(${dy}px)`;
  drag.rows.forEach((r, i) => {
    if (r === drag.el) return;
    let shift = 0;
    if (drag.from < drag.to && i > drag.from && i <= drag.to) shift = -drag.step;
    if (drag.from > drag.to && i < drag.from && i >= drag.to) shift = drag.step;
    r.style.transform = shift ? `translateY(${shift}px)` : '';
  });
}, { passive: false });
function dragEnd(ev, cancelled) {
  if (!drag.on || (ev && ev.pointerId !== drag.pid)) return;
  drag.on = false;
  const { moved, from, to } = drag;
  drag.rows.forEach((r) => { r.style.transform = ''; r.classList.remove('dragging'); });
  S.dragging = false;
  if (moved && !cancelled) { bkMove(from, to); vibrate(10); paint(); }
  else if (!moved && !cancelled) bkTap(from);
  else paint();
}
document.addEventListener('pointerup', (ev) => dragEnd(ev, false));
document.addEventListener('pointercancel', (ev) => dragEnd(ev, true));
document.addEventListener('keydown', (ev) => {
  const el = ev.target.closest && ev.target.closest('[data-bk]');
  if (el && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); bkTap(Number(el.dataset.bk)); }
});

/* =================== Actions =================== */
const A = {
  menu: () => { S.sheet = 'menu'; },
  closeSheet: () => { S.sheet = null; },
  closeSheetBg: (el, ev) => { if (ev.target === el) S.sheet = null; },
  qr: () => { S.sheet = 'qr'; },
  share: async () => {
    const url = joinUrl(), text = `Join my Upper Room game. Code: ${S.code}`;
    if (navigator.share) { try { await navigator.share({ title: 'Upper Room', text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    window.open('https://wa.me/?text=' + encodeURIComponent(text + '\n' + url), '_blank', 'noopener');
  },
  host: () => { startHost(); },
  goJoin: () => { S.view = 'join'; S.joinErr = ''; },
  back: () => { S.view = 'home'; },
  home: () => leaveRoomLocal(),
  color: (el) => { S.profile.color = el.dataset.c; save('ur.profile', S.profile); },
  join: () => { doJoin(); },
  theme: (el) => {
    S.prefs.theme = el.dataset.v; save('ur.prefs', S.prefs);
    if (S.role === 'host' && S.room && S.room.meta) write(S.net.update(roomPath() + '/meta', { theme: S.prefs.theme }));
  },
  mode: (el) => { S.prefs.mode = el.dataset.v; save('ur.prefs', S.prefs); },
  pick: (el) => write(S.net.update(roomPath() + '/meta', { game: el.dataset.g })),
  set: (el) => { const g = S.room.meta.game || 'vs'; write(S.net.update(`${roomPath()}/meta/settings/${g}`, { ...settingsFor(g), [el.dataset.k]: Number(el.dataset.v) })); },
  shuffleTeams: () => {
    const t = L.shuffleTeams(playerList().map((p) => p.uid)), upd = {};
    Object.entries(t).forEach(([u, team]) => { upd[`players/${u}/team`] = team; });
    write(S.net.update(roomPath(), upd));
  },
  addBot: () => {
    const ps = players();
    if (playerList().length >= L.MAX_PLAYERS) return;
    const uid = 'bot' + Math.random().toString(36).slice(2, 8);
    const used = playerList().map((p) => p.color);
    const color = L.COLORS.find((c) => !used.includes(c)) || L.COLORS[playerList().length % L.COLORS.length];
    write(S.net.set(`${roomPath()}/players/${uid}`, { name: L.nextBotName(ps), color, team: L.smallerTeam(ps), score: 0, correct: 0, ready: true, online: true, bot: true, joined: Date.now() }));
  },
  removeBots: () => {
    const upd = {};
    playerList().filter((p) => p.bot).forEach((p) => { upd[`players/${p.uid}`] = null; });
    write(S.net.update(roomPath(), upd));
  },
  switchTeam: () => { const me = players()[S.net.uid]; write(S.net.update(`${roomPath()}/players/${S.net.uid}`, { team: me.team === 'sapphire' ? 'ruby' : 'sapphire' })); },
  ready: () => { const me = players()[S.net.uid]; write(S.net.update(`${roomPath()}/players/${S.net.uid}`, { ready: !me.ready })); },
  start: () => hostStartGame(),
  endGame: () => hostStep(hostResultsWrite),
  skip: () => { if (S.room.round.phase === 'play') hostStep(hostReveal); },
  nextNow: () => { if (S.room.round.phase === 'reveal') hostStep(hostAdvance); },
  toLobby: () => write(S.net.update(roomPath(), { 'meta/status': 'lobby', round: null, answers: null })),
  again: () => hostStartGame(),
  closeRoom: () => {
    if (Date.now() - S.confirmClose < 4000) { const p = roomPath(); S.confirmClose = 0; write(S.net.remove(p)); leaveRoomLocal(); return; }
    S.confirmClose = Date.now(); setTimeout(paint, 4100);
  },
  leave: () => { const p = `${roomPath()}/players/${S.net.uid}`; if (S.unpresence) { S.unpresence(); S.unpresence = null; } write(S.net.remove(p)); leaveRoomLocal(); },
  piece: (el) => placePiece(Number(el.dataset.p)),
  unpiece: (el) => unplacePiece(Number(el.dataset.k)),
  clearPieces: () => { const loc = ensureLocal(S.room.round); if (loc.done) return; loc.placed = []; write(S.net.set(myAnsPath(), { placed: 0, ok: false })); },
  answer: (el) => {
    const rd = S.room.round, mine = (((S.room.answers || {})[rd.i]) || {})[S.net.uid];
    if (rd.phase !== 'play' || S.net.now() >= rd.endsAt) return;
    if (mine && typeof mine.a === 'number' && (rd.game !== 'tt' || mine.a === Number(el.dataset.i))) return;
    vibrate(20);
    write(S.net.set(myAnsPath(), { a: Number(el.dataset.i), at: S.net.TS }));
  },
  letter: (el) => guessLetter(el.dataset.c),
  bkCheck: () => bkCheck(),
  update: () => { if (S.waitingSW) { S.updating = true; S.waitingSW.postMessage('skipWaiting'); } }
};

document.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = A[el.dataset.act];
  if (!fn) return;
  if (el.dataset.act === 'closeSheetBg' && ev.target !== el) return;
  fn(el, ev);
  paint();
});
document.addEventListener('input', (ev) => {
  const el = ev.target;
  if (!el.dataset || !el.dataset.draft) return;
  let v = el.value;
  if (el.dataset.draft === 'code') { v = L.cleanCode(v); if (el.value !== v) el.value = v; }
  S.drafts[el.dataset.draft] = v;
  if (el.dataset.draft === 'guess' && S.local && S.local.guessWrong) { S.local.guessWrong = false; paint(); }
});
document.addEventListener('submit', (ev) => {
  const f = ev.target.closest('form[data-form]');
  if (!f) return;
  ev.preventDefault();
  if (f.dataset.form === 'guess') submitGuess();
});
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' && S.sheet) { S.sheet = null; paint(); }
  if (ev.key === 'Enter' && ev.target.id === 'code') { ev.preventDefault(); const n = document.getElementById('name'); n && n.focus(); }
  if (ev.key === 'Enter' && ev.target.id === 'name') { ev.preventDefault(); doJoin(); }
});

/* =================== Service worker & updates =================== */
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    const check = () => {
      if (reg.waiting && navigator.serviceWorker.controller) { S.waitingSW = reg.waiting; S.updateReady = true; paintChrome(); }
    };
    check();
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      if (w) w.addEventListener('statechange', () => { if (w.state === 'installed') check(); });
    });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
    setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000);
  }).catch(() => {});
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (S.updating && !reloading) { reloading = true; location.reload(); }
  });
}

/* =================== Boot =================== */
paint();
const session = load('ur.session', null);
if (session && session.code && !params.get('join')) {
  S.code = session.code; S.role = session.role; S.view = 'room'; S.room = undefined; paint();
  ensureNet().then(() => enterRoom(session.code, session.role)).catch(() => { S.view = 'home'; save('ur.session', null); paint(); });
}
window.__ur = S; // for tests and the measurement panel
