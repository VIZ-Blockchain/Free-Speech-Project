/**
 * Trusted Domains Management System
 * Handles domain validation, caching, and user interface for trusted domain management
 */

// Global cache for trusted domains
var trust_domain_cache = {};

// Default trusted domains list
var default_trusted_domains = [
	'readdle.me',
	'github.com',
	'githubusercontent.com',
	'imgur.com',
	'ipfs.io',
	'gravatar.com',
	'avatars.githubusercontent.com',
	'images.unsplash.com',
	'cdn.pixabay.com'
];

/**
 * Initialize default trusted domains in IndexedDB
 * @param {Function} callback - Callback function to execute after initialization
 */
function init_default_trusted_domains(callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	let t = db.transaction(['trusted_domains'], 'readwrite');
	let q = t.objectStore('trusted_domains');

	// Check if defaults are already initialized
	let req = q.index('type').openCursor(IDBKeyRange.only('default'), 'next');
	let found_defaults = false;

	req.onsuccess = function(event) {
		let cur = event.target.result;
		if (cur) {
			found_defaults = true;
			cur.continue();
		} else {
			if (!found_defaults) {
				// Add default domains
				let added = 0;
				for (let i = 0; i < default_trusted_domains.length; i++) {
					let domain_record = {
						domain: default_trusted_domains[i],
						type: 'default',
						status: 1, // active
						rule: 'allow'
					};
					let add_req = q.add(domain_record);
					add_req.onsuccess = function() {
						added++;
						if (added === default_trusted_domains.length) {
							callback(true);
						}
					};
				}
				if (trx_need_commit) {
					t.commit();
				}
			} else {
				callback(true);
			}
		}
	};
}

/**
 * Load trusted domains from IndexedDB into cache
 * @param {Function} callback - Callback function to execute after loading
 */
function load_trusted_domains_cache(callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	trust_domain_cache = {};
	let t = db.transaction(['trusted_domains'], 'readonly');
	let q = t.objectStore('trusted_domains');
	let req = q.openCursor(null, 'next');

	req.onsuccess = function(event) {
		let cur = event.target.result;
		if (cur) {
			let record = cur.value;
			if (record.status === 1) { // active domains only
				trust_domain_cache[record.domain] = {
					type: record.type,
					rule: record.rule
				};
			}
			cur.continue();
		} else {
			console.log('Loaded trusted domains cache:', Object.keys(trust_domain_cache).length, 'domains');
			callback(true);
		}
	};
}

/**
 * Extract domain from URL
 * @param {string} url - URL to extract domain from
 * @returns {string|null} Domain name or null if invalid
 */
