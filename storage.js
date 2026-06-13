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
