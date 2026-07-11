/**
 * Башни, снаряды, стрельба
 */
(function (global) {
  'use strict';

  global.TD = global.TD || {};
  var TOWER_TYPES = global.TD.TOWER_TYPES;
  var Enemies = global.TD.Enemies;

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

    update: function (towers, enemies, projectiles, dt) {
      var events = { shots: 0, kills: 0, reward: 0 };

      towers.forEach(function (tower) {
        tower.cooldown -= dt;
        if (tower.cooldown > 0) return;

        var target = Enemies.findInRange(enemies, tower.col, tower.row, tower.def.range);
        if (!target) return;

        tower.cooldown = 1 / tower.def.fireRate;

        if (tower.def.splash) {
          var result = Enemies.damageArea(
            enemies,
            target.distance,
            tower.def.splash,
            tower.def.damage
          );
          events.shots++;
          events.kills += result.killed.length;
          events.reward += result.reward;
          projectiles.push({
            x: target.distance,
            y: 0,
            life: 0.15,
            color: '#ffaa00',
            splash: true,
            targetDist: target.distance,
          });
        } else {
          target.hp -= tower.def.damage;
          events.shots++;
          if (target.hp <= 0) {
            target.alive = false;
            events.kills++;
            events.reward += target.def.reward;
          }
          var pos = global.TD.Path.positionAt(target.distance);
          projectiles.push({
            x: pos.x,
            y: pos.y,
            life: 0.12,
            color: tower.def.barrel,
          });
        }
      });

      return events;
    },

    updateProjectiles: function (projectiles, dt) {
      for (var i = projectiles.length - 1; i >= 0; i--) {
        projectiles[i].life -= dt;
        if (projectiles[i].life <= 0) projectiles.splice(i, 1);
      }
    },
  };
})(window);
