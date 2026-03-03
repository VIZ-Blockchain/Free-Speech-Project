/**
 * Cloud Sync Client - VIZ Blockchain Passwordless Authentication
 *
 * JavaScript client for cloud synchronization with VIZ signature authentication.
 * Supports both direct signature and session-based authentication methods.
 *
 * Usage:
 *   const cloud = new CloudSyncClient('https://api.example.com/scripts/cloud.php');
 *   await cloud.authenticate('myaccount', vizPrivateKey);
 *   const updates = await cloud.getUpdates();
 *
 * @author Free-Speech-Project
 * @version 1.0.0
 */

class CloudSyncClient {
    /**
     * Create cloud sync client
     *
     * @param {string} apiUrl - Cloud API endpoint URL
     * @param {string} domain - Auth domain (must match server config)
     */
    constructor(apiUrl, domain = 'readdle.me') {
        this.apiUrl = apiUrl.replace(/\/$/, '');
        this.domain = domain;

        // Session state
        this.session = null;
        this.sessionExpire = 0;
        this.account = null;

        // Sync state
        this.lastActivity = 0;
        this.lastUpdate = 0;
    }

    // =========================================================================
    // AUTHENTICATION
    // =========================================================================

    /**
     * Sign data with VIZ private key
     * Requires viz-js-lib loaded
     *
     * @param {string} operation - Operation name (e.g., 'login')
     * @param {string} account - VIZ account name
     * @param {string} privateKey - VIZ private key (WIF format)
     * @returns {Object} { data, signature }
     */
    signData(operation, account, privateKey) {
        const timestamp = Math.floor(Date.now() / 1000);
        const nonce = Math.random().toString(36).substring(2, 10);
        const data = `${this.domain}:${operation}:${account}:${timestamp}:${nonce}`;

        // Use viz-js-lib for signing
        if (typeof viz === 'undefined' || !viz.auth) {
            throw new Error('viz-js-lib not loaded. Include viz.min.js');
        }

        const signature = viz.auth.signMessage(data, privateKey);
        return { data, signature };
    }

    /**
     * Authenticate and create session
     *
     * @param {string} account - VIZ account name
     * @param {string} privateKey - VIZ private key
     * @returns {Promise<Object>} Session info
     */
    async authenticate(account, privateKey) {
        const { data, signature } = this.signData('login', account, privateKey);

        const response = await this.request({
            action: 'session',
            data: data,
            signature: signature
        });

        if (!response.auth || !response.session) {
            throw new Error(response.message || 'Authentication failed');
        }

        // Store session
        this.session = response.session;
        this.sessionExpire = response.expire;
        this.account = account;

        return {
            success: true,
            session: response.session,
            expire: response.expire,
            ttl: response.ttl,
            expiresIn: response.expire - Math.floor(Date.now() / 1000)
        };
    }

    /**
     * Check if session is still valid
     *
     * @returns {boolean}
     */
    isAuthenticated() {
        return this.session && this.sessionExpire > Math.floor(Date.now() / 1000);
    }

    /**
     * Clear session (logout)
     */
    logout() {
        this.session = null;
        this.sessionExpire = 0;
        this.account = null;
    }

    // =========================================================================
    // API METHODS
    // =========================================================================

    /**
     * Make API request
     *
     * @param {Object} data - Request data
     * @returns {Promise<Object>} Response data
     */
    async request(data) {
        // Add session if available and not signing directly
        if (this.session && !data.signature) {
            data.session = this.session;
        }

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        // Handle session expiry
        if (result.session === '' && result.expire === -1) {
            this.logout();
            throw new Error('Session expired');
        }

        return result;
    }

    /**
     * Get last activity timestamp and update ID
     *
     * @returns {Promise<Object>} { activity, update }
     */
    async getActivity() {
        this.requireAuth();

        const response = await this.request({
            action: 'activity'
        });

        if (response.error) {
            throw new Error(response.message || 'Failed to get activity');
        }

        this.lastActivity = response.activity;
        this.lastUpdate = response.update;

        return {
            activity: response.activity,
            update: response.update
        };
    }

