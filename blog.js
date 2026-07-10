// Страница списка записей блога

(function () {
  'use strict';

  async function loadBlogPosts() {
    const container = document.getElementById('blog-entries');
    if (!container) return;

    try {
      const response = await fetch('blog.php', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Не удалось загрузить записи');
      }

      MPP.renderBlogList(data.posts || [], 'blog-entries');
    } catch (err) {
      container.innerHTML = '<p class="small center error">Блог временно недоступен 😢</p>';
      console.error('Blog list:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadBlogPosts);
  } else {
    loadBlogPosts();
  }
})();
