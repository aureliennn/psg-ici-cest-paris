import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { initEggs, egg, hasEgg, toast, onEscape, tumbleSVG, CHICKEN } from './eggs.js';
import { setMarseilleCtx, setupFrise, setupExcuses, setupQuiz, setupGame } from './marseille.js';

/* =========================================================
   PSG — Ici c'est Paris
   GSAP + ScrollTrigger + Lenis + Three.js + canvas-confetti
   (+ eggs.js : 13 secrets, dont un poulet)
   ========================================================= */

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pickOne = arr => arr[(Math.random() * arr.length) | 0];
const pad = n => String(n).padStart(2, '0');
const isTouch = matchMedia('(hover: none)').matches;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLORS = ['#e8c25a', '#fff1b8', '#da291c', '#1f6fd1', '#ffffff'];
const OM = ['#8fd3ef', '#ffffff', '#3aa6dd'];
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

// modals and easter eggs can freeze the page; the loader owns it until ready
let locks = 0, autoUntil = 0;
function lockScroll(on) {
  locks = Math.max(0, locks + (on ? 1 : -1));
  if (!ready) return;
  if (locks) lenis.stop(); else lenis.start();
}

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
const restoreScene = () => pick(true);

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
    const t = e.target.closest('a,button,input,.tilt,[data-cursor],.s-sugg li,summary');
    document.body.classList.toggle('cursor-hover', !!t);
    ring.dataset.label = t?.dataset?.cursor || (t?.classList?.contains('tilt') ? 'Paris' : '');
  });
  $$('[data-magnetic]').forEach(magnetic);
}
function magnetic(el) {
  if (isTouch) return;
  const xTo = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1,.4)' }), yTo = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    xTo((e.clientX - r.left - r.width / 2) * .35); yTo((e.clientY - r.top - r.height / 2) * .35);
  });
  el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
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
    autoUntil = Date.now() + 2400;
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
  if (!locks) lenis.start();
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
    : gsap.to(el, { xPercent: -50, duration: i ? 34 : 22, ease: 'none', repeat: -1 }));
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
      () => scene('y:' + y, { gold: +y >= 2025 ? 1 : 0, opacity: y === '1993' ? .55 : .95 }));
  });
}

/* =========================================================
   STATS
   ========================================================= */
