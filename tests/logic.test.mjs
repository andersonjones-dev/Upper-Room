import test from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../js/logic.js';
import { VERSES, TRIVIA, EMOJI, TRIBES } from '../js/content.js';

test('roman numerals', () => {
  assert.deepEqual([1, 2, 4, 5, 9, 10, 12].map(L.roman), ['I', 'II', 'IV', 'V', 'IX', 'X', 'XII']);
});

test('scrambleOrder is a permutation and never already solved', () => {
  for (let n = 2; n <= 6; n++) for (let k = 0; k < 200; k++) {
    const o = L.scrambleOrder(n);
    assert.deepEqual([...o].sort(), [...Array(n).keys()]);
    assert.ok(!o.every((v, i) => v === i));
  }
});

test('room codes are four letters without I or O', () => {
  for (let i = 0; i < 500; i++) assert.match(L.makeCode(), /^[A-HJ-NP-Z]{4}$/);
  assert.equal(L.cleanCode(' la-mp9 '), 'LAMP');
});

test('emoji answers accept natural variations', () => {
  const find = (a) => EMOJI.find((e) => e.a === a).keys;
  assert.ok(L.emojiMatches("Noah's Ark", find("Noah's ark")));
  assert.ok(L.emojiMatches('noahs ark', find("Noah's ark")));
  assert.ok(L.emojiMatches('the flood', find("Noah's ark")));
  assert.ok(L.emojiMatches('Jonah and the whale', find('Jonah and the great fish')));
  assert.ok(L.emojiMatches("Daniel in the lions' den", find("Daniel in the lions' den")));
  assert.ok(L.emojiMatches('lions den', find("Daniel in the lions' den")));
  assert.ok(L.emojiMatches('Feeding of the 5000', find('Feeding the five thousand')));
  assert.ok(L.emojiMatches('jesus walks on the water', find('Jesus walks on water')));
  assert.ok(!L.emojiMatches('water', find('Jesus walks on water')));
  assert.ok(!L.emojiMatches('', find('Jonah and the great fish')));
  assert.ok(!L.emojiMatches('moses', find('Jonah and the great fish')));
  assert.ok(L.emojiMatches('Zacchaeus', find('Zacchaeus up the tree')));
});

test('isOrderCorrect', () => {
  assert.ok(L.isOrderCorrect([0, 1, 2], 3));
  assert.ok(!L.isOrderCorrect([0, 2, 1], 3));
  assert.ok(!L.isOrderCorrect([0, 1], 3));
});

test('scramble scoring ranks by time and ignores wrong answers', () => {
  const r = L.scoreScramble({ a: { ok: true, ms: 9000 }, b: { ok: true, ms: 5000 }, c: { ok: false, placed: 3 }, d: { ok: true, ms: 12000 }, e: { ok: true, ms: 15000 } });
  assert.deepEqual(r.order, ['b', 'a', 'd', 'e']);
  assert.deepEqual(r.pts, { b: 300, a: 200, d: 100, e: 100 });
  assert.equal(r.first, 'b');
});

test('trivia scoring: first right answer gets the bonus', () => {
  const r = L.scoreTrivia({ a: { a: 1, at: 200 }, b: { a: 1, at: 100 }, c: { a: 2, at: 50 } }, 1);
  assert.deepEqual(r.pts, { b: 200, a: 100 });
  assert.equal(r.first, 'b');
  assert.equal(L.scoreTrivia({ c: { a: 2, at: 50 } }, 1).first, null);
});

test('emoji scoring ranks by server time', () => {
  const r = L.scoreEmoji({ x: { ok: true, at: 30 }, y: { ok: true, at: 10 }, z: { tries: 2 } });
  assert.deepEqual(r.order, ['y', 'x']);
});

test('tribes are shared out over the questions', () => {
  assert.deepEqual(L.tribesFor(0, 12), [0]);
  assert.deepEqual(L.tribesFor(11, 12), [11]);
  assert.deepEqual(L.tribesFor(0, 6), [0, 1]);
  assert.deepEqual(L.tribesFor(5, 6), [10, 11]);
  const all = new Set(); for (let i = 0; i < 6; i++) L.tribesFor(i, 6).forEach((t) => all.add(t));
  assert.equal(all.size, 12);
});

