<?php
declare(strict_types=1);

require_once __DIR__ . '/../_include/page.php';
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>★ <?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?> — mypersonalpage.ru ★</title>
  <meta name="description" content="Tower Defense в стиле Windows 95 на mypersonalpage.ru">
  <link rel="stylesheet" href="<?= $root ?>/style.css?v=<?= $assetVersion ?>">
  <link rel="stylesheet" href="game.css?v=<?= $assetVersion ?>">
</head>
<body>

  <div class="stars" aria-hidden="true"></div>

  <div class="top-banner">
  <marquee behavior="scroll" direction="left" scrollamount="4">
    ★★★ mypersonalpage.ru ★★★ Блог ★★★ <?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?> ★★★
  </marquee>
  </div>

  <table class="layout" cellpadding="0" cellspacing="0" border="0" align="center">
    <tr>
      <td class="sidebar-left" valign="top">
        <div class="box">
          <div class="box-title">📂 Меню сайта</div>
          <ul class="nav-links">
            <li><a href="<?= $root ?>/index.html">🏠 Главная</a></li>
            <li><a href="<?= $root ?>/blog.html" class="nav-active">📝 Блог</a></li>
            <li><a href="<?= $root ?>/guestbook.html">📖 Гостевая книга</a></li>
            <li><a href="<?= $root ?>/index.html#about">👤 Обо мне</a></li>
            <li><a href="<?= $root ?>/index.html#contact">✉️ Контакт</a></li>
          </ul>
        </div>

        <div class="box">
          <div class="box-title">🌐 Сейчас онлайн</div>
          <p class="blink">● ONLINE</p>
          <p class="small">Статус: <span id="status-text">в сети</span></p>
          <p class="small">Время: <span id="clock">--:--:--</span></p>
        </div>

        <div class="box">
          <div class="box-title">📌 Эта запись</div>
          <p class="small">Дата: <strong><?= htmlspecialchars($pageDate, ENT_QUOTES, 'UTF-8') ?></strong></p>
          <p class="small">Папка: <code>blog_pages/<?= htmlspecialchars($pageFolder, ENT_QUOTES, 'UTF-8') ?>/</code></p>
        </div>
      </td>

      <td class="main-content" valign="top">
        <div class="header">
          <h1><span class="rainbow">★ mypersonalpage.ru ★</span></h1>
          <p class="subtitle"><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?> — 📅 <?= htmlspecialchars($pageDate, ENT_QUOTES, 'UTF-8') ?></p>
          <hr class="fancy-hr">
        </div>

        <div class="box">
          <div class="box-title">📝 <?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></div>
          <div class="blog-content">
            <p>После сапёра пришло время для чего-то посерьёзнее — <strong>Tower Defense</strong> в духе Windows 95! 🏰</p>
            <p>Ставьте башни на зелёную траву, отражайте волны врагов по серой дорожке и не дайте им дойти до выхода. Три типа башен, десять волн, пиксельная графика и серая рамка — как будто запустили exe с дискеты.</p>
            <p><strong>Управление:</strong> выберите башню внизу → клик по клетке → «Начать волну». Смайлик 🙂 — новая игра.</p>
            <p>Жанр tower defense зародился в Flash-эпоху (Desktop Tower Defense, 2007), но корни — в стратегиях вроде <em>Rampart</em> (1990). А серая оболочка окна — чистый дух Win95, когда каждая игра выглядела как системная утилита 😄</p>
          </div>
          <p id="post-extra" class="small center" style="margin-top:12px"></p>
        </div>

        <div class="box">
          <div class="box-title">🏰 Tower Defense Win95</div>
          <p class="small center">Пиксельная башенная оборона — защитите базу!</p>

          <div class="td-wrap">
            <div class="td-window">
              <div class="td-titlebar">
                <span class="td-titlebar-icon">🏰</span>
                <span>TowerDefense.exe — mypersonalpage.ru</span>
              </div>
              <div class="td-body">
                <div class="td-toolbar">
                  <span class="td-stat">💰 <span id="td-gold">120</span></span>
                  <span class="td-stat">❤️ <span id="td-lives">12</span></span>
                  <span class="td-stat">🌊 <span id="td-wave">0/10</span></span>
                  <button type="button" id="td-reset" class="td-face" title="Новая игра">🙂</button>
                </div>

                <div class="td-canvas-wrap">
                  <canvas id="td-canvas" width="432" height="240" aria-label="Поле Tower Defense"></canvas>
                </div>

                <div class="td-panel">
                  <button type="button" class="td-btn" data-tower="basic">
                    <strong>🔫 Пулемёт</strong>
                    <small class="td-cost">50💰</small>
                  </button>
                  <button type="button" class="td-btn" data-tower="cannon">
                    <strong>💣 Пушка</strong>
                    <small class="td-cost">110💰</small>
                  </button>
                  <button type="button" class="td-btn" data-tower="laser">
                    <strong>⚡ Лазер</strong>
                    <small class="td-cost">180💰</small>
                  </button>
                </div>

                <button type="button" id="td-start-wave" class="td-action">⚔️ Начать волну</button>
                <p id="td-status" class="td-status"></p>
                <p class="td-hint">IN — вход врагов, OUT — ваш выход. Не ставьте башни на дорогу!</p>
              </div>
            </div>
          </div>
        </div>

        <p class="center">
          <a href="<?= $root ?>/blog.html" class="page-link">📝 Все записи</a>
          <a href="<?= $root ?>/index.html" class="page-link">🏠 На главную</a>
        </p>
      </td>

      <td class="sidebar-right" valign="top">
        <div class="box">
          <div class="box-title">📊 Счётчик</div>
          <div class="hit-counter" id="hit-counter">
            <span>0</span><span>0</span><span>0</span><span>0</span><span>0</span><span>0</span>
          </div>
          <p class="small center">посещений</p>
        </div>

        <div class="box">
          <div class="box-title">🎨 Цвет дня</div>
          <div class="color-of-day" id="color-of-day">
            <div class="color-swatch"></div>
            <p class="small center" id="color-name">#FF00FF</p>
          </div>
        </div>

        <div class="box">
          <div class="box-title">📅 Календарь</div>
          <div class="mini-calendar" id="calendar"></div>
        </div>
      </td>
    </tr>
  </table>

  <div class="footer">
    <p class="footer-text">
      © 2026 <a href="<?= $root ?>/index.html">mypersonalpage.ru</a> |
      <a href="<?= $root ?>/blog.html">← К блогу</a>
    </p>
  </div>

  <script>window.MPP_ROOT = '<?= $root ?>';</script>
  <script src="<?= $root ?>/common.js?v=<?= $assetVersion ?>"></script>
  <script src="game/constants.js?v=<?= $assetVersion ?>"></script>
  <script src="game/path.js?v=<?= $assetVersion ?>"></script>
  <script src="game/render.js?v=<?= $assetVersion ?>"></script>
  <script src="game/enemies.js?v=<?= $assetVersion ?>"></script>
  <script src="game/towers.js?v=<?= $assetVersion ?>"></script>
  <script src="game/engine.js?v=<?= $assetVersion ?>"></script>
  <script src="script.js?v=<?= $assetVersion ?>"></script>
</body>
</html>
