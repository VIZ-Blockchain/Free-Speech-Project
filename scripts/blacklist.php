<?php
/**
 * Blacklist API - Community Content Moderation Service
 *
 * This script provides a community-driven blacklist service for content moderation.
 * Users can report harmful content, moderators review via Telegram, and all clients
 * can sync the approved blacklist entries.
 *
 * Authentication: VIZ blockchain signatures (passwordless)
 * Moderation: Telegram bot integration for moderator review
 *
 * API Actions:
 *   - report:  Submit content report (requires VIZ signature)
 *   - updates: Get blacklist updates since timestamp (requires session)
 *
 * Report Flow:
 *   1. User reports content with VIZ signature
 *   2. Report stored with status=0 (pending)
 *   3. Telegram notification sent to moderator group
 *   4. Moderator approves → status=1 (enabled)
 *   5. Clients sync updates and hide flagged content
 *
 * @author Free-Speech-Project
 * @version 1.0.0
 */

// =============================================================================
// ERROR REPORTING
// =============================================================================

// Enable error reporting for debugging
// In production, set to 0 and log errors instead
error_reporting(255);
// error_reporting(0);
// ini_set('log_errors', 1);
// ini_set('error_log', '/var/log/blacklist_errors.log');

// =============================================================================
// CONFIGURATION
// =============================================================================

// Load configuration file with helper functions
include('config.php');

/**
 * Telegram Bot Configuration
 *
 * Create a bot via @BotFather on Telegram
 * Add bot to moderation group as admin
 */
$telegram_bot_username = 'viz_blacklist_bot';      // Bot username (without @)
$telegram_bot_api_key = '';                         // Bot API key from BotFather
$telegram_bot_gate = 'https://api.telegram.org/bot' . $telegram_bot_api_key . '/';
$telegram_bot_admin = '151842302';                  // Admin user ID for commands
$telegram_bot_public_group = '-1003079591070';     // Moderation group chat ID

/**
 * Database Configuration
 * In production, use environment variables or separate config file
 */
$mysql_user = 'readdle';
$mysql_password = '';
$mysql_database = 'readdle';

/**
 * VIZ Authentication Configuration
 *
 * viz_auth_domain: Domain included in signed data for verification
 * viz_api_node: VIZ blockchain API node for public key lookup
 */
$viz_auth_domain = 'readdle.me';
$viz_api_node = 'https://api.viz.world/';

/**
 * Session Configuration
 */
$session_ttl = 60 * 10;  // 10 minutes

/**
 * Blacklist Entry Types
 */
$BLACKLIST_TYPES = [
    0 => 'block',    // Block/hide content
    1 => 'unblock',  // Remove from blacklist
];

/*
SQL Schema:

CREATE TABLE `blacklist` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `account` VARCHAR(255) NOT NULL,      -- Reported VIZ account
    `block_id` INT(11) NOT NULL,          -- Content block number
    `type` INT(11) NOT NULL,              -- 0=block, 1=unblock
    `initiator` VARCHAR(255) NOT NULL,    -- Who submitted report
    `reason` VARCHAR(255) NOT NULL,       -- Reason for report
    `status` INT(11) NOT NULL DEFAULT 0,  -- 0=pending, 1=approved
    `time` INT(11) NOT NULL,              -- Unix timestamp
    PRIMARY KEY (`id`),
    KEY `time` (`time`),
    KEY `account` (`account`),
    KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
*/

// =============================================================================
// INITIALIZATION
// =============================================================================

/**
 * Load VIZ PHP library for signature verification
 * @see https://github.com/VIZ-Blockchain/viz-php-lib
 */
include('./class/autoloader.php');
$viz_auth = new VIZ\Auth($viz_api_node, $viz_auth_domain);

// Optimize for internal network (disable SSL verification if nodes are trusted)
// Remove this line in production with external nodes
$viz_auth->jsonrpc->check_ssl = false;

// =============================================================================
// CORS HANDLING
// =============================================================================

/**
 * Handle CORS preflight requests
 * Browsers send OPTIONS before actual request to check permissions
 */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    header('Access-Control-Allow-Headers: DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Origin: *');  // Restrict in production
    header('Access-Control-Expose-Headers: Content-Length');
    header('Access-Control-Max-Age: 86400');   // Cache preflight 24h
    exit;
}

// =============================================================================
// REQUEST PARSING
// =============================================================================

$response = [];

// Parse JSON request body
$request = file_get_contents('php://input');
$request_arr = json_decode($request, true);

// Validate JSON
if (JSON_ERROR_NONE !== json_last_error()) {
    $response['error'] = true;
    $response['result'] = false;
    $response['message'] = 'Invalid JSON in request body';
    send_json_response($response, 400);
}

// =============================================================================
// DATABASE CONNECTION
// =============================================================================

$db = mysqli_connect('localhost', $mysql_user, $mysql_password);

if (!$db) {
    $response['error'] = true;
    $response['result'] = false;
    $response['message'] = 'Database connection failed';
    send_json_response($response, 500);
}

mysqli_select_db($db, $mysql_database);
mysqli_set_charset($db, 'utf8mb4');

// =============================================================================
// AUTHENTICATION
// =============================================================================

$auth_status = false;
$account = false;

/**
 * Method 1: Session-based authentication
 * Use existing session from previous signature auth
 */
