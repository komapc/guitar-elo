// Guitar Elo, the two reading pages: How it is scored (calibration, anchor table, chart) and Scale and comparisons
// (bands, reference points, Vysotsky). Loads after common.js; each part draws only if its element is on the page.
function renderBands() {
  $('#bands').innerHTML = BANDS.map((b, i) => {
    const hi = BANDS[i + 1] ? BANDS[i + 1].min - 1 : null;
    const range = b.min === 0 ? T.ui.upTo(BANDS[1].min - 1) : hi ? `${b.min}–${hi}` : `${b.min}+`;
    return `<div><b>${range}</b>${b.name}. ${b.guitar}</div>`;
  }).join('');
}

// Everything here follows the calibration.
function renderCurve() {
  if ($('#anchors')) $('#anchors').innerHTML = curveAnchors().map(a =>
    `<tr${a.cal ? ' class="calrow"' : ''}><td class="n">${a.h.toLocaleString(T.locale)}</td><td class="n">${a.e}</td><td>${a.src}</td></tr>`).join('');
  if ($('#refs')) renderRefs();
  if ($('#cplot')) renderChart();
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
if ($('#cplot')) {
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
}

// Looks questions up directly: the quiz is not on this page.
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

if ($('#bands')) renderBands();
renderCurve();
const cal = $('#cal');
if (cal) {
  cal.value = MODEL.anchorElo;
  cal.addEventListener('change', () => {
    MODEL.anchorElo = clampAnchor(cal.value);
    cal.value = MODEL.anchorElo;
    writeCal(MODEL.anchorElo);
    renderCurve();
  });
}
onCalChange(() => { if (cal) cal.value = MODEL.anchorElo; renderCurve(); });
