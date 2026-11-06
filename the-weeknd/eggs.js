/* =========================================================
   SECRETS — 15 easter eggs, qui sortent la nuit
   ========================================================= */

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const pick = arr => arr[(Math.random() * arr.length) | 0];
const strip = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const gsap = () => window.gsap;
const fire = o => window.confetti && window.confetti({ disableForReducedMotion: true, ...o });

let ctx = { P: { morph() {}, pulse() {} }, scene() {}, restore() {}, lockScroll() {}, isReady: () => true, isAutoScroll: () => false, COLORS: ['#ff1f3d', '#ffffff'] };

export const EGGS = [
  { id: 'drive', name: 'Conduite de nuit', hint: '↑ ↑ ↓ ↓ ← → ← → B A. (Sur mobile : glisse dans ces directions, puis deux taps.)', desc: 'Une autoroute, des néons, et aucune limite de vitesse.' },
  { id: 'xo', name: 'XO', hint: 'Tape au clavier ce que l\'on écrit à la fin d\'un message, deux fois de suite.', desc: 'Des bisous et des câlins, en rouge.' },
  { id: 'starboy', name: 'Starboy', hint: 'Tape au clavier le titre de l\'album de 2016.', desc: 'Une étoile, une croix, et Daft Punk pas loin.' },
  { id: 'abel', name: 'Le vrai nom', hint: 'Tape au clavier son vrai prénom.', desc: 'Abel Makkonen Tesfaye, Toronto, 16.02.1990.' },
  { id: 'afterhours', name: 'Costume rouge', hint: 'Tape au clavier le titre de l\'album de 2020, sans espace.', desc: 'Les néons de Las Vegas s\'allument.' },
  { id: 'dawnfm', name: '103.5', hint: 'Tape au clavier le nom de la radio de 2022, sans espace.', desc: 'Tu écoutes 103.5 Dawn FM.' },
  { id: 'kissland', name: 'Néon rose', hint: 'Tape au clavier le titre du premier album studio, sans espace.', desc: 'Kiss Land s\'allume en rose.' },
  { id: 'balloons', name: 'La maison des ballons', hint: 'Tape au clavier ce qui remplit la maison de la première mixtape (en anglais).', desc: 'Des ballons s\'envolent, comme en mars 2011.' },
  { id: 'onglet', name: 'Le retour', hint: 'Pars sur un autre onglet. Puis reviens.', desc: 'Le week-end, on finit toujours par revenir.' },
  { id: 'nuit', name: '3 h du matin', hint: 'Ne touche plus à rien pendant 30 secondes.', desc: 'Il est tard. After hours.' },
  { id: 'logo', name: 'Bisou bisou', hint: 'Le logo XO aime qu\'on insiste. Cinq fois.', desc: 'XO.' },
  { id: '45tours', name: '45 tours', hint: 'Sur la platine, change la vitesse.', desc: 'Tout va plus vite.' },
  { id: 'miroirs', name: 'La galerie des glaces', hint: 'Trouve les 7 miroirs cachés du Super Bowl.', desc: 'Sortie trouvée.' },
  { id: 'quiz', name: 'Sans faute', hint: 'Fais 8/8 au quiz.', desc: 'XO jusqu\'au bout.' },
  { id: 'console', name: 'Le studio', hint: 'Ouvre la console du navigateur (F12). Un message t\'y attend.', desc: 'Tu as trouvé la régie.' },
];

const KEY = 'tw-secrets-v1';
let found = new Set();
try { found = new Set((JSON.parse(localStorage.getItem(KEY) || '[]') || []).filter(id => EGGS.some(e => e.id === id))); } catch { /* private mode */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...found])); } catch { /* ignore */ } };

export function egg(id) {
  const e = EGGS.find(x => x.id === id);
  if (!e || found.has(id)) return false;
  found.add(id); save(); renderTracker(true);
  const n = found.size, N = EGGS.length;
  toast(`<span class="t-egg">XO</span><span><b>Secret ${n}/${N} · ${e.name}</b><br>${e.desc}</span>`, { kind: 'egg', dur: 5600 });
  if (n === N) setTimeout(finale, 1800);
  return true;
}

