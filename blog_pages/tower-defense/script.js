// blog_pages/tower-defense/ — bootstrap Tower Defense

(function () {
  'use strict';

  var canvas = document.getElementById('td-canvas');
  var errorEl = document.getElementById('td-error');

  function showError(msg) {
    if (errorEl) errorEl.textContent = msg;
    var status = document.getElementById('td-status');
    if (status) status.textContent = msg;
    console.error('[Tower Defense]', msg);
  }

  if (!canvas) {
    showError('Canvas #td-canvas не найден');
    return;
  }

  var required = ['CONST', 'Path', 'Effects', 'Projectiles', 'Render', 'Enemies', 'Towers', 'Engine'];
  var missing = required.filter(function (key) {
    return !window.TD || !window.TD[key];
  });

  if (missing.length) {
    showError('Не загружены модули: ' + missing.join(', ') + '. Проверьте game/effects.js и game/projectiles.js');
    return;
  }

  var tile = window.TD.CONST.TILE;
  var cols = window.TD.CONST.COLS;
  var rows = window.TD.CONST.ROWS;

  canvas.width = cols * tile;
  canvas.height = rows * tile;

  var ui = {
    goldEl: document.getElementById('td-gold'),
    livesEl: document.getElementById('td-lives'),
    waveEl: document.getElementById('td-wave'),
    statusEl: document.getElementById('td-status'),
    startWaveBtn: document.getElementById('td-start-wave'),
    resetBtn: document.getElementById('td-reset'),
    towerBtns: Array.prototype.slice.call(document.querySelectorAll('[data-tower]')),
    errorEl: errorEl,
  };

  var engine = new window.TD.Engine(canvas, ui);

  if (ui.towerBtns.length) {
    ui.towerBtns[0].classList.add('selected');
  }

  engine.start();

  var extra = document.getElementById('post-extra');
  if (extra) {
    extra.textContent = '';
  }
})();
