import { APP_VERSION, firebaseConfig, DEFAULT_THEME } from './config.js';
import { t, getLang, setLang, getVersePref, getVerseLang, setVersePref, GAME_TEXT, MODE_KN, TEAM_KN, COLOR_KN } from './i18n.js';
import { content } from './text.js';
import * as G from './games.js';
import * as P from './pool.js';
import * as EN from './content.js';
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
if (!['cyber', 'glass'].includes(S.prefs.theme)) S.prefs.theme = DEFAULT_THEME; // Luxury Noir was removed in 1.2.1

const $view = document.getElementById('view');
const $overlay = document.getElementById('overlay');
const $bar = document.getElementById('bar');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const vibrate = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch {} };

/* =================== Language =================== */
const C = () => content();
const kn = () => getLang() === 'kn';
const gName = (g) => (kn() && GAME_TEXT.kn[g.id] ? GAME_TEXT.kn[g.id][0] : g.name);
const gHow = (g) => (kn() && GAME_TEXT.kn[g.id] && GAME_TEXT.kn[g.id][1]) || g.how;
const gMode = (g) => (kn() ? MODE_KN[g.mode] || g.mode : g.mode);
const teamName = (tm) => (kn() ? TEAM_KN[tm] : L.TEAMS[tm]);
const colorName = (c) => (kn() ? COLOR_KN[c] : c[0].toUpperCase() + c.slice(1));
const ord = (n) => (kn() ? t('ordinal', { n }) : L.ordinal(n));
const fmtT = (ms) => (kn() ? (ms / 1000).toFixed(1) + ' ಸೆ' : L.fmtSecs(ms));
const langToggle = () => `<div class="langToggle" role="group" aria-label="${t('language')}"><button data-act="lang" data-v="en" aria-pressed="${!kn()}" lang="en">EN</button><button data-act="lang" data-v="kn" aria-pressed="${kn()}" lang="kn">ಕನ್ನಡ</button></div>`;

/* =================== Theme =================== */
const mq = window.matchMedia('(prefers-color-scheme: dark)');
const BG = { cyber: ['#EEEDE8', '#0A0A0F'], glass: ['#F4EFE6', '#1B1530'] };
const FONTS = {
  cyber: 'family=Chakra+Petch:wght@400;600;700',
  glass: 'family=Cinzel:wght@400;700&family=Crimson+Pro:wght@400;600;700'
};
let lastThemeKey = '', lastThemeColor = '';
function activeTheme() {
  const rt = S.room && S.room.meta && S.room.meta.theme;
  return ['cyber', 'glass'].includes(rt) ? rt : S.prefs.theme;
}
function applyTheme() {
  document.documentElement.dataset.vlang = getVerseLang();
  if ((kn() || getVerseLang() === 'kn') && !document.getElementById('font-kn')) {
    const l = document.createElement('link');
    l.rel = 'stylesheet'; l.id = 'font-kn';
    l.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;500;600;700&display=swap';
    document.head.appendChild(l);
  }
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
const timer = (endsAt, cls = 'timer') => `<div class="${cls}" data-ends="${endsAt}" aria-label="${t('timeLeft')}">${clockNow(endsAt)}</div>`;
const head = (title, det, endsAt, cls) => `<div class="row between"><div class="col"><h1 class="title">${title}</h1><span class="det small muted">${det}</span></div>${endsAt ? timer(endsAt, cls) : ''}</div>`;
const players = () => (S.room && S.room.players) || {};
const playerList = () => Object.entries(players()).filter(([, p]) => p && p.name).map(([uid, p]) => ({ uid, ...p }))
  .sort((a, b) => (a.joined || 0) - (b.joined || 0));
const activeUids = () => playerList().filter((p) => p.online !== false).map((p) => p.uid);
const pName = (uid) => (players()[uid] && players()[uid].name) || t('someone');
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
    ? `<div class="update" role="status"><span>${t('newVersion')}</span><button class="btn btn-p btn-sm" data-act="update">${S.updating ? t('updating') : t('update')}</button></div>`
    : (S.toast ? `<div class="update toast" role="status"><span>${esc(S.toast)}</span></div>` : '');
  if ($bar._h !== barHtml) { $bar.innerHTML = barHtml; $bar._h = barHtml; }
  // Sheets
  const sh = S.sheet === 'menu' ? sheetMenu() : S.sheet === 'qr' ? sheetQr() : S.sheet === 'about' ? sheetAbout() : '';
  if ($overlay._h !== sh) {
    const opening = !$overlay._h && sh;
    $overlay.innerHTML = sh; $overlay._h = sh;
    if (opening) { const t = $overlay.querySelector('#sheetTitle'); t && t.focus(); }
  }
}
function tickTimers() {
  const now = S.net ? S.net.now() : Date.now();
  document.querySelectorAll('[data-ends]').forEach((el) => {
    const secs = L.secondsLeft(Number(el.dataset.ends), now);
    const t = el.classList.contains('count') ? String(secs) : L.fmtClock(secs);
    if (el.textContent !== t) el.textContent = t;
    const urgent = secs > 0 && secs <= 10;
    el.classList.toggle('urgent', urgent);
    if (urgent && el.dataset.beat !== String(secs)) {
      el.dataset.beat = String(secs);
      el.classList.remove('beat'); void el.offsetWidth; el.classList.add('beat');
    }
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
      ['hdr', `<div class="hdr"><span class="brand">Upper Room</span><div class="row" style="gap:8px">${langToggle()}${iconBtn('menu', 'menu', t('settings'))}</div></div>`],
      ['deco', `<div class="hazard only-cyber" aria-hidden="true"></div>
        <div class="homegrid" aria-hidden="true"><div class="win"><div class="arch only-glass"><div class="rose"></div></div><div class="grid4">${tiles}</div></div><span class="syscode only-cyber">SYS//UR-12 · ROOM</span></div>`],
      ['hero', `<div class="hero"><h1 class="h1">${t('heroTitle')}</h1><p class="sub">${t('heroSub')}</p></div>`],
      ['btns', `<div class="btns"><button class="btn btn-p" data-act="host" ${S.netBusy ? 'disabled' : ''}>${S.netBusy ? t('connecting') : t('hostRoom')}</button><button class="btn btn-s" data-act="goJoin">${t('joinCode')}</button>${S.netErr ? `<p class="small muted center" role="alert">${esc(S.netErr)}</p>` : ''}</div>`],
      ['about', `<button class="linkbtn" data-act="about">${t('aboutLink')}</button>`],
      ['card', `<div class="card row between"><div class="col"><span class="card-title">${t('gamesReady', { n: L.GAMES.filter((g) => g.ready).length })}</span><span class="det small muted">${t('moreSoon', { n: L.GAMES.filter((g) => !g.ready).length })}</span></div><div class="wtiles" aria-hidden="true"><span class="wt hit"></span><span class="wt near"></span><span class="wt"></span><span class="wt hit"></span><span class="wt"></span></div></div>`]
    ]
  };
}

function viewJoin() {
  const sw = L.COLORS.map((c) => `<button class="sw jf c-${c} ${S.profile.color === c ? 'is-sel' : ''}" data-act="color" data-c="${c}" aria-label="${colorName(c)}" aria-pressed="${S.profile.color === c}"><span class="sw-dot"></span></button>`).join('');
  return {
    cls: '',
    secs: [
      ['jhdr', `<div class="row" style="gap:8px">${iconBtn('back', 'back', t('back'))}<h1 class="title grow">${t('joinTitle')}</h1>${langToggle()}</div><p class="muted" style="margin:0">${t('joinHint')}</p>`],
      ['jcode', `<div class="col" style="gap:10px"><label class="lbl" for="code">${t('roomCode')}</label><input id="code" class="field code-input" data-draft="code" maxlength="4" autocomplete="off" autocorrect="off" autocapitalize="characters" spellcheck="false" enterkeyhint="next" aria-describedby="joinErr"></div>`],
      ['jname', `<div class="col" style="gap:10px"><label class="lbl" for="name">${t('yourName')}</label><input id="name" class="field" data-draft="name" maxlength="16" autocomplete="nickname" enterkeyhint="go"></div>`],
      ['jcol', `<div class="col" style="gap:10px"><span class="lbl" id="colLbl">${t('yourColour')}</span><div class="row swrow" role="group" aria-labelledby="colLbl">${sw}</div></div>`],
      ['jerr', `<div id="joinErr">${S.joinErr ? note(false, esc(S.joinErr), '') : ''}</div>`],
      ['jgo', `<div class="grow"></div><button class="btn btn-p" data-act="join" ${S.busy ? 'disabled' : ''}>${S.busy ? t('joining') : t('join')}</button><p class="small muted center" style="margin:0;text-align:center">${t('noAccount')}</p>`]
    ]
  };
}

/* =================== Views: room =================== */
function viewRoom() {
  const r = S.room;
  const conn = S.offline ? [['conn', `<div class="pill" role="status">${t('reconnecting')}</div>`]] : [];
  if (r === undefined) return { cls: 'center-v', secs: [['load', `<div class="col" style="align-items:center;gap:12px;text-align:center"><span class="lbl">${t('roomN', { c: esc(S.code) })}</span><h1 class="title">${t('connecting')}</h1></div>`]] };
  if (r === null || !r.meta) {
    return { cls: 'center-v', secs: [['gone', `<div class="col" style="align-items:center;gap:14px;text-align:center"><h1 class="title">${t('closedT')}</h1><p class="muted" style="margin:0">${t('closedB', { c: esc(S.code) })}</p><button class="btn btn-p" data-act="home">${t('backStart')}</button></div>`]] };
  }
  const st = r.meta.status;
  let out;
  if (S.role === 'host') {
    const rd = r.round, playing = st === 'playing' && r.meta.hostPlays && players()[S.net.uid] && rd;
    if (playing && rd.phase === 'play') {
      out = playerPlay();
      out.secs = [['hostbar', `<div class="row between"><span class="pill">${t('hostPlayingPill')}</span><button class="btn btn-s btn-sm" data-act="skip">${t('revealNow')}</button></div>`]].concat(out.secs);
    } else if (playing && rd.phase === 'intro') out = { cls: '', secs: introSecs(rd, true).concat([hostControls(rd)]) };
    else out = st === 'playing' ? hostPlay() : st === 'results' ? hostResults() : hostLobby();
  }
  else {
    if (!players()[S.net.uid]) return { cls: 'center-v', secs: [['out', `<div class="col" style="align-items:center;gap:14px;text-align:center"><h1 class="title">${t('notInRoom')}</h1><button class="btn btn-p" data-act="home">${t('backStart')}</button></div>`]] };
    out = st === 'playing' ? playerPlay() : st === 'results' ? playerResults() : playerWait();
  }
  if (S.role === 'player' && r.meta.hostOnline === false) conn.push(['hostoff', `<div class="pill" role="status">${t('hostOff')}</div>`]);
  out.secs = conn.concat(out.secs);
  return out;
}

