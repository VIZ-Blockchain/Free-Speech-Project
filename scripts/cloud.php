<?php
/**
 * Cloud Sync API - Passwordless Authentication with VIZ Blockchain
 * 
 * This script provides a cloud synchronization service using VIZ blockchain
 * signatures for authentication. No passwords, no account creation - users
 * prove ownership by signing messages with their VIZ private key.
 * 
 * Authentication Methods:
 *   1. Direct signature - Each request signed individually (most secure)
 *   2. Session-based - First request creates session, subsequent use session ID
 * 
 * API Actions:
 *   - session:     Create authenticated session from signature
 *   - activity:    Get last activity timestamp and update ID
 *   - get_updates: Retrieve updates since last sync
 *   - put_update:  Store new update (subscribe, backup, ignore, etc.)
 * 
 * Request Format:
 *   POST with JSON body containing:
 *   - action: The operation to perform
 *   - session: Session ID (for session-based auth)
 *   - OR data + signature: Signed data (for direct signature auth)
 * 
 * Data Format for Signing:
 *   {domain}:{operation}:{account}:{timestamp}:{nonce}
 *   Example: "readdle.me:login:myaccount:1709510400:abc123"
 * 
 * @author Free-Speech-Project
 * @version 1.0.0
 * @see https://github.com/viz-cx/viz-php-lib for VIZ Auth library
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Configuration array - customize for your deployment
 * In production, move sensitive values to environment variables or config file
 */
$CONFIG = [
    // VIZ blockchain node for signature verification
    'viz_node' => 'https://node.viz.plus/',
    
    // Domain identifier for signature verification
    // This should match what clients sign in their data string
    'auth_domain' => 'readdle.me',
    
    // Session time-to-live in seconds (10 minutes default)
    // Shorter = more secure, longer = better UX
    'session_ttl' => 60 * 10,
    
    // Database configuration
    // In production, use environment variables: getenv('DB_HOST')
    'db_host' => 'localhost',
    'db_user' => 'readdle',
    'db_pass' => '',
    'db_name' => 'readdle',
    'db_charset' => 'utf8mb4',
    
    // Rate limiting (requests per minute per account)
    // Set to 0 to disable
    'rate_limit' => 60,
    
    // Maximum data size for updates (bytes)
    'max_update_size' => 1024 * 1024,  // 1 MB
];

/**
 * Update type definitions
 * Maps type IDs to human-readable names
 * Extend this array to add new operation types
 */
$UPDATE_TYPES = [
    1 => 'backup',          // Full data backup (replaces all previous updates)
    2 => 'subscribe',       // Subscribe to account
    3 => 'reset',           // Unsubscribe from account
    4 => 'ignore',          // Ignore account
    5 => 'pin_hashtag',     // Pin hashtag to feed
    6 => 'reset_hashtag',   // Unpin hashtag
    7 => 'ignore_hashtag',  // Ignore hashtag
    // Add new types here:
    // 8 => 'bookmark',
    // 9 => 'list_add',
];

// =============================================================================
// ERROR HANDLING & CORS
// =============================================================================

// Suppress PHP errors in output (log them instead in production)
error_reporting(0);
// In development, enable errors:
// error_reporting(E_ALL);
// ini_set('display_errors', 1);

/**
 * Handle CORS preflight requests
 * Browsers send OPTIONS request before actual request to check permissions
 */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    header('Access-Control-Allow-Headers: DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Origin: *');  // In production, specify allowed origins
    header('Access-Control-Expose-Headers: Content-Length');
    header('Access-Control-Max-Age: 86400');   // Cache preflight for 24 hours
    exit;
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Load VIZ authentication library
// This provides signature verification against VIZ blockchain
include('./class/autoloader.php');

// Initialize VIZ Auth with node URL and domain
$viz_auth = new VIZ\Auth($CONFIG['viz_node'], $CONFIG['auth_domain']);

// Parse incoming JSON request
$request_raw = file_get_contents('php://input');
$request = json_decode($request_raw, true);

// Validate JSON parsing
if ($request === null && !empty($request_raw)) {
    send_response([
        'auth' => false,
        'error' => true,
        'message' => 'Invalid JSON in request body'
    ], 400);
}

// Initialize database connection
$db = mysqli_connect(
    $CONFIG['db_host'],
    $CONFIG['db_user'],
    $CONFIG['db_pass']
);

if (!$db) {
    send_response([
        'auth' => false,
        'error' => true,
        'message' => 'Database connection failed'
    ], 500);
}

