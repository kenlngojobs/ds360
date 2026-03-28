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
