# Roue de jeux — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construire une appli web « roue de la fortune » qui tire un jeu puis des joueurs au hasard, en HTML/CSS/JS pur ouvrable directement dans le navigateur.

**Architecture:** Page unique avec panneau de réglages (joueurs/jeux) + scène centrale (roue Canvas). Logique pure isolée dans `logic.js` (testée), état persisté en localStorage via `storage.js`, dessin + animation dans `wheel.js`, câblage UI dans `app.js`. Scripts `<script>` classiques partageant un namespace global `RoueGame` (pas de modules ES, pour rester ouvrable en `file://`).

**Tech Stack:** HTML5, CSS3, JavaScript vanilla, Canvas 2D, localStorage. Aucune dépendance, aucun build.

---

## Structure des fichiers

- `index.html` — structure de la page ; charge les scripts dans l'ordre : `logic.js`, `storage.js`, `wheel.js`, `app.js`.
- `styles.css` — thème « fête foraine » multicolore vif.
- `logic.js` — fonctions pures sans effet de bord : `normalizeName`, `isDuplicateName`, `pickPlayers`, `winningIndex`.
- `storage.js` — `RoueGame.store` : état en mémoire + persistance localStorage + mutations (add/remove joueur/jeu, clearAll).
- `wheel.js` — `RoueGame.Wheel` : dessin Canvas + animation de rotation.
- `app.js` — câblage UI, orchestration du spin, rendu du résultat.
- `tests/tests.html` — page de tests ; charge `logic.js`, `test-runner.js`, `logic.test.js`.
- `tests/test-runner.js` — mini harnais de test (assert + rapport).
- `tests/logic.test.js` — tests des fonctions pures de `logic.js`.

> Note : `logic.js` est un ajout par rapport à la spec (qui listait `storage/wheel/app`). Il isole la logique pure sans DOM ni localStorage pour la rendre testable proprement.

**Convention d'angle de la roue** (partagée par `wheel.js` et `logic.winningIndex`) :
- `rotation` = rotation horaire totale de la roue en radians, positive dans le sens horaire (sens Canvas avec y vers le bas).
- À `rotation = 0`, le segment `i` occupe localement l'intervalle angulaire `[i·seg, (i+1)·seg)` mesuré dans le sens horaire depuis le haut (midi), avec `seg = 2π/count`.
- Le pointeur est fixe en haut (midi).

---

## Task 1 : Squelette du projet + namespace

**Files:**
- Create: `index.html`
- Create: `styles.css`
- Create: `logic.js`
- Create: `storage.js`
- Create: `wheel.js`
- Create: `app.js`
- Create: `.gitignore`

- [ ] **Step 1 : Initialiser git et le `.gitignore`**

```bash
cd /Users/yannick/Developer/SEVRINWEB/a-qui-le-tour
git init
printf '.superpowers/\n.DS_Store\n' > .gitignore
```

- [ ] **Step 2 : Créer `index.html`**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Roue de jeux</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="topbar">
    <h1>🎡 Roue de jeux</h1>
  </header>

  <main class="layout">
    <!-- Panneau réglages -->
    <aside class="panel">
      <section class="block">
        <h2>Joueurs</h2>
        <form id="player-form" class="add-row">
          <input id="player-name" type="text" placeholder="Nom du joueur" autocomplete="off">
          <button type="submit">Ajouter</button>
        </form>
        <p id="player-msg" class="msg"></p>
        <ul id="player-list" class="list"></ul>
      </section>

      <section class="block">
        <h2>Jeux</h2>
        <form id="game-form" class="add-row">
          <input id="game-name" type="text" placeholder="Nom du jeu" autocomplete="off">
          <input id="game-count" type="number" min="1" value="2" class="count">
          <button type="submit">Ajouter</button>
        </form>
        <p id="game-msg" class="msg"></p>
        <ul id="game-list" class="list"></ul>
      </section>

      <button id="clear-all" class="danger">Tout effacer</button>
    </aside>

    <!-- Scène roue -->
    <section class="stage">
      <div class="wheel-area">
        <div class="pointer"></div>
        <canvas id="wheel" width="420" height="420"></canvas>
      </div>
      <button id="spin" class="spin-btn">TOURNER</button>
      <p id="stage-msg" class="msg"></p>

      <div id="result" class="result hidden">
        <h2 id="result-game"></h2>
        <ul id="result-players" class="result-players"></ul>
        <div class="result-actions">
          <button id="reroll">Relancer les joueurs</button>
          <button id="remove-game" class="danger">Retirer ce jeu</button>
        </div>
      </div>
    </section>
  </main>

  <script src="logic.js"></script>
  <script src="storage.js"></script>
  <script src="wheel.js"></script>
  <script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 3 : Créer `styles.css` (placeholder minimal, thème en Task 11)**

```css
* { box-sizing: border-box; }
body { font-family: system-ui, sans-serif; margin: 0; }
.layout { display: flex; gap: 24px; padding: 24px; }
.panel { width: 320px; }
.stage { flex: 1; text-align: center; }
.hidden { display: none; }
.wheel-area { position: relative; display: inline-block; }
```

- [ ] **Step 4 : Créer les 4 fichiers JS avec le namespace**