function setupStats() {
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, o = { v: +(el.dataset.from || 0) };
    gsap.to(o, {
      v: end, duration: Math.abs(end - o.v) > 100 ? 2.4 : 1.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
      onUpdate: () => { el.textContent = Math.round(o.v); },
      onComplete: () => { if (el.closest('.om-stat')) gsap.fromTo(el.closest('.stat'), { x: -8 }, { x: 0, duration: .7, ease: 'elastic.out(1.2,.25)' }); },
    });
  });
  gsap.from('.stat', { y: 80, opacity: 0, rotateX: -20, duration: 1.1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.stat-grid', start: 'top 85%' } });
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
    if (charge.v > 0 && charge.v < 1) msg.textContent = 'Lâche pas ! Maintiens jusqu\'au bout. (C\'est Marseille qui lâche en février, pas nous.)';
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
    msg.innerHTML = '<b>★★★</b> Rendez-vous en finale. Paris rêve plus grand.<span>Pendant ce temps, Marseille cherche toujours sa deuxième.</span>';
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
   LE CLASSIQUE — tale of the tape
   ========================================================= */
function setupClassique() {
  gsap.timeline({ scrollTrigger: { trigger: '.vs', start: 'top 78%' } })
    .from('.vs-psg', { xPercent: -40, opacity: 0, duration: 1.1, ease: 'expo.out' })
    .from('.vs-om', { xPercent: 40, opacity: 0, duration: 1.1, ease: 'expo.out' }, 0)
    .from('.vs-mid span', { scale: 0, rotate: -200, duration: 1, ease: 'back.out(2)' }, .35)
    .add(() => gsap.fromTo('.vs', { x: -8 }, { x: 0, duration: .7, ease: 'elastic.out(1.2,.2)' }), .55)
    .fromTo('.vs-crack path', { strokeDashoffset: 400 }, { strokeDashoffset: 0, duration: .6, ease: 'power2.in' }, .7)
    .to('.vs-om', { rotate: 2.2, y: 14, transformOrigin: '0% 100%', duration: 1.3, ease: 'bounce.out' }, 1.1);

  $$('.tape li').forEach(li => {
    const l = +li.dataset.l, r = +li.dataset.r, mx = Math.max(l, r) || 1;
    const fl = li.dataset.fl ? +li.dataset.fl : l / mx, fr = li.dataset.fr ? +li.dataset.fr : r / mx;
    const [bl, br] = $$('.tp-bars i', li), vl = $('.tp-v.l', li), vr = $('.tp-v.r', li);
    const year = l > 1000, o = { l: year ? l - 40 : 0, r: year ? r - 40 : 0 };
    vl.textContent = o.l; vr.textContent = o.r;
    gsap.timeline({ scrollTrigger: { trigger: li, start: 'top 88%' } })
      .from(li, { y: 40, opacity: 0, duration: .8, ease: 'expo.out' })
      .to(bl, { scaleX: fl, duration: 1.3, ease: 'expo.out' }, .1)
      .to(br, { scaleX: Math.max(fr, .012), duration: 1.3, ease: 'expo.out' }, .1)
      .to(o, { l, r, duration: 1.3, ease: 'power3.out', onUpdate: () => { vl.textContent = Math.round(o.l); vr.textContent = Math.round(o.r); } }, .1)
      .fromTo(vr, { rotate: 0 }, { rotate: -6, y: 6, duration: .8, ease: 'bounce.out' }, 1.1);
  });

  gsap.from('.match', { y: 60, opacity: 0, rotateX: -16, stagger: .09, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.m-row', start: 'top 85%' } });
  gsap.from('.museum-cta > *', { y: 30, opacity: 0, stagger: .1, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: '.museum-cta', start: 'top 90%' } });

  $('.vs-om').addEventListener('click', () => {
    toast(pickOne([
      'Clique autant que tu veux : le palmarès ne bougera pas.',
      'Le côté marseillais est en maintenance depuis 2012.',
      'Tu as cliqué sur Marseille. Il ne s\'est rien passé. Comme depuis 2012.',
    ]));
    gsap.fromTo('.vs-om', { x: -10 }, { x: 0, duration: .6, ease: 'elastic.out(1.2,.25)' });
  });
  $('.vs-psg').addEventListener('click', e => {
    const r = e.currentTarget.getBoundingClientRect();
    confetti({ particleCount: 60, spread: 70, origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight }, colors: COLORS, shapes: ['star'] });
  });

  zone('classique', { trigger: '#classique', start: 'top 55%', end: 'bottom 55%' }, () => scene('t:5–0', { opacity: .42 }));
}

/* =========================================================
   LE COMPTEUR — live time since Marseille's last trophy
   ========================================================= */
function elapsed(from, now) {
  let y = now.getFullYear() - from.getFullYear(), mo = now.getMonth() - from.getMonth(), d = now.getDate() - from.getDate();
  let h = now.getHours() - from.getHours(), mi = now.getMinutes() - from.getMinutes(), s = now.getSeconds() - from.getSeconds();
  if (s < 0) { s += 60; mi--; }
  if (mi < 0) { mi += 60; h--; }
  if (h < 0) { h += 24; d--; }
  if (d < 0) { d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); mo--; }
  if (mo < 0) { mo += 12; y--; }
  return { y, mo, d, h, mi, s };
}
function setupCompteur() {
  const main = $('.cp-main'), from = new Date(main.dataset.since);
  const U = k => $(`[data-u="${k}"]`, main);
  const cards = $$('.cp-card').map(c => ({ c, from: new Date(c.dataset.since), ymd: $('[data-u="ymd"]', c), days: $('[data-u="days"]', c) }));
  const fmt = new Intl.NumberFormat('fr-FR');
  let lastS = -1;
  function tick() {
    const now = new Date(), e = elapsed(from, now);
    U('y').textContent = e.y; U('m').textContent = e.mo; U('d').textContent = e.d;
    U('h').textContent = pad(e.h); U('mi').textContent = pad(e.mi); U('s').textContent = pad(e.s);
    U('total').textContent = fmt.format(Math.floor((now - from) / 1000));
    if (e.s !== lastS && lastS !== -1 && !reduce) gsap.fromTo(U('s'), { y: -8, opacity: .4 }, { y: 0, opacity: 1, duration: .35, ease: 'back.out(3)' });
    lastS = e.s;
    cards.forEach(k => {
      const x = elapsed(k.from, now);
      if (k.ymd) k.ymd.textContent = `${x.y} ans · ${x.mo} mois · ${x.d} j`;
      if (k.days) k.days.textContent = `il y a ${fmt.format(Math.floor((now - k.from) / 864e5))} jours`;
    });
  }
  tick();
  setInterval(tick, 1000);

  gsap.from('.cp-main', { y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.cp-main', start: 'top 85%' } });
  gsap.from('.cp-card', { y: 70, opacity: 0, stagger: .1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.cp-grid', start: 'top 88%' } });

  // "loading the next Marseille trophy…" — it never gets there
  const bar = $('#cpl-bar'), pc = $('#cpl-pc'), st = $('#cpl-st');
  const UPS = ['Recherche d\'un nouveau projet…', 'Recrutement de 14 joueurs…', 'Nomination d\'un nouvel entraîneur…', 'Victoire en match amical…', 'Le Vélodrome y croit…', 'Champion d\'automne (provisoire)…', 'Analyse du calendrier…', 'Conférence de presse très ambitieuse…'];
  const FAILS = ['Février détecté. Annulation.', 'Élimination en Coupe. Réinitialisation…', 'Classique perdu. Retour à zéro.', 'Erreur 1993 : trophée introuvable.', 'Changement d\'entraîneur. Tout est à refaire.'];
  let p = 0, limit = 6, active = false, timer = 0;
  const show = v => { gsap.to(bar, { scaleX: v / 100, duration: .6, ease: 'power2.out' }); pc.textContent = v.toFixed(1).replace('.', ',') + ' %'; };
  function step() {
    if (!active) return;
    if (p < limit) {
      p = Math.min(limit, p + .4 + Math.random() * 1.4);
      st.textContent = pickOne(UPS); st.classList.remove('fail');
      show(p);
      timer = setTimeout(step, 750 + Math.random() * 650);
    } else {
      st.textContent = pickOne(FAILS); st.classList.add('fail');
      gsap.fromTo('.cp-load', { x: -8 }, { x: 0, duration: .6, ease: 'elastic.out(1.2,.25)' });
      p = 0; limit = 3 + Math.random() * 9;
      show(0);
      timer = setTimeout(step, 2000);
    }
  }
  ScrollTrigger.create({
    trigger: '.cp-load', start: 'top bottom', end: 'bottom top',
    onToggle: s => { active = s.isActive; clearTimeout(timer); if (active) timer = setTimeout(step, 500); },
  });

  zone('compteur', { trigger: '#compteur', start: 'top 55%', end: 'bottom 55%' }, () => scene('t:2012', { opacity: .3 }));
}

/* =========================================================
   LE SIMULATEUR — simulate Marseille's season
   ========================================================= */
const MONTHS = [
  ['Août', [
    ['Présentation d\'un nouveau projet ambitieux. Le sixième en cinq ans.', 15],
    ['14 recrues, 13 départs. Le kiné demande un organigramme.', 10],
    ['Victoire 6–0 en amical. Le Vieux-Port imprime déjà les t-shirts « Champions 2027 ».', 18],
    ['« Cette année, c\'est la bonne. » — Tout Marseille, comme chaque été depuis 1993.', 12],
  ]],
  ['Septembre', [
    ['Classique perdu. Explication officielle : la pelouse, l\'arbitre et le mistral.', -12],
    ['Trois victoires de suite. On parle déjà de doublé.', 16],
    ['Leader après 5 journées. Paris a deux matchs en retard. Personne n\'en parle.', 14],
  ]],
  ['Octobre', [
    ['Défaite en Europe. « On se concentre sur le championnat. »', -8],
    ['Six matchs sans défaite. Le Vélodrome chante déjà la Coupe d\'Europe.', 14],
    ['Conférence de presse de 47 minutes. Personne n\'a compris, tout le monde a applaudi.', 4],
  ]],
  ['Novembre', [
    ['Champion d\'automne… de la première quinzaine de novembre.', 8],
    ['Réunion de crise. Puis réunion sur la réunion de crise.', -14],
    ['Le président promet un recrutement XXL en janvier.', 6],
  ]],
  ['Décembre', [
    ['Changement d\'entraîneur. Le nouveau a « un vrai projet de jeu ».', -6, 1],
    ['Élimination européenne. « Ce n\'était pas l\'objectif. »', -10],
    ['Victoire au bout du temps additionnel. Le Vélodrome parle de destin.', 12],
  ]],
  ['Janvier', [
    ['Coupe de France : éliminés par l\'US Saint-Glinglin (R1). Prochain trophée prévu à la même date.', -14],
    ['Mercato d\'hiver : quatre latéraux droits recrutés. Toujours aucun gardien.', 5],
    ['Trophée des champions perdu contre Paris. Même délocalisé à l\'autre bout du monde.', -10],
  ]],
  ['Février', [
    ['Février arrive. Comme chaque année. Personne ne l\'avait vu venir.', -20],
    ['Cinq matchs sans victoire. « C\'est juste un petit passage à vide. »', -18],
    ['Défaite au Parc. 5–0. Par nostalgie.', -22],
  ]],
  ['Mars', [
    ['Changement d\'entraîneur (bis). L\'adjoint de l\'adjoint assure l\'intérim.', -8, 1],
    ['L\'objectif officiel passe de « titre » à « podium ».', -10],
    ['Victoire 1–0 contre la lanterne rouge. Le Vélodrome y croit à nouveau.', 10],
  ]],
  ['Avril', [
    ['Course à la 3e place avec Lens, Lille, Monaco… et le doute.', -6],
    ['L\'objectif officiel passe de « podium » à « Europe ».', -10],
    ['Le Vélodrome siffle. Puis chante. Puis siffle.', -4],
  ]],
];
const RANK_TXT = r => r === 2 ? '2e. « On a fait trembler Paris. » Paris n\'a rien senti.'
  : r === 3 ? '3e. « Une saison pleine. » Pleine de quoi, on cherche encore.'
  : r === 4 ? '4e. « Il faut construire. » Ça fait depuis 1993 qu\'on construit.'
  : `${r}e. « Saison de transition. » La quatorzième de suite.`;

function setupSimu() {
  const btn = $('#simu-go'), list = $('#simu-list'), stamp = $('#simu-stamp'), hopeEl = $('#hope'), hopeV = $('#hope-v');
  const N = $('#ss-n'), C = $('#ss-c');
  let seasons = 0, coaches = 0, hope = 50, busy = false;
  const setHope = () => { hopeEl.style.width = hope + '%'; hopeV.textContent = Math.round(hope) + ' %'; };
  const bump = el => gsap.fromTo(el, { scale: 1.35 }, { scale: 1, duration: .6, ease: 'back.out(3)' });
  const line = (mo, ev, cls) => {
    const li = document.createElement('li');
    li.className = cls;
    li.innerHTML = `<span class="mo">${mo}</span><span class="ev">${ev}</span>`;
    list.append(li);
    gsap.from(li, { x: 40, opacity: 0, duration: .5, ease: 'expo.out' });
    return li;
  };
  const rankRoll = () => { const x = Math.random(); return x < .2 ? 2 : x < .45 ? 3 : x < .7 ? 4 : x < .85 ? 5 : 6 + ((Math.random() * 4) | 0); };
  const stampShow = (txt, dream) => {
    stamp.textContent = txt;
    stamp.classList.toggle('dream', !!dream);
    gsap.fromTo(stamp, { scale: 2.4, opacity: 0, rotate: -30 }, { scale: 1, opacity: 1, rotate: -12, duration: .45, ease: 'power4.in' });
    gsap.fromTo('.simu-feed', { x: -6 }, { x: 0, duration: .6, ease: 'elastic.out(1.3,.2)', delay: .45 });
  };

  btn.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    btn.disabled = true;
    seasons++;
    list.innerHTML = '';
    gsap.set(stamp, { opacity: 0 });
    hope = 50; setHope();
    const wait = reduce ? 80 : 560;
    for (const [mo, evs] of MONTHS) {
      const [t, h, coach] = pickOne(evs);
      hope = Math.max(2, Math.min(100, hope + h + (Math.random() * 6 - 3)));
      if (coach) { coaches++; C.textContent = coaches; bump(C); }
      line(mo, t, h >= 0 ? 'up' : 'down');
      setHope();
      await sleep(wait);
    }
    const rank = rankRoll();
    if (!hasEgg('reve') && (Math.random() < .05 || seasons === 6)) {
      line('Mai', '<b>CHAMPIONS DE FRANCE !!!</b> Le Vieux-Port explose. Klaxons jusqu\'à Aubagne.', 'end');
      hope = 100; setHope();
      stampShow('Champions !', true);
      const r = stamp.getBoundingClientRect();
      confetti({ particleCount: 160, spread: 100, startVelocity: 45, colors: OM, origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight } });
      await sleep(2600);
      line('7h12', '…Le réveil sonne. C\'était un rêve. Retour à la réalité : ' + RANK_TXT(rank), 'down');
      hope = 6; setHope();
      egg('reve');
    } else {
      line('Mai', RANK_TXT(rank), 'end');
    }
    await sleep(wait);
    line('Bilan', '0 trophée. Les t-shirts « Champions 2027 » finissent en pyjamas.', 'end');
    stampShow('0 trophée');
    N.textContent = seasons; bump(N);
    if (!coaches) { coaches = 1; C.textContent = 1; bump(C); }
    if (seasons === 10) toast('10 saisons simulées. Toujours 0 trophée. Statistiquement, c\'est presque un exploit.');
    if (seasons === 25) toast('25 saisons. Tu y crois plus que leur direction. Respect.');
    btn.textContent = 'Relancer (ça ne changera rien) ↻';
    btn.disabled = false;
    busy = false;
  });

  gsap.from('.simu-side > *', { y: 40, opacity: 0, stagger: .08, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: '.simu-wrap', start: 'top 80%' } });
  gsap.from('.simu-feed', { y: 80, opacity: 0, rotateX: -10, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.simu-wrap', start: 'top 80%' } });

  zone('simu', { trigger: '#simulateur', start: 'top 55%', end: 'bottom 55%' }, () => scene('t:0', { opacity: .35 }));
}

/* =========================================================
   LE MUSÉE DE L'OM (modal)
   ========================================================= */
function webPath() {
  const R = [24, 50, 80, 112], A = [6, 20, 36, 52, 68, 84].map(a => a * Math.PI / 180);
  let d = A.map(a => `M0 0L${(Math.cos(a) * 140).toFixed(1)} ${(Math.sin(a) * 140).toFixed(1)}`).join('');
  R.forEach(r => {
    for (let i = 0; i < A.length - 1; i++) {
      const a = A[i], b = A[i + 1], m = (a + b) / 2, rr = r * .86;
      d += `M${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)}Q${(Math.cos(m) * rr).toFixed(1)} ${(Math.sin(m) * rr).toFixed(1)} ${(Math.cos(b) * r).toFixed(1)} ${(Math.sin(b) * r).toFixed(1)}`;
    }
  });
  return d;
}
function setupMuseum() {
  const m = $('#museum'), room = $('.mu-room', m), cup = $('.mu-cup', m);
  $$('.mu-web path', m).forEach(p => p.setAttribute('d', webPath()));
  $('.mu-tumble', m).innerHTML = tumbleSVG();
  $('.mu-dust', m).innerHTML = Array.from({ length: 28 }, () =>
    `<span style="left:${(Math.random() * 100).toFixed(1)}%;top:${(20 + Math.random() * 75).toFixed(1)}%;--d:${(6 + Math.random() * 8).toFixed(1)}s;--dl:-${(Math.random() * 10).toFixed(1)}s"></span>`).join('');

  let offEsc = null, dust = 1, wipes = 0, opener = null;
  const open = e => {
    opener = e?.currentTarget || null;
    m.hidden = false;
    lockScroll(true);
    offEsc = onEscape(close);
    gsap.fromTo(m, { opacity: 0 }, { opacity: 1, duration: .4 });
    gsap.fromTo(room, { y: 60, scale: .94, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: .8, ease: 'expo.out' });
    gsap.from($$('.mu-case', m), { y: 50, opacity: 0, stagger: .08, duration: .8, ease: 'expo.out', delay: .15 });
    $('.mu-x', m).focus({ preventScroll: true });
  };
  const close = () => {
    offEsc?.(); offEsc = null;
    gsap.to(m, { opacity: 0, duration: .3, onComplete: () => { m.hidden = true; } });
    lockScroll(false);
    opener?.focus({ preventScroll: true });
  };
  $$('[data-open="museum"]').forEach(b => b.addEventListener('click', open));
  $('.mu-x', m).addEventListener('click', close);
  m.addEventListener('click', e => { if (e.target === m) close(); });

  cup.addEventListener('click', () => {
    const r = cup.getBoundingClientRect();
    if (dust <= 0) {
      confetti({ particleCount: 50, spread: 80, origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 3) / innerHeight }, colors: ['#ffffff', '#dfe4ea', '#e8c25a'], shapes: ['star'] });
      toast('Elle brille. Profites-en : la prochaine n\'arrive pas demain.');
      return;
    }
    wipes++;
    dust = Math.max(0, 1 - wipes / 5);
    cup.style.setProperty('--dust', dust);
    confetti({ particleCount: 36, spread: 100, startVelocity: 18, gravity: .35, ticks: 220, scalar: .7, colors: ['#8b7d66', '#a89a80', '#6e6352'], origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 3) / innerHeight } });
    gsap.fromTo(cup, { rotate: -4 }, { rotate: 0, duration: .5, ease: 'elastic.out(1.4,.3)' });
    if (wipes === 1) toast('Pfiou… 33 ans de poussière. Continue.');
    if (dust === 0) {
      cup.classList.add('clean');
      toast('Brillante comme au 26 mai 1993. Dernière fois qu\'on l\'a vue comme ça.', { dur: 6000 });
      egg('poussiere');
    }
  });
}

