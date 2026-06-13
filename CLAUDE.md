# CLAUDE.md

Guide pour travailler sur ce projet.

## Le projet

**À qui le tour ?** — application web ludique de type « roue de la fortune »
pour soirées jeux. On saisit des joueurs et des jeux (chacun avec un nombre de
participants), on fait tourner la roue, elle tombe sur un jeu et tire au hasard
les joueurs correspondants. On peut relancer le tirage des joueurs sans refaire
tourner la roue.

Spec de design : `docs/superpowers/specs/2026-06-13-a-qui-le-tour-design.md`.

## Stack & contraintes

- **HTML / CSS / JavaScript pur**, sans build ni dépendance.
- Doit rester **ouvrable directement en `file://`** : utiliser des `<script>`
  classiques (pas de modules ES) communiquant via un espace de noms global
  `RoueGame`.
- Persistance via **localStorage**.
- Interface en **français**.

## Lancer l'appli

Ouvrir `index.html` dans un navigateur (double-clic ou `open index.html`).
Aucun serveur requis.

## Structure du code

- `index.html` — structure de la page, sur trois colonnes : panneau réglages,
  scène roue, panneau résultat (à droite, cadre d'attente tant que la roue n'a
  pas tourné).
- `styles.css` — thème « fête foraine » (multicolore vif, fond sombre, jante
  noire, ampoules blanches) + mise en page responsive.
- `logic.js` — helpers purs et testables (normalisation des noms, détection des
  doublons, tirage des joueurs).
- `storage.js` — état + localStorage (joueurs, jeux, tout effacer).
- `wheel.js` — dessin Canvas de la roue (taille responsive, net en HiDPI) +
  animation de rotation.
- `app.js` — câblage UI, orchestration du spin, tirage des joueurs, résultat.

## Conventions

- Interface, libellés et commentaires en français.
- Code vanilla lisible ; chaque fichier a une responsabilité claire (voir la
  spec, section « Organisation du code »).
- Sauvegarder l'état après chaque modification des joueurs/jeux.
