// Guitar Elo page logic, shared by / (English) and /ru/ (Russian). Every visible string comes from T, which
// i18n/en.js or i18n/ru.js defines before this file loads; the numbers (hours, weights, curve) live only here.
/*MODEL*/
const CAL = { years: 3, perWeek: 3, hours: 3 };
const CAL_HOURS = CAL.years * 52 * CAL.perWeek * CAL.hours; // 1404
const MODEL = { anchorElo: 1250 };
const ELO_MAX = 2850;
const MIN_COUNTED = 6;

function curveAnchors() {
  return [
    { h: 0, e: 400, src: T.anchors[0] },
    { h: 100, e: 750, src: T.anchors[1] },
    { h: CAL_HOURS, e: MODEL.anchorElo, src: T.anchors[2], cal: true },
    { h: 11053, e: 2200, src: T.anchors[3] },
    { h: 25000, e: 2500, src: T.anchors[4] },
    { h: 50000, e: 2750, src: T.anchors[5] },
  ];
}
const lx = h => Math.log10(Math.max(0, h) + 10);

function eloFromHours(h) {
  const A = curveAnchors(), x = lx(h);
  for (let i = 0; i < A.length - 1; i++) {
    const x0 = lx(A[i].h), x1 = lx(A[i + 1].h);
    if (x <= x1 || i === A.length - 2) {
      const e = A[i].e + (x - x0) * (A[i + 1].e - A[i].e) / (x1 - x0);
      return Math.min(ELO_MAX, Math.max(A[0].e, e));
    }
  }
}
function hoursFromElo(e) {
  const A = curveAnchors();
  e = Math.min(ELO_MAX, Math.max(A[0].e, e));
  for (let i = 0; i < A.length - 1; i++) {
    if (e <= A[i + 1].e || i === A.length - 2) {
      const x0 = lx(A[i].h), x1 = lx(A[i + 1].h);
      const x = x0 + (e - A[i].e) * (x1 - x0) / (A[i + 1].e - A[i].e);
      return Math.max(0, Math.pow(10, x) - 10);
    }
  }
}

const CATS = ['harmony', 'rhythm', 'right', 'left', 'ear', 'music'].map(id => ({ id, name: T.cats[id] }));
// Stops of a numeric slider: hours grow geometrically between the [value, hours] points; rounded to 2 digits.
function numeric(values, pts, label) {
  return values.map(v => {
    let i = 0;
    while (i < pts.length - 2 && v > pts[i + 1][0]) i++;
    const [v0, h0] = pts[i], [v1, h1] = pts[i + 1];
    const t = Math.min(1, Math.max(0, (v - v0) / (v1 - v0)));
    const h = h0 * Math.pow(h1 / h0, t);
    const r = Math.pow(10, Math.floor(Math.log10(h)) - 1);
    return [label(v), Math.round(h / r) * r];
  });
}

// Each stop: typical practice hours to reach it. The hours are the author's estimates, not measurements.
// Every slider runs from a beginner to a professional, so a strong player is never pulled down by a short scale.
// The labels come from T.q[id].o, one per stop, in the same order. A numeric slider (`num`) adds stops for
// `values`, with hours growing geometrically between the [value, hours] points, labelled by T.q[id].num(value).
const NUM_PICK = { values: [50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200],
  pts: [[50, 30], [60, 80], [80, 250], [100, 700], [120, 2000], [140, 4000], [160, 9000], [180, 16000], [200, 25000]] };
const NUM_REPERTOIRE = { values: [0, 1, 2, 3, 5, 7, 10, 15, 20, 30, 50, 75, 100, 150, 200],
  pts: [[0, 8], [2, 20], [5, 60], [10, 250], [20, 1000], [30, 1600], [50, 2800], [100, 6000], [200, 15000]] };
const QDEF = [
  { id: 'chords', cat: 'harmony', w: 1, h: [5, 25, 120, 400, 1500, 9000, 28000] },
  { id: 'changes', cat: 'harmony', w: 0.6, tool: 'minute', h: [3, 12, 30, 70, 150, 500, 1500, 6000, 15000] },
  { id: 'transpose', cat: 'harmony', w: 0.8, h: [10, 40, 300, 1500, 5000, 15000] },
  { id: 'theory', cat: 'harmony', w: 0.6, h: [20, 300, 1200, 5000, 18000] },
  { id: 'metronome', cat: 'rhythm', w: 1.2, tool: 'rhythm', h: [10, 80, 400, 1800, 6000, 25000] },
  { id: 'gap', cat: 'rhythm', w: 0.8, tool: 'gap', h: [20, 150, 600, 2000, 6000, 18000] },
  { id: 'strum', cat: 'rhythm', w: 0.8, h: [8, 50, 800, 3500, 14000] },
  { id: 'partner', cat: 'rhythm', w: 0.8, h: [30, 150, 800, 3000, 12000] },
  { id: 'pick', cat: 'right', w: 1, h: [10], num: NUM_PICK },
  { id: 'fingers', cat: 'right', w: 1, h: [10, 50, 800, 1500, 6000, 25000] },
  { id: 'dynamics', cat: 'right', w: 0.8, h: [20, 150, 1200, 5000, 25000] },
  { id: 'noise', cat: 'right', w: 0.8, h: [10, 20, 200, 1200, 5000, 15000] },
  { id: 'bend', cat: 'left', w: 0.8, h: [10, 40, 200, 800, 2500, 7000, 18000] },
  { id: 'vibrato', cat: 'left', w: 0.8, h: [10, 30, 200, 1200, 4000, 20000] },
  { id: 'legato', cat: 'left', w: 0.8, h: [10, 40, 300, 1500, 5000, 22000] },
  { id: 'fretboard', cat: 'ear', w: 0.8, tool: 'fretboard', h: [20, 150, 1200, 4000, 15000] },
  { id: 'ear', cat: 'ear', w: 1, h: [8, 20, 150, 1400, 4500, 20000] },
  { id: 'chordear', cat: 'ear', w: 0.6, tool: 'chordear', h: [15, 150, 1200, 4000, 15000] },
  { id: 'reading', cat: 'ear', w: 0.6, h: [20, 300, 1200, 6000, 18000] },
  { id: 'improv', cat: 'music', w: 1, h: [20, 150, 1300, 5000, 22000] },
  { id: 'repertoire', cat: 'music', w: 0.8, h: [], num: NUM_REPERTOIRE },
  { id: 'hardest', cat: 'music', w: 1.2, h: [8, 30, 200, 700, 1800, 4000, 9000, 28000] },
  { id: 'party', cat: 'music', w: 0.7, h: [10, 30, 200, 1500, 6000, 20000] },
  { id: 'record', cat: 'music', w: 0.7, h: [40, 200, 1200, 5000, 15000] },
  { id: 'stage', cat: 'music', w: 0.6, h: [200, 1200, 5000, 15000, 30000] },
];
const QUESTIONS = QDEF.map(({ h, num, ...d }) => {
  const t = T.q[d.id], o = h.map((x, i) => [t.o[i], x]);
  if (num) o.push(...numeric(num.values, num.pts, t.num));
  return { ...d, text: t.text, ...(t.hint ? { hint: t.hint } : {}), o };
});

// The 3×3×3 guitarist used as the example and as the calibration persona. Missing ids stay unanswered.
const EXAMPLE = { chords: 4, changes: 6, transpose: 3, theory: 2, metronome: 3, gap: 2, strum: 2, partner: 2,
  pick: 7, fingers: 3, dynamics: 2, noise: 3, bend: 3, vibrato: 3, legato: 3, fretboard: 2, ear: 3, chordear: 1,
  improv: 2, repertoire: 9, hardest: 4, party: 3, record: 2, stage: 1 };

const BANDS = [0, 800, 1200, 1600, 2000, 2200, 2400, 2500, 2700].map((min, i) => ({ min, name: T.bands[i][0], guitar: T.bands[i][1] }));
const bandOf = e => BANDS.reduce((b, x) => (e >= x.min ? x : b), BANDS[0]);

