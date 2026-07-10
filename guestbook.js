// Страница гостевой книги

(function () {
  'use strict';

  function setGuestbookStatus(message, type) {
    const el = document.getElementById('guestbook-status');
    if (!el) return;

    el.textContent = message;
    el.className = 'guestbook-status' + (type ? ' ' + type : '');
  }

  async function loadGuestbook() {
    const container = document.getElementById('guestbook-entries');
    if (!container) return;

    try {
      const response = await fetch('guestbook.php');
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Не удалось загрузить записи');
      }

      MPP.renderGuestbookEntries(data.entries || [], 'guestbook-entries');
    } catch (err) {
      container.innerHTML = '<p class="small center error">Гостевая временно недоступна 😢</p>';
      setGuestbookStatus(err.message, 'error');
    }
  }

  function initGuestbookForm() {
    const form = document.getElementById('guestbook-form');
    if (!form) return;

    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      const nameInput = document.getElementById('guestbook-name');
      const messageInput = document.getElementById('guestbook-message');
      const submitBtn = document.getElementById('guestbook-submit');

      const name = nameInput.value.trim();
      const message = messageInput.value.trim();

      if (!name || !message) {
        setGuestbookStatus('Заполните имя и сообщение', 'error');
        return;
      }

      submitBtn.disabled = true;
      setGuestbookStatus('Отправка...', '');

      try {
        const response = await fetch('guestbook.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name, message: message }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Не удалось отправить сообщение');
        }

        nameInput.value = '';
        messageInput.value = '';
        setGuestbookStatus('Сообщение добавлено! Спасибо! 🎉', 'success');
        await loadGuestbook();
      } catch (err) {
        setGuestbookStatus(err.message, 'error');
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  loadGuestbook();
  initGuestbookForm();
})();