`logic.js` :
```js
window.RoueGame = window.RoueGame || {};
RoueGame.logic = {};
```

`storage.js` :
```js
window.RoueGame = window.RoueGame || {};
RoueGame.store = {};
```

`wheel.js` :
```js
window.RoueGame = window.RoueGame || {};
RoueGame.Wheel = {};
```

`app.js` :
```js
window.RoueGame = window.RoueGame || {};
```

- [ ] **Step 5 : Vérifier dans le navigateur**

Run: `open index.html`
Expected: la page s'affiche (titre, panneau joueurs/jeux, zone roue vide), aucune erreur dans la console (vérifier l'onglet Console des devtools).

- [ ] **Step 6 : Commit**

```bash
git add -A
git commit -m "chore: squelette du projet roue de jeux"
```

---

## Task 2 : Harnais de test

**Files:**
- Create: `tests/test-runner.js`
- Create: `tests/tests.html`
- Create: `tests/logic.test.js`

- [ ] **Step 1 : Créer `tests/test-runner.js`**

```js
(function () {
  const results = [];
  let pass = 0, fail = 0;

  function test(name, fn) {
    try { fn(); pass++; results.push({ name, ok: true }); }
    catch (e) { fail++; results.push({ name, ok: false, msg: e.message }); }
  }
  function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion échouée'); }
  function assertEqual(actual, expected, msg) {
    if (actual !== expected) throw new Error(`${msg || ''} attendu ${expected}, obtenu ${actual}`);
  }
  function assertDeep(actual, expected, msg) {
    if (JSON.stringify(actual) !== JSON.stringify(expected))
      throw new Error(`${msg || ''} attendu ${JSON.stringify(expected)}, obtenu ${JSON.stringify(actual)}`);
  }
  function report() {
    const el = document.getElementById('out') || document.body;
    el.innerHTML =
      `<h2 style="color:${fail === 0 ? 'green' : 'red'}">${fail === 0 ? '✅' : '❌'} ${pass} réussis, ${fail} échoués</h2>` +
      results.map(r =>
        `<div style="color:${r.ok ? 'green' : 'red'}">${r.ok ? '✓' : '✗'} ${r.name}${r.ok ? '' : ' — ' + r.msg}</div>`
      ).join('');
    console.log(`${pass} réussis, ${fail} échoués`);
  }

  window.RoueTest = { test, assert, assertEqual, assertDeep, report };
})();
```

- [ ] **Step 2 : Créer `tests/tests.html`**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Tests — Roue de jeux</title>
</head>
<body>
  <div id="out"></div>
  <script src="../logic.js"></script>
  <script src="test-runner.js"></script>
  <script src="logic.test.js"></script>
</body>
</html>
```

- [ ] **Step 3 : Créer `tests/logic.test.js` avec un test trivial**

```js
RoueTest.test('le harnais fonctionne', function () {
  RoueTest.assertEqual(1 + 1, 2);
});

RoueTest.report();
```

- [ ] **Step 4 : Vérifier le harnais**

Run: `open tests/tests.html`
Expected: « ✅ 1 réussis, 0 échoués ».

- [ ] **Step 5 : Commit**

```bash
git add -A
git commit -m "test: mini harnais de tests navigateur"
```

---

## Task 3 : `logic.normalizeName` + `logic.isDuplicateName` (TDD)

**Files:**
- Modify: `logic.js`
- Test: `tests/logic.test.js`

- [ ] **Step 1 : Écrire les tests (remplacer le contenu de `tests/logic.test.js`)**

```js
RoueTest.test('normalizeName enlève les espaces et garde la casse affichée', function () {
  RoueTest.assertEqual(RoueGame.logic.normalizeName('  Alice  '), 'Alice');
});

RoueTest.test('isDuplicateName est insensible à la casse et aux espaces', function () {
  const names = ['Alice', 'Bob'];
  RoueTest.assertEqual(RoueGame.logic.isDuplicateName(names, '  alice '), true);
  RoueTest.assertEqual(RoueGame.logic.isDuplicateName(names, 'Carol'), false);
});

RoueTest.report();
```

- [ ] **Step 2 : Lancer les tests pour vérifier l'échec**

Run: `open tests/tests.html`
Expected: ÉCHEC — `RoueGame.logic.normalizeName is not a function`.

- [ ] **Step 3 : Implémenter (ajouter dans `logic.js`, après l'initialisation du namespace)**

```js
RoueGame.logic.normalizeName = function (raw) {
  return String(raw == null ? '' : raw).trim();
};

RoueGame.logic.isDuplicateName = function (existingNames, candidate) {
  const c = RoueGame.logic.normalizeName(candidate).toLowerCase();
  return existingNames.some(function (n) {
    return RoueGame.logic.normalizeName(n).toLowerCase() === c;
  });
};
```

- [ ] **Step 4 : Lancer les tests pour vérifier le succès**

Run: `open tests/tests.html`
Expected: « ✅ 3 réussis, 0 échoués ».

- [ ] **Step 5 : Commit**

```bash
git add -A
git commit -m "feat: helpers de normalisation et d'unicité des noms"
```

---

## Task 4 : `logic.pickPlayers` (TDD)

**Files:**
- Modify: `logic.js`
- Test: `tests/logic.test.js`

- [ ] **Step 1 : Ajouter les tests (avant l'appel `RoueTest.report();`)**

```js
RoueTest.test('pickPlayers retourne N joueurs quand N <= effectif', function () {
  const pool = ['A', 'B', 'C', 'D'];
  const res = RoueGame.logic.pickPlayers(pool, 2);
  RoueTest.assertEqual(res.length, 2);
});