/* =========================================================
   SEARCH — every road leads to Marseille
   ========================================================= */
let searchDone = false;
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
function verdict(real, lucky) {
  const n = norm(real), s = esc(real.slice(0, 40));
  const M = '<b>Marseille</b>';
  if (!n) return lucky ? `Vous avez de la chance : ${M}. Comme toujours.` : `Recherche vide ? On a deviné quand même : ${M}.`;
  if (/^(om|l om|marseille|olympique de marseille|olympique marseille)$/.test(n)) return 'Bonne réponse. <b>Évidemment.</b>';
  if (/^(psg|paris|paris sg|paris saint germain|ici c est paris)$/.test(n)) return `Vous avez tapé <s>${s}</s>. On ne cherche pas le pire club en tapant le meilleur. Corrigé : ${M}.`;
  if (/^(nimes|nimes olympique|crocos|les crocos)$/.test(n)) return `<s>${s}</s> ? Respect aux Crocos 🐊. Mais non : ${M}.`;
  if (/^(lyon|ol|olympique lyonnais)$/.test(n)) return `<s>${s}</s>… bien tenté. Mais la question, c'est <i>le</i> pire. Corrigé : ${M}.`;
  if (/^(arsenal)$/.test(n)) return `<s>${s}</s> ? On les a déjà battus en finale, ils ont assez donné. Corrigé : ${M}.`;
  if (/^(inter|inter milan|internazionale)$/.test(n)) return `<s>${s}</s> ? 5–0 en finale, ils ont assez souffert. Corrigé : ${M}.`;
  if (/^(real|real madrid|barca|barcelone|fc barcelone|bayern|liverpool|city|manchester city|chelsea)$/.test(n)) return `<s>${s}</s> ? Eux au moins ont gagné quelque chose cette décennie. Corrigé : ${M}.`;
  if (/^(lens|rc lens)$/.test(n)) return `<s>${s}</s> ? Ils ont gagné une Coupe de France en 2026, eux. Corrigé : ${M}.`;
  return `Vous avez tapé <s>${s}</s>. Nous avons corrigé : ${M}.`;
}
const META = ['', '', ' · Le moteur commence à soupirer', ' · Toujours la même réponse', ' · Tu sais que ça ne changera pas ?'];
const PAA = [
  ['L\'OM a-t-il gagné quelque chose depuis 2012 ?', 'Non. Le dernier trophée est une Coupe de la Ligue, le 14 avril 2012. La compétition a été supprimée depuis. Son tout dernier vainqueur, en 2020 ? Paris.'],
  ['Le titre de 1993 compte-t-il ?', 'Retiré par la Fédération après l\'affaire VA-OM. Proposé à Paris, deuxième. Refusé. Le titre est resté vacant — comme la vitrine depuis.'],
  ['Pourquoi l\'OM s\'effondre en février ?', 'Les scientifiques étudient encore le phénomène. Hypothèse principale : février existe.'],
  ['C\'est quoi « À jamais les premiers » ?', 'Une devise de 1993. Depuis, Paris a gagné deux Ligues des champions. Mise à jour suggérée : « À jamais les premiers… et puis c\'est tout ».'],
  ['Quand l\'OM a-t-il gagné sa dernière Coupe de France ?', 'Le 10 juin 1989. Au Parc des Princes. Chez nous. On leur avait prêté le stade ; la chance, ils ne l\'ont jamais retrouvée.'],
];
function setupSearch() {
  const FAKE = 'Marseille';
  const input = $('#q'), form = $('#sform'), sugg = $('#sugg'), fix = $('#sfix'), results = $('#results'), box = $('.s-box');
  const SUGG = ['marseille', 'marseille pire club', 'marseille dernier titre 2010', 'marseille ligue des champions depuis 1993', 'marseille février pourquoi', 'marseille trophée 2012 compétition supprimée'];
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

    const meta = tries >= META.length ? ' · Respect pour la persévérance. L\'OM aussi persévère, depuis 2012.' : META[tries - 1] || '';
    results.innerHTML = `
      <div class="res-meta">Environ 1 résultat (0,00 seconde) · Tentative n°${tries}${meta}</div>
      <div class="res-fix">${verdict(real, lucky)}</div>
      <article class="res-card">
        <div class="res-url">https://pire-club.fr › verdict › definitif</div>
        <h3 class="glitch" data-text="Olympique de Marseille">Olympique de Marseille</h3>
        <div class="res-badge">✔ Pire club · Vérifié par la science</div>
        <div class="res-rating"><span class="rstars"><i class="half">★</i><i>★</i><i>★</i><i>★</i><i>★</i></span><span>0,5 / 5 · 1 avis (le nôtre)</span></div>
        <ul class="res-stats">
          <li><div class="rs-l">Ligues des champions depuis 1993</div>
            <div class="bar psg"><i style="--w:100%"></i><b>Paris · 2</b></div>
            <div class="bar om"><i style="--w:0%"></i><b>Marseille · 0</b></div></li>
          <li><div class="rs-l">Titres de champion depuis 2011</div>
            <div class="bar psg"><i style="--w:100%"></i><b>Paris · 12</b></div>
            <div class="bar om"><i style="--w:0%"></i><b>Marseille · 0</b></div></li>
          <li><div class="rs-l">Trophées depuis le 14.04.2012</div>
            <div class="bar psg"><i style="--w:100%"></i><b>Paris · plus de 30</b></div>
            <div class="bar om"><i style="--w:0%"></i><b>Marseille · 0</b></div></li>
          <li><div class="rs-l">Étoiles gagnées cette décennie</div>
            <div class="bar psg"><i style="--w:100%"></i><b>Paris · ★★</b></div>
            <div class="bar om"><i style="--w:0%"></i><b>Marseille · —</b></div></li>
        </ul>
        <p class="res-note">Aucun autre résultat possible. Même si tu tapes Nîmes.</p>
        <div class="paa">
          <h4>Autres questions posées</h4>
          ${PAA.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}
        </div>
        <div class="res-related"><span>marseille encore</span><span>marseille toujours</span><span>marseille 2012</span><span>paris ★★</span></div>
        <button class="res-retry" data-magnetic>Essayer un autre club →</button>
      </article>`;

    const card = $('.res-card', results);
    magnetic($('.res-retry', card));
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
      .from('.paa details, .res-related span, .res-retry', { y: 20, opacity: 0, stagger: .05, duration: .5 }, '-=.6');

    $$('details', card).forEach(d => d.addEventListener('toggle', () => { if (d.open) { gsap.from($('p', d), { y: -8, opacity: 0, duration: .4, ease: 'power2.out' }); ScrollTrigger.refresh(); } }));
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
  gsap.from('.foot-om > *', { y: 24, opacity: 0, stagger: .1, duration: .8, ease: 'expo.out', scrollTrigger: { trigger: '.foot-om', start: 'top 92%' } });
  zone('foot', { trigger: '.foot', start: 'top 60%', end: 'bottom top' }, () => scene('t:PARIS', { opacity: .9 }));
}

