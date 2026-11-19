// Guitar Elo, shared by every page (the quiz, How it is scored, Scale and comparisons; English and Russian): the
// scoring model, number formatting, the calibration and the language switch. Every visible string comes from T,
// which i18n/en.js or i18n/ru.js defines before this file loads; the numbers (hours, weights, curve) live only here.
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
// because a short test in a browser is noisy too (an online beat-perception test retested at only r ≈ .30, Harrison & Müllensiefen 2018).
const MEASURED_WEIGHT = 1.5;
// The answers are estimates of hours, so the hours are averaged (weighted, in log hours: the curve's own x axis) and
// the mean goes through the curve once. Averaging each answer's Elo instead would let the steep part of the curve
// (1 404–11 053 h, about 3× the slope below 100 h) pull an uneven profile up: 10 h and 11 053 h would give ≈1 350,
// not the ≈1 060 of their mean hours. Categories are averaged the same way. sd is the weighted RMS distance of the
// answers' own Elo from the result, so it also grows when the answers are lopsided.
const eloAtX = x => eloFromHours(Math.pow(10, x) - 10);
function score(answers, measured = {}) {
  let sw = 0, sx = 0, n = 0;
  const items = [], cats = {};
  for (const q of QUESTIONS) {
    const a = answers[q.id];
    if (a == null || a === 'skip' || !q.o[a]) continue;
    const x = lx(q.o[a][1]), w = q.w * (measured[q.id] === a ? MEASURED_WEIGHT : 1);
    items.push({ e: eloAtX(x), w });
    sw += w; sx += w * x; n++;
    const c = cats[q.cat] || (cats[q.cat] = { sw: 0, sx: 0 });
    c.sw += w; c.sx += w * x;
  }
  if (!n) return { n: 0, catElo: {} };
  const elo = eloAtX(sx / sw);
  const sd = Math.sqrt(items.reduce((s, it) => s + it.w * (it.e - elo) ** 2, 0) / sw);
  const catElo = {};
  for (const k in cats) catElo[k] = eloAtX(cats[k].sx / cats[k].sw);
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
// The limits are assumptions. `pass` is the SD of the taps around the beat, as a share of a beat. With independent tap
// errors the variability of the intervals between taps is √2 times that, so 0.05 ≈ an inter-tap CV of 0.07: between
// percussionists (0.052) and other trained musicians (0.115) in Cameron & Grahn 2014, whose task (finding the beat of a
// rhythm) was harder than tapping along with a click. Tapping along with a click on every beat separates people
// weakly (Repp 2010: amateurs ≈ non-musicians), so the first level says the least. `lost` and `misses` are judgement calls.
const RHYTHM_LEVELS = [[0, 1, 2, 3], [1, 3], [0]].map((clicks, i) => ({ name: T.rhythmLevels[i], clicks }));
const RHYTHM = { lead: 2, bars: 8, beats: 4, pass: 0.05, lost: 0.15, misses: 2 };
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

// The calibration (Elo at 1,404 h) is set on the How it is scored page and read by every page. It has its own key, so
// the quiz page never writes it back from a stale copy. Saves from before it was split off kept it in the quiz state.
const CAL_KEY = 'guitar-elo-cal';
function readCal() {
  try {
    const v = localStorage.getItem(CAL_KEY);
    if (v != null) return clampAnchor(v);
    const s = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (s && s.anchorElo != null) { const a = clampAnchor(s.anchorElo); localStorage.setItem(CAL_KEY, String(a)); return a; }
  } catch (e) {}
  return clampAnchor(null);
}
function writeCal(v) { try { localStorage.setItem(CAL_KEY, String(v)); } catch (e) {} }
MODEL.anchorElo = readCal();
// Another tab or the back-forward cache may hold a page from before a calibration change: `then` runs after it moves.
function onCalChange(then) {
  const check = () => { const v = readCal(); if (v !== MODEL.anchorElo) { MODEL.anchorElo = v; then(); } };
  addEventListener('pageshow', check);
  addEventListener('storage', ev => { if (ev.key === CAL_KEY || ev.key == null) check(); });
}

// Language: every page is in English at its path and in Russian under /ru/. A click on the switch remembers the choice,
// and an English page's head sends a visitor who chose Russian on to the same page under /ru/. A Russian-language
// browser without a saved choice gets a hint, not a redirect.
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