    /**
     * Get updates since last sync
     *
     * @param {number} sinceActivity - Activity timestamp (optional, uses stored value)
     * @param {number} sinceUpdate - Update ID (optional, uses stored value)
     * @returns {Promise<Array>} Array of updates
     */
    async getUpdates(sinceActivity = null, sinceUpdate = null) {
        this.requireAuth();

        const response = await this.request({
            action: 'get_updates',
            activity: sinceActivity ?? this.lastActivity,
            update: sinceUpdate ?? this.lastUpdate
        });

        if (response.error) {
            throw new Error(response.message || 'Failed to get updates');
        }

        // Update local state if we got new updates
        if (response.result && response.result.length > 0) {
            const lastUpdate = response.result[response.result.length - 1];
            this.lastActivity = lastUpdate.time;
            this.lastUpdate = lastUpdate.id;
        }

        return response.result || [];
    }

    /**
     * Push new update to cloud
     *
     * @param {number} type - Update type ID
     * @param {string} value - Update value
     * @returns {Promise<Object>} { activity, update }
     */
    async putUpdate(type, value) {
        this.requireAuth();

        const response = await this.request({
            action: 'put_update',
            type: type,
            value: value
        });

        if (response.error) {
            throw new Error(response.message || 'Failed to put update');
        }

        // Update local state
        this.lastActivity = response.result.activity;
        this.lastUpdate = response.result.update;

        return response.result;
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    /**
     * Require authentication or throw error
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated. Call authenticate() first.');
        }
    }

    // =========================================================================
    // CONVENIENCE METHODS (typed updates)
    // =========================================================================

    /** Backup full data (replaces all previous) */
    async backup(data) {
        return this.putUpdate(1, typeof data === 'string' ? data : JSON.stringify(data));
    }

    /** Subscribe to account */
    async subscribe(account) {
        return this.putUpdate(2, account);
    }

    /** Unsubscribe from account */
    async unsubscribe(account) {
        return this.putUpdate(3, account);
    }

    /** Ignore account */
    async ignore(account) {
        return this.putUpdate(4, account);
    }

    /** Pin hashtag */
    async pinHashtag(hashtag) {
        return this.putUpdate(5, hashtag);
    }

    /** Unpin hashtag */
    async unpinHashtag(hashtag) {
        return this.putUpdate(6, hashtag);
    }

    /** Ignore hashtag */
    async ignoreHashtag(hashtag) {
        return this.putUpdate(7, hashtag);
    }
}

/**
 * Update type constants
 */
CloudSyncClient.UPDATE_TYPES = {
    BACKUP: 1,
    SUBSCRIBE: 2,
    UNSUBSCRIBE: 3,
    IGNORE: 4,
    PIN_HASHTAG: 5,
    UNPIN_HASHTAG: 6,
    IGNORE_HASHTAG: 7
};

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/*
// Example 1: Basic authentication and sync
const cloud = new CloudSyncClient('https://api.example.com/scripts/cloud.php');

// Authenticate with VIZ account
await cloud.authenticate('myaccount', '5K...');

// Check activity
const { activity, update } = await cloud.getActivity();
console.log('Last activity:', new Date(activity * 1000));

// Get updates since last sync
const updates = await cloud.getUpdates();
console.log('New updates:', updates);

// Process updates
for (const update of updates) {
    switch (update.type) {
        case CloudSyncClient.UPDATE_TYPES.SUBSCRIBE:
            console.log('Subscribed to:', update.value);
            break;
        case CloudSyncClient.UPDATE_TYPES.IGNORE:
            console.log('Ignored:', update.value);
            break;
        // ... handle other types
    }
}


// Example 2: Push updates
await cloud.subscribe('someuser');
await cloud.pinHashtag('viz');
await cloud.ignore('spammer');


// Example 3: Full backup
const localData = {
    subscriptions: ['user1', 'user2'],
    ignored: ['spammer'],
    hashtags: ['viz', 'crypto']
};
await cloud.backup(localData);


// Example 4: Sync manager
class SyncManager {
    constructor(cloudClient) {
        this.cloud = cloudClient;
        this.localState = this.loadLocalState();
    }

    loadLocalState() {
        const saved = localStorage.getItem('sync_state');
        return saved ? JSON.parse(saved) : { activity: 0, update: 0 };
    }

    saveLocalState() {
        localStorage.setItem('sync_state', JSON.stringify(this.localState));
    }

    async sync() {
        const updates = await this.cloud.getUpdates(
            this.localState.activity,
            this.localState.update
        );

        for (const update of updates) {
            await this.applyUpdate(update);
            this.localState.activity = update.time;
            this.localState.update = update.id;
        }

        this.saveLocalState();
        return updates.length;
    }

    async applyUpdate(update) {
        // Apply update to local state/UI
        console.log('Applying update:', update);
    }
}
*/

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudSyncClient;
}
