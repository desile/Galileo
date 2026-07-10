<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/lib/db.php';

/**
 * Режимы уникальности посетителя:
 *
 * session  — один визит до закрытия браузера (session cookie)
 * day      — один визит в сутки с одного браузера (рекомендуется)
 * week     — один визит в 7 дней
 * ip_day   — cookie как в day + не считать повтор с того же IP за сутки
 */
const VISITOR_MODE = 'day';

const COOKIE_NAME = 'mpp_vid';
const COOKIE_PATH = '/';
const IP_SALT = 'mypersonalpage.ru-visits';

function jsonResponse(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getCookieOptions(int $maxAge): array
{
    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['SERVER_PORT']) && (int) $_SERVER['SERVER_PORT'] === 443);

    return [
        'expires'  => $maxAge > 0 ? time() + $maxAge : 0,
        'path'     => COOKIE_PATH,
        'secure'   => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ];
}

function getVisitorTtlSeconds(): int
{
    switch (VISITOR_MODE) {
        case 'session':
            return 0;
        case 'week':
            return 7 * 24 * 60 * 60;
        case 'day':
        case 'ip_day':
        default:
            return 24 * 60 * 60;
    }
}

function generateVisitorToken(): string
{
    return bin2hex(random_bytes(32));
}

function hashIp(): ?string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? '';
    if ($ip === '') {
        return null;
    }

    return hash('sha256', IP_SALT . '|' . $ip);
}

function formatCount(int $count): string
{
    return str_pad((string) $count, 6, '0', STR_PAD_LEFT);
}

function getTotalVisits(PDO $db): int
{
    $stmt = $db->query('SELECT total_visits FROM site_stats WHERE id = 1');
    $row = $stmt->fetch();

    return $row ? (int) $row['total_visits'] : 0;
}

function isKnownVisitor(PDO $db, string $token, int $ttlSeconds): bool
{
    if ($token === '') {
        return false;
    }

    $stmt = $db->prepare(
        'SELECT last_visit
         FROM visitor_log
         WHERE visitor_token = :token
         LIMIT 1'
    );
    $stmt->execute([':token' => $token]);
    $row = $stmt->fetch();

    if (!$row) {
        return false;
    }

    if ($ttlSeconds === 0) {
        return true;
    }

    $lastVisit = strtotime($row['last_visit']);
    if ($lastVisit === false) {
        return false;
    }

    return (time() - $lastVisit) < $ttlSeconds;
}

function hasRecentIpVisit(PDO $db, string $ipHash): bool
{
    $stmt = $db->prepare(
        'SELECT id
         FROM visitor_log
         WHERE ip_hash = :ip_hash
           AND last_visit >= DATE_SUB(NOW(), INTERVAL 1 DAY)
         LIMIT 1'
    );
    $stmt->execute([':ip_hash' => $ipHash]);

    return (bool) $stmt->fetch();
}

function touchVisitor(PDO $db, string $token): void
{
    $stmt = $db->prepare(
        'UPDATE visitor_log
         SET last_visit = NOW()
         WHERE visitor_token = :token'
    );
    $stmt->execute([':token' => $token]);
}

function saveVisitor(PDO $db, string $token, ?string $ipHash, bool $incrementTotal): void
{
    $stmt = $db->prepare(
        'INSERT INTO visitor_log (visitor_token, ip_hash, first_visit, last_visit)
         VALUES (:token, :ip_hash, NOW(), NOW())
         ON DUPLICATE KEY UPDATE last_visit = NOW()'
    );
    $stmt->execute([
        ':token'   => $token,
        ':ip_hash' => $ipHash,
    ]);

    if ($incrementTotal) {
        $db->exec('UPDATE site_stats SET total_visits = total_visits + 1 WHERE id = 1');
    }
}

try {
    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
        jsonResponse(['success' => false, 'error' => 'Метод не поддерживается'], 405);
    }

    $db = getDb();
    $ttlSeconds = getVisitorTtlSeconds();
    $cookieToken = $_COOKIE[COOKIE_NAME] ?? '';
    $ipHash = hashIp();
    $isNewVisit = false;

    if (isKnownVisitor($db, $cookieToken, $ttlSeconds)) {
        touchVisitor($db, $cookieToken);
    } else {
        $shouldCount = true;

        if (VISITOR_MODE === 'ip_day' && $ipHash !== null && hasRecentIpVisit($db, $ipHash)) {
            $shouldCount = false;
        }

        $token = $cookieToken !== '' ? $cookieToken : generateVisitorToken();
        setcookie(COOKIE_NAME, $token, getCookieOptions($ttlSeconds));

        if ($shouldCount) {
            $isNewVisit = true;
            saveVisitor($db, $token, $ipHash, true);
        } else {
            saveVisitor($db, $token, $ipHash, false);
        }
    }

    $total = getTotalVisits($db);

    jsonResponse([
        'success'      => true,
        'total'        => $total,
        'total_label'  => formatCount($total),
        'is_new_visit' => $isNewVisit,
        'mode'         => VISITOR_MODE,
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