// An answer that a test on the page set ("Set it") counts MEASURED_WEIGHT times as much, as long as the slider stays
// on the stop the test showed; moved elsewhere, it is a self-report again. The factor is a judgement call, kept modest
// because a short test in a browser is noisy too (an online beat test retested at only r ≈ .3, Harrison & Müllensiefen 2018).
const MEASURED_WEIGHT = 1.5;
function score(answers, measured = {}) {
  let sw = 0, se = 0, n = 0;
  const items = [], cats = {};
  for (const q of QUESTIONS) {
    const a = answers[q.id];
    if (a == null || a === 'skip' || !q.o[a]) continue;
    const e = eloFromHours(q.o[a][1]), w = q.w * (measured[q.id] === a ? MEASURED_WEIGHT : 1);
    items.push({ e, w });
    sw += w; se += w * e; n++;
    const c = cats[q.cat] || (cats[q.cat] = { sw: 0, se: 0 });
    c.sw += w; c.se += w * e;
  }
  if (!n) return { n: 0, catElo: {} };
  const elo = se / sw;
  const sd = Math.sqrt(items.reduce((s, it) => s + it.w * (it.e - elo) ** 2, 0) / sw);
  const catElo = {};
  for (const k in cats) catElo[k] = cats[k].se / cats[k].sw;
  return { n, elo, sd, spread: Math.min(250, 60 + 0.4 * sd), catElo };
}
// Gap-click metronome: `lead` bars of clicks to lock onto the tempo, then one bar of clicks and `silent` bars of silence, repeated.
const gapBarClicks = (bar, silent, lead = 1) => bar < lead || (bar - lead) % (silent + 1) === 0;
// Fretboard quiz. Standard tuning, string 1 is the high E; notes are semitones above C. T.notes names them:
// C…B in English, до…си in Russian (there the letter B can mean B-flat).
const OPEN_STRINGS = [null, 4, 11, 7, 2, 9, 4];
const NOTE_NAMES = T.notes;
const noteAt = (string, fret) => (OPEN_STRINGS[string] + fret) % 12;
// Quiz result → stop of the fretboard question. The time includes finding one of twelve buttons, so the limits are
// lenient. The top stop is about intervals, which the quiz does not test, so it is never suggested.
function fretboardStop(correct, total, medianSec) {
  if (correct < 0.7 * total) return 0;
  return medianSec <= 2.5 ? 3 : medianSec <= 5 ? 2 : 1;
}
// Chord-by-ear quiz. Intervals in semitones above the root; the root is doubled an octave lower, in the bass.
// Each level adds chord types to the previous ones, so passing level k means stop k of the question.
// The top stop (extensions, alterations) is not tested and never suggested.
const CHORDS = { maj: [T.chords.maj, [0, 4, 7]], min: [T.chords.min, [0, 3, 7]], dom7: ['7', [0, 4, 7, 10]], maj7: ['maj7', [0, 4, 7, 11]],
  min7: ['m7', [0, 3, 7, 10]], dim: ['dim', [0, 3, 6]], aug: ['aug', [0, 4, 8]], sus2: ['sus2', [0, 2, 7]], sus4: ['sus4', [0, 5, 7]] };
const EAR_LEVELS = [
  { name: T.earLevels[0], types: ['maj', 'min'] },
  { name: T.earLevels[1], types: ['maj', 'min', 'dom7', 'maj7', 'min7'] },
  { name: T.earLevels[2], types: ['maj', 'min', 'dom7', 'maj7', 'min7', 'dim', 'aug', 'sus2', 'sus4'] },
];
const EAR_ROUNDS = 10, EAR_PASS = 8;
// Tap-along rhythm test under the metronome question. The page clicks and the player taps every beat; the levels thin
// the clicks out: every beat, beats 2 and 4 only, beat 1 only. Each level is `lead` bars of clicks on every beat, then
// `bars` measured bars. Passing level k suggests stop k + 2. Subdivisions, polyrhythms and playing ahead of or behind
// the beat on purpose (the top stop) are not tested, so stop 5 is never suggested.
// The limits are assumptions. `pass` (SD of the taps around the beat, as a share of a beat) sits between the inter-tap
// variability of percussionists (CV 0.052) and of other trained musicians (0.115–0.127) in Cameron & Grahn 2014, a
// related but not identical measure; `lost` and `misses` are judgement calls.
const RHYTHM_LEVELS = [[0, 1, 2, 3], [1, 3], [0]].map((clicks, i) => ({ name: T.rhythmLevels[i], clicks }));
const RHYTHM = { lead: 2, bars: 8, beats: 4, pass: 0.08, lost: 0.15, misses: 2 };
// Taps against a grid of n beats from `start`, `beat` apart (any one time unit). Only the spread counts: a constant
// offset (audio output latency, Bluetooth, touch delay, a habit of tapping early) is removed through the taps' mean
// phase. Each beat keeps its closest tap; further taps on the same beat are `extra`.
function rhythmStats(taps, start, beat, n) {
  const ph = taps.map(t => (t - start) / beat);
  let c = 0, s = 0;
  for (const p of ph) { c += Math.cos(2 * Math.PI * p); s += Math.sin(2 * Math.PI * p); }
  const off = ph.length ? Math.atan2(s, c) / (2 * Math.PI) : 0;
  const best = new Array(n).fill(null);
  let extra = 0;
  for (const p of ph) {
    const k = Math.round(p - off), d = p - off - k;
    if (k < 0 || k >= n) continue;
    if (best[k] == null) best[k] = d;
    else { extra++; if (Math.abs(d) < Math.abs(best[k])) best[k] = d; }
  }
  const dev = best.filter(d => d != null);
  const mean = dev.reduce((a, d) => a + d, 0) / (dev.length || 1);
  const spread = dev.length > 1 ? Math.sqrt(dev.reduce((a, d) => a + (d - mean) ** 2, 0) / dev.length) : Infinity;
  return { spread, misses: n - dev.length, extra, offset: off + mean };
}
// Level result → stop. Reaching level k > 0 means level k − 1 was passed in the same run of the test.
function rhythmResult(level, st) {
  const pass = st.spread <= RHYTHM.pass && st.misses <= RHYTHM.misses && st.extra <= RHYTHM.misses;
  if (pass) return { pass, stop: level + 2 };
  if (level > 0) return { pass, stop: level + 1 };
  return { pass, stop: st.spread > RHYTHM.lost || st.misses > RHYTHM.bars * RHYTHM.beats / 4 ? 0 : 1 };
}
const chordNotes = (root, type) => [root - 12, ...CHORDS[type][1].map(i => root + i)];
const midiHz = n => 440 * Math.pow(2, (n - 69) / 12);
// Reference points for the scale, converted on the same curve. Music school: the hour norms of a current 5-year
// six-string guitar programme (lessons + home practice, 33 weeks a year). Violinists: Ericsson et al. 1993,
// accumulated practice alone; the age-20 figure is from the 2019 replication. The labels say «музыканты» / "musicians"
// on purpose; the notes say these are violinists (no comparable hour counts for guitarists were found).
const REFS = [330, 495, 710, 924, 3420, 5301, 7410, 10000, 25000].map((h, i) => ({ ...T.refs[i], h, ...(h === 10000 ? { more: true } : {}) }));
// Vysotsky answered for him, only where a seven-string guitar fits the question. The author's guess, not a measurement.
// Hours vs rating in chess, on the curve's own hours measure: total practice (alone, with others, tournament games).
// Gobet & Campitelli 2007, 104 Argentine players, national ratings. Table 1: hours at the time of the survey,
// arithmetic means (SD) per title group. p. 21: total hours when players first reached 2200.
const CHESS_GROUPS = [
  { who: T.groups[0], n: 39, e: 1780, h: 8303, sd: 7900 },
  { who: T.groups[1], n: 39, e: 2030, h: 11715, sd: 9029 },
  { who: T.groups[2], n: 13, e: 2165, h: 19618, sd: 10917 },
  { who: T.groups[3], n: 10, e: 2300, h: 27929, sd: 15804 },
];
const REACH_2200 = { e: 2200, h: 11053, lo: 3016, hi: 23608, n: 34 };
// The opposite question, rating expected for given hours: least squares from the paper's r = .57 between rating and
// log10 total hours, means 1991 and 3.9, SDs 221.5 and 0.4 (Table 2). Residual SD = 221.5·√(1 − .57²) ≈ 182.
// The paper prints the log SDs rounded to 0.4, so the slope is uncertain by about a fifth: the same derivation for group
// hours gives 299, while the paper's exact group-hours line has 252.
// Drawn over the sample's middle 95 % of hours (3.9 ± 2·0.4 in log10).
const EXPECTED = { a: 1990.8 - 0.57 * 221.5 / 0.4 * 3.9, b: 0.57 * 221.5 / 0.4, sd: 221.5 * Math.sqrt(1 - 0.57 ** 2), from: 1260, to: 50000 };
const expectedElo = h => EXPECTED.a + EXPECTED.b * Math.log10(h);
const VYSOTSKY = { chords: 3, strum: 2, fingers: 1, dynamics: 3, repertoire: 14, hardest: 2, party: 5, record: 3, stage: 4 };
const practiceHours = p => Math.max(0, +p.years || 0) * 52 * Math.max(0, +p.perWeek || 0) * Math.max(0, +p.hours || 0);
/*END MODEL*/

