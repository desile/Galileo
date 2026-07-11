/**
 * Константы и типы башен/врагов — Tower Defense Win95
 */
(function (global) {
  'use strict';

  global.TD = global.TD || {};

  global.TD.CONST = {
    TILE: 24,
    COLS: 18,
    ROWS: 10,
    START_GOLD: 120,
    START_LIVES: 12,
    MAX_WAVES: 10,
  };

  global.TD.TOWER_TYPES = {
    basic: {
      id: 'basic',
      name: 'Пулемёт',
      cost: 50,
      range: 3.2,
      damage: 12,
      fireRate: 1.2,
      color: '#008000',
      barrel: '#004000',
      desc: 'Дешёво, стабильно',
    },
    cannon: {
      id: 'cannon',
      name: 'Пушка',
      cost: 110,
      range: 2.6,
      damage: 38,
      fireRate: 0.45,
      splash: 1.2,
      color: '#404040',
      barrel: '#202020',
      desc: 'Мощный выстрел',
    },
    laser: {
      id: 'laser',
      name: 'Лазер',
      cost: 180,
      range: 4.5,
      damage: 6,
      fireRate: 4,
      color: '#000080',
      barrel: '#00ffff',
      desc: 'Дальний огонь',
    },
  };

  global.TD.ENEMY_TYPES = {
    grunt: {
      id: 'grunt',
      name: 'Гоблин',
      hp: 40,
      speed: 38,
      reward: 8,
      color: '#8b0000',
      size: 0.55,
    },
    scout: {
      id: 'scout',
      name: 'Разведчик',
      hp: 28,
      speed: 62,
      reward: 10,
      color: '#ff6600',
      size: 0.45,
    },
    tank: {
      id: 'tank',
      name: 'Танк',
      hp: 110,
      speed: 24,
      reward: 18,
      color: '#404040',
      size: 0.7,
    },
  };

  global.TD.WAVE_PLAN = [
    [{ type: 'grunt', count: 6, interval: 0.9 }],
    [{ type: 'grunt', count: 8, interval: 0.75 }],
    [{ type: 'grunt', count: 6, interval: 0.7 }, { type: 'scout', count: 4, interval: 0.6 }],
    [{ type: 'scout', count: 10, interval: 0.55 }],
    [{ type: 'grunt', count: 8, interval: 0.6 }, { type: 'tank', count: 2, interval: 1.4 }],
    [{ type: 'scout', count: 8, interval: 0.5 }, { type: 'tank', count: 3, interval: 1.2 }],
    [{ type: 'grunt', count: 12, interval: 0.45 }],
    [{ type: 'tank', count: 5, interval: 1.0 }, { type: 'scout', count: 6, interval: 0.45 }],
    [{ type: 'grunt', count: 10, interval: 0.4 }, { type: 'tank', count: 4, interval: 0.9 }],
    [{ type: 'scout', count: 8, interval: 0.35 }, { type: 'tank', count: 6, interval: 0.8 }],
  ];
})(window);
