/* =========================================================
   THE WEEKND — données (vérifiées en novembre 2026)
   Sources principales : Billboard / Luminate, RIAA, Guinness World Records,
   Spotify, Live Nation / Pollstar, Variety. Voir README.
   ========================================================= */

/* --- discographie --------------------------------------------------- */
// kind: mixtape | compil | album | ep ; peak: Billboard 200 ; week: unités 1re semaine (US)
export const RELEASES = [
  {
    id: 'hob', title: 'House of Balloons', date: '2011-03-21', kind: 'mixtape', c1: '#d9d4cf', c2: '#2a2a2e', motif: 'balloons',
    note: 'Première mixtape, offerte en téléchargement gratuit. Le mystère est total : personne ne sait qui chante.',
    keys: ['Wicked Games', 'The Morning', 'High for This'],
  },
  {
    id: 'thu', title: 'Thursday', date: '2011-08-18', kind: 'mixtape', c1: '#8fa3b8', c2: '#101722', motif: 'bars',
    note: 'Deuxième mixtape gratuite, cinq mois plus tard. Drake s\'invite sur « The Zone ».',
    keys: ['Rolling Stone', 'The Zone'],
  },
  {
    id: 'eos', title: 'Echoes of Silence', date: '2011-12-21', kind: 'mixtape', c1: '#f2f2f2', c2: '#050505', motif: 'echo',
    note: 'Troisième mixtape de l\'année. Trois projets en neuf mois, tous gratuits.',
    keys: ['Montreal', 'D.D.'],
  },
  {
    id: 'tri', title: 'Trilogy', date: '2012-11-13', kind: 'compil', c1: '#b9b9b9', c2: '#111', motif: 'three', peak: 4, week: 86000,
    note: 'Les trois mixtapes remasterisées + trois inédits. Premier projet chez Republic, en partenariat avec son label XO.',
    keys: ['Twenty Eight', 'Wicked Games'],
  },
  {
    id: 'kl', title: 'Kiss Land', date: '2013-09-10', kind: 'album', c1: '#ff3d8b', c2: '#16051a', motif: 'grid', peak: 2, week: 95000,
    note: 'Premier album studio. Une ambiance néon, entre Tokyo et le cinéma d\'horreur.',
    keys: ['Belong to the World', 'Live For', 'Kiss Land'],
  },
  {
    id: 'bbtm', title: 'Beauty Behind the Madness', date: '2015-08-28', kind: 'album', c1: '#ff8a1f', c2: '#1a0700', motif: 'flame', peak: 1, week: 412000,
    note: 'Premier n°1 au Billboard 200. Deux n°1 au Hot 100, une nomination aux Oscars pour « Earned It », deux Grammys.',
    keys: ['Can\'t Feel My Face', 'The Hills', 'Earned It'],
  },
  {
    id: 'sb', title: 'Starboy', date: '2016-11-25', kind: 'album', c1: '#4d7cff', c2: '#ff2bd6', motif: 'cross', peak: 1, week: 348000,
    note: 'Deux titres avec Daft Punk, dont « Starboy », n°1 au Hot 100. Grammy du meilleur album urbain contemporain.',
    keys: ['Starboy', 'I Feel It Coming', 'Party Monster'],
  },
  {
    id: 'mdm', title: 'My Dear Melancholy,', date: '2018-03-30', kind: 'ep', c1: '#aab3c2', c2: '#0b0d12', motif: 'comma', peak: 1, week: 169000,
    note: 'Six titres sortis par surprise. Troisième n°1 d\'affilée — avec une virgule dans le titre.',
    keys: ['Call Out My Name', 'Try Me'],
  },
  {
    id: 'ah', title: 'After Hours', date: '2020-03-20', kind: 'album', c1: '#ff1f3d', c2: '#140003', motif: 'city', peak: 1, week: 444000,
    note: 'La plus grosse semaine de 2020 à sa sortie. Contient « Blinding Lights », sacré plus grand tube de l\'histoire du Hot 100.',
    keys: ['Heartless', 'Blinding Lights', 'Save Your Tears', 'In Your Eyes'],
  },
  {
    id: 'dfm', title: 'Dawn FM', date: '2022-01-07', kind: 'album', c1: '#ffb38a', c2: '#0b1e3d', motif: 'waves', peak: 2, week: 148000,
    note: 'Un album pensé comme une émission de radio, « 103.5 Dawn FM », présentée par Jim Carrey.',
    keys: ['Take My Breath', 'Sacrifice', 'Out of Time'],
  },
  {
    id: 'hut', title: 'Hurry Up Tomorrow', date: '2025-01-31', kind: 'album', c1: '#efe8dc', c2: '#1b0505', motif: 'sun', peak: 1, week: 490500,
    note: 'Dernier volet de la trilogie After Hours · Dawn FM · Hurry Up Tomorrow. Meilleure première semaine de sa carrière, et un film du même nom en mai 2025.',
    keys: ['Dancing in the Flames', 'Timeless', 'São Paulo'],
  },
];
export const KIND = { mixtape: 'Mixtape', compil: 'Compilation', album: 'Album studio', ep: 'EP' };

