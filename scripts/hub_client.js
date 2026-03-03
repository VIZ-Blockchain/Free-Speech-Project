/**
 * Decentralized File Hub Client
 *
 * JavaScript client for interacting with self-hosted file hubs
 * using VIZ blockchain signature authentication.
 *
 * Usage:
 *   const hub = new FileHubClient('https://hub.example.com/scripts/hub.php');
 *   await hub.authenticate('myaccount', vizPrivateKey);
 *   const result = await hub.upload(file);
 *
 * @author Free-Speech-Project
 * @version 1.0.0
 */

class FileHubClient {
    constructor(hubUrl) {
        this.hubUrl = hubUrl.replace(/\/$/, '');
        this.account = null;
        this.challenge = null;
        this.signature = null;
        this.authenticated = false;
    }

    /**
     * Get hub information
     */
    async getHubInfo() {
        const response = await fetch(`${this.hubUrl}?action=hub_info`);
        return await response.json();
    }

    /**
     * Request authentication challenge
     */
    async getChallenge(account) {
        const response = await fetch(`${this.hubUrl}?action=challenge&account=${encodeURIComponent(account)}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error?.message || 'Failed to get challenge');
        }

        return data;
    }

    /**
     * Sign message with VIZ private key
     * Requires viz-js-lib or similar library
     */
    signMessage(message, privateKey) {
        // Using viz-js-lib signature
        if (typeof viz !== 'undefined' && viz.auth && viz.auth.signMessage) {
            return viz.auth.signMessage(message, privateKey);
        }

        // Alternative: use Signature class directly
        if (typeof viz !== 'undefined' && viz.auth && viz.auth.wifToPrivate) {
            const privKey = viz.auth.wifToPrivate(privateKey);
            const msgHash = viz.auth.cryptoUtils.sha256(message);
            const sig = privKey.sign(msgHash);
            return sig.toHex();
        }

        throw new Error('viz-js-lib not loaded. Include viz.min.js for signature support.');
    }

    /**
     * Authenticate with hub using VIZ account
     */
    async authenticate(account, privateKey) {
        // Step 1: Get challenge
        const challengeData = await this.getChallenge(account);

        // Step 2: Sign the challenge message
        const signMessage = challengeData.sign_message;
        const signature = this.signMessage(signMessage, privateKey);

        // Store authentication data
        this.account = account;
        this.challenge = challengeData.challenge;
        this.signature = signature;
        this.authenticated = true;

        return {
            success: true,
            account: account,
            expiresIn: challengeData.expires_in
        };
    }

    /**
     * Get authentication headers
     */
    getAuthHeaders() {
        if (!this.authenticated) {
            throw new Error('Not authenticated. Call authenticate() first.');
        }

        return {
            'X-VIZ-Account': this.account,
            'X-VIZ-Challenge': this.challenge,
            'X-VIZ-Signature': this.signature
        };
    }

    /**
     * Upload file to hub
     */
    async upload(file, options = {}) {
        if (!this.authenticated) {
            throw new Error('Not authenticated. Call authenticate() first.');
        }

        const formData = new FormData();
        formData.append('file', file);

        if (options.public !== undefined) {
            formData.append('public', options.public ? '1' : '0');
        }
        if (options.description) {
            formData.append('description', options.description);
        }

        const response = await fetch(`${this.hubUrl}?action=upload`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: formData
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error?.message || 'Upload failed');
        }

        // Re-authenticate for next request (challenge is one-time use)
        this.authenticated = false;

        return data;
    }

    /**
     * Get file metadata
     */
    async getMetadata(fileId) {
        const url = `${this.hubUrl}?action=metadata&file_id=${encodeURIComponent(fileId)}`;

        const headers = {};
        if (this.authenticated) {
            Object.assign(headers, this.getAuthHeaders());
        }

        const response = await fetch(url, { headers });
        return await response.json();
    }

    /**
     * Get file download URL
     */
    getDownloadUrl(fileId) {
        return `${this.hubUrl}?action=download&file_id=${encodeURIComponent(fileId)}`;
    }

    /**
     * Download file as blob
     */
    async download(fileId) {
        const url = this.getDownloadUrl(fileId);

        const headers = {};
        if (this.authenticated) {
            Object.assign(headers, this.getAuthHeaders());
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Download failed');
        }

        return await response.blob();
    }

    /**
     * List account files (requires authentication)
     */
    async listFiles() {
        if (!this.authenticated) {
            throw new Error('Not authenticated. Call authenticate() first.');
        }

        const response = await fetch(`${this.hubUrl}?action=list`, {
            headers: this.getAuthHeaders()
        });

        const data = await response.json();

        // Re-authenticate for next request
        this.authenticated = false;

        return data;
    }

    /**
     * Delete file (requires authentication)
     */
    async deleteFile(fileId) {
        if (!this.authenticated) {
            throw new Error('Not authenticated. Call authenticate() first.');
        }

        const response = await fetch(`${this.hubUrl}?action=delete&file_id=${encodeURIComponent(fileId)}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });

