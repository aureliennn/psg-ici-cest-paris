/* =========================================================
   EASTER EGGS — 13 secrets, un tracker, et un poulet
   ========================================================= */

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[(Math.random() * arr.length) | 0];
const strip = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const gsap = () => window.gsap;
const fire = o => window.confetti && window.confetti({ disableForReducedMotion: true, ...o });

/* context injected by main.js: { P, scene, restore, lockScroll, isReady, COLORS } */
let ctx = { P: { morph() {}, pulse() {} }, scene() {}, restore() {}, lockScroll() {}, isReady: () => true, isAutoScroll: () => false, COLORS: ['#e8c25a', '#ffffff', '#da291c', '#1f6fd1'] };

export const EGG_ICON = '<svg viewBox="0 0 30 38" aria-hidden="true"><path d="M15 1C24 1 29 15 29 23C29 32 23 37 15 37C7 37 1 32 1 23C1 15 6 1 15 1Z" fill="url(#egg-gold)"/><path d="M9 12 Q12 7 15 6" stroke="#fff8dc" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/></svg>';

export const EGGS = [
  { id: 'konami', name: 'Le tifo', hint: '↑ ↑ ↓ ↓ ← → ← → B A. Les anciens savent. (Sur mobile : glisse, puis deux taps.)', desc: 'Le Parc a sorti le tifo. Monte le son.' },
  { id: 'marseille', name: 'Rétrogradation', hint: 'Écris leur nom au clavier. N\'importe où, sauf dans la barre de recherche.', desc: 'Le site est descendu en D2. Comme eux en 1994.' },
  { id: '1993', name: 'La cassette', hint: 'Tape au clavier l\'année préférée des Marseillais.', desc: 'Rembobinage jusqu\'à leur dernier grand soir.' },
  { id: 'poulet', name: 'Le poulet parisien', hint: 'Un poulet se cache dans le code. Appelle-le par son nom.', desc: 'Il pond des œufs en or. Plus que l\'OM depuis 2012.' },
  { id: 'enveloppe', name: 'L\'enveloppe', hint: 'Une enveloppe traîne dans l\'Histoire. Fouille le jardin de 1993.', desc: 'Retrouvée dans un jardin. Ça ne te rappelle rien ?' },
  { id: 'logo', name: 'La troisième étoile', hint: 'Le logo en haut à gauche aime qu\'on insiste. Sept fois.', desc: '★★★ en avance sur le calendrier.' },
  { id: 'onglet', name: 'Le retour', hint: 'Pars voir un autre onglet. Puis reviens.', desc: 'Toi au moins, tu reviens toujours.' },
  { id: 'silence', name: 'Le silence', hint: 'Ne touche plus à rien pendant 30 secondes.', desc: 'Le bruit exact de leur salle des trophées.' },
  { id: 'version-om', name: 'La version marseillaise', hint: 'Il existe une version marseillaise du site, tout en bas. Bon courage.', desc: 'Bloquée à 93 %. Évidemment.' },
  { id: 'nimes', name: 'Les Crocos', hint: 'Tape au clavier le nom de la ville des crocodiles. Allez le Gard.', desc: 'Le croco nîmois a croqué Marseille.' },
  { id: 'console', name: 'Le développeur', hint: 'Ouvre la console (F12). Quelqu\'un t\'y a laissé une commande.', desc: 'palmaresOM() : tableau vide. Comme prévu.' },
  { id: 'reve', name: 'Le rêve', hint: 'Simule assez de saisons de l\'OM : ils finiront par rêver.', desc: 'Champions… puis le réveil a sonné.' },
  { id: 'poussiere', name: 'Coup de chiffon', hint: 'Au musée de l\'OM, la coupe de 1993 prend la poussière.', desc: 'Elle brille comme en 1993. Profites-en.' },
  { id: 'fevrier', name: 'Février', hint: 'Tape au clavier le mois préféré de l\'OM. Il est court, et il fait mal.', desc: 'Tout s\'est effondré. Comme chaque année.' },
  { id: 'allezlom', name: 'Allez l\'OM', hint: 'Encourage-les au clavier : « allez l\'om ». Prépare-toi à être déçu.', desc: 'Trombone triste et site en noir et blanc.' },
  { id: 'feu', name: 'Feu d\'artifice', hint: 'Tape au clavier la devise du club. Celle du marquee.', desc: 'Paris s\'illumine. Comme d\'habitude.' },
  { id: 'rage', name: 'Rage quit', hint: 'Secoue la souris (ou le téléphone) comme un Marseillais après un Classique.', desc: 'Calme-toi. T\'es pas au Vélodrome.' },
  { id: 'etoile-om', name: 'L\'étoile qui lâche', hint: 'Dans le Classique, l\'étoile de Marseille ne tient plus très bien. Clique dessus.', desc: 'Elle datait de 1993. Elle a lâché.' },
  { id: 'fuite', name: 'La fuite', hint: 'Scrolle très, très vite. Comme une sortie de Vélodrome à la 80e.', desc: 'Même pas eu le temps de voir le score.' },
  { id: 'zero', name: 'Le zéro pointé', hint: 'Termine le quiz avec 0 bonne réponse. Exprès.', desc: '0/8. Comme leur nombre de trophées depuis 2012.' },
  { id: 'porte-parole', name: 'Porte-parole', hint: 'Génère 15 excuses officielles d\'affilée.', desc: 'Prêt pour la conférence de presse d\'après-match.' },
  { id: 'poulailler', name: 'Le poulailler d\'or', hint: 'Marque 20 points en œufs dorés au jeu du poulet.', desc: 'Dix fois plus que leurs trophées majeurs depuis 1993.' },
];

const KEY = 'psg-secrets-v1';
let found = new Set();
try { found = new Set((JSON.parse(localStorage.getItem(KEY) || '[]') || []).filter(id => EGGS.some(e => e.id === id))); } catch { /* private mode */ }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...found])); } catch { /* ignore */ } };

export const hasEgg = id => found.has(id);

export function egg(id) {
  const e = EGGS.find(x => x.id === id);
  if (!e || found.has(id)) return false;
  found.add(id);
  save();
  renderTracker(true);
  const n = found.size, N = EGGS.length;
  toast(`<span class="t-egg">${EGG_ICON}</span><span><b>Secret ${n}/${N} · ${e.name}</b><br>${e.desc}</span>`, { kind: 'egg', dur: 5600 });
  if (n === N) setTimeout(finale, 1800);
  return true;
}