/** Room-wide quiz settings: one Bible book for every game (for church quizzes) and the difficulty. */
const bookName = (b) => C().BOOKS[EN.BOOKS.indexOf(b)] || b;
function quizCard(meta, game) {
  const q = quizOf(meta);
  const chip = (act, v, label, on) => `<button class="chip ${on ? 'on' : ''}" data-act="${act}" data-v="${esc(v)}" aria-pressed="${on}">${esc(label)}</button>`;
  const books = [chip('quizBook', '', t('allBooks'), !q.book), ...P.QUIZ_BOOKS.map((b) => chip('quizBook', b, bookName(b), q.book === b))].join('');
  const levels = P.LEVELS.map((l) => chip('level', l, t('lv_' + l), q.level === l)).join('');
  const note = game.id === 'bk' ? t('bkAllBooks') : q.book ? t('onlyBook', { b: bookName(q.book) }) : t('lvHint_' + q.level);
  return `<div class="card col" style="gap:12px"><span class="lbl">${t('quizBook')}</span><div class="seg" role="group" aria-label="${t('quizBook')}">${books}</div><span class="lbl">${t('difficulty')}</span><div class="seg" role="group" aria-label="${t('difficulty')}">${levels}</div><span class="small muted">${esc(note)}${q.book && game.id !== 'bk' ? ' ' + esc(t('lvHint_' + q.level)) : ''}</span></div>`;
}

function hostLobby() {
  const r = S.room, meta = r.meta, list = playerList();
  const game = L.gameById(meta.game || 'vs'), set = settingsFor(game.id), opts = L.SETTINGS[game.id];
  const roster = list.length
    ? `<div class="roster">${list.map((p) => `<div class="pl">${avatar(p)}<span class="pl-n">${esc(p.name)}</span><span class="pl-s">${p.bot ? t('bot') : p.online === false ? t('away') : p.ready ? t('ready') : ''}</span></div>`).join('')}</div>`
    : `<p class="small muted" style="margin:0">${t('waitingPlayersHint')}</p>`;
  const nBots = list.filter((p) => p.bot).length;
  const botRow = `<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn btn-s btn-sm" data-act="addBot" ${list.length >= L.MAX_PLAYERS ? 'disabled' : ''}>${t('addBot')}</button>${nBots ? `<button class="btn btn-s btn-sm" data-act="removeBots">${nBots === 1 ? t('removeBot') : t('removeBots')}</button>` : ''}</div>`;
  const tiles = L.GAMES.map((g) => g.ready
    ? `<button class="gtile jf c-${g.c} ${g.id === game.id ? 'is-sel' : ''}" data-act="pick" data-g="${g.id}" aria-pressed="${g.id === game.id}"><span class="gn"><span>${g.n}</span><span>${esc(gMode(g))}</span></span><span class="gs">${esc(g.sym)}</span><span class="gname">${esc(gName(g))}</span></button>`
    : `<button class="gtile jf c-${g.c}" disabled aria-label="${esc(t('comingSoon', { g: gName(g) }))}"><span class="gn"><span>${g.n}</span><span>${t('soon')}</span></span><span class="gs">${esc(g.sym)}</span><span class="gname">${esc(gName(g))}</span></button>`).join('');
  const seg = (k, vals, unit) => `<div class="seg" role="group" aria-label="${k}">${vals.map((v) => `<button class="chip ${set[k] === v ? 'on' : ''}" data-act="set" data-k="${k}" data-v="${v}" aria-pressed="${set[k] === v}">${v}${unit}</button>`).join('')}</div>`;
  const secs = [
    ['top', `<div class="card col" style="gap:14px"><div class="row between"><div class="col"><span class="lbl">${t('roomCode')}</span><span class="code">${esc(S.code)}</span></div><div class="row" style="gap:6px">${iconBtn('share', 'share', t('shareInvite'))}${iconBtn('qr', 'qr', t('showQr'))}${iconBtn('menu', 'menu', t('settings'))}</div></div>${roster}${botRow}</div>`],
    ['glbl', `<div class="row between"><h2 class="title sm">${t('pickGame')}</h2><span class="small muted">${list.length === 1 ? t('onePlayer') : t('nPlayers', { n: list.length })}</span></div>`],
    ['grid', `<div class="win"><div class="grid3">${tiles}</div></div>`],
    ['set', `<div class="card col" style="gap:12px"><span class="card-title">${esc(gName(game))}</span><span class="small">${esc(gHow(game))}</span><span class="lbl">${game.id === 'tr' ? t('questions') : game.id === 'hu' ? t('turns') : t('rounds')}</span>${seg('rounds', opts.rounds, '')}<span class="lbl">${t('secsEach')}</span>${seg('secs', opts.secs, kn() ? ' ಸೆ' : 's')}</div>`],
    ['quiz', quizCard(meta, game)]
  ];
  if (game.teams) {
    const col = (tc) => {
      const ps = list.filter((p) => p.team === tc);
      return `<div class="team-col jf c-${tc === 'ruby' ? 'ruby' : 'sapphire'}"><span class="team-n">${teamName(tc)}</span>${ps.length ? ps.map((p) => `<span class="small">${esc(p.name)}</span>`).join('') : `<span class="small">${t('noOneYet')}</span>`}</div>`;
    };
    secs.push(['teams', `<div class="col" style="gap:10px"><div class="row between"><span class="lbl">${t('teams')}</span><button class="btn btn-s btn-sm" data-act="shuffleTeams" ${list.length < 2 ? 'disabled' : ''}>${t('shuffleTeams')}</button></div><div class="grid2">${col('ruby')}${col('sapphire')}</div><p class="small muted" style="margin:0">${t('switchOwn')}</p></div>`]);
  }
  const hp = !!meta.hostPlays;
  secs.push(['hostplay', `<div class="card col" style="gap:10px"><div class="row between"><div class="col"><span class="card-title">${t('playAsWell')}</span><span class="small muted">${hp ? t('hpOn') : t('hpOff')}</span></div><button class="switch ${hp ? 'on' : ''}" data-act="hostPlays" role="switch" aria-checked="${hp}" aria-label="${t('playAsWell')}"><span></span></button></div>${hp ? `<div class="row" style="gap:10px"><label class="lbl" for="hostName">${t('yourName')}</label><input id="hostName" class="field" data-draft="name" maxlength="16" autocomplete="nickname" style="min-height:48px"></div>` : ''}</div>`]);
  const closeLbl = Date.now() - S.confirmClose < 4000 ? t('tapClose') : t('closeRoom');
  secs.push(['start', `<button class="btn btn-p" data-act="start" ${list.length ? '' : 'disabled'}>${list.length ? t('startG', { g: esc(gName(game)) }) : t('waitingPlayers')}</button><button class="btn btn-s" data-act="closeRoom">${closeLbl}</button>`]);
  return { cls: '', secs };
}

const quizTag = (rd) => [rd.book && rd.game !== 'bk' ? bookName(rd.book) : '', t('lv_' + (rd.level || 'm'))].filter(Boolean).join(' · ');
function introSecs(rd, forPlayer) {
  const g = L.gameById(rd.game);
  let extra = '';
  if (forPlayer && g.teams) {
    const me = players()[S.net.uid] || {};
    extra = `<div class="team jf c-${me.team === 'sapphire' ? 'sapphire' : 'ruby'}"><span class="team-n">${t('youreOn')}</span><span class="team-s sm">${teamName(me.team === 'sapphire' ? 'sapphire' : 'ruby')}</span></div>`;
  }
  return [
    ['h', head(esc(gName(g)), (forPlayer ? t('getReady') : t(['tr', 'fv', 'tt'].includes(g.id) ? 'nQs' : 'nRounds', { n: rd.n, s: rd.secs })) + ' · ' + esc(quizTag(rd)))],
    ['intro', `<div class="card col" style="gap:12px;align-items:center;text-align:center"><span class="lbl">${t('startingIn')}</span><span class="big count" data-ends="${rd.endsAt}">${L.secondsLeft(rd.endsAt, S.net ? S.net.now() : Date.now())}</span><span class="small">${esc(gHow(g))}</span></div>${extra}`]
  ];
}

function hostControls(rd) {
  if (rd.phase === 'play') return ['ctl', `<div class="grow"></div><div class="pair"><button class="btn btn-s" data-act="endGame">${t('endGame')}</button><button class="btn btn-p" data-act="skip">${t('revealNow')}</button></div>`];
  if (rd.phase === 'reveal') return ['ctl', `<div class="grow"></div><div class="row between"><span class="lbl">${rd.i + 1 < rd.n ? t('nextIn') : t('resultsIn')}</span><span class="tpill" data-ends="${rd.endsAt}">${clockNow(rd.endsAt)}</span></div><div class="pair"><button class="btn btn-s" data-act="endGame">${t('endGame')}</button><button class="btn btn-p" data-act="nextNow">${rd.i + 1 < rd.n ? t('nextNow') : t('seeResults')}</button></div>`];
  return ['ctl', `<div class="grow"></div><button class="btn btn-s" data-act="endGame">${t('endGame')}</button>`];
}

