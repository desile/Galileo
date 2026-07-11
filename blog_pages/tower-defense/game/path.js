/**
 * Карта и путь врагов
 */
(function (global) {
  'use strict';

  global.TD = global.TD || {};

  // Клетки пути (col, row)
  var WAYPOINTS = [
    [0, 4],
    [5, 4],
    [5, 1],
    [10, 1],
    [10, 7],
    [15, 7],
    [15, 3],
    [17, 3],
  ];

  function buildPathCells() {
    var cells = {};
    var segments = [];

    for (var i = 0; i < WAYPOINTS.length - 1; i++) {
      var a = WAYPOINTS[i];
      var b = WAYPOINTS[i + 1];
      var c = a.slice();
      cells[key(c[0], c[1])] = true;

      while (c[0] !== b[0] || c[1] !== b[1]) {
        if (c[0] < b[0]) c[0]++;
        else if (c[0] > b[0]) c[0]--;
        else if (c[1] < b[1]) c[1]++;
        else if (c[1] > b[1]) c[1]--;
        cells[key(c[0], c[1])] = true;
      }
    }

    for (var j = 0; j < WAYPOINTS.length - 1; j++) {
      var from = WAYPOINTS[j];
      var to = WAYPOINTS[j + 1];
      var steps = Math.max(Math.abs(to[0] - from[0]), Math.abs(to[1] - from[1]));
      for (var s = 0; s <= steps; s++) {
        var t = steps === 0 ? 0 : s / steps;
        segments.push({
          x: from[0] + (to[0] - from[0]) * t,
          y: from[1] + (to[1] - from[1]) * t,
        });
      }
    }

    return { cells: cells, segments: segments };
  }

  function key(col, row) {
    return col + ',' + row;
  }

  var pathData = buildPathCells();

  global.TD.Path = {
    waypoints: WAYPOINTS,
    pathCells: pathData.cells,
    segments: pathData.segments,
    totalLength: pathData.segments.length,

    isPath: function (col, row) {
      return !!pathData.cells[key(col, row)];
    },

    /** Позиция на пути по дистанции (в «тайлах») */
    positionAt: function (distance) {
      var segs = pathData.segments;
      if (segs.length === 0) return { x: 0, y: 0 };
      var idx = Math.min(distance, segs.length - 1);
      var frac = distance - Math.floor(distance);
      var i = Math.floor(idx);
      var a = segs[i];
      var b = segs[Math.min(i + 1, segs.length - 1)];
      return {
        x: a.x + (b.x - a.x) * frac,
        y: a.y + (b.y - a.y) * frac,
      };
    },

    gridToPixel: function (col, row, tile) {
      return {
        x: col * tile + tile / 2,
        y: row * tile + tile / 2,
      };
    },

    pixelToGrid: function (x, y, tile) {
      return {
        col: Math.floor(x / tile),
        row: Math.floor(y / tile),
      };
    },
  };
})(window);