RoueTest.test('pickPlayers plafonne N au nombre de joueurs disponibles', function () {
  const pool = ['A', 'B'];
  const res = RoueGame.logic.pickPlayers(pool, 5);
  RoueTest.assertEqual(res.length, 2);
});

RoueTest.test('pickPlayers retourne des joueurs distincts issus du pool', function () {
  const pool = ['A', 'B', 'C', 'D', 'E'];
  for (let i = 0; i < 100; i++) {
    const res = RoueGame.logic.pickPlayers(pool, 3);
    RoueTest.assertEqual(res.length, 3);
    RoueTest.assertEqual(new Set(res).size, 3, 'doublon détecté');
    res.forEach(function (p) { RoueTest.assert(pool.indexOf(p) !== -1, 'joueur hors pool'); });
  }
});

RoueTest.test('pickPlayers avec pool vide retourne []', function () {
  RoueTest.assertDeep(RoueGame.logic.pickPlayers([], 3), []);
});

RoueTest.test('pickPlayers respecte un rng injecté (déterministe)', function () {
  const pool = ['A', 'B', 'C'];
  // rng qui renvoie toujours 0 -> Fisher-Yates ne permute rien -> 2 premiers
  const res = RoueGame.logic.pickPlayers(pool, 2, function () { return 0; });
  RoueTest.assertDeep(res, ['A', 'B']);
});
```

- [ ] **Step 2 : Lancer pour vérifier l'échec**

Run: `open tests/tests.html`
Expected: ÉCHEC — `pickPlayers is not a function`.

- [ ] **Step 3 : Implémenter dans `logic.js`**

```js
RoueGame.logic.pickPlayers = function (pool, n, rng) {
  rng = rng || Math.random;
  const count = Math.max(0, Math.min(n, pool.length));
  const copy = pool.slice();
  // Fisher-Yates partiel : on mélange les `count` premières positions
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(rng() * (copy.length - i));
    const tmp = copy[i]; copy[i] = copy[j]; copy[j] = tmp;
  }
  return copy.slice(0, count);
};
```

- [ ] **Step 4 : Lancer pour vérifier le succès**

Run: `open tests/tests.html`
Expected: tous les tests réussis (8 au total).

- [ ] **Step 5 : Commit**

```bash
git add -A
git commit -m "feat: tirage aléatoire de joueurs distincts (pickPlayers)"
```

---

## Task 5 : `logic.winningIndex` (TDD)

**Files:**
- Modify: `logic.js`
- Test: `tests/logic.test.js`

- [ ] **Step 1 : Ajouter les tests (avant `RoueTest.report();`)**

```js
RoueTest.test('winningIndex: rotation nulle -> segment 0', function () {
  RoueTest.assertEqual(RoueGame.logic.winningIndex(0, 4), 0);
});

RoueTest.test('winningIndex: rotation d\'un segment horaire -> dernier segment', function () {
  const seg = (2 * Math.PI) / 4;
  RoueTest.assertEqual(RoueGame.logic.winningIndex(seg, 4), 3);
});

RoueTest.test('winningIndex: milieu du segment 0 reste 0', function () {
  const seg = (2 * Math.PI) / 4;
  RoueTest.assertEqual(RoueGame.logic.winningIndex(seg / 2, 4), 0);
});

RoueTest.test('winningIndex: gère les rotations > 2π', function () {
  const full = 2 * Math.PI;
  RoueTest.assertEqual(RoueGame.logic.winningIndex(full * 3, 4), 0);
});
```

- [ ] **Step 2 : Lancer pour vérifier l'échec**

Run: `open tests/tests.html`
Expected: ÉCHEC — `winningIndex is not a function`.

- [ ] **Step 3 : Implémenter dans `logic.js`**

```js
// Voir la convention d'angle en tête de plan.
RoueGame.logic.winningIndex = function (rotation, count) {
  if (count <= 0) return -1;
  const TAU = 2 * Math.PI;
  const seg = TAU / count;
  const r = ((rotation % TAU) + TAU) % TAU;           // rotation normalisée [0, 2π)
  const atPointer = ((TAU - r) % TAU);                // angle local sous le pointeur (haut)
  return Math.floor(atPointer / seg) % count;
};
```

- [ ] **Step 4 : Lancer pour vérifier le succès**

Run: `open tests/tests.html`
Expected: tous les tests réussis (12 au total).

- [ ] **Step 5 : Commit**

```bash
git add -A
git commit -m "feat: calcul du segment gagnant (winningIndex)"
```

---

## Task 6 : `storage.js` — état, persistance et mutations

**Files:**
- Modify: `storage.js`
- Test: `tests/logic.test.js` (tests navigateur utilisant le vrai localStorage)
- Modify: `tests/tests.html`

- [ ] **Step 1 : Charger `storage.js` dans la page de tests**

Dans `tests/tests.html`, ajouter `<script src="../storage.js"></script>` juste après la ligne `logic.js` :
```html
  <script src="../logic.js"></script>
  <script src="../storage.js"></script>
  <script src="test-runner.js"></script>
  <script src="logic.test.js"></script>
