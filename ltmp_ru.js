var ltmp_ru_arr = {
	reg_service_domain: `start.viz.plus`,
	reg_service_link: `https://start.viz.plus/`,
	reg_service_caption: `Регистрация`,
	left_addon_reg_button: '<div taborder="0" class="reg-button">%%reg_service_caption%%</div>',

	preset_view_account: `
	<div class="object type-text">
		<div class="object-column">
			<div class="content-view" data-tab="credentials">
				<p>Аккаунт в VIZ:</p>
				<p><input type="text" name="viz_account" value=""></p>
				<div class="input-addon">(регистрация через <a href="%%reg_service_link%%" target="_blank">%%reg_service_domain%%</a>)</div>
				<p>Приватный обычный ключ:</p>
				<p><input type="password" name="viz_regular_key" value=""></p>
				<div class="input-addon">(regular private key)</div>
				<p class="error save-account-error"></p>
				<p class="success save-account-success"></p>
				<p><a class="button save-account-action">Сохранить</a><span class="submit-button-ring"></span></p>
				<hr>
				<p><a class="button neutral-button remove-account-action">Выйти из аккаунта ВИЗ</a></p>
			</div>
			<div class="content-view" data-tab="profile">
				<p>Имя:</p>
				<p><input type="text" name="nickname" value=""></p>
				<div class="input-addon">(будет отображаться рядом с аккаунтом <span class="viz_account">&hellip;</span>)</div>

				<p>Немного о себе:</p>
				<p><input type="text" name="about" value=""></p>
				<div class="input-addon">(отображается в вашем профиле)</div>

				<p>Ссылка на аватар:</p>
				<p><input type="text" name="avatar" value="" placeholder="https://"></p>
				<div class="input-addon">(загрузить изображение через: <a class="ipfs-upload-profile-avatar-action">IPFS</a>, <a class="sia-upload-profile-avatar-action">Sia</a>, допустимы ссылки https://, ipfs://, sia://, минимальный размер изображения 49x49 пикселей)</div>

				<p>Интересы:</p>
				<p><input type="text" name="interests" value=""></p>
				<div class="input-addon">(перечислите через запятую, будут преобразованы в тэги для поиска в профиле)</div>

				<p>Категории:</p>
				<p><input type="text" name="categories" value=""></p>
				<div class="input-addon">(перечислите через запятую, будут преобразованы в тэги для категоризации публикаций в профиле)</div>

				<p>Закрепленная запись:</p>
				<p><input type="text" name="pinned_object" value=""></p>
				<div class="input-addon">(укажите ссылку вида viz://@account/block/)</div>

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
			<div class="content-view" data-tab="qr">
				<p>Вы можете быстро импортировать аккаунт просканировав данный QR-код с другого устройства.</p>
				<div class="objects"></div>
			</div>
			<div class="content-view" data-tab="scan_qr">
				<p>Откройте «Аккаунт»&rarr;«Экспорт через QR» на устройстве с выполненным входом и отсканируйте QR-код с него.</p>
				<div class="objects"></div>
			</div>
		</div>
	</div>
	`,
	preset_view_app_settings: `
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

				<p>Длительность хранения превью ссылок:</p>
				<p><input type="text" name="preview_cache_ttl" placeholder="7200" value=""></p>
				<div class="input-addon">(в минутах после загрузки)</div>

				<hr>
				<p>Настройки <span class="tooltip" title="Not safe/suitable for work — контент содержащий информацию для взрослых">NSFW-контента</span>:</p>
				<p><label><input type="checkbox" name="nsfw_warning"> &mdash; скрывать за спойлер с предупреждением</label></p>
				<div class="input-addon">(при нажатии контент будет показан)</div>

				<p>Тэги для пометки записей как содержащий NSFW-контент:</p>
				<p><input type="text" name="nsfw_hashtags" placeholder="nsfw, sex, porn..." value=""></p>
				<div class="input-addon">(перечислите через запятую, применимо к новым объектам)</div>

				<hr>
				<p>Настройки награждений:</p>
				<p><label><input type="checkbox" name="silent_award"> &mdash; очищать заметку</label></p>
				<div class="input-addon">(никто не будет знать за что получена награда)</div>

				<p>Используемый процент энергии при награждении:</p>
				<p><input type="text" name="energy" placeholder="1%" value=""></p>
				<div class="input-addon">(регенерируется 20% за сутки)</div>

				<hr>
				<p>При создании шифрованного объекта:</p>
				<p><label><input type="checkbox" name="save_passphrase_on_publish"> &mdash; сохранять кодовую фразу</label></p>
				<div class="input-addon">(по умолчанию отключено)</div>

				<p class="error save-settings-error"></p>
				<p class="success save-settings-success"></p>
				<p><a class="button save-settings-action">Сохранить</a><span class="submit-button-ring"></span></p>
				<hr>
				<p><a class="button neutral-button install-action"></a></p>
				<p><a class="button neutral-button reset-settings-action">Сбросить все настройки</a></p>
				<p><a class="button neutral-button delete-all-passphrases-action">Удалить все сохраненные кодовые фразы</a></p>
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
			<div class="content-view" data-tab="connection">
				<p>Выберите ноду из списка:</p>
				<div class="api-gates-list">
				</div>
				<p>Или задайте адрес вручную:</p>
				<p><input type="text" name="api_gate_str" placeholder="https://" value=""></p>
				<div class="input-addon">(рекомендуется использовать HTTPS протокол для конфиденциальности)</div>
				<hr>
				<p class="error save-connection-settings-error"></p>
				<p class="success save-connection-settings-success"></p>
				<p><a class="button save-connection-settings-action">Сохранить</a><span class="submit-button-ring"></span></p>
			</div>
			<div class="content-view" data-tab="languages">
				<p>Выберите предпочтительный язык для заголовков, кнопок и другого текста:</p>
				<div class="languages-list">
				</div>
				<p><a class="button save-languages-settings-action">Сохранить</a></p>
			</div>
			<div class="content-view" data-tab="sync">
				<p><label><input type="checkbox" name="sync-cloud"> &mdash; автоматическая синхронизация с облаком</label></p><hr>
				<p>
					<strong>Внимание!</strong>
					Экспорт направлен на сохранение последних и актуальных записей из базы данных приложения, приватный ключ не сохраняется.
				</p>
				<p>
					Синхронизация с облачным хранилищем проверяет наличие подписи данных приватным ключом аккаунта и позволяет синхронизировать последние изменения подписок между несколькими экземплярами приложений (например, на ПК и смартфоне). Для этого достаточно войти в приложение на другом устройстве и подождать, когда синхронизация будет закончена.
				</p>
				<p>
					Если у вас включена синхронизация с облаком, то действия с пользователями и тэгами будут восстановлены на другом экземпляре приложения. Сохранение резервной копии является новой точкой отсчета (синхронизация будет начинаться с неё).
				</p>
				<p><label><input type="checkbox" name="sync-users"> &mdash; пользователи</label></p>
				<p><label><input type="checkbox" name="sync-feed"> &mdash; лента новостей</label></p>
				<p><label><input type="checkbox" name="sync-replies"> &mdash; ответы</label></p>
				<p><label><input type="checkbox" name="sync-hashtags"> &mdash; тэги</label></p>
				<p><label><input type="checkbox" name="sync-awards"> &mdash; награждения</label></p>
				<p><label><input type="checkbox" name="sync-settings"> &mdash; настройки</label></p>
				<p>Максимальное количество записей:</p>
				<p><input type="text" name="sync-size" placeholder="" value=""></p>
				<div class="input-addon">(для ленты новостей, ответов, тэгов, награждений)</div>

				<p class="error sync-export-error"></p>
				<p class="success sync-export-success"></p>
				<p><a class="button sync-export-file-action">Экспортировать в файл</a><span class="submit-button-ring" rel="export-file"></span></p>
				<p><a class="button sync-export-cloud-action">Сохранить резервную копию в облако</a><span class="submit-button-ring" rel="export-cloud"></span></p>
				<hr>
				<p>
					Импортирование сохраненного состояния происходит в несколько этапов, старые данные приложения будут удалены, новые восстановлены, а приложение будет планово перезапущено.
				</p>
				<p class="success sync-import-success"></p>
				<p class="error sync-import-error"></p>
				<p><a class="button sync-import-file-action">Импортировать из файла</a><span class="submit-button-ring" rel="import-file"></span></p>
				<p><a class="button sync-import-cloud-action">Сброс и синхронизация из облака</a><span class="submit-button-ring" rel="import-cloud"></span></p>
			</div>
		</div>
	</div>`,
	api_list_item:`<p><label><input type="radio" name="api_gate" value="{value}"{selected}> &mdash; {domain}</label></p>`,
	languages_list_item:`<p><label><input type="radio" name="language" value="{value}"{selected}> &mdash; {caption}</label></p>`,
	languages_short_list_item:`<div class="select-language-wrapper"><a class="select-language{selected}" data-value="{value}">{caption}</a></div>`,
	documents_short_list_item:`<div class="select-document-wrapper"><a class="select-document{selected}" data-value="{value}">{caption}</a></div>`,

	node_request:'Отправляем запрос ноде&hellip;',
	node_not_respond:'Нода не отвечает',
	node_wrong_response:'Ответ от ноды не соответствует формату',
	node_protocol_error:'Адрес ноды должен содержать протокол (http/https/ws/wss)',
	node_empty_error:'Адрес ноды не может быть пустым',
	node_success:'Нода установлена использумой по умолчанию',

	gate_connection_error:'<div class="gate-connection-error">Ошибка в подключении, <a tabindex="0" data-href="dapp:app_settings/connection/">проверьте соединение&hellip;</a></div>',

	install_caption: `Установить приложение`,
	publish_interests: `Добавить тэги по вашим интересам:<div class="interests">{interests}</div>`,
	publish_interests_item: `<a class="publish-add-interest-action" data-hashtag="{hashtag}">#{caption}</a>`,
	publish_categories: `Добавить тэг по вашим категориям:<div class="categories">{categories}</div>`,
	publish_categories_item: `<a class="publish-add-category-action" data-hashtag="{hashtag}">#{caption}</a>`,
	article_settings: `
	<p>Аннотация к публикации:</p>
	<p><input type="text" name="description" value=""></p>
	<div class="input-addon">(просто текст без разметки)</div>
	<p>Миниатюра изображения:</p>
	<p><input type="text" name="thumbnail" value=""></p>
	<div class="input-addon">(загрузить изображение через: <a class="ipfs-upload-article-thumbnail-action">IPFS</a>, <a class="sia-upload-article-thumbnail-action">Sia</a>, допустимы ссылки https://, ipfs://, sia://)</div>
	<div class="add-interests"></div>
	<div class="add-categories"></div>

	<div class="edit-event-addon">
		<hr>
		<p>Редактируемый объект:</p>
		<p><input type="text" name="edit-event-object" value=""></p>
		<div class="input-addon">(опциональное поле, содержит адрес на объект)</div>
	</div>

	<div class="toggle-publish-addons"><a tabindex="0" class="toggle-publish-addons-action">%%open_publish_addons%%</a></div>
	<div class="publish-addons">%%publish_addons%%</div>
	`,

	open_publish_addons: `&#x25B8; Дополнительные настройки`,
	close_publish_addons: `&#x25BE; Дополнительные настройки`,
	publish_addons: `
	<div class="encode-passphrase">
		<div class="encode-passphrase-caption">%%encoding_caption%%</div>
		<div class="encode-passphrase-description">%%encoding_description%%</div>
		%%encoding_item%% %%encoding_add_item%%
	</div>
	<div class="beneficiaries-list">
		<div class="beneficiaries-list-caption">%%beneficiaries_list_caption%%</div>
		<div class="beneficiaries-list-description">%%beneficiaries_list_description%%</div>
		%%beneficiaries_list_add%%
	</div>`,
	encoding_caption: `Зашифровать объект`,
	encoding_description: `Укажите пароль, который будет использован для шифрования объекта.<br>
	Любой пользователь сможет расшифровать объект, если он знает пароль.<br>
	<b>Если пароль не указан, объект будет доступен всем.</b><br>
	Если вы укажите несколько паролей, то пользователь будет вынужден расшифровывать объект несколько раз.<br>
	Сверху вниз, с первого пароля, до последнего.<br>
	<em>Комментарии публичны для всех, но опциональны.</em>`,
	encoding_item: `<div class="encode-passphrase-item"><input type="text" name="encode-passphrase" class="round" placeholder="Кодовая фраза..." value=""><input type="text" name="encode-comment" class="round" placeholder="Комментарий..." value=""></div>`,
	encoding_add_item: `<a tabindex="0" class="encode-passphrase-add-item-action" title="Добавить пароль">%%icon_editor_plus%%</a>`,
	beneficiaries_list_caption: `Бенефициары`,
	beneficiaries_list_description: `Укажите пользователей, которые будут получать часть награждений.`,
	beneficiaries_list_add: `%%beneficiaries_item%% %%beneficiaries_add_item%%`,
	beneficiaries_item: `<div class="beneficiaries-item"><input type="text" name="account" class="round" placeholder="Логин" value="{account}"><input type="text" name="weight" class="round" placeholder="Процент от награды" value="{weight}"></div>`,
	beneficiaries_add_item: `<a tabindex="0" class="beneficiaries-add-item-action" title="Добавить бенефициара">%%icon_editor_plus%%</a>`,

	preset_view_publish: `
	<div class="object type-text">
		<div class="object-column">
			<div class="content-view hidden" data-type="article">
				<div class="article-settings">%%article_settings%%</div>
				%%editor_wrapper%%
			</div>
			<div class="content-view" data-type="simple">
				<div class="object-type-text">
					<div class="text-addon">
						<p>Текст сообщения:</p>
						<p><textarea name="text"></textarea></p>
						<div class="input-addon">(просто текст без разметки, прикрепить файл: <a tabindex="0" class="publish-attach-sia-action">sia</a>)</div>
						<div class="add-interests"></div>
						<div class="add-categories"></div>
					</div>
					<div class="comment-addon">
						<p>Текст комментария:</p>
						<p><input type="text" name="comment" value=""></p>
						<div class="input-addon">(просто текст без разметки)</div>
						<div class="add-interests"></div>
						<div class="add-categories"></div>
					</div>
					<div class="reply-addon">
						<p>Комментируемый объект:</p>
						<p><input type="text" name="reply" value=""></p>
						<div class="input-addon">(опциональное поле, содержит адрес на объект)</div>
					</div>
					<div class="share-addon">
						<p>Делимся контентом:</p>
						<p><input type="text" name="share" value=""></p>
						<div class="input-addon">(опциональное поле, содержит адрес на объект)</div>
					</div>
					<div class="loop-addon">
						<p>Номер блока для создания петли:</p>
						<p><input type="text" name="loop" value=""></p>
						<div class="input-addon">(можно скрыть последние записи или наоборот: восстановить связь)</div>
					</div>
					<div class="edit-event-addon">
						<hr>
						<p>Редактируемый объект:</p>
						<p><input type="text" name="edit-event-object" value="" disabled></p>
						<div class="input-addon">(опциональное поле, содержит адрес на объект)</div>
					</div>
				</div>
				<p class="error publish-error"></p>
				<p class="success publish-success"></p>
				<p><a class="button publish-action">Опубликовать</a><span class="submit-button-ring"></span></p>
				<p><em>Внимание! Вся информация будет записана в блокчейн от аккаунта <span class="viz_account">&hellip;</span>, её невозможно будет «удалить».</em></p>
				<div class="toggle-publish-addons"><a tabindex="0" class="toggle-publish-addons-action">%%open_publish_addons%%</a></div>
				<div class="publish-addons">%%publish_addons%%</div>
			</div>
		</div>
	</div>`,

	dapp_startup: `<div class="startup-screen"><div class="startup-logo">{logo}</div><div class="runs-on">Runs on VIZ Blockchain</div></div>`,
	content_view: `
	<div class="object type-text">
		<div class="object-column">
			<div class="content-view">{content}</div>
		</div>
	</div>`,
	dapp_notice: `<div class="menu-notice">Чтобы формировать ленту новостей вам необходимо войти, найти и подписаться на интересных вам пользователей (аналогично новому номеру телефона — общей адресной книги нет, нужно заносить новый контакт вручную).</div>`,
	brand_caption: `Readdle.Me`,
	brand_link: `https://readdle.me/`,
	right_addon_links: `<div class="links"><a tabindex="0" data-href="dapp:manual">Справочник</a></div>`,
	manual_caption: `Справочник`,
	manual_arr: {
		introduction: {
			title: 'Введение', html: `
			<p>Добро пожаловать в справочник по dApp The Free Speech Project под брендом <a href="%%brand_link%%" target="_blank">%%brand_caption%%</a>.</p>
			<p>Здесь вы найдете ответы на часто задаваемые вопросы и помощь при использовании данного приложения.</p>
			<p>Вы используете Decentralized Application — Децентрализованное Приложение (коротко dApp, произносится как диАпп), цель которого предоставить участникам блокчейна Виз (VIZ) общаться и взаимодействовать в распределенной социальной сети через протокол V (Voice).</p>
			<p>Парадигма распределенной социальной сети отличается от привычной централизованной. Основа такой концепции — отказ от посредников. Для этого необходимо вынести привычные и необходимые обществу элементы на новый уровень. Например, лента новостей. Если в современном мире провайдер социальной сети формирует для своих пользователей ленту, он же и может редактировать ее, скрывая какие-то посты или добавляя рекламу. Чтобы не зависеть от чужих решений необходимо взять на себя ответственность и самим выполнять ту или иную роль.</p>
			<p>Вы используете экспериментальное Программное Обеспечение, где алгоритм социальной сети заложен в код. Вы сами должны найти интересных вам пользователей, подписаться на них. Более того, никто об этом не узнает, если вы публично об этом не заявите. Тут нет списка подписчиков, так как это сугубо ваше дело, кого и когда читать.</p>
			<p>При отправке заметок, публикаций, комментариев, обновлении профиля — данные записываются в блокчейн. <b>Их невозможно будет удалить.</b> Вы можете сохранять анонимность, при желании, но если вы раскроете какие-то данные о себе — это ваша зона ответственности. Проявляйте бдительность!</p>
			<p>А теперь мы продолжим приключение и разберемся в разных терминах и нюансах при работе с dApp.</p>
		`},
		viz: {
			title: 'VIZ', html: `
			<p>Блокчейн Виз (VIZ) это социальная платформа работающая на технологии распределенного реестра (DLT). Именно на нем и работает данное приложение, поэтому вам нужен аккаунт в Виз и регулярный приватный ключ (аккаунт можно зарегистрировать через сервис <a href="%%reg_service_link%%" target="_blank">%%reg_service_domain%%</a>).</p>
			<p>Виз быстрый (блок генерируется каждые 3 секунды), управляется через ДАО (выбор делегатов, голосование в комитете, конкуренция за фонд наград) и предоставляет уникальные возможности, такие как:
			<ul>
			<li>Единое пространство имен учетных записей</li>
			<li>Экономика распределения цифрового социального капитала из казначейства на основе справедливой конкуренции (фонд наград)</li>
			<li>Владение долей пропускной способности сети</li>
			<li>Возможность создания новых протоколов и записи данных непосредственно в блокчейн</li>
			</ul>
			</p>
			<p>dApp использует все сильные стороны Виз для взаимодействия пользователей — собственный протокол V (Voice), хранение и изменение метаданных профиля пользователя, ссылки на последнюю активность в протоколе для проверки и загрузки записей для формирования ленты новостей. И, конечно же, награждение авторов понравившихся записей.</p>
			<p>Чтобы наградить пользователя, достаточно нажать на иконку кристалла %%icon_gem%%, и вы увидите примерно расчитанную сумму награждения (символ цифрового социального капитала Ƶ) в всплывающем уведомлении.</p>
			<p>Подробнее узнать про Виз и его концепцию можно на сайте <a href="https://viz.plus/" target="_blank">viz.plus</a> и <a href="https://about.viz.plus/" target="_blank">about.viz.plus</a>.</p>
		`},
		users: {
			title: 'Пользователи', html: `
			<p>По умолчанию вы подписаны на пользователей заданных в самом приложении (например, на <a tabindex="0" data-href="viz://@readdle/">@readdle</a> или <a tabindex="0" data-href="viz://@readdle/">@on1x</a>).</p>
			<p>Вас не будут утомлять спамеры, назойливые продавцы услуг и странные личности. С другой стороны, вам самим нужно будет построить свою социальную сеть, добавляя знакомых шаг за шагом.</p>
			<p>Расширить список пользователей можно и другим способом — встретить их упоминание, репосты или ответы от уже существующих ваших подписок или перейти на них по внешней ссылке.</p>
			<p>Со временем могут появиться сервисы, предоставляющие удобный поиск по пользователям по разным параметрам (так как публичные профили довольно расширяемы и доступны в блокчейне).</p>
			<p>Для подписки на пользователя достаточно нажать на его аватарке и нажать на иконку %%icon_subscribe%% в шапке его профиля.</p>
			<p>Если же вы не хотите видеть пользователя, его посты, которые репостят ваши общие знакомые — то достаточно нажать на иконку %%icon_ignore%% для добавление его в список игнорирования.</p>
		`},
		settings: {
			title: 'Основное меню', html: `
			<p>%%icon_feed%% «Лента» активностей или новостей показывает последние записи пользователей, на которых вы подписаны. При появлении новых записей будет показана кнопка извещающая об этом (при активации они появятся выше нее).</p>
			<hr><p>Пункт %%icon_notify%% «Уведомления» позволяет управлять последними обновлениями (такими как ответы на ваши записи или упоминания).</p>
			<hr><p>В разделе %%icon_users%% «Пользователи» отображаются все встреченные вами участники сети. Например, вы там можете найти профили тех, чьи публикации репостили пользователи на которых вы подписаны.</p>
			<p>Обратите внимание, что другие участники сети не знают на кого вы подписаны или кто внесен в список игнорирования.</p>
			<hr><p>Пункт %%icon_gem%% «Награждения» хранит персональный каталог заметок, которые вы награждали. Сумму награждений можно посмотреть на ПК, для этого нужно навести курсор на иконку кристалла.</p>
			<hr><p>В разделе %%icon_settings%% «Настройки» вы можете изменить параметры связанные с периодичностью загрузки активности пользователей, время хранения в кэше незнакомых профилей и их записе, процент энергии затрачиваемый для награждений.</p>
			<p>Отдельно настраивается тема оформления. Есть возможность задать расписание для переключение между ночным и дневным режимами.</p>
			<p>Вкладка «Перенос данных» позволяет настроить синхронизацию с облаком и сделать отдельно бекап данных для переноса на другое устройство.</p>
			<hr><p>%%icon_account_settings%% «Аккаунт» позволяет удалить данные об используемом аккаунте или изменить приватный ключ. В отдельном табе доступно изменение публичного профиля.</p>
		`},
		tags: {
			title: 'Тэги', html: `
			<p>%%icon_hashtag%% Хэштэги (или просто тэги) являются хорошим способом для дополнительной рубрикации разрозненного контента.</p>
			<p>Для их использования достаточно добавить символ решетки «#» перед ключевым словом в заметке.</p>
			<p>Рекомендуется заменять пробелы на символ нижнего подчеркивания «_» если нужно сделать тэг из словосочетания.</p>
			<p>dApp обрабатывает все загруженные записи и проверяет их на наличие тэгов. После чего создается связь между записью и тэгом. После чего в любой записи можно нажать на тэг и получить выборку всех постов связанных с ним.</p>
			<hr><p>Тэги можно %%icon_pin%% закрепить или добавить в %%icon_eye_ignore%% игнорируемые, для этого нужно перейти в существующий тэг и нажать соответствующую иконку в шапке.</p>
			<p>Закрепленные тэги будут отображаться в правом меню на ПК версии и ниже основного меню на мобильной версии.</p>
			<hr><p>При редактировании профиля можно задать интересы (пересекающиеся тэги) и категории (уникальные тэги), которые будут доступны при просмотре вашего профиля другим участникам. Используя их они смогут делать быструю выборку по вашим заметкам и публикациям.</p>
			<hr><p>В настройках можно задать тэги, которые будут маркировать новые объекты как NSFW-контент (содержащий информацию для взрослых). По умолчанию заданы тэги: nsfw, porn, sex. Такой контент скрывается за спойлер с предупреждением и возможностью показать его при нажатии. Спойлер можно отключить, чтобы подобный контент отображался сразу.</p>
		`},
		publish: {
			title: 'Публикации', html: `
			<p>Публикации бывают двух видов — в виде коротких заметок или в виде записи с расширенной разметкой, специально созданной для статей.</p>
			<p>Формы для публикации коротких заметок доступны как из ленты, так и при ответе или репосте других записей.</p>
			<p>Расширенная разметка доступна через иконку %%icon_editor%% редактора (<a tabindex="0" href="dapp:publish">«Написать»</a> в меню).</p>
			<p>Редактор позволяет оформить полноценную публикацию с заголовком, подзагаловками, ссылками, изображениями и цитатами. В настройках необходимо указать аннотацию, ссылку на миниатюру и опционально добавить тэги из вашего профиля.</p>
			<p>Также можно указать бенефициаров в дополнительных настройках, для этого нужно задать аккаунты, которые будут делить получаемую награду и проценты для ее распределения.</p>
			<p>Расширенные публикации имеют отдельный просмотрщик в версии для ПК и напоминают популярные блог-платформы.</p>
			<hr><p>При создании новой заметки или публикации есть раздел «%%open_publish_addons%%», где вы можете задать пароль для шифрования заметки, а также список бенефициаров (кто разделит с вами награду от пользователей). При шифровании используется алгоритм AES-256-CBC, вы можете задать публичный комментарий к публикуемому объекту. Любой, кому вы передадите пароль (или кто угадает его) — получит доступ к просмотру объекта.</p>
			<hr><p>Если объект опубликован в блокчейне, то удалить его невозможно. Но с расширением Voice Events стало возможным скрывать или редактировать прошлые объекты. Список возможных действий вы увидите на странице просмотра объекта в выпадающем меню при нажатии на иконку с тремя точками %%icon_more%%.</p>
		`},
		uri: {
			title: 'Ссылки viz', html: `
			<p>Для работы с протоколом в Виз было решено сделать собственную схему viz для <a href="https://ru.wikipedia.org/wiki/URI" target="_blank">URI</a>. Ссылка содержит указатель на аккаунт и номер блока, в котором хранится запись в протоколе V (Voice).</p>
			<p>Публичный профиль доступен по ссылке вида viz://@login/</p>
			<p>Запись по ссылке viz://@login/[block]/</p>
			<p>Публикация по ссылке viz://@login/[block]/publication/</p>
			<p>Если вы хотите прикрепить запись в своем профиле, вам следует скопировать ссылку в схеме viz, и вставить ее в поле «Закрепленная запись» настройках свой профиль.</p>
		`},
		storage: {
			title: 'Хранение файлов', html: `
			<p>Проблема загрузки и хранения файлов в интернете всегда была актуальна. В современном интернете издержки за хранение данных берут на себя сервисы, которые зарабатывают на продаже рекламе или пользовательских данных. Но что делать для пользователей которые взяли сами на себя ответственность за сервис?</p>
			<p>Ответ простой — хранить файлы самостоятельно. Но решений не так много. Либо создавать свое файловое хранилище (ftp/web), либо арендовать место и пропускную способность у хостинг провайдеров.</p>
			<p>Технологических решений не так много: IPFS, Filecoin, Storj, SIA. И все они спорные.</p>
			<p>IPFS ближе всего к возможному решению, но в нем сложность заключается в отсутсвиии экономической модели. Это призваны решить другие проекты, которые использует собственный токен поверх IPFS для сделок по аренде места под хранение файлов, но в них существуют много ограничений, в том числе отсутствуют библиотеки для внедрения взаимодействия на стороне клиента (браузера).</p>
			<p>Временным решением послужили IPFS и SIA провайдеры, которые пока позволяют загружать файлы бесплатно.</p>
			<p>Они довольно часто лагают, сбоят и зависают на пару минут, но это самое доступное на данный момент.</p>
			<p>В качестве альтернативы пользователи всегда могут загрузить файлы на классические хостинг-провайдеры и вставить стандартную ссылку.</p>
		`},
		services: {
			title: 'Микросервисы', html: `
			<p>Часть привычных сервисов просто недоступны на стороне браузера. Из актуальных проблем — формирование превью ссылок и синхронизация между устройствами.</p>
			<p>Для решения этих проблем могут быть разработаны дополнительные микросервисы. Например, в %%brand_caption%% используется беспарольная аутентификация для записи и загрузки действий аккаунта (такие как подписка на пользователей, игнорирование тэгов, установка параметров).</p>
			<p>Отдельный микросервис создает предпросмотр для ссылок, сообщая браузеру мета-информацию о запрашиваемом url. Например, на основе этого формируется проигрыватель для аудио файлов.</p>
			<p>В будущем возможно будет вынести провайдера микросервисов в отдельное приложение, добавив к этому хранение файлов и записей с возможностью их удаления в соответствии с GDRP.</p>
		`},
		terms_of_use: {title: '%%terms_of_use_caption%%', html: `<div class="document-inherit">%%terms_of_use_html%%</div>`},
		community_rules: {title: '%%community_rules_caption%%', html: `<div class="document-inherit">%%community_rules_html%%</div>`},
		privacy_policy: {title: '%%privacy_policy_caption%%', html: `<div class="document-inherit">%%privacy_policy_html%%</div>`},
		manifest: {title: '%%manifest_caption%%', html: `<div class="document-inherit">%%manifest_html%%</div>`},
	},
	manual_next_link: `<br><p><a tabIndex="0" data-href="dapp:manual/{item}/">Продолжить &rarr;</a></p>`,
	manual_contents_link: `<hr><p><a tabIndex="0" data-href="dapp:manual">&larr; Вернуться к содержанию</a></p>`,
	manual_item: `
	<div class="object type-text">
		<div class="object-column">
			<div class="content-view" data-tab="{name}">{context}</div>
		</div>
	</div>`,
	settings_item: `
	<p>{caption}:</p>
	<p><input type="text" name="{prop}" placeholder="{placeholder}" value="{value}"></p>
	<div class="input-addon">({addon})</div>`,
	settings_sync_export_cloud_success: 'Экспорт в облако завершен, теперь вы можете синхронизировать приложение на другом устройстве',
	settings_sync_export_cloud_error: 'Ошибка при загрузке данных в облако, попробуйте позже или уменьшите количество записей для экспорта',
	settings_sync_export_file_success: 'Экспорт в файл завершен, проверьте загрузки',
	settings_sync_select_file_error: 'Выберите файл для восстановления',
	settings_sync_import_backup_error: 'Неверный формат файла, возможно поврежден',
	settings_sync_import_another_user: 'Импортируются данные аккаунта {account}',
	settings_sync_import_settings_success: 'Импорт настроек выполнен',
	settings_sync_import_feed_success: 'Импорт ленты новостей завершен',
	settings_sync_import_replies_success: 'Импорт дерева ответов завершен',
	settings_sync_import_hashtags_success: 'Импорт тэгов завершен',
	settings_sync_import_hashtags_feed_success: 'Импорт ленты тэгов завершен',
	settings_sync_import_awards_success: 'Импорт награждений завершен',
	settings_sync_import_users_success: 'Импорт пользователей завершен',
	settings_sync_import_finished: '<strong>Импорт успешно выполнен!</strong>',
	settings_sync_import_cloud_started: 'Синхронизация успешно запущена',
	settings_sync_import_cloud_error: 'Ошибка в подключении',
	settings_activity_period: `Частота загрузки активности пользователей`,
	settings_addon_activity_period: `в минутах после обновления`,
	users_settings_buttons: `
	<p class="error save-users-settings-error"></p>
	<p class="success save-users-settings-success"></p>
	<p><a class="button save-users-settings-action">Сохранить</a><span class="submit-button-ring"></span></p>
	<hr>
	<p><a class="button neutral-button reset-users-settings-action">Сброс</a></p>`,
	box_addon: `
	<div class="box">
		<div class="box-header">
			<div class="box-title">{caption}</div>
			<div class="box-buttons">
				{button}
			</div>
		</div>
		{context}
	</div>`,

	render_preview_image: `<div class="preview-image"{addon}>{prepand}<img src="{image}" alt="Изображение"></div>`,
	render_preview_image_addon: `<div class="preview-image-background" style="background-image:url('{image}');"></div>`,
	render_preview_large_image: `<div class="preview-large-image"{addon}><img src="{image}" alt="Изображение"></div>`,
	render_preview_link: `<div class="preview-link"{addon}>
		<div class="preview-link-title">{title}</div>
		<div class="preview-link-descr">{descr}</div>
		<div class="preview-link-source">{source}</div>
	</div>`,

	render_preview_article_image: `<a tabindex="0" data-href="{link}publication/" class="preview-article-image"{addon}><img src="{image}" alt="Изображение"></a>`,
	render_article_preview: `<div class="preview-article-link"{addon}>
		<a tabindex="0" data-href="{link}publication/" class="preview-article-link-title">{title}</a>
		<a tabindex="0" data-href="{link}publication/" class="preview-article-link-descr">{descr}</a>
	</div>`,
	render_preview_wrapper: `<a tabindex="0" class="preview-wrapper" href="{link}" target="_blank"{addon}>{context}</a>`,

	render_audio_wrapper: `<div tabindex="0" class="preview-wrapper audio-player" title="Аудио">{context}</div>`,
	render_audio_player: `
	<audio class="audio-source">
		<source src="{link}" type="{mime}">
		Your browser does not support the audio element.
	</audio>
	<a class="audio-toggle-action" tabindex="0" title="%%audio_player_play_caption%%">%%icon_player_play%%</a>
	<div class="audio-progress" tabindex="0" role="slider" aria-label="%%audio_player_progress_caption%%" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="00:00"><div class="fill-range"><div class="fill-level"></div></div></div>
	<time title="%%audio_player_duration_caption%%">0 / 0</time>
	`,
	audio_player_play_caption: `Воспроизвести`,
	audio_player_pause_caption: `Пауза`,
	audio_player_progress_caption: `Ползунок позиции`,
	audio_player_duration_caption: `Длительность`,

	hashtags_addon_caption: '# Тэги',
	hashtags_addon_button: '<a tabindex="0" data-href="dapp:hashtags" title="Управление тэгами">{icon}</a>',
	hashtags_pinned_caption: 'Закрепленные',
	hashtags_popular_caption: 'Популярные',
	hashtags_main_tab: 'Все',
	hashtags_pinned_tab: 'Закрепленные',
	hashtags_ignored_tab: 'Игнорируемые',
	hashtags_objects_header: `<div class="hashtag-item nohover"><div class="hashtag-item-num">№</div><div class="hashtag-item-caption">Тэг</div><div class="hashtag-item-count">Количество</div></div>`,
	hashtags_objects_item: `<div class="hashtag-item" data-hashtag-id="{id}"><div class="hashtag-item-num">{num}</div><div class="hashtag-item-caption"><a data-href="dapp:hashtags/{tag}">#{tag}{addon}</a></div><div class="hashtag-item-count">{count}</div></div>`,
	passphrases_objects_item: `
	<div class="passphrase-item" data-passphrase-id="{id}">
		<div class="passphrase-item-caption">{passphrase}</div>
		<div class="passphrase-item-manage"><a class="passphrase-remove-action" tabindex="0" title="Удалить">%%icon_close%%</div>
	</div>`,

	found_results: 'Найдено: {count}',

	profile_main_tab: 'Все',
	profile_posts_tab: 'Посты',
	profile_shares_tab: 'Репосты',
	profile_replies_tab: 'Ответы',

	users_qr_code_link: '<a tabindex="0" data-href="dapp:users/?{select_tab}" title="QR код" class="{addon}">%%icon_qr_code%%</a>',
	users_main_tab: 'Все',
	users_subscribed_tab: 'Подписки',
	users_ignored_tab: 'Игнорируемые',
	users_qr_code_tab: 'Предоставить',
	users_scan_qr_code_tab: 'Сканировать',
	users_scan_retrieving: 'Получаем видео...',
	users_user_settings_tab: 'Настройки',
	users_user_passphrases_tab: 'Пароли для расшифровки',
	users_user_passphrases_description: '<p>Здесь вы найдете все пароли, которыми вы успешно расшифровывали объекты выбранного пользователя.</p>',
	passphrases_not_found: 'Паролей не найдено',
	scan_qr_unable: 'Не получается получить доступ к видео потоку (убедитесь, что у вас включена камера)',
	scan_qr_error: '<div class="scan-qr-error-icon">{icon}</div><div class="scan-qr-error-text">{text}</div>',
	scan_qr_error_browser: 'Браузер не поддерживает захват видео',
	scan_qr_error_subscribe: 'Ошибка при подписке на <a tabindex="0" data-href="viz://@{account}/">@{account}</a>',
	scan_qr_successfull: '<div class="scan-qr-successfull-icon">{icon}</div><div class="scan-qr-successfull-text">{text}</div>',
	scan_qr_successfull_subscribe: 'Успешная подписка на <a tabindex="0" data-href="viz://@{account}/">@{account}</a>',

	users_objects_box: `<div class="user-item-box">{context}</div>`,
	users_objects_header: `
	<div class="user-item-box"><input type="text" class="user-item-search" placeholder="Быстрый поиск" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></div>
	<div class="user-item-box search-results"></div>
	`,
	users_objects_item: `
	<div class="user-item" data-search="{search}">
		<div class="user-item-avatar">{avatar}</div>
		<a class="user-item-nickname" tabindex="0" data-href="viz://@{account}/">{nickname}</a>
		<a class="user-item-account" tabindex="0" data-href="viz://@{account}/">{account}</a>
		<div class="user-item-manage"><a tabindex="0" data-href="dapp:users/{account}" title="Управление">{icon}</a></div>
	</div>`,
	users_objects_item_avatar: `<div class="avatar"><div class="shadow" data-href="viz://@{account}/"></div><img src="{avatar}"></div>`,

	box_container: `
	<div class="box-container">
		<div class="box-subtitle">{caption}</div>
		{context}
	</div>`,
	box_item: `<div class="box-item"><a data-href="{link}">{caption}</a></div>`,

	notify_item: '<div class="notify-item{addon}" data-id="{id}">{context}</div>',
	notify: '<div class="notify-wrapper{addon}" data-id="{id}"><div class="notify" role="alert" aria-live="polite">{context}</div></div>',
	notify_title: '<div class="title">{caption}</div>',
	notify_text: '<div class="text">{text}</div>',
	notify_link: '<a tabindex="0" data-href="{link}" class="close-notify-action">{text}</a>',
	notify_item_link: '<a tabindex="0" data-href="{link}">{text}</a>',
	notify_arr: {
		error: 'Ошибка',
		attention: 'Внимание!',
		upload: 'Загрузка',
		sync: 'Синхронизация',
		sync_import: 'Происходит синхронизация с облаком&hellip;',
		sync_import_error: 'Неверный формат данных',
		sync_import_success: 'Перенос данных успешно завершен',
		award_success: 'Вы наградили @{account}',
		award_info: '≈{amount}Ƶ [{percent}]',
		award_error: 'Ошибка при награждении @{account}',
		new_reply: 'Новый ответ от @{account}',
		new_share: 'Репост от @{account}',
		new_mention: 'Упоминание от @{account}',
		idb_error: 'Сбой в базе данных, перезагрузка приложения',
		upload_incorrect_format: 'Недопустимый формат файла',
		upload_percent: 'Статус загрузки: {percent}%',
		beneficiaries_summary_weight: 'Проверьте суммарный процент бенефициаров',
		category_is_founded: 'В тексте уже найдена категория',
	},
	notifications_all_tab: 'Все',
	notifications_new_tab: 'Новые',
	notifications_readed_tab: 'Прочитанные',
	error_title: 'Ошибка',

	awarded_amount: 'Награждено на {amount} Ƶ',

	menu_session_empty: '<div class="avatar"><img src="{avatar}" data-href="dapp:account"></div><a tabindex="0" data-href="dapp:account">{caption}</a>',
	menu_session_login: 'Войти',
	menu_session_error: '<span class="error">Ошибка</span>',
	menu_session_account: '<div class="avatar"><div class="shadow" data-href="viz://@{account}/"></div><img src="{avatar}"></div><div class="account"><a class="account-name" tabindex="0" data-href="viz://@{account}/">{nickname}</a><a class="account-login" tabindex="0" data-href="viz://@{account}/">{account}</a></div>',

	none_notice: '<div class="none-notice"><em>Лента новостей пока не работает, попробуйте поиск.<!--<br>Ничего не найдено.--></em></div>',
	whitelabel_notice: `<div class="load-more-end-notice"><em>Загрузка последних публикаций @{account}&hellip;</em><span class="submit-button-ring"></span></div>`,
	feed_end_notice: '<div class="load-more-end-notice"><em>Конец ленты новостей.</em></div>',
	load_more_end_notice: '<div class="load-more-end-notice"><em>Больше ничего не найдено.</em></div>',
	error_notice: '<div class="error-notice"><em>{error}</em></div>',
	empty_loader_notice: '<div class="loader-notice"><span class="submit-button-ring"></span></div>',
	loader_notice: '<div class="loader-notice" data-account="{account}" data-block="{block}"><span class="submit-button-ring"></span></div>',
	feed_loader_notice: '<div class="loader-notice" data-feed-time="{time}"><span class="submit-button-ring"></span></div>',
	notifications_loader_notice: '<div class="loader-notice" data-notifications-id="{id}"><span class="submit-button-ring"></span></div>',
	awards_loader_notice: '<div class="loader-notice" data-awards-id="{id}"><span class="submit-button-ring"></span></div>',
	hashtags_loader_notice: '<div class="loader-notice" data-hashtags-id="{tag_id}" data-hashtags-feed-id="{id}"><span class="submit-button-ring"></span></div>',

	toggle_menu: '<a tabindex="0" title="{title}" class="toggle-menu adaptive-show-inline mobile">{icon}</a>',
	toggle_menu_title: 'Переключить меню',
	toggle_menu_icon: '<div><a tabindex="0" title="{title}" class="toggle-menu-icon">{icon}</a></div>',

	toggle_theme_icon: '<div><a tabindex="0" title="{title}" class="toggle-theme-icon toggle-theme-action">{icon}</a></div>',
	toggle_theme_title: 'Настроить оформление',

	icon_counter: `<div class="icon-counter counter-{name}">{count}</div>`,

	account_settings: '<a tabindex="0" data-href="dapp:account" title="Настройки аккаунта">{icon_account_settings}</a>',
	account_settings_caption: 'Настройки аккаунта',
	account_settings_empty_account: 'Введите аккаунт',
	account_settings_empty_regular_key: 'Введите регулярный ключ',
	account_settings_account_not_found: 'Аккаунт не найден',
	account_settings_saved: 'Данные аккаунта сохранены',
	account_settings_reset: 'Данные аккаунта удалены',
	account_credentials_tab: 'Учетная запись',
	account_profile_tab: 'Профиль',
	account_qr_tab: 'Экспорт через QR',
	account_scan_qr_tab: 'Импорт через QR',

	notifications_caption: 'Уведомления',
	awards_caption: 'Награждения',
	hashtags_caption: 'Тэги',
	users_caption: 'Пользователи',
	app_settings_caption: 'Настройки приложения',
	app_settings_saved: 'Настройки сохранены',
	app_settings_reset: 'Настройки сброшены',
	app_passphrases_deleted: 'Все кодовые фразы удалены',
	app_settings_main_tab: 'Общие',
	app_settings_feed_tab: 'Лента новостей',
	app_settings_theme_tab: 'Оформление',
	app_settings_sync_tab: 'Перенос данных',
	app_settings_connection_tab: 'Подключение',
	app_settings_languages_tab: 'Языки',

	view_profile: '<a tabindex="0" data-href="viz://@{account}/" title="Просмотреть профиль">{icon_view_profile}</a>',

	invalid_regular_key: 'Предоставленный ключ недействителен',
	not_found_regular_key: 'Предоставленный ключ не подходит',

	search_caption: 'Поиск',
	search_empty_input: 'Введите адрес для поиска',

	left_addon_publish_button: '<div taborder="0" data-href="dapp:publish" class="publish-button">%%icon_editor_plus%% Написать</div>',
	footer_publish_button: '<div taborder="0" data-href="dapp:publish" class="publish-button">%%icon_editor_plus%%</div>',

	gateway_error: 'Ошибка, попробуйте позже',
	account_not_found: 'Пользователь не найден',
	object_not_found: 'Объект не найден',
	block_not_found: 'Блок не найден, попробуйте позже',
	object_is_hidden: 'Автор решил скрыть контент',
	data_not_found: 'Данные не найдены',
	hashtags_not_found: 'Тэг не найден',
	users_not_found: 'Пользователи не найдены',
	event_not_found: 'Запрашиваемое событие не найдено',
	encoding_error: 'Ошибка при попытке шифрования объекта',

	view: `
		<div class="view" data-level="{level}" data-path="{path}" data-query="{query}">
			<div class="header space-between"></div>
			{profile}
			{tabs}
			<div class="objects"></div>
		</div>`,
	profile: '<div class="profile">{profile}</div>',
	profile_about: '<div class="about">{about}</div>',
	profile_interests: '<div class="interests">{interests}</div>',
	profile_interests_item: `<a class="profile-select-interest-action" data-hashtag="{hashtag}">#{caption}</a>`,
	profile_categories: '<div class="categories">{categories}</div>',
	profile_categories_item: `<a class="profile-select-category-action" data-hashtag="{hashtag}">#{caption}</a>`,
	profile_contacts: '<div class="contacts">{contacts}</div>',
	profile_contacts_github: '<a href="https://github.com/{github}" target="_blank" class="profile-contacts-github" title="GitHub">{icon_github}</a>',
	profile_contacts_telegram: '<a href="tg://resolve?domain={telegram}" target="_blank" class="profile-contacts-telegram" title="Telegram">{icon_telegram}</a>',
	tabs: '<div class="tabs">{tabs}</div>',
	tab: '<a tabindex="0" data-href="{link}" class="{class}">{caption}</a>',

	menu_preset: `
		<div class="session"></div>
		<div class="primary"></div>
		<div class="secondary"></div>`,
	menu_primary: `<div><a tabindex="0" data-href="{link}" class="{class}">{icon}<span>{caption}</span></a></div>`,
	menu_primary_pinned_tags: `<div class="adaptive-pinned-tags"></div>`,
	menu_primary_pinned_tags_caption: `Закрепленные тэги:`,
	menu_feed: 'Лента',
	menu_hashtags: 'Тэги',
	menu_users: 'Пользователи',
	menu_notifications: 'Уведомления',
	menu_awards: 'Награждения',
	menu_app_settings: 'Настройки',
	menu_account_settings: 'Аккаунт',
	menu_languages: 'Выбор языка',
	menu_connection: 'Соединение',
	menu_manual: 'Справочник',

	footer_link: `<div><a tabindex="0" data-href="{link}" class="{class}">{icon}</a></div>`,

	article_publish_caption: `Опубликовать`,
	article_settings_caption: `Настройки`,
	editor_caption: `Расширенная публикация`,

	header_back_action: `<a tabindex="0" class="back-action" title="Назад" data-force="{force}">{icon}</a>`,
	header_link: '<div class="link grow"><div class="header-link-wrapper"><input type="text" class="header-link" value="{link}"><div class="header-link-icons">{icons}</div></div></div>',
	header_link_icons: `
		<i tabindex="0" class="icon copy icon-copy-action" title="Копировать адрес">%%icon_copy_svg%%</i>
		<i tabindex="0" class="icon search icon-search-action" title="Перейти">%%icon_search_svg%%</i>`,
	header_caption: '<div class="caption grow">{caption}</div>',
	header_caption_link: '<a data-href="{link}" tabindex="0" class="caption grow">{caption}</a>',
	header_icon_link: '<a tabindex="0" class="{action}-action{addon}" title="{caption}">{icon}</a>',
	clear_awards_caption: 'Очистить историю наград',
	pin_hashtags_caption: 'Закрепить',
	ignore_hashtags_caption: 'Игнорировать',
	clear_hashtags_caption: 'Удалить тэг',
	mark_readed_notifications_caption: 'Отметить прочитанными',
	clear_readed_notifications_caption: 'Удалить прочитанные уведомления',

	user_actions_open: '<div class="user-actions" data-user="{user}">',
	user_actions_close: '</div>',
	subscribe_link: '<a tabindex="0" class="subscribe-action" title="Подписаться на пользователя">{icon}</a>',
	subscribed_link: '<a tabindex="0" class="subscribed-action positive" title="Вы подписаны на пользователя">{icon}</a>',
	unsubscribe_link: '<a tabindex="0" class="unsubscribe-action" title="Отписаться от пользователя">{icon}</a>',
	ignore_link: '<a tabindex="0" class="ignore-action" title="Игнорировать пользователя">{icon}</a>',
	ignored_link: '<a tabindex="0" class="ignored-action negative" title="Вы игнорируете пользователя">{icon}</a>',
	unignore_link: '<a tabindex="0" class="unignore-action" title="Прекратить игнорировать пользователя">{icon}</a>',
	edit_profile_link: '<a tabindex="0" data-href="dapp:account/profile" title="Изменить профиль">{icon_edit_profile}</a>',
	edit_profile_saved: 'Профиль сохранен',

	new_object_link: '<a tabindex="0" data-href="dapp:publish" title="Написать">{icon_new_object}</a>',

	publish_caption: 'Публикация',
	publish_empty_text: 'Введите текст публикации',
	publish_success: 'Запись успешно опубликована&hellip;',
	publish_success_link: 'Запись успешно опубликована: <a tabindex="0" data-href="viz://@{account}/{block}/{addon}">ссылка</a>',

	object_type_publication_full: `
		<div class="publication-readline" data-object="{link}"><div class="fill-level"></div></div>
		<div class="object type-text" data-link="{link}" data-events="{events}" data-publication="true">
			<div class="author-view">
				<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
				<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a></div>
				{decoded}
				{more}
			</div>
			<div class="object-column">
				<div class="article">{context}</div>
				<div class="date-view" data-timestamp="{timestamp}">&hellip;</div>
				<div class="actions-view">{actions}</div>
			</div>
		</div>`,
	object_type_publication: `
		<div class="object type-text" data-link="{link}" data-events="{events}">
			<div class="author-view">
				<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
				<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a></div>
				{decoded}
				{more}
			</div>
			<div class="object-column">
				<div class="preview-wrapper{class_addon}"{addon}>{context}</div>
				<div class="date-view" data-timestamp="{timestamp}">&hellip;</div>
				<div class="actions-view">{actions}</div>
			</div>
		</div>`,
	object_type_publication_preview: `
		<div class="object type-text-preview" data-account="{account}" data-block="{block}" data-link="{link}" data-events="{events}" data-previous="{previous}" data-is-reply="{is_reply}" data-is-share="{is_share}">
			<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
			<div class="object-column">
				<div class="author-view">
					<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a><a tabindex="0" data-href="{link}" class="short-date-view" data-timestamp="{timestamp}">&hellip;</a></div>
				</div>
				<div class="preview-article-wrapper{class_addon}"{addon}>{context}</div>
				<div class="actions-view">{actions}</div>
			</div>
		</div>`,
	object_hidden: `
		<div class="object object-hidden" data-account="{account}" data-block="{block}" data-link="{link}" data-events="{events}" data-previous="{previous}"></div>`,
	object_type_encoded: `
	<div class="object type-text" data-account="{account}" data-block="{block}" data-link="{link}" data-events="{events}">
		<div class="author-view">
			<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
			<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a></div>
			{more}
		</div>
		<div class="object-column">
			{comment}
			<div class="decode-form" data-href="{link}">%%decode_form%%</div>
			<div class="date-view" data-timestamp="{timestamp}">&hellip;</div>
			<div class="actions-view">{actions}</div>
		</div>
	</div>`,
	object_type_encoded_preview: `
		<div class="object type-text-preview" data-account="{account}" data-block="{block}" data-link="{link}" data-events="{events}" data-previous="{previous}" data-is-reply="{is_reply}" data-is-share="{is_share}">
		<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
		<div class="object-column">
			<div class="author-view">
				<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a><a tabindex="0" data-href="{link}" class="short-date-view" data-timestamp="{timestamp}">&hellip;</a></div>
			</div>
			{comment}
			<div class="decode-form">%%decode_form%%</div>
		</div>
	</div>`,
	object_type_encoded_comment: `<div class="content-view">{comment}</div>`,
	decode_form: `
		<div class="notice-caption">%%icon_locked%% Объект зашифрован</div>
		<div class="notice-description">Если вы знаете кодовую фразу вы можете расшифровать его.<br>Все ключи будут храниться к конкретному аккаунту.<br>Нажми на мне.</div>
		<div class="decode-passphrase">
		<input type="password" name="passphrase" placeholder="Кодовая фраза..."><br>
		<a class="button small decode-object-action">Декодировать</a>
		</div>
		`,
	more_column: `<div class="more-column"><a tabindex="0" class="more-action" title="Доступные действия" data-account="{account}" data-block="{block}">%%icon_more%%</a></div>`,
	more_actions: `<a class="edit-more-action">Редактировать</a><a class="hide-more-action">Скрыть</a><a class="cancel-more-action">Отмена</a>`,
	confirm_hide_event: `Вы уверены, что хотите скрыть данную запись?`,
	decoded_object: `<div class="decoded-column"><a tabindex="0" title="Объект был расшифрован">%%icon_unlocked%%</a></div>`,
	object_type_text: `
		<div class="object type-text" data-link="{link}" data-events="{events}">
			<div class="author-view">
				<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
				<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a></div>
				{decoded}
				{more}
			</div>
			<div class="object-column">
				{reply}
				<div class="content-view{class_addon}">{text}</div>
				<div class="preview-container{class_addon}"></div>
				<div class="date-view" data-timestamp="{timestamp}">&hellip;</div>
				<div class="actions-view">{actions}</div>
			</div>
		</div>`,
	object_type_text_actions: `
	<a tabindex="0" class="reply-action" title="Комментировать">{icon_reply}<span class="replies-count"></span></a>
	<a tabindex="0" class="share-action" title="Репост">{icon_repost}</a>
	<a tabindex="0" class="award-action" title="Наградить">{icon_award}</a>
	<a tabindex="0" class="external-share-action" title="Поделиться">{icon_share}</a>`,
	object_type_text_pinned: `<div class="object type-text-loading pinned-object" data-link="{link}" data-events="{events}">{context}</div>`,
	object_type_text_pinned_caption: `
	<div class="share-view">{icon} Закрепленная запись</div>
	<div class="load-content"><div class="load-placeholder"><span class="loading-ring"></span></div></div>`,
	object_type_text_loading: `<div class="object type-text-loading" data-account="{account}" data-block="{block}" data-link="{link}" data-events="{events}" data-previous="{previous}" data-is-reply="{is_reply}" data-is-share="{is_share}">{context}</div>`,
	object_type_text_wait_loading: `<div class="object type-text-wait-loading" data-link="{link}" data-events="{events}"><div class="load-content"><div class="load-placeholder"><span class="loading-ring"></span></div></div></div>`,
	object_type_text_share: `
	<div class="share-view"><a tabindex="0" data-href="{link}">{caption}</a> поделился:{comment}</div>
	<div class="load-content"><div class="load-placeholder"><span class="loading-ring"></span></div></div>`,
	object_type_text_share_link: `
	<div class="object type-text-share-link" data-account="{account}" data-block="{block}" data-link="{link}" data-events="{events}" data-previous="{previous}" data-is-reply="{is_reply}" data-is-share="{is_share}">
		<div class="share-view"><a tabindex="0" data-href="viz://{author}/">{caption}</a> поделился:{comment}</div>
		<div class="preview-container{class_addon}"></div>
		<div class="actions-view">{actions}</div>
	</div>`,
	object_type_text_share_link_preview: `
		<div class="object type-text-preview" data-account="{account}" data-block="{block}" data-link="{link}" data-events="{events}" data-previous="{previous}" data-is-reply="{is_reply}" data-is-share="{is_share}">
			<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
			<div class="object-column">
				<div class="author-view">
					<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a><a tabindex="0" data-href="{link}" class="short-date-view" data-timestamp="{timestamp}">&hellip;</a></div>
				</div>
				<div class="content-view{class_addon}" data-href="{link}">{text}</div>
				<div class="preview-container{class_addon}"></div>
				<div class="actions-view">{actions}</div>
			</div>
		</div>`,
	object_type_text_share_comment: ` <div class="comment-view">{comment}</div>`,
	object_type_text_preview: `
		<div class="object type-text-preview" data-account="{account}" data-block="{block}" data-link="{link}" data-events="{events}" data-previous="{previous}" data-is-reply="{is_reply}" data-is-share="{is_share}">
			<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
			<div class="object-column">
				<div class="author-view">
					<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a><a tabindex="0" data-href="{link}" class="short-date-view" data-timestamp="{timestamp}">&hellip;</a></div>
				</div>
				{reply}
				<div class="content-view{class_addon}" data-href="{link}">{text}</div>
				<div class="preview-container{class_addon}"></div>
				<div class="actions-view">{actions}</div>
			</div>
		</div>`,
	object_type_text_share_preview: `
		<div class="object type-text-preview" data-link="{link}" data-events="{events}">
			<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
			<div class="object-column">
				<div class="author-view">
					<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a><a tabindex="0" data-href="{link}" class="short-date-view" data-timestamp="{timestamp}">&hellip;</a></div>
				</div>
				<div class="content-view{class_addon}" data-href="{link}">{text}</div>
				<div class="preview-container{class_addon}"></div>
				<div class="actions-view">{actions}</div>
			</div>
		</div>`,
	object_type_text_reply: `
		<div class="branch">
		<div class="object type-text-preview" data-link="{link}" data-events="{events}">
			<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
			<div class="object-column">
				<div class="author-view">
					<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a><a tabindex="0" data-href="{link}" class="short-date-view" data-timestamp="{timestamp}">&hellip;</a></div>
				</div>
				<div class="content-view{class_addon}" data-href="{link}">{text}</div>
				<div class="preview-container{class_addon}"></div>
				<div class="actions-view">{actions}</div>
			</div>
		</div>
		<div class="nested-replies"></div>
		</div>
		`,
	object_type_text_reply_nested_count: '<a tabindex="0" class="load-nested-replies-action"><div class="branch-more">&bull;</div>Количество ответов: <span class="nested-replies-count">{count}</span></a>',
	object_type_text_reply_branch_line: '<div class="branch-line"></div>',
	object_type_text_reply_internal: '<div class="reply-view">В ответ <a tabindex="0" data-href="{link}">{caption}</a></div>',
	object_type_text_reply_external: '<div class="reply-view">Ответ на <a tabindex="0" href="{link}" target="_blank">{caption}</a></div>',

	new_objects: '<a class="new-objects load-new-objects-action" data-items="0">&hellip;</a>',
	feed_new_objects: 'Показать последние обновления: {items}',
	feed_no_new_objects: 'Ничего нового нет',

	nsfw_warning: '<div tabindex="0" class="nsfw-warning nsfw-reveal-action">Данный контент может содержать информацию для взрослых.<br>Нажмите, чтобы показать.</div>',

	plural: {
		hours: {
			'1': 'час',
			'2': 'часа',
			'5': 'часов',
		},
		minutes: {
			'1': 'минуту',
			'2': 'минуты',
			'5': 'минут',
		},
	},
	date: {
		now: `только что`,
		full_format: `{time} · {date}`,
		time_format: `{hour}:{min}{times}`,
		times_am: ``,//ante meridiem
		times_pm: ``,//post meridiem
		date_format: `{day}{short_month}{year}`,
		passed_minutes: `{minutes} мин`,
		passed_hours: `{hours} ч`,
		aria_passed: `{number} {plural} назад`,
		year: ` {year} г.`,
		short_month: {
			'01': ` янв.`,
			'02': ` фев.`,
			'03': ` мар.`,
			'04': ` апр.`,
			'05': ` мая`,
			'06': ` июн.`,
			'07': ` июл.`,
			'08': ` авг.`,
			'09': ` сен.`,
			'10': ` окт.`,
			'11': ` ноя.`,
			'12': ` дек.`,
		},
	},

	fast_publish: `
	<div class="fast-publish-wrapper" data-reply="{reply}" data-share="{share}" tabindex="0" title="Форма быстрой публикации">
		<div class="avatar" alt=""{avatar_addon}><img src="{avatar}"></div>
		<div class="placeholder">{placeholder}</div>
		<div class="text" data-placeholder="true" contenteditable="true"></div>
		<div class="buttons">
			<div tabindex="0" class="button fast-publish-attach-action" title="Добавить файл">{attach}</div>
			<div tabindex="0" class="button fast-publish-action" title="Опубликовать">{button}</div>
		</div>
	</div>`,
	fast_publish_avatar_addon:' data-href="viz://@{account}/" tabindex="0" title="Перейти в профиль"',
	fast_publish_feed: `Что нового?`,
	fast_publish_reply: `Написать в ответ`,
	fast_publish_share: `Добавить комментарий`,
	fast_publish_button: `Отправить`,

	documents_wrapper: `
	<div class="document-wrapper">
	<div class="document-readline"><div class="fill-level"></div></div>
		<div class="content">
			<div class="header space-between"><div class="caption grow"></div></div>
			<div class="view">
				<div class="languages-short-list"></div>
				<div class="documents-short-list"></div>
				<div class="document-html"></div>
				<a class="button documents-accept-action">%%documents_accept%%</a>
			</div>
		</div>
	</div>`,
	documents_accept: `Принять все`,
	terms_of_use_caption: `Условия использования`,
	terms_of_use_html: `<p>Данное программное обеспечение и сопутствующие материалы предоставляются «как есть» (AS IS), без каких-либо явных или подразумеваемых гарантий.</p>
	<p><b>Вы используете это программное обеспечение исключительно на свой собственный страх и риск.</b></p>
	<p>Автор и правообладатель не несут никакой ответственности:</p>
	<ul>
		<li>За любые прямые, косвенные, случайные, особые или иные убытки, возникшие в результате использования или невозможности использования программного обеспечения.</li>
		<li>За потерю данных, сбои в работе оборудования или программного обеспечения, а также за любой другой ущерб, причиненный вашим системам или данным.</li>
		<li>За корректность работы, пригодность для конкретных целей и отсутствие ошибок в программном обеспечении.</li>
	</ul>
	<p>Используя данное программное обеспечение, вы подтверждаете, что понимаете и соглашаетесь с этими условиями и принимаете на себя всю ответственность за любые последствия его использования.</p>`,
	community_rules_caption: `Правила сообщества`,
	community_rules_html: `<p>Чтобы обеспечить безопасную и позитивную атмосферу для всех, пожалуйста, соблюдайте следующие правила:</p>
	<p><b>1. Будьте уважительны</b><br>
	Относитесь ко всем участникам с уважением. Здоровые дебаты приветствуются, но доброта обязательна.</p>

	<p><b>2. Запрещены разжигание ненависти и травля</b><br>
	Мы нетерпимы к разжиганию ненависти, расизму, сексизму, гомофобии, религиозной нетерпимости или любым другим формам дискриминационного или оскорбительного контента.</p>

	<p><b>3. Запрещены угрозы и насилие</b><br>
	Не публикуйте материалы, которые содержат угрозы, подстрекают или прославляют насилие против кого-либо. Это включает в себя угрозы физической расправы.</p>

	<p><b>4. Запрещены буллинг и личные оскорбления</b><br>
	Не допускаются запугивание, преследование или травля других пользователей. Запрещены личные выпады, оскорбления и троллинг.</p>

	<p><b>5. Соблюдайте этичность</b><br>
	Избегайте непристойного, откровенно сексуального или иного оскорбительного контента.</p>

	<p><b>6. Уважайте приватность</b><br>
	Не публикуйте личную или конфиденциальную информацию о других людях (доксинг), включая адреса, номера телефонов или личные переписки.</p>

	<p><b>7. Запрещен спам и чрезмерная самореклама</b><br>
	Не засоряйте сообщество рекламой, повторяющимися сообщениями или чрезмерным количеством ссылок на ваши собственные сайты/каналы.</p>

	<p><b>Как пожаловаться на нарушение:</b><br>
	Если вы видите пост или комментарий, которые нарушают эти правила, пожалуйста, используйте кнопку «Пожаловаться» (Report). Сообщество само рассмотрит нарушение и предпримет необходимые меры, которые могут включать цензурирование контента, предупреждение или блокировку пользователя к публичному просмотру.</p>

	<p>Участвуя в жизни сообщества, вы соглашаетесь соблюдать эти правила. Спасибо, что помогаете нам сохранять это пространство дружелюбным для всех!</p>`,
	privacy_policy_caption: `Политика конфиденциальности`,
	privacy_policy_html: `<p>Каждый экземпляр программного обеспечения предполагает как краткую политику конфиденциальности, так и свою собственную расширенную политику. Кратко:</p>
	<p><b>Публичные и постоянные данные:</b><br>
	Все ваши публичные действия (посты, комментарии) записываются в блокчейн. Эти данные неизменяемы и не могут быть удалены или изменены кем-либо, включая нас.</p>
	<p><b>Модерация контента:</b><br>
	Сообщество может создавать черные списки, чтобы скрывать контент от определенных пользователей или аккаунтов. Хотя данные остаются в блокчейне, они могут быть не видны в интерфейсе приложения.</p>
	<p><b>Сторонние сервисы:</b><br>Если вы пользуетесь сторонним сервисом (например, кошельком или шлюзом) для взаимодействия с этой социальной сетью, их собственная политика конфиденциальности регулирует ваше взаимодействие с их сервисом. Мы не несем ответственности за их методы обработки данных.</p>`,

	manifest_caption: `Манифест`,
	manifest_html: `
	<p class="boldest bigger">Манифест децентрализованного приложения Free Speech Project</p>

	<p>Классические социальные сети дали громкоговоритель каждому.</p>

	<p class="boldest">И это проблема.</p>

	<p>Вы читаете всех, кто хочет высказаться.<br>

	%%svg_bad_face%%
	<span class="big2">Даже спамеров.</span><br>
	<span class="big">Даже абузеров.</span><br>
	Даже идиотов.<br>
	Везде.<br>
	<span class="smaller">И всех.</span></p>

	<p>The Free Speech Project <strong>меняет устоявшиеся правила.</strong> Он работает на блокчейне VIZ и использует протоколы Голос и События Голоса.<br>
	Голос — <a href="https://github.com/VIZ-Blockchain/Free-Speech-Project/blob/master/specification-ru.md" target="_blank">глобальный протокол</a> для объектов в социальной сети свободы слова.<br>
	События Голоса — <a href="https://github.com/VIZ-Blockchain/Free-Speech-Project/blob/master/events-specification-ru.md" target="_blank">дополнительный протокол</a> для действий над объектами.</p>

	%%svg_hand_like%%
	<p><span class="bigger">Нет Спаму.</span><br>
	<span class="big">Нет Рекламе.</span><br>
	Нет Ответам<br>
	<span class="smaller">от незнакомцев.</span></p>

	<p>Только контент от Риддлов<br>
	их Посты и Ответы.</p>

	<p>Вы читаете только тех, на кого подписаны. </p>

	<p>Вы и есть Социальная Сеть!</p>

	<p>Если вам есть что сказать — запишите себя в нашу общую <strong>историю свободы</strong>.</p>

	<p>А как же токсичные спикеры? Их никто не услышит. Теория шести рукопожатий работает как фильтр от хренового контента.</p>

	%%svg_incognito%%
	<p class="smaller">Просто не подписывайтесь на мудаков.</p>

	<p>Продолжая вы понимаете и принимаете, что:</p>
	<ul>
		<li>Код <a href="https://github.com/VIZ-Blockchain/Free-Speech-Project/tree/master" target="_blank">Free Speech Project</a> — нейтральная технология, как веб-сайты или торренты.</li>
		<li>Ни вы, ни кто либо другой не можете посмотреть кто кого читает или игнорирует. Потому что это <strong>НЕ ВАШЕ ДЕЛО</strong>. Можно лишь догадываться об этом по ответам или репостам.</li>
		<li>Если вы ребенок возрастом до 99 лет, немедленно закройте данное окно.</li>
		<li>Все что вы видите это немодерируемый контент и он не может быть модерируемым.</li>
		<li>Если вы будете читать художника рисующего иллюстрации для детских книжек, то вы будете видеть активность данного художника. Если вы будете читать порно актрису, то вы будете видеть активность данной порно актрисы. Вы сами виноваты в том, что видите. Не нравится кто-то, не читайте его. Или добавьте в список игнорирования.</li>
		<li>Отправленный вами контент не может быть удален или скрыт от общественности.</li>
		<li>За публичными именами могут быть скрыты мошенники или киберсквоттеры. Убедитесь через другие публичные каналы, что автор контента действительно тот за кого себя выдает.</li>
		<li>Блокчейн ноды не отвечают за содержимое отправленное участниками сети.</li>
		<li>Вы не можете заставить контент исчезнуть.</li>
		<li>Разработчики и софт не отвечают за поведение пользователей. Если вас кто-то обидел, обратитесь к психотерапевту и добавьте пользователя в список для игнорирования.</li>
	</ul>`,
};