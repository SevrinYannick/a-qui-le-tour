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
