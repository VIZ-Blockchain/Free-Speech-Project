var app_version=1;
var app_protocol='V';//V for Voice :)
var storage_prefix='viz_voice_';

var whitelabel_account='';//main whitelabel account to redirect
var whitelabel_accounts=[whitelabel_account];//always subscribed to whitelabels accounts
var whitelabel_deep=10;//count of max activity loaded for feed on startup
var whitelabel_redirect=false;//redirect to whitelabel profile on feed loadup
var whitelabel_app_title='The Free Speech Project';

var whitelabel_logo=false;

var whitelabel_init=false;

var sync_cloud_url='https://readdle.me/cloud/';
var sync_cloud_domain=false;
if(false!==sync_cloud_url){
	sync_cloud_domain=sync_cloud_url.split('://')[1].split('/')[0];
}
var sync_cloud_activity=0;
var sync_cloud_update=0;
if(null!=localStorage.getItem(storage_prefix+'sync_cloud_activity')){
	sync_cloud_activity=parseInt(localStorage.getItem(storage_prefix+'sync_cloud_activity'));
	if(isNaN(sync_cloud_activity)){
		localStorage.removeItem(storage_prefix+'sync_cloud_activity');
	}
}
if(null!=localStorage.getItem(storage_prefix+'sync_cloud_update')){
	sync_cloud_update=parseInt(localStorage.getItem(storage_prefix+'sync_cloud_update'));
	if(isNaN(sync_cloud_update)){
		localStorage.removeItem(storage_prefix+'sync_cloud_update');
	}
}

function auth_signature_data(domain,action,account,authority,nonce){
	return domain+':'+action+':'+account+':'+authority+':'+(new Date().getTime() / 1000 | 0)+':'+nonce;
}

function auth_signature_check(hex){
	let byte=hex.substring(0,2);
	if('1f'==byte){
		return true;
	}
	if('20'==byte){
		return true;
	}
	return false;
}

function paswordless_auth(account,regular_key){
	var nonce=0;
	var data='';
	var signature='';
	while(!auth_signature_check(signature)){
		data=auth_signature_data(sync_cloud_domain,'auth',account,'regular',nonce);
		signature=viz.auth.signature.sign(data,regular_key).toHex();
		nonce++;
	}
	return {data,signature};
}

var check_sync_cloud_activity_interval=5*60*1000;
var check_sync_cloud_activity_timer=0;
function check_sync_cloud_activity(callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	if(!settings.sync_cloud){
		return;
	}
	if(''==current_user){
		return;
	}
	if(typeof users[current_user] === 'undefined'){
		return;
	}
	if(typeof users[current_user].regular_key === 'undefined'){
		return;
	}
	if(false===sync_cloud_domain){
		return;
	}
	let xhr = new XMLHttpRequest();
	xhr.timeout=5000;
	xhr.overrideMimeType('text/plain');
	xhr.open('POST',sync_cloud_url);
	xhr.setRequestHeader('accept','application/json, text/plain, */*');
	xhr.setRequestHeader('content-type','application/json');
	xhr.ontimeout = function() {
		console.log('check_sync_cloud_activity timeout',sync_cloud_url);
	};
	xhr.onreadystatechange = function() {
		if(4==xhr.readyState && 200==xhr.status){
			try{
				let json=JSON.parse(xhr.response);
				console.log('check_sync_cloud_activity response',json);
				if(json.activity>=sync_cloud_activity){
					if(json.update>sync_cloud_update){
						load_sync_cloud_get_updates();
						callback(true);
					}
				}
				clearTimeout(check_sync_cloud_activity_timer);
				check_sync_cloud_activity_timer=setTimeout(function(){
					check_sync_cloud_activity();
				},check_sync_cloud_activity_interval);
			}
			catch(e){
				console.log('check_sync_cloud_activity response json error',xhr.response,e);
				callback(false);
			}
		}
		if(4==xhr.readyState && 200!=xhr.status){
			callback(false);
		}
	};
	let auth_data=paswordless_auth(current_user,users[current_user].regular_key);
	auth_data.action='activity';
	xhr.send(JSON.stringify(auth_data));

	clearTimeout(check_sync_cloud_activity_timer);
	check_sync_cloud_activity_timer=setTimeout(function(){
		check_sync_cloud_activity();
	},check_sync_cloud_activity_interval);
}

var sync_cloud_updates_queue=[];
var sync_cloud_update_worker_busy=false;
var sync_cloud_update_worker_timer=0;
var sync_cloud_update_worker_interval=1*1000;
function sync_cloud_update_worker(){
	if(!sync_cloud_update_worker_busy){
		sync_cloud_update_worker_busy=true;

		let types_id={
			1:'backup',
			2:'subscribe',
			3:'reset',
			4:'ignore',
			5:'pin_hashtag',
			6:'reset_hashtag',
			7:'ignore_hashtag',
		};

		let update=sync_cloud_updates_queue.shift();
		if(typeof update !== 'undefined'){
			let type=types_id[update.type];
			if('backup'==type){
				import_cloud(update.value);
			}
			else
			if('subscribe'==type){
				subscribe_update(update.value,function(result){
					if(false===result){
						console.log('sync_cloud_update_worker error with update',update);
					}
					else{
						console.log('sync_cloud_update_worker OK with update',update);
					}
					sync_cloud_update_worker_busy=false;
					clearTimeout(sync_cloud_update_worker_timer);
					sync_cloud_update_worker_timer=setTimeout(function(){
						sync_cloud_update_worker();
					},sync_cloud_update_worker_interval);
				});
			}
			else
			if('reset'==type){
				reset_update(update.value,function(result){
					if(false===result){
						console.log('sync_cloud_update_worker error with update',update);
					}
					else{
						console.log('sync_cloud_update_worker OK with update',update);
					}
					sync_cloud_update_worker_busy=false;
					clearTimeout(sync_cloud_update_worker_timer);
					sync_cloud_update_worker_timer=setTimeout(function(){
						sync_cloud_update_worker();
					},sync_cloud_update_worker_interval);
				});
			}
			else
			if('ignore'==type){
				ignore_update(update.value,function(result){
					if(false===result){
						console.log('sync_cloud_update_worker error with update',update);
					}
					else{
						console.log('sync_cloud_update_worker OK with update',update);
					}
					sync_cloud_update_worker_busy=false;
					clearTimeout(sync_cloud_update_worker_timer);
					sync_cloud_update_worker_timer=setTimeout(function(){
						sync_cloud_update_worker();
					},sync_cloud_update_worker_interval);
				});
			}
			else
			if('pin_hashtag'==type){
				hashtag_update(update.value,1,function(result){
					if(false===result){
						console.log('sync_cloud_update_worker error with update',update);
					}
					else{
						render_right_addon();
						console.log('sync_cloud_update_worker OK with update',update);
					}
					sync_cloud_update_worker_busy=false;
					clearTimeout(sync_cloud_update_worker_timer);
					sync_cloud_update_worker_timer=setTimeout(function(){
						sync_cloud_update_worker();
					},sync_cloud_update_worker_interval);
				});
			}
			else
			if('reset_hashtag'==type){
				hashtag_update(update.value,0,function(result){
					if(false===result){
						console.log('sync_cloud_update_worker error with update',update);
					}
					else{
						render_right_addon();
						console.log('sync_cloud_update_worker OK with update',update);
					}
					sync_cloud_update_worker_busy=false;
					clearTimeout(sync_cloud_update_worker_timer);
					sync_cloud_update_worker_timer=setTimeout(function(){
						sync_cloud_update_worker();
					},sync_cloud_update_worker_interval);
				});
			}
			else
			if('ignore_hashtag'==type){
				hashtag_update(update.value,2,function(result){
					if(false===result){
						console.log('sync_cloud_update_worker error with update',update);
					}
					else{
						render_right_addon();
						console.log('sync_cloud_update_worker OK with update',update);
					}
					sync_cloud_update_worker_busy=false;
					clearTimeout(sync_cloud_update_worker_timer);
					sync_cloud_update_worker_timer=setTimeout(function(){
						sync_cloud_update_worker();
					},sync_cloud_update_worker_interval);
				});
			}
			else{
				console.log('sync_cloud_update_worker MISS with update',update);
				sync_cloud_update_worker_busy=false;
			}
		}
		else{
			sync_cloud_update_worker_busy=false;
		}
	}
}

var load_sync_cloud_update_busy=false;
function load_sync_cloud_get_updates(){
	if(!load_sync_cloud_update_busy){
		load_sync_cloud_update_busy=true;
		let xhr = new XMLHttpRequest();
		xhr.timeout=5000;
		xhr.overrideMimeType('text/plain');
		xhr.open('POST',sync_cloud_url);
		xhr.setRequestHeader('accept','application/json, text/plain, */*');
		xhr.setRequestHeader('content-type','application/json');
		xhr.ontimeout = function() {
			console.log('load_sync_cloud_update timeout',sync_cloud_url);
		};
		xhr.onreadystatechange = function() {
			if(4==xhr.readyState && 200==xhr.status){
				try{
					let json=JSON.parse(xhr.response);
					console.log('load_sync_cloud_update response',json);
					if(typeof json.result !=='undefined'){
						for(let i in json.result){
							let update=json.result[i];
							if(update.time>=sync_cloud_activity){
								if(update.id>sync_cloud_update){
									sync_cloud_updates_queue.push({type:update.type,value:update.value});
									sync_cloud_activity=update.time;
									sync_cloud_update=update.id;
									localStorage.setItem(storage_prefix+'sync_cloud_activity',sync_cloud_activity);
									localStorage.setItem(storage_prefix+'sync_cloud_update',sync_cloud_update);
								}
							}
						}
						clearTimeout(sync_cloud_update_worker_timer);
						sync_cloud_update_worker_timer=setTimeout(function(){
							sync_cloud_update_worker();
						},sync_cloud_update_worker_interval);
					}
				}
				catch(e){
					console.log('load_sync_cloud_update response json error',xhr.response,e);
				}
				load_sync_cloud_update_busy=false;
			}
		};
		let auth_data=paswordless_auth(current_user,users[current_user].regular_key);
		auth_data.action='get_updates';
		auth_data.activity=sync_cloud_activity;
		auth_data.update=sync_cloud_update;
		xhr.send(JSON.stringify(auth_data));
	}
}

function sync_cloud_put_update(type_str,value,callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	let types_arr={
		'backup':1,
		'subscribe':2,
		'reset':3,
		'ignore':4,
		'pin_hashtag':5,
		'reset_hashtag':6,
		'ignore_hashtag':7,
	};
	if(typeof types_arr[type_str] !== 'undefined'){
		let xhr = new XMLHttpRequest();
		xhr.timeout=5000;
		xhr.overrideMimeType('text/plain');
		xhr.open('POST',sync_cloud_url);
		xhr.setRequestHeader('accept','application/json, text/plain, */*');
		xhr.setRequestHeader('content-type','application/json');
		xhr.ontimeout = function() {
			console.log('sync_cloud_put_update timeout',sync_cloud_url);
		};
		xhr.onreadystatechange = function() {
			if(4==xhr.readyState && 200==xhr.status){
				try{
					let json=JSON.parse(xhr.response);
					console.log('sync_cloud_put_update response',json);
					if(typeof json.result !=='undefined'){
						sync_cloud_activity=json.result.activity;
						sync_cloud_update=json.result.update;
						localStorage.setItem(storage_prefix+'sync_cloud_activity',sync_cloud_activity);
						localStorage.setItem(storage_prefix+'sync_cloud_update',sync_cloud_update);
					}
					if(false!==json.result){
						callback(true);
					}
					else{
						callback(false);
					}
				}
				catch(e){
					console.log('sync_cloud_put_update response json error',xhr.response,e);
					callback(false);
				}
			}
			if(4==xhr.readyState && 200!=xhr.status){
				console.log('sync_cloud_put_update response status error',xhr.status);
				callback(false);
			}
		};
		let auth_data=paswordless_auth(current_user,users[current_user].regular_key);
		auth_data.action='put_update';
		auth_data.type=types_arr[type_str];
		auth_data.value=value;
		xhr.send(JSON.stringify(auth_data));
	}
	else{
		callback(false);
	}
}

var mute_notifications=false;
if(null!=localStorage.getItem(storage_prefix+'mute_notifications')){
	mute_notifications=parseInt(localStorage.getItem(storage_prefix+'mute_notifications'));
	if(isNaN(mute_notifications)){
		localStorage.removeItem(storage_prefix+'mute_notifications');
	}
	else{
		setTimeout(function(){
			localStorage.removeItem(storage_prefix+'mute_notifications');
			mute_notifications=false;
		},mute_notifications*1000);
	}
}

var is_safari=navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
			navigator.userAgent &&
			navigator.userAgent.indexOf('CriOS') == -1 &&
			navigator.userAgent.indexOf('FxiOS') == -1;
var is_firefox=navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

var api_gates=[
	'https://node.viz.plus/',
	'https://api.viz.world/',
	'https://node.viz.cx/',
	'https://viz.lexai.host/',
	'https://vizrpc.lexai.host/',
	'https://viz-node.dpos.space/',
	'https://node.viz.media/',
];
var default_api_gate=api_gates[0];
var best_gate=-1;
var best_gate_latency=-1;
var api_gate=default_api_gate;
console.log('using default node',default_api_gate);
viz.config.set('websocket',default_api_gate);

select_best_gate();

var dgp={};

function update_api_gate(value=false){
	if(false==value){
		api_gate=api_gates[best_gate];
	}
	else{
		api_gate=value;
	}
	console.log('using new node',api_gate,'latency: ',best_gate_latency);
	viz.config.set('websocket',api_gate);
}

function select_best_gate(){
	for(i in api_gates){
		let current_gate=i;
		let current_gate_url=api_gates[i];
		let latency_start=new Date().getTime();
		let latency=-1;

		let protocol='websocket';
		let gate_protocol=current_gate_url.substring(0,current_gate_url.indexOf(':'));

		if('http'==gate_protocol||'https'==gate_protocol){
			protocol='http';
		}
		if('websocket'==protocol){
			let socket = new WebSocket(current_gate_url);
			socket.onmessage=function(event){
				latency=new Date().getTime() - latency_start;
				if(best_gate!=current_gate){
					if((best_gate_latency>latency)||(best_gate==-1)){
						try{
							let json=JSON.parse(event.data);
							dgp=json.result;
							best_gate=current_gate;
							best_gate_latency=latency;
							update_api_gate();
						}
						catch(e){
							console.log('select_best_gate node error',current_gate_url,e);
						}
					}
				}
				socket.close();
			}
			socket.onopen=function(){
				socket.send('{"id":1,"method":"call","jsonrpc":"2.0","params":["database_api","get_dynamic_global_properties",[]]}');
			};
		}
		if('http'==protocol){
			let xhr = new XMLHttpRequest();
			xhr.timeout=3000;
			xhr.overrideMimeType('text/plain');
			xhr.open('POST',current_gate_url);
			xhr.setRequestHeader('accept','application/json, text/plain, */*');
			xhr.setRequestHeader('content-type','application/json');
			xhr.ontimeout = function() {
				console.log('select_best_gate node timeout',current_gate_url);
			};
			xhr.onreadystatechange = function() {
				if(4==xhr.readyState && 200==xhr.status){
					latency=new Date().getTime() - latency_start;
					console.log('check node',current_gate_url,'latency: ',latency);
					if(best_gate!=current_gate){
						if((best_gate_latency>latency)||(best_gate==-1)){
							try{
								let json=JSON.parse(xhr.response);
								dgp=json.result;
								best_gate=current_gate;
								best_gate_latency=latency;
								update_api_gate();
							}
							catch(e){
								console.log('select_best_gate node error',current_gate_url,e);
							}
						}
					}
				}
			};
			xhr.send('{"id":1,"method":"call","jsonrpc":"2.0","params":["database_api","get_dynamic_global_properties",[]]}');
		}
	}
}

var dgp_timer=0;
function update_dgp(auto=false){
	viz.api.getDynamicGlobalProperties(function(err,response){
		if(response){
			dgp=response;
		}
	});
	setTimeout(function(){if(0==Object.keys(dgp).length){select_best_gate();}},5000);//5sec after request
	if(auto){
		clearTimeout(dgp_timer);
		dgp_timer=setTimeout(function(){update_dgp(true);},120000);//2min
	}
}

var users={};
var current_user='';

if(null!=localStorage.getItem(storage_prefix+'users')){
	users=JSON.parse(localStorage.getItem(storage_prefix+'users'));
}
if(null!=localStorage.getItem(storage_prefix+'current_user')){
	current_user=localStorage.getItem(storage_prefix+'current_user');
}

var default_settings={
	feed_size:10000,
	activity_size:0,
	activity_period:5,
	activity_deep:50,
	user_profile_ttl:60,
	user_cache_ttl:10,
	object_cache_ttl:10,
	preview_cache_ttl:7200,
	feed_subscribe_text:true,
	feed_subscribe_replies:false,
	feed_subscribe_shares:true,
	feed_subscribe_mentions:true,
	//feed_load_by_timer:true,
	//feed_load_by_surf:false,
	energy:100,
	silent_award:false,
	hashtags_addon_popular_limit:5,

	theme_mode:'light',
	theme_night_mode:'midnight',
	theme_auto_light:'06:00',
	theme_auto_night:'21:00',

	sync_cloud:true,
	sync_users:true,
	sync_feed:true,
	sync_replies:true,
	sync_hashtags:true,
	sync_awards:true,
	sync_settings:true,
	sync_size:100,
};
var settings=default_settings;

if(null!=localStorage.getItem(storage_prefix+'settings')){
	settings=JSON.parse(localStorage.getItem(storage_prefix+'settings'));
	for(let i in default_settings){
		if(typeof settings[i]==='undefined'){
			settings[i]=default_settings[i];
		}
	}
}

function save_theme_settings(view){
	let tab=view.find('.content-view[data-tab="theme"]');
	tab.find('.button').removeClass('disabled');
	tab.find('.submit-button-ring').removeClass('show');
	tab.find('.error').html('');

	settings.theme_auto_light=tab.find('input[name="theme-auto-light"]').val();
	if(!/^([0-9]?[0-9]?\:[0-9]?[0-9]?)$/.test(settings.theme_auto_light)){
		settings.theme_auto_light=default_settings.theme_auto_light;
	}
	tab.find('input[name="theme-auto-light"]').val(settings.theme_auto_light);

	settings.theme_auto_night=tab.find('input[name="theme-auto-night"]').val();
	if(!/^([0-9]?[0-9]?\:[0-9]?[0-9]?)$/.test(settings.theme_auto_night)){
		settings.theme_auto_night=default_settings.theme_auto_night;
	}
	tab.find('input[name="theme-auto-light"]').val(settings.theme_auto_light);

	let settings_json=JSON.stringify(settings);
	localStorage.setItem(storage_prefix+'settings',settings_json);

	tab.find('.success').html(ltmp_arr.app_settings_saved);
	apply_theme_mode();
}
function save_feed_settings(view){
	let tab=view.find('.content-view[data-tab="feed"]');
	tab.find('.button').removeClass('disabled');
	tab.find('.submit-button-ring').removeClass('show');
	tab.find('.error').html('');

	settings.feed_size=parseInt(tab.find('input[name="feed_size"]').val());
	if(isNaN(settings.feed_size)){
		settings.feed_size=default_settings.feed_size;
	}
	tab.find('input[name="feed_size"]').val(settings.feed_size);

	settings.feed_subscribe_text=tab.find('input[name="feed_subscribe_text"]').prop("checked");
	settings.feed_subscribe_replies=tab.find('input[name="feed_subscribe_replies"]').prop("checked");
	settings.feed_subscribe_shares=tab.find('input[name="feed_subscribe_shares"]').prop("checked");
	settings.feed_subscribe_mentions=tab.find('input[name="feed_subscribe_mentions"]').prop("checked");

	//settings.feed_load_by_timer=tab.find('input[name="feed_load_by_timer"]').prop("checked");
	//settings.feed_load_by_surf=tab.find('input[name="feed_load_by_surf"]').prop("checked");

	let settings_json=JSON.stringify(settings);
	localStorage.setItem(storage_prefix+'settings',settings_json);

	tab.find('.success').html(ltmp_arr.app_settings_saved);
}

function save_settings(view){
	let tab=view.find('.content-view[data-tab="main"]');
	tab.find('.button').removeClass('disabled');
	tab.find('.submit-button-ring').removeClass('show');
	tab.find('.error').html('');

	settings.activity_size=parseInt(tab.find('input[name="activity_size"]').val());
	if(isNaN(settings.activity_size)){
		settings.activity_size=default_settings.activity_size;
	}
	tab.find('input[name="activity_size"]').val(settings.activity_size);

	settings.activity_period=parseInt(tab.find('input[name="activity_period"]').val());
	if(isNaN(settings.activity_period)){
		settings.activity_period=default_settings.activity_period;
	}
	tab.find('input[name="activity_period"]').val(settings.activity_period);

	settings.activity_deep=parseInt(tab.find('input[name="activity_deep"]').val());
	if(isNaN(settings.activity_deep)){
		settings.activity_deep=default_settings.activity_deep;
	}
	tab.find('input[name="activity_deep"]').val(settings.activity_deep);

	settings.user_profile_ttl=parseInt(tab.find('input[name="user_profile_ttl"]').val());
	if(isNaN(settings.user_profile_ttl)){
		settings.user_profile_ttl=default_settings.user_profile_ttl;
	}
	tab.find('input[name="user_profile_ttl"]').val(settings.user_profile_ttl);

	settings.user_cache_ttl=parseInt(tab.find('input[name="user_cache_ttl"]').val());
	if(isNaN(settings.user_cache_ttl)){
		settings.user_cache_ttl=default_settings.user_cache_ttl;
	}
	tab.find('input[name="user_cache_ttl"]').val(settings.user_cache_ttl);

	settings.object_cache_ttl=parseInt(tab.find('input[name="object_cache_ttl"]').val());
	if(isNaN(settings.object_cache_ttl)){
		settings.object_cache_ttl=default_settings.object_cache_ttl;
	}
	tab.find('input[name="object_cache_ttl"]').val(settings.object_cache_ttl);

	settings.preview_cache_ttl=parseInt(tab.find('input[name="preview_cache_ttl"]').val());
	if(isNaN(settings.preview_cache_ttl)){
		settings.preview_cache_ttl=default_settings.preview_cache_ttl;
	}
	tab.find('input[name="preview_cache_ttl"]').val(settings.preview_cache_ttl);

	let energy_str=tab.find('input[name="energy"]').val();
	energy_str=fast_str_replace(',','.',energy_str);
	settings.energy=parseInt(parseFloat(energy_str)*100);
	settings.silent_award=tab.find('input[name="silent_award"]').prop("checked");

	let settings_json=JSON.stringify(settings);
	localStorage.setItem(storage_prefix+'settings',settings_json);

	tab.find('.success').html(ltmp_arr.app_settings_saved);
}

function reset_settings(view){
	view.find('.button').removeClass('disabled');
	view.find('.submit-button-ring').removeClass('show');
	view.find('.error').html('');
	view.find('.success').html(ltmp_arr.app_settings_reset);

	view.find('input').val('');

	settings=default_settings;
	localStorage.removeItem(storage_prefix+'settings');
}

function users_save_settings(view){
	let user_account=view.data('user-account');
	t=db.transaction(['users'],'readwrite');
	q=t.objectStore('users');
	req=q.index('account').openCursor(IDBKeyRange.only(user_account),'next');
	let find=false;
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			find=true;
			let item=cur.value;
			item.settings={};
			item.settings.activity_period=parseInt(view.find('input[name="activity_period"]').val());
			if(isNaN(item.settings.activity_period)){
				item.settings.activity_period=settings.activity_period;
			}
			view.find('input[name="activity_period"]').val(item.settings.activity_period);
			cur.update(item);
			cur.continue();
		}
		else{
			if(!find){
				view.find('.error').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.account_not_found}));
				view.find('.success').html('');
				view.find('.button').removeClass('disabled');
				view.find('.submit-button-ring').removeClass('show');
			}
			else{
				view.find('.error').html('');
				view.find('.success').html(ltmp_arr.app_settings_saved);
				view.find('.button').removeClass('disabled');
				view.find('.submit-button-ring').removeClass('show');
			}
		}
	}
}

function users_reset_settings(view){
	let user_account=view.data('user-account');
	t=db.transaction(['users'],'readwrite');
	q=t.objectStore('users');
	req=q.index('account').openCursor(IDBKeyRange.only(user_account),'next');
	let find=false;
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			find=true;
			let item=cur.value;
			item.settings={};
			delete item.settings;
			cur.update(item);
			cur.continue();
		}
		else{
			if(!find){
				view.find('.error').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.account_not_found}));
				view.find('.success').html('');
				view.find('.button').removeClass('disabled');
				view.find('.submit-button-ring').removeClass('show');
			}
			else{
				view.find('input').val('');
				view.find('.error').html('');
				view.find('.success').html(ltmp_arr.app_settings_reset);
				view.find('.button').removeClass('disabled');
				view.find('.submit-button-ring').removeClass('show');
			}
		}
	}
}

function save_session(){
	let users_json=JSON.stringify(users);
	localStorage.setItem(storage_prefix+'users',users_json);
	localStorage.setItem(storage_prefix+'current_user',current_user);
}

function remove_session(view){
	view.find('.button').removeClass('disabled');
	view.find('.submit-button-ring').removeClass('show');
	view.find('.error').html('');
	view.find('.success').html(ltmp_arr.account_settings_reset);

	view.find('input').val('');

	if(''!=current_user){
		let update_t=db.transaction(['users'],'readwrite');
		let update_q=update_t.objectStore('users');
		let update_req=update_q.index('account').openCursor(IDBKeyRange.only(current_user),'next');
		update_req.onsuccess=function(event){
			let cur=event.target.result;
			if(cur){
				let item=cur.value;
				item.status=0;
				cur.update(item);
				cur.continue();
			}
			else{
				users={};
				current_user='';
				localStorage.removeItem(storage_prefix+'users');
				localStorage.removeItem(storage_prefix+'current_user');
				render_menu();
				render_session();
			}
		};
	}
}

function idb_error(e){
	console.log('IDB error',e);
	add_notify(
		false,
		ltmp_arr.notify_arr.error,
		ltmp_arr.notify_arr.idb_error
	);
	stop_timers();
	setTimeout(function(){
		document.location.reload(true);
	},10000);
}

const idb=window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
const idbt=window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
const idbrkr=window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

var db;
var db_req;
var db_version=1;
var global_db_version=5;
var need_update_db_version=false;
var local_global_db_version=localStorage.getItem(storage_prefix+'global_db_version');
if((null===local_global_db_version)||(global_db_version>local_global_db_version)){
	console.log('need update global db version',global_db_version);
	need_update_db_version=true;
	localStorage.setItem(storage_prefix+'global_db_version',global_db_version);
}
if(null!=localStorage.getItem(storage_prefix+'db_version')){
	db_version=parseInt(localStorage.getItem(storage_prefix+'db_version'));
}
//need_update_db_version=true;
console.log('db_version',db_version,'local_global_db_version',global_db_version,need_update_db_version);
if(need_update_db_version){
	increase_db_version(function(){
		load_db(function(){
			main_app();
		});
	});
}
else{
	load_db(function(){
		main_app();
	});
}

function increase_db_version(callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	db_version++;
	localStorage.setItem(storage_prefix+'db_version',db_version);
	if(typeof db !== 'undefined'){
		db.close();
		setTimeout(function(){
			db=false;
			callback();
		},1000);
	}
	else{
		callback();
	}
}

function full_reset_db(){
	idb.deleteDatabase(storage_prefix+'social_network');
	db.close();
	stop_timers();
	setTimeout(function(){
		db=false;
		load_db(()=>{
			document.location.reload(true);
		});
	},1000);
}
function load_db(callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	db=false;
	db_req=false;
	db_req=idb.open(storage_prefix+'social_network',db_version);
	db_req.onerror=idb_error;
	db_req.onblocked=idb_error;
	db_req.onsuccess=function(event){
		console.log('onsuccess!');
		db=event.target.result;
		callback();
	};
	db_req.onupgradeneeded=function(event){
		console.log('onupgradeneeded!');
		db=event.target.result;
		let update_trx = event.target.transaction;

		if(!db.objectStoreNames.contains('users')){
			items_table=db.createObjectStore('users',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('account','account',{unique:true});//account
			items_table.createIndex('start','start',{unique:false});//start block num
			items_table.createIndex('end','end',{unique:false});//end block num
			items_table.createIndex('update','update',{unique:false});//last update time
			items_table.createIndex('activity','activity',{unique:false});//last activity time
			items_table.createIndex('status','status',{unique:false});//status: 0 - temp, 1 - subscribed, 2 - ignored
		}
		else{
			//new index for users
		}

		if(!db.objectStoreNames.contains('replies')){
			items_table=db.createObjectStore('replies',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('object',['account','block'],{unique:false});//account
			items_table.createIndex('parent',['parent_account','parent_block'],{unique:false});//account
			items_table.createIndex('time','time',{unique:false});//unixtime for delayed objects
		}
		else{
			//items_table=update_trx.objectStore('replies');
			//new index for replies
		}

		if(!db.objectStoreNames.contains('feed')){
			items_table=db.createObjectStore('feed',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('object',['account','block'],{unique:false});//account
			items_table.createIndex('time','time',{unique:false});//unixtime for delayed objects
		}
		else{
			//new index for feed
		}

		if(!db.objectStoreNames.contains('notifications')){
			items_table=db.createObjectStore('notifications',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('status','status',{unique:false});//status: 0 - unreaded, 1 - readed
		}
		else{
			//new index for notifications
		}

		if(!db.objectStoreNames.contains('awards')){
			items_table=db.createObjectStore('awards',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('object',['account','block'],{unique:false});//account
		}
		else{
			//new index for awards
		}

		if(!db.objectStoreNames.contains('hashtags')){
			items_table=db.createObjectStore('hashtags',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('tag','tag',{unique:true});//hash tag name
			items_table.createIndex('count','count',{unique:false});//hash tag name
			items_table.createIndex('status','status',{unique:false});//status: 0 - default (in popular), 1 - pinned, 2 - ignoring
			items_table.createIndex('pinned_order',['status','order'],{unique:false});//order for pinned hashtags
		}
		else{
			items_table=update_trx.objectStore('hashtags');
			if(!items_table.indexNames.contains('pinned_order')){
				items_table.createIndex('pinned_order',['status','order'],{unique:false});//order for pinned hashtags
			}
			//new index for hashtags
		}

		if(!db.objectStoreNames.contains('hashtags_feed')){
			items_table=db.createObjectStore('hashtags_feed',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('tag','tag',{unique:false});//hash tag id
			items_table.createIndex('object',['account','block'],{unique:false});//account
		}
		else{
			//new index for hashtags_feed
		}

		if(!db.objectStoreNames.contains('preview')){//store previews data
			items_table=db.createObjectStore('preview',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('domain','domain',{unique:false});//domain from link to fastest search
			items_table.createIndex('time','time',{unique:false});//unixtime for clear cache
		}
		else{
			//new index for preview
		}

		users_table=update_trx.objectStore('users');
		if(!db.objectStoreNames.contains('objects')){
			items_table=db.createObjectStore('objects',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('object',['account','block'],{unique:true});//account
			items_table.createIndex('account','account',{unique:false});
			items_table.createIndex('time','time',{unique:false});//unixtime for stored objects

			if(''!=whitelabel_account){//only on genesis
				whitelabel_init=true;
			}
		}
		else{
			//items_table=update_trx.objectStore('objects');
			//new index for objects cache
		}
		if(!is_safari){
			if(!is_firefox){
				update_trx.commit();
			}
		}
	};
}

function idb_get_id(container,index,search,callback){
	let find=false;
	let t,q,req;
	if(db.objectStoreNames.contains(container)){
		t=db.transaction([container],'readonly');
		q=t.objectStore(container);
		if(false!==index){
			req=q.index(index).openCursor(IDBKeyRange.only(search),'next');
		}
		else{
			req=q.openCursor(IDBKeyRange.only(search),'next');
		}
		req.onsuccess=function(event){
			let cur=event.target.result;
			if(cur){
				find=cur.value.id;
				cur.continue();
			}
			else{
				callback(find);
			}
		}
	}
	else{
		callback(find);
	}
}

function idb_get_id_filter(container,index,search,filter,callback){
	let find=false;
	let t,q,req;
	if(db.objectStoreNames.contains(container)){
		t=db.transaction([container],'readonly');
		q=t.objectStore(container);
		if(false!==index){
			req=q.index(index).openCursor(IDBKeyRange.only(search),'next');
		}
		else{
			req=q.openCursor(IDBKeyRange.only(search),'next');
		}
		req.onsuccess=function(event){
			let cur=event.target.result;
			if(cur){
				let find_filter=false;
				for(let filter_i in filter){
					if(cur.value[filter_i]==filter[filter_i]){
						find_filter=true;
					}
				}
				if(find_filter){
					find=cur.value.id;
				}
				cur.continue();
			}
			else{
				callback(find);
			}
		}
	}
	else{
		callback(find);
	}
}

function idb_get_by_id(container,index,search,callback){
	let find=false;
	let t,q,req;
	if(db.objectStoreNames.contains(container)){
		t=db.transaction([container],'readonly');
		q=t.objectStore(container);
		req=q.index(index).openCursor(IDBKeyRange.only(search),'next');
		req.onsuccess=function(event){
			let cur=event.target.result;
			if(cur){
				find=cur.value;
				cur.continue();
			}
			else{
				callback(find);
			}
		}
	}
	else{
		callback(find);
	}
}

function save_account_settings(view,login,regular_key){
	login=login.toLowerCase();
	if('@'==login.substring(0,1)){
		login=login.substring(1);
	}
	login=login.trim();
	regular_key=regular_key.trim();
	if(''==login){
		view.find('.submit-button-ring').removeClass('show');
		view.find('.error').html(ltmp_arr.account_settings_empty_account);
		view.find('.button').removeClass('disabled');
		return;
	}
	if(''==regular_key){
		view.find('.submit-button-ring').removeClass('show');
		view.find('.error').html(ltmp_arr.account_settings_empty_regular_key);
		view.find('.button').removeClass('disabled');
		return;
	}
	viz.api.getAccount(login,app_protocol,function(err,response){
		if(err){
			console.log(err);
			view.find('.submit-button-ring').removeClass('show');
			view.find('.error').html(ltmp_arr.account_settings_account_not_found);
			view.find('.button').removeClass('disabled');
			return;
		}
		else{
			let regular_valid=false;
			for(regular_check in response.regular_authority.key_auths){
				if(response.regular_authority.key_auths[regular_check][1]>=response.regular_authority.weight_threshold){
					try{
						if(viz.auth.wifIsValid(regular_key,response.regular_authority.key_auths[regular_check][0])){
							regular_valid=true;
						}
					}
					catch(e){
						view.find('.submit-button-ring').removeClass('show');
						view.find('.error').html(ltmp_arr.invalid_regular_key);
						view.find('.button').removeClass('disabled');
						return;
					}
				}
			}
			if(!regular_valid){
				view.find('.submit-button-ring').removeClass('show');
				view.find('.error').html(ltmp_arr.not_found_regular_key);
				view.find('.button').removeClass('disabled');
				return;
			}
			//clear users, maybe multi-account support in future
			users={};
			users[login]={'regular_key':regular_key};
			current_user=login;
			save_session();
			let obj={
				account:current_user,
				start:0,
				update:0,
				profile:'{}',
				status:1,
			};

			let t=db.transaction(['users'],'readwrite');
			let q=t.objectStore('users');
			let req=q.index('account').openCursor(IDBKeyRange.only(current_user),'next');

			let result;
			let find=false;

			localStorage.removeItem(storage_prefix+'sync_cloud_activity');
			localStorage.removeItem(storage_prefix+'sync_cloud_update');

			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					result=cur.value;
					result.start=obj.start;
					result.update=obj.update;
					result.profile=obj.profile;
					result.status=obj.status;
					find=true;
					update_req=cur.update(result);
					update_req.onsuccess=function(e){
					}
					cur.continue();
				}
				else{
					if(!find){
						let add_t=db.transaction(['users'],'readwrite');
						let add_q=add_t.objectStore('users');
						add_q.add(obj);
						if(!is_safari){
							if(!is_firefox){
								add_t.commit();
							}
						}
						add_t.oncomplete=function(e){
							update_user_profile(current_user,function(){
								render_session();
								render_menu();
								document.location.hash='dapp:edit_profile';
								//init sync cloud
								clearTimeout(check_sync_cloud_activity_timer);
								check_sync_cloud_activity_timer=setTimeout(function(){
									check_sync_cloud_activity();
								},200);
							});
						}
					}
					else{
						update_user_profile(current_user,function(){
							render_session();
							render_menu();
							document.location.hash='dapp:edit_profile';
							//init sync cloud
							clearTimeout(check_sync_cloud_activity_timer);
							check_sync_cloud_activity_timer=setTimeout(function(){
								check_sync_cloud_activity();
							},200);
						});
					}
				}
			};
		}
	});
}

var level=0;
var path='viz://';
var query='';

function ltmp(ltmp_str,ltmp_args){
	let ltmp_includes_pattern = /%%([a-zA-Z_0-9]*)%%/gi;
	let ltmp_includes=ltmp_str.match(ltmp_includes_pattern);
	if(null!=ltmp_includes){
		for(let ltmp_i in ltmp_includes){
			let var_name=ltmp_includes[ltmp_i].substr(2);
			var_name=var_name.substr(0,var_name.length - 2);
			if(typeof ltmp_arr[var_name] !== 'undefined'){
				ltmp_str=ltmp_str.split(ltmp_includes[ltmp_i]).join(ltmp(ltmp_arr[var_name]));
			}
		}
	}

	for(let ltmp_i in ltmp_args){
		ltmp_str=ltmp_str.split('{'+ltmp_i+'}').join(ltmp_args[ltmp_i]);
	}
	//remove empty args
	let ltmp_prop_arr=ltmp_str.match(/\{[a-z_\-]*\}/gm);
	for(let ltmp_i in ltmp_prop_arr){
		ltmp_str=ltmp_str.split(ltmp_prop_arr[ltmp_i]).join('');
	}
	return ltmp_str;
}

var langs_arr={
	//'en-US':'en',
	//'en':'en',
	'ru-RU':'ru',
	'ru':'ru',
};
var available_langs={
	//'en':'English',
	'ru':'Русский',
};
var default_lang='ru';
var selected_lang=default_lang;
if(null!=localStorage.getItem(storage_prefix+'lang')){
	if(typeof available_langs[localStorage.getItem(storage_prefix+'lang')] !== 'undefined'){
		selected_lang=langs_arr[localStorage.getItem(storage_prefix+'lang')];
	}
}
else{
	for(let i in window.navigator.languages){
		if(typeof langs_arr[window.navigator.languages[i]] !== 'undefined'){
			let try_lang=langs_arr[window.navigator.languages[i]];
			if(typeof available_langs[try_lang] !== 'undefined'){
				selected_lang=langs_arr[try_lang];
			}
		}
	}
}
var ltmp_arr=window['ltmp_'+selected_lang+'_arr'];

var menu_status='full';
if(null!=localStorage.getItem(storage_prefix+'menu_status')){
	menu_status=localStorage.getItem(storage_prefix+'menu_status');
}

function render_menu(){
	$('div.menu').html(ltmp_arr.menu_preset);
	let primary_menu='';
	if(''!=current_user){
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'viz://',class:(path=='viz://'?'current':''),icon:ltmp_arr.icon_feed+ltmp(ltmp_arr.icon_counter,{name:'feed',count:'0'}),caption:ltmp_arr.menu_feed});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'dapp:notifications',class:(path=='dapp:notifications'?'current':''),icon:ltmp_arr.icon_notify+ltmp(ltmp_arr.icon_counter,{name:'notifications',count:'0'}),caption:ltmp_arr.menu_notifications});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'dapp:awards',class:(path=='dapp:awards'?'current':''),icon:ltmp_arr.icon_gem,caption:ltmp_arr.menu_awards});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'dapp:users',class:(path=='dapp:users'?'current':''),icon:ltmp_arr.icon_users,caption:ltmp_arr.menu_users});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'dapp:edit_profile',class:(path=='dapp:edit_profile'?'current':''),icon:ltmp_arr.icon_edit_profile,caption:ltmp_arr.menu_view_profile});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'dapp:hashtags',class:(path=='dapp:hashtags'?'current adaptive-show-inline':'adaptive-show-inline'),icon:ltmp_arr.icon_hashtag,caption:ltmp_arr.menu_hashtags});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'dapp:app_settings',class:(path=='dapp:app_settings'?'current':''),icon:ltmp_arr.icon_settings,caption:ltmp_arr.menu_app_settings});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'dapp:account_settings',class:(path=='dapp:account_settings'?'current':''),icon:ltmp_arr.icon_account_settings,caption:ltmp_arr.menu_account_settings});
		primary_menu+=ltmp_arr.menu_primary_pinned_tags;
	}
	$('div.menu .primary').html(primary_menu);
	let toggle_menu=ltmp(ltmp_arr.toggle_menu_icon,{title:ltmp_arr.toggle_menu_title,icon:('full'==menu_status?ltmp_arr.icon_menu_collapse:ltmp_arr.icon_menu_expand)});
	let toggle_theme=ltmp(ltmp_arr.toggle_theme_icon,{title:ltmp_arr.toggle_theme_title,icon:($('body').hasClass('light')?ltmp_arr.icon_theme_sun:ltmp_arr.icon_theme_moon)});
	let secondary_menu=toggle_theme+toggle_menu;
	$('div.menu .secondary').html(secondary_menu);

	if('full'!=menu_status){
		$('div.menu').addClass(menu_status);
	}
}

