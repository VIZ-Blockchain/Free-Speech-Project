<?php
/**
 * Self-Hosted CORS Proxy for Free-Speech-Project
 *
 * This proxy allows fetching images from trusted domains that don't have CORS headers enabled.
 * It adds proper CORS headers to responses, enabling the dApp to cache images locally.
 *
 * Usage:
 *   GET /scripts/cors_proxy.php?url=https://example.com/image.jpg
 *
 * Security:
 *   - Only whitelisted domains are allowed
 *   - Only image content types are proxied
 *   - Request size limits enforced
 *   - Rate limiting support (optional)
 *
 * @author Free-Speech-Project
 * @version 1.0.0
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

// Trusted domains whitelist - add domains that need CORS proxying
// These are domains that DON'T have CORS enabled but we trust for images
$TRUSTED_DOMAINS = [
    // Image hosting services (most already have CORS, but as fallback)
    'gravatar.com',
    'secure.gravatar.com',
    'githubusercontent.com',
    'raw.githubusercontent.com',
    'avatars.githubusercontent.com',
    'imgur.com',
    'i.imgur.com',

    // Social media avatars
    'pbs.twimg.com',           // Twitter
    'abs.twimg.com',           // Twitter
    'platform-lookaside.fbsbx.com', // Facebook

    // Stock photo sites
    'images.unsplash.com',
    'cdn.pixabay.com',

    // Add your custom trusted domains here
    // 'example.com',
];

// Allowed content types (only images)
$ALLOWED_CONTENT_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/x-icon',
    'image/vnd.microsoft.icon',
];

// Maximum file size (10 MB)
$MAX_FILE_SIZE = 10 * 1024 * 1024;

// Request timeout (seconds)
$REQUEST_TIMEOUT = 30;

// Cache duration for successful responses (seconds) - 1 day
$CACHE_DURATION = 86400;

// Enable rate limiting (requires APCu or file-based tracking)
$RATE_LIMIT_ENABLED = false;
$RATE_LIMIT_REQUESTS = 100;  // Max requests per window
$RATE_LIMIT_WINDOW = 60;     // Window in seconds

// =============================================================================
// CORS HEADERS
// =============================================================================

/**
 * Send CORS headers for all responses
 */
function send_cors_headers() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, HEAD, OPTIONS');
    header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Range');
    header('Access-Control-Expose-Headers: Content-Length, Content-Type, Content-Disposition');
    header('Access-Control-Max-Age: 86400'); // Cache preflight for 24 hours
}

// Send CORS headers immediately
send_cors_headers();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204); // No Content
    exit;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Send JSON error response
 */
function send_error($code, $message, $details = null) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');

    $response = [
        'error' => true,
        'code' => $code,
        'message' => $message
    ];

    if ($details !== null) {
        $response['details'] = $details;
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Validate URL format
 */
function is_valid_url($url) {
    if (empty($url)) {
        return false;
    }

    $parsed = parse_url($url);

    // Must have scheme and host
    if (!isset($parsed['scheme']) || !isset($parsed['host'])) {
        return false;
    }

    // Only HTTPS allowed (security requirement)
    if ($parsed['scheme'] !== 'https') {
        return false;
    }

    // Basic URL validation
    return filter_var($url, FILTER_VALIDATE_URL) !== false;
}

/**
 * Extract domain from URL (handles subdomains)
 */
function extract_domain($url) {
    $parsed = parse_url($url);
    if (!isset($parsed['host'])) {
        return null;
    }
    return strtolower($parsed['host']);
}

/**
 * Check if domain is in trusted list (including subdomains)
 */
function is_trusted_domain($domain, $trusted_list) {
    if (empty($domain)) {
        return false;
    }

    $domain = strtolower($domain);

    foreach ($trusted_list as $trusted) {
        $trusted = strtolower($trusted);

        // Exact match
        if ($domain === $trusted) {
            return true;
        }

        // Subdomain match (e.g., "cdn.example.com" matches "example.com")
        if (str_ends_with($domain, '.' . $trusted)) {
            return true;
        }
    }

    return false;
}

/**
 * Check if content type is allowed
 */
function is_allowed_content_type($content_type, $allowed_types) {
    if (empty($content_type)) {
        return false;
    }

    // Extract main content type (ignore charset, etc.)
    $content_type = strtolower(trim(explode(';', $content_type)[0]));

    return in_array($content_type, $allowed_types);
}

/**
 * Simple rate limiting (file-based, for basic protection)
 */
function check_rate_limit($enabled, $max_requests, $window) {
    if (!$enabled) {
        return true;
    }

    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $ip_hash = md5($ip);
    $rate_file = sys_get_temp_dir() . '/cors_proxy_rate_' . $ip_hash . '.json';

    $now = time();
    $data = ['requests' => [], 'window_start' => $now];

    // Load existing data
    if (file_exists($rate_file)) {
        $content = file_get_contents($rate_file);
        $loaded = json_decode($content, true);
        if ($loaded) {
            $data = $loaded;
        }
    }

    // Clean old requests outside window
    $data['requests'] = array_filter($data['requests'], function($timestamp) use ($now, $window) {
        return ($now - $timestamp) < $window;
    });

    // Check limit
    if (count($data['requests']) >= $max_requests) {
        return false;
    }

    // Add current request
    $data['requests'][] = $now;

    // Save data
    file_put_contents($rate_file, json_encode($data), LOCK_EX);

    return true;
}

/**
 * Polyfill for str_ends_with (PHP < 8.0)
 */
if (!function_exists('str_ends_with')) {
    function str_ends_with($haystack, $needle) {
        $length = strlen($needle);
        if ($length === 0) {
            return true;
        }
        return substr($haystack, -$length) === $needle;
    }
}

// =============================================================================
// MAIN LOGIC
// =============================================================================

// Only allow GET and HEAD methods
if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'HEAD'])) {
    send_error(405, 'Method Not Allowed', 'Only GET and HEAD methods are supported');
}

