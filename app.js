var app_version=1;
var app_protocol='V';//V for Voice :)
var storage_prefix='viz_voice_';

var is_safari=navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
			navigator.userAgent &&
			navigator.userAgent.indexOf('CriOS') == -1 &&
			navigator.userAgent.indexOf('FxiOS') == -1;
var is_firefox=navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

var api_gates=[
	'https://api.viz.world/',
	'https://node.viz.plus/',
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
			xhr.overrideMimeType('text/plain');
			xhr.open('POST',current_gate_url);
			xhr.setRequestHeader('accept','application/json, text/plain, */*');
			xhr.setRequestHeader('content-type','application/json');
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
			}
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
var default_energy_step=500;//5.00%
var theme='light';

if(null!=localStorage.getItem(storage_prefix+'users')){
	users=JSON.parse(localStorage.getItem(storage_prefix+'users'));
}
if(null!=localStorage.getItem(storage_prefix+'current_user')){
	current_user=localStorage.getItem(storage_prefix+'current_user');
}
if(null!=localStorage.getItem(storage_prefix+'theme')){
	theme=localStorage.getItem(storage_prefix+'theme');
	$('body').addClass(theme);
}

var default_settings={
	feed_size:10000,
	activity_size:0,
	activity_period:5,
	activity_deep:50,
	user_profile_ttl:60,
	user_cache_ttl:10,
	object_cache_ttl:10,
	feed_subscribe_text:true,
	feed_subscribe_replies:false,
	feed_subscribe_shares:true,
	feed_subscribe_mentions:true,
	//feed_load_by_timer:true,
	//feed_load_by_surf:false,
	energy:100,
	silent_award:false,
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

	users={};
	if(current_user){
		users_table_diff.push([current_user,false]);

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
		};
	}
	current_user='';
	localStorage.removeItem(storage_prefix+'users');
	localStorage.removeItem(storage_prefix+'current_user');
	increase_db_version(function(){
		render_menu();
		render_session();
	});
}

var users_table_diff=[];

function idb_error(e){
	console.log('IDB error',e);
}

const idb=window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
const idbt=window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction;
const idbrkr=window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

var db;
var db_version=1;
var global_db_version=2;
var need_update_db_version=false;
var local_global_db_version=localStorage.getItem(storage_prefix+'global_db_version');
if((null===local_global_db_version)||(global_db_version>local_global_db_version)){
	console.log('need update global db version',global_db_version);
	need_update_db_version=true;
	localStorage.setItem(storage_prefix+'global_db_version',global_db_version)
}
if(null!=localStorage.getItem(storage_prefix+'db_version')){
	db_version=parseInt(localStorage.getItem(storage_prefix+'db_version'));
}
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
	}
	load_db(()=>{callback();});
}

function full_reset_db(){
	idb.deleteDatabase(storage_prefix+'social_network');
	db.close();
	load_db(()=>{document.location.reload(true);});
}

function load_db(callback){
	var req=idb.open(storage_prefix+'social_network',db_version);
	req.onerror=idb_error;
	req.onblocked=idb_error;
	req.onsuccess=function(event){
		console.log('onsuccess!');
		db=event.target.result;
		callback();
	};
	req.onupgradeneeded=function(event){
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
			items_table.createIndex('cache','cache',{unique:false});//cache boolean for cleanup
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
		}
		else{
			//new index for hashtags
		}

		if(!db.objectStoreNames.contains('hashtags_feed')){
			items_table=db.createObjectStore('hashtags_feed',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('tag','tag',{unique:true});//hash tag id
			items_table.createIndex('tag_feed',['tag','id'],{unique:false});//hash tag id
			items_table.createIndex('object',['account','block'],{unique:false});//account
		}
		else{
			//new index for hashtags_feed
		}

		if(!db.objectStoreNames.contains('objects')){
			items_table=db.createObjectStore('objects',{keyPath:'id',autoIncrement:true});
			items_table.createIndex('object',['account','block'],{unique:true});//account
			items_table.createIndex('account','account',{unique:false});
			items_table.createIndex('time','time',{unique:false});//unixtime for stored objects
			items_table.createIndex('is_reply','is_reply',{unique:false});//true/false
			items_table.createIndex('is_share','is_share',{unique:false});//true/false
		}
		else{
			//items_table=update_trx.objectStore('objects');
			//new index for objects cache
		}
		if(current_user){
			if(!db.objectStoreNames.contains('objects_'+current_user)){
				users_table_diff.push([current_user,true]);
			}
		}
		for(let i in users_table_diff){
			let check_user_table=users_table_diff[i];
			console.log('users diff:',check_user_table);
			if(check_user_table[1]){
				if(!db.objectStoreNames.contains('objects_'+check_user_table[0])){
					items_table=db.createObjectStore('objects_'+check_user_table[0],{keyPath:'id',autoIncrement:true});
					items_table.createIndex('block','block',{unique:true});//block num
					items_table.createIndex('time','time',{unique:false});//unixtime for delayed objects
					//items_table.createIndex('type','type',{unique:false});//need for new types (not only text)
					items_table.createIndex('is_reply','is_reply',{unique:false});//true/false
					items_table.createIndex('is_share','is_share',{unique:false});//true/false
				}
			}
			if(!check_user_table[1]){
				if(db.objectStoreNames.contains('objects_'+check_user_table[0])){
					db.deleteObjectStore('objects_'+check_user_table[0]);
				}
			}
		}
		users_table_diff=[];

		/*
		//add
		let t1=db.transaction(['users'],'readwrite');
		let q1=t1.objectStore('users');
		q1.add({'account':'on1x'});
		q1.add({'account':'test'});
		t1.commit();
		t1.oncomplete=function(e){
			//refresh view?
		}*/
		/*
		//read
		let t=db.transaction(['users'],'readonly');
		let q=t.objectStore('users');
		let req=q.index('account').openCursor(null,'next');
		let result=[];
		req.onsuccess=function(event){
			let cur=event.target.result;
			if(cur){
				let obj=cur.value;
				result.push(obj);
				cur.continue();
			}
			else{
				console.log(result);
			}
		};
		*/
	};
}

function idb_get_id(container,index,search,callback){
	let find=false;
	let t,q,req;
	if(db.objectStoreNames.contains(container)){
		t=db.transaction([container],'readonly');
		q=t.objectStore(container);
		req=q.index(index).openCursor(IDBKeyRange.only(search),'next');
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

function save_account_settings(view,login,regular_key,energy_step){
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
			users[login]={'regular_key':regular_key,'energy_step':energy_step};
			current_user=login;
			save_session();
			users_table_diff.push([current_user,true]);
			increase_db_version(function(){
				get_user(current_user,true,function(){
					render_menu();
					render_session();

					view.find('.submit-button-ring').removeClass('show');
					view.find('.success').html(ltmp_arr.account_settings_saved);
					view.find('.button').removeClass('disabled');
				});
			});
		}
	});
}

var level=0;
var path='viz://';
var query='';

function ltmp(ltmp_str,ltmp_args){
	for(ltmp_i in ltmp_args){
		ltmp_str=ltmp_str.split('{'+ltmp_i+'}').join(ltmp_args[ltmp_i]);
	}
	return ltmp_str;
}

