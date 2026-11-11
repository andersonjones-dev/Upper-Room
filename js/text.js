// Game content in the phone's language. The host only shares item numbers, so English and Kannada
// phones can play the same round. Kannada lists match the English ones item for item.
import * as EN from './content.js';
import { KN_VERSES } from './kn/verses.js';
import { KN_BOOKS, KN_TRIBES, KN_TRIVIA, KN_EMOJI, KN_HANGMAN, KN_TWO_TRUTHS, KN_TIMELINE, KN_WORDLE, KN_ESCAPE } from './kn/content.js';
import { getLang, getVerseLang, CAT_KN } from './i18n.js';

const ALIAS = { Psalm: 'Psalms', 'Song of Songs': 'Song of Solomon' };
/** "Judges 14:6" -> "ನ್ಯಾಯಸ್ಥಾಪಕರು 14:6". Anything it can't read is returned unchanged. */
export function refKn(ref) {
  const m = String(ref || '').match(/^((?:[1-3] )?[A-Z][A-Za-z ]*?)\s+(\d[\d:–\-, ]*)$/);
  if (!m) { const b = EN.BOOKS.indexOf(ALIAS[ref] || ref); return b < 0 ? ref : KN_BOOKS[b]; }
  const bi = EN.BOOKS.indexOf(ALIAS[m[1]] || m[1]);
  return bi < 0 ? ref : KN_BOOKS[bi] + ' ' + m[2];
}
/** The reference at the end of an English sentence ("… Judges 16:5"), or ''. */
export function trailingRef(s) {
  const m = String(s || '').match(/((?:[1-3] )?[A-Z][a-z]+(?: of [A-Z][a-z]+)? \d+(?::\d+(?:[–-]\d+)?)?)\.?$/);
  return m ? m[1] : '';
}

let kn = null;
function buildKn() {
  return {
    VERSES: EN.VERSES.map((v, i) => ({ ref: refKn(v.ref), parts: KN_VERSES[i] })),
    TRIVIA: EN.TRIVIA.map((x, i) => ({ q: KN_TRIVIA[i][0], o: KN_TRIVIA[i][1], a: x.a, ref: refKn(x.ref) })),
    EMOJI: EN.EMOJI.map((x, i) => ({ e: x.e, a: KN_EMOJI[i][0], ref: refKn(x.ref), keys: [...KN_EMOJI[i][1], ...x.keys] })),
    HANGMAN: EN.HANGMAN.map((x, i) => [KN_HANGMAN[i], CAT_KN[x[1]] || x[1]]),
    TWO_TRUTHS: EN.TWO_TRUTHS.map((x, i) => {
      const [who, truths, lie] = KN_TWO_TRUTHS[i], r = trailingRef(x.lie[1]);
      return { who, t: [[truths[0], refKn(x.t[0][1])], [truths[1], refKn(x.t[1][1])]], lie: [lie[0], lie[1] + (r ? ' ' + refKn(r) : '')] };
    }),
    TIMELINE: EN.TIMELINE.map((x, i) => [KN_TIMELINE[i], refKn(x[1])]),
    WORDLE: EN.WORDLE.map((x, i) => [KN_WORDLE[i], x[1], x[2]]),
    ESCAPE: EN.ESCAPE.map((x, i) => [KN_ESCAPE[i], x[1], refKn(x[2]), x[3]]),
    BOOKS: KN_BOOKS, TRIBES: KN_TRIBES
  };
}
/** All game content for a language ('en' or 'kn'); defaults to this phone's language. */
const knAll = () => kn || (kn = buildKn());
const mixed = {};
/** All game content for a language ('en' or 'kn'). With no argument: this phone's language, with
 *  the verses in the phone's Bible-verse language (which can differ from the interface). */
export function content(lang) {
  if (lang) return lang === 'kn' ? knAll() : EN;
  const base = getLang() === 'kn' ? 'kn' : 'en', verses = getVerseLang() === 'kn' ? 'kn' : 'en';
  if (base === verses) return content(base);
  const key = base + verses;
  return mixed[key] || (mixed[key] = { ...content(base), VERSES: content(verses).VERSES });
}
