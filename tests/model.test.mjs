// Checks the scoring model in site/app.js with each language's strings (site/i18n/*.js), and that the two
// languages agree. No dependencies: run with `node tests/model.test.mjs`.
import { readFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = f => readFileSync(new URL('../site/' + f, import.meta.url), 'utf8');
const app = read('app.js');
new Function(app); // the whole page script must parse
const model = app.split('/*MODEL*/')[1].split('/*END MODEL*/')[0];
const EXPORTS = 'score, eloFromHours, hoursFromElo, QDEF, QUESTIONS, EXAMPLE, MODEL, CAL_HOURS, gapBarClicks, noteAt, NOTE_NAMES, fretboardStop, REFS, VYSOTSKY, CHORDS, EAR_LEVELS, EAR_PASS, EAR_ROUNDS, chordNotes, midiHz, CHESS_GROUPS, REACH_2200, EXPECTED, expectedElo, BANDS, CATS, curveAnchors, MEASURED_WEIGHT, RHYTHM, RHYTHM_LEVELS, rhythmStats, rhythmResult';
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
  n: ['anchors', 'bands', 'notes', 'refs', 'groups', 'earLevels', 'rhythmLevels'].map(k => T[k].length),
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
check('search and social tags: preview image, structured data, sitemap alternates', () => {
  const url = 'https://guitar-elo.lipu.dev/' + (lang === 'en' ? '' : lang + '/');
  const img = html.match(/<meta property="og:image" content="([^"]+)">/)?.[1];
  assert.equal(img, `https://guitar-elo.lipu.dev/og-${lang}.png`);
  const png = readFileSync(new URL(`../site/og-${lang}.png`, import.meta.url));
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1200, 630], 'og image is 1200×630');
  assert.ok(html.includes('<meta name="twitter:card" content="summary_large_image">'));
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(x => JSON.parse(x[1]));
  assert.equal(blocks.length, 1);
  const ld = blocks[0];
  assert.deepEqual([ld['@type'], ld.url, ld.inLanguage, ld.image], ['WebApplication', url, lang, img]);
  assert.equal(ld.description, html.match(/<meta name="description" content="([^"]+)">/)[1]);
  assert.ok(!/aggregateRating|review|author/i.test(JSON.stringify(ld)), 'no ratings or personal names');
  // The sitemap entry for this page lists the same alternates as the page head.
  const map = readFileSync(new URL('../site/sitemap.xml', import.meta.url), 'utf8');
  const entry = map.split('<url>').find(u => u.includes(`<loc>${url}</loc>`));
  const alt = src => [...src.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map(x => x[1] + ' ' + x[2]).sort();
  assert.ok(entry, 'page is in the sitemap');
  assert.deepEqual(alt(entry), alt(html.split('</head>')[0].replace(/<a [^>]*>/g, '')));
  if (lang === 'en') assert.ok(html.includes('<meta name="msvalidate.01" content="'), 'Bing verification on /');
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
  assert.deepEqual(tools, ['changes:minute', 'metronome:rhythm', 'gap:gap', 'fretboard:fretboard', 'chordear:chordear']);
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
// Deterministic noise for synthetic taps.
const rng = seed => () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const gauss = r => () => Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r());
const grid = (n, start, beat, f) => Array.from({ length: n }, (_, k) => f(start + k * beat, k)).flat();
check('rhythm test: a constant offset (latency, tapping early) does not count, only the spread', () => {
  // Players tap through the count-in too (8 beats before `start`), so an offset near a whole beat still fills every beat.
  for (const off of [0, -0.04, 0.3, 0.49, 0.8, 1.7]) {
    const st = m.rhythmStats(grid(40, 1000 - 8 * 750, 750, t => t + off * 750), 1000, 750, 32);
    assert.ok(st.spread < 1e-9 && st.misses === 0 && st.extra === 0, `offset ${off}: ${JSON.stringify(st)}`);
  }
  const g = gauss(rng(7));
  const st = m.rhythmStats(grid(32, 0, 600, t => t + 120 + 0.04 * 600 * g()), 0, 600, 32);
  assert.ok(st.spread > 0.03 && st.spread < 0.05 && st.misses === 0, JSON.stringify(st));
});
check('rhythm test: missed beats, double taps, taps outside the measured bars', () => {
  const st = m.rhythmStats(grid(32, 0, 500, (t, k) => (k % 10 === 3 ? [] : k === 5 ? [t, t + 40] : [t])), 0, 500, 32);
  assert.deepEqual([st.misses, st.extra], [3, 1]);
  const lead = grid(8, -4000, 500, t => t), after = [16000, 16500];
  const st2 = m.rhythmStats([...lead, ...grid(32, 0, 500, t => t), ...after], 0, 500, 32);
  assert.deepEqual([st2.misses, st2.extra], [0, 0]);
  const none = m.rhythmStats([], 0, 500, 32);
  assert.ok(none.misses === 32 && !Number.isFinite(none.spread));
});
check('rhythm test: random tapping is far over the limits', () => {
  const r = rng(3), st = m.rhythmStats(Array.from({ length: 32 }, () => r() * 32 * 500), 0, 500, 32);
  assert.ok(st.spread > m.RHYTHM.lost, JSON.stringify(st));
  assert.equal(m.rhythmResult(0, st).stop, 0);
});
check('rhythm test: level results map to stops; the top stop is never suggested', () => {
  const q = m.QUESTIONS.find(x => x.id === 'metronome'), top = q.o.length - 1;
  const ok = { spread: 0.03, misses: 0, extra: 0 }, shaky = { spread: 0.11, misses: 1, extra: 0 };
  assert.deepEqual(m.RHYTHM_LEVELS.map((_, k) => m.rhythmResult(k, ok).stop), [2, 3, 4]);
  assert.ok(m.RHYTHM_LEVELS.every((_, k) => m.rhythmResult(k, ok).stop < top && m.rhythmResult(k, shaky).stop < top));
  assert.deepEqual(m.RHYTHM_LEVELS.map((_, k) => m.rhythmResult(k, shaky).stop), [1, 2, 3]);
  assert.equal(m.rhythmResult(0, { spread: 0.05, misses: 9, extra: 0 }).stop, 0);
  assert.equal(m.rhythmResult(0, { spread: 0.05, misses: 3, extra: 0 }).pass, false);
  assert.equal(m.rhythmResult(0, { spread: 0.05, misses: 0, extra: 3 }).pass, false);
  // Cameron & Grahn 2014 report the CV of inter-tap intervals; with independent tap errors that is √2 × our spread.
  const cv = m.RHYTHM.pass * Math.SQRT2;
  assert.ok(cv > 0.052 && cv < 0.115, `inter-tap CV ${cv} between percussionists and other musicians`);
  const at = sd => { const g = gauss(rng(5)); return m.rhythmStats(grid(32, 0, 500, t => t + sd * 500 * g()), 0, 500, 32); };
  assert.equal(m.rhythmResult(0, at(m.RHYTHM.pass * 0.7)).pass, true, 'a bit below the mark passes');
  assert.equal(m.rhythmResult(0, at(m.RHYTHM.pass * 1.4)).pass, false, 'a bit above the mark fails');
  assert.deepEqual(m.RHYTHM_LEVELS.map(l => l.clicks.length), [4, 2, 1]);
});
check('measured answers: count more only while the slider stays on the measured stop', () => {
  const base = { ...m.EXAMPLE };
  const plain = m.score(base), same = m.score(base, {});
  assert.equal(plain.elo, same.elo);
  // fretboard sits below the example's average, so weighting it more must pull the average down, by a known amount.
  const meas = m.score(base, { fretboard: base.fretboard });
  const q = m.QUESTIONS.find(x => x.id === 'fretboard'), e = m.eloFromHours(q.o[base.fretboard][1]);
  const sw = m.QUESTIONS.reduce((a, x) => a + (base[x.id] != null ? x.w : 0), 0), extra = q.w * (m.MEASURED_WEIGHT - 1);
  assert.ok(Math.abs(meas.elo - (plain.elo * sw + extra * e) / (sw + extra)) < 1e-9);
  assert.ok(meas.elo < plain.elo);
  assert.equal(m.score(base, { fretboard: base.fretboard + 1 }).elo, plain.elo, 'slider moved off the measured stop');
  assert.ok(m.MEASURED_WEIGHT > 1 && m.MEASURED_WEIGHT <= 2);
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

check('IndexNow key file: one at the site root, named after its content', () => {
  const keys = readdirSync(new URL('../site/', import.meta.url)).filter(f => /^[0-9a-f]{32}\.txt$/.test(f));
  assert.equal(keys.length, 1);
  assert.equal(read(keys[0]), keys[0].slice(0, 32));
});

if (failed) { console.log(`${failed} failed`); process.exit(1); }
