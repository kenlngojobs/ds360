<?php
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_err('Method not allowed', 405);

$b     = body();
$email = strtolower(trim($b['email'] ?? ''));

if (!$email) json_err('Email is required.');
if (!allowed_email($email)) json_err('Only @' . ALLOWED_DOMAIN . ' accounts are allowed.');

// Always return success to prevent user enumeration
$stmt = db()->prepare('SELECT id, first_name FROM users WHERE email = ? AND status = "active" AND email_verified = 1');
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    $token   = random_token();
    $expires = date('Y-m-d H:i:s', strtotime('+' . RESET_TTL_MINUTES . ' minutes'));

    $stmt = db()->prepare('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?');
    $stmt->execute([$token, $expires, $user['id']]);

    $link    = APP_URL . '/?reset=' . $token;
    $subject = 'Reset your DS360 password';
    $body    = "Hi {$user['first_name']},\n\nClick the link below to reset your password. It expires in " . RESET_TTL_MINUTES . " minutes:\n\n{$link}\n\nIf you didn't request this, ignore this email.\n\n— DS360 Team";
    $headers = "From: " . FROM_NAME . " <" . FROM_EMAIL . ">\r\nContent-Type: text/plain; charset=utf-8";

    mail($email, $subject, $body, $headers);
}

json_ok(['message' => 'If that email is registered, a reset link has been sent.']);