const OPT_C = ['ruby', 'sapphire', 'emerald', 'amber', 'teal'];
const LETTERS = 'ABCDE';
const itemOf = (rd) => rd.seq[rd.i];
const roundOf = (rd) => t(['tr', 'fv', 'tt'].includes(rd.game) ? 'qOf' : rd.game === 'hu' ? 'tOf' : 'rOf', { i: rd.i + 1, n: rd.n });
const countIn = (ans) => Object.values(ans).filter((a) => typeof a.a === 'number').length;
const answeredRow = (ans, label = t('answersIn')) => `<div class="row between"><span class="lbl">${label}</span><span class="small">${t('xOfY', { a: countIn(ans), b: activeUids().length })}</span></div>`;
const teamTotals = (rd) => ({ ruby: ((rd.teamPts || {}).ruby) || 0, sapphire: ((rd.teamPts || {}).sapphire) || 0 });
const teamCards = (a, b, label) => `<div class="grid2"><div class="team jf c-ruby"><span class="team-n">${teamName('ruby')}</span><span class="team-s">${a}</span></div><div class="team jf c-sapphire"><span class="team-n">${teamName('sapphire')}</span><span class="team-s">${b}</span></div></div>${label ? `<span class="small muted">${label}</span>` : ''}`;

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
    if (insertAt === k) rows.push(`<div class="ev is-new"><span class="ev-n">${esc(C().TIMELINE[card][0])}</span><span class="ev-r">${esc(C().TIMELINE[card][1])}</span></div>`);
    rows.push(`<div class="ev"><span class="ev-n">${esc(C().TIMELINE[ix][0])}</span><span class="ev-r">${esc(C().TIMELINE[ix][1])}</span></div>`);
  });
  if (gapLabels) rows.push(`<div class="gapmark">${anchors.length + 1}</div>`);
  if (insertAt === anchors.length) rows.push(`<div class="ev is-new"><span class="ev-n">${esc(C().TIMELINE[card][0])}</span><span class="ev-r">${esc(C().TIMELINE[card][1])}</span></div>`);
  return `<div class="col tline" style="gap:6px">${rows.join('')}</div>`;
}
/** `show` reveals every letter; `markMissed` colours the letters this player didn't find. */
function hangSlots(word, guessed, show, markMissed) {
  const gs = G.hangGuessList(guessed);
  return `<div class="hang ${G.isKannada(word) ? 'hang-kn' : ''}" aria-label="${t('hiddenWord')}">${G.hangTokens(word).map((w) => `<span class="hang-w">${w.map((c) => `<span class="hang-c ${gs.includes(c) ? 'on' : show && markMissed ? 'missed' : ''}">${gs.includes(c) || show ? c : ''}</span>`).join('')}</span>`).join('')}</div>`;
}
const mw = () => G.livesFor(((S.room || {}).round || {}).level);
const lives = (wrong) => `<div class="lives" role="img" aria-label="${t('livesLeft', { a: mw() - wrong, b: mw() })}">${[...Array(mw()).keys()].map((k) => `<span class="life ${k < mw() - wrong ? 'on' : ''}"></span>`).join('')}</div>`;

/* ----- Heads Up ----- */
const huState = (rd) => { const d = rd.data || {}, a = (((S.room.answers || {})[rd.i]) || {})[d.guesser] || {}; return { d, k: a.k || 0, got: a.got || [], pass: a.pass || 0 }; };
function huCardList(rd) {
  const h = huState(rd);
  if (!h.k) return `<p class="muted" style="margin:0">${t('huNone')}</p>`;
  return `<div class="list">${h.d.cards.slice(0, h.k).map((c, j) => `<div class="li ${h.got.includes(j) ? 'is-done' : ''}"><span class="grow li-name">${esc(G.huWord(c))}</span><span class="li-det">${h.got.includes(j) ? '✓ ' + t('huGot') : t('huPassed')}</span></div>`).join('')}</div>`;
}
function huTeamBar(rd) {
  const tt = teamTotals(rd), h = huState(rd), live = rd.phase === 'play' ? h.got.length * 100 : 0;
  const add = (tc) => (h.d.team === tc ? live : 0);
  return `<div class="grid2"><div class="team-col jf c-ruby"><span class="team-n">${teamName('ruby')}</span><span class="title md">${tt.ruby + add('ruby')}</span></div><div class="team-col jf c-sapphire"><span class="team-n">${teamName('sapphire')}</span><span class="title md">${tt.sapphire + add('sapphire')}</span></div></div>`;
}
function huTable(rd, reveal) {
  const h = huState(rd), p = players()[h.d.guesser] || {};
  const secs = [['who', `<div class="card col" style="gap:10px;align-items:center;text-align:center">${avatar(p, 'lg')}<span class="title md">${esc(t('huGuessing', { n: p.name || t('someone') }))}</span><span class="small muted">${teamName(h.d.team)} · ${t('huCorrectN', { n: h.got.length })}</span></div>`]];
  secs.push(['teams', huTeamBar(rd)]);
  if (reveal) secs.push(['cards', `<div class="card col" style="gap:8px"><span class="lbl">${t('huWords')}</span>${huCardList(rd)}</div>`]);
  return secs;
}

/* ----- Bible Wordle ----- */
function wdGrid(rows, cur, answer, live) {
  const n = answer.length, out = [];
  for (let r = 0; r < G.WD_TRIES; r++) {
    let cells;
    if (r < rows.length) { const sc = G.wdScore(rows[r], answer); cells = rows[r].map((c, i) => `<span class="wd-t ${sc[i]}" aria-label="${esc(c)} ${t(sc[i] === 'g' ? 'wdRight' : sc[i] === 'y' ? 'wdIn' : 'wdNot')}">${esc(c)}</span>`); }
    else if (r === rows.length && live) cells = [...Array(n).keys()].map((i) => `<span class="wd-t ${cur[i] ? 'typed' : ''} ${i === cur.length ? 'next' : ''}">${esc(cur[i] || '')}</span>`);
    else cells = [...Array(n).keys()].map(() => '<span class="wd-t"></span>');
    out.push(`<div class="wd-row">${cells.join('')}</div>`);
  }
  return `<div class="wd-grid ${G.isKannada(answer.join('')) ? 'wd-kn' : ''}" style="--n:${n}">${out.join('')}</div>`;
}
const wdMini = (r) => `<span class="wd-mini">${String(r || '').split('').map((c) => `<i class="${c}"></i>`).join('')}</span>`;
function wdKeyboard(item, rows, answer) {
  const st = G.wdKeyState(rows, answer), key = (c) => `<button class="hkey wd-k ${st[c] || ''}" data-act="wdKey" data-c="${esc(c)}">${esc(c)}</button>`;
  const enter = `<button class="hkey wd-k wd-wide" data-act="wdEnter">${t('wdEnter')}</button>`;
  const del = `<button class="hkey wd-k wd-wide" data-act="wdDel" aria-label="${t('wdDelete')}">⌫</button>`;
  if (!G.isKannada(answer.join(''))) {
    const r = G.WD_ROWS_EN;
    return `<div class="wd-kb"><div class="wd-kr">${r[0].split('').map(key).join('')}</div><div class="wd-kr wd-kr2">${r[1].split('').map(key).join('')}</div><div class="wd-kr">${enter}${r[2].split('').map(key).join('')}${del}</div></div>`;
  }
  return `<div class="wd-kb"><div class="hkeys hkeys-kn">${G.wdKeys(item).map(key).join('')}</div><div class="wd-kr">${del}${enter}</div></div>`;
}

