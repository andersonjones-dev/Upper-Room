// Your Quiz: questions a quiz master writes, saved online under a quiz code.
// Pure functions (no screen, no network); tested with `node --test`.

/** Quiz codes: 6 characters with no look-alikes (no I, O, 0 or 1). */
export const QUIZ_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const QUIZ_CODE_LEN = 6;
export const QUIZ_CODE_RE = /^[A-HJ-NP-Z2-9]{6}$/;
export function makeQuizCode(rand = Math.random) {
  let s = '';
  for (let i = 0; i < QUIZ_CODE_LEN; i++) s += QUIZ_ALPHABET[Math.floor(rand() * QUIZ_ALPHABET.length)];
  return s;
}
/** What someone typed, as a code: capitals only, with spaces and dashes taken out. */
export const cleanQuizCode = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, QUIZ_CODE_LEN);

export const MAX_QUESTIONS = 60;
export const MIN_OPTS = 2;
export const MAX_OPTS = 4;
export const LIM = { name: 60, q: 200, o: 80, r: 80 };

const str = (v, n) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
/** A blank question for the editor. */
export const blankQuestion = () => ({ q: '', o: ['', '', '', ''], a: 0, r: '' });

/**
 * A quiz as stored or read back from the database, tidied: always { name, qs: [{ q, o[4], a, r }] }.
 * The database turns arrays into objects and drops empty strings, so this rebuilds them.
 */
export function normalizeQuiz(raw) {
  const x = raw && typeof raw === 'object' ? raw : {};
  const list = Array.isArray(x.qs) ? x.qs : Object.keys(x.qs || {}).sort((a, b) => a - b).map((k) => x.qs[k]);
  const qs = list.filter(Boolean).slice(0, MAX_QUESTIONS).map((y) => {
    const oRaw = Array.isArray(y.o) ? y.o : Object.keys(y.o || {}).reduce((acc, k) => { acc[+k] = y.o[k]; return acc; }, []);
    const o = [0, 1, 2, 3].map((k) => str(oRaw[k], LIM.o));
    const a = Number.isInteger(y.a) && y.a >= 0 && y.a < MAX_OPTS ? y.a : 0;
    return { q: str(y.q, LIM.q), o, a, r: str(y.r, LIM.r) };
  });
  return { name: str(x.name, LIM.name), qs };
}

/** Why a question can't be played yet ('' when it's ready). */
export function questionProblem(y) {
  if (!str(y.q, LIM.q)) return 'noQ';
  const filled = y.o.filter((o) => str(o, LIM.o));
  if (filled.length < MIN_OPTS) return 'twoAns';
  if (!str(y.o[y.a], LIM.o)) return 'noRight';
  return '';
}

/**
 * A question as played: the answers in the writer's order with blanks left out, and which one is right.
 * Returns { q, opts, a, r }.
 */
export function playable(y) {
  const idx = [0, 1, 2, 3].filter((k) => str(y.o[k], LIM.o));
  return { q: str(y.q, LIM.q), opts: idx.map((k) => str(y.o[k], LIM.o)), a: idx.indexOf(y.a), r: str(y.r, LIM.r) };
}
/** The questions that are ready to play, as played. */
export const playableList = (quiz) => normalizeQuiz(quiz).qs.filter((y) => !questionProblem(y)).map(playable);

/**
 * Pasted text to questions. One question per block (blocks are split by a blank line): the first
 * line is the question, then its answers one per line with * before the right one, and an optional
 * line starting "Ref:" (or "ವಚನ:") for a reference or note. Numbering such as "1." or "a)" is removed.
 * Returns [{ q, o, a, r, err }]; err is '' or the problem to fix.
 */
export function parsePaste(text) {
  const blocks = String(text || '').replace(/\r/g, '').split(/\n\s*\n/)
    .map((b) => b.split('\n').map((l) => l.trim()).filter(Boolean)).filter((b) => b.length);
  return blocks.map((b) => {
    const q = b[0].replace(/^(?:q(?:uestion)?\s*)?\d+\s*[.):-]\s*/i, '');
    const o = [];
    let a = -1, r = '';
    b.slice(1).forEach((line) => {
      const ref = line.match(/^(?:ref|reference|note|ವಚನ)\s*[:\-–]\s*(.*)$/i);
      if (ref) { r = ref[1].trim(); return; }
      let l = line.replace(/^[-•]\s*/, '');
      let right = false;
      if (/^\*/.test(l) || /\*$/.test(l)) { right = true; l = l.replace(/^\*\s*|\s*\*$/g, ''); }
      l = l.replace(/^(?:[a-dA-D]|[1-4])\s*[.)]\s+/, '');
      if (/^\*/.test(l)) { right = true; l = l.replace(/^\*\s*/, ''); }
      if (right && a < 0) a = o.length;
      o.push(l);
    });
    const err = o.length < MIN_OPTS ? 'twoAns' : o.length > MAX_OPTS ? 'fourAns' : a < 0 ? 'starRight' : '';
    return { q: str(q, LIM.q), o: [0, 1, 2, 3].map((k) => str(o[k], LIM.o)), a: Math.max(0, a), r: str(r, LIM.r), err };
  });
}

/** The order the questions are played in: as written, or shuffled. */
export function quizOrder(n, mix, rand = Math.random) {
  const seq = [...Array(n).keys()];
  if (!mix) return seq;
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [seq[i], seq[j]] = [seq[j], seq[i]]; }
  return seq;
}

/** The list of quizzes kept on this phone, newest first, with one entry per code. */
export function rememberQuiz(list, entry) {
  const rest = (Array.isArray(list) ? list : []).filter((x) => x && x.code !== entry.code);
  return [entry, ...rest].slice(0, 100);
}
