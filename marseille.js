/* =========================================================
   MARSEILLE.JS — la frise, les excuses, le quiz, le jeu du poulet
   ========================================================= */

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pick = arr => arr[(Math.random() * arr.length) | 0];
const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fmt = n => new Intl.NumberFormat('fr-FR').format(n);
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } },
};

/* ctx from main.js: { gsap, ScrollTrigger, zone, scene, toast, egg, confetti, reduce, isTouch, CHICKEN, tumbleSVG } */
let C;
export function setMarseilleCtx(ctx) { C = ctx; }

/* =========================================================
   LA FRISE — major trophies, 1993 → 2026
   ========================================================= */
const FR0 = 1993, FR1 = 2026;
const PSG_T = {
  1993: ['cdf'], 1994: ['l1'], 1995: ['cdf'], 1996: ['eu2'], 1998: ['cdf'], 2004: ['cdf'], 2006: ['cdf'], 2010: ['cdf'],
  2013: ['l1'], 2014: ['l1'], 2015: ['l1', 'cdf'], 2016: ['l1', 'cdf'], 2017: ['cdf'], 2018: ['l1', 'cdf'], 2019: ['l1'],
  2020: ['l1', 'cdf'], 2021: ['cdf'], 2022: ['l1'], 2023: ['l1'], 2024: ['l1', 'cdf'], 2025: ['l1', 'cdf', 'eu'], 2026: ['l1', 'eu'],
};
const OM_T = { 1993: ['eu', 'ret'], 2010: ['l1'] };
const T_NAME = { l1: 'Championnat de France', cdf: 'Coupe de France', eu: 'Ligue des champions', eu2: 'Coupe des Coupes', ret: 'Championnat — retiré, non attribué' };
const T_NOTE = {
  'psg-2025-eu': 'Munich, 5–0 contre l\'Inter', 'psg-2026-eu': 'Budapest, contre Arsenal aux tirs au but', 'psg-1996-eu2': 'Bruxelles, contre le Rapid Vienne',
  'psg-2016-cdf': 'Finale contre l\'OM : 4–2', 'om-1993-eu': 'Munich, contre Milan', 'om-2010-l1': 'Le dernier. Depuis : rien.',
  'om-1993-ret': 'Retiré après l\'affaire VA-OM. Proposé à Paris, refusé.',
};

