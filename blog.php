<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/lib/db.php';
require_once __DIR__ . '/lib/blog-post.php';

const POSTS_LIMIT = 50;
const BLOG_PAGES_DIR = __DIR__ . '/blog_pages';

function jsonResponse(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function postUrl(string $pageFolder): string
{
    return 'blog_pages/' . $pageFolder . '/';
}

function pageFolderExists(string $pageFolder): bool
{
    if (!isValidPageFolder($pageFolder)) {
        return false;
    }

    $path = BLOG_PAGES_DIR . '/' . $pageFolder;
    return is_dir($path) && (is_file($path . '/index.php') || is_file($path . '/index.html'));
}

function mapPostListRow(array $row): ?array
{
    $pageFolder = $row['page_folder'];

    if (!pageFolderExists($pageFolder)) {
        return null;
    }

    return [
        'id'          => (int) $row['id'],
        'title'       => $row['title'],
        'slug'        => $row['slug'],
        'page_folder' => $pageFolder,
        'url'         => postUrl($pageFolder),
        'excerpt'     => trim((string) ($row['excerpt'] ?? '')),
        'created_at'  => formatBlogDate($row['created_at']),
    ];
}

try {
    $db = getDb();

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
        jsonResponse(['success' => false, 'error' => 'Метод не поддерживается'], 405);
    }

    $limit = POSTS_LIMIT;
    if (isset($_GET['limit'])) {
        $limit = max(1, min(POSTS_LIMIT, (int) $_GET['limit']));
    }

    $stmt = $db->prepare(
        'SELECT id, title, slug, page_folder, excerpt, created_at
         FROM blog_posts
         WHERE is_published = 1
         ORDER BY created_at DESC
         LIMIT :limit'
    );
    $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();

    $posts = [];
    foreach ($stmt->fetchAll() as $row) {
        $mapped = mapPostListRow($row);
        if ($mapped !== null) {
            $posts[] = $mapped;
        }
    }

    jsonResponse([
        'success' => true,
        'posts'   => $posts,
    ]);
} catch (PDOException $e) {
    jsonResponse([
        'success' => false,
        'error'   => 'Ошибка базы данных. Выполните обновлённый schema.sql',
    ], 500);
} catch (Throwable $e) {
    jsonResponse([
        'success' => false,
        'error'   => 'Внутренняя ошибка сервера',
    ], 500);
}
