<?php
require __DIR__ . '/config.php';

$token = trim($_GET['token'] ?? '');
if (!$token) json_err('Missing token.');

$stmt = db()->prepare("SELECT id FROM users WHERE verify_token = ? AND email_verified = 0");
$stmt->execute([$token]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) json_err('Invalid or already-used verification link.');

$stmt = db()->prepare("UPDATE users SET email_verified = 1, status = 'active', verify_token = NULL WHERE id = ?");
$stmt->execute([$user['id']]);

json_ok(['message' => 'Email verified. You can now log in.']);
