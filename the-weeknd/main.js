import { RELEASES, KIND, VINYL, TOURS, RECORDS, QUIZ } from './data.js';
import { createSky } from './sky.js';
import { createPlayer } from './player.js';
import { initEggs, egg, toast } from './eggs.js';

/* =========================================================
   ABEL TESFAYE — The Weeknd, la carrière
   GSAP + ScrollTrigger + Lenis + Three.js (le ciel) + YouTube IFrame API
   ========================================================= */

const { gsap, ScrollTrigger, Lenis } = window;
gsap.registerPlugin(ScrollTrigger);

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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

/* ---------- the sky ---------- */
const sky = createSky({ reduce });
gsap.ticker.add((time, dt) => sky.frame(dt, lenis.velocity || 0));
function scene(k, o) { if (ready) sky.set(k, o); }

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
    goTo(target);
  }));
  $$('.title.split').forEach(t => {
    gsap.from(split(t), { yPercent: 120, rotate: 8, duration: 1.1, stagger: .03, ease: 'expo.out', scrollTrigger: { trigger: t, start: 'top 85%', toggleActions: 'play none none reverse' } });
  });
  $$('.sec-sub').forEach(s => gsap.from(s, { y: 24, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: s, start: 'top 90%' } }));
}
function goTo(target, offset = 0) {
  autoUntil = Date.now() + 2400;
  lenis.scrollTo(target, { offset, duration: 1.8, easing: t => 1 - Math.pow(1 - t, 4) });
}
function setupHero() {
  $$('.hero-tag .ht').forEach(l => { l.innerHTML = `<span>${l.innerHTML}</span>`; });
  gsap.set('.hero-tag .ht > span', { yPercent: 110 });
  gsap.set(['.hero-top > *', '.scroll-hint', '.nav'], { opacity: 0 });
  gsap.to('.hero-top, .hero-bottom', { opacity: 0, y: -80, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom 35%', scrub: true } });
  zone('hero', { trigger: '.hero', start: 'top 55%', end: 'bottom 55%' }, () => scene('c:ABEL TESFAYE', { tint: '#f4efe9', opacity: 1, chart: 1 }));
  // the pole star never moves: click it
  addEventListener('click', e => {
    if (!ready || e.target.closest('a,button,input,.nav,.toast,.eggs-panel,.eggs-pill,.np')) return;
    const p = sky.pole();
    if (Math.hypot(e.clientX - p.x, e.clientY - p.y) > 36) return;
    sky.pulse();
    toast('Tu as trouvé l\'étoile polaire. Elle ne bouge jamais : tout le ciel tourne autour. À Toronto, elle brille à 43° au-dessus de l\'horizon.', { dur: 7000 });
    egg('polaire');
  });
}
function heroIntro() {
  ready = true;
  if (!locks) lenis.start();
  document.body.classList.remove('loading');
  sky.set('c:ABEL TESFAYE', { tint: '#f4efe9', opacity: 1, chart: 1 });
  curZone = zones[0];
  gsap.to('.nav', { opacity: 1, duration: 1, delay: .2 });
  gsap.from('.nav', { y: -60, duration: 1.2, delay: .2, ease: 'expo.out' });
  gsap.to('.hero-top > *', { opacity: 1, duration: 1, stagger: .12, delay: .6 });
  gsap.from('.hero-top > *', { y: -24, duration: 1, stagger: .12, delay: .6, ease: 'expo.out' });
  gsap.to('.hero-tag .ht > span', { yPercent: 0, duration: 1.3, stagger: .25, delay: 1.6, ease: 'expo.out' });
  gsap.to('.scroll-hint', { opacity: 1, duration: 1, delay: 2.6 });
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
    p.style.setProperty('--tint', tint);
    if (i === 0) {
      gsap.timeline({ scrollTrigger: { trigger: '.history', start: 'top 70%', toggleActions: 'play none none reverse' } })
        .from(chars, { yPercent: 120, rotate: 6, duration: 1.1, stagger: .05, ease: 'expo.out' })
        .from($$('.fade', p), { y: 30, opacity: 0, duration: .8, stagger: .1, ease: 'power3.out' }, '-=.7');
      zone('h0', { trigger: '.history', start: 'top 55%', end: 'top -30%' }, () => scene('none', { chart: .35 }));
      return;
    }
    gsap.timeline({ scrollTrigger: { trigger: p, containerAnimation: hTween, start: 'left 72%', toggleActions: 'play none none reverse' } })
      .from(chars, { yPercent: 120, rotate: 6, duration: .9, stagger: .025, ease: 'expo.out' })
      .from($$('.fade', p), { y: 30, opacity: 0, duration: .7, stagger: .08, ease: 'power3.out' }, '-=.65');
    zone('h' + y, { trigger: p, containerAnimation: hTween, start: 'left 50%', end: 'right 50%' }, () => scene('c:' + y, { tint, opacity: .95 }));
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
  zone('stats', { trigger: '#chiffres', start: 'top 55%', end: 'bottom 55%' }, () => scene('none', { sky: .9 }));
}

/* =========================================================
   DISCOGRAPHIE — flip cards
   ========================================================= */
const year = r => r.date.slice(0, 4);
const cover = r => `<div class="dc-cover cv-${r.motif}" style="--c1:${r.c1};--c2:${r.c2}"><span class="cy">${year(r)}</span><span class="ct">${esc(r.title)}</span></div>`;
let deck = null;
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
          ${r.tracks?.length ? `<button type="button" class="db-play" data-id="${r.id}">▶ Poser sur la platine</button>` : ''}
        </div>
      </div>
    </article>`).join('');
  const cards = $$('.dc', grid);
  cards.forEach(c => {
    const flip = () => { c.classList.toggle('flip'); };
    c.addEventListener('click', e => { if (e.target.closest('.db-play')) return; flip(); });
    c.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('.db-play')) { e.preventDefault(); flip(); } });
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
  grid.addEventListener('click', e => {
    const b = e.target.closest('.db-play');
    if (!b) return;
    e.stopPropagation();
    deck?.load(RELEASES.find(r => r.id === b.dataset.id), { autoplay: true });
    goTo('#vinyles', -40);
  });
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
  zone('disco', { trigger: '#discographie', start: 'top 55%', end: 'bottom 55%' }, () => scene('c:11', { opacity: .4 }));
}

/* =========================================================
   LA PLATINE — synced with the official YouTube player
   ========================================================= */
let spinning = false;
function setupVinyl() {
  const crate = $('#crate'), rec = $('#tt-rec'), arm = $('#tt-arm'), label = $('#tt-label'), labelT = $('#tt-label-t'), led = $('#tt-led'), info = $('#tt-info');
  const playBtn = $('#tt-play'), nextBtn = $('#tt-next'), crackBtn = $('#tt-crackle'), vol = $('#tt-vol'), speedBtns = $$('.tt-speed .tt-btn');
  const screen = $('#tv-screen'), tracksEl = $('#tracks');
  const np = $('#np'), npT = $('#np-t'), npPlay = $('#np-play'), npGo = $('#np-go'), npDisc = $('#np-disc');
  crate.innerHTML = RELEASES.map(r => `<button type="button" class="sl" role="option" aria-selected="false" data-id="${r.id}" data-cursor="Poser" aria-label="${esc(r.title)}">${cover(r)}</button>`).join('');

  let cur = null, ti = 0, rpm = 33, crackleOn = true, fallback = false, deckSeen = false, bad = new Set();
  let recRot = 0, recSpeed = 0, armRot = 0;
  const player = createPlayer(screen, { onState, onError });

  /* --- generated vinyl crackle (the only sound made here) --- */
  let ac = null, crackGain = null;
  function audio() {
    if (ac) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ac = new AC();
      const len = ac.sampleRate * 2, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() < .0011 ? (Math.random() * 2 - 1) * .8 : (Math.random() * 2 - 1) * .012;
      const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
      const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1100;
      crackGain = ac.createGain(); crackGain.gain.value = 0;
      src.connect(hp).connect(crackGain).connect(ac.destination); src.start();
    } catch { ac = null; }
  }
  function crackle() {
    if (!crackGain) return;
    const target = spinning && crackleOn ? (+vol.value / 100) * .11 : 0;
    crackGain.gain.setTargetAtTime(target, ac.currentTime, .15);
  }

  /* --- visuals: record + tonearm follow the player --- */
  gsap.ticker.add((t, dtMs) => {
    const dt = Math.min(.05, dtMs / 1000);
    recSpeed += ((spinning ? 1 : 0) - recSpeed) * (1 - Math.pow(.04, dt));
    recRot += dt * recSpeed * (rpm / 60) * 360;
    if (cur) gsap.set(rec, { rotate: recRot });
    let target = 0;
    if (spinning) target = fallback ? 22 : 19 + player.progress() * 13;
    armRot += (target - armRot) * (1 - Math.pow(.03, dt));
    gsap.set(arm, { rotate: armRot });
    const bar = $('.ti-prog i', info);
    if (bar && !fallback) bar.style.transform = `scaleX(${player.progress()})`;
  });

  function setPlaying(on) {
    if (on === spinning) return;
    spinning = on;
    document.body.classList.toggle('playing', on);
    led.classList.toggle('on', on);
    playBtn.textContent = on ? '❚❚ Pause' : '▶ Lecture';
    npPlay.textContent = on ? '❚❚' : '▶';
    npPlay.setAttribute('aria-label', on ? 'Pause' : 'Lecture');
    sky.spin(on);
    crackle();
    updateNp();
  }
  function onState(s) {
    if (s === 'playing') setPlaying(true);
    else if (s === 'paused' || s === 'cued' || s === 'unstarted') setPlaying(false);
    else if (s === 'ended') { setPlaying(false); next(true); }
  }
  function onError(code) {
    const tr = cur?.tracks?.[ti];
    if (!tr) return;
    bad.add(tr.yt);
    paintTracks();
    message(`« ${tr.t} » ne peut pas être lu ici (restriction YouTube, code ${code}).`, tr.yt, true);
    const nextOk = cur.tracks.findIndex((x, i) => i > ti && !bad.has(x.yt));
    if (nextOk > -1) setTimeout(() => playTrack(nextOk, true), 1200);
    else setPlaying(false);
  }
  function message(text, yt, err) {
    const div = document.createElement('div');
    div.className = 'tv-idle' + (err ? ' err' : '');
    div.innerHTML = `<b>${err ? 'Lecture impossible' : 'Lecteur indisponible'}</b><span>${esc(text)}</span>${yt ? `<a href="https://www.youtube.com/watch?v=${yt}" target="_blank" rel="noopener">Écouter sur YouTube ↗</a>` : ''}`;
    if (err) { screen.querySelector('.tv-idle')?.remove(); screen.append(div); setTimeout(() => div.remove(), 3500); }
    else { screen.innerHTML = ''; screen.append(div); }
  }

  function paintTracks() {
    $$('li', tracksEl).forEach((li, i) => {
      li.classList.toggle('on', i === ti);
      li.classList.toggle('bad', bad.has(cur.tracks[i].yt));
    });
  }
  function renderTracks(r) {
    tracksEl.innerHTML = (r.tracks || []).map((tr, i) => `<li><button type="button" data-i="${i}"><span class="tn">${String(i + 1).padStart(2, '0')}</span><span class="tt-t">${esc(tr.t)}</span><span class="tk">${tr.k === 'clip' ? 'Clip officiel' : 'Audio officiel'}</span></button></li>`).join('');
    gsap.from($$('li', tracksEl), { x: 20, opacity: 0, stagger: .06, duration: .45, ease: 'power2.out' });
  }
  tracksEl.addEventListener('click', e => { const b = e.target.closest('button[data-i]'); if (b) { audio(); playTrack(+b.dataset.i, true); } });

  function setInfo(r) {
    const v = VINYL[r.id];
    info.innerHTML = `
      <div class="ti-k">Sur la platine · ${KIND[r.kind]}</div>
      <h3 class="ti-t">${esc(r.title)}</h3>
      <div class="ti-prog"><i></i></div>
      <div class="ti-row"><span>${dateFr(r.date)}</span>${r.peak ? `<span>Billboard 200 : n°${r.peak}</span>` : '<span>Mixtape gratuite</span>'}${r.week ? `<span>${nf(r.week)} en 1re semaine</span>` : ''}</div>
      <p class="ti-p">${esc(r.note)}</p>
      ${v ? `<div class="ti-fact"><b>Le fait vinyle</b>${esc(v.fact)}</div>` : ''}
      <p class="ti-p"><a href="https://open.spotify.com/search/${encodeURIComponent(r.title.replace(/,$/, '') + ' The Weeknd')}" target="_blank" rel="noopener">L'album complet sur Spotify ↗</a></p>`;
    gsap.from(info.children, { y: 16, opacity: 0, stagger: .05, duration: .45, ease: 'power2.out' });
  }
  async function playTrack(i, autoplay = true) {
    if (!cur?.tracks?.length) return;
    ti = i;
    paintTracks();
    updateNp();
    if (fallback) { setPlaying(true); return; }
    try {
      await player.load(cur.tracks[i].yt, autoplay);
      player.setRate(rpm === 45 ? 1.25 : 1);
      player.setVolume(+vol.value);
    } catch {
      fallback = true;
      message('Le lecteur YouTube n\'a pas pu se charger (bloqueur de contenu ou réseau). La platine tourne quand même.', cur.tracks[i].yt);
      if (autoplay) setPlaying(true);
    }
  }
  function next(auto) {
    if (!cur?.tracks?.length) return;
    const n = cur.tracks.findIndex((x, i) => i > ti && !bad.has(x.yt));
    if (n > -1) playTrack(n, true);
    else if (!auto) playTrack(0, true);
  }
  function load(r, { autoplay = true } = {}) {
    if (!r) return;
    audio();
    if (cur?.id === r.id) { if (autoplay && !spinning) { fallback ? setPlaying(true) : player.play(); } return; }
    $$('.sl', crate).forEach(s => { const on = s.dataset.id === r.id; s.classList.toggle('on', on); s.setAttribute('aria-selected', on); });
    const had = !!cur;
    if (spinning) { fallback ? setPlaying(false) : player.pause(); }
    cur = r; ti = 0;
    gsap.timeline()
      .to(rec, { x: '-120%', opacity: 0, duration: had ? .35 : 0, ease: 'power2.in' })
      .add(() => { label.style.setProperty('--lab', r.c1); npDisc.style.setProperty('--lab', r.c1); labelT.textContent = r.title; recRot = 0; })
      .fromTo(rec, { x: '-120%', opacity: 0 }, { x: '0%', opacity: 1, duration: .8, ease: 'expo.out' });
    setInfo(r);
    renderTracks(r);
    playTrack(0, autoplay);
    if (curZone?.name === 'vinyl') scene('ring', { tint: r.c1, opacity: .5, force: true });
  }
  function updateNp() {
    const show = spinning && !deckSeen && !!cur;
    np.hidden = !show;
    if (cur) npT.textContent = `${cur.tracks?.[ti]?.t || cur.title}`;
  }

  crate.addEventListener('click', e => { const b = e.target.closest('.sl'); if (b) load(RELEASES.find(r => r.id === b.dataset.id)); });
  playBtn.addEventListener('click', () => {
    audio();
    if (!cur) { load(RELEASES.find(r => r.id === 'ah')); return; }
    if (fallback) { setPlaying(!spinning); return; }
    spinning ? player.pause() : player.play();
  });
  nextBtn.addEventListener('click', () => { audio(); next(false); });
  npPlay.addEventListener('click', () => { if (fallback) setPlaying(!spinning); else spinning ? player.pause() : player.play(); });
  npGo.addEventListener('click', () => goTo('#vinyles', -40));
  speedBtns.forEach(b => b.addEventListener('click', () => {
    rpm = +b.dataset.rpm;
    speedBtns.forEach(x => x.classList.toggle('on', x === b));
    player.setRate(rpm === 45 ? 1.25 : 1);
    if (rpm === 45) { toast('45 tours : la chanson passe en accéléré, comme sa carrière après 2015.'); egg('45tours'); }
  }));
  vol.addEventListener('input', () => { player.setVolume(+vol.value); crackle(); });
  crackBtn.addEventListener('click', () => {
    crackleOn = !crackleOn;
    crackBtn.textContent = `Craquements : ${crackleOn ? 'on' : 'off'}`;
    crackBtn.setAttribute('aria-pressed', crackleOn);
    audio(); crackle();
  });
  ScrollTrigger.create({ trigger: '.deck', start: 'top bottom', end: 'bottom top', onToggle: s => { deckSeen = s.isActive; updateNp(); } });

  gsap.from('.crate-wrap, .tt-wrap, .side', { y: 70, opacity: 0, stagger: .1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.deck', start: 'top 82%' } });
  zone('vinyl', { trigger: '#vinyles', start: 'top 55%', end: 'bottom 55%' }, () => scene('ring', { tint: cur?.c1 || RED, opacity: .45 }));
  return { load };
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
    <div class="tc-bar"><i style="--w:${(t.gross / max) * 78}%"></i><b>${t.gross >= 1000 ? nf(t.gross / 1000, 1) + ' Md$' : nf(t.gross, 1) + ' M$'}</b></div></div>`).join('');
  gsap.to('.tc-bar i', { scaleX: 1, duration: 1.6, stagger: .2, ease: 'expo.out', scrollTrigger: { trigger: '.tour-chart', start: 'top 80%' } });
  $('#tour-list').innerHTML = TOURS.map(t => `<li class="${t.big ? 'big' : ''}"><span class="tl-y">${t.years}</span><span class="tl-n">${esc(t.name)}</span><span class="tl-p">${esc(t.note)}</span></li>`).join('');
  gsap.from('#tour-list li', { y: 60, opacity: 0, stagger: .08, duration: .9, ease: 'expo.out', scrollTrigger: { trigger: '#tour-list', start: 'top 85%' } });
  gsap.from('.th-big', { scale: .6, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.tour-hero', start: 'top 80%' } });
  zone('tours', { trigger: '#tournees', start: 'top 55%', end: 'bottom 55%' }, () => scene('c:176', { opacity: .35 }));
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
  zone('records', { trigger: '#records', start: 'top 55%', end: 'bottom 55%' }, () => scene('c:#1', { opacity: .35 }));
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
    trail.push({ x: px, y: py });
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
      const fx = (px - .5) * W * .6, fy = (py - .5) * H * .6;
      g.strokeStyle = `rgba(255,${40 + k * 12},${70 + k * 10},.85)`;
      g.lineWidth = 2; g.shadowColor = '#ff1f3d'; g.shadowBlur = 14;
      g.beginPath();
      trail.forEach((p, i) => { const x = (p.x - .5) * W * .6, y = (p.y - .5) * H * .6; i ? g.lineTo(x, y) : g.moveTo(x, y); });
      g.stroke();
      g.beginPath(); g.arc(fx, fy, 6 + Math.sin(t * 4) * 2, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill();
      g.shadowBlur = 0;
      g.strokeStyle = 'rgba(255,255,255,.08)';
      g.strokeRect(-W * .05 + Math.sin(t + k) * 6, H * .08, W * .1, H * .22);
      g.restore();
    }
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
  zone('bowl', { trigger: '#superbowl', start: 'top 55%', end: 'bottom 55%' }, () => scene('c:LV', { opacity: .35, tint: RED }));
}

/* =========================================================
   QUIZ
   ========================================================= */
const RANKS = [
  [8, 'XO jusqu\'au bout', 'Huit sur huit. Tu connais la carrière mieux que certains de ses producteurs.'],
  [6, 'Fan des premières heures', 'Solide. Tu étais là avant « Blinding Lights », ça se voit.'],
  [4, 'Auditeur du dimanche', 'Pas mal. Il te reste quelques mixtapes à rattraper.'],
  [0, 'Découverte en 2020', 'Ça arrive. Remonte la carrière, tout est en haut de la page.'],
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
  zone('quiz', { trigger: '#quiz', start: 'top 55%', end: 'bottom 55%' }, () => scene('c:?', { opacity: .3 }));
}

/* =========================================================
   FOOTER + LOADER
   ========================================================= */
function setupFooter() {
  const big = $('.foot-big'), chars = split(big);
  gsap.from(chars, { yPercent: 120, rotate: 10, duration: 1.2, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: big, start: 'top 90%', toggleActions: 'play none none reverse' }, onComplete: () => big.classList.add('revealed'), onReverseComplete: () => big.classList.remove('revealed') });
  gsap.from('.foot-om > *', { y: 24, opacity: 0, stagger: .1, duration: .8, ease: 'expo.out', scrollTrigger: { trigger: '.foot-om', start: 'top 92%' } });
  zone('foot', { trigger: '.foot', start: 'top 60%', end: 'bottom top' }, () => scene('c:XO', { opacity: .9, tint: RED, chart: .4 }));
}
const QUIPS = [[0, 'Allumage des étoiles…'], [20, 'Recherche de l\'étoile polaire…'], [42, 'Gonflage des ballons…'], [64, 'Réglage sur 103.5 Dawn FM…'], [88, 'Le week-end commence.']];
function runLoader() {
  const paths = $$('.xo path, .xo circle');
  paths.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  const word = split($('.loader-word')), count = { v: 0 }, cEl = $('#count'), qEl = $('#quip');
  let q = -1;
  const tl = gsap.timeline();
  tl.to(paths, { strokeDashoffset: 0, duration: 1.3, stagger: .25, ease: 'power2.inOut' }, 0)
    .to(count, {
      v: 100, duration: 2.3, ease: 'power3.inOut',
      onUpdate: () => {
        cEl.textContent = Math.round(count.v);
        let k = 0; QUIPS.forEach(([at], j) => { if (count.v >= at) k = j; });
        if (k !== q) { q = k; qEl.textContent = QUIPS[k][1]; gsap.fromTo(qEl, { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: .25 }); }
      },
    }, 0)
    .to('.xo', { opacity: .3, duration: .08, repeat: 5, yoyo: true, ease: 'steps(1)' }, 1.5)
    .from(word, { yPercent: 120, duration: .8, stagger: .03, ease: 'expo.out' }, 1.0)
    .from('.loader-sub', { opacity: 0, y: 14, duration: .7 }, 1.5)
    .from('.loader-meta', { opacity: 0, y: 10, duration: .6 }, 1.3)
    .to('.loader-inner', { opacity: 0, y: -50, duration: .5, ease: 'power2.in' }, 2.7)
    .to($$('.loader-panel').reverse(), { yPercent: -100, duration: 1.1, stagger: .14, ease: 'expo.inOut' }, 2.95)
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
setupDisco();
deck = setupVinyl();
setupTours();
setupRecords();
setupMirror();
setupQuiz();
setupFooter();
initEggs({ P: { pulse: () => sky.pulse() }, scene, restore: restoreScene, lockScroll, isReady: () => ready, isAutoScroll: () => Date.now() < autoUntil, COLORS });

await Promise.race([Promise.all([document.fonts.load('800 100px Syne'), document.fonts.load('italic 40px "Instrument Serif"')]), sleep(2500)]);
runLoader();

console.log('%cXO', 'font:800 40px Syne,Impact;color:#ff1f3d;background:#050506;padding:8px 22px;text-shadow:0 0 12px #ff1f3d');
console.log('%cSite fan non officiel, conçu, codé et animé par Claude. Psst : tape xo() ici.', 'color:#aaa');