test('teams balance and shuffle evenly', () => {
  assert.equal(L.smallerTeam({}), 'ruby');
  assert.equal(L.smallerTeam({ a: { team: 'ruby' } }), 'sapphire');
  const t = L.shuffleTeams(['a', 'b', 'c', 'd', 'e']);
  const c = L.countClaims(t);
  assert.ok(Math.abs(c.ruby - c.sapphire) <= 1);
});

test('allDone', () => {
  assert.ok(!L.allDone('vs', {}, []));
  assert.ok(L.allDone('vs', { a: { ok: true } }, ['a']));
  assert.ok(!L.allDone('vs', { a: { ok: false } }, ['a']));
  assert.ok(L.allDone('tr', { a: { a: 0 } }, ['a']));
  assert.ok(!L.allDone('tr', { a: { a: 0 } }, ['a', 'b']));
});

test('content is well formed', () => {
  assert.equal(TRIBES.length, 12);
  assert.ok(TRIVIA.length >= 12 && EMOJI.length >= 12 && VERSES.length >= 8);
  TRIVIA.forEach((q) => { assert.equal(q.o.length, 4, q.q); assert.ok(q.a >= 0 && q.a < 4, q.q); assert.ok(q.ref); });
  VERSES.forEach((v) => { assert.ok(v.parts.length >= 3, v.ref); assert.equal(new Set(v.parts).size, v.parts.length, v.ref); });
  EMOJI.forEach((e) => {
    assert.ok(e.keys.length, e.a);
    assert.ok(L.emojiMatches(e.a, e.keys), 'own answer must be accepted: ' + e.a);
  });
  // Each game's settings never ask for more rounds than there is content.
  assert.ok(Math.max(...L.SETTINGS.vs.rounds) <= VERSES.length);
  assert.ok(Math.max(...L.SETTINGS.tr.rounds) <= TRIVIA.length);
  assert.ok(Math.max(...L.SETTINGS.em.rounds) <= EMOJI.length);
});

test('clock formatting', () => {
  assert.equal(L.fmtClock(0), '0:00');
  assert.equal(L.fmtClock(65), '1:05');
  assert.equal(L.secondsLeft(10500, 10000), 1);
  assert.equal(L.ordinal(1), '1st'); assert.equal(L.ordinal(2), '2nd'); assert.equal(L.ordinal(11), '11th'); assert.equal(L.ordinal(23), '23rd');
});

test('bots: stable plans, sensible timings and accuracy', () => {
  const a = L.botPlan('tr', 'tr:3:100', 'bot1', 20, 2), b = L.botPlan('tr', 'tr:3:100', 'bot1', 20, 2);
  assert.deepEqual(a, b);
  let right = 0;
  for (let i = 0; i < 400; i++) {
    const p = L.botPlan('tr', 'k' + i, 'bot', 20, 1);
    assert.ok(p.at > 0 && p.at < 20000);
    assert.ok(p.a >= 0 && p.a < 4);
    if (p.ok) { right++; assert.equal(p.a, 1); } else assert.notEqual(p.a, 1);
  }
  assert.ok(right > 200 && right < 320, 'about 65% right: ' + right);
  for (const g of ['vs', 'em']) for (let i = 0; i < 100; i++) { const p = L.botPlan(g, 'r' + i, 'b', 45); assert.ok(p.at < 45000); }
  assert.equal(L.nextBotName({ x: { name: 'Ruth' } }), 'Boaz');
});

/* ----- 1.2 games ----- */
import * as G from '../js/games.js';
import { HANGMAN, TWO_TRUTHS, TIMELINE, BOOKS } from '../js/content.js';

test('content was quadrupled and new games have enough content', () => {
  assert.ok(VERSES.length >= 64, 'verses ' + VERSES.length);
  assert.ok(TRIVIA.length >= 128, 'trivia ' + TRIVIA.length);
  assert.ok(EMOJI.length >= 96, 'emoji ' + EMOJI.length);
  assert.equal(BOOKS.length, 66);
  assert.ok(HANGMAN.length >= 100 && TWO_TRUTHS.length >= 40 && TIMELINE.length >= 50);
  for (const g of ['fv', 'hg', 'tt', 'bk', 'tl']) assert.ok(Math.max(...L.SETTINGS[g].rounds) <= G.contentLength(g), g);
  HANGMAN.forEach(([w]) => assert.match(w, /^[A-Z ]+$/));
});

