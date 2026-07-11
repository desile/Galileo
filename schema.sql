-- Таблица гостевой книги для mypersonalpage.ru
-- Выполните в phpMyAdmin или через консоль MySQL

CREATE TABLE IF NOT EXISTS guestbook (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(30) NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Счётчик посещений
CREATE TABLE IF NOT EXISTS site_stats (
    id TINYINT UNSIGNED PRIMARY KEY,
    total_visits INT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO site_stats (id, total_visits) VALUES (1, 0);

CREATE TABLE IF NOT EXISTS visitor_log (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    visitor_token CHAR(64) NOT NULL,
    ip_hash CHAR(64) NULL,
    first_visit DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_visit DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_visitor_token (visitor_token),
    INDEX idx_last_visit (last_visit),
    INDEX idx_ip_last_visit (ip_hash, last_visit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Блог: MySQL хранит метаданные, контент — в папке blog_pages/<page_folder>/
CREATE TABLE IF NOT EXISTS blog_posts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    page_folder VARCHAR(200) NOT NULL,
    excerpt TEXT NULL,
    is_published TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_slug (slug),
    UNIQUE KEY uk_page_folder (page_folder),
    INDEX idx_published_created (is_published, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO blog_posts (id, title, slug, page_folder, excerpt, is_published) VALUES (
    1,
    'Мой сайт снова в сети!',
    'site-is-back',
    'site-is-back',
    'Запустил блог на mypersonalpage.ru — сыграйте в сапёр и узнайте историю игры!',
    1
);

INSERT IGNORE INTO blog_posts (id, title, slug, page_folder, excerpt, is_published) VALUES (
    2,
    'Tower Defense Windows 95!',
    'tower-defense',
    'tower-defense',
    'Пиксельная башенная оборона в стиле Win95 — три башни, десять волн, серая рамка как в 1995-м!',
    1
);