```

- [ ] **Step 2 : Ajouter les tests du store (avant `RoueTest.report();`)**

```js
RoueTest.test('store: addPlayer ajoute et rejette les doublons/vides', function () {
  RoueGame.store.clearAll();
  RoueTest.assertEqual(RoueGame.store.addPlayer('Alice').ok, true);
  RoueTest.assertEqual(RoueGame.store.addPlayer(' alice ').ok, false); // doublon
  RoueTest.assertEqual(RoueGame.store.addPlayer('   ').ok, false);     // vide
  RoueTest.assertDeep(RoueGame.store.getState().players, ['Alice']);
});

RoueTest.test('store: removePlayer retire par nom', function () {
  RoueGame.store.clearAll();
  RoueGame.store.addPlayer('Alice');
  RoueGame.store.addPlayer('Bob');
  RoueGame.store.removePlayer('Alice');
  RoueTest.assertDeep(RoueGame.store.getState().players, ['Bob']);
});

RoueTest.test('store: addGame normalise le nombre (min 1) et génère un id', function () {
  RoueGame.store.clearAll();
  const r = RoueGame.store.addGame('Catan', 4);
  RoueTest.assertEqual(r.ok, true);
  const g = RoueGame.store.getState().games[0];
  RoueTest.assertEqual(g.name, 'Catan');
  RoueTest.assertEqual(g.playerCount, 4);
  RoueTest.assert(!!g.id, 'id manquant');
  RoueTest.assertEqual(RoueGame.store.addGame('X', 0).ok, true);
  RoueTest.assertEqual(RoueGame.store.getState().games[1].playerCount, 1);
});

RoueTest.test('store: addGame rejette doublon et nom vide', function () {
  RoueGame.store.clearAll();
  RoueGame.store.addGame('Uno', 6);
  RoueTest.assertEqual(RoueGame.store.addGame(' uno ', 2).ok, false);
  RoueTest.assertEqual(RoueGame.store.addGame('', 2).ok, false);
});

RoueTest.test('store: removeGame retire par id', function () {
  RoueGame.store.clearAll();
  RoueGame.store.addGame('Uno', 6);
  const id = RoueGame.store.getState().games[0].id;
  RoueGame.store.removeGame(id);
  RoueTest.assertEqual(RoueGame.store.getState().games.length, 0);
});