/* --- vinyles : faits spécifiques au format ---------------------------- */
export const VINYL = {
  hut: { fact: 'Sorti en 8 variantes vinyle (plus 8 CD, une cassette et 9 coffrets deluxe). Environ 77 000 vinyles vendus la première semaine aux États-Unis. Des éditions illustrées par Frank Miller et Harmony Korine.', rpm: 33 },
  dfm: { fact: 'Record : près de 34 000 vinyles vendus en une semaine (mai 2022), la plus grosse semaine vinyle pour un album R&B depuis le début du suivi Luminate en 1991. L\'ancien record, Prince : 22 000.', rpm: 33 },
};

/* --- tournées --------------------------------------------------------- */
export const TOURS = [
  { name: 'Kiss Land Fall Tour', years: '2013', note: 'La tournée nord-américaine du premier album studio.' },
  { name: 'King of the Fall Tour', years: '2014', note: 'Une tournée nord-américaine d\'automne, avec ScHoolboy Q et Jhené Aiko.' },
  { name: 'The Madness Fall Tour', years: '2015', gross: 24.3, note: '24,3 M$ de recettes en 2015 (Pollstar).' },
  { name: 'Starboy: Legend of the Fall Tour', years: '2017', gross: 82.1, note: '82,1 M$ de recettes. Les arénas du monde entier.' },
  { name: 'The Weeknd Asia Tour', years: '2018', note: 'Une tournée en Asie, fin 2018.' },
  { name: 'After Hours til Dawn Tour', years: '2022 → 2026', gross: 1300, big: true, note: 'Plus de 1,3 Md$ et plus de 9 millions de billets : 176 concerts, 67 villes, 30 pays, 5 continents. Dernier show à Kuala Lumpur, en novembre 2026.' },
];

/* --- records ---------------------------------------------------------- */
export const RECORDS = [
  { big: '1,3 Md$', t: 'Tournée la plus lucrative de l\'histoire pour un artiste masculin', s: 'After Hours til Dawn, devant les 939 M$ de la tournée d\'adieu d\'Elton John. 3e tous artistes confondus.' },
  { big: '5 Md', t: 'Premier titre à 5 milliards de streams sur Spotify', s: '« Blinding Lights », le 31 août 2025 (Guinness World Records). Il avait déjà été le premier à 4 milliards, en janvier 2024.' },
  { big: 'N°1', t: 'Plus grand tube de l\'histoire du Hot 100', s: 'Classement Billboard de novembre 2021 : « Blinding Lights » en tête de tous les temps.' },
  { big: '52 sem.', t: 'Une année entière dans le top 10 du Hot 100', s: '« Blinding Lights » est le premier titre à rester un an complet dans le top 10.' },
  { big: '100 M', t: 'Premier artiste à 100 millions d\'auditeurs mensuels', s: 'Sur Spotify, le 27 février 2023. Record Guinness : 111,4 millions le 20 mars 2023.' },
  { big: '28', t: 'Titres au « Billions Club » de Spotify', s: 'Plus que n\'importe quel autre artiste (août 2025).' },
  { big: '7', t: 'Singles certifiés Diamant aux États-Unis', s: 'Premier artiste canadien à atteindre ce total (RIAA, 2024).' },
  { big: '7', t: 'Numéros 1 au Billboard Hot 100', s: 'Can\'t Feel My Face, The Hills, Starboy, Heartless, Blinding Lights, Save Your Tears, Die For You.' },
];