// Check rate limiting
if (!check_rate_limit($RATE_LIMIT_ENABLED, $RATE_LIMIT_REQUESTS, $RATE_LIMIT_WINDOW)) {
    send_error(429, 'Too Many Requests', 'Rate limit exceeded. Please try again later.');
}

// Get URL parameter
$target_url = $_GET['url'] ?? null;

if (empty($target_url)) {
    send_error(400, 'Bad Request', 'Missing required "url" parameter');
}

// Decode URL if encoded
$target_url = urldecode($target_url);

// Validate URL format
if (!is_valid_url($target_url)) {
    send_error(400, 'Bad Request', 'Invalid URL format. Only HTTPS URLs are allowed.');
}

// Extract and validate domain
$domain = extract_domain($target_url);
if (!is_trusted_domain($domain, $TRUSTED_DOMAINS)) {
    send_error(403, 'Forbidden', 'Domain "' . htmlspecialchars($domain) . '" is not in the trusted list');
}

// =============================================================================
// FETCH AND PROXY
// =============================================================================

// Initialize cURL
$ch = curl_init();

// Set cURL options
curl_setopt_array($ch, [
    CURLOPT_URL => $target_url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 5,
    CURLOPT_TIMEOUT => $REQUEST_TIMEOUT,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (compatible; Free-Speech-Project CORS Proxy/1.0)',
    CURLOPT_HTTPHEADER => [
        'Accept: image/*',
        'Accept-Encoding: identity', // Don't request compressed (easier to handle)
    ],
    // For HEAD requests, don't fetch body
    CURLOPT_NOBODY => ($_SERVER['REQUEST_METHOD'] === 'HEAD'),
    // Get response headers
    CURLOPT_HEADER => true,
]);

// Execute request
$response = curl_exec($ch);

// Check for cURL errors
if (curl_errno($ch)) {
    $error = curl_error($ch);
    curl_close($ch);
    send_error(502, 'Bad Gateway', 'Failed to fetch resource: ' . $error);
}

// Get response info
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
$content_length = curl_getinfo($ch, CURLINFO_CONTENT_LENGTH_DOWNLOAD);

curl_close($ch);

// Check HTTP status code
if ($http_code !== 200) {
    send_error($http_code, 'Upstream Error', 'Remote server returned status ' . $http_code);
}

// Validate content type
if (!is_allowed_content_type($content_type, $ALLOWED_CONTENT_TYPES)) {
    send_error(415, 'Unsupported Media Type', 'Content type "' . htmlspecialchars($content_type) . '" is not allowed');
}

// Check file size
if ($content_length > $MAX_FILE_SIZE) {
    send_error(413, 'Payload Too Large', 'File size exceeds maximum allowed (' . ($MAX_FILE_SIZE / 1024 / 1024) . ' MB)');
}

// Separate headers and body
$headers_raw = substr($response, 0, $header_size);
$body = substr($response, $header_size);

// Check actual body size
if (strlen($body) > $MAX_FILE_SIZE) {
    send_error(413, 'Payload Too Large', 'File size exceeds maximum allowed');
}

// =============================================================================
// SEND RESPONSE
// =============================================================================

// Set response headers
http_response_code(200);
header('Content-Type: ' . $content_type);
header('Content-Length: ' . strlen($body));

// Cache headers
header('Cache-Control: public, max-age=' . $CACHE_DURATION);
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + $CACHE_DURATION) . ' GMT');

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Proxy-Source: ' . htmlspecialchars($domain));

// Send body (for GET requests)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    echo $body;
}

exit;