/* ---------- toasts ---------- */
let toastWrap;
export function toast(html, { kind = '', dur = 4600 } = {}) {
  if (!toastWrap) {
    toastWrap = el('div', 'toasts');
    toastWrap.setAttribute('aria-live', 'polite');
    document.body.append(toastWrap);
  }
  const t = el('div', 'toast ' + kind, kind === 'egg' ? html : `<span>${html}</span>`);
  toastWrap.append(t);
  while (toastWrap.children.length > 3) toastWrap.firstElementChild.remove();
  gsap().fromTo(t, { y: -30, opacity: 0, scale: .92 }, { y: 0, opacity: 1, scale: 1, duration: .55, ease: 'back.out(2)' });
  setTimeout(() => gsap().to(t, { y: -16, opacity: 0, duration: .35, onComplete: () => t.remove() }), dur);
  return t;
}

/* ---------- escape stack (modals / overlays) ---------- */
const escStack = [];
export function onEscape(fn) {
  escStack.push(fn);
  return () => { const i = escStack.lastIndexOf(fn); if (i > -1) escStack.splice(i, 1); };
}

/* ---------- tracker ---------- */
let pill, panel, panelOpen = false, offPanelEsc = null;
function buildTracker() {
  pill = el('button', 'eggs-pill', `${EGG_ICON}<b>0/${EGGS.length}</b>`);
  pill.type = 'button';
  pill.setAttribute('aria-label', 'Secrets trouvés');
  pill.dataset.cursor = 'Secrets';
  pill.addEventListener('click', () => togglePanel());

  panel = el('div', 'eggs-panel');
  panel.hidden = true;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Chasse aux secrets');
  panel.innerHTML = `
    <div class="ep-head">
      <div><div class="ep-k">Chasse aux œufs</div><b>Les ${EGGS.length} secrets</b></div>
      <span class="ep-count eggs-count">0/${EGGS.length}</span>
      <button class="ep-x" type="button" aria-label="Fermer">×</button>
    </div>
    <ol class="ep-list" data-lenis-prevent></ol>
    <form class="ep-code" autocomplete="off">
      <input type="text" placeholder="Un code secret ? Tape-le ici…" aria-label="Code secret" autocapitalize="off" autocorrect="off" spellcheck="false">
      <button type="submit">OK</button>
    </form>
    <div class="ep-foot"><span>Sauvegardé sur cet appareil</span><button type="button" class="ep-reset">Réinitialiser</button></div>`;
  document.body.append(pill, panel);

  $('.ep-x', panel).addEventListener('click', () => togglePanel(false));
  $('.ep-reset', panel).addEventListener('click', () => {
    found.clear(); save(); renderTracker();
    toast('Compteur remis à zéro. Comme l\'armoire à trophées de l\'OM.');
  });
  $('.ep-code', panel).addEventListener('submit', e => {
    e.preventDefault();
    const input = $('input', panel), v = strip(input.value).replace(/[^a-z0-9↑↓←→]/g, '');
    input.value = '';
    const id = CODE_MAP[v];
    if (id) { togglePanel(false); setTimeout(() => run(id), 350); return; }
    gsap().fromTo(input, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1.2,.25)' });
    toast('Code inconnu. Comme le mot « trophée » à Marseille.');
  });
  renderTracker();
}
export function togglePanel(force) {
  panelOpen = force ?? !panelOpen;
  panel.hidden = !panelOpen;
  if (panelOpen) {
    renderTracker();
    gsap().fromTo(panel, { y: 24, opacity: 0, scale: .96 }, { y: 0, opacity: 1, scale: 1, duration: .45, ease: 'expo.out' });
    gsap().from($$('.ep-list li', panel), { x: -14, opacity: 0, stagger: .03, duration: .35, ease: 'power2.out' });
    offPanelEsc = onEscape(() => togglePanel(false));
  } else offPanelEsc?.();
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
    return `<li class="${got ? 'got' : ''}"><span class="ep-i">${EGG_ICON}</span><div><b>${got ? e.name : 'Secret n°' + (i + 1)}</b><span>${got ? e.desc : e.hint}</span></div></li>`;
  }).join('');
}

/* =========================================================
   TRIGGERS
   ========================================================= */
const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
const TYPED = [['marseille', 'marseille'], ['1993', '1993'], ['poulet', 'poulet'], ['nimes', 'nimes'], ['fevrier', 'fevrier'], ['allezlom', 'allezlom'], ['icicestparis', 'feu']];
const CODE_MAP = {
  marseille: 'marseille', om: 'marseille', '1993': '1993', poulet: 'poulet', nimes: 'nimes', crocos: 'nimes',
  konami: 'konami', uuddlrlrba: 'konami', '↑↑↓↓←→←→ba': 'konami', hauthautbasbasgauchedroitegauchedroiteba: 'konami', tifo: 'konami',
  fevrier: 'fevrier', allezlom: 'allezlom', icicestparis: 'feu',
};
const FX = { konami: tifo, marseille: relegation, '1993': vhs, poulet: chicken, nimes: croc, fevrier, allezlom, feu: fireworks };
let fxBusy = false;
function run(id) {
  if (!ctx.isReady() || fxBusy) return;
  FX[id]?.();
}

function setupKeys() {
  let kpos = 0, buf = '';
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && escStack.length) { e.preventDefault(); escStack[escStack.length - 1](); return; }
    if (e.target.closest?.('input,textarea,select,[contenteditable]')) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = (e.key || '').toLowerCase();
    if (k === KONAMI[kpos]) { kpos++; if (kpos === KONAMI.length) { kpos = 0; run('konami'); return; } }
    else kpos = k === KONAMI[0] ? 1 : 0;
    if (k.length !== 1) return;
    const ch = strip(k);
    if (!/[a-z0-9]/.test(ch)) return; // spaces and apostrophes don't break a code ("allez l'om")
    buf = (buf + ch).slice(-16);
    for (const [code, id] of TYPED) if (buf.endsWith(code)) { buf = ''; run(id); break; }
  });

  // touch konami: swipe ↑ ↑ ↓ ↓ ← → ← → then tap, tap
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
    if (seq.join() === 'up,up,down,down,left,right,left,right,tap,tap') { seq = []; run('konami'); }
  }, { passive: true });
}

function setupLogo() {
  const brand = $('.brand'), star = $('.brand span');
  let n = 0, t, revert;
  brand.addEventListener('click', () => {
    n++;
    clearTimeout(t);
    t = setTimeout(() => { n = 0; }, 1600);
    gsap().fromTo(star, { scale: 1.6 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
    if (n < 7) return;
    n = 0;
    star.textContent = '★★★';
    star.classList.add('three');
    const r = brand.getBoundingClientRect();
    fire({ particleCount: 110, spread: 80, startVelocity: 38, origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height) / innerHeight }, colors: ['#e8c25a', '#fff1b8', '#ffffff'], shapes: ['star'], scalar: 1.2 });
    ctx.P.pulse();
    toast('<b>★★★</b> Troisième étoile ajoutée en avance. On a confiance.');
    egg('logo');
    clearTimeout(revert);
    revert = setTimeout(() => { star.textContent = '★★'; star.classList.remove('three'); }, 14000);
  });
}

