# Passwordless Authorization & Cloud Sync

## Overview

The Free-Speech-Project uses **VIZ blockchain signatures** for passwordless authentication. Users prove ownership of their account by signing a challenge string with their private key - no passwords stored, no accounts to create.

## Authentication Methods

### 1. Direct Signature Authentication

Each request is signed individually. Most secure, but requires signing for every operation.

```
Client                         Server                      VIZ Blockchain
   │                              │                              │
   │  1. Sign data with           │                              │
   │     VIZ private key          │                              │
   │                              │                              │
   │  2. POST {data, signature}   │                              │
   │─────────────────────────────▶│                              │
   │                              │                              │
   │                              │  3. Get account public keys  │
   │                              │─────────────────────────────▶│
   │                              │◀─────────────────────────────│
   │                              │                              │
   │                              │  4. Verify signature         │
   │                              │     against public keys      │
   │                              │                              │
   │  5. Response                 │                              │
   │◀─────────────────────────────│                              │
```

**Data format for signing:**
```
{domain}:{operation}:{account}:{timestamp}:{nonce}
```

Example:
```
readdle.me:login:myaccount:1709510400:abc123
```

### 2. Session-Based Authentication

First request creates a session, subsequent requests use session ID. Better for multiple operations.

```
Client                         Server
   │                              │
   │  1. Sign login request       │
   │─────────────────────────────▶│
   │                              │
   │  2. Return session_id        │
   │     (valid for TTL)          │
   │◀─────────────────────────────│
   │                              │
   │  3. Subsequent requests      │
   │     with session_id only     │
   │─────────────────────────────▶│
   │                              │
```

**Session flow:**
1. Client signs: `{domain}:login:{account}:{timestamp}`
2. Server verifies signature via VIZ blockchain
3. Server creates session: `MD5(data + signature)`
4. Client stores session ID for subsequent requests
5. Session expires after TTL (default: 10 minutes)

## Cloud Sync Operations

### Supported Operations

| Type ID | Operation | Description |
|---------|-----------|-------------|
| 1 | `backup` | Full data backup (replaces previous) |
| 2 | `subscribe` | Add subscription |
| 3 | `reset` | Remove subscription |
| 4 | `ignore` | Add to ignore list |
| 5 | `pin_hashtag` | Pin hashtag |
| 6 | `reset_hashtag` | Unpin hashtag |
| 7 | `ignore_hashtag` | Ignore hashtag |

### API Endpoints

#### Create Session
```json
POST /cloud.php
{
    "action": "session",
    "data": "readdle.me:login:myaccount:1709510400",
    "signature": "1f..."
}

Response:
{
    "auth": true,
    "session": "abc123def456...",
    "expire": 1709511000
}
```

#### Check Activity
```json
POST /cloud.php
{
    "action": "activity",
    "session": "abc123def456..."
}

Response:
{
    "auth": true,
    "activity": 1709500000,
    "update": 42
}
```

#### Get Updates
```json
POST /cloud.php
{
    "action": "get_updates",
    "session": "abc123def456...",
    "activity": 1709500000,
    "update": 40
}

Response:
{
    "auth": true,
    "result": [
        {"id": 41, "time": 1709500100, "type": 2, "value": "someuser"},
        {"id": 42, "time": 1709500200, "type": 5, "value": "viz"}
    ]
}
```

#### Put Update
```json
POST /cloud.php
{
    "action": "put_update",
    "session": "abc123def456...",
    "type": 2,
    "value": "newuser"
}

Response:
{
    "auth": true,
    "result": {
        "activity": 1709510500,
        "update": 43
    }
}
```

## Database Schema

### sessions
```sql
CREATE TABLE `session` (
    `id` BINARY(16) PRIMARY KEY,
    `account` VARCHAR(64) NOT NULL,
    `time` INT UNSIGNED NOT NULL,
    INDEX `idx_account` (`account`),
    INDEX `idx_time` (`time`)
);
```

### activity
```sql
CREATE TABLE `activity` (
    `account` VARCHAR(64) PRIMARY KEY,
    `time` INT UNSIGNED NOT NULL,
    `update` BIGINT UNSIGNED NOT NULL
);
```

### updates
```sql
CREATE TABLE `updates` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `account` VARCHAR(64) NOT NULL,
    `time` INT UNSIGNED NOT NULL,
    `type` TINYINT UNSIGNED NOT NULL,
    `data` TEXT,
    INDEX `idx_account_time` (`account`, `time`)
);
```

## Security Considerations

### Strengths
- **No passwords** - Nothing to steal or leak
- **Blockchain-backed** - Public keys verified on-chain
- **Replay protection** - Timestamps and nonces prevent replay attacks
- **Session isolation** - Sessions tied to specific signatures

### Best Practices
1. **Short TTL** - Keep session TTL short (10-30 minutes)
2. **HTTPS only** - Always use HTTPS in production
3. **Timestamp validation** - Reject requests with old timestamps
4. **Rate limiting** - Implement per-account rate limits
5. **Nonce tracking** - Store used nonces to prevent replay

## JavaScript Client Example

```javascript
// Sign data with VIZ private key
function signCloudRequest(account, operation, privateKey) {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = Math.random().toString(36).substring(2, 10);
    const data = `readdle.me:${operation}:${account}:${timestamp}:${nonce}`;
    const signature = viz.auth.signMessage(data, privateKey);
    return { data, signature };
}

// Create session
async function createSession(account, privateKey) {
    const { data, signature } = signCloudRequest(account, 'login', privateKey);
    
    const response = await fetch('https://api.example.com/cloud.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'session',
            data: data,
            signature: signature
        })
    });
    
    return await response.json();
}

// Use session for subsequent requests
async function getUpdates(sessionId, lastActivity, lastUpdate) {
    const response = await fetch('https://api.example.com/cloud.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            action: 'get_updates',
            session: sessionId,
            activity: lastActivity,
            update: lastUpdate
        })
    });
    
    return await response.json();
}
```

## Extending the System

### Adding New Operation Types

1. Add type ID to `$types_id` array
2. Implement handler logic if special processing needed
3. Update client to support new type

### Adding New Actions

1. Add new `else if` block in action handling
2. Implement database operations
3. Return appropriate response structure

### Federation Support

Multiple cloud servers can sync by:
1. Sharing the same `updates` format
2. Each server validates signatures independently
3. Clients can sync with multiple servers for redundancy

## Implementation Files

- [`/scripts/cloud.php`](../../scripts/cloud.php) - Cloud sync server implementation
- [`/scripts/cloud_client.js`](../../scripts/cloud_client.js) - JavaScript client library (if created)

## Related Documentation

- [Decentralized File Hub](../quests/trust-domains-implementationjs.md#decentralized-file-hub-system) - File storage with VIZ auth
- [VIZ Auth Library](https://github.com/viz-cx/viz-php-lib) - PHP signature verification