const $ = s => document.querySelector(s);
const STORE = 'guitar-elo-v3';
const round10 = x => Math.round(x / 10) * 10;
const fmtElo = x => String(round10(x));
const fmtHours = h => {
  const r = h < 100 ? Math.round(h / 5) * 5 : h < 1000 ? Math.round(h / 10) * 10 : Math.round(h / 100) * 100;
  return r.toLocaleString(T.locale);
};
const SCALE_MIN = 400, SCALE_MAX = 2800;
const pct = e => ((Math.min(SCALE_MAX, Math.max(SCALE_MIN, e)) - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
const clampAnchor = v => Math.min(2100, Math.max(800, Number.isFinite(+v) && +v ? +v : 1250));

// Questions that got a new stop at the bottom in a given revision; saved answers from before it move up by one.
const REV = 2, SHIFTED = { 2: ['pick', 'fingers', 'noise', 'bend', 'vibrato', 'legato', 'ear', 'hardest'] };
// `measured`: the stop each test showed, by question id (see MEASURED_WEIGHT). A shift moves it along with the answer.
let state = { answers: {}, measured: {}, practice: { ...CAL }, anchorElo: 1250, example: false, rev: REV };
function load() {
  try {
    const raw = localStorage.getItem(STORE);
    const s = raw && JSON.parse(raw);
    if (s && typeof s.answers === 'object') {
      if (!s.measured || typeof s.measured !== 'object') s.measured = {};
      for (let r = (s.rev || 1) + 1; r <= REV; r++) for (const id of SHIFTED[r] || []) {
        if (s.answers[id] != null) s.answers[id]++;
        if (s.measured[id] != null) s.measured[id]++;
      }
      s.rev = REV;
      return s;
    }
  } catch (e) {}
  return null;
}
function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }

const saved = load();
if (saved) state = { ...state, ...saved, practice: { ...CAL, ...(saved.practice || {}) } };
MODEL.anchorElo = clampAnchor(state.anchorElo);

const UNSET = T.ui.unset;
const GAP_SILENT = [1, 2, 4, 8, 16], GAP_BPM = [60, 70, 80, 90, 100, 110, 120];
function toolHtml(kind) {
  if (kind === 'minute') return '<div class="tool" data-tool="minute"><button type="button" class="btn tgo">' + T.ui.minuteGo + '</button>'
    + '<span class="tclock"></span><span class="tout" aria-live="polite">' + T.ui.minuteIdle + '</span></div>';
  if (kind === 'fretboard') return '<div class="tool" data-tool="fretboard"><button type="button" class="btn tgo">' + T.ui.fretGo + '</button>'
    + '<span class="tout" aria-live="polite">' + T.ui.fretIdle + '</span>'
    + '<div class="qz" hidden><div class="qzq"><span class="qzpos"></span><span class="qzn"></span></div><div class="notes">'
    + NOTE_NAMES.map((n, i) => `<button type="button" class="nb" data-n="${i}">${n[0]}${n[1] ? '<small>' + n[1] + '</small>' : ''}</button>`).join('')
    + '</div></div></div>';
  if (kind === 'chordear') return '<div class="tool" data-tool="chordear"><button type="button" class="btn tgo">' + T.ui.earGo + '</button>'
    + '<span class="tout" aria-live="polite">' + T.ui.earIdle + '</span>'
    + '<div class="qz" hidden><div class="qzq"><span class="qzpos"></span><span class="qzn"></span></div><div class="chords"></div>'
    + '<div><button type="button" class="btn tre">' + T.ui.replay + '</button></div></div></div>';
  if (kind === 'rhythm') return `<div class="tool" data-tool="rhythm"><label>${T.ui.tempo}<select class="tbpm">`
    + GAP_BPM.map(b => `<option${b === 80 ? ' selected' : ''}>${b}</option>`).join('')
    + `</select></label><button type="button" class="btn tgo">${T.ui.rhythmGo}</button><span class="tout" aria-live="polite">${T.ui.rhythmIdle}</span>`
    + `<div class="qz" hidden><div class="qzq"><span class="qzpos"></span></div><button type="button" class="tap">${T.ui.tap}</button></div></div>`;
  if (kind !== 'gap') return '';
  return `<div class="tool" data-tool="gap"><span>${T.ui.gapSilence}</span><span class="seg" role="group" aria-label="${T.ui.gapSilenceAria}">`
    + GAP_SILENT.map(n => `<button type="button" class="segb" data-n="${n}" aria-pressed="${n === 2}">${n}</button>`).join('')
    + `</span><label>${T.ui.tempo}<select class="tbpm">` + GAP_BPM.map(b => `<option${b === 80 ? ' selected' : ''}>${b}</option>`).join('')
    + `</select></label><button type="button" class="btn tgo">${T.ui.gapGo}</button><span class="tout" aria-live="polite"></span></div>`;
}

function renderQuiz() {
  const form = $('#quiz');
  let num = 0, html = '';
  for (const c of CATS) {
    html += `<section class="group"><h2>${c.name}</h2>`;
    for (const q of QUESTIONS.filter(q => q.cat === c.id)) {
      num++;
      const n = q.o.length;
      let ticks = '';
      for (let i = 0; i < n; i++) ticks += `<i style="left:calc(11px + (100% - 22px) * ${i / (n - 1)})"></i>`;
      html += `<fieldset class="q unset" id="q-${q.id}"><legend><span class="qn">${String(num).padStart(2, '0')}</span><span class="qt" id="t-${q.id}">${q.text}</span><span class="qelo" id="e-${q.id}"></span></legend>`;
      if (q.hint) html += `<div class="hint">${q.hint}</div>`;
      if (q.tool) html += toolHtml(q.tool);
      html += `<output class="val" id="v-${q.id}" for="r-${q.id}">${UNSET}</output>`;
      html += `<div class="rail">${ticks}<input type="range" id="r-${q.id}" name="${q.id}" min="0" max="${n - 1}" step="1" value="0" aria-labelledby="t-${q.id}" aria-valuetext="${UNSET}"></div>`;
      html += `<div class="qfoot"><button type="button" class="clear" data-q="${q.id}">${T.ui.clear}</button></div></fieldset>`;
    }
    html += '</section>';
  }
  form.innerHTML = html;
}

function syncQ(q) {
  const a = state.answers[q.id], r = $('#r-' + q.id);
  const set = a != null && q.o[a] != null;
  r.value = set ? a : 0;
  r.style.setProperty('--f', set ? a / (q.o.length - 1) : 0);
  r.setAttribute('aria-valuetext', set ? q.o[a][0] : UNSET);
  $('#v-' + q.id).textContent = set ? q.o[a][0] : UNSET;
  $('#q-' + q.id).classList.toggle('unset', !set);
}

function renderBoard() {
  const board = $('#board');
  let html = '';
  const widths = [1, 1.2, 1.5, 1.8, 2.2, 2.6];
  widths.forEach((w, i) => { html += `<div class="str" style="top:${8 + i * 16.8}%;height:${w}px"></div>`; });
  const edges = BANDS.map(b => Math.max(SCALE_MIN, b.min)).concat(SCALE_MAX);
  BANDS.forEach((b, i) => {
    if (b.min > SCALE_MIN) html += `<div class="fret" style="left:${pct(b.min)}%"></div>`;
    if (i % 2 === 0 && i > 0) {
      const mid = (Math.max(SCALE_MIN, b.min) + Math.min(SCALE_MAX, edges[i + 1])) / 2;
      html += `<div class="inlay" style="left:${pct(mid)}%"></div>`;
    }
  });
  html += '<div class="pin hours" id="pinHours"></div><div class="pin skill" id="pinSkill"></div>';
  board.innerHTML = html;
  let t = '';
  for (let e = SCALE_MIN; e <= SCALE_MAX; e += 400) t += `<span style="left:${pct(e)}%">${e}</span>`;
  $('#ticks').innerHTML = t;
  $('#bands').innerHTML = BANDS.map((b, i) => {
    const hi = BANDS[i + 1] ? BANDS[i + 1].min - 1 : null;
    const range = b.min === 0 ? T.ui.upTo(BANDS[1].min - 1) : hi ? `${b.min}–${hi}` : `${b.min}+`;
    return `<div><b>${range}</b>${b.name}. ${b.guitar}</div>`;
  }).join('');
}

function renderAnchors() {
  $('#anchors').innerHTML = curveAnchors().map(a =>
    `<tr${a.cal ? ' class="calrow"' : ''}><td class="n">${a.h.toLocaleString(T.locale)}</td><td class="n">${a.e}</td><td>${a.src}</td></tr>`).join('');
  renderRefs();
  renderChart();
}
// Hours vs rating chart. Redrawn on calibration change and on resize; sized in CSS pixels so text stays readable on phones.
const CH = { hMax: 60000, eMin: 400, eMax: 2850 };
let chartPts = [];
function renderChart() {
  const box = $('#cplot'), W = Math.round(box.clientWidth) || 640, H = W < 520 ? 320 : 380;
  const M = { l: 44, r: 14, t: 14, b: 42 }, pw = W - M.l - M.r, ph = H - M.t - M.b;
  const X = h => M.l + (lx(h) - lx(0)) / (lx(CH.hMax) - lx(0)) * pw;
  const Y = e => M.t + (CH.eMax - e) / (CH.eMax - CH.eMin) * ph;
  const f = x => x.toFixed(1), hrs = h => Math.round(h).toLocaleString(T.locale);
  let g = '';
  for (const e of [400, 800, 1200, 1600, 2000, 2400, 2800]) g += `<line class="grid" x1="${M.l}" x2="${W - M.r}" y1="${f(Y(e))}" y2="${f(Y(e))}"/><text class="tick" x="${M.l - 6}" y="${f(Y(e) + 4)}" text-anchor="end">${e}</text>`;
  // On a phone 10 000 and 50 000 sit too close for two labels; the 50 000 gridline stays.
  for (const h of [0, 100, 1000, 10000, 50000]) g += `<line class="grid" x1="${f(X(h))}" x2="${f(X(h))}" y1="${M.t}" y2="${M.t + ph}"/>`
    + (h === 50000 && pw < 420 ? '' : `<text class="tick" x="${f(X(h))}" y="${M.t + ph + 15}" text-anchor="middle">${hrs(h)}</text>`);
  g += `<text class="ttl" x="${M.l + pw}" y="${H - 6}" text-anchor="end">${T.ui.axis}</text>`;
  // Expected rating for given hours, with its ±1 SD band.
  const hs = [];
  for (let x = Math.log10(EXPECTED.from); x <= Math.log10(EXPECTED.to) + 1e-9; x += 0.05) hs.push(Math.pow(10, x));
  const up = hs.map(h => `${f(X(h))},${f(Y(expectedElo(h) + EXPECTED.sd))}`), dn = hs.map(h => `${f(X(h))},${f(Y(expectedElo(h) - EXPECTED.sd))}`).reverse();
  g += `<polygon points="${up.concat(dn).join(' ')}" fill="var(--c-exp)" fill-opacity=".12"/>`;
  g += `<polyline points="${hs.map(h => `${f(X(h))},${f(Y(expectedElo(h)))}`).join(' ')}" fill="none" stroke="var(--c-exp)" stroke-width="2" stroke-linecap="round"/>`;
  // The site's curve.
  const cs = [];
  for (let x = lx(0); x <= lx(CH.hMax) + 1e-9; x += 0.02) cs.push(Math.max(0, Math.pow(10, x) - 10));
  g += `<polyline points="${cs.map(h => `${f(X(h))},${f(Y(eloFromHours(h)))}`).join(' ')}" fill="none" stroke="var(--c-curve)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
  // Hours spread on the way to 2200.
  const ry = f(Y(REACH_2200.e));
  g += `<line x1="${f(X(REACH_2200.lo))}" x2="${f(X(REACH_2200.hi))}" y1="${ry}" y2="${ry}" stroke="var(--c-data)" stroke-width="2"/>`
    + [REACH_2200.lo, REACH_2200.hi].map(h => `<line x1="${f(X(h))}" x2="${f(X(h))}" y1="${ry - 5}" y2="${+ry + 5}" stroke="var(--c-data)" stroke-width="2"/>`).join('');
  // Points: the curve's anchors, the title groups, the 2200 mean. Each is focusable and has a tooltip.
  chartPts = [];
  for (const a of curveAnchors()) {
    if (a.h === REACH_2200.h) continue;
    chartPts.push({ h: a.h, e: a.e, kind: 'ring', head: `${a.e} · ${hrs(a.h)} ${T.ui.h}`, text: a.src });
  }
  chartPts.find(p => p.h === CAL_HOURS).band = [1100, 1400]; // the range the data allow for the calibration
  for (const c of CHESS_GROUPS) chartPts.push({ h: c.h, e: c.e, kind: 'dot', head: `${c.e} · ${hrs(c.h)} ${T.ui.h}`, text: T.ui.groupTip(c, hrs(c.sd)) });
  chartPts.push({ h: REACH_2200.h, e: REACH_2200.e, kind: 'dot', head: `2200 · ${hrs(REACH_2200.h)} ${T.ui.h}`, text: T.ui.reachTip(REACH_2200.n, hrs(REACH_2200.lo), hrs(REACH_2200.hi)) });
  for (const p of chartPts) {
    p.x = X(p.h); p.y = Y(p.e);
    const lab = `${p.head}. ${p.text}`;
    if (p.band) g += `<line x1="${f(p.x)}" x2="${f(p.x)}" y1="${f(Y(p.band[1]))}" y2="${f(Y(p.band[0]))}" stroke="var(--c-curve)" stroke-width="2" stroke-opacity=".45"/>`;
    g += `<g class="pt" tabindex="0" role="img" aria-label="${lab.replace(/"/g, '&quot;')}"><circle cx="${f(p.x)}" cy="${f(p.y)}" r="12" fill="transparent"/>`
      + (p.kind === 'dot'
        ? `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="5" fill="var(--c-data)" stroke="var(--surface)" stroke-width="2"/>`
        : `<circle cx="${f(p.x)}" cy="${f(p.y)}" r="4" fill="var(--surface)" stroke="var(--c-curve)" stroke-width="2"/>`) + '</g>';
  }
  g += `<line class="cross" x1="0" x2="0" y1="${M.t}" y2="${M.t + ph}" stroke="var(--muted)" stroke-width="1" visibility="hidden"/>`;
  const svg = `<svg viewBox="0 0 ${W} ${H}" height="${H}" aria-label="${T.ui.chartAria}">${g}</svg>`;
  box.querySelector('svg')?.remove();
  box.insertAdjacentHTML('beforeend', svg);
  chartGeom = { X, Y, M, pw, ph, W };
  $('#chartRows').innerHTML = curveAnchors().map(a => `<tr><td>${T.ui.rowCurve(a.h === REACH_2200.h)}</td><td class="n">${hrs(a.h)}</td><td class="n">${a.e}</td></tr>`).join('')
    + CHESS_GROUPS.map(c => `<tr><td>${T.ui.rowGroup(c)}</td><td class="n">${hrs(c.h)}</td><td class="n">${c.e}</td></tr>`).join('')
    + `<tr><td>${T.ui.rowReach}</td><td class="n">${hrs(REACH_2200.lo)}–${hrs(REACH_2200.hi)}</td><td class="n">2200</td></tr>`
    + [1404, 3000, 11053, 30000].map(h => `<tr><td>${T.ui.rowExpected}</td><td class="n">${hrs(h)}</td><td class="n">${Math.round(expectedElo(h) / 10) * 10} ±${Math.round(EXPECTED.sd / 10) * 10}</td></tr>`).join('');
}
let chartGeom = null;
function chartTip(ev) {
  const box = $('#cplot'), tip = $('#ctip'), svg = box.querySelector('svg'), cross = svg && svg.querySelector('.cross');
  if (!svg || !chartGeom) return;
  const r = svg.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top;
  const { X, M, pw, W } = chartGeom;
  let best = null, bd = 22;
  for (const p of chartPts) { const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = p; } }
  let html, px, py;
  if (best) {
    html = `<b>${best.head}</b><br>${best.text}`; px = best.x; py = best.y; cross.setAttribute('visibility', 'hidden');
  } else if (x >= M.l && x <= M.l + pw) {
    const h = Math.max(0, Math.pow(10, lx(0) + (x - M.l) / pw * (lx(CH.hMax) - lx(0))) - 10);
    const hr = h < 1000 ? Math.round(h / 10) * 10 : Math.round(h / 100) * 100;
    html = `<b>${hr.toLocaleString(T.locale)} ${T.ui.h}</b><br>${T.ui.tipCurve}: ${Math.round(eloFromHours(h) / 10) * 10}`;
    if (h >= EXPECTED.from && h <= EXPECTED.to) html += `<br>${T.ui.tipExpected}: ${Math.round(expectedElo(h) / 10) * 10} ±${Math.round(EXPECTED.sd / 10) * 10}`;
    px = x; py = y;
    cross.setAttribute('x1', x); cross.setAttribute('x2', x); cross.setAttribute('visibility', 'visible');
  } else { chartHide(); return; }
  tip.innerHTML = html; tip.hidden = false;
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  tip.style.left = Math.max(4, Math.min(W - tw - 4, px + 14 + tw > W ? px - tw - 14 : px + 14)) + 'px';
  tip.style.top = Math.max(4, py - th - 10) + 'px';
}
function chartHide() {
  $('#ctip').hidden = true;
  const c = $('#cplot svg .cross'); if (c) c.setAttribute('visibility', 'hidden');
}
$('#cplot').addEventListener('pointermove', chartTip);
$('#cplot').addEventListener('pointerdown', chartTip);
$('#cplot').addEventListener('pointerleave', ev => { if (ev.pointerType !== 'touch') chartHide(); });
document.addEventListener('pointerdown', ev => { if (!ev.target.closest || !ev.target.closest('#cplot')) chartHide(); });
$('#cplot').addEventListener('focusin', ev => {
  const g = ev.target.closest('.pt'); if (!g) return;
  const c = g.querySelector('circle').getBoundingClientRect();
  chartTip({ clientX: c.left + c.width / 2, clientY: c.top + c.height / 2 });
});
$('#cplot').addEventListener('focusout', chartHide);
if (window.ResizeObserver) {
  let lastW = 0;
  new ResizeObserver(es => { const w = Math.round(es[0].contentRect.width); if (w && w !== lastW) { lastW = w; renderChart(); } }).observe($('#cplot'));
}
// Runs before qById exists, so it looks questions up directly. Follows the calibration like the anchor table.
function renderRefs() {
  const v = score(VYSOTSKY), vys = `≈ ${fmtElo(v.elo)} ±${round10(v.spread)}`;
  $('#refs').innerHTML = REFS.map(r => `<tr><td>${r.who}${r.note ? `<span class="refnote">${r.note}</span>` : ''}</td>`
    + `<td class="n">${r.more ? '> ' : ''}${r.h.toLocaleString(T.locale)}</td><td class="n">${fmtElo(eloFromHours(r.h))}</td></tr>`).join('')
    + `<tr><td>${T.ui.vys}<span class="refnote">${T.ui.vysNote}</span></td><td class="n">—</td><td class="n">≈ ${fmtElo(v.elo)}<span class="refnote">±${round10(v.spread)}</span></td></tr>`;
  $('#vysElo').textContent = vys;
  $('#vysList').innerHTML = Object.entries(VYSOTSKY).map(([id, a]) => {
    const q = QUESTIONS.find(x => x.id === id);
    return `<li>${T.ui.vysItem(q.text, q.o[a][0])}</li>`;
  }).join('') + `<li>${T.ui.vysRest}</li>`;
}

