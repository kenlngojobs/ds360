<?php
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_err('Method not allowed', 405);

$b = body();
$email      = strtolower(trim($b['email'] ?? ''));
$password   = $b['password'] ?? '';
$first_name = trim($b['firstName'] ?? '');
$last_name  = trim($b['lastName'] ?? '');

// Validate
if (!$email || !$password || !$first_name || !$last_name) {
    json_err('All fields are required.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_err('Invalid email address.');
}
if (!allowed_email($email)) {
    json_err('Only @' . ALLOWED_DOMAIN . ' email addresses may register.');
}
if (strlen($password) < 8) {
    json_err('Password must be at least 8 characters.');
}

// Check for existing account
$stmt = db()->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    json_err('An account with this email already exists.');
}

// Create user
$hash  = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
$token = random_token();

$stmt = db()->prepare("
    INSERT INTO users (email, password_hash, first_name, last_name, status, email_verified, verify_token)
    VALUES (?, ?, ?, ?, 'pending', 0, ?)
");
$stmt->execute([$email, $hash, $first_name, $last_name, $token]);

// Send verification email
$link    = APP_URL . '/?verify=' . $token;
$subject = 'Verify your DS360 account';
$body    = "Hi {$first_name},\n\nClick the link below to verify your email and activate your DS360 account:\n\n{$link}\n\nThis link does not expire.\n\n— DS360 Team";
$headers = "From: " . FROM_NAME . " <" . FROM_EMAIL . ">\r\nContent-Type: text/plain; charset=utf-8";

mail($email, $subject, $body, $headers);

json_ok(['message' => 'Check your email to verify your account.']);
