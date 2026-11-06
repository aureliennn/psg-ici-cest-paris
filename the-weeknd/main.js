import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { RELEASES, KIND, VINYL, TOURS, RECORDS, QUIZ } from './data.js';
import { initEggs, egg, toast, onEscape } from './eggs.js';

/* =========================================================
   THE WEEKND — la carrière
   GSAP + ScrollTrigger + Lenis + Three.js + canvas-confetti
   ========================================================= */

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const nf = (n, d = 0) => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
const dateFr = iso => new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const isTouch = matchMedia('(hover: none)').matches;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const RED = '#ff1f3d';
const COLORS = ['#ff1f3d', '#ff6a7c', '#ffffff', '#f4efe9'];
const confetti = o => window.confetti && window.confetti({ disableForReducedMotion: true, ...o });

document.documentElement.classList.add(isTouch ? 'touch' : 'mouse');
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

/* ---------- smooth scroll ---------- */
const lenis = new Lenis({ lerp: reduce ? 1 : 0.085, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();
let ready = false, locks = 0, autoUntil = 0;
function lockScroll(on) {
  locks = Math.max(0, locks + (on ? 1 : -1));
  if (!ready) return;
  if (locks) lenis.stop(); else lenis.start();
}

/* ---------- split text ---------- */
function split(el) {
  if (el._chars) return el._chars;
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.textContent = '';
  text.split(' ').forEach((word, i, arr) => {
    const w = document.createElement('span');
    w.className = 'w';
    w.setAttribute('aria-hidden', 'true');
    [...word].forEach(ch => { const c = document.createElement('span'); c.className = 'c'; c.textContent = ch; w.appendChild(c); });
    el.appendChild(w);
    if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
  });
  el._chars = $$('.c', el);
  return el._chars;
}

/* =========================================================
   PARTICLES — 10k points tinted by era
   ========================================================= */
const VS = /* glsl */`
attribute vec3 aFrom; attribute vec3 aTo; attribute float aRand;
uniform float uProgress, uTime, uSize, uPR, uOpacity;
uniform vec3 uTint; uniform vec2 uMouse;
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
  vec3 col = mix(uTint * .75, uTint, aRand);
  if (aRand > .93) col = mix(uTint, vec3(1.), .8);
  vColor = col;
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
      uOpacity: { value: 1 }, uTint: { value: new THREE.Color(RED) },
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
      ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      draw(ctx, W, H);
      const d = ctx.getImageData(0, 0, W, H).data, pts = [], step = 2;
      let x0 = W, x1 = 0, y0 = H, y1 = 0;
      for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
        if (d[(y * W + x) * 4 + 3] > 128) { pts.push(x, y); if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      }
      const out = new Float32Array(N * 3), n = pts.length / 2;
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
      let size = H * .78;
      ctx.font = `800 ${size}px Syne`;
      const m = ctx.measureText(str).width;
      if (m > W * .94) { size *= W * .94 / m; ctx.font = `800 ${size}px Syne`; }
      ctx.fillText(str, W / 2, H / 2 + size * .04);
    }, o);
    const disc = () => fromCanvas((ctx, W, H) => {
      const R = H * .46;
      ctx.lineWidth = 3;
      for (let r = R * .38; r < R; r += 9) { ctx.beginPath(); ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(W / 2, H / 2, R * .3, 0, Math.PI * 2); ctx.fill();
    }, { fw: .7, fh: .62 });
    const xo = () => fromCanvas((ctx, W, H) => {
      ctx.lineWidth = 70; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(260, 120); ctx.lineTo(520, 480); ctx.moveTo(520, 120); ctx.lineTo(260, 480); ctx.stroke();
      ctx.beginPath(); ctx.arc(820, 300, 170, 0, Math.PI * 2); ctx.stroke();
    }, { fw: .7, fh: .5 });
    const star = () => fromCanvas((ctx, W, H) => {
      ctx.beginPath();
      for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? H * .19 : H * .46; ctx.lineTo(W / 2 + Math.cos(a) * rr, H / 2 + Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill();
    }, { fw: .6, fh: .6 });
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
      const s = key === 'galaxy' ? galaxy() : key === 'disc' ? disc() : key === 'xo' ? xo() : key === 'star' ? star()
        : key.startsWith('y:') ? text(key.slice(2), { fw: .72, fh: .42, oy: .15 }) : text(key.slice(2), { fw: .82, fh: .46 });
      cache.set(key, s);
      return s;
    }
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
    const tint = new THREE.Color();
    function morph(k, { tint: c = RED, opacity = 1, dur = 2.4, force = false } = {}) {
      tint.set(c);
      gsap.to(U.uTint.value, { r: tint.r, g: tint.g, b: tint.b, duration: 1.4, ease: 'power2.out', overwrite: true });
      gsap.to(U.uOpacity, { value: opacity, duration: 1.2, ease: 'power2.out', overwrite: true });
      if (k === key && !force) return;
      key = k;
      from.set(current()); aFrom.needsUpdate = true;
      to.set(shape(k)); aTo.needsUpdate = true;
      gsap.killTweensOf(U.uProgress);
      U.uProgress.value = 0;
      gsap.to(U.uProgress, { value: 1, duration: reduce ? .01 : dur, ease: 'none' });
    }
    function pulse() { gsap.fromTo(points.scale, { x: 1.25, y: 1.25, z: 1.25 }, { x: 1, y: 1, z: 1, duration: 1.6, ease: 'elastic.out(1,.35)' }); }
    let spin = 0;
    function setSpin(v) { spin = v; }
    const m = { nx: 0, ny: 0, active: false };
    addEventListener('pointermove', e => { m.nx = (e.clientX / innerWidth) * 2 - 1; m.ny = -(e.clientY / innerHeight) * 2 + 1; m.active = e.pointerType === 'mouse'; }, { passive: true });
    document.addEventListener('pointerleave', () => { m.active = false; });
    gsap.ticker.add((time, dt) => {
      U.uTime.value = time;
      const v = view();
      const tx = m.active ? m.nx * v.w / 2 : 99, ty = m.active ? m.ny * v.h / 2 : 99, mu = U.uMouse.value;
      if (Math.abs(tx - mu.x) > 20) mu.set(tx, ty); else { mu.x += (tx - mu.x) * .12; mu.y += (ty - mu.y) * .12; }
      points.rotation.y += ((Math.sin(time * .25) * .1 + m.nx * .12) - points.rotation.y) * .05;
      points.rotation.x += ((-m.ny * .07) - points.rotation.x) * .05;
      points.rotation.z = spin ? points.rotation.z - spin * dt / 1000 : points.rotation.z * .95;
      renderer.render(scene, camera);
    });
    let lastW = innerWidth, rt;
    addEventListener('resize', () => {
      clearTimeout(rt);
      rt = setTimeout(() => {
        if (!innerWidth || !innerHeight) return;
        renderer.setSize(innerWidth, innerHeight, false);
        camera.aspect = aspect(); camera.updateProjectionMatrix();
        if (Math.abs(innerWidth - lastW) > 40) { lastW = innerWidth; cache.clear(); morph(key, { force: true, dur: 1.2, tint: '#' + tint.getHexString(), opacity: U.uOpacity.value }); }
      }, 200);
    });
    return { morph, pulse, setSpin };
  } catch (err) {
    console.warn('WebGL indisponible', err);
    return { morph() {}, pulse() {}, setSpin() {} };
  }
}
const P = createParticles();
function scene(k, o) { if (ready) P.morph(k, o); }

/* scene zones: last active zone in DOM order wins */
const zones = [];
let curZone = null, pickQueued = false;
function zone(name, opts, fn) { const z = { name, fn }; z.st = ScrollTrigger.create({ ...opts, onToggle: queuePick }); zones.push(z); }
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
  P.setSpin(z.name === 'vinyl' && spinning ? 1.2 : 0);
  z.fn();
}
const restoreScene = () => pick(true);

/* =========================================================
   CURSOR + MAGNETIC
   ========================================================= */
function magnetic(el) {
  if (isTouch) return;
  const xTo = gsap.quickTo(el, 'x', { duration: .6, ease: 'elastic.out(1,.4)' }), yTo = gsap.quickTo(el, 'y', { duration: .6, ease: 'elastic.out(1,.4)' });
  el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * .35); yTo((e.clientY - r.top - r.height / 2) * .35); });
  el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
}
function setupCursor() {
  if (isTouch) return;
  const dot = $('.cursor-dot'), ring = $('.cursor-ring');
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50, x: innerWidth / 2, y: innerHeight / 2 });
  const dx = gsap.quickTo(dot, 'x', { duration: .08 }), dy = gsap.quickTo(dot, 'y', { duration: .08 });
  const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
  addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
  document.addEventListener('pointerover', e => {
    const t = e.target.closest('a,button,input,[data-cursor],.dc,.sl,.fw-col');
    document.body.classList.toggle('cursor-hover', !!t);
    ring.dataset.label = t?.dataset?.cursor || (t?.classList?.contains('dc') ? 'Retourner' : '');
  });
  $$('[data-magnetic]').forEach(magnetic);
}

/* =========================================================
   GLOBAL / HERO / MARQUEE
   ========================================================= */
function setupGlobal() {
  gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });
  ScrollTrigger.create({ start: 80, end: 'max', onToggle: s => $('.nav').classList.toggle('scrolled', s.isActive) });
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'), target = id === '#top' ? 0 : $(id);
    if (target === null) return;
    e.preventDefault();
    autoUntil = Date.now() + 2400;
    lenis.scrollTo(target, { duration: 1.8, easing: t => 1 - Math.pow(1 - t, 4) });
  }));
  $$('.title.split').forEach(t => {
    gsap.from(split(t), { yPercent: 120, rotate: 8, duration: 1.1, stagger: .03, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 85%', toggleActions: 'play none none reverse' } });
  });
}
function setupHero() {
  split($('.hero-tag'));
  gsap.set($('.hero-tag')._chars, { yPercent: 120 });
  gsap.set(['.hero-top > *', '.scroll-hint', '.nav'], { opacity: 0 });
  gsap.to('.hero-top, .hero-bottom', { opacity: 0, y: -80, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 35%', scrub: true } });
  zone('hero', { trigger: '.hero', start: 'top 55%', end: 'bottom 55%' }, () => scene('t:THE WEEKND', { opacity: 1 }));
}
function heroIntro() {
  ready = true;
  if (!locks) lenis.start();
  document.body.classList.remove('loading');
  P.morph('t:THE WEEKND', { dur: 2.8 });
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
    ? gsap.fromTo(el, { xPercent: -50 }, { xPercent: 0, duration: 30, ease: 'none', repeat: -1 })
    : gsap.to(el, { xPercent: -50, duration: 24, ease: 'none', repeat: -1 }));
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
   CARRIÈRE — pinned horizontal scroll
   ========================================================= */
function setupHistory() {
  const track = $('.h-track'), panels = $$('.h-panel');
  const dist = () => track.scrollWidth - innerWidth;
  const hTween = gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: { trigger: '.history', pin: true, scrub: .8, end: () => '+=' + dist(), invalidateOnRefresh: true, anticipatePin: 1, onUpdate: s => gsap.set('.h-bar span', { scaleX: s.progress }) },
  });
  panels.forEach((p, i) => {
    const y = p.dataset.year, tint = p.dataset.tint || RED, chars = split($('h2, h3', p));
    if (tint) p.style.setProperty('--tint', tint);
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
    zone('h' + y, { trigger: p, containerAnimation: hTween, start: 'left 50%', end: 'right 50%' }, () => scene(y === 'XO' ? 'xo' : 'y:' + y, { tint, opacity: .95 }));
  });
}

/* =========================================================
   STATS
   ========================================================= */
function countUp(el, end, { dec = 0, dur = 1.8, trigger } = {}) {
  const o = { v: 0 };
  gsap.to(o, { v: end, duration: dur, ease: 'power3.out', scrollTrigger: { trigger: trigger || el, start: 'top 88%' }, onUpdate: () => { el.textContent = nf(o.v, dec); } });
}
function setupStats() {
  $$('#chiffres [data-count]').forEach(el => countUp(el, +el.dataset.count, { dec: +(el.dataset.dec || 0) }));
  gsap.from('.stat', { y: 80, opacity: 0, rotateX: -20, duration: 1.1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.stat-grid', start: 'top 85%' } });
  $$('.spot').forEach(el => el.addEventListener('pointermove', e => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', (e.clientX - r.left) + 'px'); el.style.setProperty('--my', (e.clientY - r.top) + 'px'); }));
  zone('stats', { trigger: '#chiffres', start: 'top 55%', end: 'bottom 55%' }, () => scene('galaxy', { opacity: .5 }));
}

/* =========================================================
   DISCOGRAPHIE — flip cards
   ========================================================= */
const year = r => r.date.slice(0, 4);
const cover = r => `<div class="dc-cover cv-${r.motif}" style="--c1:${r.c1};--c2:${r.c2}"><span class="cy">${year(r)}</span><span class="ct">${esc(r.title)}</span></div>`;
function setupDisco() {
  const grid = $('#disco-grid');
  grid.innerHTML = RELEASES.map(r => `
    <article class="dc" data-kind="${r.kind}" data-id="${r.id}" tabindex="0" role="button" aria-label="${esc(r.title)}, ${year(r)}. Retourner la pochette." style="--tint:${r.c1}">
      <div class="dc-in">
        <div class="dc-f">${cover(r)}<div class="dc-meta"><b>${esc(r.title)}</b><span>${KIND[r.kind]}</span></div></div>
        <div class="dc-b">
          <div class="db-k">${KIND[r.kind]} · ${dateFr(r.date)}</div>
          <div class="db-t">${esc(r.title)}</div>
          <div class="db-row">${r.peak ? `<span>Billboard 200 : <b>n°${r.peak}</b></span>` : '<span>Gratuite à sa sortie</span>'}${r.week ? `<span><b>${nf(r.week)}</b> en 1re semaine</span>` : ''}</div>
          <p class="db-p">${esc(r.note)}</p>
          <div class="db-keys">Titres clés : ${r.keys.map(k => `<i>${esc(k)}</i>`).join(' · ')}</div>
        </div>
      </div>
    </article>`).join('');
  const cards = $$('.dc', grid);
  cards.forEach(c => {
    const flip = () => { c.classList.toggle('flip'); };
    c.addEventListener('click', flip);
    c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
    if (!isTouch) {
      const inner = $('.dc-in', c);
      c.addEventListener('pointermove', e => {
        if (c.classList.contains('flip')) return;
        const r = c.getBoundingClientRect();
        gsap.to(inner, { rotationY: ((e.clientX - r.left) / r.width - .5) * 14, rotationX: (.5 - (e.clientY - r.top) / r.height) * 14, duration: .6, ease: 'power3', overwrite: 'auto' });
      });
      c.addEventListener('pointerleave', () => gsap.to(inner, { rotationY: 0, rotationX: 0, duration: .6, ease: 'power3', clearProps: 'transform' }));
    }
  });
  // filter tabs
  const tabs = $$('#discographie .tab'), pill = $('#discographie .tab-pill');
  const movePill = instant => { const t = $('#discographie .tab.active'); gsap.to(pill, { x: t.offsetLeft, y: t.offsetTop - 6, width: t.offsetWidth, height: t.offsetHeight, duration: instant ? 0 : .7, ease: 'expo.out' }); };
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.classList.toggle('active', x === t));
    movePill();
    const f = t.dataset.filter;
    const show = c => f === 'all' || (f === 'album' ? c.dataset.kind === 'album' : c.dataset.kind !== 'album');
    gsap.to(cards, {
      opacity: 0, scale: .92, duration: .25, ease: 'power2.in',
      onComplete: () => {
        cards.forEach(c => c.classList.toggle('hide', !show(c)));
        gsap.fromTo(cards.filter(show), { opacity: 0, y: 30, scale: .94 }, { opacity: 1, y: 0, scale: 1, duration: .6, stagger: .05, ease: 'expo.out' });
        ScrollTrigger.refresh();
      },
    });
  }));
  movePill(true);
  addEventListener('resize', () => movePill(true));
  gsap.from(cards, { y: 80, opacity: 0, rotateX: -18, duration: 1, stagger: .06, ease: 'expo.out', scrollTrigger: { trigger: grid, start: 'top 85%' } });
  zone('disco', { trigger: '#discographie', start: 'top 55%', end: 'bottom 55%' }, () => scene('xo', { opacity: .35 }));
}

/* =========================================================
   VINYLES — the turntable
   ========================================================= */
let spinning = false;
function setupVinyl() {
  const crate = $('#crate'), rec = $('#tt-rec'), arm = $('#tt-arm'), label = $('#tt-label'), labelT = $('#tt-label-t'), led = $('#tt-led'), info = $('#tt-info');
  const playBtn = $('#tt-play'), soundBtn = $('#tt-sound'), speedBtns = $$('.tt-speed .tt-btn');
  crate.innerHTML = RELEASES.map(r => `<button type="button" class="sl" role="option" aria-selected="false" data-id="${r.id}" data-cursor="Sortir" aria-label="${esc(r.title)}">${cover(r)}</button>`).join('');
  let cur = null, rpm = 33, spinTw = null, sound = false, audio = null;
  gsap.set(arm, { rotate: 0 });

  function setInfo(r) {
    const v = VINYL[r.id];
    info.innerHTML = `
      <div class="ti-k">Sur la platine · ${KIND[r.kind]}</div>
      <h3 class="ti-t">${esc(r.title)}</h3>
      <div class="ti-row"><span>${dateFr(r.date)}</span>${r.peak ? `<span>Billboard 200 : n°${r.peak}</span>` : '<span>Mixtape gratuite</span>'}${r.week ? `<span>${nf(r.week)} en 1re semaine</span>` : ''}</div>
      <p class="ti-p">${esc(r.note)}</p>
      ${v ? `<div class="ti-fact"><b>Le fait vinyle</b>${esc(v.fact)}</div>` : ''}
      <p class="ti-p">Face A, titres clés : ${r.keys.map(esc).join(', ')}.</p>`;
    gsap.from(info.children, { y: 16, opacity: 0, stagger: .05, duration: .45, ease: 'power2.out' });
  }
  function spin(on) {
    spinning = on;
    spinTw?.kill();
    led.classList.toggle('on', on);
    playBtn.textContent = on ? '❚❚ Pause' : '▶ Lecture';
    if (on) {
      gsap.to(arm, { rotate: 24, duration: .9, ease: 'power2.inOut' });
      const per = 60 / rpm; // seconds per revolution
      spinTw = gsap.to(rec, { rotate: '+=360', duration: per, ease: 'none', repeat: -1 });
      gsap.fromTo(spinTw, { timeScale: 0 }, { timeScale: 1, duration: 1.2, ease: 'power2.out' });
    } else {
      gsap.to(arm, { rotate: 0, duration: .8, ease: 'power2.inOut' });
      const left = gsap.to(rec, { rotate: '+=120', duration: 1.4, ease: 'power3.out' });
      spinTw = left;
    }
    P.setSpin(on && curZone?.name === 'vinyl' ? (rpm === 45 ? 1.8 : 1.2) : 0);
    updateAudio();
  }
  function load(r) {
    if (cur?.id === r.id) return;
    $$('.sl', crate).forEach(s => { const on = s.dataset.id === r.id; s.classList.toggle('on', on); s.setAttribute('aria-selected', on); });
    const had = !!cur;
    if (spinning) spin(false);
    cur = r;
    gsap.timeline()
      .to(rec, { x: '-120%', opacity: 0, duration: had ? .35 : 0, ease: 'power2.in' })
      .add(() => { label.style.setProperty('--lab', r.c1); labelT.textContent = r.title; gsap.set(rec, { rotate: 0 }); })
      .fromTo(rec, { x: '-120%', opacity: 0 }, { x: '0%', opacity: 1, duration: .8, ease: 'expo.out' })
      .add(() => spin(true));
    setInfo(r);
  }
  crate.addEventListener('click', e => { const b = e.target.closest('.sl'); if (b) load(RELEASES.find(r => r.id === b.dataset.id)); });
  playBtn.addEventListener('click', () => { if (!cur) load(RELEASES[RELEASES.length - 1]); else spin(!spinning); });
  speedBtns.forEach(b => b.addEventListener('click', () => {
    rpm = +b.dataset.rpm;
    speedBtns.forEach(x => x.classList.toggle('on', x === b));
    if (spinning) { spin(false); setTimeout(() => spin(true), 250); }
    if (rpm === 45) { toast('45 tours : tout va plus vite. Comme sa carrière après 2015.'); egg('45tours'); }
  }));
  soundBtn.addEventListener('click', () => {
    sound = !sound;
    soundBtn.textContent = sound ? 'Son : on' : 'Son : off';
    soundBtn.setAttribute('aria-pressed', sound);
    soundBtn.classList.toggle('on', sound);
    updateAudio();
  });

  // generated ambience: vinyl crackle + a slow synth pad tuned to the era (no music from the artist)
  function updateAudio() {
    if (!sound || !spinning || !cur) { audio?.stop(); audio = null; return; }
    audio?.stop();
    audio = ambience(cur, rpm);
  }
  ScrollTrigger.create({ trigger: '#vinyles', start: 'top bottom', end: 'bottom top', onToggle: s => { if (!s.isActive && spinning) spin(false); } });
  document.addEventListener('visibilitychange', () => { if (document.hidden && spinning) spin(false); });

  gsap.from('.crate-wrap, .tt-wrap, .tt-info', { y: 70, opacity: 0, stagger: .1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.deck', start: 'top 82%' } });
  zone('vinyl', { trigger: '#vinyles', start: 'top 55%', end: 'bottom 55%' }, () => scene('disc', { tint: cur?.c1 || RED, opacity: .35 }));
}
function ambience(r, rpm) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return { stop() {} };
    const ac = new AC(), out = ac.createGain();
    out.gain.value = 0;
    out.gain.linearRampToValueAtTime(.18, ac.currentTime + 1.2);
    out.connect(ac.destination);
    // crackle
    const len = ac.sampleRate * 2, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() < .0009 ? (Math.random() * 2 - 1) * .9 : (Math.random() * 2 - 1) * .015;
    const cr = ac.createBufferSource(); cr.buffer = buf; cr.loop = true;
    const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
    cr.connect(hp).connect(out); cr.start();
    // pad: a minor chord whose root follows the era colour hue
    const hue = parseInt(r.c1.slice(1), 16) % 7, base = [98, 110, 116.5, 130.8, 146.8, 87.3, 103.8][hue] * (rpm === 45 ? 45 / 33.3 : 1);
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900; lp.Q.value = .7;
    lp.connect(out);
    const oscs = [1, 1.189, 1.498, 2].map((m, i) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = i % 2 ? 'triangle' : 'sawtooth';
      o.frequency.value = base * m;
      o.detune.value = (Math.random() - .5) * 12;
      g.gain.value = i === 3 ? .05 : .09;
      o.connect(g).connect(lp); o.start();
      return o;
    });
    const lfo = ac.createOscillator(), lg = ac.createGain();
    lfo.frequency.value = .08; lg.gain.value = 500;
    lfo.connect(lg).connect(lp.frequency); lfo.start();
    return {
      stop() {
        const t = ac.currentTime;
        out.gain.cancelScheduledValues(t);
        out.gain.setTargetAtTime(0, t, .15);
        setTimeout(() => { try { cr.stop(); oscs.forEach(o => o.stop()); lfo.stop(); ac.close(); } catch { /* closed */ } }, 600);
      },
    };
  } catch { return { stop() {} }; }
}

/* =========================================================
   TOURNÉES
   ========================================================= */
function setupTours() {
  const g = $('#th-gross'), o = { v: 0 };
  gsap.to(o, { v: 1.3, duration: 2.2, ease: 'power3.out', scrollTrigger: { trigger: '.tour-hero', start: 'top 80%' }, onUpdate: () => { g.textContent = nf(o.v, 1); } });
  $$('.th-stats [data-count]').forEach(el => countUp(el, +el.dataset.count, { trigger: '.th-stats' }));
  const max = Math.max(...TOURS.filter(t => t.gross).map(t => t.gross));
  $('#tc-rows').innerHTML = TOURS.filter(t => t.gross).map(t => `
    <div class="tc-row"><div class="tc-name">${esc(t.name)}<small>${t.years}</small></div>
    <div class="tc-bar"><i style="--w:${(t.gross / max) * 88}%"></i><b>${t.gross >= 1000 ? nf(t.gross / 1000, 1) + ' Md$' : nf(t.gross, 1) + ' M$'}</b></div></div>`).join('');
  gsap.to('.tc-bar i', { scaleX: 1, duration: 1.6, stagger: .2, ease: 'expo.out', scrollTrigger: { trigger: '.tour-chart', start: 'top 80%' } });
  $('#tour-list').innerHTML = TOURS.map(t => `<li class="${t.big ? 'big' : ''}"><span class="tl-y">${t.years}</span><span class="tl-n">${esc(t.name)}</span><span class="tl-p">${esc(t.note)}</span></li>`).join('');
  gsap.from('#tour-list li', { y: 60, opacity: 0, stagger: .08, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: '#tour-list', start: 'top 85%' } });
  gsap.from('.th-big', { scale: .6, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.tour-hero', start: 'top 80%' } });
  zone('tours', { trigger: '#tournees', start: 'top 55%', end: 'bottom 55%' }, () => scene('t:1,3 MD$', { opacity: .3 }));
}

/* =========================================================
   RECORDS + first-week chart
   ========================================================= */
function setupRecords() {
  $('#rec-grid').innerHTML = RECORDS.map(r => `<article class="rc"><div class="rc-big">${esc(r.big)}</div><div class="rc-t">${esc(r.t)}</div><p class="rc-s">${esc(r.s)}</p></article>`).join('');
  gsap.from('.rc', { y: 70, opacity: 0, rotateX: -14, stagger: .06, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '#rec-grid', start: 'top 85%' } });
  const albums = RELEASES.filter(r => r.week && r.kind !== 'compil');
  const max = Math.max(...albums.map(r => r.week));
  const plot = $('#fw-plot');
  plot.innerHTML = albums.map(r => `<div class="fw-col${r.kind === 'ep' ? ' ep' : ''}" style="--h:${(r.week / max) * 100}%" data-tip="${esc(r.title)} · ${nf(r.week)} unités · n°${r.peak} au Billboard 200${r.kind === 'ep' ? ' · EP' : ''}" tabindex="0"><b>${nf(Math.round(r.week / 1000))} k</b><i></i></div>`).join('') + '<div class="fw-tip" aria-hidden="true"></div>';
  plot.insertAdjacentHTML('afterend', `<div class="fw-x">${albums.map(r => `<span>${esc(r.title.replace(/,$/, ''))}<em>${year(r)} · n°${r.peak}</em></span>`).join('')}</div>`);
  const tip = $('.fw-tip', plot);
  $$('.fw-col', plot).forEach(c => {
    const show = () => { tip.textContent = c.dataset.tip; tip.classList.add('on'); const pr = plot.getBoundingClientRect(), r = c.getBoundingClientRect(); tip.style.left = Math.max(tip.offsetWidth / 2, Math.min(pr.width - tip.offsetWidth / 2, r.left - pr.left + r.width / 2)) + 'px'; tip.style.top = (r.bottom - pr.top - r.height * parseFloat(c.style.getPropertyValue('--h')) / 100 - 30) + 'px'; };
    c.addEventListener('pointerenter', show); c.addEventListener('focus', show);
    c.addEventListener('pointerleave', () => tip.classList.remove('on')); c.addEventListener('blur', () => tip.classList.remove('on'));
  });
  gsap.to('.fw-col i', { scaleY: 1, duration: 1.2, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.fw-chart', start: 'top 80%' } });
  gsap.from('.fw-col b', { opacity: 0, y: 10, stagger: .08, duration: .5, delay: .6, scrollTrigger: { trigger: '.fw-chart', start: 'top 80%' } });
  gsap.from('.gr-line li', { y: 40, opacity: 0, stagger: .08, duration: .8, ease: 'expo.out', scrollTrigger: { trigger: '.gr-line', start: 'top 88%' } });
  zone('records', { trigger: '#records', start: 'top 55%', end: 'bottom 55%' }, () => scene('t:N°1', { opacity: .3 }));
}

/* =========================================================
   SUPER BOWL — the hall of mirrors
   ========================================================= */
function setupMirror() {
  const box = $('#mirror'), cv = $('#mirror-cv'), ui = $('#mirror-ui'), g = cv.getContext('2d');
  let W = 0, H = 0, run = false, raf = 0, px = .5, py = .5, found = 0, done = false;
  const targets = Array.from({ length: 7 }, () => ({ x: .12 + Math.random() * .76, y: .15 + Math.random() * .7, hit: false }));
  const trail = [];
  const resize = () => { const r = box.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); addEventListener('resize', resize);
  const move = e => {
    const r = box.getBoundingClientRect();
    px = (e.clientX - r.left) / r.width; py = (e.clientY - r.top) / r.height;
    trail.push({ x: px, y: py, t: performance.now() });
    if (trail.length > 40) trail.shift();
    targets.forEach(t => {
      if (t.hit || Math.hypot((t.x - px) * W, (t.y - py) * H) > 34) return;
      t.hit = true; found++;
      ui.textContent = `${found} / 7 miroirs`;
      gsap.fromTo(ui, { scale: 1.3 }, { scale: 1, duration: .4, ease: 'back.out(3)' });
      if (found === 7 && !done) {
        done = true;
        ui.textContent = 'Sortie trouvée ✓';
        const br = box.getBoundingClientRect();
        confetti({ particleCount: 120, spread: 90, origin: { x: (br.left + br.width / 2) / innerWidth, y: (br.top + br.height / 2) / innerHeight }, colors: COLORS });
        toast('Tu es sorti de la galerie des glaces. Les danseurs bandés, eux, y sont encore.');
        egg('miroirs');
      }
    });
  };
  box.addEventListener('pointermove', move);
  box.addEventListener('pointerdown', move);
  function frame(now) {
    const t = now / 1000;
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, N = 8;
    for (let k = 0; k < N; k++) {
      g.save();
      g.translate(cx, cy);
      g.rotate(k * Math.PI * 2 / N + t * .05);
      if (k % 2) g.scale(1, -1);
      // a neon figure walking through the mirrors: follows the pointer
      const fx = (px - .5) * W * .6, fy = (py - .5) * H * .6;
      g.strokeStyle = `rgba(255,${40 + k * 12},${70 + k * 10},.85)`;
      g.lineWidth = 2;
      g.shadowColor = '#ff1f3d'; g.shadowBlur = 14;
      g.beginPath();
      trail.forEach((p, i) => { const x = (p.x - .5) * W * .6, y = (p.y - .5) * H * .6; i ? g.lineTo(x, y) : g.moveTo(x, y); });
      g.stroke();
      g.beginPath(); g.arc(fx, fy, 6 + Math.sin(t * 4) * 2, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
      // mirror frames
      g.shadowBlur = 0;
      g.strokeStyle = 'rgba(255,255,255,.08)';
      g.strokeRect(-W * .05 + Math.sin(t + k) * 6, H * .08, W * .1, H * .22);
      g.restore();
    }
    // the 7 hidden mirrors glint when you get close
    targets.forEach((tg, i) => {
      const d = Math.hypot((tg.x - px) * W, (tg.y - py) * H), a = tg.hit ? 1 : Math.max(0, 1 - d / 160) * .7 + .05 * Math.sin(t * 3 + i);
      g.save();
      g.globalAlpha = Math.max(0, a);
      g.strokeStyle = tg.hit ? '#ff1f3d' : '#fff';
      g.lineWidth = tg.hit ? 2.5 : 1.5;
      g.shadowColor = tg.hit ? '#ff1f3d' : '#fff'; g.shadowBlur = tg.hit ? 18 : 8;
      g.strokeRect(tg.x * W - 10, tg.y * H - 16, 20, 32);
      g.restore();
    });
    raf = requestAnimationFrame(frame);
  }
  ScrollTrigger.create({ trigger: box, start: 'top bottom', end: 'bottom top', onToggle: s => { run = s.isActive; cancelAnimationFrame(raf); if (run) { resize(); raf = requestAnimationFrame(frame); } } });
  gsap.from('.bowl-txt > *, .mirror', { y: 50, opacity: 0, stagger: .1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.bowl-wrap', start: 'top 82%' } });
  zone('bowl', { trigger: '#superbowl', start: 'top 55%', end: 'bottom 55%' }, () => scene('t:LV', { opacity: .35 }));
}

/* =========================================================
   QUIZ
   ========================================================= */
const RANKS = [
  [8, 'XO jusqu\'au bout', 'Huit sur huit. Tu connais la carrière mieux que certains de ses producteurs.'],
  [6, 'Fan des premières heures', 'Solide. Tu étais là avant « Blinding Lights », ça se voit.'],
  [4, 'Auditeur du dimanche', 'Pas mal. Il te reste quelques mixtapes à rattraper.'],
  [0, 'Découverte en 2020', 'Ça arrive. Retourne voir la carrière, tout est en haut de la page.'],
];
function setupQuiz() {
  const body = $('#qz-body'), dots = $('#qz-dots'), N = 8;
  let set = [], i = 0, score = 0;
  const enter = () => gsap.from(body.children, { y: 26, opacity: 0, stagger: .06, duration: .55, ease: 'expo.out' });
  const paint = (upto, cur) => { dots.innerHTML = Array.from({ length: N }, (_, k) => `<i class="${k < upto ? (set[k]?.ok ? 'ok' : 'ko') : k === cur ? 'cur' : ''}"></i>`).join(''); };
  function start() { set = shuffle(QUIZ).slice(0, N).map(x => ({ ...x, opts: shuffle(x.o.map((t, k) => ({ t, ok: k === 0 }))), ok: false })); i = 0; score = 0; ask(); }
  function ask() {
    const x = set[i];
    paint(i, i);
    body.innerHTML = `<div class="qz-n">Question ${i + 1} / ${N}</div><h3 class="qz-q">${esc(x.q)}</h3>
      <div class="qz-opts">${x.opts.map((o, k) => `<button type="button" class="qz-o" data-k="${k}"><span>${'ABCD'[k]}</span>${esc(o.t)}</button>`).join('')}</div>
      <div class="qz-r" aria-live="polite"></div><button type="button" class="qz-next" hidden>${i === N - 1 ? 'Voir mon score →' : 'Question suivante →'}</button>`;
    enter();
    $$('.qz-o', body).forEach(b => b.addEventListener('click', () => answer(+b.dataset.k)));
    $('.qz-next', body).addEventListener('click', () => { i++; if (i < N) ask(); else end(); });
  }
  function answer(k) {
    const x = set[i], btns = $$('.qz-o', body), good = x.opts.findIndex(o => o.ok);
    btns.forEach(b => { b.disabled = true; });
    btns[good].classList.add('ok');
    x.ok = k === good;
    if (x.ok) { score++; const r = btns[good].getBoundingClientRect(); confetti({ particleCount: 36, spread: 60, startVelocity: 24, origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight }, colors: COLORS, scalar: .9 }); }
    else { btns[k].classList.add('ko'); gsap.fromTo(btns[k], { x: -10 }, { x: 0, duration: .55, ease: 'elastic.out(1.2,.25)' }); }
    const r = $('.qz-r', body);
    r.innerHTML = `<b>${x.ok ? 'Bonne réponse.' : 'Raté.'}</b> ${esc(x.r)}`;
    gsap.from(r, { y: 10, opacity: 0, duration: .4 });
    const nx = $('.qz-next', body);
    nx.hidden = false;
    gsap.from(nx, { y: 10, opacity: 0, duration: .4, delay: .15 });
    paint(i + 1, -1);
    nx.focus({ preventScroll: true });
  }
  function end() {
    const [, title, line] = RANKS.find(([min]) => score >= min);
    paint(N, -1);
    body.innerHTML = `<div class="qz-n">Résultat</div><div class="qz-score"><b>${score}</b><span>/ ${N}</span></div><h3 class="qz-rank">${title}</h3><p class="qz-line">${line}</p><button type="button" class="qz-go">Rejouer ↻</button>`;
    enter();
    gsap.from('.qz-score b', { scale: 0, rotate: -20, duration: .9, ease: 'back.out(3)' });
    $('.qz-go', body).addEventListener('click', start);
    if (score === N) {
      const r = $('.qz-score', body).getBoundingClientRect();
      confetti({ particleCount: 180, spread: 120, startVelocity: 45, origin: { x: (r.left + r.width / 2) / innerWidth, y: r.top / innerHeight }, colors: COLORS });
      egg('quiz');
    }
  }
  body.innerHTML = `<div class="qz-n">Tiré au sort parmi ${QUIZ.length} questions</div><h3 class="qz-q">Tu connais vraiment sa carrière ?</h3><p class="qz-line">Mixtapes, records, tournées : huit questions, aucun piège inventé.</p><button type="button" class="qz-go">Commencer ▶</button>`;
  paint(0, -1);
  $('.qz-go', body).addEventListener('click', start);
  gsap.from('.quiz-card', { y: 70, opacity: 0, rotateX: -10, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.quiz-card', start: 'top 85%' } });
  zone('quiz', { trigger: '#quiz', start: 'top 55%', end: 'bottom 55%' }, () => scene('t:?', { opacity: .3 }));
}

/* =========================================================
   FOOTER + LOADER
   ========================================================= */
function setupFooter() {
  const big = $('.foot-big'), chars = split(big);
  gsap.from(chars, { yPercent: 120, rotate: 10, duration: 1.2, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: big, start: 'top 90%', toggleActions: 'play none none reverse' }, onComplete: () => big.classList.add('revealed'), onReverseComplete: () => big.classList.remove('revealed') });
  gsap.from('.foot-om > *', { y: 24, opacity: 0, stagger: .1, duration: .8, ease: 'expo.out', scrollTrigger: { trigger: '.foot-om', start: 'top 92%' } });
  zone('foot', { trigger: '.foot', start: 'top 60%', end: 'bottom top' }, () => scene('xo', { opacity: .9 }));
}
const QUIPS = [[0, 'Gonflage des ballons…'], [22, 'Allumage des néons de Las Vegas…'], [46, 'Réglage sur 103.5 Dawn FM…'], [70, 'Montage de la scène dans les tribunes…'], [92, 'Le week-end commence.']];
function runLoader() {
  const paths = $$('.xo path, .xo circle');
  paths.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  const word = split($('.loader-word')), count = { v: 0 }, cEl = $('#count'), qEl = $('#quip');
  let q = -1;
  const tl = gsap.timeline();
  tl.to(paths, { strokeDashoffset: 0, duration: 1.3, stagger: .25, ease: 'power2.inOut' }, 0)
    .to(count, {
      v: 100, duration: 2.2, ease: 'power3.inOut',
      onUpdate: () => {
        cEl.textContent = Math.round(count.v);
        let k = 0; QUIPS.forEach(([at], j) => { if (count.v >= at) k = j; });
        if (k !== q) { q = k; qEl.textContent = QUIPS[k][1]; gsap.fromTo(qEl, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .25 }); }
      },
    }, 0)
    .to('.xo', { opacity: .3, duration: .08, repeat: 5, yoyo: true, ease: 'steps(1)' }, 1.5)
    .from(word, { yPercent: 120, duration: .8, stagger: .03, ease: 'expo.out' }, 1.1)
    .from('.loader-meta', { opacity: 0, y: 10, duration: .6 }, 1.3)
    .to('.loader-inner', { opacity: 0, y: -50, duration: .5, ease: 'power2.in' }, 2.6)
    .to($$('.loader-panel').reverse(), { yPercent: -100, duration: 1.1, stagger: .14, ease: 'expo.inOut' }, 2.85)
    .add(heroIntro, 3.25)
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
setupDisco();
setupVinyl();
setupTours();
setupRecords();
setupMirror();
setupQuiz();
setupFooter();
initEggs({ P, scene, restore: restoreScene, lockScroll, isReady: () => ready, isAutoScroll: () => Date.now() < autoUntil, COLORS });

await Promise.race([document.fonts.load('800 100px Syne'), sleep(2500)]);
runLoader();

console.log('%cXO', 'font:800 40px Syne,Impact;color:#ff1f3d;background:#050506;padding:8px 22px;text-shadow:0 0 12px #ff1f3d');
console.log('%cSite fan non officiel, conçu, codé et animé par Claude. Psst : tape xo() ici.', 'color:#aaa');