var ltmp_arr={
	notify_item:'<div class="notify-item{addon}" data-id="{id}">{context}</div>',
	notify:'<div class="notify-wrapper{addon}" data-id="{id}"><div class="notify" role="alert" aria-live="polite">{context}</div></div>',
	notify_title:'<div class="title">{caption}</div>',
	notify_text:'<div class="text">{text}</div>',
	notify_link:'<a tabindex="0" data-href="{link}" class="close-notify-action">{text}</a>',
	notify_item_link:'<a tabindex="0" data-href="{link}">{text}</a>',
	notify_arr:{
		error:'Ошибка',
		award_success:'Вы наградили @{account}',
		award_info:'≈{amount}Ƶ [{percent}]',
		award_error:'Ошибка при награждении @{account}',
		new_reply:'Новый ответ от @{account}',
		new_share:'Репост от @{account}',
		new_mention:'Упоминание от @{account}',
	},
	notifications_all_tab:'Все',
	notifications_new_tab:'Новые',
	notifications_readed_tab:'Прочитанные',

	awarded_amount:'Награждено на {amount} Ƶ',

	menu_session_empty:'<div class="avatar"><img src="default.png"></div><a tabindex="0" data-href="fsp:account_settings">{caption}</a>',
	menu_session_login:'Войти',
	menu_session_error:'<span class="error">Ошибка</span>',
	menu_session_account:'<div class="avatar"><div class="shadow" data-href="viz://@{account}/"></div><img src="{avatar}"></div><div class="account"><a class="account-name" tabindex="0" data-href="viz://@{account}/">{nickname}</a><a class="account-login" tabindex="0" data-href="viz://@{account}/">{account}</a></div>',

	none_notice:'<div class="none-notice"><em>Лента новостей пока не работает, попробуйте поиск.<!--<br>Ничего не найдено.--></em></div>',
	feed_end_notice:'<div class="load-more-end-notice"><em>Конец ленты новостей.</em></div>',
	load_more_end_notice:'<div class="load-more-end-notice"><em>Больше ничего не найдено.</em></div>',
	error_notice:'<div class="error-notice"><em>{error}</em></div>',
	empty_loader_notice:'<div class="loader-notice"><span class="submit-button-ring"></span></div>',
	loader_notice:'<div class="loader-notice" data-account="{account}" data-block="{block}"><span class="submit-button-ring"></span></div>',
	feed_loader_notice:'<div class="loader-notice" data-feed-time="{time}"><span class="submit-button-ring"></span></div>',
	notifications_loader_notice:'<div class="loader-notice" data-notifications-id="{id}"><span class="submit-button-ring"></span></div>',
	awards_loader_notice:'<div class="loader-notice" data-awards-id="{id}"><span class="submit-button-ring"></span></div>',
	hashtags_loader_notice:'<div class="loader-notice" data-hashtags-id="{tag_id}" data-hashtags-feed-id="{id}"><span class="submit-button-ring"></span></div>',

	toggle_menu:'<a tabindex="0" title="{title}" class="toggle-menu">{icon}</a>',
	toggle_menu_title:'Переключить меню',

	account_settings:'<a tabindex="0" data-href="fsp:account_settings" title="Настройки аккаунта">{icon_account_settings}</a>',
	account_settings_caption:'Настройки аккаунта',
	account_settings_empty_account:'Введите аккаунт',
	account_settings_empty_regular_key:'Введите регулярный ключ',
	account_settings_account_not_found:'Аккаунт не найден',
	account_settings_saved:'Данные аккаунта сохранены',
	account_settings_reset:'Данные аккаунта удалены',

	notifications_caption:'Уведомления',
	awards_caption:'Награждения',
	hashtags_caption:'Тэги',
	app_settings_caption:'Настройки приложения',
	app_settings_saved:'Настройки сохранены',
	app_settings_reset:'Настройки сброшены',
	app_settings_main_tab:'Общие',
	app_settings_feed_tab:'Лента новостей',

	view_profile:'<a tabindex="0" data-href="viz://@{account}/" title="Просмотреть профиль">{icon_view_profile}</a>',

	invalid_regular_key:'Предоставленный ключ недействителен',
	not_found_regular_key:'Предоставленный ключ не подходит',

	search:'<a tabindex="0" data-href="fsp:search" title="Поиск">{icon_search}</a>',
	search_caption:'Поиск',
	search_empty_input:'Введите адрес для поиска',

	gateway_error:'Ошибка, попробуйте позже',
	account_not_found:'Пользователь не найден',
	object_not_found:'Объект не найден',
	block_not_found:'Блок не найден, попробуйте позже',
	data_not_found:'Данные не найдены',
	hashtags_not_found:'Тэг не найден',

	view:`
		<div class="view" data-level="{level}" data-path="{path}" data-query="{query}">
			<div class="header space-between"></div>
			{profile}
			{tabs}
			<div class="objects"></div>
		</div>`,
	profile:'<div class="profile">{profile}</div>',
	profile_about:'<div class="about">{about}</div>',
	profile_contacts:'<div class="contacts">{contacts}</div>',
	profile_contacts_github:'<a href="https://github.com/{github}" target="_blank" class="profile-contacts-github" title="GitHub">{icon_github}</a>',
	profile_contacts_telegram:'<a href="tg://resolve?domain={telegram}" target="_blank" class="profile-contacts-telegram" title="Telegram">{icon_telegram}</a>',
	tabs:'<div class="tabs">{tabs}</div>',
	tab:'<a tabindex="0" data-href="{link}" class="{class}">{caption}</a>',

	menu_preset:`
		<div class="session"></div>
		<div class="primary"></div>
		<div class="secondary"></div>`,
	menu_primary:`<div><a tabindex="0" data-href="{link}" class="{class}">{icon}<span>{caption}</span></a></div>`,
	menu_feed:'Лента новостей',
	menu_view_profile:'Профиль',
	menu_notifications:'Уведомления',
	menu_awards:'Награждения',
	menu_app_settings:'Настройки',
	menu_account_settings:'Аккаунт',
	menu_secondary:`Тема: <a class="theme-action" rel="light">день</a>, <a class="theme-action" rel="night">ночь</a>`,

	icon_back:`<i class="icon back"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></i>`,
	icon_gem:`<i class="icon gem"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6.3499998 6.3500002" height="24" width="24" fill="none" stroke="currentColor" stroke-width="0.4" stroke-linecap="round" stroke-linejoin="round"><path d="m 1.019418,1.20416 1.108597,0.36953 m 4.0648556,0.86224 -0.8622424,-1.23177 m -5.17345221,1.23177 3.07943611,3.07944 2.9562585,-3.07944 -1.6013069,0.49271 -1.3549516,2.58673 -1.4781293,-2.58673 -1.60130681,-0.49271 0.86224211,-1.23177 1.2317745,-0.36953 h 1.8476616 l 1.231774,0.36953 -1.1085967,0.36953 H 2.128015 l -0.3695322,1.35495 h 2.8330809 l -0.3695322,-1.35495"/></svg></i>`,
	icon_reply:`<i class="icon reply"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M14 22.5L11.2 19H6a1 1 0 0 1-1-1V7.103a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1h-5.2L14 22.5zm1.839-5.5H21V8.103H7V17H12.161L14 19.298 15.839 17zM2 2h17v2H3v11H1V3a1 1 0 0 1 1-1z"/></svg></i>`,
	icon_share:`<i class="icon share"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M3,12c0,1.654,1.346,3,3,3c0.794,0,1.512-0.315,2.049-0.82l5.991,3.424C14.022,17.734,14,17.864,14,18c0,1.654,1.346,3,3,3 s3-1.346,3-3s-1.346-3-3-3c-0.794,0-1.512,0.315-2.049,0.82L8.96,12.397C8.978,12.266,9,12.136,9,12s-0.022-0.266-0.04-0.397 l5.991-3.423C15.488,8.685,16.206,9,17,9c1.654,0,3-1.346,3-3s-1.346-3-3-3s-3,1.346-3,3c0,0.136,0.022,0.266,0.04,0.397 L8.049,9.82C7.512,9.315,6.794,9,6,9C4.346,9,3,10.346,3,12z"/></svg></i>`,

	icon_copy_link:`<i class="icon copy_link"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8.465,11.293c1.133-1.133,3.109-1.133,4.242,0L13.414,12l1.414-1.414l-0.707-0.707c-0.943-0.944-2.199-1.465-3.535-1.465 S7.994,8.935,7.051,9.879L4.929,12c-1.948,1.949-1.948,5.122,0,7.071c0.975,0.975,2.255,1.462,3.535,1.462 c1.281,0,2.562-0.487,3.536-1.462l0.707-0.707l-1.414-1.414l-0.707,0.707c-1.17,1.167-3.073,1.169-4.243,0 c-1.169-1.17-1.169-3.073,0-4.243L8.465,11.293z"/><path d="M12,4.929l-0.707,0.707l1.414,1.414l0.707-0.707c1.169-1.167,3.072-1.169,4.243,0c1.169,1.17,1.169,3.073,0,4.243 l-2.122,2.121c-1.133,1.133-3.109,1.133-4.242,0L10.586,12l-1.414,1.414l0.707,0.707c0.943,0.944,2.199,1.465,3.535,1.465 s2.592-0.521,3.535-1.465L19.071,12c1.948-1.949,1.948-5.122,0-7.071C17.121,2.979,13.948,2.98,12,4.929z"/></svg></i>`,
	icon_new_object:`<i class="icon new_object"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M3,16c0,1.103,0.897,2,2,2h3.586L12,21.414L15.414,18H19c1.103,0,2-0.897,2-2V4c0-1.103-0.897-2-2-2H5C3.897,2,3,2.897,3,4 V16z M5,4h14v12h-4.414L12,18.586L9.414,16H5V4z"/><path d="M11 14L13 14 13 11 16 11 16 9 13 9 13 6 11 6 11 9 8 9 8 11 11 11z"/></svg></i>`,
	icon_edit_profile:`<i class="icon edit_profile"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M12 14v2a6 6 0 0 0-6 6H4a8 8 0 0 1 8-8zm0-1c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm2.595 7.812a3.51 3.51 0 0 1 0-1.623l-.992-.573 1-1.732.992.573A3.496 3.496 0 0 1 17 14.645V13.5h2v1.145c.532.158 1.012.44 1.405.812l.992-.573 1 1.732-.992.573a3.51 3.51 0 0 1 0 1.622l.992.573-1 1.732-.992-.573a3.496 3.496 0 0 1-1.405.812V22.5h-2v-1.145a3.496 3.496 0 0 1-1.405-.812l-.992.573-1-1.732.992-.572zM18 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg></i>`,
	icon_github:`<i class="icon github"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M12.026,2c-5.509,0-9.974,4.465-9.974,9.974c0,4.406,2.857,8.145,6.821,9.465 c0.499,0.09,0.679-0.217,0.679-0.481c0-0.237-0.008-0.865-0.011-1.696c-2.775,0.602-3.361-1.338-3.361-1.338 c-0.452-1.152-1.107-1.459-1.107-1.459c-0.905-0.619,0.069-0.605,0.069-0.605c1.002,0.07,1.527,1.028,1.527,1.028 c0.89,1.524,2.336,1.084,2.902,0.829c0.091-0.645,0.351-1.085,0.635-1.334c-2.214-0.251-4.542-1.107-4.542-4.93 c0-1.087,0.389-1.979,1.024-2.675c-0.101-0.253-0.446-1.268,0.099-2.64c0,0,0.837-0.269,2.742,1.021 c0.798-0.221,1.649-0.332,2.496-0.336c0.849,0.004,1.701,0.115,2.496,0.336c1.906-1.291,2.742-1.021,2.742-1.021 c0.545,1.372,0.203,2.387,0.099,2.64c0.64,0.696,1.024,1.587,1.024,2.675c0,3.833-2.33,4.675-4.552,4.922 c0.355,0.308,0.675,0.916,0.675,1.846c0,1.334-0.012,2.41-0.012,2.737c0,0.267,0.178,0.577,0.687,0.479 C19.146,20.115,22,16.379,22,11.974C22,6.465,17.535,2,12.026,2z"/></svg></i>`,
	icon_telegram:`<i class="icon telegram"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.665,3.717l-17.73,6.837c-1.21,0.486-1.203,1.161-0.222,1.462l4.552,1.42l10.532-6.645 c0.498-0.303,0.953-0.14,0.579,0.192l-8.533,7.701l0,0l0,0H9.841l0.002,0.001l-0.314,4.692c0.46,0,0.663-0.211,0.921-0.46 l2.211-2.15l4.599,3.397c0.848,0.467,1.457,0.227,1.668-0.785l3.019-14.228C22.256,3.912,21.474,3.351,20.665,3.717z"/></svg></i>`,
	icon_account_settings:`<i class="icon account_settings"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3.783 2.826L12 1l8.217 1.826a1 1 0 0 1 .783.976v9.987a6 6 0 0 1-2.672 4.992L12 23l-6.328-4.219A6 6 0 0 1 3 13.79V3.802a1 1 0 0 1 .783-.976zM5 4.604v9.185a4 4 0 0 0 1.781 3.328L12 20.597l5.219-3.48A4 4 0 0 0 19 13.79V4.604L12 3.05 5 4.604zM12 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm-4.473 5a4.5 4.5 0 0 1 8.946 0H7.527z"/></svg></i>`,
	icon_view_profile:`<i class="icon view_profile"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M4 22a8 8 0 1 1 16 0h-2a6 6 0 1 0-12 0H4zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/></svg></i>`,
	icon_search:`<i class="icon search"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.023,16.977c-0.513-0.488-1.004-0.997-1.367-1.384c-0.372-0.378-0.596-0.653-0.596-0.653l-2.8-1.337 C15.34,12.37,16,10.763,16,9c0-3.859-3.14-7-7-7S2,5.141,2,9s3.14,7,7,7c1.763,0,3.37-0.66,4.603-1.739l1.337,2.8 c0,0,0.275,0.224,0.653,0.596c0.387,0.363,0.896,0.854,1.384,1.367c0.494,0.506,0.988,1.012,1.358,1.392 c0.362,0.388,0.604,0.646,0.604,0.646l2.121-2.121c0,0-0.258-0.242-0.646-0.604C20.035,17.965,19.529,17.471,19.023,16.977z M9,14 c-2.757,0-5-2.243-5-5s2.243-5,5-5s5,2.243,5,5S11.757,14,9,14z"/></svg></i>`,
	icon_feed:`<i class="icon feed"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.875,3H4.125C2.953,3,2,3.897,2,5v14c0,1.103,0.953,2,2.125,2h15.75C21.047,21,22,20.103,22,19V5 C22,3.897,21.047,3,19.875,3z M19.875,19H4.125c-0.057,0-0.096-0.016-0.113-0.016c-0.007,0-0.011,0.002-0.012,0.008L3.988,5.046 C3.995,5.036,4.04,5,4.125,5h15.75C19.954,5.001,19.997,5.028,20,5.008l0.012,13.946C20.005,18.964,19.96,19,19.875,19z"/><path d="M6 7H12V13H6zM13 15L6 15 6 17 13 17 14 17 18 17 18 15 14 15zM14 11H18V13H14zM14 7H18V9H14z"/></svg></i>`,
	icon_settings:`<i class="icon settings"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></i>`,
	icon_menu:`<i class="icon menu"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="23" height="23" stroke="none" fill="currentColor"><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/></svg></i>`,
	icon_close:`<i class="icon close"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="none" fill="currentColor"><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"/></svg></i>`,
	icon_subscribe:`<i class="icon subscribe"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 8L17 8 17 11 14 11 14 13 17 13 17 16 19 16 19 13 22 13 22 11 19 11zM4 8c0 2.28 1.72 4 4 4s4-1.72 4-4-1.72-4-4-4S4 5.72 4 8zM10 8c0 1.178-.822 2-2 2S6 9.178 6 8s.822-2 2-2S10 6.822 10 8zM4 18c0-1.654 1.346-3 3-3h2c1.654 0 3 1.346 3 3v1h2v-1c0-2.757-2.243-5-5-5H7c-2.757 0-5 2.243-5 5v1h2V18z"/></svg></i>`,
	icon_subscribed:`<i class="icon subscribed"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.294 8.292L15.994 12.584 14.702 11.292 13.288 12.706 15.994 15.41 21.706 9.708zM4 8c0 2.28 1.72 4 4 4s4-1.72 4-4-1.72-4-4-4S4 5.72 4 8zM10 8c0 1.178-.822 2-2 2S6 9.178 6 8s.822-2 2-2S10 6.822 10 8zM4 18c0-1.654 1.346-3 3-3h2c1.654 0 3 1.346 3 3v1h2v-1c0-2.757-2.243-5-5-5H7c-2.757 0-5 2.243-5 5v1h2V18z"/></svg></i>`,
	icon_unsubscribe:`<i class="icon unsubscribe"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 11H22V13H14zM8 4C5.72 4 4 5.72 4 8s1.72 4 4 4 4-1.72 4-4S10.28 4 8 4zM8 10c-1.178 0-2-.822-2-2s.822-2 2-2 2 .822 2 2S9.178 10 8 10zM4 18c0-1.654 1.346-3 3-3h2c1.654 0 3 1.346 3 3v1h2v-1c0-2.757-2.243-5-5-5H7c-2.757 0-5 2.243-5 5v1h2V18z"/></svg></i>`,
	icon_ignore:`<i class="icon ignore"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M15.706 15.706L17.999 13.413 20.293 15.707 21.707 14.293 19.414 12 21.707 9.707 20.293 8.293 18 10.586 15.707 8.293 14.293 9.707 16.585 11.999 14.292 14.292zM12 8c0-2.28-1.72-4-4-4S4 5.72 4 8s1.72 4 4 4S12 10.28 12 8zM6 8c0-1.178.822-2 2-2s2 .822 2 2-.822 2-2 2S6 9.178 6 8zM4 18c0-1.654 1.346-3 3-3h2c1.654 0 3 1.346 3 3v1h2v-1c0-2.757-2.243-5-5-5H7c-2.757 0-5 2.243-5 5v1h2V18z"/></svg></i>`,
	icon_ignored:`<i class="icon ignore"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M15.706 15.706L17.999 13.413 20.293 15.707 21.707 14.293 19.414 12 21.707 9.707 20.293 8.293 18 10.586 15.707 8.293 14.293 9.707 16.585 11.999 14.292 14.292zM12 8c0-2.28-1.72-4-4-4S4 5.72 4 8s1.72 4 4 4S12 10.28 12 8zM6 8c0-1.178.822-2 2-2s2 .822 2 2-.822 2-2 2S6 9.178 6 8zM4 18c0-1.654 1.346-3 3-3h2c1.654 0 3 1.346 3 3v1h2v-1c0-2.757-2.243-5-5-5H7c-2.757 0-5 2.243-5 5v1h2V18z"/></svg></i>`,
	icon_notify:`<i class="icon notify"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></i>`,
	icon_notify_clear:`<i class="icon notify-clear"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0"></path><path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path><path d="M18 8a6 6 0 0 0-9.33-5"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg></i>`,
	icon_message_clear:`<i class="icon message-clear"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20,2H4C2.897,2,2,2.897,2,4v12c0,1.103,0.897,2,2,2h3v3.767L13.277,18H20c1.103,0,2-0.897,2-2V4C22,2.897,21.103,2,20,2z M20,16h-7.277L9,18.233V16H4V4h16V16z"/><path d="M9.707 13.707L12 11.414 14.293 13.707 15.707 12.293 13.414 10 15.707 7.707 14.293 6.293 12 8.586 9.707 6.293 8.293 7.707 10.586 10 8.293 12.293z"/></svg></i>`,

	header_back_action:`<a tabindex="0" class="back-action" title="Назад" data-force="{force}">{icon}</a>`,
	header_link:'<div class="link grow"><div class="header-link-wrapper"><input type="text" class="header-link" value="{link}"><div class="header-link-icons">{icons}</div></div></div>',
	header_link_icons:`
		<i tabindex="0" class="icon copy icon-copy-action" title="Копировать адрес"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20,2H10C8.897,2,8,2.897,8,4v4H4c-1.103,0-2,0.897-2,2v10c0,1.103,0.897,2,2,2h10c1.103,0,2-0.897,2-2v-4h4 c1.103,0,2-0.897,2-2V4C22,2.897,21.103,2,20,2z M4,20V10h10l0.002,10H4z M20,14h-4v-4c0-1.103-0.897-2-2-2h-4V4h10V14z"/></svg></i>
		<i tabindex="0" class="icon search icon-search-action" title="Перейти"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.023,16.977c-0.513-0.488-1.004-0.997-1.367-1.384c-0.372-0.378-0.596-0.653-0.596-0.653l-2.8-1.337 C15.34,12.37,16,10.763,16,9c0-3.859-3.14-7-7-7S2,5.141,2,9s3.14,7,7,7c1.763,0,3.37-0.66,4.603-1.739l1.337,2.8 c0,0,0.275,0.224,0.653,0.596c0.387,0.363,0.896,0.854,1.384,1.367c0.494,0.506,0.988,1.012,1.358,1.392 c0.362,0.388,0.604,0.646,0.604,0.646l2.121-2.121c0,0-0.258-0.242-0.646-0.604C20.035,17.965,19.529,17.471,19.023,16.977z M9,14 c-2.757,0-5-2.243-5-5s2.243-5,5-5s5,2.243,5,5S11.757,14,9,14z"/></svg></i>`,
	header_caption:'<div class="caption grow">{caption}</div>',
	icon_link:'<a tabindex="0" class="{action}-action" title="{caption}">{icon}</a>',
	clear_awards_caption:'Очистить историю наград',
	clear_hashtags_caption:'Удалить тэг',
	mark_readed_notifications_caption:'Отметить прочитанными',
	clear_readed_notifications_caption:'Удалить прочитанные уведомления',

	user_actions_open:'<div class="user-actions" data-user="{user}">',
	user_actions_close:'</div>',
	subscribe_link:'<a tabindex="0" class="subscribe-action" title="Подписаться на пользователя">{icon}</a>',
	subscribed_link:'<a tabindex="0" class="subscribed-action" title="Вы подписаны на пользователя">{icon}</a>',
	unsubscribe_link:'<a tabindex="0" class="unsubscribe-action" title="Отписаться от пользователя">{icon}</a>',
	ignore_link:'<a tabindex="0" class="ignore-action" title="Игнорировать пользователя">{icon}</a>',
	ignored_link:'<a tabindex="0" class="ignored-action" title="Вы игнорируете пользователя">{icon}</a>',
	unignore_link:'<a tabindex="0" class="unignore-action" title="Прекратить игнорировать пользователя">{icon}</a>',
	edit_profile_link:'<a tabindex="0" data-href="fsp:edit_profile" title="Изменить профиль">{icon_edit_profile}</a>',
	edit_profile_caption:'Настройка профиля',
	edit_profile_saved:'Профиль сохранен',
	new_object_link:'<a tabindex="0" data-href="fsp:publish" title="Написать">{icon_new_object}</a>',

	publish_caption:'Публикация',
	publish_empty_text:'Введите текст публикации',
	publish_success:'Запись успешно опубликована&hellip;',
	publish_success_link:'Запись успешно опубликована: <a tabindex="0" data-href="viz://@{account}/{block}/">ссылка</a>',

	object_type_text:`
		<div class="object type-text" data-link="{link}">
			<div class="author-view">
				<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
				<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a></div>
			</div>
			<div class="object-column">
				{reply}
				<div class="content-view">{text}</div>
				<div class="date-view" data-timestamp="{timestamp}"><div class="time">&hellip;</div><div class="date">&hellip;</div></div>
				<div class="actions-view">{actions}</div>
			</div>
		</div>`,
	object_type_text_actions:`
	<a tabindex="0" class="reply-action" title="Комментировать">{icon_reply}</a>
	<a tabindex="0" class="share-action" title="Поделиться">{icon_share}</a>
	<a tabindex="0" class="award-action" title="Наградить">{icon_award}</a>
	<a tabindex="0" class="copy-link-action" title="Копировать ссылку">{icon_copy_link}</a>`,
	object_type_text_loading:`<div class="object type-text-loading" data-link="{link}" data-previous="{previous}">{context}</div>`,
	object_type_text_wait_loading:`<div class="object type-text-wait-loading" data-link="{link}"><div class="load-content"><div class="load-placeholder"><span class="loading-ring"></span></div></div></div>`,
	object_type_text_share:`
	<div class="share-view"><a tabindex="0" data-href="{link}">{caption}</a> поделился:{comment}</div>
	<div class="load-content"><div class="load-placeholder"><span class="loading-ring"></span></div></div>`,
	object_type_text_share_comment:` <div class="comment-view">{comment}</div>`,
	object_type_text_preview:`
		<div class="object type-text-preview" data-link="{link}" data-previous="{previous}">
			<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
			<div class="object-column">
				<div class="author-view">
					<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a><a tabindex="0" data-href="{link}" class="short-date-view" data-timestamp="{timestamp}">&hellip;</a></div>
				</div>
				{reply}
				<div class="content-view" data-href="{link}">{text}</div>
				<div class="actions-view">{actions}</div>
			</div>
		</div>`,
	object_type_text_share_preview:`
		<div class="object type-text-preview" data-link="{link}">
			<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
			<div class="object-column">
				<div class="author-view">
					<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a><a tabindex="0" data-href="{link}" class="short-date-view" data-timestamp="{timestamp}">&hellip;</a></div>
				</div>
				<div class="content-view" data-href="{link}">{text}</div>
				<div class="actions-view">{actions}</div>
			</div>
		</div>`,
	object_type_text_reply:`
		<div class="branch">
		<div class="object type-text-preview" data-link="{link}">
			<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
			<div class="object-column">
				<div class="author-view">
					<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a><a tabindex="0" data-href="{link}" class="short-date-view" data-timestamp="{timestamp}">&hellip;</a></div>
				</div>
				<div class="content-view" data-href="{link}">{text}</div>
				<div class="actions-view">{actions}</div>
			</div>
		</div>
		<div class="nested-replies"></div>
		</div>
		`,
	object_type_text_reply_nested_count:'<a tabindex="0" class="load-nested-replies-action"><div class="branch-more">&bull;</div>Количество ответов: <span class="nested-replies-count">{count}</span></a>',
	object_type_text_reply_branch_line:'<div class="branch-line"></div>',
	object_type_text_reply_internal:'<div class="reply-view">В ответ <a tabindex="0" data-href="{link}">{caption}</a></div>',
	object_type_text_reply_external:'<div class="reply-view">Ответ на <a tabindex="0" href="{link}" target="_blank">{caption}</a></div>',

	new_objects:'<a class="new-objects load-new-objects-action" data-items="0">&hellip;</a>',
	feed_new_objects:'Показать новые обновления: {items}',
	feed_no_new_objects:'Новых обновлений нет',

	fast_publish:`
	<div class="fast-publish-wrapper">
		<div class="avatar" alt="Быстрая публикация"><img src="{avatar}"></div>
		<textarea name="text" placeholder="Что нового?"></textarea>
		<div tabindex="0" class="button fast-publish-action" title="Опубликовать">{button}</div>
	</div>`,
};