/* =========================================================
   LOADER
   ========================================================= */
const QUIPS = [
  [0, 'Chargement des étoiles…'],
  [20, 'Polissage de la deuxième étoile…'],
  [42, 'Recherche du dernier trophée de l\'OM… introuvable'],
  [64, 'Réservation des places pour la finale 2027…'],
  [86, 'Rétrogradation de Marseille… déjà faite en 1994'],
  [98, 'Ici c\'est Paris.'],
];
function runLoader() {
  const paths = $$('.tower path');
  paths.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  const word = split($('.loader-word'));
  const count = { v: 0 }, cEl = $('#count'), qEl = $('#quip');
  let q = -1;
  const tl = gsap.timeline();
  tl.to(paths, { strokeDashoffset: 0, duration: 1.5, stagger: .07, ease: 'power2.inOut' }, 0)
    .to(count, {
      v: 100, duration: 2.2, ease: 'power3.inOut',
      onUpdate: () => {
        cEl.textContent = Math.round(count.v);
        let i = 0;
        QUIPS.forEach(([at], k) => { if (count.v >= at) i = k; });
        if (i !== q) { q = i; qEl.textContent = QUIPS[i][1]; gsap.fromTo(qEl, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .25 }); }
      },
    }, 0)
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
setMarseilleCtx({ gsap, ScrollTrigger, zone, scene, toast, egg, confetti, reduce, isTouch, CHICKEN, tumbleSVG });
setupClassique();
setupFrise();
setupCompteur();
setupExcuses();
setupSimu();
setupQuiz();
setupGame();
setupMuseum();
setupSearch();
setupFooter();
initEggs({ P, scene, restore: restoreScene, lockScroll, isReady: () => ready, isAutoScroll: () => Date.now() < autoUntil, COLORS });

await Promise.race([document.fonts.load('400 100px Anton'), sleep(2500)]);
runLoader();

// little easter egg for the curious
console.log('%cICI C\'EST PARIS ★★', 'font:700 28px Impact;color:#e8c25a;background:#004170;padding:10px 18px;border-left:12px solid #da291c');
console.log('%cSite conçu, codé et animé par Claude.', 'color:#aaa');
console.log('%cPsst. Tape palmaresOM() ici. Ou palmaresPSG(), si tu préfères les longues listes.', 'color:#8fd3ef;font:500 13px monospace');