function hostPlay() {
  const rd = S.room.round;
  if (!rd) return { cls: '', secs: [['wait', `<p class="muted">${t('setting')}</p>`]] };
  if (rd.phase === 'intro') return { cls: '', secs: introSecs(rd, false).concat([hostControls(rd)]) };
  const ans = ((S.room.answers || {})[rd.i]) || {};
  const g = L.gameById(rd.game), item = itemOf(rd), data = rd.data || {};
  const reveal = rd.phase === 'reveal';
  const secs = [['h', head(esc(gName(g)), roundOf(rd), reveal ? null : rd.endsAt)]];
  const list = playerList();
  const res = { first: null, ...(rd.res || {}), pts: (rd.res && rd.res.pts) || {}, order: (rd.res && rd.res.order) || [] }; // the database drops empty lists
  const firstNote = (ok, title, body) => secs.push(['rn', ok ? note(true, title, body) : note(false, t('noOne'), body)]);

  if (rd.game === 'vs') {
    const v = C().VERSES[item];
    if (!reveal) {
      secs.push(['card', `<div class="card col"><span class="lbl">${t('rebuild')}</span><span class="title md">${esc(v.ref)}</span><span class="small">${t('piecesFast', { n: v.parts.length })}</span></div>`]);
      const rows = list.map((p) => { const a = ans[p.uid] || {}; return { p, done: !!a.ok, ms: a.ms, pct: a.ok ? 100 : Math.min(95, Math.round(((a.placed || 0) / v.parts.length) * 100)), status: a.ok ? t('doneT', { t: fmtT(a.ms) }) : a.placed ? t('placing') : t('thinking') }; })
        .sort((x, y) => (y.done ? 1e9 - y.ms : y.pct) - (x.done ? 1e9 - x.ms : x.pct));
      secs.push(['race', raceRows(rows)]);
    } else {
      secs.push(['card', `<div class="card col" style="gap:8px"><span class="lbl">${esc(v.ref)}</span><span class="verse">${esc(v.parts.join(' '))}</span></div>`]);
      secs.push(['res', resultList(res.order, (uid) => t('doneT', { t: fmtT((ans[uid] || {}).ms || 0) }), res.pts)]);
    }
  }

  if (rd.game === 'tr') {
    const q = C().TRIVIA[item], opts = G.options('tr', item, data), right = G.correctOption('tr', item, data);
    const cc = L.countClaims(rd.claims || {});
    secs.push(['teams', teamCards(cc.ruby, cc.sapphire)]);
    secs.push(['q', `<div class="card"><span class="title md" style="line-height:1.25">${esc(q.q)}</span></div>`]);
    secs.push(['opts', optRows(opts, right, reveal, ans, false)]);
    if (reveal) {
      const tm = res.first ? (players()[res.first] || {}).team || 'ruby' : null;
      const won = L.tribesFor(rd.i, rd.n).map((x) => C().TRIBES[x]).join(t('and'));
      firstNote(!!res.first, t('wasFirst', { n: esc(pName(res.first)) }), res.first ? t('claims', { team: teamName(tm), won: esc(won), ref: esc(q.ref) }) : t('answerWas', { a: esc(opts[right]), ref: esc(q.ref) }));
    } else secs.push(['cnt', answeredRow(ans)]);
    const claims = rd.claims || {}, fresh = reveal && res.first ? L.tribesFor(rd.i, rd.n) : [];
    secs.push(['map', `<span class="lbl">${t('landNS')}</span><div class="win"><div class="grid3">${C().TRIBES.map((name, i) => { const c = claims[i]; return `<div class="trb ${c ? 'jf c-' + c : 'open'} ${fresh.includes(i) ? 'is-new' : ''}"><span class="trb-n">${name}</span><span class="trb-o">${c ? teamName(c) : t('open')}</span></div>`; }).join('')}</div></div>`]);
  }

  if (rd.game === 'fv') {
    const v = C().VERSES[item], [start] = G.verseHalves(v), opts = G.options('fv', item, data), right = G.correctOption('fv', item, data);
    const tt = teamTotals(rd);
    secs.push(['teams', teamCards(tt.ruby, tt.sapphire)]);
    secs.push(['q', reveal
      ? `<div class="card col" style="gap:8px"><span class="lbl">${esc(v.ref)}</span><span class="verse">${esc(v.parts.join(' '))}</span></div>`
      : `<div class="card col" style="gap:8px"><span class="lbl">${t('finishVerse', { ref: esc(v.ref) })}</span><span class="verse">${esc(start)} …</span></div>`]);
    if (reveal) {
      const tm = res.first ? (players()[res.first] || {}).team || 'ruby' : null;
      firstNote(!!res.first, t('wasFirst', { n: esc(pName(res.first)) }), res.first ? t('bonusTo', { team: teamName(tm), l: LETTERS[right] }) : t('answerWasL', { l: LETTERS[right] }));
      if (res.order.length) secs.push(['res', resultList(res.order, (uid) => teamName((players()[uid] || {}).team === 'sapphire' ? 'sapphire' : 'ruby'), res.pts)]);
    } else {
      secs.push(['opts', optRows(opts, right, false, ans, false, true)]);
      secs.push(['cnt', answeredRow(ans)]);
    }
  }

  if (rd.game === 'tt') {
    const x = C().TWO_TRUTHS[item], opts = G.options('tt', item, data), right = G.correctOption('tt', item, data);
    secs.push(['who', `<div class="card col" style="align-items:center;text-align:center"><span class="lbl">${t('aboutWho')}</span><span class="title lg glitch">${esc(x.who)}</span></div>`]);
    secs.push(['opts', optRows(opts, right, reveal, ans, reveal)]);
    if (reveal) {
      const refs = data.opt.map((k) => (k < 2 ? x.t[k][1] : null));
      secs.push(['refs', `<div class="col" style="gap:4px">${refs.map((r, i) => (r ? `<span class="small muted">${t('isTrue', { l: LETTERS[i], ref: esc(r) })}</span>` : '')).join('')}</div>`]);
      secs.push(['rn', note(true, t('wasLie', { l: LETTERS[right] }), esc(x.lie[1]))]);
      secs.push(['res', `<span class="lbl">${t('spotted')}</span>${resultList(res.order, (uid, i) => `${i === 0 ? t('first') : ord(i + 1)} · ${fmtT(Math.max(0, ((ans[uid] || {}).at || rd.startedAt) - rd.startedAt))}`, res.pts)}`]);
    } else secs.push(['cnt', answeredRow(ans, t('votesIn'))]);
  }

  if (rd.game === 'tl') {
    const right = G.correctOption('tl', item, data);
    secs.push(['card', `<div class="card col" style="gap:6px"><span class="lbl">${t('whereGo')}</span><span class="title md">${esc(C().TIMELINE[item][0])}</span><span class="det small muted">${reveal ? esc(C().TIMELINE[item][1]) : t('pickGap')}</span></div>`]);
    secs.push(['line', timelineLine(data.anchors, item, reveal ? right : -1, !reveal)]);
    if (reveal) firstNote(!!res.first, t('wasFirst', { n: esc(pName(res.first)) }), res.first ? t('placedRight', { n: res.order.length, g: right + 1 }) : t('goesGap', { g: right + 1 }));
    else secs.push(['cnt', answeredRow(ans)]);
  }

  if (rd.game === 'hu') huTable(rd, reveal).forEach((x) => secs.push(x));

  if (rd.game === 'wd') {
    const answer = G.wdTiles(G.wdWord(item));
    if (reveal) secs.push(['card', `<div class="card col" style="gap:10px;align-items:center"><span class="lbl">${t('theWord')}</span><div class="wd-row wd-big" style="--n:${answer.length}">${answer.map((c) => `<span class="wd-t g">${esc(c)}</span>`).join('')}</div></div>`]);
    else secs.push(['card', `<div class="card col" style="gap:8px;align-items:center;text-align:center"><span class="card-title">${t('wdGuessing')}</span><span class="small muted">${t('wdTries', { n: G.WD_TRIES })}</span></div>`]);
    const rows = list.map((p) => { const a = ans[p.uid] || {}, rs = a.r || [], k = a.n || rs.length;
      return { p, done: !!a.ok, ms: a.ms || 0, k, pct: a.ok ? 100 : Math.round((k / G.WD_TRIES) * 100),
        status: (a.ok ? t('wdSolvedN', { n: k, t: fmtT(a.ms || 0) }) : a.out ? t('outT') : k ? t('wdGuessN', { n: k, m: G.WD_TRIES }) : t('thinking')) + (rs.length ? ' ' + wdMini(rs[rs.length - 1]) : '') }; })
      .sort((x, y) => (y.done ? 1e9 - y.k * 1e7 - y.ms : y.k) - (x.done ? 1e9 - x.k * 1e7 - x.ms : x.k));
    secs.push(['race', reveal ? resultList(res.order, (uid) => t('wdSolvedN', { n: (ans[uid] || {}).n || 0, t: fmtT((ans[uid] || {}).ms || 0) }), res.pts) : raceRows(rows)]);
  }

  if (rd.game === 'hg') {
    const [word, cat] = C().HANGMAN[item], total = G.hangLetters(word);
    secs.push(['card', `<div class="card col" style="gap:12px;align-items:center;text-align:center"><span class="cat-badge">${esc(cat)}</span><span class="small muted">${t('nLetters', { n: G.hangTokens(word).flat().length })}${word.includes(' ') ? t('nWords', { n: word.split(' ').length }) : ''}</span>${hangSlots(word, '', reveal)}</div>`]);
    // Players report found/total/wrong themselves, because their phone may show the word in another language.
    const rows = list.map((p) => { const a = ans[p.uid] || {}; const gs = a.g || '';
      const wrong = typeof a.w === 'number' ? a.w : G.hangWrong(word, gs), pct = a.t ? (a.f || 0) / a.t : G.hangFound(word, gs) / total;
      return { p, done: !!a.ok, ms: a.ms || 0, pct: Math.round(pct * 100), status: a.ok ? t('solvedT', { t: fmtT(a.ms) }) : a.out ? t('outT') : t('livesN', { n: Math.max(0, mw() - wrong) }) }; })
      .sort((x, y) => (y.done ? 1e9 - y.ms : y.pct) - (x.done ? 1e9 - x.ms : x.pct));
    secs.push(['race', reveal ? resultList(res.order, (uid) => t('solvedT', { t: fmtT((ans[uid] || {}).ms || 0) }), res.pts) : raceRows(rows)]);
  }

  if (rd.game === 'bk') {
    const books = data.set.map((b) => C().BOOKS[b]);
    if (!reveal) {
      secs.push(['card', `<div class="card col" style="gap:8px"><span class="lbl">${t('putOrder')}</span><span class="small">${data.order.map((k) => esc(C().BOOKS[data.set[k]])).join(' · ')}</span></div>`]);
      const rows = list.map((p) => { const a = ans[p.uid] || {}; return { p, done: !!a.ok, ms: a.ms || 0, status: a.ok ? t('doneT', { t: fmtT(a.ms) }) : a.checks ? t('checkedN', { n: a.checks }) : t('sorting') }; })
        .sort((x, y) => (y.done ? 1e9 - y.ms : 0) - (x.done ? 1e9 - x.ms : 0));
      secs.push(['race', raceRows(rows)]);
    } else {
      secs.push(['card', `<div class="card col" style="gap:4px"><span class="lbl">${t('bibleOrder')}</span>${books.map((b, i) => `<span class="li-name">${L.roman(i + 1)}. ${esc(b)}</span>`).join('')}</div>`]);
      secs.push(['res', resultList(res.order, (uid) => t('doneT', { t: fmtT((ans[uid] || {}).ms || 0) }), res.pts)]);
    }
  }

  if (rd.game === 'em') {
    const e = C().EMOJI[item];
    if (!reveal) {
      const solved = L.scoreEmoji(ans).order;
      secs.push(['card', `<div class="card col" style="align-items:center;text-align:center;gap:6px"><span class="lbl">${t('whichStory')}</span><span class="emoji" role="img" aria-label="${t('emojiClue')}">${e.e}</span></div>`]);
      secs.push(['solved', `<div class="row between"><span class="lbl">${t('solvedL')}</span><span class="small">${t('xOfY', { a: solved.length, b: activeUids().length })}</span></div>${solved.length ? `<div class="list">${solved.map((uid, i) => { const p = players()[uid] || {}; return `<div class="li c-${esc(p.color)} is-done">${markers(i)}${avatar(p, 'sm')}<span class="li-name grow">${esc(p.name)}</span><span class="li-det">${ord(i + 1)}</span></div>`; }).join('')}</div>` : `<p class="small muted" style="margin:0">${t('noOneYetAns')}</p>`}`]);
    } else {
      secs.push(['card', `<div class="card col" style="align-items:center;text-align:center;gap:6px"><span class="emoji" aria-hidden="true">${e.e}</span><span class="title md">${esc(e.a)}</span><span class="det small muted">${esc(e.ref)}</span></div>`]);
      secs.push(['res', resultList(res.order, (uid, i) => ord(i + 1), res.pts)]);
    }
  }
  secs.push(hostControls(rd));
  return { cls: '', secs };
}

function resultList(order, detFn, pts) {
  if (!order || !order.length) return `<p class="muted" style="margin:0">${t('noOneThis')}</p>`;
  return `<div class="list">${order.map((uid, i) => { const p = players()[uid] || {}; return `<div class="li c-${esc(p.color)} is-done">${markers(i)}${avatar(p, 'sm')}<div class="grow col"><span class="li-name">${esc(p.name)}</span><span class="li-det">${detFn(uid, i)}</span></div><span class="li-name">+${pts[uid] || 0}</span></div>`; }).join('')}</div>`;
}

function podiumHtml(rows) {
  const slots = [[1, 120], [0, 160], [2, 92]].filter(([i]) => rows[i]);
  return `<div class="podium">${slots.map(([i, h]) => { const p = rows[i]; return `<div class="pod-col">${avatar(p)}<span class="li-name">${esc(p.name)}</span><div class="pod jf c-${esc(p.color)}" style="height:${h}px">${i + 1}</div></div>`; }).join('')}</div>`;
}

function teamLine(a, b, what) {
  if (a === b) return t('level', { a, b, w: what });
  return t('wins', { team: teamName(a > b ? 'ruby' : 'sapphire'), a: Math.max(a, b), b: Math.min(a, b), w: what });
}
/** Points a player won in each round, and how many rounds they were first in. */
function breakdown(uid, rd) {
  const hist = rd.hist || {}, n = rd.n || 0, cells = [];
  let firsts = 0, scored = 0;
  for (let i = 0; i < n; i++) {
    const h = hist[i], played = !!h, pts = (h && h.p && h.p[uid]) || 0, first = !!h && h.f === uid;
    if (first) firsts++;
    if (pts) scored++;
    cells.push({ pts, first, played });
  }
  return { cells, firsts, scored, played: cells.filter((c) => c.played).length };
}
function strip(b) {
  return `<span class="strip" aria-hidden="true">${b.cells.map((c) => `<span class="rc ${c.first ? 'first' : ''} ${c.played ? '' : 'skip'}" style="--h:${c.first ? 100 : c.pts >= 200 ? 66 : c.pts ? 40 : 12}%"></span>`).join('')}</span>`;
}
const ruleLine = (rd) => `<p class="small muted" style="margin:0">${t(['vs', 'bk', 'hg', 'em', 'wd'].includes(rd.game) ? 'ruleRank' : 'ruleTrivia')}</p>`;

