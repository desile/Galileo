# mypersonalpage.ru

Old school персональная домашняя страница в стиле 90-х / начала 2000-х.

## Запуск

Откройте `index.html` в браузере или запустите локальный сервер:

```bash
python3 -m http.server 8080
```

Затем откройте http://localhost:8080

## Структура

- `index.html` — главная страница
- `blog.html` — список записей блога
- `blog_pages/<папка>/` — полноценная страница записи (PHP + JS)
- `blog_pages/_template/` — шаблон для новых записей
- `guestbook.html` — гостевая книга
- `style.css` — ретро-стили
- `common.js` — общие виджеты (часы, счётчик, календарь, блог)
- `script.js` — логика главной (превью гостевой и блога)
- `blog.js` — логика списка блога
- `guestbook.js` — логика страницы гостевой
- `blog.php` — API блога
- `guestbook.php` — API гостевой книги
- `lib/db.php` — подключение к MySQL
- `db_config.php` — учётные данные БД (не в git)
- `schema.sql` — SQL-схема таблицы

## Особенности

- Marquee-баннеры
- Мигающий текст
- Табличная вёрстка
- Счётчик посещений (MySQL + cookie, без учёта перезагрузок)
- Гостевая книга
- Блог (записи в MySQL)
- Webring
- «Сейчас играет» с эквалайзером
- Звёздный фон

Best viewed at 800×600 🖥️

## Деплой по FTP

1. Скопируйте конфиг и заполните данные хостинга:

```bash
cp .env.example .env
```

2. Установите `lftp` (рекомендуется):

```bash
brew install lftp
```

3. Запустите деплой:

```bash
chmod +x deploy.sh
./deploy.sh
```

Проверка без загрузки:

```bash
./deploy.sh --dry-run
```

Скрипт загружает `index.html`, `style.css`, `script.js`, PHP-файлы и `.htaccess` в каталог, указанный в `FTP_REMOTE_DIR`.

## Гостевая книга (MySQL)

1. Создайте конфиг БД:

```bash
cp db_config.example.php db_config.php
```

2. Заполните `db_config.php` данными MySQL с хостинга.

3. Выполните SQL в phpMyAdmin:

```bash
# содержимое файла schema.sql
```

4. Задеплойте и проверьте раздел «Гостевая» на сайте.

## Счётчик посещений

Счётчик хранится в MySQL и не увеличивается при перезагрузке страницы.

Режим уникальности задаётся в `counter.php` константой `VISITOR_MODE`:

| Режим | Поведение |
|-------|-----------|
| `day` | Один визит в сутки с браузера (по cookie) |
| `session` | Один визит до закрытия браузера |
| `week` | Один визит в 7 дней |
| `ip_day` | Cookie + не считать повтор с того же IP за сутки |

По умолчанию включён режим `day`.

## Блог (MySQL + папки blog_pages)

Каждая запись — отдельная папка в `blog_pages/` со своим `index.php`, `script.js` и любым другим контентом. В MySQL хранятся только метаданные и ссылка на папку.

### Новая установка

Выполните блок `blog_posts` из `schema.sql`.

### Миграция со старой схемы

Если таблица уже была с колонкой `content`, выполните `schema_migration_blog_pages.sql`.

### Добавить новую запись

1. Скопируйте шаблон:

```bash
cp -R blog_pages/_template blog_pages/moj-post
```

2. Отредактируйте `blog_pages/moj-post/index.php` и `script.js`.

3. Добавьте строку в MySQL (`title` и дата подтянутся на страницу автоматически):

```sql
INSERT INTO blog_posts (title, slug, page_folder, excerpt, is_published)
VALUES (
  'Заголовок записи',
  'moj-post',
  'moj-post',
  'Краткое описание для списка',
  1
);
```

4. Задеплойте: `./deploy.sh`

Ссылка на запись: `blog_pages/moj-post/`