export function setupFrise() {
  const host = $('#fr-grid');
  if (!host) return;
  const { gsap } = C;
  const years = Array.from({ length: FR1 - FR0 + 1 }, (_, i) => FR0 + i);
  const count = d => Object.values(d).flat().filter(k => k !== 'ret').length;
  const col = y => y - FR0 + 2;
  let html = '';
  const row = (r, cls, label, data) => {
    html += `<div class="fr-lab" style="grid-row:${r};grid-column:1"><i class="fr-sw ${cls}"></i>${label}</div>`;
    years.forEach(y => {
      const marks = (data[y] || []).map(k => {
        const note = T_NOTE[`${cls}-${y}-${k}`];
        const tip = `${y} · ${label} · ${T_NAME[k]}${note ? ' — ' + note : ''}`;
        return `<i class="fm ${k} ${cls}" tabindex="0" role="img" aria-label="${tip}" data-tip="${tip}"></i>`;
      }).join('');
      html += `<div class="fr-cell${y % 10 === 0 ? ' dec' : ''}" style="grid-row:${r};grid-column:${col(y)}">${marks}</div>`;
    });
    html += `<div class="fr-tot ${cls}" style="grid-row:${r};grid-column:${col(FR1) + 1}"><b>${count(data)}</b></div>`;
  };
  row(1, 'psg', 'Paris', PSG_T);
  row(2, 'om', 'Marseille', OM_T);
  years.forEach(y => { if ([1993, 2000, 2010, 2020, 2026].includes(y)) html += `<div class="fr-y" style="grid-row:3;grid-column:${col(y)}">${y}</div>`; });
  html += `<div class="fr-desert" style="grid-row:2;grid-column:${col(2011)} / span ${FR1 - 2011 + 1}"><span>Désert du Vieux-Port · 2011 → ∞</span><div class="fr-tumble">${C.tumbleSVG()}</div></div>`;
  host.innerHTML = html;
  host.setAttribute('aria-label', `Trophées majeurs de 1993 à 2026 : Paris ${count(PSG_T)}, Marseille ${count(OM_T)}.`);

  // data table
  const list = (d, label) => `<div><b>${label} · ${count(d)}</b><ul>${Object.entries(d).flatMap(([y, ks]) => ks.map(k => `<li><span>${y}</span>${T_NAME[k]}</li>`)).join('')}</ul></div>`;
  $('#fr-data').innerHTML = list(PSG_T, 'Paris') + list(OM_T, 'Marseille');

  // tooltip
  const tip = $('.fr-tip'), wrap = $('.frise');
  const show = el => {
    tip.textContent = el.dataset.tip;
    tip.classList.add('on');
    const r = el.getBoundingClientRect(), w = wrap.getBoundingClientRect(), tw = tip.offsetWidth;
    const x = Math.max(8, Math.min(w.width - tw - 8, r.left - w.left + r.width / 2 - tw / 2));
    tip.style.transform = `translate(${x}px, ${r.top - w.top - tip.offsetHeight - 10}px)`;
  };
  const hide = () => tip.classList.remove('on');
  $$('.fm', host).forEach(m => {
    m.addEventListener('pointerenter', () => show(m));
    m.addEventListener('pointerleave', hide);
    m.addEventListener('focus', () => show(m));
    m.addEventListener('blur', hide);
    m.addEventListener('click', () => show(m));
  });
  $('.fr-scroll').addEventListener('scroll', hide, { passive: true });

  gsap.timeline({ scrollTrigger: { trigger: '.frise', start: 'top 80%' } })
    .from('.frise .fr-lab, .frise .fr-y', { opacity: 0, x: -14, stagger: .04, duration: .5 })
    .from('.frise .fm', { scale: 0, duration: .5, stagger: .025, ease: 'back.out(3)' }, .1)
    .from('.frise .fr-tot b', { scale: 0, duration: .6, ease: 'back.out(3)' }, '-=.3')
    .from('.fr-desert', { opacity: 0, scaleX: 0, transformOrigin: '0% 50%', duration: 1, ease: 'expo.out' }, '-=.4');
}

/* =========================================================
   LES EXCUSES — official post-match excuse generator
   ========================================================= */
const XA = ['de l\'arbitre', 'du mistral', 'de la pelouse', 'du calendrier', 'de Paris', 'de février', 'de la VAR', 'de la pleine lune', 'du ballon, trop rond', 'des médias parisiens', 'du budget de Paris', 'de la chaleur', 'du froid', 'de l\'heure du match', 'du vent… enfin, du mistral'];
const XB = ['qui a déstabilisé', 'qui a perturbé', 'qui a démotivé', 'qui a fatigué', 'qui a désorienté', 'qui a complètement déréglé'];
const XC = ['notre projet de jeu', 'nos latéraux', 'le vestiaire', 'la concentration du gardien', 'notre pressing', 'nos 14 recrues', 'le nouvel entraîneur', 'nos certitudes', 'l\'ambiance du Vélodrome'];
const XD = ['Mais on reste ambitieux.', 'L\'objectif reste le titre.', 'On va se relever.', 'Ce n\'est pas une crise.', 'On en reparle après la trêve.', 'Cette année, c\'est la bonne.'];
const XTOTAL = XA.length * XB.length * XC.length * XD.length;

