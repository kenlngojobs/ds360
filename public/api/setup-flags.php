<?php
/**
 * DS360 Feature Flags — One-time table setup
 * Hit this URL once: https://ds360.imaginizedlabs.com/api/setup-flags.php
 * Self-deletes after running.
 */
require __DIR__ . '/config.php';

header('Content-Type: text/plain');

$pdo = db();

$pdo->exec("
CREATE TABLE IF NOT EXISTS feature_flags (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    flag_key   VARCHAR(50) NOT NULL UNIQUE,
    label      VARCHAR(100) NOT NULL DEFAULT '',
    enabled    TINYINT(1) NOT NULL DEFAULT 0,
    unlock_at  DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");
echo "✓ feature_flags table ready\n";

// Seed flags for each module — all disabled by default
$flags = [
    ['module.home',               'Home module'],
    ['module.users',              'Users module'],
    ['module.partners',           'Partners module'],
    ['module.document-templates', 'Document Templates module'],
    ['module.account-treatment',  'Account Treatment module'],
    ['module.tags',               'Tags module'],
    ['module.category',           'Category module'],
    ['module.groups',             'Groups module'],
    ['module.messages',           'Messages module'],
    ['module.offerings',          'Offerings module'],
    ['module.my-deals',           'My Deals module'],
    ['module.post-sale',          'Post Sale module'],
    ['module.sam-documents',      'SAM Documents module'],
    ['module.notifications',      'Notifications module'],
    ['module.reports',            'Reports module'],
    ['module.settings',           'Settings module'],
    ['feature.template-export',   'Template PDF export'],
    ['feature.template-import',   'Template JSON import'],
    ['feature.user-management',   'Live user management (DB-backed)'],
];

$stmt = $pdo->prepare("INSERT IGNORE INTO feature_flags (flag_key, label, enabled) VALUES (?, ?, 0)");
foreach ($flags as [$key, $label]) {
    $stmt->execute([$key, $label]);
}

// Enable the three built modules by default
$pdo->exec("UPDATE feature_flags SET enabled = 1 WHERE flag_key IN ('module.users', 'module.document-templates', 'module.offerings')");

echo "✓ " . count($flags) . " flags seeded (users, document-templates, offerings enabled)\n";

unlink(__FILE__);
echo "✓ setup-flags.php deleted — done!\n";
