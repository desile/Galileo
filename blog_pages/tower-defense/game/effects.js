/**
 * Визуальные эффекты: вспышки, взрывы, искры, лучи
 */
(function (global) {
  'use strict';

  global.TD = global.TD || {};

  function spawn(list, effect) {
    list.push(effect);
  }

  global.TD.Effects = {
    spawn: spawn,

    muzzleFlash: function (list, x, y, angle, color) {
      spawn(list, {
        type: 'muzzle',
        x: x,
        y: y,
        angle: angle,
        color: color || '#ffff88',
        age: 0,
        maxAge: 0.1,
      });
    },

    impactSparks: function (list, x, y, color) {
      for (var i = 0; i < 5; i++) {
        var a = (Math.PI * 2 * i) / 5 + Math.random() * 0.5;
        var sp = 2 + Math.random() * 3;
        spawn(list, {
          type: 'spark',
          x: x,
          y: y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          color: color || '#ffff00',
          age: 0,
          maxAge: 0.25 + Math.random() * 0.15,
        });
      }
    },

    explosion: function (list, x, y, radius, color) {
      spawn(list, {
        type: 'explosion',
        x: x,
        y: y,
        radius: radius || 1,
        color: color || '#ff8800',
        age: 0,
        maxAge: 0.45,
      });
      for (var i = 0; i < 8; i++) {
        var a = Math.random() * Math.PI * 2;
        spawn(list, {
          type: 'debris',
          x: x,
          y: y,
          vx: Math.cos(a) * (1.5 + Math.random() * 2),
          vy: Math.sin(a) * (1.5 + Math.random() * 2),
          color: i % 2 ? '#808080' : '#404040',
          age: 0,
          maxAge: 0.35 + Math.random() * 0.2,
        });
      }
    },

    laserBeam: function (list, fromX, fromY, toX, toY, color) {
      spawn(list, {
        type: 'laser',
        x: fromX,
        y: fromY,
        tx: toX,
        ty: toY,
        color: color || '#00ffff',
        age: 0,
        maxAge: 0.12,
      });
    },

    deathBurst: function (list, x, y, enemyType) {
      var colors = {
        grunt: '#8b0000',
        scout: '#ff6600',
        tank: '#606060',
      };
      spawn(list, {
        type: 'death',
        x: x,
        y: y,
        enemyType: enemyType,
        color: colors[enemyType] || '#ff0000',
        age: 0,
        maxAge: 0.55,
      });
    },

    update: function (list, dt, tile) {
      for (var i = list.length - 1; i >= 0; i--) {
        var fx = list[i];
        fx.age += dt;
        if (fx.type === 'spark' || fx.type === 'debris') {
          fx.x += fx.vx * dt;
          fx.y += fx.vy * dt;
          fx.vy += 4 * dt;
        }
        if (fx.age >= fx.maxAge) list.splice(i, 1);
      }
    },
  };
})(window);
