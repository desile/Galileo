<?php
declare(strict_types=1);

require_once __DIR__ . '/../../lib/blog-post.php';

$root = '../..';
$assetVersion = '9';

$trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 2);
$callerFile = $trace[1]['file'] ?? $trace[0]['file'] ?? __DIR__;
$pageFolder = basename(dirname($callerFile));
$postMeta = getBlogPostByFolder($pageFolder);

if ($postMeta === null) {
    http_response_code(404);
    $pageTitle = 'Запись не найдена';
    $pageDate = '';
} else {
    $pageTitle = $postMeta['title'];
    $pageDate = $postMeta['created_at'];
}
