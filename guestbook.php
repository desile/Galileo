<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/lib/db.php';

const MAX_NAME_LENGTH = 30;
const MAX_MESSAGE_LENGTH = 500;
const ENTRIES_LIMIT = 50;

function jsonResponse(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function readInput(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    if (stripos($contentType, 'application/json') !== false) {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw ?: '', true);
        return is_array($data) ? $data : [];
    }

    return $_POST;
}

function formatDate(string $datetime): string
{
    $timestamp = strtotime($datetime);
    if ($timestamp === false) {
        return $datetime;
    }

    return date('d.m.Y', $timestamp);
}

function validateEntry(string $name, string $message): ?string
{
    if ($name === '') {
        return 'Укажите имя';
    }

    if (mb_strlen($name) > MAX_NAME_LENGTH) {
        return 'Имя не должно быть длиннее ' . MAX_NAME_LENGTH . ' символов';
    }

    if ($message === '') {
        return 'Напишите сообщение';
    }

    if (mb_strlen($message) > MAX_MESSAGE_LENGTH) {
        return 'Сообщение не должно быть длиннее ' . MAX_MESSAGE_LENGTH . ' символов';
    }

    return null;
}

try {
    $db = getDb();
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    if ($method === 'GET') {
        $limit = ENTRIES_LIMIT;
        if (isset($_GET['limit'])) {
            $limit = max(1, min(ENTRIES_LIMIT, (int) $_GET['limit']));
        }

        $stmt = $db->prepare(
            'SELECT id, name, message, created_at
             FROM guestbook
             ORDER BY created_at DESC
             LIMIT :limit'
        );
        $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();

        $entries = array_map(static function (array $row): array {
            return [
                'id'         => (int) $row['id'],
                'name'       => $row['name'],
                'message'    => $row['message'],
                'created_at' => formatDate($row['created_at']),
            ];
        }, $stmt->fetchAll());

        jsonResponse([
            'success' => true,
            'entries' => $entries,
        ]);
    }

    if ($method === 'POST') {
        $input = readInput();
        $name = trim((string) ($input['name'] ?? ''));
        $message = trim((string) ($input['message'] ?? ''));

        $error = validateEntry($name, $message);
        if ($error !== null) {
            jsonResponse(['success' => false, 'error' => $error], 400);
        }

        $stmt = $db->prepare(
            'INSERT INTO guestbook (name, message, created_at)
             VALUES (:name, :message, NOW())'
        );
        $stmt->execute([
            ':name'    => $name,
            ':message' => $message,
        ]);

        jsonResponse([
            'success' => true,
            'entry'   => [
                'id'         => (int) $db->lastInsertId(),
                'name'       => $name,
                'message'    => $message,
                'created_at' => formatDate(date('Y-m-d H:i:s')),
            ],
        ], 201);
    }

    jsonResponse(['success' => false, 'error' => 'Метод не поддерживается'], 405);
} catch (PDOException $e) {
    jsonResponse([
        'success' => false,
        'error'   => 'Ошибка базы данных. Проверьте db_config.php и выполните schema.sql',
    ], 500);
} catch (Throwable $e) {
    jsonResponse([
        'success' => false,
        'error'   => 'Внутренняя ошибка сервера',
    ], 500);
}