function setupTab() {
  const base = document.title;
  const AWAY = ['Reviens… Paris t\'attend ★★', 'Psst… l\'OM cherche toujours un trophée', 'Ici c\'est (toujours) Paris', 'Ne pars pas comme l\'OM en février'];
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hiddenAt = Date.now(); document.title = pick(AWAY); return; }
    document.title = base;
    if (hiddenAt && Date.now() - hiddenAt > 1200 && !found.has('onglet')) setTimeout(() => egg('onglet'), 500);
    hiddenAt = 0;
  });
}

function setupIdle() {
  let t, first = true;
  const arm = () => { clearTimeout(t); t = setTimeout(idle, first ? 30000 : 75000); };
  function idle() {
    if (document.hidden || fxBusy || !ctx.isReady() || escStack.length) { arm(); return; }
    tumbleweed();
    if (first) {
      first = false;
      setTimeout(() => { toast('…Tu entends ce silence ? C\'est celui de la salle des trophées de l\'OM depuis 2012.', { dur: 6000 }); egg('silence'); }, 1200);
    }
    arm();
  }
  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach(ev => addEventListener(ev, arm, { passive: true }));
  arm();
}

function setupEnvelope() {
  $$('.envelope').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    if (b.classList.contains('open')) { toast('Elle est vide. Le contenu a déjà fait assez de dégâts en 1993.'); return; }
    b.classList.add('open');
    const r = b.getBoundingClientRect(), origin = { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight };
    let shapes = ['square'];
    try { if (window.confetti?.shapeFromText) shapes = [window.confetti.shapeFromText({ text: '💶', scalar: 2.4 })]; } catch { /* ignore */ }
    fire({ particleCount: 40, spread: 80, startVelocity: 30, gravity: .6, ticks: 240, scalar: 2.4, shapes, origin, colors: ['#9bd18b', '#e6d8a8'] });
    toast('<b>Tu as trouvé l\'enveloppe !</b> En 1993, une autre a été retrouvée enterrée dans un jardin. Elle a coûté à Marseille un titre et une descente en D2.', { dur: 7600 });
    egg('enveloppe');
  }));
}

function setupConsole() {
  window.palmaresOM = () => {
    console.log('%cPalmarès de l\'Olympique de Marseille depuis le 14.04.2012', 'font:700 16px Impact,sans-serif;color:#69b3e7');
    console.table([]);
    console.log('%c(vide — on a vérifié trois fois)', 'color:#888;font-style:italic');
    egg('console');
    return 'Rien. Nada. Que dalle. Rendez-vous en 2027 ? Ou en 2093.';
  };
  window.palmaresPSG = () => {
    console.table([
      { trophée: 'Ligue des champions', nombre: 2, dernière: 2026 },
      { trophée: 'Championnat de France', nombre: 14, dernière: 2026 },
      { trophée: 'Coupe de France', nombre: 16, dernière: 2025 },
      { trophée: 'Coupe intercontinentale', nombre: 1, dernière: 2025 },
    ]);
    return '★★ — Ici c\'est Paris.';
  };
}

/* =========================================================
   EFFECTS
   ========================================================= */