function syncForm() {
  for (const q of QUESTIONS) syncQ(q);
  $('#p-years').value = state.practice.years;
  $('#p-week').value = state.practice.perWeek;
  $('#p-hours').value = state.practice.hours;
  $('#cal').value = MODEL.anchorElo;
  $('#example').hidden = !state.example;
  $('#blank').hidden = Object.keys(state.answers).length > 0;
}

let last = null;
function update() {
  const r = score(state.answers, state.measured);
  for (const q of QUESTIONS) {
    const a = state.answers[q.id], chip = $('#e-' + q.id), meas = a != null && q.o[a] != null && state.measured[q.id] === a;
    chip.textContent = a == null || !q.o[a] ? '' : '≈ ' + fmtElo(eloFromHours(q.o[a][1])) + (meas ? ' ✓' : '');
    chip.classList.toggle('meas', meas);
    if (meas) chip.title = T.ui.measured(String(MEASURED_WEIGHT).replace('.', T.dec)); else chip.removeAttribute('title');
  }
  const answered = QUESTIONS.filter(q => state.answers[q.id] != null).length;
  $('#progress').textContent = T.ui.progress(answered, QUESTIONS.length);

  const ready = r.n >= MIN_COUNTED;
  const hrs = practiceHours(state.practice);
  const expected = hrs > 0 ? eloFromHours(hrs) : null;

  if (ready) {
    const b = bandOf(round10(r.elo));
    $('#elo').textContent = fmtElo(r.elo);
    $('#pm').textContent = '±' + round10(r.spread);
    $('#band').textContent = b.name;
    $('#bandtext').textContent = b.guitar;
    $('#equiv').innerHTML = T.ui.equiv(fmtHours(hoursFromElo(r.elo)));
    $('#pinSkill').style.left = pct(r.elo) + '%';
    $('#pinSkill').hidden = false;
    $('#barElo').textContent = fmtElo(r.elo);
    $('#barBand').textContent = b.name;
  } else {
    const left = MIN_COUNTED - r.n;
    $('#elo').textContent = '—';
    $('#pm').textContent = '';
    $('#band').textContent = '';
    $('#bandtext').textContent = T.ui.needMore(left);
    $('#equiv').textContent = '';
    $('#pinSkill').hidden = true;
    $('#barElo').textContent = '—';
    $('#barBand').textContent = '';
  }

  // categories
  const vals = CATS.map(c => r.catElo[c.id]).filter(v => v != null);
  const minVal = vals.length ? Math.min(...vals) : null;
  const weakCat = ready && vals.length > 1 && r.elo - minVal > 60 ? CATS.find(c => r.catElo[c.id] === minVal) : null;
  $('#cats').innerHTML = CATS.map(c => {
    const v = r.catElo[c.id];
    const weak = weakCat && weakCat.id === c.id;
    return `<div class="cat${weak ? ' weak' : ''}"><span class="name">${c.name}</span><span class="bar"><i style="width:${v == null ? 0 : pct(v)}%"></i></span><span class="v">${v == null ? '—' : fmtElo(v)}</span></div>`;
  }).join('');
  const wn = $('#weaknote');
  if (weakCat) {
    wn.hidden = false;
    wn.innerHTML = T.ui.weak(weakCat.name);
  } else wn.hidden = true;

  // practice comparison
  const pinH = $('#pinHours');
  if (expected != null) {
    pinH.hidden = false;
    pinH.style.left = pct(expected) + '%';
    $('#compare').innerHTML = T.ui.compare(fmtHours(hrs), fmtElo(expected));
  } else {
    pinH.hidden = true;
    $('#compare').textContent = T.ui.compareEmpty;
  }
  const v = $('#verdict');
  v.className = 'verdict';
  if (ready && expected != null) {
    const d = round10(r.elo - expected);
    if (Math.abs(d) <= Math.max(100, round10(r.spread))) v.textContent = T.ui.even;
    else if (d > 0) { v.classList.add('up'); v.textContent = T.ui.above(d); }
    else { v.classList.add('down'); v.textContent = T.ui.below(-d); }
  } else v.textContent = '';

  last = { r, ready, hrs, expected, weakCat };
}