var menu_status='full';
if(null!=localStorage.getItem(storage_prefix+'menu_status')){
	menu_status=localStorage.getItem(storage_prefix+'menu_status');
}
if('full'!=menu_status){
	$('div.menu').addClass(menu_status);
}
function render_menu(){
	$('div.menu').html(ltmp_arr.menu_preset);
	let primary_menu='';
	if(current_user){
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'viz://',class:(path=='viz://'?'current':''),icon:ltmp_arr.icon_feed,caption:ltmp_arr.menu_feed});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'fsp:notifications',class:(path=='fsp:notifications'?'current':''),icon:ltmp_arr.icon_notify,caption:ltmp_arr.menu_notifications});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'fsp:awards',class:(path=='fsp:awards'?'current':''),icon:ltmp_arr.icon_gem,caption:ltmp_arr.menu_awards});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'viz://@'+current_user+'/',class:(path=='viz://@'+current_user+'/'?'current':''),icon:ltmp_arr.icon_view_profile,caption:ltmp_arr.menu_view_profile});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'fsp:app_settings',class:(path=='fsp:app_settings'?'current':''),icon:ltmp_arr.icon_settings,caption:ltmp_arr.menu_app_settings});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'fsp:account_settings',class:(path=='fsp:account_settings'?'current':''),icon:ltmp_arr.icon_account_settings,caption:ltmp_arr.menu_account_settings});
	}
	$('div.menu .primary').html(primary_menu);
	let secondary_menu=ltmp_arr.menu_secondary;
	$('div.menu .secondary').html(secondary_menu);
}