/* ---------- 1. Konami → tifo + chant ---------- */
function tifo() {
  fxBusy = true;
  ctx.lockScroll(true);
  const ov = el('div', 'fx-overlay tifo');
  const cv = el('canvas');
  const cap = el('div', 'tifo-cap', matchMedia('(hover: none)').matches ? 'Ici c\'est Paris · touche pour quitter' : 'Ici c\'est Paris · clique ou Échap pour quitter le Parc');
  ov.append(cv, cap);
  document.body.append(ov);

  const W = innerWidth, H = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const g = cv.getContext('2d');
  g.scale(dpr, dpr);
  const portrait = H > W * 1.1;
  const cols = portrait ? 44 : Math.round(Math.min(110, Math.max(60, W / 15)));
  const cs = W / cols, rows = Math.ceil(H / cs), n = cols * rows;

  // pattern: Hechter stripe + ★★ + ICI C'EST PARIS
  const S = 10, pc = el('canvas');
  pc.width = cols * S; pc.height = rows * S;
  const p = pc.getContext('2d'), PW = pc.width, PH = pc.height;
  p.fillStyle = '#004170'; p.fillRect(0, 0, PW, PH);
  const bw = PW * (portrait ? .3 : .2);
  p.fillStyle = '#ffffff'; p.fillRect(PW / 2 - bw / 2 - PW * .025, 0, bw + PW * .05, PH);
  p.fillStyle = '#da291c'; p.fillRect(PW / 2 - bw / 2, 0, bw, PH);
  const lines = portrait ? ['ICI', 'C\'EST', 'PARIS'] : ['ICI C\'EST PARIS'];
  let size = portrait ? PH * .17 : PH * .34;
  p.font = `${size}px Anton, Impact, sans-serif`;
  const mw = Math.max(...lines.map(l => p.measureText(l).width));
  if (mw > PW * .9) { size *= PW * .9 / mw; p.font = `${size}px Anton, Impact, sans-serif`; }
  p.textAlign = 'center'; p.textBaseline = 'middle'; p.lineJoin = 'round';
  const lh = size * 1.02, y0 = PH * (portrait ? .56 : .6) - (lines.length - 1) * lh / 2;
  lines.forEach((l, i) => {
    p.lineWidth = size * .14; p.strokeStyle = '#001a33'; p.strokeText(l, PW / 2, y0 + i * lh);
    p.fillStyle = '#ffffff'; p.fillText(l, PW / 2, y0 + i * lh);
  });
  const starAt = (cx, cy, R) => {
    p.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R * .42 : R; p.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    p.closePath(); p.fillStyle = '#e8c25a'; p.fill(); p.lineWidth = R * .12; p.strokeStyle = '#001a33'; p.stroke();
  };
  const sy = portrait ? PH * .17 : PH * .22, sr = portrait ? PW * .1 : PH * .1;
  starAt(PW / 2 - sr * 1.3, sy, sr); starAt(PW / 2 + sr * 1.3, sy, sr);
  const data = p.getImageData(0, 0, PW, PH).data;

  const CROWD = ['#0b111c', '#121a29', '#1a2335', '#0e1524', '#222b3d', '#151b27'];
  const back = new Array(n), front = new Array(n), delay = new Float32Array(n);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const k = r * cols + c, i = ((r * S + S / 2) * PW + (c * S + S / 2)) * 4;
    back[k] = `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`;
    front[k] = CROWD[(Math.random() * CROWD.length) | 0];
    delay[k] = .25 + (c / cols) * 1.5 + (1 - r / rows) * .35 + Math.random() * .12;
  }
  const revealAt = 2.8;
  let cache = null, raf = 0, t0 = performance.now(), closed = false;
  function frame(now) {
    const t = (now - t0) / 1000;
    if (t < revealAt || !cache) {
      g.fillStyle = '#05080f'; g.fillRect(0, 0, W, H);
      for (let k = 0; k < n; k++) {
        const kk = Math.min(1, Math.max(0, (t - delay[k]) / .38)), sx = Math.abs(Math.cos(kk * Math.PI));
        const w = Math.max(.5, (cs - 1) * sx), x = (k % cols) * cs, y = ((k / cols) | 0) * cs;
        g.fillStyle = kk < .5 ? front[k] : back[k];
        g.fillRect(x + (cs - w) / 2, y + .5, w, cs - 1);
      }
      if (t >= revealAt) { cache = el('canvas'); cache.width = cv.width; cache.height = cv.height; cache.getContext('2d').drawImage(cv, 0, 0); }
    } else {
      g.drawImage(cache, 0, 0, W, H);
      // mexican wave
      const wx = (((t - revealAt) * .42) % 1.4 - .2) * W;
      const grad = g.createLinearGradient(wx - 160, 0, wx + 160, 0);
      grad.addColorStop(0, 'rgba(255,255,255,0)'); grad.addColorStop(.5, 'rgba(255,255,255,.2)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad; g.fillRect(wx - 160, 0, 320, H);
      // phone flashes
      g.fillStyle = 'rgba(255,255,255,.75)';
      for (let i = 0; i < 18; i++) { const k = (Math.random() * n) | 0; g.fillRect((k % cols) * cs + cs * .3, ((k / cols) | 0) * cs + cs * .3, cs * .4, cs * .4); }
    }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  const stopAudio = chant();
  setTimeout(() => { if (!closed) egg('konami'); }, 1800);
  gsap().fromTo(ov, { opacity: 0 }, { opacity: 1, duration: .4 });

  const auto = setTimeout(close, 12000);
  const offEsc = onEscape(close);
  ov.addEventListener('click', close);
  function close() {
    if (closed) return;
    closed = true;
    clearTimeout(auto); offEsc(); stopAudio();
    gsap().to(ov, { opacity: 0, duration: .6, onComplete: () => { cancelAnimationFrame(raf); ov.remove(); } });
    ctx.lockScroll(false);
    fxBusy = false;
  }
}

function chant() {
  let stop = () => {};
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) {
      const ac = new AC(), master = ac.createGain();
      master.gain.value = .55;
      master.connect(ac.destination);
      const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      // crowd roar
      const roar = ac.createBufferSource(), bp = ac.createBiquadFilter(), rg = ac.createGain();
      roar.buffer = buf; roar.loop = true;
      bp.type = 'bandpass'; bp.frequency.value = 650; bp.Q.value = .5;
      rg.gain.setValueAtTime(0, ac.currentTime);
      rg.gain.linearRampToValueAtTime(.2, ac.currentTime + 1.4);
      roar.connect(bp).connect(rg).connect(master);
      roar.start();
      // the clap: tac-tac-tac … tac-tac-tac
      const clap = when => {
        for (let j = 0; j < 4; j++) {
          const s = ac.createBufferSource(), f = ac.createBiquadFilter(), gg = ac.createGain(), tt = when + j * .007 + Math.random() * .01;
          s.buffer = buf;
          f.type = 'bandpass'; f.frequency.value = 1100 + j * 380; f.Q.value = .9;
          gg.gain.setValueAtTime(0, tt);
          gg.gain.linearRampToValueAtTime(.85, tt + .002);
          gg.gain.exponentialRampToValueAtTime(.001, tt + .12);
          s.connect(f).connect(gg).connect(master);
          s.start(tt, Math.random() * 1.5, .16);
        }
      };
      const beat = .4, start = ac.currentTime + .8;
      for (let bar = 0; bar < 7; bar++) { const b = start + bar * beat * 4; clap(b); clap(b + beat); clap(b + beat * 2); }
      stop = () => {
        const now = ac.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setTargetAtTime(0, now, .12);
        setTimeout(() => ac.close().catch(() => {}), 700);
      };
    }
  } catch { /* no audio */ }
  // a voice from the Auteuil stand
  const timers = [];
  try {
    if ('speechSynthesis' in window) {
      const say = () => {
        const u = new SpeechSynthesisUtterance('Ici, c\'est Paris !');
        u.lang = 'fr-FR'; u.rate = .9; u.pitch = .7;
        const v = speechSynthesis.getVoices().find(x => (x.lang || '').toLowerCase().startsWith('fr'));
        if (v) u.voice = v;
        speechSynthesis.speak(u);
      };
      [700, 3900, 7100].forEach(ms => timers.push(setTimeout(say, ms)));
    }
  } catch { /* no voice */ }
  return () => { stop(); timers.forEach(clearTimeout); try { speechSynthesis.cancel(); } catch { /* ignore */ } };
}

/* ---------- 2. "marseille" → relegation ---------- */
function relegation() {
  fxBusy = true;
  ctx.lockScroll(true);
  const pinned = window.ScrollTrigger?.getAll().some(st => st.pin && st.isActive);
  const targets = pinned ? ['.h-track', '.h-bar', '.nav'] : ['main', '.foot', '.nav'];
  const stamp = el('div', 'stamp-fx', 'Rétrogradé<small>Tu as écrit « Marseille ». Sanction administrative immédiate.</small>');
  document.body.append(stamp);
  const G = gsap();
  G.timeline({
    onComplete: () => {
      if (!pinned) G.set(['main', '.foot'], { clearProps: 'transform' });
      stamp.remove();
      ctx.lockScroll(false);
      fxBusy = false;
      toast('Appel accepté : Paris remonte en 3 secondes. Marseille, en 1994, avait mis deux ans.', { dur: 6000 });
      egg('marseille');
    },
  })
    .fromTo(stamp, { scale: 2.6, opacity: 0, rotate: -18 }, { scale: 1, opacity: 1, rotate: -8, duration: .45, ease: 'power4.in' })
    .add(() => G.fromTo(stamp, { x: -14 }, { x: 0, duration: .6, ease: 'elastic.out(1.4,.2)' }))
    .to(targets, { y: () => innerHeight * .92, rotation: 3.5, transformOrigin: '50% 0%', duration: 1, ease: 'power3.in' }, '+=.35')
    .add(() => { stamp.innerHTML = 'Ligue 2<small>Bienvenue en deuxième division. Saison 1994-95.</small>'; }, '-=.2')
    .to(stamp, { rotate: 6, duration: .3, ease: 'back.out(3)' })
    .to(targets, { y: 0, rotation: 0, duration: 1.4, ease: 'elastic.out(1,.55)' }, '+=1.1')
    .to(stamp, { opacity: 0, scale: .7, duration: .35 }, '-=1.1');
}

