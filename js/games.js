// Per-game rules that don't touch the screen or network. Tested with `node --test`.
import { VERSES, TRIVIA, EMOJI, HANGMAN, TWO_TRUTHS, TIMELINE, BOOKS } from './content.js';
import { shuffle, scrambleOrder } from './logic.js';

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

/** The options shown, in screen order. */
export function options(g, item, data) {
  if (g === 'tr') return data.opt.map((i) => TRIVIA[item].o[i]);
  if (g === 'tt') { const x = TWO_TRUTHS[item]; const all = [x.t[0][0], x.t[1][0], x.lie[0]]; return data.opt.map((i) => all[i]); }
  if (g === 'fv') return data.opt.map((vi) => verseHalves(VERSES[vi])[1]);
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

/* ----- Hangman ----- */
export const hangWord = (item) => HANGMAN[item][0];
export function hangMask(word, guessed) {
  return word.split('').map((c) => (c === ' ' ? ' ' : guessed.includes(c) ? c : '_'));
}
export const hangWrong = (word, guessed) => guessed.split('').filter((c) => !word.includes(c)).length;
export const hangSolved = (word, guessed) => word.split('').every((c) => c === ' ' || guessed.includes(c));
export const hangFound = (word, guessed) => new Set(word.replace(/ /g, '').split('').filter((c) => guessed.includes(c))).size;
export const hangLetters = (word) => new Set(word.replace(/ /g, '').split('')).size;

/** Is a player finished with this round? */
export function isDone(g, a) {
  if (!a) return false;
  if (CHOICE.includes(g)) return typeof a.a === 'number';
  if (g === 'hg') return !!(a.ok || a.out);
  return !!a.ok;
}
