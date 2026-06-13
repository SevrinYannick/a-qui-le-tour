RoueTest.test('normalizeName enlève les espaces et garde la casse affichée', function () {
  RoueTest.assertEqual(RoueGame.logic.normalizeName('  Alice  '), 'Alice');
});

RoueTest.test('isDuplicateName est insensible à la casse et aux espaces', function () {
  const names = ['Alice', 'Bob'];
  RoueTest.assertEqual(RoueGame.logic.isDuplicateName(names, '  alice '), true);
  RoueTest.assertEqual(RoueGame.logic.isDuplicateName(names, 'Carol'), false);
});

RoueTest.report();
