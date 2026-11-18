// Checks the scoring model in site/app.js with each language's strings (site/i18n/*.js), and that the two
// languages agree. No dependencies: run with `node tests/model.test.mjs`.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = f => readFileSync(new URL('../site/' + f, import.meta.url), 'utf8');
const app = read('app.js');
new Function(app); // the whole page script must parse
const model = app.split('/*MODEL*/')[1].split('/*END MODEL*/')[0];
const EXPORTS = 'score, eloFromHours, hoursFromElo, QDEF, QUESTIONS, EXAMPLE, MODEL, CAL_HOURS, gapBarClicks, noteAt, NOTE_NAMES, fretboardStop, REFS, VYSOTSKY, CHORDS, EAR_LEVELS, EAR_PASS, EAR_ROUNDS, chordNotes, midiHz, CHESS_GROUPS, REACH_2200, EXPECTED, expectedElo, BANDS, CATS, curveAnchors';
const LANGS = {
  en: { page: read('index.html'), T: new Function(read('i18n/en.js') + '; return T;')(), d: 'D', open: ['E', 'A', 'D', 'G', 'B', 'E'], top: '200 or more', script: /<script src="i18n\/en\.js[^"]*"><\/script>\s*<script src="app\.js/ },
  ru: { page: read('ru/index.html'), T: new Function(read('i18n/ru.js') + '; return T;')(), d: 'ре', open: ['ми', 'ля', 'ре', 'соль', 'си', 'ми'], top: '200 и больше', script: /<script src="\.\.\/i18n\/ru\.js[^"]*"><\/script>\s*<script src="\.\.\/app\.js/ },
};
let failed = 0;
const check = (name, fn) => {
  try { fn(); console.log('ok  ', name); } catch (e) { failed++; console.log('FAIL', name, '-', e.message); }
};

// Saved answers are option indices shared by / and /ru/, so both languages must describe the same stops.
const shape = T => JSON.stringify({
  q: Object.keys(T.q).map(id => [id, T.q[id].o.length, typeof T.q[id].num, 'hint' in T.q[id]]),
  ui: Object.keys(T.ui).sort().map(k => [k, typeof T.ui[k]]),
  n: ['anchors', 'bands', 'notes', 'refs', 'groups', 'earLevels'].map(k => T[k].length),
  cats: Object.keys(T.cats), chords: Object.keys(T.chords),
});
check('both languages have the same keys, options and table lengths', () => {
  assert.equal(shape(LANGS.en.T), shape(LANGS.ru.T));
});