function hostResults() {
  const rows = L.standings(players());
  const rd = S.room.round || {};
  const top = rows[0];
  const line = top ? t('takesIt', { n: esc(top.name) }) : t('gameOver');
  let sub = '';
  if (rd.game === 'tr') { const cc = L.countClaims(rd.claims); sub = teamLine(cc.ruby, cc.sapphire, t('inTribes')); }
  if (rd.game === 'fv' || rd.game === 'hu') { const tt = teamTotals(rd); sub = teamLine(tt.ruby, tt.sapphire, t('inPoints')); }
  return {
    cls: '',
    secs: [
      ['h', `<div class="col center"><span class="lbl">${t('tonight')}</span><h1 class="title lg glitch">${line}</h1>${sub ? `<span class="small muted">${sub}</span>` : ''}</div><div class="hazard only-cyber" aria-hidden="true"></div>`],
      ['pod', podiumHtml(rows)],
      ['board', `<div class="card list"><span class="lbl">${t('byRound')}</span>${rows.map((p, i) => { const b = breakdown(p.uid, rd);
        return `<div class="li c-${esc(p.color)}">${markers(i)}${avatar(p, 'xs')}<span class="col grow" style="gap:3px;min-width:0"><span class="li-name">${esc(p.name)}</span><span class="small muted">${t('nFirsts', { n: b.firsts })} · ${t('roundsOf', { a: b.scored, b: b.played })}</span>${strip(b)}</span><span class="li-det strong">${p.score}</span></div>`; }).join('')}${ruleLine(rd)}</div>`],
      ['ctl', `<div class="grow"></div><div class="pair"><button class="btn btn-s" data-act="toLobby">${t('anotherGame')}</button><button class="btn btn-p" data-act="again">${t('playAgain')}</button></div>`]
    ]
  };
}

/* ----- Player screens ----- */
function playerWait() {
  const meta = S.room.meta, me = players()[S.net.uid];
  const g = L.gameById(meta.game || 'vs');
  const secs = [
    ['pill', `<div class="row between"><div class="pill">${t('room')} <span class="accent">${esc(S.code)}</span> · ${playerList().length === 1 ? t('onePlayer') : t('nPlayers', { n: playerList().length })}</div>${iconBtn('menu', 'menu', t('menuLeave'))}</div>`],
    ['me', `<div class="grow col" style="align-items:center;justify-content:center;gap:16px;text-align:center">${avatar(me, 'lg')}<h1 class="title lg glitch">${t('youreIn')}</h1><span class="muted">${t('choosing')}</span></div>`],
    ['next', `<div class="card row" style="gap:14px"><div class="tile jf c-${g.c} tile-lg" aria-hidden="true">${esc(g.sym)}</div><div class="col"><span class="lbl">${t('upNext')}</span><span class="card-title">${esc(gName(g))}</span><span class="det small muted">${esc(gMode(g))}</span></div></div>`]
  ];
  if (g.teams) secs.push(['team', `<div class="team jf c-${me.team === 'sapphire' ? 'sapphire' : 'ruby'}"><span class="team-n">${teamName(me.team === 'sapphire' ? 'sapphire' : 'ruby')}</span><button class="btn btn-s btn-sm" data-act="switchTeam">${t('switchTeam')}</button></div>`]);
  secs.push(['ready', `<button class="btn ${me.ready ? 'btn-s' : 'btn-p'}" data-act="ready" aria-pressed="${!!me.ready}">${me.ready ? t('readyWaiting') : t('imReady')}</button>`]);
  return { cls: '', secs };
}

function ensureLocal(rd) {
  const key = `${rd.game}:${rd.i}:${rd.startedAt || 0}`;
  if (S.local && S.local.key === key) return S.local;
  const mine = (((S.room.answers || {})[rd.i]) || {})[S.net.uid] || {};
  S.local = { key, placed: [], wrong: 0, done: !!mine.ok, ms: mine.ms || 0, guessWrong: false, tries: 0,
    guessed: mine.g || '', arr: [...Array(G.BOOK_SET).keys()], sel: null, bkMiss: null,
    wrows: (mine.gs || []).map((x) => x.split('|')), wcur: [], wmsg: '' };
  if (rd.game === 'vs' && mine.ok) S.local.placed = C().VERSES[itemOf(rd)].parts.map((_, i) => i);
  if (rd.game === 'bk' && mine.ok && rd.data) S.local.arr = [...Array(G.BOOK_SET).keys()].sort((a, b) => rd.data.order[a] - rd.data.order[b]);
  S.drafts.guess = '';
  S.clearGuess = true;
  return S.local;
}

