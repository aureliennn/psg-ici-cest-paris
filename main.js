import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

/* =========================================================
   PSG — Ici c'est Paris
   GSAP + ScrollTrigger + Lenis + Three.js + canvas-confetti
   ========================================================= */

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isTouch = matchMedia('(hover: none)').matches;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLORS = ['#e8c25a', '#fff1b8', '#da291c', '#1f6fd1', '#ffffff'];
const confetti = (o) => window.confetti && window.confetti({ disableForReducedMotion: true, ...o });

document.documentElement.classList.add(isTouch ? 'touch' : 'mouse');
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* ---------- smooth scroll ---------- */
const lenis = new Lenis({ lerp: reduce ? 1 : 0.085, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();

/* ---------- split text into chars ---------- */
function split(el) {
  if (el._chars) return el._chars;
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.textContent = '';
  text.split(' ').forEach((word, i, arr) => {
    const w = document.createElement('span');
    w.className = 'w';
    w.setAttribute('aria-hidden', 'true');
    [...word].forEach(ch => {
      const c = document.createElement('span');
      c.className = 'c';
      c.textContent = ch;
      w.appendChild(c);
    });
    el.appendChild(w);
    if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
  });
  el._chars = $$('.c', el);
  return el._chars;
}

/* ---------- text scramble ---------- */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=?!★';
function scramble(el, finalText, dur = 1.1) {
  return new Promise(res => {
    const total = Math.max(1, Math.round(dur * 60));
    const q = [...finalText].map(c => {
      const start = Math.floor(Math.random() * total * 0.4);
      return { c, start, end: start + Math.floor(total * 0.3 + Math.random() * total * 0.5) };
    });
    let f = 0;
    (function tick() {
      let out = '', done = 0;
      for (const it of q) {
        if (f >= it.end) { done++; out += it.c === ' ' ? ' ' : esc(it.c); }
        else if (f >= it.start && it.c !== ' ') out += `<span class="scr">${GLYPHS[(Math.random() * GLYPHS.length) | 0]}</span>`;
        else out += it.c === ' ' ? ' ' : `<span class="scr" style="opacity:.25">${GLYPHS[(Math.random() * GLYPHS.length) | 0]}</span>`;
      }
      el.innerHTML = out;
      if (done === q.length) { el.textContent = finalText; res(); }
      else { f++; requestAnimationFrame(tick); }
    })();
  });
}

/* =========================================================
   PARTICLES — 10k points that morph between shapes
   ========================================================= */
const VS = /* glsl */`
attribute vec3 aFrom; attribute vec3 aTo; attribute float aRand;
uniform float uProgress, uTime, uSize, uPR, uGold, uOpacity;
uniform vec2 uMouse;
varying vec3 vColor; varying float vAlpha;
float ease(float t){ return t < .5 ? 4.*t*t*t : 1. - pow(-2.*t + 2., 3.) / 2.; }
void main(){
  float p = ease(clamp((uProgress - aRand * .35) / .65, 0., 1.));
  vec3 pos = mix(aFrom, aTo, p);
  float mid = sin(p * 3.14159);
  pos += vec3(sin(aRand*43. + uTime*.8), cos(aRand*31. + uTime*.7), sin(aRand*17.)) * mid * vec3(1.6, 1.6, 3.);
  pos.x += sin(uTime*.7 + aRand*25.) * .025;
  pos.y += cos(uTime*.6 + aRand*19.) * .025;
  vec2 dm = pos.xy - uMouse; float d = length(dm);
  float push = smoothstep(1.4, 0., d);
  pos.xy += (dm / (d + .0001)) * push * .6;
  pos.z += push * .9;
  vec4 mv = modelViewMatrix * vec4(pos, 1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPR * (.45 + aRand * .9) * (10. / -mv.z);
  // Hechter stripe: blue | white | red | white | blue
  vec3 blue = vec3(.13, .42, .9), red = vec3(.98, .2, .15), white = vec3(1.);
  float ax = abs(pos.x);
  vec3 col = mix(red, white, smoothstep(.5, .56, ax));
  col = mix(col, blue, smoothstep(.72, .78, ax));
  if (aRand > .965) col = white;
  vec3 gold = mix(vec3(1., .7, .22), vec3(1., .94, .72), aRand);
  vColor = mix(col, gold, uGold);
  vAlpha = (.55 + .45 * sin(uTime * 2. + aRand * 60.)) * uOpacity * (1. + push);
}`;
const FS = /* glsl */`
varying vec3 vColor; varying float vAlpha;
void main(){
  float d = length(gl_PointCoord - .5);
  if (d > .5) discard;
  float a = pow(1. - d * 2., 1.6);
  gl_FragColor = vec4(vColor, a * vAlpha);
}`;

function createParticles() {
  try {
    const canvas = $('#gl');
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight, false);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, (innerWidth / innerHeight) || 16 / 9, 0.1, 100);
    camera.position.z = 10;

    const N = innerWidth < 760 ? 5000 : 10000;
    const from = new Float32Array(N * 3), to = new Float32Array(N * 3), rnd = new Float32Array(N);
    for (let i = 0; i < N; i++) rnd[i] = Math.random();
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    const aFrom = new THREE.BufferAttribute(from, 3), aTo = new THREE.BufferAttribute(to, 3);
    geo.setAttribute('aFrom', aFrom);
    geo.setAttribute('aTo', aTo);
    geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));

    const U = {
      uProgress: { value: 1 }, uTime: { value: 0 }, uSize: { value: innerWidth < 760 ? 2.6 : 3.1 },
      uPR: { value: renderer.getPixelRatio() }, uMouse: { value: new THREE.Vector2(99, 99) },
      uGold: { value: 0 }, uOpacity: { value: 1 },
    };
    const mat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    scene.add(points);

    const aspect = () => (innerWidth > 0 && innerHeight > 0 ? innerWidth / innerHeight : 16 / 9);
    const view = () => {
      if (Math.abs(camera.aspect - aspect()) > 1e-3) { camera.aspect = aspect(); camera.updateProjectionMatrix(); }
      const h = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      return { w: h * camera.aspect, h };
    };

    function fromCanvas(draw, { fw = .8, fh = .55, oy = 0 } = {}) {
      const W = 1200, H = 600, cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      const ctx = cv.getContext('2d', { willReadFrequently: true });
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      draw(ctx, W, H);
      const d = ctx.getImageData(0, 0, W, H).data, pts = [], step = 2;
      let x0 = W, x1 = 0, y0 = H, y1 = 0;
      for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
        if (d[(y * W + x) * 4 + 3] > 128) { pts.push(x, y); if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
      const out = new Float32Array(N * 3);
      const n = pts.length / 2;
      if (!n) return galaxy();
      const v = view(), bw = (x1 - x0) || 1, bh = (y1 - y0) || 1;
      const s = Math.min(v.w * fw / bw, v.h * fh / bh), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      for (let i = 0; i < N; i++) {
        const k = ((Math.random() * n) | 0) * 2;
        out[i * 3] = (pts[k] - cx + Math.random() * step) * s;
        out[i * 3 + 1] = -(pts[k + 1] - cy + Math.random() * step) * s + v.h * oy;
        out[i * 3 + 2] = (Math.random() - .5) * .5;
      }
      return out;
    }
    const text = (str, o) => fromCanvas((ctx, W, H) => {
      let size = H * .8;
      ctx.font = `${size}px Anton`;
      const m = ctx.measureText(str).width;
      if (m > W * .94) { size *= W * .94 / m; ctx.font = `${size}px Anton`; }
      ctx.fillText(str, W / 2, H / 2 + size * .04);
    }, o);
    const starPath = (ctx, cx, cy, R, r) => {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill();
    };
    const stars = n => fromCanvas((ctx, W, H) => {
      const R = Math.min(H * .45, W / (n * 2.3)), gap = R * 2.25, start = W / 2 - (n - 1) * gap / 2;
      for (let i = 0; i < n; i++) starPath(ctx, start + i * gap, H / 2, R, R * .42);
    }, { fw: .86, fh: .55 });
    function galaxy() {
      const out = new Float32Array(N * 3), v = view(), R = Math.min(v.w, v.h) * .62;
      for (let i = 0; i < N; i++) {
        const arm = i % 3, r = Math.pow(Math.random(), .6) * R;
        const a = arm * Math.PI * 2 / 3 + r * 1.1 + (Math.random() - .5) * .7 * (1.2 - r / R);
        out[i * 3] = Math.cos(a) * r * 1.3;
        out[i * 3 + 1] = Math.sin(a) * r * .5 + (Math.random() - .5) * .3;
        out[i * 3 + 2] = Math.sin(a) * r * .8 + (Math.random() - .5) * .4;
      }
      return out;
    }

    const cache = new Map();
    function shape(key) {
      if (cache.has(key)) return cache.get(key);
      let s;
      if (key === 'galaxy') s = galaxy();
      else if (key === 'stars2') s = stars(2);
      else if (key === 'stars3') s = stars(3);
      else if (key.startsWith('y:')) s = text(key.slice(2), { fw: .72, fh: .42, oy: .15 });
      else s = text(key.slice(2), { fw: .8, fh: .5 });
      cache.set(key, s);
      return s;
    }

    // replicate the shader's position on the CPU so interrupted morphs stay seamless
    function current() {
      const out = new Float32Array(N * 3), t = U.uTime.value, up = U.uProgress.value;
      for (let i = 0; i < N; i++) {
        const r = rnd[i], i3 = i * 3;
        let p = Math.min(1, Math.max(0, (up - r * .35) / .65));
        p = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        const mid = Math.sin(p * Math.PI);
        out[i3] = from[i3] + (to[i3] - from[i3]) * p + Math.sin(r * 43 + t * .8) * mid * 1.6;
        out[i3 + 1] = from[i3 + 1] + (to[i3 + 1] - from[i3 + 1]) * p + Math.cos(r * 31 + t * .7) * mid * 1.6;
        out[i3 + 2] = from[i3 + 2] + (to[i3 + 2] - from[i3 + 2]) * p + Math.sin(r * 17) * mid * 3;
      }
      return out;
    }

    let key = 'galaxy';
    const g = shape('galaxy'); from.set(g); to.set(g);

    function morph(k, { gold = 0, opacity = 1, dur = 2.4, force = false } = {}) {
      gsap.to(U.uGold, { value: gold, duration: 1.4, ease: 'power2.out', overwrite: true });
      gsap.to(U.uOpacity, { value: opacity, duration: 1.2, ease: 'power2.out', overwrite: true });
      if (k === key && !force) return;
      key = k;
      from.set(current()); aFrom.needsUpdate = true;
      to.set(shape(k)); aTo.needsUpdate = true;
      gsap.killTweensOf(U.uProgress);
      U.uProgress.value = 0;
      gsap.to(U.uProgress, { value: 1, duration: reduce ? .01 : dur, ease: 'none' });
    }
    function pulse() {
      gsap.fromTo(points.scale, { x: 1.25, y: 1.25, z: 1.25 }, { x: 1, y: 1, z: 1, duration: 1.6, ease: 'elastic.out(1,.35)' });
    }

    // mouse
    const m = { x: 0, y: 0, nx: 0, ny: 0, active: false };
    addEventListener('pointermove', e => {
      m.nx = (e.clientX / innerWidth) * 2 - 1; m.ny = -(e.clientY / innerHeight) * 2 + 1; m.active = e.pointerType === 'mouse';
    }, { passive: true });
    document.addEventListener('pointerleave', () => { m.active = false; });

    gsap.ticker.add(time => {
      U.uTime.value = time;
      const v = view();
      const tx = m.active ? m.nx * v.w / 2 : 99, ty = m.active ? m.ny * v.h / 2 : 99;
      const mu = U.uMouse.value;
      if (Math.abs(tx - mu.x) > 20) mu.set(tx, ty); else { mu.x += (tx - mu.x) * .12; mu.y += (ty - mu.y) * .12; }
      points.rotation.y += ((Math.sin(time * .25) * .1 + m.nx * .12) - points.rotation.y) * .05;
      points.rotation.x += ((-m.ny * .07) - points.rotation.x) * .05;
      renderer.render(scene, camera);
    });

    let lastW = innerWidth, rt;
    addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (!innerWidth || !innerHeight) return;
        renderer.setSize(innerWidth, innerHeight, false);
        camera.aspect = aspect(); camera.updateProjectionMatrix();
        if (Math.abs(innerWidth - lastW) > 40 || !lastW) {
          lastW = innerWidth; cache.clear();
          morph(key, { force: true, dur: 1.2, gold: U.uGold.value, opacity: U.uOpacity.value });
        }
      }, 200);
    });

    return { morph, pulse };
  } catch (err) {
    console.warn('WebGL indisponible', err);
    return { morph() {}, pulse() {} };
  }
}

