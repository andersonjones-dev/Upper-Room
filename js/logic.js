// Pure game logic: no DOM, no network. Tested with `node --test`.

export const GAMES = [
  { id: 'pc', n: '01', sym: 'Pc', name: 'Bible Pictionary', mode: 'Draw', c: 'sapphire' },
  { id: 'vs', n: '02', sym: 'Vs', name: 'Verse Scramble', mode: 'Race', c: 'ruby', ready: true,
    how: 'A verse is cut into pieces. Tap them back into order on your phone. Fastest correct order wins.' },
  { id: 'bk', n: '03', sym: 'Bk', name: 'Books Sort', mode: 'Race', c: 'amber', ready: true,
    how: 'Six books of the Bible, jumbled. Drag them, or tap two to swap, into Bible order. A wrong check costs 3 seconds.' },
  { id: 'tt', n: '04', sym: '2T', name: 'Two Truths & a Lie', mode: 'Vote', c: 'amethyst', ready: true,
    how: 'Three statements about a Bible person. Two are true. Vote for the lie on your phone; you can change your vote until the reveal.' },
  { id: 'fv', n: '05', sym: 'Fv', name: 'Finish the Verse', mode: 'Teams', c: 'emerald', ready: true, teams: true,
    how: 'The start of a verse is shown. Pick the right ending on your phone. Every right answer scores for your team; first right gets a bonus.' },
  { id: 'tl', n: '06', sym: 'Tl', name: 'Bible Timeline', mode: 'Place', c: 'teal', ready: true,
    how: 'Four events are shown in Bible order. Tap the gap where the new event belongs. First right answer gets a bonus.' },
  { id: 'hu', n: '07', sym: 'Hu', name: 'Heads Up', mode: 'Teams', c: 'amber' },
  { id: 'wd', n: '08', sym: 'Wd', name: 'Bible Wordle', mode: 'Daily', c: 'emerald' },
  { id: 'em', n: '09', sym: 'Em', name: 'Emoji Bible', mode: 'Buzz', c: 'ruby', ready: true,
    how: 'Guess the Bible story from the emojis. Type your answer; the first right answers score most.' },
  { id: 'ex', n: '10', sym: 'Ex', name: 'Exodus Escape', mode: 'Co-op', c: 'sapphire' },
  { id: 'tr', n: '11', sym: '12', name: 'Twelve Tribes', mode: 'Teams', c: 'amethyst', ready: true, teams: true,
    how: 'Two teams. The first right answer to each question claims land on the map for their team.' },
  { id: 'hg', n: '12', sym: 'Hg', name: 'Bible Hangman', mode: 'Race', c: 'teal', ready: true,
    how: 'Everyone solves the same hidden word on their own phone, one letter at a time. Six wrong letters and you are out. Fastest solve wins.' }
];
export const gameById = (id) => GAMES.find((g) => g.id === id) || GAMES[1];

export const SETTINGS = {
  vs: { rounds: [3, 5, 8], secs: [30, 45, 60], def: { rounds: 5, secs: 45 } },
  tr: { rounds: [6, 12], secs: [15, 20, 30], def: { rounds: 12, secs: 20 } },
  em: { rounds: [5, 8, 12], secs: [30, 45, 60], def: { rounds: 8, secs: 45 } },
  fv: { rounds: [5, 8, 12], secs: [15, 20, 30], def: { rounds: 8, secs: 20 } },
  hg: { rounds: [3, 5, 8], secs: [45, 60, 90], def: { rounds: 5, secs: 60 } },
  tt: { rounds: [4, 6, 8], secs: [20, 30, 45], def: { rounds: 6, secs: 30 } },
  bk: { rounds: [3, 5, 8], secs: [30, 45, 60], def: { rounds: 5, secs: 45 } },
  tl: { rounds: [5, 8, 12], secs: [15, 20, 30], def: { rounds: 8, secs: 20 } }
};

export const COLORS = ['ruby', 'sapphire', 'emerald', 'amber', 'amethyst', 'teal'];
export const TEAMS = { ruby: 'Team Ruby', sapphire: 'Team Sapphire' };
export const INTRO_MS = 4000;
export const REVEAL_MS = 6000;
export const WRONG_PENALTY_MS = 3000;
export const VOTE_GRACE_MS = 3000;

const ROMAN_TABLE = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
export function roman(n) {
  let out = '';
  for (const [v, s] of ROMAN_TABLE) while (n >= v) { out += s; n -= v; }
  return out;
}