for (const [lang, L] of Object.entries(LANGS)) {
const m = new Function('T', model + `; return { ${EXPORTS} };`)(L.T);
const html = L.page;
const pick = f => Object.fromEntries(m.QUESTIONS.map(q => [q.id, f(q)]));
const check = (name, fn) => {
  try { fn(); console.log('ok  ', `[${lang}]`, name); } catch (e) { failed++; console.log('FAIL', `[${lang}]`, name, '-', e.message); }
};
check('every string the model needs exists', () => {
  assert.deepEqual(m.QDEF.map(d => d.id), Object.keys(L.T.q));
  for (const d of m.QDEF) assert.equal(L.T.q[d.id].o.length, d.h.length, d.id);
  for (const q of m.QUESTIONS) for (const [label] of q.o) assert.ok(typeof label === 'string' && label && !label.includes('undefined'), q.id);
  for (const x of [...m.curveAnchors().map(a => a.src), ...m.BANDS.flatMap(b => [b.name, b.guitar]), ...m.CATS.map(c => c.name),
    ...m.REFS.map(r => r.who), ...m.CHESS_GROUPS.map(c => c.who), ...m.EAR_LEVELS.map(l => l.name), ...Object.values(m.CHORDS).map(c => c[0])]) assert.ok(typeof x === 'string' && x, String(x));
});
check('the page loads its own strings before app.js', () => {
  assert.match(html, L.script);
  assert.match(html, new RegExp(`<html lang="${lang}">`));
  const url = 'https://guitar-elo.lipu.dev/' + (lang === 'en' ? '' : lang + '/');
  assert.ok(html.includes(`<link rel="canonical" href="${url}">`) && html.includes(`<meta property="og:url" content="${url}">`), 'canonical');
  for (const [h, u] of [['en', ''], ['ru', 'ru/'], ['x-default', '']]) assert.ok(html.includes(`<link rel="alternate" hreflang="${h}" href="https://guitar-elo.lipu.dev/${u}">`), h);
  assert.equal((html.match(/\?v=dev"/g) || []).length, 3, 'the three own assets carry the ?v=dev stamp the deploy replaces');
});

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
  assert.deepEqual(tools, ['changes:minute', 'gap:gap', 'fretboard:fretboard', 'chordear:chordear']);
});
check('fretboard quiz: notes match the question (3rd string, 7th fret = D) and standard tuning', () => {
  assert.equal(m.NOTE_NAMES[m.noteAt(3, 7)][0], L.d);
  assert.ok(m.QUESTIONS.find(q => q.id === 'fretboard').hint.toLowerCase().includes('</summary>' + L.d.toLowerCase()), 'the hint gives the same answer');
  assert.deepEqual([6, 5, 4, 3, 2, 1].map(s => m.NOTE_NAMES[m.noteAt(s, 0)][0]), L.open);
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
check('chord quiz: each level keeps the earlier chord types; every type sounds different', () => {
  for (let k = 1; k < m.EAR_LEVELS.length; k++) for (const t of m.EAR_LEVELS[k - 1].types) assert.ok(m.EAR_LEVELS[k].types.includes(t), `${t} in level ${k}`);
  const sets = Object.keys(m.CHORDS).map(t => m.chordNotes(60, t).map(n => n - 48).join(','));
  assert.equal(new Set(sets).size, sets.length);
  assert.deepEqual(m.chordNotes(60, 'maj'), [48, 60, 64, 67]);
  assert.deepEqual(m.chordNotes(57, 'min7'), [45, 57, 60, 64, 67]);
  assert.ok(Math.abs(m.midiHz(69) - 440) < 1e-9 && Math.abs(m.midiHz(60) - 261.6256) < 1e-3);
});
check('chord quiz: passing every level suggests at most the next-to-top stop', () => {
  const q = m.QUESTIONS.find(x => x.id === 'chordear');
  assert.equal(q.tool, 'chordear');
  assert.equal(m.EAR_LEVELS.length, q.o.length - 2);
  assert.ok(m.EAR_PASS > m.EAR_ROUNDS / 2 + 2, 'guessing major/minor must not pass easily');
});
check('chart data: the expected-rating line passes through the sample means; groups rise', () => {
  assert.ok(Math.abs(m.expectedElo(Math.pow(10, 3.9)) - 1990.8) < 1e-6);
  assert.ok(Math.abs(m.EXPECTED.b - 315.6) < 0.1 && Math.abs(m.EXPECTED.sd - 182) < 0.5);
  for (let i = 1; i < m.CHESS_GROUPS.length; i++) assert.ok(m.CHESS_GROUPS[i].e > m.CHESS_GROUPS[i - 1].e && m.CHESS_GROUPS[i].h > m.CHESS_GROUPS[i - 1].h);
  assert.ok(m.REACH_2200.lo < m.REACH_2200.h && m.REACH_2200.h < m.REACH_2200.hi);
  assert.equal(m.eloFromHours(m.REACH_2200.h), m.REACH_2200.e);
});
check('reference points: hours rise down the table; Vysotsky answers are valid', () => {
  for (let i = 1; i < m.REFS.length; i++) assert.ok(m.REFS[i].h > m.REFS[i - 1].h, m.REFS[i].who);
  for (const [id, a] of Object.entries(m.VYSOTSKY)) {
    const q = m.QUESTIONS.find(x => x.id === id);
    assert.ok(q && q.o[a], `${id}=${a}`);
  }
  assert.equal(m.QUESTIONS.find(q => q.id === 'repertoire').o[m.VYSOTSKY.repertoire][0], L.top);
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
  for (const re of [/name="description" content="(\d+) /, /property="og:description" content="(\d+) /, /<p class="lede">(\d+) /]) {
    assert.equal(Number(html.match(re)?.[1]), n, String(re));
  }
  assert.ok(html.includes(`id="progress">${L.T.ui.progress(0, n)}<`), 'progress placeholder');
});
}

if (failed) { console.log(`${failed} failed`); process.exit(1); }
