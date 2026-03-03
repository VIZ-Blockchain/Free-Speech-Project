// Storage Bucket Manager functions for Free-Speech-Project
// Manages browser Storage Buckets API for trusted image caching
// Auto-enables storage buckets for enhanced performance and quota management

// Global variables for storage bucket management
var storage_bucket_supported = false;
var storage_bucket_instance = null;
var storage_bucket_enabled = false;

// Check if browser supports Storage Buckets API
function check_storage_bucket_support() {
	return typeof navigator.storageBuckets !== 'undefined' &&
		   typeof StorageBucketManager !== 'undefined';
}

// Storage Bucket Manager - Auto-enables storage buckets for trusted image caching
// if the browser supports the Storage Buckets API and user hasn't explicitly disabled it
function init_storage_bucket_manager(callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	storage_bucket_supported = check_storage_bucket_support();
	console.log('Storage Buckets API supported:', storage_bucket_supported);

	if (storage_bucket_supported) {
		// Check if user has previously disabled storage buckets
		let bucket_setting = localStorage.getItem(storage_prefix + 'storage_buckets_enabled');

		// Auto-enable storage buckets if supported and not explicitly disabled
		if (bucket_setting === null || bucket_setting === 'true') {
			console.log('Auto-enabling storage buckets due to browser support');
			enable_storage_buckets(function(success, error) {
				if (success) {
					console.log('Storage Bucket Manager initialized and enabled successfully');
				} else {
					console.log('Failed to enable Storage Bucket Manager:', error);
					storage_bucket_enabled = false;
				}
				callback(success);
			});
		} else {
			console.log('Storage buckets disabled by user preference');
			callback(true);
		}
	} else {
		console.log('Storage Buckets API not supported in this browser');
		callback(true);
	}
}

// Create storage bucket for trusted image cache
function create_storage_bucket(callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	if (!storage_bucket_supported) {
		callback(false);
		return;
	}

	try {
		navigator.storageBuckets.open('trusted_images_cache', {
			quota: 1024 * 1024 * 100, // Request 100MB quota
			persist: true
		}).then(function(bucket) {
			storage_bucket_instance = bucket;
			console.log('Storage bucket created/opened successfully');
			callback(true);
		}).catch(function(error) {
			console.error('Failed to create storage bucket:', error);
			callback(false);
		});
	} catch (error) {
		console.error('Storage bucket creation error:', error);
		callback(false);
	}
}

// Get storage bucket information including quota and usage statistics
function get_storage_bucket_info(callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	if (!storage_bucket_supported || !storage_bucket_instance) {
		callback({
			supported: false,
			enabled: false,
			quota: 0,
			usage: 0,
			available: 0
		});
		return;
	}

	try {
		storage_bucket_instance.estimate().then(function(estimate) {
			callback({
				supported: true,
				enabled: storage_bucket_enabled,
				quota: estimate.quota || 0,
				usage: estimate.usage || 0,
				available: (estimate.quota || 0) - (estimate.usage || 0)
			});
		}).catch(function(error) {
			console.error('Failed to get storage estimate:', error);
			callback({
				supported: true,
				enabled: storage_bucket_enabled,
				quota: 0,
				usage: 0,
				available: 0,
				error: error.message
			});
		});
	} catch (error) {
		console.error('Storage bucket estimate error:', error);
		callback({
			supported: true,
			enabled: storage_bucket_enabled,
			quota: 0,
			usage: 0,
			available: 0,
			error: error.message
		});
	}
}

// Enable storage buckets and create bucket instance
function enable_storage_buckets(callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	if (!storage_bucket_supported) {
		callback(false, 'not_supported');
		return;
	}

	storage_bucket_enabled = true;
	localStorage.setItem(storage_prefix + 'storage_buckets_enabled', 'true');

	create_storage_bucket(function(success) {
		if (success) {
			callback(true);
		} else {
			storage_bucket_enabled = false;
			localStorage.setItem(storage_prefix + 'storage_buckets_enabled', 'false');
			callback(false, 'creation_failed');
		}
	});
}

