<?php
/**
 * Decentralized File Hub for Free-Speech-Project
 *
 * Self-hosted file storage with VIZ blockchain signature authentication.
 * No accounts, no passwords - just crypto signatures.
 *
 * Authentication Flow:
 * 1. Client requests challenge: GET /hub.php?action=challenge&account=username
 * 2. Hub returns random challenge string
 * 3. Client signs challenge with VIZ private key
 * 4. Client sends signed request with signature header
 *
 * API Routes:
 *   GET  ?action=challenge&account={account}     - Get auth challenge
 *   POST ?action=upload                          - Upload file (multipart)
 *   GET  ?action=status&upload_id={id}           - Get upload status
 *   GET  ?action=metadata&file_id={id}           - Get file metadata
 *   GET  ?action=download&file_id={id}           - Download file
 *   GET  ?action=list&account={account}          - List account files
 *   DELETE ?action=delete&file_id={id}           - Delete file
 *   GET  ?action=hub_info                        - Hub information
 *
 * @author Free-Speech-Project
 * @version 1.0.0
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

$CONFIG = [
    // Hub identity
    'hub_name' => 'Free-Speech Hub',
    'hub_version' => '1.0.0',
    'hub_operator' => '@your-viz-account',

    // VIZ node for signature verification
    'viz_node' => 'https://viz.lexa.host/',

    // Storage paths
    'storage_path' => __DIR__ . '/storage/files/',
    'metadata_path' => __DIR__ . '/storage/metadata/',
    'challenges_path' => __DIR__ . '/storage/challenges/',
    'uploads_path' => __DIR__ . '/storage/uploads/',

    // Limits
    'max_file_size' => 100 * 1024 * 1024,  // 100 MB
    'max_storage_per_account' => 1024 * 1024 * 1024,  // 1 GB per account
    'challenge_ttl' => 300,  // 5 minutes
    'chunk_size' => 5 * 1024 * 1024,  // 5 MB chunks for resumable uploads

    // Allowed file types (empty = all)
    'allowed_types' => [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        'video/mp4', 'video/webm', 'video/ogg',
        'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm',
        'application/pdf', 'text/plain', 'application/json',
    ],

    // CORS
    'cors_origins' => '*',
];

// =============================================================================
// INITIALIZATION
// =============================================================================

// Create storage directories
foreach (['storage_path', 'metadata_path', 'challenges_path', 'uploads_path'] as $dir) {
    if (!is_dir($CONFIG[$dir])) {
        mkdir($CONFIG[$dir], 0755, true);
    }
}

// CORS headers
header('Access-Control-Allow-Origin: ' . $CONFIG['cors_origins']);
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-VIZ-Account, X-VIZ-Signature, X-VIZ-Challenge');
header('Access-Control-Expose-Headers: X-Upload-ID, X-File-ID, X-Challenge');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function json_response($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function error_response($code, $message, $details = null) {
    $response = [
        'success' => false,
        'error' => [
            'code' => $code,
            'message' => $message
        ]
    ];
    if ($details) $response['error']['details'] = $details;
    json_response($response, $code);
}

function success_response($data, $code = 200) {
    json_response(array_merge(['success' => true], $data), $code);
}

/**
 * Generate cryptographically secure challenge
 */
function generate_challenge($account) {
    global $CONFIG;

    $challenge = bin2hex(random_bytes(32));
    $timestamp = time();
    $challenge_data = [
        'challenge' => $challenge,
        'account' => $account,
        'created' => $timestamp,
        'expires' => $timestamp + $CONFIG['challenge_ttl'],
        'hub' => $CONFIG['hub_name']
    ];

    // Store challenge
    $challenge_file = $CONFIG['challenges_path'] . md5($account . $challenge) . '.json';
    file_put_contents($challenge_file, json_encode($challenge_data), LOCK_EX);

    return $challenge_data;
}

/**
 * Verify VIZ signature against challenge
 *
 * The client signs: "hub:{hub_name}:challenge:{challenge}:account:{account}"
 */
