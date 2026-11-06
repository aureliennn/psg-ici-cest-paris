# ICI C'EST PARIS ★★

Site fan (non officiel) du Paris Saint-Germain, entièrement conçu, codé et animé par Claude.

- **Particules 3D** (Three.js) : 10 000 points qui se transforment en PSG, en années, en étoiles, en 5–0…
- **Histoire** en scroll horizontal (GSAP ScrollTrigger + Lenis), dont 1993 : le titre retiré à Marseille, proposé à Paris, refusé.
- **Les deux étoiles** : Munich 2025 (5–0) et Budapest 2026 (back-to-back)
- **Une 3ème… ?** : maintiens le bouton pour invoquer le back-to-back-to-back
- **Le Classique** : Paris vs Marseille, palmarès comparé barre par barre, morceaux choisis (le 5–0 du 08.02.2026, le Koweït…) et **la frise 1993 → 2026** des trophées majeurs : Paris 30, Marseille 2, et le « désert du Vieux-Port » depuis 2011.
- **Le compteur** : temps écoulé, à la seconde près, depuis le dernier trophée de l'OM (14.04.2012). Il ne s'arrête jamais.
- **Les excuses** : générateur officiel d'excuses d'après-match (4 860 combinaisons) avec mistral-mètre.
- **Le simulateur** : simule la saison de l'OM. Dix mois, des milliers de scénarios, un seul résultat.
- **Le quiz du Classique** : 8 questions tirées parmi 12, réponses vérifiées, rang final de « Ultra d'Auteuil » à « zéro pointé ».
- **Le jeu du poulet** : 30 secondes pour rattraper les œufs en or du poulet parisien et éviter les œufs de l'OM (périmés depuis 2012). Record sauvegardé.
- **Le musée de l'OM** : une coupe, beaucoup de poussière, des toiles d'araignée et un virevoltant.
- **Le moteur de recherche** : une seule question, une seule réponse. Tape Nîmes, ça marche quand même.
- **22 secrets** cachés partout (un compteur apparaît dès le premier trouvé, les indices sont dans le footer).

<details>
<summary>Spoilers : les 22 secrets</summary>

| # | Secret | Comment |
|---|--------|---------|
| 1 | Le tifo | Code Konami ↑↑↓↓←→←→BA (mobile : glisser ↑↑↓↓←→←→ puis deux taps) |
| 2 | Rétrogradation | Taper `marseille` au clavier |
| 3 | La cassette | Taper `1993` |
| 4 | Le poulet parisien | Taper `poulet` — clique sur ses œufs en or |
| 5 | L'enveloppe | Cachée dans le jardin du panneau 1993 de l'Histoire |
| 6 | La troisième étoile | Cliquer 7 fois sur le logo |
| 7 | Le retour | Changer d'onglet puis revenir |
| 8 | Le silence | Ne rien toucher pendant 30 secondes |
| 9 | La version marseillaise | Bouton dans le footer |
| 10 | Les Crocos | Taper `nimes` |
| 11 | Le développeur | `palmaresOM()` dans la console |
| 12 | Le rêve | Simuler des saisons de l'OM jusqu'à ce qu'ils rêvent |
| 13 | Coup de chiffon | Dépoussiérer la coupe du musée |
| 14 | Février | Taper `fevrier` : tout s'effondre |
| 15 | Allez l'OM | Taper `allez l'om` : trombone triste |
| 16 | Feu d'artifice | Taper `ici c'est paris` |
| 17 | Rage quit | Secouer la souris (ou le téléphone) |
| 18 | L'étoile qui lâche | Cliquer 3 fois sur l'étoile de Marseille dans le Classique |
| 19 | La fuite | Scroller très, très vite |
| 20 | Le zéro pointé | Finir le quiz avec 0 bonne réponse |
| 21 | Porte-parole | Générer 15 excuses |
| 22 | Le poulailler d'or | Faire 20 points en œufs dorés au jeu du poulet |

Sur mobile, les codes clavier se tapent dans le champ « code secret » du panneau des secrets. Bonus non comptés : messages spéciaux certains jours (février, 14 avril, 26, 30 et 31 mai).
</details>

Aucune étape de build : `index.html`, `style.css`, `main.js`, `eggs.js`, `marseille.js`.

**Aussi dans ce repo :** [`the-weeknd/`](the-weeknd/), un second site fan sur la carrière de The Weeknd (discographie, vinyles, tournées, ventes, records, 15 secrets), construit avec le même moteur. Les librairies viennent de CDN.

```bash
python -m http.server 5173
```