/* ---------- 3. "1993" → VHS rewind ---------- */
function vhs() {
  fxBusy = true;
  const ov = el('div', 'fx-overlay vhs', `
    <div class="vhs-noise"></div><div class="vhs-lines"></div>
    <div class="vhs-osd tl">◀◀ REMBOBINAGE</div><div class="vhs-osd tr">SP</div>
    <div class="vhs-osd bl">06.11.2026</div><div class="vhs-osd br">00:00:00</div>
    <div class="vhs-year">2026</div>
    <div class="vhs-cap">26.05.1993 · Munich · leur dernier grand soir européen</div>`);
  document.body.append(ov);
  const year = $('.vhs-year', ov), tl = $('.tl', ov), bl = $('.bl', ov), br = $('.br', ov), cap = $('.vhs-cap', ov);
  const o = { y: 2026 };
  let clock = 0, iv = 0;
  const G = gsap();
  G.timeline({
    onComplete: () => {
      clearInterval(iv); ov.remove(); fxBusy = false; ctx.restore();
      toast('Retour en 2026. Paris : ★★. Marseille : toujours bloqué en 1993.');
    },
  })
    .fromTo(ov, { opacity: 0 }, { opacity: 1, duration: .25 })
    .to(o, { y: 1993, duration: reduce ? .3 : 2.1, ease: 'power2.in', onUpdate: () => { const y = Math.round(o.y); year.textContent = y; bl.textContent = '··.··.' + y; } })
    .add(() => {
      tl.textContent = '▶ LECTURE';
      bl.textContent = '26.05.1993';
      ctx.scene('y:1993', { gold: 0, opacity: 1 });
      iv = setInterval(() => { clock++; br.textContent = `00:00:${String(clock).padStart(2, '0')}`; }, 1000);
      egg('1993');
    })
    .to(year, { opacity: 0, scale: 1.3, duration: .6 }, '+=.2')
    .fromTo(cap, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .6 }, '-=.3')
    .to({}, { duration: 3.4 })
    .add(() => { tl.textContent = '⏏ ÉJECTION'; })
    .to(ov, { opacity: 0, duration: .6 }, '+=.5');
}

/* ---------- 4. "poulet" → the Parisian chicken lays golden eggs ---------- */
export const CHICKEN = `
<svg viewBox="0 0 110 100" aria-hidden="true">
  <g class="ch-legs" stroke="#f5a623" stroke-width="4" stroke-linecap="round" fill="none">
    <path class="leg l1" d="M46 74 L44 92 M44 92 L38 95 M44 92 L50 95"/>
    <path class="leg l2" d="M60 74 L62 92 M62 92 L56 95 M62 92 L68 95"/>
  </g>
  <g class="ch-bob">
    <path d="M22 50 Q6 34 14 22 Q22 34 30 42Z" fill="#e9e5dc"/>
    <path d="M24 54 Q4 46 6 32 Q18 42 30 48Z" fill="#f4f1ea"/>
    <ellipse cx="52" cy="58" rx="32" ry="21" fill="#fff"/>
    <circle cx="76" cy="34" r="14" fill="#fff"/>
    <circle cx="70" cy="20" r="5" fill="#da291c"/><circle cx="77" cy="17.5" r="5.5" fill="#da291c"/><circle cx="84" cy="21" r="4.5" fill="#da291c"/>
    <path d="M88 31 L100 35 L88 39Z" fill="#f5a623"/>
    <path d="M86 41 Q91 49 85 50 Q81 46 86 41Z" fill="#da291c"/>
    <circle cx="80" cy="30" r="2.4" fill="#111"/>
    <path d="M62 43 Q76 52 90 43 L91 49 Q76 58 61 49Z" fill="#004170"/>
    <path d="M73 47 L79 47 L80 54 L72 54Z" fill="#da291c"/>
    <path d="M64 48 L60 62 L66 61Z" fill="#004170"/>
    <ellipse class="wing" cx="48" cy="56" rx="17" ry="11" fill="#ebe7de"/>
  </g>
</svg>`;
const EGG_QUIPS = [
  'Cet œuf contient plus d\'or que la vitrine de l\'OM depuis 2012.',
  'Œuf craqué. Comme l\'OM en février.',
  'Surprise : une étoile ! Paris en a déjà deux.',
  'Cet œuf a éclos plus vite que le projet marseillais.',
  'L\'œuf ou la poule ? En tout cas pas l\'OM : rien pondu depuis 2012.',
  'Œuf en or 18 carats. Plus récent que leur dernier titre.',
  'Dedans : un billet pour la finale. Valable pour Paris uniquement.',
  'Omelette parisienne : 5 œufs, 0 Marseillais.',
];
function chicken() {
  fxBusy = true;
  const c = el('div', 'chicken', CHICKEN + '<div class="ch-bubble">Cot cot… Ici c\'est Paris !</div>');
  document.body.append(c);
  const G = gsap(), dur = reduce ? 4 : 10, W = innerWidth;
  G.fromTo(c, { x: -130 }, { x: W + 30, duration: dur, ease: 'none', onComplete: () => { c.remove(); fxBusy = false; } });
  G.fromTo($('.ch-bubble', c), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .4, delay: dur * .28, yoyo: true, repeat: 1, repeatDelay: 2.2 });
  const eggs = W < 600 ? 3 : 5;
  for (let i = 0; i < eggs; i++) G.delayedCall(dur * (.16 + i * (.72 / eggs)), () => layEgg(c.getBoundingClientRect().left + 22));
  setTimeout(() => { toast('Un poulet parisien traverse le site. Il pond de l\'or. Clique sur les œufs.'); egg('poulet'); }, 900);
}
let cracked = 0;
function layEgg(x) {
  if (x < 0 || x > innerWidth - 30) return;
  const b = el('button', 'gold-egg', EGG_ICON);
  b.type = 'button';
  b.setAttribute('aria-label', 'Œuf en or');
  b.dataset.cursor = 'Crac';
  b.style.left = x + 'px';
  document.body.append(b);
  const G = gsap();
  G.fromTo(b, { y: -26, scale: .2, rotate: -30 }, { y: 0, scale: 1, rotate: 0, duration: .7, ease: 'bounce.out' });
  const bye = setTimeout(() => G.to(b, { opacity: 0, scale: .5, duration: .4, onComplete: () => b.remove() }), 16000);
  b.addEventListener('click', () => {
    clearTimeout(bye);
    const r = b.getBoundingClientRect();
    fire({ particleCount: 46, spread: 70, startVelocity: 30, origin: { x: (r.left + 15) / innerWidth, y: (r.top + 10) / innerHeight }, colors: ['#e8c25a', '#fff1b8', '#ffffff'], shapes: ['star', 'circle'], scalar: .9 });
    G.to(b, { scale: 1.5, rotate: 20, opacity: 0, duration: .35, ease: 'back.in(2)', onComplete: () => b.remove() });
    cracked++;
    toast(cracked === 5 ? 'Cinq œufs : <b>omelette parisienne</b>. Comme le 5–0, mais en cuisine.' : pick(EGG_QUIPS));
  });
}

