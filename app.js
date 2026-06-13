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
    bindResize();
  }

  // Réadapte la roue quand la fenêtre change de taille (throttlé via rAF).
  function bindResize() {
    let pending = false;
    window.addEventListener('resize', function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        pending = false;
        Wheel.resize();
      });
    });
  }

  // expose pour Task 10 + démarrage
  RoueGame.refreshAll = refreshAll;
  RoueGame.showMsg = showMsg;
  RoueGame.escapeHtml = escapeHtml;
  RoueGame._el = function () { return el; };

  document.addEventListener('DOMContentLoaded', start);
})();

(function () {
  const store = RoueGame.store;
  const Wheel = RoueGame.Wheel;
  let currentGame = null; // jeu actuellement tiré

  function stageEl() {
    return {
      spin: document.getElementById('spin'),
      stageMsg: document.getElementById('stage-msg'),
      result: document.getElementById('result'),
      resultEmpty: document.getElementById('result-empty'),
      resultContent: document.getElementById('result-content'),
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
    s.result.classList.add('is-empty');
    s.resultContent.classList.add('hidden');
    s.resultEmpty.classList.remove('hidden');
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
    s.result.classList.remove('is-empty');
    s.resultEmpty.classList.add('hidden');
    s.resultContent.classList.remove('hidden');
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