function render_session(){
	let toggle_menu=ltmp(ltmp_arr.toggle_menu,{title:ltmp_arr.toggle_menu_title,icon:ltmp_arr.icon_close});
	if(current_user){
		get_user(current_user,false,function(err,result){
			if(!err){
				profile=JSON.parse(result.profile);
				$('div.menu .session').html(toggle_menu+ltmp(ltmp_arr.menu_session_account,{'account':result.account,'nickname':profile.nickname,'avatar':profile.avatar}));
			}
			else{
				$('div.menu .session').html(toggle_menu+ltmp(ltmp_arr.menu_session_empty,{caption:ltmp_arr.menu_session_error}));
			}
		});
	}
	else{
		$('div.menu .session').html(ltmp(ltmp_arr.menu_session_empty,{caption:ltmp_arr.menu_session_login}));
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

			let last_vote_time=Date.parse(response.last_vote_time);
			let delta_time=parseInt((new Date().getTime() - last_vote_time+(new Date().getTimezoneOffset()*60000))/1000);
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

function fast_publish(view){
	let text=view.find('.fast-publish-wrapper textarea[name="text"]').val();
	text=text.trim();
	if(text){
		viz.api.getAccount(current_user,app_protocol,function(err,response){
			if(err){
				console.log(err);
				add_notify(false,'',ltmp_arr.gateway_error);
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

				new_object.d=data;
				let object_json=JSON.stringify(new_object);

				viz.broadcast.custom(users[current_user].regular_key,[],[current_user],app_protocol,object_json,function(err,result){
					if(result){
						console.log(result);
						setTimeout(function(){
							get_user(current_user,true,function(err,result){
								if(!err){
									if(result.start!=previous){
										get_object(current_user,result.start,function(err,object_result){
											if(!err){
												view_path('viz://@'+current_user+'/'+result.start+'/',{},true,false);
											}
										});
									}
								}
							});
						},3000);
					}
					else{
						console.log(err);
						add_notify(false,'',ltmp_arr.gateway_error);
						return;
					}
				});
			}
		});
	}
	else{
		view.find('.fast-publish-wrapper textarea[name="text"]')[0].focus();
		view.find('.fast-publish-wrapper .button').removeClass('disabled');
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

function ignore(el){
	let actions=$(el).closest('.user-actions');
	let check_user=actions.data('user');
	let render='';

	let t,q,req;
	t=db.transaction(['feed'],'readwrite');
	q=t.objectStore('feed');
	req=q.index('object').openCursor(IDBKeyRange.lowerBound([check_user,0]),'next');
	req.onsuccess=function(event){
		console.log(event);
		let cur=event.target.result;
		if(cur){
			cur.delete();
			cur.continue();
		}
		else{
			//update user status
			let update_t=db.transaction(['users'],'readwrite');
			let update_q=update_t.objectStore('users');
			let update_req=update_q.index('account').openCursor(IDBKeyRange.only(check_user),'next');
			update_req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					let item=cur.value;
					item.status=2;
					cur.update(item);
					cur.continue();
				}
				else{
					render+=ltmp(ltmp_arr.ignored_link,{icon:ltmp_arr.icon_ignored});
					render+=ltmp(ltmp_arr.unignore_link,{icon:ltmp_arr.icon_unsubscribe});
					actions.html(render);
				}
			};
		}
	};
}

function unignore(el){
	let actions=$(el).closest('.user-actions');
	let check_user=actions.data('user');
	let render='';

	//update user status
	let update_t=db.transaction(['users'],'readwrite');
	let update_q=update_t.objectStore('users');
	let update_req=update_q.index('account').openCursor(IDBKeyRange.only(check_user),'next');
	update_req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			let item=cur.value;
			item.status=0;
			cur.update(item);
			cur.continue();
		}
		else{
			render+=ltmp(ltmp_arr.subscribe_link,{icon:ltmp_arr.icon_subscribe});
			render+=ltmp(ltmp_arr.ignore_link,{icon:ltmp_arr.icon_ignore});
			actions.html(render);
		}
	};
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
			$('.view[data-path="fsp:awards"] .objects').html(ltmp_arr.load_more_end_notice);
		}
	};
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
						header+=ltmp(ltmp_arr.header_caption,{caption:'#'+hashtag});
						el.find('.header').html(header);
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
			$('.view[data-path="fsp:notifications"] .objects .notify-item').addClass('readed');
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
			$('.view[data-path="fsp:notifications"] .objects').html(ltmp_arr.load_more_end_notice);
		}
	};
}