function verify_viz_signature($account, $challenge, $signature) {
    global $CONFIG;

    // Load challenge data
    $challenge_file = $CONFIG['challenges_path'] . md5($account . $challenge) . '.json';
    if (!file_exists($challenge_file)) {
        return ['valid' => false, 'error' => 'Challenge not found or expired'];
    }

    $challenge_data = json_decode(file_get_contents($challenge_file), true);

    // Check expiry
    if (time() > $challenge_data['expires']) {
        unlink($challenge_file);
        return ['valid' => false, 'error' => 'Challenge expired'];
    }

    // Build message that was signed
    $message = "hub:{$CONFIG['hub_name']}:challenge:{$challenge}:account:{$account}";

    // Verify signature using VIZ node
    $verify_result = verify_signature_via_viz($account, $message, $signature);

    if ($verify_result['valid']) {
        // Delete used challenge (one-time use)
        unlink($challenge_file);
    }

    return $verify_result;
}

/**
 * Verify signature via VIZ blockchain API
 */
function verify_signature_via_viz($account, $message, $signature) {
    global $CONFIG;

    // Get account public keys from blockchain
    $account_data = viz_api_call('get_accounts', [[$account]]);

    if (empty($account_data) || empty($account_data[0])) {
        return ['valid' => false, 'error' => 'Account not found on VIZ blockchain'];
    }

    $public_keys = [];

    // Collect all account keys (regular, active, master)
    if (isset($account_data[0]['regular_authority']['key_auths'])) {
        foreach ($account_data[0]['regular_authority']['key_auths'] as $key_auth) {
            $public_keys[] = $key_auth[0];
        }
    }
    if (isset($account_data[0]['active_authority']['key_auths'])) {
        foreach ($account_data[0]['active_authority']['key_auths'] as $key_auth) {
            $public_keys[] = $key_auth[0];
        }
    }
    if (isset($account_data[0]['master_authority']['key_auths'])) {
        foreach ($account_data[0]['master_authority']['key_auths'] as $key_auth) {
            $public_keys[] = $key_auth[0];
        }
    }
    // Also check memo key
    if (isset($account_data[0]['memo_key'])) {
        $public_keys[] = $account_data[0]['memo_key'];
    }

    if (empty($public_keys)) {
        return ['valid' => false, 'error' => 'No public keys found for account'];
    }

    // Verify signature against each public key
    // Note: In production, use proper VIZ signature verification library
    // This is a simplified version - implement proper ECDSA verification
    $verified = verify_ecdsa_signature($message, $signature, $public_keys);

    return $verified;
}

/**
 * VIZ API call helper
 */
function viz_api_call($method, $params = []) {
    global $CONFIG;

    $request = [
        'jsonrpc' => '2.0',
        'method' => $method,
        'params' => $params,
        'id' => 1
    ];

    $ch = curl_init($CONFIG['viz_node']);
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($request),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT => 10
    ]);

    $response = curl_exec($ch);
    curl_close($ch);

    if (!$response) {
        return null;
    }

    $data = json_decode($response, true);
    return $data['result'] ?? null;
}

/**
 * Verify ECDSA signature
 * Note: Implement proper VIZ/Graphene signature verification
 * This requires the viz-js-lib or similar crypto library ported to PHP
 */
function verify_ecdsa_signature($message, $signature, $public_keys) {
    // TODO: Implement proper VIZ signature verification
    // For now, return a placeholder that should be replaced with real implementation
    //
    // Options:
    // 1. Use PHP secp256k1 extension
    // 2. Shell out to Node.js viz-js-lib
    // 3. Implement Graphene signature verification in PHP
    // 4. Use external verification service

    // Placeholder - REPLACE WITH REAL IMPLEMENTATION
    // In production, verify the signature cryptographically

    // For development/testing, you can use a simple verification endpoint
    // or implement the full Graphene signature scheme

    return [
        'valid' => true,  // UNSAFE! Replace with real verification
        'warning' => 'Signature verification not fully implemented - use in development only'
    ];
}

/**
 * Get authentication from request headers
 */
function get_auth_from_headers() {
    $account = $_SERVER['HTTP_X_VIZ_ACCOUNT'] ?? null;
    $signature = $_SERVER['HTTP_X_VIZ_SIGNATURE'] ?? null;
    $challenge = $_SERVER['HTTP_X_VIZ_CHALLENGE'] ?? null;

    return [
        'account' => $account,
        'signature' => $signature,
        'challenge' => $challenge
    ];
}

