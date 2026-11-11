// Per-game rules that don't touch the screen or network. Tested with `node --test`.
import { VERSES, TRIVIA, EMOJI, HANGMAN, TWO_TRUTHS, TIMELINE, BOOKS, WORDLE } from './content.js';
import { WORDLE_OK } from './wordle-words.js';
import { shuffle, scrambleOrder, seeded } from './logic.js';
import { content } from './text.js';
import { tlComparable } from './pool.js';

/** Games where everyone picks one option and the first right answer earns a bonus. */
export const CHOICE = ['tr', 'fv', 'tl', 'tt'];
export const MAX_WRONG = 6;
export const BOOK_SET = 6;

export function contentLength(g) {
  return { vs: VERSES.length, fv: VERSES.length, tr: TRIVIA.length, em: EMOJI.length, hg: HANGMAN.length, tt: TWO_TRUTHS.length, tl: TIMELINE.length, wd: WORDLE.length, bk: 1000 }[g] || 1;
}

/** Finish the Verse: the shown start and the ending to find. */
export function verseHalves(v) {
  const k = Math.ceil(v.parts.length / 2);
  return [v.parts.slice(0, k).join(' '), v.parts.slice(k).join(' ')];
}

/** Lives in Bible Hangman: six, or four on Hard. */
export const livesFor = (level) => (level === 'h' ? 4 : MAX_WRONG);
/** Round length: Hard takes a quarter off the timer. */
export const secsFor = (secs, level) => (level === 'h' ? Math.max(10, Math.round((secs * 0.75) / 5) * 5) : secs);
/** Verse Scramble on Hard mixes in this many pieces from another verse. */
export const DECOYS = 2;

/**
 * Everything the host decides when a round starts, so every phone sees the same thing.
 * opts.pool: the items the host's settings allow (quiz book, difficulty); opts.level: 'e' | 'm' | 'h'.
 */
export function roundData(g, item, rand = Math.random, opts = {}) {
  const pool = opts.pool && opts.pool.length ? opts.pool : null;
  if (g === 'vs') {
    const n = VERSES[item].parts.length, order = scrambleOrder(n, rand);
    if (opts.level !== 'h') return { order };
    // Hard: two pieces from another verse that don't belong.
    const others = (pool && pool.length > 1 ? pool : [...Array(VERSES.length).keys()]).filter((i) => i !== item);
    const dv = others[Math.floor(rand() * others.length)], dn = VERSES[dv].parts.length;
    const dk = shuffle([...Array(dn).keys()], rand).slice(0, DECOYS);
    const at = shuffle([...order, ...dk.map((_, k) => n + k)], rand);
    return { order: at, dv, dk };
  }
  if (g === 'tr') return { opt: shuffle([0, 1, 2, 3], rand) };
  if (g === 'tt') return { opt: shuffle([0, 1, 2], rand) }; // 0 and 1 are truths, 2 is the lie
  if (g === 'fv') {
    const from = pool && pool.length >= 4 ? pool : [...Array(VERSES.length).keys()];
    const others = shuffle(from.filter((i) => i !== item), rand).slice(0, 3);
    return { opt: shuffle([item, ...others], rand) };
  }
  if (g === 'tl') {
    // Anchors: events that can be ordered against the new one (and each other) without doubt.
    const ok = (a, b) => tlComparable(TIMELINE[a][1], TIMELINE[b][1]);
    const tryFrom = (cands) => {
      const picked = [];
      for (const a of shuffle(cands.filter((i) => i !== item && ok(i, item)), rand)) {
        if (picked.every((p) => ok(p, a))) picked.push(a);
        if (picked.length === 4) break;
      }
      return picked;
    };
    let anchors = pool ? tryFrom(pool) : [];
    if (anchors.length < 3) anchors = tryFrom([...Array(TIMELINE.length).keys()]);
    return { anchors: anchors.sort((a, b) => a - b) };
  }
  if (g === 'bk') {
    const set = shuffle([...Array(BOOKS.length).keys()], rand).slice(0, BOOK_SET).sort((a, b) => a - b);
    return { set, order: scrambleOrder(BOOK_SET, rand) };
  }
  return {};
}

