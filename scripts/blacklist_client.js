/**
 * Blacklist Client - Community Content Moderation
 *
 * JavaScript client for interacting with blacklist services.
 * Supports reporting content and syncing blacklist updates.
 *
 * Usage:
 *   const blacklist = new BlacklistClient('https://api.example.com/scripts/blacklist.php');
 *   await blacklist.sync(sessionId);
 *   if (blacklist.isBlacklisted('spammer', 12345)) { ... }
 *
 * @author Free-Speech-Project
 * @version 1.0.0
 */

class BlacklistClient {
    /**
     * Create blacklist client
     *
     * @param {string} apiUrl - Blacklist API endpoint
     * @param {string} domain - Auth domain for signing (default: readdle.me)
     */
    constructor(apiUrl, domain = 'readdle.me') {
        this.apiUrl = apiUrl.replace(/\/$/, '');
        this.domain = domain;

        // Blacklist storage: Map<account, Set<block_id>>
        this.blacklist = new Map();

        // Sync state
        this.lastSync = 0;
        this.syncCount = 0;
    }

    // =========================================================================
    // API METHODS
    // =========================================================================

    /**
     * Make API request
     *
     * @param {Object} data - Request data
     * @returns {Promise<Object>} Response
     */
    async request(data) {
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        return await response.json();
    }

    /**
     * Report content for moderation
     *
     * @param {string} account - Account being reported
     * @param {number} blockId - Block ID of content
     * @param {string} reason - Reason for report
     * @param {string} myAccount - Reporter's VIZ account
     * @param {string} privateKey - Reporter's VIZ private key
     * @returns {Promise<Object>} Report result
     */
    async report(account, blockId, reason, myAccount, privateKey) {
        // Sign report data
        const timestamp = Math.floor(Date.now() / 1000);
        const nonce = Math.random().toString(36).substring(2, 10);
        const data = `${this.domain}:report:${myAccount}:${timestamp}:${nonce}`;

        // Requires viz-js-lib
        if (typeof viz === 'undefined' || !viz.auth) {
            throw new Error('viz-js-lib not loaded');
        }

        const signature = viz.auth.signMessage(data, privateKey);

        const response = await this.request({
            action: 'report',
            account: account,
            block_id: blockId,
            reason: reason,
            initiator: myAccount,
            data: data,
            signature: signature
        });

        if (response.error) {
            throw new Error(response.message || 'Report failed');
        }

        return response.result;
    }

    /**
     * Sync blacklist updates from server
     *
     * @param {string} sessionId - Authentication session ID
     * @param {number} sinceTime - Fetch updates since timestamp (optional)
     * @returns {Promise<Array>} New updates
     */
    async sync(sessionId, sinceTime = null) {
        const response = await this.request({
            action: 'updates',
            time: sinceTime ?? this.lastSync,
            session: sessionId
        });

        if (response.error) {
            throw new Error(response.message || 'Sync failed');
        }

        const updates = response.result || [];

        // Process updates
        for (const entry of updates) {
            this.applyUpdate(entry);
        }

        this.syncCount++;
        return updates;
    }

    /**
     * Apply single update to local blacklist
     *
     * @param {Object} entry - Blacklist entry
     */
    applyUpdate(entry) {
        const { account, block_id, type, time } = entry;

        if (type === 0) {
            // Block: Add to blacklist
            if (!this.blacklist.has(account)) {
                this.blacklist.set(account, new Set());
            }
            this.blacklist.get(account).add(block_id);
        } else if (type === 1) {
            // Unblock: Remove from blacklist
            if (this.blacklist.has(account)) {
                this.blacklist.get(account).delete(block_id);
                // Clean up empty sets
                if (this.blacklist.get(account).size === 0) {
                    this.blacklist.delete(account);
                }
            }
        }

        // Update sync timestamp
        this.lastSync = Math.max(this.lastSync, time);
    }

    // =========================================================================
    // QUERY METHODS
    // =========================================================================

    /**
     * Check if specific content is blacklisted
     *
     * @param {string} account - Account name
     * @param {number} blockId - Block ID
     * @returns {boolean} True if blacklisted
     */
    isBlacklisted(account, blockId) {
        const accountBlocks = this.blacklist.get(account);
        return accountBlocks ? accountBlocks.has(blockId) : false;
    }

    /**
     * Check if account has any blacklisted content
     *
     * @param {string} account - Account name
     * @returns {boolean} True if account has blacklisted content
     */
    hasBlacklistedContent(account) {
        const accountBlocks = this.blacklist.get(account);
        return accountBlocks ? accountBlocks.size > 0 : false;
    }

    /**
     * Get all blacklisted block IDs for account
     *
     * @param {string} account - Account name
     * @returns {Array<number>} Array of blacklisted block IDs
     */
    getBlacklistedBlocks(account) {
        const accountBlocks = this.blacklist.get(account);
        return accountBlocks ? Array.from(accountBlocks) : [];
    }

    /**
     * Get blacklist statistics
     *
     * @returns {Object} Statistics
     */
    getStats() {
        let totalBlocks = 0;
        for (const blocks of this.blacklist.values()) {
            totalBlocks += blocks.size;
        }

        return {
            accounts: this.blacklist.size,
            blocks: totalBlocks,
            lastSync: this.lastSync,
            syncCount: this.syncCount
        };
    }

    // =========================================================================
    // PERSISTENCE
    // =========================================================================