function resultText() {
  const { r, ready, hrs, expected } = last;
  if (!ready) return T.ui.resNone;
  const lines = [T.ui.resHead(fmtElo(r.elo), round10(r.spread), bandOf(round10(r.elo)).name)];
  lines.push(CATS.filter(c => r.catElo[c.id] != null).map(c => `${c.name} ${fmtElo(r.catElo[c.id])}`).join(' · '));
  if (expected != null) lines.push(T.ui.resHours(fmtHours(hrs), fmtElo(expected)));
  return lines.join('\n');
}

function persist() { save(); update(); }

renderQuiz();
renderBoard();
renderAnchors();
syncForm();
update();

const qById = id => QUESTIONS.find(q => q.id === id);
function setAnswer(id, v) {
  if (v == null) delete state.answers[id]; else state.answers[id] = v;
  state.example = false;
  $('#example').hidden = true;
  $('#blank').hidden = Object.keys(state.answers).length > 0;
  syncQ(qById(id));
  persist();
}
// A slider counts once it is moved, tapped or stepped with the keyboard. A touch that turns into a page scroll
// moves the thumb on touchstart, then the browser cancels the pointer: that answer is rolled back.
let drag = null;
$('#quiz').addEventListener('input', ev => { if (ev.target.type === 'range') setAnswer(ev.target.name, Number(ev.target.value)); });
$('#quiz').addEventListener('pointerdown', ev => {
  if (ev.target.type === 'range') drag = { id: ev.target.name, prev: state.answers[ev.target.name] };
});
$('#quiz').addEventListener('pointercancel', () => { if (drag) setAnswer(drag.id, drag.prev); drag = null; });
$('#quiz').addEventListener('pointerup', ev => {
  const t = ev.target;
  if (t.type === 'range' && state.answers[t.name] == null) setAnswer(t.name, Number(t.value));
  drag = null;
});
$('#quiz').addEventListener('click', ev => {
  const t = ev.target;
  const c = t.closest && t.closest('.clear');
  if (c) { setAnswer(c.dataset.q, null); $('#r-' + c.dataset.q).focus(); return; }
  const go = t.closest && t.closest('.tgo');
  if (go) { toggleTool(go.closest('.tool')); return; }
  const nb = t.closest && t.closest('.nb');
  if (nb) { if (running && running.answer && running.el === nb.closest('.tool')) running.answer(Number(nb.dataset.n)); return; }
  const re = t.closest && t.closest('.tre');
  if (re) { if (running && running.replay && running.el === re.closest('.tool')) running.replay(); return; }
  const nx = t.closest && t.closest('.tnext');
  if (nx) { const el = nx.closest('.tool'); el.dataset.level = nx.dataset.level; toggleTool(el); return; }
  const set = t.closest && t.closest('.tset');
  if (set) {
    state.measured[set.dataset.q] = Number(set.dataset.v);
    setAnswer(set.dataset.q, Number(set.dataset.v)); set.disabled = true; set.textContent = T.ui.setDone; return;
  }
  const sb = t.closest && t.closest('.segb');
  if (sb) {
    for (const b of sb.parentNode.children) b.setAttribute('aria-pressed', String(b === sb));
    restartTool(sb.closest('.tool'));
  }
});
$('#quiz').addEventListener('change', ev => { if (ev.target.classList.contains('tbpm')) restartTool(ev.target.closest('.tool')); });

