<?php
/**
 * DS360 API — Configuration
 * Edit DB_* constants to match your cPanel database credentials.
 */

define('ALLOWED_DOMAIN', 'samincsolutions.com');
define('APP_URL',        'https://ds360.imaginizedlabs.com');
define('FROM_EMAIL',     'noreply@imaginizedlabs.com');
define('FROM_NAME',      'DS360 Portal');

// DB credentials loaded from env.php (stored ABOVE web root for security)
require __DIR__ . '/../../env.php';

define('TOKEN_BYTES',       32);   // session token length
define('RESET_TTL_MINUTES', 60);   // password reset link expiry
define('RATE_LIMIT_MAX',     5);   // max failed login attempts
define('RATE_LIMIT_WINDOW', 600);  // window in seconds (10 min)

// ── CORS ────────────────────────────────────────────────────────────
header('Access-Control-Allow-Origin: ' . APP_URL);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── DB connection ───────────────────────────────────────────────────
function db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
    }
    return $pdo;
}

// ── Helpers ─────────────────────────────────────────────────────────
function json_ok(array $data = []): void {
    echo json_encode(['ok' => true] + $data);
    exit;
}

function json_err(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}

function body(): array {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

function allowed_email(string $email): bool {
    $email = strtolower(trim($email));
    $suffix = '@' . ALLOWED_DOMAIN;
    return substr($email, -strlen($suffix)) === $suffix;
}

function random_token(): string {
    return bin2hex(random_bytes(TOKEN_BYTES));
}

function bearer_token(): ?string {
    $h = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (substr($h, 0, 7) === 'Bearer ') {
        return substr($h, 7);
    }
    return null;
}

function auth_user(): array {
    $token = bearer_token();
    if (!$token) json_err('Unauthorized', 401);

    $stmt = db()->prepare(
        'SELECT u.* FROM users u
         JOIN sessions s ON s.user_id = u.id
         WHERE s.token = ? AND u.status = "active" AND u.email_verified = 1'
    );
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$user) json_err('Unauthorized', 401);
    return $user;
}

// ── Rate limiting ────────────────────────────────────────────────────

function client_ip(): string {
    // Respect X-Forwarded-For behind cPanel proxy / CloudFlare
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        // Take the first (client) IP from the chain
        $parts = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        return trim($parts[0]);
    }
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

/**
 * Check if the IP has exceeded the failed-login threshold.
 * Also purges stale entries older than the window.
 */
function check_rate_limit(): void {
    $ip     = client_ip();
    $pdo    = db();
    $window = RATE_LIMIT_WINDOW;
    $max    = RATE_LIMIT_MAX;

    // Purge entries older than the window (keeps table small)
    $pdo->prepare('DELETE FROM login_attempts WHERE attempted_at < DATE_SUB(NOW(), INTERVAL ? SECOND)')
        ->execute([$window]);

    // Count recent failures for this IP
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) FROM login_attempts WHERE ip_address = ? AND attempted_at > DATE_SUB(NOW(), INTERVAL ? SECOND)'
    );
    $stmt->execute([$ip, $window]);
    $count = (int) $stmt->fetchColumn();

    if ($count >= $max) {
        json_err('Too many login attempts. Please try again in 10 minutes.', 429);
    }
}

/**
 * Record a failed login attempt for the current IP.
 */
function record_failed_login(): void {
    $ip   = client_ip();
    $stmt = db()->prepare('INSERT INTO login_attempts (ip_address) VALUES (?)');
    $stmt->execute([$ip]);
}