function playerPlay() {
  const rd = S.room.round;
  if (!rd) return { cls: '', secs: [['wait', `<p class="muted">${t('gettingReady')}</p>`]] };
  if (rd.phase === 'intro') return { cls: '', secs: introSecs(rd, true) };
  const uid = S.net.uid, me = players()[uid] || {};
  const ans = ((S.room.answers || {})[rd.i]) || {}, mine = ans[uid] || {};
  const loc = ensureLocal(rd);
  const res = { first: null, ...(rd.res || {}), pts: (rd.res && rd.res.pts) || {}, order: (rd.res && rd.res.order) || [] }; // the database drops empty lists
  const myPts = res.pts[uid] || 0;
  const det = roundOf(rd);
  const g = L.gameById(rd.game), item = itemOf(rd), data = rd.data || {};
  const reveal = rd.phase === 'reveal';
  const picked = typeof mine.a === 'number' ? mine.a : null;
  const team = me.team === 'sapphire' ? 'sapphire' : 'ruby';
  const secs = [];
  const choiceResult = (right, okBody, badBody) => {
    if (picked === right) secs.push(['n', note(true, res.first === uid ? t('firstRight', { p: myPts }) : t('rightP', { p: myPts }), okBody)]);
    else secs.push(['n', note(false, picked === null ? t('outOfTime') : t('notThisTime'), badBody)]);
  };

  if (rd.game === 'vs') {
    const v = C().VERSES[item], n = v.parts.length;
    if (!reveal) {
      secs.push(['h', head(esc(v.ref), `${esc(gName(g))} · ${det}`, rd.endsAt, 'tpill')]);
      secs.push(['lbl', `<span class="lbl">${loc.done ? t('lockedIn') : data.dk ? t('tapInOrderDecoy') : t('tapInOrder')}</span>`]);
      const placed = loc.placed.map((pi, k) => `<button class="piece placed jf c-${esc(me.color || 'amethyst')}" data-act="unpiece" data-k="${k}" ${loc.done ? 'disabled' : ''}>${esc(G.pieceText(item, data, pi))}</button>`).join('');
      secs.push(['zone', `<div class="zone" aria-label="${t('yourVerse')}">${placed || `<span class="muted">${t('buildsHere')}</span>`}</div>`]);
      const pool = data.order.filter((pi) => !loc.placed.includes(pi)).map((pi) => `<button class="piece" data-act="piece" data-p="${pi}">${esc(G.pieceText(item, data, pi))}</button>`).join('');
      secs.push(['pool', `<div class="pieces">${pool}</div>`]);
      if (loc.done) secs.push(['n', note(true, t('lockedInT', { t: fmtT(loc.ms) }), t('watchTable'))]);
      else if (loc.placed.length === n) secs.push(['n', note(false, t('notQuite'), t('plus3'))]);
      if (!loc.done) secs.push(['clr', `<div class="grow"></div><button class="btn btn-s" data-act="clearPieces" ${loc.placed.length ? '' : 'disabled'}>${t('clearAns')}</button>`]);
    } else {
      secs.push(['h', head(t('roundOver'), `${esc(gName(g))} · ${det}`)]);
      secs.push(['you', myPts ? note(true, `+${myPts} · ${ord(res.order.indexOf(uid) + 1)}`, t('finishedIn', { t: fmtT(mine.ms || loc.ms) })) : note(false, t('noPoints'), t('beQuicker'))]);
      secs.push(['card', `<div class="card col" style="gap:8px"><span class="lbl">${esc(v.ref)}</span><span class="verse">${esc(v.parts.join(' '))}</span></div>`]);
    }
  }

  if (rd.game === 'tr') {
    const q = C().TRIVIA[item], opts = G.options('tr', item, data), right = G.correctOption('tr', item, data);
    secs.push(['team', `<div class="team jf c-${team}"><span class="team-n">${teamName(team)}</span>${reveal ? `<span class="small">${det}</span>` : timer(rd.endsAt, 'tpill')}</div>`]);
    secs.push(['q', `<h1 class="title md" style="line-height:1.2">${esc(q.q)}</h1>`]);
    secs.push(['opts', optButtons(opts, picked, right, reveal, false)]);
    if (reveal) choiceResult(right, res.first === uid ? t('claimedLand', { team: teamName(team), ref: esc(q.ref) }) : esc(q.ref) + '.', t('itWas', { a: esc(opts[right]), ref: esc(q.ref) }));
    else if (picked !== null) secs.push(['n', `<div class="pill" role="status">${t('answerInWait')}</div>`]);
  }

  if (rd.game === 'fv') {
    const v = C().VERSES[item], [start] = G.verseHalves(v), opts = G.options('fv', item, data), right = G.correctOption('fv', item, data);
    secs.push(['team', `<div class="team jf c-${team}"><span class="team-n">${teamName(team)}</span>${reveal ? `<span class="small">${det}</span>` : timer(rd.endsAt, 'tpill')}</div>`]);
    secs.push(['q', `<div class="card col" style="gap:6px"><span class="lbl">${esc(v.ref)}</span><span class="verse">${esc(start)} …</span></div>`]);
    secs.push(['opts', optButtons(opts, picked, right, reveal, false, true)]);
    if (reveal) choiceResult(right, t('pointsFor', { team: teamName(team) }), t('itEnds', { a: esc(opts[right]) }));
    else if (picked !== null) secs.push(['n', `<div class="pill" role="status">${t('answerInWait')}</div>`]);
  }

  if (rd.game === 'tt') {
    const x = C().TWO_TRUTHS[item], opts = G.options('tt', item, data), right = G.correctOption('tt', item, data);
    secs.push(['h', head(esc(x.who), t('spotLie', { d: det }), reveal ? null : rd.endsAt, 'tpill')]);
    secs.push(['opts', optButtons(opts, picked, right, reveal, true)]);
    if (reveal) choiceResult(right, `${typeof mine.at === 'number' ? t('yourTime', { t: fmtT(Math.max(0, mine.at - rd.startedAt)) }) : ''}${esc(x.lie[1])}`, t('lieWas', { l: LETTERS[right], x: esc(x.lie[1]) }));
    else if (picked !== null) secs.push(['n', `<div class="pill" role="status">${t('voteIn')}</div>`]);
    else secs.push(['n', `<span class="lbl">${t('tapLie')}</span>`]);
  }

  if (rd.game === 'tl') {
    const right = G.correctOption('tl', item, data), anchors = data.anchors;
    secs.push(['h', head(t('whereGo'), `${esc(gName(g))} · ${det}`, reveal ? null : rd.endsAt, 'tpill')]);
    secs.push(['card', `<div class="card col" style="gap:4px"><span class="lbl">${t('yourCard')}</span><span class="title md">${esc(C().TIMELINE[item][0])}</span>${reveal ? `<span class="det small muted">${esc(C().TIMELINE[item][1])}</span>` : ''}</div>`]);
    if (reveal) {
      secs.push(['line', timelineLine(anchors, item, right, false)]);
      choiceResult(right, t('gapN', { g: right + 1 }), t('goesGap', { g: right + 1 }));
    } else {
      const rows = [];
      anchors.forEach((ix, k) => {
        rows.push(`<button class="gapbtn ${picked === k ? 'is-sel' : ''}" data-act="answer" data-i="${k}" ${picked !== null ? 'disabled' : ''} aria-pressed="${picked === k}">${picked === k ? t('yourAnswer') : t('placeHere')}</button>`);
        rows.push(`<div class="ev"><span class="ev-n">${esc(C().TIMELINE[ix][0])}</span><span class="ev-r">${esc(C().TIMELINE[ix][1])}</span></div>`);
      });
      const k = anchors.length;
      rows.push(`<button class="gapbtn ${picked === k ? 'is-sel' : ''}" data-act="answer" data-i="${k}" ${picked !== null ? 'disabled' : ''} aria-pressed="${picked === k}">${picked === k ? t('yourAnswer') : t('placeHere')}</button>`);
      secs.push(['line', `<div class="col tline" style="gap:5px">${rows.join('')}</div>`]);
      if (picked !== null) secs.push(['n', `<div class="pill" role="status">${t('answerInWait')}</div>`]);
    }
  }

  if (rd.game === 'hu') {
    const h = huState(rd), p = players()[h.d.guesser] || {}, mineTurn = h.d.guesser === uid;
    const myTeam = me.team === 'sapphire' ? 'sapphire' : 'ruby';
    secs.push(['h', head(esc(gName(g)), det, reveal ? null : rd.endsAt, 'tpill')]);
    if (reveal) {
      secs.push(['n', note(h.got.length > 0, t('huCorrectN', { n: h.got.length }), esc(t('huTurnOf', { n: p.name || t('someone') })))]);
      secs.push(['cards', `<div class="card col" style="gap:8px"><span class="lbl">${t('huWords')}</span>${huCardList(rd)}</div>`]);
    } else if (mineTurn) {
      secs.push(['you', `<div class="card col" style="gap:6px;align-items:center;text-align:center"><span class="title md">${t('huYouGuess')}</span><span class="small muted">${t('huYouHint')}</span><span class="big count">${h.got.length}</span><span class="lbl">${t('huCorrect')}</span></div>`]);
      secs.push(['teams', huTeamBar(rd)]);
      secs.push(['btns', `<div class="grow"></div><div class="hu-btns"><button class="btn btn-s hu-b" data-act="huPass">${t('huPass')}</button><button class="btn btn-p hu-b" data-act="huGot">${t('huGot')}</button></div>`]);
    } else {
      const c = h.d.cards[h.k], [, cat] = c === undefined ? [] : C().HANGMAN[c];
      secs.push(['card', `<div class="card col hu-card" style="gap:10px;align-items:center;text-align:center"><span class="cat-badge">${esc(cat || '')}</span><span class="hu-word">${c === undefined ? '—' : esc(G.huWord(c))}</span><span class="small muted">${t('huCorrectN', { n: h.got.length })}</span></div>`]);
      secs.push(['who', note(myTeam === h.d.team, esc(t(myTeam === h.d.team ? 'huClue' : 'huWatch', { n: p.name || t('someone') })), myTeam === h.d.team ? t('huClueHint') : t('huWatchHint'))]);
    }
    if (reveal || !mineTurn) secs.push(['teams', huTeamBar(rd)]);
  }

  if (rd.game === 'wd') {
    const answer = G.wdTiles(G.wdWord(item)), rows = loc.wrows, last = rows[rows.length - 1] || [];
    const solved = !!mine.ok || last.join('') === answer.join(''), out = !solved && (!!mine.out || rows.length >= G.WD_TRIES);
    const live = !reveal && !solved && !out;
    secs.push(['h', head(esc(gName(g)), det, reveal ? null : rd.endsAt, 'tpill')]);
    secs.push(['grid', wdGrid(rows, loc.wcur, answer, live)]);
    if (reveal) secs.push(['n', myPts ? note(true, `+${myPts} · ${ord(res.order.indexOf(uid) + 1)}`, t('wdSolvedN', { n: rows.length, t: fmtT(mine.ms || 0) })) : note(false, t('noPoints'), t('answerWasW', { w: esc(answer.join('')) }))]);
    else if (solved) secs.push(['n', note(true, t('wdSolvedN', { n: rows.length, t: fmtT(mine.ms || loc.ms) }), t('watchTable'))]);
    else if (out) secs.push(['n', note(false, t('wdOut'), t('itWasW', { w: esc(answer.join('')) }))]);
    if (live) secs.push(['keys', `<div class="grow"></div><p class="small wd-msg" role="status">${esc(loc.wmsg || '')}</p>${wdKeyboard(item, rows, answer)}`]);
  }

  if (rd.game === 'hg') {
    const [word, cat] = C().HANGMAN[item];
    const gs = loc.guessed || mine.g || '';
    const wrong = G.hangWrong(word, gs), solved = !!mine.ok || G.hangSolved(word, gs), out = !solved && (mine.out || wrong >= mw());
    secs.push(['h', head(esc(gName(g)), det, reveal ? null : rd.endsAt, 'tpill')]);
    secs.push(['word', `<div class="card col" style="gap:12px;align-items:center"><span class="cat-badge">${esc(cat)}</span>${hangSlots(word, gs, reveal || out, true)}${lives(Math.min(wrong, mw()))}</div>`]);
    if (reveal) secs.push(['n', myPts ? note(true, `+${myPts} · ${ord(res.order.indexOf(uid) + 1)}`, t('solvedIn', { t: fmtT(mine.ms || 0) })) : note(false, t('noPoints'), t('answerWasW', { w: esc(word) }))]);
    else if (solved) secs.push(['n', note(true, t('solvedT', { t: fmtT(mine.ms || loc.ms) }), t('watchTable'))]);
    else if (out) secs.push(['n', note(false, t('outOfLives'), t('itWasW', { w: esc(word) }))]);
    if (!reveal && !solved && !out) {
      const used = G.hangGuessList(gs), letters = G.hangTokens(word).flat(), knKeys = G.isKannada(word);
      const keys = G.hangKeys(item).map((c) => {
        const u = used.includes(c), hit = u && letters.includes(c);
        return `<button class="hkey ${u ? (hit ? 'hit' : 'miss') : ''}" data-act="letter" data-c="${esc(c)}" ${u ? 'disabled' : ''} aria-label="${esc(c)}${u ? (hit ? t('inWord') : t('notInWord')) : ''}">${esc(c)}</button>`;
      }).join('');
      secs.push(['keys', `<div class="grow"></div><div class="hkeys ${knKeys ? 'hkeys-kn' : ''}">${keys}</div>`]);
    }
  }

  if (rd.game === 'bk') {
    const inPlace = G.booksInPlace(data, loc.arr);
    if (!reveal) {
      secs.push(['h', head(t('bibleOrder'), `${esc(gName(g))} · ${det}`, rd.endsAt, 'tpill')]);
      secs.push(['lbl', `<span class="lbl">${loc.done ? t('lockedIn') : t('dragOrTap')}</span>`]);
      secs.push(['books', `<div class="col bklist" style="gap:8px">${loc.arr.map((p, i) => `<div class="bk c-${esc(me.color || 'amethyst')} ${loc.sel === i ? 'is-sel' : ''} ${loc.done ? 'is-done' : ''}" data-bk="${i}" role="button" tabindex="0" aria-label="${esc(t('position', { b: C().BOOKS[data.set[data.order[p]]], i: i + 1 }))}">${markers(i)}<span class="grow">${esc(C().BOOKS[data.set[data.order[p]]])}</span><svg class="grip" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 9h14M5 15h14"></path></svg></div>`).join('')}</div>`]);
      if (loc.done) secs.push(['n', note(true, t('allSix', { t: fmtT(loc.ms) }), t('watchTable'))]);
      else if (loc.bkMiss !== null) secs.push(['n', note(false, t('nInPlace', { n: loc.bkMiss }), t('plus3b'))]);
      if (!loc.done) secs.push(['chk', `<div class="grow"></div><button class="btn btn-p" data-act="bkCheck">${t('checkOrder')}</button>`]);
    } else {
      secs.push(['h', head(t('roundOver'), `${esc(gName(g))} · ${det}`)]);
      secs.push(['n', myPts ? note(true, `+${myPts} · ${ord(res.order.indexOf(uid) + 1)}`, t('finishedIn', { t: fmtT(mine.ms || loc.ms) })) : note(false, t('noPoints'), t('wereInPlace', { n: inPlace }))]);
      secs.push(['card', `<div class="card col" style="gap:4px"><span class="lbl">${t('bibleOrder')}</span>${data.set.map((b, i) => `<span class="li-name">${L.roman(i + 1)}. ${esc(C().BOOKS[b])}</span>`).join('')}</div>`]);
    }
  }

  if (rd.game === 'em') {
    const e = C().EMOJI[item];
    if (!reveal) {
      secs.push(['h', head(esc(gName(g)), det, rd.endsAt, 'tpill')]);
      secs.push(['e', `<div class="card col" style="align-items:center;text-align:center;gap:6px"><span class="lbl">${t('whichStory')}</span><span class="emoji" role="img" aria-label="${t('emojiClue')}">${e.e}</span></div>`]);
      if (loc.done || mine.ok) {
        const place = L.scoreEmoji(ans).order.indexOf(uid);
        secs.push(['form-done', note(true, t('gotIt', { o: ord(place + 1) }), t('waitOthers'))]);
      } else {
        secs.push(['form', `<form class="col" style="gap:10px" data-form="guess"><label class="lbl" for="guess">${t('yourAnswer')}</label><div class="row" style="gap:10px"><input id="guess" class="field" data-draft="guess" maxlength="60" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="send"><button class="btn btn-p btn-fit" type="submit">${t('guessB')}</button></div></form>`]);
        secs.push(['n', loc.guessWrong ? note(false, t('notIt'), t('tryAgainSpell')) : '']);
      }
    } else {
      secs.push(['h', head(t('roundOver'), `${esc(gName(g))} · ${det}`)]);
      secs.push(['e', `<div class="card col" style="align-items:center;text-align:center;gap:6px"><span class="emoji" aria-hidden="true">${e.e}</span><span class="title md">${esc(e.a)}</span><span class="det small muted">${esc(e.ref)}</span></div>`]);
      secs.push(['you', myPts ? note(true, `+${myPts} · ${ord(res.order.indexOf(uid) + 1)}`, '') : note(false, t('noPoints'), '')]);
    }
  }
  return { cls: '', secs };
}

function playerResults() {
  const rows = L.standings(players());
  const idx = rows.findIndex((p) => p.uid === S.net.uid);
  const me = rows[idx] || { score: 0, correct: 0 };
  const rd = S.room.round || {}, b = breakdown(S.net.uid, rd);
  return {
    cls: '',
    secs: [
      ['big', `<div class="grow col" style="align-items:center;justify-content:center;gap:8px;text-align:center"><span class="lbl">${t('youFinished')}</span><span class="big">${idx >= 0 ? ord(idx + 1) : '–'}</span><span class="title sm">${t('nPoints', { n: me.score })}</span></div>`],
      ['stats', `<div class="grid3" style="gap:8px"><div class="stat"><span class="stat-v">${me.score}</span><span class="stat-l">${t('points')}</span></div><div class="stat"><span class="stat-v">${b.firsts}</span><span class="stat-l">${t('firsts')}</span></div><div class="stat"><span class="stat-v">${me.correct || 0}/${b.played}</span><span class="stat-l">${t('roundsScored')}</span></div></div>`],
      ['strip', `<div class="card col" style="gap:8px"><span class="lbl">${t('byRound')}</span>${strip(b)}${ruleLine(rd)}</div>`],
      ['wait', `<p class="small muted center" style="margin:0;text-align:center">${t('hostCanStart')}</p><button class="btn btn-s" data-act="leave">${t('leaveRoom')}</button>`]
    ]
  };
}

/* ----- Sheets ----- */
function sheetWrap(inner) {
  return `<div class="sheet-wrap" data-act="closeSheetBg"><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle">${inner}<button class="btn btn-s" data-act="closeSheet">${t('close')}</button></div></div>`;
}
function sheetMenu() {
  const inRoom = S.view === 'room' && S.room && S.room.meta;
  const chips = (act, cur, vals) => `<div class="seg">${vals.map(([v, l]) => `<button class="chip ${cur === v ? 'on' : ''}" data-act="${act}" data-v="${v}" aria-pressed="${cur === v}">${l}</button>`).join('')}</div>`;
  let roomNote = '', roomBtn = '';
  if (inRoom && S.role === 'host') {
    roomNote = `<p class="small muted" style="margin:0">${t('themeNoteHost')}</p>`;
    roomBtn = `<button class="btn btn-s" data-act="closeRoom">${Date.now() - S.confirmClose < 4000 ? t('tapClose') : t('closeRoom')}</button>`;
  } else if (inRoom) {
    roomNote = `<p class="small muted" style="margin:0">${t('themeNotePlayer')}</p>`;
    roomBtn = `<button class="btn btn-s" data-act="leave">${t('leaveRoom')}</button>`;
  }
  return sheetWrap(`<h2 class="title md" id="sheetTitle" tabindex="-1">${t('settings')}</h2>
    <div class="col" style="gap:10px"><span class="lbl">${t('language')}</span>${chips('lang', getLang(), [['en', 'English'], ['kn', 'ಕನ್ನಡ']])}<p class="small muted" style="margin:0">${t('langNote')}</p></div>
    <div class="col" style="gap:10px"><span class="lbl">${t('bibleVerses')}</span>${chips('vlang', getVersePref(), [['auto', t('sameAsApp')], ['en', 'English'], ['kn', 'ಕನ್ನಡ']])}<p class="small muted" style="margin:0">${t('verseNote')}</p></div>
    <div class="col" style="gap:10px"><span class="lbl">${t('theme')}</span>${chips('theme', S.prefs.theme, [['cyber', t('cyber')], ['glass', t('glass')]])}${roomNote}</div>
    <div class="col" style="gap:10px"><span class="lbl">${t('lightDark')}</span>${chips('mode', S.prefs.mode, [['auto', t('auto')], ['light', t('light')], ['dark', t('dark')]])}</div>
    ${roomBtn}
    <button class="linkbtn" data-act="about">${t('aboutLink')}</button>`);
}
function sheetAbout() {
  return sheetWrap(`<h2 class="title md center" id="sheetTitle" tabindex="-1">Upper Room</h2>
    <div class="col center" style="gap:8px;text-align:center">
      <span class="small muted">${t('version', { v: APP_VERSION })}</span>
      <span>Designed by Anderson Jones</span>
      <span class="small">© 2026 Anderson Jones. All rights reserved.</span>
      <span class="small muted">${t('scriptureNote')}</span>
      <a class="linkbtn" href="mailto:andy.andersonjones@gmail.com?subject=Upper%20Room%20feedback">${t('sendFeedback')}</a>
    </div>`);
}
function joinUrl() { return location.origin + location.pathname + '?join=' + S.code; }
function sheetQr() {
  let svg = '';
  try { svg = qrSvg(joinUrl(), { label: t('qrLabel', { c: S.code }) }); } catch { svg = ''; }
  return sheetWrap(`<h2 class="title md center" id="sheetTitle" tabindex="-1">${t('scanToJoin')}</h2>
    <div class="qr-frame">${svg}</div>
    <div class="col" style="align-items:center;gap:4px"><span class="lbl">${t('roomCode')}</span><span class="code">${esc(S.code)}</span><span class="small muted" style="word-break:break-all;text-align:center">${esc(joinUrl())}</span></div>
    <button class="btn btn-p" data-act="share">${t('shareInvite')}</button>`);
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
    S.netErr = navigator.onLine === false ? t('offlineErr') : t('serverErr');
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
    } catch (e) { console.error(e); S.netErr = t('createErr'); paint(); return; }
  }
  S.netErr = t('noFreeCode'); paint();
}