RoueTest.test('store: persistance round-trip via localStorage', function () {
  RoueGame.store.clearAll();
  RoueGame.store.addPlayer('Alice');
  RoueGame.store.addGame('Catan', 4);
  RoueGame.store.load(); // recharge depuis localStorage
  RoueTest.assertDeep(RoueGame.store.getState().players, ['Alice']);
  RoueTest.assertEqual(RoueGame.store.getState().games[0].name, 'Catan');
  RoueGame.store.clearAll();
});
```

- [ ] **Step 3 : Lancer pour vérifier l'échec**

Run: `open tests/tests.html`
Expected: ÉCHEC — `RoueGame.store.clearAll is not a function`.

- [ ] **Step 4 : Implémenter `storage.js`**

```js
window.RoueGame = window.RoueGame || {};
RoueGame.store = (function () {
  const KEY = 'roue-game-state';
  let state = { players: [], games: [] };
  let seq = 0;

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* quota / mode privé */ }
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = {
          players: Array.isArray(parsed.players) ? parsed.players : [],
          games: Array.isArray(parsed.games) ? parsed.games : []
        };
      }
    } catch (e) { state = { players: [], games: [] }; }
    return state;
  }
  function getState() { return state; }

  function addPlayer(rawName) {
    const name = RoueGame.logic.normalizeName(rawName);
    if (!name) return { ok: false, error: 'Nom vide' };
    if (RoueGame.logic.isDuplicateName(state.players, name)) return { ok: false, error: 'Joueur déjà présent' };
    state.players.push(name);
    save();
    return { ok: true };
  }
  function removePlayer(name) {
    state.players = state.players.filter(function (p) { return p !== name; });
    save();
  }

  function addGame(rawName, rawCount) {
    const name = RoueGame.logic.normalizeName(rawName);
    if (!name) return { ok: false, error: 'Nom vide' };
    const existingNames = state.games.map(function (g) { return g.name; });
    if (RoueGame.logic.isDuplicateName(existingNames, name)) return { ok: false, error: 'Jeu déjà présent' };
    let count = parseInt(rawCount, 10);
    if (isNaN(count) || count < 1) count = 1;
    const id = 'g' + Date.now() + '-' + (seq++);
    state.games.push({ id: id, name: name, playerCount: count });
    save();
    return { ok: true };
  }
  function removeGame(id) {
    state.games = state.games.filter(function (g) { return g.id !== id; });
    save();
  }

  function clearAll() {
    state = { players: [], games: [] };
    save();
  }

  return {
    load: load, save: save, getState: getState,
    addPlayer: addPlayer, removePlayer: removePlayer,
    addGame: addGame, removeGame: removeGame, clearAll: clearAll
  };
})();
```

- [ ] **Step 5 : Lancer pour vérifier le succès**

Run: `open tests/tests.html`
Expected: tous les tests réussis (18 au total).

- [ ] **Step 6 : Commit**

```bash
git add -A
git commit -m "feat: store état + persistance localStorage"
```

---

## Task 7 : `wheel.js` — dessin de la roue (vérification visuelle)

**Files:**
- Modify: `wheel.js`

- [ ] **Step 1 : Implémenter le dessin dans `wheel.js`**

```js
window.RoueGame = window.RoueGame || {};
RoueGame.Wheel = (function () {
  const PALETTE = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];
  const RIM = '#1c1917', GOLD = '#fbbf24', BULB = '#ffffff';

  let canvas, ctx, cx, cy, R;
  let games = [];
  let rotation = 0; // radians, horaire (voir convention du plan)

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    cx = canvas.width / 2;
    cy = canvas.height / 2;
    R = Math.min(cx, cy) - 6;
  }
  function setGames(g) { games = g; }
  function getRotation() { return rotation; }
  function setRotation(r) { rotation = r; }

  function drawBulbs() {
    const n = 24, rr = R - 2;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 2 * Math.PI;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = BULB;
      ctx.shadowColor = BULB; ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const count = games.length;

    if (count === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, R - 14, 0, 2 * Math.PI);
      ctx.fillStyle = '#26263f';
      ctx.fill();
      return;
    }

    const seg = (2 * Math.PI) / count;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation); // rotation horaire de toute la roue

    for (let i = 0; i < count; i++) {
      // segment i : [i·seg, (i+1)·seg) horaire depuis le haut (-π/2)
      const start = -Math.PI / 2 + i * seg;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R - 14, start, start + seg);
      ctx.closePath();
      ctx.fillStyle = PALETTE[i % PALETTE.length];
      ctx.fill();
      ctx.strokeStyle = RIM; ctx.lineWidth = 2; ctx.stroke();

      // label
      ctx.save();
      ctx.rotate(start + seg / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1c1917';
      ctx.font = 'bold 16px system-ui, sans-serif';
      const label = games[i].name.length > 14 ? games[i].name.slice(0, 13) + '…' : games[i].name;
      ctx.fillText(label, R - 26, 0);
      ctx.restore();
    }
    ctx.restore();

    // décor fixe (non tourné)
    ctx.beginPath();
    ctx.arc(cx, cy, R - 14, 0, 2 * Math.PI);
    ctx.lineWidth = 8; ctx.strokeStyle = RIM; ctx.stroke();
    drawBulbs();

    // moyeu
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
    ctx.fillStyle = GOLD; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = RIM; ctx.stroke();
  }

  return {
    init: init, setGames: setGames, draw: draw,
    getRotation: getRotation, setRotation: setRotation
  };
})();
```

- [ ] **Step 2 : Vérifier visuellement (page temporaire)**

Créer un fichier temporaire `tests/wheel-preview.html` :
```html
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Aperçu roue</title>
<style>body{background:#1a1a2e}</style></head><body>
<canvas id="wheel" width="420" height="420"></canvas>
<script src="../logic.js"></script><script src="../wheel.js"></script>
<script>
  RoueGame.Wheel.init(document.getElementById('wheel'));
  RoueGame.Wheel.setGames([
    {id:'1',name:'Catan',playerCount:4},{id:'2',name:'Uno',playerCount:6},
    {id:'3',name:'Skull',playerCount:5},{id:'4',name:'7 Wonders',playerCount:7},
    {id:'5',name:'Loups-Garous',playerCount:8}
  ]);
  RoueGame.Wheel.draw();
</script></body></html>
```
Run: `open tests/wheel-preview.html`
Expected: une roue à 5 segments colorés (palette arc-en-ciel), noms lisibles, jante noire, ampoules blanches lumineuses, moyeu doré.

- [ ] **Step 3 : Supprimer la page d'aperçu**

```bash
rm tests/wheel-preview.html
```

- [ ] **Step 4 : Commit**

```bash
git add -A
git commit -m "feat: dessin Canvas de la roue (segments, ampoules, moyeu)"
```

---

## Task 8 : `wheel.js` — animation de rotation (vérification visuelle)

**Files:**
- Modify: `wheel.js`

- [ ] **Step 1 : Ajouter `spin` dans `wheel.js`**

Ajouter, à l'intérieur de l'IIFE (avant le `return`), une fonction d'animation et l'exposer dans l'objet retourné :
```js
  let spinning = false;

  function spin(onDone) {
    const count = games.length;
    if (spinning || count === 0) return;
    spinning = true;

    const TAU = 2 * Math.PI;
    const start = rotation;
    const turns = 4 + Math.floor(Math.random() * 3);        // 4 à 6 tours
    const target = start + turns * TAU + Math.random() * TAU; // + angle aléatoire
    const duration = 4200; // ms
    const t0 = performance.now();

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    function frame(now) {
      const t = Math.min(1, (now - t0) / duration);
      rotation = start + (target - start) * easeOutCubic(t);
      draw();
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        spinning = false;
        const idx = RoueGame.logic.winningIndex(rotation, games.length);
        if (typeof onDone === 'function') onDone(idx);
      }
    }
    requestAnimationFrame(frame);
  }

  function isSpinning() { return spinning; }