const P = createParticles();
let ready = false;
function scene(k, o) { if (ready) P.morph(k, o); }

/* scene zones: the last active zone in DOM order wins */
const zones = [];
let curZone = null, pickQueued = false;
function zone(name, opts, fn) {
  const z = { name, fn };
  z.st = ScrollTrigger.create({ ...opts, onToggle: queuePick });
  zones.push(z);
}
function queuePick() {
  if (pickQueued) return;
  pickQueued = true;
  requestAnimationFrame(() => { pickQueued = false; pick(); });
  setTimeout(() => { if (pickQueued) { pickQueued = false; pick(); } }, 60);
}
function pick(force) {
  if (!ready) return;
  let z = null;
  for (let i = zones.length - 1; i >= 0; i--) if (zones[i].st.isActive) { z = zones[i]; break; }
  if (!z || (z === curZone && !force)) return;
  curZone = z;
  inStars = z.name === 'stars';
  z.fn();
}

/* =========================================================
   CURSOR + MAGNETIC
   ========================================================= */
function setupCursor() {
  if (isTouch) return;
  const dot = $('.cursor-dot'), ring = $('.cursor-ring');
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: innerWidth / 2, y: innerHeight / 2 });
  const dx = gsap.quickTo(dot, 'x', { duration: .08 }), dy = gsap.quickTo(dot, 'y', { duration: .08 });
  const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
  addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
  document.addEventListener('pointerover', e => {
    const t = e.target.closest('a,button,input,.tilt,[data-cursor],.s-sugg li');
    document.body.classList.toggle('cursor-hover', !!t);
    ring.dataset.label = t?.dataset?.cursor || (t?.classList?.contains('tilt') ? 'Paris' : '');
  });
  $$('[data-magnetic]').forEach(el => {
    const xTo = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1,.4)' }), yTo = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * .35); yTo((e.clientY - r.top - r.height / 2) * .35);
    });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
}