/* ---------- toasts ---------- */
let wrap;
export function toast(html, { kind = '', dur = 4600 } = {}) {
  if (!wrap) { wrap = el('div', 'toasts'); wrap.setAttribute('aria-live', 'polite'); document.body.append(wrap); }
  const t = el('div', 'toast ' + kind, kind === 'egg' ? html : `<span>${html}</span>`);
  wrap.append(t);
  while (wrap.children.length > 3) wrap.firstElementChild.remove();
  gsap().fromTo(t, { y: -30, opacity: 0, scale: .92 }, { y: 0, opacity: 1, scale: 1, duration: .55, ease: 'back.out(2)' });
  setTimeout(() => gsap().to(t, { y: -16, opacity: 0, duration: .35, onComplete: () => t.remove() }), dur);
  return t;
}

/* ---------- escape stack ---------- */
const escStack = [];
export function onEscape(fn) { escStack.push(fn); return () => { const i = escStack.lastIndexOf(fn); if (i > -1) escStack.splice(i, 1); }; }

/* ---------- tracker ---------- */
let pill, panel, open = false, offEsc = null;
function buildTracker() {
  pill = el('button', 'eggs-pill', `<i>XO</i><b>0/${EGGS.length}</b>`);
  pill.type = 'button';
  pill.setAttribute('aria-label', 'Secrets trouvés');
  pill.dataset.cursor = 'Secrets';
  pill.addEventListener('click', () => togglePanel());
  panel = el('div', 'eggs-panel');
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Les secrets');
  panel.innerHTML = `
    <div class="ep-head"><div><div class="ep-k">Ils sortent la nuit</div><b>Les ${EGGS.length} secrets</b></div><span class="ep-count eggs-count">0/${EGGS.length}</span><button class="ep-x" type="button" aria-label="Fermer">×</button></div>
    <ol class="ep-list" data-lenis-prevent></ol>
    <form class="ep-code" autocomplete="off"><input type="text" placeholder="Un code secret ? Tape-le ici…" aria-label="Code secret" autocapitalize="off" autocorrect="off" spellcheck="false"><button type="submit">OK</button></form>
    <div class="ep-foot"><span>Sauvegardé sur cet appareil</span><button type="button" class="ep-reset">Réinitialiser</button></div>`;
  document.body.append(pill, panel);
  $('.ep-x', panel).addEventListener('click', () => togglePanel(false));
  $('.ep-reset', panel).addEventListener('click', () => { found.clear(); save(); renderTracker(); toast('Compteur remis à zéro. Nouveau week-end.'); });
  $('.ep-code', panel).addEventListener('submit', e => {
    e.preventDefault();
    const input = $('input', panel), v = strip(input.value).replace(/[^a-z0-9↑↓←→]/g, '');
    input.value = '';
    const id = CODES[v];
    if (id) { togglePanel(false); setTimeout(() => run(id), 350); return; }
    gsap().fromTo(input, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1.2,.25)' });
    toast('Code inconnu. Essaie le titre d\'un album, sans espace.');
  });
  renderTracker();
}
function togglePanel(force) {
  open = force ?? !open;
  panel.hidden = !open;
  if (open) {
    renderTracker();
    gsap().fromTo(panel, { y: 24, opacity: 0, scale: .96 }, { y: 0, opacity: 1, scale: 1, duration: .45, ease: 'expo.out' });
    offEsc = onEscape(() => togglePanel(false));
  } else offEsc?.();
}
function renderTracker(bump) {
  if (!pill) return;
  const n = found.size, N = EGGS.length;
  $$('.eggs-count').forEach(e => { e.textContent = `${n}/${N}`; });
  $$('.eggs-total').forEach(e => { e.textContent = N; });
  $('b', pill).textContent = `${n}/${N}`;
  pill.classList.toggle('show', n > 0);
  pill.classList.toggle('done', n === N);
  if (bump) gsap().fromTo(pill, { scale: 1.4 }, { scale: 1, duration: .9, ease: 'elastic.out(1,.4)' });
  $('.ep-list', panel).innerHTML = EGGS.map((e, i) => {
    const got = found.has(e.id);
    return `<li class="${got ? 'got' : ''}"><span class="ep-i">${got ? 'XO' : '··'}</span><div><b>${got ? e.name : 'Secret n°' + (i + 1)}</b><span>${got ? e.desc : e.hint}</span></div></li>`;
  }).join('');
}

/* =========================================================
   TRIGGERS
   ========================================================= */
