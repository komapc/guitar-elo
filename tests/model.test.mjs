// Checks the scoring model in site/index.html: no dependencies, run with `node tests/model.test.mjs`.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const html = readFileSync(new URL('../site/index.html', import.meta.url), 'utf8');
const script = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
new Function(script); // the whole page script must parse

const model = script.split('/*MODEL*/')[1].split('/*END MODEL*/')[0];
const m = new Function(model + '; return { score, eloFromHours, hoursFromElo, QUESTIONS, EXAMPLE, MODEL, CAL_HOURS, gapBarClicks, noteAt, NOTE_RU, fretboardStop, REFS, VYSOTSKY };')();
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
check('gap metronome: two bars of clicks, then the click returns after exactly N silent bars', () => {
  for (const n of [1, 2, 4, 8, 16]) {
    const bars = Array.from({ length: 3 * (n + 1) + 2 }, (_, b) => m.gapBarClicks(b, n));
    assert.deepEqual(bars.slice(0, 2), [true, true], `n=${n} lead-in`);
    for (let start = 1; start + n + 1 < bars.length; start += n + 1) {
      assert.deepEqual(bars.slice(start + 1, start + n + 1), Array(n).fill(false), `n=${n} silence after bar ${start}`);
      assert.equal(bars[start + n + 1], true, `n=${n} click back at bar ${start + n + 1}`);
    }
  }
});
check('self-tests sit under the questions they check', () => {
  const tools = m.QUESTIONS.filter(q => q.tool).map(q => q.id + ':' + q.tool);
  assert.deepEqual(tools, ['changes:minute', 'gap:gap', 'fretboard:fretboard']);
});
check('fretboard quiz: notes match the question (3rd string, 7th fret = ре) and standard tuning', () => {
  assert.equal(m.NOTE_RU[m.noteAt(3, 7)][0], 'ре');
  assert.deepEqual([6, 5, 4, 3, 2, 1].map(s => m.NOTE_RU[m.noteAt(s, 0)][0]), ['ми', 'ля', 'ре', 'соль', 'си', 'ми']);
  assert.equal(m.noteAt(6, 12), m.noteAt(6, 0));
  assert.equal(m.noteAt(5, 5), m.noteAt(4, 0)); // the fifth-fret rule
  assert.equal(m.noteAt(3, 4), m.noteAt(2, 0)); // except G -> B, at the fourth fret
});
check('fretboard quiz: result maps to a stop, never the untested top one', () => {
  assert.equal(m.fretboardStop(10, 10, 1.4), 3);
  assert.equal(m.fretboardStop(9, 10, 3.5), 2);
  assert.equal(m.fretboardStop(8, 10, 9), 1);
  assert.equal(m.fretboardStop(6, 10, 1), 0);
  assert.equal(m.fretboardStop(0, 10, NaN), 0);
});
check('reference points: hours rise down the table; Vysotsky answers are valid', () => {
  for (let i = 1; i < m.REFS.length; i++) assert.ok(m.REFS[i].h > m.REFS[i - 1].h, m.REFS[i].who);
  for (const [id, a] of Object.entries(m.VYSOTSKY)) {
    const q = m.QUESTIONS.find(x => x.id === id);
    assert.ok(q && q.o[a], `${id}=${a}`);
  }
  assert.equal(m.QUESTIONS.find(q => q.id === 'repertoire').o[m.VYSOTSKY.repertoire][0], '200 и больше');
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
