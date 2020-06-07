var api_gates=[
	'https://node.viz.plus/',
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

if(null!=localStorage.getItem('users')){
	users=JSON.parse(localStorage.getItem('users'));
}
if(null!=localStorage.getItem('current_user')){
	current_user=localStorage.getItem('current_user');
}

function save_session(){
	let users_json=JSON.stringify(users);
	localStorage.setItem('users',users_json);
	localStorage.setItem('current_user',current_user);
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
	none_notice:'<div class="none-notice"><em>Ничего не найдено.</em></div>',
	error_notice:'<div class="error-notice"><em>{error}</em></div>',
	loader_notice:'<div class="loader-notice"><span class="submit-button-ring"></span></div>',

	account_settings:'<a data-href="fsp:account_settings">[настройки]</a>',
	account_settings_caption:'Настройки аккаунта',
	account_seetings_empty_account:'Введите аккаунт',
	account_seetings_empty_regular_key:'Введите регулярный ключ',
	account_seetings_account_not_found:'Аккаунт не найден',
	account_settings_saved:'Данные аккаунта сохранены',

	view_profile:'<a data-href="viz://@{account}/">[профиль]</a>',

	invalid_regular_key:'Предоставленный ключ недействителен',
	not_found_regular_key:'Предоставленный ключ не подходит',

	search:'<a data-href="fsp:search">[поиск]</a>',
	search_caption:'Поиск',

	gateway_error:'Ошибка, попробуйте позже',
	account_not_found:'Пользователь не найден',

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
	profile_contacts_github:'<a href="https://github.com/{github}" target="_blank" class="profile-contacts-github">[github]</a>',
	profile_contacts_telegram:'<a href="tg://resolve?domain={telegram}" target="_blank" class="profile-contacts-telegram">[telegram]</a>',
	tabs:'<div class="tabs">{tabs}</div>',

	header_back_action:'<a class="back-action">[назад]</a>',
	header_link:'<div class="link grow"><input type="text" class="header-link" value="{link}" disabled></div>',

	edit_profile_link:'<a data-href="fsp:profile">[изменить]</a>',
	new_object_link:'<a data-href="fsp:publish">[написать]</a>',
};

function app_mouse(e){
	if(!e)e=window.event;
	var target=e.target || e.srcElement;
	if(typeof $(target).attr('data-href') != 'undefined'){
		var href=$(target).attr('data-href');
		/*//change menu element state
		if($(target).hasClass('menu-el')){
			if('none'==$('.menu-list').css('float')){
				$('.menu-list').css('display','none');
			}
		}
		*/
		view_path(href,{},true,false);
		e.preventDefault();
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

function view_account_settings(view,path_parts,title){
	document.title=ltmp_arr.account_settings_caption+' - '+title;
	view.find('.header .caption').html(ltmp_arr.account_settings_caption);

	view.find('.button').removeClass('disabled');
	view.find('.submit-button-ring').removeClass('show');
	view.find('.error').html('');
	view.find('.success').html('');

	view.find('input').val('');

	view.find('input[name=viz_account]').val(current_user);
	view.find('input[name=viz_regular_key]').val(users[current_user].regular_key);

	$('.loader').css('display','none');
	view.css('display','block');
}

function view_search(view,path_parts,title){
	document.title=ltmp_arr.search_caption+' - '+title;
	view.find('.header .caption').html(ltmp_arr.search_caption);
	view.find('input[name=search]').val('');
	$('.loader').css('display','none');
	view.css('display','block');
	//focus working only after parent block is show up
	view.find('input[name=search]')[0].focus();
}

function app_keyboard(e){
	if(!e)e=window.event;
	var key=(e.charCode)?e.charCode:((e.keyCode)?e.keyCode:((e.which)?e.which:0));
	let char=String.fromCharCode(key);
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
		if(-1!=location.indexOf('viz://')){
			//check query state
			if(-1!=location.indexOf('?')){
				query=location.substring(location.indexOf('?')+1);
				location=location.substring(0,location.indexOf('?'));
			}
			path_parts=location.substr(location.indexOf('viz://')+6).split('/');
		}
		else{
			if(-1!=location.indexOf('?')){
				query=location.substring(location.indexOf('?')+1);
				location=location.substring(0,location.indexOf('?'));
			}
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

	if(''==path_parts[0]){
		$('.loader').css('display','block');
		$('.view').css('display','none');
		let view=$('.view[data-level="0"]');
		let header='';
		header+=ltmp_arr.account_settings;
		if(''!=current_user){
			header+=ltmp(ltmp_arr.view_profile,{account:current_user});
		}
		header+=ltmp_arr.search;
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
				setTimeout(window['view_'+current_view],1,view,path_parts,title);
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
					viz.api.getAccounts([check_account],function(err,response){
						if(err){
							console.log(err);
							$('.loader').css('display','block');
							$('.view').css('display','none');
							level++;
							let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query,tabs:'',profile:''});
							$('.content').append(new_view);
							let view=$('.view[data-level="'+level+'"]');
							let header='';
							header+=ltmp_arr.header_back_action;
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
								level++;
								let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query,tabs:'',profile:''});
								$('.content').append(new_view);
								let view=$('.view[data-level="'+level+'"]');
								let header='';
								header+=ltmp_arr.header_back_action;
								header+=ltmp(ltmp_arr.header_link,{link:location});
								view.find('.header').html(header);
								view.find('.objects').html(ltmp(ltmp_arr.error_notice,{error:ltmp_arr.account_not_found}));
								$('.loader').css('display','none');
								view.css('display','block');
							}
							else{
								let profile_view='';
								let profile_obj={};
								let profile_found=false;
								let json_metadata={};
								if(''!=response[0].json_metadata){
									json_metadata=JSON.parse(response[0].json_metadata);
								}

								if(typeof json_metadata.profile.nickname){
									profile_obj.nickname=escape_html(json_metadata.profile.nickname);
								}
								if(typeof json_metadata.profile.nickname){
									profile_obj.avatar=escape_html(json_metadata.profile.avatar);
								}
								if(typeof json_metadata.profile.about){
									profile_obj.about=escape_html(json_metadata.profile.about);
									profile_view+=ltmp(ltmp_arr.profile_about,{about:profile_obj.about});
									profile_found=true;
								}
								let profile_contacts='';
								if(typeof json_metadata.profile.services != 'undefined'){
									if(typeof json_metadata.profile.services.github != 'undefined'){
										profile_obj.github=escape_html(json_metadata.profile.services.github);
										profile_contacts+=ltmp(ltmp_arr.profile_contacts_telegram,{github:profile_obj.github});
										profile_found=true;
									}
									if(typeof json_metadata.profile.services.telegram != 'undefined'){
										profile_obj.telegram=escape_html(json_metadata.profile.services.telegram);
										profile_contacts+=ltmp(ltmp_arr.profile_contacts_telegram,{telegram:profile_obj.telegram});
										profile_found=true;
									}
									if(''!=profile_contacts){
										profile_view+=ltmp(ltmp_arr.profile_contacts,{contacts:profile_contacts});
									}
								}

								let profile='';
								if(profile_found){
									profile=ltmp(ltmp_arr.profile,{profile:profile_view});
								}

								$('.loader').css('display','block');
								$('.view').css('display','none');
								level++;
								let new_view=ltmp(ltmp_arr.view,{level:level,path:location,query:query,tabs:'',profile:profile});
								$('.content').append(new_view);
								let view=$('.view[data-level="'+level+'"]');
								let header='';
								header+=ltmp_arr.header_back_action;
								header+=ltmp(ltmp_arr.header_link,{link:location});
								if(check_account==current_user){
									header+=ltmp_arr.edit_profile_link;
									header+=ltmp_arr.new_object_link;
								}
								view.find('.header').html(header);
								view.find('.objects').html(ltmp_arr.loader_notice);
								$('.loader').css('display','none');
								view.css('display','block');
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

$(window).on('hashchange',function(e){
	e.preventDefault();
	parse_fullpath();
	view_path(path,{},true,false);
});

parse_fullpath();
view_path(path,{},false,false);

document.addEventListener('click',app_mouse,false);
document.addEventListener('tap',app_mouse,false);
document.addEventListener('keyup',app_keyboard,false);