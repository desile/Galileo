// Главная страница — превью гостевой книги

(function () {
  'use strict';

  function escapeHtml(text) {
    if (window.MPP && MPP.escapeHtml) {
      return MPP.escapeHtml(text);
    }
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderPreview(entries) {
    const container = document.getElementById('guestbook-preview-entries');
    if (!container) return;

    if (!entries.length) {
      container.innerHTML = '<p class="small center">Пока нет записей. Будьте первым! ✍️</p>';
      return;
    }

    if (window.MPP && MPP.renderGuestbookEntries) {
      MPP.renderGuestbookEntries(entries, 'guestbook-preview-entries');
      return;
    }

    container.innerHTML = entries.map(function (entry) {
      return (
        '<div class="guestbook-entry">' +
          '<p><strong>' + escapeHtml(entry.name) + '</strong> — ' + escapeHtml(entry.created_at) + '</p>' +
          '<p class="message">' + escapeHtml(entry.message) + '</p>' +
        '</div>'
      );
    }).join('');
  }

  async function loadGuestbookPreview() {
    const container = document.getElementById('guestbook-preview-entries');
    if (!container) return;

    try {
      const response = await fetch('guestbook.php?limit=3', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Не удалось загрузить записи');
      }

      renderPreview(data.entries || []);
    } catch (err) {
      container.innerHTML = '<p class="small center error">Записи временно недоступны 😢</p>';
      console.error('Guestbook preview:', err);
    }
  }

  async function loadBlogPreview() {
    const container = document.getElementById('blog-preview-entries');
    if (!container) return;

    try {
      const response = await fetch('blog.php?limit=3', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Не удалось загрузить блог');
      }

      if (window.MPP && MPP.renderBlogList) {
        MPP.renderBlogList(data.posts || [], 'blog-preview-entries', { compact: true });
        return;
      }

      container.innerHTML = '<p class="small center error">Блог временно недоступен 😢</p>';
    } catch (err) {
      container.innerHTML = '<p class="small center error">Блог временно недоступен 😢</p>';
      console.error('Blog preview:', err);
    }
  }

  function initHomePage() {
    loadGuestbookPreview();
    loadBlogPreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomePage);
  } else {
    initHomePage();
  }
})();
