<?php
/**
 * Configuration and HTTP Utilities
 *
 * This file contains:
 * - HTTP request functions for external API calls
 * - Telegram bot helper methods
 * - Socket-based HTTP client (no cURL dependency)
 *
 * Used by: blacklist.php, cloud.php, and other API scripts
 *
 * @author Free-Speech-Project
 * @version 1.0.0
 */

// =============================================================================
// GLOBAL SETTINGS
// =============================================================================

/**
 * DNS cache for host IP lookups
 * Reduces DNS resolution overhead for repeated requests
 * @var array
 */
$host_ip = [];

/**
 * SSL certificate verification
 * Set to true in production with valid certificates
 * @var bool
 */
$check_ssl = false;

/**
 * Socket read timeout in seconds
 * Increase for slow networks or large responses
 * @var int
 */
$url_read_timeout = 5;

/**
 * Accept gzip-compressed responses
 * Reduces bandwidth but adds decompression overhead
 * @var bool
 */
$accept_gzip = false;

/**
 * Additional HTTP headers to include in requests
 * @var array
 */
$header_arr = [];

// =============================================================================
// TELEGRAM BOT FUNCTIONS
// =============================================================================

/**
 * Call Telegram Bot API method
 *
 * @param string $method Telegram API method name (e.g., 'sendMessage')
 * @param array $data Request parameters
 * @param bool $debug Enable debug output
 * @return mixed API response or false on failure
 *
 * @example
 *   telegram_method('sendMessage', [
 *       'chat_id' => '-123456789',
 *       'text' => urlencode('Hello, World!'),
 *       'parse_mode' => 'HTML'
 *   ]);
 */
function telegram_method($method, $data = [], $debug = false) {
    global $telegram_bot_gate;

    // Make HTTP request to Telegram API
    $result = get_url($telegram_bot_gate . $method, $data, $debug);

    if ($result !== false) {
        // Parse response (separate headers from body)
        list($header, $result) = parse_web_result($result);

        if ($debug) {
            print_r($header);
            print_r($result);
        }

        return $result;
    }

    return false;
}

// =============================================================================
// HTTP RESPONSE PARSING
// =============================================================================

/**
 * Parse chunked transfer encoding
 *
 * HTTP/1.1 chunked responses have size prefixes before each chunk.
 * This function removes the chunk size markers to get clean content.
 *
 * @param string $data Raw chunked data
 * @return string Decoded content
 */
function clear_chunked($data) {
    $arr = explode("\r\n", $data);
    $i = 0;
    $count = count($arr);

    while ($i <= $count) {
        // Chunk size lines are typically short (hex number + optional extensions)
        if (strlen($arr[$i]) <= 5) {
            unset($arr[$i]);
            $i += 2;  // Skip size line and following content line
        } else {
            $arr[$i] = "\r\n" . $arr[$i];
            $i += 1;
        }
    }

    $result = implode('', $arr);
    return $result;
}

/**
 * Parse HTTP response into headers and body
 *
 * Handles:
 * - Header/body separation
 * - Chunked transfer encoding
 * - Gzip content encoding
 *
 * @param string $data Raw HTTP response
 * @return array [$headers, $body]
 */
function parse_web_result($data) {
    // Find header/body boundary (double CRLF)
    $header_end = mb_strpos($data, "\r\n\r\n");
    $headers = mb_substr($data, 0, $header_end);
    $clear_result = mb_substr($data, $header_end + 4);

    // Handle chunked transfer encoding
    if (strpos($headers, 'Transfer-Encoding: chunked') !== false) {
        $clear_result = clear_chunked($clear_result);
    }

    // Handle gzip compression
    if (strpos($headers, 'Content-Encoding: gzip') !== false) {
        $clear_result = gzdecode($clear_result);
    }

    return [$headers, $clear_result];
}

// =============================================================================
// HTTP CLIENT (SOCKET-BASED)
// =============================================================================

/**
 * Make HTTP request using raw sockets
 *
 * This function provides a cURL-free HTTP client that:
 * - Supports GET and POST methods
 * - Handles HTTPS via SSL sockets
 * - Caches DNS lookups for performance
 * - Supports custom headers and timeouts
 *
 * @param string $url Full URL (http:// or https://)
 * @param mixed $post POST data (false for GET, string or array for POST)
 * @param bool $debug Enable debug output
 * @return string|false Raw HTTP response or false on failure
 *
 * @example GET request:
 *   $response = get_url('https://api.example.com/data');
 *
 * @example POST with JSON:
 *   $response = get_url('https://api.example.com/data', '{"key":"value"}');
 *
 * @example POST with form data:
 *   $response = get_url('https://api.example.com/data', ['key' => 'value']);
 */