// Disable storage buckets and clear bucket content
function disable_storage_buckets(callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	storage_bucket_enabled = false;
	localStorage.setItem(storage_prefix + 'storage_buckets_enabled', 'false');

	if (storage_bucket_instance) {
		try {
			// Clear the bucket content if possible
			clear_storage_bucket(function() {
				storage_bucket_instance = null;
				callback(true);
			});
		} catch (error) {
			console.error('Error disabling storage bucket:', error);
			storage_bucket_instance = null;
			callback(true); // Still consider it disabled
		}
	} else {
		callback(true);
	}
}

// Store image blob in storage bucket with metadata
function store_image_in_bucket(url, blob_data, metadata, callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	if (!storage_bucket_enabled || !storage_bucket_instance) {
		callback(false, 'bucket_not_available');
		return;
	}

	try {
		let cache_key = 'img_' + btoa(url).replace(/[^a-zA-Z0-9]/g, '_');

		storage_bucket_instance.caches.open('images').then(function(cache) {
			let response = new Response(blob_data, {
				headers: {
					'Content-Type': metadata.contentType || 'image/jpeg',
					'X-Cached-URL': url,
					'X-Cache-Time': new Date().toISOString(),
					'X-TTL-Expires': metadata.ttl_expires || ''
				}
			});

			cache.put(cache_key, response).then(function() {
				console.log('Image stored in storage bucket:', cache_key);
				callback(true, cache_key);
			}).catch(function(error) {
				console.error('Failed to store image in bucket:', error);
				callback(false, error.message);
			});
		}).catch(function(error) {
			console.error('Failed to open cache in bucket:', error);
			callback(false, error.message);
		});
	} catch (error) {
		console.error('Storage bucket store error:', error);
		callback(false, error.message);
	}
}

// Retrieve image from storage bucket cache
function retrieve_image_from_bucket(url, callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	if (!storage_bucket_enabled || !storage_bucket_instance) {
		callback(false, null, 'bucket_not_available');
		return;
	}

	try {
		let cache_key = 'img_' + btoa(url).replace(/[^a-zA-Z0-9]/g, '_');

		storage_bucket_instance.caches.open('images').then(function(cache) {
			cache.match(cache_key).then(function(response) {
				if (response) {
					// Check if cached image is still valid
					let ttl_expires = response.headers.get('X-TTL-Expires');
					if (ttl_expires && new Date(ttl_expires) > new Date()) {
						response.blob().then(function(blob) {
							let url_obj = URL.createObjectURL(blob);
							callback(true, url_obj, 'cached');
						}).catch(function(error) {
							console.error('Failed to get blob from cached response:', error);
							callback(false, null, error.message);
						});
					} else {
						// Cached image expired, remove it
						cache.delete(cache_key);
						callback(false, null, 'expired');
					}
				} else {
					callback(false, null, 'not_found');
				}
			}).catch(function(error) {
				console.error('Failed to retrieve from bucket cache:', error);
				callback(false, null, error.message);
			});
		}).catch(function(error) {
			console.error('Failed to open cache in bucket:', error);
			callback(false, null, error.message);
		});
	} catch (error) {
		console.error('Storage bucket retrieve error:', error);
		callback(false, null, error.message);
	}
}

// Clear all content from storage bucket
function clear_storage_bucket(callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	if (!storage_bucket_enabled || !storage_bucket_instance) {
		callback(false, 'bucket_not_available');
		return;
	}

	try {
		storage_bucket_instance.caches.open('images').then(function(cache) {
			cache.keys().then(function(keys) {
				let delete_promises = keys.map(function(key) {
					return cache.delete(key);
				});

				Promise.all(delete_promises).then(function() {
					console.log('Storage bucket cleared successfully');
					callback(true);
				}).catch(function(error) {
					console.error('Failed to clear storage bucket:', error);
					callback(false, error.message);
				});
			}).catch(function(error) {
				console.error('Failed to get cache keys:', error);
				callback(false, error.message);
			});
		}).catch(function(error) {
			console.error('Failed to open cache in bucket:', error);
			callback(false, error.message);
		});
	} catch (error) {
		console.error('Storage bucket clear error:', error);
		callback(false, error.message);
	}
}

