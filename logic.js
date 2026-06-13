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
