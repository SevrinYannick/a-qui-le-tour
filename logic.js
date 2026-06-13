window.RoueGame = window.RoueGame || {};
RoueGame.logic = {};

RoueGame.logic.normalizeName = function (raw) {
  return String(raw == null ? '' : raw).trim();
};

RoueGame.logic.isDuplicateName = function (existingNames, candidate) {
  const c = RoueGame.logic.normalizeName(candidate).toLowerCase();
  return existingNames.some(function (n) {
    return RoueGame.logic.normalizeName(n).toLowerCase() === c;
  });
};

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