async function doJoin() {
  const code = L.cleanCode(S.drafts.code);
  const name = String(S.drafts.name || '').trim().slice(0, 16);
  S.joinErr = '';
  if (code.length !== 4) { S.joinErr = t('codeFour'); paint(); return; }
  if (!name) { S.joinErr = t('needName'); paint(); return; }
  S.busy = true; paint();
  try {
    await ensureNet();
    const meta = await S.net.get(`rooms/${code}/meta`);
    if (!meta) { S.joinErr = t('noRoom', { c: code }); return; }
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
    if (!S.joinErr) S.joinErr = S.netErr || t('joinFail');
  } finally { S.busy = false; paint(); }
}

const roomPath = () => 'rooms/' + S.code;
const write = (p) => p.catch((e) => { console.error(e); toast(t('writeErr')); });

/* ----- Host game control ----- */
const contentLength = G.contentLength;

/** Items already played on this host phone, per game, quiz book and level, so nothing repeats
 * until everything in that set has come up once. */
const SEEN_KEY = 'ur.seen';
function loadSeen() { try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}') || {}; } catch { return {}; } }
function saveSeen(all) { try { localStorage.setItem(SEEN_KEY, JSON.stringify(all)); } catch { /* private mode: in memory only */ } S.seen = all; }
const quizOf = (meta) => ({ book: P.QUIZ_BOOKS.includes(meta.book) ? meta.book : '', level: P.LEVELS.includes(meta.level) ? meta.level : 'm' });
const poolFor = (g, q) => (g === 'bk' ? [] : P.eligible(g, contentLength(g), EN, q, 3));

