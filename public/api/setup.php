<?php
/**
 * DS360 One-time Setup Script
 * Hit this URL once after deploying, then it self-deletes.
 * URL: https://ds360.imaginizedlabs.com/api/setup.php
 */
require __DIR__ . '/config.php';

header('Content-Type: text/plain');

$pdo = db();

// Create tables
$pdo->exec("
CREATE TABLE IF NOT EXISTS users (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    email            VARCHAR(255) NOT NULL UNIQUE,
    password_hash    VARCHAR(255) NOT NULL,
    first_name       VARCHAR(100) NOT NULL DEFAULT '',
    last_name        VARCHAR(100) NOT NULL DEFAULT '',
    status           ENUM('pending','active','suspended') NOT NULL DEFAULT 'pending',
    email_verified   TINYINT(1) NOT NULL DEFAULT 0,
    verify_token     VARCHAR(64),
    reset_token      VARCHAR(64),
    reset_expires    DATETIME,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");
echo "✓ users table ready\n";

$pdo->exec("
CREATE TABLE IF NOT EXISTS sessions (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    token      VARCHAR(64) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");
echo "✓ sessions table ready\n";

// Seed Ken's account
$hash = password_hash('PqvKi#nFATrvc4TIkc', PASSWORD_BCRYPT, ['cost' => 12]);
$stmt = $pdo->prepare("
    INSERT IGNORE INTO users (email, password_hash, first_name, last_name, status, email_verified)
    VALUES (?, ?, 'Kenneth', 'Ngo', 'active', 1)
");
$stmt->execute(['ken@samincsolutions.com', $hash]);
echo "✓ ken@samincsolutions.com seeded\n";

// Self-delete for security
unlink(__FILE__);
echo "✓ setup.php deleted — setup complete!\n";