test('choice games: the right option is where the screen shows it', () => {
  for (let k = 0; k < 300; k++) {
    const item = k % TRIVIA.length;
    const d = G.roundData('tr', item);
    assert.equal(G.options('tr', item, d)[G.correctOption('tr', item, d)], TRIVIA[item].o[TRIVIA[item].a]);
    const t = k % TWO_TRUTHS.length, dt = G.roundData('tt', t);
    assert.equal(G.options('tt', t, dt)[G.correctOption('tt', t, dt)], TWO_TRUTHS[t].lie[0]);
    const v = k % VERSES.length, dv = G.roundData('fv', v);
    assert.equal(new Set(dv.opt).size, 4);
    assert.equal(G.options('fv', v, dv)[G.correctOption('fv', v, dv)], G.verseHalves(VERSES[v])[1]);
    const e = k % TIMELINE.length, de = G.roundData('tl', e);
    assert.equal(de.anchors.length, 4);
    assert.ok(!de.anchors.includes(e));
    const gap = G.correctOption('tl', e, de);
    const line = [...de.anchors.slice(0, gap), e, ...de.anchors.slice(gap)];
    assert.deepEqual(line, [...line].sort((a, b) => a - b));
  }
});

test('finish the verse: start + ending is the whole verse', () => {
  VERSES.forEach((v) => { const [a, b] = G.verseHalves(v); assert.ok(a && b); assert.equal(a + ' ' + b, v.parts.join(' ')); });
});

test('books sort: arrangement check', () => {
  for (let k = 0; k < 100; k++) {
    const d = G.roundData('bk', 0);
    assert.equal(d.set.length, 6);
    assert.deepEqual(d.set, [...d.set].sort((a, b) => a - b));
    assert.ok(G.booksInPlace(d, [0, 1, 2, 3, 4, 5]) < 6, 'starts jumbled');
    const solved = [0, 1, 2, 3, 4, 5].sort((a, b) => d.order[a] - d.order[b]);
    assert.equal(G.booksInPlace(d, solved), 6);
  }
});

test('hangman rules', () => {
  const w = 'RED SEA';
  assert.deepEqual(G.hangMask(w, 'E'), ['_', 'E', '_', ' ', '_', 'E', '_']);
  assert.equal(G.hangWrong(w, 'EXZ'), 2);
  assert.ok(!G.hangSolved(w, 'RED'));
  assert.ok(G.hangSolved(w, 'REDSA'));
  assert.equal(G.hangLetters(w), 5);
  assert.equal(G.hangFound(w, 'RQE'), 2);
});

test('isDone and allDone for every game', () => {
  assert.ok(G.isDone('fv', { a: 0 })); assert.ok(!G.isDone('fv', {}));
  assert.ok(G.isDone('hg', { out: true })); assert.ok(G.isDone('hg', { ok: true })); assert.ok(!G.isDone('hg', { g: 'A' }));
  assert.ok(G.isDone('bk', { ok: true })); assert.ok(!G.isDone('bk', { ok: false, checks: 2 }));
  for (const g of ['tr', 'fv', 'tl', 'tt']) assert.ok(L.allDone(g, { a: { a: 1 } }, ['a']));
  assert.ok(L.allDone('hg', { a: { out: true }, b: { ok: true } }, ['a', 'b']));
});

test('two truths: first right answer gets the bonus (scored like trivia)', () => {
  const r = L.scoreTrivia({ a: { a: 2, at: 5 }, b: { a: 2, at: 1 }, c: { a: 0, at: 0 } }, 2);
  assert.deepEqual(r.pts, { b: 200, a: 100 });
  assert.equal(r.first, 'b');
});

test('bots answer within range for every game', () => {
  for (const g of ['tr', 'fv', 'tl', 'tt']) for (let i = 0; i < 100; i++) {
    const n = g === 'tl' ? 5 : g === 'tt' ? 3 : 4, c = i % n;
    const p = L.botPlan(g, 'k' + i, 'b', 20, c);
    assert.ok(p.a >= 0 && p.a < n, g);
    assert.equal(p.ok, p.a === c);
  }
});