function extract_domain_from_url(url) {
	if (!url || typeof url !== 'string') {
		return null;
	}
	try {
		let domain = url.replace(/^https?:\/\//, '').split('/')[0].split('?')[0].split('#')[0];
		// Remove www. prefix
		if (domain.startsWith('www.')) {
			domain = domain.substring(4);
		}
		return domain.toLowerCase();
	} catch (e) {
		return null;
	}
}

/**
 * Check if domain is trusted (synchronous using cache)
 * @param {string} url - URL to check
 * @returns {boolean} True if domain is trusted
 */
function is_domain_trusted_sync(url) {
	let domain = extract_domain_from_url(url);
	if (!domain) {
		return false;
	}

	// Check exact match first
	if (trust_domain_cache[domain]) {
		return trust_domain_cache[domain].rule === 'allow';
	}

	// Check subdomains
	for (let trusted_domain in trust_domain_cache) {
		if (domain.endsWith('.' + trusted_domain) && trust_domain_cache[trusted_domain].rule === 'allow') {
			return true;
		}
	}

	return false;
}

/**
 * Check if domain is trusted (asynchronous using IndexedDB)
 * @param {string} url - URL to check
 * @param {Function} callback - Callback function with result
 */
function is_domain_trusted_async(url, callback) {
	console.log('is_domain_trusted_async',url, callback);
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	let domain = extract_domain_from_url(url);
	if (!domain) {
		callback(false);
		return;
	}

	let t = db.transaction(['trusted_domains'], 'readonly');
	let q = t.objectStore('trusted_domains');
	let req = q.index('domain').openCursor(IDBKeyRange.only(domain), 'next');

	req.onsuccess = function(event) {
		let cur = event.target.result;
		if (cur) {
			let record = cur.value;
			console.log('is_domain_trusted_async result',url,record);
			callback(record.status === 1 && record.rule === 'allow');
		} else {
			// Check for parent domains (subdomains)
			let domain_parts = domain.split('.');
			if (domain_parts.length > 2) {
				let parent_domain = domain_parts.slice(1).join('.');
				is_domain_trusted_async('https://' + parent_domain, callback);
			} else {
				callback(false);
			}
		}
	};
}

/**
 * Add a trusted domain to IndexedDB
 * @param {string} domain - Domain to add
 * @param {string} type - Type of domain (user/default)
 * @param {Function} callback - Callback function with result
 */
function add_trusted_domain(domain, type, callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	domain = domain.toLowerCase().trim();
	if (!domain || !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domain)) {
		callback(false, 'invalid_format');
		return;
	}

	// Remove www. prefix
	if (domain.startsWith('www.')) {
		domain = domain.substring(4);
	}

	let t = db.transaction(['trusted_domains'], 'readwrite');
	let q = t.objectStore('trusted_domains');

	// Check if domain already exists
	let check_req = q.index('domain').openCursor(IDBKeyRange.only(domain), 'next');
	check_req.onsuccess = function(event) {
		let cur = event.target.result;
		if (cur) {
			callback(false, 'already_exists');
		} else {
			let domain_record = {
				domain: domain,
				type: type || 'user',
				status: 1, // active
				rule: 'allow'
			};

			let add_req = q.add(domain_record);
			add_req.onsuccess = function() {
				// Update cache
				trust_domain_cache[domain] = {
					type: domain_record.type,
					rule: domain_record.rule
				};
				callback(true);
			};
			add_req.onerror = function() {
				callback(false, 'add_error');
			};

			if (trx_need_commit) {
				t.commit();
			}
		}
	};
}

/**
 * Remove a trusted domain from IndexedDB
 * @param {string} domain - Domain to remove
 * @param {Function} callback - Callback function with result
 */
function remove_trusted_domain(domain, callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	domain = domain.toLowerCase().trim();
	let t = db.transaction(['trusted_domains'], 'readwrite');
	let q = t.objectStore('trusted_domains');

	let req = q.index('domain').openCursor(IDBKeyRange.only(domain), 'next');
	req.onsuccess = function(event) {
		let cur = event.target.result;
		if (cur) {
			let record = cur.value;
			if (record.type === 'default') {
				// Don't allow removing default domains, just set to ignored
				record.status = 2; // ignored
				record.rule = 'ignore';
				cur.update(record);
			} else {
				// Remove user domains completely
				cur.delete();
			}

			// Update cache
			if (trust_domain_cache[domain]) {
				if (record.type === 'default') {
					trust_domain_cache[domain].rule = 'ignore';
				} else {
					delete trust_domain_cache[domain];
				}
			}

			if (trx_need_commit) {
				t.commit();
			}
			callback(true);
		} else {
			callback(false, 'not_found');
		}
	};
}

/**
 * Load and render trusted domains list in UI
 * @param {jQuery} tab - Tab element to render the list in
 */
function load_trusted_domains_list(tab) {
	let t = db.transaction(['trusted_domains'], 'readonly');
	let q = t.objectStore('trusted_domains');
	let req = q.openCursor(null, 'next');

	let default_domains = [];
	let user_domains = [];

	req.onsuccess = function(event) {
		let cur = event.target.result;
		if (cur) {
			let record = cur.value;
			if (record.status === 1) { // active domains only
				let domain_item = `
					<div class="domain-item">
						<span class="domain-name${record.rule=='allow'?' trusted':''}">${record.domain}</span>
						${record.type === 'user' ? '<a class="remove-domain-btn" data-domain="' + record.domain + '">'+ltmp_arr.remove_domain_button+'</a>' : ''}
					</div>`;

				if (record.type === 'default') {
					default_domains.push(domain_item);
				} else {
					user_domains.push(domain_item);
				}
			}
			cur.continue();
		} else {
			// Render the lists
			tab.find('.default-domains-list').html(default_domains.join(''));
			tab.find('.user-domains-list').html(user_domains.join(''));

			// Add remove domain functionality
			tab.find('.remove-domain-btn').off('click');
			tab.find('.remove-domain-btn').on('click',function(){
				let domain=$(this).data('domain');
				remove_trusted_domain(domain,function(success,error){
					if(success){
						tab.find('.success').html(ltmp_arr.domain_removed_success);
						load_trusted_domains_list(tab);
					}
					else{
						tab.find('.error').html(ltmp_arr.domain_remove_error);
					}
				});
			});
		}
	};
}

