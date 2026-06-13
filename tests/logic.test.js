RoueTest.test('normalizeName enlève les espaces et garde la casse affichée', function () {
  RoueTest.assertEqual(RoueGame.logic.normalizeName('  Alice  '), 'Alice');
});

RoueTest.test('isDuplicateName est insensible à la casse et aux espaces', function () {
  const names = ['Alice', 'Bob'];
  RoueTest.assertEqual(RoueGame.logic.isDuplicateName(names, '  alice '), true);
  RoueTest.assertEqual(RoueGame.logic.isDuplicateName(names, 'Carol'), false);
});

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

RoueTest.test('winningIndex: rotation nulle -> segment 0', function () {
  RoueTest.assertEqual(RoueGame.logic.winningIndex(0, 4), 0);
});

RoueTest.test('winningIndex: rotation d\'un segment horaire -> dernier segment', function () {
  const seg = (2 * Math.PI) / 4;
  RoueTest.assertEqual(RoueGame.logic.winningIndex(seg, 4), 3);
});

RoueTest.test('winningIndex: rotation à l\'intérieur du segment 0 -> 0', function () {
  const seg = (2 * Math.PI) / 4;
  // un demi-segment anti-horaire amène le pointeur au milieu du segment 0
  RoueTest.assertEqual(RoueGame.logic.winningIndex(2 * Math.PI - seg / 2, 4), 0);
});

RoueTest.test('winningIndex: un demi-segment horaire passe au segment précédent', function () {
  const seg = (2 * Math.PI) / 4;
  RoueTest.assertEqual(RoueGame.logic.winningIndex(seg / 2, 4), 3);
});

RoueTest.test('winningIndex: gère les rotations > 2π', function () {
  const full = 2 * Math.PI;
  RoueTest.assertEqual(RoueGame.logic.winningIndex(full * 3, 4), 0);
});

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

RoueTest.report();
