window.RoueGame = window.RoueGame || {};
RoueGame.Wheel = (function () {
  const PALETTE = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7'];
  const RIM = '#1c1917', GOLD = '#fbbf24', BULB = '#ffffff';
  const R_REF = 204; // rayon de référence : toutes les dimensions y sont proportionnelles

  let canvas, ctx, cx, cy, R;
  let games = [];
  let rotation = 0; // radians, horaire (voir convention du plan)

  function init(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    resize();
  }

  // Adapte la résolution du canvas à sa taille CSS (roue fluide + nette en HiDPI),
  // recalcule centre/rayon puis redessine.
  function resize() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const size = Math.max(1, Math.round(rect.width));
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    cx = canvas.width / 2;
    cy = canvas.height / 2;
    R = Math.min(cx, cy) * (R_REF / 210); // conserve la marge proportionnelle d'origine
    draw();
  }

  function setGames(g) { games = g; }
  function getRotation() { return rotation; }
  function setRotation(r) { rotation = r; }

  function drawBulbs() {
    const k = R / R_REF;
    const n = 24, rr = R - 2 * k;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 2 * Math.PI;
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr;
      ctx.beginPath();
      ctx.arc(x, y, 4 * k, 0, 2 * Math.PI);
      ctx.fillStyle = BULB;
      ctx.shadowColor = BULB; ctx.shadowBlur = 8 * k;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const count = games.length;
    const k = R / R_REF;

    if (count === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, R - 14 * k, 0, 2 * Math.PI);
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
      ctx.arc(0, 0, R - 14 * k, start, start + seg);
      ctx.closePath();
      ctx.fillStyle = PALETTE[i % PALETTE.length];
      ctx.fill();
      ctx.strokeStyle = RIM; ctx.lineWidth = Math.max(1, 2 * k); ctx.stroke();

      // label
      ctx.save();
      ctx.rotate(start + seg / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#1c1917';
      ctx.font = 'bold ' + Math.round(16 * k) + 'px system-ui, sans-serif';
      const label = games[i].name.length > 14 ? games[i].name.slice(0, 13) + '…' : games[i].name;
      ctx.fillText(label, R - 26 * k, 0);
      ctx.restore();
    }
    ctx.restore();

    // décor fixe (non tourné)
    ctx.beginPath();
    ctx.arc(cx, cy, R - 14 * k, 0, 2 * Math.PI);
    ctx.lineWidth = 8 * k; ctx.strokeStyle = RIM; ctx.stroke();
    drawBulbs();

    // moyeu
    ctx.beginPath();
    ctx.arc(cx, cy, 18 * k, 0, 2 * Math.PI);
    ctx.fillStyle = GOLD; ctx.fill();
    ctx.lineWidth = 3 * k; ctx.strokeStyle = RIM; ctx.stroke();
  }

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

  return {
    init: init, resize: resize, setGames: setGames, draw: draw,
    getRotation: getRotation, setRotation: setRotation,
    spin: spin, isSpinning: isSpinning
  };
})();