test('Kannada content lines up with English', async () => {
  const T = await import('../js/text.js');
  const EN = T.content('en'), KN = T.content('kn');
  for (const k of ['VERSES', 'TRIVIA', 'EMOJI', 'HANGMAN', 'TWO_TRUTHS', 'TIMELINE', 'BOOKS', 'TRIBES']) assert.equal(KN[k].length, EN[k].length, k);
  KN.VERSES.forEach((v, i) => { assert.equal(v.parts.length, EN.VERSES[i].parts.length, 'verse ' + i); assert.equal(new Set(v.parts).size, v.parts.length, 'unique pieces ' + i); });
  KN.TRIVIA.forEach((q, i) => { assert.equal(q.o.length, 4, 'trivia ' + i); assert.equal(new Set(q.o).size, 4, 'trivia options ' + i); });
  assert.equal(T.refKn('Psalm 119:105'), 'ಕೀರ್ತನೆಗಳು 119:105');
  assert.equal(T.refKn('1 Samuel 17:49'), '1 ಸಮುವೇಲನು 17:49');
});

test('Kannada hangman and emoji', async () => {
  const T = await import('../js/text.js');
  const KN = T.content('kn');
  assert.deepEqual(G.hangTokens('ಅಬ್ರಹಾಮ'), [['ಅ', 'ಬ್ರ', 'ಹಾ', 'ಮ']]);
  assert.equal(G.hangSolved('ಅಬ್ರಹಾಮ', 'ಮ|ಅ|ಬ್ರ|ಹಾ'), true);
  assert.equal(G.hangWrong('ಅಬ್ರಹಾಮ', 'ಅ|ಕ'), 1);
  KN.HANGMAN.forEach((_, i) => { const keys = G.hangKeys(i, KN); const word = new Set(G.hangTokens(KN.HANGMAN[i][0]).flat());
    assert.equal(keys.length % 6, 0, 'full rows ' + i); assert.equal(new Set(keys).size, keys.length); for (const a of word) assert.ok(keys.includes(a), 'key for ' + a); });
  assert.equal(L.emojiMatches('ನೋಹನ ನಾವೆ', KN.EMOJI[2].keys), true);
  assert.equal(L.emojiMatches("Noah's ark", KN.EMOJI[2].keys), true);
  assert.equal(L.emojiMatches('ದಾವೀದ', KN.EMOJI[2].keys), false);
  KN.EMOJI.forEach((e, i) => assert.equal(L.emojiMatches(e.a, e.keys), true, 'own answer matches ' + i));
});

test('content is tagged with a quiz book and difficulty, and every quiz book has enough of each game', async () => {
  const P = await import('../js/pool.js');
  const C = await import('../js/content.js');
  const G2 = await import('../js/games.js');
  const NEED = { vs: 5, fv: 5, tr: 12, em: 8, hg: 8, tt: 8, tl: 8 };
  for (const g of Object.keys(NEED)) {
    const total = G2.contentLength(g);
    for (let i = 0; i < total; i++) assert.ok(P.LEVELS.includes(P.tagOf(g, i, C).d), `${g} ${i} difficulty`);
    for (const b of P.QUIZ_BOOKS) {
      const n = P.eligible(g, total, C, { book: b, level: 'h' }).length;
      assert.ok(n >= NEED[g], `${g} ${b}: ${n}`);
    }
    // Easy is a subset of Medium, Medium of Hard
    const e = P.eligible(g, total, C, { level: 'e' }), m = P.eligible(g, total, C, { level: 'm' }), h = P.eligible(g, total, C, { level: 'h' });
    assert.ok(e.length < m.length && m.length < h.length && e.every((i) => m.includes(i)), g + ' levels');
  }
  C.HANGMAN.forEach(([w], i) => assert.match(w, /^[A-Z]+( [A-Z]+)*$/, 'hangman ' + i));
});

test('no item repeats until the whole pool has come up', async () => {
  const P = await import('../js/pool.js');
  const pool = [...Array(10).keys()];
  let seen = [], got = [];
  for (let k = 0; k < 3; k++) { const r = P.pickFresh(pool, 3, seen); got.push(...r.seq); seen = r.seen; }
  assert.equal(new Set(got).size, 9);
  const r = P.pickFresh(pool, 3, seen); // 1 left, then a new cycle
  assert.ok(r.seq.includes(pool.find((i) => !got.includes(i))));
  assert.equal(new Set(r.seq).size, 3);
});

