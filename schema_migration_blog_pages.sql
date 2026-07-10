-- Миграция блога на папки blog_pages/
-- Выполните в phpMyAdmin, если blog_posts уже существовала со старой схемой

ALTER TABLE blog_posts ADD COLUMN page_folder VARCHAR(200) NOT NULL DEFAULT '' AFTER slug;
UPDATE blog_posts SET page_folder = slug WHERE page_folder = '';
ALTER TABLE blog_posts DROP COLUMN content;
ALTER TABLE blog_posts ADD UNIQUE KEY uk_page_folder (page_folder);