```
Puis dans le `return`, ajouter `spin: spin, isSpinning: isSpinning`.

- [ ] **Step 2 : Vérifier visuellement (page temporaire)**

Créer `tests/spin-preview.html` :
```html
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Aperçu spin</title>
<style>body{background:#1a1a2e;color:#fff;text-align:center}</style></head><body>
<canvas id="wheel" width="420" height="420"></canvas><br>
<button id="go">TOURNER</button><p id="r"></p>
<script src="../logic.js"></script><script src="../wheel.js"></script>
<script>
  const games=[{id:'1',name:'Catan',playerCount:4},{id:'2',name:'Uno',playerCount:6},
    {id:'3',name:'Skull',playerCount:5},{id:'4',name:'7 Wonders',playerCount:7}];
  RoueGame.Wheel.init(document.getElementById('wheel'));
  RoueGame.Wheel.setGames(games); RoueGame.Wheel.draw();
  document.getElementById('go').onclick=function(){
    RoueGame.Wheel.spin(function(idx){ document.getElementById('r').textContent='Gagnant : '+games[idx].name; });
  };
</script></body></html>
```
Run: `open tests/spin-preview.html`
Expected: au clic, la roue tourne plusieurs tours puis décélère et s'arrête ; le jeu annoncé correspond bien au segment situé sous le pointeur du haut. Répéter quelques clics pour confirmer la cohérence.

- [ ] **Step 3 : Supprimer la page d'aperçu**

```bash
rm tests/spin-preview.html
```

- [ ] **Step 4 : Commit**

```bash
git add -A
git commit -m "feat: animation de rotation de la roue (spin + easing)"
```

---

## Task 9 : `app.js` — panneau réglages + persistance (vérification dans le navigateur)

**Files:**
- Modify: `app.js`

- [ ] **Step 1 : Implémenter le câblage du panneau dans `app.js`**

```js
window.RoueGame = window.RoueGame || {};

(function () {
  const store = RoueGame.store;
  const Wheel = RoueGame.Wheel;

  let el = {};

  function showMsg(node, text) {
    node.textContent = text || '';
    if (text) setTimeout(function () { if (node.textContent === text) node.textContent = ''; }, 2500);
  }

  function renderPlayers() {
    const players = store.getState().players;
    el.playerList.innerHTML = players.map(function (p) {
      return '<li><span>' + escapeHtml(p) + '</span>' +
        '<button class="x" data-player="' + escapeHtml(p) + '">✕</button></li>';
    }).join('');
  }

  function renderGames() {
    const games = store.getState().games;
    el.gameList.innerHTML = games.map(function (g) {
      return '<li><span>' + escapeHtml(g.name) + ' · ' + g.playerCount + '</span>' +
        '<button class="x" data-game="' + g.id + '">✕</button></li>';
    }).join('');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function refreshAll() {
    renderPlayers();
    renderGames();
    Wheel.setGames(store.getState().games);
    Wheel.draw();
    RoueGame.updateSpinState && RoueGame.updateSpinState(); // défini en Task 10
  }

  function bind() {
    el.playerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const r = store.addPlayer(el.playerName.value);
      if (!r.ok) { showMsg(el.playerMsg, r.error); return; }
      el.playerName.value = '';
      refreshAll();
    });

    el.gameForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const r = store.addGame(el.gameName.value, el.gameCount.value);
      if (!r.ok) { showMsg(el.gameMsg, r.error); return; }
      el.gameName.value = ''; el.gameCount.value = '2';
      refreshAll();
    });

    el.playerList.addEventListener('click', function (e) {
      const name = e.target.getAttribute('data-player');
      if (name !== null) { store.removePlayer(name); refreshAll(); }
    });

    el.gameList.addEventListener('click', function (e) {
      const id = e.target.getAttribute('data-game');
      if (id) { store.removeGame(id); refreshAll(); }
    });

    el.clearAll.addEventListener('click', function () {
      if (confirm('Tout effacer (joueurs et jeux) ?')) {
        store.clearAll();
        RoueGame.clearResult && RoueGame.clearResult(); // défini en Task 10
        refreshAll();
      }
    });
  }

  function start() {
    el = {
      playerForm: document.getElementById('player-form'),
      playerName: document.getElementById('player-name'),
      playerMsg: document.getElementById('player-msg'),
      playerList: document.getElementById('player-list'),
      gameForm: document.getElementById('game-form'),
      gameName: document.getElementById('game-name'),
      gameCount: document.getElementById('game-count'),
      gameMsg: document.getElementById('game-msg'),
      gameList: document.getElementById('game-list'),
      clearAll: document.getElementById('clear-all')
    };
    store.load();
    Wheel.init(document.getElementById('wheel'));
    bind();
    refreshAll();
    RoueGame.bindStage && RoueGame.bindStage(); // défini en Task 10
  }

  // expose pour Task 10 + démarrage
  RoueGame.refreshAll = refreshAll;
  RoueGame.showMsg = showMsg;
  RoueGame.escapeHtml = escapeHtml;
  RoueGame._el = function () { return el; };

  document.addEventListener('DOMContentLoaded', start);
})();
```

- [ ] **Step 2 : Vérifier dans le navigateur**

Run: `open index.html`
Expected :
- Ajouter des joueurs (Alice, Bob) → ils apparaissent dans la liste ; tenter un doublon → message « Joueur déjà présent ».
- Ajouter des jeux avec un nombre → apparaissent « Nom · N » ; la roue se dessine avec les segments correspondants.
- Cliquer ✕ retire l'élément et redessine la roue.
- Recharger la page → joueurs et jeux toujours là (localStorage).
- « Tout effacer » (après confirmation) vide tout.

- [ ] **Step 3 : Commit**

```bash
git add -A
git commit -m "feat: panneau réglages (joueurs/jeux) + persistance au démarrage"
```

---

## Task 10 : `app.js` — orchestration du spin, résultat, relance, retrait, cas limites

**Files:**
- Modify: `app.js`

- [ ] **Step 1 : Ajouter le module « scène » dans `app.js`**

Ajouter un second IIFE à la fin de `app.js` :
```js
(function () {
  const store = RoueGame.store;
  const Wheel = RoueGame.Wheel;
  let currentGame = null; // jeu actuellement tiré

  function stageEl() {
    return {
      spin: document.getElementById('spin'),
      stageMsg: document.getElementById('stage-msg'),
      result: document.getElementById('result'),
      resultGame: document.getElementById('result-game'),
      resultPlayers: document.getElementById('result-players'),
      reroll: document.getElementById('reroll'),
      removeGame: document.getElementById('remove-game')
    };
  }

  function updateSpinState() {
    const s = stageEl();
    const players = store.getState().players;
    const games = store.getState().games;
    let reason = '';
    if (games.length === 0) reason = 'Ajoute au moins un jeu pour tourner.';
    else if (players.length === 0) reason = 'Ajoute au moins un joueur pour tourner.';
    s.spin.disabled = reason !== '' || Wheel.isSpinning();
    s.stageMsg.textContent = reason;
  }

  function clearResult() {
    const s = stageEl();
    currentGame = null;
    s.result.classList.add('hidden');
  }

  function drawPlayersFor(game) {
    const players = store.getState().players;
    const chosen = RoueGame.logic.pickPlayers(players, game.playerCount);
    const s = stageEl();
    s.resultGame.textContent = '🎲 ' + game.name;
    s.resultPlayers.innerHTML = chosen.map(function (p) {
      return '<li>' + RoueGame.escapeHtml(p) + '</li>';
    }).join('');
  }

  function showResult(game) {
    const s = stageEl();
    currentGame = game;
    s.result.classList.remove('hidden');
    drawPlayersFor(game);
  }

  function bindStage() {
    const s = stageEl();

    s.spin.addEventListener('click', function () {
      const games = store.getState().games;
      if (games.length === 0 || store.getState().players.length === 0) return;
      clearResult();
      updateSpinState(); // désactive pendant le spin
      Wheel.spin(function (idx) {
        const game = store.getState().games[idx];
        updateSpinState();
        if (game) showResult(game);
      });
    });

    s.reroll.addEventListener('click', function () {
      if (currentGame) drawPlayersFor(currentGame);
    });

    s.removeGame.addEventListener('click', function () {
      if (!currentGame) return;
      store.removeGame(currentGame.id);
      clearResult();
      RoueGame.refreshAll();
    });
  }

  // expose pour app (Task 9)
  RoueGame.updateSpinState = updateSpinState;
  RoueGame.clearResult = clearResult;
  RoueGame.bindStage = bindStage;
})();
```

- [ ] **Step 2 : Vérifier dans le navigateur (bout en bout)**

Run: `open index.html`
Expected :
- Sans joueur ou sans jeu → bouton TOURNER désactivé + message explicatif.
- Avec joueurs + jeux → TOURNER lance la roue ; à l'arrêt, le jeu sous le pointeur s'affiche + la liste des joueurs tirés (nombre = `playerCount`, plafonné au nombre de joueurs).
- « Relancer les joueurs » re-tire sans faire tourner la roue.
- « Retirer ce jeu » enlève le jeu de la roue, efface le résultat, redessine.
- Si on retire tous les jeux → TOURNER se désactive avec le message adéquat.
- Pendant la rotation, TOURNER est désactivé.

- [ ] **Step 3 : Commit**

```bash
git add -A
git commit -m "feat: orchestration spin, tirage joueurs, relance et retrait de jeu"
```

---

## Task 11 : Thème « fête foraine » (CSS) + vérification finale

**Files:**
- Modify: `styles.css`

- [ ] **Step 1 : Remplacer le contenu de `styles.css` par le thème complet**

```css
:root {
  --bg: #1a1a2e;
  --panel: #24243e;
  --panel-2: #2e2e52;
  --text: #f5f5fa;
  --muted: #b8b8d0;
  --gold: #fbbf24;
  --danger: #ef4444;
  --accent: #a855f7;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: radial-gradient(circle at 50% 0%, #2a2a4a, var(--bg));
  color: var(--text);
  min-height: 100vh;
}
.topbar { text-align: center; padding: 18px; }
.topbar h1 { margin: 0; font-size: 1.8rem; letter-spacing: 1px; }

