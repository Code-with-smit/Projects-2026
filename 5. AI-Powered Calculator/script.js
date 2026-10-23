/* ═══════════════════════════════════════════════════════════
    NEXUS AI CALCULATOR — Pure Vanilla JavaScript
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── GLOBAL STATE ──────────────────────────────────────── */
const State = {
  soundOn: JSON.parse(localStorage.getItem('nexus-sound') ?? 'false'),
  theme: localStorage.getItem('nexus-theme') || 'dark',
  sciMode: 'deg',
  memory: 0,
  stdExpr: '', stdResult: '0', stdOp: null, stdPrev: null, stdNewNum: true,
  sciInput: '',
  progValue: '0', progBase: 10, progOp: null, progPrev: null,
  graphScale: 40, graphOffX: 0, graphOffY: 0, graphDragging: false, graphDragStart: null,
  histFilter: 'all',
  formulaCat: 'All',
  history: JSON.parse(localStorage.getItem('nexus-history') || '[]'),
  gstMode: 'excl',
  sipMode: 'sip',
  audioCtx: null,
};

/* ─── INIT ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(State.theme, false);
  initParticles();
  initNavigation();
  initMouseGlow();
  initClock();
  initStandardCalc();
  initScientific();
  initProgrammer();
  initGraphing();
  initCurrency();
  initUnitConverter();
  renderHistory();
  initFormulas();
  initKeyboard();
  calcEMI(); calcSIP(); calcGST(); calcCI();
  updateDashStats();
});

/* ─── PARTICLES ─────────────────────────────────────────── */
function initParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left:${Math.random() * 100}%;
      animation-duration:${8 + Math.random() * 12}s;
      animation-delay:-${Math.random() * 20}s;
      --dx:${(Math.random() - 0.5) * 60}px;
      opacity:${0.2 + Math.random() * 0.3};
      width:${1 + Math.random() * 2}px;
      height:${1 + Math.random() * 2}px;
    `;
    container.appendChild(p);
  }
}

/* ─── MOUSE GLOW ────────────────────────────────────────── */
function initMouseGlow() {
  const glow = document.getElementById('mouse-glow');
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

/* ─── CLOCK ─────────────────────────────────────────────── */
function initClock() {
  function tick() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const el = document.getElementById('clock');
    if (el) el.textContent = `${h}:${m}:${s}`;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const d = document.getElementById('date-display');
    if (d) d.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  }
  tick();
  setInterval(tick, 1000);
}

/* ─── NAVIGATION ────────────────────────────────────────── */
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      navigateTo(page);
      playClick();
    });
  });
  document.querySelectorAll('.dash-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      navigateTo(tile.dataset.goto);
      playClick();
    });
  });
}

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  const navEl = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navEl) navEl.classList.add('active');
  if (page === 'graphing') setTimeout(resizeGraph, 100);
  if (page === 'dashboard') updateDashStats();
}

/* ─── SOUND ─────────────────────────────────────────────── */
function playClick() {
  if (!State.soundOn) return;
  try {
    if (!State.audioCtx) State.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = State.audioCtx.createOscillator();
    const gain = State.audioCtx.createGain();
    osc.connect(gain); gain.connect(State.audioCtx.destination);
    osc.frequency.value = 800; osc.type = 'sine';
    gain.gain.setValueAtTime(0.08, State.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, State.audioCtx.currentTime + 0.08);
    osc.start(); osc.stop(State.audioCtx.currentTime + 0.08);
  } catch (e) { }
}

function toggleSound(el) {
  State.soundOn = !State.soundOn;
  el.classList.toggle('on', State.soundOn);
  localStorage.setItem('nexus-sound', JSON.stringify(State.soundOn));
}

/* ─── THEME ─────────────────────────────────────────────── */
function setTheme(name, el) {
  applyTheme(name, true);
  if (el) {
    document.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
  }
  playClick();
}

function applyTheme(name, save) {
  document.documentElement.setAttribute('data-theme', name);
  State.theme = name;
  if (save) localStorage.setItem('nexus-theme', name);
  const swatch = document.querySelector(`.theme-swatch[data-theme="${name}"]`);
  if (swatch) {
    document.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
  }
}

/* ─── HELPERS ───────────────────────────────────────────── */
function fmt(n, sym = '₹') {
  if (!isFinite(n) || isNaN(n)) return sym + '0';
  return sym + Math.round(n).toLocaleString('en-IN');
}
function fmtNum(n) {
  if (!isFinite(n) || isNaN(n)) return '0';
  const s = parseFloat(n.toPrecision(12));
  return isNaN(s) ? '0' : String(s);
}

function addToHistory(expr, result, category) {
  const item = { id: Date.now() + Math.random(), expression: expr, result: String(result), timestamp: Date.now(), category, starred: false };
  State.history.unshift(item);
  if (State.history.length > 200) State.history = State.history.slice(0, 200);
  saveHistory();
  updateDashStats();
}
function saveHistory() { localStorage.setItem('nexus-history', JSON.stringify(State.history)); }
function updateDashStats() {
  const total = State.history.length;
  const today = State.history.filter(h => new Date(h.timestamp).toDateString() === new Date().toDateString()).length;
  const starred = State.history.filter(h => h.starred).length;
  const t = document.getElementById('stat-total'); if (t) t.textContent = total;
  const td = document.getElementById('stat-today'); if (td) td.textContent = today;
  const st = document.getElementById('stat-starred'); if (st) st.textContent = starred;
}

/* ═══════════════════════════════════════════════════════════
   STANDARD CALCULATOR
   ═══════════════════════════════════════════════════════════ */
function initStandardCalc() {
  document.querySelectorAll('#page-standard .cbtn').forEach(btn => {
    btn.addEventListener('click', () => { playClick(); handleStd(btn); });
  });
}

function handleStd(btn) {
  const action = btn.dataset.action;
  const val = btn.dataset.val;
  let r = parseFloat(State.stdResult.replace(/,/g, '')) || 0;

  if (action === 'num') {
    if (State.stdNewNum) { State.stdResult = val; State.stdNewNum = false; }
    else { State.stdResult = State.stdResult === '0' ? val : State.stdResult + val; }
  } else if (action === 'dot') {
    if (State.stdNewNum) { State.stdResult = '0.'; State.stdNewNum = false; }
    else if (!State.stdResult.includes('.')) State.stdResult += '.';
  } else if (action === 'clear') {
    State.stdResult = '0'; State.stdExpr = ''; State.stdOp = null; State.stdPrev = null; State.stdNewNum = true;
  } else if (action === 'backspace') {
    if (!State.stdNewNum) {
      State.stdResult = State.stdResult.length > 1 ? State.stdResult.slice(0, -1) : '0';
    }
  } else if (action === 'sign') {
    State.stdResult = String(-parseFloat(State.stdResult));
  } else if (action === 'sqrt') {
    const v = Math.sqrt(parseFloat(State.stdResult));
    State.stdExpr = `√(${State.stdResult})`; State.stdResult = fmtNum(v); State.stdNewNum = true;
    addToHistory(`√(${r})`, fmtNum(v), 'standard');
  } else if (action === 'sq') {
    const v = r * r;
    State.stdExpr = `(${State.stdResult})²`; State.stdResult = fmtNum(v); State.stdNewNum = true;
    addToHistory(`(${r})²`, fmtNum(v), 'standard');
  } else if (action === 'inv') {
    if (r !== 0) { const v = 1 / r; State.stdExpr = `1/(${State.stdResult})`; State.stdResult = fmtNum(v); State.stdNewNum = true; }
  } else if (action === 'op') {
    if (State.stdOp && !State.stdNewNum) stdCompute();
    State.stdOp = val; State.stdPrev = parseFloat(State.stdResult.replace(/,/g, ''));
    State.stdExpr = State.stdResult + ' ' + val + ' '; State.stdNewNum = true;
  } else if (action === 'equals') {
    if (State.stdOp && State.stdPrev !== null) {
      const cur = parseFloat(State.stdResult.replace(/,/g, ''));
      const expr = State.stdExpr + State.stdResult;
      stdCompute();
      addToHistory(expr, State.stdResult, 'standard');
    }
  } else if (action === 'mem') {
    const mv = parseFloat(State.stdResult.replace(/,/g, ''));
    if (val === 'MS') { State.memory = mv; }
    else if (val === 'MR') { State.stdResult = fmtNum(State.memory); State.stdNewNum = true; }
    else if (val === 'M+') { State.memory += mv; }
    else if (val === 'M-') { State.memory -= mv; }
    else if (val === 'MC') { State.memory = 0; }
    document.getElementById('mem-val').textContent = fmtNum(State.memory);
  }
  // percentage
  if (action === 'op' && val === '%') {
    if (State.stdPrev !== null) State.stdResult = fmtNum(State.stdPrev * parseFloat(State.stdResult) / 100);
    else State.stdResult = fmtNum(parseFloat(State.stdResult) / 100);
    State.stdNewNum = true;
  }
  updateStdDisplay();
}

function stdCompute() {
  const a = State.stdPrev, b = parseFloat(State.stdResult.replace(/,/g, ''));
  let res;
  if (State.stdOp === '+') res = a + b;
  else if (State.stdOp === '−') res = a - b;
  else if (State.stdOp === '×') res = a * b;
  else if (State.stdOp === '÷') res = b !== 0 ? a / b : 'Error';
  else if (State.stdOp === '%') res = a * b / 100;
  State.stdResult = typeof res === 'string' ? res : fmtNum(res);
  State.stdOp = null; State.stdPrev = null; State.stdNewNum = true;
}

function updateStdDisplay() {
  const re = document.getElementById('std-result');
  const ex = document.getElementById('std-expr');
  if (re) { re.textContent = State.stdResult; re.classList.toggle('glow', State.stdResult !== '0' && State.stdNewNum); }
  if (ex) ex.textContent = State.stdExpr;
}

/* ═══════════════════════════════════════════════════════════
   SCIENTIFIC CALCULATOR
   ═══════════════════════════════════════════════════════════ */
function initScientific() {
  document.querySelectorAll('#page-scientific .cbtn[data-sci]').forEach(btn => {
    btn.addEventListener('click', () => { playClick(); appendSci(btn.dataset.sci); });
  });
  document.getElementById('sci-eq').addEventListener('click', () => { playClick(); evaluateSci(); });
  document.querySelectorAll('#page-scientific .cbtn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      playClick();
      if (btn.dataset.action === 'sci-clear') { State.sciInput = ''; updateSciDisplay(); }
      if (btn.dataset.action === 'sci-back') { State.sciInput = State.sciInput.slice(0, -1); updateSciDisplay(); }
    });
  });
}

function setSciMode(m) {
  State.sciMode = m;
  document.getElementById('deg-btn').classList.toggle('active', m === 'deg');
  document.getElementById('rad-btn').classList.toggle('active', m === 'rad');
}

function appendSci(val) {
  if (val === '(') {
    const open = (State.sciInput.match(/\(/g) || []).length;
    const close = (State.sciInput.match(/\)/g) || []).length;
    State.sciInput += open > close ? ')' : '(';
  } else {
    State.sciInput += val;
  }
  updateSciDisplay();
}

function updateSciDisplay() {
  const ex = document.getElementById('sci-expr');
  if (ex) ex.textContent = State.sciInput;
}

function evaluateSci() {
  if (!State.sciInput) return;
  try {
    let expr = State.sciInput;
    // Replace display chars
    expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/π/g, 'Math.PI').replace(/PI/g, 'Math.PI').replace(/E(?![+-]?\d)/g, 'Math.E');
    // Trig functions — handle deg/rad
    if (State.sciMode === 'deg') {
      expr = expr.replace(/\bsin\(/g, 'Math.sin(Math.PI/180*').replace(/\bcos\(/g, 'Math.cos(Math.PI/180*').replace(/\btan\(/g, 'Math.tan(Math.PI/180*');
      expr = expr.replace(/\basin\(/g, '(180/Math.PI*Math.asin(').replace(/\bacos\(/g, '(180/Math.PI*Math.acos(').replace(/\batan\(/g, '(180/Math.PI*Math.atan(');
    } else {
      expr = expr.replace(/\bsin\(/g, 'Math.sin(').replace(/\bcos\(/g, 'Math.cos(').replace(/\btan\(/g, 'Math.tan(');
      expr = expr.replace(/\basin\(/g, 'Math.asin(').replace(/\bacos\(/g, 'Math.acos(').replace(/\batan\(/g, 'Math.atan(');
    }
    expr = expr.replace(/\bsinh\(/g, 'Math.sinh(').replace(/\bcosh\(/g, 'Math.cosh(').replace(/\btanh\(/g, 'Math.tanh(');
    expr = expr.replace(/\bsqrt\(/g, 'Math.sqrt(').replace(/\bcbrt\(/g, 'Math.cbrt(');
    expr = expr.replace(/\blog\(/g, 'Math.log10(').replace(/\bln\(/g, 'Math.log(');
    expr = expr.replace(/\babs\(/g, 'Math.abs(');
    expr = expr.replace(/\bfact\(([^)]+)\)/g, (_, n) => `factorial(${n})`);

    // Auto-close brackets
    const opens = (expr.match(/\(/g) || []).length;
    const closes = (expr.match(/\)/g) || []).length;
    expr += ')'.repeat(Math.max(0, opens - closes));

    // Safe evaluate
    if (!/^[0-9+\-*/().Math a-z_,\s!^]+$/.test(expr.replace(/Math\.\w+/g, 'X').replace(/factorial/g, 'X'))) {
      throw new Error('unsafe');
    }
    const result = Function('factorial', `"use strict"; return (${expr})`)(factorial);
    const res = fmtNum(result);
    document.getElementById('sci-result').textContent = res;
    document.getElementById('sci-result').classList.add('glow');
    addToHistory(State.sciInput, res, 'scientific');
    State.sciInput = res;
  } catch (e) {
    document.getElementById('sci-result').textContent = 'Error';
    document.getElementById('sci-result').classList.remove('glow');
  }
}

function factorial(n) {
  n = Math.round(n);
  if (n < 0) return NaN;
  if (n > 170) return Infinity;
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

/* ═══════════════════════════════════════════════════════════
   PROGRAMMER CALCULATOR
   ═══════════════════════════════════════════════════════════ */
function initProgrammer() {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playClick();
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.progBase = parseInt(btn.dataset.base);
      updateProgDisplay();
      updateProgBtns();
    });
  });
  document.querySelectorAll('#page-programmer .cbtn[data-prog]').forEach(btn => {
    btn.addEventListener('click', () => { playClick(); handleProg(btn.dataset.prog); });
  });
  document.querySelectorAll('#page-programmer .cbtn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      playClick();
      if (btn.dataset.action === 'prog-clear') { State.progValue = '0'; State.progOp = null; State.progPrev = null; updateProgDisplay(); }
      if (btn.dataset.action === 'prog-back') {
        State.progValue = State.progValue.length > 1 ? State.progValue.slice(0, -1) : '0';
        updateProgDisplay();
      }
      if (btn.dataset.action === 'prog-eq') progCompute();
    });
  });
  updateProgBtns();
}

function handleProg(val) {
  const ops = ['AND', 'OR', 'XOR', 'NOT', 'NAND', 'NOR', 'LSH', 'RSH', '+', '-', '*', '/'];
  if (ops.includes(val)) {
    if (['AND', 'OR', 'XOR', 'NAND', 'NOR', 'LSH', 'RSH', '+', '-', '*', '/'].includes(val)) {
      State.progPrev = parseInt(State.progValue, State.progBase);
      State.progOp = val; State.progValue = '0';
    } else if (val === 'NOT') {
      const n = parseInt(State.progValue, State.progBase);
      State.progValue = (~n >>> 0).toString(State.progBase).toUpperCase();
      updateProgDisplay();
    }
  } else {
    if (State.progValue === '0') State.progValue = val;
    else State.progValue += val;
    updateProgDisplay();
  }
}

function progCompute() {
  if (State.progOp === null || State.progPrev === null) return;
  const a = State.progPrev;
  const b = parseInt(State.progValue, State.progBase);
  let res;
  switch (State.progOp) {
    case 'AND': res = a & b; break;
    case 'OR': res = a | b; break;
    case 'XOR': res = a ^ b; break;
    case 'NAND': res = ~(a & b) >>> 0; break;
    case 'NOR': res = ~(a | b) >>> 0; break;
    case 'LSH': res = a << b; break;
    case 'RSH': res = a >> b; break;
    case '+': res = a + b; break;
    case '-': res = a - b; break;
    case '*': res = a * b; break;
    case '/': res = b !== 0 ? Math.trunc(a / b) : 0; break;
    default: res = b;
  }
  const expr = `${a.toString(State.progBase).toUpperCase()} ${State.progOp} ${b.toString(State.progBase).toUpperCase()}`;
  State.progValue = Math.abs(res).toString(State.progBase).toUpperCase();
  State.progOp = null; State.progPrev = null;
  addToHistory(expr, State.progValue, 'programmer');
  updateProgDisplay();
}

function updateProgDisplay() {
  const dec = parseInt(State.progValue, State.progBase) || 0;
  document.getElementById('prog-dec').textContent = dec;
  document.getElementById('prog-hex').textContent = dec.toString(16).toUpperCase() || '0';
  document.getElementById('prog-oct').textContent = dec.toString(8) || '0';
  document.getElementById('prog-bin').textContent = dec.toString(2) || '0';
}

function updateProgBtns() {
  const digits = { 2: '01', 8: '01234567', 10: '0123456789', 16: '0123456789ABCDEF' };
  const allowed = digits[State.progBase] || '0123456789';
  document.querySelectorAll('#page-programmer .cbtn[data-prog]').forEach(btn => {
    const v = btn.dataset.prog;
    if ('0123456789ABCDEF'.includes(v)) {
      btn.disabled = !allowed.includes(v);
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   GRAPHING CALCULATOR
   ═══════════════════════════════════════════════════════════ */
let graphCanvas, graphCtx;

function initGraphing() {
  graphCanvas = document.getElementById('graph-canvas');
  graphCtx = graphCanvas.getContext('2d');
  graphCanvas.addEventListener('wheel', e => { e.preventDefault(); zoomGraph(e.deltaY < 0 ? 1.1 : 0.9); });
  graphCanvas.addEventListener('mousedown', e => { State.graphDragging = true; State.graphDragStart = { x: e.clientX, y: e.clientY }; });
  graphCanvas.addEventListener('mousemove', e => {
    if (State.graphDragging) {
      State.graphOffX += (e.clientX - State.graphDragStart.x);
      State.graphOffY += (e.clientY - State.graphDragStart.y);
      State.graphDragStart = { x: e.clientX, y: e.clientY };
      plotGraph();
    }
    const rect = graphCanvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left - graphCanvas.width / 2 - State.graphOffX) / State.graphScale;
    const my = -(e.clientY - rect.top - graphCanvas.height / 2 - State.graphOffY) / State.graphScale;
    const coordEl = document.getElementById('graph-coords');
    if (coordEl) coordEl.textContent = `x: ${mx.toFixed(2)}, y: ${my.toFixed(2)}`;
  });
  graphCanvas.addEventListener('mouseup', () => State.graphDragging = false);
  graphCanvas.addEventListener('mouseleave', () => State.graphDragging = false);
  resizeGraph();
  window.addEventListener('resize', resizeGraph);
  plotGraph();
}

function resizeGraph() {
  const wrap = graphCanvas.parentElement;
  graphCanvas.width = wrap.clientWidth;
  graphCanvas.height = wrap.clientHeight;
  plotGraph();
}

function plotGraph() {
  const w = graphCanvas.width, h = graphCanvas.height;
  const cx = w / 2 + State.graphOffX, cy = h / 2 + State.graphOffY;
  const sc = State.graphScale;
  const ctx = graphCtx;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fillRect(0, 0, w, h);

  // Grid
  const step = sc;
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = cx % step; x < w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = cy % step; y < h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

  // Axes
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

  // Axis labels
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '11px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  for (let i = -Math.ceil(cx / sc); i <= Math.ceil((w - cx) / sc); i++) {
    if (i === 0) continue;
    const px = cx + i * sc;
    if (px > 5 && px < w - 5) ctx.fillText(i, px, cy + 14);
  }
  ctx.textAlign = 'right';
  for (let i = -Math.ceil(cy / sc); i <= Math.ceil((h - cy) / sc); i++) {
    if (i === 0) continue;
    const py = cy - i * sc;
    if (py > 5 && py < h - 5) ctx.fillText(i, cx - 4, py + 4);
  }

  // Plot equations
  const colors = ['#00d4ff', '#bf5fff', '#ff6b35', '#34d399'];
  const eqs = ['eq1', 'eq2', 'eq3'].map(id => document.getElementById(id)?.value.trim()).filter(Boolean);

  eqs.forEach((eq, idx) => {
    if (!eq) return;
    ctx.strokeStyle = colors[idx];
    ctx.lineWidth = 2;
    ctx.shadowColor = colors[idx];
    ctx.shadowBlur = 4;
    ctx.beginPath();
    let first = true;
    for (let px = 0; px < w; px++) {
      const x = (px - cx) / sc;
      try {
        const y = evalExpr(eq, x);
        if (!isFinite(y) || isNaN(y)) { first = true; continue; }
        const py = cy - y * sc;
        if (py < -1000 || py > h + 1000) { first = true; continue; }
        if (first) { ctx.moveTo(px, py); first = false; }
        else ctx.lineTo(px, py);
      } catch (e) { first = true; }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  });
}

function evalExpr(expr, x) {
  let e = expr
    .replace(/\^/g, '**')
    .replace(/π/g, 'Math.PI')
    .replace(/\be\b/g, 'Math.E')
    .replace(/\bsin\b/g, 'Math.sin')
    .replace(/\bcos\b/g, 'Math.cos')
    .replace(/\btan\b/g, 'Math.tan')
    .replace(/\bsqrt\b/g, 'Math.sqrt')
    .replace(/\babs\b/g, 'Math.abs')
    .replace(/\bln\b/g, 'Math.log')
    .replace(/\blog\b/g, 'Math.log10')
    .replace(/\bexp\b/g, 'Math.exp')
    .replace(/\bfloor\b/g, 'Math.floor')
    .replace(/\bceil\b/g, 'Math.ceil')
    .replace(/(\d)(x)/g, '$1*$2')
    .replace(/(x)(\d)/g, '$1*$2')
    .replace(/(\d)\(/g, '$1*(');
  return Function('x', `"use strict"; return (${e})`)(x);
}

function zoomGraph(factor) { State.graphScale *= factor; State.graphScale = Math.max(10, Math.min(500, State.graphScale)); plotGraph(); }
function resetGraph() { State.graphScale = 40; State.graphOffX = 0; State.graphOffY = 0; plotGraph(); }

/* ═══════════════════════════════════════════════════════════
   FINANCIAL CALCULATORS
   ═══════════════════════════════════════════════════════════ */
// Tabs
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.ftab').forEach(btn => {
    btn.addEventListener('click', () => {
      playClick();
      document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.fin-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('fin-' + btn.dataset.tab).classList.add('active');
    });
  });
});

function calcEMI() {
  const P = parseFloat(document.getElementById('emi-p')?.value) || 0;
  const annualR = parseFloat(document.getElementById('emi-r')?.value) || 0;
  const years = parseFloat(document.getElementById('emi-t')?.value) || 0;
  const r = annualR / 12 / 100, n = years * 12;
  const emi = r === 0 ? (n > 0 ? P / n : 0) : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = emi * n, interest = total - P;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('emi-result', fmt(emi));
  set('emi-principal', fmt(P));
  set('emi-interest', fmt(interest));
  set('emi-total', fmt(total));
  set('emi-tenure', n + ' months');
  // Amortization
  const tbody = document.getElementById('emi-amort');
  if (!tbody) return;
  tbody.innerHTML = '';
  let balance = P;
  for (let i = 1; i <= Math.min(12, n); i++) {
    const intPart = balance * r;
    const prinPart = emi - intPart;
    balance -= prinPart;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i}</td><td>₹${Math.round(emi).toLocaleString()}</td><td class="td-principal">₹${Math.round(prinPart).toLocaleString()}</td><td class="td-interest">₹${Math.round(intPart).toLocaleString()}</td><td>₹${Math.round(Math.max(0, balance)).toLocaleString()}</td>`;
    tbody.appendChild(tr);
  }
}

