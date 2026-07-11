// blog_pages/tower-defense/ — bootstrap Tower Defense

(function () {
  'use strict';

  var canvas = document.getElementById('td-canvas');
  if (!canvas || !window.TD || !window.TD.Engine) return;

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
