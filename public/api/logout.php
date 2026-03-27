<?php
require __DIR__ . '/config.php';

$token = bearer_token();
if ($token) {
    $stmt = db()->prepare('DELETE FROM sessions WHERE token = ?');
    $stmt->execute([$token]);
}
json_ok();