/** Verse Scramble: the text of piece p (decoys are numbered after the verse's own pieces). */
export function pieceText(item, data, p, C = content()) {
  const parts = C.VERSES[item].parts;
  if (p < parts.length) return parts[p];
  return C.VERSES[data.dv].parts[data.dk[p - parts.length]];
}

/** The options shown, in screen order, in this phone's language (or the content set given). */
export function options(g, item, data, C = content()) {
  if (g === 'tr') return data.opt.map((i) => C.TRIVIA[item].o[i]);
  if (g === 'tt') { const x = C.TWO_TRUTHS[item]; const all = [x.t[0][0], x.t[1][0], x.lie[0]]; return data.opt.map((i) => all[i]); }
  if (g === 'fv') return data.opt.map((vi) => verseHalves(C.VERSES[vi])[1]);
  if (g === 'tl') return [...Array(data.anchors.length + 1).keys()].map((i) => 'Gap ' + (i + 1));
  return [];
}

/** Index of the right option, in screen order. */
export function correctOption(g, item, data) {
  if (g === 'tr') return data.opt.indexOf(TRIVIA[item].a);
  if (g === 'tt') return data.opt.indexOf(2);
  if (g === 'fv') return data.opt.indexOf(item);
  if (g === 'tl') return data.anchors.filter((a) => a < item).length;
  return -1;
}

/** Books Sort: is this arrangement (positions into data.order) in Bible order? */
export function booksInPlace(data, arrangement) {
  const books = arrangement.map((p) => data.set[data.order[p]]);
  return books.filter((b, i) => b === data.set[i]).length;
}

/* ----- Hangman -----
   English words are guessed letter by letter. Kannada words are guessed one akshara (written
   syllable, e.g. ಬ್ರ or ಹಾ) at a time from a keyboard of the word's aksharas plus decoys. A word is
   handled as a list of "tokens"; guesses are stored as a string (English: "AEB", Kannada: "ಅ|ಬ್ರ"). */
const KN_RE = /[\u0C80-\u0CFF]/;
export const isKannada = (s) => KN_RE.test(String(s || ''));
/** Split Kannada text into aksharas: a vowel or a consonant cluster joined by virama, plus its signs. */
export function aksharas(word) {
  const out = [];
  for (const ch of word) {
    const c = ch.codePointAt(0);
    const sign = (c >= 0x0C81 && c <= 0x0C83) || c === 0x0CBC || (c >= 0x0CBE && c <= 0x0CCD) || c === 0x0CD5 || c === 0x0CD6 || c === 0x200C || c === 0x200D;
    const prev = out.length ? out[out.length - 1] : '';
    if (out.length && (sign || prev.endsWith('\u0CCD'))) out[out.length - 1] += ch;
    else out.push(ch);
  }
  return out;
}
/** The word as a list of words, each a list of tokens. */
export const hangTokens = (word) => word.split(' ').map((w) => (isKannada(w) ? aksharas(w) : w.split('')));
export const hangGuessList = (g) => (isKannada(g) ? String(g).split('|').filter(Boolean) : String(g || '').split(''));
export const hangGuessJoin = (list) => (list.some(isKannada) ? list.join('|') : list.join(''));
export const hangWord = (item, C = content()) => C.HANGMAN[item][0];
const flat = (word) => hangTokens(word).flat();
export function hangMask(word, guessed) {
  const gs = hangGuessList(guessed);
  return hangTokens(word).map((w) => w.map((c) => (gs.includes(c) ? c : '_'))).reduce((a, w, i) => a.concat(i ? [' '] : [], w), []);
}
export const hangWrong = (word, guessed) => { const f = flat(word); return hangGuessList(guessed).filter((c) => !f.includes(c)).length; };
export const hangSolved = (word, guessed) => { const gs = hangGuessList(guessed); return flat(word).every((c) => gs.includes(c)); };
export const hangFound = (word, guessed) => { const gs = hangGuessList(guessed); return new Set(flat(word).filter((c) => gs.includes(c))).size; };
export const hangLetters = (word) => new Set(flat(word)).size;
/** Keys to show: A–Z for English; for Kannada, the word's aksharas plus decoys, in a fixed shuffled order. */
export function hangKeys(item, C = content()) {
  const word = hangWord(item, C);
  if (!isKannada(word)) return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const mine = [...new Set(flat(word))];
  const pool = [...new Set(C.HANGMAN.flatMap(([w]) => flat(w)))].filter((a) => !mine.includes(a)).sort();
  const rand = seeded('hgkeys:' + item);
  const want = Math.min(24, Math.max(18, Math.ceil((mine.length + 12) / 6) * 6)); // full rows of 6
  const decoys = shuffle(pool, rand).slice(0, want - mine.length);
  return shuffle([...mine, ...decoys], rand);
}