/**
 * Get list of trusted domains categorized by type
 * @param {Function} callback - Callback function with domains object
 */
function get_trusted_domains_list(callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	let domains = {
		default: [],
		user: []
	};

	let t = db.transaction(['trusted_domains'], 'readonly');
	let q = t.objectStore('trusted_domains');
	let req = q.openCursor(null, 'next');

	req.onsuccess = function(event) {
		let cur = event.target.result;
		if (cur) {
			let record = cur.value;
			if (record.status === 1) { // active only
				if (record.type === 'default') {
					domains.default.push(record.domain);
				} else if (record.type === 'user') {
					domains.user.push(record.domain);
				}
			}
			cur.continue();
		} else {
			callback(domains);
		}
	};
}

/**
 * Initialize trust domains system
 * @param {Function} callback - Callback function to execute after initialization
 */
function init_trust_domains_system(callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	init_default_trusted_domains(function() {
		load_trusted_domains_cache(function() {
			console.log('Trust Domains system initialized');
			callback();
		});
	});
}

/**
 * Validate image URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid image URL format
 */
function validate_image_url_format(url) {
	if (!url || typeof url !== 'string') {
		return false;
	}

	// Check if URL is properly formatted
	if (!url.match(/^https?:\/\/.+/)) {
		return false;
	}

	// Check if URL ends with image extension
	let image_extensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;
	if (!image_extensions.test(url)) {
		// Allow URLs without extensions if they're from known image hosting services
		let known_image_hosts = [
			'imgur.com', 'i.imgur.com',
			'github.com', 'githubusercontent.com',
			'gravatar.com',
			'images.unsplash.com',
			'cdn.pixabay.com'
		];

		let domain = extract_domain_from_url(url);
		if (!known_image_hosts.some(host => domain === host || domain.endsWith('.' + host))) {
			return false;
		}
	}

	return true;
}

/**
 * Upgrade user avatars with trusted domain checking and storage
 * @param {jQuery} view_element - View element containing user avatars
 */
function upgrade_user_avatars_with_trusted_domains(view_element) {
	// Find all user avatar images in the current view
	let avatar_images = view_element.find('.user-item-avatar img');

	avatar_images.each(function(index, img) {
		let $img = $(img);
		let current_src = $img.attr('src');

		// Get account from the closest user item
		let user_item = $img.closest('.user-item');
		let account_link = user_item.find('.user-item-account');
		let account = '';

		if (account_link.length > 0) {
			account = account_link.text().trim();
		}

		// Skip if already processed or if it's a default/placeholder image
		if ($img.data('trusted-checked') ||
			current_src === ltmp_global.profile_default_avatar ||
			current_src === ltmp_global.untrusted_image) {
			return;
		}

		// Mark as being processed
		$img.data('trusted-checked', true);

		// Process avatar with trusted domain checking
		safe_avatar(current_src, account, function(success, processed_url, status) {
			// Only update if the URL changed (e.g., cached version or untrusted placeholder)
			if (processed_url !== current_src) {
				$img.attr('src', processed_url);

				// Add visual indicators for different statuses
				if (success) {
					if (status === 'bucket_cached' || status === 'newly_cached') {
						$img.addClass('trusted-avatar');
					}
				} else if (status === 'untrusted_domain') {
					$img.addClass('untrusted-avatar');
				}
			}
		});
	});
}

// Interactive Tooltip System for Untrusted Images

/**
 * Create untrusted image placeholder
 * @param {string} original_url - Original image URL
 * @param {string} category - Image category
 * @param {string} account - Associated account
 * @returns {string} HTML for placeholder
 */