const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
const TYPED = [['xoxo', 'xo'], ['starboy', 'starboy'], ['abel', 'abel'], ['afterhours', 'afterhours'], ['dawnfm', 'dawnfm'], ['kissland', 'kissland'], ['balloons', 'balloons']];
const CODES = { konami: 'drive', uuddlrlrba: 'drive', '↑↑↓↓←→←→ba': 'drive', xoxo: 'xo', xo: 'xo', starboy: 'starboy', abel: 'abel', afterhours: 'afterhours', dawnfm: 'dawnfm', kissland: 'kissland', balloons: 'balloons', houseofballoons: 'balloons' };
const FX = { drive, xo: xoxo, starboy, abel, afterhours, dawnfm, kissland, balloons };
let busy = false;
function run(id) { if (!ctx.isReady() || busy) return; FX[id]?.(); }

function setupKeys() {
  let kpos = 0, buf = '';
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && escStack.length) { e.preventDefault(); escStack[escStack.length - 1](); return; }
    if (e.target.closest?.('input,textarea,select,[contenteditable]')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = (e.key || '').toLowerCase();
    if (k === KONAMI[kpos]) { kpos++; if (kpos === KONAMI.length) { kpos = 0; run('drive'); return; } } else kpos = k === KONAMI[0] ? 1 : 0;
    if (k.length !== 1) return;
    const ch = strip(k);
    if (!/[a-z0-9]/.test(ch)) return;
    buf = (buf + ch).slice(-16);
    for (const [code, id] of TYPED) if (buf.endsWith(code)) { buf = ''; run(id); break; }
  });
  let ts = null, seq = [];
  addEventListener('touchstart', e => { const t = e.touches[0]; ts = { x: t.clientX, y: t.clientY, at: Date.now() }; }, { passive: true });
  addEventListener('touchend', e => {
    if (!ts) return;
    const t = e.changedTouches[0], dx = t.clientX - ts.x, dy = t.clientY - ts.y, ax = Math.abs(dx), ay = Math.abs(dy);
    let g = null;
    if (Math.max(ax, ay) < 12 && Date.now() - ts.at < 350) g = 'tap';
    else if (ax > 45 && ax > ay * 1.4) g = dx > 0 ? 'right' : 'left';
    else if (ay > 45 && ay > ax * 1.4) g = dy < 0 ? 'up' : 'down';
    ts = null;
    if (!g) return;
    seq = [...seq, g].slice(-10);
    if (seq.join() === 'up,up,down,down,left,right,left,right,tap,tap') { seq = []; run('drive'); }
  }, { passive: true });
}
function setupLogo() {
  const b = $('.brand');
  let n = 0, t;
  b.addEventListener('click', () => {
    n++; clearTimeout(t); t = setTimeout(() => { n = 0; }, 1600);
    gsap().fromTo(b, { scale: 1.25 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
    if (n < 5) return;
    n = 0;
    b.classList.add('glow');
    setTimeout(() => b.classList.remove('glow'), 6000);
    ctx.scene('xo', { opacity: 1 }); ctx.P.pulse();
    setTimeout(() => ctx.restore(), 3500);
    egg('logo');
  });
}
function setupTab() {
  const base = document.title;
  const AWAY = ['Reviens… le week-end n\'est pas fini', 'XO · on t\'attend', 'Il est 3 h du matin, reviens'];
  let at = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { at = Date.now(); document.title = pick(AWAY); return; }
    document.title = base;
    if (at && Date.now() - at > 1200) setTimeout(() => egg('onglet'), 500);
    at = 0;
  });
}
function setupIdle() {
  let t, first = true;
  const arm = () => { clearTimeout(t); t = setTimeout(idle, first ? 30000 : 90000); };
  function idle() {
    if (document.hidden || busy || !ctx.isReady() || escStack.length) { arm(); return; }
    clock();
    if (first) { first = false; setTimeout(() => egg('nuit'), 2200); }
    arm();
  }
  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach(ev => addEventListener(ev, arm, { passive: true }));
  arm();
}
function setupConsole() {
  window.xo = () => {
    console.log('%c X  O ', 'font:800 60px Syne,Impact;color:#ff1f3d;text-shadow:0 0 20px #ff1f3d');
    console.table([
      { album: 'Beauty Behind the Madness', année: 2015, 'Billboard 200': 1 },
      { album: 'Starboy', année: 2016, 'Billboard 200': 1 },
      { album: 'After Hours', année: 2020, 'Billboard 200': 1 },
      { album: 'Hurry Up Tomorrow', année: 2025, 'Billboard 200': 1 },
    ]);
    egg('console');
    return 'Bienvenue dans la régie. Le week-end continue.';
  };
}

/* =========================================================
   EFFECTS
   ========================================================= */