/** Is a player finished with this round? */
export function isDone(g, a) {
  if (!a) return false;
  if (CHOICE.includes(g)) return typeof a.a === 'number';
  if (g === 'hg' || g === 'wd') return !!(a.ok || a.out);
  return !!a.ok;
}

// ----- Bible Wordle -----
export const WD_TRIES = 6;
/** The word for this phone's language, as tiles: letters in English, aksharas in Kannada. */
export const wdWord = (item, C = content()) => C.WORDLE[item][0];
export const wdTiles = (word) => (isKannada(word) ? hangTokens(word).flat() : word.replace(/ /g, '').split(''));
/** Colours for one guess: g = right place, y = in the word elsewhere, x = not in the word (Wordle's rules for repeats). */
export function wdScore(guess, answer) {
  const out = guess.map(() => 'x'), left = {};
  answer.forEach((a, i) => { if (guess[i] === a) out[i] = 'g'; else left[a] = (left[a] || 0) + 1; });
  guess.forEach((c, i) => { if (out[i] !== 'g' && left[c]) { out[i] = 'y'; left[c]--; } });
  return out.join('');
}
/** Is this a word the game accepts? English guesses must be real (KJV) words; Kannada ones aren't checked. */
export function wdValid(guess, answer) {
  if (guess.length !== answer.length) return false;
  if (isKannada(answer.join(''))) return true;
  const w = guess.join('');
  return w === answer.join('') || WORDLE_OK.has(w);
}
export const WD_ROWS_EN = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
/** Kannada keys: the word's aksharas plus decoys from the other words, in full rows of 6. */
export function wdKeys(item, C = content()) {
  const word = wdWord(item, C);
  if (!isKannada(word)) return WD_ROWS_EN.join('').split('');
  const mine = [...new Set(wdTiles(word))];
  const pool = [...new Set([...C.WORDLE.map((x) => x[0]), ...C.HANGMAN.map((x) => x[0])].flatMap((w) => (isKannada(w) ? wdTiles(w) : []))
    .filter((a) => a !== ' ' && !mine.includes(a)))].sort();
  const rand = seeded('wdkeys:' + item);
  const decoys = shuffle(pool, rand).slice(0, 24 - mine.length);
  return shuffle([...mine, ...decoys], rand);
}
/** Best colour seen for each key so far (g beats y beats x). */
export function wdKeyState(rows, answer) {
  const rank = { x: 1, y: 2, g: 3 }, st = {};
  rows.forEach((g) => { const sc = wdScore(g, answer); g.forEach((c, i) => { if (!st[c] || rank[sc[i]] > rank[st[c]]) st[c] = sc[i]; }); });
  return st;
}
