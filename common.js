// mypersonalpage.ru — общие виджеты для всех страниц

(function () {
  'use strict';

  window.MPP = window.MPP || {};

  MPP.escapeHtml = function (text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  MPP.renderGuestbookEntries = function (entries, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!entries.length) {
      container.innerHTML = '<p class="small center">Пока нет записей. Будьте первым! ✍️</p>';
      return;
    }

    container.innerHTML = entries.map(function (entry) {
      return (
        '<div class="guestbook-entry">' +
          '<p><strong>' + MPP.escapeHtml(entry.name) + '</strong> — ' + MPP.escapeHtml(entry.created_at) + '</p>' +
          '<p class="message">' + MPP.escapeHtml(entry.message) + '</p>' +
        '</div>'
      );
    }).join('');
  };

  MPP.rootPath = function (path) {
    const root = window.MPP_ROOT || '';
    const cleanPath = path.replace(/^\//, '');
    if (!root) {
      return cleanPath;
    }
    return root.replace(/\/$/, '') + '/' + cleanPath;
  };

  MPP.postUrl = function (post) {
    if (post && post.url) {
      return post.url;
    }
    if (post && post.page_folder) {
      return 'blog_pages/' + post.page_folder + '/';
    }
    return 'blog.html';
  };

  MPP.nl2br = function (text) {
    return MPP.escapeHtml(text).replace(/\n/g, '<br>');
  };

  MPP.renderBlogList = function (posts, containerId, options) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const opts = options || {};

    if (!posts.length) {
      container.innerHTML = '<p class="small center">Пока нет записей в блоге. Скоро что-нибудь напишу! ✍️</p>';
      return;
    }

    container.innerHTML = posts.map(function (post) {
      const url = MPP.postUrl(post);
      const readMore = opts.compact
        ? ''
        : '<p><a href="' + url + '" class="page-link">Читать далее →</a></p>';

      return (
        '<article class="blog-entry">' +
          '<h3 class="blog-title"><a href="' + url + '">' + MPP.escapeHtml(post.title) + '</a></h3>' +
          '<p class="blog-meta">📅 ' + MPP.escapeHtml(post.created_at) + '</p>' +
          '<p class="blog-excerpt">' + MPP.escapeHtml(post.excerpt || '') + '</p>' +
          readMore +
        '</article>'
      );
    }).join('');
  };

  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const el = document.getElementById('clock');
    if (el) el.textContent = h + ':' + m + ':' + s;
  }

  function renderHitCounter(total) {
    const digits = String(total).padStart(6, '0').split('');
    const counter = document.getElementById('hit-counter');
    const visitor = document.getElementById('visitor-count');

    if (counter) {
      counter.innerHTML = digits.map(function (d) {
        return '<span>' + d + '</span>';
      }).join('');
    }
    if (visitor) {
      visitor.textContent = String(total).padStart(6, '0');
    }
  }

  async function updateHitCounter() {
    try {
      const response = await fetch(MPP.rootPath('counter.php'), { credentials: 'same-origin' });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Не удалось загрузить счётчик');
      }

      renderHitCounter(data.total);
    } catch (err) {
      renderHitCounter(0);
      console.warn('Счётчик недоступен:', err.message);
    }
  }

  function updateStatus() {
    const hour = new Date().getHours();
    const el = document.getElementById('status-text');
    if (!el) return;

    if (hour >= 0 && hour < 7) {
      el.textContent = 'сплю 😴';
    } else if (hour >= 7 && hour < 12) {
      el.textContent = 'пью кофе ☕';
    } else if (hour >= 12 && hour < 18) {
      el.textContent = 'в сети 🟢';
    } else if (hour >= 18 && hour < 23) {
      el.textContent = 'кодю 💻';
    } else {
      el.textContent = 'засыпаю 🌙';
    }
  }

  function updateColorOfDay() {
    const colors = [
      { hex: '#FF0000', name: 'Красный' },
      { hex: '#FF8800', name: 'Оранжевый' },
      { hex: '#FFFF00', name: 'Жёлтый' },
      { hex: '#00FF00', name: 'Зелёный' },
      { hex: '#00FFFF', name: 'Бирюзовый' },
      { hex: '#0088FF', name: 'Голубой' },
      { hex: '#8800FF', name: 'Фиолетовый' },
      { hex: '#FF00FF', name: 'Розовый' },
      { hex: '#FF6699', name: 'Малиновый' },
      { hex: '#FFD700', name: 'Золотой' }
    ];

    const day = new Date().getDate();
    const color = colors[day % colors.length];
    const swatch = document.querySelector('.color-swatch');
    const nameEl = document.getElementById('color-name');

    if (swatch) swatch.style.background = color.hex;
    if (nameEl) nameEl.textContent = color.name + ' ' + color.hex;
  }

  function renderCalendar() {
    const el = document.getElementById('calendar');
    if (!el) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    const monthNames = [
      'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
      'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
    ];
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    const firstDay = new Date(year, month, 1);
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = '<table><tr>';
    dayNames.forEach(function (d) {
      html += '<th>' + d + '</th>';
    });
    html += '</tr><tr>';

    for (let i = 0; i < startDay; i++) {
      html += '<td></td>';
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayOfWeek = (startDay + d - 1) % 7;
      if (d > 1 && dayOfWeek === 0) html += '</tr><tr>';
      const cls = d === today ? ' class="today"' : '';
      html += '<td' + cls + '>' + d + '</td>';
    }

    html += '</tr></table>';
    html += '<p class="small center" style="margin-top:4px">' + monthNames[month] + ' ' + year + '</p>';

    el.innerHTML = html;
  }

  MPP.initCommon = function () {
    updateClock();
    updateHitCounter();
    updateStatus();
    updateColorOfDay();
    renderCalendar();

    setInterval(updateClock, 1000);
    setInterval(updateStatus, 60000);
  };

  MPP.initCommon();
})();