// Request storage quota increase for the bucket
function request_storage_quota_increase(requested_quota, callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	if (!storage_bucket_supported || !storage_bucket_instance) {
		callback(false, 'bucket_not_available');
		return;
	}

	try {
		// Note: This is a theoretical implementation as the Storage Buckets API
		// specification is still evolving. The actual API may differ.
		if (typeof storage_bucket_instance.requestQuota === 'function') {
			storage_bucket_instance.requestQuota(requested_quota).then(function(granted) {
				console.log('Quota increase requested. Granted:', granted);
				callback(true, granted);
			}).catch(function(error) {
				console.error('Failed to request quota increase:', error);
				callback(false, error.message);
			});
		} else {
			// Fallback: Use regular Storage API
			if (navigator.storage && navigator.storage.persist) {
				navigator.storage.persist().then(function(persistent) {
					console.log('Storage persistence requested:', persistent);
					callback(persistent, persistent ? 'persistent' : 'temporary');
				}).catch(function(error) {
					console.error('Failed to request storage persistence:', error);
					callback(false, error.message);
				});
			} else {
				callback(false, 'quota_api_not_available');
			}
		}
	} catch (error) {
		console.error('Quota request error:', error);
		callback(false, error.message);
	}
}

// Get list of cached items in storage bucket
function get_storage_bucket_cache_list(callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	if (!storage_bucket_enabled || !storage_bucket_instance) {
		callback([]);
		return;
	}

	try {
		storage_bucket_instance.caches.open('images').then(function(cache) {
			cache.keys().then(function(keys) {
				let cache_items = [];
				let processed = 0;

				if (keys.length === 0) {
					callback([]);
					return;
				}

				keys.forEach(function(key) {
					cache.match(key).then(function(response) {
						if (response) {
							cache_items.push({
								key: key,
								original_url: response.headers.get('X-Cached-URL'),
								cache_time: response.headers.get('X-Cache-Time'),
								ttl_expires: response.headers.get('X-TTL-Expires'),
								content_type: response.headers.get('Content-Type')
							});
						}
						processed++;
						if (processed === keys.length) {
							callback(cache_items);
						}
					}).catch(function(error) {
						console.error('Failed to get cache item details:', error);
						processed++;
						if (processed === keys.length) {
							callback(cache_items);
						}
					});
				});
			}).catch(function(error) {
				console.error('Failed to get cache keys:', error);
				callback([]);
			});
		}).catch(function(error) {
			console.error('Failed to open cache in bucket:', error);
			callback([]);
		});
	} catch (error) {
		console.error('Storage bucket list error:', error);
		callback([]);
	}
}

// Enhanced image validation with storage bucket integration
function validate_image_with_storage_bucket(url, category, account, callback) {
	console.log('validate_image_with_storage_bucket', url, category, account, callback);
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	// First validate URL format
	if (!validate_image_url_format(url)) {
		callback(false, ltmp_global.untrusted_image, 'invalid_format');
		return;
	}

	// Check domain trust status
	is_domain_trusted_async(url, function(is_trusted) {
		if (!is_trusted) {
			callback(false, ltmp_global.untrusted_image, 'untrusted_domain');
			return;
		}

		// Try to retrieve from storage bucket first
		if (storage_bucket_enabled) {
			retrieve_image_from_bucket(url, function(found, cached_url, status) {
				if (found && status === 'cached') {
					// Update access time in database
					update_cached_image_access(url);
					callback(true, cached_url, 'bucket_cached');
					return;
				}

				// Not in bucket or expired, fetch and cache
				fetch_and_cache_image_with_bucket(url, category, account, callback);
			});
		} else {
			// Use regular validation and caching
			validate_and_cache_image(url, category, account, false, callback);
		}
	});
}