function subscribe(el){
	let actions=$(el).closest('.user-actions');
	let check_user=actions.data('user');
	let render='';

	users_table_diff.push([check_user,true]);
	increase_db_version(function(){
		if(!db.objectStoreNames.contains('objects_'+check_user)){
			render+=ltmp(ltmp_arr.subscribe_link,{icon:ltmp_arr.icon_subscribe});
			render+=ltmp(ltmp_arr.ignore_link,{icon:ltmp_arr.icon_ignore});
		}
		else{
			render+=ltmp(ltmp_arr.subscribed_link,{icon:ltmp_arr.icon_subscribed});
			render+=ltmp(ltmp_arr.unsubscribe_link,{icon:ltmp_arr.icon_unsubscribe});

			//move from objects to user objects
			let t,q,req;
			t=db.transaction(['objects'],'readwrite');
			q=t.objectStore('objects');
			req=q.index('account').openCursor(IDBKeyRange.only(check_user),'next');

			let result=[];
			let find=false;
			req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					result.push(cur.value);
					update_req=cur.delete();
					cur.continue();
				}
				else{
					for(let i in result){
						let item_i=result[i];
						let add_t,add_q;
						add_t=db.transaction(['objects_'+check_user],'readwrite');
						add_q=add_t.objectStore('objects_'+check_user);
						add_q.add(item_i);
						if(!is_safari){
							if(!is_firefox){
								add_t.commit();
							}
						}
					}
					feed_load(check_user,false,function(err,result){console.log('feed load by subscribe',err,result);});
				}
			};

			//update user status
			let update_t=db.transaction(['users'],'readwrite');
			let update_q=update_t.objectStore('users');
			let update_req=update_q.index('account').openCursor(IDBKeyRange.only(check_user),'next');
			update_req.onsuccess=function(event){
				let cur=event.target.result;
				if(cur){
					let item=cur.value;
					item.status=1;
					cur.update(item);
					cur.continue();
				}
			};
		}
		actions.html(render);
	});
}

function unsubscribe(el){
	let actions=$(el).closest('.user-actions');
	let check_user=actions.data('user');
	let render='';

	//move from objects to user objects
	let t,q,req;
	t=db.transaction(['objects_'+check_user],'readwrite');
	q=t.objectStore('objects_'+check_user);
	req=q.index('block').openCursor(null,'next');

	let result=[];
	let find=false;
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			result.push(cur.value);
			update_req=cur.delete();
			cur.continue();
		}
		else{
			for(let i in result){
				let item_i=result[i];
				let add_t,add_q;
				add_t=db.transaction(['objects'],'readwrite');
				add_q=add_t.objectStore('objects');
				add_q.add(item_i);
				if(!is_safari){
					if(!is_firefox){
						add_t.commit();
					}
				}
			}
			users_table_diff.push([check_user,false]);
			setTimeout(function(){
				increase_db_version(function(){
					if(!db.objectStoreNames.contains('objects_'+check_user)){
						render+=ltmp(ltmp_arr.subscribe_link,{icon:ltmp_arr.icon_subscribe});
						render+=ltmp(ltmp_arr.ignore_link,{icon:ltmp_arr.icon_ignore});
					}
					else{
						render+=ltmp(ltmp_arr.subscribed_link,{icon:ltmp_arr.icon_subscribed});
						render+=ltmp(ltmp_arr.unsubscribe_link,{icon:ltmp_arr.icon_unsubscribe});
					}
					actions.html(render);
				});
			},100);
		}
	};

	//update user status
	let update_t=db.transaction(['users'],'readwrite');
	let update_q=update_t.objectStore('users');
	let update_req=update_q.index('account').openCursor(IDBKeyRange.only(check_user),'next');
	update_req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			let item=cur.value;
			item.status=0;
			cur.update(item);
			cur.continue();
		}
	};
}

function load_new_objects(el){
	let indicator=$(el);
	let objects=indicator.closest('.objects');
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
			for(let i in new_objects){
				let object=new_objects[i];
				let object_view=render_object(object.account,object.block,'feed',check_level);
				indicator.before(object_view);
			}
			setTimeout(function(){
				$(window)[0].scrollTo({behavior:'smooth',top:(indicator.offset().top>400?indicator.offset().top-100:indicator.offset().top)});
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
function add_notify(store,title,text,link){
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
			let notify=$(target).parent();
			let wrapper=notify.parent();
			wrapper.removeClass('show');
			setTimeout(function(){wrapper.remove();},1000);
		}
		else{
			console.log('check back-force data',$(target).closest('.view').data('back-force'));
			if($(target).closest('.view').data('back-force')){
				back_to=path;
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

		let find=false;
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
				if(notify_link){
					view_path(notify_link,{back:path},true,false);
				}
			}
		};

	}
	if($(target).hasClass('notify')){
		let wrapper=$(target).parent();
		wrapper.removeClass('show');
		setTimeout(function(){wrapper.remove();},1000);
	}
	if($(target).hasClass('theme-action')){
		$('body').removeClass('light');
		$('body').removeClass('night');
		theme=$(target).attr('rel');
		$('body').addClass(theme);
		localStorage.setItem(storage_prefix+'theme',theme)
	}
	if($(target).hasClass('toggle-menu')){
		if(is_mobile()){
			clearTimeout(mobile_hide_menu_timer);
			$('div.menu').removeClass('hidden');
			$('div.menu').removeClass('short');
			if($('div.menu').hasClass('show')){
				$('body').removeClass('noscroll');
				$('div.menu').removeClass('show');
			}
			else{
				$('div.menu').addClass('show');
				$('body').addClass('noscroll');
			}
		}
		else{
			if(is_full()){
				if($('div.menu').hasClass('hidden')){
					$('div.menu').removeClass('hidden');
					menu_status='full';
					localStorage.setItem(storage_prefix+'menu_status',menu_status);
				}
				else{
					if($('div.menu').hasClass('short')){
						$('div.menu').addClass('hidden');
						$('div.menu').removeClass('short');
						menu_status='hidden';
						localStorage.setItem(storage_prefix+'menu_status',menu_status);
					}
					else{
						$('div.menu').addClass('short');
						menu_status='short';
						localStorage.setItem(storage_prefix+'menu_status',menu_status);
					}
				}
			}
			else{
				if($('div.menu').hasClass('short')){
					$('div.menu').addClass('hidden');
					$('div.menu').removeClass('short');
					menu_status='hidden';
					localStorage.setItem(storage_prefix+'menu_status',menu_status);
				}
				else{
					$('div.menu').removeClass('hidden');
					$('div.menu').addClass('short');
					menu_status='short';
					localStorage.setItem(storage_prefix+'menu_status',menu_status);
				}
			}
		}
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
	if($(target).hasClass('subscribe-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			subscribe(target);
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
			load_new_objects(target);
		}
	}
	if($(target).hasClass('load-nested-replies-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			load_nested_replies(target);
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
	/*
	if($(target).hasClass('header-link')){
		let text=$(target).val();
		$('.text-copy').val(text);
		$('.text-copy')[0].select();
		$('.text-copy')[0].setSelectionRange(0,99999);
		document.execCommand("copy");
	}
	*/
	if($(target).hasClass('reply-action')){
		let link=$(target).closest('.object').data('link');
		view_path('fsp:publish/reply/?'+link,{},true,false);
	}
	if($(target).hasClass('share-action')){
		let link=$(target).closest('.object').data('link');
		view_path('fsp:publish/share/?'+link,{},true,false);
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
	}
	if($(target).hasClass('fast-publish-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			let view=$(target).closest('.view');
			fast_publish(view);
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
			save_account_settings(view,viz_account,viz_regular_key,default_energy_step);
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
					query=$('.view[data-level="'+level+'"]').data('query');
				}
			}
		}
		//console.log('—— back action —— ','path: '+path);
		//trigger view_path with update prop
		view_path(path,{},true,need_update);
	}
	/*
	//button to scroll top, need to show it for long views on scrolling more that 100hv?
	if($(target).hasClass('go-top')){
		$(window)[0].scrollTo({behavior:'smooth',top:0});
	}
	*/
}

function update_user_profile(account,callback){
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
				profile_obj.avatar='default.png';
			}

			let obj={
				account:account,
				start:response.custom_sequence_block_num,
				update:parseInt(new Date().getTime()/1000),
				profile:JSON.stringify(profile_obj),
				status:0,
			};

			if(db.objectStoreNames.contains('objects_'+account)){
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
					result.status=obj.status;
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
					if(typeof object_result.data.d.text !== 'undefined'){
						if(-1!=object_result.data.d.text.indexOf('@'+current_user)){//mention
							let link='viz://@'+object_result.account+'/'+object_result.block+'/';
							let reply_text=object_result.data.d.text;
							add_notify(true,ltmp(ltmp_arr.notify_arr.new_mention,{account:object_result.account}),reply_text,link);
							feed=true;
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
			}
		}
	});
}

