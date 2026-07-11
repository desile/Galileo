/**
 * Башни и стрельба
 */
(function (global) {
  'use strict';

  global.TD = global.TD || {};
  var TOWER_TYPES = global.TD.TOWER_TYPES;
  var Enemies = global.TD.Enemies;
  var Projectiles = global.TD.Projectiles;

  function createTower(typeId, col, row) {
    var def = TOWER_TYPES[typeId];
    if (!def) return null;
    return {
      id: 't' + Math.random().toString(36).slice(2, 9),
      type: typeId,
      def: def,
      col: col,
      row: row,
      cooldown: 0,
      aimAngle: -Math.PI / 2,
      recoil: 0,
    };
  }

  global.TD.Towers = {
    create: createTower,

    canPlace: function (col, row, towers, path, cols, rows) {
      if (col < 0 || row < 0 || col >= cols || row >= rows) return false;
      if (path.isPath(col, row)) return false;
      for (var i = 0; i < towers.length; i++) {
        if (towers[i].col === col && towers[i].row === row) return false;
      }
      return true;
    },

    update: function (towers, enemies, projectiles, effects, dt) {
      var events = { shots: 0, kills: 0, reward: 0 };

      towers.forEach(function (tower) {
        tower.recoil = Math.max(0, tower.recoil - dt * 2.5);
        tower.cooldown -= dt;
        if (tower.cooldown > 0) return;

        var target = Enemies.findInRange(enemies, tower.col, tower.row, tower.def.range);
        if (!target) return;

        tower.cooldown = 1 / tower.def.fireRate;
        Projectiles.fire(projectiles, tower, target, effects);
        events.shots++;
      });

      return events;
    },

    updateRecoil: function (towers, dt) {
      towers.forEach(function (tower) {
        tower.recoil = Math.max(0, tower.recoil - dt * 2.5);
      });
    },
  };
})(window);