mysqli_select_db($db, $CONFIG['db_name']);
mysqli_set_charset($db, $CONFIG['db_charset']);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Send JSON response with appropriate headers
 * 
 * @param array $data Response data
 * @param int $code HTTP status code (default 200)
 */
function send_response($data, $code = 200) {
    http_response_code($code);
    header('Access-Control-Allow-Origin: *');
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Escape string for database query
 * 
 * @param mysqli $db Database connection
 * @param string $str String to escape
 * @return string Escaped string
 */
function db_escape($db, $str) {
    return mysqli_real_escape_string($db, $str);
}

/**
 * Validate account name format
 * VIZ accounts: 3-16 chars, lowercase letters, numbers, dots, hyphens
 * 
 * @param string $account Account name to validate
 * @return bool True if valid
 */
function is_valid_account($account) {
    return preg_match('/^[a-z][a-z0-9.-]{2,15}$/', $account);
}

/**
 * Clean expired sessions from database
 * Called periodically to prevent table bloat
 * 
 * @param mysqli $db Database connection
 */
function cleanup_expired_sessions($db) {
    // Only cleanup 1% of the time to reduce overhead
    if (rand(1, 100) === 1) {
        @mysqli_query($db, "DELETE FROM `session` WHERE `time` < " . time());
    }
}

// =============================================================================
// AUTHENTICATION
// =============================================================================

$auth_status = false;
$account = false;
$response = [];

/**
 * Method 1: Session-based authentication
 * Client provides session ID from previous signature-based auth
 * Faster for multiple operations, but less secure than per-request signatures
 */
if (isset($request['session']) && !empty($request['session'])) {
    // Lookup session in database
    // Sessions stored as binary for efficiency (UNHEX converts hex string to binary)
    $session_id = db_escape($db, $request['session']);
    $query = mysqli_query($db, 
        "SELECT `account` FROM `session` 
         WHERE `id` = UNHEX('{$session_id}') 
         AND `time` > " . time()
    );
    $row = @mysqli_fetch_assoc($query);
    
    if (isset($row['account'])) {
        // Valid session found
        $account = $row['account'];
        $auth_status = true;
    } else {
        // Session expired or invalid - client should re-authenticate
        $response['session'] = '';
        $response['expire'] = -1;
        $response['error'] = true;
        $response['result'] = false;
        $response['message'] = 'Session expired or invalid';
        $auth_status = false;
    }
}

/**
 * Method 2: Direct signature authentication
 * Client signs data with VIZ private key, server verifies against blockchain
 * Most secure - each request independently verified
 */
if (isset($request['signature']) && isset($request['data'])) {
    // Verify signature using VIZ Auth library
    // This checks the signature against account's public keys on blockchain
    $auth_status = $viz_auth->check($request['data'], $request['signature']);
    
    if ($auth_status) {
        // Extract account from signed data
        // Data format: {domain}:{operation}:{account}:{timestamp}:{nonce}
        $data_parts = explode(':', $request['data']);
        if (count($data_parts) >= 3) {
            $account = $data_parts[2];
            
            // Validate account name format
            if (!is_valid_account($account)) {
                $auth_status = false;
                $response['error'] = true;
                $response['message'] = 'Invalid account name format';
            }
        } else {
            $auth_status = false;
            $response['error'] = true;
            $response['message'] = 'Invalid data format';
        }
    }
}

// Include auth status in response
$response['auth'] = $auth_status;

// =============================================================================
// ACTION HANDLING
// =============================================================================

if ($auth_status) {
    $error = false;
    $action = $request['action'] ?? '';
    
    // Cleanup old sessions periodically
    cleanup_expired_sessions($db);
    
    // -------------------------------------------------------------------------
    // ACTION: Create Session
    // Converts signature-based auth into session for subsequent requests
    // -------------------------------------------------------------------------
    if ($action === 'session') {
        // Generate session ID from signed data (deterministic, unique per signature)
        $session_id = md5($request['data'] . $request['signature']);
        $expire_time = time() + $CONFIG['session_ttl'];
        
        // Store session in database
        // Using REPLACE to handle session refresh gracefully
        @mysqli_query($db, 
            "REPLACE INTO `session` (`id`, `account`, `time`) 
             VALUES (UNHEX('{$session_id}'), '{$account}', '{$expire_time}')"
        );
        
        $response['session'] = $session_id;
        $response['expire'] = $expire_time;
        $response['ttl'] = $CONFIG['session_ttl'];
    }
    
    // -------------------------------------------------------------------------
    // ACTION: Get Activity
    // Returns last activity timestamp and update ID for sync decisions
    // -------------------------------------------------------------------------
    else if ($action === 'activity') {
        $query = mysqli_query($db, 
            "SELECT * FROM `activity` 
             WHERE `account` = '" . db_escape($db, $account) . "' 
             LIMIT 1"
        );
        $row = @mysqli_fetch_assoc($query);
        
        if ($row === null) {
            // No activity yet - new account
            $response['activity'] = 0;
            $response['update'] = 0;
        } else {
            $response['activity'] = (int)$row['time'];
            $response['update'] = (int)$row['update'];
        }
    }
    
    // -------------------------------------------------------------------------
    // ACTION: Get Updates
    // Retrieves all updates since specified activity time and update ID
    // Used for synchronizing client with server state
    // -------------------------------------------------------------------------
    else if ($action === 'get_updates') {
        $since_time = intval($request['activity'] ?? 0);
        $since_update = intval($request['update'] ?? 0);
        
        $result = [];
        $query = mysqli_query($db, 
            "SELECT * FROM `updates` 
             WHERE `account` = '" . db_escape($db, $account) . "' 
             AND `time` >= {$since_time}
             ORDER BY `id` ASC"
        );
        
        while ($row = @mysqli_fetch_assoc($query)) {
            // Only include updates after the specified update ID
            // This handles the edge case of multiple updates at same timestamp
            if ($row['id'] > $since_update) {
                $result[] = [
                    'id' => (int)$row['id'],
                    'time' => (int)$row['time'],
                    'type' => (int)$row['type'],
                    'value' => $row['data'],
                ];
            }
        }
        
        $response['result'] = $result;
        $response['count'] = count($result);
    }
    
    // -------------------------------------------------------------------------
    // ACTION: Put Update
    // Stores new update (subscribe, backup, ignore, etc.)
    // -------------------------------------------------------------------------
    else if ($action === 'put_update') {
        global $UPDATE_TYPES;
        
        $type = intval($request['type'] ?? 0);
        $value = $request['value'] ?? '';
        
        // Validate update type
        if (!isset($UPDATE_TYPES[$type])) {
            $error = true;
            $response['message'] = 'Invalid update type';
        }
        // Validate value size
        else if (strlen($value) > $CONFIG['max_update_size']) {
            $error = true;
            $response['message'] = 'Update value too large';
        }
        else {
            $current_time = time();
            
            // Insert the update
            $query = mysqli_query($db, 
                "INSERT INTO `updates` (`account`, `time`, `type`, `data`) 
                 VALUES (
                     '" . db_escape($db, $account) . "',
                     {$current_time},
                     {$type},
                     '" . db_escape($db, $value) . "'
                 )"
            );
            
            $last_id = mysqli_insert_id($db);
            
            // Special handling for backup type (type 1)
            // A new backup supersedes all previous updates
            if ($type === 1 && $last_id) {
                @mysqli_query($db, 
                    "DELETE FROM `updates` 
                     WHERE `account` = '" . db_escape($db, $account) . "' 
                     AND `id` < {$last_id}"
                );
            }
            
            // Update activity tracker
            $activity_query = mysqli_query($db, 
                "SELECT * FROM `activity` 
                 WHERE `account` = '" . db_escape($db, $account) . "' 
                 LIMIT 1"
            );
            $activity_row = @mysqli_fetch_assoc($activity_query);
            
            if ($activity_row === null) {
                // First update for this account
                mysqli_query($db, 
                    "INSERT INTO `activity` (`account`, `time`, `update`) 
                     VALUES ('" . db_escape($db, $account) . "', {$current_time}, {$last_id})"
                );
            } else {
                // Update existing activity record
                mysqli_query($db, 
                    "UPDATE `activity` 
                     SET `time` = {$current_time}, `update` = {$last_id} 
                     WHERE `account` = '" . db_escape($db, $account) . "' 
                     LIMIT 1"
                );
            }
            
            $response['result'] = [
                'activity' => $current_time,
                'update' => $last_id,
                'type_name' => $UPDATE_TYPES[$type],
            ];
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
}

// Include original request in response for debugging
// In production, consider removing this or making it optional
$response['request'] = $request;

// =============================================================================
// SEND RESPONSE
// =============================================================================

send_response($response);