/* ---------- 5. "nimes" → the crocodile eats Marseille ---------- */
const CROC = `
<svg viewBox="0 0 230 80" aria-hidden="true">
  <path d="M2 50 Q34 38 66 42 L66 58 Q34 60 2 50Z" fill="#2e7d32"/>
  <g class="croc-legs" fill="#2e7d32"><rect class="cl a" x="72" y="56" width="9" height="16" rx="3"/><rect class="cl b" x="92" y="56" width="9" height="16" rx="3"/><rect class="cl a" x="124" y="56" width="9" height="16" rx="3"/><rect class="cl b" x="142" y="56" width="9" height="16" rx="3"/></g>
  <ellipse cx="108" cy="50" rx="50" ry="14" fill="#388e3c"/>
  <g fill="#2e7d32"><circle cx="76" cy="38" r="4"/><circle cx="90" cy="36" r="4"/><circle cx="104" cy="35" r="4"/><circle cx="118" cy="35" r="4"/><circle cx="132" cy="36" r="4"/></g>
  <path d="M96 40 L116 40 L118 47 L94 47Z" fill="#da291c"/><path d="M104 40 L108 40 L108 47 L104 47Z" fill="#fff"/>
  <path d="M150 52 L216 56 Q222 62 210 63 L150 63Z" fill="#2e7d32"/>
  <g class="jaw">
    <path d="M150 40 L212 46 Q224 49 214 54 L150 55Z" fill="#43a047"/>
    <path d="M164 54 l4 5 l4 -5 M178 54 l4 5 l4 -5 M192 54 l4 5 l4 -5" fill="#fff"/>
    <circle cx="160" cy="38" r="5" fill="#43a047"/><circle cx="161" cy="37" r="2.2" fill="#111"/>
  </g>
</svg>`;
function croc() {
  fxBusy = true;
  const G = gsap(), W = innerWidth;
  const word = el('div', 'croc-word', [...'MARSEILLE'].map(ch => `<span>${ch}</span>`).join(''));
  const c = el('div', 'croc', CROC + '<div class="ch-bubble">Allez les Crocos !</div>');
  document.body.append(word, c);
  const wr = word.getBoundingClientRect(), letters = $$('span', word), jaw = $('.jaw', c);
  const cw = c.getBoundingClientRect().width;
  G.from(word, { y: 40, opacity: 0, duration: .5, ease: 'back.out(2)' });
  const tl = G.timeline({ onComplete: () => { c.remove(); word.remove(); fxBusy = false; } });
  tl.fromTo(c, { x: -cw - 20 }, { x: wr.left - cw * .88, duration: reduce ? .6 : 2.6, ease: 'none' })
    .to($('.ch-bubble', c), { opacity: 1, y: -4, duration: .3 }, '-=.6');
  letters.forEach((l, i) => {
    tl.to(jaw, { rotate: -24, svgOrigin: '150 48', duration: .09 })
      .to(jaw, { rotate: 0, svgOrigin: '150 48', duration: .09 })
      .to(l, { scale: 0, y: 14, rotate: G.utils.random(-60, 60), opacity: 0, duration: .16 }, '<')
      .to(c, { x: `+=${(wr.width / letters.length)}`, duration: .14, ease: 'none' }, '<');
    if (i === 3) tl.add(() => { toast('🐊 Croc croc. Le Gard a faim.'); });
  });
  tl.add(() => { egg('nimes'); })
    .to($('.ch-bubble', c), { opacity: 0, duration: .3 })
    .to(c, { x: W + 40, duration: reduce ? .6 : 2.2, ease: 'none' });
}

