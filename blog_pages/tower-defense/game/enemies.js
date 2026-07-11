/**
 * Враги и волны
 */
(function (global) {
  'use strict';

  global.TD = global.TD || {};
  var ENEMY_TYPES = global.TD.ENEMY_TYPES;

  function createEnemy(typeId, hpScale) {
    var def = ENEMY_TYPES[typeId];
    if (!def) return null;
    var scale = hpScale || 1;
    return {
      id: 'e' + Math.random().toString(36).slice(2, 9),
      type: typeId,
      def: def,
      hp: Math.round(def.hp * scale),
      maxHp: Math.round(def.hp * scale),
      distance: 0,
      alive: true,
    };
  }

  global.TD.Enemies = {
    create: createEnemy,

    update: function (enemies, dt) {
      var leaked = 0;
      var finished = [];

      enemies.forEach(function (enemy) {
        if (!enemy.alive) return;
        enemy.distance += (enemy.def.speed / global.TD.CONST.TILE) * dt;
        if (enemy.distance >= global.TD.Path.totalLength - 1) {
          enemy.alive = false;
          leaked++;
          finished.push(enemy.id);
        }
      });

      return { leaked: leaked, finished: finished };
    },

    findInRange: function (enemies, col, row, rangeTiles) {
      var tile = global.TD.CONST.TILE;
      var tx = col + 0.5;
      var ty = row + 0.5;
      var best = null;
      var bestDist = -1;

      enemies.forEach(function (enemy) {
        if (!enemy.alive || enemy.hp <= 0) return;
        var pos = global.TD.Path.positionAt(enemy.distance);
        var dx = pos.x - tx;
        var dy = pos.y - ty;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= rangeTiles && enemy.distance > bestDist) {
          bestDist = enemy.distance;
          best = enemy;
        }
      });

      return best;
    },

    damageArea: function (enemies, centerDist, radiusTiles, damage) {
      var killed = [];
      var totalReward = 0;

      enemies.forEach(function (enemy) {
        if (!enemy.alive) return;
        if (Math.abs(enemy.distance - centerDist) <= radiusTiles) {
          enemy.hp -= damage;
          if (enemy.hp <= 0) {
            enemy.alive = false;
            killed.push(enemy.id);
            totalReward += enemy.def.reward;
          }
        }
      });

      return { killed: killed, reward: totalReward };
    },

    buildWaveQueue: function (waveIndex) {
      var plan = global.TD.WAVE_PLAN[waveIndex];
      if (!plan) return [];
      var hpScale = 1 + waveIndex * 0.12;
      var queue = [];

      plan.forEach(function (group) {
        for (var i = 0; i < group.count; i++) {
          queue.push({
            type: group.type,
            delay: i * group.interval,
            hpScale: hpScale,
          });
        }
      });

      queue.sort(function (a, b) {
        return a.delay - b.delay;
      });

      return queue;
    },
  };
})(window);
