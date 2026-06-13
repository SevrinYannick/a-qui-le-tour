# 🎡 À qui le tour ?

> La roue de la fortune des soirées jeux. Elle décide **à quoi** on joue… et **qui** joue. Toi, tu n'as plus qu'à râler quand tu tombes sur le jeu que tu détestes.

Parce que « on joue à quoi ? » suivi de 25 minutes de débat, c'est fini. On entre les joueurs, on entre les jeux, **on tourne**, et le destin (un `Math.random()` bien élevé) tranche.

## 🎯 Le principe

1. **Les joueurs** — tu tapes les noms de la fine équipe.
2. **Les jeux** — chaque jeu avec son nombre de participants (Catan · 4, Loups-Garous · 8…).
3. **On tourne** 🎰 — la roue ralentit, suspense insoutenable, elle s'arrête sur un jeu.
4. **Le tirage** — l'appli pioche au hasard les joueurs pour ce jeu.
5. Pas content du tirage ? **Relance les joueurs** sans refaire tourner la roue.
6. Jeu déjà fait ? **Retire-le** de la roue et continue la soirée.

Le nom ? Double sens maison : le **tour** de la roue 🎡 + « à qui c'est **le tour** de jouer ? ». Voilà voilà.

## 🚀 Lancer le bazar

Aucune installation, aucun build, aucune excuse :

```
ouvre index.html dans ton navigateur
```

C'est tout. Tes joueurs et tes jeux sont gardés en mémoire (localStorage), donc tu peux fermer l'onglet sans tout reperdre. Un bouton **Tout effacer** pour repartir de zéro.

## 🛠️ Sous le capot

HTML / CSS / JavaScript **pur**, zéro dépendance. La roue est dessinée au `<canvas>`, l'ambiance est résolument fête foraine 🎪 (ampoules, jante noire, couleurs qui piquent).

| Fichier | Rôle |
|---|---|
| `index.html` | la page |
| `styles.css` | le thème fête foraine |
| `logic.js` | la logique pure (tirage, segment gagnant) — testée |
| `storage.js` | l'état + la sauvegarde localStorage |
| `wheel.js` | le dessin et l'animation de la roue |
| `app.js` | le câblage de tout ça |

## 🧪 Les tests

Logique pure testée (tirage des joueurs, unicité des noms, segment gagnant). Ouvre :

```
tests/tests.html
```

…et admire le tableau tout vert. ✅

---

Fait avec 🎡 et beaucoup trop de réflexion sur la trigonométrie d'une roue qui tourne.