function feed_load(account,limit,callback){
	limit=limit===false?settings.activity_deep:limit;
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	let result=[];

	let end_offset=0;
	let offset=0;

	let t=db.transaction(['objects_'+account],'readonly');
	let q=t.objectStore('objects_'+account);
	let req=q.index('block').openCursor(null,'prev');
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			end_offset=cur.value.block;
		}
		get_user(account,true,function(err,user_result){
			if(err){
				callback(err,0);
			}
			let start_offset=user_result.start;
			offset=start_offset;
			if(offset>end_offset){
				feed_load_more(result,account,offset,end_offset,limit,callback);
			}
			else{
				callback(false,false);
			}
		});
	};
}

function feed_add(account,block,time,callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
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
							item.timestamp=Date.parse(response[item_i].timestamp) / 1000 | 0;
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
				if(typeof item.d.r != 'undefined'){
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
				let obj={
					account:account,
					block:block,
					data:item,
					is_reply:0,
					is_share:0,
				};
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
				obj.time=new Date().getTime() / 1000 | 0;//unixtime
				console.log(obj);

				let t,q,req;
				if(!db.objectStoreNames.contains('objects_'+account)){
					t=db.transaction(['objects'],'readwrite');
					q=t.objectStore('objects');
					req=q.index('object').openCursor(IDBKeyRange.only([account,block]),'next');
				}
				else{
					t=db.transaction(['objects_'+account],'readwrite');
					q=t.objectStore('objects_'+account);
					req=q.index('block').openCursor(IDBKeyRange.only(block),'next');
				}

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
								let hashtags_pattern = /#(.[^@#!.,?\r\n\t ]*)/g;
								let hashtags_links=obj.data.d.text.match(hashtags_pattern);
								if(null!=hashtags_links){
									hashtags_links=hashtags_links.map(function(value){
										return value.toLowerCase();
									});
									hashtags_links=array_unique(hashtags_links);
									let add_hashtag_object=function(hashtag_id,account,block){
										//add object to hashtag feed
										let add_t=db.transaction(['hashtags_feed'],'readwrite');
										let add_q=add_t.objectStore('hashtags_feed');
										add_q.add({tag:hashtag_id,account:account,block:block});
										if(!is_safari){
											if(!is_firefox){
												add_t.commit();
											}
										}
										add_t.oncomplete=function(e){
											//update hashtag counter
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
											};
										};
									};
									for(let i in hashtags_links){
										let hashtag=hashtags_links[i].substr(1);
										idb_get_id('hashtags','tag',hashtag,function(hashtag_id){
											if(false===hashtag_id){
												let hashtag_info={'tag':hashtag,'count':0,'status':0};
												let hashtag_add_t=db.transaction(['hashtags'],'readwrite');
												let hashtag_add_q=hashtag_add_t.objectStore('hashtags');
												hashtag_add_q.add(hashtag_info);
												if(!is_safari){
													if(!is_firefox){
														hashtag_add_t.commit();
													}
												}
												hashtag_add_t.oncomplete=function(e){
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

							let add_t,add_q;
							if(!db.objectStoreNames.contains('objects_'+account)){
								add_t=db.transaction(['objects'],'readwrite');
								add_q=add_t.objectStore('objects');
							}
							else{
								add_t=db.transaction(['objects_'+account],'readwrite');
								add_q=add_t.objectStore('objects_'+account);
							}
							add_q.add(obj);
							if(!is_safari){
								if(!is_firefox){
									add_t.commit();
								}
							}
							//if(settings.feed_load_by_surf){}
							/*
							if(db.objectStoreNames.contains('objects_'+account)){
								if(account!=current_user){
									let feed=false;
									if(settings.feed_subscribe_text){
										if(!reply){
											if(!share){
												feed=true;
											}
										}
									}
									if(settings.feed_subscribe_shares){
										if(share){
											feed=true;
										}
									}
									if(settings.feed_subscribe_replies){
										if(reply){
											feed=true;
										}
									}
									else{
										if(reply){
											feed=false;
											if(parent_account==current_user){
												feed=true;
											}
										}
									}
									if(settings.feed_subscribe_mentions){
										if(typeof obj.data.d.text !== 'undefined'){
											if(-1!=obj.data.d.text.indexOf('@'+current_user)){//mention
												feed=true;
											}
										}
									}
									if(feed){
										feed_add(account,block);
									}
								}
							}
							*/
							add_t.oncomplete=function(e){
								if(reply){
									let reply_add_t=db.transaction(['replies'],'readwrite');
									let reply_add_q=reply_add_t.objectStore('replies');
									let reply_obj={
										account:account,
										block:block,
										parent_account:parent_account,
										parent_block:parent_block,
										time:new Date().getTime() / 1000 | 0,
										cache:true,
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

	//check individual table
	if(!db.objectStoreNames.contains('objects_'+account)){
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
	else{
		let t=db.transaction(['objects_'+account],'readonly');
		let q=t.objectStore('objects_'+account);
		let req=q.index('block').openCursor(IDBKeyRange.only(block),'next');
		req.onsuccess=function(event){
			let cur=event.target.result;
			if(cur){
				result=cur.value;
				find=true;
				cur.continue();
			}
			else{
				if(find){
					console.log('find in user objects cache: '+account+' '+block);
					callback(false,result);
				}
				else{
					console.log('need parse user object: '+account+' '+block);
					parse_object(account,block,callback);
				}
			}
		};
	}
}

function clear_objects_cache(callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
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
			result.push([cur.value.account,cur.value.block]);
			cur.delete();
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
				cur.continue();
			}
		}
		else{
			setTimeout(function(){callback()},100);
		}
	};
}

function update_feed_result(result){
	let view=$('.view[data-level="0"]');
	let new_objects=view.find('.objects .new-objects');
	let items=new_objects.data('items');
	if(false!==result){
		items+=result.items;
		new_objects.data('items',items);
	}
	if(0==items){
		new_objects.removeClass('show');
	}
	else{
		new_objects.html(ltmp(ltmp_arr.feed_new_objects,{items:new_objects.data('items')}));
		new_objects.addClass('show');
	}
}

function update_feed_subscribes(callback){
	if(typeof callback==='undefined'){
		callback=function(){};
	}
	let t=db.transaction(['users'],'readwrite');
	let q=t.objectStore('users');
	let req=q.index('status').openCursor(IDBKeyRange.only(1),'next');
	let list=[];
	let delay=0;
	let delay_step=500;
	let check_activity=(new Date().getTime() /1000 | 0) - settings.activity_period*60;
	req.onsuccess=function(event){
		let cur=event.target.result;
		if(cur){
			let item=cur.value;
			if(typeof item.activity === 'undefined'){
				item.activity=0;
			}
			if(item.activity<check_activity){
				list.push(item.account);
				item.activity=new Date().getTime() /1000 | 0;
				cur.update(item);
			}
			cur.continue();
		}
		else{
			for(let i in list){
				let account=list[i];
				if(account!=current_user){
					setTimeout(function(){
						feed_load(account,false,function(err,result){
							if(!err){
								update_feed_result(result);
							}
						});
					},delay);
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
	//if(settings.feed_load_by_timer){}
	console.log('update feed trigger');
	update_feed_subscribes(function(){
		update_feed_timer=setTimeout(function(){update_feed()},60000);//1min
	});
}

function clear_users_objects(){
	if(0<settings.activity_size){
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
						let user_t=db.transaction(['objects_'+account],'readwrite');
						let user_q=user_t.objectStore('objects_'+account);
						let user_req=user_q.index('block').openCursor(null,'prev');
						let offset=false;
						let count=0;
						user_req.onsuccess=function(event){
							let cur=event.target.result;
							if(cur){
								if(!offset){
									offset=true;
									cur.advance(settings.activity_size-1);
								}
								else{
									cur.delete();
									count++;
									cur.continue();
								}
							}
							else{
								if(0<count){
									console.log('clear_users_objects',account,count);
								}
							}
						};
					}
				}
			}
		};
	}
}

function clear_feed(){
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
		}
	};
}

var clear_cache_timer=0;
function clear_cache(){
	console.log('clear cache trigger');
	clearTimeout(clear_cache_timer);
	clear_objects_cache(function(){
		clear_users_cache(function(){
			clear_cache_timer=setTimeout(function(){clear_cache()},300000);//5min
		});
	});
}

function get_user(account,forced_update,callback){
	forced_update=typeof forced_update==='undefined'?false:forced_update;

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

	let telegram=view.find('input[name="telegram"]').val();
	telegram=telegram.trim();

	let github=view.find('input[name="github"]').val();
	github=github.trim();

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

function view_publish(view,path_parts,query,title){
	console.log('view_publish',path_parts,query);
	document.title=ltmp_arr.publish_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:''});
	header+=ltmp(ltmp_arr.header_caption,{caption:ltmp_arr.publish_caption});
	view.find('.header').html(header);

	view.find('.button').removeClass('disabled');
	view.find('.submit-button-ring').removeClass('show');
	view.find('.error').html('');
	view.find('.success').html('');

	view.find('input').val('');
	view.find('textarea').val('');

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

	$('.loader').css('display','none');
	view.css('display','block');
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
	}
	let tabs='';
	tabs+=ltmp(ltmp_arr.tab,{link:'fsp:notifications/all',class:('all'==current_tab?'current':''),caption:ltmp_arr.notifications_all_tab});
	tabs+=ltmp(ltmp_arr.tab,{link:'fsp:notifications/new',class:('new'==current_tab?'current':''),caption:ltmp_arr.notifications_new_tab});
	tabs+=ltmp(ltmp_arr.tab,{link:'fsp:notifications/readed',class:('readed'==current_tab?'current':''),caption:ltmp_arr.notifications_readed_tab});
	view.find('.tabs').html(tabs);

	view.find('.content-view').css('display','none');
	view.find('.content-view .objects').html('');
	view.find('.content-view[data-tab="'+current_tab+'"]').css('display','block');

	let tab=view.find('.content-view[data-tab="'+current_tab+'"]');
	if('all'==current_tab){
		header+=ltmp(ltmp_arr.icon_link,{action:'mark-readed-notifications',caption:ltmp_arr.mark_readed_notifications_caption,icon:ltmp_arr.icon_notify_clear});
	}
	if('new'==current_tab){
		header+=ltmp(ltmp_arr.icon_link,{action:'mark-readed-notifications',caption:ltmp_arr.mark_readed_notifications_caption,icon:ltmp_arr.icon_notify_clear});
	}
	if('readed'==current_tab){
		header+=ltmp(ltmp_arr.icon_link,{action:'clear-readed-notifications',caption:ltmp_arr.clear_readed_notifications_caption,icon:ltmp_arr.icon_message_clear});
	}

	view.find('.header').html(header);
	tab.find('.objects').html(ltmp(ltmp_arr.notifications_loader_notice,{id:0}));

	$('.loader').css('display','none');
	view.css('display','block');
	check_load_more();
}

function view_hashtags(view,path_parts,query,title){
	view.data('hashtag','');
	view.data('hashtag-id',0);
	document.title=ltmp_arr.hashtags_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:''});
	if((typeof path_parts[1] != 'undefined')&&(''!=path_parts[1])){
		let hashtag=decodeURIComponent(path_parts[1]);
		idb_get_id('hashtags','tag',hashtag,function(hashtag_id){
			view.data('hashtag',hashtag);
			view.data('hashtag-id',hashtag_id);
			if(false===hashtag_id){
				view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.hashtags_not_found}));
				header+=ltmp(ltmp_arr.header_caption,{caption:ltmp_arr.hashtags_caption});
			}
			else{
				header+=ltmp(ltmp_arr.header_caption,{caption:'#'+hashtag});
				header+=ltmp(ltmp_arr.icon_link,{action:'clear-hashtags',caption:ltmp_arr.clear_hashtags_caption,icon:ltmp_arr.icon_message_clear});
				view.find('.objects').html(ltmp(ltmp_arr.hashtags_loader_notice,{tag_id:hashtag_id,id:0}));
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
		view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.hashtags_not_found}));
		$('.loader').css('display','none');
		view.css('display','block');
		check_load_more();
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
	let tabs='';
	tabs+=ltmp(ltmp_arr.tab,{link:'fsp:app_settings/main',class:('main'==current_tab?'current':''),caption:ltmp_arr.app_settings_main_tab});
	tabs+=ltmp(ltmp_arr.tab,{link:'fsp:app_settings/feed',class:('feed'==current_tab?'current':''),caption:ltmp_arr.app_settings_feed_tab});
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

	$('.loader').css('display','none');
	view.css('display','block');
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
		view.find('input[name=viz_regular_key]').val(users[current_user].regular_key);
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
	if(is_mobile()){
		clearTimeout(mobile_hide_menu_timer);
		mobile_hide_menu_timer=setTimeout(function(){
			$('body').removeClass('noscroll');
			$('div.menu').removeClass('show');
		},500);
	}
	//save to history browser
	save_state=typeof save_state==='undefined'?false:save_state;
	//update current level? not work now
	update=typeof update==='undefined'?false:update;
	path_parts=[];
	var title='Free Speech Project';
	let back_to='';

	if(typeof state.back !== 'undefined'){
		back_to=state.back;
	}
	if(typeof state.path == 'undefined'){
		//check query state
		if('/'!=location.substr(-1)){
			location+='/';
		}
		if(-1!=location.indexOf('?')){
			query=location.substring(location.indexOf('?')+1);
			location=location.substring(0,location.indexOf('?'));
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

	if(''==path_parts[0]){
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
			get_user(current_user,false,function(err,result){
				if(!err){
					let profile=JSON.parse(result.profile);
					view.find('.objects').before(ltmp(ltmp_arr.fast_publish,{avatar:profile.avatar,button:ltmp_arr.icon_new_object}));
				}
			});
		}
		let clear=view.data('clear');
		if(clear){
			update=true;
			view.data('clear',false);
		}
		if(update){
			view.find('.objects').html(ltmp(ltmp_arr.new_objects+ltmp_arr.feed_loader_notice,{time:0}));
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
		if(0==path_parts[0].indexOf('fsp:')){
			$('.loader').css('display','block');
			$('.view').css('display','none');
			let view=$('.view[data-path="'+path_parts[0]+'"]');
			level++;
			//view.data('level',level);
			//execute view_ function if exist to prepare page (load vars to input)
			let current_view=path_parts[0].substring(('fsp:').length);
			if(typeof window['view_'+current_view] === 'function'){
				setTimeout(window['view_'+current_view],1,view,path_parts,query,title);
			}
			else{
				$('.loader').css('display','none');
				view.css('display','block');
			}
		}
		else{
			if('@'==path_parts[0].substring(0,1)){
				check_account=path_parts[0].substring(1);
				check_account=check_account.toLowerCase();
				check_account=check_account.trim();
			}
			if(''==path_parts[1]){
				//not object
				//check account link
				if('@'==path_parts[0].substring(0,1)){
					//preload account for view with +1 level
					get_user(check_account,false,function(err,result){
						if(err){
							console.log(err);
							$('.loader').css('display','block');
							$('.view').css('display','none');
							if(!update){
								level++;
								let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query,tabs:'',profile:''});
								$('.content').append(new_view);
							}
							let view=$('.view[data-level="'+level+'"]');
							if(update){
								let header='';
								header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:back_to});
								header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp_arr.header_link_icons});
								view.find('.header').html(header);
							}
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

							if(typeof profile != 'undefined'){
								if(typeof profile.about != 'undefined'){
									profile_view+=ltmp(ltmp_arr.profile_about,{about:profile.about});
									profile_found=true;
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
							if(new_level){
								level++;
								let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query,tabs:'',profile:profile_section});
								$('.content').append(new_view);
								update=true;
							}
							let view=$('.view[data-level="'+level+'"]');
							if(update){
								let header='';
								header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:back_to});
								header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp_arr.header_link_icons});
								if(check_account==current_user){
									header+=ltmp(ltmp_arr.edit_profile_link,{icon_edit_profile:ltmp_arr.icon_edit_profile});
									header+=ltmp(ltmp_arr.new_object_link,{icon_new_object:ltmp_arr.icon_new_object});
								}
								else{
									header+=ltmp(ltmp_arr.user_actions_open,{user:check_account});
									if(!db.objectStoreNames.contains('objects_'+check_account)){
										if(2==result.status){
											header+=ltmp(ltmp_arr.ignored_link,{icon:ltmp_arr.icon_ignored});
											header+=ltmp(ltmp_arr.unignore_link,{icon:ltmp_arr.icon_unsubscribe});
										}
										else{
											header+=ltmp(ltmp_arr.subscribe_link,{icon:ltmp_arr.icon_subscribe});
											header+=ltmp(ltmp_arr.ignore_link,{icon:ltmp_arr.icon_ignore});
										}
									}
									else{
										header+=ltmp(ltmp_arr.subscribed_link,{icon:ltmp_arr.icon_subscribed});
										header+=ltmp(ltmp_arr.unsubscribe_link,{icon:ltmp_arr.icon_unsubscribe});
									}
									header+=ltmp_arr.user_actions_close;
								}
								view.find('.header').html(header);
							}
							if(update){
								view.find('.objects').html(ltmp(ltmp_arr.loader_notice,{account:result.account,block:0}));
							}
							$('.loader').css('display','none');
							view.css('display','block');
							if(!update){
								$(window)[0].scrollTo({top:(typeof view.data('scroll')!=='undefined'?view.data('scroll'):0)});
							}
							check_load_more();
						}
					});
				}
			}
			else{
				//only block in path parts
				if(''==path_parts[2]){
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
								$('.loader').css('display','block');
								$('.view').css('display','none');
								if(!update){
									level++;
									let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query,tabs:'',profile:''});
									$('.content').append(new_view);
								}
								let view=$('.view[data-level="'+level+'"]');
								if(update){
									let header='';
									header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back,force:back_to});
									header+=ltmp(ltmp_arr.header_link,{link:location,icons:ltmp_arr.header_link_icons});
									view.find('.header').html(header);
								}
								view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.gateway_error}));

								$('.loader').css('display','none');
								view.css('display','block');
							}
							else{
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
											let object_view=render_object(user_result,object_result);
											let link='viz://@'+user_result.account+'/'+object_result.block+'/';

											view.find('.objects').html(object_view);
											let timestamp=view.find('.object[data-link="'+link+'"] .date-view').data('timestamp');
											view.find('.object[data-link="'+link+'"] .date-view .date').html(show_date(timestamp*1000-(new Date().getTimezoneOffset()*60000),false,false,false));
											view.find('.object[data-link="'+link+'"] .date-view .time').html(show_time(timestamp*1000-(new Date().getTimezoneOffset()*60000)));

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
				else{
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
			}
		}
	}
	/*
	if(''!=location){
		if($('.view[data-path="'+location+'"]').length>0){
			$('.view[data-path="'+location+'"]')[0].scrollIntoView({behavior:'smooth',block:'start'});
		}
	}
	else{
		$(window)[0].scrollTo({behavior:'smooth',top:0});
	}*/
}

