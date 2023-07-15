var app_version=1;
var app_protocol='V';//V for Voice :)
var events_protocol='VE';//Voice Events
var storage_prefix='viz_voice_';
var debug=false;
var pwa=false;

/* + start broadcast channel feature */
//broadcast channel for communication between tabs
//main pid is tab with focus
//if no tabs with focus then last active tab is main
//if no tabs with focus and no last active tab then largest pid is main
//only main pid execute all timers (others tabs stop timers)
//if main pid closed then next largest pid is main
var bc=new BroadcastChannel('viz_voice');
var pid=0;
var max_pid=0;

var set_pid_timer=false;
var set_main_pid_timer=false;

var pid_active=true;
function check_pid_active(e){
	pid_active=(e.type==='focus');
	console.log('check_pid_active <<< ',pid_active);
	if(pid_active){
		if(!main_pid){//not was main_pid (need start timers)
			start_timers();
		}
		main_pid=true;
		if(0!=pid){//if pid==0 then we are not ready to send messages (will be main after set new pid)
			console.log('MAIN PID !!!',pid);
			bc.postMessage({type:'main',pid:pid});
		}
	}
	else{
		if(!main_pid){//extremely rare case when we are not main_pid and not last active
			stop_timers();
			main_pid=false;
			bc.postMessage({type:'who_main',pid:pid});
		}
	}
};
window.onfocus=check_pid_active;
window.onblur=check_pid_active;

var main_pid=false;
var need_find_main_pid=false;
function set_main_pid(){
	if(pid>max_pid){
		if(!main_pid){//not was main_pid (need start timers)
			start_timers();
		}
		main_pid=true;
		console.log('MAIN PID !!!',pid);
		bc.postMessage({type:'main',pid:pid});
	}
	else{
		stop_timers();
		main_pid=false;
	}
}
function set_pid(){
	pid=1+max_pid;
	main_pid=true;
	console.log('New PID >>> ',pid);
	bc.postMessage({type:'pong',pid:pid});
	bc.postMessage({type:'main',pid:pid});
}
window.onbeforeunload=function(e){
	if(main_pid){//only for main_pid, need to find new main_pid
		pid=0;
		bc.postMessage({type:'who_main',pid:pid});
	}
};
bc.onmessage=function(e){
	console.log('BroadcastChannel >>> ',e.data);
	if('who_main'==e.data.type){
		need_find_main_pid=true;
		max_pid=0;
		if(0!=e.data.pid){
			if(max_pid<e.data.pid){
				max_pid=e.data.pid;
			}
		}
		bc.postMessage({type:'pong',pid:pid});
		clearTimeout(set_main_pid_timer);
		set_main_pid_timer=setTimeout(function(){
			set_main_pid();
		},100);
	}
	if('ping'==e.data.type){
		bc.postMessage({type:'pong',pid:pid});
	}
	if('main'==e.data.type){
		main_pid=false;
		stop_timers();
		console.log('main_pid <<< ',main_pid);
		console.log('new main_pid <<< ',e.data.pid);
	}
	if('pong'==e.data.type){
		if(0!=e.data.pid){
			if(max_pid<e.data.pid){
				max_pid=e.data.pid;
			}
		}
		if(0==pid){
			clearTimeout(set_pid_timer);
			set_pid_timer=setTimeout(function(){
				set_pid();
			},50);
		}
		if(need_find_main_pid){
			clearTimeout(set_main_pid_timer);
			set_main_pid_timer=setTimeout(function(){
				set_main_pid();
			},50);
		}
	}
	if('notifications_count'==e.data.type){
		let counter_notifications=$('.counter-notifications');
		let count=e.data.count;
		if(0==count){
			counter_notifications.removeClass('show');
		}
		else{
			counter_notifications.html(count);
			counter_notifications.addClass('show');
		}
	}
	if('feed_count'==e.data.type){
		let view=$('.view[data-level="0"]');
		let new_objects=view.find('.objects .new-objects');
		let counter_feed=$('.counter-feed');
		let items=e.data.count;

		new_objects.data('items',items);
		if(0==items){
			new_objects.removeClass('show');
			counter_feed.removeClass('show');
		}
		else{
			new_objects.html(ltmp(ltmp_arr.feed_new_objects,{items:items}));
			new_objects.addClass('show');
			counter_feed.html(items);
			counter_feed.addClass('show');
		}
	}
};
//set pid after 100ms from last pong if no pong received
set_pid_timer=setTimeout(function(){
	set_pid();
},100);
bc.postMessage({type:'ping',pid:pid});
/* - end broadcast channel feature */

/* + start check img for complete status and naturalHeight */
//many images can be deleted from web
//we need check status of image and change src if image not loaded
function check_images(view){
	view=view||$(document);
	view.find('img').each(function(){
		let img=$(this);
		if(img.hasClass('img-checked')){
			return;
		}
		img.addClass('img-checked');
		if(img[0].complete){
			if(img[0].naturalHeight==0){
				img.attr('src',ltmp_global.unavailable_image);
				$(img).css('align-self','center');
			}
		}
		else{
			img.on('load',function(){
				img.addClass('img-checked');
				if(img[0].naturalHeight==0){
					img.attr('src',ltmp_global.unavailable_image);
					$(img).css('align-self','center');
				}
			});
			img.on('error',function(){
				img.addClass('img-checked');
				img.attr('src',ltmp_global.unavailable_image);
				$(img).css('align-self','center');
			});
		}

	});
}
/* - end check img for complete status and naturalHeight */

if(window.matchMedia('(display-mode: standalone)').matches){
	pwa=true;
}
if(window.matchMedia('(display-mode: fullscreen)').matches){
	pwa=true;
}
var current_theme='';

var whitelabel_account='';//main whitelabel account to redirect
var whitelabel_accounts=[whitelabel_account];//always subscribed to whitelabels accounts
var whitelabel_deep=10;//count of max activity loaded for feed on startup
var whitelabel_redirect=false;//redirect to whitelabel profile on feed loadup
var whitelabel_app_title='The Free Speech Project';
var whitelabel_copy_link=false;//rewrite viz:// in copy link action for share content outside

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
var preview_url='https://readdle.me/preview/';

var account_pattern=/@[a-z0-9\-\.]*/g;
var block_pattern=/\/([0-9]+)(\/|)$/g;

var install_event;
window.addEventListener('beforeinstallprompt',(e)=>{
	e.preventDefault();
	install_event=e;
});
if('file://'!=document.location.origin){
	if('serviceWorker' in navigator){
		navigator.serviceWorker.register('/sw.js',{scope:'/',registrationStrategy:'registerImmediately'}).then(()=>{
			console.log('Service Worker Registered');
		});
	}
}

if(typeof String.prototype.replaceAll == "undefined") {
	String.prototype.replaceAll = function(match, replace){
		return this.replace(new RegExp(match, 'g'), () => replace);
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

let passwordless_auth_sessions=[];
function passwordless_auth(account,regular_key,ignore_session){
	ignore_session=typeof ignore_session==='undefined'?false:ignore_session;
	let unixtime=new Date().getTime() / 1000 | 0;//unixtime
	let session=false;
	if(!ignore_session){
		for(let i in passwordless_auth_sessions){
			if(passwordless_auth_sessions[i]['account']==account){
				if(passwordless_auth_sessions[i]['expire']>unixtime){
					session=passwordless_auth_sessions[i]['session'];
				}
				else{//clear expired sessions
					passwordless_auth_sessions.splice(i,1);
				}
			}
		}
	}
	if(false===session){
		var nonce=0;
		var data='';
		var signature='';
		while(!auth_signature_check(signature)){
			data=auth_signature_data(sync_cloud_domain,'auth',account,'regular',nonce);
			signature=viz.auth.signature.sign(data,regular_key).toHex();
			nonce++;
		}

		clearTimeout(passwordless_auth_session_update_timer);
		passwordless_auth_session_update_timer=setTimeout(function(){
			passwordless_auth_session_update();
		},100);

		return {data,signature};
	}
	else{
		return {session};
	}
}

var passwordless_auth_session_update_interval=10*60*1000-10;//10min-10sec
var passwordless_auth_session_update_timer=0;
function passwordless_auth_session_update(callback){
	if(typeof callback==='undefined'){
		callback=function(){};
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
		console.log('passwordless_auth_session_update timeout',sync_cloud_url);
	};
	xhr.onreadystatechange = function() {
		if(4==xhr.readyState && 200==xhr.status){
			try{
				let json=JSON.parse(xhr.response);
				//console.log('passwordless_auth_session_update response',json);
				if(typeof json.session !== 'undefined'){
					if(typeof json.expire !== 'undefined'){
						for(let i in passwordless_auth_sessions){//clear old sessions
							if(passwordless_auth_sessions[i]['account']==current_user){
								passwordless_auth_sessions.splice(i,1);
							}
						}
						passwordless_auth_sessions.push({account:current_user,session:json.session,expire:json.expire})
					}
				}
				clearTimeout(passwordless_auth_session_update_timer);
				passwordless_auth_session_update_timer=setTimeout(function(){
					passwordless_auth_session_update();
				},passwordless_auth_session_update_interval);

				callback(json.session);
			}
			catch(e){
				console.log('passwordless_auth_session_update response json error',xhr.response,e);
				callback(false);
			}
		}
		if(4==xhr.readyState && 200!=xhr.status){
			callback(false);
		}
	};
	let auth_data=passwordless_auth(current_user,users[current_user].regular_key,true);
	auth_data.action='session';
	xhr.send(JSON.stringify(auth_data));

	clearTimeout(passwordless_auth_session_update_timer);
	passwordless_auth_session_update_timer=setTimeout(function(){
		passwordless_auth_session_update();
	},passwordless_auth_session_update_interval);
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
	let auth_data=passwordless_auth(current_user,users[current_user].regular_key);
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
				import_cloud(update.value,function(result){
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
		let auth_data=passwordless_auth(current_user,users[current_user].regular_key);
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
		let auth_data=passwordless_auth(current_user,users[current_user].regular_key);
		auth_data.action='put_update';
		auth_data.type=types_arr[type_str];
		auth_data.value=value;
		xhr.send(JSON.stringify(auth_data));
	}
	else{
		callback(false);
	}
}

function compare_account_name(a,b) {
	if (a.account < b.account)
		return -1;
	if (a.account > b.account)
		return 1;
	return 0;
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
var is_chrome_ios=navigator.userAgent.indexOf('CriOS') > -1;
var is_ucbrowser=navigator.userAgent.indexOf('UCBrowser') > -1;
var is_samsungbrowser=navigator.userAgent.indexOf('SamsungBrowser') > -1;
var is_macintosh=navigator.userAgent.indexOf('Macintosh') > -1;
var trx_need_commit=false;

var api_gates=[
	'https://api.viz.world/',
	'https://node.viz.cx/',
	'https://viz.lexai.host/',
];
var select_best_api_gate=true;
var default_api_gate=api_gates[0];
var best_gate=-1;
var best_gate_latency=-1;
if(null!=localStorage.getItem(storage_prefix+'api_gate')){
	default_api_gate=localStorage.getItem(storage_prefix+'api_gate');
	select_best_api_gate=false;
}
var api_gate=default_api_gate;
console.log('using default node',default_api_gate);
viz.config.set('websocket',default_api_gate);

var dgp={};

if(select_best_api_gate){
	select_best_gate();
}
else{
	update_dgp(true);
}

function update_api_gate(value=false,latency){
	console.log('new dgp:',dgp);
	if(false==value){
		api_gate=api_gates[best_gate];
	}
	else{
		api_gate=value;
	}
	console.log('using new node',api_gate,'latency: ',(typeof latency !== 'undefined')?latency:best_gate_latency);
	viz.config.set('websocket',api_gate);
	localStorage.setItem(storage_prefix+'api_gate',api_gate);
	update_dgp(true);
}
var check_api_timer=0;
function check_api_gate(node,callback){
	if(''!=node){
		let protocol='none';
		let node_protocol=node.substring(0,node.indexOf(':'));
		if('http'==node_protocol||'https'==node_protocol){
			protocol='http';
		}
		if('ws'==node_protocol||'wss'==node_protocol){
			protocol='websocket';
		}
		if('websocket'==protocol){
			callback(ltmp_arr.node_request,true);
			let socket=new WebSocket(node);
			clearTimeout(check_api_timer);
			check_api_timer=setTimeout(function(){
				callback(ltmp_arr.node_not_respond);
				socket.close();
			},3000);
			let latency_start=new Date().getTime();
			let latency=-1;
			socket.onmessage=function(event){
				latency=new Date().getTime() - latency_start;
				//console.log(event);
				try{
					json=JSON.parse(event.data);
					if((typeof json.result!='undefined')&&(typeof json.result.head_block_number!='undefined')){
						update_api_gate(node,latency);
						callback(false,ltmp_arr.node_success);
					}
					else{
						callback(ltmp_arr.node_wrong_response);
						console.log(json);
					}
				}
				catch(err){
					callback(ltmp_arr.node_wrong_response);
					console.log(err);
				}
				socket.close();
			}
			socket.onerror=function(){
				callback(ltmp_arr.node_not_respond);
			};
			socket.onopen=function(){
				socket.send('{"id":1,"method":"call","jsonrpc":"2.0","params":["database_api","get_dynamic_global_properties",[]]}');
			};
		}
		if('http'==protocol){
			callback(ltmp_arr.node_request,true);
			let xhr=new XMLHttpRequest();
			xhr.timeout=3000;
			let latency_start=new Date().getTime();
			let latency=-1;
			xhr.overrideMimeType('text/plain');
			xhr.open('POST',node);
			xhr.setRequestHeader('accept','application/json, text/plain, */*');
			xhr.setRequestHeader('content-type','application/json');
			xhr.ontimeout=function(){
				callback(ltmp_arr.node_not_respond);
			};
			xhr.onerror=function(){
				callback(ltmp_arr.node_not_respond);
			};
			xhr.onreadystatechange=function(){
				if(4==xhr.readyState && 200==xhr.status){
					latency=new Date().getTime() - latency_start;
					try{
						json=JSON.parse(xhr.responseText);
						if((typeof json.result!='undefined')&&(typeof json.result.head_block_number!='undefined')){
							update_api_gate(node,latency);
							callback(false,ltmp_arr.node_success);
						}
						else{
							callback(ltmp_arr.node_wrong_response);
							console.log(json);
							console.log(xhr);
						}
					}
					catch(err){
						callback(ltmp_arr.node_wrong_response);
						console.log(err);
					}
				}
			}
			xhr.send('{"id":1,"method":"call","jsonrpc":"2.0","params":["database_api","get_dynamic_global_properties",[]]}');
		}
		if('none'==protocol){
			callback(ltmp_arr.node_protocol_error);
		}
	}
	else{
		callback(ltmp_arr.node_empty_error);
	}
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

function gate_connection_status(){
	let view=$('.view[data-level="'+level+'"]');
	if(-1==path.indexOf('viz://')){//look in services views
		let path_parts=path.split('/');
		view=$('.view[data-path="'+path_parts[0]+'"]');
	}
	if(true===dgp_error){
		if(0==view.find('.gate-connection-error').length){
			view.find('.header').after(ltmp(ltmp_arr.gate_connection_error));
		}
	}
	else{
		$('.gate-connection-error').remove();
	}
}

var dgp_timer=0;
var dgp_error=false;
function update_dgp(auto=false){
	clearTimeout(dgp_timer);
	viz.api.getDynamicGlobalProperties(function(err,response){
		if(err){
			dgp_error=true;
		}
		if(response){
			dgp_error=false;
			dgp=response;
			console.log('new dgp:',dgp);
		}
		gate_connection_status();
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
	nsfw_warning:true,
	nsfw_hashtags:['nsfw','sex','porn'],

	save_passphrase_on_publish:false,
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

	settings.nsfw_warning=tab.find('input[name="nsfw_warning"]').prop('checked');
	let new_nsfw_hashtags=[];
	if(-1!=tab.find('input[name="nsfw_hashtags"]').val().indexOf(',')){
		new_nsfw_hashtags=tab.find('input[name="nsfw_hashtags"]').val().split(',')
	}
	new_nsfw_hashtags=new_nsfw_hashtags.map(function(value){
		return value.trim().toLowerCase().replaceAll('#','').replaceAll(' ','_').trim();
	});
	new_nsfw_hashtags=array_unique(new_nsfw_hashtags);
	new_nsfw_hashtags.sort(sort_by_length_desc);
	settings.nsfw_hashtags=new_nsfw_hashtags;
	tab.find('input[name="nsfw_hashtags"]').val(settings.nsfw_hashtags.join(', '));

	let energy_str=tab.find('input[name="energy"]').val();
	energy_str=fast_str_replace(',','.',energy_str);
	settings.energy=parseInt(parseFloat(energy_str)*100);
	settings.silent_award=tab.find('input[name="silent_award"]').prop("checked");

	settings.save_passphrase_on_publish=tab.find('input[name="save_passphrase_on_publish"]').prop("checked");

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

	view.find('input').attr('disabled','disabled');

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
				localStorage.removeItem(storage_prefix+'install_close');
				localStorage.removeItem(storage_prefix+'sync_cloud_activity');
				localStorage.removeItem(storage_prefix+'sync_cloud_update');
				render_menu();
				render_session();
				setTimeout(function(){
					view_path('dapp:account/credentials/',{},true,false);
				},1000);
			}
		};
	}
	else{
		setTimeout(function(){
			view_path('dapp:account/credentials/',{},true,false);
		},1000);
	}
}

function idb_error(e){
	console.log('IDB error',e);
	/*
	add_notify(
		false,
		ltmp_arr.notify_arr.error,
		ltmp_arr.notify_arr.idb_error
	);
	*/
	stop_timers(true);
	if(idb_init){
		setTimeout(function(){
			document.location.reload(true);
		},10000);
	}
	else{//init error
		document.write('IndexedDB error! Please wait for page reload in 15 sec.<br>Browser: '+navigator.userAgent);
		setTimeout(function(){
			document.location.reload(true);
		},15000);
	}
}

const idb=window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
const idbt=window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
const idbrkr=window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

var idb_init=false;
var db;
var db_req;
var db_version=1;
var global_db_version=10;
var need_update_db_version=false;
var local_global_db_version=parseInt(localStorage.getItem(storage_prefix+'global_db_version'));
if(isNaN(local_global_db_version)){
	local_global_db_version=0;
}
if((null===local_global_db_version)||(global_db_version>local_global_db_version)){
	console.log('Need update global_db_version:',global_db_version,', db_version: ',db_version);
	need_update_db_version=true;
	localStorage.setItem(storage_prefix+'global_db_version',global_db_version);
}
if(null!=localStorage.getItem(storage_prefix+'db_version')){
	db_version=parseInt(localStorage.getItem(storage_prefix+'db_version'));
}
//need_update_db_version=true;
console.log('db_version:',db_version,', local_global_db_version:',global_db_version,', need_update_db_version:',need_update_db_version);
if ('object' !== typeof idb){
	document.write('IndexedDB not found! Try another modern browser.');
}
else{
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
	stop_timers(true);
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
	console.log('+ load_db');
	db=false;
	db_req=false;
	db_req=idb.open(storage_prefix+'social_network',db_version);
	console.log('load_db',storage_prefix+'social_network',db_version);
	db_req.onerror=idb_error;
	db_req.onblocked=idb_error;
	db_req.onsuccess=function(event){
		console.log('onsuccess!');
		db=db_req.result;
		let check_trx_commit=db.transaction(['users'],'readwrite');
		console.log('check check_trx_commit.commit:',typeof check_trx_commit.commit);
		if('function'==typeof check_trx_commit){
			trx_need_commit=true;
		}
		db.addEventListener('versionchange',event=>{
			console.log('The version of this database has changed');
		});
		idb_init=true;
		callback();
	};
	db_req.onupgradeneeded=function(event){
		console.log('onupgradeneeded!');
		db=event.target.result;
		let update_trx = event.target.transaction;
		console.log('check update_trx.commit:',typeof update_trx.commit);
		if('function'==typeof update_trx){
			trx_need_commit=true;
		}

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
		console.log('users storage upgraded');

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
		console.log('replies storage upgraded');

		if(!db.objectStoreNames.contains('feed')){
			items_table=db.createObjectStore('feed',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('object',['account','block'],{unique:false});//account
			items_table.createIndex('time','time',{unique:false});//unixtime for delayed objects
		}
		else{
			//new index for feed
		}
		console.log('feed storage upgraded');

		if(!db.objectStoreNames.contains('notifications')){
			items_table=db.createObjectStore('notifications',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('status','status',{unique:false});//status: 0 - unreaded, 1 - readed
		}
		else{
			//new index for notifications
		}
		console.log('notifications storage upgraded');

		if(!db.objectStoreNames.contains('awards')){
			items_table=db.createObjectStore('awards',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('object',['account','block'],{unique:false});//account
		}
		else{
			//new index for awards
		}
		console.log('awards storage upgraded');

		if(!db.objectStoreNames.contains('reposts')){//store self reposts as fact only for other objects (not custom url)
			items_table=db.createObjectStore('reposts',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('object',['account','block'],{unique:true});
		}
		else{
			//new index for reposts
		}
		console.log('reposts storage upgraded');

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
		console.log('hashtags storage upgraded');

		if(!db.objectStoreNames.contains('hashtags_feed')){
			items_table=db.createObjectStore('hashtags_feed',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('tag','tag',{unique:false});//hash tag id
			items_table.createIndex('object',['account','block'],{unique:false});//account
			items_table.createIndex('tag_block',['tag','block'],{unique:false});//order by block
		}
		else{
			items_table=update_trx.objectStore('hashtags_feed');
			if(!items_table.indexNames.contains('tag_block')){
				items_table.createIndex('tag_block',['tag','block'],{unique:false});//order by block
			}
			//new index for hashtags_feed
		}
		console.log('hashtags_feed storage upgraded');

		if(!db.objectStoreNames.contains('preview')){//store previews data
			items_table=db.createObjectStore('preview',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('domain','domain',{unique:false});//domain from link to fastest search
			items_table.createIndex('time','time',{unique:false});//unixtime for clear cache
		}
		else{
			//new index for preview
		}
		console.log('preview storage upgraded');

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
		console.log('Objects storage upgraded!');

		if(!db.objectStoreNames.contains('events')){
			items_table=db.createObjectStore('events',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('event',['account','block'],{unique:true});//event
			items_table.createIndex('account','account',{unique:false});
			items_table.createIndex('time','time',{unique:false});//unixtime for stored events
			items_table.createIndex('executed',['account','executed'],{unique:false});
		}
		else{
			//items_table=update_trx.objectStore('events');
			//new index for events cache
		}
		console.log('Events storage upgraded!');

		if(!db.objectStoreNames.contains('passphrases')){//store passphrases data
			items_table=db.createObjectStore('passphrases',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('account','account',{unique:false});//one account can handle multiple passphrases
			items_table.createIndex('time','time',{unique:false});//first usage time
		}
		else{
			//new index for passphrases
		}
		console.log('Passphrases storage upgraded');

		if(trx_need_commit){
			update_trx.commit();
		}
	};
	console.log('- load_db');
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

function idb_get_count(container,index,search,filter,callback){
	//console.log('idb_get_count',container,index,search,filter);
	let count=0;
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
				let find_filter=true;
				if(false!==filter){
					find_filter=false;
					for(let filter_i in filter){
						if(cur.value[filter_i]==filter[filter_i]){
							find_filter=true;
						}
					}
				}
				if(find_filter){
					count++;
				}
				cur.continue();
			}
			else{
				callback(count);
			}
		}
	}
	else{
		callback(count);
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
		//console.log('idb_get_by_id',container,index,search);
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
					cur.continue();
				}
				else{
					if(!find){
						let add_t=db.transaction(['users'],'readwrite');
						let add_q=add_t.objectStore('users');
						add_q.add(obj);
						if(trx_need_commit){
							add_t.commit();
						}
						add_t.oncomplete=function(e){
							update_user_profile(current_user,function(){
								render_menu();
								render_session();
								document.location.hash='dapp:account/profile';
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
							render_menu();
							render_session();
							document.location.hash='dapp:account/profile';
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
var query_obj={};

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
			if(typeof ltmp_global[var_name] !== 'undefined'){
				ltmp_str=ltmp_str.split(ltmp_includes[ltmp_i]).join(ltmp(ltmp_global[var_name]));
			}
			if(typeof ltmp_editor[var_name] !== 'undefined'){
				ltmp_str=ltmp_str.split(ltmp_includes[ltmp_i]).join(ltmp(ltmp_editor[var_name]));
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

//https://www.localeplanet.com/icu/
//need localization to uk/be for local usage
var langs_arr={
	'en-gb':'en',
	'en-us':'en',
	'en':'en',
	'ru-ru':'ru',
	'ru':'ru',
	'uk-ua':'ru',
	'uk':'ru',
	'be_by':'ru',
	'be':'ru',
};
var available_langs={
	'en':'English',
	'ru':'Русский',
};
var default_lang='en';
var selected_lang=default_lang;
if(null!=localStorage.getItem(storage_prefix+'lang')){
	if(typeof available_langs[localStorage.getItem(storage_prefix+'lang')] !== 'undefined'){
		selected_lang=langs_arr[localStorage.getItem(storage_prefix+'lang')];
	}
}
else{
	let find_lang=false;
	for(let i in window.navigator.languages){
		if(typeof langs_arr[window.navigator.languages[i].toLowerCase()] !== 'undefined'){
			let try_lang=langs_arr[window.navigator.languages[i].toLowerCase()];
			if(typeof available_langs[try_lang] !== 'undefined'){
				selected_lang=langs_arr[try_lang];
				find_lang=true;
				break;
			}
		}
	}
	if(!find_lang){
		if(typeof langs_arr[window.navigator.language.toLowerCase()] !== 'undefined'){
			let try_lang=langs_arr[window.navigator.language.toLowerCase()];
			if(typeof available_langs[try_lang] !== 'undefined'){
				selected_lang=langs_arr[try_lang];
			}
		}
	}
}
var ltmp_arr=window['ltmp_'+selected_lang+'_arr'];
for(let i in window['ltmp_editor_'+selected_lang+'']){
	ltmp_editor[i]=window['ltmp_editor_'+selected_lang+''][i];
}

var menu_status='full';
if(null!=localStorage.getItem(storage_prefix+'menu_status')){
	menu_status=localStorage.getItem(storage_prefix+'menu_status');
}

function render_menu(){
	$('div.menu').html(ltmp_arr.menu_preset);
	let primary_menu='';
	if(''!=current_user){
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'viz://',class:(path=='viz://'?'current':''),icon:ltmp_global.icon_feed+ltmp(ltmp_arr.icon_counter,{name:'feed',count:'0'}),caption:ltmp_arr.menu_feed});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'dapp:notifications',class:(path=='dapp:notifications'?'current':''),icon:ltmp_global.icon_notify+ltmp(ltmp_arr.icon_counter,{name:'notifications',count:'0'}),caption:ltmp_arr.menu_notifications});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'dapp:users',class:(path=='dapp:users'?'current':''),icon:ltmp_global.icon_users,caption:ltmp_arr.menu_users});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'dapp:awards',class:(path=='dapp:awards'?'current':''),icon:ltmp_global.icon_gem,caption:ltmp_arr.menu_awards});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'dapp:hashtags',class:(path=='dapp:hashtags'?'current adaptive-show-inline':'adaptive-show-inline'),icon:ltmp_global.icon_hashtag,caption:ltmp_arr.menu_hashtags});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'dapp:app_settings',class:(path=='dapp:app_settings'?'current':''),icon:ltmp_global.icon_settings,caption:ltmp_arr.menu_app_settings});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'dapp:account',class:(path=='dapp:account'?'current':''),icon:ltmp_global.icon_account_settings,caption:ltmp_arr.menu_account_settings});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'dapp:manual',class:(path=='dapp:manual'?'current adaptive-show-inline':'adaptive-show-inline'),icon:ltmp_global.icon_question,caption:ltmp_arr.menu_manual});
		primary_menu+=ltmp(ltmp_arr.left_addon_publish_button);
		primary_menu+=ltmp_arr.menu_primary_pinned_tags;
	}
	else{
		primary_menu+=ltmp(ltmp_arr.left_addon_reg_button);
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'dapp:app_settings/languages',class:(path=='dapp:app_settings/languages'?'noauth current':'noauth'),icon:ltmp_global.icon_translate,caption:ltmp_arr.menu_languages});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'dapp:app_settings/connection',class:(path=='dapp:app_settings/connection'?'noauth current':'noauth'),icon:ltmp_global.icon_connection,caption:ltmp_arr.menu_connection});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'dapp:manual',class:(path=='dapp:manual'?'noauth current':'noauth'),icon:ltmp_global.icon_question,caption:ltmp_arr.menu_manual});
		primary_menu+=ltmp(ltmp_arr.dapp_notice);
	}
	$('div.menu .primary').html(primary_menu);
	let toggle_menu=ltmp(ltmp_arr.toggle_menu_icon,{title:ltmp_arr.toggle_menu_title,icon:('full'==menu_status?ltmp_global.icon_menu_collapse:ltmp_global.icon_menu_expand)});
	let toggle_theme=ltmp(ltmp_arr.toggle_theme_icon,{title:ltmp_arr.toggle_theme_title,icon:($('body').hasClass('light')?ltmp_global.icon_theme_sun:ltmp_global.icon_theme_moon)});
	let secondary_menu=toggle_theme+toggle_menu;
	$('div.menu .secondary').html(secondary_menu);

	if('full'!=menu_status){
		$('div.menu').addClass(menu_status);
	}

	let footer='';
	footer+=ltmp(ltmp_arr.footer_link,{class:'scroll-top-action',icon:ltmp_global.icon_scroll_top});
	if(''!=current_user){
		footer+=ltmp(ltmp_arr.footer_link,{link:'viz://',class:(path=='viz://'?'current':''),icon:ltmp_global.icon_feed+ltmp(ltmp_arr.icon_counter,{name:'feed',count:'0'}),caption:ltmp_arr.menu_feed});
		footer+=ltmp(ltmp_arr.footer_link,{link:'dapp:notifications',class:(path=='dapp:notifications'?'current':''),icon:ltmp_global.icon_notify+ltmp(ltmp_arr.icon_counter,{name:'notifications',count:'0'}),caption:ltmp_arr.menu_notifications});
		footer+=ltmp(ltmp_arr.footer_publish_button);
	}
	$('div.footer').html(footer);
}