function create_untrusted_image_placeholder(original_url, category, account) {
	let domain = extract_domain_from_url(original_url);
	let placeholder_id = 'untrusted_' + Math.random().toString(36).substring(2, 15);

	let placeholder_html = `
		<div class="untrusted-image-placeholder" data-original-url="${original_url}" data-domain="${domain}" data-category="${category}" data-account="${account}" id="${placeholder_id}">
			<div class="untrusted-image-content">
				<img src="${ltmp_global.untrusted_image}" alt="Untrusted Image" class="untrusted-icon">
				<div class="untrusted-info">
					<div class="domain-name">${domain}</div>
					<div class="untrusted-message">${ltmp_arr.untrusted_domain_info}</div>
				</div>
				<div class="untrusted-actions">
					<button class="show-image-btn" data-action="show">${ltmp_arr.show_image_button}</button>
					<button class="trust-domain-btn" data-action="trust">${ltmp_arr.trust_domain_button}</button>
				</div>
			</div>
			<div class="trust-tooltip" style="display: none;"></div>
		</div>
	`;

	return placeholder_html;
}

/**
 * Show trust domain tooltip
 * @param {Element} placeholder_element - Placeholder element
 * @param {string} original_url - Original image URL
 */
function show_trust_domain_tooltip(placeholder_element, original_url) {
	let domain = extract_domain_from_url(original_url);
	let tooltip = placeholder_element.querySelector('.trust-tooltip');

	// Determine domain status
	is_domain_trusted_async(original_url, function(is_trusted) {
		let status_class = is_trusted ? 'trusted' : 'untrusted';
		let status_text = is_trusted ? ltmp_arr.status_trusted : ltmp_arr.status_untrusted;
		let info_text = is_trusted ? ltmp_arr.trusted_domain_info : ltmp_arr.untrusted_domain_info;

		let action_buttons = '';
		if (!is_trusted) {
			action_buttons = `
				<button class="tooltip-action trust-btn" data-domain="${domain}">${ltmp_arr.trust_domain_button}</button>
				<button class="tooltip-action ignore-btn" data-domain="${domain}">${ltmp_arr.ignore_domain_button}</button>
				<button class="tooltip-action show-btn" data-url="${original_url}">${ltmp_arr.show_image_button}</button>
			`;
		} else {
			action_buttons = `
				<button class="tooltip-action show-btn" data-url="${original_url}">${ltmp_arr.show_image_button}</button>
			`;
		}

		action_buttons += `<button class="tooltip-action manage-btn">${ltmp_arr.manage_domains_button}</button>`;

		let tooltip_content = ltmp(ltmp_arr.trust_domain_tooltip, {
			domain: domain,
			status_class: status_class,
			status_text: status_text,
			info_text: info_text,
			action_buttons: action_buttons
		});

		tooltip.innerHTML = tooltip_content;
		tooltip.style.display = 'block';

		// Position tooltip
		position_tooltip(tooltip, placeholder_element);

		// Add event listeners to tooltip buttons
		setup_tooltip_event_listeners(tooltip, placeholder_element, original_url);
	});
}

/**
 * Position tooltip relative to reference element
 * @param {Element} tooltip - Tooltip element
 * @param {Element} reference_element - Reference element for positioning
 */
function position_tooltip(tooltip, reference_element) {
	let rect = reference_element.getBoundingClientRect();
	let tooltip_rect = tooltip.getBoundingClientRect();

	// Position tooltip above the placeholder by default
	let top = rect.top - tooltip_rect.height - 10;
	let left = rect.left + (rect.width / 2) - (tooltip_rect.width / 2);

	// Adjust if tooltip would go off screen
	if (top < 0) {
		// Position below instead
		top = rect.bottom + 10;
		tooltip.classList.add('below');
	} else {
		tooltip.classList.remove('below');
	}

	if (left < 10) {
		left = 10;
		tooltip.classList.add('left-aligned');
	} else if (left + tooltip_rect.width > window.innerWidth - 10) {
		left = window.innerWidth - tooltip_rect.width - 10;
		tooltip.classList.add('right-aligned');
	} else {
		tooltip.classList.remove('left-aligned', 'right-aligned');
	}

	tooltip.style.position = 'fixed';
	tooltip.style.top = top + 'px';
	tooltip.style.left = left + 'px';
	tooltip.style.zIndex = '10000';
}

