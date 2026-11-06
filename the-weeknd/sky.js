import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

/* =========================================================
   LE CIEL — star trails around the pole star (WebGL)
   + constellations drawn in a 2D layer (stroke font)
   ========================================================= */

const gsap = () => window.gsap;

/* ---------- stroke font: glyphs on a 4 × 6 grid (y down) ---------- */
const ell = (cx, cy, rx, ry, n = 12, a0 = -Math.PI / 2) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
const FONT = {
  A: [[[0, 6], [2, 0], [4, 6]], [[0.8, 3.6], [3.2, 3.6]]],
  B: [[[0, 6], [0, 0], [2.6, 0], [3.4, 0.75], [3.4, 2.25], [2.6, 3], [0, 3]], [[2.6, 3], [3.7, 3.8], [3.7, 5.2], [2.8, 6], [0, 6]]],
  E: [[[3.8, 0], [0, 0], [0, 6], [3.8, 6]], [[0, 3], [3, 3]]],
  F: [[[3.8, 0], [0, 0], [0, 6]], [[0, 3], [3, 3]]],
  L: [[[0, 0], [0, 6], [3.6, 6]]],
  N: [[[0, 6], [0, 0], [4, 6], [4, 0]]],
  O: [ell(2, 3, 2, 3, 12)],
  S: [[[3.8, 0.9], [3, 0], [1, 0], [0.2, 0.9], [0.2, 2.1], [1, 3], [3, 3], [3.8, 3.9], [3.8, 5.1], [3, 6], [1, 6], [0.2, 5.1]]],
  T: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]],
  V: [[[0, 0], [2, 6], [4, 0]]],
  X: [[[0, 0], [4, 6]], [[4, 0], [0, 6]]],
  Y: [[[0, 0], [2, 3], [4, 0]], [[2, 3], [2, 6]]],
  '?': [[[0.4, 1.3], [1.1, 0.2], [2.9, 0.2], [3.7, 1.2], [3.6, 2.3], [2, 3.4], [2, 4.5]], [[2, 5.9]]],
  '#': [[[1.4, 0], [1, 6]], [[3.2, 0], [2.8, 6]], [[0.1, 2], [4, 2]], [[0, 4], [3.9, 4]]],
  0: [ell(2, 3, 1.8, 3, 12)],
  1: [[[0.9, 1.1], [2.2, 0], [2.2, 6]], [[1, 6], [3.4, 6]]],
  2: [[[0.2, 1.2], [1, 0.2], [3, 0.2], [3.8, 1.2], [3.8, 2.3], [0.2, 6], [3.8, 6]]],
  3: [[[0.2, 0.7], [1, 0], [3, 0], [3.8, 0.8], [3.8, 2.2], [3, 3], [1.4, 3]], [[3, 3], [3.8, 3.8], [3.8, 5.2], [3, 6], [1, 6], [0.2, 5.3]]],
  4: [[[3, 6], [3, 0], [0, 4.2], [4, 4.2]]],
  5: [[[3.8, 0], [0.5, 0], [0.3, 2.8], [2.8, 2.6], [3.8, 3.6], [3.8, 5.2], [3, 6], [1, 6], [0.2, 5.3]]],
  6: [[[3.5, 0.5], [2.5, 0], [1.3, 0], [0.2, 1.3], [0.2, 4.7], [1.2, 6], [2.8, 6], [3.8, 5], [3.8, 3.8], [2.8, 2.8], [1.2, 2.8], [0.2, 3.9]]],
  7: [[[0, 0], [4, 0], [1.6, 6]]],
  8: [ell(2, 1.5, 1.6, 1.5, 8, Math.PI / 2), ell(2, 4.4, 1.9, 1.6, 8, -Math.PI / 2)],
  9: [[[3.8, 2.2], [2.8, 3.2], [1.2, 3.2], [0.2, 2.2], [0.2, 1], [1.2, 0], [2.8, 0], [3.8, 1], [3.8, 4.8], [2.8, 6], [1.2, 6], [0.4, 5.4]]],
  '.': [[[1, 6]]],
  ',': [[[1, 5.6], [0.6, 6.8]]],
};
const WIDTH = { '.': 2, ',': 2 };