/* ---------- 6. tumbleweed ---------- */
export function tumbleSVG() {
  let d = '';
  for (let i = 0; i < 28; i++) {
    const a1 = Math.random() * Math.PI * 2, a2 = a1 + (Math.random() - .5) * 2.8, r1 = 16 + Math.random() * 28, r2 = 16 + Math.random() * 28;
    const cx = 50 + (Math.random() - .5) * 60, cy = 50 + (Math.random() - .5) * 60;
    d += `M${(50 + Math.cos(a1) * r1).toFixed(1)} ${(50 + Math.sin(a1) * r1).toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${(50 + Math.cos(a2) * r2).toFixed(1)} ${(50 + Math.sin(a2) * r2).toFixed(1)}`;
  }
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><path d="${d}" fill="none" stroke="#b08d55" stroke-width="1.7" stroke-linecap="round"/><circle cx="50" cy="50" r="42" fill="none" stroke="#8a6a3a" stroke-width="1.2" stroke-dasharray="3 7"/></svg>`;
}
function tumbleweed() {
  const t = el('div', 'tumble', `<div class="tumble-in">${tumbleSVG()}</div>`);
  document.body.append(t);
  const G = gsap(), dur = reduce ? 3 : 7.5;
  G.fromTo(t, { x: -110 }, { x: innerWidth + 20, duration: dur, ease: 'none', onComplete: () => t.remove() });
  G.to($('.tumble-in', t), { rotate: 1080, duration: dur, ease: 'none' });
  G.to($('.tumble-in', t), { y: -46, duration: .38, ease: 'power1.out', yoyo: true, repeat: Math.floor(dur / .38) });
}

/* ---------- 7. Marseille edition of the site ---------- */
function omMode() {
  if (fxBusy) return;
  fxBusy = true;
  ctx.lockScroll(true);
  const ov = el('div', 'fx-overlay om-mode', `
    <div class="om-in">
      <div class="om-k">Version marseillaise · en bêta depuis 1993</div>
      <div class="om-t">Bienvenue sur<br>la version OM</div>
      <div class="om-status">Chargement du palmarès récent…</div>
      <div class="om-bar"><i></i></div>
      <div class="om-pc">0 %</div>
      <div class="om-skip">clique pour accélérer (ça ne changera rien)</div>
    </div>`);
  document.body.append(ov);
  const bar = $('.om-bar i', ov), pc = $('.om-pc', ov), st = $('.om-status', ov), title = $('.om-t', ov), o = { v: 0 };
  const G = gsap();
  const tl = G.timeline({
    onComplete: () => {
      ov.remove(); ctx.lockScroll(false); fxBusy = false;
      toast('Retour à la version normale. Ouf. ★★');
      egg('version-om');
    },
  });
  tl.fromTo(ov, { clipPath: 'circle(0% at 50% 100%)' }, { clipPath: 'circle(150% at 50% 100%)', duration: .9, ease: 'power3.inOut' })
    .to(o, { v: 93, duration: 1.8, ease: 'power2.out', onUpdate: () => { bar.style.transform = `scaleX(${o.v / 100})`; pc.textContent = Math.floor(o.v) + ' %'; } })
    .add(() => pc.classList.add('stuck'));
  for (let y = 2013; y <= 2026; y++) tl.add(() => { st.textContent = `Recherche des trophées de ${y}… introuvable`; }, '+=.17');
  tl.add(() => {
    ov.classList.add('err');
    title.innerHTML = 'Erreur 1993';
    st.textContent = 'Aucun trophée trouvé depuis le 14.04.2012.';
    G.fromTo(ov, { x: -14 }, { x: 0, duration: .7, ease: 'elastic.out(1.3,.2)' });
  }, '+=.3')
    .add(() => { st.textContent = 'Le serveur a été rétrogradé administrativement.'; }, '+=1.7')
    .to(ov, { yPercent: 110, rotate: 5, duration: .9, ease: 'power2.in' }, '+=1.3');
  ov.addEventListener('click', () => tl.timeScale(3.5));
}

/* ---------- 8. "fevrier" → everything on screen collapses ---------- */
const FALL_SEL = '.sec-head, .stat, .match, .cp-card, .cp-main, .cp-load, .tape li, .vs-side, .vs-mid, .star-card, .tabs, .simu-side > *, .simu-feed, .quiz-card, .xc-card, .xc-side, .frise, .game-wrap, .museum-cta, .h-panel h3, .h-panel p, .h-year, .s-logo, .s-question, .s-form, .res-card, .three-stage > *, .foot-big, .foot-om, .hero-tag, .mq-row';
function fevrier() {
  fxBusy = true;
  ctx.lockScroll(true);
  const G = gsap();
  const vis = $$(FALL_SEL).filter(n => { const r = n.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < innerHeight; });
  const list = vis.filter(n => !vis.some(o => o !== n && o.contains(n))).slice(0, 40);
  const prev = list.map(n => ({ y: G.getProperty(n, 'y'), rotation: G.getProperty(n, 'rotation') }));
  const stamp = el('div', 'stamp-fx feb', 'Février<small>Comme chaque année à Marseille : tout s\'effondre.</small>');
  document.body.append(stamp);
  const tl = G.timeline({
    onComplete: () => {
      stamp.remove(); ctx.lockScroll(false); fxBusy = false;
      toast('…Et en mars, ils parleront d\'un « petit passage à vide ».');
      egg('fevrier');
    },
  });
  tl.fromTo(stamp, { y: -innerHeight * .6, rotate: -8 }, { y: 0, rotate: -4, duration: 1, ease: 'bounce.out' }, 0);
  list.forEach(n => {
    const r = n.getBoundingClientRect();
    tl.to(n, { y: `+=${Math.max(0, innerHeight - r.bottom - Math.random() * 18)}`, rotation: (Math.random() - .5) * 40, duration: .9 + Math.random() * .5, ease: 'bounce.out' }, .15 + Math.random() * .5);
  });
  tl.to({}, { duration: 1.4 });
  list.forEach((n, i) => tl.to(n, { ...prev[i], duration: .9, ease: 'expo.out' }, `-=${i ? .88 : 0}`));
  tl.to(stamp, { opacity: 0, scale: .7, duration: .35 }, '<');
}

/* ---------- 9. "allez l'om" → sad trombone ---------- */
function allezlom() {
  fxBusy = true;
  const ov = el('div', 'fx-overlay sad', '<div class="sad-in"><div class="sad-t">Allez l\'OM…</div><div class="sad-s">Erreur : enthousiasme non pris en charge depuis 2012.</div></div>');
  document.body.append(ov);
  trombone();
  gsap().timeline({
    onComplete: () => {
      ov.remove(); fxBusy = false;
      toast('C\'est bon, tu peux arrêter. Eux aussi arrêtent d\'y croire en février.');
      egg('allezlom');
    },
  })
    .fromTo(ov, { opacity: 0 }, { opacity: 1, duration: .5 })
    .from($('.sad-t', ov), { y: -40, opacity: 0, duration: .6, ease: 'back.out(2)' }, .1)
    .to($('.sad-t', ov), { rotate: 9, y: 40, scaleY: .9, duration: 2.6, ease: 'power2.in' }, .9)
    .from($('.sad-s', ov), { opacity: 0, y: 10, duration: .5 }, 1.3)
    .to(ov, { opacity: 0, duration: .6 }, '+=.5');
}
function trombone() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ac = new AC(), out = ac.createGain();
    out.gain.value = .22;
    out.connect(ac.destination);
    const notes = [[293.66, .42], [277.18, .42], [261.63, .42], [246.94, 1.6]]; // ré, do#, do, si… wah wah wah waaah
    let t = ac.currentTime + .1;
    notes.forEach(([f, d], i) => {
      const o = ac.createOscillator(), flt = ac.createBiquadFilter(), gn = ac.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(f, t);
      if (i === notes.length - 1) {
        const lfo = ac.createOscillator(), lg = ac.createGain();
        lfo.frequency.value = 6; lg.gain.value = 7;
        lfo.connect(lg).connect(o.frequency);
        lfo.start(t); lfo.stop(t + d);
        o.frequency.linearRampToValueAtTime(f * .93, t + d);
      }
      flt.type = 'lowpass';
      flt.frequency.setValueAtTime(450, t);
      flt.frequency.linearRampToValueAtTime(1500, t + .12);
      flt.frequency.linearRampToValueAtTime(550, t + d);
      gn.gain.setValueAtTime(0, t);
      gn.gain.linearRampToValueAtTime(1, t + .04);
      gn.gain.setValueAtTime(1, t + d - .09);
      gn.gain.linearRampToValueAtTime(0, t + d);
      o.connect(flt).connect(gn).connect(out);
      o.start(t); o.stop(t + d + .02);
      t += d + .05;
    });
    setTimeout(() => ac.close().catch(() => {}), (t - ac.currentTime + .6) * 1000);
  } catch { /* no audio */ }
}

/* ---------- 10. "ici c'est paris" → fireworks ---------- */
function fireworks() {
  fxBusy = true;
  ctx.scene('t:PARIS', { gold: 1, opacity: 1 });
  ctx.P.pulse();
  gsap().fromTo('.flash', { opacity: .85 }, { opacity: 0, duration: 1.1 });
  const end = Date.now() + 4200;
  const PAL = [['#e8c25a', '#fff1b8'], ['#da291c', '#ffffff'], ['#1f6fd1', '#ffffff'], ['#ffffff', '#e8c25a']];
  (function shoot() {
    if (Date.now() > end) {
      fxBusy = false;
      ctx.restore();
      toast('<b>ICI C\'EST PARIS ★★</b> Feu d\'artifice offert par le club. Marseille regarde depuis le Vieux-Port.');
      egg('feu');
      return;
    }
    fire({ particleCount: 70, spread: 360, startVelocity: 28, gravity: .7, ticks: 150, decay: .92, origin: { x: .1 + Math.random() * .8, y: .12 + Math.random() * .38 }, colors: pick(PAL), shapes: ['star', 'circle'], scalar: .9 });
    setTimeout(shoot, 240 + Math.random() * 240);
  })();
}

/* ---------- 11. shake the mouse → rage quit ---------- */
let rageAt = 0;
function rage() {
  if (!ctx.isReady() || Date.now() - rageAt < 5000) return;
  rageAt = Date.now();
  gsap().fromTo(['#gl', '.nav'], { x: -14 }, { x: 0, duration: .9, ease: 'elastic.out(1.4,.15)' });
  toast(pick([
    'Calme-toi. T\'es pas au Vélodrome après un Classique.',
    'Respire. Le 5–0, c\'était en février, c\'est fini.',
    'Lâche cette souris, elle n\'a rien fait. Paris non plus : il a juste gagné.',
  ]));
  egg('rage');
}
function setupRage() {
  let lastX = 0, lastT = 0, dir = 0, flips = [];
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const now = performance.now(), dx = e.clientX - lastX, dt = now - lastT;
    lastX = e.clientX; lastT = now;
    if (dt <= 0 || dt > 80 || Math.abs(dx) / dt < 1.5) return;
    const d = Math.sign(dx);
    if (d && d !== dir) {
      dir = d;
      flips = [...flips, now].filter(t => now - t < 1000);
      if (flips.length >= 9) { flips = []; rage(); }
    }
  }, { passive: true });
  let shakes = [];
  addEventListener('devicemotion', e => {
    const a = e.accelerationIncludingGravity;
    if (!a || Math.hypot(a.x || 0, a.y || 0, a.z || 0) < 30) return;
    const now = performance.now();
    shakes = [...shakes, now].filter(t => now - t < 1200);
    if (shakes.length >= 4) { shakes = []; rage(); }
  });
}

/* ---------- 12. scroll like you're leaving the Vélodrome at 80' ---------- */
function setupFuite() {
  let lastY = scrollY, lastT = performance.now(), hits = 0;
  addEventListener('scroll', () => {
    const now = performance.now(), dt = now - lastT;
    if (dt < 40) return;
    const v = Math.abs(scrollY - lastY) / dt;
    lastY = scrollY; lastT = now;
    if (!ctx.isReady() || ctx.isAutoScroll() || found.has('fuite')) { hits = 0; return; }
    hits = v > 6 ? hits + 1 : 0;
    if (hits >= 4) { hits = 0; toast('Doucement ! On dirait une sortie de Vélodrome à la 80e minute.'); egg('fuite'); }
  }, { passive: true });
}

/* ---------- 13. the 1993 star comes unstuck ---------- */
function setupOmStar() {
  const s = $('.om-star');
  if (!s) return;
  let clicks = 0;
  s.addEventListener('click', e => {
    e.stopPropagation();
    if (s.classList.contains('gone')) { toast('Elle est partie. Comme leurs chances de titre chaque février.'); return; }
    clicks++;
    const G = gsap();
    if (clicks < 3) {
      G.fromTo(s, { rotate: 0 }, { rotate: clicks === 1 ? 14 : -24, duration: .7, ease: 'elastic.out(1.2,.3)' });
      toast(clicks === 1 ? 'Elle bouge un peu… Normal, elle date de 1993.' : 'Ça se décolle. Encore un clic ?');
      return;
    }
    s.classList.add('gone');
    const r = s.getBoundingClientRect();
    const clone = el('div', 'om-star-fall', '★');
    clone.style.cssText = `left:${r.left}px;top:${r.top}px;font-size:${getComputedStyle(s).fontSize}`;
    document.body.append(clone);
    s.style.visibility = 'hidden';
    G.timeline({ onComplete: () => clone.remove() })
      .to(clone, { rotate: 40, duration: .2, ease: 'power2.out' })
      .to(clone, { y: innerHeight - r.top + 80, x: 60 + Math.random() * 140, rotate: 560, duration: 1.4, ease: 'power2.in' });
    const sm = $('.vs-om .vs-stars small');
    if (sm) sm.textContent = '1993 · elle a lâché';
    toast('L\'étoile de 1993 s\'est décrochée. Après 33 ans, elle ne tenait plus.');
    egg('etoile-om');
  });
}

/* ---------- calendar bonuses (not counted) ---------- */
function dateBonus() {
  const d = new Date(), m = d.getMonth(), day = d.getDate(), y = d.getFullYear();
  const msg = m === 1 && day === 8 ? '8 février : joyeux anniversaire au 5–0 du Parc.'
    : m === 1 ? 'Nous sommes en février. Une pensée émue pour l\'OM.'
      : m === 3 && day === 14 ? `14 avril : ${y - 2012} ans aujourd'hui que l'OM n'a rien gagné. On allume une bougie ?`
        : m === 4 && day === 26 ? `26 mai : ${y - 1993} ans de leur Ligue des champions. Et toujours rien depuis 2012.`
          : m === 4 && day === 30 ? '30 mai : anniversaire de Budapest. La deuxième étoile.'
            : m === 4 && day === 31 ? '31 mai : anniversaire de Munich, 5–0. La première étoile.'
              : '';
  if (msg) setTimeout(() => toast(msg, { dur: 7000 }), 7500);
}