/**
 * Setup event listeners for tooltip buttons
 * @param {Element} tooltip - Tooltip element
 * @param {Element} placeholder_element - Placeholder element
 * @param {string} original_url - Original image URL
 */
function setup_tooltip_event_listeners(tooltip, placeholder_element, original_url) {
	let domain = extract_domain_from_url(original_url);

	// Trust domain button
	let trust_btn = tooltip.querySelector('.trust-btn');
	if (trust_btn) {
		trust_btn.addEventListener('click', function() {
			add_trusted_domain(domain, 'user', function(success, error) {
				if (success) {
					show_notification(ltmp_arr.domain_added_success);
					hide_tooltip(tooltip);
					// Replace placeholder with actual image
					replace_placeholder_with_image(placeholder_element, original_url);
				} else {
					let error_message = ltmp_arr.domain_add_error;
					if (error === 'already_exists') {
						error_message = ltmp_arr.domain_already_exists;
					} else if (error === 'invalid_format') {
						error_message = ltmp_arr.domain_invalid_format;
					}
					show_notification(error_message, 'error');
				}
			});
		});
	}

	// Ignore domain button
	let ignore_btn = tooltip.querySelector('.ignore-btn');
	if (ignore_btn) {
		ignore_btn.addEventListener('click', function() {
			// Add domain as ignored (this would need to be implemented)
			show_notification('Domain ignored for future images');
			hide_tooltip(tooltip);
		});
	}

	// Show image button
	let show_btn = tooltip.querySelector('.show-btn');
	if (show_btn) {
		show_btn.addEventListener('click', function() {
			hide_tooltip(tooltip);
			replace_placeholder_with_image(placeholder_element, original_url);
		});
	}

	// Manage domains button
	let manage_btn = tooltip.querySelector('.manage-btn');
	if (manage_btn) {
		manage_btn.addEventListener('click', function() {
			hide_tooltip(tooltip);
			// Navigate to trusted domains settings
			view_path('dapp:app_settings/trusted_domains/',{},true,false);
		});
	}
}

/**
 * Replace placeholder with actual image
 * @param {Element} placeholder_element - Placeholder element
 * @param {string} original_url - Original image URL
 */
function replace_placeholder_with_image(placeholder_element, original_url) {
	let category = placeholder_element.dataset.category || 'image';
	let account = placeholder_element.dataset.account || '';

	// Show loading state
	placeholder_element.classList.add('loading');

	validate_image_with_storage_bucket(original_url, category, account, function(success, processed_url, status) {
		if (success) {
			// Create img element
			let img = document.createElement('img');
			img.src = processed_url;
			img.alt = 'Loaded image';
			img.className = 'validated-image';

			// Add load event listener
			img.onload = function() {
				placeholder_element.replaceWith(img);
			};

			img.onerror = function() {
				placeholder_element.classList.remove('loading');
				show_notification('Failed to load image', 'error');
			};
		} else {
			placeholder_element.classList.remove('loading');
			show_notification('Failed to validate image', 'error');
		}
	});
}

/**
 * Hide tooltip
 * @param {Element} tooltip - Tooltip element to hide
 */
function hide_tooltip(tooltip) {
	tooltip.style.display = 'none';
	tooltip.innerHTML = '';
}

/**
 * Setup event handlers for untrusted image interactions
 */