function show_time(str,add_seconds){
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
			str_time=Date.parse(str);
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
			str_time=Date.parse(str);
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
	let summary_links=[];

	let hashtags_pattern = /#(.[^@#!.,?\r\n\t ]*)/g;
	let hashtags_links=text.match(hashtags_pattern);
	if(null!=hashtags_links){
		summary_links=summary_links.concat(hashtags_links);
	}

	let account_pattern = /@[a-z0-9\-\.]*/g;
	let account_links=text.match(account_pattern);
	if(null!=account_links){
		summary_links=summary_links.concat(account_links);
	}

	let viz_protocol_pattern = /viz\:\/\/[@a-z0-9\-\.\/]*/g;
	let viz_protocol_links=text.match(viz_protocol_pattern);
	if(null!=viz_protocol_links){
		summary_links=summary_links.concat(viz_protocol_links);
	}

	//let http_protocol_pattern = /(http|https)\:\/\/[@A-Za-z0-9\-_\.\/#]*/g;//first version
	//add \u0400-\u04FF for cyrillic https://jrgraphix.net/r/Unicode/0400-04FF
	let http_protocol_pattern = /((?:https?|ftp):\/\/[\u0400-\u04FF\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\u0400-\u04FF\-A-Z0-9+\u0026@#\/%=~()_|])/gi;
	let http_protocol_links=text.match(http_protocol_pattern);
	if(null!=http_protocol_links){
		summary_links=summary_links.concat(http_protocol_links);
	}

	summary_links=array_unique(summary_links);
	summary_links.sort(sort_by_length_desc);

	for(let i in summary_links){
		let link_num=i;
		let change_text=summary_links[link_num];
		text=fast_str_replace(change_text,'<REPLACE_LINK_'+link_num+'>',text);
	}

	for(let i in summary_links){
		let link_num=i;
		let change_text=summary_links[link_num];
		let new_text=change_text;
		if('#'==change_text.substring(0,1)){
			new_text='<a tabindex="0" data-href="fsp:hashtags/'+(change_text.substring(1).toLowerCase())+'/">'+change_text+'</a>';
		}
		else
		if('@'==change_text.substring(0,1)){
			new_text='<a tabindex="0" data-href="viz://'+change_text+'/">'+change_text+'</a>';
		}
		else
		if('viz://'==change_text.substring(0,6)){
			new_text='<a tabindex="0" data-href="'+change_text+'">'+change_text.substring(6)+'</a>';
		}
		else{
			new_text='<a href="'+change_text+'" target="_blank">'+change_text+'</a>';
		}
		text=fast_str_replace('<REPLACE_LINK_'+link_num+'>',new_text,text);
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
				let actions=view.find('.objects .object[data-link="'+current_link+'"] .actions-view')[0];
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
	let profile={};
	if(typeof user.profile != 'undefined'){
		profile=JSON.parse(user.profile);
	}
	//console.log('render_object',user,object,type,preset_level);
	if('default'==type){
		if(object.is_share){
			let text='';
			if(typeof object.data.d.text !== 'undefined'){
				text=object.data.d.text;
				text=escape_html(text);
			}

			let current_link='viz://@'+user.account+'/'+object.block+'/';
			render=ltmp(ltmp_arr.object_type_text_loading,{
				previous:object.data.p,
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
							let timestamp=new_object.find('.short-date-view').data('timestamp');
							new_object.find('.objects .short-date-view').html(show_date(timestamp*1000-(new Date().getTimezoneOffset()*60000),true,false,false));
						});
					}
				});
			},500);
		}
		else{
			let text=object.data.d.text;
			text=escape_html(text);
			text=fast_str_replace("\n",'<br>',text);

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

			text=highlight_links(text);

			render=ltmp(ltmp_arr.object_type_text,{
				reply:reply,
				author:'@'+user.account,
				link:'viz://@'+user.account+'/'+object.block+'/',
				nickname:profile.nickname,
				avatar:profile.avatar,
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
	if('preview'==type){
		if(object.is_share){
			let text='';
			if(typeof object.data.d.text !== 'undefined'){
				text=object.data.d.text;
				text=escape_html(text);
			}

			let current_link='viz://@'+user.account+'/'+object.block+'/';
			render=ltmp(ltmp_arr.object_type_text_loading,{
				previous:object.data.p,
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
							let timestamp=new_object.find('.short-date-view').data('timestamp');
							new_object.find('.objects .short-date-view').html(show_date(timestamp*1000-(new Date().getTimezoneOffset()*60000),true,false,false));
						});
					}
				});
			},500);
		}
		else{
			let text=object.data.d.text;
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
				nickname:profile.nickname,
				avatar:profile.avatar,
				text:text,
				previous:object.data.p,
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
						let timestamp=new_object.find('.short-date-view').data('timestamp');
						new_object.find('.objects .short-date-view').html(show_date(timestamp*1000-(new Date().getTimezoneOffset()*60000),true,false,false));
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
						let timestamp=new_object.find('.short-date-view').data('timestamp');
						new_object.find('.objects .short-date-view').html(show_date(timestamp*1000-(new Date().getTimezoneOffset()*60000),true,false,false));
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
			avatar:profile.avatar,
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
		let text=object.data.d.text;
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

		render=ltmp(ltmp_arr.object_type_text_share_preview,{
			author:'@'+user.account,
			nickname:profile.nickname,
			avatar:profile.avatar,
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
	setTimeout(function(){check_object_award(user.account,object.block)},100);
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
		if(0==notifications_id){
			update_req=update_q.openCursor(null,'prev');
		}
		else{
			update_req=update_q.openCursor(IDBKeyRange.upperBound(notifications_id,true),'prev');
		}
		update_req.onsuccess=function(event){
			let cur=event.target.result;
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
					cur.continue();
				}
				else{
					last_id=item.id;
					cur.continue(-1);
				}
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
		if(0==awards_id){
			update_req=update_q.openCursor(null,'prev');
		}
		else{
			update_req=update_q.openCursor(IDBKeyRange.upperBound(awards_id,true),'prev');
		}
		update_req.onsuccess=function(event){
			let cur=event.target.result;
			if(cur){
				let item=cur.value;
				last_id=item.id;
				objects.push(item);
				cur.continue(-1);//load only one item
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
		let update_req;
		if(0==hashtags_feed_id){
			update_req=update_q.index('tag_feed').openCursor(IDBKeyRange.upperBound([hashtags_id,Number.MAX_SAFE_INTEGER],true),'prev');
		}
		else{
			update_req=update_q.index('tag_feed').openCursor(IDBKeyRange.upperBound([hashtags_id,hashtags_feed_id],true),'prev');
		}
		update_req.onsuccess=function(event){
			let cur=event.target.result;
			if(cur){
				let item=cur.value;
				if((hashtags_feed_id>item.id)||(hashtags_feed_id==0)){
					last_id=item.id;
					objects.push(item);
				}
				cur.continue(-1);//load only one item
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
		let update_req;
		if(0==feed_time){
			update_req=update_q.index('time').openCursor(null,'prev');
		}
		else{
			update_req=update_q.index('time').openCursor(IDBKeyRange.upperBound(feed_time,true),'prev');
		}
		update_req.onsuccess=function(event){
			let cur=event.target.result;
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
					cur.continue();
				}
				else{
					cur.continue(-1);
				}
			}
			else{
				//console.log('load_more_objects end cursor',objects);
				if(0==objects.length){
					indicator.before(ltmp_arr.feed_end_notice);
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
			if(0<indicator.parent().find('.object').length){
				find_objects=true;
			}
			indicator.parent().find('.object').each(function(){
				if(offset>parseInt($(this).data('previous'))){
					offset=parseInt($(this).data('previous'));
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
					let timestamp=new_object.find('.short-date-view').data('timestamp');
					new_object.find('.objects .short-date-view').html(show_date(timestamp*1000-(new Date().getTimezoneOffset()*60000),true,false,false));
					indicator.data('busy','0');
					check_load_more();
				}
			});
		});
	}
}

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

function main_app(){
	clear_feed();
	clear_users_objects();
	clear_cache();
	update_feed();
	parse_fullpath();
	render_menu();
	render_session();
	view_path(path,{},false,false);
	setTimeout(function(){
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
	window.onresize=function(){
		if(!is_mobile()){
			if(!is_full()){
				if(!$('div.menu').hasClass('short')){
					$('div.menu').removeClass('hidden');
					$('div.menu').removeClass('show');
					$('div.menu').addClass('short');
				}
			}
			else{
				$('div.menu').removeClass('hidden');
				$('div.menu').removeClass('show');
				$('div.menu').removeClass('short');
			}
		}
		else{
			$('div.menu').removeClass('hidden');
			$('div.menu').removeClass('short');
			$('div.menu').removeClass('show');
		}
		check_load_more();
	};
	window.onhashchange=function(e){
		e.preventDefault();
		parse_fullpath();
		view_path(path,{},true,false);
	};
}
