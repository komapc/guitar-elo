// Guitar Elo, the quiz page (/ and /ru/): questions, self-tests and the score panel. Loads after common.js, which holds
// the model, the calibration and the language switch.

// Questions that got a new stop at the bottom in a given revision; saved answers from before it move up by one.
const REV = 2, SHIFTED = { 2: ['pick', 'fingers', 'noise', 'bend', 'vibrato', 'legato', 'ear', 'hardest'] };
// `measured`: the stop each test showed, by question id (see MEASURED_WEIGHT). A shift moves it along with the answer.
let state = { answers: {}, measured: {}, practice: { ...CAL }, example: false, rev: REV };
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
delete state.anchorElo; // its own key now, see readCal in common.js

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
    + `<div class="qz" hidden><div class="qzq"><span class="qzpos"></span></div><div class="tprog" aria-hidden="true"><i></i></div>`
    + `<button type="button" class="tap">${T.ui.tap}<span class="tapn" aria-hidden="true"></span></button></div></div>`;
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
}

function syncForm() {
  for (const q of QUESTIONS) syncQ(q);
  $('#p-years').value = state.practice.years;
  $('#p-week').value = state.practice.perWeek;
  $('#p-hours').value = state.practice.hours;
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
syncForm();
update();
onCalChange(update);

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
// A finished test hides its buttons, and its result appears above the spot the player was looking at. On a phone that
// line can be off screen, so bring it into view.
function reveal(out) {
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  out.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
}
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
    reveal(out);
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
    out.innerHTML = html; reveal(out);
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
  const head = el.querySelector('.qzpos'), pad = el.querySelector('.tap'), count = el.querySelector('.tapn');
  const level = Number(el.dataset.level) || 0;
  delete el.dataset.level;
  const ctx = audio();
  if (!ctx) { out.textContent = T.ui.noAudio; return null; }
  const { name, clicks } = RHYTHM_LEVELS[level], B = RHYTHM.beats, n = RHYTHM.bars * B, total = RHYTHM.lead * B + n;
  const beat = 60 / Number(el.querySelector('.tbpm').value), t0 = ctx.currentTime + 0.15, start = t0 + RHYTHM.lead * B * beat;
  const taps = [], release = keepAwake(), secs = Math.round(0.15 + total * beat);
  let nodes = [], i = 0, lit = 0;
  // Taps use the event's own time stamp, so a busy main thread does not shift them; an old browser that stamps events
  // on another clock falls back to the time of handling.
  const stamp = ev => { const now = performance.now(); return Math.abs(ev.timeStamp - now) < 5000 ? ev.timeStamp : now; };
  // Each tap lights the pad and counts, so the player sees it was taken. Both follow the player's own taps, never the beat.
  const took = t => {
    taps.push(t); count.textContent = T.ui.taps(taps.length);
    pad.classList.add('hit'); clearTimeout(lit); lit = setTimeout(() => pad.classList.remove('hit'), 90);
  };
  const onPad = ev => { ev.preventDefault(); took(stamp(ev)); };
  const onKey = ev => {
    if (ev.key !== ' ' && ev.key !== 'Enter') return;
    // Space or Enter on another control (the stop button, the tempo) keeps its usual meaning.
    if (ev.target !== pad && ev.target.closest && ev.target.closest('button, select, input, textarea, a')) return;
    ev.preventDefault();
    if (!ev.repeat) took(stamp(ev));
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
    clearInterval(iv); clearTimeout(lit); release();
    pad.removeEventListener('pointerdown', onPad);
    document.removeEventListener('keydown', onKey, true);
    if (!complete) silence(nodes);
    el.classList.remove('on'); box.hidden = true; go.textContent = T.ui.rhythmGo; pad.classList.remove('hit');
    if (running === self) running = null;
    if (!complete) { out.textContent = T.ui.rhythmStopped(secs); return; }
    const st = rhythmStats(taps, toPerf()(start), beat * 1000, n);
    if (n - st.misses < n / 2) { out.textContent = T.ui.rhythmFew; reveal(out); return; }
    const r = rhythmResult(level, st);
    let html = T.ui.rhythmResult(name, (st.spread * 100).toFixed(1).replace('.', T.dec), st.misses, st.extra, r.pass, Math.round(RHYTHM.pass * 100), RHYTHM.misses)
      + suggest('metronome', r.stop);
    if (r.pass && level + 1 < RHYTHM_LEVELS.length) html += ` <button type="button" class="btn tnext" data-level="${level + 1}">${T.ui.next(RHYTHM_LEVELS[level + 1].name)}</button>`;
    out.innerHTML = html; reveal(out);
  }
  pad.addEventListener('pointerdown', onPad);
  document.addEventListener('keydown', onKey, true);
  head.textContent = name; count.textContent = '';
  // Nothing on screen marks the beat while the clicks are sparse: a beat counter or a flash would be a visual click.
  // The progress bar fills smoothly over the whole run, so it shows how long is left without a pulse.
  const bar = el.querySelector('.tprog i');
  bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = `tprog ${secs}s linear forwards`;
  el.classList.add('on'); box.hidden = false; go.textContent = T.ui.stop; out.textContent = T.ui.rhythmRun(secs);
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
