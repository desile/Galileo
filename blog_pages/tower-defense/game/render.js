/**
 * Отрисовка поля, башен, врагов, снарядов и эффектов
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

  function tileToPx(x, y, tile) {
    return { px: x * tile + tile / 2, py: y * tile + tile / 2 };
  }

  function drawLegs(ctx, cx, cy, s, frame, facing, color, dark) {
    var swing = frame === 0 ? 2 : -2;
    var lx = cx;
    var ly = cy + s * 0.5;

    if (facing === 'left' || facing === 'right') {
      drawPixelRect(ctx, lx - s * 0.5, ly + swing, 3, 5, dark);
      drawPixelRect(ctx, lx + s * 0.2, ly - swing, 3, 5, dark);
    } else {
      drawPixelRect(ctx, lx - s * 0.4 + swing, ly, 3, 5, dark);
      drawPixelRect(ctx, lx + s * 0.1 - swing, ly + 2, 3, 5, dark);
    }
  }

  function drawGrunt(ctx, cx, cy, s, enemy, frame, flash) {
    var body = flash ? '#ffffff' : enemy.def.color;
    var dark = flash ? '#cccccc' : '#5a0000';
    var bob = Math.sin(enemy.walkPhase * 2) * 1.5;

    drawLegs(ctx, cx, cy + bob, s, frame, enemy.facing, body, dark);
    drawPixelRect(ctx, cx - s, cy - s + bob, s * 2, s * 1.5, body, '#202020');
    drawPixelRect(ctx, cx - s + 2, cy - s * 1.2 + bob, 4, 4, dark);
    drawPixelRect(ctx, cx + s - 6, cy - s * 1.2 + bob, 4, 4, dark);
    ctx.fillStyle = flash ? '#ff0000' : '#ffff00';
    ctx.fillRect(cx - 4, cy - s * 0.5 + bob, 2, 2);
    ctx.fillRect(cx + 2, cy - s * 0.5 + bob, 2, 2);
    drawPixelRect(ctx, cx - 2, cy - s * 1.5 + bob, 4, 5, dark);
  }

  function drawScout(ctx, cx, cy, s, enemy, frame, flash) {
    var body = flash ? '#ffffff' : enemy.def.color;
    var capeWave = Math.sin(enemy.walkPhase * 3) * 2;
    var bob = Math.sin(enemy.walkPhase * 2.5) * 2;

    drawLegs(ctx, cx, cy + bob, s * 0.9, frame, enemy.facing, body, '#aa4400');
    drawPixelRect(ctx, cx - s * 0.8, cy - s + bob, s * 1.6, s * 1.2, body, '#202020');
    drawPixelRect(ctx, cx + s * 0.3, cy - s * 0.6 + bob + capeWave * 0.2, 5, 8, '#cc2200');
    ctx.fillStyle = '#fff';
    ctx.fillRect(cx - 3, cy - s * 0.4 + bob, 2, 2);
    ctx.fillRect(cx + 1, cy - s * 0.4 + bob, 2, 2);
  }

  function drawTank(ctx, cx, cy, s, enemy, frame, flash) {
    var body = flash ? '#aaaaaa' : enemy.def.color;
    var treadOff = frame === 0 ? 0 : 2;
    var bob = Math.sin(enemy.walkPhase * 1.5) * 0.8;

    drawPixelRect(ctx, cx - s * 1.1, cy + s * 0.35 + bob + treadOff, s * 2.2, 5, '#202020');
    drawPixelRect(ctx, cx - s * 1.1, cy + s * 0.55 + bob - treadOff, s * 2.2, 5, '#202020');
    drawPixelRect(ctx, cx - s, cy - s * 0.3 + bob, s * 2, s * 1.1, body, '#101010');
    drawPixelRect(ctx, cx - s * 0.5, cy - s * 0.7 + bob, s, s * 0.55, '#606060');
    var barrelLen = enemy.facing === 'left' ? -8 : enemy.facing === 'right' ? 8 : 0;
    var barrelY = enemy.facing === 'up' ? -8 : enemy.facing === 'down' ? 8 : 0;
    drawPixelRect(ctx, cx + barrelLen - 2, cy - s * 0.5 + bob + barrelY, 4, 10, '#303030');
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

    drawTower: function (ctx, tower, tile) {
      var cx = tower.col * tile + tile / 2;
      var cy = tower.row * tile + tile / 2;
      var def = tower.def;
      var s = tile * 0.38;
      var recoil = tower.recoil || 0;
      var angle = tower.aimAngle != null ? tower.aimAngle : -Math.PI / 2;

      drawPixelRect(ctx, cx - s, cy - s, s * 2, s * 2, '#c0c0c0', '#808080');
      drawPixelRect(ctx, cx - s + 2, cy - s + 2, s * 2 - 4, s * 2 - 4, def.color);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      var barrelLen = 8 + recoil * 20;
      drawPixelRect(ctx, -2, -s - barrelLen, 4, barrelLen + 4, def.barrel);
      if (tower.type === 'laser') {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
        ctx.fillRect(-1, -s - barrelLen - 2, 2, 3);
      }
      ctx.restore();

      ctx.fillStyle = '#000';
      ctx.fillRect(cx - 3, cy - 3, 2, 2);
      ctx.fillRect(cx + 1, cy - 3, 2, 2);
    },

    drawEnemy: function (ctx, enemy, tile) {
      if (!enemy.alive) return;

      var pos = global.TD.Path.positionAt(enemy.distance);
      var cx = pos.x * tile + tile / 2;
      var cy = pos.y * tile + tile / 2;
      var s = tile * enemy.def.size;
      var frame = Math.floor(enemy.walkPhase * 2) % 2;
      var flash = enemy.hitFlash > 0;

      if (enemy.dying) {
        var t = 1 - enemy.deathTimer / 0.5;
        ctx.globalAlpha = 1 - t;
        s *= 1 + t * 0.4;
        cy -= t * 8;
      }

      if (enemy.type === 'scout') drawScout(ctx, cx, cy, s, enemy, frame, flash);
      else if (enemy.type === 'tank') drawTank(ctx, cx, cy, s, enemy, frame, flash);
      else drawGrunt(ctx, cx, cy, s, enemy, frame, flash);

      ctx.globalAlpha = 1;

      if (!enemy.dying) {
        var hpPct = enemy.hp / enemy.maxHp;
        var barW = s * 2;
        drawPixelRect(ctx, cx - barW / 2, cy - s - 8, barW, 4, '#400000');
        drawPixelRect(ctx, cx - barW / 2, cy - s - 8, barW * hpPct, 4, hpPct > 0.35 ? '#00cc00' : '#ff0000');
      }
    },

    drawProjectile: function (ctx, proj, tile) {
      if (proj.kind === 'bullet') {
        if (proj.trail) {
          proj.trail.forEach(function (t, i) {
            var alpha = (i + 1) / (proj.trail.length + 1) * 0.5;
            ctx.globalAlpha = alpha;
            var tp = tileToPx(t.x, t.y, tile);
            drawPixelRect(ctx, tp.px - 1, tp.py - 1, 2, 2, '#ffff88');
          });
          ctx.globalAlpha = 1;
        }
        var p = tileToPx(proj.x, proj.y, tile);
        drawPixelRect(ctx, p.px - 3, p.py - 2, 6, 4, '#ffff00', '#aa8800');
        return;
      }

      if (proj.kind === 'cannonball') {
        var cp = tileToPx(proj.x, proj.y, tile);
        var arc = Math.sin(proj.spin) * 3;
        ctx.save();
        ctx.translate(cp.px, cp.py + arc);
        ctx.rotate(proj.spin);
        drawPixelRect(ctx, -5, -5, 10, 10, '#404040', '#101010');
        drawPixelRect(ctx, -2, -4, 3, 3, '#888888');
        ctx.restore();
      }
    },

    drawEffects: function (ctx, effects, tile) {
      effects.forEach(function (fx) {
        var t = fx.age / fx.maxAge;
        var p = tileToPx(fx.x, fx.y, tile);

        if (fx.type === 'muzzle') {
          var len = (1 - t) * 14;
          ctx.save();
          ctx.translate(p.px, p.py);
          ctx.rotate(fx.angle);
          ctx.globalAlpha = 1 - t;
          ctx.fillStyle = fx.color;
          ctx.fillRect(0, -2, len, 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(2, -1, len * 0.6, 2);
          ctx.restore();
        }

        if (fx.type === 'spark' || fx.type === 'debris') {
          var sp = tileToPx(fx.x, fx.y, tile);
          ctx.globalAlpha = 1 - t;
          drawPixelRect(ctx, sp.px - 1, sp.py - 1, 3, 3, fx.color);
        }

        if (fx.type === 'explosion') {
          var r = (fx.radius * tile * 0.5) * (0.3 + t * 1.2);
          ctx.globalAlpha = 1 - t;
          ctx.strokeStyle = fx.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.px, p.py, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = t < 0.3 ? '#ffff00' : '#ff4400';
          ctx.globalAlpha = (1 - t) * 0.6;
          ctx.beginPath();
          ctx.arc(p.px, p.py, r * 0.55, 0, Math.PI * 2);
          ctx.fill();
        }

        if (fx.type === 'laser') {
          var from = tileToPx(fx.x, fx.y, tile);
          var to = tileToPx(fx.tx, fx.ty, tile);
          var flicker = Math.random() > 0.3 ? 1 : 0.4;
          ctx.globalAlpha = (1 - t) * flicker;
          ctx.strokeStyle = fx.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(from.px, from.py);
          ctx.lineTo(to.px, to.py);
          ctx.stroke();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        if (fx.type === 'death') {
          var dr = 4 + t * 18;
          ctx.globalAlpha = 1 - t;
          for (var i = 0; i < 6; i++) {
            var a = (Math.PI * 2 * i) / 6 + t * 2;
            var dx = Math.cos(a) * dr;
            var dy = Math.sin(a) * dr;
            drawPixelRect(ctx, p.px + dx - 2, p.py + dy - 2, 4, 4, fx.color);
          }
        }
      });
      ctx.globalAlpha = 1;
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
