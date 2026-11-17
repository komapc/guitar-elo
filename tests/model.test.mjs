// Checks the scoring model in site/index.html: no dependencies, run with `node tests/model.test.mjs`.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const script = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
new Function(script); // the whole page script must parse

const model = script.split('/*MODEL*/')[1].split('/*END MODEL*/')[0];
const m = new Function(model + '; return { score, eloFromHours, hoursFromElo, QUESTIONS, EXAMPLE, MODEL, CAL_HOURS };')();
const pick = f => Object.fromEntries(m.QUESTIONS.map(q => [q.id, f(q)]));
let failed = 0;
const check = (name, fn) => {
  try { fn(); console.log('ok  ', name); } catch (e) { failed++; console.log('FAIL', name, '-', e.message); }
};

check('calibration point sits on the curve', () => {
  assert.ok(Math.abs(m.eloFromHours(m.CAL_HOURS) - m.MODEL.anchorElo) < 1);
});
check('hours <-> Elo round-trips', () => {
  for (const e of [500, 900, 1250, 1700, 2200, 2600]) assert.ok(Math.abs(m.eloFromHours(m.hoursFromElo(e)) - e) < 1, String(e));
});
check('every question lists options in rising hours', () => {
  for (const q of m.QUESTIONS) for (let i = 1; i < q.o.length; i++) assert.ok(q.o[i][1] > q.o[i - 1][1], `${q.id} option ${i}`);
});
check('example persona (3 years x 3 x 3 h) lands within 40 of the calibration', () => {
  const r = m.score(m.EXAMPLE);
  assert.ok(Math.abs(r.elo - m.MODEL.anchorElo) <= 40, `got ${Math.round(r.elo)}, anchor ${m.MODEL.anchorElo}`);
});
check('complete beginner stays near the floor', () => {
  assert.ok(m.score(pick(() => 0)).elo < 700);
});
check('top answers everywhere reach master range', () => {
  assert.ok(m.score(pick(q => q.o.length - 1)).elo > 2300);
});
check('unanswered questions are left out of the score', () => {
  const some = { chords: 3, metronome: 2, hardest: 1 };
  assert.equal(m.score(some).n, 3);
  assert.equal(m.score({}).n, 0);
});
check('every slider reaches professional hours, so strong players are not pulled down', () => {
  for (const q of m.QUESTIONS) assert.ok(q.o[q.o.length - 1][1] >= 12000, q.id);
});
check('the example persona leaves at least one question unanswered', () => {
  assert.ok(m.QUESTIONS.some(q => m.EXAMPLE[q.id] == null));
  for (const id in m.EXAMPLE) assert.ok(m.QUESTIONS.find(q => q.id === id)?.o[m.EXAMPLE[id]], id);
});
check('question count in the page text matches the quiz', () => {
  const n = m.QUESTIONS.length;
  for (const re of [/name="description" content="(\d+) /, /<p class="lede">(\d+) /, /Отвечено 0 из (\d+)/]) {
    assert.equal(Number(html.match(re)?.[1]), n, String(re));
  }
});

if (failed) { console.log(`${failed} failed`); process.exit(1); }