/* ---------- all found ---------- */
function finale() {
  ctx.scene('stars3', { gold: 1, opacity: 1 });
  ctx.P.pulse();
  gsap().fromTo('.flash', { opacity: 1 }, { opacity: 0, duration: 1.2, ease: 'power2.out' });
  const end = Date.now() + 2600;
  (function frame() {
    fire({ particleCount: 8, angle: 60, spread: 70, origin: { x: 0, y: .8 }, colors: ctx.COLORS, shapes: ['star'] });
    fire({ particleCount: 8, angle: 120, spread: 70, origin: { x: 1, y: .8 }, colors: ctx.COLORS, shapes: ['star'] });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
  toast(`<span class="t-egg">${EGG_ICON}</span><span><b>${EGGS.length}/${EGGS.length} · Chasse terminée.</b><br>Tu as trouvé plus de choses ici que l'OM depuis 2012. Respect.</span>`, { kind: 'egg', dur: 9000 });
  setTimeout(() => ctx.restore(), 6000);
}

/* =========================================================
   INIT
   ========================================================= */
export function initEggs(c) {
  ctx = { ...ctx, ...c };
  buildTracker();
  setupKeys();
  setupLogo();
  setupTab();
  setupIdle();
  setupEnvelope();
  setupConsole();
  setupRage();
  setupFuite();
  setupOmStar();
  dateBonus();
  $('#om-mode')?.addEventListener('click', omMode);
  $('#eggs-open')?.addEventListener('click', () => togglePanel(true));
}

export { sleep, rand, pick, strip };