/* =========================================================
   GLOBAL: progress, nav, anchors, titles
   ========================================================= */
function setupGlobal() {
  gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });
  ScrollTrigger.create({ start: 80, end: 'max', onToggle: s => $('.nav').classList.toggle('scrolled', s.isActive) });

  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    if (a.dataset.tab) switchTab(a.dataset.tab);
    lenis.scrollTo(target, { duration: 1.8, easing: t => 1 - Math.pow(1 - t, 4) });
  }));

  $$('.title.split').forEach(t => {
    const chars = split(t);
    gsap.from(chars, {
      yPercent: 120, rotate: 8, duration: 1.1, stagger: .03, ease: 'expo.out',
      scrollTrigger: { trigger: t, start: 'top 85%', toggleActions: 'play none none reverse' },
    });
  });
}

/* =========================================================
   HERO + MARQUEE
   ========================================================= */
function setupHero() {
  split($('.hero-tag'));
  gsap.set($('.hero-tag')._chars, { yPercent: 120 });
  gsap.set(['.hero-top > *', '.scroll-hint', '.nav'], { opacity: 0 });

  gsap.to('.hero-top, .hero-bottom', {
    opacity: 0, y: -80, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 35%', scrub: true },
  });
  zone('hero', { trigger: '.hero', start: 'top 55%', end: 'bottom 55%' }, () => scene('t:PSG', { opacity: 1 }));
}
function heroIntro() {
  ready = true;
  lenis.start();
  document.body.classList.remove('loading');
  P.morph('t:PSG', { dur: 2.8 });
  curZone = zones[0];
  gsap.to('.nav', { opacity: 1, duration: 1, delay: .2 });
  gsap.from('.nav', { y: -60, duration: 1.2, delay: .2, ease: 'expo.out' });
  gsap.to('.hero-top > *', { opacity: 1, duration: 1, stagger: .12, delay: .5 });
  gsap.from('.hero-top > *', { y: -24, duration: 1, stagger: .12, delay: .5, ease: 'expo.out' });
  gsap.to($('.hero-tag')._chars, { yPercent: 0, duration: 1.2, stagger: .028, delay: .9, ease: 'expo.out' });
  gsap.to('.scroll-hint', { opacity: 1, duration: 1, delay: 1.8 });
  ScrollTrigger.refresh();
}