export function setupExcuses() {
  const q = $('#xc-quote');
  if (!q) return;
  const { gsap } = C;
  const nEl = $('#xc-n'), cred = $('#xc-cred'), wind = $('#xc-wind'), needle = $('#xc-needle'), arc = $('#xc-arc'), cnt = $('#xc-count');
  const ARC = 251.3; // half-circle length for r=80
  arc.style.strokeDasharray = ARC; arc.style.strokeDashoffset = ARC;
  gsap.set(needle, { rotate: -90, svgOrigin: '100 100' });
  let n = 0, last = '';
  function generate() {
    const a = (Math.random() * XA.length) | 0, b = (Math.random() * XB.length) | 0, c = (Math.random() * XC.length) | 0, d = (Math.random() * XD.length) | 0;
    const text = `C'est la faute ${XA[a]}, ${XB[b]} ${XC[c]}. ${XD[d]}`;
    last = text;
    const idx = ((a * XB.length + b) * XC.length + c) * XD.length + d + 1;
    q.innerHTML = '« ' + text.split(' ').map(w => `<span class="xw">${w}</span>`).join(' ') + ' »';
    gsap.from($$('.xw', q), { y: 18, opacity: 0, rotate: 4, stagger: .025, duration: .45, ease: 'back.out(2)' });
    nEl.textContent = `Excuse n°${fmt(idx)} sur ${fmt(XTOTAL)}`;
    cred.textContent = a === 4 || a === 10 ? 'Crédibilité : 0 % (Paris jouait ailleurs ce soir-là)' : `Crédibilité : ${(Math.random() * 7).toFixed(0)} %`;
    const kmh = 40 + Math.round(Math.random() * 80);
    wind.textContent = `${kmh} km/h`;
    gsap.to(needle, { rotate: -90 + (kmh / 130) * 180, svgOrigin: '100 100', duration: 1.1, ease: 'elastic.out(1,.4)' });
    gsap.to(arc, { strokeDashoffset: ARC * (1 - kmh / 130), duration: 1.1, ease: 'power3.out' });
    n++;
    cnt.textContent = n;
    gsap.fromTo(cnt, { scale: 1.4 }, { scale: 1, duration: .5, ease: 'back.out(3)' });
    if (n === 15) { C.toast('15 excuses d\'affilée. Le service communication de l\'OM t\'attend lundi.'); C.egg('porte-parole'); }
  }
  $('#xc-go').addEventListener('click', generate);
  $('#xc-copy').addEventListener('click', async () => {
    if (!last) { C.toast('Génère d\'abord une excuse. Même eux en ont toujours une sous la main.'); return; }
    try { await navigator.clipboard.writeText(`« ${last} »`); C.toast('Excuse copiée. Prête pour la conférence de presse.'); }
    catch { C.toast('Copie impossible. Même le presse-papiers refuse cette excuse.'); }
  });
  gsap.from('.xc-card, .xc-side', { y: 60, opacity: 0, stagger: .12, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.xc-wrap', start: 'top 82%' } });
  C.zone('excuses', { trigger: '#excuses', start: 'top 55%', end: 'bottom 55%' }, () => C.scene('t:MISTRAL', { opacity: .32 }));
}

/* =========================================================
   LE QUIZ DU CLASSIQUE
   ========================================================= */
const QUESTIONS = [
  { q: 'Quel est le dernier trophée gagné par l\'OM ?', o: ['La Coupe de la Ligue 2012', 'La Ligue des champions 2026', 'La Coupe de France 2024', 'Le trophée du plus beau projet 2025'], r: '14 avril 2012. Une compétition qui n\'existe même plus.' },
  { q: 'Combien de Ligues des champions pour Paris ?', o: ['Deux', 'Zéro', 'Une', 'Trois, mais une est cachée'], r: 'Deux. En 364 jours d\'écart.' },
  { q: 'Qu\'est devenu le titre de champion 1993 de l\'OM ?', o: ['Retiré, proposé à Paris, refusé', 'Encadré au Vélodrome', 'Emporté par le mistral', 'Prêté à Monaco'], r: 'Retiré par la Fédération. Paris a refusé de le récupérer. Il est resté vacant.' },
  { q: 'Score du Classique du 8 février 2026 au Parc ?', o: ['5–0 pour Paris', '1–0 pour l\'OM', '2–2', '0–0, mais l\'OM a bien joué'], r: '5–0. Le même score qu\'en finale à Munich.' },
  { q: 'Où l\'OM a-t-il gagné sa dernière Coupe de France, en 1989 ?', o: ['Au Parc des Princes', 'Au Vélodrome', 'Au Stade de France', 'Dans un rêve'], r: 'Chez nous. Le Stade de France n\'existait même pas encore.' },
  { q: 'Combien de trophées Paris a-t-il gagnés en 2025 ?', o: ['Six', 'Deux', 'Quatre', 'Un seul, mais en or'], r: 'Six : Trophée des champions, Ligue 1, Coupe de France, Ligue des champions, Supercoupe d\'Europe et Coupe intercontinentale.' },
  { q: 'Où s\'est joué le Trophée des champions PSG–OM de janvier 2026 ?', o: ['Au Koweït', 'À Marseille', 'À Paris', 'Sur la Lune'], r: 'Au Koweït. 4 000 km pour perdre aux tirs au but.' },
  { q: 'En quelle année l\'OM a-t-il été champion de France pour la dernière fois ?', o: ['2010', '2020', '1993', 'L\'an prochain, promis'], r: '5 mai 2010. Depuis, Paris en a gagné douze.' },
  { q: 'Combien de titres de champion de France pour Paris ?', o: ['Quatorze, record', 'Neuf', 'Douze', 'On a arrêté de compter'], r: '14, record. Marseille : 9 (le 10e a été retiré).' },
  { q: 'Qui a gagné la toute dernière Coupe de la Ligue de l\'histoire, en 2020 ?', o: ['Paris', 'Marseille', 'Lyon', 'Personne, elle a fui'], r: 'Paris. L\'OM a gagné la sienne en 2012 ; depuis, la compétition a été supprimée.' },
  { q: 'Dans quelle ville l\'OM a-t-il gagné sa Ligue des champions en 1993 ?', o: ['Munich', 'Marseille', 'Madrid', 'Paris'], r: 'Munich. Paris y a gagné la sienne en 2025, 5–0. On aime bien Munich aussi.' },
  { q: 'Combien de Coupes de France pour Paris ?', o: ['Seize, record', 'Dix', 'Douze', 'Une par an, environ'], r: '16, record. L\'OM : 10, la dernière en 1989.' },
];
const RANKS = [
  [8, 'Ultra d\'Auteuil', 'Tu connais le palmarès de l\'OM mieux qu\'eux. C\'est pas difficile, il est court.'],
  [6, 'Abonné au Parc', 'Solide. Tu peux chambrer un Marseillais sans sortir ton téléphone.'],
  [4, 'Touriste parisien', 'Ça va. Révise un peu le palmarès : chez eux, ça prend cinq minutes.'],
  [1, 'Visiteur du Vélodrome', 'Tu confonds encore la Coupe de la Ligue et la Ligue des champions. Comme à Marseille.'],
  [0, 'Le zéro pointé', '0 bonne réponse. Exactement leur nombre de trophées depuis 2012. Coïncidence ?'],
];
export function setupQuiz() {
  const card = $('#quiz-card');
  if (!card) return;
  const { gsap } = C;
  const body = $('#qz-body'), dots = $('#qz-dots');
  const N = 8;
  let set = [], i = 0, score = 0;
  const dotsHtml = () => Array.from({ length: N }, (_, k) => `<i class="${k < i ? (set[k].ok ? 'ok' : 'ko') : k === i ? 'cur' : ''}"></i>`).join('');
  const enter = () => gsap.from(body.children, { y: 26, opacity: 0, stagger: .06, duration: .55, ease: 'expo.out' });
  function start() {
    set = shuffle(QUESTIONS).slice(0, N).map(x => ({ ...x, opts: shuffle(x.o.map((t, k) => ({ t, ok: k === 0 }))), ok: false }));
    i = 0; score = 0;
    ask();
  }
  function ask() {
    const x = set[i];
    dots.innerHTML = dotsHtml();
    body.innerHTML = `
      <div class="qz-n">Question ${i + 1} / ${N}</div>
      <h3 class="qz-q">${x.q}</h3>
      <div class="qz-opts">${x.opts.map((o, k) => `<button type="button" class="qz-o" data-k="${k}"><span>${'ABCD'[k]}</span>${o.t}</button>`).join('')}</div>
      <div class="qz-r" aria-live="polite"></div>
      <button type="button" class="qz-next" hidden>${i === N - 1 ? 'Voir mon score →' : 'Question suivante →'}</button>`;
    enter();
    $$('.qz-o', body).forEach(b => b.addEventListener('click', () => answer(+b.dataset.k)));
    $('.qz-next', body).addEventListener('click', () => { i++; if (i < N) ask(); else end(); });
  }
  function answer(k) {
    const x = set[i], btns = $$('.qz-o', body), good = x.opts.findIndex(o => o.ok);
    btns.forEach(b => { b.disabled = true; });
    btns[good].classList.add('ok');
    x.ok = k === good;
    if (x.ok) {
      score++;
      const r = btns[good].getBoundingClientRect();
      C.confetti({ particleCount: 40, spread: 60, startVelocity: 26, origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight }, colors: ['#e8c25a', '#ffffff', '#da291c'], shapes: ['star'], scalar: .9 });
    } else {
      btns[k].classList.add('ko');
      gsap.fromTo(btns[k], { x: -10 }, { x: 0, duration: .55, ease: 'elastic.out(1.2,.25)' });
    }
    const r = $('.qz-r', body);
    r.innerHTML = `<b>${x.ok ? 'Bonne réponse.' : 'Raté.'}</b> ${x.r}`;
    gsap.from(r, { y: 10, opacity: 0, duration: .4 });
    const nx = $('.qz-next', body);
    nx.hidden = false;
    gsap.from(nx, { y: 10, opacity: 0, duration: .4, delay: .15 });
    dots.innerHTML = Array.from({ length: N }, (_, j) => `<i class="${j <= i ? (set[j].ok ? 'ok' : 'ko') : ''}"></i>`).join('');
    nx.focus({ preventScroll: true });
  }
  function end() {
    const [, title, line] = RANKS.find(([min]) => score >= min);
    dots.innerHTML = Array.from({ length: N }, (_, j) => `<i class="${set[j].ok ? 'ok' : 'ko'}"></i>`).join('');
    body.innerHTML = `
      <div class="qz-n">Résultat</div>
      <div class="qz-score"><b>${score}</b><span>/ ${N}</span></div>
      <h3 class="qz-rank">${title}</h3>
      <p class="qz-line">${line}</p>
      <p class="qz-vs">Ton score : <b>${score}</b> · Trophées de l'OM depuis 2012 : <b>0</b> · ${score > 0 ? 'Tu gagnes.' : 'Égalité. Ça pique.'}</p>
      <button type="button" class="qz-go">Rejouer ↻</button>`;
    enter();
    gsap.from('.qz-score b', { scale: 0, rotate: -20, duration: .9, ease: 'back.out(3)' });
    $('.qz-go', body).addEventListener('click', start);
    if (score === N) {
      const r = $('.qz-score', body).getBoundingClientRect();
      C.confetti({ particleCount: 180, spread: 120, startVelocity: 45, origin: { x: (r.left + r.width / 2) / innerWidth, y: r.top / innerHeight }, colors: ['#e8c25a', '#fff1b8', '#ffffff', '#da291c'], shapes: ['star'] });
    }
    if (score === 0) C.egg('zero');
  }
  body.innerHTML = `
    <div class="qz-n">8 questions · réponses vérifiées</div>
    <h3 class="qz-q">Es-tu incollable sur le Classique ?</h3>
    <p class="qz-line">Toutes les réponses sont vraies. Malheureusement pour eux.</p>
    <button type="button" class="qz-go">Commencer le quiz ▶</button>`;
  dots.innerHTML = Array.from({ length: N }, () => '<i></i>').join('');
  $('.qz-go', body).addEventListener('click', start);
  gsap.from('.quiz-card', { y: 70, opacity: 0, rotateX: -10, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.quiz-card', start: 'top 85%' } });
  C.zone('quiz', { trigger: '#quiz', start: 'top 55%', end: 'bottom 55%' }, () => C.scene('t:QUIZ', { opacity: .3 }));
}

/* =========================================================
   LE JEU DU POULET — catch the golden eggs
   ========================================================= */
export function setupGame() {
  const stage = $('.game-stage');
  if (!stage) return;
  const { gsap, ScrollTrigger } = C;
  const cv = $('#game'), g = cv.getContext('2d'), ui = $('#game-ui');
  const sEl = $('#g-score'), tEl = $('#g-time'), bEl = $('#g-best');
  const DUR = 30, BEST = 'psg-poulet-best';
  let W = 0, H = 0, best = +store.get(BEST, 0) || 0;
  bEl.textContent = best;

  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(C.CHICKEN.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));

  let running = false, visible = false, raf = 0, last = 0, left = DUR, score = 0, caught = 0, keys = { l: false, r: false };
  let eggs = [], splats = [], floats = [], sparks = [], hens = [];
  const basket = { x: 0, tx: 0, w: 96, shake: 0 };

  function resize() {
    const r = stage.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    basket.w = W < 520 ? 78 : 96;
    if (!basket.x) basket.x = basket.tx = W / 2;
    if (!hens.length) hens = [0, 1].map(k => ({ x: W * (.3 + k * .4), dir: k ? -1 : 1, speed: 80, lay: .8 + k * .4, bob: Math.random() * 6 }));
    if (!running) draw(0);
  }
  addEventListener('resize', resize);
  img.onload = () => { if (!running) draw(0); };

  const perch = () => Math.max(78, H * .16);
  const ground = () => H - 18;

  function lay(h, p) {
    const x = Math.random();
    const type = x < .08 ? 'star' : x < .3 ? 'om' : 'gold';
    eggs.push({ x: h.x + (h.dir > 0 ? -10 : 10), y: perch() + 8, vy: 30 + Math.random() * 40, r: type === 'star' ? 11 : 10, type, rot: (Math.random() - .5) * .6, spin: (Math.random() - .5) * 2 });
    h.lay = (.55 + Math.random() * .75) * (1 - p * .5);
  }
  function float(x, y, txt, color) { floats.push({ x, y, txt, color, t: 0 }); }
  function burst(x, y, color) { for (let k = 0; k < 10; k++) { const a = Math.random() * Math.PI * 2, v = 60 + Math.random() * 140; sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60, t: 0, color }); } }

  function update(dt) {
    const p = 1 - left / DUR;
    left = Math.max(0, left - dt);
    // hens
    hens.forEach(h => {
      h.x += h.dir * (h.speed + p * 90) * dt;
      if (h.x < 40) { h.x = 40; h.dir = 1; }
      if (h.x > W - 40) { h.x = W - 40; h.dir = -1; }
      if (Math.random() < dt * .6) h.dir *= -1;
      h.speed = 70 + Math.sin(performance.now() / 700 + h.bob) * 40;
      h.lay -= dt;
      if (h.lay <= 0) lay(h, p);
    });
    // basket
    if (keys.l) basket.tx -= 560 * dt;
    if (keys.r) basket.tx += 560 * dt;
    basket.tx = Math.max(basket.w / 2, Math.min(W - basket.w / 2, basket.tx));
    basket.x += (basket.tx - basket.x) * (1 - Math.pow(.00002, dt));
    basket.shake = Math.max(0, basket.shake - dt * 3);
    const by = ground() - 44;
    // eggs
    const grav = 300 + p * 280;
    eggs = eggs.filter(e => {
      e.vy += grav * dt; e.y += e.vy * dt; e.rot += e.spin * dt;
      if (e.y + e.r >= by && e.y - e.r <= by + 20 && Math.abs(e.x - basket.x) <= basket.w / 2 + e.r * .3) {
        if (e.type === 'om') {
          score -= 2; basket.shake = 1;
          float(e.x, by - 10, '−2 · périmé', '#69b3e7'); burst(e.x, by, '#69b3e7');
        } else {
          const v = e.type === 'star' ? 3 : 1;
          score += v; caught += v;
          float(e.x, by - 10, '+' + v, e.type === 'star' ? '#ffffff' : '#e8c25a'); burst(e.x, by, '#e8c25a');
        }
        return false;
      }
      if (e.y + e.r >= ground()) { splats.push({ x: e.x, t: 0, type: e.type }); return false; }
      return true;
    });
    splats = splats.filter(s => (s.t += dt) < 1.4);
    floats = floats.filter(f => (f.t += dt) < .9);
    sparks = sparks.filter(s => { s.t += dt; s.vy += 400 * dt; s.x += s.vx * dt; s.y += s.vy * dt; return s.t < .6; });
  }

  function eggPath(e) {
    g.beginPath();
    g.ellipse(0, 0, e.r * .78, e.r, 0, 0, Math.PI * 2);
  }
  function drawEgg(e) {
    g.save();
    g.translate(e.x, e.y); g.rotate(e.rot);
    const gr = g.createRadialGradient(-e.r * .3, -e.r * .4, 1, 0, 0, e.r * 1.2);
    if (e.type === 'om') { gr.addColorStop(0, '#e9f7ff'); gr.addColorStop(.55, '#69b3e7'); gr.addColorStop(1, '#245f86'); }
    else { gr.addColorStop(0, '#fff6cf'); gr.addColorStop(.5, '#e8c25a'); gr.addColorStop(1, '#8a6416'); }
    eggPath(e);
    g.fillStyle = gr; g.fill();
    if (e.type === 'om') {
      g.strokeStyle = 'rgba(0,30,50,.7)'; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(-5, -2); g.lineTo(-1, 1); g.lineTo(2, -3); g.lineTo(5, 0); g.stroke();
    }
    if (e.type === 'star') {
      g.fillStyle = '#ffffff';
      g.beginPath();
      for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 2.4 : 5.6; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr + 1); }
      g.closePath(); g.fill();
      g.shadowColor = '#fff1b8';
    }
    g.restore();
  }
  function drawBasket(t) {
    const by = ground() - 44, w = basket.w, x = basket.x + Math.sin(t * 60) * basket.shake * 8;
    g.save();
    g.translate(x, by);
    // body
    g.beginPath();
    g.moveTo(-w / 2, 0); g.lineTo(w / 2, 0); g.lineTo(w / 2 - 10, 40); g.lineTo(-w / 2 + 10, 40); g.closePath();
    g.fillStyle = '#004170'; g.fill();
    g.save(); g.clip();
    g.fillStyle = '#ffffff'; g.fillRect(-w * .16 - 3, 0, w * .32 + 6, 40);
    g.fillStyle = '#da291c'; g.fillRect(-w * .16, 0, w * .32, 40);
    g.restore();
    // rim
    g.fillStyle = '#e8c25a';
    g.beginPath(); g.roundRect ? g.roundRect(-w / 2 - 4, -5, w + 8, 8, 4) : g.rect(-w / 2 - 4, -5, w + 8, 8); g.fill();
    g.restore();
  }
  function draw(t) {
    g.clearRect(0, 0, W, H);
    // pitch at the bottom
    const gy = ground();
    for (let k = 0; k < Math.ceil(W / 40); k++) { g.fillStyle = k % 2 ? '#0f3d24' : '#124a2c'; g.fillRect(k * 40, gy, 40, H - gy); }
    // perch wire
    const py = perch();
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(16, py + 30); g.lineTo(W - 16, py + 30); g.stroke();
    // splats
    splats.forEach(s => {
      g.globalAlpha = 1 - s.t / 1.4;
      g.fillStyle = s.type === 'om' ? '#69b3e7' : '#f3d27a';
      g.beginPath(); g.ellipse(s.x, gy - 1, 12 + s.t * 6, 3.5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#fff6dc';
      g.beginPath(); g.ellipse(s.x + 2, gy - 2, 4, 2, 0, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 1;
    });
    // hens
    hens.forEach(h => {
      const s = 64, y = py - s * .55 + Math.abs(Math.sin(t * 9 + h.bob)) * -3;
      g.save();
      g.translate(h.x, y);
      if (h.dir < 0) g.scale(-1, 1);
      if (img.complete && img.naturalWidth !== 0) g.drawImage(img, -s / 2, 0, s, s * 100 / 110);
      g.restore();
    });
    eggs.forEach(drawEgg);
    drawBasket(t);
    sparks.forEach(s => { g.globalAlpha = 1 - s.t / .6; g.fillStyle = s.color; g.fillRect(s.x - 2, s.y - 2, 4, 4); });
    g.globalAlpha = 1;
    floats.forEach(f => {
      g.globalAlpha = 1 - f.t / .9;
      g.fillStyle = f.color; g.font = '400 24px Anton, Impact, sans-serif'; g.textAlign = 'center';
      g.fillText(f.txt, f.x, f.y - f.t * 50);
    });
    g.globalAlpha = 1;
  }

  let shownScore = null, shownTime = null;
  function hud() {
    if (score !== shownScore) { sEl.textContent = score; shownScore = score; gsap.fromTo(sEl, { scale: 1.35 }, { scale: 1, duration: .35, ease: 'back.out(3)' }); }
    const s = Math.ceil(left);
    if (s !== shownTime) { tEl.textContent = s; shownTime = s; tEl.classList.toggle('low', s <= 5); }
  }
  function loop(now) {
    const dt = Math.min(.05, (now - last) / 1000 || 0);
    last = now;
    if (visible && !document.hidden) { update(dt); draw(now / 1000); hud(); }
    if (left <= 0) { end(); return; }
    raf = requestAnimationFrame(loop);
  }
  function start() {
    resize();
    eggs = []; splats = []; floats = []; sparks = [];
    left = DUR; score = 0; caught = 0; shownScore = shownTime = null;
    running = true;
    stage.classList.add('playing');
    document.body.classList.add('gaming');
    gsap.to(ui, { opacity: 0, duration: .3, onComplete: () => { ui.hidden = true; } });
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function end() {
    running = false;
    cancelAnimationFrame(raf);
    stage.classList.remove('playing');
    document.body.classList.remove('gaming');
    const record = score > best;
    if (record) { best = score; store.set(BEST, best); bEl.textContent = best; }
    const vs = score >= 20 ? 'Dix fois plus que les trophées majeurs de l\'OM depuis 1993 (2). Le poulailler est fier.'
      : score > 2 ? 'Plus que les trophées majeurs de l\'OM depuis 1993 (2). Pas mal du tout.'
        : score === 2 ? 'Autant que les trophées majeurs de l\'OM depuis 1993. Aïe.'
          : score >= 0 ? 'Moins que l\'OM depuis 1993. Là, c\'est grave.'
            : 'Score négatif. Tu as trop mangé d\'œufs de l\'OM. Ils sont périmés depuis 2012.';
    ui.innerHTML = `
      <div class="game-k">Fin du match${record ? ' · nouveau record !' : ''}</div>
      <div class="game-score"><b>${score}</b><span>points</span></div>
      <p class="game-vs">${vs}</p>
      <button type="button" class="game-go">Rejouer ▶</button>`;
    ui.hidden = false;
    gsap.fromTo(ui, { opacity: 0, scale: .94 }, { opacity: 1, scale: 1, duration: .5, ease: 'expo.out' });
    $('.game-go', ui).addEventListener('click', start);
    if (record && score > 0) {
      const r = stage.getBoundingClientRect();
      C.confetti({ particleCount: 120, spread: 90, origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight }, colors: ['#e8c25a', '#fff1b8', '#ffffff'], shapes: ['star', 'circle'] });
    }
    if (caught >= 20) C.egg('poulailler');
  }

  // input
  const setX = e => { const r = stage.getBoundingClientRect(); basket.tx = e.clientX - r.left; };
  stage.addEventListener('pointermove', e => { if (running) setX(e); });
  stage.addEventListener('pointerdown', e => { if (running) setX(e); });
  addEventListener('keydown', e => {
    if (!running || !visible) return;
    if (e.key === 'ArrowLeft') { keys.l = true; e.preventDefault(); }
    if (e.key === 'ArrowRight') { keys.r = true; e.preventDefault(); }
  });
  addEventListener('keyup', e => { if (e.key === 'ArrowLeft') keys.l = false; if (e.key === 'ArrowRight') keys.r = false; });
  $('#game-go').addEventListener('click', start);

  ScrollTrigger.create({ trigger: '.game-stage', start: 'top bottom', end: 'bottom top', onToggle: s => { visible = s.isActive; if (visible && !running) resize(); } });
  requestAnimationFrame(resize);
  gsap.from('.game-wrap', { y: 70, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.game-wrap', start: 'top 85%' } });
  C.zone('poulet', { trigger: '#poulet', start: 'top 55%', end: 'bottom 55%' }, () => C.scene('t:COT COT', { opacity: .3 }));
}

export { sleep };
