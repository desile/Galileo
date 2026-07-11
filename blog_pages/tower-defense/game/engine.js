/**
 * Игровой движок — состояние, цикл, UI
 */
(function (global) {
  'use strict';

  global.TD = global.TD || {};

  var CONST = global.TD.CONST;
  var Path = global.TD.Path;
  var Render = global.TD.Render;
  var Enemies = global.TD.Enemies;
  var Towers = global.TD.Towers;
  var TOWER_TYPES = global.TD.TOWER_TYPES;

  function Engine(canvas, ui) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ui = ui;
    this.reset();
    this.bindEvents();
  }

  Engine.prototype.reset = function () {
    this.gold = CONST.START_GOLD;
    this.lives = CONST.START_LIVES;
    this.wave = 0;
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.waveQueue = [];
    this.waveTimer = 0;
    this.waveActive = false;
    this.gameOver = false;
    this.victory = false;
    this.selectedTower = 'basic';
    this.hoverCol = -1;
    this.hoverRow = -1;
    this.lastTime = 0;
    this.rafId = null;
    this.updateUI();
    this.setStatus('Выберите башню и кликните на траву. Затем — «Начать волну».');
  };

  Engine.prototype.bindEvents = function () {
    var self = this;

    this.canvas.addEventListener('mousemove', function (e) {
      var rect = self.canvas.getBoundingClientRect();
      var x = (e.clientX - rect.left) * (self.canvas.width / rect.width);
      var y = (e.clientY - rect.top) * (self.canvas.height / rect.height);
      var grid = Path.pixelToGrid(x, y, CONST.TILE);
      self.hoverCol = grid.col;
      self.hoverRow = grid.row;
    });

    this.canvas.addEventListener('mouseleave', function () {
      self.hoverCol = -1;
      self.hoverRow = -1;
    });

    this.canvas.addEventListener('click', function (e) {
      if (self.gameOver || self.victory) return;
      var rect = self.canvas.getBoundingClientRect();
      var x = (e.clientX - rect.left) * (self.canvas.width / rect.width);
      var y = (e.clientY - rect.top) * (self.canvas.height / rect.height);
      var grid = Path.pixelToGrid(x, y, CONST.TILE);
      self.tryPlaceTower(grid.col, grid.row);
    });

    this.ui.towerBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        self.selectedTower = btn.dataset.tower;
        self.ui.towerBtns.forEach(function (b) {
          b.classList.toggle('selected', b === btn);
        });
      });
    });

    this.ui.startWaveBtn.addEventListener('click', function () {
      self.startWave();
    });

    this.ui.resetBtn.addEventListener('click', function () {
      self.reset();
    });
  };

  Engine.prototype.tryPlaceTower = function (col, row) {
    var def = TOWER_TYPES[this.selectedTower];
    if (!def) return;
    if (!Towers.canPlace(col, row, this.towers, Path, CONST.COLS, CONST.ROWS)) {
      this.setStatus('Сюда нельзя поставить башню!');
      return;
    }
    if (this.gold < def.cost) {
      this.setStatus('Не хватает золота! Нужно ' + def.cost + '💰');
      return;
    }
    this.gold -= def.cost;
    this.towers.push(Towers.create(this.selectedTower, col, row));
    this.setStatus('Поставлена: ' + def.name);
    this.updateUI();
  };

  Engine.prototype.startWave = function () {
    if (this.gameOver || this.victory) return;
    if (this.waveActive) {
      this.setStatus('Волна уже идёт!');
      return;
    }
    if (this.wave >= CONST.MAX_WAVES) {
      this.setStatus('Все волны пройдены!');
      return;
    }
    this.waveQueue = Enemies.buildWaveQueue(this.wave);
    this.waveTimer = 0;
    this.waveActive = true;
    this.wave++;
    this.setStatus('Волна ' + this.wave + '! Держите оборону!');
    this.updateUI();
  };

  Engine.prototype.setStatus = function (msg) {
    if (this.ui.statusEl) this.ui.statusEl.textContent = msg;
  };

  Engine.prototype.updateUI = function () {
    if (this.ui.goldEl) this.ui.goldEl.textContent = String(this.gold);
    if (this.ui.livesEl) this.ui.livesEl.textContent = String(this.lives);
    if (this.ui.waveEl) {
      this.ui.waveEl.textContent = this.wave + '/' + CONST.MAX_WAVES;
    }
    if (this.ui.startWaveBtn) {
      this.ui.startWaveBtn.disabled = this.waveActive || this.gameOver || this.victory;
      this.ui.startWaveBtn.textContent = this.waveActive
        ? '⚔️ Волна идёт...'
        : (this.wave >= CONST.MAX_WAVES && !this.victory ? '🏆 Победа!' : '⚔️ Начать волну');
    }
    if (this.ui.resetBtn) {
      this.ui.resetBtn.textContent = this.gameOver ? '😵' : (this.victory ? '😎' : '🙂');
    }
    this.ui.towerBtns.forEach(function (btn) {
      var def = TOWER_TYPES[btn.dataset.tower];
      btn.disabled = false;
      if (def) btn.querySelector('.td-cost').textContent = def.cost + '💰';
    });
  };

  Engine.prototype.tick = function (dt) {
    if (this.gameOver || this.victory) return;

    if (this.waveActive) {
      this.waveTimer += dt;
      while (this.waveQueue.length && this.waveQueue[0].delay <= this.waveTimer) {
        var spawn = this.waveQueue.shift();
        var enemy = Enemies.create(spawn.type, spawn.hpScale);
        if (enemy) this.enemies.push(enemy);
      }
      if (this.waveQueue.length === 0 && this.enemies.every(function (e) {
        return !e.alive;
      })) {
        this.waveActive = false;
        if (this.wave >= CONST.MAX_WAVES) {
          this.victory = true;
          this.setStatus('Победа! Все волны отбиты. Old school! 🎉');
        } else {
          this.setStatus('Волна отбита! + бонус 25💰. Готовьте следующую.');
          this.gold += 25;
        }
        this.updateUI();
      }
    }

    var moveResult = Enemies.update(this.enemies, dt);
    if (moveResult.leaked > 0) {
      this.lives -= moveResult.leaked;
      if (this.lives <= 0) {
        this.lives = 0;
        this.gameOver = true;
        this.setStatus('Поражение! Враги прорвались... Попробуйте ещё раз.');
        this.updateUI();
        return;
      }
      this.setStatus('Прорвалось: ' + moveResult.leaked + '! Осталось жизней: ' + this.lives);
      this.updateUI();
    }

    var combat = Towers.update(this.towers, this.enemies, this.projectiles, dt);
    if (combat.reward > 0) this.gold += combat.reward;
    Towers.updateProjectiles(this.projectiles, dt);
    if (combat.kills > 0) this.updateUI();
  };

  Engine.prototype.render = function () {
    var ctx = this.ctx;
    var tile = CONST.TILE;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    Render.drawMap(ctx, tile, CONST.COLS, CONST.ROWS, Path);

    this.towers.forEach(function (tower) {
      Render.drawTower(ctx, tower, tile, false);
    });

    if (this.hoverCol >= 0 && this.hoverRow >= 0 && !this.gameOver && !this.victory) {
      var def = TOWER_TYPES[this.selectedTower];
      var valid = Towers.canPlace(
        this.hoverCol,
        this.hoverRow,
        this.towers,
        Path,
        CONST.COLS,
        CONST.ROWS
      );
      Render.drawGhostTower(ctx, this.hoverCol, this.hoverRow, tile, def, valid);
    }

    this.enemies.forEach(function (enemy) {
      if (enemy.alive && enemy.hp > 0) Render.drawEnemy(ctx, enemy, tile);
    });

    this.projectiles.forEach(function (proj) {
      if (proj.splash) {
        var pos = Path.positionAt(proj.targetDist);
        Render.drawProjectile(ctx, { x: pos.x, y: pos.y }, tile);
      } else {
        Render.drawProjectile(ctx, proj, tile);
      }
    });
  };

  Engine.prototype.loop = function (timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    var dt = Math.min(0.05, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;
    this.tick(dt);
    this.render();
    this.rafId = requestAnimationFrame(this.loop.bind(this));
  };

  Engine.prototype.start = function () {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.lastTime = 0;
    this.rafId = requestAnimationFrame(this.loop.bind(this));
  };

  Engine.prototype.stop = function () {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
  };

  global.TD.Engine = Engine;
})(window);
