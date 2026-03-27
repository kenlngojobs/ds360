<?php
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_err('Method not allowed', 405);

$b        = body();
$token    = trim($b['token'] ?? '');
$password = $b['password'] ?? '';

if (!$token)              json_err('Missing reset token.');
if (strlen($password) < 8) json_err('Password must be at least 8 characters.');

$stmt = db()->prepare("
    SELECT id FROM users
    WHERE reset_token = ? AND reset_expires > NOW() AND status = 'active'
");
$stmt->execute([$token]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) json_err('Reset link is invalid or has expired. Please request a new one.');

$hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
$stmt = db()->prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?');
$stmt->execute([$hash, $user['id']]);

// Invalidate all existing sessions for this user
$stmt = db()->prepare('DELETE FROM sessions WHERE user_id = ?');
$stmt->execute([$user['id']]);

json_ok(['message' => 'Password updated. You can now log in.']);
