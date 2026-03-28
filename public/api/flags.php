<?php
/**
 * DS360 Feature Flags API
 * GET /api/flags.php — returns all currently enabled flags.
 * Requires valid session token (Authorization: Bearer <token>).
 *
 * A flag is enabled if:
 *   enabled = 1 AND (unlock_at IS NULL OR unlock_at <= NOW())
 */
require __DIR__ . '/config.php';

// Auth required — only logged-in users get flags
auth_user();

$stmt = db()->prepare("
    SELECT flag_key FROM feature_flags
    WHERE enabled = 1 AND (unlock_at IS NULL OR unlock_at <= NOW())
    ORDER BY flag_key
");
$stmt->execute();
$flags = $stmt->fetchAll(PDO::FETCH_COLUMN);

json_ok(['flags' => $flags]);