    /**
     * Export blacklist to JSON for storage
     *
     * @returns {string} JSON string
     */
    export() {
        const data = {
            lastSync: this.lastSync,
            entries: []
        };

        for (const [account, blocks] of this.blacklist) {
            for (const blockId of blocks) {
                data.entries.push({ account, block_id: blockId });
            }
        }

        return JSON.stringify(data);
    }

    /**
     * Import blacklist from JSON
     *
     * @param {string} json - JSON string from export()
     */
    import(json) {
        const data = JSON.parse(json);

        this.lastSync = data.lastSync || 0;
        this.blacklist.clear();

        for (const entry of data.entries || []) {
            if (!this.blacklist.has(entry.account)) {
                this.blacklist.set(entry.account, new Set());
            }
            this.blacklist.get(entry.account).add(entry.block_id);
        }
    }

    /**
     * Save to localStorage
     *
     * @param {string} key - Storage key (default: 'blacklist')
     */
    saveToStorage(key = 'blacklist') {
        localStorage.setItem(key, this.export());
    }

    /**
     * Load from localStorage
     *
     * @param {string} key - Storage key (default: 'blacklist')
     * @returns {boolean} True if loaded successfully
     */
    loadFromStorage(key = 'blacklist') {
        const data = localStorage.getItem(key);
        if (data) {
            try {
                this.import(data);
                return true;
            } catch (e) {
                console.error('Failed to load blacklist:', e);
            }
        }
        return false;
    }

    /**
     * Clear local blacklist
     */
    clear() {
        this.blacklist.clear();
        this.lastSync = 0;
    }
}

/**
 * Blacklist entry types
 */
BlacklistClient.TYPES = {
    BLOCK: 0,
    UNBLOCK: 1
};

// =============================================================================
// MULTI-SERVICE MANAGER
// =============================================================================

/**
 * Manage multiple blacklist services
 */
class BlacklistManager {
    constructor() {
        this.services = new Map();
        this.combined = new Map();  // Combined blacklist from all services
    }

    /**
     * Add blacklist service
     *
     * @param {string} name - Service name
     * @param {string} url - Service API URL
     * @param {Object} options - Service options
     */
    addService(name, url, options = {}) {
        this.services.set(name, {
            client: new BlacklistClient(url, options.domain),
            enabled: options.enabled !== false,
            priority: options.priority || 0
        });
    }

    /**
     * Sync all enabled services
     *
     * @param {string} sessionId - Authentication session
     */
    async syncAll(sessionId) {
        const promises = [];

        for (const [name, service] of this.services) {
            if (service.enabled) {
                promises.push(
                    service.client.sync(sessionId)
                        .then(updates => ({ name, updates, error: null }))
                        .catch(error => ({ name, updates: [], error }))
                );
            }
        }

        const results = await Promise.all(promises);
        this.rebuildCombined();

        return results;
    }

    /**
     * Rebuild combined blacklist from all services
     */
    rebuildCombined() {
        this.combined.clear();

        for (const service of this.services.values()) {
            if (service.enabled) {
                for (const [account, blocks] of service.client.blacklist) {
                    if (!this.combined.has(account)) {
                        this.combined.set(account, new Set());
                    }
                    for (const blockId of blocks) {
                        this.combined.get(account).add(blockId);
                    }
                }
            }
        }
    }

    /**
     * Check if content is blacklisted by any enabled service
     *
     * @param {string} account - Account name
     * @param {number} blockId - Block ID
     * @returns {boolean}
     */
    isBlacklisted(account, blockId) {
        const accountBlocks = this.combined.get(account);
        return accountBlocks ? accountBlocks.has(blockId) : false;
    }

    /**
     * Enable/disable service
     *
     * @param {string} name - Service name
     * @param {boolean} enabled - Enable state
     */
    setServiceEnabled(name, enabled) {
        const service = this.services.get(name);
        if (service) {
            service.enabled = enabled;
            this.rebuildCombined();
        }
    }

    /**
     * Get service by name
     *
     * @param {string} name - Service name
     * @returns {BlacklistClient|null}
     */
    getService(name) {
        const service = this.services.get(name);
        return service ? service.client : null;
    }
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/*
// Example 1: Single service usage
const blacklist = new BlacklistClient('https://api.readdle.me/blacklist.php');

// Load cached blacklist
blacklist.loadFromStorage();

// Sync with server (requires auth session)
await blacklist.sync(sessionId);

// Save updated blacklist
blacklist.saveToStorage();

// Check content
if (blacklist.isBlacklisted('spammer', 12345678)) {
    console.log('Content is blacklisted');
}


// Example 2: Report content
await blacklist.report(
    'spammer',           // Account being reported
    12345678,            // Block ID
    'Spam/scam content', // Reason
    'myaccount',         // Reporter account
    '5K...'              // Reporter private key
);


// Example 3: Multiple services
const manager = new BlacklistManager();

manager.addService('readdle', 'https://api.readdle.me/blacklist.php', {
    enabled: true,
    priority: 10
});

manager.addService('community', 'https://community.example.com/blacklist.php', {
    enabled: true,
    priority: 5
});

// Sync all services
await manager.syncAll(sessionId);

// Check against all services
if (manager.isBlacklisted('spammer', 12345)) {
    // Show warning
}


// Example 4: Content rendering with blacklist check
function renderContent(account, blockId, content, blacklist) {
    if (blacklist.isBlacklisted(account, blockId)) {
        return `
            <div class="blacklisted-content">
                <div class="warning">⚠️ This content has been flagged</div>
                <button onclick="showContent('${account}', ${blockId})">
                    Show anyway
                </button>
            </div>
        `;
    }
    return renderNormalContent(content);
}
*/

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlacklistClient, BlacklistManager };
}