function overlay(cls, html, ms, after) {
  busy = true;
  const ov = el('div', 'fx-overlay ' + cls, html);
  document.body.append(ov);
  const G = gsap();
  G.fromTo(ov, { opacity: 0 }, { opacity: 1, duration: .35 });
  setTimeout(() => G.to(ov, { opacity: 0, duration: .5, onComplete: () => { ov.remove(); busy = false; after?.(); } }), ms);
  return ov;
}
function flicker(node) { gsap().fromTo(node, { opacity: 0 }, { opacity: 1, duration: .07, repeat: 7, yoyo: true, ease: 'steps(1)', onComplete: () => gsap().set(node, { opacity: 1 }) }); }

/* 1. Konami → night drive (synthwave road, generated arpeggio) */
function drive() {
  busy = true;
  ctx.lockScroll(true);
  const ov = el('div', 'fx-overlay drive');
  const cv = el('canvas');
  ov.append(cv, el('div', 'fx-cap', matchMedia('(hover: none)').matches ? 'Conduite de nuit · touche pour sortir' : 'Conduite de nuit · clique ou Échap pour sortir'));
  document.body.append(ov);
  const W = innerWidth, H = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const g = cv.getContext('2d');
  g.scale(dpr, dpr);
  const hz = H * .55;
  const towers = Array.from({ length: 26 }, (_, i) => ({ x: (i / 26) * W + Math.random() * 30, w: 20 + Math.random() * 50, h: 30 + Math.random() * 140, lit: Math.random() }));
  let raf = 0, t0 = performance.now(), closed = false;
  function frame(now) {
    const t = (now - t0) / 1000;
    const sky = g.createLinearGradient(0, 0, 0, hz);
    sky.addColorStop(0, '#050008'); sky.addColorStop(.7, '#2a0014'); sky.addColorStop(1, '#ff1f3d');
    g.fillStyle = sky; g.fillRect(0, 0, W, hz);
    // sun
    g.save();
    const sr = Math.min(W, H) * .2;
    const sg = g.createLinearGradient(0, hz - sr * 1.6, 0, hz);
    sg.addColorStop(0, '#ffd1d6'); sg.addColorStop(1, '#ff1f3d');
    g.fillStyle = sg;
    g.beginPath(); g.arc(W / 2, hz - sr * .25, sr, Math.PI, 0); g.fill();
    g.fillStyle = '#2a0014';
    for (let k = 0; k < 6; k++) g.fillRect(W / 2 - sr, hz - sr * .25 - k * sr * .14 - 2, sr * 2, 2 + k * .9);
    g.restore();
    // skyline
    towers.forEach(tw => {
      g.fillStyle = '#0a0006';
      g.fillRect(tw.x, hz - tw.h, tw.w, tw.h);
      g.fillStyle = `rgba(255,${120 + tw.lit * 100},${140 + tw.lit * 80},.8)`;
      for (let y = hz - tw.h + 8; y < hz - 6; y += 12) for (let x = tw.x + 5; x < tw.x + tw.w - 5; x += 10) if (((x * 7 + y * 3) | 0) % 5 === 0) g.fillRect(x, y, 3, 4);
    });
    // road
    g.fillStyle = '#050003'; g.fillRect(0, hz, W, H - hz);
    g.strokeStyle = 'rgba(255,31,61,.75)'; g.lineWidth = 1.5; g.shadowColor = '#ff1f3d'; g.shadowBlur = 10;
    for (let i = -12; i <= 12; i++) { g.beginPath(); g.moveTo(W / 2 + i * 8, hz); g.lineTo(W / 2 + i * W * .16, H); g.stroke(); }
    const off = (t * 1.6) % 1;
    for (let k = 0; k < 14; k++) { const z = (k + off) / 14, y = hz + Math.pow(z, 2.4) * (H - hz); g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.shadowBlur = 0;
    // centre dashes
    g.fillStyle = '#fff';
    for (let k = 0; k < 10; k++) { const z = ((k + off * 2) % 10) / 10, y = hz + Math.pow(z, 2.4) * (H - hz), w = 2 + z * 10, hgt = 4 + z * 40; g.fillRect(W / 2 - w / 2, y, w, hgt); }
    // the car ahead: tail lights
    const cx = W / 2 + Math.sin(t * .8) * W * .05, cy = H * .78;
    g.fillStyle = '#120207'; g.fillRect(cx - 90, cy - 24, 180, 50);
    g.shadowColor = '#ff1f3d'; g.shadowBlur = 30; g.fillStyle = '#ff2a45';
    g.fillRect(cx - 82, cy - 12, 50, 10); g.fillRect(cx + 32, cy - 12, 50, 10);
    g.shadowBlur = 0;
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  const stop = synth();
  setTimeout(() => { if (!closed) egg('drive'); }, 1600);
  gsap().fromTo(ov, { opacity: 0 }, { opacity: 1, duration: .5 });
  const auto = setTimeout(close, 14000), off = onEscape(close);
  ov.addEventListener('click', close);
  function close() {
    if (closed) return;
    closed = true; clearTimeout(auto); off(); stop();
    gsap().to(ov, { opacity: 0, duration: .6, onComplete: () => { cancelAnimationFrame(raf); ov.remove(); } });
    ctx.lockScroll(false); busy = false;
  }
}
function synth() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return () => {};
    const ac = new AC(), out = ac.createGain(), lp = ac.createBiquadFilter();
    out.gain.value = .18; lp.type = 'lowpass'; lp.frequency.value = 2400;
    lp.connect(out).connect(ac.destination);
    // an original arpeggio over a minor progression (not any song by the artist)
    const prog = [[220, 261.6, 329.6], [174.6, 220, 261.6], [196, 246.9, 293.7], [164.8, 207.7, 246.9]];
    const step = .16, t0 = ac.currentTime + .2;
    for (let bar = 0; bar < 20; bar++) {
      const ch = prog[bar % 4];
      for (let s = 0; s < 8; s++) {
        const f = ch[s % 3] * (s >= 3 && s < 6 ? 2 : 1), at = t0 + (bar * 8 + s) * step;
        const o = ac.createOscillator(), gn = ac.createGain();
        o.type = 'square'; o.frequency.value = f;
        gn.gain.setValueAtTime(0, at); gn.gain.linearRampToValueAtTime(.25, at + .01); gn.gain.exponentialRampToValueAtTime(.001, at + step * .95);
        o.connect(gn).connect(lp); o.start(at); o.stop(at + step);
      }
      const b = ac.createOscillator(), bg = ac.createGain(), at = t0 + bar * 8 * step;
      b.type = 'sawtooth'; b.frequency.value = ch[0] / 2;
      bg.gain.setValueAtTime(.0, at); bg.gain.linearRampToValueAtTime(.35, at + .05); bg.gain.setValueAtTime(.35, at + 8 * step - .1); bg.gain.linearRampToValueAtTime(0, at + 8 * step);
      b.connect(bg).connect(lp); b.start(at); b.stop(at + 8 * step);
    }
    return () => { out.gain.setTargetAtTime(0, ac.currentTime, .1); setTimeout(() => ac.close().catch(() => {}), 500); };
  } catch { return () => {}; }
}