function setupMarquee() {
  const rows = $$('.mq-inner').map((el, i) => i % 2
    ? gsap.fromTo(el, { xPercent: -50 }, { xPercent: 0, duration: 26, ease: 'none', repeat: -1 })
    : gsap.to(el, { xPercent: -50, duration: 22, ease: 'none', repeat: -1 }));
  const skew = $$('.mq-inner').map(el => gsap.quickSetter(el, 'skewX', 'deg'));
  let ts = 1, sk = 0;
  gsap.ticker.add(() => {
    const v = lenis.velocity || 0;
    ts += (1 + Math.min(Math.abs(v) * .25, 8) - ts) * .1;
    sk += (gsap.utils.clamp(-14, 14, -v * .6) - sk) * .12;
    rows.forEach(r => r.timeScale(ts));
    skew.forEach(s => s(sk));
  });
}

/* =========================================================
   HISTORY — pinned horizontal scroll
   ========================================================= */
function setupHistory() {
  const track = $('.h-track'), panels = $$('.h-panel');
  const dist = () => track.scrollWidth - innerWidth;
  const hTween = gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: {
      trigger: '.history', pin: true, scrub: .8, end: () => '+=' + dist(), invalidateOnRefresh: true, anticipatePin: 1,
      onUpdate: s => gsap.set('.h-bar span', { scaleX: s.progress }),
    },
  });

  panels.forEach((p, i) => {
    const y = p.dataset.year;
    const head = $('h2, h3', p);
    const chars = split(head);
    if (i === 0) {
      gsap.timeline({ scrollTrigger: { trigger: '.history', start: 'top 70%', toggleActions: 'play none none reverse' } })
        .from(chars, { yPercent: 120, rotate: 6, duration: 1.1, stagger: .05, ease: 'expo.out' })
        .from($$('.fade', p), { y: 30, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out' }, '-=.7');
      zone('h0', { trigger: '.history', start: 'top 55%', end: 'top -30%' }, () => scene('galaxy', { opacity: .7 }));
      return;
    }
    gsap.timeline({ scrollTrigger: { trigger: p, containerAnimation: hTween, start: 'left 72%', toggleActions: 'play none none reverse' } })
      .from(chars, { yPercent: 120, rotate: 6, duration: .9, stagger: .025, ease: 'expo.out' })
      .from($$('.fade', p), { y: 30, opacity: 0, duration: .7, stagger: .08, ease: 'power3.out' }, '-=.65');
    zone('h' + y, { trigger: p, containerAnimation: hTween, start: 'left 50%', end: 'right 50%' },
      () => scene('y:' + y, { gold: +y >= 2025 ? 1 : 0, opacity: .95 }));
  });
}

/* =========================================================
   STATS
   ========================================================= */
function setupStats() {
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, o = { v: +(el.dataset.from || 0) };
    gsap.to(o, {
      v: end, duration: end > 100 ? 2.4 : 1.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
      onUpdate: () => { el.textContent = Math.round(o.v); },
    });
  });
  gsap.from('.stat', { y: 80, opacity: 0, rotateX: -20, duration: 1.1, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.stat-grid', start: 'top 85%' } });
  $$('.spot').forEach(el => el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));
  zone('stats', { trigger: '#chiffres', start: 'top 55%', end: 'bottom 55%' }, () => scene('galaxy', { opacity: .55 }));
}

