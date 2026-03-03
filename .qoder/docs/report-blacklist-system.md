# Report System & Community Blacklists

## Overview

The Free-Speech-Project implements a **community-driven content moderation system** using blacklists. Users can report harmful content, and trusted moderators can approve reports to add entries to shared blacklists that all clients can sync.

**Key Principles:**
- **Decentralized moderation** - Multiple blacklist services can exist
- **User choice** - Users choose which blacklist services to trust
- **Transparency** - All reports and decisions are logged
- **VIZ authentication** - Report initiators are verified via blockchain

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Blacklist Service Architecture                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐      ┌─────────────────┐      ┌─────────────────┐         │
│  │   Client    │      │ Blacklist API   │      │ Telegram Bot    │         │
│  │   (dApp)    │      │ (blacklist.php) │      │ (Moderation)    │         │
│  └──────┬──────┘      └────────┬────────┘      └────────┬────────┘         │
│         │                      │                        │                   │
│         │  1. Report content   │                        │                   │
│         │  (with VIZ sig)      │                        │                   │
│         │─────────────────────▶│                        │                   │
│         │                      │                        │                   │
│         │                      │  2. Notify moderators  │                   │
│         │                      │─────────────────────────▶                  │
│         │                      │                        │                   │
│         │                      │  3. Moderator approves │                   │
│         │                      │◀─────────────────────────                  │
│         │                      │                        │                   │
│         │                      │  4. Status = enabled   │                   │
│         │                      │                        │                   │
│         │  5. Sync updates     │                        │                   │
│         │─────────────────────▶│                        │                   │
│         │                      │                        │                   │
│         │  6. Blacklist data   │                        │                   │
│         │◀─────────────────────│                        │                   │
│         │                      │                        │                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## API Endpoints

### Report Content
Submit a report for harmful content. Requires VIZ signature authentication.

```json
POST /blacklist.php
{
    "action": "report",
    "account": "spammer",           // Account being reported
    "block_id": 12345678,           // Block number of content
    "reason": "Spam/scam content",  // Human-readable reason
    "initiator": "reporter_account", // Must match authenticated account
    "data": "readdle.me:report:reporter_account:1709510400",
    "signature": "1f..."
}

Response:
{
    "auth": true,
    "result": {
        "time": 1709510400
    }
}
```

### Get Updates
Fetch blacklist updates since a specific timestamp.

```json
POST /blacklist.php
{
    "action": "updates",
    "time": 1709500000,
    "session": "abc123..."
}

Response:
{
    "auth": true,
    "result": [
        {
            "account": "spammer",
            "block_id": 12345678,
            "type": 0,              // 0=block, 1=unblock
            "initiator": "moderator",
            "reason": "Confirmed spam",
            "time": 1709510400
        }
    ]
}
```

## Database Schema

### blacklist table
```sql
CREATE TABLE `blacklist` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `account` VARCHAR(255) NOT NULL,      -- Reported account
    `block_id` INT(11) NOT NULL,          -- Content block number
    `type` INT(11) NOT NULL,              -- 0=block, 1=unblock
    `initiator` VARCHAR(255) NOT NULL,    -- Who reported/moderated
    `reason` VARCHAR(255) NOT NULL,       -- Reason for action
    `status` INT(11) NOT NULL DEFAULT 0,  -- 0=pending, 1=approved
    `time` INT(11) NOT NULL,              -- Timestamp
    PRIMARY KEY (`id`),
    KEY `time` (`time`),
    KEY `account` (`account`),
    KEY `status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
```

## Report Types

| Type | Name | Description |
|------|------|-------------|
| 0 | `block` | Block/hide content (default) |
| 1 | `unblock` | Remove from blacklist |

## Moderation Workflow

### 1. User Reports Content
- User sees harmful content in dApp
- Clicks "Report" button
- Signs report with VIZ private key
- Report submitted to blacklist service

### 2. Moderator Review
- Report appears in Telegram moderation group
- Moderator reviews linked content
- Approves or rejects report

### 3. Blacklist Update
- Approved reports get `status=1`
- Clients sync updates periodically
- Content hidden/warned across all synced clients

## Telegram Bot Integration

Reports are forwarded to a Telegram group for moderation:

```
[42] Reported: viz://@spammer/12345678/