// Self-tests under the questions. The one-minute timer and the gap-click metronome only help to check yourself. The
// fretboard, chord and rhythm tests measure and suggest a stop; "Set it" sets it and marks the answer as measured.
// Clicks are scheduled on the audio clock, a little ahead, so they do not drift.
let actx = null, running = null;
function audio() {
  try {
    if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state === 'suspended') actx.resume();
    return actx;
  } catch (e) { return null; }
}
function beep(ctx, when, freq, len = 0.04, vol = 0.6) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, when);
  g.gain.exponentialRampToValueAtTime(0.001, when + len);
  o.connect(g); g.connect(ctx.destination);
  o.start(when); o.stop(when + len + 0.02);
  return { g, t: when };
}
function silence(nodes) { for (const n of nodes) try { n.g.disconnect(); } catch (e) {} }
function keepAwake() {
  let lock = null, off = false;
  try { navigator.wakeLock.request('screen').then(l => { if (off) l.release(); else lock = l; }, () => {}); } catch (e) {}
  return () => { off = true; if (lock) lock.release().catch(() => {}); };
}
function startMinute(el, secs = 60, countIn = 3) {
  const ctx = audio(), go = el.querySelector('.tgo'), clock = el.querySelector('.tclock'), out = el.querySelector('.tout');
  const nodes = [], t0 = performance.now(), release = keepAwake();
  if (ctx) {
    const a0 = ctx.currentTime + 0.05;
    for (let i = 0; i < countIn; i++) nodes.push(beep(ctx, a0 + i, 880));
    nodes.push(beep(ctx, a0 + countIn, 1760, 0.2));
    nodes.push(beep(ctx, a0 + countIn + secs, 1760, 0.5), beep(ctx, a0 + countIn + secs + 0.6, 1320, 0.8));
  }
  el.classList.add('on'); go.textContent = T.ui.stop;
  out.textContent = T.ui.grab;
  let phase = 0;
  const tick = () => {
    const t = (performance.now() - t0) / 1000;
    if (t < countIn) { clock.textContent = String(Math.ceil(countIn - t)); return; }
    if (t < countIn + secs) {
      if (!phase) { phase = 1; out.textContent = T.ui.changeNow; }
      const r = Math.ceil(countIn + secs - t);
      clock.textContent = Math.floor(r / 60) + ':' + String(r % 60).padStart(2, '0');
      return;
    }
    finish(T.ui.timeUp, true);
  };
  const iv = setInterval(tick, 200);
  tick();
  function finish(msg, done) {
    clearInterval(iv); release();
    if (!done) silence(nodes);
    el.classList.remove('on'); go.textContent = T.ui.minuteGo;
    clock.textContent = ''; out.textContent = msg;
    if (running && running.el === el) running = null;
  }
  return { el, stop: () => finish(T.ui.stopped, false) };
}
function startGap(el) {
  const go = el.querySelector('.tgo'), out = el.querySelector('.tout');
  const ctx = audio();
  if (!ctx) { out.textContent = T.ui.noAudio; return null; }
  const silent = Number(el.querySelector('.segb[aria-pressed="true"]').dataset.n);
  const beat = 60 / Number(el.querySelector('.tbpm').value), BEATS = 4, release = keepAwake();
  let nodes = [], next = ctx.currentTime + 0.1, i = 0;
  const schedule = () => {
    while (next < ctx.currentTime + 0.2) {
      if (gapBarClicks(Math.floor(i / BEATS), silent)) nodes.push(beep(ctx, next, i % BEATS ? 1000 : 1600));
      next += beat; i++;
    }
    nodes = nodes.filter(n => n.t > ctx.currentTime - 0.5);
  };
  const iv = setInterval(schedule, 25);
  schedule();
  // A blocked AudioContext stays suspended instead of throwing; a silent metronome would pass for a silent bar.
  setTimeout(() => {
    if (running && running.el === el && ctx.state !== 'running') { stopTool(); out.textContent = T.ui.noAudio; }
  }, 400);
  el.classList.add('on'); go.textContent = T.ui.stop;
  // Nothing on screen moves while the metronome is silent: a counter or a flash would be a visual click.
  out.textContent = T.ui.gapRun(silent);
  return { el, stop() {
    clearInterval(iv); release(); silence(nodes);
    el.classList.remove('on'); go.textContent = T.ui.gapGo; out.textContent = '';
    if (running && running.el === el) running = null;
  } };
}
const fmtSec = x => x.toFixed(1).replace('.', T.dec);
// Quizzes end with a suggested stop and a set button ("Set it"); the answer changes only if it is pressed.
function suggest(id, stop) {
  return `${T.ui.suggest(qById(id).o[stop][0])} <button type="button" class="tset" data-q="${id}" data-v="${stop}">${T.ui.set}</button>`;
}
function startFretQuiz(el, rounds = 10) {
  const go = el.querySelector('.tgo'), out = el.querySelector('.tout'), box = el.querySelector('.qz');
  const pos = el.querySelector('.qzpos'), num = el.querySelector('.qzn');
  const res = [];
  let cur = null, shown = 0;
  const next = () => {
    let s, f;
    do { s = 1 + Math.floor(Math.random() * 6); f = 1 + Math.floor(Math.random() * 12); } while (cur && cur.s === s && cur.f === f);
    cur = { s, f };
    pos.textContent = T.ui.fretPos(s, f);
    num.textContent = T.ui.of(res.length + 1, rounds);
    shown = performance.now();
  };
  const self = {
    el,
    answer(n) {
      const right = noteAt(cur.s, cur.f);
      res.push({ ok: n === right, sec: (performance.now() - shown) / 1000 });
      out.textContent = n === right ? T.ui.right : T.ui.wrongIs(NOTE_NAMES[right].join(' / '));
      if (res.length < rounds) next(); else finish(true);
    },
    stop() { finish(false); },
  };
  function finish(done) {
    el.classList.remove('on'); box.hidden = true; go.textContent = T.ui.fretGo;
    if (running === self) running = null;
    if (!done) { out.textContent = ''; return; }
    const good = res.filter(r => r.ok).map(r => r.sec).sort((a, b) => a - b);
    const med = good.length ? (good[(good.length - 1) >> 1] + good[good.length >> 1]) / 2 : NaN;
    out.innerHTML = T.ui.fretResult(good.length, rounds, fmtSec(med)) + suggest('fretboard', fretboardStop(good.length, rounds, med));
  }
  el.classList.add('on'); box.hidden = false; go.textContent = T.ui.stop; out.textContent = '';
  next();
  return self;
}
// A plucked note: sawtooth through a closing low-pass, fast attack, long decay. Not a sine, so phone speakers play it.
function pluck(ctx, when, hz, vol) {
  const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  o.type = 'sawtooth'; o.frequency.value = hz;
  f.type = 'lowpass'; f.frequency.setValueAtTime(3200, when); f.frequency.exponentialRampToValueAtTime(800, when + 0.9);
  g.gain.setValueAtTime(0.0001, when); g.gain.exponentialRampToValueAtTime(vol, when + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 2.6);
  o.connect(f); f.connect(g); g.connect(ctx.destination);
  o.start(when); o.stop(when + 2.7);
  return { g, t: when };
}
// Strummed low to high. The voices share 0.6 of full scale, so the sum never clips into extra harmonics.
const strum = (ctx, notes) => notes.map((n, i) => pluck(ctx, ctx.currentTime + 0.05 + i * 0.03, midiHz(n), 0.6 / notes.length));
function startChordQuiz(el) {
  const go = el.querySelector('.tgo'), out = el.querySelector('.tout'), box = el.querySelector('.qz');
  const head = el.querySelector('.qzpos'), num = el.querySelector('.qzn'), pad = el.querySelector('.chords');
  const level = Number(el.dataset.level) || 0;
  delete el.dataset.level;
  const ctx = audio();
  if (!ctx) { out.textContent = T.ui.noAudio; return null; }
  const { name, types } = EAR_LEVELS[level];
  let cur = null, last = null, right = 0, done = 0, nodes = [], wait = 0;
  const play = () => { silence(nodes); nodes = strum(ctx, chordNotes(cur.root, cur.type)); };
  const next = () => {
    let c;
    do c = { root: 55 + Math.floor(Math.random() * 12), type: types[Math.floor(Math.random() * types.length)] };
    while (last && last.root === c.root && last.type === c.type);
    cur = c;
    num.textContent = T.ui.of(done + 1, EAR_ROUNDS);
    play();
  };
  const self = {
    el,
    answer(i) {
      if (!cur) return;
      const ok = types[i] === cur.type;
      if (ok) right++; done++;
      out.textContent = (ok ? T.ui.rightIs : T.ui.wrongIs)(CHORDS[cur.type][0]);
      last = cur; cur = null;
      if (done < EAR_ROUNDS) wait = setTimeout(next, 600); else finish(true);
    },
    replay() { if (cur) play(); },
    stop() { finish(false); },
  };
  function finish(complete) {
    clearTimeout(wait); cur = null;
    if (!complete) silence(nodes);
    el.classList.remove('on'); box.hidden = true; go.textContent = T.ui.earGo;
    if (running === self) running = null;
    if (!complete) { out.textContent = ''; return; }
    const pass = right >= EAR_PASS, stop = level + (pass ? 1 : 0);
    let html = T.ui.earResult(name, right, EAR_ROUNDS, pass, EAR_PASS) + suggest('chordear', stop);
    if (pass && level + 1 < EAR_LEVELS.length) html += ` <button type="button" class="btn tnext" data-level="${level + 1}">${T.ui.next(EAR_LEVELS[level + 1].name)}</button>`;
    out.innerHTML = html;
  }
  pad.innerHTML = types.map((t, i) => `<button type="button" class="nb" data-n="${i}">${CHORDS[t][0]}</button>`).join('');
  head.textContent = name;
  el.classList.add('on'); box.hidden = false; go.textContent = T.ui.stop; out.textContent = '';
  // A blocked AudioContext stays suspended instead of throwing; without sound the result would mean nothing.
  setTimeout(() => {
    if (running === self && ctx.state !== 'running') { stopTool(); out.textContent = T.ui.noAudio; }
  }, 400);
  next();
  return self;
}
function startRhythm(el) {
  const go = el.querySelector('.tgo'), out = el.querySelector('.tout'), box = el.querySelector('.qz');
  const head = el.querySelector('.qzpos'), pad = el.querySelector('.tap');
  const level = Number(el.dataset.level) || 0;
  delete el.dataset.level;
  const ctx = audio();
  if (!ctx) { out.textContent = T.ui.noAudio; return null; }
  const { name, clicks } = RHYTHM_LEVELS[level], B = RHYTHM.beats, n = RHYTHM.bars * B, total = RHYTHM.lead * B + n;
  const beat = 60 / Number(el.querySelector('.tbpm').value), t0 = ctx.currentTime + 0.15, start = t0 + RHYTHM.lead * B * beat;
  const taps = [], release = keepAwake();
  let nodes = [], i = 0;
  // Taps use the event's own time stamp, so a busy main thread does not shift them; an old browser that stamps events
  // on another clock falls back to the time of handling.
  const stamp = ev => { const now = performance.now(); return Math.abs(ev.timeStamp - now) < 5000 ? ev.timeStamp : now; };
  const onPad = ev => { ev.preventDefault(); taps.push(stamp(ev)); };
  const onKey = ev => {
    if (ev.key !== ' ' && ev.key !== 'Enter') return;
    // Space or Enter on another control (the stop button, the tempo) keeps its usual meaning.
    if (ev.target !== pad && ev.target.closest && ev.target.closest('button, select, input, textarea, a')) return;
    ev.preventDefault();
    if (!ev.repeat) taps.push(stamp(ev));
  };
  const schedule = () => {
    while (i < total && t0 + i * beat < ctx.currentTime + 0.2) {
      if (i < RHYTHM.lead * B || clicks.includes(i % B)) nodes.push(beep(ctx, t0 + i * beat, i % B ? 1000 : 1600));
      i++;
    }
    nodes = nodes.filter(x => x.t > ctx.currentTime - 0.5);
    // Half a beat after the last one, plus room for a slow output (Bluetooth).
    if (ctx.currentTime > t0 + (total - 0.5) * beat + 0.4) finish(true);
  };
  // Context time → performance time, the clock of the taps. Any constant error cancels out in rhythmStats.
  const toPerf = () => {
    let ts = null;
    try { ts = ctx.getOutputTimestamp && ctx.getOutputTimestamp(); } catch (e) {}
    if (ts && ts.performanceTime > 0) return c => ts.performanceTime + (c - ts.contextTime) * 1000;
    const p = performance.now(), c0 = ctx.currentTime;
    return c => p + (c - c0) * 1000;
  };
  const self = { el, level, stop() { finish(false); } };
  function finish(complete) {
    clearInterval(iv); release();
    pad.removeEventListener('pointerdown', onPad);
    document.removeEventListener('keydown', onKey, true);
    if (!complete) silence(nodes);
    el.classList.remove('on'); box.hidden = true; go.textContent = T.ui.rhythmGo;
    if (running === self) running = null;
    if (!complete) { out.textContent = ''; return; }
    const st = rhythmStats(taps, toPerf()(start), beat * 1000, n);
    if (n - st.misses < n / 2) { out.textContent = T.ui.rhythmFew; return; }
    const r = rhythmResult(level, st);
    let html = T.ui.rhythmResult(name, Math.round(st.spread * 100), st.misses, st.extra, r.pass, Math.round(RHYTHM.pass * 100), RHYTHM.misses)
      + suggest('metronome', r.stop);
    if (r.pass && level + 1 < RHYTHM_LEVELS.length) html += ` <button type="button" class="btn tnext" data-level="${level + 1}">${T.ui.next(RHYTHM_LEVELS[level + 1].name)}</button>`;
    out.innerHTML = html;
  }
  pad.addEventListener('pointerdown', onPad);
  document.addEventListener('keydown', onKey, true);
  head.textContent = name;
  // Nothing on screen moves while the clicks are sparse: a counter or a flash would be a visual click.
  el.classList.add('on'); box.hidden = false; go.textContent = T.ui.stop; out.textContent = T.ui.rhythmRun;
  pad.focus({ preventScroll: true });
  const iv = setInterval(schedule, 25);
  schedule();
  // A blocked AudioContext stays suspended instead of throwing; without clicks the result would mean nothing.
  setTimeout(() => {
    if (running === self && ctx.state !== 'running') { stopTool(); out.textContent = T.ui.noAudio; }
  }, 400);
  return self;
}
const TOOLS = { minute: startMinute, gap: startGap, fretboard: startFretQuiz, chordear: startChordQuiz, rhythm: startRhythm };
function stopTool() { if (running) running.stop(); running = null; }
function toggleTool(el) {
  if (running && running.el === el) { stopTool(); return; }
  stopTool();
  const start = TOOLS[el.dataset.tool];
  running = start ? start(el) : null;
}
// A new setting restarts a running tool; a test keeps the level it was on.
function restartTool(el) {
  if (!running || running.el !== el) return;
  const level = running.level;
  stopTool();
  if (level != null) el.dataset.level = level;
  toggleTool(el);
}
document.addEventListener('visibilitychange', () => { if (document.hidden) stopTool(); });
$('#quiz').addEventListener('keyup', ev => {
  const t = ev.target;
  if (t.type === 'range' && state.answers[t.name] == null && /^(Arrow|Home$|End$|Page)/.test(ev.key)) setAnswer(t.name, Number(t.value));
});
[['#p-years', 'years'], ['#p-week', 'perWeek'], ['#p-hours', 'hours']].forEach(([sel, key]) => {
  $(sel).addEventListener('input', ev => {
    const v = parseFloat(String(ev.target.value).replace(',', '.'));
    state.practice[key] = Number.isFinite(v) ? v : 0;
    persist();
  });
});
$('#cal').addEventListener('change', ev => {
  MODEL.anchorElo = clampAnchor(ev.target.value);
  state.anchorElo = MODEL.anchorElo;
  ev.target.value = MODEL.anchorElo;
  renderAnchors();
  persist();
});
function startFresh() {
  stopTool();
  state.answers = {};
  state.measured = {};
  state.example = false;
  syncForm();
  persist();
  const first = document.querySelector('#quiz input');
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('#quiz').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  if (first) first.focus({ preventScroll: true });
}
$('#start').addEventListener('click', startFresh);
$('#reset').addEventListener('click', startFresh);
function showExample() {
  state.answers = { ...EXAMPLE };
  state.measured = {};
  state.practice = { ...CAL };
  state.example = true;
  syncForm();
  persist();
}
$('#loadExample').addEventListener('click', showExample);
$('#showExample').addEventListener('click', showExample);
$('#copy').addEventListener('click', () => {
  const text = resultText();
  const box = $('#copybox'), status = $('#status');
  const fallback = () => { box.hidden = false; box.value = text; box.focus(); box.select(); status.textContent = T.ui.copyManual; };
  try {
    navigator.clipboard.writeText(text).then(() => {
      box.hidden = true; status.textContent = T.ui.copied;
      setTimeout(() => { status.textContent = ''; }, 2500);
    }, fallback);
  } catch (e) { fallback(); }
});
$('#toScore').addEventListener('click', () => {
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('#score').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
});
try {
  const bar = $('#barMobile');
  new IntersectionObserver(entries => {
    for (const en of entries) bar.classList.toggle('show', !en.isIntersecting);
  }).observe($('#score'));
} catch (e) {}

// Language: / is English, /ru/ Russian. A click on the switch remembers the choice, and the English page's head sends
// a visitor who chose Russian on to /ru/. A Russian-language browser without a saved choice gets a hint, not a redirect.
const LANG_KEY = 'guitar-elo-lang';
const rememberLang = l => { try { localStorage.setItem(LANG_KEY, l); } catch (e) {} };
document.querySelectorAll('a[data-lang]').forEach(a => a.addEventListener('click', () => rememberLang(a.dataset.lang)));
const langHint = $('#langhint');
if (langHint) {
  let chosen = null;
  try { chosen = localStorage.getItem(LANG_KEY); } catch (e) {}
  if (!chosen && (navigator.languages || [navigator.language || '']).some(l => /^ru\b/i.test(l))) langHint.hidden = false;
  langHint.querySelector('button').addEventListener('click', () => { langHint.hidden = true; rememberLang('en'); });
}
