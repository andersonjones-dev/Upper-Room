// Which items a round may use: the quiz book, the difficulty and the no-repeat rule.
// Pure functions; tested with `node --test`.

/** The twelve books a church can pick for a quiz. Every game has content for each of them. */
export const QUIZ_BOOKS = ['Genesis', 'Exodus', 'Joshua', 'Judges', 'Ruth', '1 Samuel', 'Esther', 'Daniel', 'Matthew', 'Luke', 'John', 'Acts'];
export const LEVELS = ['e', 'm', 'h'];

const ALIAS = { Psalm: 'Psalms', 'Song of Songs': 'Song of Solomon' };
/** "1 Samuel 17:49" -> { book: '1 Samuel', c: 17, v: 49, c2: 17 }. "Exodus 7–11" -> c 7, c2 11. */
export function parseRef(ref) {
  const m = String(ref || '').match(/^((?:[1-3] )?[A-Z][A-Za-z ]*?)\s+(\d+)(?::(\d+))?(?:\s*[–-]\s*(\d+))?/);
  if (!m) return null;
  const c = +m[2], v = m[3] ? +m[3] : 0;
  return { book: ALIAS[m[1]] || m[1], c, v, c2: m[4] && !m[3] ? +m[4] : c };
}
export const bookOf = (ref) => (parseRef(ref) || {}).book || '';

/** Book and difficulty of item i of a game. `C` is the English content module. */
export function tagOf(g, i, C) {
  if (g === 'vs' || g === 'fv') { const x = C.VERSES[i]; return { book: bookOf(x.ref), d: x.d || 'm' }; }
  if (g === 'tr') { const x = C.TRIVIA[i]; return { book: bookOf(x.ref), d: x.d || 'm' }; }
  if (g === 'em') { const x = C.EMOJI[i]; return { book: bookOf(x.ref), d: x.d || 'm' }; }
  if (g === 'hg') { const x = C.HANGMAN[i]; return { book: x[2] || '', d: x[3] || 'm' }; }
  if (g === 'tt') { const x = C.TWO_TRUTHS[i]; return { book: bookOf(x.t[0][1]), d: x.d || 'm' }; }
  if (g === 'tl') { const x = C.TIMELINE[i]; return { book: bookOf(x[1]), d: x[2] || 'm' }; }
  return { book: '', d: 'm' };
}

/**
 * Items allowed by the host's settings. book: '' for all books. level: 'e', 'm' or 'h';
 * Easy uses easy items, Medium easy and medium, Hard everything (the hard ones are only in Hard).
 * If a book has too few items at a level, the level is widened rather than leaving the game empty.
 */
export function eligible(g, total, C, { book = '', level = 'm' } = {}, min = 1) {
  const all = [...Array(total).keys()];
  const inBook = book ? all.filter((i) => tagOf(g, i, C).book === book) : all;
  const upto = LEVELS.indexOf(level) < 0 ? 1 : LEVELS.indexOf(level);
  for (let k = upto; k < LEVELS.length; k++) {
    const ok = inBook.filter((i) => LEVELS.indexOf(tagOf(g, i, C).d) <= k);
    if (ok.length >= min) return ok;
  }
  return inBook.length ? inBook : all;
}

/**
 * Pick n items with no repeats until everything has come up once. `seen` is the list already used
 * (in this room, for this game and filter). Returns { seq, seen } with the new seen list; when the
 * pool runs out the cycle starts again, avoiding the items just played.
 */
export function pickFresh(pool, n, seen = [], rand = Math.random) {
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const inPool = new Set(pool);
  let used = seen.filter((i) => inPool.has(i));
  const seq = [];
  while (seq.length < Math.min(n, pool.length)) {
    let fresh = pool.filter((i) => !used.includes(i) && !seq.includes(i));
    if (!fresh.length) { used = [...seq]; fresh = pool.filter((i) => !seq.includes(i)); }
    const take = shuffle(fresh).slice(0, n - seq.length);
    seq.push(...take); used.push(...take);
  }
  return { seq, seen: used };
}

// ----- Bible Timeline -----
// The list is sorted by era, then book, chapter and verse. Events from different books in the same
// era (say Matthew and John) are never compared, so the answer never depends on a harmony of the Gospels.
const BOOK_ORDER = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'];
/** [first, last] era of a book: 1 patriarchs … 9 Revelation. Daniel spans the exile and the return. */
export function eraOf(book) {
  const b = BOOK_ORDER.indexOf(book);
  if (book === 'Daniel') return [5, 6];
  if (b === 0) return [1, 1];
  if (b <= 4) return [2, 2];
  if (b <= 7) return [3, 3];
  if (b <= 9) return [4, 4];
  if (b <= 13) return [5, 5];
  if (b <= 16) return [6, 6];
  if (b <= 38) return [5, 5];
  if (b <= 42) return [7, 7];
  if (b <= 64) return [8, 8];
  return [9, 9];
}
export function timelineKey(ref) {
  const r = parseRef(ref) || { book: '', c: 0, v: 0 };
  return [eraOf(r.book)[0], BOOK_ORDER.indexOf(r.book), r.c, r.v];
}
/** Can these two events be shown together without any doubt about which came first? */
export function tlComparable(refA, refB) {
  const a = parseRef(refA), b = parseRef(refB);
  if (!a || !b) return false;
  if (a.book === b.book) {
    if (a.c2 < b.c || b.c2 < a.c) return true; // different chapters
    return !!(a.c === b.c && a.c2 === a.c && b.c2 === b.c && a.v && b.v && a.v !== b.v);
  }
  const ea = eraOf(a.book), eb = eraOf(b.book);
  return ea[1] < eb[0] || eb[1] < ea[0];
}