var render_right_addon_flag=false;
function render_right_addon(){
	if(!render_right_addon_flag){
		render_right_addon_flag=true;
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
						adaptive_container_context+=ltmp(ltmp_arr.box_item,{link:'dapp:hashtags/'+hashtag_data.tag,caption:ltmp_global.icon_hashtag+uppercase_first_symbol(hashtag_data.tag)});

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
							hashtags_addon=ltmp(ltmp_arr.box_addon,{caption:ltmp_arr.hashtags_addon_caption,button:ltmp(ltmp_arr.hashtags_addon_button,{icon:ltmp_global.icon_settings}),context:hashtags_context});
							$('div.right-addon').html($('div.right-addon').html()+hashtags_addon+ltmp_arr.right_addon_links);
							render_right_addon_flag=false;
						}
					};
				}
			};
		}
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
	let link=links[0];
	if(-1!=link.indexOf(')')){
		if(-1==link.indexOf('(')){
			link=link.substring(0,link.indexOf(')'));
		}
	}
	return link;
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
function render_time_duration(sec){
	let result='';
	let min=Math.floor(sec/60);
	let hours=Math.floor(min/60);
	if(min>=1){
		sec-=(min*60);
		if(hours>=1){
			min-=(hours*60);
		}
	}
	if(sec<10){
		sec='0'+sec;
	}
	if(min<10){
		min='0'+min;
	}
	if(hours<10){
		hours='0'+hours;
	}
	if(hours>=1){
		return hours+':'+min+':'+sec;
	}
	if(min>=1){
		return min+':'+sec;
	}
	return '00:'+sec;
}
function render_preview_data(account,block,obj){
	if(typeof account == 'undefined'){
		return;
	}
	if(typeof block == 'undefined'){
		return;
	}
	if(typeof obj.meta == 'undefined'){
		return;
	}
	let json=obj.meta;
	if(false===json){
		if(typeof obj.mime !== 'undefined'){
			if(obj.mime.match(/image\/gif/)){
				let current_link='viz://@'+account+'/'+block+'/';
				let view=$('.view[data-level="'+level+'"]');
				if(-1==path.indexOf('viz://')){//look in services views
					let path_parts=path.split('/');
					view=$('.view[data-path="'+path_parts[0]+'"]');
				}
				let actions=view.find('.objects .object[data-link="'+current_link+'"] .preview-container');
				let result='';

				result=ltmp(ltmp_arr.render_preview_wrapper,{link:obj.link,context:ltmp(ltmp_arr.render_preview_image,{addon:' style="max-height:100vh"',image:safe_image(obj.link)})});
				$(actions).html(result);
			}
			else
			if(obj.mime.match(/audio.*/)){
				let result='';
				let player=ltmp(ltmp_arr.render_audio_player,{link:obj.link,mime:obj.mime});
				result=ltmp(ltmp_arr.render_audio_wrapper,{context:player});

				let current_link='viz://@'+account+'/'+block+'/';
				let view=$('.view[data-level="'+level+'"]');
				if(-1==path.indexOf('viz://')){//look in services views
					let path_parts=path.split('/');
					view=$('.view[data-path="'+path_parts[0]+'"]');
				}
				let actions=view.find('.objects .object[data-link="'+current_link+'"] .preview-container');
				$(actions).html(result);
				$(actions).find('.audio-source').off('timeupdate');
				$(actions).find('.audio-source').on('timeupdate',function(e){
					let audio=e.srcElement;
					let player=$(audio).closest('.audio-player');
					let time=Math.ceil(audio.currentTime);
					let duration=Math.ceil(audio.duration);
					if(0==time){
						time='&mdash;';
					}
					let percent=0;
					if(isNaN(duration)){
						duration='&mdash;';
						$(player).find('.audio-progress').attr('aria-valuemax',0);
						$(player).find('.audio-progress').attr('aria-valuenow',0);
					}
					else{
						$(player).find('.audio-progress').attr('aria-valuemax',duration);
						$(player).find('.audio-progress').attr('aria-valuenow',time);
						percent=100*time/duration;
					}
					$(player).find('.audio-progress').attr('aria-valuetext',render_time_duration(time));

					$(player).find('.audio-progress .fill-level').css('width',percent+'%');
					if(typeof duration === 'number'){
						$(player).find('time').html(render_time_duration(time)+' / '+render_time_duration(duration));
					}
					else{
						$(player).find('time').html(time+' / '+duration);
					}
					$(player).find('time').attr('title',ltmp_arr.audio_player_duration_caption+' '+render_time_duration(duration));
					if(audio.ended){
						$(player).find('.audio-toggle-action').html(ltmp_global.icon_player_play);
						$(player).find('.audio-toggle-action').attr('title',ltmp_arr.audio_player_play_caption);
					}
				});
				$(actions).find('.audio-source')[0].load();
				$(actions).find('.audio-progress').on('click',function(e){
					let player=$(this).closest('.audio-player');
					let audio=player.find('.audio-source')[0];
					let duration=Math.ceil(audio.duration);
					let percent=e.offsetX/$(actions).find('.audio-progress').innerWidth();
					audio.currentTime=parseFloat(Math.floor(percent*duration));
					$(player).find('.audio-toggle-action').html(ltmp_global.icon_player_pause);
					audio.play();
				});
			}
		}
		else{//no meta, no mime - timeout preview
			let current_link='viz://@'+account+'/'+block+'/';
			let view=$('.view[data-level="'+level+'"]');
			if(-1==path.indexOf('viz://')){//look in services views
				let path_parts=path.split('/');
				view=$('.view[data-path="'+path_parts[0]+'"]');
			}
			let actions=view.find('.objects .object[data-link="'+current_link+'"] .preview-container');
			let result='';

			let wrapper_addon=' style="flex-direction:column;"';
			let link=ltmp(ltmp_arr.render_preview_link,{title:'',descr:'',source:ltmp_global.icon_link+obj.domain});
			result=ltmp(ltmp_arr.render_preview_wrapper,{link:obj.link,context:link,addon:wrapper_addon});
			$(actions).html(result);
		}
		return;
	}
	let result='';
	let image='';
	let link='';
	let image_part=false;
	let link_part=false;
	if(typeof json !== 'undefined'){
		if(typeof json.image !== 'undefined'){
			if(false!==json.image){
				image_part=true;
			}
		}
		if(typeof json.title !== 'undefined'){
			link_part=true;
		}
	}
	let link_image_addon=' style="flex-shrink:1;flex-direction:column;width:30%;"';
	let link_addon=' style="flex-shrink:0;flex-grow:1;flex-direction:column;width:70%;"';
	let wrapper_addon=' style="flex-direction:column;"';
	//console.log('render_preview_data',json);
	if(link_part){
		if(image_part){
			if(!json.image.large){
				link=ltmp(ltmp_arr.render_preview_link,{addon:link_addon,title:json.title,descr:(typeof json.description !== 'undefined'?json.description:''),source:ltmp_global.icon_link+json.source});
			}
			else{
				link=ltmp(ltmp_arr.render_preview_link,{title:json.title,descr:(typeof json.description !== 'undefined'?json.description:''),source:ltmp_global.icon_link+json.source});
			}
		}
		else{
			link=ltmp(ltmp_arr.render_preview_link,{title:json.title,descr:(typeof json.description !== 'undefined'?json.description:''),source:ltmp_global.icon_link+json.source});
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

	let link_domain=link.split('://')[1].split('/')[0];

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
				callback(find);
			}
			else{
				console.log('need load preview',link_domain,link);
				let xhr = new XMLHttpRequest();
				xhr.timeout=5000;
				xhr.overrideMimeType('text/plain');
				xhr.open('POST',preview_url);
				xhr.setRequestHeader('accept','application/json, text/plain, */*');
				xhr.setRequestHeader('content-type','application/json');
				xhr.ontimeout = function() {
					console.log('load_preview_data timeout',link);
					let add_t=db.transaction(['preview'],'readwrite');
					let add_q=add_t.objectStore('preview');
					let obj={
						domain:link_domain,
						link:link,
						meta:false,
						time:parseInt(new Date().getTime()/1000),
					};
					add_q.add(obj);
					if(trx_need_commit){
						add_t.commit();
					}
					callback(obj);
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
							if(typeof json.mime !== 'undefined'){
								obj['mime']=json.mime;
							}
							add_q.add(obj);
							if(trx_need_commit){
								add_t.commit();
							}
							callback(obj);
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
				let auth_data=passwordless_auth(current_user,users[current_user].regular_key);
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
		result=ltmp_global.profile_default_avatar;
	}
	return result;
}

var user_profile=false;
function render_session(){
	let toggle_menu=ltmp(ltmp_arr.toggle_menu,{title:ltmp_arr.toggle_menu_title,icon:ltmp_global.icon_close});
	if(''!=current_user){
		get_user(current_user,false,function(err,result){
			if(!err){
				if(false===user_profile){
					user_profile=JSON.parse(result.profile);
				}
				$('div.menu .session').html(toggle_menu+ltmp(ltmp_arr.menu_session_account,{'account':result.account,'nickname':user_profile.nickname,'avatar':safe_avatar(user_profile.avatar)}));
			}
			else{
				$('div.menu .session').html(toggle_menu+ltmp(ltmp_arr.menu_session_empty,{caption:ltmp_arr.menu_session_error,avatar:ltmp_global.profile_default_avatar}));
			}
		});
	}
	else{
		$('div.menu .session').html(toggle_menu+ltmp(ltmp_arr.menu_session_empty,{caption:ltmp_arr.menu_session_login,avatar:ltmp_global.signin_image}));
	}
}

function award(account,block,callback){
	idb_get_by_id('objects','object',[account,block],function(object){
		let link='viz://@'+account+'/'+block+'/';
		let beneficiaries_list=[];
		let energy=settings.energy;
		let memo=link;
		if(settings.silent_award){
			memo='';
		}
		let new_energy=0;
		if(false!==object){
			if(typeof object.data !== 'undefined'){
				if(typeof object.data.d !== 'undefined'){
					if(typeof object.data.d.b !== 'undefined'){
						beneficiaries_list=object.data.d.b;
					}
				}
			}
		}
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
									if(trx_need_commit){
										add_t.commit();
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
				get_object(current_user,result.start,false,function(err,object_result){
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

//load exact event, increase counter for event queue num, set to execute it
function load_event(queue_num,account,event_block){
	console.log('load_event queue_num',queue_num,account,event_block);
	let t,q,req;
	t=db.transaction(['events'],'readonly');
	q=t.objectStore('events');
	req=q.index('event').openCursor(IDBKeyRange.only([account,event_block]),'next');

	let find=false;
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			find=true;
			let result=cur.value;
			if(0==result.executed){
				execute_events_queue[queue_num][0]++;//increase counter
				setTimeout(function(){
					execute_event(result,queue_num);
				},execute_events_queue[queue_num][0]*execute_events_queue_time_offset);
			}
			else{
				//ignore, already executed
			}
			cur.continue();
		}
		else{
			if(!find){
				execute_events_queue[queue_num][0]++;//increase counter for all queue wait parsing callback
				//need to parse event from custom account and block num and try again with load_event
				parse_event(account,event_block,function(err,result){
					execute_events_queue[queue_num][0]--;//decrease counter for all queue
					if(err){
						//no event found, no matter for reason
						if(1==result){//node error
							add_notify(false,'',ltmp_arr.gateway_error);
						}
						if(2==result){//event not found, show notice
							add_notify(false,'',ltmp_arr.event_not_found+' ['+event_block+']');
						}
						//if event not exist, not found and there is no more other events need to callback
						if(execute_events_queue[queue_num][0]==0){
							//return to queue callback
							execute_events_queue[queue_num][1]();
							execute_events_queue[queue_num]=false;//remove callback after initiate
						}
					}
					else{
						//try execute again already parsed event
						load_event(queue_num,account,event_block);
					}
				});
			}
			else{
				//if searched event exists and already executed, they dont trigger events_queue_finish, but needed
				if(execute_events_queue[queue_num][0]==0){
					//return to queue callback
					execute_events_queue[queue_num][1]();
					execute_events_queue[queue_num]=false;//remove callback after initiate
				}
			}
			//New: wait events_queue_finish() with event update and trigger callback if counter changed to zero
		}
	};
}

var load_events_timer=0;
//events must be in sorted array
function load_events(account,events,callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	console.log('load_events tick with account',account,events);
	idb_get_by_id('users','account',account,function(user_data){//check user exist
		//console.log('check user exist',user_data);
		if(false!==user_data){//if user was found
			//need to create queue for events from array with callback
			let queue_num=execute_events_queue_num;
			execute_events_queue[queue_num]=[0,callback];//init zero counter
			execute_events_queue_num++;
			console.log('load_events create execute_events_queue',queue_num);
			for(let i in events){
				let event_block=parseInt(events[i]);
				load_event(queue_num,account,event_block);
			}
			//then go to events_queue_finish which trigger callback
		}
		else{
			get_user(account,false,function(check_err,check_result){
				if(!check_err){//user parsed? try again
					load_events_timer=setTimeout(function(){
						load_events(account,events,callback);
					},100);
				}
				else{//account was not found? impossible but trackable
					callback(false);
				}
			});
		}
	});
}

var wait_new_event_timer=0;
function wait_new_event(account,last_id,callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	console.log('wait_new_event tick with last_id',last_id);
	clearTimeout(wait_new_event_timer);
	idb_get_by_id('users','account',account,function(user_data){//check user exist
		//console.log('check user exist',user_data);
		if(false!==user_data){//if user was found
			update_user_last_event(account,function(last_event){//update events_protocol block num
				console.log('update_user_last_event in wait_new_event return',last_event);
				let need_wait=true;
				if(false!==last_event){//not error
					if(last_event>0){//not empty
						if(last_event>last_id){//more than last known event
							need_wait=false;
						}
					}
				}
				if(need_wait){
					console.log('wait_new_event need_wait with last_event',last_event,'last_id',last_id);
					wait_new_event_timer=setTimeout(function(){
						wait_new_event(account,last_id,callback);
					},1000);
				}
				else{
					console.log('wait_new_event finish with',last_event);
					callback(last_event);
				}
			});
		}
		else{
			get_user(account,false,function(check_err,check_result){
				if(!check_err){
					wait_new_event_timer=setTimeout(function(){
						wait_new_event(account,last_id,callback);
					},1000);
				}
				else{//current user not found? impossible but trackable
					callback(false);
				}
			});
		}
	});
}

let events_affected_objects={};//a:[b,b,b],c:[b,b],clear after callback
//mark executed/errors events, trigger callback if all events was executed
//affected_object=[a,b], need to put it in events_affected_objects and to callback it (for auto refresh objects view)
function events_queue_finish(event_account_locker,event_object_id,execution,queue_num,affected_object,error_reason){
	error_reason=typeof error_reason === 'undefined'?'error':error_reason;
	console.log('events_queue_finish queue_num',queue_num,'counter was',execute_events_queue[queue_num][0],'event_object_id',event_object_id,execution)
	execute_events_queue[queue_num][0]--;//decrease queue counter

	let t,q,req;
	t=db.transaction(['events'],'readwrite');
	q=t.objectStore('events');
	req=q.openCursor(IDBKeyRange.only(event_object_id),'next');

	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			let result=cur.value;
			if(execution){//true means not errors at all
				result.executed=1;
				if(typeof affected_object !== 'undefined'){
					if(typeof events_affected_objects[affected_object[0]] === 'undefined'){
						events_affected_objects[affected_object[0]]=[];
					}
					events_affected_objects[affected_object[0]].push(affected_object[1]);
				}
			}
			else{//any error on execution?
				result.executed=1;
				if(typeof result.errors === 'undefined'){
					result.errors=[];
				}
				result.errors.push(error_reason);
			}
			cur.update(result);
			cur.continue();
		}
		else{
			execute_event_locker[event_account_locker]=false;//release the event queue execution
			//New: wait events_queue_finish() with event update and trigger callback if counter changed to zero
			if(execute_events_queue[queue_num][0]==0){
				if(typeof affected_object !== 'undefined'){
					//return to load_events
					execute_events_queue[queue_num][1](events_affected_objects[affected_object[0]]);
					delete events_affected_objects[affected_object[0]];//clear affected objects for specific account
				}
				else{
					execute_events_queue[queue_num][1]();
				}
				execute_events_queue[queue_num]=false;//remove callback after initiate
			}
		}
	};
}

function clear_hashtag_object(account,block,callback){
	//delete object from hashtags_feed and update decrease hashtag counter
	let hashtags_arr=[];
	let upd_t,upd_q,upd_req;
	upd_t=db.transaction(['hashtags_feed'],'readwrite');
	upd_q=upd_t.objectStore('hashtags_feed');
	upd_req=upd_q.index('object').openCursor(IDBKeyRange.only([account,parseInt(block)]),'next');
	upd_req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			let result=cur.value;
			console.log('clear_hashtag_object find and delete',result);
			hashtags_arr.push(result.tag);
			cur.delete();
			cur.continue();
		}
		else{
			console.log('clear_hashtag_object decrease counter',hashtags_arr);

			for(let i in hashtags_arr){
				let hashtag_id=hashtags_arr[i];
				let upd_t,upd_q,upd_req;
				upd_t=db.transaction(['hashtags'],'readwrite');
				upd_q=upd_t.objectStore('hashtags');
				upd_req=upd_q.openCursor(IDBKeyRange.only(hashtag_id),'next');
				upd_req.onsuccess=function(event){
					let cur=event.target.result;
					if(cur){
						let result=cur.value;
						result.count--;
						cur.update(result);
						cur.continue();
					}
					else{
						setTimeout(function(){render_right_addon();},10);
					}
				};
			}

			callback();
		}
	};
}

function check_event_is_newest(event_object,callback){
	let check_account=event_object.account;
	/*
	//Old bad code? Don't need to check and get data.a, it's not checking target account newest event, only initiator
	//May be the cause of a bug in the future when event type will target to not initiator account
	if(typeof event_object.data.a !== 'undefined'){
		if(typeof event_object.data.a === 'string'){
			check_account=event_object.data.a;//check affected object account
		}
	}
	*/
	let check_event_block=event_object.block;//check only newest events with higher block num
	let check_block_num=parseInt(event_object.data.b);//check affected object block
	let check_event_type=event_object.data.e;//check same event type
	if('a'==check_event_type){//add event don't need to be checked, because it has increment execution
		console.log('check_event_is_newest ignored because event type',event_object);
		callback(true);
	}

	let is_newest=true;
	let cursor_end=false;

	let t,q,req;
	t=db.transaction(['events'],'readonly');
	q=t.objectStore('events');
	req=q.index('event').openCursor(IDBKeyRange.upperBound([check_account,Number.MAX_SAFE_INTEGER]),'prev');
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cursor_end){
			cur=false;
			console.log('check_event_is_newest search end');
		}
		if(cur){
			console.log('check_event_is_newest search',cur.value);
			/*
			if(check_account==cur.value.data.a){
				if(check_block_num==cur.value.data.b){
					if(check_event_type==cur.value.data.e){
						if(check_event_block<cur.value.block){
							is_newest=false;
							cursor_end=true;
						}
					}
				}
			}
			else{
				cursor_end=true;
			}
			*/
			let cur_account=cur.value.account;
			if(typeof cur.value.data.a !== 'undefined'){
				cur_account=cur.value.data.a;//it can be cropped, if initiator the same
			}
			if(check_event_block>=cur.value.block){//same block num or greater? not check at all, just end
				cursor_end=true;
			}
			else{
				if(check_account==cur_account){//same affected object account?
					if(check_block_num==cur.value.data.b){//same affected object block?
						if(check_event_type==cur.value.data.e){//same event type?
							if(check_event_block<cur.value.block){
								//if current event check_event_block is lower than cursor event
								is_newest=false;
								cursor_end=true;
							}
						}
					}
				}
				else{//other account? end
					cursor_end=true;
				}
			}
			cur.continue();
		}
		else{
			console.log('check_event_is_newest ended is_newest?',event_object,is_newest);
			callback(is_newest);
		}
	};
}

