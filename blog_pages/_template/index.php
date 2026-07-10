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
  <link rel="stylesheet" href="<?= $root ?>/style.css?v=<?= $assetVersion ?>">
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
            <li><a href="<?= $root ?>/guestbook.html">📖 Гостевая</a></li>
          </ul>
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
            <p>Текст вашей записи...</p>
          </div>
        </div>

        <p class="center">
          <a href="<?= $root ?>/blog.html" class="page-link">📝 Все записи</a>
        </p>
      </td>

      <td class="sidebar-right" valign="top">
        <div class="box">
          <div class="box-title">📊 Счётчик</div>
          <div class="hit-counter" id="hit-counter">
            <span>0</span><span>0</span><span>0</span><span>0</span><span>0</span><span>0</span>
          </div>
        </div>
      </td>
    </tr>
  </table>

  <script>window.MPP_ROOT = '<?= $root ?>';</script>
  <script src="<?= $root ?>/common.js?v=<?= $assetVersion ?>"></script>
  <script src="script.js?v=<?= $assetVersion ?>"></script>
</body>
</html>
