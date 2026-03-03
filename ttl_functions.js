function load_ttl_settings(tab) {
	// Load TTL settings from localStorage or use defaults
	let ttl_settings = {
		avatar: parseInt(localStorage.getItem(storage_prefix + 'ttl_avatar')) || 30,
		image: parseInt(localStorage.getItem(storage_prefix + 'ttl_image')) || 7,
		video: parseInt(localStorage.getItem(storage_prefix + 'ttl_video')) || 3,
		audio: parseInt(localStorage.getItem(storage_prefix + 'ttl_audio')) || 3,
		file: parseInt(localStorage.getItem(storage_prefix + 'ttl_file')) || 1
	};

	// Update UI with loaded settings
	tab.find('input[name="ttl_avatars"]').val(ttl_settings.avatar);
	tab.find('input[name="ttl_images"]').val(ttl_settings.image);
	tab.find('input[name="ttl_videos"]').val(ttl_settings.video);
	tab.find('input[name="ttl_audio"]').val(ttl_settings.audio);
	tab.find('input[name="ttl_files"]').val(ttl_settings.file);
}

function save_ttl_settings(tab, callback) {
	if (typeof callback === 'undefined') {
		callback = function(){};
	}

	// Get values from UI
	let ttl_settings = {
		avatar: parseInt(tab.find('input[name="ttl_avatars"]').val()) || 30,
		image: parseInt(tab.find('input[name="ttl_images"]').val()) || 7,
		video: parseInt(tab.find('input[name="ttl_videos"]').val()) || 3,
		audio: parseInt(tab.find('input[name="ttl_audio"]').val()) || 3,
		file: parseInt(tab.find('input[name="ttl_files"]').val()) || 1
	};

	// Validate values (1-365 days)
	for (let category in ttl_settings) {
		if (ttl_settings[category] < 1) ttl_settings[category] = 1;
		if (ttl_settings[category] > 365) ttl_settings[category] = 365;
		// Update UI with validated values
		tab.find('input[name="ttl_' + category + 's"]').val(ttl_settings[category]);
	}

	// Save to localStorage
	try {
		localStorage.setItem(storage_prefix + 'ttl_avatar', ttl_settings.avatar);
		localStorage.setItem(storage_prefix + 'ttl_image', ttl_settings.image);
		localStorage.setItem(storage_prefix + 'ttl_video', ttl_settings.video);
		localStorage.setItem(storage_prefix + 'ttl_audio', ttl_settings.audio);
		localStorage.setItem(storage_prefix + 'ttl_file', ttl_settings.file);
		callback(true);
	} catch (e) {
		console.error('Failed to save TTL settings:', e);
		callback(false);
	}
}