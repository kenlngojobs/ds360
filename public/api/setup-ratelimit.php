<?php
/**
 * DS360 Rate Limiting — One-time table setup
 * Hit this URL once: https://ds360.imaginizedlabs.com/api/setup-ratelimit.php
 * Self-deletes after running.
 */
require __DIR__ . '/config.php';

header('Content-Type: text/plain');

$pdo = db();

$pdo->exec("
CREATE TABLE IF NOT EXISTS login_attempts (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    ip_address    VARCHAR(45) NOT NULL,
    attempted_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip_time (ip_address, attempted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");
echo "✓ login_attempts table ready\n";

unlink(__FILE__);
echo "✓ setup-ratelimit.php deleted — done!\n";
