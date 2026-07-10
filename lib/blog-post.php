<?php
declare(strict_types=1);

require_once __DIR__ . '/db.php';

function formatBlogDate(string $datetime): string
{
    $timestamp = strtotime($datetime);
    if ($timestamp === false) {
        return $datetime;
    }

    return date('d.m.Y', $timestamp);
}

function isValidPageFolder(string $pageFolder): bool
{
    return $pageFolder !== '' && (bool) preg_match('/^[a-z0-9\-]+$/', $pageFolder);
}

function getBlogPostByFolder(string $pageFolder): ?array
{
    if (!isValidPageFolder($pageFolder)) {
        return null;
    }

    $db = getDb();
    $stmt = $db->prepare(
        'SELECT id, title, slug, page_folder, excerpt, created_at
         FROM blog_posts
         WHERE page_folder = :page_folder AND is_published = 1
         LIMIT 1'
    );
    $stmt->execute([':page_folder' => $pageFolder]);
    $row = $stmt->fetch();

    if (!$row) {
        return null;
    }

    return [
        'id'          => (int) $row['id'],
        'title'       => $row['title'],
        'slug'        => $row['slug'],
        'page_folder' => $row['page_folder'],
        'excerpt'     => trim((string) ($row['excerpt'] ?? '')),
        'created_at'  => formatBlogDate($row['created_at']),
    ];
}