// Fetch image from URL and cache in storage bucket with validation
// NOTE: CORS limitations - fetch() only works for servers that send Access-Control-Allow-Origin headers.
// Most image hosting services (Gravatar, Imgur, GitHub) support CORS.
// For servers without CORS, we fall back to using the original URL directly (browsers allow <img> cross-origin).
function fetch_and_cache_image_with_bucket(url, category, account, callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	try {
		// Use fetch with CORS mode - this will fail for servers without CORS headers
		// In that case, we gracefully fall back to using the original URL
		fetch(url, {
			mode: 'cors',
			credentials: 'omit',  // Don't send cookies for cross-origin requests
			cache: 'default'
		}).then(function(response) {
			if (!response.ok) {
				// Server responded but with error status - fall back to original URL
				// The <img> tag may still be able to load it
				console.log('Fetch returned non-OK status for:', url, 'Status:', response.status);
				callback(true, url, 'cors_fallback_status');
				return;
			}

			// Check content type
			let content_type = response.headers.get('content-type');
			if (!content_type || !content_type.startsWith('image/')) {
				// Content type is wrong or missing - still try to use the URL
				// Some servers don't send proper content-type for images
				console.log('Invalid content-type for:', url, 'Type:', content_type);
				callback(true, url, 'cors_fallback_content_type');
				return;
			}

			response.blob().then(function(blob) {
				// Check file size (limit to 10MB)
				if (blob.size > 10 * 1024 * 1024) {
					console.log('Image too large, using original URL:', url, 'Size:', blob.size);
					callback(true, url, 'cors_fallback_size');
					return;
				}

				// Store in bucket if enabled
				if (storage_bucket_enabled) {
					let cache_ttl = get_cache_ttl_for_category(category);
					let expires_time = new Date().getTime() + (cache_ttl * 24 * 60 * 60 * 1000);

					let metadata = {
						contentType: content_type,
						ttl_expires: new Date(expires_time).toISOString(),
						category: category,
						account: account
					};

					store_image_in_bucket(url, blob, metadata, function(success, cache_key) {
						if (success) {
							// Also store metadata in database
							let cache_record = {
								original_url: url,
								domain: extract_domain_from_url(url),
								category: category || 'image',
								ttl_expires: expires_time,
								account: account || '',
								last_accessed: new Date().getTime(),
								cached_url: cache_key,
								file_size: blob.size,
								content_type: content_type
							};

							store_cached_image_metadata(cache_record, function() {
								let object_url = URL.createObjectURL(blob);
								callback(true, object_url, 'newly_cached');
							});
						} else {
							// Fallback to object URL
							let object_url = URL.createObjectURL(blob);
							callback(true, object_url, 'object_url_fallback');
						}
					});
				} else {
					// Create object URL and store metadata
					let object_url = URL.createObjectURL(blob);
					let cache_ttl = get_cache_ttl_for_category(category);
					let expires_time = new Date().getTime() + (cache_ttl * 24 * 60 * 60 * 1000);

					let cache_record = {
						original_url: url,
						domain: extract_domain_from_url(url),
						category: category || 'image',
						ttl_expires: expires_time,
						account: account || '',
						last_accessed: new Date().getTime(),
						cached_url: object_url,
						file_size: blob.size,
						content_type: content_type
					};

					store_cached_image_metadata(cache_record, function() {
						callback(true, object_url, 'newly_cached_metadata');
					});
				}
			}).catch(function(error) {
				console.error('Failed to get blob from response:', error);
				// Blob extraction failed, but we can still use the original URL
				callback(true, url, 'cors_fallback_blob');
			});
		}).catch(function(error) {
			// CORS error or network error - this is expected for servers without CORS headers
			// Fall back to using the original URL directly - <img> tags can still load it
			console.log('CORS/Network error fetching image (will use original URL):', url, error.message || error);
			// Return success=true because the <img> tag will still work with the original URL
			// We just couldn't cache it locally due to CORS restrictions
			callback(true, url, 'cors_blocked_fallback');
		});
	} catch (error) {
		console.error('Fetch and cache error:', error);
		// Even on unexpected errors, try to use the original URL
		callback(true, url, 'error_fallback');
	}
}

// Batch validate multiple images with storage bucket support
function batch_validate_images(image_urls, category, account, callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	if (!Array.isArray(image_urls) || image_urls.length === 0) {
		callback([]);
		return;
	}

	let results = [];
	let processed = 0;

	image_urls.forEach(function(url, index) {
		validate_image_with_storage_bucket(url, category, account, function(success, processed_url, status) {
			results[index] = {
				original_url: url,
				processed_url: processed_url,
				success: success,
				status: status
			};

			processed++;
			if (processed === image_urls.length) {
				callback(results);
			}
		});
	});
}