.layout {
  display: flex;
  gap: 28px;
  padding: 8px 28px 40px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.panel {
  width: 320px;
  background: var(--panel);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, .35);
}
.block { margin-bottom: 22px; }
.block h2 { margin: 0 0 10px; font-size: 1.1rem; color: var(--gold); }

.add-row { display: flex; gap: 8px; }
.add-row input[type="text"] { flex: 1; }
.add-row .count { width: 64px; }
input {
  background: var(--panel-2);
  border: 1px solid #3a3a64;
  color: var(--text);
  padding: 9px 11px;
  border-radius: 9px;
  font-size: .95rem;
}
input:focus { outline: 2px solid var(--accent); }
button {
  cursor: pointer;
  border: none;
  border-radius: 9px;
  padding: 9px 14px;
  font-weight: 600;
  background: var(--accent);
  color: #fff;
  transition: transform .08s, filter .15s;
}
button:hover:not(:disabled) { filter: brightness(1.1); }
button:active:not(:disabled) { transform: scale(.96); }
button:disabled { opacity: .45; cursor: not-allowed; }
button.danger { background: var(--danger); }

.msg { min-height: 18px; margin: 6px 0 0; font-size: .85rem; color: var(--gold); }

.list { list-style: none; margin: 10px 0 0; padding: 0; }
.list li {
  display: flex; justify-content: space-between; align-items: center;
  background: var(--panel-2);
  padding: 7px 12px; border-radius: 8px; margin-bottom: 6px;
}
.list .x { background: transparent; color: var(--muted); padding: 2px 8px; }
.list .x:hover { color: var(--danger); }