Reason: Spam/scam content promoting fake giveaway
```

Moderators can:
- Click link to view content
- Approve report (sets status=1)
- Reject report (deletes entry)
- Request more information

## Client Integration

### JavaScript Example

```javascript
class BlacklistClient {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.blacklist = new Map();  // account -> Set of block_ids
        this.lastSync = 0;
    }

    /**
     * Report content to blacklist service
     */
    async report(account, blockId, reason, privateKey, myAccount) {
        const timestamp = Math.floor(Date.now() / 1000);
        const data = `readdle.me:report:${myAccount}:${timestamp}`;
        const signature = viz.auth.signMessage(data, privateKey);

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'report',
                account: account,
                block_id: blockId,
                reason: reason,
                initiator: myAccount,
                data: data,
                signature: signature
            })
        });

        return await response.json();
    }

    /**
     * Sync blacklist updates
     */
    async sync(sessionId) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'updates',
                time: this.lastSync,
                session: sessionId
            })
        });

        const data = await response.json();

        if (data.result) {
            for (const entry of data.result) {
                if (entry.type === 0) {
                    // Block
                    if (!this.blacklist.has(entry.account)) {
                        this.blacklist.set(entry.account, new Set());
                    }
                    this.blacklist.get(entry.account).add(entry.block_id);
                } else {
                    // Unblock
                    if (this.blacklist.has(entry.account)) {
                        this.blacklist.get(entry.account).delete(entry.block_id);
                    }
                }
                this.lastSync = Math.max(this.lastSync, entry.time);
            }
        }

        return data.result || [];
    }

    /**
     * Check if content is blacklisted
     */
    isBlacklisted(account, blockId) {
        const accountBlocks = this.blacklist.get(account);
        return accountBlocks && accountBlocks.has(blockId);
    }
}
```

### Rendering Blacklisted Content

```javascript
function renderContent(account, blockId, content) {
    if (blacklistClient.isBlacklisted(account, blockId)) {
        return `
            <div class="blacklisted-content">
                <div class="warning-icon">⚠️</div>
                <div class="warning-text">
                    This content has been flagged by community moderators.
                    <button onclick="showAnyway('${account}', ${blockId})">
                        Show anyway
                    </button>
                </div>
            </div>
        `;
    }
    return renderNormalContent(content);
}
```

## Multiple Blacklist Services

Users can subscribe to multiple blacklist services with different moderation policies:

```javascript
const blacklistServices = {
    // Default community moderation
    'readdle.me': {
        url: 'https://api.readdle.me/blacklist.php',
        trusted: true,
        description: 'Official community moderation'
    },

    // Strict moderation
    'family-safe.example.com': {
        url: 'https://family-safe.example.com/blacklist.php',
        trusted: true,
        description: 'Family-safe content filter'
    },

    // User-managed list
    'custom': {
        url: null,
        trusted: false,
        description: 'Local user blocks'
    }
};
```

## Security Considerations

### Report Validation
- Initiator must match authenticated VIZ account
- Block ID must be valid integer
- Reason is sanitized before storage

### Moderation Controls
- Only designated moderators can approve reports
- Telegram bot restricts approval commands to admin group
- All actions are logged with timestamps

### Client-Side
- Blacklists are suggestions, not enforced blocks
- Users can choose "Show anyway" for flagged content
- Users can disable specific blacklist services

## Implementation Files

- [`/scripts/blacklist.php`](../../scripts/blacklist.php) - Blacklist API server
- [`/scripts/config.php`](../../scripts/config.php) - Configuration and HTTP utilities
- [`/examples/blacklist.php`](../../examples/blacklist.php) - Reference implementation

## Related Documentation

- [Passwordless Authentication](./passwordless-auth-cloud.md) - VIZ signature auth
- [Cloud Sync](./passwordless-auth-cloud.md#cloud-sync-operations) - Session management
