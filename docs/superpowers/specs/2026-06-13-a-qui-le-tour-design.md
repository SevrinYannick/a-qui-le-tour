# À qui le tour ? — Design

## Objectif

Application web ludique de type « roue de la fortune » pour une soirée jeux : on
saisit des joueurs et une liste de jeux (chacun avec un nombre de participants),
puis on fait tourner la roue. La roue tombe sur un jeu, et l'appli tire au hasard
les joueurs pour ce jeu. On peut relancer le tirage des joueurs sans refaire
tourner la roue.

## Contraintes

- **Stack** : HTML / CSS / JavaScript pur, sans build ni dépendance.
- **Ouvrable directement en `file://`** dans le navigateur → scripts `<script>`
  classiques (pas de modules ES, qui nécessiteraient un serveur).
- **Persistance** : localStorage.
- **Langue de l'interface** : français.

## Modèle de données

État global persisté en localStorage sous une clé unique (ex. `roue-game-state`) :

```js
{
  players: ["Alice", "Bob", ...],          // noms uniques, non vides
  games: [
    { id: "g1", name: "Catan", playerCount: 4 },
    { id: "g2", name: "Uno",   playerCount: 6 },
    ...
  ]
}
```

- `players` : liste de chaînes uniques (insensible à la casse pour l'unicité),
  non vides.
- `games` : liste d'objets `{ id, name, playerCount }`. `id` généré (timestamp +
  compteur). `playerCount` entier ≥ 1.
- Retirer un jeu = le supprimer de `games`.
- Sauvegarde automatique après chaque modification.

## Disposition (une seule page)

- **Panneau réglages (gauche)**
  - *Joueurs* : champ texte + bouton « Ajouter » ; liste des joueurs avec ✕ pour
    supprimer.
  - *Jeux* : champ nom + champ nombre + bouton « Ajouter » ; liste « Nom · N »
    avec ✕.
  - Bouton « Tout effacer » (réinitialise joueurs + jeux + localStorage, avec
    confirmation).
- **Scène centrale (roue)**
  - Roue en Canvas, pointeur en haut, bouton **TOURNER**.
  - Zone résultat sous la roue.

## Roue (Canvas)

- Un segment par jeu présent dans `games`, tous de taille égale
  (`2π / games.length`).
- Couleurs issues d'une palette arc-en-ciel chaud, attribuées par index de
  segment et cyclées si besoin.
- Nom du jeu écrit dans chaque segment (texte pivoté radialement).
- Décor fête foraine : jante noire, ampoules blanches réparties sur la jante,
  moyeu central, pointeur triangulaire en haut.
- **Animation** : au clic sur TOURNER, rotation cible aléatoire (plusieurs tours
  complets + angle aléatoire), décélération douce (easing ease-out) via
  `requestAnimationFrame`. À l'arrêt, le segment sous le pointeur (en haut)
  détermine le jeu choisi.
- Pendant l'animation, les boutons d'action sont désactivés.

## Tirage des joueurs

- À l'arrêt de la roue, tirage automatique de `N` joueurs distincts au hasard
  dans `players`, avec `N = min(game.playerCount, players.length)`.
- Mélange aléatoire (Fisher-Yates) puis prise des `N` premiers.
- Chaque tirage est indépendant : un joueur peut ressortir d'un jeu à l'autre.

## Zone résultat

- Affiche le nom du jeu tiré et la liste des joueurs sélectionnés.
- **Relancer les joueurs** : re-tire `N` joueurs pour le même jeu, sans refaire
  tourner la roue.
- **Retirer ce jeu** : supprime le jeu de `games` (donc de la roue) ; la roue est
  redessinée et le résultat effacé.

## Cas limites

- 0 joueur **ou** 0 jeu → bouton TOURNER désactivé + message explicatif.
- `playerCount` > nombre de joueurs → on prend tous les joueurs disponibles.
- Tous les jeux retirés → roue vide + message « Plus de jeux, ajoute-en ! ».
- Ajout d'un joueur/jeu en double (nom identique) → refusé avec petit message.

## Organisation du code

Fichiers chargés via `<script>` classiques (ordre de chargement géré dans
`index.html`), communiquant via un petit espace de noms global `RoueGame` :

- `index.html` — structure de la page.
- `styles.css` — thème « fête foraine » (multicolore vif, fond sombre, jante
  noire, ampoules blanches).
- `storage.js` — chargement / sauvegarde de l'état, helpers d'accès et de
  mutation (add/remove player, add/remove game, clear all).
- `wheel.js` — dessin du Canvas (segments, texte, jante, ampoules, pointeur) et
  animation de rotation ; expose une fonction `spin(callback)` qui renvoie
  l'index du jeu gagnant.
- `app.js` — câblage de l'UI (panneau réglages, boutons), orchestration du spin,
  tirage des joueurs, rendu du résultat, gestion des cas limites.

## Tests

- Logique pure testable manuellement / via petites fonctions isolées :
  - tirage des joueurs (distincts, bon nombre, plafonnement),
  - unicité des noms,
  - sélection du segment gagnant en fonction de l'angle final.
- Vérification visuelle dans le navigateur pour l'animation et le thème.
