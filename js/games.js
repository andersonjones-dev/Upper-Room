// Per-game rules that don't touch the screen or network. Tested with `node --test`.
import { VERSES, TRIVIA, EMOJI, HANGMAN, TWO_TRUTHS, TIMELINE, BOOKS } from './content.js';
import { shuffle, scrambleOrder, seeded } from './logic.js';
import { content } from './text.js';

/** Games where everyone picks one option and the first right answer earns a bonus. */
export const CHOICE = ['tr', 'fv', 'tl', 'tt'];
export const MAX_WRONG = 6;
export const BOOK_SET = 6;

export function contentLength(g) {
  return { vs: VERSES.length, fv: VERSES.length, tr: TRIVIA.length, em: EMOJI.length, hg: HANGMAN.length, tt: TWO_TRUTHS.length, tl: TIMELINE.length, bk: 1000 }[g] || 1;
}

/** Finish the Verse: the shown start and the ending to find. */
export function verseHalves(v) {
  const k = Math.ceil(v.parts.length / 2);
  return [v.parts.slice(0, k).join(' '), v.parts.slice(k).join(' ')];
}

/** Everything the host decides when a round starts, so every phone sees the same thing. */
export function roundData(g, item, rand = Math.random) {
  if (g === 'vs') return { order: scrambleOrder(VERSES[item].parts.length, rand) };
  if (g === 'tr') return { opt: shuffle([0, 1, 2, 3], rand) };
  if (g === 'tt') return { opt: shuffle([0, 1, 2], rand) }; // 0 and 1 are truths, 2 is the lie
  if (g === 'fv') {
    const others = shuffle([...Array(VERSES.length).keys()].filter((i) => i !== item), rand).slice(0, 3);
    return { opt: shuffle([item, ...others], rand) };
  }
  if (g === 'tl') {
    const pool = shuffle([...Array(TIMELINE.length).keys()].filter((i) => Math.abs(i - item) > 1), rand);
    return { anchors: pool.slice(0, 4).sort((a, b) => a - b) };
  }
  if (g === 'bk') {
    const set = shuffle([...Array(BOOKS.length).keys()], rand).slice(0, BOOK_SET).sort((a, b) => a - b);
    return { set, order: scrambleOrder(BOOK_SET, rand) };
  }
  return {};
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
  if (g === 'hg') return !!(a.ok || a.out);
  return !!a.ok;
}