/* =========================================================
   STARS + TABS + THIRD STAR
   ========================================================= */
let activeTab = 'two', inStars = false, threeIntroDone = false;

function burstAt(el, extra = {}) {
  const r = el.getBoundingClientRect();
  confetti({
    particleCount: 140, spread: 90, startVelocity: 48, ticks: 260, scalar: 1.15, colors: COLORS, shapes: ['star', 'circle'],
    origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight }, ...extra,
  });
}

function setupStars() {
  const cards = $$('.star-card');
  cards.forEach(card => {
    const poly = $('.star-shape', card), L = poly.getTotalLength();
    gsap.set(poly, { strokeDasharray: L, strokeDashoffset: L });
    gsap.set(card, { opacity: 0, y: 120, rotateX: -25 });
    gsap.set($$('.reveal', card), { opacity: 0, y: 30 });
  });
  ScrollTrigger.create({
    trigger: '.star-cards', start: 'top 72%', once: true,
    onEnter: () => cards.forEach((card, i) => {
      const poly = $('.star-shape', card), svg = $('.star-svg', card);
      gsap.timeline({ delay: i * .4 })
        .to(card, { opacity: 1, y: 0, rotateX: 0, duration: 1.3, ease: 'expo.out' })
        .fromTo(svg, { scale: .3, rotate: -140 }, { scale: 1, rotate: 0, duration: 1.6, ease: 'elastic.out(1,.5)' }, .1)
        .to(poly, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, .1)
        .to(poly, { fillOpacity: 1, duration: .5, ease: 'power2.out' }, 1.05)
        .add(() => burstAt(svg), 1.1)
        .to($('.rays', card), { opacity: 1, duration: 1.2 }, 1.1)
        .to($$('.reveal', card), { opacity: 1, y: 0, duration: .8, stagger: .07, ease: 'power3.out' }, .6);
    }),
  });

  if (!isTouch) $$('.tilt').forEach(card => {
    const inner = $('.tilt-inner', card);
    const rx = gsap.quickTo(inner, 'rotationX', { duration: .7, ease: 'power3' }), ry = gsap.quickTo(inner, 'rotationY', { duration: .7, ease: 'power3' });
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      ry((x - .5) * 18); rx((.5 - y) * 18);
      inner.style.setProperty('--mx', x * 100 + '%'); inner.style.setProperty('--my', y * 100 + '%');
    });
    card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    card.addEventListener('click', () => burstAt($('.star-svg', card), { particleCount: 70 }));
  });

  $$('.tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
  movePill(true);
  addEventListener('resize', () => movePill(true));

  zone('stars', { trigger: '#etoiles', start: 'top 55%', end: 'bottom 55%' },
    () => scene(activeTab === 'three' ? 'stars3' : 'stars2', { gold: 1, opacity: won && activeTab === 'three' ? .85 : .5 }));
  setupHold();
}

function movePill(instant) {
  const t = $('.tab.active');
  gsap.to('.tab-pill', { x: t.offsetLeft, y: t.offsetTop - 6, width: t.offsetWidth, height: t.offsetHeight, duration: instant ? 0 : .7, ease: 'expo.out' });
}