if (isset($request_arr['session']) && !empty($request_arr['session'])) {
    $session_id = mysqli_real_escape_string($db, $request_arr['session']);
    $query = mysqli_query($db,
        "SELECT `account` FROM `session`
         WHERE `id` = UNHEX('{$session_id}')
         AND `time` > " . time()
    );
    $row = @mysqli_fetch_assoc($query);

    if (isset($row['account'])) {
        $account = $row['account'];
        $auth_status = true;
    } else {
        // Session expired
        $response['session'] = '';
        $response['expire'] = -1;
        $response['error'] = true;
        $response['result'] = false;
        $response['message'] = 'Session expired';
        $auth_status = false;
    }
}

/**
 * Method 2: Direct signature authentication
 * Verify VIZ blockchain signature
 */
if (isset($request_arr['signature']) && isset($request_arr['data'])) {
    $auth_status = $viz_auth->check($request_arr['data'], $request_arr['signature']);

    if ($auth_status) {
        // Extract account from signed data
        // Format: {domain}:{operation}:{account}:{timestamp}:{nonce}
        $data_parts = explode(':', $request_arr['data']);
        if (count($data_parts) >= 3) {
            $account = $data_parts[2];
        }
    }
}

$response['auth'] = $auth_status;

// =============================================================================
// ACTION HANDLING
// =============================================================================

if ($auth_status) {
    $error = false;
    $action = $request_arr['action'] ?? '';

    // -------------------------------------------------------------------------
    // ACTION: Get Updates
    // Fetch blacklist entries since specified timestamp
    // Only returns approved entries (status=1)
    // -------------------------------------------------------------------------
    if ($action === 'updates') {
        $time = intval($request_arr['time'] ?? 0);
        $result = [];

        // Query approved blacklist entries since timestamp
        // Limit to 250 to prevent huge responses
        $query = mysqli_query($db,
            "SELECT * FROM `blacklist`
             WHERE `status` = 1
             AND `time` >= {$time}
             ORDER BY `time` ASC
             LIMIT 250"
        );

        while ($row = @mysqli_fetch_assoc($query)) {
            $result[] = [
                'account' => $row['account'],
                'block_id' => (int)$row['block_id'],
                'type' => (int)$row['type'],      // 0=block, 1=unblock
                'initiator' => $row['initiator'],
                'reason' => $row['reason'],
                'time' => (int)$row['time'],
            ];
        }

        $response['result'] = $result;
        $response['count'] = count($result);
    }

    // -------------------------------------------------------------------------
    // ACTION: Report Content
    // Submit a new report for moderation
    // -------------------------------------------------------------------------
    else if ($action === 'report') {
        // Security: Initiator must match authenticated account
        // This prevents users from submitting reports on behalf of others
        if ($account === $request_arr['initiator']) {

            // Validate required fields
            $report_account = mysqli_real_escape_string($db, $request_arr['account'] ?? '');
            $block_id = intval($request_arr['block_id'] ?? 0);
            $reason = mysqli_real_escape_string($db, $request_arr['reason'] ?? '');
            $initiator = mysqli_real_escape_string($db, $request_arr['initiator'] ?? '');

            if (empty($report_account) || $block_id <= 0) {
                $error = true;
                $response['message'] = 'Invalid account or block_id';
            } else {
                $time = time();

                // Insert report with status=0 (pending moderation)
                $query = mysqli_query($db,
                    "INSERT INTO `blacklist`
                     (`account`, `block_id`, `type`, `initiator`, `reason`, `status`, `time`)
                     VALUES
                     ('{$report_account}', {$block_id}, 0, '{$initiator}', '{$reason}', 0, {$time})"
                );

                $last_id = mysqli_insert_id($db);

                $response['result'] = [
                    'id' => $last_id,
                    'time' => $time,
                    'status' => 'pending_moderation'
                ];

                // -----------------------------------------------------------------
                // Send notification to Telegram moderation group
                // -----------------------------------------------------------------
                $debug = false;

                // Build notification message with link to content
                $content_link = "https://readdle.me/#viz://@{$report_account}/{$block_id}/";
                $viz_link = "viz://@{$report_account}/{$block_id}/";

                $html = "[{$last_id}] <b>New Report</b>\n\n";
                $html .= "Content: <a href='{$content_link}'>{$viz_link}</a>\n";
                $html .= "Reported by: @{$initiator}\n";
                $html .= "Reason: {$reason}";

                // URL encode for Telegram API
                $telegram_data = [
                    'chat_id' => $telegram_bot_public_group,
                    'text' => urlencode($html),
                    'parse_mode' => 'HTML',
                    'disable_web_page_preview' => 'false'
                ];

                // Send notification (retry once on failure)
                $tg_result = telegram_method('sendMessage', $telegram_data, $debug);
                if (!$tg_result) {
                    // Second attempt
                    telegram_method('sendMessage', $telegram_data, $debug);
                }
            }
        } else {
            // Initiator doesn't match authenticated account
            $error = true;
            $response['message'] = 'Initiator must match authenticated account';
        }
    }

    // -------------------------------------------------------------------------
    // ACTION: Unknown
    // -------------------------------------------------------------------------
    else {
        $error = true;
        $response['message'] = 'Unknown action: ' . $action;
    }

    // Handle errors
    if ($error) {
        $response['error'] = true;
        $response['result'] = false;
    }

    // Include request for debugging (remove in production)
    $response['request'] = $request_arr;
}
else {
    // Not authenticated
    $response['request'] = $request_arr;
}

// =============================================================================
// SEND RESPONSE
// =============================================================================

send_json_response($response);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Send JSON response with CORS headers
 *
 * @param array $data Response data
 * @param int $code HTTP status code
 */
function send_json_response($data, $code = 200) {
    http_response_code($code);
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
