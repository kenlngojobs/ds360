<?php
/**
 * DS360 Nightly Database Backup
 *
 * Exports all tables as a timestamped .sql file to /home/imaginizedlabs/ds360/backups/.
 * Protected by a secret key — must be passed as ?key=<BACKUP_SECRET>.
 * Retains the last 7 backups and auto-purges older files.
 *
 * cPanel Cron (runs daily at 2:00 AM server time):
 *   /usr/local/bin/php /home/imaginizedlabs/ds360/dist/api/backup.php --cron
 *
 * Or via wget:
 *   wget -q -O /dev/null "https://ds360.imaginizedlabs.com/api/backup.php?key=YOUR_SECRET"
 */
require __DIR__ . '/config.php';

// ── Auth: CLI cron bypass or secret key ──────────────────────────────
define('BACKUP_SECRET', 'ds360-backup-9f3a7c2e1d');
define('BACKUP_DIR',    '/home/imaginizedlabs/ds360/backups');
define('KEEP_DAYS',     7);

$is_cli = (php_sapi_name() === 'cli');

if (!$is_cli) {
    $key = $_GET['key'] ?? '';
    if ($key !== BACKUP_SECRET) {
        json_err('Forbidden', 403);
    }
}

// ── Ensure backup directory exists ───────────────────────────────────
if (!is_dir(BACKUP_DIR)) {
    mkdir(BACKUP_DIR, 0750, true);
}

// ── Tables to export ─────────────────────────────────────────────────
$tables = ['users', 'sessions', 'feature_flags', 'login_attempts'];

$pdo       = db();
$timestamp = date('Y-m-d_His');
$filename  = "ds360_backup_{$timestamp}.sql";
$filepath  = BACKUP_DIR . '/' . $filename;

$output = [];
$output[] = "-- DS360 Database Backup";
$output[] = "-- Generated: " . date('Y-m-d H:i:s T');
$output[] = "-- Tables: " . implode(', ', $tables);
$output[] = "";
$output[] = "SET NAMES utf8mb4;";
$output[] = "SET FOREIGN_KEY_CHECKS = 0;";
$output[] = "";

foreach ($tables as $table) {
    // Get CREATE TABLE statement
    $stmt = $pdo->query("SHOW CREATE TABLE `{$table}`");
    $row  = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) continue;

    $output[] = "-- ────────────────────────────────────────────────";
    $output[] = "-- Table: {$table}";
    $output[] = "-- ────────────────────────────────────────────────";
    $output[] = "DROP TABLE IF EXISTS `{$table}`;";
    $output[] = $row['Create Table'] . ";";
    $output[] = "";

    // Export rows
    $rows = $pdo->query("SELECT * FROM `{$table}`");
    $cols = null;

    while ($data = $rows->fetch(PDO::FETCH_ASSOC)) {
        if ($cols === null) {
            $cols = array_keys($data);
            $colList = '`' . implode('`, `', $cols) . '`';
        }

        $values = [];
        foreach ($data as $val) {
            if ($val === null) {
                $values[] = 'NULL';
            } else {
                $values[] = $pdo->quote($val);
            }
        }

        $output[] = "INSERT INTO `{$table}` ({$colList}) VALUES (" . implode(', ', $values) . ");";
    }

    $output[] = "";
}

$output[] = "SET FOREIGN_KEY_CHECKS = 1;";
$output[] = "";
$output[] = "-- End of backup";

// ── Write the file ───────────────────────────────────────────────────
$sql = implode("\n", $output);
$bytes = file_put_contents($filepath, $sql);

if ($bytes === false) {
    $msg = "ERROR: Failed to write backup to {$filepath}";
    if ($is_cli) { echo $msg . "\n"; exit(1); }
    json_err($msg, 500);
}

// ── Purge old backups (keep last KEEP_DAYS) ──────────────────────────
$files = glob(BACKUP_DIR . '/ds360_backup_*.sql');
if ($files) {
    // Sort oldest first
    usort($files, function ($a, $b) { return filemtime($a) - filemtime($b); });

    $excess = count($files) - KEEP_DAYS;
    for ($i = 0; $i < $excess; $i++) {
        unlink($files[$i]);
    }
}

// ── Report ───────────────────────────────────────────────────────────
$size_kb = round($bytes / 1024, 1);
$kept    = min(count($files), KEEP_DAYS);
$purged  = max(0, count($files) - KEEP_DAYS);

$report = "✓ Backup saved: {$filename} ({$size_kb} KB)\n"
        . "✓ {$kept} backups retained, {$purged} purged\n"
        . "✓ Path: {$filepath}";

if ($is_cli) {
    echo $report . "\n";
    exit(0);
}

header('Content-Type: text/plain');
echo $report;
