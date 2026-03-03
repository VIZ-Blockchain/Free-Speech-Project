-- =============================================================================
-- Cloud Sync Database Schema
-- Passwordless Authentication with VIZ Blockchain
-- =============================================================================
-- 
-- This schema supports the cloud sync API with:
-- - Session management (signature-derived sessions)
-- - Activity tracking (last sync timestamps)
-- - Update storage (subscriptions, backups, etc.)
--
-- Usage:
--   mysql -u root -p < cloud_schema.sql
--
-- @author Free-Speech-Project
-- @version 1.0.0
-- =============================================================================

-- Create database if not exists
-- CREATE DATABASE IF NOT EXISTS `readdle` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE `readdle`;

-- =============================================================================
-- SESSION TABLE
-- Stores active authentication sessions
-- =============================================================================
-- Sessions are derived from MD5(data + signature), stored as binary for efficiency
-- Automatically cleaned up when expired

CREATE TABLE IF NOT EXISTS `session` (
    -- Session ID: MD5 hash stored as binary (16 bytes vs 32 chars)
    `id` BINARY(16) NOT NULL,
    
    -- VIZ account name that owns this session
    `account` VARCHAR(64) NOT NULL,
    
    -- Expiration timestamp (Unix epoch)
    `time` INT UNSIGNED NOT NULL,
    
    PRIMARY KEY (`id`),
    
    -- Index for cleanup queries
    INDEX `idx_time` (`time`),
    
    -- Index for account lookups (if needed)
    INDEX `idx_account` (`account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- ACTIVITY TABLE
-- Tracks last activity per account for efficient sync checks
-- =============================================================================
-- Client can quickly check if there are new updates by comparing
-- their local activity timestamp with server's

CREATE TABLE IF NOT EXISTS `activity` (
    -- VIZ account name (primary key - one entry per account)
    `account` VARCHAR(64) NOT NULL,
    
    -- Last activity timestamp (Unix epoch)
    `time` INT UNSIGNED NOT NULL DEFAULT 0,
    
    -- Last update ID (for precise sync positioning)
    `update` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    
    PRIMARY KEY (`account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- UPDATES TABLE
-- Stores all sync updates (subscriptions, backups, ignored, etc.)
-- =============================================================================
-- Each update has a type and associated data
-- Backup type (1) is special - it replaces all previous updates

CREATE TABLE IF NOT EXISTS `updates` (
    -- Auto-incrementing ID for ordering
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    
    -- VIZ account that owns this update
    `account` VARCHAR(64) NOT NULL,
    
    -- Timestamp when update was created (Unix epoch)
    `time` INT UNSIGNED NOT NULL,
    
    -- Update type ID:
    -- 1 = backup (full data, replaces previous)
    -- 2 = subscribe
    -- 3 = unsubscribe (reset)
    -- 4 = ignore
    -- 5 = pin_hashtag
    -- 6 = unpin_hashtag (reset_hashtag)
    -- 7 = ignore_hashtag
    `type` TINYINT UNSIGNED NOT NULL,
    
    -- Update data (account name, hashtag, or JSON backup)
    `data` MEDIUMTEXT,
    
    PRIMARY KEY (`id`),
    
    -- Index for fetching updates by account and time
    INDEX `idx_account_time` (`account`, `time`),
    
    -- Index for fetching updates by account and ID (for precise sync)
    INDEX `idx_account_id` (`account`, `id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- OPTIONAL: Rate limiting table
-- =============================================================================
-- Uncomment if you want to implement rate limiting

/*
CREATE TABLE IF NOT EXISTS `rate_limit` (
    `account` VARCHAR(64) NOT NULL,
    `minute` INT UNSIGNED NOT NULL,
    `requests` SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    PRIMARY KEY (`account`, `minute`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
*/

-- =============================================================================
-- MAINTENANCE PROCEDURES
-- =============================================================================

-- Procedure to clean up expired sessions
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS `cleanup_sessions`()
BEGIN
    DELETE FROM `session` WHERE `time` < UNIX_TIMESTAMP();
END //
DELIMITER ;

-- Event to run cleanup daily (requires event_scheduler = ON)
-- SET GLOBAL event_scheduler = ON;
/*
CREATE EVENT IF NOT EXISTS `cleanup_sessions_event`
ON SCHEDULE EVERY 1 DAY
DO CALL cleanup_sessions();
*/

-- =============================================================================
-- SAMPLE QUERIES
-- =============================================================================

-- Get session by ID:
-- SELECT `account` FROM `session` WHERE `id` = UNHEX('abc123...') AND `time` > UNIX_TIMESTAMP();

-- Create session:
-- INSERT INTO `session` (`id`, `account`, `time`) VALUES (UNHEX('abc123...'), 'myaccount', UNIX_TIMESTAMP() + 600);

-- Get activity:
-- SELECT * FROM `activity` WHERE `account` = 'myaccount';

-- Get updates since timestamp/ID:
-- SELECT * FROM `updates` WHERE `account` = 'myaccount' AND `time` >= 1709510400 AND `id` > 42 ORDER BY `id`;

-- Insert update:
-- INSERT INTO `updates` (`account`, `time`, `type`, `data`) VALUES ('myaccount', UNIX_TIMESTAMP(), 2, 'someuser');

-- Delete old updates after backup (type=1):
-- DELETE FROM `updates` WHERE `account` = 'myaccount' AND `id` < 100;