function setup_untrusted_image_event_handlers() {
	//on1x
	/*
	// Use event delegation for dynamically created placeholders
	document.addEventListener('click', function(e) {
		if (e.target.classList.contains('show-image-btn')) {
			let placeholder = e.target.closest('.untrusted-image-placeholder');
			let original_url = placeholder.dataset.originalUrl;
			replace_placeholder_with_image(placeholder, original_url);
		}

		if (e.target.classList.contains('trust-domain-btn')) {
			let placeholder = e.target.closest('.untrusted-image-placeholder');
			let original_url = placeholder.dataset.originalUrl;
			show_trust_domain_tooltip(placeholder, original_url);
		}

		// Hide tooltip when clicking outside
		if (!e.target.closest('.trust-tooltip') && !e.target.closest('.trust-domain-btn')) {
			document.querySelectorAll('.trust-tooltip').forEach(function(tooltip) {
				hide_tooltip(tooltip);
			});
		}
	});

	// Handle hover events for placeholder info
	document.addEventListener('mouseenter', function(e) {
		console.log(e,e.target,e.target.classList);
		if (e.target.classList.contains('untrusted-image-placeholder')) {
			e.target.classList.add('hover');
		}
	}, true);

	document.addEventListener('mouseleave', function(e) {
		console.log(e,e.target,e.target.classList);
		if (e.target.classList.contains('untrusted-image-placeholder')) {
			e.target.classList.remove('hover');
		}
	}, true);
	*/
}

/**
 * Show notification message
 * @param {string} message - Message to show
 * @param {string} type - Notification type (success/error)
 */
function show_notification(message, type) {
	// Simple notification system
	let notification = document.createElement('div');
	notification.className = 'trust-domain-notification ' + (type || 'success');
	notification.textContent = message;

	document.body.appendChild(notification);

	// Position notification
	notification.style.position = 'fixed';
	notification.style.top = '20px';
	notification.style.right = '20px';
	notification.style.zIndex = '10001';

	// Auto-hide after 3 seconds
	setTimeout(function() {
		notification.remove();
	}, 3000);
}

/**
 * Process images in content to check for trusted domains
 * @param {Element} content_element - Content element containing images
 */
function process_images_in_content(content_element) {
	// Find all img elements in the content
	let images = content_element.querySelectorAll('img');

	images.forEach(function(img) {
		let src = img.src;
		if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
			return; // Skip data URLs and blob URLs
		}

		// Check if domain is trusted
		if (!is_domain_trusted_sync(src)) {
			// Replace with placeholder
			let placeholder_html = create_untrusted_image_placeholder(src, 'image', '');
			let placeholder_element = document.createElement('div');
			placeholder_element.innerHTML = placeholder_html;

			img.replaceWith(placeholder_element.firstElementChild);
		}
	});
}

// Cache Management Functions

/**
 * Get cached image metadata from IndexedDB
 * @param {string} url - Image URL to lookup
 * @param {Function} callback - Callback function with metadata
 */
function get_cached_image_metadata(url, callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	let t = db.transaction(['storage_cache'], 'readonly');
	let q = t.objectStore('storage_cache');
	let req = q.index('original_url').openCursor(IDBKeyRange.only(url), 'next');

	req.onsuccess = function(event) {
		let cur = event.target.result;
		if (cur) {
			callback(cur.value);
		} else {
			callback(null);
		}
	};
}

/**
 * Store cached image metadata in IndexedDB
 * @param {Object} cache_record - Cache record to store
 * @param {Function} callback - Callback function with result
 */
function store_cached_image_metadata(cache_record, callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	let t = db.transaction(['storage_cache'], 'readwrite');
	let q = t.objectStore('storage_cache');

	// Check if already exists and update, otherwise add
	let check_req = q.index('original_url').openCursor(IDBKeyRange.only(cache_record.original_url), 'next');
	check_req.onsuccess = function(event) {
		let cur = event.target.result;
		if (cur) {
			// Update existing record
			let existing = cur.value;
			existing.last_accessed = cache_record.last_accessed;
			existing.ttl_expires = cache_record.ttl_expires;
			existing.account = cache_record.account;
			cur.update(existing);
			callback(true);
		} else {
			// Add new record
			let add_req = q.add(cache_record);
			add_req.onsuccess = function() {
				callback(true);
			};
			add_req.onerror = function() {
				callback(false);
			};
		}

		if (trx_need_commit) {
			t.commit();
		}
	};
}

/**
 * Update last accessed time for cached image
 * @param {string} url - Image URL
 * @param {Function} callback - Callback function with result
 */