function get_url($url, $post = false, $debug = false) {
    global $host_ip, $check_ssl, $url_read_timeout, $accept_gzip, $header_arr;

    // Determine HTTP method
    $method = 'GET';
    if ($post !== false) {
        $method = 'POST';
    }

    // ==========================================================================
    // URL PARSING
    // ==========================================================================

    // Extract host from URL: protocol://host/path
    preg_match('#://(.*)/#iUs', $url . '/', $stock);
    preg_match('#://' . $stock[1] . '/(.*)$#iUs', $url, $stock2);

    $host = $stock[1];
    $use_port = false;

    // Handle custom port in host (e.g., host:8080)
    if (strpos($host, ':') !== false) {
        $use_port = intval(substr($host, strpos($host, ':') + 1));
        $host = substr($host, 0, strpos($host, ':'));
    }

    $path = $stock2[1] ?? '';

    // ==========================================================================
    // POST DATA PROCESSING
    // ==========================================================================

    $content_type = 'application/json';

    if (is_array($post)) {
        // Convert array to URL-encoded form data
        $post_str_arr = [];
        foreach ($post as $k => $v) {
            $post_str_arr[] = urlencode($k) . '=' . $v;
        }
        $post = implode('&', $post_str_arr);
        $content_type = 'application/x-www-form-urlencoded';
    }

    // ==========================================================================
    // BUILD HTTP REQUEST
    // ==========================================================================

    $request = "{$method} /{$path} HTTP/1.1\r\n";
    $request .= "Host: {$host}\r\n";
    $request .= "Connection: close\r\n";

    // Optional: Accept gzip compression
    if ($accept_gzip) {
        $request .= "Accept-Encoding: gzip\r\n";
    }

    $request .= "Content-Type: {$content_type}\r\n";

    // Add custom headers
    foreach ($header_arr as $k => $v) {
        $request .= "{$k}: {$v}\r\n";
    }

    // Content length and body
    $request .= "Content-Length: " . strlen($post) . "\r\n\r\n";
    $request .= $post;
    $request .= "\r\n\r\n";

    if ($debug) {
        print "=== HTTP REQUEST ===\n";
        print $request;
        print "====================\n";
    }

    // ==========================================================================
    // DNS RESOLUTION
    // ==========================================================================

    $socket_connect = $host;

    // Cache DNS lookups for performance
    if (!isset($host_ip[$socket_connect])) {
        $host_ip[$socket_connect] = gethostbyname($host);
    }

    $socket_connect = $host_ip[$socket_connect];

    // ==========================================================================
    // SOCKET CONNECTION
    // ==========================================================================

    $port = 80;

    // Determine protocol and port
    if (strpos($url, 'https://') !== false) {
        $port = 443;
        $socket_connect = 'ssl://' . $socket_connect;
    } else if (strpos($url, 'wss://') !== false) {
        $port = 443;
        $socket_connect = 'ssl://' . $socket_connect;
    }

    // Use custom port if specified
    if ($use_port !== false) {
        $port = $use_port;
    }

    $socket_connect .= ':' . $port;

    // ==========================================================================
    // SSL CONTEXT
    // ==========================================================================

    $context = stream_context_create();

    // Set SNI hostname for SSL
    stream_context_set_option($context, 'ssl', 'peer_name', $host);

    // SSL verification settings
    if (!$check_ssl) {
        // Disable certificate verification (development only!)
        stream_context_set_option($context, 'ssl', 'verify_peer', false);
        stream_context_set_option($context, 'ssl', 'verify_peer_name', false);
        stream_context_set_option($context, 'ssl', 'allow_self_signed', true);
    }

    // ==========================================================================
    // EXECUTE REQUEST
    // ==========================================================================

    $result = '';

    $sock = stream_socket_client(
        $socket_connect,
        $errno,
        $errstr,
        2,  // Connection timeout
        STREAM_CLIENT_CONNECT,
        $context
    );

    if ($sock) {
        // Set read timeout
        stream_set_timeout($sock, $url_read_timeout);

        // Send request
        fwrite($sock, $request, strlen($request));

        // Read response with timeout
        $read_timeout = microtime(true) + $url_read_timeout;

        while (!feof($sock)) {
            $result .= fread($sock, 1024);

            // Check for timeout
            if (microtime(true) > $read_timeout) {
                break;
            }
        }

        fclose($sock);

        // Check if we timed out
        if (microtime(true) > $read_timeout) {
            if ($debug) {
                print "!!! SOCKET TIMED OUT {$url_read_timeout} SEC [" . date('d.m.Y H:i:s') . "]\n";
                print_r($request);
            }
            return false;
        }
    } else {
        // Connection failed
        if ($debug) {
            print "!!! CONNECTION FAILED: {$errstr} ({$errno})\n";
        }
        return false;
    }

    return $result;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Validate VIZ account name format
 *
 * @param string $account Account name
 * @return bool True if valid
 */
function is_valid_viz_account($account) {
    // VIZ accounts: 3-16 chars, lowercase letters, numbers, dots, hyphens
    // Must start with letter
    return preg_match('/^[a-z][a-z0-9.-]{2,15}$/', $account);
}

/**
 * Sanitize string for database
 *
 * @param mysqli $db Database connection
 * @param string $str String to sanitize
 * @return string Sanitized string
 */
function db_escape($db, $str) {
    return mysqli_real_escape_string($db, $str);
}

/**
 * Generate random string
 *
 * @param int $length String length
 * @return string Random alphanumeric string
 */
function random_string($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * Get current timestamp
 *
 * @return int Unix timestamp
 */
function now() {
    return time();
}

/**
 * Format timestamp for logging
 *
 * @param int $timestamp Unix timestamp (default: now)
 * @return string Formatted datetime
 */
function format_time($timestamp = null) {
    return date('Y-m-d H:i:s', $timestamp ?? time());
}