function textShape(str) {
  const nodes = [], edges = [], glyphs = [];
  let y0 = 0;
  str.split('\n').forEach((line, li) => {
    let x = 0;
    const first = nodes.length;
    [...line].forEach(ch => {
      if (ch === ' ') { x += 2.6; return; }
      const g = FONT[ch];
      const w = WIDTH[ch] ?? 4;
      if (!g) { x += w + 1.4; return; }
      glyphs.push({ ch, first: nodes.length });
      const seen = new Map();
      g.forEach(poly => {
        let prev = -1;
        poly.forEach(([px, py]) => {
          const k = px.toFixed(2) + ',' + py.toFixed(2);
          let id = seen.get(k);
          if (id == null) { id = nodes.length; nodes.push({ x: x + px, y: y0 + py }); seen.set(k, id); }
          if (prev >= 0 && prev !== id) edges.push([prev, id]);
          prev = id;
        });
      });
      x += w + 1.4;
    });
    const lw = x - 1.4;
    for (let i = first; i < nodes.length; i++) nodes[i].x -= lw / 2;
    y0 += 9.2;
  });
  return { nodes, edges, glyphs };
}
function ringShape() {
  const nodes = [{ x: 0, y: 0 }], edges = [];
  const ring = (n, r, off) => { const s = nodes.length; for (let i = 0; i < n; i++) { const a = off + i * Math.PI * 2 / n; nodes.push({ x: Math.cos(a) * r, y: Math.sin(a) * r }); } for (let i = 0; i < n; i++) edges.push([s + i, s + (i + 1) % n]); return s; };
  const outer = ring(28, 10, 0), inner = ring(12, 3.4, .2);
  [0, 7, 14, 21].forEach(i => edges.push([outer + i, inner + (i / 7) * 3]));
  return { nodes, edges, glyphs: [], spin: true };
}
function starShape() {
  const nodes = [], edges = [];
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 3.9 : 10; nodes.push({ x: Math.cos(a) * r, y: Math.sin(a) * r }); edges.push([i, (i + 1) % 10]); }
  return { nodes, edges, glyphs: [] };
}