function render_right_addon(){
	$('div.right-addon').html('');
	if(''!=current_user){
		let hashtags_addon='';
		let hashtags_context='';
		//pinned
		let read_t=db.transaction(['hashtags'],'readonly');
		let read_q=read_t.objectStore('hashtags');
		let req=read_q.index('pinned_order').openCursor(IDBKeyRange.lowerBound([1,0]),'next');
		let find=false;
		let cursor_end=false;
		let container_context='';
		let adaptive_container_context='';
		let pinned_arr=[];
		req.onsuccess=function(event){
			let cur=event.target.result;
			if(cursor_end){
				cur=false;
			}
			if(cur){
				if(1==cur.value.status){//pinned
					let hashtag_data=cur.value;
					find=true;

					container_context+=ltmp(ltmp_arr.box_item,{link:'dapp:hashtags/'+hashtag_data.tag,caption:uppercase_first_symbol(hashtag_data.tag)});
					adaptive_container_context+=ltmp(ltmp_arr.box_item,{link:'dapp:hashtags/'+hashtag_data.tag,caption:ltmp_arr.icon_hashtag+uppercase_first_symbol(hashtag_data.tag)});

					pinned_arr.push(hashtag_data.id);
				}
				else{
					cursor_end=true;
				}
				cur.continue();
			}
			else{
				if(find){
					$('.adaptive-pinned-tags').html(ltmp_arr.menu_primary_pinned_tags_caption+adaptive_container_context);
					hashtags_context+=ltmp(ltmp_arr.box_container,{context:container_context,caption:ltmp_arr.hashtags_pinned_caption})
				}
				//popular
				let read_t2=db.transaction(['hashtags'],'readonly');
				let read_q2=read_t2.objectStore('hashtags');
				let req2=read_q2.index('count').openCursor(null,'prev');
				let find2=false;
				let popular_count=0;
				let container_context2='';
				let cursor_end=false;
				req2.onsuccess=function(event){
					let cur=event.target.result;
					if(cursor_end){
						cur=false;
					}
					if(cur){
						if(0==cur.value.status){
							let hashtag_data=cur.value;
							find2=true;
							container_context2+=ltmp(ltmp_arr.box_item,{link:'dapp:hashtags/'+hashtag_data.tag,caption:uppercase_first_symbol(hashtag_data.tag)});
							popular_count++;
							if(popular_count>=settings.hashtags_addon_popular_limit){
								cursor_end=true;
							}
						}
						cur.continue();
					}
					else{
						if(find2){
							hashtags_context+=ltmp(ltmp_arr.box_container,{context:container_context2,caption:ltmp_arr.hashtags_popular_caption})
						}
						hashtags_addon=ltmp(ltmp_arr.box_addon,{caption:ltmp_arr.hashtags_addon_caption,button:ltmp(ltmp_arr.hashtags_addon_button,{icon:ltmp_arr.icon_settings}),context:hashtags_context});
						$('div.right-addon').html(hashtags_addon);
					}
				};
			}
		};
	}
}

var sia_upload_percent=0;
var sia_upload_percent_timer=0;
function sia_upload(type,callback){
	type=(typeof type !== 'undefined')?type:/.*/;
	var upload = document.createElement("INPUT");
	upload.setAttribute("type", "file");
	$(upload).off('change');
	$(upload).on('change',function(e){
		callback(true);
		e.preventDefault();
		let files = this.files;
		let file = files[0];
		if(file.type.match(type)){
			let post_form = new FormData();
			post_form.append('file',file);
			let xhr=new XMLHttpRequest();
			xhr.timeout=60000;//1 minute
			xhr.upload.addEventListener('progress',callback,false);
			xhr.open('POST','https://siasky.net/skynet/skyfile');
			xhr.onreadystatechange=function(){
				if(4==xhr.readyState && 200==xhr.status){
					console.log('sia_upload status OK',xhr);
					let skylink=JSON.parse(xhr.responseText).skylink;
					callback(skylink);
				}
				if(4==xhr.readyState && 200!=xhr.status){
					console.log('sia_upload status error',xhr);
					callback(false);
				}
			}
			xhr.onerror=function(){
				console.log('sia_upload error');
				callback(false);
			}
			xhr.send(post_form);
		}
		else{
			callback(false);
		}
	});
	upload.focus();
	var event=document.createEvent('MouseEvents');
	event.initEvent('click',true,true);
	upload.dispatchEvent(event);
}

var ipfs_upload_percent=0;
var ipfs_upload_percent_timer=0;
function ipfs_upload(type,callback){
	type=(typeof type !== 'undefined')?type:/.*/;
	var upload = document.createElement("INPUT");
	upload.setAttribute("type", "file");
	$(upload).off('change');
	$(upload).on('change',function(e){
		e.preventDefault();
		let files = this.files;
		let file = files[0];
		if(file.type.match(type)){
			let post_form = new FormData();
			post_form.append('file',file);
			post_form.append('username','null');
			post_form.append('keyphrase','');
			let xhr=new XMLHttpRequest();
			xhr.timeout=60000;//1 minute
			xhr.upload.addEventListener('progress',callback,false);
			xhr.open('POST','https://api.globalupload.io/transport/add');
			xhr.onreadystatechange=function(){
				if(4==xhr.readyState && 200==xhr.status){
					console.log('ipfs_upload status OK',xhr);
					let cid=JSON.parse(xhr.responseText).Hash;
					callback(cid);
				}
				if(4==xhr.readyState && 200!=xhr.status){
					console.log('ipfs_upload status error',xhr);
					callback(false);
				}
			}
			xhr.onerror=function(){
				console.log('ipfs_upload error');
				callback(false);
			}
			xhr.send(post_form);
		}
		else{
			callback(false);
		}
	});
	var event=document.createEvent('MouseEvents');
	event.initEvent('click',true,true);
	upload.dispatchEvent(event);
}

function first_link(text){
	let link_pattern = /(([a-z]*):\/\/[\u0400-\u04FF\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\u0400-\u04FF\-A-Z0-9+\u0026@#\/%=~()_|])/gi;
	let links=text.match(link_pattern);
	if(null===links){
		return false;
	}
	if(typeof links[0] === 'undefined'){
		return false;
	}
	return links[0];
}
function link_to_http_gate(link){
	let result='';
	let error=false;
	if(0==link.indexOf('https://')){
		result=link;
	}
	else
	if(0==link.indexOf('http://')){
		result=link;
	}
	else
	if(0==link.indexOf('ipfs://')){
		result=ipfs_link(link.substring(7));
	}
	else
	if(0==link.indexOf('sia://')){
		result=sia_link(link.substring(6));
	}
	else{
		error=true;//unknown
	}
	if(error){
		return false;
	}
	return result;
}
function render_preview_data(account,block,json){
	if(typeof account == 'undefined'){
		return;
	}
	if(typeof block == 'undefined'){
		return;
	}
	if(false===json){
		return;
	}
	let result='';
	let image='';
	let link='';
	let image_part=(typeof json.image !== 'undefined');
	if(image_part){
		if(false===json.image){
			image_part=false;
		}
	}
	let link_part=(typeof json.title !== 'undefined');
	let link_image_addon=' style="flex-shrink:1;flex-direction:column;width:30%;"';
	let link_addon=' style="flex-shrink:0;flex-grow:1;flex-direction:column;width:70%;"';
	let wrapper_addon=' style="flex-direction:column;"';
	//console.log('render_preview_data',json);
	if(link_part){
		if(image_part){
			if(!json.image.large){
				link=ltmp(ltmp_arr.render_preview_link,{addon:link_addon,title:json.title,descr:json.description,source:ltmp_arr.icon_copy_link+json.source});
			}
			else{
				link=ltmp(ltmp_arr.render_preview_link,{title:json.title,descr:json.description,source:ltmp_arr.icon_copy_link+json.source});
			}
		}
		else{
			link=ltmp(ltmp_arr.render_preview_link,{title:json.title,descr:json.description,source:ltmp_arr.icon_copy_link+json.source});
		}
	}
	if(image_part){
		if(json.image.large){
			image=ltmp(ltmp_arr.render_preview_large_image,{image:json.image.data});
		}
		else{
			wrapper_addon='';
			if(link_part){
				image=ltmp(ltmp_arr.render_preview_image,{addon:link_image_addon,image:json.image.data});
			}
			else{
				image=ltmp(ltmp_arr.render_preview_image,{prepand:ltmp(ltmp_arr.render_preview_image_addon,{image:json.image.data}),image:json.image.data});
			}
		}
	}

	result=ltmp(ltmp_arr.render_preview_wrapper,{link:json.link,context:image+link,addon:wrapper_addon});

	let current_link='viz://@'+account+'/'+block+'/';
	let view=$('.view[data-level="'+level+'"]');
	if(-1==path.indexOf('viz://')){//look in services views
		let path_parts=path.split('/');
		view=$('.view[data-path="'+path_parts[0]+'"]');
	}
	let actions=view.find('.objects .object[data-link="'+current_link+'"] .preview-container');
	$(actions).html(result);
}
function load_preview_data(link,callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}

	link_domain=link.split('://')[1].split('/')[0];

	//look on cache
	let t=db.transaction(['preview'],'readonly');
	let q=t.objectStore('preview');
	let req=q.index('domain').openCursor(IDBKeyRange.only(link_domain),'next');
	let find=false;
	let cursor_end=false;
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cursor_end){
			cur=false;
		}
		if(cur){
			if(cur.value.link==link){
				find=cur.value;
				cursor_end=true;
			}
			cur.continue();
		}
		else{
			if(false!==find){
				console.log('find in preview cache',link_domain,link);
				callback(find.meta);
			}
			else{
				console.log('need load preview',link_domain,link);
				let xhr = new XMLHttpRequest();
				xhr.timeout=5000;
				xhr.overrideMimeType('text/plain');
				xhr.open('POST','https://readdle.me/preview/');
				xhr.setRequestHeader('accept','application/json, text/plain, */*');
				xhr.setRequestHeader('content-type','application/json');
				xhr.ontimeout = function() {
					console.log('load_preview_data timeout',link);
				};
				xhr.onreadystatechange = function() {
					if(4==xhr.readyState && 200==xhr.status){
						try{
							let json=JSON.parse(xhr.response);
							console.log('load_preview_data response',json);
							let add_t=db.transaction(['preview'],'readwrite');
							let add_q=add_t.objectStore('preview');
							let obj={
								domain:link_domain,
								link:link,
								meta:json.meta,
								time:parseInt(new Date().getTime()/1000),
							};
							add_q.add(obj);
							if(!is_safari){
								if(!is_firefox){
									add_t.commit();
								}
							}
							callback(json.meta);
						}
						catch(e){
							console.log('load_preview_data response json error',xhr.response,e);
							callback(false);
						}
					}
					if(4==xhr.readyState && 200!=xhr.status){
						callback(false);
					}
				};
				let auth_data=paswordless_auth(current_user,users[current_user].regular_key);
				auth_data.link=link;
				xhr.send(JSON.stringify(auth_data));
			}
		}
	};
}
function ipfs_link(cid){
	return 'https://cloudflare-ipfs.com/ipfs/'+cid;
}
function sia_link(skylink){
	return 'https://siasky.net/'+skylink;
}
function html_safe_images(html){
	let arr=html.match(/<img [^>]*src="[^"]*"[^>]*>/gm);
	for(let i in arr){
		let img=arr[i];
		let img_src_pattern=/(.*)src=\"(.*?)\"(.*)/gm;
		let src=img.replace(img_src_pattern,'$2');
		let safe_src=safe_image(src);
		let new_img='';
		if(false===safe_src){
			new_img='';
		}
		else{
			new_img=fast_str_replace(src,safe_src,img);
		}
		html=fast_str_replace(img,new_img,html);
	}
	return html;
}
function safe_image(link){
	let result='';
	let error=false;
	//console.log(typeof avatar,avatar);
	if(0==link.indexOf('https://')){
		result=link;
	}
	else
	if(0==link.indexOf('ipfs://')){
		result=ipfs_link(link.substring(7));
	}
	else
	if(0==link.indexOf('sia://')){
		result=sia_link(link.substring(6));
	}
	else
	if(0==link.indexOf('http://')){
		error=true;//no http
	}
	else
	if(0==link.indexOf('data:')){
		error=true;//no encoded
	}
	else{
		error=true;//unknown
	}
	if(error){
		return false;
	}
	return result;
}
function safe_avatar(avatar){
	let result='';
	let error=false;
	//console.log(typeof avatar,avatar);
	if(0==avatar.indexOf('https://')){
		result=avatar;
	}
	else
	if(0==avatar.indexOf('ipfs://')){
		result=ipfs_link(avatar.substring(7));
	}
	else
	if(0==avatar.indexOf('sia://')){
		result=sia_link(avatar.substring(6));
	}
	else
	if(0==avatar.indexOf('http://')){
		error=true;//no http
	}
	else
	if(0==avatar.indexOf('data:')){
		error=true;//no encoded
	}
	else{
		error=true;//unknown
	}
	if(error){
		result=ltmp_arr.profile_default_avatar;
	}
	return result;
}

var user_profile=false;
function render_session(){
	let toggle_menu=ltmp(ltmp_arr.toggle_menu,{title:ltmp_arr.toggle_menu_title,icon:ltmp_arr.icon_close});
	if(''!=current_user){
		get_user(current_user,false,function(err,result){
			if(!err){
				if(false===user_profile){
					user_profile=JSON.parse(result.profile);
				}
				$('div.menu .session').html(toggle_menu+ltmp(ltmp_arr.menu_session_account,{'account':result.account,'nickname':user_profile.nickname,'avatar':safe_avatar(user_profile.avatar)}));
			}
			else{
				$('div.menu .session').html(toggle_menu+ltmp(ltmp_arr.menu_session_empty,{caption:ltmp_arr.menu_session_error,avatar:ltmp_arr.profile_default_avatar}));
			}
		});
	}
	else{
		$('div.menu .session').html(ltmp(ltmp_arr.menu_session_empty,{caption:ltmp_arr.menu_session_login,avatar:ltmp_arr.profile_default_avatar}));
	}
}

function award(account,block,callback){
	let link='viz://@'+account+'/'+block+'/';
	let beneficiaries_list=[];
	let energy=settings.energy;
	let memo=link;
	if(settings.silent_award){
		memo='';
	}
	let new_energy=0;
	viz.api.getAccount(current_user,app_protocol,function(err,response){
		if(err){
			console.log(err,response);
			callback(false);
		}
		else{
			let vesting_shares=parseFloat(response.vesting_shares);
			let delegated_vesting_shares=parseFloat(response.delegated_vesting_shares);
			let received_vesting_shares=parseFloat(response.received_vesting_shares);
			let effective_vesting_shares=vesting_shares + received_vesting_shares - delegated_vesting_shares;

			let last_vote_time=parse_date(response.last_vote_time);
			let delta_time=parseInt((new Date().getTime() - last_vote_time + timezone_offset())/1000);
			let current_energy=response.energy;
			let new_energy=parseInt(current_energy+(delta_time*10000/432000));//CHAIN_ENERGY_REGENERATION_SECONDS 5 days
			if(new_energy>10000){
				new_energy=10000;
			}
			new_energy-=energy;
			let effective_vesting_shares_int=parseInt(effective_vesting_shares*1000000);//to int shares
			let current_rshares=parseInt(effective_vesting_shares_int*energy/10000);
			let total_reward_shares=parseInt(dgp.total_reward_shares);
			total_reward_shares+=current_rshares;
			let total_reward_fund=parseInt(parseFloat(dgp.total_reward_fund)*1000);//to int tokens
			let predicted_reward=(total_reward_fund*current_rshares)/total_reward_shares;
			predicted_reward=predicted_reward*0.9995;//decrease expectations 0.005%
			predicted_reward=Math.ceil(predicted_reward)/1000;//to float tokens
			if(isNaN(predicted_reward)){
				predicted_reward=0;
			}
			viz.broadcast.award(users[current_user].regular_key,current_user,account,energy,0,memo,beneficiaries_list,function(err,result){
				if(!err){
					add_notify(
						false,
						ltmp(ltmp_arr.notify_arr.award_success,{account:account}),
						ltmp(ltmp_arr.notify_arr.award_info,{amount:predicted_reward,percent:(new_energy/100)+'%'})
					);

					//store awards item
					let read_t=db.transaction(['awards'],'readwrite');
					let read_q=read_t.objectStore('awards');
					let req=read_q.index('object').openCursor(IDBKeyRange.only([account,block]),'next');
					let find=false;
					let obj={
						account:account,
						block:block,
						amount:0
					};
					req.onsuccess=function(event){
						let cur=event.target.result;
						if(cur){
							let obj=cur.value;
							find=true;
							obj.amount+=predicted_reward;
							obj.amount=Math.ceil(obj.amount*1000)/1000;
							cur.update(obj);
							cur.continue();
						}
						else{
							if(!find){
								let add_t=db.transaction(['awards'],'readwrite');
								let add_q=add_t.objectStore('awards');
								obj.amount+=predicted_reward;
								add_q.add(obj);
								if(!is_safari){
									if(!is_firefox){
										add_t.commit();
									}
								}
							}
						}
					};

					callback(true);
				}
				else{
					add_notify(false,'',ltmp(ltmp_arr.notify_arr.award_error,{account:account}));
					console.log(err);
					callback(false);
				}
			});
		}
	});
}

var wait_publish_timer=0;
function wait_publish(last_id,callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	clearTimeout(wait_publish_timer);
	get_user(current_user,true,function(err,result){
		if(!err){
			if(result.start!=last_id){
				get_object(current_user,result.start,function(err,object_result){
					if(!err){
						callback(result.start);
					}
					else{
						wait_publish_timer=setTimeout(function(){
							wait_publish(last_id,callback);
						},1000);
					}
				});
			}
			else{
				wait_publish_timer=setTimeout(function(){
					wait_publish(last_id,callback);
				},1000);
			}
		}
		else{
			wait_publish_timer=setTimeout(function(){
				wait_publish(last_id,callback);
			},1000);
		}
	});
}
function fast_publish(publish_form){
	let text=publish_form.find('textarea[name="text"]').val();
	let action=false;
	text=text.trim();
	let ignore_text=false;
	let reply=false;
	let share=false;

	if(''!==publish_form.data('reply')){
		reply=publish_form.data('reply');
		action=publish_form.prev().find('.actions-view .reply-action');
	}
	if(''!==publish_form.data('share')){
		share=publish_form.data('share');
		action=publish_form.prev().find('.actions-view .share-action');
		ignore_text=true;
	}

	if(''!==text || ignore_text){
		viz.api.getAccount(current_user,app_protocol,function(err,response){
			if(err){
				console.log(err);
				add_notify(false,'',ltmp_arr.gateway_error);
				publish_form.find('.fast-publish-action').removeClass('disabled');
				return;
			}
			else{
				let previous=response.custom_sequence_block_num;
				let new_object={};
				if(previous>0){
					new_object.p=previous;
				}
				if(app_version>1){
					new_object.v=app_version;
				}
				//new_object.t='text';//optional, this is the default
				//new_object.u=new Date().getTime() /1000 | 0;//for delayed publication

				let data={};
				data.text=text;

				if(false!=reply){
					data.r=reply;
				}
				else
				if(false!=share){
					data.s=share;
				}

				new_object.d=data;
				let object_json=JSON.stringify(new_object);

				viz.broadcast.custom(users[current_user].regular_key,[],[current_user],app_protocol,object_json,function(err,result){
					if(result){
						console.log(result);
						setTimeout(function(){
							wait_publish(previous,function(object_block){
								view_path('viz://@'+current_user+'/'+object_block+'/',{},true,false);
								if(false!==action){
									action.removeClass('success');
									publish_form.remove();
								}
							});
						},3000);
					}
					else{
						console.log(err);
						add_notify(false,'',ltmp_arr.gateway_error);
						publish_form.find('.fast-publish-action').removeClass('disabled');
						return;
					}
				});
			}
		});
	}
	else{
		publish_form.find('textarea[name="text"]')[0].focus();
		publish_form.find('.fast-publish-action').removeClass('disabled');
		add_notify(false,'',ltmp_arr.publish_empty_text);
	}
}

function publish(view){
	let text=view.find('textarea[name="text"]').val();
	text=text.trim();

	let loop=false;
	if(''!=view.find('input[name="loop"]').val()){
		loop=parseInt(view.find('input[name="loop"]').val());
		if(loop<=0){
			loop=false;
		}
		console.log('publish with loop:',loop);
	}

	let reply=false;
	if(''!=view.find('input[name="reply"]').val()){
		reply=view.find('input[name="reply"]').val();
		console.log('publish with reply:',reply);
	}

	let share=false;
	if(''!=view.find('input[name="share"]').val()){
		text=view.find('input[name="comment"]').val();
		text=text.trim();
		share=view.find('input[name="share"]').val();
		console.log('publish with share:',reply);
	}

	if(!share){
		if(''==text){
			view.find('.submit-button-ring').removeClass('show');
			view.find('.error').html(ltmp_arr.publish_empty_text);
			view.find('.button').removeClass('disabled');
			return;
		}
	}

	viz.api.getAccount(current_user,app_protocol,function(err,response){
		if(err){
			console.log(err);
			view.find('.submit-button-ring').removeClass('show');
			view.find('.error').html(ltmp_arr.gateway_error);
			view.find('.button').removeClass('disabled');
			return;
		}
		else{
			let previous=response.custom_sequence_block_num;

			if(loop){
				previous=loop;
			}

			let new_object={};
			if(previous>0){
				new_object.p=previous;
			}
			if(app_version>1){
				new_object.v=app_version;
			}
			//new_object.t='text';//optional, this is the default
			//new_object.u=new Date().getTime() /1000 | 0;//for delayed publication

			let data={};
			data.text=text;
			if(false!=reply){
				data.r=reply;
			}
			else
			if(false!=share){
				data.s=share;
			}

			new_object.d=data;
			let object_json=JSON.stringify(new_object);

			viz.broadcast.custom(users[current_user].regular_key,[],[current_user],app_protocol,object_json,function(err,result){
				if(result){
					console.log(result);
					view.find('.success').html(ltmp_arr.publish_success);

					view.find('input').val('');
					view.find('textarea').val('');

					view.find('.submit-button-ring').removeClass('show');
					view.find('.button').removeClass('disabled');
					setTimeout(function(){
						get_user(current_user,true,function(err,result){
							if(!err){
								if(result.start!=previous){
									get_object(current_user,result.start,function(err,object_result){
										if(!err){
											view.find('.success').html(ltmp(ltmp_arr.publish_success_link,{account:current_user,block:result.start}));
										}
									});
								}
							}
						});
					},3000);
				}
				else{
					console.log(err);
					view.find('.submit-button-ring').removeClass('show');
					view.find('.error').html(ltmp_arr.gateway_error);
					view.find('.button').removeClass('disabled');
					return;
				}
			});
		}
	});
}

function clear_awards(el){
	let t,q,req;
	t=db.transaction(['awards'],'readwrite');
	q=t.objectStore('awards');
	req=q.openCursor(null,'next');

	let find=false;
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			update_req=cur.delete();
			cur.continue();
		}
		else{
			$('.view[data-path="dapp:awards"] .objects').html(ltmp_arr.load_more_end_notice);
		}
	};
}

function ignore_hashtags(el){
	let hashtag=el.data('hashtag');
	let hashtag_id=el.data('hashtag-id');
	if(hashtag_id){
		let t,q,req;
		t=db.transaction(['hashtags'],'readwrite');
		q=t.objectStore('hashtags');
		req=q.openCursor(IDBKeyRange.only(hashtag_id),'next');

		let new_status=0;
		req.onsuccess=function(event){
			let cur=event.target.result;
			if(cur){
				let result=cur.value;
				if(2!=result.status){
					result.status=2;
				}
				else{
					result.status=0;
				}
				new_status=result.status;
				cur.update(result);
				cur.continue();
			}
			else{
				if(2==new_status){
					sync_cloud_put_update('ignore_hashtag',hashtag.toLowerCase());
					el.find('.header .ignore-hashtags-action').addClass('negative');
					el.find('.header .pin-hashtags-action').removeClass('positive');
				}
				else{
					sync_cloud_put_update('reset_hashtag',hashtag.toLowerCase());
					el.find('.header .ignore-hashtags-action').removeClass('negative');
				}
				render_right_addon();
			}
		};
	}
}

function hashtag_update(hashtag,status,callback){
	idb_get_id('hashtags','tag',hashtag,function(hashtag_id){
		if(false===hashtag_id){
			let hashtag_info,hashtag_add_t,hashtag_add_q,hashtag_add_req;
			hashtag_info={'tag':hashtag,'count':0,'status':status,'order':0};
			hashtag_add_t=db.transaction(['hashtags'],'readwrite');
			hashtag_add_q=hashtag_add_t.objectStore('hashtags');
			hashtag_add_req=hashtag_add_q.add(hashtag_info);
			if(!is_safari){
				if(!is_firefox){
					hashtag_add_t.commit();
				}
			}
			hashtag_add_req.onsuccess=function(e){
				idb_get_id('hashtags','tag',hashtag,function(hashtag_id){
					if(false!==hashtag_id){
						callback(true);
					}
					else{
						callback(false);
					}
				});
			}
		}
		else{
			let t,q,req;
			t=db.transaction(['hashtags'],'readwrite');
			q=t.objectStore('hashtags');
			req=q.index('tag').openCursor(IDBKeyRange.only(hashtag),'next');

			let find=false;
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					let result=cur.value;
					result.status=status;
					cur.update(result);
					find=true;
				}
				if(find){
					callback(true);
				}
				else{
					callback(false);
				}
			};
		}
	});
}
function pin_hashtags(el){
	let hashtag=el.data('hashtag');
	let hashtag_id=el.data('hashtag-id');
	if(hashtag_id){
		let t,q,req;
		t=db.transaction(['hashtags'],'readwrite');
		q=t.objectStore('hashtags');
		req=q.openCursor(IDBKeyRange.only(hashtag_id),'next');

		let new_status=0;
		req.onsuccess=function(event){
			let cur=event.target.result;
			if(cur){
				let result=cur.value;
				if(1!=result.status){
					result.status=1;
				}
				else{
					result.status=0;
				}
				new_status=result.status;
				cur.update(result);
				cur.continue();
			}
			else{
				if(1==new_status){
					sync_cloud_put_update('pin_hashtag',hashtag.toLowerCase());
					el.find('.header .pin-hashtags-action').addClass('positive');
					el.find('.header .ignore-hashtags-action').removeClass('negative');
				}
				else{
					sync_cloud_put_update('reset_hashtag',hashtag.toLowerCase());
					el.find('.header .pin-hashtags-action').removeClass('positive');
				}
				render_right_addon();
			}
		};
	}
}

function clear_hashtags(el){
	let hashtag=el.data('hashtag');
	let hashtag_id=el.data('hashtag-id');
	if(hashtag_id){
		let t,q,req;
		t=db.transaction(['hashtags_feed'],'readwrite');
		q=t.objectStore('hashtags_feed');
		req=q.index('tag').openCursor(IDBKeyRange.only(hashtag_id),'next');

		let find=false;
		req.onsuccess=function(event){
			let cur=event.target.result;
			if(cur){
				cur.delete();
				cur.continue();
			}
			else{
				del_t=db.transaction(['hashtags'],'readwrite');
				del_q=del_t.objectStore('hashtags');
				del_req=del_q.openCursor(IDBKeyRange.only(hashtag_id),'next');
				del_req.onsuccess=function(event){
					let cur=event.target.result;
					if(cur){
						cur.delete();
						cur.continue();
					}
					else{
						el.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.hashtags_not_found}));
						let header='';
						header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:''});
						header+=ltmp(ltmp_arr.header_caption,{caption:'#'+uppercase_first_symbol(hashtag)});
						el.find('.header').html(header);
						render_right_addon();
					}
				};
			}
		};
	}
}

function mark_readed_notifications(el){
	let t,q,req;
	t=db.transaction(['notifications'],'readwrite');
	q=t.objectStore('notifications');
	req=q.openCursor(null,'next');

	let find=false;
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			let item=cur.value;
			item.status=1;
			cur.update(item);
			cur.continue();
		}
		else{
			$('.view[data-path="dapp:notifications"] .mark-readed-notifications-action').addClass('positive');
			setTimeout(function(){
				$('.view[data-path="dapp:notifications"] .mark-readed-notifications-action').removeClass('positive');
			},3000);
			$('.view[data-path="dapp:notifications"] .objects .notify-item').addClass('readed');
			clearTimeout(load_notifications_count_timer);
			load_notifications_count_timer=setTimeout(function(){load_notifications_count();},100);
		}
	};
}

function clear_readed_notifications(el){
	let t,q,req;
	t=db.transaction(['notifications'],'readwrite');
	q=t.objectStore('notifications');
	req=q.openCursor(null,'next');

	let find=false;
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			let item=cur.value;
			if(1==item.status){
				update_req=cur.delete();
			}
			cur.continue();
		}
		else{
			$('.view[data-path="dapp:notifications"] .clear-readed-notifications-action').addClass('positive');
			setTimeout(function(){
				$('.view[data-path="dapp:notifications"] .clear-readed-notifications-action').removeClass('positive');
			},3000);
			$('.view[data-path="dapp:notifications"] .objects').html(ltmp_arr.load_more_end_notice);
			clearTimeout(load_notifications_count_timer);
			load_notifications_count_timer=setTimeout(function(){load_notifications_count();},100);
		}
	};
}

function subscribe_update(account,callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	get_user(account,false,function(check_err,check_result){
		if(!check_err){
			let update_t=db.transaction(['users'],'readwrite');
			let update_q=update_t.objectStore('users');
			let update_req=update_q.index('account').openCursor(IDBKeyRange.only(account),'next');
			update_req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					let item=cur.value;
					item.status=1;
					cur.update(item);
					cur.continue();
				}
				else{
					callback(true);
				}
			};
		}
		else{
			callback(false);
		}
	});
}
function reset_update(account,callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	get_user(account,false,function(check_err,check_result){
		if(!check_err){
			let update_t=db.transaction(['users'],'readwrite');
			let update_q=update_t.objectStore('users');
			let update_req=update_q.index('account').openCursor(IDBKeyRange.only(account),'next');
			update_req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					let item=cur.value;
					item.status=0;
					cur.update(item);
					cur.continue();
				}
				else{
					callback(true);
				}
			};
		}
		else{
			callback(false);
		}
	});
}
function ignore_update(account,callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	get_user(account,false,function(check_err,check_result){
		if(!check_err){
			let update_t=db.transaction(['users'],'readwrite');
			let update_q=update_t.objectStore('users');
			let update_req=update_q.index('account').openCursor(IDBKeyRange.only(account),'next');
			update_req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					let item=cur.value;
					item.status=2;
					cur.update(item);
					cur.continue();
				}
				else{
					callback(true);
				}
			};
		}
		else{
			callback(false);
		}
	});
}

function subscribe(el){
	let actions=$(el).closest('.user-actions');
	let check_user=actions.data('user');
	let render='';

	subscribe_update(check_user,function(result){
		if(result){
			sync_cloud_put_update('subscribe',check_user);
			render+=ltmp(ltmp_arr.subscribed_link,{icon:ltmp_arr.icon_subscribed});
			render+=ltmp(ltmp_arr.unsubscribe_link,{icon:ltmp_arr.icon_unsubscribe});

			feed_load(check_user,false,false,true,function(err,result){
				console.log('feed load by subscribe',err,result);
			});
		}
		else{
			render+=ltmp(ltmp_arr.subscribe_link,{icon:ltmp_arr.icon_subscribe});
			render+=ltmp(ltmp_arr.ignore_link,{icon:ltmp_arr.icon_ignore});
		}
		actions.html(render);
	});
}
function unsubscribe(el){
	let actions=$(el).closest('.user-actions');
	let check_user=actions.data('user');
	let render='';

	reset_update(check_user,function(result){
		if(result){
			sync_cloud_put_update('reset',check_user);
			render+=ltmp(ltmp_arr.subscribe_link,{icon:ltmp_arr.icon_subscribe});
			render+=ltmp(ltmp_arr.ignore_link,{icon:ltmp_arr.icon_ignore});
		}
		else{
			render+=ltmp(ltmp_arr.subscribed_link,{icon:ltmp_arr.icon_subscribed});
			render+=ltmp(ltmp_arr.unsubscribe_link,{icon:ltmp_arr.icon_unsubscribe});
		}
		actions.html(render);
	});
}

function ignore(el){
	let actions=$(el).closest('.user-actions');
	let check_user=actions.data('user');
	let render='';

	ignore_update(check_user,function(result){
		if(result){
			sync_cloud_put_update('ignore',check_user);
			render+=ltmp(ltmp_arr.ignored_link,{icon:ltmp_arr.icon_ignored});
			render+=ltmp(ltmp_arr.unignore_link,{icon:ltmp_arr.icon_unsubscribe});
		}
		else{
			render+=ltmp(ltmp_arr.subscribe_link,{icon:ltmp_arr.icon_subscribe});
			render+=ltmp(ltmp_arr.ignore_link,{icon:ltmp_arr.icon_ignore});
		}
		actions.html(render);
	});
}
function unignore(el){
	let actions=$(el).closest('.user-actions');
	let check_user=actions.data('user');
	let render='';

	reset_update(check_user,function(result){
		if(result){
			sync_cloud_put_update('reset',check_user);
			render+=ltmp(ltmp_arr.subscribe_link,{icon:ltmp_arr.icon_subscribe});
			render+=ltmp(ltmp_arr.ignore_link,{icon:ltmp_arr.icon_ignore});
		}
		else{
			render+=ltmp(ltmp_arr.ignored_link,{icon:ltmp_arr.icon_ignored});
			render+=ltmp(ltmp_arr.unignore_link,{icon:ltmp_arr.icon_unsubscribe});
		}
		actions.html(render);
	});
}