test('timeline: anchors can always be ordered without doubt, in all books and in each quiz book', async () => {
  const P = await import('../js/pool.js');
  const C = await import('../js/content.js');
  const G2 = await import('../js/games.js');
  assert.equal(P.tlComparable('Matthew 26', 'John 13:5'), false);
  assert.equal(P.tlComparable('Matthew 26:39', 'Matthew 26:74'), true);
  assert.equal(P.tlComparable('Matthew 26', 'Matthew 26:74'), false);
  assert.equal(P.tlComparable('Exodus 7–11', 'Exodus 10:13'), false);
  assert.equal(P.tlComparable('Daniel 6:16', '2 Kings 25'), false);
  for (const book of ['', ...P.QUIZ_BOOKS]) {
    const pool = P.eligible('tl', C.TIMELINE.length, C, { book, level: 'h' });
    for (const item of pool) {
      const d = G2.roundData('tl', item, Math.random, { pool, level: 'h' });
      assert.ok(d.anchors.length >= 3, `${book} ${item} anchors`);
      const all = [...d.anchors, item];
      for (const a of all) for (const b of all) if (a !== b) assert.ok(P.tlComparable(C.TIMELINE[a][1], C.TIMELINE[b][1]), `${C.TIMELINE[a][0]} / ${C.TIMELINE[b][0]}`);
    }
  }
});

test('hard mode: stray verse pieces, fewer lives, shorter timer', async () => {
  const G2 = await import('../js/games.js');
  const d = G2.roundData('vs', 0, Math.random, { level: 'h' });
  const n = VERSES[0].parts.length;
  assert.equal(d.order.length, n + G2.DECOYS);
  assert.notEqual(d.dv, 0);
  assert.ok(G2.pieceText(0, d, n).length > 0);
  assert.equal(G2.roundData('vs', 0, Math.random, { level: 'm' }).order.length, n);
  assert.equal(G2.livesFor('h'), 4); assert.equal(G2.livesFor('m'), 6);
  assert.equal(G2.secsFor(60, 'h'), 45); assert.equal(G2.secsFor(20, 'h'), 15); assert.equal(G2.secsFor(30, 'e'), 30);
});

test('Bible Wordle rules and words', async () => {
  const G2 = await import('../js/games.js');
  const T = await import('../js/text.js');
  const P = await import('../js/pool.js');
  const C = await import('../js/content.js');
  const sc = (g, a) => G2.wdScore(g.split(''), a.split(''));
  assert.equal(sc('DAVID', 'DAVID'), 'ggggg');
  assert.equal(sc('AARON', 'HAMAN'), 'ygxxg'); assert.equal(sc('ABBAS', 'HAMAN'), 'yxxgx');
  assert.equal(sc('SLING', 'CROWN'), 'xxxyx');
  assert.equal(G2.wdValid('CROWN'.split(''), 'HAMAN'.split('')), true);
  assert.equal(G2.wdValid('QQQQQ'.split(''), 'HAMAN'.split('')), false);
  const EN = T.content('en'), KN = T.content('kn');
  assert.equal(KN.WORDLE.length, EN.WORDLE.length);
  EN.WORDLE.forEach(([w], i) => {
    assert.match(w, /^[A-Z]{5}$/);
    assert.ok(G2.wdValid(w.split(''), w.split('')));
    const k = G2.wdTiles(KN.WORDLE[i][0]);
    assert.ok(k.length >= 3 && k.length <= 5, 'kannada tiles ' + KN.WORDLE[i][0]);
    const keys = G2.wdKeys(i, KN);
    assert.equal(keys.length, 24); assert.equal(new Set(keys).size, 24);
    k.forEach((a) => assert.ok(keys.includes(a), 'key ' + a));
  });
  for (const b of P.QUIZ_BOOKS) assert.ok(P.eligible('wd', EN.WORDLE.length, C, { book: b, level: 'h' }).length >= 4, 'wordle ' + b);
  const r = L.scoreWordle({ a: { ok: true, n: 4, ms: 9000 }, b: { ok: true, n: 3, ms: 30000 }, c: { out: true, n: 6 }, d: { ok: true, n: 4, ms: 5000 } });
  assert.deepEqual(r.order, ['b', 'd', 'a']);
});
