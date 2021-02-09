var app_version = 1;
var storage_prefix='viz_voice_';
var old_app_shell=storage_prefix+(app_version-1);
var app_shell=storage_prefix+app_version;
var cache_list=[];

self.addEventListener('activate',function(e){
	e.waitUntil(
		caches.delete(old_app_shell).open(app_shell).then(function(cache){
			return cache.addAll(cache_list);
		}).catch(function(err){
			console.log(err);
		})
	);
});

self.addEventListener('install',function(e){
	e.waitUntil(
		caches.open(app_shell).then((cache) => cache.addAll(cache_list)),
	);
	localStorage.setItem(storage_prefix+'install_close',1);
});

self.addEventListener('fetch',function(e){
	e.respondWith(
		caches.match(e.request).then((response) => response || fetch(e.request)),
	);
});