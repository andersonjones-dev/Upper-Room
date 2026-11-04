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
