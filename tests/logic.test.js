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

RoueTest.test('winningIndex: milieu du segment 0 reste 0', function () {
  const seg = (2 * Math.PI) / 4;
  RoueTest.assertEqual(RoueGame.logic.winningIndex(seg / 2, 4), 0);
});

RoueTest.test('winningIndex: gère les rotations > 2π', function () {
  const full = 2 * Math.PI;
  RoueTest.assertEqual(RoueGame.logic.winningIndex(full * 3, 4), 0);
});

RoueTest.report();