/* 2. "xoxo" */
function xoxo() {
  busy = true;
  ctx.scene('xo', { opacity: 1 }); ctx.P.pulse();
  let shapes = ['circle'];
  try { if (window.confetti?.shapeFromText) shapes = [window.confetti.shapeFromText({ text: 'X', scalar: 2.2, color: '#ff1f3d' }), window.confetti.shapeFromText({ text: 'O', scalar: 2.2, color: '#ffffff' })]; } catch { /* ignore */ }
  fire({ particleCount: 90, spread: 120, startVelocity: 42, scalar: 2.2, shapes, origin: { x: .5, y: .6 }, ticks: 260 });
  setTimeout(() => { busy = false; ctx.restore(); egg('xo'); }, 2600);
}
/* 3. "starboy" */
function starboy() {
  ctx.scene('star', { tint: '#4d7cff', opacity: 1 }); ctx.P.pulse();
  const ov = overlay('neon blue', '<div class="neon-t">Starboy<small>25.11.2016 · avec Daft Punk</small></div>', 2800, () => { ctx.restore(); egg('starboy'); });
  flicker($('.neon-t', ov));
}
/* 4. "abel" */
function abel() {
  const days = Math.floor((Date.now() - new Date('1990-02-16T12:00:00').getTime()) / 864e5);
  fire({ particleCount: 80, spread: 90, origin: { x: .5, y: .3 }, colors: ctx.COLORS });
  toast(`<b>Abel Makkonen Tesfaye</b>, né le 16 février 1990 à Toronto, de parents éthiopiens. Ça fait ${new Intl.NumberFormat('fr-FR').format(days)} jours aujourd'hui.`, { dur: 7000 });
  egg('abel');
}
/* 5. "afterhours" */
function afterhours() {
  ctx.scene('t:AFTER HOURS', { opacity: 1 });
  const ov = overlay('neon red', '<div class="neon-t">After Hours<small>20.03.2020 · costume rouge, lunettes, Las Vegas</small></div>', 3200, () => { ctx.restore(); egg('afterhours'); });
  flicker($('.neon-t', ov));
}
/* 6. "dawnfm" — radio tuning */
function dawnfm() {
  const ov = overlay('radio', '<div class="rd-box"><div class="rd-k">Radio · FM</div><div class="rd-f">87.5</div><div class="rd-dial"><i></i></div><div class="rd-s">Recherche de station…</div></div>', 4600, () => egg('dawnfm'));
  const f = $('.rd-f', ov), s = $('.rd-s', ov), needle = $('.rd-dial i', ov), o = { v: 87.5 };
  const stop = noise();
  gsap().timeline()
    .to(o, { v: 103.5, duration: 2.2, ease: 'power2.inOut', onUpdate: () => { f.textContent = o.v.toFixed(1); needle.style.left = ((o.v - 87.5) / 20.5) * 100 + '%'; } })
    .add(() => { s.textContent = 'Vous écoutez 103.5 Dawn FM. Restez à l\'écoute.'; stop(); });
}
function noise() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return () => {};
    const ac = new AC(), b = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource(), bp = ac.createBiquadFilter(), gn = ac.createGain();
    src.buffer = b; bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = .6; gn.gain.value = .06;
    bp.frequency.linearRampToValueAtTime(600, ac.currentTime + 2.2);
    src.connect(bp).connect(gn).connect(ac.destination); src.start();
    return () => { gn.gain.setTargetAtTime(0, ac.currentTime, .1); setTimeout(() => ac.close().catch(() => {}), 400); };
  } catch { return () => {}; }
}
/* 7. "kissland" */
function kissland() {
  ctx.scene('t:KISS LAND', { tint: '#ff3d8b', opacity: 1 });
  const ov = overlay('neon pink', '<div class="neon-t">Kiss Land<small>10.09.2013 · le premier album studio</small></div>', 3000, () => { ctx.restore(); egg('kissland'); });
  flicker($('.neon-t', ov));
}
/* 8. "balloons" */
function balloons() {
  busy = true;
  const G = gsap(), COLS = ['#f4efe9', '#d9d4cf', '#ff1f3d', '#bdbdbd', '#ffffff'];
  for (let i = 0; i < 16; i++) {
    const b = el('div', 'balloon', '<i></i>');
    b.style.left = (Math.random() * 92) + 'vw';
    b.style.setProperty('--bc', pick(COLS));
    document.body.append(b);
    G.to(b, { y: -(innerHeight + 260), x: (Math.random() - .5) * 160, rotate: (Math.random() - .5) * 30, duration: reduce ? 2 : 5 + Math.random() * 3, delay: Math.random() * 1.2, ease: 'power1.in', onComplete: () => b.remove() });
  }
  toast('House of Balloons, 21 mars 2011. La première mixtape, gratuite.');
  setTimeout(() => { busy = false; egg('balloons'); }, 2400);
}
/* 9. idle → 3 a.m. */
function clock() {
  const ov = overlay('clock', '<div class="clock-t">3:00<small>Il est tard. After hours.</small></div>', 3600);
  flicker($('.clock-t', ov));
}

/* ---------- all found ---------- */
function finale() {
  ctx.scene('xo', { opacity: 1 }); ctx.P.pulse();
  gsap().fromTo('.flash', { opacity: 1 }, { opacity: 0, duration: 1.2 });
  const end = Date.now() + 2600;
  (function frame() {
    fire({ particleCount: 8, angle: 60, spread: 70, origin: { x: 0, y: .8 }, colors: ctx.COLORS });
    fire({ particleCount: 8, angle: 120, spread: 70, origin: { x: 1, y: .8 }, colors: ctx.COLORS });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  toast(`<span class="t-egg">XO</span><span><b>${EGGS.length}/${EGGS.length} · Tout trouvé.</b><br>Le week-end est fini. Enfin, jusqu'au prochain.</span>`, { kind: 'egg', dur: 9000 });
  setTimeout(() => ctx.restore(), 6000);
}

export function initEggs(c) {
  ctx = { ...ctx, ...c };
  buildTracker();
  setupKeys();
  setupLogo();
  setupTab();
  setupIdle();
  setupConsole();
  $('#eggs-open')?.addEventListener('click', () => togglePanel(true));
}