        const data = await response.json();

        // Re-authenticate for next request
        this.authenticated = false;

        return data;
    }

    /**
     * Get upload status (for resumable uploads)
     */
    async getUploadStatus(uploadId) {
        const response = await fetch(`${this.hubUrl}?action=status&upload_id=${encodeURIComponent(uploadId)}`);
        return await response.json();
    }
}

/**
 * Hub Registry - Manage multiple hubs
 */
class HubRegistry {
    constructor() {
        this.hubs = new Map();
        this.defaultHub = null;
    }

    /**
     * Add hub to registry
     */
    async addHub(name, url, setDefault = false) {
        const client = new FileHubClient(url);

        try {
            const info = await client.getHubInfo();
            this.hubs.set(name, {
                client: client,
                url: url,
                info: info
            });

            if (setDefault || !this.defaultHub) {
                this.defaultHub = name;
            }

            return info;
        } catch (error) {
            throw new Error(`Failed to connect to hub: ${error.message}`);
        }
    }

    /**
     * Get hub client by name
     */
    getHub(name = null) {
        const hubName = name || this.defaultHub;
        const hub = this.hubs.get(hubName);

        if (!hub) {
            throw new Error(`Hub not found: ${hubName}`);
        }

        return hub.client;
    }

    /**
     * List registered hubs
     */
    listHubs() {
        const list = [];
        for (const [name, hub] of this.hubs) {
            list.push({
                name: name,
                url: hub.url,
                info: hub.info,
                isDefault: name === this.defaultHub
            });
        }
        return list;
    }

    /**
     * Set default hub
     */
    setDefaultHub(name) {
        if (!this.hubs.has(name)) {
            throw new Error(`Hub not found: ${name}`);
        }
        this.defaultHub = name;
    }

    /**
     * Remove hub from registry
     */
    removeHub(name) {
        if (this.defaultHub === name) {
            this.defaultHub = null;
        }
        return this.hubs.delete(name);
    }
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

/*
// Example 1: Basic usage with single hub
const hub = new FileHubClient('https://files.example.com/scripts/hub.php');

// Get hub info (no auth required)
const info = await hub.getHubInfo();
console.log('Hub:', info.hub.name);

// Authenticate
await hub.authenticate('myaccount', '5K...');  // VIZ private key

// Upload file
const fileInput = document.querySelector('input[type="file"]');
const result = await hub.upload(fileInput.files[0], {
    public: true,
    description: 'My avatar'
});
console.log('Uploaded:', result.file_id);

// Get download URL
const downloadUrl = hub.getDownloadUrl(result.file_id);


// Example 2: Multiple hubs
const registry = new HubRegistry();

// Add hubs
await registry.addHub('primary', 'https://hub1.example.com/scripts/hub.php', true);
await registry.addHub('backup', 'https://hub2.example.com/scripts/hub.php');

// Use default hub
const defaultHub = registry.getHub();
await defaultHub.authenticate('myaccount', '5K...');
await defaultHub.upload(file);

// Use specific hub
const backupHub = registry.getHub('backup');
await backupHub.authenticate('myaccount', '5K...');
await backupHub.upload(file);


// Example 3: Integration with avatar system
async function uploadAvatar(account, privateKey, imageFile, hubUrl) {
    const hub = new FileHubClient(hubUrl);

    // Authenticate
    await hub.authenticate(account, privateKey);

    // Upload
    const result = await hub.upload(imageFile, {
        public: true,
        description: 'Profile avatar'
    });

    // Return permanent URL
    return hub.getDownloadUrl(result.file_id);
}

// Use in profile update
const avatarUrl = await uploadAvatar(
    'myaccount',
    '5KxyzPrivateKey...',
    avatarFile,
    'https://hub.example.com/scripts/hub.php'
);

// Store in VIZ profile
viz.broadcast.accountMetadata(
    privateKey,
    'myaccount',
    JSON.stringify({ avatar: avatarUrl, nickname: 'My Name' }),
    function(err, result) {
        console.log('Profile updated');
    }
);
*/

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FileHubClient, HubRegistry };
}