/**
 * Require authentication
 */
function require_auth() {
    $auth = get_auth_from_headers();

    if (!$auth['account'] || !$auth['signature'] || !$auth['challenge']) {
        error_response(401, 'Authentication required', [
            'required_headers' => ['X-VIZ-Account', 'X-VIZ-Signature', 'X-VIZ-Challenge']
        ]);
    }

    $verify = verify_viz_signature($auth['account'], $auth['challenge'], $auth['signature']);

    if (!$verify['valid']) {
        error_response(401, 'Invalid signature', ['reason' => $verify['error'] ?? 'Verification failed']);
    }

    return $auth['account'];
}

/**
 * Generate unique file ID
 */
function generate_file_id() {
    return bin2hex(random_bytes(16));
}

/**
 * Generate unique upload ID
 */
function generate_upload_id() {
    return 'upload_' . bin2hex(random_bytes(12));
}

/**
 * Get file metadata
 */
function get_file_metadata($file_id) {
    global $CONFIG;
    $meta_file = $CONFIG['metadata_path'] . $file_id . '.json';
    if (!file_exists($meta_file)) {
        return null;
    }
    return json_decode(file_get_contents($meta_file), true);
}

/**
 * Save file metadata
 */
function save_file_metadata($file_id, $metadata) {
    global $CONFIG;
    $meta_file = $CONFIG['metadata_path'] . $file_id . '.json';
    file_put_contents($meta_file, json_encode($metadata, JSON_PRETTY_PRINT), LOCK_EX);
}

/**
 * Get account storage usage
 */
function get_account_storage_usage($account) {
    global $CONFIG;

    $total = 0;
    $files = glob($CONFIG['metadata_path'] . '*.json');

    foreach ($files as $meta_file) {
        $metadata = json_decode(file_get_contents($meta_file), true);
        if ($metadata && $metadata['account'] === $account) {
            $total += $metadata['size'] ?? 0;
        }
    }

    return $total;
}

// =============================================================================
// API ROUTES
// =============================================================================

$action = $_GET['action'] ?? $_POST['action'] ?? 'hub_info';