function switchTab(name) {
  if (name === activeTab) return;
  const out = $('#tab-' + activeTab), inn = $('#tab-' + name);
  activeTab = name;
  $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  movePill();
  if (inStars) scene(name === 'three' ? 'stars3' : 'stars2', { gold: 1, opacity: .5 });
  gsap.to(out, {
    opacity: 0, y: -30, filter: 'blur(10px)', duration: .35, ease: 'power2.in',
    onComplete: () => {
      out.classList.remove('active');
      gsap.set(out, { clearProps: 'opacity,transform,filter' });
      inn.classList.add('active');
      gsap.fromTo(inn, { opacity: 0, y: 50, filter: 'blur(12px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .9, ease: 'expo.out' });
      if (name === 'three') introThree();
      ScrollTrigger.refresh();
    },
  });
}

function introThree() {
  scramble($('#b3-1'), 'BACK', .7);
  setTimeout(() => scramble($('#b3-2'), 'TO BACK', .9), 180);
  setTimeout(() => scramble($('#b3-3'), won ? 'TO BACK ★' : 'TO BACK ?', 1.1), 380);
  gsap.fromTo('.three-stars .mini-star', { scale: 0, rotate: -180, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 1.4, stagger: .15, ease: 'elastic.out(1,.5)', delay: .3 });
  gsap.fromTo('.hold', { scale: 0 }, { scale: 1, duration: 1, ease: 'back.out(2)', delay: .7 });
  if (!threeIntroDone) {
    threeIntroDone = true;
    setTimeout(() => $$('.three-stars .mini-star:not(.ghost)').forEach(s => burstAt(s, { particleCount: 50, spread: 60 })), 900);
  }
}

let won = false;
function setupHold() {
  const btn = $('#hold'), ring = $('#hold-ring'), star = $('#star3'), stage = $('.three-stars'), label = $('#hold-label'), msg = $('#three-msg');
  const C = 2 * Math.PI * 46;
  ring.style.strokeDasharray = C; ring.style.strokeDashoffset = C;
  const charge = { v: 0 };
  let tw;
  const render = () => {
    const v = charge.v;
    ring.style.strokeDashoffset = C * (1 - v);
    gsap.set(star, { scale: 1 + v * .4, rotate: v * 220 });
    gsap.set(stage, { x: (Math.random() - .5) * v * 14, y: (Math.random() - .5) * v * 14 });
    star.style.filter = `drop-shadow(0 0 ${v * 50}px rgba(255,220,120,${v}))`;
  };
  const start = e => {
    e.preventDefault();
    if (won) { reset(); return; }
    tw?.kill();
    btn.classList.add('holding');
    msg.innerHTML = 'Encore… <b>encore…</b>';
    tw = gsap.to(charge, { v: 1, duration: 2 * (1 - charge.v) + .01, ease: 'none', onUpdate: render, onComplete: win });
  };
  const end = () => {
    if (won) return;
    btn.classList.remove('holding');
    if (charge.v > 0 && charge.v < 1) msg.textContent = 'Lâche pas ! Maintiens jusqu\'au bout.';
    tw?.kill();
    tw = gsap.to(charge, { v: 0, duration: .6, ease: 'power2.out', onUpdate: render });
  };
  function win() {
    won = true;
    btn.classList.remove('holding');
    gsap.set(stage, { x: 0, y: 0 });
    star.classList.add('won');
    star.style.filter = '';
    gsap.fromTo('.flash', { opacity: 1 }, { opacity: 0, duration: 1.1, ease: 'power2.out' });
    gsap.fromTo(star, { scale: 1.6 }, { scale: 1, rotate: 360, duration: 1.6, ease: 'elastic.out(1,.35)' });
    gsap.fromTo('.three-stage', { scale: 1.04 }, { scale: 1, duration: .8, ease: 'power3.out' });
    burstAt(star, { particleCount: 220, spread: 140, startVelocity: 60 });
    const endT = Date.now() + 1800;
    (function frame() {
      confetti({ particleCount: 7, angle: 60, spread: 65, origin: { x: 0, y: .75 }, colors: COLORS, shapes: ['star'] });
      confetti({ particleCount: 7, angle: 120, spread: 65, origin: { x: 1, y: .75 }, colors: COLORS, shapes: ['star'] });
      if (Date.now() < endT) requestAnimationFrame(frame);
    })();
    $('#b3-3').classList.add('lit');
    scramble($('#b3-3'), 'TO BACK ★', .8);
    label.textContent = 'Encore ?';
    msg.innerHTML = '<b>★★★</b> Rendez-vous en finale. Paris rêve plus grand.';
    P.pulse();
    scene('stars3', { gold: 1, opacity: .85 });
  }
  function reset() {
    won = false;
    charge.v = 0; render();
    gsap.set(stage, { x: 0, y: 0 });
    star.classList.remove('won');
    $('#b3-3').classList.remove('lit');
    scramble($('#b3-3'), 'TO BACK ?', .6);
    label.textContent = 'Maintiens';
    msg.textContent = 'Maintiens le bouton pour invoquer la 3ème étoile.';
    scene('stars3', { gold: 1, opacity: .5 });
  }
  btn.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, end));
  btn.addEventListener('contextmenu', e => e.preventDefault());
  btn.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(e); });
  btn.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') end(); });
}

/* =========================================================
   SEARCH — every road leads to Marseille
   ========================================================= */
