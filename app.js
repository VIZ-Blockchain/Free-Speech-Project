var app_version=1;
var app_protocol='V';//V for Voice :)
var storage_prefix='viz_voice_';

var api_gates=[
	'https://node.viz.plus/',
	//'https://viz.lexai.host/',
	'https://vizrpc.lexa.host/',
	'https://viz-node.dpos.space/',
	'https://solox.world/',
];
var default_api_gate=api_gates[0];
var best_gate=-1;
var best_gate_latency=-1;
var api_gate=default_api_gate;
console.log('using default node',default_api_gate);
viz.config.set('websocket',default_api_gate);

select_best_gate();

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
						best_gate=current_gate;
						best_gate_latency=latency;
						update_api_gate();
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
			xhr.open('GET',current_gate_url);
			xhr.setRequestHeader('accept','application/json, text/plain, */*');
			xhr.setRequestHeader('content-type','application/json');
			xhr.onreadystatechange = function() {
				if(4==xhr.readyState && 200==xhr.status){
					latency=new Date().getTime() - latency_start;
					console.log('check node',current_gate_url,'latency: ',latency);
					if(best_gate!=current_gate){
						if((best_gate_latency>latency)||(best_gate==-1)){
							best_gate=current_gate;
							best_gate_latency=latency;
							update_api_gate();
						}
					}
				}
			}
			xhr.send('{"id":1,"method":"call","jsonrpc":"2.0","params":["database_api","get_dynamic_global_properties",[]]}');
		}
	}
}

var users={};
var current_user='';
var default_energy_step=500;//5.00%

if(null!=localStorage.getItem(storage_prefix+'users')){
	users=JSON.parse(localStorage.getItem(storage_prefix+'users'));
}
if(null!=localStorage.getItem(storage_prefix+'current_user')){
	current_user=localStorage.getItem(storage_prefix+'current_user');
}

var default_settings={
	feed_size:10000,
	activity_size:0,
	activity_period:30,
	activity_deep:50,
	user_cache_ttl:10,
	object_cache_ttl:10,
};
var settings=default_settings;

if(null!=localStorage.getItem(storage_prefix+'settings')){
	settings=JSON.parse(localStorage.getItem(storage_prefix+'settings'));
}

