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
  <meta name="description" content="Запись блога на mypersonalpage.ru">
  <link rel="stylesheet" href="<?= $root ?>/style.css?v=<?= $assetVersion ?>">
  <style>
    .minesweeper { max-width: 340px; margin: 0 auto; }
    .ms-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #c0c0c0;
      border: 2px outset #fff;
      padding: 6px 8px;
      margin-bottom: 8px;
      font-family: 'Press Start 2P', monospace;
      font-size: 14px;
      color: #f00;
    }
    .ms-face {
      width: 32px;
      height: 32px;
      font-size: 20px;
      line-height: 28px;
      background: #c0c0c0;
      border: 2px outset #fff;
      cursor: pointer;
      padding: 0;
    }
    .ms-face:active { border-style: inset; }
    .ms-board {
      display: grid;
      gap: 0;
      background: #c0c0c0;
      border: 3px outset #fff;
      padding: 6px;
      width: fit-content;
      margin: 0 auto;
      user-select: none;
      -webkit-user-select: none;
    }
    .ms-cell {
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      font-family: 'Comic Neue', 'Comic Sans MS', cursive;
      background: #c0c0c0;
      border: 2px outset #fff;
      cursor: pointer;
      line-height: 1;
    }
    .ms-cell.revealed {
      background: #bdbdbd;
      border: 1px solid #888;
      cursor: default;
    }
    .ms-cell.flagged::after { content: '🚩'; font-size: 14px; }
    .ms-cell.mine.revealed::after { content: '💣'; font-size: 14px; }
    .ms-cell.n1 { color: #0000ff; }
    .ms-cell.n2 { color: #008000; }
    .ms-cell.n3 { color: #ff0000; }
    .ms-cell.n4 { color: #000080; }
    .ms-cell.n5 { color: #800000; }
    .ms-cell.n6 { color: #008080; }
    .ms-cell.n7 { color: #000; }
    .ms-cell.n8 { color: #808080; }
    .ms-status { min-height: 1.2em; margin-top: 8px; color: #ffff00; }
  </style>
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
            <p>Добро пожаловать в мой блог! 👋</p>
            <p>Рад, что вы заглянули на <strong>mypersonalpage.ru</strong>. Здесь я буду писать о всяком разном — от ностальгии по раннему интернету до маленьких домашних проектов в духе <em>old school</em>.</p>
            <p>А чтобы настроение было правильным — прямо под этим текстом вас ждёт <span class="highlight">Сапёр</span>. Сыграйте партию, пока читаете! ЛКМ открывает клетку, ПКМ ставит флаг. Удачи! 💣</p>
            <p><strong>Откуда взялся Сапёр?</strong> В привычном виде игра появилась в <strong>1990 году</strong> — её написал Роберт Доннер, а Microsoft включила «Minesweeper» в Windows 3.1. Миллионы людей убивали время за серо-зелёным полем ещё до того, как слово «браузер» стало повседневным.</p>
            <p>Идея «найди мины по подсказкам» старше: похожие головоломки встречались ещё в 1960–80-х (например, <em>Mined-Out</em> и <em>Relentless Logic</em>). Но именно версия от Microsoft сделала сапёра культовой — такой же неотъемлемой частью компьютера, как Паинт и Косынка.</p>
            <p>Заходите почаще — в гостевую, в блог и, конечно, за новым рекордом в сапёре! 🎉</p>
          </div>
          <p id="post-extra" class="small center" style="margin-top:12px"></p>
        </div>

        <div class="box">
          <div class="box-title">💣 Сапёр</div>
          <p class="small center">Классика жанра! ЛКМ — открыть, ПКМ — флаг 🚩</p>
          <div class="minesweeper">
            <div class="ms-toolbar">
              <span id="ms-mines-left">010</span>
              <button type="button" id="ms-reset" class="ms-face" title="Новая игра">😎</button>
              <span id="ms-timer">000</span>
            </div>
            <div id="ms-board" class="ms-board" aria-label="Поле сапёра"></div>
            <p id="ms-status" class="ms-status small center"></p>
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
  <script src="script.js?v=<?= $assetVersion ?>"></script>
</body>
</html>