let searchDone = false;
function setupSearch() {
  const FAKE = 'Marseille';
  const input = $('#q'), form = $('#sform'), sugg = $('#sugg'), fix = $('#sfix'), results = $('#results'), box = $('.s-box');
  const SUGG = ['marseille', 'marseille pire club', 'marseille dernier titre 2010', 'marseille ligue des champions depuis 1993', 'marseille pourquoi'];
  const ICO = '<svg viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>';
  let typed = '', shown = 0, tries = 0, busy = false;

  gsap.from('.s-logo span', { yPercent: 120, opacity: 0, rotate: 15, stagger: .04, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.s-logo', start: 'top 85%' } });
  gsap.from('.s-question, .s-box, .s-btns', { y: 40, opacity: 0, stagger: .1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.s-question', start: 'top 88%' } });

  const popFix = () => gsap.fromTo(fix, { opacity: 1, scale: 1.2 }, { scale: 1, duration: .4, ease: 'back.out(3)', onComplete: () => gsap.to(fix, { opacity: 0, scale: .6, delay: .9, duration: .3 }) });

  function renderSugg() {
    const q = input.value.toLowerCase();
    if (!q) { sugg.classList.remove('show'); return; }
    sugg.innerHTML = SUGG.map(s => `<li role="option">${ICO}<span><b>${esc(s.slice(0, q.length))}</b>${esc(s.slice(q.length))}</span></li>`).join('');
    sugg.classList.add('show');
    gsap.from(sugg.children, { opacity: 0, x: -12, stagger: .03, duration: .3, ease: 'power2.out' });
  }

  input.addEventListener('input', () => {
    const v = input.value;
    if (v.length > shown) typed += v.slice(shown);
    else typed = typed.slice(0, v.length);
    const grew = v.length > shown;
    shown = Math.min(typed.length, FAKE.length);
    input.value = FAKE.slice(0, shown);
    input.setSelectionRange(shown, shown);
    if (grew) {
      gsap.fromTo(box, { scale: .985 }, { scale: 1, duration: .35, ease: 'back.out(3)' });
      if (typed.length > FAKE.length) gsap.fromTo(box, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1,.3)' });
      if (typed.slice(0, shown).toLowerCase() !== FAKE.slice(0, shown).toLowerCase()) popFix();
    }
    renderSugg();
  });
  input.addEventListener('focus', () => requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length)));
  input.addEventListener('blur', () => setTimeout(() => sugg.classList.remove('show'), 150));
  sugg.addEventListener('pointerdown', e => { if (e.target.closest('li')) { e.preventDefault(); go(); } });
  form.addEventListener('submit', e => { e.preventDefault(); go(); });
  $('#lucky').addEventListener('click', () => go(true));

  async function go(lucky = false) {
    if (busy) return;
    busy = true;
    sugg.classList.remove('show');
    tries++;
    const real = typed.trim();
    // finish typing "Marseille" by itself
    while (input.value.length < FAKE.length) {
      input.value = FAKE.slice(0, input.value.length + 1);
      gsap.fromTo(box, { scale: .99 }, { scale: 1, duration: .2 });
      await sleep(70);
    }
    shown = FAKE.length;
    input.blur();
    results.innerHTML = '<div class="res-load"></div>';
    await gsap.fromTo('.res-load', { scaleX: 0 }, { scaleX: 1, duration: .8, ease: 'power2.inOut' });

    const fixLine = real && real.toLowerCase() !== 'marseille' && real.toLowerCase() !== 'om'
      ? `Vous avez tapé <s>${esc(real.slice(0, 40))}</s>. Nous avons corrigé : <b>Marseille</b>.`
      : lucky && !real ? 'Vous avez de la chance : <b>Marseille</b>. Comme toujours.' : 'Bonne réponse. <b>Évidemment.</b>';
    results.innerHTML = `
      <div class="res-meta">Environ 1 résultat (0,00 seconde) · Tentative n°${tries}</div>
      <div class="res-fix">${fixLine}</div>
      <article class="res-card">
        <div class="res-url">https://pire-club.fr › verdict › definitif</div>
        <h3 class="glitch" data-text="Olympique de Marseille">Olympique de Marseille</h3>
        <div class="res-badge">✔ Pire club · Vérifié par la science</div>
        <div class="res-rating"><span class="rstars"><i class="half">★</i><i>★</i><i>★</i><i>★</i><i>★</i></span><span>0,5 / 5 · 1 avis (le nôtre)</span></div>
        <ul class="res-stats">
          <li><div class="rs-l">Ligues des champions depuis 1993</div>
            <div class="bar psg"><i style="--w:100%"></i><b>Paris · 2</b></div>
            <div class="bar om"><i style="--w:0%"></i><b>Marseille · 0</b></div></li>
          <li><div class="rs-l">Titres de champion depuis 2010</div>
            <div class="bar psg"><i style="--w:100%"></i><b>Paris · 12</b></div>
            <div class="bar om"><i style="--w:0%"></i><b>Marseille · 0</b></div></li>
          <li><div class="rs-l">Étoiles gagnées cette décennie</div>
            <div class="bar psg"><i style="--w:100%"></i><b>Paris · ★★</b></div>
            <div class="bar om"><i style="--w:0%"></i><b>Marseille · —</b></div></li>
        </ul>
        <p class="res-note">Aucun autre résultat possible. Même si tu tapes Nîmes.</p>
        <div class="res-related"><span>marseille encore</span><span>marseille toujours</span><span>paris ★★</span></div>
        <button class="res-retry" data-magnetic>Essayer un autre club →</button>
      </article>`;

    const card = $('.res-card', results);
    gsap.timeline()
      .from('.res-meta, .res-fix', { y: 16, opacity: 0, stagger: .08, duration: .5 })
      .from(card, { y: 80, scale: .9, rotateX: -18, opacity: 0, duration: 1, ease: 'expo.out' }, '-=.2')
      .add(() => {
        gsap.fromTo(card, { x: -14 }, { x: 0, duration: .9, ease: 'elastic.out(1.2,.25)' });
        gsap.fromTo('#recherche', { x: 8 }, { x: 0, duration: .7, ease: 'elastic.out(1.2,.25)' });
      }, '-=.5')
      .from('.res-badge', { scale: 0, rotate: -20, duration: .6, ease: 'back.out(3)' }, '-=.4')
      .to('.bar i', { scaleX: 1, duration: 1.1, stagger: .12, ease: 'expo.out' }, '-=.2')
      .to('.rstars i:not(.half)', {
        y: 140, rotate: () => gsap.utils.random(-260, 260), opacity: 0, duration: 1.1, stagger: .12, ease: 'power2.in',
      }, '-=1')
      .from('.res-related span, .res-retry', { y: 20, opacity: 0, stagger: .06, duration: .5 }, '-=.6');

    $('.res-retry', card).addEventListener('click', () => {
      typed = ''; shown = 0; input.value = '';
      gsap.to(results, { opacity: 0, y: 20, duration: .3, onComplete: () => { results.innerHTML = ''; gsap.set(results, { clearProps: 'all' }); ScrollTrigger.refresh(); } });
      lenis.scrollTo('#recherche', { offset: 60, duration: 1 });
      setTimeout(() => input.focus(), 600);
      input.placeholder = tries > 1 ? `Tentative n°${tries + 1}… spoiler : Marseille` : 'Allez, essaie Nîmes, Lyon, n\'importe…';
    });

    searchDone = true;
    scene('t:MDR', { opacity: .5 });
    ScrollTrigger.refresh();
    busy = false;
  }

  zone('search', { trigger: '#recherche', start: 'top 55%', end: 'bottom 55%' }, () => scene(searchDone ? 't:MDR' : 't:?', { opacity: .45 }));
}

/* =========================================================
   FOOTER
   ========================================================= */
function setupFooter() {
  const big = $('.foot-big'), chars = split(big);
  gsap.from(chars, {
    yPercent: 120, rotate: 10, duration: 1.2, stagger: .035, ease: 'expo.out',
    scrollTrigger: { trigger: big, start: 'top 90%', toggleActions: 'play none none reverse' },
    onComplete: () => big.classList.add('revealed'),
    onReverseComplete: () => big.classList.remove('revealed'),
  });
  zone('foot', { trigger: '.foot', start: 'top 60%', end: 'bottom top' }, () => scene('t:PARIS', { opacity: .9 }));
}

/* =========================================================
   LOADER
   ========================================================= */
function runLoader() {
  const paths = $$('.tower path');
  paths.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  const word = split($('.loader-word'));
  const count = { v: 0 }, cEl = $('#count');
  const tl = gsap.timeline();
  tl.to(paths, { strokeDashoffset: 0, duration: 1.5, stagger: .07, ease: 'power2.inOut' }, 0)
    .to(count, { v: 100, duration: 2.2, ease: 'power3.inOut', onUpdate: () => { cEl.textContent = Math.round(count.v); } }, 0)
    .from(word, { yPercent: 120, duration: .8, stagger: .03, ease: 'expo.out' }, 1.1)
    .from('.loader-meta', { opacity: 0, y: 10, duration: .6 }, 1.3)
    .to('.tower', { scale: 1.08, duration: .3, ease: 'power2.out', yoyo: true, repeat: 1 }, 2.1)
    .to('.loader-inner', { opacity: 0, y: -50, duration: .5, ease: 'power2.in' }, 2.6)
    .to($$('.loader-panel').reverse(), { yPercent: -100, duration: 1.1, stagger: .13, ease: 'expo.inOut' }, 2.85)
    .add(heroIntro, 3.3)
    .set('.loader', { display: 'none' });
  if (reduce) tl.timeScale(4);
}

/* =========================================================
   BOOT
   ========================================================= */
setupCursor();
setupGlobal();
setupHero();
setupMarquee();
setupHistory();
setupStats();
setupStars();
setupSearch();
setupFooter();

await Promise.race([document.fonts.load('400 100px Anton'), sleep(2500)]);
runLoader();

// little easter egg for the curious
console.log('%cICI C\'EST PARIS ★★', 'font:700 28px Impact;color:#e8c25a;background:#004170;padding:10px 18px;border-left:12px solid #da291c');
console.log('%cSite conçu, codé et animé par Claude.', 'color:#aaa');