function save_settings(view){
	view.find('.button').removeClass('disabled');
	view.find('.submit-button-ring').removeClass('show');
	view.find('.error').html('');

	settings.feed_size=parseInt(view.find('input[name="feed_size"]').val());
	if(isNaN(settings.feed_size)){
		settings.feed_size=default_settings.feed_size;
	}
	view.find('input[name="feed_size"]').val(settings.feed_size);

	settings.activity_size=parseInt(view.find('input[name="activity_size"]').val());
	if(isNaN(settings.activity_size)){
		settings.activity_size=default_settings.activity_size;
	}
	view.find('input[name="activity_size"]').val(settings.activity_size);

	settings.activity_period=parseInt(view.find('input[name="activity_period"]').val());
	if(isNaN(settings.activity_period)){
		settings.activity_period=default_settings.activity_period;
	}
	view.find('input[name="activity_period"]').val(settings.activity_period);

	settings.activity_deep=parseInt(view.find('input[name="activity_deep"]').val());
	if(isNaN(settings.activity_deep)){
		settings.activity_deep=default_settings.activity_deep;
	}
	view.find('input[name="activity_deep"]').val(settings.activity_deep);

	settings.user_cache_ttl=parseInt(view.find('input[name="user_cache_ttl"]').val());
	if(isNaN(settings.user_cache_ttl)){
		settings.user_cache_ttl=default_settings.user_cache_ttl;
	}
	view.find('input[name="user_cache_ttl"]').val(settings.user_cache_ttl);

	settings.object_cache_ttl=parseInt(view.find('input[name="object_cache_ttl"]').val());
	if(isNaN(settings.object_cache_ttl)){
		settings.object_cache_ttl=default_settings.object_cache_ttl;
	}
	view.find('input[name="object_cache_ttl"]').val(settings.object_cache_ttl);

	let settings_json=JSON.stringify(settings);
	localStorage.setItem(storage_prefix+'settings',settings_json);

	view.find('.success').html(ltmp_arr.app_settings_saved);
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
	current_user='';
	localStorage.removeItem(storage_prefix+'users');
	localStorage.removeItem(storage_prefix+'current_user');
	render_menu();
	render_session();
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
		view.find('.error').html(ltmp_arr.account_seetings_empty_account);
		view.find('.button').removeClass('disabled');
		return;
	}
	if(''==regular_key){
		view.find('.submit-button-ring').removeClass('show');
		view.find('.error').html(ltmp_arr.account_seetings_empty_regular_key);
		view.find('.button').removeClass('disabled');
		return;
	}
	viz.api.getAccounts([login],function(err,response){
		if(typeof response[0] != 'undefined'){
			let regular_valid=false;
			for(regular_check in response[0].regular_authority.key_auths){
				if(response[0].regular_authority.key_auths[regular_check][1]>=response[0].regular_authority.weight_threshold){
					try{
						if(viz.auth.wifIsValid(regular_key,response[0].regular_authority.key_auths[regular_check][0])){
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
			render_menu();
			render_session();

			view.find('.submit-button-ring').removeClass('show');
			view.find('.success').html(ltmp_arr.account_settings_saved);
			view.find('.button').removeClass('disabled');
		}
		else{
			console.log(err);
			view.find('.submit-button-ring').removeClass('show');
			view.find('.error').html(ltmp_arr.account_seetings_account_not_found);
			view.find('.button').removeClass('disabled');
			return;
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
	menu_session_empty:'<div class="avatar"><img src="default.png"></div><a tabindex="0" data-href="fsp:account_settings">{caption}</a>',
	menu_session_login:'Войти',
	menu_session_error:'<span class="error">Ошибка</span>',
	menu_session_account:'<div class="avatar"><div class="shadow" data-href="viz://{account}/"></div><img src="{avatar}"></div><div class="account"><a class="account-name" tabindex="0" data-href="viz://{account}/">{nickname}</a><a class="account-login" tabindex="0" data-href="viz://{account}/">{account}</a></div>',

	none_notice:'<div class="none-notice"><em>Лента новостей пока не работает, попробуйте поиск.<!--<br>Ничего не найдено.--></em></div>',
	load_more_end_notice:'<div class="load-more-end-notice"><em>Больше ничего не найдено.</em></div>',
	error_notice:'<div class="error-notice"><em>{error}</em></div>',
	loader_notice:'<div class="loader-notice"><span class="submit-button-ring"></span></div>',

	toggle_menu:'<a tabindex="0" title="{title}" class="toggle-menu">{icon}</a>',
	toggle_menu_title:'Переключить меню',

	account_settings:'<a tabindex="0" data-href="fsp:account_settings" title="Настройки аккаунта">{icon_account_settings}</a>',
	account_settings_caption:'Настройки аккаунта',
	account_seetings_empty_account:'Введите аккаунт',
	account_seetings_empty_regular_key:'Введите регулярный ключ',
	account_seetings_account_not_found:'Аккаунт не найден',
	account_settings_saved:'Данные аккаунта сохранены',
	account_settings_reset:'Данные аккаунта удалены',

	app_settings_caption:'Настройки приложения',
	app_settings_saved:'Настройки сохранены',
	app_settings_reset:'Настройки сброшены',

	view_profile:'<a tabindex="0" data-href="viz://@{account}/" title="Просмотреть профиль">{icon_view_profile}</a>',

	invalid_regular_key:'Предоставленный ключ недействителен',
	not_found_regular_key:'Предоставленный ключ не подходит',

	search:'<a tabindex="0" data-href="fsp:search" title="Поиск">{icon_search}</a>',
	search_caption:'Поиск',
	search_empty_input:'Введите адрес для поиска',

	gateway_error:'Ошибка, попробуйте позже',
	account_not_found:'Пользователь не найден',
	block_not_found:'Блок не найден, попробуйте позже',
	data_not_found:'Данные не найдены, попробуйте позже',

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

	menu_preset:`
		<div class="session"></div>
		<div class="primary"></div>
		<div class="secondary"></div>`,
	menu_primary:`<div><a tabindex="0" data-href="{link}" class="{class}">{icon}<span>{caption}</span></a></div>`,
	menu_feed:'Лента новостей',
	menu_view_profile:'Профиль',
	menu_app_settings:'Настройки',
	menu_account_settings:'Аккаунт',

	icon_back:`<i class="icon back"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></i>`,
	icon_gem:`<i class="icon gem"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6.3499998 6.3500002" height="24" width="24" fill="none" stroke="currentColor" stroke-width="0.4" stroke-linecap="round" stroke-linejoin="round"><path d="m 1.019418,1.20416 1.108597,0.36953 m 4.0648556,0.86224 -0.8622424,-1.23177 m -5.17345221,1.23177 3.07943611,3.07944 2.9562585,-3.07944 -1.6013069,0.49271 -1.3549516,2.58673 -1.4781293,-2.58673 -1.60130681,-0.49271 0.86224211,-1.23177 1.2317745,-0.36953 h 1.8476616 l 1.231774,0.36953 -1.1085967,0.36953 H 2.128015 l -0.3695322,1.35495 h 2.8330809 l -0.3695322,-1.35495"/></svg></i>`,
	icon_reply:`<i class="icon reply"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path fill="none" d="M0 0h24v24H0z"/><path d="M14 22.5L11.2 19H6a1 1 0 0 1-1-1V7.103a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1h-5.2L14 22.5zm1.839-5.5H21V8.103H7V17H12.161L14 19.298 15.839 17zM2 2h17v2H3v11H1V3a1 1 0 0 1 1-1z"/></svg></i>`,
	icon_copy_link:`<i class="icon copy_link"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8.465,11.293c1.133-1.133,3.109-1.133,4.242,0L13.414,12l1.414-1.414l-0.707-0.707c-0.943-0.944-2.199-1.465-3.535-1.465 S7.994,8.935,7.051,9.879L4.929,12c-1.948,1.949-1.948,5.122,0,7.071c0.975,0.975,2.255,1.462,3.535,1.462 c1.281,0,2.562-0.487,3.536-1.462l0.707-0.707l-1.414-1.414l-0.707,0.707c-1.17,1.167-3.073,1.169-4.243,0 c-1.169-1.17-1.169-3.073,0-4.243L8.465,11.293z"/><path d="M12,4.929l-0.707,0.707l1.414,1.414l0.707-0.707c1.169-1.167,3.072-1.169,4.243,0c1.169,1.17,1.169,3.073,0,4.243 l-2.122,2.121c-1.133,1.133-3.109,1.133-4.242,0L10.586,12l-1.414,1.414l0.707,0.707c0.943,0.944,2.199,1.465,3.535,1.465 s2.592-0.521,3.535-1.465L19.071,12c1.948-1.949,1.948-5.122,0-7.071C17.121,2.979,13.948,2.98,12,4.929z"/></svg></i>`,
	icon_new_object:`<i class="icon new_object"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M3,16c0,1.103,0.897,2,2,2h3.586L12,21.414L15.414,18H19c1.103,0,2-0.897,2-2V4c0-1.103-0.897-2-2-2H5C3.897,2,3,2.897,3,4 V16z M5,4h14v12h-4.414L12,18.586L9.414,16H5V4z"/><path d="M11 14L13 14 13 11 16 11 16 9 13 9 13 6 11 6 11 9 8 9 8 11 11 11z"/></svg></i>`,
	icon_edit_profile:`<i class="icon edit_profile"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 14v2a6 6 0 0 0-6 6H4a8 8 0 0 1 8-8zm0-1c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm2.595 7.812a3.51 3.51 0 0 1 0-1.623l-.992-.573 1-1.732.992.573A3.496 3.496 0 0 1 17 14.645V13.5h2v1.145c.532.158 1.012.44 1.405.812l.992-.573 1 1.732-.992.573a3.51 3.51 0 0 1 0 1.622l.992.573-1 1.732-.992-.573a3.496 3.496 0 0 1-1.405.812V22.5h-2v-1.145a3.496 3.496 0 0 1-1.405-.812l-.992.573-1-1.732.992-.572zM18 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg></i>`,
	icon_github:`<i class="icon github"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M12.026,2c-5.509,0-9.974,4.465-9.974,9.974c0,4.406,2.857,8.145,6.821,9.465 c0.499,0.09,0.679-0.217,0.679-0.481c0-0.237-0.008-0.865-0.011-1.696c-2.775,0.602-3.361-1.338-3.361-1.338 c-0.452-1.152-1.107-1.459-1.107-1.459c-0.905-0.619,0.069-0.605,0.069-0.605c1.002,0.07,1.527,1.028,1.527,1.028 c0.89,1.524,2.336,1.084,2.902,0.829c0.091-0.645,0.351-1.085,0.635-1.334c-2.214-0.251-4.542-1.107-4.542-4.93 c0-1.087,0.389-1.979,1.024-2.675c-0.101-0.253-0.446-1.268,0.099-2.64c0,0,0.837-0.269,2.742,1.021 c0.798-0.221,1.649-0.332,2.496-0.336c0.849,0.004,1.701,0.115,2.496,0.336c1.906-1.291,2.742-1.021,2.742-1.021 c0.545,1.372,0.203,2.387,0.099,2.64c0.64,0.696,1.024,1.587,1.024,2.675c0,3.833-2.33,4.675-4.552,4.922 c0.355,0.308,0.675,0.916,0.675,1.846c0,1.334-0.012,2.41-0.012,2.737c0,0.267,0.178,0.577,0.687,0.479 C19.146,20.115,22,16.379,22,11.974C22,6.465,17.535,2,12.026,2z"/></svg></i>`,
	icon_telegram:`<i class="icon telegram"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.665,3.717l-17.73,6.837c-1.21,0.486-1.203,1.161-0.222,1.462l4.552,1.42l10.532-6.645 c0.498-0.303,0.953-0.14,0.579,0.192l-8.533,7.701l0,0l0,0H9.841l0.002,0.001l-0.314,4.692c0.46,0,0.663-0.211,0.921-0.46 l2.211-2.15l4.599,3.397c0.848,0.467,1.457,0.227,1.668-0.785l3.019-14.228C22.256,3.912,21.474,3.351,20.665,3.717z"/></svg></i>`,
	icon_account_settings:`<i class="icon account_settings"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"/><path d="M3.783 2.826L12 1l8.217 1.826a1 1 0 0 1 .783.976v9.987a6 6 0 0 1-2.672 4.992L12 23l-6.328-4.219A6 6 0 0 1 3 13.79V3.802a1 1 0 0 1 .783-.976zM5 4.604v9.185a4 4 0 0 0 1.781 3.328L12 20.597l5.219-3.48A4 4 0 0 0 19 13.79V4.604L12 3.05 5 4.604zM12 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm-4.473 5a4.5 4.5 0 0 1 8.946 0H7.527z"/></svg></i>`,
	icon_view_profile:`<i class="icon view_profile"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"/><path d="M4 22a8 8 0 1 1 16 0h-2a6 6 0 1 0-12 0H4zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/></svg></i>`,
	icon_search:`<i class="icon search"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.023,16.977c-0.513-0.488-1.004-0.997-1.367-1.384c-0.372-0.378-0.596-0.653-0.596-0.653l-2.8-1.337 C15.34,12.37,16,10.763,16,9c0-3.859-3.14-7-7-7S2,5.141,2,9s3.14,7,7,7c1.763,0,3.37-0.66,4.603-1.739l1.337,2.8 c0,0,0.275,0.224,0.653,0.596c0.387,0.363,0.896,0.854,1.384,1.367c0.494,0.506,0.988,1.012,1.358,1.392 c0.362,0.388,0.604,0.646,0.604,0.646l2.121-2.121c0,0-0.258-0.242-0.646-0.604C20.035,17.965,19.529,17.471,19.023,16.977z M9,14 c-2.757,0-5-2.243-5-5s2.243-5,5-5s5,2.243,5,5S11.757,14,9,14z"/></svg></i>`,
	icon_feed:`<i class="icon feed"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.875,3H4.125C2.953,3,2,3.897,2,5v14c0,1.103,0.953,2,2.125,2h15.75C21.047,21,22,20.103,22,19V5 C22,3.897,21.047,3,19.875,3z M19.875,19H4.125c-0.057,0-0.096-0.016-0.113-0.016c-0.007,0-0.011,0.002-0.012,0.008L3.988,5.046 C3.995,5.036,4.04,5,4.125,5h15.75C19.954,5.001,19.997,5.028,20,5.008l0.012,13.946C20.005,18.964,19.96,19,19.875,19z"/><path d="M6 7H12V13H6zM13 15L6 15 6 17 13 17 14 17 18 17 18 15 14 15zM14 11H18V13H14zM14 7H18V9H14z"/></svg></i>`,
	icon_settings:`<i class="icon settings"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></i>`,
	icon_menu:`<i class="icon menu"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="23" height="23" stroke="none" fill="currentColor"><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/></svg></i>`,
	icon_close:`<i class="icon close"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="0.6" stroke-linecap="round" stroke-linejoin="round" fill="currentColor"><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"/></svg></i>`,

	header_back_action:`<a tabindex="0" class="back-action" title="Назад">{icon}</a>`,
	header_link:'<div class="link grow"><input type="text" class="header-link" value="{link}" disabled></div>',
	header_caption:'<div class="caption grow">{caption}</div>',

	edit_profile_link:'<a tabindex="0" data-href="fsp:edit_profile" title="Изменить профиль">{icon_edit_profile}</a>',
	edit_profile_caption:'Настройка профиля',
	edit_profile_saved:'Профиль сохранен',
	new_object_link:'<a tabindex="0" data-href="fsp:publish" title="Написать">{icon_new_object}</a>',

	publish_caption:'Публикация',
	publish_empty_text:'Введите текст публикации',
	publish_success:'Публикация успешно опубликована&hellip;',
	publish_success_link:'Публикация успешно опубликована: <a tabindex="0" data-href="viz://@{account}/{block}/">ссылка</a>',

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
	<!--<a tabindex="0" class="share">[поделиться]</a>-->
	<a tabindex="0" class="reply-action" title="Комментировать">{icon_reply}</a>
	<!--<a tabindex="0" class="award" title="Наградить">{icon_award}</a>-->
	<a tabindex="0" class="copy-link-action" title="Копировать ссылку">{icon_copy_link}</a>`,
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
	object_type_text_reply:'<div class="reply-view">В ответ <a tabindex="0" data-href="{link}">{caption}</a></div>',
	object_type_text_reply_external:'<div class="reply-view">Ответ на <a tabindex="0" href="{link}" target="_blank">{caption}</a></div>',
};

function render_menu(){
	$('div.menu').html(ltmp_arr.menu_preset);
	let primary_menu='';
	if(current_user){
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'viz://',class:(path=='viz://'?'current':''),icon:ltmp_arr.icon_feed,caption:ltmp_arr.menu_feed});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'viz://@'+current_user+'/',class:(path=='viz://@'+current_user+'/'?'current':''),icon:ltmp_arr.icon_view_profile,caption:ltmp_arr.menu_view_profile});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'fsp:app_settings',class:(path=='fsp:app_settings'?'current':''),icon:ltmp_arr.icon_settings,caption:ltmp_arr.menu_app_settings});
		primary_menu+=ltmp(ltmp_arr.menu_primary,{link:'fsp:account_settings',class:(path=='fsp:account_settings'?'current':''),icon:ltmp_arr.icon_account_settings,caption:ltmp_arr.menu_account_settings});
	}
	$('div.menu .primary').html(primary_menu);
}

function render_session(){
	if(current_user){
		viz.api.getAccounts([current_user],function(err,response){
			if(!err){
				if(typeof response[0] != 'undefined'){
					let account='@'+response[0].name;
					let nickname=response[0].name;
					let avatar='default.png';
					let json_metadata={};
					if(''!=response[0].json_metadata){
						json_metadata=JSON.parse(response[0].json_metadata);
					}
					if(typeof json_metadata.profile != 'undefined'){
						if(typeof json_metadata.profile.nickname != 'undefined'){
							nickname=escape_html(json_metadata.profile.nickname);
						}
						if(typeof json_metadata.profile.avatar != 'undefined'){
							if(0==json_metadata.profile.avatar.indexOf('https://')){
								avatar=escape_html(json_metadata.profile.avatar);
							}
						}
					}
					$('div.menu .session').html(ltmp(ltmp_arr.menu_session_account,{'account':account,'nickname':nickname,'avatar':avatar}));
				}
			}
			else{
				$('div.menu .session').html(ltmp(ltmp_arr.menu_session_empty,{caption:ltmp_arr.menu_session_error}));
			}
		});
	}
	else{
		$('div.menu .session').html(ltmp(ltmp_arr.menu_session_empty,{caption:ltmp_arr.menu_session_login}));
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

	if(''==text){
		view.find('.submit-button-ring').removeClass('show');
		view.find('.error').html(ltmp_arr.publish_empty_text);
		view.find('.button').removeClass('disabled');
		return;
	}

	viz.api.getAccounts([current_user],function(err,response){
		if(err){
			console.log(err);
			view.find('.submit-button-ring').removeClass('show');
			view.find('.error').html(ltmp_arr.gateway_error);
			view.find('.button').removeClass('disabled');
			return;
		}
		else{
			if(typeof response[0] !== 'undefined'){
				let previous=response[0].custom_sequence_block_num;

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

				new_object.d=data;
				let object_json=JSON.stringify(new_object);

				viz.broadcast.custom(users[current_user].regular_key,[],[current_user],app_protocol,object_json,function(err,result){
					if(result){
						console.log(result);
						view.find('.submit-button-ring').removeClass('show');
						view.find('.success').html(ltmp_arr.publish_success);
						view.find('.button').removeClass('disabled');
						setTimeout(function(){
							viz.api.getAccounts([current_user],function(err,response){
								if(typeof response[0] !== 'undefined'){
									if(response[0].custom_sequence_block_num!=previous){
										view.find('.success').html(ltmp(ltmp_arr.publish_success_link,{account:current_user,block:response[0].custom_sequence_block_num}));
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
			else{
				console.log(err);
				view.find('.submit-button-ring').removeClass('show');
				view.find('.error').html(ltmp_arr.account_not_found);
				view.find('.button').removeClass('disabled');
				return;
			}
		}
	});
}
function app_mouse(e){
	if(!e)e=window.event;
	var target=e.target || e.srcElement;
	//go parent element, if event on icon
	if($(target).hasClass('icon')){
		target=$(target).parent();
	}
	if(typeof $(target).attr('data-href') != 'undefined'){
		var href=$(target).attr('data-href');
		view_path(href,{},true,false);
		e.preventDefault();
	}
	if($(target).hasClass('toggle-menu')){
		if($('div.menu').hasClass('hidden')){
			$('div.menu').removeClass('hidden');
		}
		else{
			if($('div.menu').hasClass('short')){
				$('div.menu').addClass('hidden');
				$('div.menu').removeClass('short');
			}
			else{
				$('div.menu').addClass('short');
			}
		}
	}
	if($(target).hasClass('preset-action')){
		$('input[name="'+$(target).data('input')+'"]').val($(target).data('value'));
	}
	if($(target).hasClass('save-settings-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			let view=$(target).closest('.view');
			view.find('.submit-button-ring').addClass('show');
			view.find('.error').html('');
			view.find('.success').html('');
			save_settings(view);
		}
	}
	if($(target).hasClass('reset-settings-action')){
		if(!$(target).hasClass('disabled')){
			$(target).addClass('disabled');
			let view=$(target).closest('.view');
			view.find('.submit-button-ring').addClass('show');
			view.find('.error').html('');
			view.find('.success').html('');
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
	if($(target).hasClass('header-link')){
		let text=$(target).val();
		$('.text-copy').val(text);
		$('.text-copy')[0].select();
		$('.text-copy')[0].setSelectionRange(0,99999);
		document.execCommand("copy");
	}
	if($(target).hasClass('reply-action')){
		let link=$(target).closest('.object').data('link');
		view_path('fsp:publish/reply/?'+link,{},true,false);
	}
	if($(target).hasClass('copy-link-action')){
		let text=$(target).closest('.object').data('link');
		$('.text-copy').val(text);
		$('.text-copy')[0].select();
		$('.text-copy')[0].setSelectionRange(0,99999);
		document.execCommand("copy");
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
		$('.loader').css('display','block');
		$('.view').css('display','none');

		if(0<$('.view[data-level="'+level+'"]').length){
			$('.view[data-level="'+level+'"]').remove();
		}

		level--;
		path='viz://';
		query='';
		//search prev level props
		if(0<$('.view[data-level="'+level+'"]').length){
			if(typeof $('.view[data-level="'+level+'"]').data('path') != 'undefined'){
				path=$('.view[data-level="'+level+'"]').data('path');
			}
			if(typeof $('.view[data-level="'+level+'"]').data('query') != 'undefined'){
				query=$('.view[data-level="'+level+'"]').data('query');
			}
		}
		//trigger view_path with update prop
		view_path(path,{},true,true);
	}
	/*
	//button to scroll top, need to show it for long views on scrolling more that 100hv?
	if($(target).hasClass('go-top')){
		$(window)[0].scrollTo({behavior:'smooth',top:0});
	}
	*/
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

	viz.api.getAccounts([current_user],function(err,response){
		if(err){
			console.log(err);
			view.find('.submit-button-ring').removeClass('show');
			view.find('.error').html(ltmp_arr.gateway_error);
			view.find('.button').removeClass('disabled');
			return;
		}
		else{
			if(typeof response[0] !== 'undefined'){
				let json_metadata={};
				if(''!=response[0].json_metadata){
					json_metadata=JSON.parse(response[0].json_metadata);
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
				console.log(err);
				view.find('.submit-button-ring').removeClass('show');
				view.find('.error').html(ltmp_arr.account_not_found);
				view.find('.button').removeClass('disabled');
				return;
			}
		}
	});
}

function view_search(view,path_parts,query,title){
	document.title=ltmp_arr.search_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back});
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
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back});
	header+=ltmp(ltmp_arr.header_caption,{caption:ltmp_arr.publish_caption});
	view.find('.header').html(header);

	view.find('.button').removeClass('disabled');
	view.find('.submit-button-ring').removeClass('show');
	view.find('.error').html('');
	view.find('.success').html('');

	view.find('input').val('');
	view.find('textarea').val('');

	view.find('.reply-addon').css('display','none');
	view.find('.share-addon').css('display','none');
	view.find('.loop-addon').css('display','none');
	if('loop'==query){
		view.find('.loop-addon').css('display','block');
	}
	if('reply'==path_parts[1]){
		view.find('.reply-addon').css('display','block');
		view.find('.reply-addon input[name="reply"]').val(query);
	}
	view.find('.viz_account').html('@'+current_user);

	$('.loader').css('display','none');
	view.css('display','block');
}

function view_edit_profile(view,path_parts,query,title){
	document.title=ltmp_arr.edit_profile_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back});
	header+=ltmp(ltmp_arr.header_caption,{caption:ltmp_arr.edit_profile_caption});
	view.find('.header').html(header);

	view.find('.button').removeClass('disabled');
	view.find('.submit-button-ring').removeClass('show');
	view.find('.error').html('');
	view.find('.success').html('');
	view.find('.viz_account').html('@'+current_user);

	view.find('input').val('');
	if(0<Object.keys(preload_object).length){
		if(typeof preload_object.nickname != 'undefined'){
			view.find('input[name=nickname]').val(preload_object.nickname);
		}
		if(typeof preload_object.about != 'undefined'){
			view.find('input[name=about]').val(preload_object.about);
		}
		if(typeof preload_object.avatar != 'undefined'){
			view.find('input[name=avatar]').val(preload_object.avatar);
		}
		if(typeof preload_object.telegram != 'undefined'){
			view.find('input[name=telegram]').val(preload_object.telegram);
		}
		if(typeof preload_object.github != 'undefined'){
			view.find('input[name=github]').val(preload_object.github);
		}
	}
	else{
		viz.api.getAccounts([current_user],function(err,response){
			if(err){
				view.find('.error').html(ltmp_arr.gateway_error);
			}
			else{
				if(typeof response[0] == 'undefined'){
					view.find('.error').html(ltmp_arr.account_not_found);
				}
				else{
					let json_metadata={};
					if(''!=response[0].json_metadata){
						json_metadata=JSON.parse(response[0].json_metadata);
					}

					if(typeof json_metadata.profile.nickname != 'undefined'){
						view.find('input[name=nickname]').val(escape_html(json_metadata.profile.nickname));
					}
					if(typeof json_metadata.profile.avatar != 'undefined'){
						view.find('input[name=avatar]').val(escape_html(json_metadata.profile.avatar));
					}
					if(typeof json_metadata.profile.about != 'undefined'){
						view.find('input[name=about]').val(escape_html(json_metadata.profile.about));
					}
					if(typeof json_metadata.profile.services != 'undefined'){
						if(typeof json_metadata.profile.services.github != 'undefined'){
							view.find('input[name=github]').val(escape_html(json_metadata.profile.services.github));
						}
						if(typeof json_metadata.profile.services.telegram != 'undefined'){
							view.find('input[name=telegram]').val(escape_html(json_metadata.profile.services.telegram));
						}
					}
				}
			}
		});
	}
	$('.loader').css('display','none');
	view.css('display','block');
}

function view_app_settings(view,path_parts,query,title){
	document.title=ltmp_arr.app_settings_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back});
	header+=ltmp(ltmp_arr.header_caption,{caption:ltmp_arr.app_settings_caption});
	view.find('.header').html(header);

	view.find('.button').removeClass('disabled');
	view.find('.submit-button-ring').removeClass('show');
	view.find('.error').html('');
	view.find('.success').html('');

	view.find('input').val('');

	view.find('input[name="feed_size"]').val(settings.feed_size);
	view.find('input[name="activity_size"]').val(settings.activity_size);
	view.find('input[name="activity_period"]').val(settings.activity_period);
	view.find('input[name="activity_deep"]').val(settings.activity_deep);
	view.find('input[name="user_cache_ttl"]').val(settings.user_cache_ttl);
	view.find('input[name="object_cache_ttl"]').val(settings.object_cache_ttl);

	$('.loader').css('display','none');
	view.css('display','block');
}

function view_account_settings(view,path_parts,query,title){
	document.title=ltmp_arr.account_settings_caption+' - '+title;
	let header='';
	header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back});
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
		document.activeElement.click();
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

var preload_account={};
var preload_object={};

function view_path(location,state,save_state,update){
	//save to history browser
	save_state=typeof save_state==='undefined'?false:save_state;
	//update current level? not work now
	update=typeof update==='undefined'?false:update;
	var path_parts=[];
	var title='Free Speech Project';

	if(typeof state.path == 'undefined'){
		//check query state
		if(-1!=location.indexOf('?')){
			query=location.substring(location.indexOf('?')+1);
			location=location.substring(0,location.indexOf('?'));
		}
		if(-1!=location.indexOf('viz://')){
			path_parts=location.substr(location.indexOf('viz://')+6).split('/');
		}
		else{
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

	console.log('location: '+location,path_parts,'query: '+query);
	$('div.menu .primary div a').removeClass('current');
	$('div.menu .primary div a[data-href="'+location+'"]').addClass('current');

	if(''==path_parts[0]){
		$('.loader').css('display','block');
		$('.view').css('display','none');
		let view=$('.view[data-level="0"]');
		let header='';
		header+=ltmp(ltmp_arr.toggle_menu,{title:ltmp_arr.toggle_menu_title,icon:ltmp_arr.icon_menu});
		header+=ltmp(ltmp_arr.search,{icon_search:ltmp_arr.icon_search});
		view.find('.header').html(header);
		view.find('.objects').html(ltmp_arr.none_notice);
		level=0;
		$('.loader').css('display','none');
		view.css('display','block');
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
			if(''==path_parts[1]){
				//not object
				//check account link
				if('@'==path_parts[0].substring(0,1)){
					//preload account for view with +1 level
					let check_account=path_parts[0].substring(1);
					check_account=check_account.toLowerCase();
					check_account=check_account.trim();
					preload_account={};
					preload_object={};
					viz.api.getAccounts([check_account],function(err,response){
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
							let header='';
							header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back});
							header+=ltmp(ltmp_arr.header_link,{link:location});
							view.find('.header').html(header);
							view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.gateway_error}));
							$('.loader').css('display','none');
							view.css('display','block');
						}
						else{
							if(typeof response[0] == 'undefined'){
								$('.loader').css('display','block');
								$('.view').css('display','none');
								if(!update){
									level++;
									let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query,tabs:'',profile:''});
									$('.content').append(new_view);
								}
								let view=$('.view[data-level="'+level+'"]');
								let header='';
								header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back});
								header+=ltmp(ltmp_arr.header_link,{link:location});
								view.find('.header').html(header);
								view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.account_not_found}));
								$('.loader').css('display','none');
								view.css('display','block');
							}
							else{
								preload_account=response[0];
								let profile_view='';
								let profile_obj={};
								let profile_found=false;
								let json_metadata={};
								let profile_contacts='';
								if(''!=response[0].json_metadata){
									json_metadata=JSON.parse(response[0].json_metadata);
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
										profile_view+=ltmp(ltmp_arr.profile_about,{about:profile_obj.about});
										profile_found=true;
									}
									if(typeof json_metadata.profile.services != 'undefined'){
										if(typeof json_metadata.profile.services.github != 'undefined'){
											profile_obj.github=escape_html(json_metadata.profile.services.github);
											profile_contacts+=ltmp(ltmp_arr.profile_contacts_github,{github:profile_obj.github,icon_github:ltmp_arr.icon_github});
											profile_found=true;
										}
										if(typeof json_metadata.profile.services.telegram != 'undefined'){
											profile_obj.telegram=escape_html(json_metadata.profile.services.telegram);
											profile_contacts+=ltmp(ltmp_arr.profile_contacts_telegram,{telegram:profile_obj.telegram,icon_telegram:ltmp_arr.icon_telegram});
											profile_found=true;
										}
										if(''!=profile_contacts){
											profile_view+=ltmp(ltmp_arr.profile_contacts,{contacts:profile_contacts});
										}
									}
								}
								if(typeof profile_obj.nickname == 'undefined'){
									profile_obj.nickname=preload_account.name;
								}
								if(typeof profile_obj.avatar == 'undefined'){
									profile_obj.avatar='default.png';
								}
								let profile='';
								preload_object=profile_obj;
								if(profile_found){
									profile=ltmp(ltmp_arr.profile,{profile:profile_view});
								}

								$('.loader').css('display','block');
								$('.view').css('display','none');
								if(!update){
									level++;
									let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query,tabs:'',profile:profile});
									$('.content').append(new_view);
								}
								let view=$('.view[data-level="'+level+'"]');
								let header='';
								header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back});
								header+=ltmp(ltmp_arr.header_link,{link:location});
								if(check_account==current_user){
									header+=ltmp(ltmp_arr.edit_profile_link,{icon_edit_profile:ltmp_arr.icon_edit_profile});
									header+=ltmp(ltmp_arr.new_object_link,{icon_new_object:ltmp_arr.icon_new_object});
								}
								view.find('.header').html(header);
								view.find('.objects').html(ltmp_arr.loader_notice);
								$('.loader').css('display','none');
								view.css('display','block');
								check_load_more();
							}
						}
					});
				}
			}
			else{
				//only block in path parts
				if(''==path_parts[2]){
					let check_account=path_parts[0].substring(1);
					check_account=check_account.toLowerCase();
					check_account=check_account.trim();
					let check_block=parseInt(path_parts[1]);
					$('.loader').css('display','block');
					$('.view').css('display','none');
					viz.api.getAccounts([check_account],function(err,response){
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
							let header='';
							header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back});
							header+=ltmp(ltmp_arr.header_link,{link:location});
							view.find('.header').html(header);
							view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.gateway_error}));

							$('.loader').css('display','none');
							view.css('display','block');
						}
						else{
							if(typeof response[0] == 'undefined'){
								$('.loader').css('display','block');
								$('.view').css('display','none');
								if(!update){
									level++;
									let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query,tabs:'',profile:''});
									$('.content').append(new_view);
								}
								let view=$('.view[data-level="'+level+'"]');
								let header='';
								header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back});
								header+=ltmp(ltmp_arr.header_link,{link:location});
								view.find('.header').html(header);
								view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.account_not_found}));

								$('.loader').css('display','none');
								view.css('display','block');
							}
							else{
								let account=response[0];
								let author='@'+account.name;
								let nickname=account.name;
								let avatar='default.png';
								let json_metadata={};
								if(''!=response[0].json_metadata){
									json_metadata=JSON.parse(response[0].json_metadata);
								}
								if(typeof json_metadata.profile != 'undefined'){
									if(typeof json_metadata.profile.nickname != 'undefined'){
										nickname=escape_html(json_metadata.profile.nickname);
									}
									if(typeof json_metadata.profile.avatar != 'undefined'){
										if(0==json_metadata.profile.avatar.indexOf('https://')){
											avatar=escape_html(json_metadata.profile.avatar);
										}
									}
								}
								if(!update){
									level++;
									let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query,tabs:'',profile:''});
									$('.content').append(new_view);
								}
								let view=$('.view[data-level="'+level+'"]');
								let header='';
								header+=ltmp(ltmp_arr.header_back_action,{icon:ltmp_arr.icon_back});
								header+=ltmp(ltmp_arr.header_link,{link:location});
								view.find('.header').html(header);
								view.find('.objects').html(ltmp_arr.loader_notice);

								viz.api.getOpsInBlock(check_block,false,function(err,response){
									if(err){
										view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.block_not_found}));
									}
									else{
										let item=false;
										for(let i in response){
											let item_i=i;
											if('custom'==response[item_i].op[0]){
												if(app_protocol==response[item_i].op[1].id){
													let op=response[item_i].op[1];
													if(op.required_regular_auths.includes(check_account)){
														item=JSON.parse(response[item_i].op[1].json);
														item.timestamp=Date.parse(response[item_i].timestamp) / 1000 | 0;
													}
												}
											}
										}
										if(false==item){
											view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.block_not_found}));
										}
										else{
											//console.log(item);
											let objects='';

											let text=item.d.text;
											text=escape_html(text);
											text=fast_str_replace("\n",'<br>',text);

											let link='viz://@'+check_account+'/'+check_block+'/';

											let reply='';
											if(typeof item.d.r != 'undefined'){
												let reply_link=item.d.r;
												//internal
												if(0==reply_link.indexOf('viz://')){
													reply_link=reply_link.toLowerCase();
													reply_link=escape_html(reply_link);
													let pattern = /@[a-z0-9\-\.]*/g;
													let reply_account=reply_link.match(pattern);
													if(typeof reply_account[0] != 'undefined'){
														reply=ltmp(ltmp_arr.object_type_text_reply,{link:reply_link,caption:reply_account[0]});
													}
												}
												//external
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

											text=highlight_links(text);

											let object_view=ltmp(ltmp_arr.object_type_text,{
												reply:reply,
												author:author,
												link:link,
												nickname:nickname,
												avatar:avatar,
												text:text,
												actions:ltmp(ltmp_arr.object_type_text_actions,{
													//link:link,
													icon_reply:ltmp_arr.icon_reply,
													icon_award:ltmp_arr.icon_gem,
													icon_copy_link:ltmp_arr.icon_copy_link,
												}),
												timestamp:item.timestamp,
											});

											objects+=object_view;
											view.find('.objects').html(objects);
											let timestamp=view.find('.object[data-link="'+link+'"] .date-view').data('timestamp');
											view.find('.object[data-link="'+link+'"] .date-view .date').html(show_date(timestamp*1000-(new Date().getTimezoneOffset()*60000),false,false,false));
											view.find('.object[data-link="'+link+'"] .date-view .time').html(show_time(timestamp*1000-(new Date().getTimezoneOffset()*60000)));
										}

										$('.loader').css('display','none');
										view.css('display','block');
										check_load_more();
									}
								});
							}
						}
					});
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
	let account_pattern = /@[a-z0-9\-\.]*/g;
	let summary_links=[];
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
function load_more_objects(indicator,check_level){
	let check_account=preload_account.name;
	let start_offset=preload_account.custom_sequence_block_num;
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
	viz.api.getOpsInBlock(offset,false,function(err,response){
		if(check_level==level){
			if(err){
				indicator.before(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.block_not_found}));
			}
			else{
				let item=false;
				for(let i in response){
					let item_i=i;
					if('custom'==response[item_i].op[0]){
						if(app_protocol==response[item_i].op[1].id){
							let op=response[item_i].op[1];
							if(op.required_regular_auths.includes(check_account)){
								item=JSON.parse(response[item_i].op[1].json);
								item.timestamp=Date.parse(response[item_i].timestamp) / 1000 | 0;
							}
						}
					}
				}
				if(false==item){
					indicator.before(ltmp_arr.load_more_end_notice);
					indicator.remove();
				}
				else{
					let objects='';

					let text=item.d.text;
					text=escape_html(text);
					text=fast_str_replace("\n",'<br>',text);

					let link='viz://@'+check_account+'/'+offset+'/';
					let author='@'+preload_account.name;

					if(typeof item.p == 'undefined'){
						item.p=0;
					}

					let reply='';
					if(typeof item.d.r != 'undefined'){
						let reply_link=item.d.r;
						//internal
						if(0==reply_link.indexOf('viz://')){
							reply_link=reply_link.toLowerCase();
							reply_link=escape_html(reply_link);
							let pattern = /@[a-z0-9\-\.]*/g;
							let reply_account=reply_link.match(pattern);
							if(typeof reply_account[0] != 'undefined'){
								reply=ltmp(ltmp_arr.object_type_text_reply,{link:reply_link,caption:reply_account[0]});
							}
						}
						//external
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

					let object_view=ltmp(ltmp_arr.object_type_text_preview,{
						reply:reply,
						author:author,
						nickname:preload_object.nickname,
						avatar:preload_object.avatar,
						text:text,
						previous:item.p,
						link:link,
						actions:ltmp(ltmp_arr.object_type_text_actions,{
							//link:link,
							icon_reply:ltmp_arr.icon_reply,
							icon_award:ltmp_arr.icon_gem,
							icon_copy_link:ltmp_arr.icon_copy_link,
						}),
						timestamp:item.timestamp,
					});
					indicator.before(object_view);
					let new_object=indicator.parent().find('.object[data-link="'+link+'"]');
					let timestamp=new_object.find('.short-date-view').data('timestamp');
					new_object.find('.objects .short-date-view').html(show_date(timestamp*1000-(new Date().getTimezoneOffset()*60000),true,false,false));
					indicator.data('busy','0');
					check_load_more();
				}
			}
		}
	});
}

function check_load_more(){
	let scroll_top=window.pageYOffset;
	let window_height=window.innerHeight;
	let view=$('.view[data-level="'+level+'"]');
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

$(window).on('hashchange',function(e){
	e.preventDefault();
	parse_fullpath();
	view_path(path,{},true,false);
});

parse_fullpath();
view_path(path,{},false,false);
render_menu();
render_session();

document.addEventListener('click',app_mouse,false);
document.addEventListener('tap',app_mouse,false);
document.addEventListener('keyup',app_keyboard,false);

document.addEventListener('scroll',function(){
	check_load_more();
});
window.onresize=function(){
	check_load_more();
}