switch ($action) {

    // =========================================================================
    // GET CHALLENGE - No auth required
    // =========================================================================
    case 'challenge':
        $account = $_GET['account'] ?? null;
        if (!$account) {
            error_response(400, 'Account parameter required');
        }

        // Validate account exists on VIZ
        $account_data = viz_api_call('get_accounts', [[$account]]);
        if (empty($account_data) || empty($account_data[0])) {
            error_response(404, 'Account not found on VIZ blockchain');
        }

        $challenge_data = generate_challenge($account);

        header('X-Challenge: ' . $challenge_data['challenge']);
        success_response([
            'challenge' => $challenge_data['challenge'],
            'expires' => $challenge_data['expires'],
            'expires_in' => $challenge_data['expires'] - time(),
            'sign_message' => "hub:{$CONFIG['hub_name']}:challenge:{$challenge_data['challenge']}:account:{$account}",
            'instructions' => 'Sign the sign_message with your VIZ private key and include in X-VIZ-Signature header'
        ]);
        break;

    // =========================================================================
    // UPLOAD FILE - Auth required
    // =========================================================================
    case 'upload':
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            error_response(405, 'POST method required');
        }

        $account = require_auth();

        // Check if file was uploaded
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            $error_messages = [
                UPLOAD_ERR_INI_SIZE => 'File exceeds server limit',
                UPLOAD_ERR_FORM_SIZE => 'File exceeds form limit',
                UPLOAD_ERR_PARTIAL => 'File partially uploaded',
                UPLOAD_ERR_NO_FILE => 'No file uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'Server temp directory missing',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file',
                UPLOAD_ERR_EXTENSION => 'Upload blocked by extension'
            ];
            $error_code = $_FILES['file']['error'] ?? UPLOAD_ERR_NO_FILE;
            error_response(400, 'Upload failed', $error_messages[$error_code] ?? 'Unknown error');
        }

        $file = $_FILES['file'];

        // Check file size
        if ($file['size'] > $CONFIG['max_file_size']) {
            error_response(413, 'File too large', [
                'max_size' => $CONFIG['max_file_size'],
                'file_size' => $file['size']
            ]);
        }

        // Check content type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime_type = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);

        if (!empty($CONFIG['allowed_types']) && !in_array($mime_type, $CONFIG['allowed_types'])) {
            error_response(415, 'File type not allowed', [
                'detected_type' => $mime_type,
                'allowed_types' => $CONFIG['allowed_types']
            ]);
        }

        // Check account storage quota
        $current_usage = get_account_storage_usage($account);
        if ($current_usage + $file['size'] > $CONFIG['max_storage_per_account']) {
            error_response(507, 'Storage quota exceeded', [
                'current_usage' => $current_usage,
                'max_storage' => $CONFIG['max_storage_per_account'],
                'file_size' => $file['size']
            ]);
        }

        // Generate file ID and save
        $file_id = generate_file_id();
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $stored_name = $file_id . ($extension ? '.' . $extension : '');
        $stored_path = $CONFIG['storage_path'] . $stored_name;

        if (!move_uploaded_file($file['tmp_name'], $stored_path)) {
            error_response(500, 'Failed to store file');
        }

        // Calculate hash
        $file_hash = hash_file('sha256', $stored_path);

        // Save metadata
        $metadata = [
            'file_id' => $file_id,
            'account' => $account,
            'original_name' => $file['name'],
            'stored_name' => $stored_name,
            'mime_type' => $mime_type,
            'size' => $file['size'],
            'sha256' => $file_hash,
            'uploaded' => time(),
            'downloads' => 0,
            'public' => $_POST['public'] ?? true,
            'description' => $_POST['description'] ?? null
        ];

        save_file_metadata($file_id, $metadata);

        header('X-File-ID: ' . $file_id);
        success_response([
            'file_id' => $file_id,
            'sha256' => $file_hash,
            'size' => $file['size'],
            'mime_type' => $mime_type,
            'download_url' => "?action=download&file_id={$file_id}",
            'metadata_url' => "?action=metadata&file_id={$file_id}"
        ], 201);
        break;

    // =========================================================================
    // GET UPLOAD STATUS (for resumable uploads)
    // =========================================================================
    case 'status':
        $upload_id = $_GET['upload_id'] ?? null;
        if (!$upload_id) {
            error_response(400, 'upload_id parameter required');
        }

        $status_file = $CONFIG['uploads_path'] . $upload_id . '.json';
        if (!file_exists($status_file)) {
            error_response(404, 'Upload not found');
        }

        $status = json_decode(file_get_contents($status_file), true);
        success_response(['upload' => $status]);
        break;

    // =========================================================================
    // GET FILE METADATA - Public files don't require auth
    // =========================================================================
    case 'metadata':
        $file_id = $_GET['file_id'] ?? null;
        if (!$file_id) {
            error_response(400, 'file_id parameter required');
        }

        $metadata = get_file_metadata($file_id);
        if (!$metadata) {
            error_response(404, 'File not found');
        }

        // Check access
        if (!$metadata['public']) {
            $account = require_auth();
            if ($account !== $metadata['account']) {
                error_response(403, 'Access denied');
            }
        }

        // Don't expose internal paths
        unset($metadata['stored_name']);

        success_response(['file' => $metadata]);
        break;

    // =========================================================================
    // DOWNLOAD FILE - Public files don't require auth
    // =========================================================================
    case 'download':
        $file_id = $_GET['file_id'] ?? null;
        if (!$file_id) {
            error_response(400, 'file_id parameter required');
        }

        $metadata = get_file_metadata($file_id);
        if (!$metadata) {
            error_response(404, 'File not found');
        }

        // Check access for private files
        if (!$metadata['public']) {
            $account = require_auth();
            if ($account !== $metadata['account']) {
                error_response(403, 'Access denied');
            }
        }

        $file_path = $CONFIG['storage_path'] . $metadata['stored_name'];
        if (!file_exists($file_path)) {
            error_response(404, 'File data not found');
        }

        // Update download counter
        $metadata['downloads']++;
        $metadata['last_download'] = time();
        save_file_metadata($file_id, $metadata);

        // Send file
        header('Content-Type: ' . $metadata['mime_type']);
        header('Content-Length: ' . $metadata['size']);
        header('Content-Disposition: inline; filename="' . addslashes($metadata['original_name']) . '"');
        header('X-Content-SHA256: ' . $metadata['sha256']);
        header('Cache-Control: public, max-age=31536000');

        readfile($file_path);
        exit;
        break;

    // =========================================================================
    // LIST ACCOUNT FILES - Auth required
    // =========================================================================
    case 'list':
        $account = require_auth();

        $files = [];
        $meta_files = glob($CONFIG['metadata_path'] . '*.json');

        foreach ($meta_files as $meta_file) {
            $metadata = json_decode(file_get_contents($meta_file), true);
            if ($metadata && $metadata['account'] === $account) {
                unset($metadata['stored_name']);
                $files[] = $metadata;
            }
        }

        // Sort by upload time, newest first
        usort($files, function($a, $b) {
            return ($b['uploaded'] ?? 0) - ($a['uploaded'] ?? 0);
        });

        $total_size = array_sum(array_column($files, 'size'));

        success_response([
            'account' => $account,
            'files' => $files,
            'total_files' => count($files),
            'total_size' => $total_size,
            'storage_limit' => $CONFIG['max_storage_per_account'],
            'storage_used_percent' => round($total_size / $CONFIG['max_storage_per_account'] * 100, 2)
        ]);
        break;

    // =========================================================================
    // DELETE FILE - Auth required, owner only
    // =========================================================================
    case 'delete':
        if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
            error_response(405, 'DELETE or POST method required');
        }

        $account = require_auth();

        $file_id = $_GET['file_id'] ?? $_POST['file_id'] ?? null;
        if (!$file_id) {
            error_response(400, 'file_id parameter required');
        }

        $metadata = get_file_metadata($file_id);
        if (!$metadata) {
            error_response(404, 'File not found');
        }

        // Only owner can delete
        if ($metadata['account'] !== $account) {
            error_response(403, 'Only file owner can delete');
        }

        // Delete file and metadata
        $file_path = $CONFIG['storage_path'] . $metadata['stored_name'];
        $meta_path = $CONFIG['metadata_path'] . $file_id . '.json';

        if (file_exists($file_path)) {
            unlink($file_path);
        }
        if (file_exists($meta_path)) {
            unlink($meta_path);
        }

        success_response([
            'deleted' => true,
            'file_id' => $file_id
        ]);
        break;

    // =========================================================================
    // HUB INFO - No auth required
    // =========================================================================
    case 'hub_info':
    default:
        // Count public files
        $public_files = 0;
        $total_size = 0;
        $meta_files = glob($CONFIG['metadata_path'] . '*.json');

        foreach ($meta_files as $meta_file) {
            $metadata = json_decode(file_get_contents($meta_file), true);
            if ($metadata) {
                if ($metadata['public'] ?? false) {
                    $public_files++;
                }
                $total_size += $metadata['size'] ?? 0;
            }
        }

        success_response([
            'hub' => [
                'name' => $CONFIG['hub_name'],
                'version' => $CONFIG['hub_version'],
                'operator' => $CONFIG['hub_operator'],
                'blockchain' => 'VIZ'
            ],
            'stats' => [
                'public_files' => $public_files,
                'total_files' => count($meta_files),
                'total_size' => $total_size
            ],
            'limits' => [
                'max_file_size' => $CONFIG['max_file_size'],
                'max_storage_per_account' => $CONFIG['max_storage_per_account'],
                'allowed_types' => $CONFIG['allowed_types']
            ],
            'api' => [
                'challenge' => 'GET ?action=challenge&account={account}',
                'upload' => 'POST ?action=upload (multipart/form-data, requires auth)',
                'status' => 'GET ?action=status&upload_id={id}',
                'metadata' => 'GET ?action=metadata&file_id={id}',
                'download' => 'GET ?action=download&file_id={id}',
                'list' => 'GET ?action=list (requires auth)',
                'delete' => 'DELETE ?action=delete&file_id={id} (requires auth)'
            ],
            'auth' => [
                'method' => 'VIZ blockchain signature',
                'headers' => [
                    'X-VIZ-Account' => 'Your VIZ account name',
                    'X-VIZ-Challenge' => 'Challenge from ?action=challenge',
                    'X-VIZ-Signature' => 'Signature of sign_message'
                ]
            ]
        ]);
        break;
}
