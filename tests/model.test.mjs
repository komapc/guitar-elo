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
check('"not my style" answers are left out of the score', () => {
  const base = { ...m.EXAMPLE };
  const skipped = { ...m.EXAMPLE, pick: 'skip', fingers: 'skip' };
  assert.equal(m.score(skipped).n, m.score(base).n - 2);
});

if (failed) { console.log(`${failed} failed`); process.exit(1); }