function markdown_encode_text(text){
	//Using HTML Entity (hex)
	text=fast_str_replace('&','&#x26;',text);//first
	text=fast_str_replace('#','&#x23;',text);//second

	text=fast_str_replace('~','&#x7e;',text);
	text=fast_str_replace('`','&#x60;',text);
	text=fast_str_replace('[','&#x5b;',text);
	text=fast_str_replace(']','&#x5d;',text);
	text=fast_str_replace('(','&#x28;',text);
	text=fast_str_replace(')','&#x29;',text);
	text=fast_str_replace('_','&#x5f;',text);
	text=fast_str_replace('>','&#x3e;',text);
	text=fast_str_replace('<','&#x3c;',text);
	text=fast_str_replace('"','&#x22;',text);
	text=fast_str_replace('*','&#x2a;',text);
	return text;
}
function markdown_decode_text(text){
	//Using HTML Entity (hex)
	text=fast_str_replace('&#x23;','#',text);//second
	text=fast_str_replace('&#x26;','&',text);//first

	text=fast_str_replace('&#x7e;','~',text);
	text=fast_str_replace('&#x60;','`',text);
	text=fast_str_replace('&#x5b;','[',text);
	text=fast_str_replace('&#x5d;',']',text);
	text=fast_str_replace('&#x28;','(',text);
	text=fast_str_replace('&#x29;',')',text);
	text=fast_str_replace('&#x5f;','_',text);
	//text=fast_str_replace('&#x3e;','>',text);
	//text=fast_str_replace('&#x3c;','<',text);
	//text=fast_str_replace('&#x22;','"',text);
	text=fast_str_replace('&#x2a;','*',text);
	return text;
}
function markdown_code(text){
	let bold_pattern=/\*\*(.*?)\*\*/gm;
	text=text.replace(bold_pattern,'<b>$1</b>');
	let italic_pattern=/\_\_(.*?)\_\_/gm;
	text=text.replace(italic_pattern,'<i>$1</i>');
	let strikethrough_pattern=/\~\~(.*?)\~\~/gm;
	text=text.replace(strikethrough_pattern,'<strike>$1</strike>');
	let inline_code_pattern=/\`(.*?)\`/gm;
	text=text.replace(inline_code_pattern,'<code>$1</code>');

	let images_pattern=/\!\[(.*?)\]\((.*?)\)/gm;
	text=text.replace(images_pattern,'<img src="$2" alt="$1"/>');

	let links_pattern=/\[(.*?)\]\((.*?)\)/gm;
	text=text.replace(links_pattern,'<a href="$2">$1</a>');

	text=markdown_decode_text(text);
	text=text.trim();
	text=text.replace("\n","\n<br />\n");
	return text;
}
function markdown_clear_code(text){
	let bold_pattern=/\*\*(.*?)\*\*/gm;
	text=text.replace(bold_pattern,'$1');
	let italic_pattern=/\_\_(.*?)\_\_/gm;
	text=text.replace(italic_pattern,'$1');
	let strikethrough_pattern=/\~\~(.*?)\~\~/gm;
	text=text.replace(strikethrough_pattern,'$1');
	let inline_code_pattern=/\`(.*?)\`/gm;
	text=text.replace(inline_code_pattern,'$1');

	let images_pattern=/\!\[(.*?)\]\((.*?)\)/gm;
	text=text.replace(images_pattern,'$2 $1');

	let links_pattern=/\[(.*?)\]\((.*?)\)/gm;
	text=text.replace(links_pattern,'$2 $1');

	text=text.trim();
	return text;
}
function markdown_encode(element,level){
	let result='';
	let data='';
	if(element.hasChildNodes()){
		let childs=element.childNodes;
		for(let i=0;i<childs.length;i++){
			let child=childs[i];
			data+=markdown_encode(child,1+level);
		}
	}
	else{
		if(typeof element.data !== 'undefined'){
			data=markdown_encode_text(element.data);
		}
	}
	if('DIV'==element.nodeName){
		result=data;
		while(-1!=result.indexOf("\n\n\n")){
			result=fast_str_replace("\n\n\n","\n\n",result);
		}
		result=result.trim();
	}
	if('BR'==element.nodeName){
		result="\n";
	}
	if('CODE'==element.nodeName){
		result='`'+data+'`';
	}
	if('EM'==element.nodeName){
		result='__'+data+'__';
	}
	if('I'==element.nodeName){
		result='__'+data+'__';
	}
	if('STRONG'==element.nodeName){
		result='**'+data+'**';
	}
	if('B'==element.nodeName){
		result='**'+data+'**';
	}
	if('STRIKE'==element.nodeName){
		result='~~'+data+'~~';
	}
	if('#text'==element.nodeName){
		result=data;
	}
	if('P'==element.nodeName){
		result=data;
		result="\n"+result+"\n";
	}
	if('H1'==element.nodeName){
		result='';
		if(0==level){
			result=data;
		}
	}
	if('H2'==element.nodeName){
		result='## '+data;
		result="\n"+result+"\n";
	}
	if('H3'==element.nodeName){
		result='### '+data;
		result="\n"+result+"\n";
	}
	if('BLOCKQUOTE'==element.nodeName){
		result='> '+data;
		result="\n"+result+"\n";
	}
	if('CITE'==element.nodeName){
		result='>> '+data;
		result="\n"+result+"\n";
	}
	if('HR'==element.nodeName){
		result='***';
		result="\n\n"+result+"\n\n";
	}
	if('A'==element.nodeName){
		if(null===element.getAttribute('href')){
			result=data;
		}
		else{
			result='['+data+']('+markdown_encode_text(element.getAttribute('href'))+')';
		}
	}
	if('IMG'==element.nodeName){
		result='!['+markdown_encode_text(element.getAttribute('alt'))+']('+markdown_encode_text(element.getAttribute('src'))+')';
	}
	return result;
}
function markdown_decode(text,rewrite_block){
	rewrite_block=typeof rewrite_block==='undefined'?false:rewrite_block;
	text=text.trim();
	while(-1!=text.indexOf("\n\n\n")){
		text=fast_str_replace("\n\n\n","\n\n",text);
	}
	//let images_pattern=/\!\[(.*?)\]\((.*?)\)/gm;
	let text_arr=text.split("\n\n");
	let html='';
	for(let i in text_arr){
		let el=text_arr[i];
		let first=false;
		let context=false;
		if(-1!=el.indexOf(' ')){
			first=el.substring(0,el.indexOf(' '));
		}
		let block='p';
		if(false!==first){
			if('>>'==first){
				block='blockquote';
			}
			else
			if('>'==first){
				block='cite';
			}
			else
			if('##'==first){
				block='h2';
			}
			else
			if('###'==first){
				block='h3';
			}
			else{
				first=false;
			}
		}
		if(false!==rewrite_block){
			block=rewrite_block;
		}
		if(false!==first){
			context=el.substring(el.indexOf(' ')+1);
		}
		else{
			context=el;
		}
		let result='';
		if('***'==el){
			result='<hr />';
		}
		else{
			/*
			if(context.test(images_pattern)){
				block='center';
			}
			*/
			result='<'+block+'>';
			result+=markdown_code(context);
			result+='</'+block+'>';
		}
		html+=result+"\n";
	}
	return html.trim();
}

function load_new_objects(indicator){
	let objects=indicator.closest('.objects');
	objects_counter=objects.find('.object').length;
	let feed_time=0;
	if(typeof objects.data('feed-time') !== 'undefined'){
		feed_time=parseInt(objects.data('feed-time'));
	}
	let update_t=db.transaction(['feed'],'readonly');
	let update_q=update_t.objectStore('feed');
	let new_feed_time=0;
	let new_objects=[];
	let update_req;
	let check_level=0;//load new objects only in feed (0 level)
	if(0==feed_time){
		update_req=update_q.index('time').openCursor(null,'prev');
	}
	else{
		update_req=update_q.index('time').openCursor(IDBKeyRange.lowerBound(feed_time,true),'prev');
	}
	update_req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			let item=cur.value;
			if(0==new_feed_time){
				new_feed_time=item.time;
				objects.data('feed-time',new_feed_time);
			}
			new_objects.push(item);
			cur.continue();
		}
		else{
			console.log('load_new_objects end cursor',new_objects);

			//reset feed counter
			$('.counter-feed').removeClass('show');
			$('.counter-feed').html('0');

			for(let i in new_objects){
				let object=new_objects[i];
				let object_view=render_object(object.account,object.block,'feed',check_level);
				indicator.before(object_view);
				if(0==objects_counter){
					$(window)[0].scrollTo({top:0});
				}
			}
			setTimeout(function(){
				if(0!=objects_counter){
					$(window)[0].scrollTo({behavior:'smooth',top:(indicator.offset().top>400?indicator.offset().top-100:indicator.offset().top)});
				}
				indicator.data('items',0);
				indicator.html(ltmp_arr.feed_no_new_objects);
				indicator.insertBefore(objects.find('.object:first-child')[0]);
				indicator.removeClass('show');
				indicator.removeClass('disabled');
			},200);
		}
	};
}

var address_bar_blur=function(event){
	$(event.target).removeClass('focused');
	$(event.target)[0].removeEventListener('blur',address_bar_blur);
};

var notify_counter=-1;
var notify_timers=[];

function notify_close(id){
	let notify=$('.notify-wrapper[data-id="'+id+'"]');
	notify.removeClass('show');
	setTimeout(function(){notify.remove();},1000);
}
function notify_remove_timer(event){
	let notify=event.target;
	let id=$(notify).data('id');
	clearTimeout(notify_timers['c'+id]);
	console.log('notify_remove_timer',event,id);
}
function notify_add_timer(event){
	let notify=event.target;
	let id=$(notify).data('id');
	notify_timers['c'+id]=setTimeout(function(){
		notify_close(id);
	},1500);
	console.log('notify_add_timer',event,id);
}
function notify_show(id){
	let notify=$('.notify-wrapper[data-id="'+id+'"]');
	notify.addClass('show');
	notify[0].addEventListener('mouseenter',notify_remove_timer,false);
	notify[0].addEventListener('mouseleave',notify_add_timer,false);
}
function add_notify(store,title,text,link,service){
	service=(typeof service !== 'undefined')?service:false;
	if(!service){
		if(whitelabel_init){
			return;
		}
		if(false!==mute_notifications){
			return;
		}
	}
	store=typeof store==='undefined'?false:store;
	title=typeof title==='undefined'?'':title;
	text=typeof text==='undefined'?'':text;
	link=typeof link==='undefined'?'':link;
	let render='';
	let line=true;
	if(''!=title){
		render+=ltmp(ltmp_arr.notify_title,{caption:title});
		if(''!=text){
			line=false;
		}
	}
	if(''!=text){
		if(''!=link){
			render+=ltmp(ltmp_arr.notify_link,{link:link,text:text});
		}
		else{
			render+=ltmp(ltmp_arr.notify_text,{text:text});
		}
	}
	if(store){
		let obj={
			title:title,
			text:text,
			link:link,
			status:0
		};
		let add_t=db.transaction(['notifications'],'readwrite');
		let add_q=add_t.objectStore('notifications');
		add_q.add(obj);
		if(!is_safari){
			if(!is_firefox){
				add_t.commit();
			}
		}
		add_t.oncomplete=function(e){
			clearTimeout(load_notifications_count_timer);
			load_notifications_count_timer=setTimeout(function(){load_notifications_count();},100);

			let read_t=db.transaction(['notifications'],'readonly');
			let read_q=read_t.objectStore('notifications');
			let req=read_q.openCursor(null,'prev');
			let find=false;
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					let notify_id=cur.value.id;
					let notify=ltmp(ltmp_arr.notify,{id:notify_id,addon:(line?' line':''),context:render});
					$('.notifications').prepend(notify);
					setTimeout(function(){
						notify_show(notify_id);
					},20);
					notify_timers['c'+notify_id]=setTimeout(function(){
						notify_close(notify_id);
					},3000);
				}
			};
		}
	}
	else{
		let notify_id=notify_counter;
		let notify=ltmp(ltmp_arr.notify,{id:notify_id,addon:(line?' line':''),context:render});
		$('.notifications').prepend(notify);
		setTimeout(function(){
			notify_show(notify_id);
		},20);
		notify_timers['c'+notify_id]=setTimeout(function(){
			notify_close(notify_id);
		},3000);
		notify_counter=notify_counter-1;
	}
}

function app_mouse(e){
	if(!e)e=window.event;
	var target=e.target || e.srcElement;
	//add header link element input behaviour to select all text on first focus
	if($(target).hasClass('header-link')){
		if(!$(target).hasClass('focused')){
			//not for main feed view
			if('viz://'!=$(target).val()){
				$(target)[0].select();
				$(target)[0].setSelectionRange(0,99999);
				$(target).addClass('focused');
				$(target)[0].addEventListener('blur',address_bar_blur,false);
			}
		}
	}
	//active icons first
	if($(target).hasClass('icon-copy-action')){
		let icon=$(target);
		icon.addClass('success');
		let view=$(target).closest('.view');
		$('.text-copy').val(view.find('.header-link').val());
		$('.text-copy')[0].select();
		$('.text-copy')[0].setSelectionRange(0,99999);
		document.execCommand("copy");
		setTimeout(function(){icon.removeClass('success');},4000);
	}
	if($(target).hasClass('icon-search-action')){
		if(!$(target).hasClass('success')){
			$(target).addClass('success');
			let view=$(target).closest('.view');
			let search=view.find('.header-link').val();
			if(''!=search){
				if(-1!=search.indexOf('viz://')){
					view_path(search,{},true,false);
				}
				else{
					if('@'==search.substring(0,1)){
						search=search.substring(1);
					}
					view_path('viz://@'+search+'/',{},true,false);
				}
			}
			else{
				view_path('viz://',{},true,false);
			}
			e.preventDefault();
		}
	}
	//go parent element, if event on icon
	if($(target).hasClass('icon')){
		target=$(target).parent();
	}
	if(typeof $(target).attr('data-href') != 'undefined'){
		let href=$(target).attr('data-href');
		let back_to='';
		if($(target).hasClass('close-notify-action')){
			set_notify_readed($(target).closest('.notify-wrapper').data('id'));

			let notify=$(target).parent();
			let wrapper=notify.parent();
			wrapper.removeClass('show');
			setTimeout(function(){wrapper.remove();},1000);
		}
		else{
			//console.log('check back-force data',$(target).closest('.view').data('back-force'));
			if($(target).closest('.view').data('back-force')){
				back_to=path+(''==query?'':'?'+query);
			}
		}
		if('viz://'==href){
			if(0==level){
				$('.view[data-level="0"]').data('scroll',0);
			}
		}
		view_path(href,{back:back_to},true,false);
		e.preventDefault();
	}
	if($(target).hasClass('read-notify-action')){
		console.log('read-notify-action click');
		let notify_id=$(target).data('id');
		let notify_link=false;
		let t,q,req;
		t=db.transaction(['notifications'],'readwrite');
		q=t.objectStore('notifications');
		req=q.openCursor(IDBKeyRange.only(notify_id),'next');

		req.onsuccess=function(event){
			let cur=event.target.result;
			if(cur){
				let item=cur.value;
				if(typeof item.link !== 'undefined'){
					notify_link=item.link;
				}
				item.status=1;
				cur.update(item);
				$(target).addClass('readed');
				cur.continue();
			}
			else{
				clearTimeout(load_notifications_count_timer);
				load_notifications_count_timer=setTimeout(function(){load_notifications_count();},100);

				if(notify_link){
					view_path(notify_link,{back:path},true,false);
				}
			}
		};
	}
	if($(target).hasClass('notify')){
		set_notify_readed($(target).closest('.notify-wrapper').data('id'));

		let wrapper=$(target).parent();
		wrapper.removeClass('show');
		setTimeout(function(){wrapper.remove();},1000);
	}
	if($(target).hasClass('article-settings-action')){
		let view=$(target).closest('.view');
		if($(target).hasClass('positive')){
			$(target).removeClass('positive');
			$(view).find('.content-view[data-type="article"]').find('.article-settings').css('display','none');
			$(view).find('.content-view[data-type="article"]').find('.article-editor').css('display','block');
		}
		else{
			$(target).addClass('positive');
			$(view).find('.content-view[data-type="article"]').find('.article-settings').css('display','block');
			$(view).find('.content-view[data-type="article"]').find('.article-editor').css('display','none');
		}
	}
	if($(target).hasClass('article-editor-action')){
		let view=$(target).closest('.view');
		if($(target).hasClass('positive')){
			document.location.hash='dapp:publish/';
		}
		else{
			document.location.hash='dapp:publish/?publication';
		}
	}
	if($(target).hasClass('editor-separator-action')){
		if(!$(target).hasClass('disabled')){
			document.execCommand('insertHTML',false,'<hr />');
			editor_change();
		}
	}
	if($(target).hasClass('editor-header2-action')){
		if(!$(target).hasClass('disabled')){
			let selection=window.getSelection();
			if(typeof selection !== "undefined"){
				if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
					let parent_element=$(selection.focusNode.parentNode)[0];
					let parent_element_type=parent_element.nodeName;
					if('DIV'==parent_element_type){
						parent_element=$(selection.focusNode)[0];
						parent_element_type=parent_element.nodeName;
					}
					let old_parent_type=false;
					let new_parent_type=false;
					$('.editor-formatter > a.editor-header2-action').removeClass('positive');
					$('.editor-formatter > a.editor-header3-action').removeClass('positive');
					$('.editor-formatter > a.editor-quote-action').removeClass('positive');
					$('.editor-formatter > a.editor-quote-action').removeClass('positive-alt');
					if('P'==parent_element_type){
						old_parent_type='p';
						new_parent_type='h2';

						$('.editor-formatter > a.editor-header2-action').addClass('positive');
					}
					else
					if('CITE'==parent_element_type){
						old_parent_type='cite';
						new_parent_type='h2';
						$('.editor-formatter > a.editor-header2-action').addClass('positive');
					}
					else
					if('BLOCKQUOTE'==parent_element_type){
						old_parent_type='blockquote';
						new_parent_type='h2';
						$('.editor-formatter > a.editor-header2-action').addClass('positive');
					}
					else
					if('H3'==parent_element_type){
						old_parent_type='h3';
						new_parent_type='h2';
						$('.editor-formatter > a.editor-header2-action').addClass('positive');
					}
					else
					if('H2'==parent_element_type){
						old_parent_type='h2';
						new_parent_type='p';
					}
					let html=parent_element.outerHTML;
					html=fast_str_replace('<'+old_parent_type+'>','',html);
					html=fast_str_replace('</'+old_parent_type+'>','',html);
					parent_element.outerHTML='<'+new_parent_type+' id="new_selection_temp">'+html+'</'+new_parent_type+'>';
					$('.editor-text')[0].focus();

					editor_change();

					let new_selection_temp=document.getElementById('new_selection_temp');
					let range=document.createRange();
					range.selectNodeContents(new_selection_temp);
					selection.removeAllRanges();
					selection.addRange(range);
					new_selection_temp.removeAttribute('id');
				}
			}
		}
	}
	if($(target).hasClass('editor-header3-action')){
		if(!$(target).hasClass('disabled')){
			let selection=window.getSelection();
			if(typeof selection !== "undefined"){
				if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
					let parent_element=$(selection.focusNode.parentNode)[0];
					let parent_element_type=parent_element.nodeName;
					if('DIV'==parent_element_type){
						parent_element=$(selection.focusNode)[0];
						parent_element_type=parent_element.nodeName;
					}
					let old_parent_type=false;
					let new_parent_type=false;
					$('.editor-formatter > a.editor-header2-action').removeClass('positive');
					$('.editor-formatter > a.editor-header3-action').removeClass('positive');
					$('.editor-formatter > a.editor-quote-action').removeClass('positive');
					$('.editor-formatter > a.editor-quote-action').removeClass('positive-alt');
					if('P'==parent_element_type){
						old_parent_type='p';
						new_parent_type='h3';

						$('.editor-formatter > a.editor-header3-action').addClass('positive');
					}
					else
					if('CITE'==parent_element_type){
						old_parent_type='cite';
						new_parent_type='h3';
						$('.editor-formatter > a.editor-header3-action').addClass('positive');
					}
					else
					if('BLOCKQUOTE'==parent_element_type){
						old_parent_type='blockquote';
						new_parent_type='h3';
						$('.editor-formatter > a.editor-header2-action').addClass('positive');
					}
					else
					if('H2'==parent_element_type){
						old_parent_type='h2';
						new_parent_type='h3';
						$('.editor-formatter > a.editor-header3-action').addClass('positive');
					}
					else
					if('H3'==parent_element_type){
						old_parent_type='h3';
						new_parent_type='p';
					}
					let html=parent_element.outerHTML;
					html=fast_str_replace('<'+old_parent_type+'>','',html);
					html=fast_str_replace('</'+old_parent_type+'>','',html);
					parent_element.outerHTML='<'+new_parent_type+' id="new_selection_temp">'+html+'</'+new_parent_type+'>';
					$('.editor-text')[0].focus();

					editor_change();

					let new_selection_temp=document.getElementById('new_selection_temp');
					let range=document.createRange();
					range.selectNodeContents(new_selection_temp);
					selection.removeAllRanges();
					selection.addRange(range);
					new_selection_temp.removeAttribute('id');
				}
			}
		}
	}
	if($(target).hasClass('editor-quote-action')){
		if(!$(target).hasClass('disabled')){
			let selection=window.getSelection();
			if(typeof selection !== "undefined"){
				if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
					let parent_element=$(selection.focusNode.parentNode)[0];
					let parent_element_type=parent_element.nodeName;
					if('DIV'==parent_element_type){
						parent_element=$(selection.focusNode)[0];
						parent_element_type=parent_element.nodeName;
					}
					let old_parent_type=false;
					let new_parent_type=false;
					$('.editor-formatter > a.editor-header2-action').removeClass('positive');
					$('.editor-formatter > a.editor-header3-action').removeClass('positive');
					$('.editor-formatter > a.editor-quote-action').removeClass('positive');
					$('.editor-formatter > a.editor-quote-action').removeClass('positive-alt');
					if('P'==parent_element_type){
						old_parent_type='p';
						new_parent_type='cite';

						$('.editor-formatter > a.editor-quote-action').addClass('positive');
					}
					else
					if('H2'==parent_element_type){
						old_parent_type='h2';
						new_parent_type='cite';

						$('.editor-formatter > a.editor-quote-action').addClass('positive');
					}
					else
					if('H3'==parent_element_type){
						old_parent_type='h3';
						new_parent_type='cite';

						$('.editor-formatter > a.editor-quote-action').addClass('positive');
					}
					else
					if('CITE'==parent_element_type){
						old_parent_type='cite';
						new_parent_type='blockquote';
						$('.editor-formatter > a.editor-quote-action').addClass('positive-alt');
					}
					else
					if('BLOCKQUOTE'==parent_element_type){
						old_parent_type='blockquote';
						new_parent_type='p';
					}
					let html=parent_element.outerHTML;
					html=fast_str_replace('<'+old_parent_type+'>','',html);
					html=fast_str_replace('</'+old_parent_type+'>','',html);
					parent_element.outerHTML='<'+new_parent_type+' id="new_selection_temp">'+html+'</'+new_parent_type+'>';
					$('.editor-text')[0].focus();

					editor_change();

					let new_selection_temp=document.getElementById('new_selection_temp');
					let range=document.createRange();
					range.selectNodeContents(new_selection_temp);
					selection.removeAllRanges();
					selection.addRange(range);
					new_selection_temp.removeAttribute('id');
				}
			}
		}
	}
	if($(target).hasClass('editor-code-action')){
		if(!$(target).hasClass('disabled')){
			let selection=window.getSelection();
			if(typeof selection !== "undefined"){
				let selection_html=get_selection_html();
				let selection_text=selection.toString();
				if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
					if($(target).hasClass('positive')){
						$(target).removeClass('positive');
						let parent_element=$(selection.focusNode.parentNode)[0];
						let parent_element_type=parent_element.nodeName;
						if(''==selection_text){
							if('CODE'==parent_element_type){
								let range=document.createRange();
								range.selectNodeContents(parent_element);
								selection.removeAllRanges();
								selection.addRange(range);
								selection_text=selection.toString();
							}
						}

						html='<b id="new_selection_temp">'+selection_text+'</b>';
						document.execCommand('insertHTML',false,html);

						let new_selection_temp=document.getElementById('new_selection_temp');
						let range=document.createRange();
						range.selectNodeContents(new_selection_temp);
						selection.removeAllRanges();
						selection.addRange(range);
						new_selection_temp.removeAttribute('id');
						console.log(typeof new_selection_temp,new_selection_temp.nodeType);

						document.execCommand('bold',false,false);
						editor_change();
					}
					else{
						$(target).addClass('positive');
						selection_insert_tag('code',selection_text);
						editor_change();
					}
				}
			}
		}
	}
	if($(target).hasClass('editor-link-action')){
		if(!$(target).hasClass('disabled')){
			if($(target).hasClass('positive')){
				$(target).removeClass('positive');
				let selection=window.getSelection();
				if(typeof selection !== "undefined"){
					if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
						let selection_text=selection.toString();
						let parent_element=$(selection.focusNode.parentNode)[0];
						let parent_element_type=parent_element.nodeName;
						if(''==selection_text){
							if('A'==parent_element_type){
								let range=document.createRange();
								range.selectNodeContents(parent_element);
								selection.removeAllRanges();
								selection.addRange(range);
							}
							document.execCommand('unlink',false,null);
						}
						else{
							document.execCommand('unlink',false,null);
						}
					}
				}
			}
			else{
				let url=prompt(ltmp_arr.editor_link_prompt,ltmp_arr.editor_link_placeholder_prompt);
				if(url && url!='' && url!=ltmp_arr.editor_link_placeholder_prompt){
					$(target).addClass('positive');
					document.execCommand('createlink',false,url);
				}
			}
		}
	}
	if($(target).hasClass('editor-image-action')){
		if(!$(target).hasClass('disabled')){
			if(!$(target).hasClass('positive')){
				let selection=window.getSelection();
				if(typeof selection !== "undefined"){
					if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
						let selection_text=selection.toString();
						let url=prompt(ltmp_arr.editor_image_prompt,ltmp_arr.editor_link_placeholder_prompt);
						if(url && url!='' && url!=ltmp_arr.editor_link_placeholder_prompt){
							let img_el=selection_insert_tag('img');
							img_el.setAttribute('src',url);
							img_el.setAttribute('alt',selection_text);
							editor_change();
						}
					}
				}
			}
		}
	}
	if($(target).hasClass('editor-attach-image-action')){
		if(!$(target).hasClass('disabled')){
			if(!$(target).hasClass('positive')){
				let selection=window.getSelection();
				if(typeof selection !== "undefined"){
					if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
						let selection_text=selection.toString();
						sia_upload_percent=0;
						sia_upload(/image.*/,function(result){
							if(typeof result == 'boolean'){
								if(result){
									$(target).addClass('positive');
								}
								else{
									add_notify(false,
										ltmp_arr.notify_arr.error,
										ltmp_arr.notify_arr.upload_incorrect_format
									);
									sia_upload_percent=0;
									$(target).removeClass('positive');
								}
							}
							else
							if(typeof result == 'string'){
								let link=sia_link(result);
								let img_el=selection_insert_tag('img');
								img_el.setAttribute('src',link);
								img_el.setAttribute('alt',selection_text);
								$(target).removeClass('positive');
								sia_upload_percent=0;
								editor_change();
							}
							else{
								if(typeof result == 'object'){
									if(typeof result.loaded !== 'undefined'){
										let percent = parseInt(result.loaded / result.total * 100);
										if(percent>(sia_upload_percent+10)){
											clearTimeout(sia_upload_percent_timer);
											sia_upload_percent_timer=setTimeout(function(){
												add_notify(false,
													ltmp_arr.notify_arr.upload,
													ltmp(ltmp_arr.notify_arr.upload_percent,{percent:percent})
												);
											},1000);
											sia_upload_percent=percent;
										}
									}
								}
							}
						});
					}
				}
			}
		}
	}
	if($(target).hasClass('editor-attach-action')){
		if(!$(target).hasClass('disabled')){
			if(!$(target).hasClass('positive')){
				let selection=window.getSelection();
				if(typeof selection !== "undefined"){
					if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
						let selection_text=selection.toString();
						sia_upload_percent=0;
						sia_upload(/.*/,function(result){
							if(typeof result == 'boolean'){
								if(result){
									$(target).addClass('positive');
								}
								else{
									add_notify(false,
										ltmp_arr.notify_arr.error,
										ltmp_arr.notify_arr.upload_incorrect_format
									);
									sia_upload_percent=0;
									$(target).removeClass('positive');
								}
							}
							else
							if(typeof result == 'string'){
								let text='sia://'+result;
								let link=sia_link(result);
								if(''==selection_text){
									selection_text=text;
								}
								let link_el=selection_insert_tag('a',text);
								$(link_el).attr('href',link);
								$(link_el).attr('target','_blank');
								$(target).removeClass('positive');
								sia_upload_percent=0;
								editor_change();
							}
							else{
								if(typeof result == 'object'){
									if(typeof result.loaded !== 'undefined'){
										let percent = parseInt(result.loaded / result.total * 100);
										if(percent>(sia_upload_percent+10)){
											clearTimeout(sia_upload_percent_timer);
											sia_upload_percent_timer=setTimeout(function(){
												add_notify(false,
													ltmp_arr.notify_arr.upload,
													ltmp(ltmp_arr.notify_arr.upload_percent,{percent:percent})
												);
											},1000);
											sia_upload_percent=percent;
										}
									}
								}
							}
						});
					}
				}
			}
		}
	}
	if($(target).hasClass('editor-bold-action')){
		if(!$(target).hasClass('disabled')){
			if($(target).hasClass('positive')){
				$(target).removeClass('positive');
				let selection=window.getSelection();
				if(typeof selection !== "undefined"){
					let selection_text=selection.toString();
					if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
						let parent_element=$(selection.focusNode.parentNode)[0];
						let parent_element_type=parent_element.nodeName;
						if(''==selection_text){
							if('B'==parent_element_type){
								let range=document.createRange();
								range.selectNodeContents(parent_element);
								selection.removeAllRanges();
								selection.addRange(range);
							}
							if('STRONG'==parent_element_type){
								let range=document.createRange();
								range.selectNodeContents(parent_element);
								selection.removeAllRanges();
								selection.addRange(range);
							}
						}
					}
				}
				document.execCommand('bold',false,false);
			}
			else{
				$(target).addClass('positive');
				document.execCommand('bold',false,true);
			}
		}
	}
	if($(target).hasClass('editor-italic-action')){
		if(!$(target).hasClass('disabled')){
			if($(target).hasClass('positive')){
				$(target).removeClass('positive');
				let selection=window.getSelection();
				if(typeof selection !== "undefined"){
					let selection_text=selection.toString();
					if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
						let parent_element=$(selection.focusNode.parentNode)[0];
						let parent_element_type=parent_element.nodeName;
						if(''==selection_text){
							if('I'==parent_element_type){
								let range=document.createRange();
								range.selectNodeContents(parent_element);
								selection.removeAllRanges();
								selection.addRange(range);
							}
							if('EM'==parent_element_type){
								let range=document.createRange();
								range.selectNodeContents(parent_element);
								selection.removeAllRanges();
								selection.addRange(range);
							}
						}
					}
				}
				document.execCommand('italic',false,false);
			}
			else{
				$(target).addClass('positive');
				document.execCommand('italic',false,true);
			}
		}
	}
	if($(target).hasClass('editor-strikethrough-action')){
		if(!$(target).hasClass('disabled')){
			if($(target).hasClass('positive')){
				$(target).removeClass('positive');
				let selection=window.getSelection();
				if(typeof selection !== "undefined"){
					let selection_text=selection.toString();
					if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
						let parent_element=$(selection.focusNode.parentNode)[0];
						let parent_element_type=parent_element.nodeName;
						if(''==selection_text){
							if('STRIKE'==parent_element_type){
								let range=document.createRange();
								range.selectNodeContents(parent_element);
								selection.removeAllRanges();
								selection.addRange(range);
							}
						}
					}
				}
				document.execCommand('strikeThrough',false,false);
			}
			else{
				$(target).addClass('positive');
				document.execCommand('strikeThrough',false,true);
			}
		}
	}
	if($(target).hasClass('pin-hashtag-to-top-action')){
		let hashtag_id=$(target).closest('.hashtag-item').data('hashtag-id');
		let read_t=db.transaction(['hashtags'],'readwrite');
		let read_q=read_t.objectStore('hashtags');
		let req=read_q.index('status').openCursor(IDBKeyRange.only(1),'next');
		let num=2;
		req.onsuccess=function(event){
			let cur=event.target.result;
			if(cur){
				let item=cur.value;
				if(hashtag_id==item.id){
					item.order=1;
				}
				else{
					item.order=num;
					num++;
				}
				cur.update(item);
				cur.continue();
			}
			else{
				document.location.hash='dapp:hashtags?pinned';
				render_right_addon();
			}
		}
	}
	if($(target).hasClass('theme-action')){
		$('body').removeClass('light');
		$('body').removeClass('night');
		$('body').removeClass('dark');
		theme=$(target).attr('rel');
		$('body').addClass(theme);
		localStorage.setItem(storage_prefix+'theme',theme)
	}
	if($(target).hasClass('toggle-menu') || $(target).hasClass('toggle-menu-icon')){
		if(is_mobile()){
			clearTimeout(mobile_hide_menu_timer);
			$('div.menu').removeClass('hidden');
			$('div.menu').removeClass('short');
			if($('div.menu').hasClass('show')){
				$('body').removeClass('noscroll');
				$('div.menu').removeClass('show');
				ignore_resize=false;
			}
			else{
				$('div.menu').addClass('show');
				$('body').addClass('noscroll');
				ignore_resize=true;
			}
		}
		else{
			if(is_full()){
				if($('div.menu').hasClass('short')){
					$('div.menu').removeClass('short');
					menu_status='full';
					localStorage.setItem(storage_prefix+'menu_status',menu_status);
				}
				else{
					$('div.menu').addClass('short');
					menu_status='short';
					localStorage.setItem(storage_prefix+'menu_status',menu_status);
				}
			}
			else{
				$('div.menu').removeClass('hidden');
				$('div.menu').addClass('short');
				menu_status='short';
				localStorage.setItem(storage_prefix+'menu_status',menu_status);
			}
			if('full'==menu_status){
				$('.toggle-menu-icon').html(ltmp_arr.icon_menu_collapse);
			}
			else{
				$('.toggle-menu-icon').html(ltmp_arr.icon_menu_expand);
			}
		}
	}
	if($(target).hasClass('ipfs-upload-article-thumbnail-action')){
		let view=$(target).closest('.view');
		ipfs_upload_percent=0;
		ipfs_upload(/image.*/,function(result){
			if(typeof result == 'boolean'){
				if(!result){
					add_notify(false,
						ltmp_arr.notify_arr.error,
						ltmp_arr.notify_arr.upload_incorrect_format
					);
					ipfs_upload_percent=0;
				}
			}
			else
			if(typeof result == 'string'){
				view.find('.article-settings input[name="thumbnail"]').val('ipfs://'+result);
				editor_save_draft();
				ipfs_upload_percent=0;
			}
			else{
				if(typeof result == 'object'){
					if(typeof result.loaded !== 'undefined'){
						let percent = parseInt(result.loaded / result.total * 100);
						if(percent>(ipfs_upload_percent+10)){
							clearTimeout(ipfs_upload_percent_timer);
							ipfs_upload_percent_timer=setTimeout(function(){
								add_notify(false,
									ltmp_arr.notify_arr.upload,
									ltmp(ltmp_arr.notify_arr.upload_percent,{percent:percent})
								);
							},1000);
							ipfs_upload_percent=percent;
						}
					}
				}
			}
			console.log(typeof result,result);
		});
	}
	if($(target).hasClass('sia-upload-article-thumbnail-action')){
		let view=$(target).closest('.view');
		sia_upload_percent=0;
		sia_upload(/image.*/,function(result){
			if(typeof result == 'boolean'){
				if(!result){
					add_notify(false,
						ltmp_arr.notify_arr.error,
						ltmp_arr.notify_arr.upload_incorrect_format
					);
					sia_upload_percent=0;
				}
			}
			else
			if(typeof result == 'string'){
				view.find('.article-settings input[name="thumbnail"]').val('sia://'+result);
				editor_save_draft();
				sia_upload_percent=0;
			}
			else{
				if(typeof result == 'object'){
					if(typeof result.loaded !== 'undefined'){
						let percent = parseInt(result.loaded / result.total * 100);
						if(percent>(sia_upload_percent+10)){
							clearTimeout(sia_upload_percent_timer);
							sia_upload_percent_timer=setTimeout(function(){
								add_notify(false,
									ltmp_arr.notify_arr.upload,
									ltmp(ltmp_arr.notify_arr.upload_percent,{percent:percent})
								);
							},1000);
							sia_upload_percent=percent;
						}
					}
				}
			}
		});
	}
	if($(target).hasClass('sia-upload-profile-avatar-action')){
		let view=$(target).closest('.view');
		sia_upload_percent=0;
		sia_upload(/image.*/,function(result){
			if(typeof result == 'boolean'){
				if(!result){
					add_notify(false,
						ltmp_arr.notify_arr.error,
						ltmp_arr.notify_arr.upload_incorrect_format
					);
					sia_upload_percent=0;
				}
			}
			else
			if(typeof result == 'string'){
				view.find('input[name="avatar"]').val('sia://'+result);
				sia_upload_percent=0;
			}
			else{
				if(typeof result == 'object'){
					if(typeof result.loaded !== 'undefined'){
						let percent = parseInt(result.loaded / result.total * 100);
						if(percent>(sia_upload_percent+10)){
							clearTimeout(sia_upload_percent_timer);
							sia_upload_percent_timer=setTimeout(function(){
								add_notify(false,
									ltmp_arr.notify_arr.upload,
									ltmp(ltmp_arr.notify_arr.upload_percent,{percent:percent})
								);
							},1000);
							sia_upload_percent=percent;
						}
					}
				}
			}
		});
	}
	if($(target).hasClass('publish-attach-sia-action')){
		if(!$(target).hasClass('disabled')){
			let view=$(target).closest('.view');
			let publish_form=$(target).parent().parent();
			let text_el=false;
			sia_upload_percent=0;
			sia_upload(/.*/,function(result){
				if(typeof result == 'boolean'){
					if(result){
						$(target).addClass('disabled');
					}
					else{
						add_notify(false,
							ltmp_arr.notify_arr.error,
							ltmp_arr.notify_arr.upload_incorrect_format
						);
						sia_upload_percent=0;
					}
				}
				else
				if(typeof result == 'string'){
					if(publish_form.hasClass('text-addon')){
						text_el=publish_form.find('textarea');
					}
					/*
					if(publish_form.hasClass('comment-addon')){
						text_el=publish_form.find('input[name=comment]');
					}
					*/
					if(false!==text_el){
						let text=text_el.val();
						text=text.trim();
						text+="\n"+'sia://'+result;
						text=text.trim();
						text_el.val(text);
					}
					$(target).removeClass('disabled');
					sia_upload_percent=0;
				}
				else{
					if(typeof result == 'object'){
						if(typeof result.loaded !== 'undefined'){
							let percent = parseInt(result.loaded / result.total * 100);
							if(percent>(sia_upload_percent+10)){
								clearTimeout(sia_upload_percent_timer);
								sia_upload_percent_timer=setTimeout(function(){
									add_notify(false,
										ltmp_arr.notify_arr.upload,
										ltmp(ltmp_arr.notify_arr.upload_percent,{percent:percent})
									);
								},1000);
								sia_upload_percent=percent;
							}
						}
					}
				}
			});
		}
	}
	if($(target).hasClass('fast-publish-attach-action')){
		if(!$(target).hasClass('disabled')){
			let publish_form=$(target).closest('.fast-publish-wrapper');
			sia_upload_percent=0;
			sia_upload(/.*/,function(result){
				if(typeof result == 'boolean'){
					if(result){
						$(target).addClass('disabled');
					}
					else{
						add_notify(false,
							ltmp_arr.notify_arr.error,
							ltmp_arr.notify_arr.upload_incorrect_format
						);
						sia_upload_percent=0;
						$(target).removeClass('disabled');
					}
				}
				else
				if(typeof result == 'string'){
					let text=publish_form.find('textarea[name="text"]').val();
					text=text.trim();
					text+="\n"+'sia://'+result;
					text=text.trim();
					publish_form.find('textarea[name="text"]').val(text);
					$(target).removeClass('disabled');
					sia_upload_percent=0;
				}
				else{
					if(typeof result == 'object'){
						if(typeof result.loaded !== 'undefined'){
							let percent = parseInt(result.loaded / result.total * 100);
							if(percent>(sia_upload_percent+10)){
								clearTimeout(sia_upload_percent_timer);
								sia_upload_percent_timer=setTimeout(function(){
									add_notify(false,
										ltmp_arr.notify_arr.upload,
										ltmp(ltmp_arr.notify_arr.upload_percent,{percent:percent})
									);
								},1000);
								sia_upload_percent=percent;
							}
						}
					}
				}
			});
		}
	}
	if($(target).hasClass('ipfs-upload-profile-avatar-action')){
		let view=$(target).closest('.view');
		ipfs_upload_percent=0;
		ipfs_upload(/image.*/,function(result){
			if(typeof result == 'boolean'){
				if(!result){
					add_notify(false,
						ltmp_arr.notify_arr.error,
						ltmp_arr.notify_arr.upload_incorrect_format
					);
					ipfs_upload_percent=0;
				}
			}
			else
			if(typeof result == 'string'){
				view.find('input[name="avatar"]').val('ipfs://'+result);
				ipfs_upload_percent=0;
			}
			else{
				if(typeof result == 'object'){
					if(typeof result.loaded !== 'undefined'){
						let percent = parseInt(result.loaded / result.total * 100);
						if(percent>(ipfs_upload_percent+10)){
							clearTimeout(ipfs_upload_percent_timer);
							ipfs_upload_percent_timer=setTimeout(function(){
								add_notify(false,
									ltmp_arr.notify_arr.upload,
									ltmp(ltmp_arr.notify_arr.upload_percent,{percent:percent})
								);
							},1000);
							ipfs_upload_percent=percent;
						}
					}
				}
			}
			console.log(typeof result,result);
		});
	}
	if($(target).hasClass('preset-action')){
		$('input[name="'+$(target).data('input')+'"]').val($(target).data('value'));
	}
	if($(target).hasClass('mark-readed-notifications-action')){
		mark_readed_notifications();
	}
	if($(target).hasClass('clear-readed-notifications-action')){
		clear_readed_notifications();
	}
	if($(target).hasClass('clear-awards-action')){
		clear_awards();
	}
	if($(target).hasClass('clear-hashtags-action')){
		let view=$(target).closest('.view');
		clear_hashtags(view);
	}
	if($(target).hasClass('pin-hashtags-action')){
		let view=$(target).closest('.view');
		pin_hashtags(view);
	}
	if($(target).hasClass('ignore-hashtags-action')){
		let view=$(target).closest('.view');
		ignore_hashtags(view);
	}
	if($(target).hasClass('subscribe-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			subscribe(target);
		}
	}
	if($(target).hasClass('publish-add-interest-action')){
		let hashtag_str=fast_str_replace(' ','_',$(target).html());
		let hashtag_lower_str=hashtag_str.toLowerCase();
		let publish_form=$(target).closest('.add-interests').parent();
		let text_el=false;
		let editor=false;

		if(publish_form.hasClass('article-settings')){
			text_el=false;
			editor=$(target).closest('.view').find('.content-view[data-type="article"]').find('.editor-text');;
		}
		if(publish_form.hasClass('text-addon')){
			text_el=publish_form.find('textarea');
		}
		if(publish_form.hasClass('comment-addon')){
			text_el=publish_form.find('input[name=comment]');
		}
		if(false!==text_el){
			let search_text=text_el.val();
			if(-1==search_text.toLowerCase().indexOf(hashtag_lower_str)){
				text_el.val((search_text.trim()+' '+hashtag_str).trim());
			}
		}
		if(false!==editor){
			if(!$(target).hasClass('selected')){
				$(target).addClass('selected');
				let search_text=editor.html();
				if(-1==search_text.toLowerCase().indexOf(hashtag_lower_str)){
					let p_count=editor.find('p').length;
					$(editor.find('p')[p_count-1]).append(' <a>'+hashtag_str+'</a>');
					editor_change();
				}
			}
		}
	}
	if($(target).hasClass('profile-select-interest-action')){
		if(!$(target).hasClass('selected')){
			$(target).addClass('selected');
			profile_filter_by_type();
		}
		else{
			$(target).removeClass('selected');
			profile_filter_by_type();
		}
	}
	if($(target).hasClass('unsubscribe-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			unsubscribe(target);
		}
	}
	if($(target).hasClass('ignore-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			ignore(target);
		}
	}
	if($(target).hasClass('unignore-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			unignore(target);
		}
	}
	if($(target).hasClass('load-new-objects-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			load_new_objects($(target));
		}
	}
	if($(target).hasClass('load-nested-replies-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			load_nested_replies(target);
		}
	}
	if($(target).hasClass('sync-export-file-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			sync_export(false,target);
		}
	}
	if($(target).hasClass('sync-export-cloud-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			sync_export(true,target);
		}
	}
	if($(target).hasClass('sync-import-cloud-action')){
		if(!$(target).hasClass('disabled')){
			let view=$(target).closest('.view');
			let tab=view.find('.content-view[data-tab="sync"]');
			$(target).addClass('disabled');
			tab.find('.submit-button-ring[rel="import-cloud"]').addClass('show');
			tab.find('.sync-import-error').html('');
			tab.find('.sync-import-success').html('');
			localStorage.removeItem(storage_prefix+'sync_cloud_activity');
			localStorage.removeItem(storage_prefix+'sync_cloud_update');
			sync_cloud_activity=0;
			sync_cloud_update=0;
			check_sync_cloud_activity(function(status){
				if(status){
					tab.find('.sync-import-success').html(ltmp_arr.settings_sync_import_cloud_started);
				}
				else{
					tab.find('.sync-import-error').html(ltmp_arr.settings_sync_import_cloud_error);
				}
				tab.find('.submit-button-ring[rel="import-cloud"]').removeClass('show');
			});
		}
	}
	if($(target).hasClass('sync-import-file-action')){
		if(!$(target).hasClass('disabled')){
			let view=$(target).closest('.view');
			let tab=view.find('.content-view[data-tab="sync"]');
			select_file(function(data){
				$(target).addClass('disabled');
				tab.find('.submit-button-ring[rel="import-file"]').addClass('show');
				tab.find('.sync-import-error').html('');
				tab.find('.sync-import-success').html('');
				if(false===data){
					tab.find('.submit-button-ring[rel="import-file"]').removeClass('show');
					tab.find('.sync-import-error').html(ltmp_arr.settings_sync_select_file_error);
					$(target).removeClass('disabled');
				}
				import_backup(data,function(result){
					if(false===result){
						tab.find('.submit-button-ring[rel="import-file"]').removeClass('show');
						tab.find('.sync-import-error').html(ltmp_arr.settings_sync_import_backup_error);
						$(target).removeClass('disabled');
					}
					else{
						if(true===result){
							tab.find('.submit-button-ring[rel="import-file"]').removeClass('show');
							$(target).removeClass('disabled');

							render_session();
							render_menu();
							apply_theme_mode();

							tab.find('.sync-import-success').html(tab.find('.sync-import-success').html()+'<br>'+ltmp_arr.settings_sync_import_finished);
							if(typeof users[current_user] !== 'undefined'){
								if(typeof users[current_user].regular_key !== 'undefined'){
								}
								else{
									tab.find('.sync-import-error').html(ltmp_arr.account_settings_empty_regular_key);
									tab.find('.sync-import-error').attr('data-href','dapp:account_settings');
									add_notify(false,
										ltmp_arr.notify_arr.error,
										ltmp_arr.account_settings_empty_regular_key,
										'dapp:account_settings'
									);
								}
							}
							else{
								tab.find('.sync-import-error').html(ltmp_arr.account_settings_empty_regular_key);
								tab.find('.sync-import-error').attr('data-href','dapp:account_settings');
								add_notify(false,
									ltmp_arr.notify_arr.error,
									ltmp_arr.account_settings_empty_regular_key,
									'dapp:account_settings'
								);
							}

							mute_notifications=60;//turn off notifications for next update feed
							localStorage.setItem(storage_prefix+'mute_notifications',mute_notifications);//set mute notifications for 1 minute to next reload
							setTimeout(function(){
								localStorage.removeItem(storage_prefix+'mute_notifications');
								mute_notifications=false;
							},mute_notifications*1000);

							update_feed();
						}
						else{
							let new_import=false;
							if(''==tab.find('.sync-import-success').html()){
								new_import=true;
							}
							tab.find('.sync-import-success').html((new_import?'':(tab.find('.sync-import-success').html()+'<br>'))+result);
						}
					}
				});
			});
		}
	}
	if($(target).hasClass('save-feed-settings-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			let view=$(target).closest('.view');
			let tab=view.find('.content-view[data-tab="feed"]');
			tab.find('.submit-button-ring').addClass('show');
			tab.find('.error').html('');
			tab.find('.success').html('');
			save_feed_settings(view);
		}
	}
	if($(target).hasClass('save-theme-settings-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			let view=$(target).closest('.view');
			let tab=view.find('.content-view[data-tab="theme"]');
			tab.find('.submit-button-ring').addClass('show');
			tab.find('.error').html('');
			tab.find('.success').html('');
			save_theme_settings(view);
		}
	}
	if($(target).hasClass('save-settings-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			let view=$(target).closest('.view');
			let tab=view.find('.content-view[data-tab="main"]');
			tab.find('.submit-button-ring').addClass('show');
			tab.find('.error').html('');
			tab.find('.success').html('');
			save_settings(view);
		}
	}
	if($(target).hasClass('reset-database-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			let view=$(target).closest('.view');
			let tab=view.find('.content-view[data-tab="main"]');
			tab.find('.submit-button-ring').addClass('show');
			tab.find('.error').html('');
			tab.find('.success').html('');
			full_reset_db();
		}
	}
	if($(target).hasClass('reset-settings-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			let view=$(target).closest('.view');
			let tab=view.find('.content-view[data-tab="main"]');
			tab.find('.submit-button-ring').addClass('show');
			tab.find('.error').html('');
			tab.find('.success').html('');
			reset_settings(view);
		}
	}
	if($(target).hasClass('save-users-settings-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			let view=$(target).closest('.view');
			view.find('.submit-button-ring').addClass('show');
			view.find('.error').html('');
			view.find('.success').html('');
			users_save_settings(view);
		}
	}
	if($(target).hasClass('reset-users-settings-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			let view=$(target).closest('.view');
			view.find('.submit-button-ring').addClass('show');
			view.find('.error').html('');
			view.find('.success').html('');
			users_reset_settings(view);
		}
	}
	if($(target).hasClass('search-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');

			let view=$(target).closest('.view');
			view.find('.submit-button-ring').addClass('show');
			view.find('.error').html('');
			view.find('.success').html('');

			let search=view.find('input[name="search"]').val();
			search=search.trim();
			if(''==search){
				view.find('.error').html(ltmp_arr.search_empty_input);
				$(target).removeClass('disabled');
				view.find('.submit-button-ring').removeClass('show');
				return;
			}

			if(-1!=search.indexOf('viz://')){
				view_path(search,{},true,false);
			}
			else{
				if('@'==search.substring(0,1)){
					search=search.substring(1);
				}
				view_path('viz://@'+search+'/',{},true,false);
			}
		}
	}
	if($(target).hasClass('reply-action')){
		let object=$(target).closest('.object');
		let link=object.data('link');
		let check_share=object.find('.share-action');
		if(check_share.hasClass('success')){
			$('.fast-publish-wrapper[data-share="'+link+'"]').remove();
			check_share.removeClass('success');
		}
		if($(target).hasClass('success')){
			$('.fast-publish-wrapper[data-reply="'+link+'"]').remove();
			$(target).removeClass('success');
		}
		else{
			$(target).addClass('success');
			object.after(ltmp(ltmp_arr.fast_publish,{
				avatar:safe_avatar(user_profile.avatar),
				attach:ltmp_arr.icon_attach,
				reply:link,
				placeholder:ltmp_arr.fast_publish_reply,
				button:ltmp_arr.fast_publish_button,
			}));
			$('.fast-publish-wrapper[data-reply="'+link+'"] textarea')[0].focus();
		}
		//view_path('dapp:publish/reply/?'+link,{},true,false);
	}
	if($(target).hasClass('share-action')){
		let object=$(target).closest('.object');
		let link=object.data('link');
		let check_reply=object.find('.reply-action');
		if(check_reply.hasClass('success')){
			$('.fast-publish-wrapper[data-reply="'+link+'"]').remove();
			check_reply.removeClass('success');
		}
		if($(target).hasClass('success')){
			$('.fast-publish-wrapper[data-share="'+link+'"]').remove();
			$(target).removeClass('success');
		}
		else{
			$(target).addClass('success');
			object.after(ltmp(ltmp_arr.fast_publish,{
				avatar:safe_avatar(user_profile.avatar),
				attach:ltmp_arr.icon_attach,
				share:link,
				placeholder:ltmp_arr.fast_publish_share,
				button:ltmp_arr.fast_publish_button,
			}));
			$('.fast-publish-wrapper[data-share="'+link+'"] textarea')[0].focus();
		}
		//view_path('dapp:publish/share/?'+link,{},true,false);
	}
	if($(target).hasClass('award-action')){
		let link=$(target).closest('.object').data('link');
		if(0==link.indexOf('viz://')){
			let account='';
			let block=0;
			link=link.toLowerCase();
			link=escape_html(link);
			let pattern = /@[a-z0-9\-\.]*/g;
			let link_account=link.match(pattern);
			if(typeof link_account[0] != 'undefined'){
				account=link_account[0].substr(1);
				let pattern_block = /\/([0-9]*)\//g;
				let link_block=link.match(pattern_block);
				if(typeof link_block[1] != 'undefined'){
					block=parseInt(fast_str_replace('/','',link_block[1]));
					award(account,block,function(result){
						if(result){
							setTimeout(function(){check_object_award(account,block)},100);
						}
					});
				}
			}
		}
	}
	if($(target).hasClass('copy-link-action')){
		let text=$(target).closest('.object').data('link');
		$('.text-copy').val(text);
		$('.text-copy')[0].select();
		$('.text-copy')[0].setSelectionRange(0,99999);
		document.execCommand("copy");
		$(target).addClass('success');
		setTimeout(function(){
			$(target).removeClass('success');
		},3000);
	}
	if($(target).hasClass('fast-publish-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			let publish_form=$(target).closest('.fast-publish-wrapper');
			fast_publish(publish_form);
		}
	}
	if($(target).hasClass('article-publish-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			let editor=$('.article-editor .editor-text')[0];
			let title=markdown_encode($('.article-editor .editor-text h1')[0],0);
			let markdown=markdown_encode(editor,0);
			let first_image='';
			if(typeof $('.article-editor .editor-text img')[0] !== 'undefined'){
				first_image=$('.article-editor .editor-text img')[0].getAttribute('src');
			}
			let first_paragraph='';
			if(typeof $('.article-editor .editor-text p')[0] !== 'undefined'){
				first_paragraph=$('.article-editor .editor-text p')[0].textContent;
			}
			let article_obj={
				t:title,
				m:markdown,
				d:$('.article-settings input[name="description"]').val(),
				i:$('.article-settings input[name="thumbnail"]').val(),//image
			};
			if(''==article_obj.i){
				if(''!==first_image){
					article_obj.i=first_image;
				}
				else{
					delete article_obj.i;
				}
			}
			if(''==article_obj.d){
				if(''!==first_paragraph){
					article_obj.d=first_paragraph;
				}
				else{
					delete article_obj.d;
				}
			}
			let error=false;
			if(''==article_obj.m.trim()){
				error=ltmp_arr.editor_error_empty_markdown;
			}
			if(''==article_obj.t.trim()){
				error=ltmp_arr.editor_error_empty_title;
			}
			if(false===error){
				viz.api.getAccount(current_user,app_protocol,function(err,response){
					if(err){
						console.log(err);
						add_notify(false,'',ltmp_arr.gateway_error);
						$(target).removeClass('disabled');
						return;
					}
					else{
						let previous=response.custom_sequence_block_num;
						let new_object={};
						if(previous>0){
							new_object.p=previous;
						}
						if(app_version>1){
							new_object.v=app_version;
						}
						new_object.t='p';//publication
						//new_object.u=new Date().getTime() /1000 | 0;//for delayed publication

						new_object.d=article_obj;
						let object_json=JSON.stringify(new_object);

						viz.broadcast.custom(users[current_user].regular_key,[],[current_user],app_protocol,object_json,function(err,result){
							if(result){
								console.log(result);
								setTimeout(function(){
									wait_publish(previous,function(object_block){
										view_path('viz://@'+current_user+'/'+object_block+'/',{},true,false);
										$(target).removeClass('disabled');
										$('.article-editor .editor-text').html('');
										$('.article-settings input[name="description"]').val('');
										$('.article-settings input[name="thumbnail"]').val('');
										editor_save_draft();
									});
								},3000);
							}
							else{
								console.log(err);
								add_notify(false,'',ltmp_arr.gateway_error);
								$(target).removeClass('disabled');
								return;
							}
						});
					}
				});
			}
			else{
				add_notify(false,
					ltmp_arr.notify_arr.error,
					error
				);
				$(target).removeClass('disabled');
			}
		}
	}
	if($(target).hasClass('publish-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');

			let view=$(target).closest('.view');
			view.find('.submit-button-ring').addClass('show');
			view.find('.error').html('');
			view.find('.success').html('');

			publish(view);
		}
	}
	if($(target).hasClass('save-profile-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');

			let view=$(target).closest('.view');
			view.find('.submit-button-ring').addClass('show');
			view.find('.error').html('');
			view.find('.success').html('');

			save_profile(view);
		}
	}
	if($(target).hasClass('remove-account-action')){
		if(!$(target).hasClass('disabled')){
			let view=$(target).closest('.view');
			remove_session(view);
		}
	}
	if($(target).hasClass('save-account-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');

			let view=$(target).closest('.view');
			view.find('.submit-button-ring').addClass('show');
			view.find('.error').html('');
			view.find('.success').html('');

			let viz_account=view.find('input[name="viz_account"]').val();
			let viz_regular_key=view.find('input[name="viz_regular_key"]').val();
			save_account_settings(view,viz_account,viz_regular_key);
		}
	}
	if($(target).hasClass('back-action')){
		let force_path=false;
		if(''!=$(target).data('force')){
			force_path=$(target).data('force');
		}
		$('.loader').css('display','block');
		$('.view').css('display','none');
		let need_update=false;//if current view can change previous view

		if(0<$('.view[data-level="'+level+'"]').length){//if not service view
			$('.view[data-level="'+level+'"]').remove();
		}
		else{//if service view check forced update
			let path_parts=path.split('/');
			if(0!=$('.view[data-path="'+path_parts[0]+'"]').length){
				need_update=(true==$('.view[data-path="'+path_parts[0]+'"]').data('update'));
			}
		}
		//console.log('—— back action —— ','level: '+level,'need_update: '+need_update);

		level--;
		path='viz://';
		query='';

		if(false!==force_path){
			path=force_path;
		}
		else{
			//search prev level props
			if(0<$('.view[data-level="'+level+'"]').length){
				if(typeof $('.view[data-level="'+level+'"]').data('path') != 'undefined'){
					path=$('.view[data-level="'+level+'"]').data('path');
				}
				if(typeof $('.view[data-level="'+level+'"]').data('query') != 'undefined'){
					query+=$('.view[data-level="'+level+'"]').data('query');
				}
			}
		}
		//console.log('—— back action —— ','path: '+path);
		//trigger view_path with update prop
		view_path(path+(''==query?'':'?'+query),{},true,need_update);
	}
	/*
	//button to scroll top, need to show it for long views on scrolling more that 100hv?
	if($(target).hasClass('go-top')){
		$(window)[0].scrollTo({behavior:'smooth',top:0});
	}
	*/
}

function sync_export(cloud,target){
	cloud=(typeof cloud !== 'undefined')?cloud:false;
	let view=$(target).closest('.view');
	let tab=view.find('.content-view[data-tab="sync"]');
	tab.find('.submit-button-ring[rel="export-file"]').addClass('show');
	tab.find('.error').html('');
	tab.find('.success').html('');

	let export_awards=function(json,callback){
		if(settings.sync_awards){
			json.awards=[];
			let t=db.transaction(['awards'],'readonly');
			let q=t.objectStore('awards');
			let req=q.openCursor(null,'prev');
			let limit=settings.sync_size;
			if(0==settings.sync_size){
				limit=1;
			}
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					if(limit>0){
						let item=cur.value;
						delete item.id;
						json.awards.push(item);
						if(0!=settings.sync_size){
							limit--;
						}
					}
					cur.continue();
				}
				else{
					callback(json,callback);
				}
			};
		}
		else{
			callback(json,callback);
		}
	}
	let export_hashtags_feed=function(json,callback){
		if(settings.sync_hashtags){
			json.hashtags_feed=[];
			let t=db.transaction(['hashtags_feed'],'readonly');
			let q=t.objectStore('hashtags_feed');
			let req=q.openCursor(null,'prev');
			let limit=settings.sync_size;
			if(0==settings.sync_size){
				limit=1;
			}
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					if(limit>0){
						let item=cur.value;
						delete item.id;
						json.hashtags_feed.push(item);
						if(0!=settings.sync_size){
							limit--;
						}
					}
					cur.continue();
				}
				else{
					export_awards(json,callback);
				}
			};
		}
		else{
			export_awards(json,callback);
		}
	}
	let export_hashtags=function(json,callback){
		if(settings.sync_hashtags){
			json.hashtags=[];
			let t=db.transaction(['hashtags'],'readonly');
			let q=t.objectStore('hashtags');
			let req=q.index('status').openCursor(null,'prev');
			let limit=settings.sync_size;
			if(0==settings.sync_size){
				limit=1;
			}
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					if(limit>0){
						let item=cur.value;
						item.count=0;
						json.hashtags.push(item);
						if(0!=settings.sync_size){
							limit--;
						}
					}
					cur.continue();
				}
				else{
					export_hashtags_feed(json,callback);
				}
			};
		}
		else{
			export_hashtags_feed(json,callback);
		}
	}
	let export_replies=function(json,callback){
		if(settings.sync_replies){
			json.replies=[];
			let t=db.transaction(['replies'],'readonly');
			let q=t.objectStore('replies');
			let req=q.index('time').openCursor(null,'prev');
			let limit=settings.sync_size;
			if(0==settings.sync_size){
				limit=1;
			}
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					if(limit>0){
						let item=cur.value;
						delete item.id;
						json.replies.push(item);
						if(0!=settings.sync_size){
							limit--;
						}
					}
					cur.continue();
				}
				else{
					export_hashtags(json,callback);
				}
			};
		}
		else{
			export_hashtags(json,callback);
		}
	}
	let export_feed=function(json,callback){
		if(settings.sync_feed){
			json.feed=[];
			let t=db.transaction(['feed'],'readonly');
			let q=t.objectStore('feed');
			let req=q.index('time').openCursor(null,'prev');
			let limit=settings.sync_size;
			if(0==settings.sync_size){
				limit=1;
			}
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					if(limit>0){
						let item=cur.value;
						delete item.id;
						json.feed.push(item);
						if(0!=settings.sync_size){
							limit--;
						}
					}
					cur.continue();
				}
				else{
					export_replies(json,callback);
				}
			};
		}
		else{
			export_replies(json,callback);
		}
	}
	let export_users=function(json,callback){
		if(settings.sync_users){
			json.users=[];
			let t=db.transaction(['users'],'readonly');
			let q=t.objectStore('users');
			let req=q.openCursor(null,'next');
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					let item=cur.value;
					delete item.id;
					json.users.push(item)
					cur.continue();
				}
				else{
					export_feed(json,callback);
				}
			};
		}
		else{
			export_feed(json,callback);
		}
	}

	var export_json={};
	export_json.time=new Date().getTime() /1000 | 0;
	export_json.user=current_user;
	if(settings.sync_settings){
		export_json.settings=settings;
	}
	export_users(export_json,function(result_json){
		//console.log(result_json);
		if(!cloud){
			tab.find('.sync-export-success').html(ltmp_arr.settings_sync_export_file_success);
			download('dapp_export_'+fast_str_replace('.','_',show_date())+'.json',JSON.stringify(result_json),'application/json');
		}
		else{
			sync_cloud_put_update('backup',JSON.stringify(result_json),function(result){
				if(result){
					tab.find('.sync-export-success').html(ltmp_arr.settings_sync_export_cloud_success);
				}
				else{
					tab.find('.sync-export-error').html(ltmp_arr.settings_sync_export_cloud_error);
				}
			});
		}
		$(target).removeClass('disabled');
		tab.find('.submit-button-ring').removeClass('show');
	});
}

function download(filename,data,mime){
	mime=(typeof mime !== 'undefined')?mime:'text/plain';
	var link=document.createElement('a');
	link.setAttribute('href','data:'+mime+';charset=utf-8,'+encodeURIComponent(data));
	link.setAttribute('download',filename);
	if(document.createEvent){
		var event=document.createEvent('MouseEvents');
		event.initEvent('click',true,true);
		link.dispatchEvent(event);
	}
	else {
		link.click();
	}
}

var import_steps=0;
function import_backup_final_step(backup,callback){
	if(0==import_steps){
		if(typeof backup.users !== 'undefined'){
			let t_clear=db.transaction(['users'],'readwrite');
			let q_clear=t_clear.objectStore('users');
			q_result=q_clear.clear();
			q_result.onsuccess=function(e){
				let t_add=db.transaction(['users'],'readwrite');
				let q_add=t_add.objectStore('users');
				for(let i in backup.users){
					let item=backup.users[i];
					q_add.add(item);
				}
				if(!is_safari){
					if(!is_firefox){
						t_add.commit();
					}
				}
				t_add.oncomplete=function(e){
					callback(ltmp_arr.settings_sync_import_users_success);
					setTimeout(function(){
						callback(true);
					},1000);
				}
			}
		}
		else{
			setTimeout(function(){callback(true);},1000);
		}
	}
}
var import_finish=0;
function import_backup(data,callback){
	let backup=false;
	try{
		backup=JSON.parse(data);
	}
	catch(e){
		callback(false);
		return;
	}
	if(typeof backup.user !== 'undefined'){
		if(''!=current_user){
			if(current_user!=backup.user){
				callback(ltmp(ltmp_arr.settings_sync_import_another_user,{account:backup.user}));
				users={};
				localStorage.removeItem(storage_prefix+'users');
			}
		}
		current_user=backup.user;
		localStorage.setItem(storage_prefix+'current_user',current_user);
		if(typeof backup.time !== 'undefined'){
			sync_cloud_activity=backup.time;
			localStorage.setItem(storage_prefix+'sync_cloud_activity',sync_cloud_activity);
		}
	}
	if(typeof backup.settings !== 'undefined'){
		settings=backup.settings;
		let settings_json=JSON.stringify(settings);
		localStorage.setItem(storage_prefix+'settings',settings_json);
		callback(ltmp_arr.settings_sync_import_settings_success);
	}
	clearTimeout(import_finish);
	import_finish=setTimeout(function(){import_backup_final_step(backup,callback);},10000);
	let import_delay=1000;
	let import_delay_offset=1000;
	if(typeof backup.feed !== 'undefined'){
		import_steps++;
		let t_clear=db.transaction(['feed'],'readwrite');
		let q_clear=t_clear.objectStore('feed');
		q_result=q_clear.clear();
		q_result.onsuccess=function(e){
			let t_add=db.transaction(['feed'],'readwrite');
			let q_add=t_add.objectStore('feed');
			for(let i in backup.feed){
				let item=backup.feed[i];
				q_add.add(item);
			}
			if(!is_safari){
				if(!is_firefox){
					t_add.commit();
				}
			}
			t_add.oncomplete=function(e){
				setTimeout(function(){
					import_steps--;
					callback(ltmp_arr.settings_sync_import_feed_success);
					clearTimeout(import_finish);
					import_finish=setTimeout(function(){import_backup_final_step(backup,callback);},1000);
				},import_delay);
				import_delay+=import_delay_offset;
			}
		}
	}
	if(typeof backup.replies !== 'undefined'){
		import_steps++;
		let t_clear=db.transaction(['replies'],'readwrite');
		let q_clear=t_clear.objectStore('replies');
		q_result=q_clear.clear();
		q_result.onsuccess=function(e){
			let t_add=db.transaction(['replies'],'readwrite');
			let q_add=t_add.objectStore('replies');
			for(let i in backup.replies){
				let item=backup.replies[i];
				q_add.add(item);
			}
			if(!is_safari){
				if(!is_firefox){
					t_add.commit();
				}
			}
			t_add.oncomplete=function(e){
				setTimeout(function(){
					import_steps--;
					callback(ltmp_arr.settings_sync_import_replies_success);
					clearTimeout(import_finish);
					import_finish=setTimeout(function(){import_backup_final_step(backup,callback);},1000);
				},import_delay);
				import_delay+=import_delay_offset;
			}
		}
	}
	if(typeof backup.hashtags !== 'undefined'){
		import_steps++;
		let t_clear=db.transaction(['hashtags'],'readwrite');
		let q_clear=t_clear.objectStore('hashtags');
		q_result=q_clear.clear();
		q_result.onsuccess=function(e){
			let t_add=db.transaction(['hashtags'],'readwrite');
			let q_add=t_add.objectStore('hashtags');
			for(let i in backup.hashtags){
				let item=backup.hashtags[i];
				q_add.add(item);
			}
			if(!is_safari){
				if(!is_firefox){
					t_add.commit();
				}
			}
			t_add.oncomplete=function(e){
				import_steps--;
				callback(ltmp_arr.settings_sync_import_hashtags_success);
				render_right_addon();
				if(typeof backup.hashtags_feed !== 'undefined'){
					import_steps++;
					let t_clear=db.transaction(['hashtags_feed'],'readwrite');
					let q_clear=t_clear.objectStore('hashtags_feed');
					q_result=q_clear.clear();
					q_result.onsuccess=function(e){
						let t_add=db.transaction(['hashtags_feed'],'readwrite');
						let q_add=t_add.objectStore('hashtags_feed');
						for(let i in backup.hashtags_feed){
							let item=backup.hashtags_feed[i];
							q_add.add(item);
						}
						if(!is_safari){
							if(!is_firefox){
								t_add.commit();
							}
						}
						t_add.oncomplete=function(e){
							setTimeout(function(){
								import_steps--;
								callback(ltmp_arr.settings_sync_import_hashtags_feed_success);
								clearTimeout(import_finish);
								import_finish=setTimeout(function(){import_backup_final_step(backup,callback);},1000);
							},import_delay);
							import_delay+=import_delay_offset;
						}
					}
				}
				else{
					clearTimeout(import_finish);
					import_finish=setTimeout(function(){import_backup_final_step(backup,callback);},1000);
				}
			}
		}
	}
	if(typeof backup.awards !== 'undefined'){
		import_steps++;
		let t_clear=db.transaction(['awards'],'readwrite');
		let q_clear=t_clear.objectStore('awards');
		q_result=q_clear.clear();
		q_result.onsuccess=function(e){
			let t_add=db.transaction(['awards'],'readwrite');
			let q_add=t_add.objectStore('awards');
			for(let i in backup.awards){
				let item=backup.awards[i];
				q_add.add(item);
			}
			if(!is_safari){
				if(!is_firefox){
					t_add.commit();
				}
			}
			t_add.oncomplete=function(e){
				setTimeout(function(){
					import_steps--;
					callback(ltmp_arr.settings_sync_import_awards_success);
					clearTimeout(import_finish);
					import_finish=setTimeout(function(){import_backup_final_step(backup,callback);},1000);
				},import_delay);
			}
		}
	}
}
function import_cloud(data){
	stop_timers();
	add_notify(false,
		ltmp_arr.notify_arr.attention,
		ltmp_arr.notify_arr.sync_import
	);
	setTimeout(function(){
		import_backup(data,function(result){
			if(false===result){
				add_notify(false,
					ltmp_arr.notify_arr.error,
					ltmp_arr.notify_arr.sync_import_error
				);
			}
			else{
				if(true===result){
					render_session();
					render_menu();
					apply_theme_mode();

					add_notify(false,
						ltmp_arr.notify_arr.sync,
						ltmp_arr.notify_arr.sync_import_success
					);

					if(typeof users[current_user] !== 'undefined'){
						if(typeof users[current_user].regular_key !== 'undefined'){
						}
						else{
							add_notify(false,
								ltmp_arr.notify_arr.error,
								ltmp_arr.account_settings_empty_regular_key,
								'dapp:account_settings'
							);
						}
					}
					else{
						add_notify(false,
							ltmp_arr.notify_arr.error,
							ltmp_arr.account_settings_empty_regular_key,
							'dapp:account_settings'
						);
					}

					mute_notifications=60;//turn off notifications for next update feed
					localStorage.setItem(storage_prefix+'mute_notifications',mute_notifications);//set mute notifications for 1 minute to next reload
					setTimeout(function(){
						localStorage.removeItem(storage_prefix+'mute_notifications');
						mute_notifications=false;
					},mute_notifications*1000);

					start_timers();
				}
				else{
					add_notify(false,
						ltmp_arr.notify_arr.sync,
						result
					);
				}
			}
		});
	},3000);
}

function select_file(callback){
	callback=(typeof callback !=='undefined')?callback:(data)=>{console.log(data)};
	var input=document.createElement('input');
	input.setAttribute('type','file');
	document.body.appendChild(input);
	$(input).on('change',function(event){
		var file=input.files[0];
		if(file){
			var reader=new FileReader();
			reader.readAsText(file,"UTF-8");
			reader.onload=function(event){
				callback(event.target.result);
				input.remove();
			}
			reader.onerror=function(event){
				callback(false);
				input.remove();
			}
		}
		else{
			callback(false);
			input.remove();
		}
	});
	if(document.createEvent){
		var event=document.createEvent('MouseEvents');
		event.initEvent('click',true,true);
		input.dispatchEvent(event);
	}
	else {
		input.click();
	}
	//setTimeout(function(){input.remove();},1000);
}

function update_user_profile(account,callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	viz.api.getAccount(account,app_protocol,function(err,response){
		if(err){
			console.log('viz api error:',err);
			callback(true,false);
		}
		else{
			let profile_obj={};
			let json_metadata={};
			let profile_contacts='';
			if(''!=response.json_metadata){
				json_metadata=JSON.parse(response.json_metadata);
			}
			if(typeof json_metadata.profile != 'undefined'){
				if(typeof json_metadata.profile.nickname != 'undefined'){
					profile_obj.nickname=escape_html(json_metadata.profile.nickname);
				}
				if(typeof json_metadata.profile.avatar != 'undefined'){
					profile_obj.avatar=escape_html(json_metadata.profile.avatar);
				}
				if(typeof json_metadata.profile.about != 'undefined'){
					profile_obj.about=escape_html(json_metadata.profile.about);
				}
				if(typeof json_metadata.profile.interests != 'undefined'){
					profile_obj.interests=json_metadata.profile.interests;
				}
				if(typeof json_metadata.profile.pinned != 'undefined'){
					profile_obj.pinned=json_metadata.profile.pinned;
				}
				if(typeof json_metadata.profile.services != 'undefined'){
					if(typeof json_metadata.profile.services.github != 'undefined'){
						profile_obj.github=escape_html(json_metadata.profile.services.github);
					}
					if(typeof json_metadata.profile.services.telegram != 'undefined'){
						profile_obj.telegram=escape_html(json_metadata.profile.services.telegram);
					}
				}
			}
			if(typeof profile_obj.nickname == 'undefined'){
				profile_obj.nickname=response.name;
			}
			if(typeof profile_obj.avatar == 'undefined'){
				profile_obj.avatar=ltmp_arr.profile_default_avatar;
			}

			if(current_user==account){
				user_profile=profile_obj;
			}

			let obj={
				account:account,
				start:response.custom_sequence_block_num,
				update:parseInt(new Date().getTime()/1000),
				profile:JSON.stringify(profile_obj),
				status:0,
			};

			if(current_user==account){
				obj.status=1;
			}
			if(-1!=whitelabel_accounts.indexOf(account)){
				obj.status=1;
			}

			let t=db.transaction(['users'],'readwrite');
			let q=t.objectStore('users');
			let req=q.index('account').openCursor(IDBKeyRange.only(account),'next');

			let result;
			let find=false;
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					result=cur.value;
					result.update=obj.update;
					result.profile=obj.profile;
					result.start=obj.start;
					find=true;
					update_req=cur.update(result);
					update_req.onsuccess=function(e){
						callback(false,result);
					}
					cur.continue();
				}
				else{
					if(!find){
						let add_t=db.transaction(['users'],'readwrite');
						let add_q=add_t.objectStore('users');
						add_q.add(obj);
						if(!is_safari){
							if(!is_firefox){
								add_t.commit();
							}
						}
						add_t.oncomplete=function(e){
							callback(false,obj);
						}
					}
				}
			};
		}
	});
}

function feed_load_final(result,account,callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	let count=0;
	console.log('feed_load_final',result);
	for(let i in result){
		let item=result[i];
		feed_add(account,item.block,item.time);
		count++;
	}
	setTimeout(function(){callback(false,{account:account,items:count})},100);
}

function feed_load_result(result,account,block,next_offset,end_offset,limit,callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	let end=false;
	if(0==limit){
		end=true;
	}
	if(end_offset>=next_offset){
		end=true;
	}
	if(end){
		feed_load_final(result,account,callback);
	}
	else{
		//recursive feed_load_more
		feed_load_more(result,account,next_offset,end_offset,limit,callback);
	}
}

function feed_load_more(result,account,next_offset,end_offset,limit,callback){
	get_object(account,next_offset,function(err,object_result){
		if(err){
			feed_load_final(result,account,callback);
		}
		else{
			if(typeof object_result.data.p !== 'undefined'){
				next_offset=object_result.data.p;
			}
			else{
				next_offset=0;
			}
			if(object_result.account!=current_user){
				let feed=false;
				let check_ignore=false;
				if(settings.feed_subscribe_text){
					if(!object_result.is_reply){
						if(!object_result.is_share){
							feed=true;
						}
					}
				}
				if(settings.feed_subscribe_shares){
					if(object_result.is_share){
						feed=true;
						if(object_result.parent_account==current_user){
							let link='viz://@'+object_result.account+'/'+object_result.block+'/';
							let share_text='';
							if(typeof object_result.data.d.text !== 'udnefined'){
								share_text=object_result.data.d.text;
							}
							add_notify(true,ltmp(ltmp_arr.notify_arr.new_share,{account:object_result.account}),share_text,link);
						}
						else{
							check_ignore=object_result.parent_account;
						}
					}
				}
				if(settings.feed_subscribe_replies){
					if(object_result.is_reply){
						feed=true;
						check_ignore=object_result.parent_account;
					}
				}
				else{
					if(object_result.is_reply){
						feed=false;
						if(object_result.parent_account==current_user){
							let link='viz://@'+object_result.account+'/'+object_result.block+'/';
							let reply_text=object_result.data.d.text;
							add_notify(true,ltmp(ltmp_arr.notify_arr.new_reply,{account:object_result.account}),reply_text,link);
							feed=true;
						}
					}
				}
				if(settings.feed_subscribe_mentions){
					let object_type='text';//by default
					if(typeof object_result.data.t !== 'undefined'){
						if(-1!=object_types_list.indexOf(object_result.data.t)){
							if(typeof object_types_arr[object_result.data.t] !== 'undefined'){
								object_type=object_types_arr[object_result.data.t];
							}
							else{
								object_type=object_result.data.t;
							}
						}
					}
					if('text'==object_type){
						if(typeof object_result.data.d.text !== 'undefined'){
							if(-1!=object_result.data.d.text.indexOf('@'+current_user)){//mention
								let link='viz://@'+object_result.account+'/'+object_result.block+'/';
								let reply_text=object_result.data.d.text;
								add_notify(true,ltmp(ltmp_arr.notify_arr.new_mention,{account:object_result.account}),reply_text,link);
								feed=true;
							}
						}
					}
					if('publication'==object_type){
						if(typeof object_result.data.d.m !== 'undefined'){
							if(-1!=object_result.data.d.m.indexOf('@'+current_user)){//mention
								let link='viz://@'+object_result.account+'/'+object_result.block+'/';
								let reply_text=object_result.data.d.t;//title
								add_notify(true,ltmp(ltmp_arr.notify_arr.new_mention,{account:object_result.account}),reply_text,link);
								feed=true;
							}
						}
					}
				}
				if(feed){
					if(!check_ignore){
						result.push({block:object_result.block,time:object_result.data.timestamp});
						feed_load_result(result,account,object_result.block,next_offset,end_offset,(limit-1),callback);
					}
					else{
						get_user(check_ignore,false,function(check_err,check_result){
							if(!check_err){
								if(2!=check_result.status){//not ignored
									result.push({block:object_result.block,time:object_result.data.timestamp});
								}
							}
							feed_load_result(result,account,object_result.block,next_offset,end_offset,(limit-1),callback);
						});
					}
				}
				else{
					feed_load_result(result,account,object_result.block,next_offset,end_offset,(limit-1),callback);
				}
			}
		}
	});
}

function feed_load(account,limit,upper_bound,continued,callback){
	console.log('feed_load',account);
	limit=((false===limit)?settings.activity_deep:limit);
	if(whitelabel_init){
		limit=whitelabel_deep;
	}
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	let result=[];

	let end_offset=0;
	let offset=0;
	let t=db.transaction(['objects'],'readonly');
	let q=t.objectStore('objects');
	//open_border excludes the endpoint (upper bound) if given (look previous for load unseen range)
	let open_border=(upper_bound===false?false:true);
	upper_bound=(upper_bound===false?Number.MAX_SAFE_INTEGER:upper_bound);
	if(open_border){
		end_offset=upper_bound;
	}
	let req=q.index('object').openCursor(IDBKeyRange.upperBound([account,upper_bound],open_border),'prev');
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			if(!continued){//set end offset or use only limit
				if(account==cur.value.account){
					end_offset=cur.value.block;
				}
			}
		}
		get_user(account,true,function(err,user_result){
			if(err){
				callback(err,0);
			}
			else{
				if(open_border){
					offset=upper_bound;//start from given upper bound
				}
				else{
					offset=user_result.start;//start from user last activity
				}
				if(offset>end_offset){
					//console.log('start feed_load_more from feed_load, offset, end offset, limit:',account,offset,end_offset,limit);
					feed_load_more(result,account,offset,end_offset,limit,callback);
				}
				else{
					callback(false,false);
				}
			}
		});
	};
}

function feed_add(account,block,time,callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	idb_get_id('feed','object',[account,block],function(feed_id){
		if(false===feed_id){
			let add_t=db.transaction(['feed'],'readwrite');
			let add_q=add_t.objectStore('feed');
			let obj={
				account:account,
				block:block,
				time:(time?time:(new Date().getTime() / 1000 | 0)),
			};
			add_q.add(obj);
			if(!is_safari){
				if(!is_firefox){
					add_t.commit();
				}
			}
			add_t.oncomplete=function(e){
				callback(false,obj);
			};
		}
		else{
			callback(true,false);
		}
	});
}

var object_types_list=['t','text','p','publication'];
var object_types_arr={'t':'text','p':'publication'};
function parse_object(account,block,callback){
	let result={};
	viz.api.getOpsInBlock(block,false,function(err,response){
		if(err){
			callback(true,1);//api error or block not found
		}
		else{
			let item=false;
			for(let i in response){
				let item_i=i;
				if('custom'==response[item_i].op[0]){
					if(app_protocol==response[item_i].op[1].id){
						let op=response[item_i].op[1];
						if(op.required_regular_auths.includes(account)){
							item=JSON.parse(response[item_i].op[1].json);
							item.timestamp=parse_date(response[item_i].timestamp) / 1000 | 0;
						}
					}
				}
			}
			if(false==item){
				callback(true,2);//item not found
			}
			else{
				let reply=false;
				let share=false;

				let parent_account=false;
				let parent_block=false;

				let type='text';//by default
				if(typeof item.t !== 'undefined'){
					if(-1!=object_types_list.indexOf(item.t)){
						if(typeof object_types_arr[item.t] !== 'undefined'){
							type=object_types_arr[item.t];
						}
						else{
							type=item.t;
						}
					}
				}
				if('text'==type){
					if(typeof item.d.r !== 'undefined'){
						let reply_link=item.d.r;
						//internal
						if(0==reply_link.indexOf('viz://')){
							reply_link=reply_link.toLowerCase();
							reply_link=escape_html(reply_link);
							let pattern = /@[a-z0-9\-\.]*/g;
							let reply_account=reply_link.match(pattern);
							if(typeof reply_account[0] != 'undefined'){
								let pattern_block = /\/([0-9]*)\//g;
								let reply_block=reply_link.match(pattern_block);
								if(typeof reply_block[1] != 'undefined'){
									reply=true;
									parent_account=reply_account[0].substr(1);
									parent_block=parseInt(fast_str_replace('/','',reply_block[1]));
								}
							}
						}
					}
					else
					if(typeof item.d.s != 'undefined'){
						let share_link=item.d.s;
						//internal
						if(0==share_link.indexOf('viz://')){
							share_link=share_link.toLowerCase();
							share_link=escape_html(share_link);
							let pattern = /@[a-z0-9\-\.]*/g;
							let share_account=share_link.match(pattern);
							if(typeof share_account[0] != 'undefined'){
								let pattern_block = /\/([0-9]*)\//g;
								let share_block=share_link.match(pattern_block);
								if(typeof share_block[1] != 'undefined'){
									share=true;
									parent_account=share_account[0].substr(1);
									parent_block=parseInt(fast_str_replace('/','',share_block[1]));
								}
							}
						}
					}
				}
				let obj={
					account:account,
					block:block,
					data:item,
					is_reply:0,
					is_share:0,
				};
				if('text'==type){
					if(reply){
						obj.is_reply=1;
						obj.parent_account=parent_account;
						obj.parent_block=parent_block;
					}
					if(share){
						obj.is_share=1;
						obj.parent_account=parent_account;
						obj.parent_block=parent_block;
					}
				}
				obj.time=new Date().getTime() / 1000 | 0;//unixtime
				console.log(obj);

				let t,q,req;
				t=db.transaction(['objects'],'readwrite');
				q=t.objectStore('objects');
				req=q.index('object').openCursor(IDBKeyRange.only([account,block]),'next');

				let result;
				let find=false;
				req.onsuccess=function(event){
					let cur=event.target.result;
					if(cur){
						result=cur.value;
						result.time=obj.time;
						find=true;
						update_req=cur.update(result);
						update_req.onsuccess=function(e){
							callback(false,result);
						}
						cur.continue();
					}
					else{
						if(!find){//object not found in base
							if(global_db_version>=2){//hashtags support
								//need replace url with hash to avoid conflict
								let hashtags_text='';
								if('text'==type){
									hashtags_text=obj.data.d.text;
								}
								if('publication'==type){
									hashtags_text=markdown_clear_code(obj.data.d.m);//markdown
									hashtags_text=markdown_decode_text(hashtags_text);
									let mnemonics_pattern = /&#[a-z0-9\-\.]+;/g;
									hashtags_text=hashtags_text.replace(mnemonics_pattern,'');//remove unexpected html mnemonics
								}
								let summary_links=[];
								//let http_protocol_pattern = /(http|https)\:\/\/[@A-Za-z0-9\-_\.\/#]*/g;//first version
								//add \u0400-\u04FF for cyrillic https://jrgraphix.net/r/Unicode/0400-04FF
								let http_protocol_pattern = /((?:https?|ftp):\/\/[\u0400-\u04FF\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\u0400-\u04FF\-A-Z0-9+\u0026@#\/%=~()_|])/gi;
								let http_protocol_links=hashtags_text.match(http_protocol_pattern);
								if(null!=http_protocol_links){
									summary_links=summary_links.concat(http_protocol_links);
								}

								summary_links=array_unique(summary_links);
								summary_links.sort(sort_by_length_desc);

								for(let i in summary_links){
									hashtags_text=fast_str_replace(summary_links[i],'',hashtags_text);
								}

								let hashtags_pattern = /(|\b)#([^@#!.,?\r\n\t <>()\[\]]+)(|\b)/g;;
								let hashtags_links=hashtags_text.match(hashtags_pattern);
								if(null!=hashtags_links){
									hashtags_links=hashtags_links.map(function(value){
										return value.toLowerCase();
									});
									hashtags_links=array_unique(hashtags_links);

									let add_hashtag_object=function(hashtag_id,account,block){
										idb_get_id_filter('hashtags_feed','object',[account,block],{tag:hashtag_id},function(feed_id){
											if(false===feed_id){//add object to hashtag feed
												let add_t,add_q,add_req;
												add_t=db.transaction(['hashtags_feed'],'readwrite');
												add_q=add_t.objectStore('hashtags_feed');
												add_req=add_q.add({tag:hashtag_id,account:account,block:block});
												if(!is_safari){
													if(!is_firefox){
														add_t.commit();
													}
												}
												add_req.onsuccess=function(e){
													//update hashtag counter
													let upd_t,upd_q,upd_req;
													upd_t=db.transaction(['hashtags'],'readwrite');
													upd_q=upd_t.objectStore('hashtags');
													upd_req=upd_q.openCursor(IDBKeyRange.only(hashtag_id),'next');
													upd_req.onsuccess=function(event){
														let cur=event.target.result;
														if(cur){
															let result=cur.value;
															result.count++;
															cur.update(result);
															cur.continue();
														}
														else{
															setTimeout(function(){render_right_addon();},10);
														}
													};
												};
											}
										});
									};

									for(let i in hashtags_links){
										let hashtag=hashtags_links[i].substr(1);
										hashtag=hashtag.trim();
										if(''!=hashtag){
											idb_get_id('hashtags','tag',hashtag,function(hashtag_id){
												if(false===hashtag_id){
													let hashtag_info,hashtag_add_t,hashtag_add_q,hashtag_add_req;
													hashtag_info={'tag':hashtag,'count':0,'status':0,'order':0};
													hashtag_add_t=db.transaction(['hashtags'],'readwrite');
													hashtag_add_q=hashtag_add_t.objectStore('hashtags');
													hashtag_add_req=hashtag_add_q.add(hashtag_info);
													if(!is_safari){
														if(!is_firefox){
															hashtag_add_t.commit();
														}
													}
													hashtag_add_req.onsuccess=function(e){
														idb_get_id('hashtags','tag',hashtag,function(hashtag_id){
															if(false!==hashtag_id){
																add_hashtag_object(hashtag_id,obj.account,obj.block);
															}
														});
													}
												}
												else{
													add_hashtag_object(hashtag_id,obj.account,obj.block);
												}
											});
										}
									}
								}
							}

							let add_t,add_q;
							add_t=db.transaction(['objects'],'readwrite');
							add_q=add_t.objectStore('objects');
							add_q.add(obj);
							if(!is_safari){
								if(!is_firefox){
									add_t.commit();
								}
							}
							add_t.oncomplete=function(e){
								idb_get_by_id('users','account',account,function(user_data){
									if(1==user_data.status){//subscribed to account
										//check feed load for parsed object and previous unseen range
										feed_load(account,false,block,false,function(err,result){
											console.log('feed load by parse object',err,result);
										});
									}
								});
								if(reply){//add to replies
									idb_get_id('replies','object',[account,block],function(reply_id){
										if(false===reply_id){//create reply
											let reply_add_t=db.transaction(['replies'],'readwrite');
											let reply_add_q=reply_add_t.objectStore('replies');
											let reply_obj={
												account:account,
												block:block,
												parent_account:parent_account,
												parent_block:parent_block,
												time:new Date().getTime() / 1000 | 0
											};
											reply_add_q.add(reply_obj);
											if(!is_safari){
												if(!is_firefox){
													reply_add_t.commit();
												}
											}
											reply_add_t.oncomplete=function(e){
												callback(false,obj);
											};
										}
										else{//already exist
											callback(false,obj);
										}
									});
								}
								else{
									callback(false,obj);
								}
							};
						}
					}
				};
			}
		}
	});
}

function load_nested_replies(el){
	let link=$(el).closest('.branch').find('.object').data('link');
	let nest=$(el).closest('.nested-replies');
	let parent_account=false;
	let parent_block=false;
	if(0==link.indexOf('viz://')){
		link=link.toLowerCase();
		link=escape_html(link);
		let pattern = /@[a-z0-9\-\.]*/g;
		let link_account=link.match(pattern);
		if(typeof link_account[0] != 'undefined'){
			let pattern_block = /\/([0-9]*)\//g;
			let link_block=link.match(pattern_block);
			if(typeof link_block[1] != 'undefined'){
				reply=true;
				parent_account=link_account[0].substr(1);
				parent_block=parseInt(fast_str_replace('/','',link_block[1]));
			}
		}
	}
	if(parent_account){
		get_replies(parent_account,parent_block,function(err,replies_result){
			nest.html('');
			for(let i in replies_result){
				let reply_object=replies_result[i];
				let reply_link='viz://@'+reply_object.account+'/'+reply_object.block+'/';
				reply_render=render_object(reply_object.account,reply_object.block,'reply');
				nest.append(reply_render);
			}
		});
	}
}

function get_replies(object_account,object_block,callback){
	let replies=[];
	let t=db.transaction(['replies'],'readonly');
	let q=t.objectStore('replies');
	let req=q.index('parent').openCursor(IDBKeyRange.only([object_account,parseInt(object_block)]),'next');
	let find=0;
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			replies.push(cur.value);
			find++;
			cur.continue();
		}
		else{
			if(find){
				console.log('find replies in objects cache: '+find);
				callback(false,replies);
			}
			else{
				console.log('no replies was found');
				callback(true,1);
			}
		}
	};
}

function get_object(account,block,callback){
	let result={};
	let find=false;

	//look on cache
	let t=db.transaction(['objects'],'readonly');
	let q=t.objectStore('objects');
	let req=q.index('object').openCursor(IDBKeyRange.only([account,block]),'next');
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			result=cur.value;
			find=true;
			cur.continue();
		}
		else{
			if(find){
				console.log('find in objects cache: '+account+' '+block);
				callback(false,result);
			}
			else{
				console.log('need parse object: '+account+' '+block);
				parse_object(account,block,callback);
			}
		}
	};
}
function clear_previews_cache(callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	let t,q,req;
	t=db.transaction(['preview'],'readwrite');
	q=t.objectStore('preview');
	let time_bound=new Date().getTime() / 1000 | 0;
	time_bound-=settings.preview_cache_ttl*60;
	req=q.index('time').openCursor(IDBKeyRange.upperBound(time_bound),'next');

	let result=[];
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			cur.delete();
			cur.continue();
		}
		else{
			setTimeout(function(){callback()},100);
		}
	};
}
function clear_objects_cache(callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	let users_t,users_q,users_req;
	users_t=db.transaction(['users'],'readonly');
	users_q=users_t.objectStore('users');
	users_req=users_q.index('status').openCursor(IDBKeyRange.only(1),'next');
	let users_list=[];
	users_req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			if(1==cur.value.status){//deleting only temporary users
				users_list.push(cur.value.account);
			}
			cur.continue();
		}
		else{
			console.log('clear_objects_cache users_list',users_list);

			let t,q,req;
			t=db.transaction(['objects'],'readwrite');
			q=t.objectStore('objects');
			let time_bound=new Date().getTime() / 1000 | 0;
			time_bound-=settings.object_cache_ttl*60;
			req=q.index('time').openCursor(IDBKeyRange.upperBound(time_bound),'next');

			let result=[];
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					if(-1==users_list.indexOf(cur.value.account)){
						result.push([cur.value.account,cur.value.block]);
						cur.delete();
					}
					cur.continue();
				}
				else{
					for(let i in result){
						let item_i=result[i];
						let remove_t,remove_q;
						remove_t=db.transaction(['replies'],'readwrite');
						remove_q=remove_t.objectStore('replies');
						remove_req=remove_q.index('object').openCursor(IDBKeyRange.only([item_i[0],item_i[1]]),'next');
						remove_req.onsuccess=function(event){
							let cur=event.target.result;
							if(cur){
								cur.delete();
								cur.continue();
							}
						}
					}
					setTimeout(function(){callback()},100);
				}
			};
		}
	};
}
function clear_users_cache(callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	let t,q,req;
	t=db.transaction(['users'],'readwrite');
	q=t.objectStore('users');
	let time_bound=new Date().getTime() / 1000 | 0;
	time_bound-=settings.user_cache_ttl*60;
	req=q.index('update').openCursor(IDBKeyRange.upperBound(time_bound),'next');

	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			if(0==cur.value.status){//deleting only temporary users
				cur.delete();
			}
			cur.continue();
		}
		else{
			//nothing
			callback();
		}
	};
}

function stop_timers(){
	for(let feed_account_timer in feed_load_timers){
		clearTimeout(feed_load_timers[feed_account_timer]);
	}
	clearTimeout(update_feed_timer);
	clearTimeout(load_notifications_count_timer);
	clearTimeout(load_new_objects_timer);
	clearTimeout(check_load_more_timer);
	clearTimeout(clear_cache_timer);
	clearTimeout(dgp_timer);
	clearTimeout(sync_cloud_update_worker_timer);
}

function start_timers(){
	clearTimeout(update_feed_timer);
	update_feed();
	clearTimeout(load_notifications_count_timer);
	load_notifications_count_timer=setTimeout(function(){load_notifications_count();},100);
	clearTimeout(clear_cache_timer);
	clear_cache_timer=setTimeout(function(){clear_cache()},300000);//5min
	clearTimeout(dgp_timer);
	update_dgp(true);
	clearTimeout(sync_cloud_update_worker_timer);
	sync_cloud_update_worker_timer=setTimeout(function(){
		sync_cloud_update_worker();
	},sync_cloud_update_worker_interval);
}

var load_notifications_count_timer=0;
function load_notifications_count(){
	let t,q,req;
	t=db.transaction(['notifications'],'readonly');
	q=t.objectStore('notifications');
	req=q.index('status').count(IDBKeyRange.only(0));
	req.onsuccess=function(event){
		let count=event.target.result;
		let counter_notifications=$('.counter-notifications');
		if(0==count){
			counter_notifications.removeClass('show');
		}
		else{
			counter_notifications.html(count);
			counter_notifications.addClass('show');
		}
	};
}

function set_notify_readed(id){
	let t,q,req;
	t=db.transaction(['notifications'],'readwrite');
	q=t.objectStore('notifications');
	req=q.openCursor(IDBKeyRange.only(id),'next');

	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			let item=cur.value;
			if(typeof item.link !== 'undefined'){
				notify_link=item.link;
			}
			item.status=1;
			cur.update(item);
			cur.continue();
		}
		else{
			clearTimeout(load_notifications_count_timer);
			load_notifications_count_timer=setTimeout(function(){load_notifications_count();},100);
		}
	};
}

var load_new_objects_timer=0;
function update_feed_result(result){
	if(false!==result){
		console.log('update_feed_result',result);
		let view=$('.view[data-level="0"]');
		let new_objects=view.find('.objects .new-objects');
		let counter_feed=$('.counter-feed');
		let items=new_objects.data('items');
		if(isNaN(items)){
			items=0;
		}
		items+=result.items;
		new_objects.data('items',items);
		if(0==items){
			new_objects.removeClass('show');
			counter_feed.removeClass('show');
		}
		else{
			if(whitelabel_init){
				clearTimeout(load_new_objects_timer);
				load_new_objects_timer=setTimeout(function(){
					new_objects.addClass('disabled');
					load_new_objects(new_objects);
					whitelabel_init=false;
					if(whitelabel_redirect && 0==level){
						view_path('viz://@'+whitelabel_account+'/',{},true,false);
					}
					else{
						let indicator=view.find('.load-more-end-notice');
						indicator.before(ltmp_arr.feed_end_notice);
						indicator.remove();
					}
				},200);
			}
			else{
				if(false!==mute_notifications){
					return;
				}
				new_objects.html(ltmp(ltmp_arr.feed_new_objects,{items:items}));
				new_objects.addClass('show');
				console.log('show counter_feed',items,mute_notifications);
				counter_feed.html(items);
				counter_feed.addClass('show');
			}
		}
	}
}

let feed_load_timers={};
function update_feed_subscribes(callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	let t=db.transaction(['users'],'readwrite');
	let q=t.objectStore('users');
	let req=q.index('status').openCursor(IDBKeyRange.only(1),'next');
	let list=[];
	let delay=0;
	let delay_step=200;
	if(whitelabel_init){
		delay_step=10;
	}
	let check_activity=(new Date().getTime() /1000 | 0) - settings.activity_period*60;
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			let item=cur.value;
			if(typeof item.activity === 'undefined'){
				item.activity=0;
			}
			let item_check_activity=check_activity;
			if(typeof item.settings !== 'undefined'){
				if(typeof item.settings.activity_period !== 'undefined'){
					item_check_activity=(new Date().getTime() /1000 | 0) - item.settings.activity_period*60;
				}
			}
			if(item.activity<item_check_activity){
				list.push(item.account);
				item.activity=new Date().getTime() /1000 | 0;
				cur.update(item);
			}
			cur.continue();
		}
		else{
			console.log('update_feed_subscribes users by activity',list);
			for(let i in list){
				let account=list[i];
				if(account!=current_user){
					if(typeof feed_load_timers[account] !== 'undefined'){
						clearTimeout(feed_load_timers[account]);
					}
					feed_load_timers[account]=setTimeout(function(){
						console.log('timer feed_load_timers executed',account);
						feed_load(account,false,false,false,function(err,result){
							if(!err){
								update_feed_result(result);
							}
						});
					},delay);
					console.log('update_feed_subscribes new timer',account,feed_load_timers[account]);
					delay+=delay_step;
				}
			}
			callback();
		}
	};
}

var update_feed_timer=0;
function update_feed(){
	clearTimeout(update_feed_timer);
	console.log('update feed trigger');
	update_feed_subscribes(function(){
		clearTimeout(load_notifications_count_timer);
		load_notifications_count_timer=setTimeout(function(){load_notifications_count();},100);
		update_feed_timer=setTimeout(function(){
			update_feed();
		},30000);//30 sec
	});
}

var clear_users_objects_end_timer=0;
function clear_users_objects(callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	if(0<settings.activity_size){
		console.log('start clear_users_objects');
		let t=db.transaction(['users'],'readwrite');
		let q=t.objectStore('users');
		let req=q.index('status').openCursor(IDBKeyRange.only(1),'next');
		let users=[];
		req.onsuccess=function(event){
			let cur=event.target.result;
			if(cur){
				users.push(cur.value.account);
				cur.continue();
			}
			else{
				for(let i in users){
					let account=users[i];
					if(account!=current_user){
						let user_t=db.transaction(['objects'],'readwrite');
						let user_q=user_t.objectStore('objects');
						let user_req=user_q.index('object').openCursor(IDBKeyRange.upperBound([account,Number.MAX_SAFE_INTEGER]),'prev');
						let offset=false;
						let count=0;
						user_req.onsuccess=function(event){
							let cur=event.target.result;
							if(cur){
								if(account==cur.value.account){
									if(!offset){
										offset=true;
										cur.advance(settings.activity_size);
									}
									else{
										cur.delete();
										count++;
										cur.continue();
									}
								}
							}
							if(0<count){
								console.log('clear_users_objects',account,count);
							}
							clearTimeout(clear_users_objects_end_timer);
							clear_users_objects_end_timer=setTimeout(function(){
								callback();
							},300);
						};
					}
				}
			}
		};
	}
	else{
		callback();
	}
}

function clear_feed(callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	let t=db.transaction(['feed'],'readwrite');
	let q=t.objectStore('feed');
	let req=q.index('time').openCursor(null,'prev');
	let offset=false;
	let count=0;
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			if(!offset){
				offset=true;
				cur.advance(settings.feed_size-1);
			}
			else{
				cur.delete();
				count++;
				cur.continue();
			}
		}
		else{
			console.log('clear feed',count);
			callback();
		}
	};
}

var clear_cache_timer=0;
function clear_cache(callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	console.log('clear cache trigger');
	clearTimeout(clear_cache_timer);
	clear_objects_cache(function(){
		clear_users_cache(function(){
			clear_previews_cache(function(){
				callback();
				clear_cache_timer=setTimeout(function(){clear_cache()},300000);//5min
			});
		});
	});
}

function get_user(account,forced_update,callback){
	forced_update=typeof forced_update==='undefined'?false:forced_update;
	if(typeof callback==='undefined'){
		callback=function(){};
	}

	let result={};
	let find=false;

	if(forced_update){
		console.log('forced_update profile: '+account);
		update_user_profile(account,callback);
	}
	else{
		let t=db.transaction(['users'],'readonly');
		let q=t.objectStore('users');
		let req=q.index('account').openCursor(IDBKeyRange.only(account),'next');
		req.onsuccess=function(event){
			let cur=event.target.result;
			if(cur){
				result=cur.value;
				find=true;
				cur.continue();
			}
			else{
				if(find){
					if(new Date().getTime() > new Date((result.update+settings.user_profile_ttl*60)*1000)){
						console.log('need update profile (ttl): '+account);
						update_user_profile(account,callback);
					}
					else{
						console.log('don\'t need update profile (ttl): '+account);
						callback(false,result);
					}
				}
				else{
					console.log('need update profile: '+account);
					update_user_profile(account,callback);
				}
			}
		};
	}
}

function save_profile(view){
	let nickname=view.find('input[name="nickname"]').val();
	nickname=nickname.trim();

	let about=view.find('input[name="about"]').val();
	about=about.trim();

	let avatar=view.find('input[name="avatar"]').val();
	avatar=avatar.trim();

	let interests_str=view.find('input[name="interests"]').val();
	interests_str+=',';
	let interests_arr=interests_str.split(',');
	let interests=[];
	for(let i in interests_arr){
		let interest=escape_html(interests_arr[i].trim());
		if(''!=interest){
			interests.push(interest);
		}
	}

	let telegram=view.find('input[name="telegram"]').val();
	telegram=telegram.trim();

	let github=view.find('input[name="github"]').val();
	github=github.trim();

	let pinned_object=view.find('input[name="pinned_object"]').val();
	pinned_object=pinned_object.trim();

	viz.api.getAccount(current_user,app_protocol,function(err,response){
		if(err){
			console.log(err);
			view.find('.submit-button-ring').removeClass('show');
			view.find('.error').html(ltmp_arr.gateway_error);
			view.find('.button').removeClass('disabled');
			return;
		}
		else{
			let json_metadata={};
			if(''!=response.json_metadata){
				json_metadata=JSON.parse(response.json_metadata);
			}

			if(typeof json_metadata.profile === 'undefined'){
				json_metadata.profile={};
			}

			json_metadata.profile.nickname=nickname;
			json_metadata.profile.about=about;
			json_metadata.profile.avatar=avatar;

			if(typeof json_metadata.profile.services === 'undefined'){
				json_metadata.profile.services={};
			}

			if(''==telegram){
				if(typeof json_metadata.profile.services.telegram !== 'undefined'){
					delete json_metadata.profile.services.telegram;
				}
			}
			else{
				json_metadata.profile.services.telegram=telegram;
			}

			if(''==github){
				if(typeof json_metadata.profile.services.github !== 'undefined'){
					delete json_metadata.profile.services.github;
				}
			}
			else{
				json_metadata.profile.services.github=github;
			}

			if(interests.length==0){
				if(typeof json_metadata.profile.interests !== 'undefined'){
					delete json_metadata.profile.interests;
				}
			}
			else{
				json_metadata.profile.interests=interests;
			}

			if(''==pinned_object){
				if(typeof json_metadata.profile.pinned !== 'undefined'){
					delete json_metadata.profile.pinned;
				}
			}
			else{
				json_metadata.profile.pinned=pinned_object;
			}

			if(Object.keys(json_metadata.profile.services).length==0){
				delete json_metadata.profile.services;
			}

			if(''==json_metadata.profile.about){
				delete json_metadata.profile.about;
			}
			if(''==json_metadata.profile.avatar){
				delete json_metadata.profile.avatar;
			}
			if(''==json_metadata.profile.nickname){
				delete json_metadata.profile.nickname;
			}

			let new_json_metadata=JSON.stringify(json_metadata);

			viz.broadcast.accountMetadata(users[current_user].regular_key,current_user,new_json_metadata,function(err,result){
				if(result){
					view.find('.submit-button-ring').removeClass('show');
					view.find('.success').html(ltmp_arr.edit_profile_saved);
					view.find('.button').removeClass('disabled');
					setTimeout(function(){
						get_user(current_user,true,function(err,result){
							if(err){
								console.log('failed forced update after profile changes');
							}
							else{
								console.log('successfully forced update after profile changes');
							}
						}
					)},1000);
				}
				else{
					console.log(err);
					view.find('.submit-button-ring').removeClass('show');
					view.find('.error').html(ltmp_arr.gateway_error);
					view.find('.button').removeClass('disabled');
					return;
				}
			});
		}
	});
}

function view_search(view,path_parts,query,title){
	document.title=ltmp_arr.search_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:''});
	header+=ltmp(ltmp_arr.header_caption,{caption:ltmp_arr.search_caption});
	view.find('.header').html(header);

	view.find('.button').removeClass('disabled');
	view.find('.submit-button-ring').removeClass('show');
	view.find('.error').html('');
	view.find('.success').html('');

	view.find('input').val('');

	$('.loader').css('display','none');
	view.css('display','block');
	view.find('input[name=search]')[0].focus();
}

var editor_allowed_elements=['#text','H1','H2','H3','P','STRONG','B','EM','I','STRIKE','HR','BR','A','CODE','BLOCKQUOTE','CITE','IMG'];
var editor_allowed_attributes=['href','src','target','width','alt'];
function editor_clear_elements(parent,level){
	let parent_element=$(parent)[0].nodeName;
	let incorrect=false;
	$(parent)[0].childNodes.forEach(function(el,i){
		if(!incorrect){
			let element=$(el)[0];
			if(-1==editor_allowed_elements.indexOf(element.nodeName)){
				if(0!=element.children.length){
					editor_clear_elements(element,1+level);
				}
				element.outerHTML=element.innerHTML;
				incorrect=true;
			}
			else{
				if('#text'==element.nodeName){
					if(0==level){
						var p_el=document.createElement("p");
						p_el.textContent=element.textContent;
						element.replaceWith(p_el);
					}
				}
				else{
					//console.log(typeof element.style,element.style);
					element.removeAttribute('style');
					element.removeAttribute('class');
					if(0!=element.dataset.length){
						for(let key in element.dataset){
							delete element.dataset[key];
						}
					}
					if(0!=element.attributes.length){
						let to_remove=[];
						for(let key in element.attributes){
							if(typeof element.attributes[key]['nodeName'] !== 'undefined'){
								if(-1==editor_allowed_attributes.indexOf(element.attributes[key]['nodeName'])){
									to_remove.push(element.attributes[key]['nodeName']);
								}
							}
						}
						for(let key in to_remove){
							element.removeAttribute(to_remove[key]);
						}
					}
					if(0!=element.children.length){
						editor_clear_elements(element,1+level);
					}
					if(0!=level){
						if('P'==element.nodeName){
							if('P'==parent_element){
								$(element)[0].outerHTML=$(element)[0].innerHTML;
							}
						}
					}
				}
			}
		}
	});
	if(incorrect){
		editor_clear_elements(parent,level);
	}
}
var editor_save_draft_timer=0;
function editor_save_draft(){
	let article_obj={
		html:$('.article-editor .editor-text').html(),
		description:$('.article-settings input[name="description"]').val(),
		thumbnail:$('.article-settings input[name="thumbnail"]').val(),
	};
	let article_json=JSON.stringify(article_obj);
	localStorage.setItem(storage_prefix+'article_draft',article_json);
}
function editor_change(e){
	e=typeof e !== 'undefined'?e:false;
	//console.log('editor_change',e);
	let editor=false;
	if(false===e){
		editor=$('.editor-text');
	}
	else{
		editor=$(e.target);
	}
	let placeholders=$('.editor-placeholders');
	if(0==editor.find('h1').length){
		//console.log("editor.find('h1').length",editor.find('h1').length);
		editor.prepend('<h1><br></h1>');
		placeholders.find('h1').removeClass('hidden');
	}
	else{
		if(1!=editor.find('h1').length){
			editor.find('h1').each(function(i,el){
				if(0==i){
					el.innerHTML=el.textContent;
				}
				else{
					el.remove();
				}
			});
		}
		if(''!=editor.find('h1')[0].textContent){
			placeholders.find('h1').addClass('hidden');
		}
		else{
			editor.find('h1').html('<br>');
			placeholders.find('h1').removeClass('hidden');
		}
	}
	placeholders.find('p').removeClass('hidden');
	let find_content=false;
	if(0!=editor.find('p').length){
		if(1==editor.find('p').length){
			if(''==editor.find('p')[0].textContent){
				find_content=false;
			}
			else{
				find_content=true;
			}
		}
		else{
			find_content=true;
		}
	}
	if(0!=editor.find('blockquote').length){
		find_content=true;
	}
	if(0!=editor.find('cite').length){
		find_content=true;
	}
	if(0!=editor.find('img').length){
		find_content=true;
	}
	if(0!=editor.find('h2').length){
		find_content=true;
	}
	if(0!=editor.find('h3').length){
		find_content=true;
	}
	if(find_content){
		placeholders.find('p').addClass('hidden');
	}
	else{
		if(0==editor.find('p').length){
			editor.append('<p><br></p>');
		}
		if(0!=editor.find('hr').length){
			placeholders.find('p').addClass('hidden');
		}
		else{
			placeholders.find('p').removeClass('hidden');
		}
	}
	setTimeout(function(){
		editor_clear_elements(editor,0);
	},10);
	clearTimeout(editor_save_draft_timer);
	editor_save_draft_timer=setTimeout(function(){
		editor_save_draft();
	},1000);
}
function selection_insert_tag(tag,text){
	text=typeof text==='undefined'?false:text;
	let sel, range, element;
	if(window.getSelection && (sel = window.getSelection()).rangeCount){
		sel.deleteFromDocument();
		range=sel.getRangeAt(0);
		range.collapse(true);
		element=document.createElement(tag);
		if(false!==text){
			element.appendChild(document.createTextNode(text));
		}
		range.insertNode(element);

		// Move the caret immediately after the inserted element
		range.setStartAfter(element);
		range.collapse(true);
		range.selectNodeContents(element);
		sel.removeAllRanges();
		sel.addRange(range);
		return element;
	}
}
function get_selection_html(){
	let selection=window.getSelection();
	let selection_html=false;
	if(typeof selection !== "undefined"){
		if(selection.rangeCount){
			let temp_container = document.createElement("div");
			for (let i=0,len=selection.rangeCount;i<len;++i){
				temp_container.appendChild(selection.getRangeAt(i).cloneContents());
			}
			selection_html=temp_container.innerHTML;
			temp_container.remove();
		}
	}
	return selection_html;
}
function get_selection_tags(){
	let html=get_selection_html();
	let tags=[];
	if(false!==html){
		let match=html.match(/\<\/([^>]*)\>$/g);//close tag from the end
		while(null!==match){
			match=match[0];
			let len=match.length;
			match=match.substring(2,len-1);
			match=match.toUpperCase();
			//console.log(tags.indexOf(match));
			if(-1==tags.indexOf(match)){
				tags.push(match);
			}
			html=html.substring(0,html.length-len);
			//console.log(html,match,typeof match);
			match=html.match(/\<\/([^>]*)\>$/g);
		}
	}
	return tags;
}
function editor_selection(e){
	$('.editor-formatter > a').addClass('disabled');
	$('.editor-formatter > a').removeClass('positive');
	$('.editor-formatter > a').removeClass('positive-alt');
	let selection=window.getSelection();
	if(typeof selection !== "undefined"){
		if(typeof $(selection.focusNode).closest('.editor-text')[0] !== 'undefined'){
			let element_type=$(selection.focusNode)[0].nodeName;
			let parent_element_type=$(selection.focusNode.parentNode)[0].nodeName;
			let selection_text=selection.toString();
			let selection_html=get_selection_html();
			let tags=get_selection_tags();
			if('DIV'==element_type){
				if('DIV'==parent_element_type){
					return;
				}
			}
			//console.log(e,selection,selection_text,selection_html);
			//console.log(parent_element_type,' > ',element_type);
			if(''!=selection_text){//text part
				if('H1'==parent_element_type){
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
				}
				if('A'==parent_element_type){
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-link-action').addClass('positive');
				}
				if('STRIKE'==parent_element_type){//#text into strike element
					if('H1'!=$(selection.focusNode.parentNode.parentNode)[0].nodeName){
						$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
						$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
						$('.editor-formatter > a.editor-code-action').removeClass('disabled');
					}
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');

					$('.editor-formatter > a.editor-strikethrough-action').addClass('positive');
				}
				if('STRONG'==parent_element_type){
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').removeClass('disabled');

					$('.editor-formatter > a.editor-bold-action').addClass('positive');
				}
				if('B'==parent_element_type){
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').removeClass('disabled');

					$('.editor-formatter > a.editor-bold-action').addClass('positive');
				}
				if('EM'==parent_element_type){
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').removeClass('disabled');

					$('.editor-formatter > a.editor-italic-action').addClass('positive');
				}
				if('I'==parent_element_type){
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').removeClass('disabled');

					$('.editor-formatter > a.editor-italic-action').addClass('positive');
				}
				if('CODE'==parent_element_type){
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').removeClass('disabled');

					$('.editor-formatter > a.editor-code-action').addClass('positive');
				}
				if('DIV'==parent_element_type){//empty P
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					if('H1'!=element_type){
						$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
						$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
						$('.editor-formatter > a.editor-quote-action').removeClass('disabled');
					}
					if('H2'==element_type){
						$('.editor-formatter > a.editor-header2-action').addClass('positive');
					}
					if('H3'==element_type){
						$('.editor-formatter > a.editor-header3-action').addClass('positive');
					}
					if('CITE'==element_type){
						$('.editor-formatter > a.editor-quote-action').addClass('positive');
					}
					if('BLOCKQUOTE'==element_type){
						$('.editor-formatter > a.editor-quote-action').addClass('positive-alt');
					}
				}
				if('P'==parent_element_type){
					$('.editor-formatter > a.editor-attach-image-action').removeClass('disabled');
					$('.editor-formatter > a.editor-image-action').removeClass('disabled');
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');

					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').removeClass('disabled');

					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');

					if('A'==element_type){
						$('.editor-formatter > a.editor-link-action').removeClass('disabled');
						$('.editor-formatter > a.editor-link-action').addClass('positive');
					}
					if('STRONG'==element_type){
						$('.editor-formatter > a.editor-bold-action').addClass('positive');
					}
					if('B'==element_type){
						$('.editor-formatter > a.editor-bold-action').addClass('positive');
					}
					if('EM'==element_type){
						$('.editor-formatter > a.editor-italic-action').addClass('positive');
					}
					if('I'==element_type){
						$('.editor-formatter > a.editor-italic-action').addClass('positive');
					}
					if('STRIKE'==element_type){
						$('.editor-formatter > a.editor-strikethrough-action').addClass('positive');
					}
					if('CODE'==element_type){
						$('.editor-formatter > a.editor-code-action').addClass('positive');
					}
				}
				if('CITE'==parent_element_type){
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').addClass('positive');
				}
				if('BLOCKQUOTE'==parent_element_type){
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').addClass('positive-alt');
				}
				if('H2'==parent_element_type){
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');

					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header2-action').addClass('positive');
				}
				if('H3'==parent_element_type){
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');

					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').addClass('positive');
				}

				if(-1!=tags.indexOf('A')){
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-link-action').addClass('positive');
				}
				if(-1!=tags.indexOf('STRIKE')){
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').addClass('positive');
				}
				if(-1!=tags.indexOf('STRONG')){
					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').addClass('positive');
				}
				if(-1!=tags.indexOf('B')){
					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').addClass('positive');
				}
				if(-1!=tags.indexOf('EM')){
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').addClass('positive');
				}
				if(-1!=tags.indexOf('I')){
					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').addClass('positive');
				}
				if(-1!=tags.indexOf('CODE')){
					$('.editor-formatter > a.editor-code-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').addClass('positive');
				}
				/*
				if('STRIKE'==element_type){//selected strike element
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').addClass('positive');
				}
				else{
					$('.editor-formatter > a.editor-strikethrough-action').removeClass('positive');
				}
				*/
			}
			else{//paragraph
				if('DIV'==parent_element_type){
					if('H1'!=element_type){
						$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
						$('.editor-formatter > a.editor-attach-image-action').removeClass('disabled');
						$('.editor-formatter > a.editor-image-action').removeClass('disabled');
						$('.editor-formatter > a.editor-link-action').removeClass('disabled');

						$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
						$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
						$('.editor-formatter > a.editor-quote-action').removeClass('disabled');

						$('.editor-formatter > a.editor-separator-action').removeClass('disabled');
						if('CITE'==element_type){
							$('.editor-formatter > a.editor-quote-action').addClass('positive');
						}
						if('BLOCKQUOTE'==element_type){
							$('.editor-formatter > a.editor-quote-action').addClass('positive-alt');
						}
						if('H2'==element_type){
							$('.editor-formatter > a.editor-header2-action').addClass('positive');
						}
						if('H3'==element_type){
							$('.editor-formatter > a.editor-header3-action').addClass('positive');
						}
					}
				}
				if('P'==parent_element_type){
					$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
					$('.editor-formatter > a.editor-attach-image-action').removeClass('disabled');
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-image-action').removeClass('disabled');

					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');

					$('.editor-formatter > a.editor-separator-action').removeClass('disabled');
				}
				if('A'==parent_element_type){
					$('.editor-formatter > a.editor-link-action').removeClass('disabled');
					$('.editor-formatter > a.editor-link-action').addClass('positive');
				}
				if('STRIKE'==parent_element_type){
					$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
					$('.editor-formatter > a.editor-separator-action').removeClass('disabled');

					$('.editor-formatter > a.editor-strikethrough-action').removeClass('disabled');
					$('.editor-formatter > a.editor-strikethrough-action').addClass('positive');
				}
				if('B'==parent_element_type){
					$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
					$('.editor-formatter > a.editor-separator-action').removeClass('disabled');

					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').addClass('positive');
				}
				if('STRONG'==parent_element_type){
					$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
					$('.editor-formatter > a.editor-separator-action').removeClass('disabled');

					$('.editor-formatter > a.editor-bold-action').removeClass('disabled');
					$('.editor-formatter > a.editor-bold-action').addClass('positive');
				}
				if('I'==parent_element_type){
					$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
					$('.editor-formatter > a.editor-separator-action').removeClass('disabled');

					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').addClass('positive');
				}
				if('EM'==parent_element_type){
					$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
					$('.editor-formatter > a.editor-separator-action').removeClass('disabled');

					$('.editor-formatter > a.editor-italic-action').removeClass('disabled');
					$('.editor-formatter > a.editor-italic-action').addClass('positive');
				}
				if('CODE'==parent_element_type){
					$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
					$('.editor-formatter > a.editor-separator-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').removeClass('disabled');
					$('.editor-formatter > a.editor-code-action').addClass('positive');
				}
				if('CITE'==parent_element_type){
					$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').addClass('positive');
				}
				if('BLOCKQUOTE'==parent_element_type){
					$('.editor-formatter > a.editor-attach-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').addClass('positive-alt');
				}
				if('H2'==parent_element_type){
					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header2-action').addClass('positive');
				}
				if('H3'==parent_element_type){
					$('.editor-formatter > a.editor-header2-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').removeClass('disabled');
					$('.editor-formatter > a.editor-quote-action').removeClass('disabled');
					$('.editor-formatter > a.editor-header3-action').addClass('positive');
				}
			}
			//$('.editor-formatter > a').removeClass('disabled');
			//#text P
			/*
	var person = prompt("Please enter your name", "Harry Potter");
	if(person != null){
		document.getElementById("demo").innerHTML =
		"Hello " + person + "! How are you today?";
	}
			*/
		}
	}
}
function view_publish(view,path_parts,query,title){
	console.log('view_publish',path_parts,query);
	document.title=ltmp_arr.publish_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:''});
	header+=ltmp(ltmp_arr.header_caption,{caption:ltmp_arr.publish_caption});
	header+=ltmp(ltmp_arr.icon_link,{action:'article-editor',caption:ltmp_arr.editor_caption,icon:ltmp_arr.icon_editor});
	view.find('.header').html(header);

	view.find('.content-view[data-type="article"]').addClass('hidden');
	view.find('.content-view[data-type="simple"]').css('display','block');
	view.find('.article-editor-action').removeClass('positive');

	view.find('.button').removeClass('disabled');
	view.find('.submit-button-ring').removeClass('show');
	view.find('.error').html('');
	view.find('.success').html('');

	view.find('input').val('');
	view.find('textarea').val('');

	$('.editor-text').off('input');
	$('.editor-text').off('keyup');
	$('.editor-text').off('paste');
	$('.article-settings input[name="description"]').off('input');
	$('.article-settings input[name="description"]').off('keyup');
	$('.article-settings input[name="description"]').off('paste');
	$('.article-settings input[name="thumbnail"]').off('input');
	$('.article-settings input[name="thumbnail"]').off('keyup');
	$('.article-settings input[name="thumbnail"]').off('paste');
	document.removeEventListener('selectionchange',editor_selection);
	if('publication'==query){
		let article_json=localStorage.getItem(storage_prefix+'article_draft');
		if(null!==article_json){
			let article_obj=JSON.parse(article_json);
			$('.article-editor .editor-text').html(article_obj.html);
			$('.article-settings input[name="description"]').val(article_obj.description);
			$('.article-settings input[name="thumbnail"]').val(article_obj.thumbnail);
		}

		header+=ltmp(ltmp_arr.icon_link,{action:'article-settings',caption:ltmp_arr.article_settings_caption,icon:ltmp_arr.icon_settings});
		header+=ltmp(ltmp_arr.icon_link,{action:'article-publish',caption:ltmp_arr.article_publish_caption,icon:ltmp_arr.icon_check});
		view.find('.header').html(header);

		view.find('.content-view[data-type="article"]').removeClass('hidden');
		view.find('.content-view[data-type="simple"]').css('display','none');
		$(view).find('.content-view[data-type="article"]').find('.article-settings').css('display','none');
		$(view).find('.content-view[data-type="article"]').find('.article-editor').css('display','block');
		view.find('.article-editor-action').addClass('positive');
		$('.editor-text').on('input',editor_change);
		$('.editor-text').on('keyup',editor_change);
		$('.editor-text').on('paste',editor_change);

		$('.article-settings input[name="description"]').on('input',editor_save_draft);
		$('.article-settings input[name="description"]').on('keyup',editor_save_draft);
		$('.article-settings input[name="description"]').on('paste',editor_save_draft);

		$('.article-settings input[name="thumbnail"]').on('input',editor_save_draft);
		$('.article-settings input[name="thumbnail"]').on('keyup',editor_save_draft);
		$('.article-settings input[name="thumbnail"]').on('paste',editor_save_draft);

		document.execCommand('defaultParagraphSeparator',false,'p');
		document.removeEventListener('selectionchange',editor_selection);
		document.addEventListener('selectionchange',editor_selection);
		editor_change();
	}

	view.find('.text-addon').css('display','none');
	view.find('.comment-addon').css('display','none');
	view.find('.reply-addon').css('display','none');
	view.find('.share-addon').css('display','none');
	view.find('.share-addon input[name="share"]').removeAttr('disabled');
	view.find('.loop-addon').css('display','none');
	if('loop'==query){
		view.find('.loop-addon').css('display','block');
	}
	if('reply'==path_parts[1]){
		view.find('.text-addon').css('display','block');
		setTimeout(function(){view.find('.text-addon textarea')[0].focus();},100);
		view.find('.reply-addon').css('display','block');
		view.find('.reply-addon input[name="reply"]').val(query);
	}
	else
	if('share'==path_parts[1]){
		view.find('.comment-addon').css('display','block');
		setTimeout(function(){view.find('.comment-addon input')[0].focus();},100);
		view.find('.share-addon').css('display','block');
		view.find('.share-addon input[name="share"]').val(query);
		view.find('.share-addon input[name="share"]').attr('disabled','disabled');
	}
	else{
		view.find('.text-addon').css('display','block');
		setTimeout(function(){view.find('.text-addon textarea')[0].focus();},100);
	}
	view.find('.viz_account').html('@'+current_user);

	view.find('.add-interests').html('');
	$('.loader').css('display','none');
	view.css('display','block');

	get_user(current_user,true,function(err,result){
		if(!err){
			let profile=JSON.parse(result.profile);
			if(typeof profile.interests != 'undefined'){
				if(profile.interests.length>0){
					let interests_view='';
					for(let i in profile.interests){
						let interest_caption=profile.interests[i];
						if(interest_caption.length>0){
							let interest_hashtag=interest_caption.replace(' ','_').trim().toLowerCase();
							interests_view+=ltmp(ltmp_arr.publish_interests_item,{caption:interest_caption,hashtag:interest_hashtag});
						}
					}
					view.find('.add-interests').html(ltmp(ltmp_arr.publish_interests,{interests:interests_view}));
				}
			}
		}
	});
}

function view_edit_profile(view,path_parts,query,title){
	document.title=ltmp_arr.edit_profile_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:''});
	header+=ltmp(ltmp_arr.header_caption,{caption:ltmp_arr.edit_profile_caption});
	view.find('.header').html(header);

	view.find('.button').removeClass('disabled');
	view.find('.submit-button-ring').removeClass('show');
	view.find('.error').html('');
	view.find('.success').html('');
	view.find('.viz_account').html('@'+current_user);

	view.find('input').val('');
	get_user(current_user,true,function(err,result){
		if(err){
			view.find('.error').html(ltmp_arr.gateway_error);
		}
		else{
			let profile=JSON.parse(result.profile);
			if(0<Object.keys(profile).length){
				if(typeof profile.nickname != 'undefined'){
					view.find('input[name=nickname]').val(profile.nickname);
				}
				if(typeof profile.about != 'undefined'){
					view.find('input[name=about]').val(profile.about);
				}
				if(typeof profile.avatar != 'undefined'){
					view.find('input[name=avatar]').val(profile.avatar);
				}
				if(typeof profile.interests != 'undefined'){
					view.find('input[name=interests]').val(profile.interests.join(', '));
				}
				if(typeof profile.pinned != 'undefined'){
					view.find('input[name=pinned_object]').val(profile.pinned);
				}
				if(typeof profile.telegram != 'undefined'){
					view.find('input[name=telegram]').val(profile.telegram);
				}
				if(typeof profile.github != 'undefined'){
					view.find('input[name=github]').val(profile.github);
				}
			}
		}
		$('.loader').css('display','none');
		view.css('display','block');
	});
}

function view_notifications(view,path_parts,query,title){
	document.title=ltmp_arr.notifications_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:''});
	header+=ltmp(ltmp_arr.header_caption,{caption:ltmp_arr.notifications_caption});

	let current_tab='all';
	if((typeof path_parts[1] != 'undefined')&&(''!=path_parts[1])){
		current_tab=path_parts[1];
		document.title=ltmp_arr['notifications_'+current_tab+'_tab']+' - '+document.title;
	}

	let tabs='';
	tabs+=ltmp(ltmp_arr.tab,{link:'dapp:notifications/all',class:('all'==current_tab?'current':''),caption:ltmp_arr.notifications_all_tab});
	tabs+=ltmp(ltmp_arr.tab,{link:'dapp:notifications/new',class:('new'==current_tab?'current':''),caption:ltmp_arr.notifications_new_tab});
	tabs+=ltmp(ltmp_arr.tab,{link:'dapp:notifications/readed',class:('readed'==current_tab?'current':''),caption:ltmp_arr.notifications_readed_tab});
	view.find('.tabs').html(tabs);

	view.find('.content-view').css('display','none');
	view.find('.content-view .objects').html('');
	view.find('.content-view[data-tab="'+current_tab+'"]').css('display','block');

	let tab=view.find('.content-view[data-tab="'+current_tab+'"]');
	header+=ltmp(ltmp_arr.icon_link,{action:'mark-readed-notifications',caption:ltmp_arr.mark_readed_notifications_caption,icon:ltmp_arr.icon_notify_clear});
	header+=ltmp(ltmp_arr.icon_link,{action:'clear-readed-notifications',caption:ltmp_arr.clear_readed_notifications_caption,icon:ltmp_arr.icon_message_clear});

	view.find('.header').html(header);
	tab.find('.objects').html(ltmp(ltmp_arr.notifications_loader_notice,{id:0}));

	$('.loader').css('display','none');
	view.css('display','block');
	check_load_more();
}

function uppercase_first_symbol(str){
	return str.substring(0,1).toUpperCase()+str.substring(1);
}
let reverse_arr={
	'й':'ii',
	'ц':'c',
	'у':'u',
	'к':'k',
	'е':'e',
	'н':'n',
	'г':'g',
	'ш':'sh',
	'щ':'sh',
	'з':'z',
	'х':'h',
	'ъ':'',
	'ф':'f',
	'ы':'ie',
	'в':'v',
	'а':'a',
	'п':'p',
	'р':'r',
	'о':'o',
	'л':'l',
	'д':'d',
	'ж':'g',
	'э':'e',
	'я':'ya',
	'ч':'ch',
	'с':'s',
	'м':'m',
	'и':'i',
	'т':'t',
	'ь':'',
	'б':'b',
	'ю':'yu',
	'ё':'e',

	'q':'к',
	'w':'в',
	'e':'е',
	'r':'р',
	't':'т',
	'y':'й',
	'u':'у',
	'i':'и',
	'o':'о',
	'p':'п',
	'a':'а',
	's':'с',
	'd':'д',
	'f':'ф',
	'g':'г',
	'h':'х',
	'j':'ж',
	'k':'к',
	'l':'л',
	'z':'з',
	'x':'кс',
	'c':'к',
	'v':'в',
	'b':'б',
	'n':'н',
	'm':'м',
};
function reverse_str(str){
	let res=str.split('');
	for(let i in res){
		let char=res[i];
		res[i]=reverse_arr[char];
	}
	return res.join('');
}

function rebind_users_search(){
	$('.user-item-search').off('input');
	$('.user-item-search').on('input',function(){
		if(''==this.value){
			$('.user-item-box.search-results').css('display','none');
			$('.view[data-path="dapp:users"] .objects .user-item').css('display','flex')
		}
		else{
			let search_str=this.value.toLowerCase();
			let count=0;
			$('.view[data-path="dapp:users"] .objects .user-item').each(function(){
				if(-1!=$(this).data('search').indexOf(search_str)){
					$(this).css('display','flex');
					count++;
				}
				else{
					$(this).css('display','none');
				}
			})
			$('.user-item-box.search-results').html(ltmp(ltmp_arr.found_results,{count:count}));
			$('.user-item-box.search-results').css('display','block');
		}
	});
}

function view_users(view,path_parts,query,title,back_to){
	view.find('.tabs').html('');
	document.title=ltmp_arr.users_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:back_to});

	view.data('user-account','');
	if((typeof path_parts[1] != 'undefined')&&(''!=path_parts[1])){
		let user_account=decodeURIComponent(path_parts[1]);
		idb_get_by_id('users','account',user_account,function(user_data){
			view.data('user-account',user_account);
			if(false===user_data){
				view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.account_not_found}));
			}
			else{
				document.title='@'+user_data.account+' - '+document.title;
				let user_data_profile=JSON.parse(user_data.profile);
				header+=ltmp(ltmp_arr.header_caption_link,{caption:user_data_profile.nickname,link:'viz://@'+user_data.account});
				let check_account=user_data.account;
				if(check_account==current_user){
					header+=ltmp(ltmp_arr.edit_profile_link,{icon_edit_profile:ltmp_arr.icon_edit_profile});
					header+=ltmp(ltmp_arr.new_object_link,{icon_new_object:ltmp_arr.icon_new_object});
				}
				else{
					if(-1!=whitelabel_accounts.indexOf(check_account)){
					}
					else{
						header+=ltmp(ltmp_arr.user_actions_open,{user:check_account});
						if(1==user_data.status){
							header+=ltmp(ltmp_arr.subscribed_link,{icon:ltmp_arr.icon_subscribed});
							header+=ltmp(ltmp_arr.unsubscribe_link,{icon:ltmp_arr.icon_unsubscribe});
						}
						else
						if(2==user_data.status){
							header+=ltmp(ltmp_arr.ignored_link,{icon:ltmp_arr.icon_ignored});
							header+=ltmp(ltmp_arr.unignore_link,{icon:ltmp_arr.icon_unsubscribe});
						}
						else{
							header+=ltmp(ltmp_arr.subscribe_link,{icon:ltmp_arr.icon_subscribe});
							header+=ltmp(ltmp_arr.ignore_link,{icon:ltmp_arr.icon_ignore});
						}
						header+=ltmp_arr.user_actions_close;
					}
				}
				view.find('.header').html(header);
				let objects='';
				if(typeof user_data.settings === 'undefined'){
					user_data.settings={};
				}
				let prop_value='';
				if(typeof user_data.settings.activity_period !== 'undefined'){
					prop_value=user_data.settings.activity_period;
				}
				objects+=ltmp(ltmp_arr.settings_item,{caption:ltmp_arr.settings_activity_period,prop:'activity_period',placeholder:settings.activity_period,value:prop_value,addon:ltmp_arr.settings_addon_activity_period});
				view.find('.objects').html(ltmp(ltmp_arr.content_view,{content:objects+ltmp_arr.users_settings_buttons}));
			}
			view.find('.header').html(header);
			$('.loader').css('display','none');
			view.css('display','block');
		});
	}
	else{
		header+=ltmp(ltmp_arr.header_caption,{caption:ltmp_arr.users_caption});
		view.find('.header').html(header);

		let current_tab='main';
		if((typeof query != 'undefined')&&(''!=query)){
			current_tab=query;
		}
		if('main'!=current_tab){
			document.title=ltmp_arr['users_'+current_tab+'_tab']+' - '+document.title;
		}

		let tabs='';
		tabs+=ltmp(ltmp_arr.tab,{link:'dapp:users?main',class:('main'==current_tab?'current':''),caption:ltmp_arr.users_main_tab});
		tabs+=ltmp(ltmp_arr.tab,{link:'dapp:users?subscribed',class:('subscribed'==current_tab?'current':''),caption:ltmp_arr.users_subscribed_tab});
		tabs+=ltmp(ltmp_arr.tab,{link:'dapp:users?ignored',class:('ignored'==current_tab?'current':''),caption:ltmp_arr.users_ignored_tab});
		view.find('.tabs').html(tabs);
		view.find('.objects').html(ltmp_arr.empty_loader_notice);
		if('main'==current_tab){
			let read_t=db.transaction(['users'],'readonly');
			let read_q=read_t.objectStore('users');
			let req=read_q.index('account').openCursor(null,'next');
			let find=false;
			let objects='';
			let num=1;
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					if(current_user!=cur.value.account){
						let user_data=cur.value;
						find=true;

						let user_data_profile=JSON.parse(user_data.profile);

						let search_str=user_data.account+user_data_profile.nickname;
						search_str=search_str.split(' ').join('');
						search_str=search_str.toLowerCase();
						search_str+=reverse_str(search_str);

						objects+=ltmp(ltmp_arr.users_objects_item,{search:search_str,avatar:ltmp(ltmp_arr.users_objects_item_avatar,{account:user_data.account,avatar:safe_avatar(user_data_profile.avatar)}),account:user_data.account,nickname:user_data_profile.nickname,icon:ltmp_arr.icon_edit_profile});
						num++;
					}
					cur.continue();
				}
				else{
					if(find){
						objects=ltmp_arr.users_objects_header+objects;
						view.find('.objects').html(objects);
					}
					else{
						view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.users_not_found}));
					}
					view.find('.header').html(header);
					$('.loader').css('display','none');
					view.css('display','block');
					rebind_users_search();
				}
			};
		}
		else
		if('subscribed'==current_tab){
			let read_t=db.transaction(['users'],'readonly');
			let read_q=read_t.objectStore('users');
			let req=read_q.index('account').openCursor(null,'next');
			let find=false;
			let objects='';
			let num=1;
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					if(current_user!=cur.value.account){
						if(1==cur.value.status){
							let user_data=cur.value;
							find=true;

							let user_data_profile=JSON.parse(user_data.profile);

							let search_str=user_data.account+user_data_profile.nickname;
							search_str=search_str.split(' ').join('');
							search_str=search_str.toLowerCase();
							search_str+=reverse_str(search_str);

							objects+=ltmp(ltmp_arr.users_objects_item,{search:search_str,avatar:ltmp(ltmp_arr.users_objects_item_avatar,{account:user_data.account,avatar:safe_avatar(user_data_profile.avatar)}),account:user_data.account,nickname:user_data_profile.nickname,icon:ltmp_arr.icon_edit_profile});
							num++;
						}
					}
					cur.continue();
				}
				else{
					if(find){
						objects=ltmp_arr.users_objects_header+objects;
						view.find('.objects').html(objects);
					}
					else{
						view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.users_not_found}));
					}
					$('.loader').css('display','none');
					view.css('display','block');
					rebind_users_search();
				}
			};
		}
		else{//ignored
			let read_t=db.transaction(['users'],'readonly');
			let read_q=read_t.objectStore('users');
			let req=read_q.index('account').openCursor(null,'next');
			let find=false;
			let objects='';
			let num=1;
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					if(current_user!=cur.value.account){
						if(2==cur.value.status){
							let user_data=cur.value;
							find=true;

							let user_data_profile=JSON.parse(user_data.profile);

							let search_str=user_data.account+user_data_profile.nickname;
							search_str=search_str.split(' ').join('');
							search_str=search_str.toLowerCase();
							search_str+=reverse_str(search_str);

							objects+=ltmp(ltmp_arr.users_objects_item,{search:search_str,avatar:ltmp(ltmp_arr.users_objects_item_avatar,{account:user_data.account,avatar:safe_avatar(user_data_profile.avatar)}),account:user_data.account,nickname:user_data_profile.nickname,icon:ltmp_arr.icon_edit_profile});
							num++;
						}
					}
					cur.continue();
				}
				else{
					if(find){
						objects=ltmp_arr.users_objects_header+objects;
						view.find('.objects').html(objects);
					}
					else{
						view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.users_not_found}));
					}
					$('.loader').css('display','none');
					view.css('display','block');
					rebind_users_search();
				}
			};
		}
		view.find('.header').html(header);
		$('.loader').css('display','none');
		view.css('display','block');
	}
}

function view_hashtags(view,path_parts,query,title,back_to){
	view.data('hashtag','');
	view.data('hashtag-id',0);
	view.find('.tabs').html('');
	document.title=ltmp_arr.hashtags_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:back_to});
	if((typeof path_parts[1] != 'undefined')&&(''!=path_parts[1])){
		let hashtag=decodeURIComponent(path_parts[1]);
		idb_get_by_id('hashtags','tag',hashtag,function(hashtag_data){
			view.data('hashtag',hashtag);
			header+=ltmp(ltmp_arr.header_caption,{caption:'#'+uppercase_first_symbol(hashtag)});
			if(false===hashtag_data){
				view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.hashtags_not_found}));
			}
			else{
				document.title='#'+uppercase_first_symbol(hashtag)+' - '+document.title;
				view.data('hashtag-id',hashtag_data.id);
				header+=ltmp(ltmp_arr.icon_link,{action:'pin-hashtags',caption:ltmp_arr.pin_hashtags_caption,icon:ltmp_arr.icon_pin,addon:(1==hashtag_data.status?' positive':'')});
				header+=ltmp(ltmp_arr.icon_link,{action:'ignore-hashtags',caption:ltmp_arr.ignore_hashtags_caption,icon:ltmp_arr.icon_eye_ignore,addon:(2==hashtag_data.status?' negative':'')});
				header+=ltmp(ltmp_arr.icon_link,{action:'clear-hashtags',caption:ltmp_arr.clear_hashtags_caption,icon:ltmp_arr.icon_message_clear});

				view.find('.objects').html(ltmp(ltmp_arr.hashtags_loader_notice,{tag_id:hashtag_data.id,id:0}));
			}
			view.find('.header').html(header);
			$('.loader').css('display','none');
			view.css('display','block');
			check_load_more();
		});
	}
	else{
		header+=ltmp(ltmp_arr.header_caption,{caption:ltmp_arr.hashtags_caption});
		view.find('.header').html(header);

		let current_tab='main';
		console.log(query);
		if((typeof query != 'undefined')&&(''!=query)){
			current_tab=query;
		}
		if('main'!=current_tab){
			document.title=ltmp_arr['hashtags_'+current_tab+'_tab']+' - '+document.title;
		}

		let tabs='';
		tabs+=ltmp(ltmp_arr.tab,{link:'dapp:hashtags?main',class:('main'==current_tab?'current':''),caption:ltmp_arr.hashtags_main_tab});
		tabs+=ltmp(ltmp_arr.tab,{link:'dapp:hashtags?pinned',class:('pinned'==current_tab?'current':''),caption:ltmp_arr.hashtags_pinned_tab});
		tabs+=ltmp(ltmp_arr.tab,{link:'dapp:hashtags?ignored',class:('ignored'==current_tab?'current':''),caption:ltmp_arr.hashtags_ignored_tab});
		view.find('.tabs').html(tabs);
		view.find('.objects').html(ltmp_arr.empty_loader_notice);
		if('main'==current_tab){
			let read_t=db.transaction(['hashtags'],'readonly');
			let read_q=read_t.objectStore('hashtags');
			let req=read_q.index('count').openCursor(null,'prev');
			let find=false;
			let objects='';
			let num=1;
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					let hashtag_data=cur.value;
					find=true;
					objects+=ltmp(ltmp_arr.hashtags_objects_item,{num:num,tag:hashtag_data.tag,count:hashtag_data.count});
					num++;
					cur.continue();
				}
				else{
					if(find){
						objects=ltmp_arr.hashtags_objects_header+objects;
						view.find('.objects').html(objects);
					}
					else{
						view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.hashtags_not_found}));
					}
					$('.loader').css('display','none');
					view.css('display','block');
				}
			};
		}
		else
		if('pinned'==current_tab){
			let pin_top='<a class="pin-hashtag-to-top-action">&uarr;</a>';
			let read_t=db.transaction(['hashtags'],'readonly');
			let read_q=read_t.objectStore('hashtags');
			let req=read_q.index('pinned_order').openCursor(IDBKeyRange.lowerBound([1,0]),'next');
			let find=false;
			let cursor_end=false;
			let objects='';
			let num=1;
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cursor_end){
					cur=false;
				}
				if(cur){
					if(1==cur.value.status){//pinned
						let hashtag_data=cur.value;
						objects+=ltmp(ltmp_arr.hashtags_objects_item,{num:num,tag:hashtag_data.tag,count:hashtag_data.count,addon:(find?pin_top:''/*not for first*/),id:hashtag_data.id});
						find=true;
						num++;
					}
					else{
						cursor_end=true;
					}
					cur.continue();
				}
				else{
					if(find){
						objects=ltmp_arr.hashtags_objects_header+objects;
						view.find('.objects').html(objects);
					}
					else{
						view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.hashtags_not_found}));
					}
					$('.loader').css('display','none');
					view.css('display','block');
				}
			};
		}
		else
		if('ignored'==current_tab){
			let read_t=db.transaction(['hashtags'],'readonly');
			let read_q=read_t.objectStore('hashtags');
			let req=read_q.index('pinned_order').openCursor(IDBKeyRange.upperBound([2,Number.MAX_SAFE_INTEGER]),'prev');
			let find=false;
			let cursor_end=false;
			let objects='';
			let num=1;
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cursor_end){
					cur=false;
				}
				if(cur){
					if(2==cur.value.status){//ignored
						let hashtag_data=cur.value;
						find=true;
						objects+=ltmp(ltmp_arr.hashtags_objects_item,{num:num,tag:hashtag_data.tag,count:hashtag_data.count});
						num++;
					}
					else{
						cursor_end=true;
					}
					cur.continue();
				}
				else{
					if(find){
						objects=ltmp_arr.hashtags_objects_header+objects;
						view.find('.objects').html(objects);
					}
					else{
						view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.hashtags_not_found}));
					}
					$('.loader').css('display','none');
					view.css('display','block');
				}
			};
		}
		else{
			view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.hashtags_not_found}));
			$('.loader').css('display','none');
			view.css('display','block');
		}
	}
}

function view_awards(view,path_parts,query,title){
	document.title=ltmp_arr.awards_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:''});
	header+=ltmp(ltmp_arr.header_caption,{caption:ltmp_arr.awards_caption});

	header+=ltmp(ltmp_arr.icon_link,{action:'clear-awards',caption:ltmp_arr.clear_awards_caption,icon:ltmp_arr.icon_message_clear});

	view.find('.header').html(header);
	view.find('.objects').html(ltmp(ltmp_arr.awards_loader_notice,{id:0}));

	$('.loader').css('display','none');
	view.css('display','block');
	check_load_more();
}

function view_app_settings(view,path_parts,query,title){
	document.title=ltmp_arr.app_settings_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:''});
	header+=ltmp(ltmp_arr.header_caption,{caption:ltmp_arr.app_settings_caption});
	view.find('.header').html(header);

	let current_tab='main';
	if((typeof path_parts[1] != 'undefined')&&(''!=path_parts[1])){
		current_tab=path_parts[1];
	}
	if('main'!=current_tab){
		document.title=ltmp_arr['app_settings_'+current_tab+'_tab']+' - '+document.title;
	}

	let tabs='';
	tabs+=ltmp(ltmp_arr.tab,{link:'dapp:app_settings/main',class:('main'==current_tab?'current':''),caption:ltmp_arr.app_settings_main_tab});
	tabs+=ltmp(ltmp_arr.tab,{link:'dapp:app_settings/feed',class:('feed'==current_tab?'current':''),caption:ltmp_arr.app_settings_feed_tab});
	tabs+=ltmp(ltmp_arr.tab,{link:'dapp:app_settings/theme',class:('theme'==current_tab?'current':''),caption:ltmp_arr.app_settings_theme_tab});
	tabs+=ltmp(ltmp_arr.tab,{link:'dapp:app_settings/sync',class:('sync'==current_tab?'current':''),caption:ltmp_arr.app_settings_sync_tab});
	view.find('.tabs').html(tabs);

	view.find('.content-view').css('display','none');
	view.find('.content-view[data-tab="'+current_tab+'"]').css('display','block');

	let tab=view.find('.content-view[data-tab="'+current_tab+'"]');
	if('main'==current_tab){
		tab.find('.button').removeClass('disabled');
		tab.find('.submit-button-ring').removeClass('show');
		tab.find('.error').html('');
		tab.find('.success').html('');

		tab.find('input').val('');

		tab.find('input[name="activity_size"]').val(settings.activity_size);
		tab.find('input[name="activity_period"]').val(settings.activity_period);
		tab.find('input[name="activity_deep"]').val(settings.activity_deep);
		tab.find('input[name="user_profile_ttl"]').val(settings.user_profile_ttl);
		tab.find('input[name="user_cache_ttl"]').val(settings.user_cache_ttl);
		tab.find('input[name="object_cache_ttl"]').val(settings.object_cache_ttl);
		tab.find('input[name="preview_cache_ttl"]').val(settings.preview_cache_ttl);

		tab.find('input[name="energy"]').val(settings.energy/100);
		$('input[name="silent_award"]').prop("checked",settings.silent_award);
	}
	if('feed'==current_tab){
		tab.find('.button').removeClass('disabled');
		tab.find('.submit-button-ring').removeClass('show');
		tab.find('.error').html('');
		tab.find('.success').html('');

		$('input[type="checkbox"]').prop("checked",false)

		tab.find('input[name="feed_size"]').val(settings.feed_size);
		$('input[name="feed_subscribe_text"]').prop("checked",settings.feed_subscribe_text);
		$('input[name="feed_subscribe_replies"]').prop("checked",settings.feed_subscribe_replies);
		$('input[name="feed_subscribe_shares"]').prop("checked",settings.feed_subscribe_shares);
		$('input[name="feed_subscribe_mentions"]').prop("checked",settings.feed_subscribe_mentions);

		//$('input[name="feed_load_by_timer"]').prop("checked",settings.feed_load_by_timer);
		//$('input[name="feed_load_by_surf"]').prop("checked",settings.feed_load_by_surf);
	}
	if('theme'==current_tab){
		tab.find('.button').removeClass('disabled');
		tab.find('.submit-button-ring').removeClass('show');
		tab.find('.error').html('');
		tab.find('.success').html('');

		tab.find('input[type="radio"]').prop("checked",false)

		tab.find('input[name="theme-auto-light"]').val(settings.theme_auto_light);
		tab.find('input[name="theme-auto-night"]').val(settings.theme_auto_night);

		tab.find('input[name="theme-mode"][value="'+settings.theme_mode+'"]').prop("checked",true);
		tab.find('input[name="theme-night-mode"][value="'+settings.theme_night_mode+'"]').prop("checked",true);

		tab.find('input[name="theme-night-mode"]').off('change');
		tab.find('input[name="theme-night-mode"]').on('change',function(){
			settings.theme_night_mode=this.value;
			let settings_json=JSON.stringify(settings);
			localStorage.setItem(storage_prefix+'settings',settings_json);

			apply_theme_mode();
		});

		tab.find('input[name="theme-mode"]').off('change');
		tab.find('input[name="theme-mode"]').on('change',function(){
			settings.theme_mode=this.value;
			let settings_json=JSON.stringify(settings);
			localStorage.setItem(storage_prefix+'settings',settings_json);

			apply_theme_mode();
		});
	}
	if('sync'==current_tab){
		tab.find('.button').removeClass('disabled');
		tab.find('.submit-button-ring').removeClass('show');
		tab.find('.error').html('');
		tab.find('.success').html('');

		tab.find('input[name="sync-size"]').val(settings.sync_size);

		tab.find('input[name="sync-cloud"]').prop("checked",settings.sync_cloud);
		tab.find('input[name="sync-users"]').prop("checked",settings.sync_users);
		tab.find('input[name="sync-feed"]').prop("checked",settings.sync_feed);
		tab.find('input[name="sync-replies"]').prop("checked",settings.sync_replies);
		tab.find('input[name="sync-hashtags"]').prop("checked",settings.sync_hashtags);
		tab.find('input[name="sync-awards"]').prop("checked",settings.sync_awards);
		tab.find('input[name="sync-settings"]').prop("checked",settings.sync_settings);

		tab.find('input[name="sync-size"]').off('input');
		tab.find('input[name="sync-size"]').on('input',function(){
			if(!isNaN(parseInt(this.value))){
				settings.sync_size=parseInt(this.value);
			}
			else{
				settings.sync_size=0;
			}
			this.value=settings.sync_size;
			let settings_json=JSON.stringify(settings);
			localStorage.setItem(storage_prefix+'settings',settings_json);
		});

		tab.find('input[name="sync-cloud"]').off('change');
		tab.find('input[name="sync-cloud"]').on('change',function(){
			settings.sync_cloud=$(this).prop('checked');
			let settings_json=JSON.stringify(settings);
			localStorage.setItem(storage_prefix+'settings',settings_json);
		});

		tab.find('input[name="sync-users"]').off('change');
		tab.find('input[name="sync-users"]').on('change',function(){
			settings.sync_users=$(this).prop('checked');
			let settings_json=JSON.stringify(settings);
			localStorage.setItem(storage_prefix+'settings',settings_json);
		});

		tab.find('input[name="sync-feed"]').off('change');
		tab.find('input[name="sync-feed"]').on('change',function(){
			settings.sync_feed=$(this).prop('checked');
			let settings_json=JSON.stringify(settings);
			localStorage.setItem(storage_prefix+'settings',settings_json);
		});

		tab.find('input[name="sync-replies"]').off('change');
		tab.find('input[name="sync-replies"]').on('change',function(){
			settings.sync_replies=$(this).prop('checked');
			let settings_json=JSON.stringify(settings);
			localStorage.setItem(storage_prefix+'settings',settings_json);
		});

		tab.find('input[name="sync-hashtags"]').off('change');
		tab.find('input[name="sync-hashtags"]').on('change',function(){
			settings.sync_hashtags=$(this).prop('checked');
			let settings_json=JSON.stringify(settings);
			localStorage.setItem(storage_prefix+'settings',settings_json);
		});

		tab.find('input[name="sync-awards"]').off('change');
		tab.find('input[name="sync-awards"]').on('change',function(){
			settings.sync_awards=$(this).prop('checked');
			let settings_json=JSON.stringify(settings);
			localStorage.setItem(storage_prefix+'settings',settings_json);
		});

		tab.find('input[name="sync-settings"]').off('change');
		tab.find('input[name="sync-settings"]').on('change',function(){
			settings.sync_settings=$(this).prop('checked');
			let settings_json=JSON.stringify(settings);
			localStorage.setItem(storage_prefix+'settings',settings_json);
		});
	}

	$('.loader').css('display','none');
	view.css('display','block');
}

var apply_theme_mode_timer=0;
function apply_theme_mode(){
	$('body').removeClass('light');
	$('body').removeClass('midnight');
	$('body').removeClass('dark');
	let mode=settings.theme_mode;
	if('auto'==mode){
		let h=new Date().getHours();
		let m=new Date().getMinutes();
		let auto_light=settings.theme_auto_light.split(':');
		let auto_night=settings.theme_auto_night.split(':');
		mode='night';
		if(h>=parseInt(auto_light[0])){
			if(h==parseInt(auto_light[0])){
				if(m>=parseInt(auto_light[1])){
					mode='light';
				}
			}
			else{
				mode='light';
			}
		}
		if(h>=parseInt(auto_night[0])){
			if(h==parseInt(auto_night[0])){
				if(m>=parseInt(auto_night[1])){
					mode='night';
				}
			}
			else{
				mode='night';
			}
		}
	}
	if('light'==mode){
		$('body').addClass(mode);
		$('.toggle-theme-icon').html(ltmp_arr.icon_theme_sun);
	}
	else{
		$('body').addClass(settings.theme_night_mode);
		$('.toggle-theme-icon').html(ltmp_arr.icon_theme_moon);
	}
	clearTimeout(apply_theme_mode_timer);
	apply_theme_mode_timer=setTimeout(function(){apply_theme_mode();},60000);
}

function view_account_settings(view,path_parts,query,title){
	document.title=ltmp_arr.account_settings_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:''});
	header+=ltmp(ltmp_arr.header_caption,{caption:ltmp_arr.account_settings_caption});
	view.find('.header').html(header);

	view.find('.button').removeClass('disabled');
	view.find('.submit-button-ring').removeClass('show');
	view.find('.error').html('');
	view.find('.success').html('');

	view.find('input').val('');

	if(''!=current_user){
		view.find('input[name=viz_account]').val(current_user);
		if(typeof users[current_user] !== 'undefined'){
			if(typeof users[current_user].regular_key !== 'undefined'){
				view.find('input[name=viz_regular_key]').val(users[current_user].regular_key);
			}
			else{
				view.find('.error').html(ltmp_arr.account_settings_empty_regular_key);
				view.find('.error').css('color','red');
			}
		}
		else{
			view.find('.error').html(ltmp_arr.account_settings_empty_regular_key);
			view.find('.error').css('color','red');
		}
	}

	$('.loader').css('display','none');
	view.css('display','block');
}

function app_keyboard(e){
	if(!e)e=window.event;
	var key=(e.charCode)?e.charCode:((e.keyCode)?e.keyCode:((e.which)?e.which:0));
	let char=String.fromCharCode(key);
	if(key==13){//enter
		e.preventDefault();
		if($(document.activeElement).hasClass('header-link')){
			let search=$(document.activeElement).val();
			search=search.trim();
			if(''!=search){
				if(-1!=search.indexOf('viz://')){
					view_path(search,{},true,false);
				}
				else{
					if('@'==search.substring(0,1)){
						search=search.substring(1);
					}
					view_path('viz://@'+search+'/',{},true,false);
				}
			}
			else{
				view_path('viz://',{},true,false);
			}
		}
		else{
			document.activeElement.click();
		}
	}
	if(key==32){//space
		e.preventDefault();
		document.activeElement.click();
	}
	//console.log(key,char);
	/*
	if(key==27){
		e.preventDefault();
	}
	*/
}

function parse_fullpath(){
	let fullpath=window.location.hash.substr(1);
	path='';
	query='';
	if(-1==fullpath.indexOf('?')){
		path=fullpath;
	}
	else{
		path=fullpath.substring(0,fullpath.indexOf('?'));
		query=fullpath.substring(fullpath.indexOf('?')+1);
	}
	if(''==path){
		path='viz://';
	}
}

var path_parts;
var check_account='';

var mobile_hide_menu_timer=0;
function view_path(location,state,save_state,update){
	if('dapp:publish/'==path){//exit from publish view
		if('article'==query){//exit from article mode
			document.removeEventListener('selectionchange',editor_selection);
		}
	}
	if(is_mobile()){
		clearTimeout(mobile_hide_menu_timer);
		mobile_hide_menu_timer=setTimeout(function(){
			$('body').removeClass('noscroll');
			$('div.menu').removeClass('show');
			ignore_resize=false;
		},500);
	}
	//save to history browser
	save_state=typeof save_state==='undefined'?false:save_state;
	//update current level? not work now
	update=typeof update==='undefined'?false:update;
	path_parts=[];
	var title=whitelabel_app_title;
	let back_to='';

	if(typeof state.back !== 'undefined'){
		back_to=state.back;
	}

	if(typeof state.path == 'undefined'){
		//check query state
		if(-1!=location.indexOf('?')){
			query=location.substring(location.indexOf('?')+1);
			location=location.substring(0,location.indexOf('?'));
		}
		else{
			query='';
			if(typeof state.query !== 'undefined'){
				if(''!=state.query){
					query=state.query;
				}
			}
		}
		if('/'!=location.substr(-1)){
			location+='/';
		}
		if(-1!=location.indexOf('viz://')){
			path=location;
			path_parts=location.substr(location.indexOf('viz://')+6).split('/');
		}
		else{
			path=location;
			path_parts=location.split('/');
		}
	}
	else{
		path_parts=state.path;
	}

	//work with path_parts, form new view or update current
	//clearTimeout(update_dgp_timer);
	//$('.view').css('display','none');

	if(save_state){
		history.pushState({path,title},'','#'+location+(''!=query?'?'+query:''));
	}

	document.title=title;

	console.log('location: '+location,path_parts,'query: '+query,'update: '+update);
	$('div.menu .primary div a').removeClass('current');
	if(0<$('div.menu .primary div a[data-href="'+path_parts[0]+'"]').length){
		$('div.menu .primary div a[data-href="'+path_parts[0]+'"]').addClass('current');
	}
	else{
		$('div.menu .primary div a[data-href="'+location+'"]').addClass('current');
	}

	if(''==path_parts[0]){//main page (feed)
		$('.loader').css('display','block');
		$('.view').css('display','none');
		$('.view').each(function(i,el){
			if(typeof $(el).data('level')!=='undefined'){
				if(0!=$(el).data('level')){
					$(el).remove();//remove other levels
				}
			}
		});
		let view=$('.view[data-level="0"]');
		let header='';
		header+=ltmp(ltmp_arr.toggle_menu,{title:ltmp_arr.toggle_menu_title,icon:ltmp_arr.icon_menu});
		header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp_arr.header_link_icons});
		view.find('.header').html(header);
		if(0<view.find('.fast-publish-wrapper').length){
			view.find('.fast-publish-wrapper textarea').val('');
			view.find('.fast-publish-wrapper .button').removeClass('disabled');
		}
		else{
			if(''!=current_user){
				view.find('.objects').before(ltmp(ltmp_arr.fast_publish,{
					avatar:safe_avatar(user_profile.avatar),
					attach:ltmp_arr.icon_attach,
					placeholder:ltmp_arr.fast_publish_feed,
					button:ltmp_arr.fast_publish_button,
				}));
			}
		}
		let clear=view.data('clear');
		if(clear){
			update=true;
			view.data('clear',false);
		}
		if(update){
			view.find('.objects').html(ltmp(ltmp_arr.new_objects+ltmp_arr.feed_loader_notice,{time:0}));
			$('.counter-feed').removeClass('show');
			$('.counter-feed').html('0');
		}
		path='viz://';
		level=0;
		$('.loader').css('display','none');
		view.css('display','block');
		if(!update){
			$(window)[0].scrollTo({top:(typeof view.data('scroll')!=='undefined'?view.data('scroll'):0)});
		}
		check_load_more();
	}
	else{
		if(0==path_parts[0].indexOf('dapp:')){//service page
			$('.loader').css('display','block');
			$('.view').css('display','none');
			let view=$('.view[data-path="'+path_parts[0]+'"]');
			level++;
			//view.data('level',level);
			//execute view_ function if exist to prepare page (load vars to input)
			let current_view=path_parts[0].substring(('dapp:').length);
			if(typeof window['view_'+current_view] === 'function'){
				setTimeout(window['view_'+current_view],1,view,path_parts,query,title,back_to);
			}
			else{
				$('.loader').css('display','none');
				view.css('display','block');
			}
		}
		else{//dynamic page
			if('@'==path_parts[0].substring(0,1)){//profile link
				check_account=path_parts[0].substring(1);
				check_account=check_account.toLowerCase();
				check_account=check_account.trim();
			}
			if(''==path_parts[1]){//profile page
				if('@'==path_parts[0].substring(0,1)){//check account link
					//preload account for view with +1 level
					get_user(check_account,false,function(err,result){
						if(err){
							console.log(err);
							document.title=ltmp_arr.error_title+' - '+title;
							$('.loader').css('display','block');
							$('.view').css('display','none');
							if(!update){
								level++;
								let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query,tabs:'',profile:''});
								$('.content').append(new_view);
							}
							let view=$('.view[data-level="'+level+'"]');
							let header='';
							header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:back_to});
							header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp_arr.header_link_icons});
							view.find('.header').html(header);
							view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.gateway_error}));
							$('.loader').css('display','none');
							view.css('display','block');
						}
						else{
							let profile=JSON.parse(result.profile);
							let profile_view='';
							let profile_found=false;
							let json_metadata={};
							let profile_contacts='';
							let pinned_link=false;

							if(typeof profile.nickname !== 'undefined'){
								document.title=profile.nickname+' (@'+result.account+') '+document.title;
							}
							else{
								document.title='@'+result.account+' - '+title;
							}

							if(typeof profile != 'undefined'){
								if(typeof profile.pinned != 'undefined'){
										pinned_link=profile.pinned;
								}
								if(typeof profile.about != 'undefined'){
									profile_view+=ltmp(ltmp_arr.profile_about,{about:profile.about});
									profile_found=true;
								}
								if(typeof profile.interests != 'undefined'){
									if(profile.interests.length>0){
										let interests_view='';
										for(let i in profile.interests){
											let interest_caption=profile.interests[i];
											if(interest_caption.length>0){
												let interest_hashtag=interest_caption.replace(' ','_').trim().toLowerCase();
												interests_view+=ltmp(ltmp_arr.profile_interests_item,{caption:interest_caption,hashtag:interest_hashtag});
											}
										}
										profile_view+=ltmp(ltmp_arr.profile_interests,{interests:interests_view});
										profile_found=true;
									}
								}
								if(typeof profile.github != 'undefined'){
									profile_contacts+=ltmp(ltmp_arr.profile_contacts_github,{github:profile.github,icon_github:ltmp_arr.icon_github});
									profile_found=true;
								}
								if(typeof profile.telegram != 'undefined'){
									profile_contacts+=ltmp(ltmp_arr.profile_contacts_telegram,{telegram:profile.telegram,icon_telegram:ltmp_arr.icon_telegram});
									profile_found=true;
								}
								if(''!=profile_contacts){
									profile_view+=ltmp(ltmp_arr.profile_contacts,{contacts:profile_contacts});
								}
							}
							let profile_section='';
							if(profile_found){
								profile_section=ltmp(ltmp_arr.profile,{profile:profile_view});
							}
							$('.loader').css('display','block');
							$('.view').css('display','none');
							let new_level=true;
							if(!update){
								if(level==0){
									new_level=true;
								}
								else{
									if(path!=$('.view[data-level="'+level+'"]').data('path')){
										new_level=true;
									}
									else{
										new_level=false;
									}
								}
							}
							else{
								//fix: update toggled, check the need for a new level (different path in rare conditions?)
								if(path!=$('.view[data-level="'+level+'"]').data('path')){
									new_level=true;
								}
								else{
									new_level=false;
								}
							}

							if(new_level){
								level++;
								let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query,tabs:ltmp(ltmp_arr.tabs),profile:profile_section});
								$('.content').append(new_view);
								update=true;
							}
							let view=$('.view[data-level="'+level+'"]');

							// Profile tabs
							let current_tab='main';
							if((typeof query != 'undefined')&&(''!=query)){
								current_tab=query;
							}
							let tabs='';
							tabs+=ltmp(ltmp_arr.tab,{link:path+'?main',class:('main'==current_tab?'current':''),caption:ltmp_arr.profile_main_tab});
							tabs+=ltmp(ltmp_arr.tab,{link:path+'?posts',class:('posts'==current_tab?'current':''),caption:ltmp_arr.profile_posts_tab});
							tabs+=ltmp(ltmp_arr.tab,{link:path+'?shares',class:('shares'==current_tab?'current':''),caption:ltmp_arr.profile_shares_tab});
							tabs+=ltmp(ltmp_arr.tab,{link:path+'?replies',class:('replies'==current_tab?'current':''),caption:ltmp_arr.profile_replies_tab});
							view.find('.tabs').html(tabs);
							if('main'!=current_tab){
								document.title=ltmp_arr['profile_'+current_tab+'_tab']+' - '+document.title;
							}
							view.data('profile',1);
							if(!new_level){
								view.data('query',query);
							}
							if(update){
								let header='';
								header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:back_to});
								header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp_arr.header_link_icons});
								if(check_account==current_user){
									header+=ltmp(ltmp_arr.edit_profile_link,{icon_edit_profile:ltmp_arr.icon_edit_profile});
									header+=ltmp(ltmp_arr.new_object_link,{icon_new_object:ltmp_arr.icon_new_object});
								}
								else{
									if(-1!=whitelabel_accounts.indexOf(check_account)){
									}
									else{
										header+=ltmp(ltmp_arr.user_actions_open,{user:check_account});
										if(1==result.status){
											header+=ltmp(ltmp_arr.subscribed_link,{icon:ltmp_arr.icon_subscribed});
											header+=ltmp(ltmp_arr.unsubscribe_link,{icon:ltmp_arr.icon_unsubscribe});
										}
										else
										if(2==result.status){
											header+=ltmp(ltmp_arr.ignored_link,{icon:ltmp_arr.icon_ignored});
											header+=ltmp(ltmp_arr.unignore_link,{icon:ltmp_arr.icon_unsubscribe});
										}
										else{
											header+=ltmp(ltmp_arr.subscribe_link,{icon:ltmp_arr.icon_subscribe});
											header+=ltmp(ltmp_arr.ignore_link,{icon:ltmp_arr.icon_ignore});
										}
										header+=ltmp_arr.user_actions_close;
									}
								}
								view.find('.header').html(header);
							}
							if(update){
								view.find('.objects').html(ltmp(ltmp_arr.loader_notice,{account:result.account,block:0}));
							}
							if('main'==current_tab){
								//pinned object from profile
								if(false!==pinned_link)
								if(0==pinned_link.indexOf('viz://')){
									let pinned_object_account='';
									let pinned_object_block=0;
									pinned_link=pinned_link.toLowerCase();
									pinned_link=escape_html(pinned_link);
									let pattern = /@[a-z0-9\-\.]*/g;
									let link_account=pinned_link.match(pattern);
									if(typeof link_account[0] != 'undefined'){
										pinned_object_account=link_account[0].substr(1);
										let pattern_block = /\/([0-9]*)\//g;
										let link_block=pinned_link.match(pattern_block);
										if(typeof link_block[1] != 'undefined'){
											pinned_object_block=parseInt(fast_str_replace('/','',link_block[1]));
											//remove existed pinned objects and prepend new render
											view.find('.objects .pinned-object').remove();
											setTimeout(function(){
												get_user(pinned_object_account,false,function(err,pinned_user_result){
													if(!err)
													get_object(pinned_object_account,pinned_object_block,function(err,pinned_object_result){
														if(!err){
															pinned_render=render_object(pinned_user_result,pinned_object_result,'pinned');
															view.find('.objects').prepend(pinned_render);
														}
													});
												});
											},10);

										}
									}
								}
							}
							$('.loader').css('display','none');
							view.css('display','block');
							if(!update){
								$(window)[0].scrollTo({top:(typeof view.data('scroll')!=='undefined'?view.data('scroll'):0)});
							}
							profile_filter_by_type();
						}
					});
				}
			}
			else{//object page
				if(''==path_parts[2]){//only block in path part
					let check_block=parseInt(path_parts[1]);
					if(isNaN(check_block)){
						level++;
						let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query,tabs:'',profile:''});
						$('.content').append(new_view);
						let view=$('.view[data-level="'+level+'"]');
						if(update){
							let header='';
							header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:back_to});
							header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp_arr.header_link_icons});
							view.find('.header').html(header);
						}
						view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.data_not_found}));
						$('.loader').css('display','none');
						view.css('display','block');
					}
					else{
						$('.loader').css('display','block');
						$('.view').css('display','none');
						get_user(check_account,false,function(err,user_result){
							if(err){
								console.log(err);
								document.title=ltmp_arr.error_title+' - '+title;
								$('.loader').css('display','block');
								$('.view').css('display','none');
								if(!update){
									level++;
									let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query,tabs:'',profile:''});
									$('.content').append(new_view);
								}
								let view=$('.view[data-level="'+level+'"]');
								let header='';
								header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:back_to});
								header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp_arr.header_link_icons});
								view.find('.header').html(header);
								view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.gateway_error}));

								$('.loader').css('display','none');
								view.css('display','block');
							}
							else{
								let profile=JSON.parse(user_result.profile);
								if(typeof profile.nickname !== 'undefined'){
									document.title=profile.nickname+' (@'+user_result.account+') '+document.title;
								}
								else{
									document.title='@'+user_result.account+' - '+title;
								}

								let new_level=true;
								if(!update){
									if(level==0){
										new_level=true;
									}
									else{
										if(path!=$('.view[data-level="'+level+'"]').data('path')){
											new_level=true;
										}
										else{
											new_level=false;
										}
									}
								}
								if(new_level){
									level++;
									let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query,tabs:'',profile:''});
									$('.content').append(new_view);
									update=true;
								}
								let view=$('.view[data-level="'+level+'"]');
								if(update){
									let header='';
									header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:back_to});
									header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp_arr.header_link_icons});
									view.find('.header').html(header);
								}
								if(update){
									//view.find('.objects').html(ltmp(ltmp_arr.loader_notice,{account:check_account,block:check_block}));
									view.find('.objects').html(ltmp_arr.empty_loader_notice);

									get_object(check_account,check_block,function(err,object_result){
										if(err){
											console.log('get_object error',check_account,offset,err,object_result);
											document.title=ltmp_arr.error_title+' - '+document.title;
											if(1==object_result){//block not found
												view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.block_not_found}));
											}
											if(2==object_result){//item not found
												view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.data_not_found}));
											}
											$('.loader').css('display','none');
											view.css('display','block');
										}
										else{
											document.title=check_block+' - '+document.title;
											let object_view=render_object(user_result,object_result);
											let link='viz://@'+user_result.account+'/'+object_result.block+'/';

											view.find('.objects').html(object_view);
											let timestamp=view.find('.object[data-link="'+link+'"] .date-view').data('timestamp');
											set_date_view(view.find('.object[data-link="'+link+'"] .date-view'),true);

											get_replies(user_result.account,object_result.block,function(err,replies_result){
												for(let i in replies_result){
													let reply_object=replies_result[i];
													let reply_link='viz://@'+reply_object.account+'/'+reply_object.block+'/';
													reply_render=render_object(reply_object.account,reply_object.block,'reply');
													view.find('.objects').append(reply_render);
												}
											});

											$('.loader').css('display','none');
											view.css('display','block');
											check_load_more();
										}
									});
								}
								else{
									$('.loader').css('display','none');
									view.css('display','block');
									$(window)[0].scrollTo({top:(typeof view.data('scroll')!=='undefined'?view.data('scroll'):0)});
									check_load_more();
								}
							}
						});
					}
				}
				else
				if('publication'==path_parts[2]){
					let check_block=parseInt(path_parts[1]);
					if(isNaN(check_block)){
						level++;
						let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query,tabs:'',profile:''});
						$('.content').append(new_view);
						let view=$('.view[data-level="'+level+'"]');
						if(update){
							let header='';
							header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:back_to});
							header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp_arr.header_link_icons});
							view.find('.header').html(header);
						}
						view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.data_not_found}));
						$('.loader').css('display','none');
						view.css('display','block');
					}
					else{
						$('.loader').css('display','block');
						$('.view').css('display','none');
						get_user(check_account,false,function(err,user_result){
							if(err){
								console.log(err);
								document.title=ltmp_arr.error_title+' - '+title;
								$('.loader').css('display','block');
								$('.view').css('display','none');
								if(!update){
									level++;
									let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query,tabs:'',profile:''});
									$('.content').append(new_view);
								}
								let view=$('.view[data-level="'+level+'"]');
								let header='';
								header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:back_to});
								header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp_arr.header_link_icons});
								view.find('.header').html(header);
								view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.gateway_error}));

								$('.loader').css('display','none');
								view.css('display','block');
							}
							else{
								let profile=JSON.parse(user_result.profile);
								if(typeof profile.nickname !== 'undefined'){
									document.title=profile.nickname+' (@'+user_result.account+') '+document.title;
								}
								else{
									document.title='@'+user_result.account+' - '+title;
								}

								let new_level=true;
								if(!update){
									if(level==0){
										new_level=true;
									}
									else{
										if(path!=$('.view[data-level="'+level+'"]').data('path')){
											new_level=true;
										}
										else{
											new_level=false;
										}
									}
								}
								if(new_level){
									level++;
									let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query,tabs:'',profile:''});
									$('.content').append(new_view);
									update=true;
								}
								let view=$('.view[data-level="'+level+'"]');
								if(update){
									let header='';
									header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:back_to});
									header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp_arr.header_link_icons});
									view.find('.header').html(header);
								}
								if(update){
									//view.find('.objects').html(ltmp(ltmp_arr.loader_notice,{account:check_account,block:check_block}));
									view.find('.objects').html(ltmp_arr.empty_loader_notice);

									get_object(check_account,check_block,function(err,object_result){
										if(err){
											console.log('get_object error',check_account,offset,err,object_result);
											document.title=ltmp_arr.error_title+' - '+document.title;
											if(1==object_result){//block not found
												view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.block_not_found}));
											}
											if(2==object_result){//item not found
												view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.data_not_found}));
											}
											$('.loader').css('display','none');
											view.css('display','block');
										}
										else{
											document.title=check_block+' - '+document.title;
											let object_view=render_object(user_result,object_result,'publication');
											let link='viz://@'+user_result.account+'/'+object_result.block+'/';

											view.find('.objects').html(object_view);
											let timestamp=view.find('.object[data-link="'+link+'"] .date-view').data('timestamp');
											set_date_view(view.find('.object[data-link="'+link+'"] .date-view'),true);

											get_replies(user_result.account,object_result.block,function(err,replies_result){
												for(let i in replies_result){
													let reply_object=replies_result[i];
													let reply_link='viz://@'+reply_object.account+'/'+reply_object.block+'/';
													reply_render=render_object(reply_object.account,reply_object.block,'reply');
													view.find('.objects').append(reply_render);
												}
											});

											$('.loader').css('display','none');
											view.css('display','block');
											check_load_more();
										}
									});
								}
								else{
									$('.loader').css('display','none');
									view.css('display','block');
									$(window)[0].scrollTo({top:(typeof view.data('scroll')!=='undefined'?view.data('scroll'):0)});
									check_load_more();
								}
							}
						});
					}
					/*
					$('.loader').css('display','block');
					$('.view').css('display','none');
					level++;
					let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query});
					$('.content').append(new_view);
					let view=$('.view[data-level="'+level+'"]');
					let header='';
					header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:back_to});
					header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp_arr.header_link_icons});
					view.find('.header').html(header);
					view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.data_not_found}));

					$('.loader').css('display','none');
					view.css('display','block');
					*/
				}
				else{//additional part in path not supported
					$('.loader').css('display','block');
					$('.view').css('display','none');
					level++;
					let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query});
					$('.content').append(new_view);
					let view=$('.view[data-level="'+level+'"]');
					let header='';
					header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:back_to});
					header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp_arr.header_link_icons});
					view.find('.header').html(header);
					view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.data_not_found}));

					$('.loader').css('display','none');
					view.css('display','block');
				}
			}
		}
	}
}

function lang_plural(lang,number){
	if('ru'==lang){
		let n=Math.abs(number);
		n%=100;
		if(n >= 5 && n <= 20) {
			return 5;
		}
		n%=10;
		if(n===1){
			return 1;
		}
		if(n>=2 && n<=4){
			return 2;
		}
		return 5;
	}
	if('en'==lang){
		if(1==number){
			return 1;
		}
		return 2;
	}
}

function set_date_view(el,full){
	full=typeof full==='undefined'?false:full;
	let current_date=new Date();
	let current_year=current_date.getFullYear();
	let current_date_str=current_date.getDate()+'.'+(1+current_date.getMonth())+'.'+current_year;

	let timestamp=$(el).data('timestamp');
	let date=new Date(timestamp*1000 - timezone_offset());

	let day=date.getDate();
	let month=date.getMonth()+1;
	let year=date.getFullYear();
	let check_date=day+'.'+month+'.'+year;
	let hours=date.getHours();
	let minutes=date.getMinutes();
	let times_am=false;
	if(hours<12){
		times_am=true;
		if(''!=ltmp_arr.date.times_pm){
			if(0==hours){
				hours=12;
			}
		}
	}

	let time_str=ltmp(ltmp_arr.date.time_format,{hour:hours,min:minutes,times:(times_am?ltmp_arr.date.times_am:ltmp_arr.date.times_pm)});
	let date_str=ltmp(ltmp_arr.date.date_format,{day:day,short_month:ltmp_arr.date.short_month[month]});
	let date_str_with_year=date_str+ltmp(ltmp_arr.date.year,{year:year});
	if(current_year!=year){
		date_str=date_str_with_year;
	}
	let full_date_str=ltmp(ltmp_arr.date.full_format,{time:time_str,date:date_str_with_year});
	if(full){
		$(el).html(full_date_str);
	}
	else{
		let view_str=date_str;
		let aria_str=date_str;
		if(check_date==current_date_str){
			view_str=ltmp_arr.date.now;
			aria_str=ltmp_arr.date.now;
			let pass=(current_date.getTime() - date.getTime())/1000 | 0;
			if(pass>=60){
				let passed_minutes=pass/60 | 0;
				let passed_hours=0;
				if(passed_minutes>=60){
					passed_hours=passed_minutes/60 | 0;
				}
				if(passed_hours>0){
					view_str=ltmp(ltmp_arr.date.passed_hours,{hours:passed_hours});
					aria_str=ltmp(ltmp_arr.date.aria_passed,{number:passed_hours,plural:ltmp_arr.plural.hours[lang_plural(selected_lang,passed_hours)]});
				}
				else{
					view_str=ltmp(ltmp_arr.date.passed_minutes,{minutes:passed_minutes});
					aria_str=ltmp(ltmp_arr.date.aria_passed,{number:passed_minutes,plural:ltmp_arr.plural.minutes[lang_plural(selected_lang,passed_minutes)]});
				}
			}
		}
		$(el).attr('title',full_date_str);
		$(el).attr('aria-label',aria_str);
		$(el).attr('dir','auto');
		$(el).attr('role','link');
		$(el).data('focusable',true);
		$(el).html(view_str);
	}
}
function update_short_date(el){
	el=typeof el==='undefined'?false:el;

	if(false===el){
		let view=$('.view[data-level="'+level+'"]');
		if(-1==path.indexOf('viz://')){//look in services views
			let path_parts=path.split('/');
			view=$('.view[data-path="'+path_parts[0]+'"]');
		}
		console.log('update_short_date for view',view);
		view.find('.short-date-view').each(function(i,el){
			set_date_view(el)
		});
	}
	else{
		console.log('update_short_date for el',el);
		set_date_view(el)
	}
}
function timezone_offset(){
	return new Date().getTimezoneOffset()*60000;
}

function parse_date(str){
	var a = str.split(/[^0-9]/).map(s=>parseInt(s));
	return new Date(a[0], a[1]-1 || 0, a[2] || 1, a[3] || 0, a[4] || 0, a[5] || 0, a[6] || 0);
}

function show_time(str,add_seconds){
	str=typeof str==='undefined'?false:str;
	add_seconds=typeof add_seconds==='undefined'?false:add_seconds;
	var str_date;
	if(!str){
		str_date=new Date();
	}
	else{
		let str_time=0;
		if(str==parseInt(str)){
			str_time=str;
		}
		else{
			str_time=parse_date(str);
		}
		str_date=new Date(str_time);
	}
	var minutes=str_date.getMinutes();
	if(minutes<10){
		minutes='0'+minutes;
	}
	var hours=str_date.getHours();
	if(hours<10){
		hours='0'+hours;
	}
	var seconds=str_date.getSeconds();
	if(seconds<10){
		seconds='0'+seconds;
	}
	var datetime_str=hours+':'+minutes;
	if(add_seconds){
		datetime_str=datetime_str+':'+seconds;
	}
	return datetime_str;
}

function show_date(str,add_time,add_seconds,remove_today){
	str=typeof str==='undefined'?false:str;
	add_time=typeof add_time==='undefined'?false:add_time;
	add_seconds=typeof add_seconds==='undefined'?false:add_seconds;
	remove_today=typeof remove_today==='undefined'?false:remove_today;
	var str_date;
	if(!str){
		str_date=new Date();
	}
	else{
		let str_time=0;
		if(str==parseInt(str)){
			str_time=str;
		}
		else{
			str_time=parse_date(str);
		}
		str_date=new Date(str_time);
	}
	var day=str_date.getDate();
	if(day<10){
		day='0'+day;
	}
	var month=str_date.getMonth()+1;
	if(month<10){
		month='0'+month;
	}
	var minutes=str_date.getMinutes();
	if(minutes<10){
		minutes='0'+minutes;
	}
	var hours=str_date.getHours();
	if(hours<10){
		hours='0'+hours;
	}
	var seconds=str_date.getSeconds();
	if(seconds<10){
		seconds='0'+seconds;
	}
	var datetime_str=day+'.'+month+'.'+str_date.getFullYear();
	if(add_time){
		datetime_str=datetime_str+' '+hours+':'+minutes;
		if(add_seconds){
			datetime_str=datetime_str+':'+seconds;
		}
	}
	if(remove_today){
		datetime_str=fast_str_replace(show_date()+' ','',datetime_str);
	}
	return datetime_str;
}

function fast_str_replace(search,replace,str){
	return str.split(search).join(replace);
}

function escape_html(text) {
	var map = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;'
	};
	return text.replace(/[&<>"']/g,function(m){return map[m];});
}

function sort_by_length_asc(a,b){
	return a.length - b.length;
}
function sort_by_length_desc(a,b){
	return b.length - a.length;
}
function array_unique(arr) {
	var seen = {};
	return arr.filter(function(item,pos) {
		return arr.indexOf(item) == pos;
	});
}

function highlight_links(text){
	console.log(text);
	let summary_links=[];
	let num=0;

	let summary_mnemonics=[];
	let mnemonics_num=0;

	let mnemonics_pattern = /&#[a-z0-9\-\.]+;/g;
	let mnemonics_arr=text.match(mnemonics_pattern);
	if(null!=mnemonics_arr){
		for(let i in mnemonics_arr){
			if(1<mnemonics_arr[i].length){
				summary_mnemonics[mnemonics_num]=mnemonics_arr[i];
				mnemonics_num++;
			}
		}
	}

	summary_mnemonics=array_unique(summary_mnemonics);
	summary_mnemonics.sort(sort_by_length_desc);

	for(let i in summary_mnemonics){
		text=fast_str_replace(summary_mnemonics[i],'<REPLACE_MNEMONIC_'+i+'>',text);
	}

	let account_pattern = /@[a-z0-9\-\.]+/g;
	let account_links=text.match(account_pattern);
	if(null!=account_links){
		for(let i in account_links){
			if(1<account_links[i].length){
				summary_links[num]=account_links[i];
				num++;
			}
		}
	}

	let viz_protocol_pattern = /viz\:\/\/[@a-z0-9\-\.\/]+/g;
	let viz_protocol_links=text.match(viz_protocol_pattern);
	if(null!=viz_protocol_links){
		for(let i in viz_protocol_links){
			if(6<viz_protocol_links[i].length){
				summary_links[num]=viz_protocol_links[i];
				num++;
			}
		}
	}

	let sia_protocol_pattern = /sia\:\/\/[A-Za-z0-9_\-\.\/]+/g;
	let sia_protocol_links=text.match(sia_protocol_pattern);
	if(null!=sia_protocol_links){
		for(let i in sia_protocol_links){
			if(6<sia_protocol_links[i].length){
				summary_links[num]=sia_protocol_links[i];
				num++;
			}
		}
	}

	let ipfs_protocol_pattern = /ipfs\:\/\/[A-Za-z0-9_\-\.\/]+/g;
	let ipfs_protocol_links=text.match(ipfs_protocol_pattern);
	if(null!=ipfs_protocol_links){
		for(let i in ipfs_protocol_links){
			if(7<ipfs_protocol_links[i].length){
				summary_links[num]=ipfs_protocol_links[i];
				num++;
			}
		}
	}

	//let http_protocol_pattern = /(http|https)\:\/\/[@A-Za-z0-9\-_\.\/#]*/g;//first version
	//add \u0400-\u04FF for cyrillic https://jrgraphix.net/r/Unicode/0400-04FF
	let http_protocol_pattern = /((?:https?|ftp):\/\/[\u0400-\u04FF\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\u0400-\u04FF\-A-Z0-9+\u0026@#\/%=~()_|])/gi;
	let http_protocol_links=text.match(http_protocol_pattern);
	if(null!=http_protocol_links){
		for(let i in http_protocol_links){
			summary_links[num]=http_protocol_links[i];
			num++;
		}
	}

	//hashtags highlights after links for avoid conflicts with url with hashes (not necessary, because array sorted by length)
	let hashtags_pattern = /(|\b)#([^@#!.,?\r\n\t <>()\[\]]+)(|\b)/g;
	let hashtags_links=text.match(hashtags_pattern);
	if(null!=hashtags_links){
		for(let i in hashtags_links){
			if(1<hashtags_links[i].length){
				summary_links[num]=hashtags_links[i];
				num++;
			}
		}
	}

	summary_links=array_unique(summary_links);
	summary_links.sort(sort_by_length_desc);

	for(let i in summary_links){
		text=fast_str_replace(summary_links[i],'<REPLACE_LINK_'+i+'>',text);
	}

	for(let i in summary_links){
		let change_text=summary_links[i];
		let new_text=change_text;
		if('#'==change_text.substring(0,1)){
			new_text='<a tabindex="0" data-href="dapp:hashtags/'+(change_text.substring(1).toLowerCase())+'/">'+change_text+'</a>';
		}
		else
		if('@'==change_text.substring(0,1)){
			new_text='<a tabindex="0" data-href="viz://'+change_text+'/">'+change_text+'</a>';
		}
		else
		if('viz://'==change_text.substring(0,6)){
			new_text='<a tabindex="0" data-href="'+change_text+'">'+change_text+'</a>';
		}
		else
		if('sia://'==change_text.substring(0,6)){
			new_text='<a tabindex="0" href="'+sia_link(change_text.substring(6))+'" target="_blank">'+change_text+'</a>';
		}
		else
		if('ipfs://'==change_text.substring(0,7)){
			new_text='<a tabindex="0" href="'+ipfs_link(change_text.substring(7))+'" target="_blank">'+change_text+'</a>';
		}
		else{
			new_text='<a href="'+change_text+'" target="_blank">'+change_text+'</a>';
		}
		text=fast_str_replace('<REPLACE_LINK_'+i+'>',new_text,text);
	}

	for(let i in summary_mnemonics){
		text=fast_str_replace('<REPLACE_MNEMONIC_'+i+'>',summary_mnemonics[i],text);
	}

	return text;
}

function check_object_award(account,block){
	if(typeof account == 'undefined'){
		return;
	}
	if(typeof block == 'undefined'){
		return;
	}
	let t=db.transaction(['awards'],'readonly');
	let q=t.objectStore('awards');
	let req=q.index('object').openCursor(IDBKeyRange.only([account,block]),'next');
	let result=false;
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			result=cur.value;
			cur.continue();
		}
		else{
			if(false!==result){
				let current_link='viz://@'+account+'/'+block+'/';
				let view=$('.view[data-level="'+level+'"]');
				if(-1==path.indexOf('viz://')){//look in services views
					let path_parts=path.split('/');
					view=$('.view[data-path="'+path_parts[0]+'"]');
				}
				let actions=view.find('.objects .object[data-link="'+current_link+'"] .actions-view');
				$(actions).find('.award-action').addClass('success');
				$(actions).find('.award-action').prop('title',ltmp(ltmp_arr.awarded_amount,{amount:result.amount}));
			}
		}
	};
}

function render_object(user,object,type,preset_level){
	type=typeof type==='undefined'?'default':type;
	preset_level=typeof preset_level==='undefined'?level:preset_level;
	let render='';
	let text_first_link=false;
	let profile={};
	if(typeof user.profile != 'undefined'){
		profile=JSON.parse(user.profile);
	}
	console.log('render_object',user,object,type,preset_level,typeof object);
	if(typeof object === 'object'){
		if(typeof object.data === 'undefined'){
			object.data={};
		}
		if(typeof object.data.p === 'undefined'){
			object.data.p=0;
		}
	}

	let object_type='text';//by default
	if(typeof object.data !== 'undefined'){
		if(typeof object.data.t !== 'undefined'){
			if(-1!=object_types_list.indexOf(object.data.t)){
				if(typeof object_types_arr[object.data.t] !== 'undefined'){
					object_type=object_types_arr[object.data.t];
				}
				else{
					object_type=object.data.t;
				}
			}
		}
	}
	console.log('render_object=',object_type,object);

	if('publication'==type){
		if('publication'==object_type){
			//text=markdown_clear_code(object.data.d.m);//markdown
			let image_part=(typeof object.data.d.i !== 'undefined');
			let strikethrough_pattern=/\~\~(.*?)\~\~/gm;
			let title='<h1>'+object.data.d.t.replace(strikethrough_pattern,'<strike>$1</strike>')+'</h1>';
			let publication_html=title+html_safe_images(markdown_decode(object.data.d.m));
			render=ltmp(ltmp_arr.object_type_publication_full,{
				author:'@'+user.account,
				link:'viz://@'+user.account+'/'+object.block+'/',
				nickname:profile.nickname,
				avatar:safe_avatar(profile.avatar),
				actions:ltmp(ltmp_arr.object_type_text_actions,{
					icon_reply:ltmp_arr.icon_reply,
					icon_share:ltmp_arr.icon_share,
					icon_award:ltmp_arr.icon_gem,
					icon_copy_link:ltmp_arr.icon_copy_link,
				}),
				timestamp:object.data.timestamp,
				context:publication_html,
			});
		}
	}
	else
	if('default'==type){
		if(object.is_share){
			let text='';
			if(typeof object.data.d.text !== 'undefined'){
				text=object.data.d.text;
				text=escape_html(text);
			}
			let current_link='viz://@'+user.account+'/'+object.block+'/';
			render=ltmp(ltmp_arr.object_type_text_loading,{
				account:user.account,
				block:object.block,
				previous:object.data.p,
				is_reply:object.is_reply,
				is_share:object.is_share,
				link:current_link,
				context:ltmp(ltmp_arr.object_type_text_share,{
					link:'viz://@'+user.account+'/',
					caption:'@'+user.account,
					comment:ltmp(ltmp_arr.object_type_text_share_comment,{comment:text})
				}),
			});
			setTimeout(function(){
				let view=$('.view[data-level="'+preset_level+'"]');
				if(-1==path.indexOf('viz://')){//look in services views
					let path_parts=path.split('/');
					view=$('.view[data-path="'+path_parts[0]+'"]');
				}
				let load_content=view.find('.objects .object[data-link="'+current_link+'"].type-text-loading .load-content');
				get_user(object.parent_account,false,function(err,sub_user){
					if(err){
						let sub_render=ltmp(ltmp_arr.error_notice,{error:ltmp_arr.account_not_found});
						load_content.html(sub_render);
					}
					else{
						get_object(object.parent_account,object.parent_block,function(err,sub_object){
							let sub_render='';
							if(err){
								sub_render=ltmp(ltmp_arr.error_notice,{error:ltmp_arr.object_not_found});
							}
							else{
								sub_render=render_object(sub_user,sub_object,'share-preview');
							}
							load_content.html(sub_render);
							let new_object=load_content.find('.object[data-link="viz://@'+sub_user.account+'/'+sub_object.block+'/"]');
							update_short_date(new_object.find('.short-date-view'));
						});
					}
				});
			},500);
		}
		else{
			if('publication'==object_type){
				//text=markdown_clear_code(object.data.d.m);//markdown
				let result='';
				let image='';
				let link='';
				let image_part=(typeof object.data.d.i !== 'undefined');
				let wrapper_addon=' style="flex-direction:column;"';
				let strikethrough_pattern=/\~\~(.*?)\~\~/gm;
				let title=object.data.d.t.replace(strikethrough_pattern,'<strike>$1</strike>');
				link=ltmp(ltmp_arr.render_article_preview,{title:title,descr:object.data.d.d});
				if(image_part){
					image=ltmp(ltmp_arr.render_preview_article_image,{image:safe_image(object.data.d.i)});
				}
				render=ltmp(ltmp_arr.object_type_publication,{
					author:'@'+user.account,
					link:'viz://@'+user.account+'/'+object.block+'/',
					nickname:profile.nickname,
					avatar:safe_avatar(profile.avatar),
					actions:ltmp(ltmp_arr.object_type_text_actions,{
						//link:link,
						icon_reply:ltmp_arr.icon_reply,
						icon_share:ltmp_arr.icon_share,
						icon_award:ltmp_arr.icon_gem,
						icon_copy_link:ltmp_arr.icon_copy_link,
					}),
					timestamp:object.data.timestamp,
					context:image+link,
					addon:wrapper_addon
				});
			}
			if('text'==object_type){
				let text=object.data.d.text;
				text_first_link=first_link(text);

				text=escape_html(text);
				text=fast_str_replace("\n",'<br>',text);

				let reply='';
				if(object.is_reply){
					reply=ltmp(ltmp_arr.object_type_text_reply_internal,{link:'viz://@'+object.parent_account+'/'+object.parent_block+'/',caption:'@'+object.parent_account});
				}
				else{
					if(typeof object.data.d.r !== 'undefined'){
						let reply_link=object.data.d.r;
						//reply to external url
						if(0==reply_link.indexOf('https://')){
							reply_link=reply_link.toLowerCase();
							reply_link=escape_html(reply_link);
							reply_caption=reply_link.substring(8);
							if(-1!=reply_caption.indexOf('/')){
								reply_caption=reply_caption.substring(0,reply_caption.indexOf('/'));
							}
							if(''!=reply_caption){
								if(20<reply_caption.length){
									reply_caption=reply_caption.substring(0,20)+'...';
								}
							}
							else{
								reply_caption='URL';
							}
							reply=ltmp(ltmp_arr.object_type_text_reply_external,{link:reply_link,caption:reply_caption});
						}
					}
				}

				text=highlight_links(text);

				render=ltmp(ltmp_arr.object_type_text,{
					reply:reply,
					author:'@'+user.account,
					link:'viz://@'+user.account+'/'+object.block+'/',
					nickname:profile.nickname,
					avatar:safe_avatar(profile.avatar),
					text:text,
					actions:ltmp(ltmp_arr.object_type_text_actions,{
						//link:link,
						icon_reply:ltmp_arr.icon_reply,
						icon_share:ltmp_arr.icon_share,
						icon_award:ltmp_arr.icon_gem,
						icon_copy_link:ltmp_arr.icon_copy_link,
					}),
					timestamp:object.data.timestamp,
				});
			}
		}
	}
	if('preview'==type){
		if(object.is_share){
			let text='';
			if(typeof object.data.d.text !== 'undefined'){
				text=object.data.d.text;
				text=escape_html(text);
			}

			let current_link='viz://@'+user.account+'/'+object.block+'/';
			render=ltmp(ltmp_arr.object_type_text_loading,{
				account:user.account,
				block:object.block,
				previous:object.data.p,
				is_reply:object.is_reply,
				is_share:object.is_share,
				link:current_link,
				context:ltmp(ltmp_arr.object_type_text_share,{
					link:'viz://@'+user.account+'/',
					caption:'@'+user.account,
					comment:ltmp(ltmp_arr.object_type_text_share_comment,{comment:text})
				}),
			});
			setTimeout(function(){
				let view=$('.view[data-level="'+preset_level+'"]');
				if(-1==path.indexOf('viz://')){//look in services views
					let path_parts=path.split('/');
					view=$('.view[data-path="'+path_parts[0]+'"]');
				}
				let load_content=view.find('.objects .object[data-link="'+current_link+'"].type-text-loading .load-content');
				get_user(object.parent_account,false,function(err,sub_user){
					if(err){
						let sub_render=ltmp(ltmp_arr.error_notice,{error:ltmp_arr.account_not_found});
						load_content.html(sub_render);
					}
					else{
						get_object(object.parent_account,object.parent_block,function(err,sub_object){
							let sub_render='';
							if(err){
								sub_render=ltmp(ltmp_arr.error_notice,{error:ltmp_arr.object_not_found});
							}
							else{
								sub_render=render_object(sub_user,sub_object,'share-preview');
							}
							load_content.html(sub_render);
							let new_object=load_content.find('.object[data-link="viz://@'+sub_user.account+'/'+sub_object.block+'/"]');
							update_short_date(new_object.find('.short-date-view'));
						});
					}
				});
			},500);
		}
		else{
			if('publication'==object_type){
				//text=markdown_clear_code(object.data.d.m);//markdown
				let result='';
				let image='';
				let link='';
				let image_part=(typeof object.data.d.i !== 'undefined');
				let wrapper_addon=' style="flex-direction:column;"';
				let strikethrough_pattern=/\~\~(.*?)\~\~/gm;
				let title=object.data.d.t.replace(strikethrough_pattern,'<strike>$1</strike>');
				link=ltmp(ltmp_arr.render_article_preview,{title:title,descr:object.data.d.d});
				if(image_part){
					image=ltmp(ltmp_arr.render_preview_article_image,{image:safe_image(object.data.d.i)});
				}
				render=ltmp(ltmp_arr.object_type_publication_preview,{
					author:'@'+user.account,
					account:user.account,
					block:object.block,
					nickname:profile.nickname,
					avatar:safe_avatar(profile.avatar),
					previous:object.data.p,
					is_reply:object.is_reply,
					is_share:object.is_share,
					link:'viz://@'+user.account+'/'+object.block+'/',
					actions:ltmp(ltmp_arr.object_type_text_actions,{
						//link:link,
						icon_reply:ltmp_arr.icon_reply,
						icon_share:ltmp_arr.icon_share,
						icon_award:ltmp_arr.icon_gem,
						icon_copy_link:ltmp_arr.icon_copy_link,
					}),
					timestamp:object.data.timestamp,
					context:image+link,
					addon:wrapper_addon
				});
			}
			if('text'==object_type){
				let text=object.data.d.text;
				text_first_link=first_link(text);

				text=escape_html(text);
				text=fast_str_replace("\n",'<br>',text);

				if(typeof object.data.p == 'undefined'){
					object.data.p=0;
				}

				let reply='';
				if(object.is_reply){
					reply=ltmp(ltmp_arr.object_type_text_reply_internal,{link:'viz://@'+object.parent_account+'/'+object.parent_block+'/',caption:'@'+object.parent_account});
				}
				else{
					if(typeof object.data.d.r != 'undefined'){
						let reply_link=object.data.d.r;
						//reply to external url
						if(0==reply_link.indexOf('https://')){
							reply_link=reply_link.toLowerCase();
							reply_link=escape_html(reply_link);
							reply_caption=reply_link.substring(8);
							if(-1!=reply_caption.indexOf('/')){
								reply_caption=reply_caption.substring(0,reply_caption.indexOf('/'));
							}
							if(''!=reply_caption){
								if(20<reply_caption.length){
									reply_caption=reply_caption.substring(0,20)+'...';
								}
							}
							else{
								reply_caption='URL';
							}
							reply=ltmp(ltmp_arr.object_type_text_reply_external,{link:reply_link,caption:reply_caption});
						}
					}
				}

				render=ltmp(ltmp_arr.object_type_text_preview,{
					reply:reply,
					author:'@'+user.account,
					account:user.account,
					block:object.block,
					nickname:profile.nickname,
					avatar:safe_avatar(profile.avatar),
					text:text,
					previous:object.data.p,
					is_reply:object.is_reply,
					is_share:object.is_share,
					link:'viz://@'+user.account+'/'+object.block+'/',
					actions:ltmp(ltmp_arr.object_type_text_actions,{
						//link:link,
						icon_reply:ltmp_arr.icon_reply,
						icon_share:ltmp_arr.icon_share,
						icon_award:ltmp_arr.icon_gem,
						icon_copy_link:ltmp_arr.icon_copy_link,
					}),
					timestamp:object.data.timestamp,
				});
			}
		}
	}
	if('pinned'==type){
		let text='';
		if(typeof object.data.d.text !== 'undefined'){
			text=object.data.d.text;
			text=escape_html(text);
		}

		let current_link='viz://@'+user.account+'/'+object.block+'/';
		render=ltmp(ltmp_arr.object_type_text_pinned,{
			account:user.account,
			block:object.block,
			link:current_link,
			context:ltmp(ltmp_arr.object_type_text_pinned_caption,{
				icon:ltmp_arr.icon_pin
			}),
		});
		setTimeout(function(){
			let view=$('.view[data-level="'+preset_level+'"]');
			if(-1==path.indexOf('viz://')){//look in services views
				let path_parts=path.split('/');
				view=$('.view[data-path="'+path_parts[0]+'"]');
			}
			let load_content=view.find('.object[data-link="'+current_link+'"].type-text-loading.pinned-object .load-content');
			sub_render=render_object(user,object,'share-preview');
			load_content.html(sub_render);
			let new_object=load_content.find('.object[data-link="viz://@'+user.account+'/'+object.block+'/"]');
			new_object.addClass('pinned-object');
			update_short_date(new_object.find('.short-date-view'));
		},10);
	}
	if('feed'==type){
		let current_link='viz://@'+user+'/'+object+'/';
		render=ltmp(ltmp_arr.object_type_text_wait_loading,{
			link:current_link,
		});
		setTimeout(function(){
			let view=$('.view[data-level="'+preset_level+'"]');
			if(-1==path.indexOf('viz://')){//look in services views
				let path_parts=path.split('/');
				view=$('.view[data-path="'+path_parts[0]+'"]');
			}
			let load_content=view.find('.objects .object[data-link="'+current_link+'"].type-text-wait-loading .load-content');
			get_user(user,false,function(err,sub_user){
				if(err){
					let sub_render=ltmp(ltmp_arr.error_notice,{error:ltmp_arr.account_not_found});
					load_content.html(sub_render);
				}
				else{
					get_object(user,object,function(err,sub_object){
						let sub_render='';
						if(err){
							sub_render=ltmp(ltmp_arr.error_notice,{error:ltmp_arr.object_not_found});
						}
						else{
							sub_render=render_object(sub_user,sub_object,'preview');
						}
						load_content.html(sub_render);
						let new_object=load_content.find('.object[data-link="viz://@'+sub_user.account+'/'+sub_object.block+'/"]');
						update_short_date(new_object.find('.short-date-view'));
					});
				}
			});
		},50);
	}
	if('reply'==type){
		let current_link='viz://@'+user+'/'+object+'/';
		render=ltmp(ltmp_arr.object_type_text_wait_loading,{
			link:current_link,
		});
		setTimeout(function(){
			let view=$('.view[data-level="'+preset_level+'"]');
			if(-1==path.indexOf('viz://')){//look in services views
				let path_parts=path.split('/');
				view=$('.view[data-path="'+path_parts[0]+'"]');
			}
			let load_content=view.find('.objects .object[data-link="'+current_link+'"] .load-content');
			get_user(user,false,function(err,sub_user){
				if(err){
					let sub_render=ltmp(ltmp_arr.error_notice,{error:ltmp_arr.account_not_found});
					load_content.html(sub_render);
				}
				else{
					get_object(user,object,function(err,sub_object){
						let sub_render='';
						if(err){
							sub_render=ltmp(ltmp_arr.error_notice,{error:ltmp_arr.object_not_found});
						}
						else{
							sub_render=render_object(sub_user,sub_object,'reply-view');
						}
						load_content.html(sub_render);
						let new_object=load_content.find('.object[data-link="viz://@'+sub_user.account+'/'+sub_object.block+'/"]');
						update_short_date(new_object.find('.short-date-view'));
					});
				}
			});
		},500);
	}
	if('reply-view'==type){
		let current_link='viz://@'+user.account+'/'+object.block+'/';

		let text=object.data.d.text;
		text=escape_html(text);
		text=fast_str_replace("\n",'<br>',text);

		text=highlight_links(text);

		let reply='';
		render=ltmp(ltmp_arr.object_type_text_reply,{
			author:'@'+user.account,
			nickname:profile.nickname,
			avatar:safe_avatar(profile.avatar),
			text:text,
			link:current_link,
			actions:ltmp(ltmp_arr.object_type_text_actions,{
				//link:link,
				icon_reply:ltmp_arr.icon_reply,
				icon_share:ltmp_arr.icon_share,
				icon_award:ltmp_arr.icon_gem,
				icon_copy_link:ltmp_arr.icon_copy_link,
			}),
			timestamp:object.data.timestamp,
		});
		setTimeout(function(){
			let view=$('.view[data-level="'+preset_level+'"]');
			if(-1==path.indexOf('viz://')){//look in services views
				let path_parts=path.split('/');
				view=$('.view[data-path="'+path_parts[0]+'"]');
			}
			let branch_line=view.find('.objects .object[data-link="'+current_link+'"] .avatar-column');
			let load_content=view.find('.objects .object[data-link="'+current_link+'"] .nested-replies');
			let t=db.transaction(['replies'],'readonly');
			let q=t.objectStore('replies');
			let req=q.index('parent').openCursor(IDBKeyRange.only([user.account,parseInt(object.block)]),'next');
			let find_replies=0;
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					find_replies++;
					cur.continue();
				}
				else{
					if(find_replies>0){
						//console.log('find nested replies in objects cache: '+find_replies);
						load_content.html(ltmp(ltmp_arr.object_type_text_reply_nested_count,{count:find_replies}));
						branch_line.append(ltmp_arr.object_type_text_reply_branch_line);
					}
				}
			};
		},500);
	}
	if('share-preview'==type){
		if('publication'==object_type){
			//text=markdown_clear_code(object.data.d.m);//markdown
			let result='';
			let image='';
			let link='';
			let image_part=(typeof object.data.d.i !== 'undefined');
			let wrapper_addon=' style="flex-direction:column;"';
			let strikethrough_pattern=/\~\~(.*?)\~\~/gm;
			let title=object.data.d.t.replace(strikethrough_pattern,'<strike>$1</strike>');
			link=ltmp(ltmp_arr.render_article_preview,{title:title,descr:object.data.d.d});
			if(image_part){
				image=ltmp(ltmp_arr.render_preview_article_image,{image:safe_image(object.data.d.i)});
			}
			render=ltmp(ltmp_arr.object_type_publication_preview,{
				author:'@'+user.account,
				account:user.account,
				block:object.block,
				nickname:profile.nickname,
				avatar:safe_avatar(profile.avatar),
				previous:object.data.p,
				is_reply:object.is_reply,
				is_share:object.is_share,
				link:'viz://@'+user.account+'/'+object.block+'/',
				actions:ltmp(ltmp_arr.object_type_text_actions,{
					//link:link,
					icon_reply:ltmp_arr.icon_reply,
					icon_share:ltmp_arr.icon_share,
					icon_award:ltmp_arr.icon_gem,
					icon_copy_link:ltmp_arr.icon_copy_link,
				}),
				timestamp:object.data.timestamp,
				context:image+link,
				addon:wrapper_addon
			});
		}
		if('text'==object_type){
			let text=object.data.d.text;
			text_first_link=first_link(text);

			text=escape_html(text);
			text=fast_str_replace("\n",'<br>',text);

			if(typeof object.data.p == 'undefined'){
				object.data.p=0;
			}

			let reply='';
			if(object.is_reply){
				reply=ltmp(ltmp_arr.object_type_text_reply_internal,{link:'viz://@'+object.parent_account+'/'+object.parent_block+'/',caption:'@'+object.parent_account});
			}
			else{
				//not reply to object, check reply (r) in data (d)
				if(typeof object.data.d.r != 'undefined'){
					let reply_link=object.data.d.r;
					//reply to external url
					if(0==reply_link.indexOf('https://')){
						reply_link=reply_link.toLowerCase();
						reply_link=escape_html(reply_link);
						reply_caption=reply_link.substring(8);
						if(-1!=reply_caption.indexOf('/')){
							reply_caption=reply_caption.substring(0,reply_caption.indexOf('/'));
						}
						if(''!=reply_caption){
							if(20<reply_caption.length){
								reply_caption=reply_caption.substring(0,20)+'...';
							}
						}
						else{
							reply_caption='URL';
						}
						reply=ltmp(ltmp_arr.object_type_text_reply_external,{link:reply_link,caption:reply_caption});
					}
				}
			}

			render=ltmp(ltmp_arr.object_type_text_share_preview,{
				author:'@'+user.account,
				nickname:profile.nickname,
				avatar:safe_avatar(profile.avatar),
				text:text,
				link:'viz://@'+user.account+'/'+object.block+'/',
				actions:ltmp(ltmp_arr.object_type_text_actions,{
					//link:link,
					icon_reply:ltmp_arr.icon_reply,
					icon_share:ltmp_arr.icon_share,
					icon_award:ltmp_arr.icon_gem,
					icon_copy_link:ltmp_arr.icon_copy_link,
				}),
				timestamp:object.data.timestamp,
			});
		}
	}
	setTimeout(function(){
		check_object_award(user.account,object.block);
		console.log('render_object timeout check first link',type,text_first_link);
		if(false!==text_first_link){
			text_first_link=link_to_http_gate(text_first_link);
			if(false!==text_first_link){
				load_preview_data(text_first_link,function(preview_data){
					render_preview_data(user.account,object.block,preview_data);
				});
			}
		}
	},100);

	return render;
}

function render_notify(data,check_level){
	//console.log(data,check_level);
	let render='';
	let line=true;
	if(''!=data.title){
		render+=ltmp(ltmp_arr.notify_title,{caption:data.title});
		if(''!=data.text){
			line=false;
		}
	}
	if(typeof data.text !== 'undefined'){
		if(typeof data.link !== 'undefined'){
			render+=ltmp(ltmp_arr.notify_item_link,{link:data.link,text:data.text});
		}
		else{
			render+=ltmp(ltmp_arr.notify_text,{text:data.text});
		}
	}
	let notify=ltmp(ltmp_arr.notify_item,{id:data.id,addon:' read-notify-action'+(1==data.status?' readed':'')+(line?' line':''),context:render});
	return notify;
}

function profile_filter_by_type(){
	let view=$('.view[data-level="'+level+'"]');
	if(1==view.data('profile')){//only for profile view
		let type=view.data('query');
		if(''==type){
			type='main';
		}
		if(0!=view.length){
			//selected interests as hashtags filter
			let hashtags_filter=[];
			view.find('.profile .interests a.selected').each(function(i,el){
				hashtags_filter.push($(el).data('hashtag'));
			});
			hashtags_filter=array_unique(hashtags_filter);

			if(0==hashtags_filter.length){
				if('main'==type){
					view.find('.objects>.object').css('display','flex');
					view.find('.objects .pinned-object').css('display','flex');
				}
				else{
					if('posts'==type){
						view.find('.objects>.object').each(function(i,el){
							if(0==$(el).data('is-reply') && 0==$(el).data('is-share')){
								$(el).css('display','flex');
							}
							else{
								$(el).css('display','none');
							}
						});
					}
					else
					if('replies'==type){
						view.find('.objects>.object').each(function(i,el){
							if(1==$(el).data('is-reply')){
								$(el).css('display','flex');
							}
							else{
								$(el).css('display','none');
							}
						});
					}
					else
					if('shares'==type){
						view.find('.objects>.object').each(function(i,el){
							if(1==$(el).data('is-share')){
								$(el).css('display','flex');
							}
							else{
								$(el).css('display','none');
							}
						});
					}
					view.find('.objects .pinned-object').css('display','none');
				}
				clearTimeout(check_load_more_timer);
				check_load_more_timer=setTimeout(function(){
					check_load_more();
				},50);
			}
			else{//filter by selected interests
				let hashtags_id_filter=[];
				let hashtags_id_counter=hashtags_filter.length;
				let hashtags_filter_t,hashtags_filter_q,hashtags_filter_req;
				hashtags_filter_t=db.transaction(['hashtags'],'readonly');
				hashtags_filter_q=hashtags_filter_t.objectStore('hashtags');
				hashtags_filter_req=hashtags_filter_q.openCursor(null,'prev');
				let cursor_end=false;
				hashtags_filter_req.onsuccess=function(event){
					let cur=event.target.result;
					if(cursor_end){
						cur=false;
					}
					if(cur){
						let item=cur.value;
						if(-1!=hashtags_filter.indexOf(cur.value.tag)){
							hashtags_id_filter.push(cur.value.id);
							hashtags_id_counter--;
						}
						if(hashtags_id_counter<=0){
							cursor_end=true;
						}
						cur.continue();
					}
					else{
						//console.log(hashtags_id_filter,hashtags_id_filter.length);
						if(hashtags_id_filter.length>0){
							hashtags_id_filter_str=hashtags_id_filter.join(',');
							let objects_counter=view.find('.objects>.object').length;
							view.find('.objects>.object').each(function(i,el){
								let search_object=el;
								let check_filter=false;
								if('posts'==type){
									if(0==$(el).data('is-reply') && 0==$(el).data('is-share')){
										check_filter=true;
									}
								}
								else
								if('replies'==type){
									if(1==$(el).data('is-reply')){
										check_filter=true;
									}
								}
								else
								if('shares'==type){
									if(1==$(el).data('is-share')){
										check_filter=true;
									}
								}
								else
								if('main'==type){
									check_filter=true;
								}
								if($(el).hasClass('pinned-object')){
									check_filter=false;
								}
								if(check_filter){
									if(hashtags_id_filter_str!=$(search_object).data('filter')){
										let search_object_t,search_object_q,search_object_req;
										search_object_t=db.transaction(['hashtags_feed'],'readonly');
										search_object_q=search_object_t.objectStore('hashtags_feed');
										search_object_req=search_object_q.index('object').openCursor(IDBKeyRange.only([$(search_object).data('account'),$(search_object).data('block')]),'prev');
										let find_object=false;
										let cursor_end=false;
										search_object_req.onsuccess=function(event){
											let cur=event.target.result;
											if(cursor_end){
												cur=false;
											}
											if(cur){
												if(-1!=hashtags_id_filter.indexOf(cur.value.tag)){
													find_object=true;
													cursor_end=true;
												}
												cur.continue();
											}
											else{
												if(!find_object){
													$(search_object).css('display','none');
													$(search_object).data('filter',hashtags_id_filter_str);
													$(search_object).data('filtered',1);
												}
												else{
													$(search_object).css('display','flex');
													$(search_object).data('filter',hashtags_id_filter_str);
													$(search_object).data('filtered',0);
												}
											}
										};
									}
									else{
										if(1==$(search_object).data('filtered')){
											$(search_object).css('display','none');
										}
										else{
											$(search_object).css('display','flex');
										}
									}
								}
								else{
									$(search_object).css('display','none');
								}

								if(objects_counter==1+i){//all loaded/visible objects was checked
									clearTimeout(check_load_more_timer);
									check_load_more_timer=setTimeout(function(){
										check_load_more();
									},50);
								}
							});
						}
						else{//no actual hashtags find
							clearTimeout(check_load_more_timer);
							check_load_more_timer=setTimeout(function(){
								check_load_more();
							},50);
						}
					}
				};
			}
		}
	}
}

function load_more_objects(indicator,check_level){
	//notifications service page
	if(typeof indicator.data('notifications-id') !== 'undefined'){
		let tab=indicator.closest('.content-view').data('tab');
		let update_t=db.transaction(['notifications'],'readwrite');
		let update_q=update_t.objectStore('notifications');
		let notifications_id=parseInt(indicator.data('notifications-id'));
		let last_id=0;
		let limit_per_load=10;
		let objects=[];
		let update_req;
		let cursor_end=false;
		if(0==notifications_id){
			update_req=update_q.openCursor(null,'prev');
		}
		else{
			update_req=update_q.openCursor(IDBKeyRange.upperBound(notifications_id,true),'prev');
		}
		update_req.onsuccess=function(event){
			let cur=event.target.result;
			if(cursor_end){
				cur=false;
			}
			if(cur){
				let item=cur.value;
				if('all'==tab){
					objects.push(item);
				}
				if('new'==tab){
					if(0==item.status){
						objects.push(item);
					}
				}
				if('readed'==tab){
					if(1==item.status){
						objects.push(item);
					}
				}
				if(limit_per_load>0){
					limit_per_load--;
					last_id=item.id;
				}
				else{
					last_id=item.id;
					cursor_end=true;
				}
				cur.continue();
			}
			else{
				//console.log('load_more_objects end cursor',objects);
				if(0==objects.length){
					indicator.before(ltmp_arr.load_more_end_notice);
					indicator.remove();
					return;
				}
				else{
					for(let i in objects){
						let object=objects[i];
						let object_view=render_notify(object,check_level);
						indicator.before(object_view);
					}
					indicator.data('notifications-id',last_id);
					indicator.data('busy','0');
					check_load_more();
				}
			}
		};
	}
	//awards service page
	if(typeof indicator.data('awards-id') !== 'undefined'){
		let update_t=db.transaction(['awards'],'readonly');
		let update_q=update_t.objectStore('awards');
		let awards_id=parseInt(indicator.data('awards-id'));
		let last_id=0;
		let objects=[];
		let update_req;
		let cursor_end=false;
		if(0==awards_id){
			update_req=update_q.openCursor(null,'prev');
		}
		else{
			update_req=update_q.openCursor(IDBKeyRange.upperBound(awards_id,true),'prev');
		}
		update_req.onsuccess=function(event){
			let cur=event.target.result;
			if(cursor_end){
				cur=false;
			}
			if(cur){
				let item=cur.value;
				last_id=item.id;
				objects.push(item);
				cursor_end=true;//load only one item
				cur.continue();
			}
			else{
				//console.log('load_more_objects end cursor',objects);
				if(0==objects.length){
					indicator.before(ltmp_arr.load_more_end_notice);
					indicator.remove();
					return;
				}
				else{
					for(let i in objects){
						let object=objects[i];
						let object_view=render_object(object.account,object.block,'feed',check_level);
						indicator.before(object_view);
					}
					indicator.data('awards-id',last_id);
					indicator.data('busy','0');
					check_load_more();
				}
			}
		};
	}
	//hashtags service page
	if(typeof indicator.data('hashtags-id') !== 'undefined'){
		let update_t=db.transaction(['hashtags_feed'],'readonly');
		let update_q=update_t.objectStore('hashtags_feed');
		let hashtags_id=parseInt(indicator.data('hashtags-id'));
		let hashtags_feed_id=parseInt(indicator.data('hashtags-feed-id'));
		let last_id=0;
		let objects=[];
		let cursor_end=false;
		let update_req;
		update_req=update_q.index('tag').openCursor(IDBKeyRange.only(hashtags_id),'prev');
		update_req.onsuccess=function(event){
			let cur=event.target.result;
			if(cursor_end){
				cur=false;
			}
			if(cur){
				let item=cur.value;
				if(item.tag==hashtags_id){
					if((hashtags_feed_id>item.id)||(hashtags_feed_id==0)){
						last_id=item.id;
						objects.push(item);
						cursor_end=true;
					}
				}
				cur.continue();
			}
			else{
				if(0==objects.length){
					indicator.before(ltmp_arr.load_more_end_notice);
					indicator.remove();
					return;
				}
				else{
					for(let i in objects){
						let object=objects[i];
						let object_view=render_object(object.account,object.block,'feed',check_level);
						indicator.before(object_view);
					}
					indicator.data('hashtags-feed-id',last_id);
					indicator.data('busy','0');
					check_load_more();
				}
			}
		};
	}
	//feed
	if(typeof indicator.data('feed-time') !== 'undefined'){
		let update_t=db.transaction(['feed'],'readonly');
		let update_q=update_t.objectStore('feed');
		let feed_time=parseInt(indicator.data('feed-time'));
		let same_time=0;
		//console.log('load_more_objects objects feed-time:',same_time);
		let objects=[];
		let cursor_end=false;
		let update_req;
		if(0==feed_time){
			update_req=update_q.index('time').openCursor(null,'prev');
		}
		else{
			update_req=update_q.index('time').openCursor(IDBKeyRange.upperBound(feed_time,true),'prev');
		}
		update_req.onsuccess=function(event){
			let cur=event.target.result;
			if(cursor_end){
				cur=false;
			}
			if(cur){
				let item=cur.value;
				if(0==same_time){
					if(typeof indicator.closest('.objects').data('feed-time') === 'undefined'){
						indicator.closest('.objects').data('feed-time',item.time);
					}
					same_time=item.time;
				}
				if(same_time==item.time){
					objects.push(item);
				}
				else{
					cursor_end=true;
				}
				cur.continue();
			}
			else{
				//console.log('load_more_objects end cursor',objects);
				if(0==objects.length){
					if(whitelabel_init){
						indicator.before(ltmp(ltmp_arr.whitelabel_notice,{account:whitelabel_account}));
					}
					else{
						indicator.before(ltmp_arr.feed_end_notice);
					}
					indicator.remove();
					return;
				}
				else{
					for(let i in objects){
						let object=objects[i];
						let object_view=render_object(object.account,object.block,'feed');
						indicator.before(object_view);
					}
					indicator.data('feed-time',same_time);
					indicator.data('busy','0');
					check_load_more();
				}
			}
		};
	}
	//account profile
	if(typeof indicator.data('account') !== 'undefined')
	if(''!=indicator.data('account')){
		let check_account=indicator.data('account');
		get_user(check_account,false,function(err,user_result){
			if(err){
				indicator.before(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.account_not_found}));
				indicator.remove();
				return;
			}
			let start_offset=user_result.start;
			let offset=start_offset;
			let find_objects=false;
			let objects_count=indicator.parent().find('.object').length;
			objects_count-=indicator.parent().find('.pinned-object').length;
			if(0<objects_count){
				find_objects=true;
			}
			indicator.parent().find('.object').each(function(){
				if(typeof $(this).data('previous') !== 'undefined'){
					let previous=parseInt($(this).data('previous'));
					if(isNaN(previous)){
						offset=0;
					}
					else{
						if(offset>previous){
							offset=previous;
						}
					}
				}
			});
			if(find_objects){
				//need to stop load more if no previous
				if((offset==start_offset)||(offset==0)){
					indicator.before(ltmp_arr.load_more_end_notice);
					indicator.remove();
					return;
				}
			}
			get_object(check_account,offset,function(err,object_result){
				if(err){
					console.log('get_object error',check_account,offset,err,object_result);
					if(1==object_result){
						indicator.before(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.block_not_found}));
					}
					if(2==object_result){
						indicator.before(ltmp_arr.load_more_end_notice);
						indicator.remove();
					}
				}
				else{
					let object_view=render_object(user_result,object_result,'preview');
					indicator.before(object_view);
					let new_object=indicator.parent().find('.object[data-link="viz://@'+user_result.account+'/'+object_result.block+'/"]');
					new_object.css('display','none');
					update_short_date(new_object.find('.short-date-view'));
					indicator.data('busy','0');
					profile_filter_by_type();
					clearTimeout(check_load_more_timer);
					check_load_more_timer=setTimeout(function(){
						check_load_more();
					},100);
				}
			});
		});
	}
}

var check_load_more_timer=0;
function check_load_more(){
	let scroll_top=window.pageYOffset;
	let window_height=window.innerHeight;
	let view=$('.view[data-level="'+level+'"]');
	if(-1==path.indexOf('viz://')){//look in services views
		let path_parts=path.split('/');
		view=$('.view[data-path="'+path_parts[0]+'"]');
	}
	if(0!=view.length){
		view.find('.loader-notice').each(function(){
			let indicator=$(this);
			if('1'!=indicator.data('busy')){
				let offset=indicator.offset();
				if((scroll_top+window_height)>(offset.top+(indicator.outerHeight()*0.7))){
					indicator.data('busy','1');
					load_more_objects(indicator,level);
				}
			}
		});
	}
}

function is_full(){
	let calc_width=window.outerWidth;
	//console.log(calc_width);
	return (calc_width>1120);
}

function is_mobile(){
	let calc_width=window.outerWidth;
	//console.log(calc_width);
	return (calc_width<=750);
}

function check_current_user(callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	if(''!=current_user){
		if(typeof users[current_user] === 'undefined'){
			add_notify(false,
				ltmp_arr.notify_arr.error,
				ltmp_arr.account_settings_empty_regular_key,
				'dapp:account_settings'
			);
		}
		else{
			if(typeof users[current_user].regular_key === 'undefined'){
				add_notify(false,
					ltmp_arr.notify_arr.error,
					ltmp_arr.account_settings_empty_regular_key,
					'dapp:account_settings'
				);
			}
		}
		get_user(current_user,true,()=>{callback();});
	}
	else{
		callback();
	}
}

function check_whitelabel_account(callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	if(''!=whitelabel_account){
		for(let i in whitelabel_accounts){
			get_user(whitelabel_accounts[i],true);
		}
		get_user(whitelabel_account,false,()=>{callback();});
	}
	else{
		callback();
	}
}

function init_users(callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	check_current_user(()=>{
		check_whitelabel_account(()=>{
			callback();
		})
	});
}

function preset_view(){
	let preset_view=['account_settings','app_settings','edit_profile','publish'];
	for(let i in preset_view){
		let view_name=preset_view[i];
		let view=$('.view[data-path="dapp:'+view_name+'"]');
		view.find('.objects').html(ltmp(ltmp_arr['preset_view_'+view_name]));
	}
}

var dapp_loaded_timer=0;
function dapp_loaded(){
	clearTimeout(dapp_loaded_timer);
	dapp_loaded_timer=setTimeout(function(){
		$('body').addClass('loaded');
	},2200);
}
var ignore_resize=false;
function main_app(){
	if(false!==whitelabel_logo){
		$('body').append(ltmp(ltmp_arr.dapp_startup,{logo:whitelabel_logo}));
		setTimeout(function(){
			$('#whitelabel-logo').addClass('animation');
			dapp_loaded();
		},1000);
	}
	else{
		$('body').addClass('loaded');
	}
	console.log('Startup: main_app');
	preset_view();
	parse_fullpath();
	apply_theme_mode();
	render_menu();
	render_session();
	render_right_addon();
	console.log('Startup: renders +');

	init_users(()=>{
		console.log('Startup: init_users +');
		clear_feed(()=>{
			console.log('Startup: clear_feed +');
			clear_users_objects(()=>{
				console.log('Startup: clear_users_objects +');
				clear_cache(()=>{
					console.log('Startup: clear_cache +');
					view_path(path+(''==query?'':'?'+query),{},false,false);
					check_sync_cloud_activity();
					update_feed();
					if(false!==whitelabel_logo){
						dapp_loaded();
					}
				});
			});
		});
	});
	dgp_timer=setTimeout(function(){
		update_dgp(true);
	},10000);//10sec for re-check selected api gate


	document.addEventListener('click',app_mouse,false);
	document.addEventListener('tap',app_mouse,false);
	document.addEventListener('keyup',app_keyboard,false);

	document.addEventListener('scroll',function(){
		if(-1!=path.indexOf('viz://')){//save view scroll position
			if('none'!=$('.view[data-level="'+level+'"]').css('display')){
				$('.view[data-level="'+level+'"]').data('scroll',Math.ceil(window.pageYOffset));
			}
		}
		check_load_more();
	});
	window.onresize=function(init){
		if(ignore_resize){
			return;
		}
		if(!is_mobile()){
			if(!is_full()){
				if(!$('div.menu').hasClass('short')){
					$('div.menu').removeClass('hidden');
					$('div.menu').removeClass('show');
					$('div.menu').addClass('short');
				}
				$('.toggle-menu-icon').css('display','none');
				if(true!==init){
					menu_status='short';
					localStorage.setItem(storage_prefix+'menu_status',menu_status);
				}
			}
			else{
				$('div.menu').removeClass('hidden');
				$('div.menu').removeClass('show');
				$('div.menu').removeClass('short');
				$('.toggle-menu-icon').css('display','inline-block');
				if(true!==init){
					menu_status='full';
					localStorage.setItem(storage_prefix+'menu_status',menu_status);
				}
			}
		}
		else{
			$('.toggle-menu-icon').css('display','none');
			$('div.menu').removeClass('hidden');
			$('div.menu').removeClass('short');
			$('div.menu').removeClass('show');
		}
		if('full'==menu_status){
			$('.toggle-menu-icon').html(ltmp_arr.icon_menu_collapse);
		}
		else{
			$('.toggle-menu-icon').html(ltmp_arr.icon_menu_expand);
		}
		if(true===init){
			if('short'==menu_status){
				$('div.menu').addClass('short');
			}
		}
		check_load_more();
	};
	window.onhashchange=function(e){
		e.preventDefault();
		parse_fullpath();
		view_path(path+(''==query?'':'?'+query),{},true,false);
	};
	window.onresize(true);
}