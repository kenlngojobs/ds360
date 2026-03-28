-- DS360 Auth Schema
-- Run this in cPanel → phpMyAdmin after creating your database.
-- OR just hit https://ds360.imaginizedlabs.com/api/setup.php once (it self-deletes).

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

CREATE TABLE IF NOT EXISTS sessions (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    token      VARCHAR(64) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS feature_flags (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    flag_key   VARCHAR(50) NOT NULL UNIQUE,
    label      VARCHAR(100) NOT NULL DEFAULT '',
    enabled    TINYINT(1) NOT NULL DEFAULT 0,
    unlock_at  DATETIME DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
