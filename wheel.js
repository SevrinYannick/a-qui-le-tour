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
