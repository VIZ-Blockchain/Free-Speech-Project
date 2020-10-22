var ltmp_ru_arr={
	preset_view_account_settings:`
	<div class="object type-text">
		<div class="object-column">
			<div class="content-view">
				<p>Аккаунт в VIZ:</p>
				<p><input type="text" name="viz_account" value=""></p>
				<div class="input-addon">(регистрация через <a href="https://start.viz.plus/" target="_blank">start.viz.plus</a>)</div>
				<p>Приватный обычный ключ:</p>
				<p><input type="password" name="viz_regular_key" value=""></p>
				<div class="input-addon">(regular private key)</div>
				<p class="error save-account-error"></p>
				<p class="success save-account-success"></p>
				<p><a class="button save-account-action">Сохранить</a><span class="submit-button-ring"></span></p>
				<hr>
				<p><a class="button neutral-button remove-account-action">Очистить</a></p>
			</div>
		</div>
	</div>`,
	preset_view_app_settings:`
	<div class="object type-text">
		<div class="object-column">
			<div class="content-view" data-tab="main">
				<p>Максимальное количество хранимых записей пользователя:</p>
				<p><input type="text" name="activity_size" placeholder="0" value=""></p>
				<div class="input-addon">(0 — без ограничений)</div>

				<p>Частота загрузки активности пользователей:</p>
				<p><input type="text" name="activity_period" placeholder="30" value=""></p>
				<div class="input-addon">(в минутах после обновления)</div>

				<p>Глубина загрузки активности пользователей:</p>
				<p><input type="text" name="activity_deep" placeholder="50" value=""></p>
				<div class="input-addon">(действует при активации обновления)</div>

				<p>Частота обновления профилей пользователей:</p>
				<p><input type="text" name="user_profile_ttl" placeholder="60" value=""></p>
				<div class="input-addon">(в минутах после последнего обновления)</div>

				<p>Длительность хранения кэша незнакомых пользователей:</p>
				<p><input type="text" name="user_cache_ttl" placeholder="10" value=""></p>
				<div class="input-addon">(в минутах после загрузки)</div>

				<p>Длительность хранения записей незнакомых пользователей:</p>
				<p><input type="text" name="object_cache_ttl" placeholder="10" value=""></p>
				<div class="input-addon">(в минутах после загрузки)</div>

				<hr>
				<p>Настройки награждений:</p>
				<p><label><input type="checkbox" name="silent_award"> &mdash; очищать заметку</label></p>
				<div class="input-addon">(никто не будет знать за что получена награда)</div>

				<p>Используемый процент энергии при награждении:</p>
				<p><input type="text" name="energy" placeholder="1%" value=""></p>
				<div class="input-addon">(регенерируется 20% за сутки)</div>

				<p class="error save-settings-error"></p>
				<p class="success save-settings-success"></p>
				<p><a class="button save-settings-action">Сохранить</a><span class="submit-button-ring"></span></p>
				<hr>
				<p><a class="button neutral-button reset-settings-action">Сбросить все настройки</a></p>
				<p><a class="button neutral-button reset-database-action">Сбросить состояние базы данных</a></p>
			</div>
			<div class="content-view" data-tab="feed">
				<p>Максимальное количество записей в ленте новостей:</p>
				<p><input type="text" name="feed_size" placeholder="10000" value=""></p>
				<hr>
				<p>Добавление в ленту новостей:</p>
				<p><label><input type="checkbox" name="feed_subscribe_text"> &mdash; посты</label></p>
				<p><label><input type="checkbox" name="feed_subscribe_shares"> &mdash; репосты</label></p>
				<p><label><input type="checkbox" name="feed_subscribe_mentions"> &mdash; упоминания</label></p>
				<p><label><input type="checkbox" name="feed_subscribe_replies"> &mdash; ответы другим пользователям</label></p>

				<p class="error save-feed-settings-error"></p>
				<p class="success save-feed-settings-success"></p>
				<p><a class="button save-feed-settings-action">Сохранить</a><span class="submit-button-ring"></span></p>
			</div>
			<div class="content-view" data-tab="theme">
				<p>Используемая тема:</p>
				<p><label><input type="radio" name="theme-mode" value="light"> &mdash; дневная</label></p>
				<p><label><input type="radio" name="theme-mode" value="night"> &mdash; ночная</label></p>
				<p><label><input type="radio" name="theme-mode" value="auto"> &mdash; автоматический режим</label></p>
				<hr>
				<p>Ночная тема:</p>
				<p><label><input type="radio" name="theme-night-mode" value="midnight"> &mdash; полночь</label></p>
				<p><label><input type="radio" name="theme-night-mode" value="dark"> &mdash; тьма</label></p>
				<hr>
				<p>Автоматический режим</p>
				<p>День начинается:</p>
				<p><input type="text" name="theme-auto-light" placeholder="06:00" value=""></p>
				<p>Ночь начинается:</p>
				<p><input type="text" name="theme-auto-night" placeholder="21:00" value=""></p>
				<div class="input-addon">(время в формате HH:MM)</div>

				<p class="error save-theme-settings-error"></p>
				<p class="success save-theme-settings-success"></p>
				<p><a class="button save-theme-settings-action">Сохранить</a><span class="submit-button-ring"></span></p>
			</div>
		</div>
	</div>`,
	preset_view_edit_profile:`
	<div class="object type-text">
		<div class="object-column">
			<div class="content-view">
				<p>Имя:</p>
				<p><input type="text" name="nickname" value=""></p>
				<div class="input-addon">(будет отображаться рядом с аккаунтом <span class="viz_account">&hellip;</span>)</div>

				<p>Немного о себе:</p>
				<p><input type="text" name="about" value=""></p>
				<div class="input-addon">(отображается в вашем профиле)</div>

				<p>Ссылка на аватар:</p>
				<p><input type="text" name="avatar" value="" placeholder="https://"></p>
				<div class="input-addon">(обязательно https://, минимальный размер изображения 49x49 пикселей)</div>

				<p>Интересы:</p>
				<p><input type="text" name="interests" value=""></p>
				<div class="input-addon">(перечислите через запятую, будут преобразованы в тэги для категоризации публикаций в профиле)</div>

				<p>Телеграм:</p>
				<p><input type="text" name="telegram" value=""></p>
				<div class="input-addon">(укажите имя пользователя без символа «@»)</div>

				<p>GitHub:</p>
				<p><input type="text" name="github" value=""></p>
				<div class="input-addon">(укажите имя пользователя)</div>

				<p class="error save-profile-error"></p>
				<p class="success save-profile-success"></p>
				<p><a class="button save-profile-action">Сохранить</a><span class="submit-button-ring"></span></p>
				<p><em>Внимание! Вся информация будет записана в блокчейн, её можно заменить, но невозможно будет «удалить» или «стереть» из истории.</em></p>
			</div>
		</div>
	</div>`,
	publish_interests:`Добавить тэги по вашим интересам:<div class="interests">{interests}</div>`,
	publish_interests_item:`<a class="publish-add-interest-action" data-hashtag="{hashtag}">#{caption}</a>`,
	preset_view_publish:`
	<div class="object type-text">
		<div class="object-column">
			<div class="content-view">
				<div class="object-type-text">
					<div class="text-addon">
						<p>Текст сообщения:</p>
						<p><textarea name="text"></textarea></p>
						<div class="input-addon">(просто текст без разметки)</div>
						<div class="add-interests"></div>
					</div>
					<div class="comment-addon">
						<p>Текст комментария:</p>
						<p><input type="text" name="comment" value=""></p>
						<div class="input-addon">(просто текст без разметки)</div>
						<div class="add-interests"></div>
					</div>
					<div class="reply-addon">
						<p>Комментируемый объект:</p>
						<p><input type="text" name="reply" value=""></p>
						<div class="input-addon">(опциональное поле, содержит адрес на объект)</div>
					</div>
					<div class="share-addon">
						<p>Распространяемый объект:</p>
						<p><input type="text" name="share" value=""></p>
						<div class="input-addon">(опциональное поле, содержит адрес на объект)</div>
					</div>
					<div class="loop-addon">
						<p>Номер блока для создания петли:</p>
						<p><input type="text" name="loop" value=""></p>
						<div class="input-addon">(можно скрыть последние записи или наоборот: восстановить связь)</div>
					</div>
				</div>
				<p class="error publish-error"></p>
				<p class="success publish-success"></p>
				<p><a class="button publish-action">Опубликовать</a><span class="submit-button-ring"></span></p>
				<p><em>Внимание! Вся информация будет записана в блокчейн от аккаунта <span class="viz_account">&hellip;</span>, её невозможно будет «удалить».</em></p>
			</div>
		</div>
	</div>`,

	dapp_startup:`<div class="startup-screen"><div class="startup-logo">{logo}</div><div class="runs-on">Runs on VIZ Blockchain</div></div>`,
	content_view:`
	<div class="object type-text">
		<div class="object-column">
			<div class="content-view">{content}</div>
		</div>
	</div>`,
	settings_item:`
	<p>{caption}:</p>
	<p><input type="text" name="{prop}" placeholder="{placeholder}" value="{value}"></p>
	<div class="input-addon">({addon})</div>`,
	settings_activity_period:`Частота загрузки активности пользователей`,
	settings_addon_activity_period:`в минутах после обновления`,
	users_settings_buttons:`
	<p class="error save-users-settings-error"></p>
	<p class="success save-users-settings-success"></p>
	<p><a class="button save-users-settings-action">Сохранить</a><span class="submit-button-ring"></span></p>
	<hr>
	<p><a class="button neutral-button reset-users-settings-action">Сброс</a></p>`,
	box_addon:`
	<div class="box">
		<div class="box-header">
			<div class="box-title">{caption}</div>
			<div class="box-buttons">
				{button}
			</div>
		</div>
		{context}
	</div>`,
	hashtags_addon_caption:'# Тэги',
	hashtags_addon_button:'<a tabindex="0" data-href="dapp:hashtags" title="Управление тэгами">{icon}</a>',
	hashtags_pinned_caption:'Закрепленные',
	hashtags_popular_caption:'Популярные',
	hashtags_main_tab:'Все',
	hashtags_pinned_tab:'Закрепленные',
	hashtags_ignored_tab:'Игнорируемые',
	hashtags_objects_header:`<div class="hashtag-item nohover"><div class="hashtag-item-num">№</div><div class="hashtag-item-caption">Тэг</div><div class="hashtag-item-count">Количество</div></div>`,
	hashtags_objects_item:`<div class="hashtag-item"><div class="hashtag-item-num">{num}</div><div class="hashtag-item-caption"><a data-href="dapp:hashtags/{tag}">#{tag}</a></div><div class="hashtag-item-count">{count}</div></div>`,

	found_results:'Найдено: {count}',

	profile_main_tab:'Все',
	profile_posts_tab:'Посты',
	profile_shares_tab:'Репосты',
	profile_replies_tab:'Ответы',

	users_main_tab:'Все',
	users_subscribed_tab:'Подписки',
	users_ignored_tab:'Игнорируемые',
	users_objects_box:`<div class="user-item-box">{context}</div>`,
	users_objects_header:`
	<div class="user-item-box"><input type="text" class="user-item-search" placeholder="Быстрый поиск" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></div>
	<div class="user-item-box search-results"></div>
	`,
	users_objects_item:`
	<div class="user-item" data-search="{search}">
		<div class="user-item-avatar">{avatar}</div>
		<a class="user-item-nickname" tabindex="0" data-href="viz://@{account}/">{nickname}</a>
		<a class="user-item-account" tabindex="0" data-href="viz://@{account}/">{account}</a>
		<div class="user-item-manage"><a tabindex="0" data-href="dapp:users/{account}" title="Управление">{icon}</a></div>
	</div>`,
	users_objects_item_avatar:`<div class="avatar"><div class="shadow" data-href="viz://@{account}/"></div><img src="{avatar}"></div>`,

	box_container:`
	<div class="box-container">
		<div class="box-subtitle">{caption}</div>
		{context}
	</div>`,
	box_item:`<div class="box-item"><a data-href="{link}">{caption}</a></div>`,

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
	error_title:'Ошибка',

	awarded_amount:'Награждено на {amount} Ƶ',

	menu_session_empty:'<div class="avatar"><img src="default.png" data-href="dapp:account_settings"></div><a tabindex="0" data-href="dapp:account_settings">{caption}</a>',
	menu_session_login:'Войти',
	menu_session_error:'<span class="error">Ошибка</span>',
	menu_session_account:'<div class="avatar"><div class="shadow" data-href="viz://@{account}/"></div><img src="{avatar}"></div><div class="account"><a class="account-name" tabindex="0" data-href="viz://@{account}/">{nickname}</a><a class="account-login" tabindex="0" data-href="viz://@{account}/">{account}</a></div>',

	none_notice:'<div class="none-notice"><em>Лента новостей пока не работает, попробуйте поиск.<!--<br>Ничего не найдено.--></em></div>',
	whitelabel_notice:`<div class="load-more-end-notice"><em>Загрузка последних публикаций @{account}&hellip;</em><span class="submit-button-ring"></span></div>`,
	feed_end_notice:'<div class="load-more-end-notice"><em>Конец ленты новостей.</em></div>',
	load_more_end_notice:'<div class="load-more-end-notice"><em>Больше ничего не найдено.</em></div>',
	error_notice:'<div class="error-notice"><em>{error}</em></div>',
	empty_loader_notice:'<div class="loader-notice"><span class="submit-button-ring"></span></div>',
	loader_notice:'<div class="loader-notice" data-account="{account}" data-block="{block}"><span class="submit-button-ring"></span></div>',
	feed_loader_notice:'<div class="loader-notice" data-feed-time="{time}"><span class="submit-button-ring"></span></div>',
	notifications_loader_notice:'<div class="loader-notice" data-notifications-id="{id}"><span class="submit-button-ring"></span></div>',
	awards_loader_notice:'<div class="loader-notice" data-awards-id="{id}"><span class="submit-button-ring"></span></div>',
	hashtags_loader_notice:'<div class="loader-notice" data-hashtags-id="{tag_id}" data-hashtags-feed-id="{id}"><span class="submit-button-ring"></span></div>',

	toggle_menu:'<a tabindex="0" title="{title}" class="toggle-menu adaptive-show-inline mobile">{icon}</a>',
	toggle_menu_title:'Переключить меню',
	toggle_menu_icon:'<div><a tabindex="0" title="{title}" class="toggle-menu-icon">{icon}</a></div>',

	toggle_theme_icon:'<div><a tabindex="0" data-href="dapp:app_settings/theme/" title="{title}" class="toggle-theme-icon">{icon}</a></div>',
	toggle_theme_title:'Настроить оформление',

	icon_counter:`<div class="icon-counter counter-{name}">{count}</div>`,

	account_settings:'<a tabindex="0" data-href="dapp:account_settings" title="Настройки аккаунта">{icon_account_settings}</a>',
	account_settings_caption:'Настройки аккаунта',
	account_settings_empty_account:'Введите аккаунт',
	account_settings_empty_regular_key:'Введите регулярный ключ',
	account_settings_account_not_found:'Аккаунт не найден',
	account_settings_saved:'Данные аккаунта сохранены',
	account_settings_reset:'Данные аккаунта удалены',

	notifications_caption:'Уведомления',
	awards_caption:'Награждения',
	hashtags_caption:'Тэги',
	users_caption:'Пользователи',
	app_settings_caption:'Настройки приложения',
	app_settings_saved:'Настройки сохранены',
	app_settings_reset:'Настройки сброшены',
	app_settings_main_tab:'Общие',
	app_settings_feed_tab:'Лента новостей',
	app_settings_theme_tab:'Оформление',

	view_profile:'<a tabindex="0" data-href="viz://@{account}/" title="Просмотреть профиль">{icon_view_profile}</a>',

	invalid_regular_key:'Предоставленный ключ недействителен',
	not_found_regular_key:'Предоставленный ключ не подходит',

	search_caption:'Поиск',
	search_empty_input:'Введите адрес для поиска',

	gateway_error:'Ошибка, попробуйте позже',
	account_not_found:'Пользователь не найден',
	object_not_found:'Объект не найден',
	block_not_found:'Блок не найден, попробуйте позже',
	data_not_found:'Данные не найдены',
	hashtags_not_found:'Тэг не найден',
	users_not_found:'Пользователи не найдены',

	view:`
		<div class="view" data-level="{level}" data-path="{path}" data-query="{query}">
			<div class="header space-between"></div>
			{profile}
			{tabs}
			<div class="objects"></div>
		</div>`,
	profile:'<div class="profile">{profile}</div>',
	profile_about:'<div class="about">{about}</div>',
	profile_interests:'<div class="interests">{interests}</div>',
	profile_interests_item:`<a class="profile-select-interest-action" data-hashtag="{hashtag}">#{caption}</a>`,
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
	menu_hashtags:'Тэги',
	menu_users:'Пользователи',
	menu_notifications:'Уведомления',
	menu_awards:'Награждения',
	menu_app_settings:'Настройки',
	menu_account_settings:'Аккаунт',

	icon_back:`<i class="icon back"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></i>`,
	icon_gem:`<i class="icon gem"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6.3499998 6.3500002" height="24" width="24" fill="none" stroke="currentColor" stroke-width="0.4" stroke-linecap="round" stroke-linejoin="round"><path d="m 1.019418,1.20416 1.108597,0.36953 m 4.0648556,0.86224 -0.8622424,-1.23177 m -5.17345221,1.23177 3.07943611,3.07944 2.9562585,-3.07944 -1.6013069,0.49271 -1.3549516,2.58673 -1.4781293,-2.58673 -1.60130681,-0.49271 0.86224211,-1.23177 1.2317745,-0.36953 h 1.8476616 l 1.231774,0.36953 -1.1085967,0.36953 H 2.128015 l -0.3695322,1.35495 h 2.8330809 l -0.3695322,-1.35495"/></svg></i>`,
	icon_reply:`<i class="icon reply"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M14 22.5L11.2 19H6a1 1 0 0 1-1-1V7.103a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1h-5.2L14 22.5zm1.839-5.5H21V8.103H7V17H12.161L14 19.298 15.839 17zM2 2h17v2H3v11H1V3a1 1 0 0 1 1-1z"/></svg></i>`,
	icon_share:`<i class="icon share"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M3,12c0,1.654,1.346,3,3,3c0.794,0,1.512-0.315,2.049-0.82l5.991,3.424C14.022,17.734,14,17.864,14,18c0,1.654,1.346,3,3,3 s3-1.346,3-3s-1.346-3-3-3c-0.794,0-1.512,0.315-2.049,0.82L8.96,12.397C8.978,12.266,9,12.136,9,12s-0.022-0.266-0.04-0.397 l5.991-3.423C15.488,8.685,16.206,9,17,9c1.654,0,3-1.346,3-3s-1.346-3-3-3s-3,1.346-3,3c0,0.136,0.022,0.266,0.04,0.397 L8.049,9.82C7.512,9.315,6.794,9,6,9C4.346,9,3,10.346,3,12z"/></svg></i>`,

	icon_users:`<i class="icon users"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M2 22a8 8 0 1 1 16 0h-2a6 6 0 1 0-12 0H2zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm8.284 3.703A8.002 8.002 0 0 1 23 22h-2a6.001 6.001 0 0 0-3.537-5.473l.82-1.824zm-.688-11.29A5.5 5.5 0 0 1 21 8.5a5.499 5.499 0 0 1-5 5.478v-2.013a3.5 3.5 0 0 0 1.041-6.609l.555-1.943z"/></svg></i>`,
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
	icon_hashtag:`<i class="icon hashtag"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7.784 14l.42-4H4V8h4.415l.525-5h2.011l-.525 5h3.989l.525-5h2.011l-.525 5H20v2h-3.784l-.42 4H20v2h-4.415l-.525 5h-2.011l.525-5H9.585l-.525 5H7.049l.525-5H4v-2h3.784zm2.011 0h3.99l.42-4h-3.99l-.42 4z"/></svg></i>`,
	icon_pin:`<i class="icon pin"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13.828 1.686l8.486 8.486-1.415 1.414-.707-.707-4.242 4.242-.707 3.536-1.415 1.414-4.242-4.243-4.95 4.95-1.414-1.414 4.95-4.95-4.243-4.242 1.414-1.415L8.88 8.05l4.242-4.242-.707-.707 1.414-1.415zm.708 3.536l-4.671 4.67-2.822.565 6.5 6.5.564-2.822 4.671-4.67-4.242-4.243z"/></svg></i>`,
	icon_eye_ignore:`<i class="icon eye-ignore"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.882 19.297A10.949 10.949 0 0 1 12 21c-5.392 0-9.878-3.88-10.819-9a10.982 10.982 0 0 1 3.34-6.066L1.392 2.808l1.415-1.415 19.799 19.8-1.415 1.414-3.31-3.31zM5.935 7.35A8.965 8.965 0 0 0 3.223 12a9.005 9.005 0 0 0 13.201 5.838l-2.028-2.028A4.5 4.5 0 0 1 8.19 9.604L5.935 7.35zm6.979 6.978l-3.242-3.242a2.5 2.5 0 0 0 3.241 3.241zm7.893 2.264l-1.431-1.43A8.935 8.935 0 0 0 20.777 12 9.005 9.005 0 0 0 9.552 5.338L7.974 3.76C9.221 3.27 10.58 3 12 3c5.392 0 9.878 3.88 10.819 9a10.947 10.947 0 0 1-2.012 4.592zm-9.084-9.084a4.5 4.5 0 0 1 4.769 4.769l-4.77-4.769z"/></svg></i>`,

	icon_menu_collapse:`<i class="icon menu-collapse"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18 6H20V18H18zM10 11L4 11 4 13 10 13 10 18 16 12 10 6z"/></svg></i>`,
	icon_menu_expand:`<i class="icon menu-expand"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18 6H20V18H18zM10 18L10 13 16 13 16 11 10 11 10 6 4 12z"/></svg></i>`,
	icon_theme_moon:`<i class="icon theme-moon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.742,13.045c-0.677,0.18-1.376,0.271-2.077,0.271c-2.135,0-4.14-0.83-5.646-2.336c-2.008-2.008-2.799-4.967-2.064-7.723 c0.092-0.345-0.007-0.713-0.259-0.965C10.444,2.04,10.077,1.938,9.73,2.034C8.028,2.489,6.476,3.382,5.241,4.616 c-3.898,3.898-3.898,10.243,0,14.143c1.889,1.889,4.401,2.93,7.072,2.93c2.671,0,5.182-1.04,7.07-2.929 c1.236-1.237,2.13-2.791,2.583-4.491c0.092-0.345-0.008-0.713-0.26-0.965C21.454,13.051,21.085,12.951,20.742,13.045z M17.97,17.346c-1.511,1.511-3.52,2.343-5.656,2.343c-2.137,0-4.146-0.833-5.658-2.344c-3.118-3.119-3.118-8.195,0-11.314 c0.602-0.602,1.298-1.102,2.06-1.483c-0.222,2.885,0.814,5.772,2.89,7.848c2.068,2.069,4.927,3.12,7.848,2.891 C19.072,16.046,18.571,16.743,17.97,17.346z"/></svg></i>`,
	icon_theme_full_moon:`<i class="icon theme-full-moon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12,11.807C9.349,9.155,8.7,5.261,10.049,2c-1.875,0.37-3.666,1.281-5.12,2.735c-3.905,3.905-3.905,10.237,0,14.142	c3.906,3.906,10.237,3.905,14.143,0c1.454-1.454,2.364-3.244,2.735-5.119C18.545,15.106,14.651,14.458,12,11.807z"/></svg></i>`,
	icon_theme_sun:`<i class="icon theme-sun"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg></i>`,

	header_back_action:`<a tabindex="0" class="back-action" title="Назад" data-force="{force}">{icon}</a>`,
	header_link:'<div class="link grow"><div class="header-link-wrapper"><input type="text" class="header-link" value="{link}"><div class="header-link-icons">{icons}</div></div></div>',
	header_link_icons:`
		<i tabindex="0" class="icon copy icon-copy-action" title="Копировать адрес"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20,2H10C8.897,2,8,2.897,8,4v4H4c-1.103,0-2,0.897-2,2v10c0,1.103,0.897,2,2,2h10c1.103,0,2-0.897,2-2v-4h4 c1.103,0,2-0.897,2-2V4C22,2.897,21.103,2,20,2z M4,20V10h10l0.002,10H4z M20,14h-4v-4c0-1.103-0.897-2-2-2h-4V4h10V14z"/></svg></i>
		<i tabindex="0" class="icon search icon-search-action" title="Перейти"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.023,16.977c-0.513-0.488-1.004-0.997-1.367-1.384c-0.372-0.378-0.596-0.653-0.596-0.653l-2.8-1.337 C15.34,12.37,16,10.763,16,9c0-3.859-3.14-7-7-7S2,5.141,2,9s3.14,7,7,7c1.763,0,3.37-0.66,4.603-1.739l1.337,2.8 c0,0,0.275,0.224,0.653,0.596c0.387,0.363,0.896,0.854,1.384,1.367c0.494,0.506,0.988,1.012,1.358,1.392 c0.362,0.388,0.604,0.646,0.604,0.646l2.121-2.121c0,0-0.258-0.242-0.646-0.604C20.035,17.965,19.529,17.471,19.023,16.977z M9,14 c-2.757,0-5-2.243-5-5s2.243-5,5-5s5,2.243,5,5S11.757,14,9,14z"/></svg></i>`,
	header_caption:'<div class="caption grow">{caption}</div>',
	header_caption_link:'<a data-href="{link}" tabindex="0" class="caption grow">{caption}</a>',
	icon_link:'<a tabindex="0" class="{action}-action{addon}" title="{caption}">{icon}</a>',
	clear_awards_caption:'Очистить историю наград',
	pin_hashtags_caption:'Закрепить',
	ignore_hashtags_caption:'Игнорировать',
	clear_hashtags_caption:'Удалить тэг',
	mark_readed_notifications_caption:'Отметить прочитанными',
	clear_readed_notifications_caption:'Удалить прочитанные уведомления',

	user_actions_open:'<div class="user-actions" data-user="{user}">',
	user_actions_close:'</div>',
	subscribe_link:'<a tabindex="0" class="subscribe-action" title="Подписаться на пользователя">{icon}</a>',
	subscribed_link:'<a tabindex="0" class="subscribed-action positive" title="Вы подписаны на пользователя">{icon}</a>',
	unsubscribe_link:'<a tabindex="0" class="unsubscribe-action" title="Отписаться от пользователя">{icon}</a>',
	ignore_link:'<a tabindex="0" class="ignore-action" title="Игнорировать пользователя">{icon}</a>',
	ignored_link:'<a tabindex="0" class="ignored-action negative" title="Вы игнорируете пользователя">{icon}</a>',
	unignore_link:'<a tabindex="0" class="unignore-action" title="Прекратить игнорировать пользователя">{icon}</a>',
	edit_profile_link:'<a tabindex="0" data-href="dapp:edit_profile" title="Изменить профиль">{icon_edit_profile}</a>',
	edit_profile_caption:'Настройка профиля',
	edit_profile_saved:'Профиль сохранен',
	new_object_link:'<a tabindex="0" data-href="dapp:publish" title="Написать">{icon_new_object}</a>',

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
	object_type_text_loading:`<div class="object type-text-loading" data-account="{account}" data-block="{block}" data-link="{link}" data-previous="{previous}" data-is-reply="{is_reply}" data-is-share="{is_share}">{context}</div>`,
	object_type_text_wait_loading:`<div class="object type-text-wait-loading" data-link="{link}"><div class="load-content"><div class="load-placeholder"><span class="loading-ring"></span></div></div></div>`,
	object_type_text_share:`
	<div class="share-view"><a tabindex="0" data-href="{link}">{caption}</a> поделился:{comment}</div>
	<div class="load-content"><div class="load-placeholder"><span class="loading-ring"></span></div></div>`,
	object_type_text_share_comment:` <div class="comment-view">{comment}</div>`,
	object_type_text_preview:`
		<div class="object type-text-preview" data-account="{account}" data-block="{block}" data-link="{link}" data-previous="{previous}" data-is-reply="{is_reply}" data-is-share="{is_share}">
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