function hostStartGame() {
  const meta = S.room.meta, g = meta.game || 'vs', set = settingsFor(g), now = S.net.now(), q = quizOf(meta);
  let seq;
  if (g === 'bk') seq = L.pickSeq(contentLength(g), set.rounds);
  else if (g === 'hu') seq = [...Array(set.rounds).keys()]; // turns; the cards are dealt at each turn
  else {
    const all = S.seen || loadSeen(), key = [g, q.book || 'all', q.level].join('|');
    const r = P.pickFresh(poolFor(g, q), set.rounds, all[key] || []);
    seq = r.seq; saveSeen({ ...all, [key]: r.seen });
  }
  const n = seq.length;
  const upd = {
    'meta/status': 'playing', answers: null,
    round: { game: g, phase: 'intro', i: -1, n, secs: G.secsFor(set.secs, q.level), level: q.level, book: q.book, seq, endsAt: now + L.INTRO_MS, claims: null, teamPts: null, hist: null }
  };
  playerList().forEach((p) => {
    upd[`players/${p.uid}/score`] = 0; upd[`players/${p.uid}/correct`] = 0; upd[`players/${p.uid}/ready`] = false;
    if (L.gameById(g).teams && p.team !== 'ruby' && p.team !== 'sapphire') upd[`players/${p.uid}/team`] = 'ruby';
  });
  write(S.net.update(roomPath(), upd));
}
function hostStartRound(i) {
  const rd = S.room.round, now = S.net.now();
  if (rd.game === 'hu') {
    const who = G.huGuesser(playerList(), i);
    const q = { book: rd.book || '', level: rd.level || 'm' }, all = S.seen || loadSeen(), key = ['hu', q.book || 'all', q.level].join('|');
    const r = P.pickFresh(P.eligible('hg', EN.HANGMAN.length, EN, q, 3), G.HU_CARDS, all[key] || []);
    saveSeen({ ...all, [key]: r.seen });
    return S.net.update(roomPath() + '/round', { phase: 'play', i, startedAt: now, endsAt: now + rd.secs * 1000, data: { guesser: who ? who.uid : '', team: who ? who.team : 'ruby', cards: r.seq }, res: null });
  }
  return S.net.update(roomPath() + '/round', { phase: 'play', i, startedAt: now, endsAt: now + rd.secs * 1000, data: G.roundData(rd.game, rd.seq[i], Math.random, { pool: poolFor(rd.game, { book: rd.book || '', level: rd.level || 'm' }), level: rd.level }), res: null });
}
function scoreRound(rd, ans) {
  const item = rd.seq[rd.i];
  if (['vs', 'bk', 'hg'].includes(rd.game)) return L.scoreScramble(ans);
  if (rd.game === 'em') return L.scoreEmoji(ans);
  if (rd.game === 'wd') return L.scoreWordle(ans);
  if (rd.game === 'hu') { const gu = (rd.data || {}).guesser, got = ((ans[gu] || {}).got || []).length; return got ? { pts: { [gu]: got * 100 }, order: [gu], first: null } : { pts: {}, order: [], first: null }; }
  const right = G.correctOption(rd.game, item, rd.data || {});
  return L.scoreTrivia(ans, right);
}
function hostReveal() {
  const rd = S.room.round, ans = ((S.room.answers || {})[rd.i]) || {};
  const res = scoreRound(rd, ans);
  const upd = { 'round/phase': 'reveal', 'round/endsAt': S.net.now() + L.REVEAL_MS, 'round/res': { pts: res.pts, order: res.order, first: res.first } };
  // Kept for the final results, so everyone can see where the points came from.
  upd[`round/hist/${rd.i}`] = { p: res.pts, f: res.first || '' };
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
  if (rd.game === 'fv' || rd.game === 'hu') {
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
  try { await fn(); } catch (e) { console.error(e); toast(t('hostErr')); } finally { S.hostBusy = false; }
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
      const n = C().VERSES[item].parts.length;
      if (elapsed >= plan.at / 2) send('half', { placed: Math.max(1, Math.floor(n / 2)), ok: false });
      if (plan.ok && elapsed >= plan.at) send('done', { placed: n, ok: true, ms: plan.at });
    } else if (G.CHOICE.includes(rd.game)) {
      if (elapsed >= plan.at) send('ans', { a: plan.a, at: S.net.TS });
    } else if (rd.game === 'bk') {
      if (elapsed >= plan.at / 2) send('half', { ok: false, checks: 1 });
      if (plan.ok && elapsed >= plan.at) send('done', { ok: true, ms: plan.at, checks: 2 });
    } else if (rd.game === 'hg') {
      // Bots play the English word and report progress as numbers, which every phone can show.
      const word = G.hangWord(item, content('en'));
      const letters = [...new Set(word.replace(/ /g, '').split(''))], n = letters.length, half = Math.ceil(n / 2);
      if (elapsed >= plan.at / 2) send('half', { g: letters.slice(0, half).join(''), f: half, t: n, w: 0 });
      if (elapsed >= plan.at) send('end', plan.ok ? { g: letters.join(''), f: n, t: n, w: 0, ok: true, ms: plan.at } : { g: letters.slice(0, 1).join('') + 'QXZJKV'.slice(0, mw()), f: 1, t: n, w: mw(), out: true });
    } else if (rd.game === 'hu') {
      if (data.guesser !== p.uid) return;
      const k = Math.min((data.cards || []).length, Math.floor(elapsed / 6500)), r = L.seeded(key);
      const got = [...Array(k).keys()].filter(() => r() < 0.65);
      send('k' + k, { k, got, pass: k - got.length });
    } else if (rd.game === 'wd') {
      // Bots play the English word; only the colours are shown on the table.
      const n = G.wdTiles(G.wdWord(item, content('en'))).length, k = plan.ok ? plan.n : G.WD_TRIES;
      const rows = [...Array(k).keys()].map((j) => (plan.ok && j === k - 1 ? 'g'.repeat(n) : [...Array(n).keys()].map((x) => 'xxyg'[(x * 7 + j * 3 + k) % 4]).join('')));
      if (elapsed >= plan.at / 2) send('half', { r: rows.slice(0, Math.ceil(k / 2)), n: Math.ceil(k / 2) });
      if (elapsed >= plan.at) send('end', plan.ok ? { r: rows, n: k, ok: true, ms: plan.at } : { r: rows, n: k, out: true });
    } else if (plan.ok && elapsed >= plan.at) send('ok', { ok: true, at: S.net.TS, tries: 1 });
  });
}
setInterval(hostTick, 300);

/* ----- Player answers ----- */
const myAnsPath = () => `${roomPath()}/answers/${S.room.round.i}/${S.net.uid}`;
function placePiece(pi) {
  const rd = S.room.round, loc = ensureLocal(rd), n = C().VERSES[rd.seq[rd.i]].parts.length;
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
  if (L.emojiMatches(guess, C().EMOJI[rd.seq[rd.i]].keys)) {
    loc.done = true; loc.guessWrong = false; vibrate(40);
    const el = document.getElementById('guess'); if (el) el.blur();
    write(S.net.set(myAnsPath(), { ok: true, at: S.net.TS, tries: loc.tries }));
  } else { loc.guessWrong = true; vibrate([20, 40, 20]); }
  paint();
}
function huMark(ok) {
  const rd = S.room.round;
  if (!rd || rd.game !== 'hu' || rd.phase !== 'play' || S.net.now() >= rd.endsAt) return;
  const h = huState(rd);
  if (h.d.guesser !== S.net.uid || h.k >= (h.d.cards || []).length) return;
  vibrate(ok ? 40 : [20, 40, 20]);
  write(S.net.set(myAnsPath(), { k: h.k + 1, got: ok ? [...h.got, h.k] : h.got, pass: h.pass + (ok ? 0 : 1) }));
}
function wdLive() {
  const rd = S.room && S.room.round;
  if (!rd || rd.game !== 'wd' || rd.phase !== 'play' || S.net.now() >= rd.endsAt) return null;
  const loc = ensureLocal(rd), answer = G.wdTiles(G.wdWord(rd.seq[rd.i]));
  const last = loc.wrows[loc.wrows.length - 1] || [];
  if (loc.done || last.join('') === answer.join('') || loc.wrows.length >= G.WD_TRIES) return null;
  return { rd, loc, answer };
}
function wdType(c) {
  const w = wdLive(); if (!w) return;
  w.loc.wmsg = '';
  if (c === null) w.loc.wcur.pop();
  else if (w.loc.wcur.length < w.answer.length) w.loc.wcur.push(c);
  paint();
}
function wdEnter() {
  const w = wdLive(); if (!w) return;
  const { rd, loc, answer } = w;
  if (loc.wcur.length < answer.length) { loc.wmsg = t('wdShort'); vibrate([20, 40, 20]); paint(); return; }
  if (!G.wdValid(loc.wcur, answer)) { loc.wmsg = t('wdNotWord'); vibrate([20, 40, 20]); paint(); return; }
  loc.wrows.push(loc.wcur); loc.wcur = [];
  const r = loc.wrows.map((g) => G.wdScore(g, answer)), ok = r[r.length - 1] === 'g'.repeat(answer.length);
  const val = { gs: loc.wrows.map((g) => g.join('|')), r, n: loc.wrows.length };
  if (ok) { loc.done = true; loc.ms = Math.max(0, S.net.now() - rd.startedAt); val.ok = true; val.ms = loc.ms; vibrate(40); }
  else if (loc.wrows.length >= G.WD_TRIES) { val.out = true; vibrate([20, 40, 20]); }
  write(S.net.set(myAnsPath(), val));
  paint();
}
document.addEventListener('keydown', (ev) => {
  if (ev.target && /INPUT|TEXTAREA/.test(ev.target.tagName)) return;
  const w = wdLive(); if (!w || ev.metaKey || ev.ctrlKey) return;
  if (ev.key === 'Enter') { ev.preventDefault(); wdEnter(); }
  else if (ev.key === 'Backspace') { ev.preventDefault(); wdType(null); }
  else if (/^[a-z]$/i.test(ev.key) && !G.isKannada(w.answer.join(''))) wdType(ev.key.toUpperCase());
});
function guessLetter(c) {
  const rd = S.room.round;
  if (!rd || rd.game !== 'hg' || rd.phase !== 'play' || S.net.now() >= rd.endsAt) return;
  const loc = ensureLocal(rd), word = G.hangWord(rd.seq[rd.i]);
  const list = G.hangGuessList(loc.guessed);
  if (loc.done || list.includes(c) || G.hangWrong(word, loc.guessed) >= mw()) return;
  loc.guessed = G.hangGuessJoin([...list, c]);
  const wrong = G.hangWrong(word, loc.guessed);
  // f/t/w let the table show progress even when it shows the word in another language.
  const val = { g: loc.guessed, f: G.hangFound(word, loc.guessed), t: G.hangLetters(word), w: wrong };
  if (G.hangSolved(word, loc.guessed)) { loc.done = true; loc.ms = Math.max(0, S.net.now() - rd.startedAt); val.ok = true; val.ms = loc.ms; vibrate(40); }
  else if (!G.hangTokens(word).flat().includes(c)) { vibrate([20, 40, 20]); if (wrong >= mw()) val.out = true; }
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
  about: () => { S.sheet = 'about'; },
  share: async () => {
    const url = joinUrl(), text = t('shareText', { c: S.code });
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
  lang: (el) => { setLang(el.dataset.v); S.local = null; applyTheme(); },
  vlang: (el) => { setVersePref(el.dataset.v); S.local = null; applyTheme(); },
  pick: (el) => write(S.net.update(roomPath() + '/meta', { game: el.dataset.g })),
  set: (el) => { const g = S.room.meta.game || 'vs'; write(S.net.update(`${roomPath()}/meta/settings/${g}`, { ...settingsFor(g), [el.dataset.k]: Number(el.dataset.v) })); },
  quizBook: (el) => write(S.net.update(`${roomPath()}/meta`, { book: el.dataset.v || null })),
  level: (el) => write(S.net.update(`${roomPath()}/meta`, { level: el.dataset.v })),
  shuffleTeams: () => {
    const t = L.shuffleTeams(playerList().map((p) => p.uid)), upd = {};
    Object.entries(t).forEach(([u, team]) => { upd[`players/${u}/team`] = team; });
    write(S.net.update(roomPath(), upd));
  },
  hostPlays: () => {
    const on = !(S.room.meta && S.room.meta.hostPlays), uid = S.net.uid, upd = { 'meta/hostPlays': on };
    if (on) {
      const name = String(S.drafts.name || S.profile.name || '').trim().slice(0, 16) || 'Host';
      S.drafts.name = name;
      upd[`players/${uid}`] = { name, color: S.profile.color || 'amber', team: L.smallerTeam(players()), score: 0, correct: 0, ready: true, online: true, isHost: true, joined: Date.now() };
    } else upd[`players/${uid}`] = null;
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
  huGot: () => huMark(true),
  huPass: () => huMark(false),
  wdKey: (el) => wdType(el.dataset.c),
  wdDel: () => wdType(null),
  wdEnter: () => wdEnter(),
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
document.addEventListener('change', (ev) => {
  if (ev.target.id !== 'hostName' || S.role !== 'host' || !S.room || !players()[S.net.uid]) return;
  const name = String(ev.target.value || '').trim().slice(0, 16) || 'Host';
  S.profile.name = name; save('ur.profile', S.profile);
  write(S.net.update(`${roomPath()}/players/${S.net.uid}`, { name }));
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