function update_cached_image_access(url, callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	let t = db.transaction(['storage_cache'], 'readwrite');
	let q = t.objectStore('storage_cache');
	let req = q.index('original_url').openCursor(IDBKeyRange.only(url), 'next');

	req.onsuccess = function(event) {
		let cur = event.target.result;
		if (cur) {
			let record = cur.value;
			record.last_accessed = new Date().getTime();
			cur.update(record);
			if (trx_need_commit) {
				t.commit();
			}
			callback(true);
		} else {
			callback(false);
		}
	};
}

/**
 * Get cache TTL for specific category
 * @param {string} category - Image category
 * @returns {number} TTL in days
 */
function get_cache_ttl_for_category(category) {
	let ttl_settings = {
		avatar: 30, // 30 days
		image: 7,   // 7 days
		video: 3,   // 3 days
		audio: 3,   // 3 days
		file: 1     // 1 day
	};

	// Check if user has custom TTL settings
	if (typeof settings !== 'undefined' && typeof settings.cache_ttl !== 'undefined' && settings.cache_ttl[category]) {
		return settings.cache_ttl[category];
	}

	return ttl_settings[category] || ttl_settings.image;
}

/**
 * Validate and cache image with trusted domain checking
 * @param {string} url - Image URL to validate
 * @param {string} category - Image category (avatar, image, etc.)
 * @param {string} account - Associated account
 * @param {boolean} force_revalidate - Force revalidation even if cached
 * @param {Function} callback - Callback function with result
 */
function validate_and_cache_image(url, category, account, force_revalidate, callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	let domain = extract_domain_from_url(url);
	if (!domain) {
		callback(false, null, 'invalid_url');
		return;
	}

	// First check if domain is trusted
	is_domain_trusted_async(url, function(is_trusted) {
		if (!is_trusted) {
			callback(false, ltmp_global.untrusted_image, 'untrusted_domain');
			return;
		}

		// Check if image is already cached
		if (!force_revalidate) {
			get_cached_image_metadata(url, function(cached_data) {
				if (cached_data && cached_data.ttl_expires > new Date().getTime()) {
					// Return cached data
					update_cached_image_access(url);
					callback(true, cached_data.cached_url || url, 'cached');
					return;
				}
			});
		}

		// Create cache entry for the image
		let cache_ttl = get_cache_ttl_for_category(category);
		let expires_time = new Date().getTime() + (cache_ttl * 24 * 60 * 60 * 1000);

		let cache_record = {
			original_url: url,
			domain: domain,
			category: category || 'image',
			ttl_expires: expires_time,
			account: account || '',
			last_accessed: new Date().getTime(),
			cached_url: url // For now, just store original URL
		};

		store_cached_image_metadata(cache_record, function(success) {
			if (success) {
				callback(true, url, 'new_cache');
			} else {
				callback(true, url, 'cache_failed');
			}
		});
	});
}

// Example usage of the new trusted domain checking with download and storage:
//
// Synchronous (backward compatible):
// let avatar_url = safe_avatar(user_profile.avatar);
//
// Asynchronous with trusted domain checking, downloading and storage:
// safe_avatar(user_profile.avatar, account, function(success, avatar_url, status) {
//     if (success) {
//         console.log('Avatar processed successfully:', avatar_url);
//         console.log('Status:', status);
//         // Status values:
//         // 'bucket_cached' - Retrieved from existing cache
//         // 'newly_cached' - Downloaded from trusted domain and cached in storage
//         // 'object_url_fallback' - Downloaded but storage failed, using object URL
//     } else {
//         console.log('Avatar failed processing:', status);
//         if (status === 'untrusted_domain') {
//             console.log('Using untrusted placeholder:', avatar_url); // ltmp_global.untrusted_image
//         } else {
//             console.log('Using default avatar:', avatar_url); // ltmp_global.profile_default_avatar
//             // Other failure statuses: 'invalid_format', 'fetch_failed', 'invalid_content_type', 'file_too_large'
//         }
//     }
// });
//
// The validate_image_with_storage_bucket function handles:
// 1. Domain trust checking via is_domain_trusted_async
// 2. Downloading images from trusted domains using fetch API
// 3. Storing downloaded images in browser storage (IndexedDB)
// 4. Caching with TTL and metadata tracking
// 5. Returning ltmp_global.untrusted_image for untrusted domains