function setSIPMode(mode, el) {
  State.sipMode = mode;
  document.querySelectorAll('.sip-mode-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  document.getElementById('sip-panel').style.display = mode === 'sip' ? 'grid' : 'none';
  document.getElementById('swp-panel').style.display = mode === 'swp' ? 'grid' : 'none';
  if (mode === 'sip') calcSIP(); else calcSWP();
}

function calcSIP() {
  const m = parseFloat(document.getElementById('sip-m')?.value) || 0;
  const r = (parseFloat(document.getElementById('sip-r')?.value) || 0) / 12 / 100;
  const n = (parseFloat(document.getElementById('sip-y')?.value) || 0) * 12;
  const maturity = r === 0 ? m * n : m * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested = m * n, gains = maturity - invested;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('sip-result', fmt(maturity));
  set('sip-invested', fmt(invested));
  set('sip-gains', fmt(gains));
  set('sip-pct', invested > 0 ? ((gains / invested) * 100).toFixed(1) + '%' : '0%');
  set('sip-dur', n + ' months');
}

function calcSWP() {
  const w = parseFloat(document.getElementById('swp-w')?.value) || 0;
  const r = (parseFloat(document.getElementById('swp-r')?.value) || 0) / 12 / 100;
  const n = (parseFloat(document.getElementById('swp-y')?.value) || 0) * 12;
  const corpus = r === 0 ? w * n : w * ((1 - Math.pow(1 + r, -n)) / r);
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('swp-result', fmt(corpus));
  set('swp-monthly', fmt(w));
  set('swp-total', fmt(w * n));
}

function setGSTMode(mode, el) {
  State.gstMode = mode;
  document.querySelectorAll('.gst-mode-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  const lbl = document.getElementById('gst-amount-lbl');
  if (lbl) lbl.textContent = mode === 'excl' ? 'Amount Before GST (₹)' : 'Amount After GST (₹)';
  calcGST();
}

function setGSTRate(r, el) {
  const inp = document.getElementById('gst-rate-custom');
  if (inp) inp.value = r;
  document.querySelectorAll('.gst-rate-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  calcGST();
}

function calcGST() {
  const amount = parseFloat(document.getElementById('gst-amt')?.value) || 0;
  const rate = parseFloat(document.getElementById('gst-rate-custom')?.value) || 0;
  let base, gstAmt, total;
  if (State.gstMode === 'excl') {
    base = amount; gstAmt = amount * rate / 100; total = base + gstAmt;
  } else {
    total = amount; base = amount * 100 / (100 + rate); gstAmt = total - base;
  }
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('gst-total', fmt(total));
  set('gst-base', fmt(base));
  set('gst-amt-result', fmt(gstAmt));
  set('gst-cgst', fmt(gstAmt / 2));
  set('gst-sgst', fmt(gstAmt / 2));
}

function calcCI() {
  const P = parseFloat(document.getElementById('ci-p')?.value) || 0;
  const r = (parseFloat(document.getElementById('ci-r')?.value) || 0) / 100;
  const t = parseFloat(document.getElementById('ci-t')?.value) || 0;
  const n = parseFloat(document.getElementById('ci-n')?.value) || 12;
  const A = P * Math.pow(1 + r / n, n * t);
  const interest = A - P;
  const effRate = (Math.pow(1 + r / n, n) - 1) * 100;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('ci-result', fmt(A));
  set('ci-principal', fmt(P));
  set('ci-interest', fmt(interest));
  set('ci-growth', P > 0 ? ((interest / P) * 100).toFixed(1) + '%' : '0%');
  set('ci-eff-rate', effRate.toFixed(2) + '%');
  // Year-wise
  const yearly = document.getElementById('ci-yearly');
  if (yearly) {
    yearly.innerHTML = Array.from({ length: Math.min(t, 20) }, (_, i) => {
      const y = i + 1;
      const val = P * Math.pow(1 + r / n, n * y);
      return `<div class="ci-year-row"><span class="ci-year-label">Year ${y}</span><span class="ci-year-val">${fmt(val)}</span></div>`;
    }).join('');
  }
}

/* ═══════════════════════════════════════════════════════════
   CURRENCY CONVERTER
   ═══════════════════════════════════════════════════════════ */
const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', rate: 1 },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', rate: 83.5 },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', rate: 0.79 },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', rate: 149.5 },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', rate: 1.53 },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', rate: 1.36 },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', rate: 0.88 },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', rate: 7.24 },
  { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰', rate: 7.83 },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', rate: 1.34 },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', rate: 3.67 },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', rate: 3.75 },
  { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿', rate: 1.63 },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾', rate: 4.72 },
  { code: 'THB', name: 'Thai Baht', flag: '🇹🇭', rate: 35.5 },
  { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩', rate: 15700 },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷', rate: 1325 },
  { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰', rate: 278 },
  { code: 'BDT', name: 'Bangladeshi Taka', flag: '🇧🇩', rate: 110 },
  { code: 'NPR', name: 'Nepalese Rupee', flag: '🇳🇵', rate: 133.5 },
  { code: 'LKR', name: 'Sri Lankan Rupee', flag: '🇱🇰', rate: 310 },
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', rate: 18.7 },
  { code: 'RUB', name: 'Russian Ruble', flag: '🇷🇺', rate: 90 },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷', rate: 4.97 },
  { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽', rate: 17.2 },
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷', rate: 32.5 },
  { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪', rate: 10.5 },
  { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴', rate: 10.6 },
  { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰', rate: 6.9 },
  { code: 'PLN', name: 'Polish Zloty', flag: '🇵🇱', rate: 3.99 },
  { code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿', rate: 23.5 },
  { code: 'HUF', name: 'Hungarian Forint', flag: '🇭🇺', rate: 360 },
  { code: 'RON', name: 'Romanian Leu', flag: '🇷🇴', rate: 4.6 },
  { code: 'BGN', name: 'Bulgarian Lev', flag: '🇧🇬', rate: 1.8 },
  { code: 'HRK', name: 'Croatian Kuna', flag: '🇭🇷', rate: 7.0 },
  { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬', rate: 30.9 },
  { code: 'NGN', name: 'Nigerian Naira', flag: '🇳🇬', rate: 1500 },
  { code: 'KES', name: 'Kenyan Shilling', flag: '🇰🇪', rate: 129 },
  { code: 'GHS', name: 'Ghanaian Cedi', flag: '🇬🇭', rate: 12.5 },
  { code: 'MAD', name: 'Moroccan Dirham', flag: '🇲🇦', rate: 10.0 },
  { code: 'TND', name: 'Tunisian Dinar', flag: '🇹🇳', rate: 3.1 },
  { code: 'DZD', name: 'Algerian Dinar', flag: '🇩🇿', rate: 134 },
  { code: 'ILS', name: 'Israeli Shekel', flag: '🇮🇱', rate: 3.65 },
  { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦', rate: 3.64 },
  { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼', rate: 0.308 },
  { code: 'BHD', name: 'Bahraini Dinar', flag: '🇧🇭', rate: 0.376 },
  { code: 'OMR', name: 'Omani Rial', flag: '🇴🇲', rate: 0.385 },
  { code: 'JOD', name: 'Jordanian Dinar', flag: '🇯🇴', rate: 0.71 },
  { code: 'LBP', name: 'Lebanese Pound', flag: '🇱🇧', rate: 15000 },
  { code: 'TWD', name: 'Taiwan Dollar', flag: '🇹🇼', rate: 32 },
  { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭', rate: 56.5 },
  { code: 'VND', name: 'Vietnamese Dong', flag: '🇻🇳', rate: 24500 },
  { code: 'UAH', name: 'Ukrainian Hryvnia', flag: '🇺🇦', rate: 39 },
  { code: 'CLP', name: 'Chilean Peso', flag: '🇨🇱', rate: 880 },
  { code: 'COP', name: 'Colombian Peso', flag: '🇨🇴', rate: 3900 },
  { code: 'PEN', name: 'Peruvian Sol', flag: '🇵🇪', rate: 3.8 },
  { code: 'ARS', name: 'Argentine Peso', flag: '🇦🇷', rate: 850 },
];

function initCurrency() {
  const fromSel = document.getElementById('cur-from');
  const toSel = document.getElementById('cur-to');
  CURRENCIES.forEach(c => {
    const opt1 = new Option(`${c.flag} ${c.code} — ${c.name}`, c.code);
    const opt2 = new Option(`${c.flag} ${c.code} — ${c.name}`, c.code);
    fromSel.add(opt1); toSel.add(opt2);
  });
  toSel.value = 'INR';
  // Currency grid
  const grid = document.getElementById('cur-grid');
  CURRENCIES.slice(0, 24).forEach(c => {
    const el = document.createElement('div');
    el.className = 'cur-item';
    el.innerHTML = `<span class="flag">${c.flag}</span><span class="code">${c.code}</span><span class="name">${c.name.split(' ').slice(0, 2).join(' ')}</span>`;
    el.onclick = () => { fromSel.value = c.code; convertCurrency(); };
    grid.appendChild(el);
  });
  convertCurrency();
}

function convertCurrency() {
  const from = document.getElementById('cur-from')?.value;
  const to = document.getElementById('cur-to')?.value;
  const amount = parseFloat(document.getElementById('cur-from-val')?.value) || 0;
  const fromRate = CURRENCIES.find(c => c.code === from)?.rate || 1;
  const toRate = CURRENCIES.find(c => c.code === to)?.rate || 1;
  const usd = amount / fromRate;
  const result = usd * toRate;
  const toEl = document.getElementById('cur-to-val');
  if (toEl) toEl.value = result.toFixed(result < 1 ? 6 : 2);
  const rate1 = toRate / fromRate;
  const rateEl = document.getElementById('cur-rate-display');
  if (rateEl) rateEl.textContent = `1 ${from} = ${rate1.toFixed(rate1 < 0.01 ? 6 : 4)} ${to}   ·   Indicative rate`;
}

function swapCurrency() {
  const from = document.getElementById('cur-from');
  const to = document.getElementById('cur-to');
  const temp = from.value; from.value = to.value; to.value = temp;
  convertCurrency(); playClick();
}

/* ═══════════════════════════════════════════════════════════
   UNIT CONVERTER
   ═══════════════════════════════════════════════════════════ */
const UNITS = {
  Length: { m: 1, km: 0.001, cm: 100, mm: 1000, mi: 0.000621371, yd: 1.09361, ft: 3.28084, inch: 39.3701, nm: 1e9, μm: 1e6 },
  Area: { 'm²': 1, 'km²': 1e-6, 'cm²': 1e4, 'mm²': 1e6, 'ft²': 10.7639, 'yd²': 1.19599, acre: 0.000247105, ha: 1e-4, 'mi²': 3.861e-7 },
  Volume: { 'L': 1, mL: 1000, 'm³': 0.001, 'cm³': 1000, 'ft³': 0.0353147, gal: 0.264172, qt: 1.05669, pt: 2.11338, fl_oz: 33.814, tsp: 202.884, tbsp: 67.628 },
  Weight: { kg: 1, g: 1000, mg: 1e6, lb: 2.20462, oz: 35.274, ton: 0.001, tonne: 0.001, stone: 0.157473, grain: 15432.4 },
  Temperature: { C: 'C', F: 'F', K: 'K' },
  Speed: { 'km/h': 1, 'm/s': 0.277778, mph: 0.621371, knot: 0.539957, 'ft/s': 0.911344 },
  Time: { s: 1, ms: 1000, min: 1 / 60, h: 1 / 3600, day: 1 / 86400, week: 1 / 604800, month: 1 / 2628000, year: 1 / 31536000 },
  'Data Storage': { B: 1, KB: 1 / 1024, MB: 1 / 1048576, GB: 1 / 1073741824, TB: 1 / 1099511627776, bit: 8, Kbit: 8 / 1024, Mbit: 8 / 1048576, Gbit: 8 / 1073741824 },
  Pressure: { Pa: 1, kPa: 0.001, MPa: 1e-6, bar: 1e-5, atm: 9.8692e-6, psi: 1.45038e-4, torr: 0.00750062 },
  Energy: { J: 1, kJ: 0.001, cal: 0.239006, kcal: 2.39006e-4, Wh: 2.77778e-4, kWh: 2.77778e-7, eV: 6.242e18, BTU: 9.4782e-4 },
  Power: { W: 1, kW: 0.001, MW: 1e-6, hp: 0.00134102, 'ft·lbf/s': 0.737562, BTU_h: 3.41214 },
};

let currentUnitCat = 'Length';

function initUnitConverter() {
  const catsEl = document.getElementById('unit-cats');
  Object.keys(UNITS).forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'unit-cat-btn' + (cat === currentUnitCat ? ' active' : '');
    btn.textContent = cat;
    btn.onclick = () => { currentUnitCat = cat; initUnitSelects(); document.querySelectorAll('.unit-cat-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); playClick(); };
    catsEl.appendChild(btn);
  });
  initUnitSelects();
}

function initUnitSelects() {
  const fromSel = document.getElementById('unit-from');
  const toSel = document.getElementById('unit-to');
  fromSel.innerHTML = ''; toSel.innerHTML = '';
  const units = Object.keys(UNITS[currentUnitCat]);
  units.forEach(u => { fromSel.add(new Option(u, u)); toSel.add(new Option(u, u)); });
  if (units.length > 1) toSel.value = units[1];
  convertUnit();
}

function convertUnit() {
  const from = document.getElementById('unit-from')?.value;
  const to = document.getElementById('unit-to')?.value;
  const val = parseFloat(document.getElementById('unit-from-val')?.value) || 0;
  let result;
  if (currentUnitCat === 'Temperature') {
    if (from === 'C' && to === 'F') result = val * 9 / 5 + 32;
    else if (from === 'C' && to === 'K') result = val + 273.15;
    else if (from === 'F' && to === 'C') result = (val - 32) * 5 / 9;
    else if (from === 'F' && to === 'K') result = (val - 32) * 5 / 9 + 273.15;
    else if (from === 'K' && to === 'C') result = val - 273.15;
    else if (from === 'K' && to === 'F') result = (val - 273.15) * 9 / 5 + 32;
    else result = val;
  } else {
    const cat = UNITS[currentUnitCat];
    const inBase = val / cat[from];
    result = inBase * cat[to];
  }
  const toEl = document.getElementById('unit-to-val');
  if (toEl) toEl.value = parseFloat(result.toPrecision(8));
  const txt = document.getElementById('unit-result-text');
  if (txt) txt.textContent = `${val} ${from} = ${parseFloat(result.toPrecision(8))} ${to}`;
}

function swapUnit() {
  const from = document.getElementById('unit-from');
  const to = document.getElementById('unit-to');
  const temp = from.value; from.value = to.value; to.value = temp;
  convertUnit(); playClick();
}

/* ═══════════════════════════════════════════════════════════
   HISTORY
   ═══════════════════════════════════════════════════════════ */
function setHistFilter(filter, el) {
  State.histFilter = filter;
  document.querySelectorAll('.hfilt').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
  renderHistory();
}

function renderHistory() {
  const search = document.getElementById('hist-search')?.value.toLowerCase() || '';
  const list = document.getElementById('hist-list');
  if (!list) return;
  const items = State.history.filter(h => {
    const matchesFilter = State.histFilter === 'all' || (State.histFilter === 'starred' && h.starred) || h.category === State.histFilter;
    const matchesSearch = !search || h.expression.toLowerCase().includes(search) || h.result.toLowerCase().includes(search);
    return matchesFilter && matchesSearch;
  });
  if (items.length === 0) {
    list.innerHTML = '<div class="hist-empty"><span class="empty-icon">↺</span>No history found</div>';
    return;
  }
  list.innerHTML = items.map(h => `
    <div class="hist-item">
      <div class="hist-item-left">
        <div class="hist-item-meta">
          <span class="hist-badge">${h.category}</span>
          <span class="hist-time">${new Date(h.timestamp).toLocaleString()}</span>
        </div>
        <div class="hist-expr">${escHtml(h.expression)}</div>
        <div class="hist-val">${escHtml(h.result)}</div>
      </div>
      <div class="hist-btns">
        <button class="hist-btn ${h.starred ? 'starred' : ''}" onclick="toggleStar('${h.id}')" title="Star">${h.starred ? '★' : '☆'}</button>
        <button class="hist-btn" onclick="deleteHistItem('${h.id}')" title="Delete">✕</button>
      </div>
    </div>
  `).join('');
}

function toggleStar(id) {
  const item = State.history.find(h => h.id == id);
  if (item) { item.starred = !item.starred; saveHistory(); renderHistory(); updateDashStats(); }
}
function deleteHistItem(id) {
  State.history = State.history.filter(h => h.id != id);
  saveHistory(); renderHistory(); updateDashStats();
}
function clearHistory() {
  if (confirm('Clear all history?')) { State.history = []; saveHistory(); renderHistory(); updateDashStats(); }
}
function exportHistoryCSV() {
  const rows = [['Date', 'Category', 'Expression', 'Result', 'Starred'],
  ...State.history.map(h => [new Date(h.timestamp).toISOString(), h.category, `"${h.expression}"`, `"${h.result}"`, h.starred])
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = 'nexus_history.csv'; a.click();
}
function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* ═══════════════════════════════════════════════════════════
   FORMULA LIBRARY
   ═══════════════════════════════════════════════════════════ */
const FORMULAS = [
  // Mathematics — Algebra
  { id: 1, cat: 'Mathematics', sub: 'Algebra', name: 'Quadratic Formula', formula: 'x = (−b ± √(b²−4ac)) / 2a', desc: 'Finds roots of ax² + bx + c = 0.', vars: 'a,b,c = coefficients' },
  { id: 2, cat: 'Mathematics', sub: 'Algebra', name: 'Difference of Squares', formula: 'a² − b² = (a+b)(a−b)', desc: 'Factoring identity for difference of two perfect squares.' },
  { id: 3, cat: 'Mathematics', sub: 'Algebra', name: 'Perfect Square (a+b)²', formula: '(a+b)² = a² + 2ab + b²', desc: 'Expansion of a binomial squared.' },
  { id: 4, cat: 'Mathematics', sub: 'Algebra', name: 'Sum of Cubes', formula: 'a³+b³ = (a+b)(a²−ab+b²)', desc: 'Factoring identity for sum of two cubes.' },
  { id: 5, cat: 'Mathematics', sub: 'Algebra', name: 'Binomial Theorem', formula: '(a+b)ⁿ = Σ C(n,k) aⁿ⁻ᵏ bᵏ', desc: 'Expansion of any binomial power.' },
  { id: 6, cat: 'Mathematics', sub: 'Algebra', name: 'AP nth Term', formula: 'aₙ = a + (n−1)d', desc: 'nth term of an arithmetic progression.' },
  { id: 7, cat: 'Mathematics', sub: 'Algebra', name: 'AP Sum', formula: 'Sₙ = n/2 [2a + (n−1)d]', desc: 'Sum of first n terms of an AP.' },
  { id: 8, cat: 'Mathematics', sub: 'Algebra', name: 'GP nth Term', formula: 'aₙ = a · rⁿ⁻¹', desc: 'nth term of a geometric progression.' },
  { id: 9, cat: 'Mathematics', sub: 'Algebra', name: 'GP Sum', formula: 'Sₙ = a(rⁿ−1)/(r−1)', desc: 'Sum of first n terms of a GP.' },
  { id: 10, cat: 'Mathematics', sub: 'Algebra', name: 'Infinite Geometric Series', formula: 'S = a/(1−r), |r|<1', desc: 'Sum of an infinite GP.' },
  { id: 11, cat: 'Mathematics', sub: 'Algebra', name: 'Log Product Rule', formula: 'log(ab) = log a + log b', desc: 'Log of a product equals sum of logs.' },
  { id: 12, cat: 'Mathematics', sub: 'Algebra', name: 'Log Power Rule', formula: 'log(aⁿ) = n·log a', desc: 'Log of a power equals exponent times log.' },
  { id: 13, cat: 'Mathematics', sub: 'Algebra', name: 'Change of Base', formula: 'logb(x) = log(x)/log(b)', desc: 'Convert logarithm to another base.' },
  // Mathematics — Geometry
  { id: 14, cat: 'Mathematics', sub: 'Geometry', name: 'Pythagorean Theorem', formula: 'a² + b² = c²', desc: 'In a right triangle: hypotenuse² = sum of other two sides².' },
  { id: 15, cat: 'Mathematics', sub: 'Geometry', name: 'Area of Circle', formula: 'A = πr²', desc: 'Area of a circle with radius r.' },
  { id: 16, cat: 'Mathematics', sub: 'Geometry', name: 'Circumference', formula: 'C = 2πr', desc: 'Circumference of a circle.' },
  { id: 17, cat: 'Mathematics', sub: 'Geometry', name: 'Area of Triangle', formula: 'A = ½bh', desc: 'Area of a triangle with base b and height h.' },
  { id: 18, cat: 'Mathematics', sub: 'Geometry', name: "Heron's Formula", formula: 'A = √[s(s−a)(s−b)(s−c)]', desc: 'Area of triangle from three sides; s=(a+b+c)/2.' },
  { id: 19, cat: 'Mathematics', sub: 'Geometry', name: 'Area of Trapezoid', formula: 'A = ½(a+b)h', desc: 'Area of a trapezoid with parallel sides a,b and height h.' },
  { id: 20, cat: 'Mathematics', sub: 'Geometry', name: 'Volume of Sphere', formula: 'V = (4/3)πr³', desc: 'Volume of a sphere.' },
  { id: 21, cat: 'Mathematics', sub: 'Geometry', name: 'Surface Area of Sphere', formula: 'SA = 4πr²', desc: 'Total surface area of a sphere.' },
  { id: 22, cat: 'Mathematics', sub: 'Geometry', name: 'Volume of Cylinder', formula: 'V = πr²h', desc: 'Volume of a cylinder.' },
  { id: 23, cat: 'Mathematics', sub: 'Geometry', name: 'Volume of Cone', formula: 'V = (1/3)πr²h', desc: 'Volume of a cone.' },
  { id: 24, cat: 'Mathematics', sub: 'Geometry', name: 'Volume of Pyramid', formula: 'V = (1/3) × Base × h', desc: 'Volume of any pyramid.' },
  { id: 25, cat: 'Mathematics', sub: 'Geometry', name: 'Distance Formula', formula: 'd = √[(x₂−x₁)²+(y₂−y₁)²]', desc: 'Distance between two points.' },
  { id: 26, cat: 'Mathematics', sub: 'Geometry', name: 'Slope of Line', formula: 'm = (y₂−y₁)/(x₂−x₁)', desc: 'Gradient between two points.' },
  { id: 27, cat: 'Mathematics', sub: 'Geometry', name: 'Ellipse Area', formula: 'A = πab', desc: 'Area of an ellipse with semi-axes a and b.' },
  // Mathematics — Trigonometry
  { id: 28, cat: 'Mathematics', sub: 'Trigonometry', name: 'Pythagorean Identity', formula: 'sin²θ + cos²θ = 1', desc: 'Fundamental trigonometric identity.' },
  { id: 29, cat: 'Mathematics', sub: 'Trigonometry', name: 'Tangent Identity', formula: '1 + tan²θ = sec²θ', desc: 'Derived from Pythagorean identity.' },
  { id: 30, cat: 'Mathematics', sub: 'Trigonometry', name: 'Sine Rule', formula: 'a/sin A = b/sin B = c/sin C', desc: 'Relates sides to opposite angles in a triangle.' },
  { id: 31, cat: 'Mathematics', sub: 'Trigonometry', name: 'Cosine Rule', formula: 'c² = a² + b² − 2ab·cos C', desc: 'Generalization of Pythagorean theorem.' },
  { id: 32, cat: 'Mathematics', sub: 'Trigonometry', name: 'Double Angle — Sin', formula: 'sin 2θ = 2 sin θ cos θ', desc: 'Sine of double angle.' },
  { id: 33, cat: 'Mathematics', sub: 'Trigonometry', name: 'Double Angle — Cos', formula: 'cos 2θ = cos²θ − sin²θ', desc: 'Cosine of double angle.' },
  { id: 34, cat: 'Mathematics', sub: 'Trigonometry', name: "Euler's Formula", formula: 'e^(iθ) = cos θ + i sin θ', desc: 'Connects complex exponentials with trig.' },
  // Mathematics — Calculus
  { id: 35, cat: 'Mathematics', sub: 'Calculus', name: 'Power Rule (Derivative)', formula: 'd/dx(xⁿ) = n·xⁿ⁻¹', desc: 'Derivative of a power function.' },
  { id: 36, cat: 'Mathematics', sub: 'Calculus', name: 'Product Rule', formula: '(uv)′ = u′v + uv′', desc: 'Derivative of a product of two functions.' },
  { id: 37, cat: 'Mathematics', sub: 'Calculus', name: 'Quotient Rule', formula: '(u/v)′ = (u′v − uv′)/v²', desc: 'Derivative of a quotient.' },
  { id: 38, cat: 'Mathematics', sub: 'Calculus', name: 'Chain Rule', formula: 'd/dx f(g(x)) = f′(g(x))·g′(x)', desc: 'Derivative of a composite function.' },
  { id: 39, cat: 'Mathematics', sub: 'Calculus', name: 'Derivative — sin', formula: 'd/dx(sin x) = cos x', desc: 'Derivative of sine.' },
  { id: 40, cat: 'Mathematics', sub: 'Calculus', name: 'Derivative — cos', formula: 'd/dx(cos x) = −sin x', desc: 'Derivative of cosine.' },
  { id: 41, cat: 'Mathematics', sub: 'Calculus', name: 'Derivative — eˣ', formula: 'd/dx(eˣ) = eˣ', desc: 'The exponential is its own derivative.' },
  { id: 42, cat: 'Mathematics', sub: 'Calculus', name: 'Integral — Power Rule', formula: '∫xⁿ dx = xⁿ⁺¹/(n+1) + C', desc: 'Antiderivative of a power function.' },
  { id: 43, cat: 'Mathematics', sub: 'Calculus', name: 'FTC', formula: '∫ₐᵇ f(x)dx = F(b) − F(a)', desc: 'Fundamental Theorem of Calculus.' },
  { id: 44, cat: 'Mathematics', sub: 'Calculus', name: 'Integration by Parts', formula: '∫u dv = uv − ∫v du', desc: 'Integration technique for products.' },
  { id: 45, cat: 'Mathematics', sub: 'Calculus', name: 'Taylor Series', formula: 'f(x) = Σ f⁽ⁿ⁾(a)/n! · (x−a)ⁿ', desc: 'Infinite sum representation of a smooth function.' },
  // Mathematics — Statistics
  { id: 46, cat: 'Mathematics', sub: 'Statistics', name: 'Arithmetic Mean', formula: 'x̄ = (Σxᵢ) / n', desc: 'Average of a dataset.' },
  { id: 47, cat: 'Mathematics', sub: 'Statistics', name: 'Population Variance', formula: 'σ² = Σ(xᵢ−μ)²/N', desc: 'Spread around the mean for a population.' },
  { id: 48, cat: 'Mathematics', sub: 'Statistics', name: 'Standard Deviation', formula: 'σ = √[Σ(xᵢ−μ)²/N]', desc: 'Typical deviation from the mean.' },
  { id: 49, cat: 'Mathematics', sub: 'Statistics', name: 'Z-Score', formula: 'z = (x − μ)/σ', desc: 'Standard deviations from the mean.' },
  { id: 50, cat: 'Mathematics', sub: 'Statistics', name: 'Normal Distribution PDF', formula: 'f(x) = (1/σ√2π) e^(−(x−μ)²/2σ²)', desc: 'Bell curve probability density.' },
  { id: 51, cat: 'Mathematics', sub: 'Statistics', name: 'Combinations', formula: 'C(n,r) = n! / (r!(n−r)!)', desc: 'Ways to choose r from n without order.' },
  { id: 52, cat: 'Mathematics', sub: 'Statistics', name: 'Permutations', formula: 'P(n,r) = n! / (n−r)!', desc: 'Ways to arrange r from n in order.' },
  { id: 53, cat: 'Mathematics', sub: 'Statistics', name: "Bayes' Theorem", formula: 'P(A|B) = P(B|A)·P(A) / P(B)', desc: 'Conditional probability formula.' },
  { id: 54, cat: 'Mathematics', sub: 'Statistics', name: 'Binomial Distribution', formula: 'P(X=k) = C(n,k) pᵏ (1−p)ⁿ⁻ᵏ', desc: 'Probability of k successes in n trials.' },
  // Mathematics — Number Theory
  { id: 55, cat: 'Mathematics', sub: 'Number Theory', name: "Euler's Identity", formula: 'e^(iπ) + 1 = 0', desc: 'The most beautiful equation in mathematics.' },
  { id: 56, cat: 'Mathematics', sub: 'Number Theory', name: 'Sum of First n Integers', formula: '1+2+…+n = n(n+1)/2', desc: 'Closed form for sum of first n natural numbers.' },
  { id: 57, cat: 'Mathematics', sub: 'Number Theory', name: 'Sum of Squares', formula: 'Σk² = n(n+1)(2n+1)/6', desc: 'Sum of squares of first n integers.' },
  { id: 58, cat: 'Mathematics', sub: 'Number Theory', name: 'Sum of Cubes', formula: 'Σk³ = [n(n+1)/2]²', desc: 'Sum of cubes equals square of triangular number.' },
  // Physics — Mechanics
  { id: 59, cat: 'Physics', sub: 'Mechanics', name: "Newton's Second Law", formula: 'F = ma', desc: 'Force equals mass times acceleration.', vars: 'F=N, m=kg, a=m/s²' },
  { id: 60, cat: 'Physics', sub: 'Mechanics', name: 'Weight', formula: 'W = mg', desc: 'Gravitational force on a mass.', vars: 'g=9.8 m/s²' },
  { id: 61, cat: 'Physics', sub: 'Mechanics', name: 'Kinematic — Velocity', formula: 'v = u + at', desc: 'Final velocity with constant acceleration.' },
  { id: 62, cat: 'Physics', sub: 'Mechanics', name: 'Kinematic — Displacement', formula: 's = ut + ½at²', desc: 'Displacement with constant acceleration.' },
  { id: 63, cat: 'Physics', sub: 'Mechanics', name: 'Kinematic — v² Formula', formula: 'v² = u² + 2as', desc: 'Velocity-displacement without time.' },
  { id: 64, cat: 'Physics', sub: 'Mechanics', name: 'Kinetic Energy', formula: 'KE = ½mv²', desc: 'Energy of motion.' },
  { id: 65, cat: 'Physics', sub: 'Mechanics', name: 'Potential Energy', formula: 'PE = mgh', desc: 'Gravitational potential energy at height h.' },
  { id: 66, cat: 'Physics', sub: 'Mechanics', name: 'Work Done', formula: 'W = F·d·cos θ', desc: 'Work by force at angle θ over displacement d.' },
  { id: 67, cat: 'Physics', sub: 'Mechanics', name: 'Power', formula: 'P = W/t = F·v', desc: 'Rate of doing work.' },
  { id: 68, cat: 'Physics', sub: 'Mechanics', name: 'Momentum', formula: 'p = mv', desc: 'Product of mass and velocity.' },
  { id: 69, cat: 'Physics', sub: 'Mechanics', name: 'Law of Gravitation', formula: 'F = Gm₁m₂/r²', desc: 'Gravitational force between two masses.', vars: 'G=6.674×10⁻¹¹' },
  { id: 70, cat: 'Physics', sub: 'Mechanics', name: "Hooke's Law", formula: 'F = −kx', desc: 'Spring restoring force.' },
  { id: 71, cat: 'Physics', sub: 'Mechanics', name: 'Simple Pendulum Period', formula: 'T = 2π√(L/g)', desc: 'Period of oscillation for a pendulum.' },
  // Physics — Waves & Optics
  { id: 72, cat: 'Physics', sub: 'Waves & Optics', name: 'Wave Speed', formula: 'v = fλ', desc: 'Wave speed = frequency × wavelength.' },
  { id: 73, cat: 'Physics', sub: 'Waves & Optics', name: "Snell's Law", formula: 'n₁ sin θ₁ = n₂ sin θ₂', desc: 'Refraction at an interface.' },
  { id: 74, cat: 'Physics', sub: 'Waves & Optics', name: 'Lens Formula', formula: '1/f = 1/v + 1/u', desc: 'Focal length, image and object distance.' },
  { id: 75, cat: 'Physics', sub: 'Waves & Optics', name: 'Energy of Photon', formula: 'E = hf = hc/λ', desc: 'Energy of a photon.', vars: 'h=6.626×10⁻³⁴ J·s' },
  // Physics — Thermodynamics
  { id: 76, cat: 'Physics', sub: 'Thermodynamics', name: 'Ideal Gas Law', formula: 'PV = nRT', desc: 'Equation of state for an ideal gas.', vars: 'R=8.314 J/mol·K' },
  { id: 77, cat: 'Physics', sub: 'Thermodynamics', name: 'First Law of Thermodynamics', formula: 'ΔU = Q − W', desc: 'Energy conservation in thermodynamics.' },
  { id: 78, cat: 'Physics', sub: 'Thermodynamics', name: 'Carnot Efficiency', formula: 'η = 1 − T_cold/T_hot', desc: 'Maximum efficiency of a heat engine.' },
  { id: 79, cat: 'Physics', sub: 'Thermodynamics', name: 'Stefan-Boltzmann Law', formula: 'P = σAT⁴', desc: 'Power radiated by a black body.', vars: 'σ=5.67×10⁻⁸' },
  // Physics — Electricity
  { id: 80, cat: 'Physics', sub: 'Electricity', name: "Ohm's Law", formula: 'V = IR', desc: 'Voltage = current × resistance.' },
  { id: 81, cat: 'Physics', sub: 'Electricity', name: 'Electric Power', formula: 'P = VI = I²R = V²/R', desc: 'Power in a circuit element.' },
  { id: 82, cat: 'Physics', sub: 'Electricity', name: "Coulomb's Law", formula: 'F = kq₁q₂/r²', desc: 'Electrostatic force between charges.', vars: 'k=9×10⁹ N·m²/C²' },
  { id: 83, cat: 'Physics', sub: 'Electricity', name: 'Capacitance', formula: 'C = Q/V', desc: 'Charge stored per unit voltage.' },
  { id: 84, cat: 'Physics', sub: 'Electricity', name: "Faraday's Law", formula: 'EMF = −dΦ/dt', desc: 'Induced EMF from changing magnetic flux.' },
  // Physics — Modern Physics
  { id: 85, cat: 'Physics', sub: 'Modern Physics', name: 'Mass-Energy Equivalence', formula: 'E = mc²', desc: "Einstein's most famous equation.", vars: 'c=3×10⁸ m/s' },
  { id: 86, cat: 'Physics', sub: 'Modern Physics', name: 'de Broglie Wavelength', formula: 'λ = h/p = h/(mv)', desc: 'Wave nature of matter.' },
  { id: 87, cat: 'Physics', sub: 'Modern Physics', name: 'Heisenberg Uncertainty Principle', formula: 'Δx·Δp ≥ ℏ/2', desc: 'Position and momentum cannot both be precise.' },
  { id: 88, cat: 'Physics', sub: 'Modern Physics', name: 'Radioactive Decay', formula: 'N(t) = N₀ e^(−λt)', desc: 'Nuclei remaining after time t.' },
  // Chemistry
  { id: 89, cat: 'Chemistry', sub: 'General', name: 'Mole Formula', formula: 'n = m/M', desc: 'Moles = mass / molar mass.' },
  { id: 90, cat: 'Chemistry', sub: 'General', name: 'Molarity', formula: 'M = n/V', desc: 'Molar concentration in mol/L.' },
  { id: 91, cat: 'Chemistry', sub: 'General', name: 'pH Definition', formula: 'pH = −log₁₀[H⁺]', desc: 'Acidity measure.' },
  { id: 92, cat: 'Chemistry', sub: 'General', name: 'Henderson-Hasselbalch', formula: 'pH = pKa + log([A⁻]/[HA])', desc: 'Buffer solution pH.' },
  { id: 93, cat: 'Chemistry', sub: 'Thermochem', name: "Hess's Law", formula: 'ΔH_rxn = Σ ΔH_products − Σ ΔH_reactants', desc: 'Total enthalpy from steps.' },
  { id: 94, cat: 'Chemistry', sub: 'Thermochem', name: 'Gibbs Free Energy', formula: 'ΔG = ΔH − TΔS', desc: 'Spontaneity: ΔG < 0 means spontaneous.' },
  { id: 95, cat: 'Chemistry', sub: 'Thermochem', name: 'Arrhenius Equation', formula: 'k = A·e^(−Eₐ/RT)', desc: 'Rate constant vs temperature.' },
  { id: 96, cat: 'Chemistry', sub: 'Electrochemistry', name: 'Nernst Equation', formula: 'E = E° − (RT/nF)·ln Q', desc: 'Cell potential at non-standard conditions.' },
  { id: 97, cat: 'Chemistry', sub: 'Kinetics', name: 'First-Order Decay', formula: '[A] = [A]₀ e^(−kt)', desc: 'Concentration over time (first order).' },
  { id: 98, cat: 'Chemistry', sub: 'Kinetics', name: 'Half-Life (First-Order)', formula: 't½ = ln2/k = 0.693/k', desc: 'Time to consume half the reactant.' },
  // Engineering
  { id: 99, cat: 'Engineering', sub: 'Civil', name: 'Beam Bending Stress', formula: 'σ = M·y/I', desc: 'Stress at distance y from neutral axis.' },
  { id: 100, cat: 'Engineering', sub: 'Civil', name: "Euler's Buckling Load", formula: 'Pₑ = π²EI/(KL)²', desc: 'Critical load for column buckling.' },
  { id: 101, cat: 'Engineering', sub: 'Civil', name: "Young's Modulus", formula: 'E = σ/ε', desc: 'Stress-to-strain ratio in elastic region.' },
  { id: 102, cat: 'Engineering', sub: 'Fluid', name: 'Continuity Equation', formula: 'A₁v₁ = A₂v₂', desc: 'Mass conservation for incompressible flow.' },
  { id: 103, cat: 'Engineering', sub: 'Fluid', name: "Bernoulli's Equation", formula: 'P + ½ρv² + ρgh = const', desc: 'Energy conservation along a streamline.' },
  { id: 104, cat: 'Engineering', sub: 'Fluid', name: 'Reynolds Number', formula: 'Re = ρvL/μ', desc: 'Ratio of inertial to viscous forces.' },
  { id: 105, cat: 'Engineering', sub: 'Electrical', name: 'Impedance — RLC', formula: 'Z = √(R² + (XL−Xc)²)', desc: 'Total impedance in series RLC circuit.' },
  { id: 106, cat: 'Engineering', sub: 'Electrical', name: 'Resonant Frequency', formula: 'f₀ = 1/(2π√(LC))', desc: 'Resonant frequency of LC circuit.' },
  { id: 107, cat: 'Engineering', sub: 'Electrical', name: 'Transformer', formula: 'V₁/V₂ = N₁/N₂ = I₂/I₁', desc: 'Voltage, turns and current ratios.' },
  { id: 108, cat: 'Engineering', sub: 'Electrical', name: 'Three-Phase Power', formula: 'P = √3 · VL · IL · cos φ', desc: 'Real power in balanced 3-phase system.' },
  // Finance
  { id: 109, cat: 'Finance', sub: 'Investment', name: 'Compound Interest', formula: 'A = P(1 + r/n)^(nt)', desc: 'Future value with periodic compounding.' },
  { id: 110, cat: 'Finance', sub: 'Investment', name: 'Simple Interest', formula: 'SI = P × r × t', desc: 'Interest on original principal only.' },
  { id: 111, cat: 'Finance', sub: 'Investment', name: 'Present Value', formula: 'PV = FV / (1+r)ⁿ', desc: 'Current worth of a future sum.' },
  { id: 112, cat: 'Finance', sub: 'Investment', name: 'Net Present Value', formula: 'NPV = Σ Cₜ/(1+r)ᵗ − C₀', desc: 'Sum of discounted cash flows minus investment.' },
  { id: 113, cat: 'Finance', sub: 'Investment', name: 'CAGR', formula: 'CAGR = (EV/BV)^(1/n) − 1', desc: 'Compound annual growth rate.', vars: 'EV=ending value, BV=beginning value' },
  { id: 114, cat: 'Finance', sub: 'Investment', name: 'Rule of 72', formula: 'Doubling time ≈ 72/r%', desc: 'Quick estimate to double an investment.' },
  { id: 115, cat: 'Finance', sub: 'Investment', name: 'EMI Formula', formula: 'EMI = P·r·(1+r)ⁿ / ((1+r)ⁿ−1)', desc: 'Monthly loan installment.', vars: 'r=monthly rate, n=months' },
  { id: 116, cat: 'Finance', sub: 'Investment', name: 'SIP Maturity', formula: 'FV = P·[(1+r)ⁿ−1]/r·(1+r)', desc: 'Future value of a monthly SIP.' },
  { id: 117, cat: 'Finance', sub: 'Valuation', name: 'P/E Ratio', formula: 'P/E = Market Price / EPS', desc: 'Stock valuation ratio.' },
  { id: 118, cat: 'Finance', sub: 'Valuation', name: 'Sharpe Ratio', formula: 'S = (Rₚ − Rƒ)/σₚ', desc: 'Risk-adjusted portfolio return.' },
  { id: 119, cat: 'Finance', sub: 'Accounting', name: 'Break-Even Point', formula: 'BEP = Fixed Costs / (Price − Variable Cost)', desc: 'Units to cover all costs.' },
  { id: 120, cat: 'Finance', sub: 'Accounting', name: 'Profit Margin', formula: 'PM = (Net Income / Revenue) × 100%', desc: 'Percentage of revenue that becomes profit.' },
  { id: 121, cat: 'Finance', sub: 'Accounting', name: 'GST Amount', formula: 'GST = (Amount × Rate%) / 100', desc: 'Tax on a base price.' },
  // Economics
  { id: 122, cat: 'Economics', sub: 'Microeconomics', name: 'Price Elasticity of Demand', formula: 'PED = %ΔQd / %ΔP', desc: 'Responsiveness of demand to price.' },
  { id: 123, cat: 'Economics', sub: 'Macroeconomics', name: 'GDP (Expenditure)', formula: 'GDP = C + I + G + (X − M)', desc: 'Consumption + Investment + Govt + Net Exports.' },
  { id: 124, cat: 'Economics', sub: 'Macroeconomics', name: 'Money Multiplier', formula: 'MM = 1 / Reserve Ratio', desc: 'Maximum money supply expansion.' },
  { id: 125, cat: 'Economics', sub: 'Macroeconomics', name: 'Fisher Equation', formula: 'Nominal Rate = Real Rate + Inflation', desc: 'Nominal vs real interest rates.' },
  { id: 126, cat: 'Economics', sub: 'Macroeconomics', name: 'Quantity Theory of Money', formula: 'MV = PQ', desc: 'Money × velocity = prices × output.' },
  // Biology
  { id: 127, cat: 'Biology', sub: 'Medicine', name: 'BMI', formula: 'BMI = weight(kg) / height(m)²', desc: 'Body mass index.' },
  { id: 128, cat: 'Biology', sub: 'Medicine', name: 'BMR (Mifflin)', formula: 'BMR = 10W + 6.25H − 5A + S', desc: 'Calories burned at rest.', vars: 'W=kg, H=cm, A=age, S=+5 male / −161 female' },
  { id: 129, cat: 'Biology', sub: 'Medicine', name: 'Cardiac Output', formula: 'CO = HR × SV', desc: 'Blood pumped per minute.', vars: 'HR=heart rate, SV=stroke volume' },
  { id: 130, cat: 'Biology', sub: 'Ecology', name: 'Population Growth', formula: 'N(t) = N₀ e^(rt)', desc: 'Exponential population growth.' },
  { id: 131, cat: 'Biology', sub: 'Ecology', name: 'Logistic Growth', formula: 'dN/dt = rN(1 − N/K)', desc: 'Growth limited by carrying capacity K.' },
  { id: 132, cat: 'Biology', sub: 'Genetics', name: 'Hardy-Weinberg', formula: 'p² + 2pq + q² = 1', desc: 'Allele frequency equilibrium.' },
  // Computer Science
  { id: 133, cat: 'CS', sub: 'Information Theory', name: 'Shannon Entropy', formula: 'H = −Σ pᵢ log₂(pᵢ)', desc: 'Average information content in bits.' },
  { id: 134, cat: 'CS', sub: 'Complexity', name: 'Binary Search', formula: 'O(log n)', desc: 'Time complexity of binary search.' },
  { id: 135, cat: 'CS', sub: 'Complexity', name: 'Merge Sort', formula: 'O(n log n)', desc: 'Time complexity of merge sort.' },
  // Astronomy
  { id: 136, cat: 'Astronomy', sub: 'Orbital', name: "Kepler's Third Law", formula: 'T² = (4π²/GM) r³', desc: 'Period² proportional to semi-major axis³.' },
  { id: 137, cat: 'Astronomy', sub: 'Orbital', name: 'Escape Velocity', formula: 'v_esc = √(2GM/r)', desc: 'Minimum speed to escape gravity.' },
  { id: 138, cat: 'Astronomy', sub: 'Astrophysics', name: "Hubble's Law", formula: 'v = H₀ · d', desc: 'Galaxy recession speed vs distance.', vars: 'H₀≈67.4 km/s/Mpc' },
  { id: 139, cat: 'Astronomy', sub: 'Astrophysics', name: 'Schwarzschild Radius', formula: 'r_s = 2GM/c²', desc: 'Event horizon radius of a black hole.' },
];

const FORMULA_CATS = ['All', ...Array.from(new Set(FORMULAS.map(f => f.cat))).sort()];

function initFormulas() {
  const catEl = document.getElementById('formula-cats');
  FORMULA_CATS.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'hfilt' + (cat === 'All' ? ' active' : '');
    btn.textContent = cat;
    btn.onclick = () => {
      State.formulaCat = cat;
      document.querySelectorAll('#formula-cats .hfilt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderFormulas(); playClick();
    };
    catEl.appendChild(btn);
  });
  renderFormulas();
}

function renderFormulas() {
  const search = document.getElementById('formula-search')?.value.toLowerCase() || '';
  const grid = document.getElementById('formula-grid');
  const countEl = document.getElementById('formula-count');
  if (!grid) return;

  const filtered = FORMULAS.filter(f => {
    const matchCat = State.formulaCat === 'All' || f.cat === State.formulaCat;
    const matchSearch = !search || f.name.toLowerCase().includes(search) || f.formula.toLowerCase().includes(search) || f.desc.toLowerCase().includes(search);
    return matchCat && matchSearch;
  });

  if (countEl) countEl.textContent = `Showing ${filtered.length} of ${FORMULAS.length} formulas`;

  // Group by subcategory
  const subs = [...new Set(filtered.map(f => f.sub))];
  grid.innerHTML = subs.map(sub => {
    const items = filtered.filter(f => f.sub === sub);
    return `
      <div class="formula-section-header">
        <div class="formula-section-line"></div>
        <div class="formula-section-title">${sub}</div>
        <div class="formula-section-line"></div>
      </div>
      ${items.map(f => `
        <div class="formula-card" data-id="${f.id}">
          <button class="copy-btn" onclick="copyFormula('${escHtml(f.formula)}')" title="Copy">⎘</button>
          <div class="formula-cat-tag">${f.cat}</div>
          <div class="formula-name">${escHtml(f.name)}</div>
          <div class="formula-expr">${escHtml(f.formula)}</div>
          <div class="formula-desc">${escHtml(f.desc)}</div>
          ${f.vars ? `<div class="formula-vars">${escHtml(f.vars)}</div>` : ''}
        </div>
      `).join('')}
    `;
  }).join('');

  if (filtered.length === 0) grid.innerHTML = '<div class="hist-empty"><span class="empty-icon">∫</span>No formulas found.</div>';
}

function copyFormula(f) {
  navigator.clipboard?.writeText(f).catch(() => { });
  playClick();
}

/* ═══════════════════════════════════════════════════════════
   AI ASSISTANT
   ═══════════════════════════════════════════════════════════ */
function sendAI() {
  const input = document.getElementById('ai-input');
  const query = input?.value.trim();
  if (!query) return;
  input.value = '';
  addAIMessage(query, 'user');
  setTimeout(() => {
    const response = processAIQuery(query);
    addAIMessage(response, 'bot');
  }, 300);
  playClick();
}

function addAIMessage(content, type) {
  const msgs = document.getElementById('ai-messages');
  const div = document.createElement('div');
  div.className = `ai-msg ${type}`;
  div.innerHTML = `
    <div class="ai-avatar">${type === 'user' ? 'U' : '✦'}</div>
    <div class="ai-bubble">${content}</div>
  `;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function processAIQuery(q) {
  const ql = q.toLowerCase();

  // Percentage queries
  const pctOf = q.match(/(\d+\.?\d*)\s*%\s*of\s*(\d+\.?\d*)/i);
  if (pctOf) {
    const pct = parseFloat(pctOf[1]), base = parseFloat(pctOf[2]);
    const res = base * pct / 100;
    return `<strong>${pct}% of ${base}</strong><br><br>
      <div class="ai-step">Step 1: ${base} × ${pct} = ${base * pct}</div>
      <div class="ai-step">Step 2: ${base * pct} ÷ 100 = <strong>${res}</strong></div>
      <br>Answer: <em>${res}</em>`;
  }

  // Factorial
  const factMatch = q.match(/factorial\s+(?:of\s+)?(\d+)|(\d+)\s*!/i);
  if (factMatch) {
    const n = parseInt(factMatch[1] || factMatch[2]);
    if (n <= 20) {
      const steps = Array.from({ length: n }, (_, i) => i + 1);
      const result = steps.reduce((a, b) => a * b, 1);
      return `<strong>${n}! (Factorial of ${n})</strong><br><br>
        <div class="ai-step">${steps.join(' × ')} = <strong>${result}</strong></div>`;
    }
  }

  // EMI query
  const emiMatch = q.match(/emi.+?(\d+(?:\.\d+)?)\s*(?:lakh|l)?.*?(\d+(?:\.\d+)?)\s*%/i);
  if (emiMatch || ql.includes('emi')) {
    const amtM = q.match(/(\d+(?:\.\d+)?)\s*(?:lakh|crore)?/i);
    const rateM = q.match(/(\d+(?:\.\d+)?)\s*%/);
    if (amtM && rateM) {
      let P = parseFloat(amtM[1]);
      if (ql.includes('lakh')) P *= 100000;
      if (ql.includes('crore')) P *= 10000000;
      const r = parseFloat(rateM[1]) / 12 / 100;
      const n = 60; // default 5 years
      const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      return `<strong>EMI Calculation</strong><br>
        Principal: ₹${P.toLocaleString()}<br>
        Rate: ${rateM[1]}% p.a. (${(parseFloat(rateM[1]) / 12).toFixed(2)}% monthly)<br>
        Tenure: 5 years (60 months)<br><br>
        <div class="ai-step">EMI = P × r × (1+r)ⁿ / ((1+r)ⁿ − 1)</div>
        <div class="ai-step">Monthly EMI = <strong>₹${Math.round(emi).toLocaleString()}</strong></div>`;
    }
  }

  // GST query
  const gstMatch = q.match(/gst.+?(\d+(?:\.\d+)?)\s*(?:rs|₹|rupees?)?/i) || q.match(/(\d+(?:\.\d+)?)\s*(?:rs|₹).+gst/i);
  if (gstMatch || ql.includes('gst')) {
    const amtM = q.match(/[\d,]+(?:\.\d+)?/);
    const rateM = q.match(/(\d+)\s*%/);
    if (amtM) {
      const amt = parseFloat(String(amtM[0]).replace(/,/g, ''));
      const rate = rateM ? parseFloat(rateM[1]) : 18;
      const gstAmt = amt * rate / 100;
      return `<strong>GST Calculation</strong><br>
        Amount: ₹${amt.toLocaleString()}<br>
        GST Rate: ${rate}%<br><br>
        <div class="ai-step">GST = ₹${amt.toLocaleString()} × ${rate}/100 = <strong>₹${Math.round(gstAmt).toLocaleString()}</strong></div>
        <div class="ai-step">Total = ₹${Math.round(amt + gstAmt).toLocaleString()}</div>
        <div class="ai-step">CGST = ₹${Math.round(gstAmt / 2).toLocaleString()} | SGST = ₹${Math.round(gstAmt / 2).toLocaleString()}</div>`;
    }
  }

  // Step-by-step multiplication
  const mulMatch = q.match(/(\d+)\s*[×x*]\s*(\d+)/);
  if (mulMatch || ql.includes('multiply') || ql.includes('times')) {
    const numMatch = q.match(/(\d+)\D+(\d+)/);
    if (numMatch) {
      const a = parseInt(numMatch[1]), b = parseInt(numMatch[2]);
      const result = a * b;
      const bStr = String(b);
      const steps = bStr.split('').reverse().map((d, i) => {
        const partial = a * parseInt(d) * Math.pow(10, i);
        return `<div class="ai-step">Step ${i + 1}: ${a} × ${d}${'0'.repeat(i)} = ${partial.toLocaleString()}</div>`;
      });
      return `<strong>${a} × ${b}</strong><br><br>
        ${steps.join('')}
        <div class="ai-step">Final: <strong>${result.toLocaleString()}</strong></div>`;
    }
  }

  // Arithmetic step-by-step
  const mathMatch = q.match(/([\d.]+)\s*([+\-×x*/÷])\s*([\d.]+)/);
  if (mathMatch) {
    const a = parseFloat(mathMatch[1]), op = mathMatch[2], b = parseFloat(mathMatch[3]);
    let result, opName;
    if (op === '+') { result = a + b; opName = 'added to'; }
    else if (op === '-') { result = a - b; opName = 'minus'; }
    else if (op === '×' || op === 'x' || op === '*') { result = a * b; opName = 'multiplied by'; }
    else if (op === '/' || op === '÷') { result = b !== 0 ? a / b : NaN; opName = 'divided by'; }
    if (!isNaN(result)) {
      return `<strong>${a} ${op} ${b}</strong><br><br>
        <div class="ai-step">${a} ${opName} ${b} = <strong>${fmtNum(result)}</strong></div>`;
    }
  }

  // Square root
  const sqrtMatch = q.match(/sqrt|square\s*root|√\s*(\d+)/i);
  if (sqrtMatch) {
    const nm = q.match(/(\d+)/);
    if (nm) {
      const n = parseFloat(nm[1]);
      return `<strong>√${n}</strong> = <em>${fmtNum(Math.sqrt(n))}</em>`;
    }
  }

  // Power
  const powMatch = q.match(/(\d+)\s*\^?\s*(?:to the power of|raised to|power)\s*(\d+)/i);
  if (powMatch) {
    const base = parseFloat(powMatch[1]), exp = parseFloat(powMatch[2]);
    return `<strong>${base}^${exp}</strong> = <em>${fmtNum(Math.pow(base, exp))}</em>`;
  }

  // Compound interest
  if (ql.includes('compound')) {
    return `Compound Interest formula:<br><em>A = P(1 + r/n)^(nt)</em><br>where P=principal, r=annual rate, n=compounds per year, t=time in years.<br><br>Use the <strong>Financial</strong> section for detailed calculations!`;
  }

  // Fallback — try to evaluate as math
  try {
    const expr = q.replace(/what\s+is\s*/i, '').replace(/calculate\s*/i, '').replace(/solve\s*/i, '').replace(/[?!.]/g, '').trim();
    if (expr && /^[\d\s+\-*/().^%]+$/.test(expr)) {
      const result = Function('"use strict"; return (' + expr + ')')();
      return `<strong>${expr}</strong> = <em>${fmtNum(result)}</em>`;
    }
  } catch (e) { }

  return `I can help with calculations like:<br>
    • <em>"15% of 8500"</em><br>
    • <em>"245 × 32 step by step"</em><br>
    • <em>"factorial of 8"</em><br>
    • <em>"EMI for 5 lakh at 9%"</em><br>
    • <em>"GST on 10000 at 18%"</em><br>
    • <em>"sqrt of 144"</em><br><br>
    Type a calculation and I'll break it down!`;
}

/* ═══════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ═══════════════════════════════════════════════════════════ */
function initKeyboard() {
  document.addEventListener('keydown', e => {
    const activePage = document.querySelector('.page.active')?.id;
    if (activePage === 'page-standard' && !e.target.closest('input, textarea')) {
      if (e.key >= '0' && e.key <= '9') {
        playClick();
        const btn = document.querySelector(`#page-standard .cbtn[data-val="${e.key}"]`);
        if (btn) handleStd(btn);
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        const opMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
        const btn = document.querySelector(`#page-standard .op-btn[data-val="${opMap[e.key] || e.key}"]`);
        if (btn) { playClick(); handleStd(btn); }
      } else if (e.key === 'Enter') {
        playClick(); const btn = document.querySelector('#page-standard .eq-btn'); if (btn) handleStd(btn);
      } else if (e.key === 'Backspace') {
        e.preventDefault(); playClick();
        const btn = document.querySelector('#page-standard [data-action="backspace"]'); if (btn) handleStd(btn);
      } else if (e.key === 'Escape') {
        playClick(); const btn = document.querySelector('#page-standard [data-action="clear"]'); if (btn) handleStd(btn);
      } else if (e.key === '.') {
        playClick(); const btn = document.querySelector('#page-standard [data-action="dot"]'); if (btn) handleStd(btn);
      }
    }
  });
}
