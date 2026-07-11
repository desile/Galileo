/**
 * Враги и волны
 */
(function (global) {
  'use strict';

  global.TD = global.TD || {};
  var ENEMY_TYPES = global.TD.ENEMY_TYPES;
  var Path = global.TD.Path;

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
      prevDistance: 0,
      alive: true,
      dying: false,
      deathTimer: 0,
      walkPhase: Math.random() * Math.PI * 2,
      hitFlash: 0,
      facing: 'right',
      wobble: 0,
    };
  }

  global.TD.Enemies = {
    create: createEnemy,

    update: function (enemies, dt, gameTime) {
      var leaked = 0;
      var finished = [];

      enemies.forEach(function (enemy) {
        if (!enemy.alive) return;

        if (enemy.dying) {
          enemy.deathTimer -= dt;
          enemy.walkPhase += dt * 14;
          if (enemy.deathTimer <= 0) {
            enemy.alive = false;
            enemy.dying = false;
          }
          return;
        }

        enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
        enemy.prevDistance = enemy.distance;
        enemy.distance += (enemy.def.speed / global.TD.CONST.TILE) * dt;
        enemy.walkPhase += dt * (enemy.def.speed / 18);
        enemy.facing = Path.directionAt(enemy.distance);
        enemy.wobble = Math.sin(enemy.walkPhase * 2) * 0.06;

        if (enemy.distance >= Path.totalLength - 1) {
          enemy.alive = false;
          leaked++;
          finished.push(enemy.id);
        }
      });

      return { leaked: leaked, finished: finished, gameTime: gameTime };
    },

    findInRange: function (enemies, col, row, rangeTiles) {
      var tx = col + 0.5;
      var ty = row + 0.5;
      var best = null;
      var bestDist = -1;

      enemies.forEach(function (enemy) {
        if (!enemy.alive || enemy.dying || enemy.hp <= 0) return;
        var pos = Path.positionAt(enemy.distance);
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
        if (!enemy.alive || enemy.dying) return;
        if (Math.abs(enemy.distance - centerDist) <= radiusTiles) {
          enemy.hitFlash = 0.18;
          enemy.hp -= damage;
          if (enemy.hp <= 0) {
            enemy.dying = true;
            enemy.deathTimer = 0.5;
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