/* ---------- helpers ---------- */
const hexRgb = h => { const n = parseInt(h.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const easeIO = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const clamp01 = v => Math.max(0, Math.min(1, v));
function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

/* =========================================================
   createSky
   ========================================================= */
export function createSky({ reduce = false } = {}) {
  const glc = document.getElementById('gl'), cc = document.getElementById('cst');
  const g = cc.getContext('2d');
  let W = innerWidth, H = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
  const pole = { x: 0, y: 0 };
  let Rmax = 1000;
  const placePole = () => { pole.x = W * .5; pole.y = H * (W < H ? .21 : .16); Rmax = Math.hypot(Math.max(pole.x, W - pole.x), Math.max(pole.y, H - pole.y)) * 1.04; };
  placePole();

  /* ----- WebGL: trails ----- */
  let gl = null;
  try {
    const renderer = new THREE.WebGLRenderer({ canvas: glc, alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    const scene = new THREE.Scene(), camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const NS = W < 760 ? 1300 : 2600, K = 12;
    const rand = rng(1990);
    const star = Array.from({ length: NS }, () => {
      const warm = rand(), c = warm < .15 ? [1, .86, .78] : warm < .45 ? [.82, .89, 1] : [1, 1, 1];
      return { r: Math.sqrt(.0004 + rand() * .9996), t: rand() * Math.PI * 2, b: Math.pow(rand(), 2.2) * .9 + .1, s: rand(), f: .6 + rand() * 2.2, p: rand() * 6.28, c };
    });
    const U = {
      uPole: { value: new THREE.Vector2() }, uRes: { value: new THREE.Vector2(W, H) }, uRmax: { value: Rmax },
      uAngle: { value: 0 }, uTrail: { value: .04 }, uOpacity: { value: 1 }, uTime: { value: 0 }, uDpr: { value: dpr }, uBoost: { value: 0 },
    };
    // tails
    const tv = NS * K * 2, aR = new Float32Array(tv), aT = new Float32Array(tv), aB = new Float32Array(tv), aK = new Float32Array(tv), aC = new Float32Array(tv * 3);
    let o = 0;
    star.forEach(st => {
      for (let k = 0; k < K; k++) for (let e = 0; e < 2; e++) {
        aR[o] = st.r; aT[o] = st.t; aB[o] = st.b; aK[o] = (k + e) / K; aC.set(st.c, o * 3); o++;
      }
    });
    const tg = new THREE.BufferGeometry();
    tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(tv * 3), 3));
    tg.setAttribute('aR', new THREE.BufferAttribute(aR, 1)); tg.setAttribute('aT', new THREE.BufferAttribute(aT, 1));
    tg.setAttribute('aB', new THREE.BufferAttribute(aB, 1)); tg.setAttribute('aK', new THREE.BufferAttribute(aK, 1));
    tg.setAttribute('aC', new THREE.BufferAttribute(aC, 3));
    const POS = /* glsl */`
      uniform vec2 uPole, uRes; uniform float uRmax, uAngle;
      vec4 skyPos(float r, float a){ vec2 p = uPole + vec2(cos(a), sin(a)) * r * uRmax; return vec4(p.x / uRes.x * 2. - 1., 1. - p.y / uRes.y * 2., 0., 1.); }`;
    const tailMat = new THREE.ShaderMaterial({
      uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: POS + /* glsl */`
        attribute float aR, aT, aB, aK; attribute vec3 aC;
        uniform float uTrail, uOpacity, uBoost; varying vec4 vC;
        void main(){
          gl_Position = skyPos(aR, aT + uAngle + aK * uTrail);
          float a = aB * pow(1. - aK, 1.6) * uOpacity * (.34 + uBoost * .4);
          vC = vec4(aC, a);
        }`,
      fragmentShader: 'varying vec4 vC; void main(){ gl_FragColor = vC; }',
    });
    scene.add(new THREE.LineSegments(tg, tailMat));
    // heads
    const hR = new Float32Array(NS), hT = new Float32Array(NS), hB = new Float32Array(NS), hS = new Float32Array(NS), hF = new Float32Array(NS), hP = new Float32Array(NS), hC = new Float32Array(NS * 3);
    star.forEach((st, i) => { hR[i] = st.r; hT[i] = st.t; hB[i] = st.b; hS[i] = st.s; hF[i] = st.f; hP[i] = st.p; hC.set(st.c, i * 3); });
    const hg = new THREE.BufferGeometry();
    hg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NS * 3), 3));
    [['aR', hR], ['aT', hT], ['aB', hB], ['aS', hS], ['aF', hF], ['aP', hP]].forEach(([n, a]) => hg.setAttribute(n, new THREE.BufferAttribute(a, 1)));
    hg.setAttribute('aC', new THREE.BufferAttribute(hC, 3));
    const headMat = new THREE.ShaderMaterial({
      uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: POS + /* glsl */`
        attribute float aR, aT, aB, aS, aF, aP; attribute vec3 aC;
        uniform float uTime, uOpacity, uDpr; varying vec4 vC;
        void main(){
          gl_Position = skyPos(aR, aT + uAngle);
          gl_PointSize = (1.1 + aS * aS * 2.6) * uDpr;
          float tw = .62 + .38 * sin(uTime * aF + aP);
          vC = vec4(aC, aB * tw * uOpacity);
        }`,
      fragmentShader: /* glsl */`varying vec4 vC; void main(){ float d = length(gl_PointCoord - .5); if (d > .5) discard; gl_FragColor = vec4(vC.rgb, vC.a * pow(1. - d * 2., 1.4)); }`,
    });
    const heads = new THREE.Points(hg, headMat);
    heads.frustumCulled = false;
    scene.add(heads);
    scene.children.forEach(c => { c.frustumCulled = false; });
    gl = { renderer, scene, camera, U };
  } catch (err) {
    console.warn('WebGL indisponible', err);
  }

  /* ----- 2D: constellations ----- */
  let tint = [244, 239, 233], tintTo = tint.slice(), opacity = 0, opacityTo = 1, chart = 0, chartTo = 1, skyOp = 1, skyOpTo = 1;
  let cur = { nodes: [], edges: [], labels: [], spin: false, cx: 0, cy: 0 };
  let old = null, t0 = 0, key = '', keyOpts = {}, flash = 0, spinA = 0, spinOn = false;
  const mouse = { x: -999, y: -999, nx: 0, ny: 0 };
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.nx = e.clientX / W - .5; mouse.ny = e.clientY / H - .5; }, { passive: true });

  function layout(k) {
    if (!k || k === 'none') return { nodes: [], edges: [], labels: [] };
    const portrait = W < H * 1.05;
    let sh, box = { w: W * .7, h: H * .4, cx: W / 2, cy: H * .54 }, labels = [];
    if (k.startsWith('c:')) {
      let txt = k.slice(2);
      if (txt === 'ABEL TESFAYE') {
        if (portrait) txt = 'ABEL\nTESFAYE';
        box = portrait ? { w: W * .84, h: H * .3, cx: W / 2, cy: H * .44 } : { w: Math.min(W * .84, 1500), h: H * .3, cx: W / 2, cy: H * .5 };
      }
      sh = textShape(txt);
      if (k === 'c:ABEL TESFAYE') {
        const A = sh.glyphs[0], T = sh.glyphs.find(gl => gl.ch === 'T');
        labels = [{ i: A.first + 1, t: 'α ABEL', dx: 10, dy: -12 }, { i: T.first, t: 'TORONTO · 16.02.1990', dx: 0, dy: -16 }];
      }
    } else if (k === 'ring') { sh = ringShape(); box = { w: Math.min(W, H) * .62, h: Math.min(W, H) * .62, cx: W / 2, cy: H * .52 }; }
    else if (k === 'star') { sh = starShape(); box = { w: Math.min(W, H) * .56, h: Math.min(W, H) * .56, cx: W / 2, cy: H * .52 }; }
    else return { nodes: [], edges: [], labels: [] };
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    sh.nodes.forEach(n => { x0 = Math.min(x0, n.x); x1 = Math.max(x1, n.x); y0 = Math.min(y0, n.y); y1 = Math.max(y1, n.y); });
    const s = Math.min(box.w / ((x1 - x0) || 1), box.h / ((y1 - y0) || 1)), mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    const r = rng(k.length * 977 + 13);
    const nodes = sh.nodes.map(n => ({ x: box.cx + (n.x - mx) * s, y: box.cy + (n.y - my) * s, size: 1.3 + r() * 1.5, ph: r() * 6.28, fr: 1 + r() * 2 }));
    return { nodes, edges: sh.edges, labels, spin: !!sh.spin, cx: box.cx, cy: box.cy };
  }

  function set(k, o = {}) {
    keyOpts = o;
    tintTo = hexRgb(o.tint || '#f4efe9');
    opacityTo = o.opacity ?? 1;
    chartTo = o.chart ?? 0;
    skyOpTo = o.sky ?? 1;
    if (k === key && !o.force) return;
    key = k;
    const now = performance.now();
    // freeze the current positions as the starting point
    const from = cur.nodes.map(n => ({ x: n.px ?? n.x, y: n.py ?? n.y, size: n.size }));
    old = { nodes: from, edges: cur.edges, labels: [] };
    const next = layout(k);
    next.nodes.forEach((n, j) => {
      const f = from.length ? from[j % from.length] : { x: pole.x + (Math.random() - .5) * 60, y: pole.y + (Math.random() - .5) * 60 };
      n.fx = f.x; n.fy = f.y; n.delay = (j / Math.max(1, next.nodes.length)) * .35 + Math.random() * .08;
    });
    next.edges.forEach((e, i) => { e.delay = .55 + (i / Math.max(1, next.edges.length)) * 1.1; });
    cur = next;
    t0 = now;
    if (reduce) t0 -= 10000;
  }
  function pulse() { flash = 1; }
  function spin(on) { spinOn = on; }

  /* ----- glow sprite ----- */
  const spr = document.createElement('canvas'); spr.width = spr.height = 64;
  const sg = spr.getContext('2d');
  let sprTint = '';
  function sprite(rgb) {
    const k = rgb.join(',');
    if (k === sprTint) return spr;
    sprTint = k;
    sg.clearRect(0, 0, 64, 64);
    const gr = sg.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, `rgba(${k},1)`); gr.addColorStop(.18, `rgba(${k},.55)`); gr.addColorStop(.45, `rgba(${k},.12)`); gr.addColorStop(1, `rgba(${k},0)`);
    sg.fillStyle = gr; sg.fillRect(0, 0, 64, 64);
    return spr;
  }

  /* ----- frame ----- */
  let angle = 0, omega = .035, boost = 0, time = 0;
  function frame(dtMs, velocity = 0) {
    const dt = Math.min(.05, dtMs / 1000);
    time += dt;
    // sky rotation: counter-clockwise around the pole, faster when scrolling
    const target = (reduce ? 0 : .035) + Math.min(.9, Math.abs(velocity) * .012);
    omega += (target - omega) * .06;
    boost += (Math.min(1, Math.abs(velocity) * .03) - boost) * .08;
    angle -= omega * dt;
    if (spinOn) spinA += dt * 1.2;
    flash = Math.max(0, flash - dt * 1.4);
    // ease ui params
    const k = 1 - Math.pow(.02, dt);
    for (let i = 0; i < 3; i++) tint[i] += (tintTo[i] - tint[i]) * k;
    opacity += (opacityTo - opacity) * k;
    chart += (chartTo - chart) * k;
    skyOp += (skyOpTo - skyOp) * k;

    if (gl) {
      const U = gl.U;
      U.uAngle.value = angle; U.uTrail.value = reduce ? .001 : Math.min(.55, .045 + omega * 1.25);
      U.uTime.value = time; U.uBoost.value = boost; U.uOpacity.value = skyOp * (1 + flash * .6);
      U.uPole.value.set(pole.x, pole.y);
      gl.renderer.render(gl.scene, gl.camera);
    }
    draw();
  }

  function draw() {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    const t = (performance.now() - t0) / 1000, rgb = tint.map(v => v | 0), col = rgb.join(',');
    const px = mouse.nx * -14, py = mouse.ny * -10;
    // chart: rings + meridians around the pole
    if (chart > .01) {
      g.save();
      g.globalAlpha = chart * .5;
      g.strokeStyle = 'rgba(255,255,255,.07)';
      g.lineWidth = 1;
      [.12, .26, .42, .6, .8, 1].forEach(r => { g.beginPath(); g.arc(pole.x, pole.y, r * Rmax, 0, Math.PI * 2); g.stroke(); });
      for (let i = 0; i < 12; i++) { const a = angle + i * Math.PI / 6; g.beginPath(); g.moveTo(pole.x + Math.cos(a) * 18, pole.y + Math.sin(a) * 18); g.lineTo(pole.x + Math.cos(a) * Rmax, pole.y + Math.sin(a) * Rmax); g.stroke(); }
      g.fillStyle = 'rgba(244,239,233,.3)';
      g.font = '500 9px "JetBrains Mono", monospace';
      [0, 3, 6, 9].forEach(i => { const a = angle + i * Math.PI / 6, r = .42 * Rmax; g.fillText(`${(i * 2).toString().padStart(2, '0')} h`, pole.x + Math.cos(a) * r + 4, pole.y + Math.sin(a) * r - 4); });
      g.restore();
    }
    // old constellation fading out
    if (old && t < .6) {
      const a = (1 - t / .6) * opacity;
      g.strokeStyle = `rgba(${col},${.32 * a})`;
      g.lineWidth = 1;
      g.beginPath();
      old.edges.forEach(([i, j]) => { const A = old.nodes[i], B = old.nodes[j]; if (!A || !B) return; g.moveTo(A.x + px, A.y + py); g.lineTo(B.x + px, B.y + py); });
      g.stroke();
    }
    // nodes
    const N = cur.nodes, s = sprite(rgb);
    const cs = Math.cos(spinA), sn = Math.sin(spinA);
    N.forEach(n => {
      const p = easeIO(clamp01((t - n.delay) / 1.4));
      let x = n.fx + (n.x - n.fx) * p, y = n.fy + (n.y - n.fy) * p;
      if (cur.spin) { const dx = x - cur.cx, dy = y - cur.cy; x = cur.cx + dx * cs - dy * sn; y = cur.cy + dx * sn + dy * cs; }
      n.px = x; n.py = y;
    });
    // edges (progressive reveal)
    g.lineWidth = 1;
    g.strokeStyle = `rgba(${col},${.36 * opacity})`;
    g.beginPath();
    cur.edges.forEach(e => {
      const p = easeIO(clamp01((t - e.delay) / .5));
      if (p <= 0) return;
      const A = N[e[0]], B = N[e[1]];
      g.moveTo(A.px + px, A.py + py);
      g.lineTo(A.px + (B.px - A.px) * p + px, A.py + (B.py - A.py) * p + py);
    });
    g.stroke();
    // stars
    N.forEach(n => {
      const appear = clamp01((t - n.delay) / .6);
      const tw = .72 + .28 * Math.sin(time * n.fr + n.ph);
      const d = Math.hypot(n.px + px - mouse.x, n.py + py - mouse.y), near = d < 110 ? 1 - d / 110 : 0;
      const a = appear * opacity * tw * (1 + flash), sz = n.size * (1 + near * .9 + flash * .5);
      g.globalAlpha = Math.min(1, a * .9);
      g.drawImage(s, n.px + px - sz * 7, n.py + py - sz * 7, sz * 14, sz * 14);
      g.globalAlpha = Math.min(1, a);
      g.fillStyle = '#fff';
      g.beginPath(); g.arc(n.px + px, n.py + py, sz * .62, 0, Math.PI * 2); g.fill();
    });
    g.globalAlpha = 1;
    // labels
    if (cur.labels.length) {
      const a = clamp01((t - 1.6) / .8) * opacity;
      g.fillStyle = `rgba(${col},${.7 * a})`;
      g.font = '500 10px "JetBrains Mono", monospace';
      cur.labels.forEach(l => { const n = N[l.i]; if (n) g.fillText(l.t, n.px + px + l.dx, n.py + py + l.dy); });
    }
    // the pole star
    drawPole();
  }
  function drawPole() {
    const x = pole.x, y = pole.y, tw = .85 + .15 * Math.sin(time * 1.9), r = 30 * tw * (1 + flash * .6);
    g.save();
    const gr = g.createRadialGradient(x, y, 0, x, y, r * 2.4);
    gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(.1, 'rgba(225,235,255,.6)'); gr.addColorStop(.35, 'rgba(190,205,255,.14)'); gr.addColorStop(1, 'rgba(190,205,255,0)');
    g.fillStyle = gr;
    g.beginPath(); g.arc(x, y, r * 2.4, 0, Math.PI * 2); g.fill();
    const spike = (dx, dy, len) => {
      const lg = g.createLinearGradient(x - dx * len, y - dy * len, x + dx * len, y + dy * len);
      lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(.5, 'rgba(255,255,255,.85)'); lg.addColorStop(1, 'rgba(255,255,255,0)');
      g.strokeStyle = lg; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x - dx * len, y - dy * len); g.lineTo(x + dx * len, y + dy * len); g.stroke();
    };
    spike(1, 0, 70 * tw); spike(0, 1, 70 * tw); spike(.7071, .7071, 22 * tw); spike(.7071, -.7071, 22 * tw);
    g.fillStyle = '#fff';
    g.beginPath(); g.arc(x, y, 2.8, 0, Math.PI * 2); g.fill();
    if (chart > .05) {
      g.globalAlpha = chart;
      g.fillStyle = 'rgba(244,239,233,.75)';
      g.font = '500 10px "JetBrains Mono", monospace';
      g.fillText('ÉTOILE POLAIRE', x + 22, y + 4);
    }
    g.restore();
  }

  function resize() {
    W = innerWidth; H = innerHeight; dpr = Math.min(devicePixelRatio || 1, 2);
    cc.width = W * dpr; cc.height = H * dpr; cc.style.width = W + 'px'; cc.style.height = H + 'px';
    placePole();
    if (gl) { gl.renderer.setPixelRatio(dpr); gl.renderer.setSize(W, H, false); gl.U.uRes.value.set(W, H); gl.U.uRmax.value = Rmax; gl.U.uDpr.value = dpr; }
    if (key) set(key, { ...keyOpts, force: true });
  }
  resize();
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 180); });

  return { set, pulse, spin, frame, pole: () => ({ ...pole }), get key() { return key; } };
}