let execute_event_locker={};
let execute_event_locker_time_offset=100;//ms for each execute retry
function execute_event(event_object,queue_num){
	//loop locker for accounts
	if(typeof execute_event_locker[event_object.account] !== 'undefined'){
		if(true===execute_event_locker[event_object.account]){
			setTimeout(function(){
				execute_event(event_object,queue_num);
			},execute_event_locker_time_offset);
		}
		else{
			execute_event_locker[event_object.account]=true;
		}
	}
	//need to check current event - it is the last with same event-type?
	//if found known and most fresh event, then ignore current event and mark it as executed and "late", not as error
	if(0==event_object.executed){
		check_event_is_newest(event_object,function(is_newest){
			if(is_newest){
				if('h'==event_object.data.e){//hide
					if(typeof event_object.data.a === 'undefined'){//if not account specified in data:a, means initiator
						event_object.data.a=event_object.account;
					}
					if(typeof event_object.data.b === 'undefined'){
						events_queue_finish(event_object.account,event_object.id,false,queue_num);//error result, block not specified
					}
					if(event_object.account!=event_object.data.a){
						events_queue_finish(event_object.account,event_object.id,false,queue_num);//error result, initiator try hide other account object
					}

					get_object(event_object.data.a,event_object.data.b,false,function(err,object_result){//parse object if new
						if(!err){
							let t,q,req;
							t=db.transaction(['objects'],'readwrite');
							q=t.objectStore('objects');
							req=q.index('object').openCursor(IDBKeyRange.only([event_object.data.a,event_object.data.b]),'next');

							let find=false;
							req.onsuccess=function(event){
								let cur=event.target.result;
								if(cur){
									let result=cur.value;

									//check events array, return if already executed for object (prevent event actions)
									if(typeof result.events === 'undefined'){
										result.events=[];
									}
									else{
										if(-1!=result.events.indexOf(event_object.block)){
											//events_queue_finish(event_object.account,event_object.id,false,queue_num,[],'already in events array');//rewrite positive result if executed in second queue
											events_queue_finish(event_object.account,event_object.id,true,queue_num,[event_object.data.a,event_object.data.b]);//can be triggered again
											return;
										}
									}
									result.events.push(event_object.block);

									result.hidden=1;
									cur.update(result);
									find=true;
								}
								if(find){
									events_queue_finish(event_object.account,event_object.id,true,queue_num,[event_object.data.a,event_object.data.b]);//object was found
								}
								else{
									events_queue_finish(event_object.account,event_object.id,false,queue_num);//not found object
								}
							};
						}
						else{
							events_queue_finish(event_object.account,event_object.id,false,queue_num);//not found object
						}
					});
				}
				if('a'==event_object.data.e){//add
					if(typeof event_object.data.a === 'undefined'){//if not account specified in data:a, means initiator
						event_object.data.a=event_object.account;
					}
					if(typeof event_object.data.b === 'undefined'){
						events_queue_finish(event_object.account,event_object.id,false,queue_num);//error result, block not specified
					}
					if(event_object.account!=event_object.data.a){
						events_queue_finish(event_object.account,event_object.id,false,queue_num);//error result, initiator try hide other account object
					}

					get_object(event_object.data.a,event_object.data.b,false,function(err,object_result){//parse object if new
						if(!err){
							let t,q,req;
							t=db.transaction(['objects'],'readwrite');
							q=t.objectStore('objects');
							req=q.index('object').openCursor(IDBKeyRange.only([event_object.data.a,event_object.data.b]),'next');

							let find=false;
							let need_update_context=true;//rebuild hashtags and nsfw params
							req.onsuccess=function(event){
								let cur=event.target.result;
								if(cur){
									let result=cur.value;

									//check events array, return if already executed for object (prevent event actions)
									if(typeof result.events === 'undefined'){
										result.events=[];
									}
									else{
										if(-1!=result.events.indexOf(event_object.block)){
											//events_queue_finish(event_object.account,event_object.id,false,queue_num,[],'already in events array');//rewrite positive result if executed in second queue
											events_queue_finish(event_object.account,event_object.id,true,queue_num,[event_object.data.a,event_object.data.b]);//can be triggered again
											return;
										}
									}
									result.events.push(event_object.block);

									/* add history for object d/data */
									if(typeof result.history === 'undefined'){
										result.history={};
										result.history[event_object.data.b]={t:'o',d:Object.assign({},result.data.d)};//origin
									}
									result.history[event_object.block]={t:'a',d:Object.assign({},event_object.data.d)};//add

									/* restore the integrity of the object from history */
									result.data.d={};
									for(let i in result.history){
										let history_el=Object.assign({},result.history[i]);
										if('o'==history_el['t']){
											result.data.d=Object.assign({},history_el['d']);
										}
										if('e'==history_el['t']){
											result.data.d=Object.assign({},history_el['d']);
										}
										if('a'==history_el['t']){
											for(let j in history_el['d']){
												if(typeof result.data.d[j] === 'undefined'){
													result.data.d[j]='';
												}
												result.data.d[j]+=history_el['d'][j];
											}
										}
									}

									//object update time
									if(typeof result.update_time !== 'undefined'){
										if(parseInt(result.update_time)<parseInt(event_object.time)){
											result.update_time=event_object.time;
										}
									}
									else{
										result.update_time=event_object.time;
									}

									if(need_update_context){
										let nsfw=result.nsfw;

										let type='text';//check type
										if(typeof result.data.t !== 'undefined'){
											if(-1!=object_types_list.indexOf(result.data.t)){
												if(typeof object_types_arr[result.data.t] !== 'undefined'){
													type=object_types_arr[result.data.t];
												}
												else{
													type=result.data.t;
												}
											}
										}
										/* hashtags support */
										//need replace url with hash to avoid conflict
										let hashtags_text='none';
										if('text'==type){
											hashtags_text=result.data.d.text;
											if(typeof result.data.d.text !== 'undefined'){
												hashtags_text=result.data.d.text;
											}
											else{
												if(typeof result.data.d.t !== 'undefined'){
													hashtags_text=result.data.d.t;
												}
											}
										}
										if('publication'==type){
											hashtags_text=markdown_clear_code(result.data.d.m);//markdown
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

										let hashtags_pattern = /(|\b)#([^:;@#!.,?\r\n\t <>()\[\]]+)(|\b)/g;;
										let hashtags_links=hashtags_text.match(hashtags_pattern);
										if(null!=hashtags_links){
											hashtags_links=hashtags_links.map(function(value){
												return value.toLowerCase();
											});
											hashtags_links=array_unique(hashtags_links);

											console.log('execute event object hashtags',hashtags_links,result.account,result.block);
											clear_hashtag_object(result.account,result.block,function(){
												console.log('execute event after clear_hashtag_object object hashtags',hashtags_links);
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
																if(trx_need_commit){
																	hashtag_add_t.commit();
																}
																hashtag_add_req.onsuccess=function(e){
																	idb_get_id('hashtags','tag',hashtag,function(hashtag_id){
																		if(false!==hashtag_id){
																			add_hashtag_object(hashtag_id,result.account,result.block);
																		}
																	});
																}
															}
															else{
																add_hashtag_object(hashtag_id,result.account,result.block);
															}
														});
													}
												}
											});
										}

										/* check nsfw hashtags in object texts */
										let nsfw_text='';
										if('text'==type){
											if(typeof result.data.d.text !== 'undefined'){
												nsfw_text=result.data.d.text;
											}
											else{
												if(typeof result.data.d.t !== 'undefined'){
													nsfw_text=result.data.d.t;
												}
											}
										}
										if('publication'==type){
											nsfw_text=markdown_clear_code(result.data.d.m);//markdown
											nsfw_text=markdown_decode_text(nsfw_text);
											let mnemonics_pattern = /&#[a-z0-9\-\.]+;/g;
											nsfw_text=nsfw_text.replace(mnemonics_pattern,'');//remove unexpected html mnemonics
										}
										for(let i in settings.nsfw_hashtags){
											let search_hashtag='#'+settings.nsfw_hashtags[i];
											if(-1!=nsfw_text.indexOf(search_hashtag)){
												nsfw=1;
											}
										}
										if(nsfw!=result.nsfw){
											result.nsfw=nsfw;
										}
									}

									cur.update(result);
									find=true;
								}
								if(find){
									events_queue_finish(event_object.account,event_object.id,true,queue_num,[event_object.data.a,event_object.data.b]);//object was found
								}
								else{
									events_queue_finish(event_object.account,event_object.id,false,queue_num);//not found object
								}
							};
						}
						else{
							events_queue_finish(event_object.account,event_object.id,false,queue_num);//not found object
						}
					});
				}
				if('e'==event_object.data.e){//edit
					if(typeof event_object.data.a === 'undefined'){//if not account specified in data:a, means initiator
						event_object.data.a=event_object.account;
					}
					if(typeof event_object.data.b === 'undefined'){
						events_queue_finish(event_object.account,event_object.id,false,queue_num);//error result, block not specified
					}
					if(event_object.account!=event_object.data.a){
						events_queue_finish(event_object.account,event_object.id,false,queue_num);//error result, initiator try hide other account object
					}

					get_object(event_object.data.a,event_object.data.b,false,function(err,object_result){//parse object if new
						if(!err){
							let t,q,req;
							t=db.transaction(['objects'],'readwrite');
							q=t.objectStore('objects');
							req=q.index('object').openCursor(IDBKeyRange.only([event_object.data.a,event_object.data.b]),'next');

							let find=false;
							let need_update_context=false;//if object was already updated newest event, then ignore
							req.onsuccess=function(event){
								let cur=event.target.result;
								if(cur){
									let result=cur.value;

									//check events array, return if already executed for object (prevent event actions)
									if(typeof result.events === 'undefined'){
										result.events=[];
									}
									else{
										if(-1!=result.events.indexOf(event_object.block)){
											//events_queue_finish(event_object.account,event_object.id,false,queue_num,[],'already in events array');//rewrite positive result if executed in second queue
											events_queue_finish(event_object.account,event_object.id,true,queue_num,[event_object.data.a,event_object.data.b]);//can be triggered again
											return;
										}
									}
									result.events.push(event_object.block);

									/* add history for object d/data */
									if(typeof result.history === 'undefined'){
										result.history={};
										result.history[event_object.data.b]={t:'o',d:Object.assign({},result.data.d)};//origin
									}
									result.history[event_object.block]={t:'e',d:Object.assign({},event_object.data.d)};//edit

									/* restore the integrity of the object from history */
									result.data.d={};
									for(let i in result.history){
										let history_el=Object.assign({},result.history[i]);
										if('o'==history_el['t']){
											result.data.d=Object.assign({},history_el['d']);
										}
										if('e'==history_el['t']){
											result.data.d=Object.assign({},history_el['d']);
										}
										if('a'==history_el['t']){
											for(let j in history_el['d']){
												if(typeof result.data.d[j] === 'undefined'){
													result.data.d[j]='';
												}
												result.data.d[j]+=history_el['d'][j];
											}
										}
									}

									//object update time
									if(typeof result.update_time !== 'undefined'){
										if(parseInt(result.update_time)<parseInt(event_object.time)){
											result.update_time=event_object.time;
											need_update_context=true;
										}
									}
									else{
										result.update_time=event_object.time;
										need_update_context=true;
									}
									if(need_update_context){
										//need to update share/reply statuses, hashtags, nsfw
										let reply=false;
										let share=false;
										let share_link=false;
										let nsfw=result.nsfw;

										let parent_account=false;
										let parent_block=false;

										let type='text';//check type
										if(typeof event_object.data.t !== 'undefined'){
											if(-1!=object_types_list.indexOf(event_object.data.t)){
												if(typeof object_types_arr[event_object.data.t] !== 'undefined'){
													type=object_types_arr[event_object.data.t];
												}
												else{
													type=event_object.data.t;
												}
											}
										}
										if('text'==type){
											if(typeof event_object.data.d.r !== 'undefined'){
												let reply_link=event_object.data.d.r;
												if(typeof reply_link !== 'string'){
													reply_link='';
												}
												//internal
												if(0==reply_link.indexOf('viz://')){
													reply_link=reply_link.toLowerCase();
													reply_link=escape_html(reply_link);
													let reply_account=reply_link.match(account_pattern);
													if(typeof reply_account[0] != 'undefined'){
														let reply_block=reply_link.match(block_pattern);
														if(typeof reply_block[0] != 'undefined'){
															reply=true;
															parent_account=reply_account[0].substr(1);
															parent_block=parseInt(fast_str_replace('/','',reply_block[0]));
														}
													}
												}
											}
											else
											if(typeof event_object.data.d.s != 'undefined'){
												share_link=event_object.data.d.s;
												if(typeof share_link !== 'string'){
													share_link='';
												}
												//internal
												if(0==share_link.indexOf('viz://')){
													share_link=share_link.toLowerCase();
													share_link=escape_html(share_link);
													let share_account=share_link.match(account_pattern);
													if(typeof share_account[0] != 'undefined'){
														let share_block=share_link.match(block_pattern);
														if(typeof share_block[0] != 'undefined'){
															share=true;
															parent_account=share_account[0].substr(1);
															parent_block=parseInt(fast_str_replace('/','',share_block[0]));
														}
													}
												}
												//external
												if((0==share_link.indexOf('http://'))||(0==share_link.indexOf('https://'))){
													share=true;
												}
											}
										}
										if('text'==type){
											if(reply){
												result.is_reply=1;
												result.parent_account=parent_account;
												result.parent_block=parent_block;
											}
											if(share){
												result.is_share=1;
												if(false!==parent_account){
													result.parent_account=parent_account;
													result.parent_block=parent_block;
												}
												else{
													result.link=share_link;
												}
											}
										}

										/* hashtags support */
										//need replace url with hash to avoid conflict
										let hashtags_text='none';
										if('text'==type){
											hashtags_text=event_object.data.d.text;
											if(typeof event_object.data.d.text !== 'undefined'){
												hashtags_text=event_object.data.d.text;
											}
											else{
												if(typeof event_object.data.d.t !== 'undefined'){
													hashtags_text=event_object.data.d.t;
												}
											}
										}
										if('publication'==type){
											hashtags_text=markdown_clear_code(event_object.data.d.m);//markdown
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

										let hashtags_pattern = /(|\b)#([^:;@#!.,?\r\n\t <>()\[\]]+)(|\b)/g;;
										let hashtags_links=hashtags_text.match(hashtags_pattern);
										if(null!=hashtags_links){
											hashtags_links=hashtags_links.map(function(value){
												return value.toLowerCase();
											});
											hashtags_links=array_unique(hashtags_links);

											console.log('execute event object hashtags',hashtags_links,result.account,result.block);
											clear_hashtag_object(result.account,result.block,function(){
												console.log('execute event after clear_hashtag_object object hashtags',hashtags_links);
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
																if(trx_need_commit){
																	hashtag_add_t.commit();
																}
																hashtag_add_req.onsuccess=function(e){
																	idb_get_id('hashtags','tag',hashtag,function(hashtag_id){
																		if(false!==hashtag_id){
																			add_hashtag_object(hashtag_id,result.account,result.block);
																		}
																	});
																}
															}
															else{
																add_hashtag_object(hashtag_id,result.account,result.block);
															}
														});
													}
												}
											});
										}

										/* check nsfw hashtags in object texts */
										let nsfw_text='';
										if('text'==type){
											if(typeof event_object.data.d.text !== 'undefined'){
												nsfw_text=event_object.data.d.text;
											}
											else{
												if(typeof event_object.data.d.t !== 'undefined'){
													nsfw_text=event_object.data.d.t;
												}
											}
										}
										if('publication'==type){
											nsfw_text=markdown_clear_code(event_object.data.d.m);//markdown
											nsfw_text=markdown_decode_text(nsfw_text);
											let mnemonics_pattern = /&#[a-z0-9\-\.]+;/g;
											nsfw_text=nsfw_text.replace(mnemonics_pattern,'');//remove unexpected html mnemonics
										}
										for(let i in settings.nsfw_hashtags){
											let search_hashtag='#'+settings.nsfw_hashtags[i];
											if(-1!=nsfw_text.indexOf(search_hashtag)){
												nsfw=1;
											}
										}
										if(nsfw!=result.nsfw){
											result.nsfw=nsfw;
										}
									}
									cur.update(result);
									find=true;
								}
								if(find){
									events_queue_finish(event_object.account,event_object.id,true,queue_num,[event_object.data.a,event_object.data.b]);//object was found
								}
								else{
									events_queue_finish(event_object.account,event_object.id,false,queue_num);//not found object
								}
							};
						}
						else{
							events_queue_finish(event_object.account,event_object.id,false,queue_num);//not found object
						}
					});
				}
			}
			else{
				events_queue_finish(event_object.account,event_object.id,false,queue_num,[],'late');//event is late (found newest with same event type)
			}
		});
	}
	else{
		events_queue_finish(event_object.account,event_object.id,false,queue_num,[],'executed');//event is late (found newest with same event type)
	}
}
var execute_events_queue=[];
var execute_events_queue_num=0;
var execute_events_queue_time_offset=100;
function execute_events(account,callback){
	let t,q,req;
	t=db.transaction(['events'],'readonly');
	q=t.objectStore('events');
	req=q.index('account').openCursor(IDBKeyRange.only(account),'next');

	let queue_num=execute_events_queue_num;
	execute_events_queue[queue_num]=[0,callback];//init zero counter
	execute_events_queue_num++;
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			let result=cur.value;
			if(0==result.executed){
				execute_events_queue[queue_num][0]++;//increase counter
				setTimeout(function(){
					execute_event(result,queue_num);
				},execute_events_queue[queue_num][0]*execute_events_queue_time_offset);
			}
			else{
				//ignore
			}
			cur.continue();
		}
		else{
			//New: wait events_queue_finish() with event update and trigger callback if counter changed to zero
		}
	};
}
function finish_parse_events(account,object_block,event,events_count){
	if(0==events_count){//error?
		add_notify(false,'',ltmp_arr.gateway_error);
	}
	else{
		execute_events(account,function(){
			if('h'==event){
				view_path('viz://@'+account+'/',{},true,false);
			}
			else{
				view_path('viz://@'+account+'/'+object_block+'/',{},true,false);
			}
		});
	}
}
function continuous_parse_event(account,object_block,block,event,last_block,count,callback){
	count=typeof count!=='undefined'?count:0;
	parse_event(account,block,function(err,result_event){
		if(!err){
			count++;
			if(result_event.data.p>last_block){
				continuous_parse_event(account,object_block,result_event.data.p,event,last_block,count,callback);
			}
			else{
				callback(account,object_block,event,count);
			}
		}
		else{
			callback(account,object_block,event,count);
		}
	});
}
function voice_event(el,object_account,object_block,event,data){
	el=typeof el==='undefined'?'.not-exist':el;
	object_account=typeof object_account==='undefined'?false:current_user;
	object_block=typeof object_block==='undefined'?0:object_block;
	object_block=parseInt(object_block);
	event=typeof event==='undefined'?'':event;
	data=typeof data==='undefined'?false:data;

	if(''==event){
		add_notify(false,'',ltmp_arr.gateway_error);
		$(el).removeClass('disabled');
		return;
	}

	viz.api.getAccount(current_user,events_protocol,function(err,response){
		if(err){
			console.log(err);
			add_notify(false,'',ltmp_arr.gateway_error);
			$(el).removeClass('disabled');
		}
		else{
			if(object_account!=response.name){
				add_notify(false,'',account_not_found);
				$(el).removeClass('disabled');
			}
			else{
				let previous=response.custom_sequence_block_num;
				let new_object={};
				if(previous>0){
					new_object.p=previous;
				}
				new_object.e=event;
				if(object_account!=current_user){
					new_object.a=object_account;
				}
				if(object_block>0){
					new_object.b=object_block;
				}
				if(false!==data){
					new_object.d=data;
				}
				console.log(new_object);
				let object_json=JSON.stringify(new_object);

				viz.broadcast.custom(users[current_user].regular_key,[],[current_user],events_protocol,object_json,function(err,result){
					if(result){
						console.log(result);
						setTimeout(function(){
							wait_new_event(current_user,previous,function(last_event){//wait till account custom sequencer will updated
								console.log('wait_new_event result',last_event);
								//result_event
								/*
								account
								block
								executed:0
								time
								data:{
									p/previous
									e/event
									a/account
									b/block
									d/data
									timestamp
								}
								*/
								if(false!==last_event){
									continuous_parse_event(current_user,object_block,last_event,event,previous,0,finish_parse_events);
								}
								else{
									add_notify(false,'',ltmp_arr.gateway_error);
									$(el).removeClass('disabled');
								}
							});
						},2000);//no reason to wait 3 sec, it can be handle faster by witnesses
					}
					else{
						console.log(err);
						add_notify(false,'',ltmp_arr.gateway_error);
						$(el).removeClass('disabled');
					}
				});
			}
		}
	});
}
function fast_publish(publish_form){
	let text_html=publish_form.find('.text').html();
	let text=text_html;
	text=text.replaceAll(/<([a-zA-Z^ >]*) (.[^>]*)>/gm,'<$1>');
	text=fast_str_replace('<br/>',"\n",text_html);
	text=fast_str_replace('<br>',"\n",text_html);
	text=fast_str_replace('</div>',"\n",text);
	text=text.replaceAll(/<(.[^>]*)>/gm,'');
	text=fast_str_replace('&nbsp;',' ',text);
	text=text.trim();

	let action=false;
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
				data.t=text;

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
								let note_el_path='.view[data-level="0"] .fast-publish-wrapper[data-reply=""][data-share=""] .text';
								if(false!==action){
									let data_key='';
									let link='';
									if(''!=publish_form.data('reply')){
										data_key='reply';
										link=publish_form.data('reply');
									}
									if(''!=publish_form.data('share')){
										data_key='share';
										link=publish_form.data('share');
									}
									note_el_path='.fast-publish-wrapper[data-'+data_key+'="'+link+'"] .text';

									action.removeClass('success');
									publish_form.remove();

									if(typeof data.s !== 'undefined'){
										//add entry to reposts object store
										let share_link=data.s;
										if(0==share_link.indexOf('viz://')){
											share_link=share_link.toLowerCase();
											share_link=escape_html(share_link);
											let share_account=share_link.match(account_pattern);
											if(typeof share_account[0] != 'undefined'){
												let share_block=share_link.match(block_pattern);
												if(typeof share_block[0] != 'undefined'){
													parent_account=share_account[0].substr(1);
													parent_block=parseInt(fast_str_replace('/','',share_block[0]));
													idb_get_id('reposts','object',[parent_account,parent_block],function(repost_id){
														if(false===repost_id){//create repost entry
															let add_t=db.transaction(['reposts'],'readwrite');
															let add_q=add_t.objectStore('reposts');
															add_q.add({account:parent_account,block:parent_block});
															if(trx_need_commit){
																add_t.commit();
															}
														}
													});
												}
											}
										}
									}
								}
								else{
									publish_form.find('.text').html('');
								}
								note_clear_draft(note_el_path);
								view_path('viz://@'+current_user+'/'+object_block+'/',{},true,false);
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
		publish_form.find('.text')[0].focus();
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

	let publish_protocol=app_protocol;
	let edit=false;
	if(editable_object[2]){//edit mode, need to change custom protocol
		edit=view.find('input[name="edit-event-object"]').val();
		publish_protocol=events_protocol;
		console.log('publish with edit:',edit);
		if(''==edit){
			edit=false;
			publish_protocol=app_protocol;
		}
	}

	viz.api.getAccount(current_user,publish_protocol,function(err,response){
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

			let error=false;
			let data={};
			data.t=text;
			if(false!=reply){
				data.r=reply;
			}
			else
			if(false!=share){
				data.s=share;
			}

			let beneficiaries_list=[];
			let beneficiaries_summary_weight=0;
			view.find('.beneficiaries-list .beneficiaries-item').each(function(i,el){
				if(beneficiaries_summary_weight<10000){
					let account=$(el).find('input[name="account"]').val();
					if(''!=account){
						let weight=parseInt(parseFloat($(el).find('input[name="weight"]').val().replace(',','.'))*100);
						if(0<weight){
							if(beneficiaries_summary_weight+weight<=10000){
								beneficiaries_list.push({account,weight});
								beneficiaries_summary_weight+=weight;
							}
							else{
								error=ltmp_arr.notify_arr.beneficiaries_summary_weight;
							}
						}
					}
				}
			});
			beneficiaries_list.sort(compare_account_name);
			if(beneficiaries_list.length>0){
				data.b=beneficiaries_list;
			}

			new_object.d=data;
			if(false!==edit){
				let edit_account='';
				let edit_block=0;
				let link_account=edit.match(account_pattern);
				if(typeof link_account[0] != 'undefined'){
					edit_account=link_account[0].substr(1);
					let link_block=edit.match(block_pattern);
					if(typeof link_block[0] != 'undefined'){
						edit_block=parseInt(fast_str_replace('/','',link_block[0]));
					}
				}
				new_object.e='e';//edit
				if(current_user!=edit_account){
					new_object.a=edit_account;//account
				}
				if(edit_block>0){
					new_object.b=edit_block;//block
				}
				else{
					return;
				}
			}
			//check passphrase and try encode
			let passphrase='';
			let passphrase_arr=[];
			let passphrase_comment='';
			let passphrase_comment_arr=[];
			view.find('.encode-passphrase .encode-passphrase-item').each(function(i,el){
				let item=$(el).find('input[name="encode-passphrase"]').val();
				if(''!=item){
					passphrase=item;
					passphrase_arr.push(passphrase);
				}
				item=$(el).find('input[name="encode-comment"]').val();
				if(''!=item){
					passphrase_comment=item;
					passphrase_comment_arr.push(passphrase_comment);
				}
			});
			if(passphrase_arr.length>1){//more than one passphrase
				passphrase_arr=passphrase_arr.reverse();
				passphrase_comment_arr=passphrase_comment_arr.reverse();
				try{
					for(let i in passphrase_arr){
						let number=i;
						if(0==number){
							new_object['nt']='t';//text
						}
						else{
							new_object['nt']='e';//encoded
						}
						console.log('encode object',new_object,'with passphrase',passphrase_arr[number],'and comment',passphrase_comment_arr[number]);
						new_object['d']=JSON.stringify(new_object);
						new_object['d']=viz.aes.simpleEncoder(new_object['d'],passphrase_arr[number]);
						if(typeof passphrase_comment_arr === 'object'){
							if(typeof passphrase_comment_arr[number] === 'string'){
								new_object['c']=passphrase_comment_arr[number];
							}
						}
					}
					delete new_object['nt'];//remove new type because it already stringified and encoded
				}
				catch(e){
					console.log(e);
					view.find('.submit-button-ring').removeClass('show');
					view.find('.error').html(ltmp_arr.encoding_error);
					view.find('.button').removeClass('disabled');
					return;
				}
				new_object['t']='e';//encoded
			}
			else{
				if(''!=passphrase){
					try{
						new_object['d']['nt']=new_object['t'];//new type
						new_object['d']=JSON.stringify(new_object);
						new_object['d']=viz.aes.simpleEncoder(new_object['d'],passphrase);
						new_object['c']=passphrase_comment;//comment
					}
					catch(e){
						console.log(e);
						view.find('.submit-button-ring').removeClass('show');
						view.find('.error').html(ltmp_arr.encoding_error);
						view.find('.button').removeClass('disabled');
						return;
					}
					new_object['t']='e';//encoded
				}
			}

			let object_json=JSON.stringify(new_object);

			if(false===error){
				viz.broadcast.custom(users[current_user].regular_key,[],[current_user],publish_protocol,object_json,function(err,result){
					if(result){
						console.log(result);

						if(settings.save_passphrase_on_publish){
							if(''!=passphrase){
								add_passphrase(current_user,passphrase);
							}
						}

						view.find('.success').html(ltmp_arr.publish_success);

						view.find('input').val('');
						view.find('textarea').val('');

						view.find('.submit-button-ring').removeClass('show');
						view.find('.button').removeClass('disabled');
						if(false!==edit){
							setTimeout(function(){
								update_user_last_event(current_user,function(result){
									if(false!==result){
										get_object(current_user,new_object.b,false,function(err,object_result){
											if(!err){
												view.find('.success').html(ltmp(ltmp_arr.publish_success_link,{account:current_user,block:new_object.b,addon:'?event='+result}));
											}
										});
									}
								});
							},3000);
						}
						else{//get new object and add link to it
							setTimeout(function(){
								get_user(current_user,true,function(err,result){
									if(!err){
										if(result.start!=previous){
											get_object(current_user,result.start,false,function(err,object_result){
												if(!err){
													view.find('.success').html(ltmp(ltmp_arr.publish_success_link,{account:current_user,block:result.start}));
												}
											});
										}
									}
								});
							},3000);
						}
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
			else{
				add_notify(false,
					ltmp_arr.notify_arr.error,
					error
				);
				view.find('.submit-button-ring').removeClass('show');
				view.find('.error').html(ltmp_arr.gateway_error);
				view.find('.button').removeClass('disabled');
				return;
			}
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
			if(trx_need_commit){
				hashtag_add_t.commit();
			}
			hashtag_add_req.oncomplete=function(e){
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
						header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:''});
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
	if(account==current_user){
		callback(false);
	}
	else{
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
			render+=ltmp(ltmp_arr.subscribed_link,{icon:ltmp_global.icon_subscribed});
			render+=ltmp(ltmp_arr.unsubscribe_link,{icon:ltmp_global.icon_unsubscribe});

			feed_load(check_user,false,false,true,function(err,result){
				console.log('feed load by subscribe',err,result);
				if(!err){
					update_feed_result(result);
				}
			});
		}
		else{
			render+=ltmp(ltmp_arr.subscribe_link,{icon:ltmp_global.icon_subscribe});
			render+=ltmp(ltmp_arr.ignore_link,{icon:ltmp_global.icon_ignore});
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
			render+=ltmp(ltmp_arr.subscribe_link,{icon:ltmp_global.icon_subscribe});
			render+=ltmp(ltmp_arr.ignore_link,{icon:ltmp_global.icon_ignore});
		}
		else{
			render+=ltmp(ltmp_arr.subscribed_link,{icon:ltmp_global.icon_subscribed});
			render+=ltmp(ltmp_arr.unsubscribe_link,{icon:ltmp_global.icon_unsubscribe});
		}
		actions.html(render);
	});
}

function ignore_target(el){
	let actions=$(el).closest('.user-actions');
	let check_user=actions.data('user');
	let render='';

	ignore_update(check_user,function(result){
		if(result){
			sync_cloud_put_update('ignore',check_user);
			render+=ltmp(ltmp_arr.ignored_link,{icon:ltmp_global.icon_ignored});
			render+=ltmp(ltmp_arr.unignore_link,{icon:ltmp_global.icon_unsubscribe});
		}
		else{
			render+=ltmp(ltmp_arr.subscribe_link,{icon:ltmp_global.icon_subscribe});
			render+=ltmp(ltmp_arr.ignore_link,{icon:ltmp_global.icon_ignore});
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
			render+=ltmp(ltmp_arr.subscribe_link,{icon:ltmp_global.icon_subscribe});
			render+=ltmp(ltmp_arr.ignore_link,{icon:ltmp_global.icon_ignore});
		}
		else{
			render+=ltmp(ltmp_arr.ignored_link,{icon:ltmp_global.icon_ignored});
			render+=ltmp(ltmp_arr.unignore_link,{icon:ltmp_global.icon_unsubscribe});
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
	let bold_pattern=/\*\*(.[\s\S]*?)\*\*/gm;
	text=text.replace(bold_pattern,'<b>$1</b>');
	let italic_pattern=/\_\_(.[\s\S]*?)\_\_/gm;
	text=text.replace(italic_pattern,'<i>$1</i>');
	let strikethrough_pattern=/\~\~(.[\s\S]*?)\~\~/gm;
	text=text.replace(strikethrough_pattern,'<strike>$1</strike>');
	let inline_code_pattern=/\`(.*?)\`/gm;
	text=text.replace(inline_code_pattern,'<code>$1</code>');

	let images_pattern=/\!\[(.*?)\]\((.*?)\)/gm;
	text=text.replace(images_pattern,'<img src="$2" alt="$1"/>');

	let links_pattern=/\[(.*?)\]\((.*?)\)/gm;
	let link_pattern=/\[(.*?)\]\((.*?)\)/m;
	let links_arr=text.match(links_pattern);
	if(null!==links_arr){
		if(typeof links_arr[0] != 'undefined'){
			for(let i in links_arr){
				let link=links_arr[i];
				link_arr=link.match(link_pattern);
				if(null!==link_arr){
					if('#'==link_arr[2].substr(0,1)){//link to section
						text=text.replaceAll(link,'<a data-section="'+link_arr[2].substr(1)+'">'+link_arr[1]+'</a>');
					}
					else{
						text=text.replaceAll(link,'<a href="'+link_arr[2]+'" target="_blank">'+link_arr[1]+'</a>');
					}
				}
			}
		}
	}
	//text=text.replace(links_pattern,'<a href="$2">$1</a>');

	text=markdown_decode_text(text);
	text=text.trim();
	text=text.replaceAll("\n","\n<br />\n");
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
	let parent_element_type=element.parentNode.nodeName;
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
	if('UL'==element.nodeName){
		result="\n"+data+"\n\n";
	}
	if('OL'==element.nodeName){
		result="\n"+data+"\n\n";
	}
	if('LI'==element.nodeName){
		if('UL'==parent_element_type){
			result='* '+data;
		}
		if('OL'==parent_element_type){
			result='*n '+data;
		}
		result="\n"+result;
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
		let alt='';
		if(null!==element.getAttribute('alt')){
			alt=markdown_encode_text(element.getAttribute('alt'));
		}
		let src='';
		if(null!==element.getAttribute('src')){
			src=markdown_encode_text(element.getAttribute('src'));
		}
		if(''!=src){
			result='!['+alt+']('+src+')';
		}
		else{
			result='';
		}
	}
	return result;
}
function markdown_decode_list(text,type){
	let result='';
	result+='<li>';
	let text_arr=text.split("\n");
	console.log('markdown_decode_list',text,text_arr);
	for(let i in text_arr){
		let context=text_arr[i];
		let first=false;
		if(-1!=context.indexOf(' ')){
			first=context.substring(0,context.indexOf(' '));
			if('ul'==type){
				if('*'==first){
					context=context.substring(context.indexOf(' ')+1);
					context='</li><li>'+context;
				}
				else{
					context='<br>'+context;
				}
			}
			else
			if('ol'==type){
				if('*n'==first){
					context=context.substring(context.indexOf(' ')+1);
					context='</li><li>'+context;
				}
				else{
					context='<br>'+context;
				}
			}
		}
		else{
			context='<br>'+context;
		}
		result+=context;
	}
	result+='</li>';
	result=fast_str_replace('<li></li>','',result);
	return result;
}
function markdown_decode(text,rewrite_block){
	let set_id=false;
	let section=false;
	let subsection=false;
	let list=false;
	let section_num=1;
	let subsection_num=1;
	rewrite_block=typeof rewrite_block==='undefined'?false:rewrite_block;
	text=text.trim();
	while(-1!=text.indexOf("\n\n\n")){
		text=fast_str_replace("\n\n\n","\n\n",text);
	}
	text=fast_str_replace("\r",'',text);
	//let images_pattern=/\!\[(.*?)\]\((.*?)\)/gm;
	let text_arr=text.split("\n\n");
	let html='';
	for(let i in text_arr){
		set_id=false;
		section=false;
		subsection=false;
		list=false;
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
			if('*'==first){
				block='ul';
				if(false!==list){
					sublist=true;
				}
				list='ul';
			}
			else
			if('*n'==first){
				block='ol';
				if(false!==list){
					sublist=true;
				}
				list='ol';
			}
			else
			if('##'==first){
				block='h2';
				set_id=true;
				section=true;
			}
			else
			if('###'==first){
				block='h3';
				set_id=true;
				subsection=true;
			}
			else{
				first=false;
			}
		}
		if(false!==rewrite_block){
			block=rewrite_block;
		}
		if(false!==list){
			context=markdown_decode_list(el,list);
		}
		else
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
			let id_addon='';
			if(set_id){
				id_addon+=' id="';
				if(section){
					id_addon+='section-'+section_num;
					section_num++;
					subsection_num=1;
				}
				if(subsection){
					id_addon+='section-'+Math.max(section_num-1,1)+'-'+subsection_num;
					subsection_num++;
				}
				id_addon+='"';
				set_id=false;
				section=false;
				subsection=false;
			}
			result+='<'+block+id_addon+'>';
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
			if(typeof bc === 'object'){
				//send to others tabs about cleared items counter in feed
				bc.postMessage({type:'feed_count',pid:pid,count:0});
			}

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
				check_images(objects);
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
	//console.log('notify_add_timer',event,id);
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
		let search_t=db.transaction(['notifications'],'readonly');
		let search_q=search_t.objectStore('notifications');
		let search_req=search_q.openCursor(null,'prev');
		let search_limit=50;
		let found_same=false;
		search_req.onsuccess=function(event){
			let cur=event.target.result;
			if(cur){
				if(''!=link){
					if(link===cur.value.link){
						found_same=true;
					}
				}
				cur.continue();
			}
			else{
				if(!found_same){//need to store (and show), the same link was not found
					let obj={
						title:title,
						text:text,
						link:link,
						status:0
					};
					let add_t=db.transaction(['notifications'],'readwrite');
					let add_q=add_t.objectStore('notifications');
					add_q.add(obj);
					if(trx_need_commit){
						add_t.commit();
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
			}
		};
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
	if(debug){
		console.log('event',e);
		console.log('event type',e.type);
		console.log('target',target);
		console.log('document.getSelection',document.getSelection());
	}
	let editor_buttons=false;
	let ignore=false;
	if(inside_editor_formatter(target)){
		if('mousedown'==e.type){
			editor_buttons=true;
		}
		if('touchstart'==e.type){
			editor_buttons=true;
		}
	}
	else{
		if('mousedown'==e.type){
			ignore=true;
		}
		if('touchstart'==e.type){
			ignore=true;
		}
	}

	if(editor_buttons){
		editor_formatter_actions(e,target);
	}
	else{//not editor buttons
		if(!ignore){
			if($(target).hasClass('delete-all-passphrases-action')){
				e.preventDefault();
				if(!$(target).hasClass('disabled')){
					$(target).addClass('disabled');
					let view=$(target).closest('.view');
					let tab=view.find('.content-view[data-tab="main"]');
					tab.find('.submit-button-ring').addClass('show');
					tab.find('.error').html('');
					tab.find('.success').html('');
					let t=db.transaction(['passphrases'],'readwrite');
					let q=t.objectStore('passphrases');
					let req=q.clear();
					req.onsuccess=function(){
						view.find('.button').removeClass('disabled');
						view.find('.submit-button-ring').removeClass('show');
						view.find('.error').html('');
						view.find('.success').html(ltmp_arr.app_passphrases_deleted);
					};
				}
				return;
			}
			if($(target).hasClass('passphrase-remove-action')){
				e.preventDefault();
				let passphrase_id=$(target).closest('.passphrase-item').data('passphrase-id');
				let t=db.transaction(['passphrases'],'readwrite');
				let q=t.objectStore('passphrases');
				let req=q.delete(passphrase_id);
				req.onsuccess=function(event){
					$(target).closest('.passphrase-item').remove();
				};
				return;
			}
			if($(target).hasClass('decode-form')){
				e.preventDefault();
				if(!$(target).hasClass('activated')){
					$(target).addClass('activated');
					$(target).find('.decode-passphrase').addClass('show');
					$(target).find('.decode-passphrase input')[0].focus();
				}
				return;
			}
			if($(target).hasClass('decode-object-action')){
				e.preventDefault();
				let input_el=$(target).closest('.decode-form').find('.decode-passphrase input');
				let passphrase=input_el.val();
				input_el.removeClass('negative');
				if(''!=passphrase){
					let object=$(target).closest('.object');
					let object_preview=false;
					if(object.hasClass('type-text-preview')){
						object_preview=true;
					}
					let object_account=object.data('account');
					let object_block=object.data('block');
					decode_object(object_account,object_block,passphrase,function(result){
						if(result){
							get_user(object_account,false,function(err,object_user){
								if(!err){
									get_object(object_account,object_block,false,function(err,object_result){
										if(!err){
											let object_type='default';
											if(object_preview){
												object_type='preview';
											}
											new_render=render_object(object_user,object_result,object_type);
											object.before(new_render);
											object.remove();//remove old view
											if(object_preview){
												update_short_date();
											}
											else{
												let link='viz://@'+object_account+'/'+object_block+'/';
												set_date_view($('.object[data-link="'+link+'"] .date-view'),true);
											}
										}
										else{
											input_el.addClass('negative');
										}
									});
								}
								else{
									input_el.addClass('negative');
								}
							});
						}
						else{
							input_el.addClass('negative');
						}
					});
				}
				else{
					input_el.addClass('negative');
				}
				return;
			}
			if($(target).hasClass('reg-button')){
				e.preventDefault();
				Object.assign(document.createElement('a'),{target:'_blank',href:ltmp_arr.reg_service_link}).click();
				return;
			}
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
			if($(target).hasClass('install-close-action')){
				e.preventDefault();
				$('.install-notice').removeClass('show');
				localStorage.setItem(storage_prefix+'install_close',1);
				return;
			}
			if($(target).hasClass('install-action')){
				e.preventDefault();
				$('.install-notice').removeClass('show');
				if(typeof install_event !== 'undefined'){
					install_event.prompt();
					install_event.userChoice.then((choice)=>{
						if('accepted'===choice.outcome){
							console.log('User accepted the A2HS prompt');
							localStorage.setItem(storage_prefix+'install_close',1);
						}
						else{
							console.log('User dismissed the A2HS prompt');
							localStorage.setItem(storage_prefix+'install_close',0);
						}
						install_event=null;
					});
				}
				return;
			}
			if($(target).hasClass('scroll-top-action')){
				console.log('HERE');
				$(window)[0].scrollTo({top:0});
				e.preventDefault();
				return;
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
			if(typeof $(target).attr('data-section') != 'undefined'){
				let view=$(target).closest('.view');
				let section=$(target).attr('data-section');
				let section_el=view.find('#'+section);
				$(window)[0].scrollTo({behavior:'smooth',top:section_el.offset().top-15});
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
			if($(target).hasClass('toggle-publish-addons-action')){
				let view=$(target).closest('.content-view');
				if('none'==view.find('.publish-addons').css('display')){
					$(target).html(ltmp_arr.close_publish_addons);
					view.find('.publish-addons').css('display','block');
				}
				else{
					$(target).html(ltmp_arr.open_publish_addons);
					view.find('.publish-addons').css('display','none');
				}
			}
			if($(target).hasClass('encode-passphrase-add-item-action')){
				let view=$(target).closest('.content-view');
				view.find('.encode-passphrase .encode-passphrase-item').each(function(i,el){
					if(i>0){
						if(''==$(el).find('input[name="encode-passphrase"]').val()){
							if(''==$(el).find('input[name="encode-comment"]').val()){
								el.remove();
							}
						}
					}
				});
				$(target).before(ltmp(ltmp_arr.encoding_item));
			}
			if($(target).hasClass('beneficiaries-add-item-action')){
				let view=$(target).closest('.content-view');
				view.find('.beneficiaries-list .beneficiaries-item').each(function(i,el){
					if(i>0){
						if(''==$(el).find('input[name="account"]').val()){
							if(''==$(el).find('input[name="weight"]').val()){
								el.remove();
							}
						}
					}
				});
				$(target).before(ltmp(ltmp_arr.beneficiaries_item));
			}
			if($(target).hasClass('audio-toggle-action')){
				let player=$(target).closest('.audio-player');
				let audio=player.find('.audio-source')[0];
				if(audio.paused){
					audio.play();
					$(target).html(ltmp_global.icon_player_pause);
					$(player).find('.audio-toggle-action').attr('title',ltmp_arr.audio_player_pause_caption);
				}
				else{
					audio.pause();
					$(target).html(ltmp_global.icon_player_play);
					$(player).find('.audio-toggle-action').attr('title',ltmp_arr.audio_player_play_caption);
				}
			}
			if($(target).hasClass('nsfw-reveal-action')){
				let target_object=$(target).closest('.object');
				target_object.find('.nsfw-warning').remove();
				target_object.find('.nsfw-content').css('display','block');
				target_object.find('.nsfw-content').css('opacity','1');
			}
			if($(target).hasClass('theme-action')){
				$('body').removeClass('light');
				$('body').removeClass('night');
				$('body').removeClass('dark');
				theme=$(target).attr('rel');
				$('body').addClass(theme);
				localStorage.setItem(storage_prefix+'theme',theme)
			}
			if($(target).hasClass('screen-click')||$(target).hasClass('cancel-more-action')){
				more_list_close();
			}
			if($(target).hasClass('more-action')){
				$('.screen-click').addClass('show')
				let more_account=$(target).data('account');
				let more_block=$(target).data('block');
				$('div.more-list').data('account',more_account);
				$('div.more-list').data('block',more_block);
				$('div.more-list').html(ltmp_arr.more_actions);
				if(!$('div.more-list').hasClass('show')){
					let target_offset=$('.view[data-level="'+level+'"] .more-action[data-account="'+$('div.more-list').data('account')+'"][data-block="'+$('div.more-list').data('block')+'"]')[0].getBoundingClientRect();
					$('div.more-list').css('display','block');
					let more_offset=$('div.more-list')[0].getBoundingClientRect();
					$('div.more-list').css('left',(target_offset.left+target_offset.width-more_offset.width)+'px');
					$('div.more-list').css('top',(window.scrollY+target_offset.top-5)+'px');
					$('div.more-list').addClass('show');
					ignore_resize=true;
				}
			}
			if($(target).hasClass('hide-more-action')){
				let confirm_hide=confirm(ltmp_arr.confirm_hide_event);
				if(confirm_hide){
					let object_account=$('div.more-list').data('account');
					let object_block=$('div.more-list').data('block');
					$(target).addClass('disabled');
					voice_event(target,object_account,object_block,'h');//hide
				}
			}
			if($(target).hasClass('edit-more-action')){
				let object_account=$('div.more-list').data('account');
				let object_block=$('div.more-list').data('block');
				$(target).addClass('disabled');
				get_object(object_account,object_block,false,function(err,object_result){
					if(err){
						$(target).removeClass('disabled');
						console.log(err);
						add_notify(false,'',ltmp_arr.object_not_found);
					}
					else{
						set_editable_object('viz://@'+object_account+'/'+object_block+'/',object_result);

						if(typeof object_result.data.t !== 'undefined'){
							if('p'==object_result.data.t){
								document.location.hash='dapp:publish/?publication';
							}
							else{
								view_path('dapp:publish/',{},true,false);
							}
						}
						else{
							view_path('dapp:publish/',{},true,false);
						}
					}
				});
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
						$('.toggle-menu-icon').html(ltmp_global.icon_menu_collapse);
					}
					else{
						$('.toggle-menu-icon').html(ltmp_global.icon_menu_expand);
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
							let text=publish_form.find('.text').html();
							text=text.trim();
							text+="\n"+'sia://'+result;
							text=text.trim();
							publish_form.find('.text').html(text);
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
			if($(target).hasClass('publish-add-category-action')){
				let hashtag_str=fast_str_replace(' ','_',$(target).html());
				let hashtag_lower_str=hashtag_str.toLowerCase();
				let publish_form=$(target).closest('.add-categories').parent();
				let text_el=false;
				let editor=false;
				let founded=false;

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
				publish_form.find('.publish-add-category-action').each(function(i,el){
					let category_el=el;
					let category_hashtag_str=fast_str_replace(' ','_',$(category_el).html());
					let category_hashtag_lower_str=category_hashtag_str.toLowerCase();
					if(false!==text_el){
						let search_text=text_el.val();
						console.log('category position:',search_text.toLowerCase().indexOf(category_hashtag_lower_str));
						if(-1!==search_text.toLowerCase().indexOf(category_hashtag_lower_str)){
							$(category_el).addClass('selected');
							founded=true;
						}
						else{
							$(category_el).removeClass('selected');
						}
					}
					if(false!==editor){
						let search_text=editor.html();
						console.log('category position:',search_text.toLowerCase().indexOf(category_hashtag_lower_str));
						if(-1!==search_text.toLowerCase().indexOf(category_hashtag_lower_str)){
							$(category_el).addClass('selected');
							founded=true;
						}
						else{
							$(category_el).removeClass('selected');
						}
					}
				});
				if(!founded){
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
				else{
					add_notify(false,ltmp_arr.notify_arr.error,ltmp_arr.notify_arr.category_is_founded);
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
			if($(target).hasClass('profile-select-category-action')){
				let view=$(target).closest('.view');
				if(!$(target).hasClass('selected')){
					view.find('.profile-select-category-action').removeClass('selected');
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
					ignore_target(target);
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
			if($(target).hasClass('save-connection-settings-action')){
				if(!$(target).hasClass('disabled')){
					let view=$(target).closest('.view');
					let tab=view.find('.content-view[data-tab="connection"]');

					let api_gate_str=tab.find('input[name="api_gate_str"]').val();

					$(target).addClass('disabled');
					tab.find('.save-connection-settings-error').html('');
					tab.find('.save-connection-settings-success').html('');
					tab.find('.submit-button-ring').addClass('show');
					tab.find('input[name="api_gate"]').prop('checked',false);
					tab.find('input[name="api_gate"][value="'+api_gate_str+'"]').prop('checked',true);

					check_api_gate(api_gate_str,(err,result)=>{
						result=typeof result==='undefined'?false:result;
						tab.find('.save-connection-settings-success').html('');
						tab.find('.save-connection-settings-error').html('');
						tab.find('.api-gates-list p').removeClass('positive');
						tab.find('.api-gates-list p').removeClass('negative');
						if(false!==err){
							tab.find('.save-connection-settings-error').html(err);
							if(false===result){
								tab.find('.api-gates-list input[value="'+api_gate_str+'"]').closest('p').addClass('negative');
							}
						}
						else{
							tab.find('.save-connection-settings-success').html(result);
							tab.find('.api-gates-list input[value="'+api_gate_str+'"]').closest('p').addClass('positive');
							dgp_error=false;
							gate_connection_status();
						}
						$(target).removeClass('disabled');
						view.find('.submit-button-ring').removeClass('show');
					});
				}
			}
			if($(target).hasClass('save-languages-settings-action')){
				if(!$(target).hasClass('disabled')){
					let view=$(target).closest('.view');
					let tab=view.find('.content-view[data-tab="languages"]');

					let language_str=tab.find('input[name="language"]:checked').val();
					console.log(language_str);

					$(target).addClass('disabled');
					tab.find('input[name="language"]').prop('checked',false);
					tab.find('input[name="language"][value="'+language_str+'"]').prop('checked',true);
					tab.find('.languages-list p').removeClass('positive');
					tab.find('.languages-list p').removeClass('negative');

					if(typeof available_langs[language_str] !== 'undefined'){
						selected_lang=language_str;
						localStorage.setItem(storage_prefix+'lang',selected_lang);
						ltmp_arr=window['ltmp_'+selected_lang+'_arr'];
						for(let i in window['ltmp_editor_'+selected_lang+'']){
							ltmp_editor[i]=window['ltmp_editor_'+selected_lang+''][i];
						}
					}
					preset_view();
					render_menu();
					render_session();
					render_right_addon();
					view_path('dapp:app_settings/languages',{},true,false);
					$(target).removeClass('disabled');
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

									render_menu();
									render_session();
									apply_theme_mode();

									tab.find('.sync-import-success').html(tab.find('.sync-import-success').html()+'<br>'+ltmp_arr.settings_sync_import_finished);
									if(typeof users[current_user] !== 'undefined'){
										if(typeof users[current_user].regular_key !== 'undefined'){
										}
										else{
											tab.find('.sync-import-error').html(ltmp_arr.account_settings_empty_regular_key);
											tab.find('.sync-import-error').attr('data-href','dapp:account/credentials');
											add_notify(false,
												ltmp_arr.notify_arr.error,
												ltmp_arr.account_settings_empty_regular_key,
												'dapp:account/credentials'
											);
										}
									}
									else{
										tab.find('.sync-import-error').html(ltmp_arr.account_settings_empty_regular_key);
										tab.find('.sync-import-error').attr('data-href','dapp:account/credentials');
										add_notify(false,
											ltmp_arr.notify_arr.error,
											ltmp_arr.account_settings_empty_regular_key,
											'dapp:account/credentials'
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
			if($(target).hasClass('toggle-theme-action')){
				if('auto'==settings.theme_mode){
					view_path('dapp:app_settings/theme/',{},true,false);
				}
				else
				if('light'==settings.theme_mode){
					settings.theme_mode='night';

					let settings_json=JSON.stringify(settings);
					localStorage.setItem(storage_prefix+'settings',settings_json);

					apply_theme_mode();
				}
				else
				if('night'==settings.theme_mode){
					settings.theme_mode='light';

					let settings_json=JSON.stringify(settings);
					localStorage.setItem(storage_prefix+'settings',settings_json);
					apply_theme_mode();
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
						attach:ltmp_global.icon_attach,
						reply:link,
						placeholder:ltmp_arr.fast_publish_reply,
						button:ltmp_arr.fast_publish_button,
					}));
					let note_el_path='.fast-publish-wrapper[data-reply="'+link+'"] .text';
					$(note_el_path)[0].focus();
					note_load(note_el_path,false);
					if(0==notes_save_draft_timer){
						notes_save_draft_timer_stop=false;
						note_save_draft(note_el_path,false,true);
					}
					else{
						notes_save_draft_timer_stop=true;
						notes_save_draft_timer_next={el_path:note_el_path,textarea:false,auto:true};
					}
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
						attach:ltmp_global.icon_attach,
						share:link,
						placeholder:ltmp_arr.fast_publish_share,
						button:ltmp_arr.fast_publish_button,
					}));
					let note_el_path='.fast-publish-wrapper[data-share="'+link+'"] .text';
					$(note_el_path)[0].focus();
					note_load(note_el_path,false);
					if(0==notes_save_draft_timer){
						notes_save_draft_timer_stop=false;
						note_save_draft(note_el_path,false,true);
					}
					else{
						notes_save_draft_timer_stop=true;
						notes_save_draft_timer_next={el_path:note_el_path,textarea:false,auto:true};
					}
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
					let link_account=link.match(account_pattern);
					if(typeof link_account[0] != 'undefined'){
						account=link_account[0].substr(1);
						let link_block=link.match(block_pattern);
						if(typeof link_block[0] != 'undefined'){
							block=parseInt(fast_str_replace('/','',link_block[0]));
							award(account,block,function(result){
								if(result){
									setTimeout(function(){
										check_object_award(account,block);
									},100);
								}
							});
						}
					}
				}
			}
			if($(target).hasClass('external-share-action')){
				let original_object_el=$(target).closest('.object');
				let original_object_link=original_object_el.data('link');
				if(original_object_el.data('publication')){
					original_object_link+='publication/';
				}
				let original_object_events='';
				if(typeof original_object_el.data('events') !== 'undefined'){
					if(''!=original_object_el.data('events')){
						original_object_events='?event='+original_object_el.data('events');
					}
				}
				let object_link=original_object_link+original_object_events;
				if(false!==whitelabel_copy_link){
					object_link=fast_str_replace('viz://',whitelabel_copy_link,object_link);
				}
				if(pwa && navigator.share){
					let share_account=original_object_link.match(account_pattern);
					if(typeof share_account[0] != 'undefined'){
						let share_block=original_object_link.match(block_pattern);
						if(typeof share_block[0] != 'undefined'){
							share_account=share_account[0].substr(1);
							share_block=parseInt(fast_str_replace('/','',share_block[0]));
							get_object(share_account,share_block,false,function(err,object_result){
								let share_obj={};
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
									share_obj['text']='';
									if(typeof object_result.data.d.text !== 'undefined'){
										share_obj['text']=object_result.data.d.text;
									}
									else{
										if(typeof object_result.data.d.t !== 'undefined'){
											share_obj['text']=object_result.data.d.t;
										}
									}
								}
								if('publication'==object_type){
									share_obj['text']='';
									share_obj['text']+=object_result.data.d.t;
									if(typeof object_result.data.d.m !== 'undefined'){
										if(typeof object_result.data.d.d !== 'undefined'){
											share_obj['text']+="\n\n";
											share_obj['text']+=object_result.data.d.d;
										}
									}
								}
								share_obj['text']+="\n\n@"+object_result.account+' on Readdle.Me';
								share_obj['text']+="\n\nURL: "+object_link;
								share_obj['text']=share_obj['text'].trim();
								console.log('share_obj:',share_obj);
								navigator.share(share_obj)
								.then(()=>{
									$(target).addClass('success');
									setTimeout(function(){
										$(target).removeClass('success');
									},3000);
								})
								.catch((error)=>{
									console.log('Error sharing',error,share_obj);
								});
							});
						}
					}
				}
				else{
					let target_offset=$(target)[0].getBoundingClientRect();
					$('.text-copy').css('top',''+(window.scrollY+target_offset.top)+'px');
					$('.text-copy').val(object_link);
					$('.text-copy')[0].select();
					$('.text-copy')[0].setSelectionRange(0,99999);
					document.execCommand("copy");
					$('.text-copy').css('top','-100px');
					$(target).addClass('success');
					setTimeout(function(){
						$(target).removeClass('success');
					},3000);
				}
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

					let publish_protocol=app_protocol;
					let edit=false;
					if(editable_object[2]){//edit mode, need to change custom protocol
						edit=$('.article-settings input[name="edit-event-object"]').val();
						publish_protocol=events_protocol;
						console.log('publish with edit:',edit);
						if(''==edit){
							edit=false;
							publish_protocol=app_protocol;
						}
					}

					let editor=$('.article-editor .editor-text')[0];

					//fix <br> repeats in lists which can break markdown logic with \n\n
					$('.article-editor .editor-text').find('li').each(function(i,el){
						$(el)[0].innerHTML=fast_str_replace('<br><br>','<br>',$(el)[0].innerHTML);
					});

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

					let error=false;
					let article_obj={
						t:title,
						m:markdown,
						d:$('.article-settings input[name="description"]').val(),
						i:$('.article-settings input[name="thumbnail"]').val(),//image
					};

					let beneficiaries_list=[];
					let beneficiaries_summary_weight=0;
					$('.article-settings .beneficiaries-list .beneficiaries-item').each(function(i,el){
						if(beneficiaries_summary_weight<10000){
							let account=$(el).find('input[name="account"]').val();
							if(''!=account){
								let weight=parseInt(parseFloat($(el).find('input[name="weight"]').val().replace(',','.'))*100);
								if(0<weight){
									if(beneficiaries_summary_weight+weight<=10000){
										beneficiaries_list.push({account,weight});
										beneficiaries_summary_weight+=weight;
									}
									else{
										error=ltmp_arr.notify_arr.beneficiaries_summary_weight;
									}
								}
							}
						}
					});
					beneficiaries_list.sort(compare_account_name);
					if(beneficiaries_list.length>0){
						article_obj.b=beneficiaries_list;
					}

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

					if(''==article_obj.m.trim()){
						error=ltmp_editor.editor_error_empty_markdown;
					}
					if(''==article_obj.t.trim()){
						error=ltmp_editor.editor_error_empty_title;
					}
					if(false===error){
						viz.api.getAccount(current_user,publish_protocol,function(err,response){
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
								if(false!==edit){
									let edit_account='';
									let edit_block=0;
									let link_account=edit.match(account_pattern);
									if(typeof link_account[0] != 'undefined'){
										edit_account=link_account[0].substr(1);
										let link_block=edit.match(block_pattern);
										if(typeof link_block[0] != 'undefined'){
											edit_block=parseInt(fast_str_replace('/','',link_block[0]));
										}
									}
									new_object.e='e';//edit
									if(current_user!=edit_account){
										new_object.a=edit_account;//account
									}
									if(edit_block>0){
										new_object.b=edit_block;//block
									}
									else{
										return;
									}
								}
								//check passphrase and try encode
								let passphrase='';
								let passphrase_arr=[];
								let passphrase_comment='';
								let passphrase_comment_arr=[];
								$('.article-settings .encode-passphrase .encode-passphrase-item').each(function(i,el){
									let item=$(el).find('input[name="encode-passphrase"]').val();
									if(''!=item){
										passphrase=item;
										passphrase_arr.push(passphrase);
									}
									item=$(el).find('input[name="encode-comment"]').val();
									if(''!=item){
										passphrase_comment=item;
										passphrase_comment_arr.push(passphrase_comment);
									}
								});
								if(passphrase_arr.length>1){//more than one passphrase
									passphrase_arr=passphrase_arr.reverse();
									passphrase_comment_arr=passphrase_comment_arr.reverse();
									try{
										for(let i in passphrase_arr){
											let number=i;
											if(0==number){
												new_object['nt']='p';//publication
											}
											else{
												new_object['nt']='e';//encoded
											}
											console.log('encode object',new_object,'with passphrase',passphrase_arr[number],'and comment',passphrase_comment_arr[number]);
											new_object['d']=JSON.stringify(new_object);
											new_object['d']=viz.aes.simpleEncoder(new_object['d'],passphrase_arr[number]);
											if(typeof passphrase_comment_arr === 'object'){
												if(typeof passphrase_comment_arr[number] === 'string'){
													new_object['c']=passphrase_comment_arr[number];
												}
											}
										}
										delete new_object['nt'];//remove new type because it already stringified and encoded
									}
									catch(e){
										console.log(e);
										view.find('.error').html(ltmp_arr.encoding_error);
										add_notify(false,'',ltmp_arr.encoding_error);
										$(target).removeClass('disabled');
										return;
									}
									new_object['t']='e';//encoded
								}
								else{
									if(''!=passphrase){//not empty passphrase
										try{
											new_object['d']['nt']=new_object['t'];//new type
											new_object['d']=JSON.stringify(new_object);
											new_object['d']=viz.aes.simpleEncoder(new_object['d'],passphrase);
											new_object['c']=passphrase_comment;//comment
										}
										catch(e){
											console.log(e);
											view.find('.error').html(ltmp_arr.encoding_error);
											add_notify(false,'',ltmp_arr.encoding_error);
											$(target).removeClass('disabled');
											return;
										}
										new_object['t']='e';//encoded
									}
								}

								let object_json=JSON.stringify(new_object);

								viz.broadcast.custom(users[current_user].regular_key,[],[current_user],publish_protocol,object_json,function(err,result){
									if(result){
										console.log(result);

										if(settings.save_passphrase_on_publish){
											if(''!=passphrase){
												add_passphrase(current_user,passphrase);
											}
										}

										if(false!==edit){
											if(settings.save_passphrase_on_publish){
												if(''!=passphrase){
													add_passphrase(current_user,passphrase);
												}
											}
											setTimeout(function(){
												update_user_last_event(current_user,function(result){
													if(false!==result){
														get_object(current_user,new_object.b,false,function(err,object_result){
															if(!err){
																view_path('viz://@'+current_user+'/'+new_object.b+'/publication/?event='+result,{},true,false);
																$(target).removeClass('disabled');
																$('.article-editor .editor-text').html('');
																$('.article-settings input[name="description"]').val('');
																$('.article-settings input[name="thumbnail"]').val('');
															}
														});
													}
												});
											},3000);
										}
										else{//get new object and add link to it
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
									}
									else{
										console.log(err);
										add_notify(false,'',ltmp_arr.gateway_error);
										$(target).removeClass('disabled');
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

					let view=$(target).closest('.content-view');
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
				let view=$(target).closest('.view');
				let path_parts=path.split('/');
				let force_path=false;
				if('dapp:publish'==path_parts[0]){
					if(view.find('.article-editor-action').hasClass('positive')){
						if(view.find('.article-settings-action').hasClass('positive')){
							view.find('.article-settings-action')[0].click();
							return;
						}
						else{
							if(!editable_object[2]){//if not edit object just back action
								view.find('.article-editor-action')[0].click();
								return;
							}
						}
					}
				}
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
					if(0!=$('.view[data-path="'+path_parts[0]+'"]').length){
						need_update=(true==$('.view[data-path="'+path_parts[0]+'"]').data('update'));
					}
				}
				//console.log('—— back action —— ','level: '+level,'need_update: '+need_update);

				level--;
				path='viz://';
				query='';
				query_obj={};

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
		}
	}
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
				if(trx_need_commit){
					t_add.commit();
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
			if(backup.time>sync_cloud_activity){
				sync_cloud_activity=backup.time;
				localStorage.setItem(storage_prefix+'sync_cloud_activity',sync_cloud_activity);
			}
		}
	}
	if(typeof backup.settings !== 'undefined'){
		settings=backup.settings;
		for(let i in default_settings){
			if(typeof settings[i]==='undefined'){
				settings[i]=default_settings[i];
			}
		}
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
			if(trx_need_commit){
				t_add.commit();
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
			if(trx_need_commit){
				t_add.commit();
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
			if(trx_need_commit){
				t_add.commit();
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
						if(trx_need_commit){
							t_add.commit();
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
			if(trx_need_commit){
				t_add.commit();
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
function import_cloud(data,callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	stop_timers(true);
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
				callback(false);
			}
			else{
				if(true===result){
					render_menu();
					render_session();
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
								'dapp:account/credentials'
							);
						}
					}
					else{
						add_notify(false,
							ltmp_arr.notify_arr.error,
							ltmp_arr.account_settings_empty_regular_key,
							'dapp:account/credentials'
						);
					}

					mute_notifications=60;//turn off notifications for next update feed
					localStorage.setItem(storage_prefix+'mute_notifications',mute_notifications);//set mute notifications for 1 minute to next reload
					setTimeout(function(){
						localStorage.removeItem(storage_prefix+'mute_notifications');
						mute_notifications=false;
					},mute_notifications*1000);

					start_timers();
					callback(true);
				}
				else{
					add_notify(false,
						ltmp_arr.notify_arr.sync,
						result
					);
					callback(false);
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

let set_no_gaps_events_train_num=0;
let set_no_gaps_events_train_counters=[];
function finish_set_no_gaps(counter,callback){
	//console.log('finish_set_no_gaps',counter,set_no_gaps_events_train_counters[counter]);
	set_no_gaps_events_train_counters[counter]--;
	if(0==set_no_gaps_events_train_counters[counter]){
		delete set_no_gaps_events_train_counters[counter];
		callback();
	}
}
function set_no_gaps_events_train(account,events,callback){
	let counter=set_no_gaps_events_train_num;
	set_no_gaps_events_train_num++;
	set_no_gaps_events_train_counters[counter]=0;
	for(let i in events){
		set_no_gaps_events_train_counters[counter]++;
		let event_block=events[i];
		//console.log('set_no_gaps_events_train',account,event_block,counter,set_no_gaps_events_train_counters[counter]);
		let t,q,req;
		t=db.transaction(['events'],'readwrite');
		q=t.objectStore('events');
		req=q.index('event').openCursor(IDBKeyRange.only([account,event_block]),'next');
		let find=false;
		req.onsuccess=function(event){
			let cur=event.target.result;
			if(cur){
				find=true;
				let result=cur.value;
				result.no_gaps=1;
				update_req=cur.update(result);
				update_req.onsuccess=function(e){
					finish_set_no_gaps(counter,callback);
				}
				cur.continue();
			}
			else{
				if(!find){
					finish_set_no_gaps(counter,callback);//impossible, parsed, updated, but no reason to panic, just callback
				}
			}
		};
	}
}
//need to update events from train, set no_gaps=1 for fast events train in future loadings
function finish_events_train(events_train,account,callback){
	let no_gaps=0;
	if(typeof events_train['no_gaps'] !== 'undefined'){
		no_gaps=events_train['no_gaps'];
	}
	//if any event error, false no_gaps
	if(typeof events_train['error'] !== 'undefined'){
		if(0<events_train['error'].length){
			no_gaps=0;
		}
	}
	events_train['loaded'].sort();
	if(1==no_gaps){
		set_no_gaps_events_train(account,events_train['loaded'],function(){
			load_events(account,events_train['loaded'],function(affected_objects){
				console.log('finish load_events from finish_events_train',check_account);
				callback(affected_objects);
			});
		});
	}
	else{
		load_events(account,events_train['loaded'],function(affected_objects){
			console.log('finish load_events from finish_events_train',check_account);
			callback(affected_objects);
		});
	}
}
//top/recursive deep loader from known event block to previous while not found gap/no_gaps/end/stop block num
//need_new is condition to look deeper that already know
function load_events_train(events_train,account,event_block,stop_block,need_new,deep,callback){
	if(typeof events_train['loaded'] === 'undefined'){
		events_train['loaded']=[];
	}
	if(typeof events_train['error'] === 'undefined'){
		events_train['error']=[];
	}
	if(typeof events_train['no_gaps'] === 'undefined'){
		events_train['no_gaps']=0;
	}
	//console.log('load_events_train',account,event_block);
	parse_event(account,event_block,function(err,result,is_new){
		//console.log('load_events_train parse_event',err,result);
		if(err){
			//no event found, no matter for reason
			if(1==result){//node error
				add_notify(false,'',ltmp_arr.gateway_error);
			}
			if(2==result){//event not found, show notice
				add_notify(false,'',ltmp_arr.event_not_found+' ['+event_block+']');
			}
			events_train['error'].push(event_block);
			callback(events_train);
		}
		else{
			events_train['loaded'].push(event_block);
			let is_end=false;
			let previous=0;
			if(typeof result.data.p !== 'undefined'){
				previous=parseInt(result.data.p);
			}
			if(previous<=stop_block){
				is_end=true;
			}
			if(0==previous){
				events_train['no_gaps']=1;
			}
			if(need_new){
				if(is_new){
					deep--;
				}
			}
			else{
				deep--;
			}
			if(deep<=0){
				is_end=true;
			}
			if(typeof result.no_gaps !== 'undefined'){
				if(1==result.no_gaps){
					is_end=true;
					events_train['no_gaps']=1;
				}
			}
			if(!is_end){
				load_events_train(events_train,account,previous,stop_block,need_new,deep,callback);
			}
			else{
				callback(events_train);
			}
		}
	});
}

//check user last event update time and update it, if needed by settings/personal activity period
function check_user_last_event(account,callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	let check_activity=(new Date().getTime() /1000 | 0) - settings.activity_period*60;
	idb_get_by_id('users','account',account,function(user_data){
		if(false===user_data){
			callback(false);
		}
		else{
			if(typeof user_data.last_event_update !== 'undefined'){
				let item_check_activity=check_activity;
				if(typeof user_data.settings !== 'undefined'){
					if(typeof user_data.settings.activity_period !== 'undefined'){
						item_check_activity=(new Date().getTime() /1000 | 0) - user_data.settings.activity_period*60;
					}
				}
				if(user_data.last_event_update<item_check_activity){
					update_user_last_event(account,callback);
				}
				else{
					callback(user_data.last_event);
				}
			}
			else{
				update_user_last_event(account,callback);
			}
		}
	});
}

//get account events_protocol block num, store as users.last_event, callback number or false
function update_user_last_event(account,callback){
	console.log('update_user_last_event',account);
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	viz.api.getAccount(account,events_protocol,function(err,response){
		if(err){
			console.log('viz api error:',err);
			callback(false);
		}
		else{
			let t=db.transaction(['users'],'readwrite');
			let q=t.objectStore('users');
			let req=q.index('account').openCursor(IDBKeyRange.only(account),'next');

			let find=false;
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					let result=cur.value;
					result.last_event=response.custom_sequence_block_num;
					result.last_event_update=new Date().getTime() / 1000 | 0;
					find=true;
					update_req=cur.update(result);
					update_req.onsuccess=function(e){
						callback(response.custom_sequence_block_num);
					}
					cur.continue();
				}
				else{
					if(!find){
						callback(false);
					}
				}
			};
		}
	});
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
				if(typeof json_metadata.profile.categories != 'undefined'){
					profile_obj.categories=json_metadata.profile.categories;
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
				profile_obj.avatar=ltmp_global.profile_default_avatar;
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
						if(trx_need_commit){
							add_t.commit();
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

	let feed_time=0;
	if(typeof $('.view[data-level="0"] .objects').data('feed-time') !== 'undefined'){
		feed_time=parseInt($('.view[data-level="0"] .objects').data('feed-time'));
	}

	let count=0;
	console.log('feed_load_final',result);
	for(let i in result){
		let item=result[i];
		feed_add(account,item.block,item.time);
		if(item.time>feed_time){
			count++;
		}
	}
	console.log('feed_load_final feed_time',feed_time,count);
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
	get_object(account,next_offset,true,function(err,object_result){
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
				//console.log('!!! check processed object_result by feed_load_more',object_result);
				let processed=false;
				if(typeof object_result.processed !== 'undefined'){
					processed=object_result.processed;
				}
				if(processed){//already processed, don't need trigger events
					feed_load_result(result,account,object_result.block,next_offset,end_offset,(limit-1),callback);
				}
				else{//need check conditions for adding to feed and notificy events
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
								if(typeof object_result.data.d.text !== 'undefined'){
									share_text=object_result.data.d.text;
								}
								else{
									if(typeof object_result.data.d.t !== 'undefined'){
										share_text=object_result.data.d.t;
									}
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
								let reply_text='';
								if(typeof object_result.data.d.text !== 'undefined'){
									reply_text=object_result.data.d.text;
								}
								else{
									if(typeof object_result.data.d.t !== 'undefined'){
										reply_text=object_result.data.d.t;
									}
								}
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
								if(object_result.account!==current_user){
									if(-1!=object_result.data.d.text.indexOf('@'+current_user)){//mention
										let link='viz://@'+object_result.account+'/'+object_result.block+'/';
										let reply_text=object_result.data.d.text;
										add_notify(true,ltmp(ltmp_arr.notify_arr.new_mention,{account:object_result.account}),reply_text,link);
										feed=true;
									}
								}
							}
							else{
								if(typeof object_result.data.d.t !== 'undefined'){
									if(object_result.account!==current_user){
										if(-1!=object_result.data.d.t.indexOf('@'+current_user)){//mention
											let link='viz://@'+object_result.account+'/'+object_result.block+'/';
											let reply_text=object_result.data.d.t;
											add_notify(true,ltmp(ltmp_arr.notify_arr.new_mention,{account:object_result.account}),reply_text,link);
											feed=true;
										}
									}
								}
							}
						}
						if('publication'==object_type){
							if(typeof object_result.data.d.m !== 'undefined'){
								if(object_result.account!==current_user){
									if(-1!=object_result.data.d.m.indexOf('@'+current_user)){//mention
										let link='viz://@'+object_result.account+'/'+object_result.block+'/';
										let reply_text=object_result.data.d.t;//title
										add_notify(true,ltmp(ltmp_arr.notify_arr.new_mention,{account:object_result.account}),reply_text,link);
										feed=true;
									}
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
		}
	});
}

//info: on update users feed by activity by update_feed_subscribes limit=false, upper_bound=false, continued=true
//info: on parse object if its new, check author status, if user subscribed, then limit=false, upper_bound=block, continued=false (onlt from block to upper in object store)
function feed_load(account,limit,upper_bound,continued,callback){
	console.log('feed_load',account,'limit:',limit,'upper_bound:',upper_bound,'continued:',continued);
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
			console.log('feed_load cur',cur.value);
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
				console.log('feed_load get_user',user_result);
				if(open_border){
					offset=upper_bound;//start from given upper bound
				}
				else{
					offset=user_result.start;//start from user last activity
				}
				console.log('feed_load check offset>end_offset',offset>end_offset,offset,end_offset);
				if(offset>end_offset){
					console.log('feed_load going to feed_load_more in range',offset,end_offset,account);
					console.log('start feed_load_more from feed_load, offset, end offset, limit:',account,offset,end_offset,limit);
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
			if(trx_need_commit){
				add_t.commit();
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

var object_types_list=['t','text','p','publication','e','encoded'];
var object_types_arr={'t':'text','p':'publication','e':'encoded'};

//need to make queue for additional callbacks in similar parse events (if created)
var parsing_events=[];
var parsing_events_num=0;
//return [err,result], result is event object in database
function parse_event(account,block,callback){
	if(0==block){
		return;
	}
	console.log('parse_event',account,block);
	let current_parse=false;
	for(let o in parsing_events){
		if(parsing_events[o][0]==account){
			if(parsing_events[o][1]==block){
				current_parse=o;
			}
		}
	}
	if(false!==current_parse){
		//add callback if parsing waiting response from node
		parsing_events[current_parse][2].push(callback);
	}
	else{
		current_parse=parsing_events_num;
		parsing_events[current_parse]=[account,block,[]];
		parsing_events_num++;
		//check event in store, if not founded, then search ops in block and add it
		idb_get_by_id('events','event',[account,block],function(event_obj){
			if(false!==event_obj){
				callback(false,event_obj,false);//return no error with obj data, not new
				for(let parse_callback in parsing_events[current_parse][2]){
					parsing_events[current_parse][2][parse_callback](false,obj,false);
				}
				delete parsing_events[current_parse];
			}
			else{
				//old get_ops_in_block api work only with node plugin operation_history
				//viz.api.getOpsInBlock(block,false,function(err,response){
				//new get_block api work with standart database_api node plugin
				viz.api.getBlock(block,function(err,response){
					transactions=response.transactions;
					console.log('parse_event get_ops_in_block',block,err,response);
					if(err){
						callback(true,1);//api error or block not found
						for(let parse_callback in parsing_events[current_parse][2]){
							parsing_events[current_parse][2][parse_callback](true,1);//node error
						}
						delete parsing_events[current_parse];
					}
					else{
						let item=false;
						//for(let i in response){//old
						for(let i in transactions){//new
							let item_i=i;
							let trx=transactions[item_i];
							//let object_timestamp=response[item_i].timestamp;//old
							//let operation=trx['op'];//old
							let object_timestamp=response.timestamp;
							for(let operation_id in trx['operations']){//for new get_block api
								let operation=trx['operations'][operation_id];
								if('custom'==operation[0]){
									if(events_protocol==operation[1].id){
										let op=operation[1];
										if(op.required_regular_auths.includes(account)){
											item=JSON.parse(operation[1].json);
											item.timestamp=parse_date(object_timestamp) / 1000 | 0;
										}
									}
								}
							}
						}
						console.log('parse_event get_ops_in_block item',item);
						if(false===item){
							callback(true,2);//item not found
							for(let parse_callback in parsing_events[current_parse][2]){
								parsing_events[current_parse][2][parse_callback](true,2);
							}
							delete parsing_events[current_parse];
						}
						else{
							/*
							item:
								p/previous
								e/event
								a/account
								b/block
								d/data
							*/
							let obj={
								account:account,
								block:parseInt(block),
								data:item,
								executed:0,
							};
							obj.time=new Date().getTime() / 1000 | 0;//unixtime
							console.log(obj);

							let t,q,req;
							t=db.transaction(['events'],'readwrite');
							q=t.objectStore('events');
							req=q.index('event').openCursor(IDBKeyRange.only([account,block]),'next');

							let find=false;
							req.onsuccess=function(event){
								let cur=event.target.result;
								if(cur){
									find=true;
									obj=cur.value;
									cur.continue();
								}
								else{
									if(!find){//object not found in base
										let add_t,add_q;
										add_t=db.transaction(['events'],'readwrite');
										add_q=add_t.objectStore('events');
										add_q.add(obj);
										if(trx_need_commit){
											add_t.commit();
										}
										add_t.oncomplete=function(e){
											callback(false,obj,true);//return no error with obj data, is new
											for(let parse_callback in parsing_events[current_parse][2]){
												parsing_events[current_parse][2][parse_callback](false,obj,true);
											}
											delete parsing_events[current_parse];
										};
									}
									else{
										callback(false,obj,false);//return no error with obj data, not new (? seems added from other proccess)
										for(let parse_callback in parsing_events[current_parse][2]){
											parsing_events[current_parse][2][parse_callback](false,obj,false);
										}
										delete parsing_events[current_parse];
									}
								}
							};
						}
					}
				});
			}
		});
	}
}

function add_hashtag_object(hashtag_id,account,block){
	idb_get_id_filter('hashtags_feed','object',[account,block],{tag:hashtag_id},function(feed_id){
		if(false===feed_id){//add object to hashtag feed
			let add_t,add_q,add_req;
			add_t=db.transaction(['hashtags_feed'],'readwrite');
			add_q=add_t.objectStore('hashtags_feed');
			add_req=add_q.add({tag:hashtag_id,account:account,block:block});
			if(trx_need_commit){
				add_t.commit();
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
}

//need to make queue for callbacks in similar parse object executions
var parsing_objects=[];
var parsing_object_num=0;
function parse_object(account,block,feed_load_flag,callback){
	//feed_load_flag needed to solve recursive problem with event new feed_load
	feed_load_flag=typeof feed_load_flag==='undefined'?false:feed_load_flag;
	block=parseInt(block);
	let current_parse=false;
	for(let o in parsing_objects){
		if(parsing_objects[o][0]==account){
			if(parsing_objects[o][1]==block){
				current_parse=o;
			}
		}
	}
	if(false!==current_parse){
		//console.log('find existed parsing_objects with i:',current_parse,parsing_objects[current_parse]);
		parsing_objects[current_parse][2].push(callback);
	}
	else{
		current_parse=parsing_object_num;
		parsing_objects[current_parse]=[account,block,[]];
		//console.log('create new parsing_objects with i:',current_parse,parsing_objects[current_parse]);
		parsing_object_num++;
		let result={};
		//old get_ops_in_block api work only with node plugin operation_history
		//viz.api.getOpsInBlock(block,false,function(err,response){
		//new get_block api work with standart database_api node plugin
		viz.api.getBlock(block,function(err,response){
			transactions=response.transactions;
			if(err){
				callback(true,1);//api error or block not found
				for(let parse_callback in parsing_objects[current_parse][2]){
					parsing_objects[current_parse][2][parse_callback](true,1);
				}
				delete parsing_objects[current_parse];
			}
			else{
				let item=false;
				//for(let i in response){//old
				for(let i in transactions){//new
					let item_i=i;
					let trx=transactions[item_i];
					//let object_timestamp=response[item_i].timestamp;//old
					//let operation=trx['op'];//old
					let object_timestamp=response.timestamp;
					for(let operation_id in trx['operations']){//for new get_block api
						let operation=trx['operations'][operation_id];
						if('custom'==operation[0]){
							if(app_protocol==operation[1].id){
								let op=operation[1];
								if(op.required_regular_auths.includes(account)){
									item=JSON.parse(operation[1].json);
									item.timestamp=parse_date(object_timestamp) / 1000 | 0;
								}
							}
						}
					}
				}
				if(false==item){
					callback(true,2);//item not found
					for(let parse_callback in parsing_objects[current_parse][2]){
						parsing_objects[current_parse][2][parse_callback](true,2);
					}
					delete parsing_objects[current_parse];
				}
				else{
					let reply=false;
					let share=false;
					let share_link=false;

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
							if(typeof reply_link !== 'string'){
								reply_link='';
							}
							//internal
							if(0==reply_link.indexOf('viz://')){
								reply_link=reply_link.toLowerCase();
								reply_link=escape_html(reply_link);
								let reply_account=reply_link.match(account_pattern);
								if(typeof reply_account[0] != 'undefined'){
									let reply_block=reply_link.match(block_pattern);
									if(typeof reply_block[0] != 'undefined'){
										reply=true;
										parent_account=reply_account[0].substr(1);
										parent_block=parseInt(fast_str_replace('/','',reply_block[0]));
									}
								}
							}
						}
						else
						if(typeof item.d.s != 'undefined'){
							share_link=item.d.s;
							if(typeof share_link !== 'string'){
								share_link='';
							}
							//internal
							if(0==share_link.indexOf('viz://')){
								share_link=share_link.toLowerCase();
								share_link=escape_html(share_link);
								let share_account=share_link.match(account_pattern);
								if(typeof share_account[0] != 'undefined'){
									let share_block=share_link.match(block_pattern);
									if(typeof share_block[0] != 'undefined'){
										share=true;
										parent_account=share_account[0].substr(1);
										parent_block=parseInt(fast_str_replace('/','',share_block[0]));
									}
								}
							}
							//external
							if((0==share_link.indexOf('http://'))||(0==share_link.indexOf('https://'))){
								share=true;
							}
						}
					}
					let nsfw=0;
					let obj={
						account:account,
						block:block,
						data:item,
						is_reply:0,
						is_share:0,
						nsfw:nsfw,
					};
					if('text'==type){
						if(reply){
							obj.is_reply=1;
							obj.parent_account=parent_account;
							obj.parent_block=parent_block;
						}
						if(share){
							obj.is_share=1;
							if(false!==parent_account){
								obj.parent_account=parent_account;
								obj.parent_block=parent_block;
							}
							else{
								obj.link=share_link;
							}
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
							result.processed=false;
							find=true;
							idb_get_id('feed','object',[account,block],function(feed_id){
								if(false!==feed_id){
									result.processed=true;//already in feed
								}
								console.log('parse_object: find in objects cache: '+account+' '+block+(result.processed?' (processed in feed)':' (not processed in feed)'));
								callback(false,result);
								for(let parse_callback in parsing_objects[current_parse][2]){
									parsing_objects[current_parse][2][parse_callback](false,result);
								}
								delete parsing_objects[current_parse];
							});
							cur.continue();
						}
						else{
							if(!find){//object not found in base
								//benchmark for object execution
								/* hashtags support */
								//need replace url with hash to avoid conflict
								let hashtags_text='none';
								if('text'==type){
									if(typeof obj.data.d.text !== 'undefined'){
										hashtags_text=obj.data.d.text;
									}
									else{
										if(typeof obj.data.d.t !== 'undefined'){
											hashtags_text=obj.data.d.t;
										}
									}
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

								let hashtags_pattern = /(|\b)#([^:;@#!.,?\r\n\t <>()\[\]]+)(|\b)/g;;
								let hashtags_links=hashtags_text.match(hashtags_pattern);
								if(null!=hashtags_links){
									hashtags_links=hashtags_links.map(function(value){
										return value.toLowerCase();
									});
									hashtags_links=array_unique(hashtags_links);

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
													if(trx_need_commit){
														hashtag_add_t.commit();
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

								/* check nsfw hashtags in object texts */
								let nsfw_text='';
								if('text'==type){
									if(typeof obj.data.d.text !== 'undefined'){
										nsfw_text=obj.data.d.text;
									}
									else{
										if(typeof obj.data.d.t !== 'undefined'){
											nsfw_text=obj.data.d.t;
										}
									}
								}
								if('publication'==type){
									nsfw_text=markdown_clear_code(obj.data.d.m);//markdown
									nsfw_text=markdown_decode_text(nsfw_text);
									let mnemonics_pattern = /&#[a-z0-9\-\.]+;/g;
									nsfw_text=nsfw_text.replace(mnemonics_pattern,'');//remove unexpected html mnemonics
								}
								for(let i in settings.nsfw_hashtags){
									let search_hashtag='#'+settings.nsfw_hashtags[i];
									if(-1!=nsfw_text.indexOf(search_hashtag)){
										nsfw=1;
									}
								}
								obj.nsfw=nsfw;

								let add_t,add_q;
								add_t=db.transaction(['objects'],'readwrite');
								add_q=add_t.objectStore('objects');
								add_q.add(obj);
								if(trx_need_commit){
									add_t.commit();
								}
								add_t.oncomplete=function(e){
									//try load all known passphrases for account if type is encoded
									if('encoded'==type){
										get_passphrases(account,function(err,result){
											if(!err){
												for(let i in result){
													let passphrase=result[i];
													decode_object(account,block,passphrase,function(result){
														if(result){
															get_user(account,false,function(err,object_user){
																if(!err){
																	get_object(account,block,false,function(err,object_result){
																		if(!err){
																			let link='viz://@'+account+'/'+block+'/';
																			let view=$('.view[data-level="'+level+'"]');
																			if(-1==path.indexOf('viz://')){//look in services views
																				let path_parts=path.split('/');
																				view=$('.view[data-path="'+path_parts[0]+'"]');
																			}
																			let find_object=view.find('.objects>.object[data-account="'+account+'"][data-block="'+block+'"]');
																			if(find_object.length>0){
																				find_object=view.find('.object[data-link="'+link+'"]');
																			}
																			if(find_object.length>0){
																				let object_preview=false;
																				if(find_object.hasClass('type-text-preview')){
																					object_preview=true;
																				}
																				let object_type='default';
																				if(object_preview){
																					object_type='preview';
																				}
																				new_render=render_object(object_user,object_result,object_type);
																				find_object.before(new_render);
																				find_object.remove();//remove old view
																				if(object_preview){
																					update_short_date();
																				}
																				else{
																					set_date_view($('.object[data-link="'+link+'"] .date-view'),true);
																				}
																			}
																		}
																	});
																}
															});
														}
													});
												}
											}
										});
									}
									if(!feed_load_flag){
										//solved by feed_load_flag (true when come from feed_load)
										//problem code, it's trigger automatically for user, if you open object by link in new page, feed not loaded for him, but it's limited now with current object height
										//but if it stepped by feed load events - create recurse for lover objects
										idb_get_by_id('users','account',account,function(user_data){
											if(1==user_data.status){//subscribed to account
												//check feed load for parsed object and previous unseen range
												feed_load(account,false,block,false,function(err,result){
													console.log('parse_object: feed load (not founded)',err,result);
													if(!err){
														update_feed_result(result);
													}
												});
											}
										});
									}
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
												if(trx_need_commit){
													reply_add_t.commit();
												}
												reply_add_t.oncomplete=function(e){
													callback(false,obj);
													for(let parse_callback in parsing_objects[current_parse][2]){
														parsing_objects[current_parse][2][parse_callback](false,obj);
													}
													delete parsing_objects[current_parse];
												};
											}
											else{//already exist
												callback(false,obj);
												for(let parse_callback in parsing_objects[current_parse][2]){
													parsing_objects[current_parse][2][parse_callback](false,obj);
												}
												delete parsing_objects[current_parse];
											}
										});
									}
									else{
										callback(false,obj);
										for(let parse_callback in parsing_objects[current_parse][2]){
											parsing_objects[current_parse][2][parse_callback](false,obj);
										}
										delete parsing_objects[current_parse];
									}
								};
							}
						}
					};
				}
			}
		});
	}
}

function load_nested_replies(el){
	let link=$(el).closest('.branch').find('.object').data('link');
	let nest=$(el).closest('.nested-replies');
	let parent_account=false;
	let parent_block=false;
	if(0==link.indexOf('viz://')){
		link=link.toLowerCase();
		link=escape_html(link);
		let link_account=link.match(account_pattern);
		if(typeof link_account[0] != 'undefined'){
			let link_block=link.match(block_pattern);
			if(typeof link_block[0] != 'undefined'){
				reply=true;
				parent_account=link_account[0].substr(1);
				parent_block=parseInt(fast_str_replace('/','',link_block[0]));
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

function add_passphrase(account,passphrase){
	let t=db.transaction(['passphrases'],'readwrite');
	let q=t.objectStore('passphrases');
	req=q.index('account').openCursor(IDBKeyRange.only(account),'next');

	let find=false;
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			if(cur.value.passphrase==passphrase){
				find=true;
			}
			cur.continue();
		}
		else{
			if(!find){
				/*
				passphrases struct:
				account - string
				passphrase - string
				time - unixtime
				*/
				q.add({account:account,passphrase:passphrase,time:(new Date().getTime() / 1000 | 0)});
				if(trx_need_commit){
					t.commit();
				}
				//try decode all encoded objects from this account with new passphrase
				try_decode_all_objects(account,passphrase);
			}
		}
	};
}

function get_passphrases(account,callback){
	let passphrases=[];
	let t=db.transaction(['passphrases'],'readonly');
	let q=t.objectStore('passphrases');
	let req=q.index('account').openCursor(IDBKeyRange.only(account),'next');
	let find=0;
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			passphrases.push(cur.value.passphrase);
			find++;
			cur.continue();
		}
		else{
			if(find){
				callback(false,passphrases);
			}
			else{
				callback(true,[]);
			}
		}
	};
}

function try_decode_all_objects(account,passphrase){
	let t=db.transaction(['objects'],'readwrite');
	let q=t.objectStore('objects');
	let req=q.index('account').openCursor(IDBKeyRange.only(account),'next');
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			let result=cur.value;
			if('e'==result.data.t){//encoded
				decode_object(account,result.block,passphrase,function(success){
					if(success){
						let block=result.block;
						console.log('try_decode_all_objects success',account,block);
						get_user(account,false,function(err,object_user){
							if(!err){
								get_object(account,block,false,function(err,object_result){
									if(!err){
										let link='viz://@'+account+'/'+block+'/';
										let view=$('.view[data-level="'+level+'"]');
										if(-1==path.indexOf('viz://')){//look in services views
											let path_parts=path.split('/');
											view=$('.view[data-path="'+path_parts[0]+'"]');
										}
										let find_object=view.find('.objects>.object[data-account="'+account+'"][data-block="'+block+'"]');
										if(find_object.length>0){
											find_object=view.find('.object[data-link="'+link+'"]');
										}
										if(find_object.length>0){
											let object_preview=false;
											if(find_object.hasClass('type-text-preview')){
												object_preview=true;
											}
											let object_type='default';
											if(object_preview){
												object_type='preview';
											}
											new_render=render_object(object_user,object_result,object_type);
											find_object.before(new_render);
											find_object.remove();//remove old view
											if(object_preview){
												update_short_date();
											}
											else{
												set_date_view($('.object[data-link="'+link+'"] .date-view'),true);
											}
										}
									}
								});
							}
						});
					}
				});
			}
			cur.continue();
		}
	};
}

function decode_object(account,block,passphrase,callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	block=parseInt(block);
	let t,q,req;
	t=db.transaction(['objects'],'readwrite');
	q=t.objectStore('objects');
	req=q.index('object').openCursor(IDBKeyRange.only([account,block]),'next');

	let find=false;
	let update_context=false;//if object need update context
	let new_encoded=false;//if object contain new encoded data
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			let result=cur.value;
			if('e'!=result.data.t){//encoded
				console.log('object already decoded',account,block);
				callback(true);//as decoded already
			}
			let new_object_data=false;
			try{
				new_object_data=viz.aes.simpleDecoder(result.data.d,passphrase);
				console.log('succefull decode object',account,block,new_object_data);
				if(false!==new_object_data){
					new_object_data=JSON.parse(new_object_data);
					delete result.data.t;
					if(typeof result.data.c !== 'undefined'){
						delete result.data.c;//remove comment
						if(typeof new_object_data.c !== 'undefined'){//if encoded chain
							result.data.c=new_object_data.c;
						}
					}
					if(typeof new_object_data.d !== 'undefined'){
						result.data.d=new_object_data.d;
						result.data.d.decoded=1;
						if(typeof new_object_data.d.nt !== 'undefined'){
							result.data.t=new_object_data.d.nt;//new object type
						}
						else{//if encoded chain
							if(typeof new_object_data.nt !== 'undefined'){
								result.data.t=new_object_data.nt;//new object type
							}
						}
					}
				}
				add_passphrase(account,passphrase);
				console.log('DECODED',result.data.t);
				if(typeof result.data.t !== 'undefined'){
					if('e'==result.data.t||'encoded'==result.data.t){//check if new type is chain encoded
						new_encoded=true;
					}
				}
				update_context=true;
			}
			catch(e){
				console.log('unable decode object',account,block,e);
			}

			if(update_context){
				//need to update share/reply statuses, hashtags, nsfw
				let reply=false;
				let share=false;
				let share_link=false;
				let nsfw=result.nsfw;

				let parent_account=false;
				let parent_block=false;

				let type='text';//check type
				if(typeof result.data.t !== 'undefined'){
					if(-1!=object_types_list.indexOf(result.data.t)){
						if(typeof object_types_arr[result.data.t] !== 'undefined'){
							type=object_types_arr[result.data.t];
						}
						else{
							type=result.data.t;
						}
					}
				}
				console.log(type);
				if('encoded'!==type){
					if('text'==type){
						if(typeof result.data.d.r !== 'undefined'){
							let reply_link=result.data.d.r;
							if(typeof reply_link !== 'string'){
								reply_link='';
							}
							//internal
							if(0==reply_link.indexOf('viz://')){
								reply_link=reply_link.toLowerCase();
								reply_link=escape_html(reply_link);
								let reply_account=reply_link.match(account_pattern);
								if(typeof reply_account[0] != 'undefined'){
									let reply_block=reply_link.match(block_pattern);
									if(typeof reply_block[0] != 'undefined'){
										reply=true;
										parent_account=reply_account[0].substr(1);
										parent_block=parseInt(fast_str_replace('/','',reply_block[0]));
									}
								}
							}
						}
						else
						if(typeof result.data.d.s != 'undefined'){
							share_link=result.data.d.s;
							if(typeof share_link !== 'string'){
								share_link='';
							}
							//internal
							if(0==share_link.indexOf('viz://')){
								share_link=share_link.toLowerCase();
								share_link=escape_html(share_link);
								let share_account=share_link.match(account_pattern);
								if(typeof share_account[0] != 'undefined'){
									let share_block=share_link.match(block_pattern);
									if(typeof share_block[0] != 'undefined'){
										share=true;
										parent_account=share_account[0].substr(1);
										parent_block=parseInt(fast_str_replace('/','',share_block[0]));
									}
								}
							}
							//external
							if((0==share_link.indexOf('http://'))||(0==share_link.indexOf('https://'))){
								share=true;
							}
						}
					}
					if('text'==type){
						if(reply){
							result.is_reply=1;
							result.parent_account=parent_account;
							result.parent_block=parent_block;
						}
						if(share){
							result.is_share=1;
							if(false!==parent_account){
								result.parent_account=parent_account;
								result.parent_block=parent_block;
							}
							else{
								result.link=share_link;
							}
						}
					}

					/* hashtags support */
					//need replace url with hash to avoid conflict
					let hashtags_text='none';
					if('text'==type){
						hashtags_text=result.data.d.text;
						if(typeof result.data.d.text !== 'undefined'){
							hashtags_text=result.data.d.text;
						}
						else{
							if(typeof result.data.d.t !== 'undefined'){
								hashtags_text=result.data.d.t;
							}
						}
					}
					if('publication'==type){
						hashtags_text=markdown_clear_code(result.data.d.m);//markdown
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

					let hashtags_pattern = /(|\b)#([^:;@#!.,?\r\n\t <>()\[\]]+)(|\b)/g;;
					let hashtags_links=hashtags_text.match(hashtags_pattern);
					if(null!=hashtags_links){
						hashtags_links=hashtags_links.map(function(value){
							return value.toLowerCase();
						});
						hashtags_links=array_unique(hashtags_links);

						console.log('execute event object hashtags',hashtags_links,result.account,result.block);
						clear_hashtag_object(result.account,result.block,function(){
							console.log('execute event after clear_hashtag_object object hashtags',hashtags_links);
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
											if(trx_need_commit){
												hashtag_add_t.commit();
											}
											hashtag_add_req.onsuccess=function(e){
												idb_get_id('hashtags','tag',hashtag,function(hashtag_id){
													if(false!==hashtag_id){
														add_hashtag_object(hashtag_id,result.account,result.block);
													}
												});
											}
										}
										else{
											add_hashtag_object(hashtag_id,result.account,result.block);
										}
									});
								}
							}
						});
					}

					/* check nsfw hashtags in object texts */
					let nsfw_text='';
					if('text'==type){
						if(typeof result.data.d.text !== 'undefined'){
							nsfw_text=result.data.d.text;
						}
						else{
							if(typeof result.data.d.t !== 'undefined'){
								nsfw_text=result.data.d.t;
							}
						}
					}
					if('publication'==type){
						nsfw_text=markdown_clear_code(result.data.d.m);//markdown
						nsfw_text=markdown_decode_text(nsfw_text);
						let mnemonics_pattern = /&#[a-z0-9\-\.]+;/g;
						nsfw_text=nsfw_text.replace(mnemonics_pattern,'');//remove unexpected html mnemonics
					}
					for(let i in settings.nsfw_hashtags){
						let search_hashtag='#'+settings.nsfw_hashtags[i];
						if(-1!=nsfw_text.indexOf(search_hashtag)){
							nsfw=1;
						}
					}
					if(nsfw!=result.nsfw){
						result.nsfw=nsfw;
					}
				}
				cur.update(result);
			}
			find=true;
			cur.continue();
		}
		else{
			if(find){
				if(update_context){
					callback(true);
				}
				else{
					callback(false);
				}
			}
			else{
				callback(false);
			}
		}
	};
}

function get_object(account,block,feed_load_flag,callback){
	//feed_load_flag needed to solve recursive problem with event new feed_load from parse_object
	feed_load_flag=typeof feed_load_flag==='undefined'?false:feed_load_flag;
	block=parseInt(block);
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
			result.processed=false;
			find=true;
			cur.continue();
		}
		else{
			if(find){
				idb_get_id('feed','object',[account,block],function(feed_id){
					if(false!==feed_id){
						result.processed=true;
					}
					console.log('get_object: find in objects cache: '+account+' '+block+(result.processed?' (processed in feed)':' (not processed in feed)'));
					callback(false,result);
				});
			}
			else{
				console.log('need parse object: '+account+' '+block);
				parse_object(account,block,feed_load_flag,callback);
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
						//remove replies linked with object
						let remove_t,remove_q,remove_req;
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
						//remove hashtags feed linked with object
						let remove_t2,remove_q2,remove_req2;
						remove_t2=db.transaction(['hashtags_feed'],'readwrite');
						remove_q2=remove_t2.objectStore('hashtags_feed');
						remove_req2=remove_q2.index('object').openCursor(IDBKeyRange.only([item_i[0],item_i[1]]),'next');
						remove_req2.onsuccess=function(event){
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
	let cleared_accounts=[];
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			if(0==cur.value.status){//deleting only temporary users
				cleared_accounts.push(cur.value.account);
				cur.delete();
			}
			cur.continue();
		}
		else{
			console.log('clear_users_cache',cleared_accounts);
			for(let i in cleared_accounts){
				let clear_account=cleared_accounts[i];
				let remove_t,remove_q,remove_req;
				remove_t=db.transaction(['events'],'readwrite');
				remove_q=remove_t.objectStore('events');
				remove_req=remove_q.index('account').openCursor(IDBKeyRange.only(clear_account),'next');
				remove_req.onsuccess=function(event){
					let cur=event.target.result;
					if(cur){
						cur.delete();
						cur.continue();
					}
				}
			}
			callback();
		}
	};
}

function stop_timers(emergency_stop){
	console.log('! stop_timers',emergency_stop);
	emergency_stop=typeof emergency_stop==='undefined'?false:emergency_stop;
	if(emergency_stop){
		for(let feed_account_timer in feed_load_timers){
			clearTimeout(feed_load_timers[feed_account_timer]);
		}
		clearTimeout(load_notifications_count_timer);
	}
	clearTimeout(update_feed_timer);
	clearTimeout(load_new_objects_timer);
	clearTimeout(check_load_more_timer);
	clearTimeout(clear_cache_timer);
	clearTimeout(dgp_timer);
	clearTimeout(sync_cloud_update_worker_timer);
}

function start_timers(){
	console.log('! start_timers');
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
		if(typeof bc === 'object'){
			//send to others tabs about notifications count
			bc.postMessage({type:'notifications_count',pid:pid,count:count});
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
				if(typeof bc === 'object'){
					//send to others tabs about new items in feed
					bc.postMessage({type:'feed_count',pid:pid,count:count});
				}
			}
		}
	}
}

function update_feed_events_subscribes(check_account){
	let check_level=0;//load new objects only in feed (0 level)
	let view=$('.view[data-level="0"]');
	//load more object in profile trigger load new event (1), for unknown accounts too
	let events_deep=settings.activity_deep;
	check_user_last_event(check_account,function(last_event){
		if(false!==last_event){//no user events at all
			console.log('update_feed_events_subscribes check_user_last_event block num',check_account,last_event);
			let need_new=false;
			load_events_train({},check_account,last_event,0,need_new,events_deep,function(train){
				console.log('update_feed_events_subscribes load_events_train',train);
				finish_events_train(train,check_account,function(affected_objects){
					console.log('update_feed_events_subscribes finish_events_train affected_objects',check_account,affected_objects);
					for(let i in affected_objects){
						let affected_object_block=affected_objects[i];
						//need to update render view for all affected objects (preview/pinned in profile feed)
						setTimeout(function(){
							get_user(check_account,false,function(err,affected_user){
								if(!err)
								get_object(check_account,affected_object_block,false,function(err,affected_object_result){
									if(!err){
										console.log(affected_object_result);
										let find_object=view.find('.objects>.object[data-account="'+check_account+'"][data-block="'+affected_object_block+'"]');
										if(find_object.length>0){
											let affected_render=render_object(affected_user,affected_object_result,'feed',check_level);
											find_object.before(affected_render);
											find_object.remove();//remove old view
										}
									}
								});
							});
						},10);
					}
				});
			});
		}
	});
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
								update_feed_events_subscribes(account);
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
	console.log('get_user',account,forced_update);
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
	let tab=view.find('.content-view[data-tab="profile"]');
	let nickname=tab.find('input[name="nickname"]').val();
	nickname=nickname.trim();

	let about=tab.find('input[name="about"]').val();
	about=about.trim();

	let avatar=tab.find('input[name="avatar"]').val();
	avatar=avatar.trim();

	let interests_str=tab.find('input[name="interests"]').val();
	interests_str+=',';
	let interests_arr=interests_str.split(',');
	let interests=[];
	for(let i in interests_arr){
		let interest=escape_html(interests_arr[i].trim());
		if(''!=interest){
			interests.push(interest);
		}
	}

	let categories_str=tab.find('input[name="categories"]').val();
	categories_str+=',';
	let categories_arr=categories_str.split(',');
	let categories=[];
	for(let i in categories_arr){
		let interest=escape_html(categories_arr[i].trim());
		if(''!=interest){
			categories.push(interest);
		}
	}

	let telegram=tab.find('input[name="telegram"]').val();
	telegram=telegram.trim();

	let github=tab.find('input[name="github"]').val();
	github=github.trim();

	let pinned_object=tab.find('input[name="pinned_object"]').val();
	pinned_object=pinned_object.trim();

	viz.api.getAccount(current_user,app_protocol,function(err,response){
		if(err){
			console.log(err);
			tab.find('.submit-button-ring').removeClass('show');
			tab.find('.error').html(ltmp_arr.gateway_error);
			tab.find('.button').removeClass('disabled');
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

			if(categories.length==0){
				if(typeof json_metadata.profile.categories !== 'undefined'){
					delete json_metadata.profile.categories;
				}
			}
			else{
				json_metadata.profile.categories=categories;
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
					tab.find('.submit-button-ring').removeClass('show');
					tab.find('.success').html(ltmp_arr.edit_profile_saved);
					tab.find('.button').removeClass('disabled');
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
					tab.find('.submit-button-ring').removeClass('show');
					tab.find('.error').html(ltmp_arr.gateway_error);
					tab.find('.button').removeClass('disabled');
					return;
				}
			});
		}
	});
}

function after_view_render(view){
	gate_connection_status();
	check_images(view);
}

function view_manual(view,path_parts,query,title){
	document.title=ltmp_arr.manual_caption+' - '+title;

	let current_item='contents';
	if((typeof path_parts[1] != 'undefined')&&(''!=path_parts[1])){
		current_item=path_parts[1];
		document.title=ltmp(ltmp_arr.manual_arr[current_item]['title'])+' - '+document.title;
	}
	let next_item=false;
	for(let i in ltmp_arr.manual_arr){
		if(true===next_item){
			next_item=i;
		}
		if(i==current_item){
			next_item=true;
		}
	}
	if(true===next_item){
		next_item=false;
	}

	let header='';
	let header_caption=ltmp_arr.manual_caption;
	if('contents'!=current_item){
		header_caption=ltmp(ltmp_arr.manual_arr[current_item]['title'])+' - '+header_caption;
		header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:'dapp:manual'});
	}
	else{
		header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:''});
	}
	header+=ltmp(ltmp_arr.header_caption,{caption:header_caption});
	view.find('.header').html(header);

	if('contents'==current_item){
		let contents='<ul>';
		for(let i in ltmp_arr.manual_arr){
			contents+='<li><a tabIndex="0" data-href="dapp:manual/'+i+'/">'+ltmp(ltmp_arr.manual_arr[i]['title'])+'</a></li>';
		}
		contents+='</ul>';
		view.find('.objects').html(ltmp(ltmp_arr.manual_item,{'name':current_item,'context':contents}));
	}
	else{
		let context=ltmp(ltmp_arr.manual_arr[current_item]['html']);
		if(false!=next_item){
			context+=ltmp(ltmp_arr.manual_next_link,{item:next_item});
		}
		context+=ltmp_arr.manual_contents_link;
		view.find('.objects').html(ltmp(ltmp_arr.manual_item,{'name':current_item,'context':context}));
	}

	$('.loader').css('display','none');
	view.css('display','block');
	after_view_render(view);
}

function view_search(view,path_parts,query,title){
	document.title=ltmp_arr.search_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:''});
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
	after_view_render(view);
}

var notes_save_draft_timer=0;
var notes_save_draft_timeout=1000;
var notes_save_draft_timer_stop=false;
var notes_save_draft_timer_clear={el_path:'',textarea:false,auto:false};
var notes_save_draft_timer_next=notes_save_draft_timer_clear;
var notes_obj=[];
if(null!=localStorage.getItem(storage_prefix+'notes_draft')){
	notes_obj=JSON.parse(localStorage.getItem(storage_prefix+'notes_draft'));
	let notes_obj_clean_up_timeout=new Date().getTime()/1000|0;
	notes_obj_clean_up_timeout-=604800;//7 days
	let notes_obj_changed=false;
	for(let i=notes_obj.length-1;i>=0;i--){
		if(notes_obj[i].time<notes_obj_clean_up_timeout){
			notes_obj.splice(i,1);
			notes_obj_changed=true;
		}
	}
	if(notes_obj_changed){
		let notes_json=JSON.stringify(notes_obj);
		localStorage.setItem(storage_prefix+'notes_draft',notes_json);
	}
}

function note_load(el_path,textarea){
	if(editable_object[2]){return};
	console.log('try note_load',el_path,textarea);
	for(let i in notes_obj){
		if(notes_obj[i].path==el_path){
			console.log('>> find',notes_obj[i].text);
			if(textarea){
				$(el_path).val(notes_obj[i].text);
				$(el_path).parent().find('.placeholder').css('display',(0===notes_obj[i].text.length)?'block':'none');
			}
			else{
				$(el_path).html(notes_obj[i].text);
				let text_html=notes_obj[i].text;
				let text=fast_str_replace('<br>',"\n",text_html);
				text=fast_str_replace('</div>',"\n",text);
				text=text.replaceAll(/<(.[^>]*)>/gm,'');
				$(el_path).parent().find('.placeholder').css('display',(0===text.length)?'block':'none');
			}
		}
	}
}

function note_clear_draft(el_path){
	//console.log('note_clear_draft',el_path);
	let find_note=false;
	for(let i in notes_obj){
		if(notes_obj[i].path==el_path){
			find_note=true;
			notes_obj.splice(i,1);
			break;
		}
	}
	if(find_note){
		let notes_json=JSON.stringify(notes_obj);
		localStorage.setItem(storage_prefix+'notes_draft',notes_json);
	}
}

function note_save_draft(el_path,textarea,auto){
	//console.log('! note_save_draft',el_path,textarea,auto);
	if(editable_object[2]){return};
	let note_text='';
	let note_clear=false;
	if($(el_path).length>0){
		if(textarea){
			note_text=$(el_path).val();
			if(0===note_text.length){
				note_clear=true;
			}
		}
		else{
			note_text=$(el_path).html();
			let text=fast_str_replace('<br>',"\n",note_text);
			text=fast_str_replace('</div>',"\n",text);
			text=text.replaceAll(/<(.[^>]*)>/gm,'');
			if(0===text.length){
				note_text='';
				note_clear=true;
			}
		}
		let note_obj={
			path:el_path,
			text:note_text,
			time:new Date().getTime()/1000|0,//unixtime for clearup
		};
		//console.log('note_save_draft with',note_obj,textarea,auto);
		let find_note=false;
		for(let i in notes_obj){
			if(notes_obj[i].path==el_path){
				notes_obj[i]=note_obj;
				find_note=true;
				if(note_clear){
					notes_obj.splice(i,1);
				}
				break;
			}
		}
		if(!find_note){
			if(!note_clear){
				notes_obj.push(note_obj);
			}
		}
		let notes_json=JSON.stringify(notes_obj);
		localStorage.setItem(storage_prefix+'notes_draft',notes_json);
		if(true===auto){
			clearTimeout(notes_save_draft_timer);
			notes_save_draft_timer=0;
			//console.log('>> notes_save_draft_timer_stop=',notes_save_draft_timer_stop);
			if(!notes_save_draft_timer_stop){
				notes_save_draft_timer=setTimeout(note_save_draft,notes_save_draft_timeout,el_path,textarea,auto);
			}
			else{
				//console.log('>>>> notes_save_draft_timer_next=',notes_save_draft_timer_next);
				notes_save_draft_timer_stop=false;
				if(''!=notes_save_draft_timer_next.el_path){
					notes_save_draft_timer=setTimeout(note_save_draft,notes_save_draft_timeout,notes_save_draft_timer_next.el_path,notes_save_draft_timer_next.textarea,notes_save_draft_timer_next.auto);
					notes_save_draft_timer_next=notes_save_draft_timer_clear;
				}
			}
		}
		else{
			notes_save_draft_timer=0;
		}
	}
	else{
		notes_save_draft_timer_stop=false;
		clearTimeout(notes_save_draft_timer);
		notes_save_draft_timer=0;
	}
}

var editor_save_draft_timer=0;
function editor_save_draft(){
	if(editable_object[2]){return};
	let article_obj={
		html:$('.article-editor .editor-text').html(),
		description:$('.article-settings input[name="description"]').val(),
		thumbnail:$('.article-settings input[name="thumbnail"]').val(),
	};
	let article_json=JSON.stringify(article_obj);
	localStorage.setItem(storage_prefix+'article_draft',article_json);
}

function selection_insert_tag(tag,text){
	text=typeof text==='undefined'?false:text;
	let range, element;
	let selection=document.getSelection();
	if(selection.rangeCount){
		selection.deleteFromDocument();
		range=selection.getRangeAt(0);
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
		selection.removeAllRanges();
		selection.addRange(range);
		return element;
	}
}
function get_selection_html(by_event){
	by_event=typeof by_event==='undefined'?false:by_event;
	let selection=document.getSelection();
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
function get_selection_tags(by_event){
	let html=get_selection_html(by_event);
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

let editable_object=[false,{},false];//object link, object result, edit state
function clear_editable_object(){
	editable_object=[false,{},false];
}
function set_editable_object(link,data){
	editable_object=[link,data,false];
}

function view_publish(view,path_parts,query,title){
	console.log('view_publish',path_parts,query);
	document.title=ltmp_arr.publish_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:''});
	header+=ltmp(ltmp_arr.header_caption,{caption:ltmp_arr.publish_caption});
	header+=ltmp(ltmp_arr.header_icon_link,{action:'article-editor',caption:ltmp_arr.editor_caption,icon:ltmp_editor.icon_editor});
	view.find('.header').html(header);
	$('.footer').addClass('hidden');

	view.find('.content-view[data-type="article"]').addClass('hidden');
	view.find('.content-view[data-type="simple"]').css('display','block');
	view.find('.article-editor-action').removeClass('positive');

	view.find('.button').removeClass('disabled');
	view.find('.submit-button-ring').removeClass('show');
	view.find('.error').html('');
	view.find('.success').html('');

	//prevent clear note draft when go to extended editor
	notes_save_draft_timer_stop=false;
	clearTimeout(notes_save_draft_timer);
	notes_save_draft_timer=0;

	view.find('input').val('');
	view.find('textarea').val('');

	$('.article-settings input[name="description"]').off('input');
	$('.article-settings input[name="description"]').off('keyup');
	$('.article-settings input[name="description"]').off('paste');

	$('.article-settings input[name="thumbnail"]').off('input');
	$('.article-settings input[name="thumbnail"]').off('keyup');
	$('.article-settings input[name="thumbnail"]').off('paste');

	editor_unbind();

	if('publication'==query){
		$('body').addClass('publication-mode');
		let article_json=localStorage.getItem(storage_prefix+'article_draft');
		if(null!==article_json){
			let article_obj=JSON.parse(article_json);
			$('.article-editor .editor-text').html(article_obj.html);
			$('.article-settings input[name="description"]').val(article_obj.description);
			$('.article-settings input[name="thumbnail"]').val(article_obj.thumbnail);
		}

		header+=ltmp(ltmp_arr.header_icon_link,{action:'article-settings',caption:ltmp_arr.article_settings_caption,icon:ltmp_global.icon_settings});
		header+=ltmp(ltmp_arr.header_icon_link,{action:'article-publish',caption:ltmp_arr.article_publish_caption,icon:ltmp_global.icon_check});
		view.find('.header').html(header);

		view.find('.content-view[data-type="article"]').removeClass('hidden');
		view.find('.content-view[data-type="simple"]').css('display','none');
		$(view).find('.content-view[data-type="article"]').find('.article-settings').css('display','none');
		$(view).find('.content-view[data-type="article"]').find('.article-editor').css('display','block');
		view.find('.article-editor-action').addClass('positive');

		$('.article-settings input[name="description"]').on('input',editor_save_draft);
		$('.article-settings input[name="description"]').on('keyup',editor_save_draft);
		$('.article-settings input[name="description"]').on('paste',editor_save_draft);

		$('.article-settings input[name="thumbnail"]').on('input',editor_save_draft);
		$('.article-settings input[name="thumbnail"]').on('keyup',editor_save_draft);
		$('.article-settings input[name="thumbnail"]').on('paste',editor_save_draft);

		editor_bind();

		editor_change();
	}
	else{
		let note_el_path='.view[data-path="dapp:publish"] .content-view[data-type="simple"] textarea';
		note_load(note_el_path,true);
		if(0==notes_save_draft_timer){
			notes_save_draft_timer_stop=false;
			note_save_draft(note_el_path,true,true);
		}
		else{
			notes_save_draft_timer_stop=true;
			notes_save_draft_timer_next={el_path:note_el_path,textarea:true,auto:true};
		}
	}

	view.find('.text-addon').css('display','none');
	view.find('.comment-addon').css('display','none');
	view.find('.reply-addon').css('display','none');
	view.find('.share-addon').css('display','none');
	view.find('.share-addon input[name="share"]').removeAttr('disabled');
	view.find('.loop-addon').css('display','none');

	view.find('.edit-event-addon').css('display','none');
	view.find('input[name="edit-event-object"]').val('');

	if(false!=editable_object[0]){
		console.log(editable_object);
		let editable_object_publication=false;
		if(typeof editable_object[1].data.t !== 'undefined'){
			if('p'==editable_object[1].data.t){
				editable_object_publication=true;
			}
		}
		if(editable_object_publication){
			let strikethrough_pattern=/\~\~(.*?)\~\~/gm;
			let publication_title='<h1>'+markdown_decode_text(editable_object[1].data.d.t.replace(strikethrough_pattern,'<strike>$1</strike>'))+'</h1>';
			let publication_html=publication_title+html_safe_images(markdown_decode(editable_object[1].data.d.m));
			view.find('.article-editor .editor-text').html(publication_html);
			if(typeof editable_object[1].data.d.d !== 'undefined'){
				view.find('.article-settings input[name="description"]').val(editable_object[1].data.d.d);
			}
			if(typeof editable_object[1].data.d.i !== 'undefined'){
				view.find('.article-settings input[name="thumbnail"]').val(editable_object[1].data.d.i);
			}

			//check and hide placeholders if needed
			editor_change();
		}
		else{
			view.find('textarea[name="text"]').val(editable_object[1].data.d.t);

			if(1==editable_object[1].is_reply){
				view.find('.reply-addon').css('display','block');
				view.find('.reply-addon input[name="reply"]').val('viz://@'+editable_object[1].parent_account+'/'+editable_object[1].parent_block+'/');
			}
			if(1==editable_object[1].is_share){
				view.find('.share-addon').css('display','block');
				if(typeof editable_object[1].link !== 'undefined'){
					view.find('.share-addon input[name="share"]').val(editable_object[1].link);
					view.find('.share-addon input[name="share"]').attr('disabled','disabled');
				}
			}
		}

		view.find('.edit-event-addon').css('display','block');
		view.find('input[name="edit-event-object"]').val(editable_object[0]);

		//clear beneficiaries list and push new from editable object
		view.find('.beneficiaries-list .beneficiaries-item').each(function(i,el){
			if(i>0){
				if(''==$(el).find('input[name="account"]').val()){
					if(''==$(el).find('input[name="weight"]').val()){
						el.remove();
					}
				}
			}
			else{
				$(el).find('input[name="account"]').val('');
				$(el).find('input[name="weight"]').val('');
			}
		});
		if(typeof editable_object[1].data.d.b !== 'undefined'){
			for(let i in editable_object[1].data.d.b){
				let beneficiary_obj=editable_object[1].data.d.b[i];
				beneficiary_obj.weight=parseInt(beneficiary_obj.weight)/100;
				view.find('.beneficiaries-list .beneficiaries-add-item-action').before(ltmp(ltmp_arr.beneficiaries_item,beneficiary_obj));
			}
		}
		editable_object[2]=true;
		//clear_editable_object();
	}

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
	view.find('.add-categories').html('');
	$('.loader').css('display','none');
	view.css('display','block');
	after_view_render(view);

	get_user(current_user,true,function(err,result){
		if(!err){
			let profile=JSON.parse(result.profile);
			if(typeof profile.categories != 'undefined'){
				if(profile.categories.length>0){
					let categories_view='';
					for(let i in profile.categories){
						let category_caption=profile.categories[i];
						if(category_caption.length>0){
							let category_hashtag=category_caption.replaceAll(' ','_').trim().toLowerCase();
							categories_view+=ltmp(ltmp_arr.publish_categories_item,{caption:category_caption,hashtag:category_hashtag});
						}
					}
					view.find('.add-categories').html(ltmp(ltmp_arr.publish_categories,{categories:categories_view}));
				}
			}
			if(typeof profile.interests != 'undefined'){
				if(profile.interests.length>0){
					let interests_view='';
					for(let i in profile.interests){
						let interest_caption=profile.interests[i];
						if(interest_caption.length>0){
							let interest_hashtag=interest_caption.replaceAll(' ','_').trim().toLowerCase();
							interests_view+=ltmp(ltmp_arr.publish_interests_item,{caption:interest_caption,hashtag:interest_hashtag});
						}
					}
					view.find('.add-interests').html(ltmp(ltmp_arr.publish_interests,{interests:interests_view}));
				}
			}
		}
	});
}

function view_notifications(view,path_parts,query,title){
	document.title=ltmp_arr.notifications_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:''});
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
	header+=ltmp(ltmp_arr.header_icon_link,{action:'mark-readed-notifications',caption:ltmp_arr.mark_readed_notifications_caption,icon:ltmp_global.icon_notify_clear});
	header+=ltmp(ltmp_arr.header_icon_link,{action:'clear-readed-notifications',caption:ltmp_arr.clear_readed_notifications_caption,icon:ltmp_global.icon_message_clear});

	view.find('.header').html(header);
	tab.find('.objects').html(ltmp(ltmp_arr.notifications_loader_notice,{id:0}));

	$('.loader').css('display','none');
	view.css('display','block');
	check_load_more();
	after_view_render(view);
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
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:back_to});

	view.data('user-account','');
	if((typeof path_parts[1] != 'undefined')&&(''!=path_parts[1])){//view user page
		let user_account=decodeURIComponent(path_parts[1]);
		idb_get_by_id('users','account',user_account,function(user_data){
			view.data('user-account',user_account);
			if(false===user_data){
				view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.account_not_found}));
			}
			else{
				let tabs='';
				let current_tab='settings';
				if(''!=path_parts[2]){
					current_tab=path_parts[2];
				}
				tabs+=ltmp(ltmp_arr.tab,{link:'dapp:users/'+user_account+'/settings/',class:('settings'==current_tab?'current':''),caption:ltmp_arr.users_user_settings_tab});
				tabs+=ltmp(ltmp_arr.tab,{link:'dapp:users/'+user_account+'/passphrases/',class:('passphrases'==current_tab?'current':''),caption:ltmp_arr.users_user_passphrases_tab});
				view.find('.tabs').html(tabs);
				document.title='@'+user_data.account+' - '+document.title;
				let user_data_profile=JSON.parse(user_data.profile);
				header+=ltmp(ltmp_arr.header_caption_link,{caption:user_data_profile.nickname,link:'viz://@'+user_data.account});
				let check_account=user_data.account;
				if(check_account==current_user){
					header+=ltmp(ltmp_arr.edit_profile_link,{icon_edit_profile:ltmp_global.icon_edit_profile});
					header+=ltmp(ltmp_arr.new_object_link,{icon_new_object:ltmp_global.icon_new_object});
				}
				else{
					if(-1!=whitelabel_accounts.indexOf(check_account)){
					}
					else{
						header+=ltmp(ltmp_arr.user_actions_open,{user:check_account});
						if(1==user_data.status){
							header+=ltmp(ltmp_arr.subscribed_link,{icon:ltmp_global.icon_subscribed});
							header+=ltmp(ltmp_arr.unsubscribe_link,{icon:ltmp_global.icon_unsubscribe});
						}
						else
						if(2==user_data.status){
							header+=ltmp(ltmp_arr.ignored_link,{icon:ltmp_global.icon_ignored});
							header+=ltmp(ltmp_arr.unignore_link,{icon:ltmp_global.icon_unsubscribe});
						}
						else{
							header+=ltmp(ltmp_arr.subscribe_link,{icon:ltmp_global.icon_subscribe});
							header+=ltmp(ltmp_arr.ignore_link,{icon:ltmp_global.icon_ignore});
						}
						header+=ltmp_arr.user_actions_close;
					}
				}
				let objects='';
				view.find('.objects').html(objects);
				if('settings'==current_tab){
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
				if('passphrases'==current_tab){
					let t=db.transaction(['passphrases'],'readonly');
					let q=t.objectStore('passphrases');
					let req=q.index('account').openCursor(IDBKeyRange.only(user_account),'next');
					let find=0;
					req.onsuccess=function(event){
						let cur=event.target.result;
						if(cur){
							objects+=ltmp(ltmp_arr.passphrases_objects_item,{id:cur.value.id,passphrase:cur.value.passphrase});
							find++;
							cur.continue();
						}
						else{
							if(!find){
								objects+=ltmp(ltmp_arr.error_notice,{error:ltmp_arr.passphrases_not_found});
							}
							view.find('.objects').html(ltmp(ltmp_arr.content_view,{content:ltmp_arr.users_user_passphrases_description})+objects);
						}
					};
				}
			}
			view.find('.header').html(header);
			$('.loader').css('display','none');
			view.css('display','block');
			after_view_render(view);
		});
	}
	else{
		let current_tab='subscribed';
		if((typeof query != 'undefined')&&(''!=query)){
			current_tab=query;
		}
		if('main'!=current_tab){
			document.title=ltmp_arr['users_'+current_tab+'_tab']+' - '+document.title;
		}

		header+=ltmp(ltmp_arr.header_caption,{caption:ltmp_arr.users_caption});
		header+=ltmp(ltmp_arr.users_qr_code_link,{select_tab:(('qr_code'==current_tab||'scan_qr_code'==current_tab)?'subscribed':'qr_code'),addon:(('qr_code'==current_tab||'scan_qr_code'==current_tab)?' positive':'')});
		view.find('.header').html(header);

		let tabs='';
		if(('qr_code'==current_tab||'scan_qr_code'==current_tab)){
			tabs+=ltmp(ltmp_arr.tab,{link:'dapp:users?qr_code',class:('qr_code'==current_tab?'current':''),caption:ltmp_arr.users_qr_code_tab});
			tabs+=ltmp(ltmp_arr.tab,{link:'dapp:users?scan_qr_code',class:('scan_qr_code'==current_tab?'current':''),caption:ltmp_arr.users_scan_qr_code_tab});
		}
		else{
			tabs+=ltmp(ltmp_arr.tab,{link:'dapp:users?subscribed',class:('subscribed'==current_tab?'current':''),caption:ltmp_arr.users_subscribed_tab});
			tabs+=ltmp(ltmp_arr.tab,{link:'dapp:users?ignored',class:('ignored'==current_tab?'current':''),caption:ltmp_arr.users_ignored_tab});
			tabs+=ltmp(ltmp_arr.tab,{link:'dapp:users?main',class:('main'==current_tab?'current':''),caption:ltmp_arr.users_main_tab});
		}
		view.find('.tabs').html(tabs);
		view.find('.objects').html(ltmp_arr.empty_loader_notice);
		if('qr_code'==current_tab){
			let objects='<div class="view-qr-code"></div>';
			view.find('.objects').html(objects);
			let qrcode=new QRCode(view.find('.objects .view-qr-code')[0],{
				text:'viz://@'+current_user+'/',
				width:300,
				height:300,
				colorDark:('light'==current_theme?'#000000':'#ffffff'),
				colorLight:$('body').css('background-color'),
				correctLevel:QRCode.CorrectLevel.H,
				title:''
			});
			qrcode=null;
			$('.loader').css('display','none');
			view.css('display','block');
		}
		else
		if('scan_qr_code'==current_tab){
			let objects=`
			<div class="scan-qr-code">
				<div class="scan-qr-loading">${ltmp_arr.scan_qr_unable}</div>
				<canvas></canvas>
				</div>
			</div>`
			view.find('.objects').html(objects);

			var scan_qr_result='';
			var scan_qr_video=document.createElement('video');
			var scan_qr_canvas_el=view.find('.objects canvas')[0];
			var scan_qr_canvas=scan_qr_canvas_el.getContext('2d');
			var scan_qr_loading=view.find('.objects .scan-qr-loading')[0];

			let scan_qr_draw_line=function(begin,end,color) {
				scan_qr_canvas.beginPath();
				scan_qr_canvas.moveTo(begin.x,begin.y);
				scan_qr_canvas.lineTo(end.x,end.y);
				scan_qr_canvas.lineWidth=5;
				scan_qr_canvas.strokeStyle=color;
				scan_qr_canvas.stroke();
			}

			if(navigator.mediaDevices !== undefined){
				// use facingMode: environment to attemt to get the back camera on phones
				navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(function(stream){
					window.qr_scan_stream=stream;
					scan_qr_video.srcObject=window.qr_scan_stream;
					// required to tell iOS safari we don't want fullscreen
					scan_qr_video.setAttribute('playsinline', true);
					scan_qr_video.play();
					requestAnimationFrame(scan_qr_tick);
				});

				let scan_qr_tick=function(){

					scan_qr_loading.innerText=ltmp_arr.users_scan_retrieving;
					if(scan_qr_video.readyState === scan_qr_video.HAVE_ENOUGH_DATA){
						scan_qr_loading.innerText='';

						scan_qr_canvas_el.height=scan_qr_video.videoHeight;
						scan_qr_canvas_el.width=scan_qr_video.videoWidth;
						scan_qr_canvas.drawImage(scan_qr_video,0,0,scan_qr_canvas_el.width,scan_qr_canvas_el.height);
						let scan_qr_image=scan_qr_canvas.getImageData(0,0,scan_qr_canvas_el.width,scan_qr_canvas_el.height);
						let code=jsQR(scan_qr_image.data,scan_qr_image.width,scan_qr_image.height,{
							inversionAttempts:'attemptBoth',
						});
						if(code){
							if(0==code.data.indexOf('viz://')){
								link=code.data.toLowerCase();
								link=escape_html(link);
								let pattern = /@([a-z0-9\-\.]*)\/$/g;
								let link_account=link.match(pattern);
								if(typeof link_account[0] != 'undefined'){
									link_account=link_account[0];
									link_account=link_account.substr(1);
									link_account=link_account.substr(0,link_account.length-1);

									scan_qr_draw_line(code.location.topLeftCorner, code.location.topRightCorner,'#26be0a');
									scan_qr_draw_line(code.location.topRightCorner, code.location.bottomRightCorner,'#26be0a');
									scan_qr_draw_line(code.location.bottomRightCorner, code.location.bottomLeftCorner,'#26be0a');
									scan_qr_draw_line(code.location.bottomLeftCorner, code.location.topLeftCorner,'#26be0a');

									scan_qr_result=link_account;
								}
							}
							else{
								scan_qr_draw_line(code.location.topLeftCorner, code.location.topRightCorner,'#ff1111');
								scan_qr_draw_line(code.location.topRightCorner, code.location.bottomRightCorner,'#ff1111');
								scan_qr_draw_line(code.location.bottomRightCorner, code.location.bottomLeftCorner,'#ff1111');
								scan_qr_draw_line(code.location.bottomLeftCorner, code.location.topLeftCorner,'#ff1111');
							}
						}
						else{
						}
					}
					if(''!=scan_qr_result){
						scan_qr_canvas=null;
						scan_qr_canvas_el.hidden=true;
						window.qr_scan_stream.getTracks().forEach((track)=>{
							track.stop();
						});

						scan_qr_video=null;

						let check_user=scan_qr_result;
						scan_qr_result='';

						subscribe_update(check_user,function(result){
							if(result){
								sync_cloud_put_update('subscribe',check_user);

								feed_load(check_user,false,false,true,function(err,result){
									console.log('feed load by subscribe',err,result);
									if(!err){
										update_feed_result(result);
									}
								});
								scan_qr_loading.innerHTML=ltmp(ltmp_arr.scan_qr_successfull,{icon:ltmp_global.icon_check,text:ltmp(ltmp_arr.scan_qr_successfull_subscribe,{account:check_user})});
							}
							else{
								scan_qr_loading.innerHTML=ltmp(ltmp_arr.scan_qr_error,{icon:ltmp_global.icon_close,text:ltmp_arr(ltmp_arr.scan_qr_error_subscribe,{account:check_user})});
							}
						});
					}
					else{
						requestAnimationFrame(scan_qr_tick);
					}
				}
			}
			else{
				scan_qr_loading.innerHTML=ltmp(ltmp_arr.scan_qr_error,{icon:ltmp_global.icon_close,text:ltmp_arr.scan_qr_error_subscribe});
			}
			$('.loader').css('display','none');
			view.css('display','block');
		}
		else
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

						objects+=ltmp(ltmp_arr.users_objects_item,{search:search_str,avatar:ltmp(ltmp_arr.users_objects_item_avatar,{account:user_data.account,avatar:safe_avatar(user_data_profile.avatar)}),account:user_data.account,nickname:user_data_profile.nickname,icon:ltmp_global.icon_edit_profile});
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
					after_view_render(view);
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

							objects+=ltmp(ltmp_arr.users_objects_item,{search:search_str,avatar:ltmp(ltmp_arr.users_objects_item_avatar,{account:user_data.account,avatar:safe_avatar(user_data_profile.avatar)}),account:user_data.account,nickname:user_data_profile.nickname,icon:ltmp_global.icon_edit_profile});
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
					after_view_render(view);
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

							objects+=ltmp(ltmp_arr.users_objects_item,{search:search_str,avatar:ltmp(ltmp_arr.users_objects_item_avatar,{account:user_data.account,avatar:safe_avatar(user_data_profile.avatar)}),account:user_data.account,nickname:user_data_profile.nickname,icon:ltmp_global.icon_edit_profile});
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
					after_view_render(view);
				}
			};
		}
	}
}

function view_hashtags(view,path_parts,query,title,back_to){
	view.data('hashtag','');
	view.data('hashtag-id',0);
	view.find('.tabs').html('');
	document.title=ltmp_arr.hashtags_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:back_to});
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
				header+=ltmp(ltmp_arr.header_icon_link,{action:'pin-hashtags',caption:ltmp_arr.pin_hashtags_caption,icon:ltmp_global.icon_pin,addon:(1==hashtag_data.status?' positive':'')});
				header+=ltmp(ltmp_arr.header_icon_link,{action:'ignore-hashtags',caption:ltmp_arr.ignore_hashtags_caption,icon:ltmp_global.icon_eye_ignore,addon:(2==hashtag_data.status?' negative':'')});
				header+=ltmp(ltmp_arr.header_icon_link,{action:'clear-hashtags',caption:ltmp_arr.clear_hashtags_caption,icon:ltmp_global.icon_message_clear});

				view.find('.objects').html(ltmp(ltmp_arr.hashtags_loader_notice,{tag_id:hashtag_data.id,id:0}));
			}
			view.find('.header').html(header);
			$('.loader').css('display','none');
			view.css('display','block');
			check_load_more();
			after_view_render(view);
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
					after_view_render(view);
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
					after_view_render(view);
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
					after_view_render(view);
				}
			};
		}
		else{
			view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.hashtags_not_found}));
			$('.loader').css('display','none');
			view.css('display','block');
			after_view_render(view);
		}
	}
}

function view_awards(view,path_parts,query,title){
	document.title=ltmp_arr.awards_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:''});
	header+=ltmp(ltmp_arr.header_caption,{caption:ltmp_arr.awards_caption});

	header+=ltmp(ltmp_arr.header_icon_link,{action:'clear-awards',caption:ltmp_arr.clear_awards_caption,icon:ltmp_global.icon_message_clear});

	view.find('.header').html(header);
	view.find('.objects').html(ltmp(ltmp_arr.awards_loader_notice,{id:0}));

	$('.loader').css('display','none');
	view.css('display','block');
	check_load_more();
	after_view_render(view);
}

function view_app_settings(view,path_parts,query,title){
	document.title=ltmp_arr.app_settings_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:''});
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
	if(''!=current_user){
		tabs+=ltmp(ltmp_arr.tab,{link:'dapp:app_settings/main',class:('main'==current_tab?'current':''),caption:ltmp_arr.app_settings_main_tab});
		tabs+=ltmp(ltmp_arr.tab,{link:'dapp:app_settings/feed',class:('feed'==current_tab?'current':''),caption:ltmp_arr.app_settings_feed_tab});
		tabs+=ltmp(ltmp_arr.tab,{link:'dapp:app_settings/theme',class:('theme'==current_tab?'current':''),caption:ltmp_arr.app_settings_theme_tab});
		tabs+=ltmp(ltmp_arr.tab,{link:'dapp:app_settings/connection',class:('connection'==current_tab?'current':''),caption:ltmp_arr.app_settings_connection_tab});
		tabs+=ltmp(ltmp_arr.tab,{link:'dapp:app_settings/languages',class:('languages'==current_tab?'current':''),caption:ltmp_arr.app_settings_languages_tab});
		tabs+=ltmp(ltmp_arr.tab,{link:'dapp:app_settings/sync',class:('sync'==current_tab?'current':''),caption:ltmp_arr.app_settings_sync_tab});
	}
	else{
		tabs+=ltmp(ltmp_arr.tab,{link:'dapp:app_settings/languages',class:('languages'==current_tab?'current':''),caption:ltmp_arr.app_settings_languages_tab});
		tabs+=ltmp(ltmp_arr.tab,{link:'dapp:app_settings/connection',class:('connection'==current_tab?'current':''),caption:ltmp_arr.app_settings_connection_tab});
		tabs+=ltmp(ltmp_arr.tab,{link:'dapp:app_settings/theme',class:('theme'==current_tab?'current':''),caption:ltmp_arr.app_settings_theme_tab});

	}
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

		tab.find('input[name="nsfw_warning"]').prop('checked',settings.nsfw_warning);
		tab.find('input[name="nsfw_hashtags"]').val(settings.nsfw_hashtags.join(', '));

		tab.find('input[name="energy"]').val(settings.energy/100);
		tab.find('input[name="silent_award"]').prop("checked",settings.silent_award);
		tab.find('input[name="save_passphrase_on_publish"]').prop("checked",settings.save_passphrase_on_publish);
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
	if('connection'==current_tab){
		tab.find('.button').removeClass('disabled');
		tab.find('.submit-button-ring').removeClass('show');
		tab.find('.error').html('');
		tab.find('.success').html('');
		tab.find('.api-gates-list').html('');
		let api_list='';
		for(let i in api_gates){
			let value=api_gates[i];
			let api_domain=api_gates[i];
			if(-1!=api_domain.indexOf('//')){
				api_domain=api_domain.substr(api_domain.indexOf('//')+2);
			}
			if(-1!=api_domain.indexOf('/')){
				api_domain=api_domain.substr(0,api_domain.indexOf('/'));
			}
			let api_selected=false;
			if(api_gate==value){
				api_selected=true;
			}
			console.log('check value',value,api_gate,api_selected);
			api_list+=ltmp(ltmp_arr.api_list_item,{value:value,domain:api_domain,selected:api_selected?' checked':''});
		}
		tab.find('input[name="api_gate_str"]').val(api_gate);

		tab.find('.api-gates-list').html(api_list);

		tab.find('input[name="api_gate"]').off('change');
		tab.find('input[name="api_gate"]').on('change',function(){
			if($(this).prop('checked')){
				tab.find('input[name="api_gate_str"]').val($(this).val());
				$('.save-connection-settings-action')[0].click();
			}
		});
	}
	if('languages'==current_tab){
		tab.find('.button').removeClass('disabled');
		tab.find('.submit-button-ring').removeClass('show');
		tab.find('.error').html('');
		tab.find('.success').html('');
		tab.find('.languages-list').html('');
		let languages_list='';
		for(let i in available_langs){
			let value=i;
			let language=available_langs[i];
			let language_selected=false;
			if(selected_lang==value){
				language_selected=true;
			}
			languages_list+=ltmp(ltmp_arr.languages_list_item,{value:value,caption:language,selected:language_selected?' checked':''});
		}
		tab.find('.languages-list').html(languages_list);
		tab.find('.languages-list input[value="'+selected_lang+'"]').closest('p').addClass('positive');

		tab.find('input[name="language"]').off('change');
		tab.find('input[name="language"]').on('change',function(){
			if($(this).prop('checked')){
				$('.save-languages-settings-action')[0].click();
			}
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
	after_view_render(view);
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
		$('.toggle-theme-icon').html(ltmp_global.icon_theme_sun);
	}
	else{
		$('body').addClass(settings.theme_night_mode);
		$('.toggle-theme-icon').html(ltmp_global.icon_theme_moon);
	}
	let theme_color=$('body').css('background-color');
	if('light'==mode){
		theme_color='#efefef';
	}
	current_theme=mode;
	document.querySelector('meta[name=theme-color]').setAttribute('content',theme_color);
	clearTimeout(apply_theme_mode_timer);
	apply_theme_mode_timer=setTimeout(function(){apply_theme_mode();},60000);
	if('dapp:users/'==path && 'qr_code'==query){
		view_path(path+(''==query?'':'?'+query),{},false,false);
	}
}

function view_account(view,path_parts,query,title){
	document.title=ltmp_arr.account_settings_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:''});
	header+=ltmp(ltmp_arr.header_caption,{caption:ltmp_arr.account_settings_caption});
	view.find('.header').html(header);

	let current_tab='credentials';
	if((typeof path_parts[1] != 'undefined')&&(''!=path_parts[1])){
		current_tab=path_parts[1];
	}

	document.title=ltmp_arr['account_'+current_tab+'_tab']+' - '+document.title;

	let tabs='';
	tabs+=ltmp(ltmp_arr.tab,{link:'dapp:account/credentials',class:('credentials'==current_tab?'current':''),caption:ltmp_arr.account_credentials_tab});
	if(''!=current_user){
		tabs+=ltmp(ltmp_arr.tab,{link:'dapp:account/profile',class:('profile'==current_tab?'current':''),caption:ltmp_arr.account_profile_tab});
		tabs+=ltmp(ltmp_arr.tab,{link:'dapp:account/qr',class:('qr'==current_tab?'current':''),caption:ltmp_arr.account_qr_tab});
	}
	else{
		tabs+=ltmp(ltmp_arr.tab,{link:'dapp:account/scan_qr',class:('scan_qr'==current_tab?'current':''),caption:ltmp_arr.account_scan_qr_tab});
	}
	view.find('.tabs').html(tabs);

	console.log(current_tab);
	view.find('.content-view').css('display','none');
	view.find('input').removeAttr('disabled');
	view.find('.content-view[data-tab="'+current_tab+'"]').css('display','block');

	let tab=view.find('.content-view[data-tab="'+current_tab+'"]');
	if('credentials'==current_tab){
		tab.find('.button').removeClass('disabled');
		tab.find('.submit-button-ring').removeClass('show');
		tab.find('.error').html('');
		tab.find('.success').html('');

		tab.find('input').val('');

		if(''!=current_user){
			tab.find('input[name=viz_account]').val(current_user);
			if(typeof users[current_user] !== 'undefined'){
				if(typeof users[current_user].regular_key !== 'undefined'){
					tab.find('input[name=viz_regular_key]').val(users[current_user].regular_key);
				}
				else{
					tab.find('.error').html(ltmp_arr.account_settings_empty_regular_key);
					tab.find('.error').css('color','red');
				}
			}
			else{
				tab.find('.error').html(ltmp_arr.account_settings_empty_regular_key);
				tab.find('.error').css('color','red');
			}
		}
	}
	if('profile'==current_tab){
		tab.find('.button').removeClass('disabled');
		tab.find('.submit-button-ring').removeClass('show');
		tab.find('.error').html('');
		tab.find('.success').html('');
		tab.find('.viz_account').html('@'+current_user);

		tab.find('input').val('');
		get_user(current_user,true,function(err,result){
			if(err){
				tab.find('.error').html(ltmp_arr.gateway_error);
			}
			else{
				let profile=JSON.parse(result.profile);
				if(0<Object.keys(profile).length){
					if(typeof profile.nickname != 'undefined'){
						tab.find('input[name=nickname]').val(profile.nickname);
					}
					if(typeof profile.about != 'undefined'){
						tab.find('input[name=about]').val(profile.about);
					}
					if(typeof profile.avatar != 'undefined'){
						tab.find('input[name=avatar]').val(profile.avatar);
					}
					if(typeof profile.interests != 'undefined'){
						tab.find('input[name=interests]').val(profile.interests.join(', '));
					}
					if(typeof profile.categories != 'undefined'){
						tab.find('input[name=categories]').val(profile.categories.join(', '));
					}
					if(typeof profile.pinned != 'undefined'){
						tab.find('input[name=pinned_object]').val(profile.pinned);
					}
					if(typeof profile.telegram != 'undefined'){
						tab.find('input[name=telegram]').val(profile.telegram);
					}
					if(typeof profile.github != 'undefined'){
						tab.find('input[name=github]').val(profile.github);
					}
				}
			}
			$('.loader').css('display','none');
		});
	}
	if('qr'==current_tab){
		let objects='<div class="view-qr-code"></div>';
		tab.find('.objects').html(objects);
		let qrcode=new QRCode(tab.find('.view-qr-code')[0],{
			text:''+current_user+':'+users[current_user].regular_key,
			width:300,
			height:300,
			colorDark:('light'==current_theme?'#000000':'#ffffff'),
			colorLight:$('body').css('background-color'),
			correctLevel:QRCode.CorrectLevel.H,
			title:''
		});
		qrcode=null;
	}
	if('scan_qr'==current_tab){
		let objects=`
		<div class="scan-qr-code">
			<div class="scan-qr-loading">${ltmp_arr.scan_qr_unable}</div>
			<canvas></canvas>
			</div>
		</div`
		tab.find('.objects').html(objects);
		var scan_qr_result='';
		var scan_qr_video=document.createElement('video');
		var scan_qr_canvas_el=tab.find('.objects canvas')[0];
		var scan_qr_canvas=scan_qr_canvas_el.getContext('2d');
		var scan_qr_loading=tab.find('.objects .scan-qr-loading')[0];

		let scan_qr_draw_line=function(begin,end,color) {
			scan_qr_canvas.beginPath();
			scan_qr_canvas.moveTo(begin.x,begin.y);
			scan_qr_canvas.lineTo(end.x,end.y);
			scan_qr_canvas.lineWidth=5;
			scan_qr_canvas.strokeStyle=color;
			scan_qr_canvas.stroke();
		}

		if(navigator.mediaDevices !== undefined){
			// use facingMode: environment to attemt to get the back camera on phones
			navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(function(stream){
				window.qr_scan_stream=stream;
				scan_qr_video.srcObject=window.qr_scan_stream;
				// required to tell iOS safari we don't want fullscreen
				scan_qr_video.setAttribute('playsinline', true);
				scan_qr_video.play();
				requestAnimationFrame(scan_qr_tick);
			});

			let scan_qr_tick=function(){

				scan_qr_loading.innerText=ltmp_arr.users_scan_retrieving;
				if(scan_qr_video.readyState === scan_qr_video.HAVE_ENOUGH_DATA){
					scan_qr_loading.innerText='';

					scan_qr_canvas_el.height=scan_qr_video.videoHeight;
					scan_qr_canvas_el.width=scan_qr_video.videoWidth;
					scan_qr_canvas.drawImage(scan_qr_video,0,0,scan_qr_canvas_el.width,scan_qr_canvas_el.height);
					let scan_qr_image=scan_qr_canvas.getImageData(0,0,scan_qr_canvas_el.width,scan_qr_canvas_el.height);
					let code=jsQR(scan_qr_image.data,scan_qr_image.width,scan_qr_image.height,{
						inversionAttempts:'attemptBoth',
					});
					if(code){
						if(0!=code.data.indexOf(':')){
							let code_data=code.data.split(':');
							if(typeof code_data[0] !== 'undefined'){
								if(typeof code_data[1] !== 'undefined'){
									if(viz.auth.isWif(code_data[1])){
										scan_qr_result=code_data;
									}
								}
							}
						}
						if(''==scan_qr_result){
							scan_qr_draw_line(code.location.topLeftCorner, code.location.topRightCorner,'#ff1111');
							scan_qr_draw_line(code.location.topRightCorner, code.location.bottomRightCorner,'#ff1111');
							scan_qr_draw_line(code.location.bottomRightCorner, code.location.bottomLeftCorner,'#ff1111');
							scan_qr_draw_line(code.location.bottomLeftCorner, code.location.topLeftCorner,'#ff1111');
						}
					}
					else{
					}
				}
				if(''!=scan_qr_result){
					scan_qr_canvas=null;
					scan_qr_canvas_el.hidden=true;
					window.qr_scan_stream.getTracks().forEach((track)=>{
						track.stop();
					});

					scan_qr_video=null;

					view.find('.tabs a[data-href="dapp:account/'+current_tab+'"]').removeClass('current');
					current_tab='credentials';
					view.find('.tabs a[data-href="dapp:account/'+current_tab+'"]').addClass('current');

					view.find('.content-view').css('display','none');
					view.find('.content-view[data-tab="'+current_tab+'"]').css('display','block');

					let tab=view.find('.content-view[data-tab="'+current_tab+'"]');

					tab.find('.button').removeClass('disabled');
					tab.find('.submit-button-ring').removeClass('show');
					tab.find('.error').html('');
					tab.find('.success').html('');

					tab.find('input').val('');

					tab.find('input[name=viz_account]').val(scan_qr_result[0]);
					tab.find('input[name=viz_regular_key]').val(scan_qr_result[1]);

					//clear sync cloud vars
					sync_cloud_activity=0;
					sync_cloud_update=0;
					localStorage.removeItem(storage_prefix+'sync_cloud_activity');
					localStorage.removeItem(storage_prefix+'sync_cloud_update');

					var event=document.createEvent('MouseEvents');
					event.initEvent('click',true,true);
					tab.find('.save-account-action')[0].dispatchEvent(event);
				}
				else{
					requestAnimationFrame(scan_qr_tick);
				}
			}
		}
		else{
			scan_qr_loading.innerHTML=ltmp(ltmp_arr.scan_qr_error,{icon:ltmp_global.icon_close,text:ltmp_arr.scan_qr_error_subscribe});
		}
	}
	$('.loader').css('display','none');
	view.css('display','block');
	after_view_render(view);
}

var audio_player_position=false;
function audio_player_offset(audio,direction){
	if(!audio.paused){
		audio.pause();
	}
	if(direction){
		audio_player_position=audio_player_position+1;
	}
	else{
		audio_player_position=audio_player_position-1;
		audio_player_position=Math.max(audio_player_position,0);
	}
}
function audio_player_set_offset(audio){
	audio.currentTime=audio_player_position;
	audio_player_position=false;
	if(audio.paused){
		audio.play();
	}
}
function app_keyboard_down(e){
	if(!e)e=window.event;
	var key=(e.charCode)?e.charCode:((e.keyCode)?e.keyCode:((e.which)?e.which:0));
	let char=String.fromCharCode(key);
	//console.log('! app_keyboard_down',key,char,document.activeElement);
	if($(document.activeElement).hasClass('text')){
		if($(document.activeElement).data('placeholder')){
			$(document.activeElement).parent().find('.placeholder').css('display','none');
		}
		if($(document.activeElement).parent().hasClass('fast-publish-wrapper')){
			let fast_publish_wrapper=$(document.activeElement).parent();
			let data_key='';
			let link='';
			if(''!=fast_publish_wrapper.data('reply')){
				data_key='reply';
				link=fast_publish_wrapper.data('reply');
			}
			if(''!=fast_publish_wrapper.data('share')){
				data_key='share';
				link=fast_publish_wrapper.data('share');
			}
			let note_el_path='.fast-publish-wrapper[data-'+data_key+'="'+link+'"] .text';
			if(''==link){
				note_el_path='.view[data-level="0"] .fast-publish-wrapper[data-reply=""][data-share=""] .text';
			}
			if(0==notes_save_draft_timer){
				notes_save_draft_timer_stop=false;
				note_save_draft(note_el_path,false,true);
			}
			else{
				notes_save_draft_timer_stop=true;
				notes_save_draft_timer_next={el_path:note_el_path,textarea:false,auto:true};
			}
		}
	}
	if($(document.activeElement).hasClass('audio-progress')){
		let player=$(document.activeElement).closest('.audio-player');
		let audio=player.find('.audio-source')[0];
		let duration=Math.ceil(audio.duration);
		let time=Math.ceil(audio.currentTime);
		if(key==32){//space
			e.preventDefault();
			return false;
		}
		if(key==37){//left arrow
			e.preventDefault();
			if(false===audio_player_position){
				audio_player_position=time;
			}
			audio_player_offset(audio,false);
			return false;
		}
		if(key==39){//right arrow
			e.preventDefault();
			if(false===audio_player_position){
				audio_player_position=time;
			}
			audio_player_offset(audio,true);
			return false;
		}
	}
	return true;
}
function app_keyboard(e){
	if(!e)e=window.event;
	var key=(e.charCode)?e.charCode:((e.keyCode)?e.keyCode:((e.which)?e.which:0));
	let char=String.fromCharCode(key);
	//console.log('! app_keyboard',key,char,document.activeElement);
	if($(document.activeElement).hasClass('text')){
		if($(document.activeElement).data('placeholder')){
			let text_html=$(document.activeElement).html();
			let text=fast_str_replace('<br>',"\n",text_html);
			text=fast_str_replace('</div>',"\n",text);
			text=text.replaceAll(/<(.[^>]*)>/gm,'');
			$(document.activeElement).parent().find('.placeholder').css('display',(0===text.length)?'block':'none');
		}
	}
	else
	if($(document.activeElement).hasClass('audio-progress')){
		let player=$(document.activeElement).closest('.audio-player');
		let audio=player.find('.audio-source')[0];
		let duration=Math.ceil(audio.duration);
		let time=Math.ceil(audio.currentTime);
		if(key==32){//space
			e.preventDefault();
			$(player).find('.audio-toggle-action')[0].click();
			return;
		}
		if(key==37){//left arrow
			e.preventDefault();
			audio_player_set_offset(audio);
		}
		if(key==39){//right arrow
			e.preventDefault();
			audio_player_set_offset(audio);
		}
	}
	else
	if(key==13){//enter
		if('passphrase'==$(document.activeElement).attr('name')){
			e.preventDefault();
			let action=$(document.activeElement).closest('.decode-passphrase').find('.decode-object-action');
			if(action.length){
				action[0].click();
			}
			return false;
		}
		if($(document.activeElement).hasClass('header-link')){
			e.preventDefault();
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
			return false;
		}
		else{
			e.preventDefault();
			document.activeElement.click();
			return false;
		}
	}
	else
	if(key==32){//space
		e.preventDefault();
		document.activeElement.click();
		return false;
	}
	return true;
}
function parse_fullpath(){
	let fullpath=window.location.hash.substr(1);
	//import account from hash
	let import_arr=fullpath.matchAll(/import=([^:]*):([^/]*)$/g);
	for(const import_match of import_arr){
		fullpath='';//reset fullpath
		let import_account=import_match[1];
		let import_key=import_match[2];
		view_path('dapp:account/credentials/',{},true,false);
		let view=$('.view[data-path="dapp:account"]');
		view.find('input[name=viz_account]').val(import_account);
		view.find('input[name=viz_regular_key]').val(import_key);
		if(''==current_user){//init save account
			//clear sync cloud vars
			sync_cloud_activity=0;
			sync_cloud_update=0;
			localStorage.removeItem(storage_prefix+'sync_cloud_activity');
			localStorage.removeItem(storage_prefix+'sync_cloud_update');

			var event=document.createEvent('MouseEvents');
			event.initEvent('click',true,true);
			view.find('.save-account-action')[0].dispatchEvent(event);
		}
	}
	path='';
	query='';
	query_obj={};
	if(-1==fullpath.indexOf('?')){
		path=fullpath;
	}
	else{
		path=fullpath.substring(0,fullpath.indexOf('?'));
		query=fullpath.substring(fullpath.indexOf('?')+1);
		let params_arr=query.split('&');
		for(let i in params_arr){
			let param_str=params_arr[i];
			if(-1==param_str.indexOf('=')){
				query_obj[param_str]=true;
			}
			else{
				let param_name=param_str.substring(0,param_str.indexOf('='));
				let param_value=param_str.substring(param_str.indexOf('=')+1);
				if(-1!=param_value.indexOf(',')){
					param_value=param_value.split(',');
				}
				query_obj[param_name]=param_value;
			}
		}
	}
	if(''==path){
		path='viz://';
	}
}

var path_parts;
var check_account='';

var mobile_hide_menu_timer=0;
function view_path(location,state,save_state,update){
	more_list_close();
	$('body').removeClass('publication-mode');
	$('.footer').removeClass('hidden');
	if(editable_object[2]){
		clear_editable_object();
	}
	notes_save_draft_timer_stop=true;
	if(typeof window.qr_scan_stream !== 'undefined'){//clear qr scan video stream
		window.qr_scan_stream.getTracks().forEach((track)=>{
			track.stop();
		});
		window.qr_scan_stream=undefined;
	}
	if('dapp:publish/'==path){//exit from publish view
		$('.footer').removeClass('hidden');
		if('article'==query){//exit from article mode
			editor_unbind();
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
			query_obj={};
			location=location.substring(0,location.indexOf('?'));
			let params_arr=query.split('&');
			for(let i in params_arr){
				let param_str=params_arr[i];
				if(-1==param_str.indexOf('=')){
					query_obj[param_str]=true;
				}
				else{
					let param_name=param_str.substring(0,param_str.indexOf('='));
					let param_value=param_str.substring(param_str.indexOf('=')+1);
					if(-1!=param_value.indexOf(',')){
						param_value=param_value.split(',');
					}
					query_obj[param_name]=param_value;
				}
			}
		}
		else{
			query='';
			query_obj={};
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
		header+=ltmp(ltmp_arr.toggle_menu,{title:ltmp_arr.toggle_menu_title,icon:ltmp_global.icon_menu});
		header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp(ltmp_arr.header_link_icons)});
		view.find('.header').html(header);
		if(0<view.find('.fast-publish-wrapper').length){
			view.find('.fast-publish-wrapper .button').removeClass('disabled');
			if(''==current_user){
				view.find('.fast-publish-wrapper').css('display','none');
			}
			else{
				view.find('.fast-publish-wrapper').css('display','block');
			}
		}
		else{
			if(''!=current_user){
				view.find('.objects').before(ltmp(ltmp_arr.fast_publish,{
					avatar:safe_avatar(user_profile.avatar),
					avatar_addon:ltmp(ltmp_arr.fast_publish_avatar_addon,{account:current_user}),
					attach:ltmp_global.icon_attach,
					placeholder:ltmp_arr.fast_publish_feed,
					button:ltmp_arr.fast_publish_button,
				}));
			}
		}
		if(0<view.find('.fast-publish-wrapper').length){
			let note_el_path='.view[data-level="0"] .fast-publish-wrapper[data-reply=""][data-share=""] .text';
			note_load(note_el_path,false);
			if(0==notes_save_draft_timer){
				notes_save_draft_timer_stop=false;
				note_save_draft(note_el_path,false,true);
			}
			else{
				notes_save_draft_timer_stop=true;
				notes_save_draft_timer_next={el_path:note_el_path,textarea:false,auto:true};
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
			if(typeof bc === 'object'){
				//send to others tabs about cleared items counter in feed
				bc.postMessage({type:'feed_count',pid:pid,count:0});
			}
		}
		path='viz://';
		level=0;
		$('.loader').css('display','none');
		view.css('display','block');
		if(!update){
			$(window)[0].scrollTo({top:(typeof view.data('scroll')!=='undefined'?view.data('scroll'):0)});
		}
		check_load_more();
		after_view_render(view);
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
				setTimeout(window['view_'+current_view],5,view,path_parts,query,title,back_to);
			}
			else{
				$('.loader').css('display','none');
				view.css('display','block');
				after_view_render(view);
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
					get_user(check_account,true,function(err,result){
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
							header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:back_to});
							header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp(ltmp_arr.header_link_icons)});
							view.find('.header').html(header);
							view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.gateway_error}));
							$('.loader').css('display','none');
							view.css('display','block');
							after_view_render(view);
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
								if(typeof profile.categories != 'undefined'){
									if(profile.categories.length>0){
										let categories_view='';
										for(let i in profile.categories){
											let category_caption=profile.categories[i];
											if(category_caption.length>0){
												let category_hashtag=category_caption.replaceAll(' ','_').trim().toLowerCase();
												categories_view+=ltmp(ltmp_arr.profile_categories_item,{caption:category_caption,hashtag:category_hashtag});
											}
										}
										profile_view+=ltmp(ltmp_arr.profile_categories,{categories:categories_view});
										profile_found=true;
									}
								}
								if(typeof profile.interests != 'undefined'){
									if(profile.interests.length>0){
										let interests_view='';
										for(let i in profile.interests){
											let interest_caption=profile.interests[i];
											if(interest_caption.length>0){
												let interest_hashtag=interest_caption.replaceAll(' ','_').trim().toLowerCase();
												interests_view+=ltmp(ltmp_arr.profile_interests_item,{caption:interest_caption,hashtag:interest_hashtag});
											}
										}
										profile_view+=ltmp(ltmp_arr.profile_interests,{interests:interests_view});
										profile_found=true;
									}
								}
								if(typeof profile.github != 'undefined'){
									profile_contacts+=ltmp(ltmp_arr.profile_contacts_github,{github:profile.github,icon_github:ltmp_global.icon_github});
									profile_found=true;
								}
								if(typeof profile.telegram != 'undefined'){
									profile_contacts+=ltmp(ltmp_arr.profile_contacts_telegram,{telegram:profile.telegram,icon_telegram:ltmp_global.icon_telegram});
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
								header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:back_to});
								header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp(ltmp_arr.header_link_icons)});
								if(check_account==current_user){
									header+=ltmp(ltmp_arr.edit_profile_link,{icon_edit_profile:ltmp_global.icon_edit_profile});
									header+=ltmp(ltmp_arr.new_object_link,{icon_new_object:ltmp_global.icon_new_object});
								}
								else{
									if(-1!=whitelabel_accounts.indexOf(check_account)){
									}
									else{
										header+=ltmp(ltmp_arr.user_actions_open,{user:check_account});
										if(1==result.status){
											header+=ltmp(ltmp_arr.subscribed_link,{icon:ltmp_global.icon_subscribed});
											header+=ltmp(ltmp_arr.unsubscribe_link,{icon:ltmp_global.icon_unsubscribe});
										}
										else
										if(2==result.status){
											header+=ltmp(ltmp_arr.ignored_link,{icon:ltmp_global.icon_ignored});
											header+=ltmp(ltmp_arr.unignore_link,{icon:ltmp_global.icon_unsubscribe});
										}
										else{
											header+=ltmp(ltmp_arr.subscribe_link,{icon:ltmp_global.icon_subscribe});
											header+=ltmp(ltmp_arr.ignore_link,{icon:ltmp_global.icon_ignore});
										}
										header+=ltmp_arr.user_actions_close;
									}
								}
								view.find('.header').html(header);
							}
							if(update){
								//if profile view path is new update, then need load events
								let events_deep=1;//dont need more for unknown account
								if(1==result.status){//subscribed
									events_deep=settings.activity_deep;
								}
								if(2!=result.status){//if not ignored
									check_user_last_event(check_account,function(last_event){
										if(false!==last_event){//no user events at all
											//console.log('view_path check_user_last_event block num',check_account,last_event);
											let need_new=false;
											load_events_train({},check_account,last_event,0,need_new,events_deep,function(train){
												finish_events_train(train,check_account,function(affected_objects){
													console.log('view_path finish_events_train affected_objects',check_account,affected_objects);
													for(let i in affected_objects){
														let affected_object_block=affected_objects[i];
														//need to update render view for all affected objects (preview/pinned in profile feed)
														setTimeout(function(){
															get_user(check_account,false,function(err,affected_user){
																if(!err)
																get_object(check_account,affected_object_block,false,function(err,affected_object_result){
																	if(!err){
																		let find_object=view.find('.objects>.object[data-account="'+check_account+'"][data-block="'+affected_object_block+'"]');
																		if(find_object.length>0){
																			let found_object_type='preview';
																			if(find_object.hasClass('pinned-object')){
																				found_object_type='pinned';
																			}
																			let affected_render=render_object(affected_user,affected_object_result,found_object_type);
																			find_object.before(affected_render);
																			find_object.remove();//remove old view
																			update_short_date(view.find('.objects .object[data-account="'+check_account+'"][data-block="'+affected_object_block+'"]').find('.short-date-view'));
																			profile_filter_by_type();
																		}
																	}
																});
															});
														},10);
													}
												});
											});
										}
									});
								}
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
									let link_account=pinned_link.match(account_pattern);
									if(typeof link_account[0] != 'undefined'){
										pinned_object_account=link_account[0].substr(1);
										let link_block=pinned_link.match(block_pattern);
										if(typeof link_block[0] != 'undefined'){
											pinned_object_block=parseInt(fast_str_replace('/','',link_block[0]));
											//remove existed pinned objects and prepend new render
											view.find('.objects .pinned-object').remove();
											setTimeout(function(){
												get_user(pinned_object_account,false,function(err,pinned_user_result){
													if(!err)
													get_object(pinned_object_account,pinned_object_block,false,function(err,pinned_object_result){
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
							after_view_render(view);
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
							header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:back_to});
							header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp(ltmp_arr.header_link_icons)});
							view.find('.header').html(header);
						}
						view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.data_not_found}));
						$('.loader').css('display','none');
						view.css('display','block');
						after_view_render(view);
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
								header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:back_to});
								header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp(ltmp_arr.header_link_icons)});
								view.find('.header').html(header);
								view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.gateway_error}));

								$('.loader').css('display','none');
								view.css('display','block');
								after_view_render(view);
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
									header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:back_to});
									header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp(ltmp_arr.header_link_icons)});
									view.find('.header').html(header);
								}
								if(update){
									//view.find('.objects').html(ltmp(ltmp_arr.loader_notice,{account:check_account,block:check_block}));
									view.find('.objects').html(ltmp_arr.empty_loader_notice);
									if(typeof query_obj.event !== 'undefined'){
										let events_arr=query_obj.event;
										if(typeof query_obj.event === 'string'){
											events_arr=[query_obj.event];
										}
										events_arr=array_unique(events_arr);
										events_arr.sort();
										//try load and execute events from array
										load_events(check_account,events_arr,function(){
											console.log('finish load_events from view_path',check_account);
											get_object(check_account,check_block,false,function(err,object_result){
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
													after_view_render(view);
												}
												else{
													document.title=check_block+' - '+document.title;
													let object_view=render_object(user_result,object_result);
													let link='viz://@'+user_result.account+'/'+object_result.block+'/';

													view.find('.objects').html(object_view);

													let hidden=false;
													if(typeof object_result.hidden !== 'undefined'){
														if(1==object_result.hidden){
															hidden=true;
														}
													}

													if(hidden){
														view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.object_is_hidden}));
													}
													else{
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
													}

													$('.loader').css('display','none');
													view.css('display','block');
													check_load_more();
													after_view_render(view);
												}
											});
										});
									}
									else{
										//just get object without checking events
										get_object(check_account,check_block,false,function(err,object_result){
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
												after_view_render(view);
											}
											else{
												document.title=check_block+' - '+document.title;
												let object_view=render_object(user_result,object_result);
												let link='viz://@'+user_result.account+'/'+object_result.block+'/';

												view.find('.objects').html(object_view);

												let hidden=false;
												if(typeof object_result.hidden !== 'undefined'){
													if(1==object_result.hidden){
														hidden=true;
													}
												}

												if(hidden){
													view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.object_is_hidden}));
												}
												else{
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
												}

												$('.loader').css('display','none');
												view.css('display','block');
												check_load_more();
												after_view_render(view);
											}
										});
									}
								}
								else{
									$('.loader').css('display','none');
									view.css('display','block');
									$(window)[0].scrollTo({top:(typeof view.data('scroll')!=='undefined'?view.data('scroll'):0)});
									check_load_more();
									after_view_render(view);
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
							header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:back_to});
							header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp(ltmp_arr.header_link_icons)});
							view.find('.header').html(header);
						}
						view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.data_not_found}));
						$('.loader').css('display','none');
						view.css('display','block');
						after_view_render(view);
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
								header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:back_to});
								header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp(ltmp_arr.header_link_icons)});
								view.find('.header').html(header);
								view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.gateway_error}));

								$('.loader').css('display','none');
								view.css('display','block');
								after_view_render(view);
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
									header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:back_to});
									header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp(ltmp_arr.header_link_icons)});
									view.find('.header').html(header);
								}
								if(update){
									//view.find('.objects').html(ltmp(ltmp_arr.loader_notice,{account:check_account,block:check_block}));
									view.find('.objects').html(ltmp_arr.empty_loader_notice);

									if(typeof query_obj.event !== 'undefined'){
										let events_arr=query_obj.event;
										if(typeof query_obj.event === 'string'){
											events_arr=[query_obj.event];
										}
										events_arr=array_unique(events_arr);
										events_arr.sort();
										//try load and execute events from array
										load_events(check_account,events_arr,function(){
											console.log('finish load_events from view_path publication',check_account);
											get_object(check_account,check_block,false,function(err,object_result){
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
													after_view_render(view);
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

													//publication content view mode
													$('body').addClass('publication-mode');

													$('.loader').css('display','none');
													view.css('display','block');
													check_load_more();
													after_view_render(view);
												}
											});
										});
									}
									else{
										get_object(check_account,check_block,false,function(err,object_result){
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
												after_view_render(view);
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

												//publication content view mode
												$('body').addClass('publication-mode');

												$('.loader').css('display','none');
												view.css('display','block');
												check_load_more();
												after_view_render(view);
											}
										});
									}
								}
								else{
									//publication content view mode
									$('body').addClass('publication-mode');

									$('.loader').css('display','none');
									view.css('display','block');
									$(window)[0].scrollTo({top:(typeof view.data('scroll')!=='undefined'?view.data('scroll'):0)});
									check_load_more();
									after_view_render(view);
								}
							}
						});
					}
				}
				else{//additional part in path not supported
					$('.loader').css('display','block');
					$('.view').css('display','none');
					level++;
					let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query});
					$('.content').append(new_view);
					let view=$('.view[data-level="'+level+'"]');
					let header='';
					header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_global.icon_back,force:back_to});
					header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp(ltmp_arr.header_link_icons)});
					view.find('.header').html(header);
					view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.data_not_found}));

					$('.loader').css('display','none');
					view.css('display','block');
					after_view_render(view);
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

function highlight_links(text,is_html){
	console.log(text);
	is_html=typeof is_html==='undefined'?false:is_html;

	let summary_html=[];
	let html_num=0;

	if(is_html){
		let html_img_pattern = /<img(.[^>]*)>/gim;
		let html_href_pattern = /<a (.[^>]*)>(.*)<\/a>/gim;
		let html_arr=text.match(html_img_pattern);
		if(null!=html_arr){
			for(let i in html_arr){
				if(1<html_arr[i].length){
					summary_html[html_num]=html_arr[i];
					html_num++;
				}
			}
		}
		html_arr=text.match(html_href_pattern);
		if(null!=html_arr){
			for(let i in html_arr){
				if(1<html_arr[i].length){
					summary_html[html_num]=html_arr[i];
					html_num++;
				}
			}
		}

		summary_html=array_unique(summary_html);
		summary_html.sort(sort_by_length_asc);

		for(let i in summary_html){
			text=fast_str_replace(summary_html[i],'<REPLACE_HTML_'+i+'>',text);
		}
	}

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

	//let http_protocol_pattern = /(http|https)\:\/\/[@A-Za-z0-9\-_\.\/#]*/g;//first version
	//add \u0400-\u04FF for cyrillic https://jrgraphix.net/r/Unicode/0400-04FF
	let magnet_protocol_pattern = /((magnet):[\u0400-\u04FF\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;&]*[\u0400-\u04FF\-A-Z0-9+\u0026@#\/%=~()_|])/gi;
	let magnet_protocol_links=text.match(magnet_protocol_pattern);
	if(null!=magnet_protocol_links){
		for(let i in magnet_protocol_links){
			summary_links[num]=magnet_protocol_links[i];
			num++;
		}
	}

	//hashtags highlights after links for avoid conflicts with url with hashes (not necessary, because array sorted by length)
	let hashtags_pattern = /(|\b)#([^:;@#!.,?\r\n\t <>()\[\]]+)(|\b)/g;
	let hashtags_links=text.match(hashtags_pattern);
	if(null!=hashtags_links){
		for(let i in hashtags_links){
			if(1<hashtags_links[i].length){
				summary_links[num]=hashtags_links[i];
				num++;
			}
		}
	}

	for(let i in summary_links){
		if(-1!=summary_links[i].indexOf(')')){
			if(-1==summary_links[i].indexOf('(')){
				summary_links[i]=summary_links[i].substring(0,summary_links[i].indexOf(')'));
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

	if(is_html){
		for(let i in summary_html){
			text=fast_str_replace('<REPLACE_HTML_'+i+'>',summary_html[i],text);
		}
	}

	return text;
}

function check_object_repost(account,block){
	if(typeof account == 'undefined'){
		return;
	}
	if(typeof block == 'undefined'){
		return;
	}
	block=parseInt(block);
	idb_get_id('reposts','object',[account,block],function(repost_id){
		if(false!==repost_id){//repost entry exist
			let current_link='viz://@'+account+'/'+block+'/';
			let view=$('.view[data-level="'+level+'"]');
			if(-1==path.indexOf('viz://')){//look in services views
				let path_parts=path.split('/');
				view=$('.view[data-path="'+path_parts[0]+'"]');
			}
			let actions=view.find('.objects .object[data-link="'+current_link+'"] .actions-view');
			$(actions).find('.share-action').addClass('success');
		}
	});
}

function check_object_award(account,block){
	if(typeof account == 'undefined'){
		return;
	}
	if(typeof block == 'undefined'){
		return;
	}
	block=parseInt(block);
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
	if(typeof object.block !== 'undefined'){
		object.block=parseInt(object.block);
	}
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
	if(typeof object.hidden !== 'undefined'){
		if(1==object.hidden){
			object_type='hidden';
		}
	}
	console.log('render_object=',object_type,object);

	if('hidden'==object_type){
		render=ltmp(ltmp_arr.object_hidden,{
			account:user.account,
			block:object.block,
			link:'viz://@'+user.account+'/'+object.block+'/',
			events:(typeof object.events !== 'undefined')?object.events.join(','):'',
			previous:object.data.p,
		});
		return render;
	}
	if('publication'==type){
		if('publication'==object_type){
			let more_view='';
			if(user.account==current_user){
				more_view=ltmp(ltmp_arr.more_column,{account:user.account,block:object.block});
			}

			let decoded_view='';
			if(typeof object.data.d.decoded !== 'undefined'){
				if(1==object.data.d.decoded){
					decoded_view=ltmp(ltmp_arr.decoded_object);
				}
			}

			//text=markdown_clear_code(object.data.d.m);//markdown
			let image_part=(typeof object.data.d.i !== 'undefined');
			let strikethrough_pattern=/\~\~(.*?)\~\~/gm;
			let title='<h1>'+markdown_decode_text(object.data.d.t.replace(strikethrough_pattern,'<strike>$1</strike>'))+'</h1>';
			let publication_html=title+html_safe_images(markdown_decode(object.data.d.m));
			publication_html=highlight_links(publication_html,true);//ignore html tags (images and links)
			render=ltmp(ltmp_arr.object_type_publication_full,{
				author:'@'+user.account,
				link:'viz://@'+user.account+'/'+object.block+'/',
				events:(typeof object.events !== 'undefined')?object.events.join(','):'',
				nickname:profile.nickname,
				avatar:safe_avatar(profile.avatar),
				actions:ltmp(ltmp_arr.object_type_text_actions,{
					icon_reply:ltmp_global.icon_reply,
					icon_repost:ltmp_global.icon_repost,
					icon_award:ltmp_global.icon_gem,
					icon_share:ltmp_global.icon_share,
				}),
				timestamp:object.data.timestamp,
				context:publication_html,
				more:more_view,
				decoded:decoded_view,
			});
		}
	}
	else
	if('default'==type){
		if(object.is_share && (typeof object.parent_account !== 'undefined')){
			let text='';
			if(typeof object.data.d.text !== 'undefined'){
				text=object.data.d.text;
			}
			else{
				if(typeof object.data.d.t !== 'undefined'){
					text=object.data.d.t;
				}
			}
			text=escape_html(text);
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
				class_addon:(1==object.nsfw?' nsfw-content':''),
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
						get_object(object.parent_account,object.parent_block,false,function(err,sub_object){
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
		else
		if(object.is_share && (typeof object.link !== 'undefined')){
			let text='';
			if(typeof object.data.d.text !== 'undefined'){
				text=object.data.d.text;
			}
			else{
				if(typeof object.data.d.t !== 'undefined'){
					text=object.data.d.t;
				}
			}
			text=escape_html(text);
			let current_link='viz://@'+user.account+'/'+object.block+'/';
			render=ltmp(ltmp_arr.object_type_text_share_link,{
				author:'@'+user.account,
				link:current_link,
				account:user.account,
				block:object.block,
				previous:object.data.p,
				is_reply:object.is_reply,
				is_share:object.is_share,

				events:(typeof object.events !== 'undefined')?object.events.join(','):'',

				caption:'@'+user.account,
				comment:ltmp(ltmp_arr.object_type_text_share_comment,{comment:text}),

				class_addon:(1==object.nsfw?' nsfw-content':''),
				actions:ltmp(ltmp_arr.object_type_text_actions,{
					//link:link,
					icon_reply:ltmp_global.icon_reply,
					icon_repost:ltmp_global.icon_repost,
					icon_award:ltmp_global.icon_gem,
					icon_share:ltmp_global.icon_share,
				}),
			});
			setTimeout(function(){
				let text_share_link=link_to_http_gate(object.link);
				if(false!==text_share_link){
					load_preview_data(text_share_link,function(preview_data){
						if(undefined===preview_data.meta){//show link preview anyway
							preview_data.meta=false;
						}
						render_preview_data(user.account,object.block,preview_data);
					});
				}
			},100);
		}
		else{
			if('encoded'==object_type){
				let more_view='';
				if(user.account==current_user){
					more_view=ltmp(ltmp_arr.more_column,{account:user.account,block:object.block});
				}
				let comment='';
				if(typeof object.data.c !== 'undefined'){
					comment=object.data.c;
					comment=ltmp(ltmp_arr.object_type_encoded_comment,{comment:comment});
				}
				render=ltmp(ltmp_arr.object_type_encoded,{
					author:'@'+user.account,
					account:user.account,
					block:object.block,
					nickname:profile.nickname,
					avatar:safe_avatar(profile.avatar),
					link:'viz://@'+user.account+'/'+object.block+'/',
					events:(typeof object.events !== 'undefined')?object.events.join(','):'',
					timestamp:object.data.timestamp,
					actions:ltmp(ltmp_arr.object_type_text_actions,{
						//link:link,
						icon_reply:ltmp_global.icon_reply,
						icon_repost:ltmp_global.icon_repost,
						icon_award:ltmp_global.icon_gem,
						icon_share:ltmp_global.icon_share,
					}),
					more:more_view,
					comment:comment,
				});
				return render;
			}
			if('publication'==object_type){
				//text=markdown_clear_code(object.data.d.m);//markdown
				let result='';
				let image='';
				let link='';
				let image_part=(typeof object.data.d.i !== 'undefined');
				let wrapper_addon=' style="flex-direction:column;"';
				let strikethrough_pattern=/\~\~(.*?)\~\~/gm;
				let title=markdown_decode_text(object.data.d.t.replace(strikethrough_pattern,'<strike>$1</strike>'));
				link=ltmp(ltmp_arr.render_article_preview,{title:title,descr:(typeof object.data.d.d !== 'undefined'?object.data.d.d:''),link:'viz://@'+user.account+'/'+object.block+'/'});
				if(typeof object.data.d.i !== 'undefined'){
					if(false===safe_image(object.data.d.i)){
						image_part=false;
					}
				}
				if(image_part){
					image=ltmp(ltmp_arr.render_preview_article_image,{image:safe_image(object.data.d.i),link:'viz://@'+user.account+'/'+object.block+'/'});
				}

				let more_view='';
				if(user.account==current_user){
					more_view=ltmp(ltmp_arr.more_column,{account:user.account,block:object.block});
				}

				let decoded_view='';
				if(typeof object.data.d.decoded !== 'undefined'){
					if(1==object.data.d.decoded){
						decoded_view=ltmp(ltmp_arr.decoded_object);
					}
				}

				render=ltmp(ltmp_arr.object_type_publication,{
					author:'@'+user.account,
					link:'viz://@'+user.account+'/'+object.block+'/',
					events:(typeof object.events !== 'undefined')?object.events.join(','):'',
					nickname:profile.nickname,
					avatar:safe_avatar(profile.avatar),
					actions:ltmp(ltmp_arr.object_type_text_actions,{
						//link:link,
						icon_reply:ltmp_global.icon_reply,
						icon_repost:ltmp_global.icon_repost,
						icon_award:ltmp_global.icon_gem,
						icon_share:ltmp_global.icon_share,
					}),
					timestamp:object.data.timestamp,
					context:image+link,
					addon:wrapper_addon,
					class_addon:(1==object.nsfw?' nsfw-content':''),
					more:more_view,
					decoded:decoded_view,
				});
			}
			if('text'==object_type){
				let text='';
				if(typeof object.data.d.text !== 'undefined'){
					text=object.data.d.text;
				}
				else{
					if(typeof object.data.d.t !== 'undefined'){
						text=object.data.d.t;
					}
				}
				text_first_link=first_link(text);

				if(object.is_share && (typeof object.link !== 'undefined')){
					text_first_link=object.link;
				}

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

				let more_view='';
				if(user.account==current_user){
					more_view=ltmp(ltmp_arr.more_column,{account:user.account,block:object.block});
				}
				let decoded_view='';
				if(typeof object.data.d.decoded !== 'undefined'){
					if(1==object.data.d.decoded){
						decoded_view=ltmp(ltmp_arr.decoded_object);
					}
				}

				render=ltmp(ltmp_arr.object_type_text,{
					reply:reply,
					author:'@'+user.account,
					link:'viz://@'+user.account+'/'+object.block+'/',
					events:(typeof object.events !== 'undefined')?object.events.join(','):'',
					nickname:profile.nickname,
					avatar:safe_avatar(profile.avatar),
					text:text,
					actions:ltmp(ltmp_arr.object_type_text_actions,{
						//link:link,
						icon_reply:ltmp_global.icon_reply,
						icon_repost:ltmp_global.icon_repost,
						icon_award:ltmp_global.icon_gem,
						icon_share:ltmp_global.icon_share,
					}),
					timestamp:object.data.timestamp,
					class_addon:(1==object.nsfw?' nsfw-content':''),
					more:more_view,
					decoded:decoded_view,
				});
			}
		}
	}
	if('preview'==type){
		if(object.is_share && (typeof object.parent_account !== 'undefined')){
			let text='';
			if(typeof object.data.d.text !== 'undefined'){
				text=object.data.d.text;
			}
			else{
				if(typeof object.data.d.t !== 'undefined'){
					text=object.data.d.t;
				}
			}
			text=escape_html(text);

			let current_link='viz://@'+user.account+'/'+object.block+'/';
			render=ltmp(ltmp_arr.object_type_text_loading,{
				account:user.account,
				block:object.block,
				previous:object.data.p,
				is_reply:object.is_reply,
				is_share:object.is_share,
				link:current_link,
				events:(typeof object.events !== 'undefined')?object.events.join(','):'',
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
						get_object(object.parent_account,object.parent_block,false,function(err,sub_object){
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
		else
		if(object.is_share && (typeof object.link !== 'undefined')){
			let text='';
			if(typeof object.data.d.text !== 'undefined'){
				text=object.data.d.text;
			}
			else{
				if(typeof object.data.d.t !== 'undefined'){
					text=object.data.d.t;
				}
			}
			text=escape_html(text);
			let current_link='viz://@'+user.account+'/'+object.block+'/';
			render=ltmp(ltmp_arr.object_type_text_share_link_preview,{
				author:'@'+user.account,
				account:user.account,
				block:object.block,

				nickname:profile.nickname,
				avatar:safe_avatar(profile.avatar),

				previous:object.data.p,
				is_reply:object.is_reply,
				is_share:object.is_share,

				text:text,

				link:current_link,
				events:(typeof object.events !== 'undefined')?object.events.join(','):'',

				caption:'@'+user.account,

				class_addon:(1==object.nsfw?' nsfw-content':''),
				actions:ltmp(ltmp_arr.object_type_text_actions,{
					//link:link,
					icon_reply:ltmp_global.icon_reply,
					icon_repost:ltmp_global.icon_repost,
					icon_award:ltmp_global.icon_gem,
					icon_share:ltmp_global.icon_share,
				}),
				timestamp:object.data.timestamp,
			});
			setTimeout(function(){
				let text_share_link=link_to_http_gate(object.link);
				if(false!==text_share_link){
					load_preview_data(text_share_link,function(preview_data){
						if(undefined===preview_data.meta){//show link preview anyway
							preview_data.meta=false;
						}
						render_preview_data(user.account,object.block,preview_data);
					});
				}
			},100);
		}
		else{
			if('encoded'==object_type){
				let comment='';
				if(typeof object.data.c !== 'undefined'){
					comment=object.data.c;
					comment=ltmp(ltmp_arr.object_type_encoded_comment,{comment:comment});
				}
				render=ltmp(ltmp_arr.object_type_encoded_preview,{
					author:'@'+user.account,
					account:user.account,
					block:object.block,
					nickname:profile.nickname,
					avatar:safe_avatar(profile.avatar),
					link:'viz://@'+user.account+'/'+object.block+'/',
					events:(typeof object.events !== 'undefined')?object.events.join(','):'',
					previous:object.data.p,
					timestamp:object.data.timestamp,
					comment:comment,
				});
				return render;
			}
			if('publication'==object_type){
				//text=markdown_clear_code(object.data.d.m);//markdown
				let result='';
				let image='';
				let link='';
				let image_part=(typeof object.data.d.i !== 'undefined');
				let wrapper_addon=' style="flex-direction:column;"';
				let strikethrough_pattern=/\~\~(.*?)\~\~/gm;
				let title=markdown_decode_text(object.data.d.t.replace(strikethrough_pattern,'<strike>$1</strike>'));
				link=ltmp(ltmp_arr.render_article_preview,{title:title,descr:(typeof object.data.d.d !== 'undefined'?object.data.d.d:''),link:'viz://@'+user.account+'/'+object.block+'/'});
				if(typeof object.data.d.i !== 'undefined'){
					if(false===safe_image(object.data.d.i)){
						image_part=false;
					}
				}
				if(image_part){
					image=ltmp(ltmp_arr.render_preview_article_image,{image:safe_image(object.data.d.i),link:'viz://@'+user.account+'/'+object.block+'/'});
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
					events:(typeof object.events !== 'undefined')?object.events.join(','):'',
					actions:ltmp(ltmp_arr.object_type_text_actions,{
						//link:link,
						icon_reply:ltmp_global.icon_reply,
						icon_repost:ltmp_global.icon_repost,
						icon_award:ltmp_global.icon_gem,
						icon_share:ltmp_global.icon_share,
					}),
					timestamp:object.data.timestamp,
					context:image+link,
					addon:wrapper_addon,
					class_addon:(1==object.nsfw?' nsfw-content':''),
				});
			}
			if('text'==object_type){
				let text='';
				if(typeof object.data.d.text !== 'undefined'){
					text=object.data.d.text;
				}
				else{
					if(typeof object.data.d.t !== 'undefined'){
						text=object.data.d.t;
					}
				}
				text_first_link=first_link(text);

				if(object.is_share && (typeof object.link !== 'undefined')){
					text_first_link=object.link;
				}

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
					events:(typeof object.events !== 'undefined')?object.events.join(','):'',
					actions:ltmp(ltmp_arr.object_type_text_actions,{
						//link:link,
						icon_reply:ltmp_global.icon_reply,
						icon_repost:ltmp_global.icon_repost,
						icon_award:ltmp_global.icon_gem,
						icon_share:ltmp_global.icon_share,
					}),
					timestamp:object.data.timestamp,
					class_addon:(1==object.nsfw?' nsfw-content':''),
				});
			}
		}
	}
	if('pinned'==type){
		let text='';
		if(typeof object.data.d.text !== 'undefined'){
			text=object.data.d.text;
		}
		else{
			if(typeof object.data.d.t !== 'undefined'){
				text=object.data.d.t;
			}
		}
		text=escape_html(text);

		let current_link='viz://@'+user.account+'/'+object.block+'/';
		render=ltmp(ltmp_arr.object_type_text_pinned,{
			account:user.account,
			block:object.block,
			link:current_link,
			context:ltmp(ltmp_arr.object_type_text_pinned_caption,{
				icon:ltmp_global.icon_pin
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
					get_object(user,object,false,function(err,sub_object){
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
					get_object(user,object,false,function(err,sub_object){
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

		let text='';
		if(typeof object.data.d.text !== 'undefined'){
			text=object.data.d.text;
		}
		else{
			if(typeof object.data.d.t !== 'undefined'){
				text=object.data.d.t;
			}
		}
		text_first_link=first_link(text);

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
				icon_reply:ltmp_global.icon_reply,
				icon_repost:ltmp_global.icon_repost,
				icon_award:ltmp_global.icon_gem,
				icon_share:ltmp_global.icon_share,
			}),
			timestamp:object.data.timestamp,
			class_addon:(1==object.nsfw?' nsfw-content':''),
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
			let title=markdown_decode_text(object.data.d.t.replace(strikethrough_pattern,'<strike>$1</strike>'));
			link=ltmp(ltmp_arr.render_article_preview,{title:title,descr:(typeof object.data.d.d !== 'undefined'?object.data.d.d:''),link:'viz://@'+user.account+'/'+object.block+'/'});
			if(typeof object.data.d.i !== 'undefined'){
				if(false===safe_image(object.data.d.i)){
					image_part=false;
				}
			}
			if(image_part){
				image=ltmp(ltmp_arr.render_preview_article_image,{image:safe_image(object.data.d.i),link:'viz://@'+user.account+'/'+object.block+'/'});
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
				events:(typeof object.events !== 'undefined')?object.events.join(','):'',
				actions:ltmp(ltmp_arr.object_type_text_actions,{
					//link:link,
					icon_reply:ltmp_global.icon_reply,
					icon_repost:ltmp_global.icon_repost,
					icon_award:ltmp_global.icon_gem,
					icon_share:ltmp_global.icon_share,
				}),
				timestamp:object.data.timestamp,
				context:image+link,
				addon:wrapper_addon,
				class_addon:(1==object.nsfw?' nsfw-content':''),
			});
		}
		if('text'==object_type){
			let text='';
			if(typeof object.data.d.text !== 'undefined'){
				text=object.data.d.text;
			}
			else{
				if(typeof object.data.d.t !== 'undefined'){
					text=object.data.d.t;
				}
			}
			text_first_link=first_link(text);
			if(object.is_share){
				if(undefined !== typeof object.link){
					text_first_link=object.link
				}
			}

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
				events:(typeof object.events !== 'undefined')?object.events.join(','):'',
				actions:ltmp(ltmp_arr.object_type_text_actions,{
					//link:link,
					icon_reply:ltmp_global.icon_reply,
					icon_repost:ltmp_global.icon_repost,
					icon_award:ltmp_global.icon_gem,
					icon_share:ltmp_global.icon_share,
				}),
				timestamp:object.data.timestamp,
				class_addon:(1==object.nsfw?' nsfw-content':''),
			});
		}
	}
	setTimeout(function(){
		check_object_repost(user.account,object.block);
		check_object_award(user.account,object.block);
		console.log('render_object timeout check first link',type,text_first_link);
		if(1==object.nsfw){
			let check_nsfw=function(account,block){
				let current_link='viz://@'+account+'/'+block+'/';
				let view=$('.view[data-level="'+level+'"]');
				if(-1==path.indexOf('viz://')){//look in services views
					let path_parts=path.split('/');
					view=$('.view[data-path="'+path_parts[0]+'"]');
				}
				let object_view=view.find('.objects .object[data-link="'+current_link+'"]');

				if(settings.nsfw_warning){
					object_view.find('.nsfw-content').css('display','none');
					$(object_view.find('.nsfw-content')[0]).before(ltmp_arr.nsfw_warning);
				}
				else{
					object_view.find('.nsfw-content').css('display','block');
					object_view.find('.nsfw-content').css('opacity','1');
				}
			}
			check_nsfw(user.account,object.block);
		}
		if(false!==text_first_link){
			text_first_link=link_to_http_gate(text_first_link);
			if(false!==text_first_link){
				load_preview_data(text_first_link,function(preview_data){
					if(object.is_share){
						if(undefined !== typeof object.link){
							if(undefined===preview_data.meta){//show shared link preview anyway
								preview_data.meta=false;
							}
						}
					}
					render_preview_data(user.account,object.block,preview_data);
				});
			}
		}
		if(typeof user.account !== 'undefined'){
			let current_link='viz://@'+user.account+'/'+object.block+'/';
			idb_get_count('replies','parent',[user.account,parseInt(object.block)],false,function(replies_count){
				if(99<replies_count){
					replies_count='99+';
				}
				if(0==replies_count){
					replies_count='';
				}
				let view=$('.view[data-level="'+level+'"]');
				if(-1==path.indexOf('viz://')){//look in services views
					let path_parts=path.split('/');
					view=$('.view[data-path="'+path_parts[0]+'"]');
				}
				let object_view=view.find('.objects .object[data-link="'+current_link+'"]');
				object_view.find('.replies-count').html(replies_count);
			});
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

			//selected interests as hashtags filter
			let hashtags_unique_filter=false;
			view.find('.profile .categories a.selected').each(function(i,el){
				hashtags_unique_filter=$(el).data('hashtag');
			});

			if(0==hashtags_filter.length && false===hashtags_unique_filter){
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
				},150);
			}
			else{//filter by selected interests
				console.log(hashtags_filter.length,hashtags_unique_filter)
				let hashtags_unique_id_filter=0;
				let hashtags_id_filter=[];
				let hashtags_id_counter=hashtags_filter.length;
				if(false!==hashtags_unique_filter){
					hashtags_id_counter++;
				}
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
						if(false!==hashtags_unique_filter){
							if(hashtags_unique_filter==cur.value.tag){
								hashtags_unique_id_filter=cur.value.id;
								hashtags_id_counter--;
							}
						}
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
						if(hashtags_id_filter.length>0 || false!==hashtags_unique_filter){
							hashtags_id_filter_str=hashtags_id_filter.join(',');
							if(false!==hashtags_unique_filter){
								hashtags_id_filter_str+='!'+hashtags_unique_id_filter;
							}
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
										if(0==hashtags_id_filter.length){
											find_object=true;//don't need to search not-unique interest
										}
										let find_unique_object=false;
										if(false===hashtags_unique_filter){
											find_unique_object=true;//don't need to search unique category
										}
										let cursor_end=false;
										search_object_req.onsuccess=function(event){
											let cur=event.target.result;
											if(cursor_end){
												cur=false;
											}
											if(cur){
												if(false!==hashtags_unique_filter){
													if(hashtags_unique_id_filter==cur.value.tag){
														find_unique_object=true;
													}
												}
												if(-1!=hashtags_id_filter.indexOf(cur.value.tag)){
													find_object=true;
												}
												if(find_object && find_unique_object){
													cursor_end=true;
												}
												cur.continue();
											}
											else{
												if(!find_object || !find_unique_object){
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
									},150);
								}
							});
						}
						else{//no actual hashtags find
							clearTimeout(check_load_more_timer);
							check_load_more_timer=setTimeout(function(){
								check_load_more();
							},150);
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
		let hashtags_feed_id=parseInt(indicator.data('hashtags-feed-id'));//id change to block
		hashtags_feed_id=(hashtags_feed_id==0?Number.MAX_SAFE_INTEGER:hashtags_feed_id);
		let last_id=0;//id change to block
		let objects=[];
		let cursor_end=false;
		let update_req;
		update_req=update_q.index('tag_block').openCursor(IDBKeyRange.upperBound([hashtags_id,hashtags_feed_id],true),'prev');
		update_req.onsuccess=function(event){
			let cur=event.target.result;
			if(cursor_end){
				cur=false;
			}
			if(cur){
				let item=cur.value;
				if(item.tag==hashtags_id){
					if(last_id!=0){
						if(last_id!=item.block){
							cursor_end=true;
						}
					}
					else{
						last_id=item.block;
					}
					if(!cursor_end){
						objects.push(item);
					}
				}
				else{
					cursor_end=true;
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
			let objects_count=indicator.parent().find('.objects>.object').length;
			objects_count-=indicator.parent().find('.pinned-object').length;
			if(0<objects_count){
				find_objects=true;
			}
			indicator.parent().find('.objects>.object').each(function(){
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
			//if some objects - need to check impossible?
			if(find_objects){
				//need to stop load more if no previous
				if((offset==start_offset)||(offset==0)){
					indicator.before(ltmp_arr.load_more_end_notice);
					indicator.remove();
					return;
				}
			}
			get_object(check_account,offset,false,function(err,object_result){
				if(err){
					console.log('get_object error',check_account,offset,err,object_result);
					if(1==object_result){
						indicator.before(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.block_not_found}));
						//try again after 1s
						indicator.data('busy','0');
						clearTimeout(check_load_more_timer);
						check_load_more_timer=setTimeout(function(){
							check_load_more();
						},1000);
					}
					if(2==object_result){
						console.log('get_object error:',check_account,offset,'result:',object_result);
						indicator.before(ltmp_arr.load_more_end_notice);
						indicator.remove();
						return;
					}
				}
				else{
					let object_view=render_object(user_result,object_result,'preview');
					indicator.before(object_view);
					let new_object=indicator.parent().find('.object[data-link="viz://@'+user_result.account+'/'+object_result.block+'/"]');
					new_object.css('display','none');
					update_short_date(new_object.find('.short-date-view'));
					profile_filter_by_type();
					indicator.data('busy','0');
					clearTimeout(check_load_more_timer);
					check_load_more_timer=setTimeout(function(){
						check_load_more();
					},100);

					//load more object in profile trigger load new event (1), for unknown accounts too
					let events_deep=1;//dont need deeper, but need dig new event, subscribed accounts already go deeper while loading profile feed
					check_user_last_event(check_account,function(last_event){
						if(false!==last_event){//no user events at all
							console.log('load_more_objects check_user_last_event block num',check_account,last_event);
							let need_new=true;
							load_events_train({},check_account,last_event,object_result.block,need_new,events_deep,function(train){
								console.log('load_more_objects load_events_train',train);
								finish_events_train(train,check_account,function(affected_objects){
									console.log('load_more_objects finish_events_train affected_objects',check_account,affected_objects);
									for(let i in affected_objects){
										let affected_object_block=affected_objects[i];
										//need to update render view for all affected objects (preview/pinned in profile feed)
										setTimeout(function(){
											get_user(check_account,false,function(err,affected_user){
												if(!err)
												get_object(check_account,affected_object_block,false,function(err,affected_object_result){
													if(!err){
														console.log(affected_object_result);
														let view=indicator.closest('.view');
														let find_object=view.find('.objects>.object[data-account="'+check_account+'"][data-block="'+affected_object_block+'"]');
														if(find_object.length>0){
															let found_object_type='preview';
															if(find_object.hasClass('pinned-object')){
																found_object_type='pinned';
															}
															let affected_render=render_object(affected_user,affected_object_result,found_object_type);
															find_object.before(affected_render);
															find_object.remove();//remove old view
															update_short_date(view.find('.objects .object[data-account="'+check_account+'"][data-block="'+affected_object_block+'"]').find('.short-date-view'));
															profile_filter_by_type();
														}
													}
												});
											});
										},10);
									}
								});
							});
						}
					});
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
		check_images(view);//check images in view before load more and after (because load_more_object try execute check_load_more recursive)
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

function is_retina(){
	return ((window.matchMedia && (window.matchMedia('only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx), only screen and (min-resolution: 75.6dpcm)').matches || window.matchMedia('only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min--moz-device-pixel-ratio: 2), only screen and (min-device-pixel-ratio: 2)').matches)) || (window.devicePixelRatio && window.devicePixelRatio >= 2)) && /(Mac OS|iPad|iPhone|iPod)/g.test(navigator.userAgent);
}

function is_full(){
	let fix=1;
	if(is_retina()){
		fix=0.5;
	}
	let calc_width=parseInt(fix*window.outerWidth);
	//console.log(calc_width);
	return (calc_width>1120);
}

function is_mobile(){
	let fix=1;
	if(is_retina()){
		fix=0.5;
	}
	let calc_width=parseInt(fix*window.outerWidth);
	//console.log(calc_width);
	return (calc_width<=800);
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
				'dapp:account/credentials'
			);
		}
		else{
			if(typeof users[current_user].regular_key === 'undefined'){
				add_notify(false,
					ltmp_arr.notify_arr.error,
					ltmp_arr.account_settings_empty_regular_key,
					'dapp:account/credentials'
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
		render_session();
		console.log('Startup: init_users check_current_user +');
		check_whitelabel_account(()=>{
			console.log('Startup: init_users check_whitelabel_account +');
			callback();
		})
	});
}

function preset_view(){
	let preset_view=['account','app_settings','publish'];
	for(let i in preset_view){
		let view_name=preset_view[i];
		let view=$('.view[data-path="dapp:'+view_name+'"]');
		view.find('.objects').html(ltmp(ltmp_arr['preset_view_'+view_name]));
	}
	$('.install-action').html(ltmp_arr.install_caption);
}

var dapp_loaded_timer=0;
function dapp_loaded(){
	clearTimeout(dapp_loaded_timer);
	dapp_loaded_timer=setTimeout(function(){
		$('body').addClass('loaded');
		if(1!=localStorage.getItem(storage_prefix+'install_close')){
			$('.install-notice').addClass('show');
		}
	},2200);
}
var terms_of_use_accept=false;
if(typeof localStorage.terms_of_use_accept !== 'undefined'){
	terms_of_use_accept=parseInt(localStorage.terms_of_use_accept);
	if(isNaN(terms_of_use_accept)){
		terms_of_use_accept=false;
	}
}
var terms_of_user_scroll=function(){
	let el=$('.terms-of-use-readline');
	let object_el=$('.terms-of-use-wrapper');
	if(object_el){
		let min_y=object_el.offset().top;
		let max_y=object_el.offset().top+object_el.height()-window.innerHeight;
		let next_context=object_el.offset().top+object_el.height()+(window.innerHeight/2);//+1/2 of screen
		let percent=0;
		if(Math.ceil(window.pageYOffset)>=min_y){
			percent=Math.ceil(100*window.pageYOffset/max_y);
		}
		percent=Math.min(percent,100);
		$(el).find('.fill-level').css('width',percent+'%');
		if(Math.ceil(window.pageYOffset)>=next_context){
			$(el).find('.fill-level').css('opacity','0');
		}
		else{
			$(el).find('.fill-level').css('opacity','1');
		}
	}
}
function show_terms_of_use(){
	localStorage.removeItem('terms_of_use_accept');
	terms_of_use_accept=false;
	$('body').removeClass('loaded');
	$('body').addClass('scrollable');
	$('.terms-of-use-wrapper').remove();
	$('body').append(ltmp(ltmp_arr.terms_of_use_wrapper));
	$('.terms-of-use-wrapper .view').css('display','block');

	$('.languages-short-list').html('');
	let languages_list='';
	for(let i in available_langs){
		let value=i;
		let language=available_langs[i];
		let language_selected=false;
		if(selected_lang==value){
			language_selected=true;
		}
		languages_list+=ltmp(ltmp_arr.languages_short_list_item,{value:value,caption:language,selected:language_selected?' selected':''});
	}
	$('.languages-short-list').html(languages_list);

	$('.languages-short-list .select-language').on('click',function(){
		console.log('select language',$(this).data('value'));
		$('.languages-short-list .select-language').removeClass('selected');
		$(this).addClass('selected');
		let language_str=$(this).data('value');
		if(typeof available_langs[language_str] !== 'undefined'){
			selected_lang=language_str;
			localStorage.setItem(storage_prefix+'lang',selected_lang);
			ltmp_arr=window['ltmp_'+selected_lang+'_arr'];
			for(let i in window['ltmp_editor_'+selected_lang+'']){
				ltmp_editor[i]=window['ltmp_editor_'+selected_lang+''][i];
			}
		}
		if(false===terms_of_use_accept){
			show_terms_of_use();
		}
		else{
			preset_view();
			render_menu();
			render_session();
			render_right_addon();
			parse_fullpath();
			view_path(path,{},true,false);
		}
		return;
	});

	document.removeEventListener('scroll',terms_of_user_scroll);
	document.addEventListener('scroll',terms_of_user_scroll);

	$('.terms-of-use-accept-action').on('click',function(){
		document.removeEventListener('scroll',terms_of_user_scroll);
		$('.terms-of-use-wrapper').remove();
		$('body').removeClass('scrollable');
		terms_of_use_accept=new Date().getTime() / 1000 | 0;
		localStorage.terms_of_use_accept=terms_of_use_accept;
		main_app();
	});
	return;
}

function more_list_close(){
	if($('div.more-list').hasClass('show')){
		$('div.more-list').data('account','');
		$('div.more-list').data('block','');
		$('div.more-list').css('display','none');
		$('div.more-list').removeClass('show');

		$('.screen-click').removeClass('show');
	}
}
function more_list_position(){
	if($('div.more-list').hasClass('show')){
		if($('.view[data-level="'+level+'"] .more-action[data-account="'+$('div.more-list').data('account')+'"][data-block="'+$('div.more-list').data('block')+'"]').length>0){
			let target_offset=$('.view[data-level="'+level+'"] .more-action[data-account="'+$('div.more-list').data('account')+'"][data-block="'+$('div.more-list').data('block')+'"]')[0].getBoundingClientRect();
			$('div.more-list').css('display','block');
			let more_offset=$('div.more-list')[0].getBoundingClientRect();
			$('div.more-list').css('left',(target_offset.left+target_offset.width-more_offset.width)+'px');
			$('div.more-list').css('top',(window.scrollY+target_offset.top-5)+'px');
		}
		else{
			$('div.more-list').removeClass('show');
			$('div.more-list').css('display','none');
		}
	}
}

var ignore_resize=false;
function main_app(){
	if(false===terms_of_use_accept){
		show_terms_of_use();
		return;
	}
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

	document.addEventListener('mousedown',app_mouse,false);
	document.addEventListener('touchstart',app_mouse,false);
	document.addEventListener('click',app_mouse,false);
	document.addEventListener('tap',app_mouse,false);
	document.addEventListener('keydown',app_keyboard_down,false);
	document.addEventListener('keyup',app_keyboard,false);

	document.addEventListener('scroll',function(){
		if(-1!=path.indexOf('viz://')){//save view scroll position
			if('none'!=$('.view[data-level="'+level+'"]').css('display')){
				$('.view[data-level="'+level+'"]').data('scroll',Math.ceil(window.pageYOffset));
			}
		}
		$('.publication-readline').each(function(i,el){
			let object_link=$(el).data('object');
			let object_el=$(el).closest('.view').find('.object[data-link="'+object_link+'"]');
			if(object_el){
				let min_y=object_el.offset().top;
				let max_y=object_el.offset().top+object_el.height()-window.innerHeight;
				let next_context=object_el.offset().top+object_el.height()+(window.innerHeight/2);//+1/2 of screen
				let percent=0;
				if(Math.ceil(window.pageYOffset)>=min_y){
					percent=Math.ceil(100*window.pageYOffset/max_y);
				}
				percent=Math.min(percent,100);
				$(el).find('.fill-level').css('width',percent+'%');
				if(Math.ceil(window.pageYOffset)>=next_context){
					$(el).find('.fill-level').css('opacity','0');
				}
				else{
					$(el).find('.fill-level').css('opacity','1');
				}
			}
		});
		check_load_more();
	});

	window.onresize=function(init){
		more_list_position();
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
			$('.toggle-menu-icon').html(ltmp_global.icon_menu_collapse);
		}
		else{
			$('.toggle-menu-icon').html(ltmp_global.icon_menu_expand);
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
	window.addEventListener('orientationchange', function() {
		setTimeout(function(){window.onresize(true)},20);
		console.log('The orientation of the device is now '+screen.orientation.angle,screen.orientation);
	});
}