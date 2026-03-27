<?php
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_err('Method not allowed', 405);

$b        = body();
$email    = strtolower(trim($b['email'] ?? ''));
$password = $b['password'] ?? '';

if (!$email || !$password) json_err('Email and password are required.');
if (!allowed_email($email))  json_err('Only @' . ALLOWED_DOMAIN . ' accounts are allowed.');

$stmt = db()->prepare('SELECT * FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Constant-time failure to prevent user enumeration
if (!$user || !password_verify($password, $user['password_hash'])) {
    json_err('Incorrect email or password.');
}
if (!$user['email_verified']) {
    json_err('Please verify your email before logging in. Check your inbox.');
}
if ($user['status'] !== 'active') {
    json_err('Your account is ' . $user['status'] . '. Contact your administrator.');
}

// Issue session token
$token = random_token();
$stmt  = db()->prepare('INSERT INTO sessions (user_id, token) VALUES (?, ?)');
$stmt->execute([$user['id'], $token]);

json_ok([
    'token'     => $token,
    'firstName' => $user['first_name'],
    'lastName'  => $user['last_name'],
    'email'     => $user['email'],
]);
