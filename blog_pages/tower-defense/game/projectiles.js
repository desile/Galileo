/**
 * Летящие снаряды и попадания
 */
(function (global) {
  'use strict';

  global.TD = global.TD || {};
  var Path = global.TD.Path;
  var Effects = global.TD.Effects;
  var Enemies = global.TD.Enemies;

  function findEnemy(enemies, id) {
    for (var i = 0; i < enemies.length; i++) {
      if (enemies[i].id === id && enemies[i].alive && !enemies[i].dying) return enemies[i];
    }
    return null;
  }

  function targetPos(enemy) {
    return Path.positionAt(enemy.distance);
  }

  function applyHit(enemy, damage, effects, tile, onKill) {
    enemy.hitFlash = 0.18;
    enemy.hp -= damage;
    var pos = targetPos(enemy);
    Effects.impactSparks(effects, pos.x, pos.y, '#ffcc00');

    if (enemy.hp <= 0) {
      enemy.dying = true;
      enemy.deathTimer = 0.5;
      Effects.deathBurst(effects, pos.x, pos.y, enemy.type);
      if (onKill) onKill(enemy);
    }
  }

  global.TD.Projectiles = {
    fire: function (list, tower, target, effects) {
      var fromX = tower.col + 0.5;
      var fromY = tower.row + 0.5;
      var tp = targetPos(target);
      var dx = tp.x - fromX;
      var dy = tp.y - fromY;
      tower.aimAngle = Math.atan2(dy, dx);
      tower.recoil = 0.14;

      Effects.muzzleFlash(effects, fromX, fromY, tower.aimAngle, tower.def.barrel);

      if (tower.type === 'laser') {
        Effects.laserBeam(effects, fromX, fromY, tp.x, tp.y, tower.def.barrel);
        list.push({
          kind: 'laser',
          targetId: target.id,
          damage: tower.def.damage,
          fromX: fromX,
          fromY: fromY,
          age: 0,
          maxAge: 0.1,
          hit: false,
        });
        return;
      }

      if (tower.type === 'cannon') {
        list.push({
          kind: 'cannonball',
          x: fromX,
          y: fromY,
          targetId: target.id,
          speed: 5,
          damage: tower.def.damage,
          splash: tower.def.splash,
          spin: 0,
        });
        return;
      }

      list.push({
        kind: 'bullet',
        x: fromX,
        y: fromY,
        targetId: target.id,
        speed: 11,
        damage: tower.def.damage,
        trail: [],
      });
    },

    update: function (list, enemies, effects, dt, tile, onReward) {
      var kills = 0;
      var reward = 0;

      for (var i = list.length - 1; i >= 0; i--) {
        var p = list[i];
        var target = findEnemy(enemies, p.targetId);

        if (p.kind === 'laser') {
          p.age += dt;
          if (!p.hit && p.age >= 0.04) {
            p.hit = true;
            if (target) {
              applyHit(target, p.damage, effects, tile, function (e) {
                kills++;
                reward += e.def.reward;
              });
            }
          }
          if (p.age >= p.maxAge) list.splice(i, 1);
          continue;
        }

        if (!target) {
          list.splice(i, 1);
          continue;
        }

        var tp = targetPos(target);

        if (p.kind === 'cannonball') {
          p.spin += dt * 12;
          var dx = tp.x - p.x;
          var dy = tp.y - p.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.18) {
            var splashResult = Enemies.damageArea(
              enemies,
              target.distance,
              p.splash,
              p.damage
            );
            Effects.explosion(effects, tp.x, tp.y, p.splash, '#ff9900');
            kills += splashResult.killed.length;
            reward += splashResult.reward;
            splashResult.killed.forEach(function (id) {
              enemies.forEach(function (e) {
                if (e.id === id) {
                  e.dying = true;
                  e.deathTimer = 0.5;
                  var pos = targetPos(e);
                  Effects.deathBurst(effects, pos.x, pos.y, e.type);
                }
              });
            });
            enemies.forEach(function (e) {
              if (e.alive && !e.dying && Math.abs(e.distance - target.distance) <= p.splash) {
                e.hitFlash = 0.18;
              }
            });
            list.splice(i, 1);
          } else {
            p.x += (dx / dist) * p.speed * dt;
            p.y += (dy / dist) * p.speed * dt;
          }
          continue;
        }

        if (p.kind === 'bullet') {
          p.trail.push({ x: p.x, y: p.y, age: 0 });
          if (p.trail.length > 6) p.trail.shift();

          var bdx = tp.x - p.x;
          var bdy = tp.y - p.y;
          var bdist = Math.sqrt(bdx * bdx + bdy * bdy);
          if (bdist < 0.15) {
            applyHit(target, p.damage, effects, tile, function (e) {
              kills++;
              reward += e.def.reward;
            });
            list.splice(i, 1);
          } else {
            p.x += (bdx / bdist) * p.speed * dt;
            p.y += (bdy / bdist) * p.speed * dt;
          }
        }
      }

      list.forEach(function (p) {
        if (p.trail) {
          p.trail.forEach(function (t) {
            t.age += dt;
          });
        }
      });

      if (reward > 0 && onReward) onReward(reward);
      return { kills: kills, reward: reward };
    },
  };
})(window);