export function shuffle(arr, rand = Math.random) {
  const b = arr.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/** A shuffled order of piece indices that is never already solved. */
export function scrambleOrder(n, rand = Math.random) {
  const base = [...Array(n).keys()];
  if (n < 2) return base;
  let o;
  do { o = shuffle(base, rand); } while (o.every((v, i) => v === i));
  return o;
}

export function pickSeq(total, n, rand = Math.random) {
  return shuffle([...Array(total).keys()], rand).slice(0, Math.min(n, total));
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
export function makeCode(rand = Math.random) {
  let s = '';
  for (let i = 0; i < 4; i++) s += CODE_ALPHABET[Math.floor(rand() * CODE_ALPHABET.length)];
  return s;
}
export const cleanCode = (s) => String(s || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);

export function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/['‘’`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => (w.length > 3 && w.endsWith('s') ? w.slice(0, -1) : w))
    .join(' ');
}

export function emojiMatches(guess, keys) {
  const g = normalize(guess);
  if (!g) return false;
  const padded = ' ' + g + ' ';
  return keys.some((k) => normalize(k).split(' ').every((w) => padded.includes(' ' + w + ' ')));
}

export function isOrderCorrect(placed, n) {
  return Array.isArray(placed) && placed.length === n && placed.every((v, i) => v === i);
}

export const rankPoints = (i) => (i === 0 ? 300 : i === 1 ? 200 : 100);

function ranked(entries, keyFn) {
  return entries.sort((a, b) => keyFn(a[1]) - keyFn(b[1]) || (a[0] < b[0] ? -1 : 1));
}

/** Verse Scramble: rank correct finishers by time (penalties included). */
export function scoreScramble(ans) {
  const ok = ranked(Object.entries(ans || {}).filter(([, a]) => a && a.ok && typeof a.ms === 'number'), (a) => a.ms);
  const pts = {}, order = [];
  ok.forEach(([u], i) => { pts[u] = rankPoints(i); order.push(u); });
  return { pts, order, first: order[0] || null };
}

/** Emoji Bible: rank correct answers by server time. */
export function scoreEmoji(ans) {
  const ok = ranked(Object.entries(ans || {}).filter(([, a]) => a && a.ok && typeof a.at === 'number'), (a) => a.at);
  const pts = {}, order = [];
  ok.forEach(([u], i) => { pts[u] = rankPoints(i); order.push(u); });
  return { pts, order, first: order[0] || null };
}

/** Twelve Tribes: 100 for a right answer, +100 for the first right answer. */
export function scoreTrivia(ans, correct) {
  const ok = ranked(Object.entries(ans || {}).filter(([, a]) => a && a.a === correct && typeof a.at === 'number'), (a) => a.at);
  const pts = {}, order = [];
  ok.forEach(([u], i) => { pts[u] = i === 0 ? 200 : 100; order.push(u); });
  return { pts, order, first: order[0] || null };
}

/** Two Truths & a Lie: 200 for every player who spots the lie. */
export function scoreVote(ans, correct) {
  const ok = ranked(Object.entries(ans || {}).filter(([, a]) => a && a.a === correct), (a) => a.at || 0);
  const pts = {}, order = [];
  ok.forEach(([u]) => { pts[u] = 200; order.push(u); });
  return { pts, order, first: order[0] || null };
}

/** Which tribes question i claims when a game has n questions (12 → one each, 6 → two each). */
export function tribesFor(i, n) {
  const k = Math.max(1, Math.floor(12 / Math.max(1, n)));
  return Array.from({ length: k }, (_, j) => i * k + j).filter((t) => t < 12);
}

export function countClaims(claims) {
  const c = { ruby: 0, sapphire: 0 };
  Object.values(claims || {}).forEach((t) => { if (c[t] !== undefined) c[t]++; });
  return c;
}

export function smallerTeam(players) {
  const c = { ruby: 0, sapphire: 0 };
  Object.values(players || {}).forEach((p) => { if (p && c[p.team] !== undefined) c[p.team]++; });
  return c.sapphire < c.ruby ? 'sapphire' : 'ruby';
}

export function shuffleTeams(uids, rand = Math.random) {
  const s = shuffle(uids, rand);
  const out = {};
  s.forEach((u, i) => { out[u] = i % 2 ? 'sapphire' : 'ruby'; });
  return out;
}

export function standings(players) {
  return Object.entries(players || {})
    .filter(([, p]) => p && p.name)
    .map(([uid, p]) => ({ uid, ...p, score: p.score || 0 }))
    .sort((a, b) => b.score - a.score || String(a.name).localeCompare(String(b.name)));
}

/** True when every active player has finished this round. */
export function allDone(game, ans, uids) {
  if (!uids.length) return false;
  return uids.every((u) => {
    const a = ans && ans[u];
    if (!a) return false;
    if (['tr', 'fv', 'tl', 'tt'].includes(game)) return typeof a.a === 'number';
    if (game === 'hg') return !!(a.ok || a.out);
    return !!a.ok;
  });
}

export const secondsLeft = (endsAt, now) => Math.max(0, Math.ceil((endsAt - now) / 1000));
export function fmtClock(s) {
  const m = Math.floor(s / 60);
  return m + ':' + String(s % 60).padStart(2, '0');
}
export const fmtSecs = (ms) => (ms / 1000).toFixed(1) + 's';
export const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

/* ----- Practice bots (played by the host's phone) ----- */
export const BOT_NAMES = ['Ruth', 'Boaz', 'Silas', 'Lydia', 'Gideon', 'Naomi', 'Titus', 'Hannah', 'Amos', 'Levi', 'Dinah', 'Asher', 'Tamar', 'Seth'];
export const MAX_PLAYERS = 20;

/** Small seeded random generator, so a bot makes the same choice if the host's app reloads mid-round. */
export function seeded(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

/** What one bot does this round: when it answers, and whether it gets it right. */
export function botPlan(game, roundKey, uid, secs, correct = 0) {
  const r = seeded(roundKey + ':' + uid);
  const span = secs * 1000;
  if (game === 'vs') return { ok: r() < 0.75, at: Math.round((0.25 + 0.55 * r()) * span) };
  if (['tr', 'fv', 'tl', 'tt'].includes(game)) {
    const n = game === 'tl' ? 5 : game === 'tt' ? 3 : 4;
    const ok = r() < (game === 'tt' ? 0.55 : 0.65);
    const at = Math.round((0.15 + 0.55 * r()) * span);
    return { ok, at, a: ok ? correct : (correct + 1 + Math.floor(r() * (n - 1))) % n };
  }
  if (game === 'hg') return { ok: r() < 0.6, at: Math.round((0.3 + 0.55 * r()) * span), wrong: Math.floor(r() * 4) };
  return { ok: r() < 0.7, at: Math.round((0.2 + 0.6 * r()) * span) };
}

export function nextBotName(players) {
  const used = new Set(Object.values(players || {}).map((p) => p && p.name));
  return BOT_NAMES.find((n) => !used.has(n)) || 'Bot ' + (Object.keys(players || {}).length + 1);
}
