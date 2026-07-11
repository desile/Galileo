/**
 * Отрисовка поля, башен, врагов, снарядов
 */
(function (global) {
  'use strict';

  global.TD = global.TD || {};

  function drawPixelRect(ctx, x, y, w, h, fill, stroke) {
    ctx.fillStyle = fill;
    ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.strokeRect(Math.floor(x) + 0.5, Math.floor(y) + 0.5, w - 1, h - 1);
    }
  }

  global.TD.Render = {
    drawMap: function (ctx, tile, cols, rows, path) {
      for (var row = 0; row < rows; row++) {
        for (var col = 0; col < cols; col++) {
          var x = col * tile;
          var y = row * tile;
          var onPath = path.isPath(col, row);
          var base = onPath ? '#9a8458' : '#1a6b1a';
          var light = onPath ? '#b8a070' : '#228b22';
          var dark = onPath ? '#6b5a38' : '#0d4d0d';

          drawPixelRect(ctx, x, y, tile, tile, base);
          drawPixelRect(ctx, x, y, tile, 2, light);
          drawPixelRect(ctx, x, y, 2, tile, light);
          drawPixelRect(ctx, x + tile - 2, y, 2, tile, dark);
          drawPixelRect(ctx, x, y + tile - 2, tile, 2, dark);

          if (onPath && (col + row) % 2 === 0) {
            drawPixelRect(ctx, x + 4, y + 4, tile - 8, tile - 8, '#8a7048');
          }
        }
      }

      // Старт / финиш
      var start = path.waypoints[0];
      var end = path.waypoints[path.waypoints.length - 1];
      drawPixelRect(ctx, start[0] * tile + 2, start[1] * tile + 2, tile - 4, tile - 4, '#004080');
      ctx.fillStyle = '#fff';
      ctx.font = '8px monospace';
      ctx.fillText('IN', start[0] * tile + 6, start[1] * tile + 14);
      drawPixelRect(ctx, end[0] * tile + 2, end[1] * tile + 2, tile - 4, tile - 4, '#800000');
      ctx.fillStyle = '#fff';
      ctx.fillText('OUT', end[0] * tile + 2, end[1] * tile + 14);
    },

    drawTower: function (ctx, tower, tile, selected) {
      var cx = tower.col * tile + tile / 2;
      var cy = tower.row * tile + tile / 2;
      var def = tower.def;
      var s = tile * 0.38;

      if (selected) {
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.35)';
        ctx.beginPath();
        ctx.arc(cx, cy, def.range * tile, 0, Math.PI * 2);
        ctx.stroke();
      }

      drawPixelRect(ctx, cx - s, cy - s, s * 2, s * 2, '#c0c0c0', '#808080');
      drawPixelRect(ctx, cx - s + 2, cy - s + 2, s * 2 - 4, s * 2 - 4, def.color);
      drawPixelRect(ctx, cx - 2, cy - s - 4, 4, 6, def.barrel);

      ctx.fillStyle = '#000';
      ctx.fillRect(cx - 3, cy - 3, 2, 2);
      ctx.fillRect(cx + 1, cy - 3, 2, 2);
    },

    drawEnemy: function (ctx, enemy, tile) {
      var pos = global.TD.Path.positionAt(enemy.distance);
      var cx = pos.x * tile + tile / 2;
      var cy = pos.y * tile + tile / 2;
      var def = enemy.def;
      var s = tile * def.size;

      drawPixelRect(ctx, cx - s, cy - s * 0.8, s * 2, s * 1.6, def.color, '#202020');
      ctx.fillStyle = '#fff';
      ctx.fillRect(cx - 4, cy - 4, 2, 2);
      ctx.fillRect(cx + 2, cy - 4, 2, 2);

      var hpPct = enemy.hp / enemy.maxHp;
      var barW = s * 2;
      drawPixelRect(ctx, cx - barW / 2, cy - s - 6, barW, 4, '#400000');
      drawPixelRect(ctx, cx - barW / 2, cy - s - 6, barW * hpPct, 4, hpPct > 0.35 ? '#00cc00' : '#ff0000');
    },

    drawProjectile: function (ctx, proj, tile) {
      var x = proj.x * tile + tile / 2;
      var y = proj.y * tile + tile / 2;
      drawPixelRect(ctx, x - 2, y - 2, 4, 4, proj.color || '#ffff00');
    },

    drawGhostTower: function (ctx, col, row, tile, def, valid) {
      var cx = col * tile + tile / 2;
      var cy = row * tile + tile / 2;
      ctx.globalAlpha = 0.55;
      ctx.strokeStyle = valid ? '#00ff00' : '#ff0000';
      ctx.beginPath();
      ctx.arc(cx, cy, def.range * tile, 0, Math.PI * 2);
      ctx.stroke();
      var s = tile * 0.38;
      drawPixelRect(ctx, cx - s, cy - s, s * 2, s * 2, valid ? def.color : '#808080');
      ctx.globalAlpha = 1;
    },
  };
})(window);