#clear-all { width: 100%; margin-top: 4px; }

.stage { flex: 1; min-width: 440px; text-align: center; }
.wheel-area { position: relative; display: inline-block; }
.pointer {
  position: absolute; top: -6px; left: 50%; transform: translateX(-50%);
  width: 0; height: 0;
  border-left: 16px solid transparent;
  border-right: 16px solid transparent;
  border-top: 28px solid var(--gold);
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, .5));
  z-index: 2;
}
#wheel { display: block; }

.spin-btn {
  margin-top: 18px;
  font-size: 1.3rem;
  letter-spacing: 2px;
  padding: 14px 46px;
  background: linear-gradient(135deg, var(--gold), #f59e0b);
  color: #1c1917;
  border-radius: 999px;
  box-shadow: 0 6px 0 #b45309;
}
.spin-btn:active:not(:disabled) { box-shadow: 0 2px 0 #b45309; transform: translateY(4px); }

.result {
  margin: 26px auto 0;
  max-width: 420px;
  background: var(--panel);
  border: 2px solid var(--gold);
  border-radius: 16px;
  padding: 20px;
  animation: pop .25s ease-out;
}
@keyframes pop { from { transform: scale(.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.result h2 { margin: 0 0 12px; }
.result-players {
  list-style: none; margin: 0 0 16px; padding: 0;
  display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
}
.result-players li {
  background: var(--accent); color: #fff;
  padding: 8px 16px; border-radius: 999px; font-weight: 600;
}
.result-actions { display: flex; gap: 10px; justify-content: center; }
.hidden { display: none; }

@media (max-width: 820px) {
  .layout { flex-direction: column; align-items: center; }
  .panel { width: 100%; max-width: 460px; }
  .stage { min-width: 0; width: 100%; }
}
```

- [ ] **Step 2 : Vérifier l'ensemble dans le navigateur**

Run: `open index.html`
Expected : interface fête foraine cohérente (fond sombre, panneau, roue multicolore avec ampoules, pointeur doré, gros bouton TOURNER en pastille dorée). Refaire le parcours complet de la Task 10 ; vérifier le rendu responsive en réduisant la fenêtre.

- [ ] **Step 3 : Vérifier que tous les tests passent toujours**

Run: `open tests/tests.html`
Expected : « ✅ 18 réussis, 0 échoués ».

- [ ] **Step 4 : Commit**

```bash
git add -A
git commit -m "style: thème fête foraine multicolore + responsive"
```

---

## Récapitulatif de couverture (auto-revue)

- Stack vanilla + `file://` → scripts classiques, namespace `RoueGame` (Task 1).
- Modèle de données joueurs/jeux + ids + persistance → `storage.js` (Task 6).
- Panneau réglages (ajout/suppression, unicité, tout effacer) → Tasks 9.
- Roue Canvas (segments, palette arc-en-ciel, labels, jante, ampoules, moyeu, pointeur) → Tasks 7 & 11.
- Animation de rotation avec décélération → Task 8.
- Détermination du jeu gagnant → `winningIndex` (Task 5).
- Tirage de N joueurs distincts, plafonné, indépendant → `pickPlayers` (Task 4) + orchestration (Task 10).
- Relancer les joueurs sans re-tourner, retirer un jeu → Task 10.
- Cas limites (0 joueur / 0 jeu, plafonnement, plus de jeux, doublons) → Tasks 4/6/10.
- Thème « multicolore vif » → Task 11.