/* --- quiz ------------------------------------------------------------- */
// la première option est la bonne (mélangées à l'affichage)
export const QUIZ = [
  { q: 'Quel est le vrai nom de The Weeknd ?', o: ['Abel Tesfaye', 'Aubrey Graham', 'Abel Toronto', 'Tesfa Weekend'], r: 'Abel Makkonen Tesfaye, né le 16 février 1990 à Toronto. (Aubrey Graham, c\'est Drake.)' },
  { q: 'Combien de mixtapes a-t-il sorties en 2011 ?', o: ['Trois', 'Une', 'Deux', 'Cinq'], r: 'House of Balloons, Thursday et Echoes of Silence. Trois en neuf mois, toutes gratuites.' },
  { q: 'Quel duo apparaît sur « Starboy » ?', o: ['Daft Punk', 'Justice', 'The Chemical Brothers', 'Disclosure'], r: 'Daft Punk, sur « Starboy » et « I Feel It Coming ».' },
  { q: 'Quel titre a été le premier à atteindre 5 milliards de streams sur Spotify ?', o: ['Blinding Lights', 'Starboy', 'Save Your Tears', 'The Hills'], r: '« Blinding Lights », le 31 août 2025.' },
  { q: 'Qui présente la radio fictive de « Dawn FM » ?', o: ['Jim Carrey', 'Jim Parsons', 'Keanu Reeves', 'Bill Murray'], r: 'Jim Carrey, l\'animateur de « 103.5 Dawn FM ».' },
  { q: 'Où a-t-il fait le show de la mi-temps du Super Bowl LV ?', o: ['Tampa', 'Los Angeles', 'Toronto', 'Las Vegas'], r: 'Au Raymond James Stadium de Tampa, le 7 février 2021.' },
  { q: 'Combien a rapporté la tournée After Hours til Dawn ?', o: ['Plus de 1,3 milliard de dollars', '500 millions', '900 millions', '2 milliards'], r: 'Plus de 1,3 Md$ : record pour un artiste masculin.' },
  { q: 'Combien de Grammy Awards a-t-il gagnés ?', o: ['Quatre', 'Aucun', 'Douze', 'Un seul'], r: 'Quatre. Et zéro nomination pour After Hours en 2021, ce qui l\'a poussé à boycotter la cérémonie.' },
  { q: 'Quel album a fait la meilleure première semaine de sa carrière ?', o: ['Hurry Up Tomorrow', 'After Hours', 'Starboy', 'Beauty Behind the Madness'], r: 'Hurry Up Tomorrow : 490 500 unités en une semaine (février 2025).' },
  { q: 'Avec qui chante-t-il « Save Your Tears » (remix) et « Die For You » (remix), tous deux n°1 ?', o: ['Ariana Grande', 'Dua Lipa', 'Doja Cat', 'Billie Eilish'], r: 'Ariana Grande : deux n°1 ensemble au Hot 100, en 2021 et en 2023.' },
  { q: 'Quel titre lui a valu une nomination aux Oscars ?', o: ['Earned It', 'The Hills', 'Call Out My Name', 'Wicked Games'], r: '« Earned It », de la bande originale de Cinquante nuances de Grey.' },
  { q: 'Dans quelle ville a eu lieu le dernier concert de la tournée After Hours til Dawn ?', o: ['Kuala Lumpur', 'Toronto', 'Londres', 'São Paulo'], r: 'Kuala Lumpur, en novembre 2026, après 176 concerts.' },
];
