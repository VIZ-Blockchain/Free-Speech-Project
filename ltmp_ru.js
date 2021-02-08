var ltmp_ru_arr = {
	preset_view_account: `
	<div class="object type-text">
		<div class="object-column">
			<div class="content-view" data-tab="credentials">
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
				<p><a class="button neutral-button remove-account-action">Удалить</a></p>
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
	<div class="add-categories"></div>
	<div class="add-interests"></div>
	<div class="toggle-publish-addons"><a tabindex="0" class="toggle-publish-addons-action">%%open_publish_addons%%</a></div>
	<div class="publish-addons">%%publish_addons%%</div>
	`,

	open_publish_addons: `&#x25B8; Дополнительные настройки`,
	close_publish_addons: `&#x25BE; Дополнительные настройки`,
	publish_addons: `
	<div class="beneficiaries-list">
		<div class="beneficiaries-list-caption">%%beneficiaries_list_caption%%</div>
		<div class="beneficiaries-list-desription">%%beneficiaries_list_description%%</div>
		%%beneficiaries_list_add%%
	</div>`,

	beneficiaries_list_caption: `Бенефициары`,
	beneficiaries_list_description: `Укажите пользователей, которые будут получать часть награждений.`,
	beneficiaries_list_add: `%%beneficiaries_item%% %%beneficiaries_add_item%%`,
	beneficiaries_item: `<div class="beneficiaries-item"><input type="text" name="account" class="round" placeholder="Логин"><input type="text" name="weight" class="round" placeholder="Процент от награды"></div>`,
	beneficiaries_add_item: `<a tabindex="0" class="beneficiaries-add-item-action" title="Добавить бенефициара">%%icon_editor_plus%%</a>`,

	preset_view_publish: `
	<div class="object type-text">
		<div class="object-column">
			<div class="content-view hidden" data-type="article">
				<div class="article-settings">%%article_settings%%</div>
				<div class="article-editor">
					<div class="editor-formatter">%%editor_formatter%%</div>
					<div class="editor-text article" contenteditable="true">%%editor_text_preset%%</div>
					<div class="editor-placeholders article">
						<h1>Название</h1>
						<p>Просто начните писать&hellip;</p>
					</div>
				</div>
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
			<p>Блокчейн Виз (VIZ) это социальная платформа работающая на технологии распределенного реестра (DLT). Именно на нем и работает данное приложение, поэтому вам нужен аккаунт в Виз и регулярный приватный ключ (аккаунт можно зарегистрировать через сервис <a href="https://start.viz.plus/" target="_blank">start.viz.plus</a>).</p>
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
			<p>Для решения этих проблем могут быть разработаны дополнительные микросервисы. Например, в ReaddleMe используется беспарольная аутентификация для записи и загрузки действий аккаунта (такие как подписка на пользователей, игнорирование тэгов, установка параметров).</p>
			<p>Отдельный микросервис создает предпросмотр для ссылок, сообщая браузеру мета-информацию о запрашиваемом url. Например, на основе этого формируется проигрыватель для аудио файлов.</p>
			<p>В будущем возможно будет вынести провайдера микросервисов в отдельное приложение, добавив к этому хранение файлов и записей с возможностью их удаления в соответствии с GDRP.</p>
		`},
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

	found_results: 'Найдено: {count}',

	profile_main_tab: 'Все',
	profile_posts_tab: 'Посты',
	profile_shares_tab: 'Репосты',
	profile_replies_tab: 'Ответы',

	users_main_tab: 'Все',
	users_subscribed_tab: 'Подписки',
	users_ignored_tab: 'Игнорируемые',
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

	toggle_theme_icon: '<div><a tabindex="0" data-href="dapp:app_settings/theme/" title="{title}" class="toggle-theme-icon">{icon}</a></div>',
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

	notifications_caption: 'Уведомления',
	awards_caption: 'Награждения',
	hashtags_caption: 'Тэги',
	users_caption: 'Пользователи',
	app_settings_caption: 'Настройки приложения',
	app_settings_saved: 'Настройки сохранены',
	app_settings_reset: 'Настройки сброшены',
	app_settings_main_tab: 'Общие',
	app_settings_feed_tab: 'Лента новостей',
	app_settings_theme_tab: 'Оформление',
	app_settings_sync_tab: 'Перенос данных',

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
	data_not_found: 'Данные не найдены',
	hashtags_not_found: 'Тэг не найден',
	users_not_found: 'Пользователи не найдены',

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
	menu_manual: 'Справочник',

	footer_link: `<div><a tabindex="0" data-href="{link}" class="{class}">{icon}</a></div>`,
	icon_scroll_top: `<i class="icon scroll"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 10.828l-4.95 4.95-1.414-1.414L12 8l6.364 6.364-1.414 1.414z"/></svg></i>`,
	icon_back: `<i class="icon back"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></i>`,
	icon_gem: `<i class="icon gem"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6.3499998 6.3500002" height="24" width="24" fill="none" stroke="currentColor" stroke-width="0.4" stroke-linecap="round" stroke-linejoin="round"><path d="m 1.019418,1.20416 1.108597,0.36953 m 4.0648556,0.86224 -0.8622424,-1.23177 m -5.17345221,1.23177 3.07943611,3.07944 2.9562585,-3.07944 -1.6013069,0.49271 -1.3549516,2.58673 -1.4781293,-2.58673 -1.60130681,-0.49271 0.86224211,-1.23177 1.2317745,-0.36953 h 1.8476616 l 1.231774,0.36953 -1.1085967,0.36953 H 2.128015 l -0.3695322,1.35495 h 2.8330809 l -0.3695322,-1.35495"/></svg></i>`,
	icon_reply: `<i class="icon reply"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M14 22.5L11.2 19H6a1 1 0 0 1-1-1V7.103a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1h-5.2L14 22.5zm1.839-5.5H21V8.103H7V17H12.161L14 19.298 15.839 17zM2 2h17v2H3v11H1V3a1 1 0 0 1 1-1z"/></svg></i>`,
	icon_share: `<i class="icon share"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M3,12c0,1.654,1.346,3,3,3c0.794,0,1.512-0.315,2.049-0.82l5.991,3.424C14.022,17.734,14,17.864,14,18c0,1.654,1.346,3,3,3 s3-1.346,3-3s-1.346-3-3-3c-0.794,0-1.512,0.315-2.049,0.82L8.96,12.397C8.978,12.266,9,12.136,9,12s-0.022-0.266-0.04-0.397 l5.991-3.423C15.488,8.685,16.206,9,17,9c1.654,0,3-1.346,3-3s-1.346-3-3-3s-3,1.346-3,3c0,0.136,0.022,0.266,0.04,0.397 L8.049,9.82C7.512,9.315,6.794,9,6,9C4.346,9,3,10.346,3,12z"/></svg></i>`,

	icon_users: `<i class="icon users"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M2 22a8 8 0 1 1 16 0h-2a6 6 0 1 0-12 0H2zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm8.284 3.703A8.002 8.002 0 0 1 23 22h-2a6.001 6.001 0 0 0-3.537-5.473l.82-1.824zm-.688-11.29A5.5 5.5 0 0 1 21 8.5a5.499 5.499 0 0 1-5 5.478v-2.013a3.5 3.5 0 0 0 1.041-6.609l.555-1.943z"/></svg></i>`,
	icon_copy_link: `<i class="icon copy_link"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8.465,11.293c1.133-1.133,3.109-1.133,4.242,0L13.414,12l1.414-1.414l-0.707-0.707c-0.943-0.944-2.199-1.465-3.535-1.465 S7.994,8.935,7.051,9.879L4.929,12c-1.948,1.949-1.948,5.122,0,7.071c0.975,0.975,2.255,1.462,3.535,1.462 c1.281,0,2.562-0.487,3.536-1.462l0.707-0.707l-1.414-1.414l-0.707,0.707c-1.17,1.167-3.073,1.169-4.243,0 c-1.169-1.17-1.169-3.073,0-4.243L8.465,11.293z"/><path d="M12,4.929l-0.707,0.707l1.414,1.414l0.707-0.707c1.169-1.167,3.072-1.169,4.243,0c1.169,1.17,1.169,3.073,0,4.243 l-2.122,2.121c-1.133,1.133-3.109,1.133-4.242,0L10.586,12l-1.414,1.414l0.707,0.707c0.943,0.944,2.199,1.465,3.535,1.465 s2.592-0.521,3.535-1.465L19.071,12c1.948-1.949,1.948-5.122,0-7.071C17.121,2.979,13.948,2.98,12,4.929z"/></svg></i>`,
	icon_new_object: `<i class="icon new_object"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M3,16c0,1.103,0.897,2,2,2h3.586L12,21.414L15.414,18H19c1.103,0,2-0.897,2-2V4c0-1.103-0.897-2-2-2H5C3.897,2,3,2.897,3,4 V16z M5,4h14v12h-4.414L12,18.586L9.414,16H5V4z"/><path d="M11 14L13 14 13 11 16 11 16 9 13 9 13 6 11 6 11 9 8 9 8 11 11 11z"/></svg></i>`,
	icon_edit_profile: `<i class="icon edit_profile"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M12 14v2a6 6 0 0 0-6 6H4a8 8 0 0 1 8-8zm0-1c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm2.595 7.812a3.51 3.51 0 0 1 0-1.623l-.992-.573 1-1.732.992.573A3.496 3.496 0 0 1 17 14.645V13.5h2v1.145c.532.158 1.012.44 1.405.812l.992-.573 1 1.732-.992.573a3.51 3.51 0 0 1 0 1.622l.992.573-1 1.732-.992-.573a3.496 3.496 0 0 1-1.405.812V22.5h-2v-1.145a3.496 3.496 0 0 1-1.405-.812l-.992.573-1-1.732.992-.572zM18 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/></svg></i>`,
	icon_github: `<i class="icon github"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M12.026,2c-5.509,0-9.974,4.465-9.974,9.974c0,4.406,2.857,8.145,6.821,9.465 c0.499,0.09,0.679-0.217,0.679-0.481c0-0.237-0.008-0.865-0.011-1.696c-2.775,0.602-3.361-1.338-3.361-1.338 c-0.452-1.152-1.107-1.459-1.107-1.459c-0.905-0.619,0.069-0.605,0.069-0.605c1.002,0.07,1.527,1.028,1.527,1.028 c0.89,1.524,2.336,1.084,2.902,0.829c0.091-0.645,0.351-1.085,0.635-1.334c-2.214-0.251-4.542-1.107-4.542-4.93 c0-1.087,0.389-1.979,1.024-2.675c-0.101-0.253-0.446-1.268,0.099-2.64c0,0,0.837-0.269,2.742,1.021 c0.798-0.221,1.649-0.332,2.496-0.336c0.849,0.004,1.701,0.115,2.496,0.336c1.906-1.291,2.742-1.021,2.742-1.021 c0.545,1.372,0.203,2.387,0.099,2.64c0.64,0.696,1.024,1.587,1.024,2.675c0,3.833-2.33,4.675-4.552,4.922 c0.355,0.308,0.675,0.916,0.675,1.846c0,1.334-0.012,2.41-0.012,2.737c0,0.267,0.178,0.577,0.687,0.479 C19.146,20.115,22,16.379,22,11.974C22,6.465,17.535,2,12.026,2z"/></svg></i>`,
	icon_telegram: `<i class="icon telegram"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.665,3.717l-17.73,6.837c-1.21,0.486-1.203,1.161-0.222,1.462l4.552,1.42l10.532-6.645 c0.498-0.303,0.953-0.14,0.579,0.192l-8.533,7.701l0,0l0,0H9.841l0.002,0.001l-0.314,4.692c0.46,0,0.663-0.211,0.921-0.46 l2.211-2.15l4.599,3.397c0.848,0.467,1.457,0.227,1.668-0.785l3.019-14.228C22.256,3.912,21.474,3.351,20.665,3.717z"/></svg></i>`,
	icon_account_settings: `<i class="icon account_settings"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3.783 2.826L12 1l8.217 1.826a1 1 0 0 1 .783.976v9.987a6 6 0 0 1-2.672 4.992L12 23l-6.328-4.219A6 6 0 0 1 3 13.79V3.802a1 1 0 0 1 .783-.976zM5 4.604v9.185a4 4 0 0 0 1.781 3.328L12 20.597l5.219-3.48A4 4 0 0 0 19 13.79V4.604L12 3.05 5 4.604zM12 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5zm-4.473 5a4.5 4.5 0 0 1 8.946 0H7.527z"/></svg></i>`,
	icon_view_profile: `<i class="icon view_profile"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M4 22a8 8 0 1 1 16 0h-2a6 6 0 1 0-12 0H4zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/></svg></i>`,
	icon_search: `<i class="icon search"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.023,16.977c-0.513-0.488-1.004-0.997-1.367-1.384c-0.372-0.378-0.596-0.653-0.596-0.653l-2.8-1.337 C15.34,12.37,16,10.763,16,9c0-3.859-3.14-7-7-7S2,5.141,2,9s3.14,7,7,7c1.763,0,3.37-0.66,4.603-1.739l1.337,2.8 c0,0,0.275,0.224,0.653,0.596c0.387,0.363,0.896,0.854,1.384,1.367c0.494,0.506,0.988,1.012,1.358,1.392 c0.362,0.388,0.604,0.646,0.604,0.646l2.121-2.121c0,0-0.258-0.242-0.646-0.604C20.035,17.965,19.529,17.471,19.023,16.977z M9,14 c-2.757,0-5-2.243-5-5s2.243-5,5-5s5,2.243,5,5S11.757,14,9,14z"/></svg></i>`,
	icon_feed: `<i class="icon feed"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.875,3H4.125C2.953,3,2,3.897,2,5v14c0,1.103,0.953,2,2.125,2h15.75C21.047,21,22,20.103,22,19V5 C22,3.897,21.047,3,19.875,3z M19.875,19H4.125c-0.057,0-0.096-0.016-0.113-0.016c-0.007,0-0.011,0.002-0.012,0.008L3.988,5.046 C3.995,5.036,4.04,5,4.125,5h15.75C19.954,5.001,19.997,5.028,20,5.008l0.012,13.946C20.005,18.964,19.96,19,19.875,19z"/><path d="M6 7H12V13H6zM13 15L6 15 6 17 13 17 14 17 18 17 18 15 14 15zM14 11H18V13H14zM14 7H18V9H14z"/></svg></i>`,
	icon_settings: `<i class="icon settings"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></i>`,
	icon_menu: `<i class="icon menu"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="23" height="23" stroke="none" fill="currentColor"><path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/></svg></i>`,
	icon_close: `<i class="icon close"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" stroke="none" fill="currentColor"><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"/></svg></i>`,
	icon_subscribe: `<i class="icon subscribe"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 8L17 8 17 11 14 11 14 13 17 13 17 16 19 16 19 13 22 13 22 11 19 11zM4 8c0 2.28 1.72 4 4 4s4-1.72 4-4-1.72-4-4-4S4 5.72 4 8zM10 8c0 1.178-.822 2-2 2S6 9.178 6 8s.822-2 2-2S10 6.822 10 8zM4 18c0-1.654 1.346-3 3-3h2c1.654 0 3 1.346 3 3v1h2v-1c0-2.757-2.243-5-5-5H7c-2.757 0-5 2.243-5 5v1h2V18z"/></svg></i>`,
	icon_subscribed: `<i class="icon subscribed"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.294 8.292L15.994 12.584 14.702 11.292 13.288 12.706 15.994 15.41 21.706 9.708zM4 8c0 2.28 1.72 4 4 4s4-1.72 4-4-1.72-4-4-4S4 5.72 4 8zM10 8c0 1.178-.822 2-2 2S6 9.178 6 8s.822-2 2-2S10 6.822 10 8zM4 18c0-1.654 1.346-3 3-3h2c1.654 0 3 1.346 3 3v1h2v-1c0-2.757-2.243-5-5-5H7c-2.757 0-5 2.243-5 5v1h2V18z"/></svg></i>`,
	icon_unsubscribe: `<i class="icon unsubscribe"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 11H22V13H14zM8 4C5.72 4 4 5.72 4 8s1.72 4 4 4 4-1.72 4-4S10.28 4 8 4zM8 10c-1.178 0-2-.822-2-2s.822-2 2-2 2 .822 2 2S9.178 10 8 10zM4 18c0-1.654 1.346-3 3-3h2c1.654 0 3 1.346 3 3v1h2v-1c0-2.757-2.243-5-5-5H7c-2.757 0-5 2.243-5 5v1h2V18z"/></svg></i>`,
	icon_ignore: `<i class="icon ignore"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M15.706 15.706L17.999 13.413 20.293 15.707 21.707 14.293 19.414 12 21.707 9.707 20.293 8.293 18 10.586 15.707 8.293 14.293 9.707 16.585 11.999 14.292 14.292zM12 8c0-2.28-1.72-4-4-4S4 5.72 4 8s1.72 4 4 4S12 10.28 12 8zM6 8c0-1.178.822-2 2-2s2 .822 2 2-.822 2-2 2S6 9.178 6 8zM4 18c0-1.654 1.346-3 3-3h2c1.654 0 3 1.346 3 3v1h2v-1c0-2.757-2.243-5-5-5H7c-2.757 0-5 2.243-5 5v1h2V18z"/></svg></i>`,
	icon_ignored: `<i class="icon ignore"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M15.706 15.706L17.999 13.413 20.293 15.707 21.707 14.293 19.414 12 21.707 9.707 20.293 8.293 18 10.586 15.707 8.293 14.293 9.707 16.585 11.999 14.292 14.292zM12 8c0-2.28-1.72-4-4-4S4 5.72 4 8s1.72 4 4 4S12 10.28 12 8zM6 8c0-1.178.822-2 2-2s2 .822 2 2-.822 2-2 2S6 9.178 6 8zM4 18c0-1.654 1.346-3 3-3h2c1.654 0 3 1.346 3 3v1h2v-1c0-2.757-2.243-5-5-5H7c-2.757 0-5 2.243-5 5v1h2V18z"/></svg></i>`,
	icon_notify: `<i class="icon notify"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg></i>`,
	icon_notify_clear: `<i class="icon notify-clear"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0"></path><path d="M18.63 13A17.89 17.89 0 0 1 18 8"></path><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"></path><path d="M18 8a6 6 0 0 0-9.33-5"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg></i>`,
	icon_message_clear: `<i class="icon message-clear"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20,2H4C2.897,2,2,2.897,2,4v12c0,1.103,0.897,2,2,2h3v3.767L13.277,18H20c1.103,0,2-0.897,2-2V4C22,2.897,21.103,2,20,2z M20,16h-7.277L9,18.233V16H4V4h16V16z"/><path d="M9.707 13.707L12 11.414 14.293 13.707 15.707 12.293 13.414 10 15.707 7.707 14.293 6.293 12 8.586 9.707 6.293 8.293 7.707 10.586 10 8.293 12.293z"/></svg></i>`,
	icon_hashtag: `<i class="icon hashtag"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7.784 14l.42-4H4V8h4.415l.525-5h2.011l-.525 5h3.989l.525-5h2.011l-.525 5H20v2h-3.784l-.42 4H20v2h-4.415l-.525 5h-2.011l.525-5H9.585l-.525 5H7.049l.525-5H4v-2h3.784zm2.011 0h3.99l.42-4h-3.99l-.42 4z"/></svg></i>`,
	icon_pin: `<i class="icon pin"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13.828 1.686l8.486 8.486-1.415 1.414-.707-.707-4.242 4.242-.707 3.536-1.415 1.414-4.242-4.243-4.95 4.95-1.414-1.414 4.95-4.95-4.243-4.242 1.414-1.415L8.88 8.05l4.242-4.242-.707-.707 1.414-1.415zm.708 3.536l-4.671 4.67-2.822.565 6.5 6.5.564-2.822 4.671-4.67-4.242-4.243z"/></svg></i>`,
	icon_eye_ignore: `<i class="icon eye-ignore"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M17.882 19.297A10.949 10.949 0 0 1 12 21c-5.392 0-9.878-3.88-10.819-9a10.982 10.982 0 0 1 3.34-6.066L1.392 2.808l1.415-1.415 19.799 19.8-1.415 1.414-3.31-3.31zM5.935 7.35A8.965 8.965 0 0 0 3.223 12a9.005 9.005 0 0 0 13.201 5.838l-2.028-2.028A4.5 4.5 0 0 1 8.19 9.604L5.935 7.35zm6.979 6.978l-3.242-3.242a2.5 2.5 0 0 0 3.241 3.241zm7.893 2.264l-1.431-1.43A8.935 8.935 0 0 0 20.777 12 9.005 9.005 0 0 0 9.552 5.338L7.974 3.76C9.221 3.27 10.58 3 12 3c5.392 0 9.878 3.88 10.819 9a10.947 10.947 0 0 1-2.012 4.592zm-9.084-9.084a4.5 4.5 0 0 1 4.769 4.769l-4.77-4.769z"/></svg></i>`,

	icon_menu_collapse: `<i class="icon menu-collapse"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18 6H20V18H18zM10 11L4 11 4 13 10 13 10 18 16 12 10 6z"/></svg></i>`,
	icon_menu_expand: `<i class="icon menu-expand"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18 6H20V18H18zM10 18L10 13 16 13 16 11 10 11 10 6 4 12z"/></svg></i>`,
	icon_theme_moon: `<i class="icon theme-moon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.742,13.045c-0.677,0.18-1.376,0.271-2.077,0.271c-2.135,0-4.14-0.83-5.646-2.336c-2.008-2.008-2.799-4.967-2.064-7.723 c0.092-0.345-0.007-0.713-0.259-0.965C10.444,2.04,10.077,1.938,9.73,2.034C8.028,2.489,6.476,3.382,5.241,4.616 c-3.898,3.898-3.898,10.243,0,14.143c1.889,1.889,4.401,2.93,7.072,2.93c2.671,0,5.182-1.04,7.07-2.929 c1.236-1.237,2.13-2.791,2.583-4.491c0.092-0.345-0.008-0.713-0.26-0.965C21.454,13.051,21.085,12.951,20.742,13.045z M17.97,17.346c-1.511,1.511-3.52,2.343-5.656,2.343c-2.137,0-4.146-0.833-5.658-2.344c-3.118-3.119-3.118-8.195,0-11.314 c0.602-0.602,1.298-1.102,2.06-1.483c-0.222,2.885,0.814,5.772,2.89,7.848c2.068,2.069,4.927,3.12,7.848,2.891 C19.072,16.046,18.571,16.743,17.97,17.346z"/></svg></i>`,
	icon_theme_full_moon: `<i class="icon theme-full-moon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12,11.807C9.349,9.155,8.7,5.261,10.049,2c-1.875,0.37-3.666,1.281-5.12,2.735c-3.905,3.905-3.905,10.237,0,14.142	c3.906,3.906,10.237,3.905,14.143,0c1.454-1.454,2.364-3.244,2.735-5.119C18.545,15.106,14.651,14.458,12,11.807z"/></svg></i>`,
	icon_theme_sun: `<i class="icon theme-sun"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg></i>`,
	icon_attach: `<i class="icon attach"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M14.828 7.757l-5.656 5.657a1 1 0 1 0 1.414 1.414l5.657-5.656A3 3 0 1 0 12 4.929l-5.657 5.657a5 5 0 1 0 7.071 7.07L19.071 12l1.414 1.414-5.657 5.657a7 7 0 1 1-9.9-9.9l5.658-5.656a5 5 0 0 1 7.07 7.07L12 16.244A3 3 0 1 1 7.757 12l5.657-5.657 1.414 1.414z"/></svg></i>`,
	icon_question: `<i class="icon question"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm2-1.645V14h-2v-1.5a1 1 0 0 1 1-1 1.5 1.5 0 1 0-1.471-1.794l-1.962-.393A3.501 3.501 0 1 1 13 13.355z"/></svg></i>`,

	icon_player_play: `<i class="icon player-play"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 6L7 18 17 12z"></path></svg></i>`,
	icon_player_pause: `<i class="icon player-pause"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 7H11V17H8zM13 7H16V17H13z"></path></svg></i>`,

	article_publish_caption: `Опубликовать`,
	article_settings_caption: `Настройки`,
	editor_caption: `Расширенная публикация`,
	editor_attach_caption: `Добавить файл`,
	editor_attach_image_caption: `Добавить изображение`,
	editor_image_caption: `Вставить изображение`,
	editor_link_caption: `Вставить ссылку`,
	editor_link_prompt: `Введите адрес для ссылки`,
	editor_image_prompt: `Введите адрес изображения`,
	editor_link_placeholder_prompt: `https://`,

	editor_error_empty_title: `Введите название публикации`,
	editor_error_empty_markdown: `Введите текст публикации`,

	editor_bold_caption: `Полужирный`,
	editor_italic_caption: `Курсив`,
	editor_strikethrough_caption: `Зачеркнутый`,
	editor_header2_caption: `Раздел`,
	editor_header3_caption: `Подраздел`,
	editor_code_caption: `Код`,
	editor_quote_caption: `Цитата`,
	editor_separator_caption: `Разделитель`,

	editor_text_preset: `<h1><br></h1><p><br></p>`,
	editor_formatter_separator: `<span class="separator"></span>`,
	editor_formatter: `
	<a class="editor-attach-action" tabindex="0" title="%%editor_attach_caption%%">%%icon_attach%%</a>
	<a class="editor-attach-image-action" tabindex="0" title="%%editor_attach_image_caption%%">%%icon_editor_attach_image%%</a>
	<a class="editor-image-action" tabindex="0" title="%%editor_image_caption%%">%%icon_editor_image%%</a>
	<a class="editor-link-action" tabindex="0" title="%%editor_link_caption%%">%%icon_copy_link%%</a>
	%%editor_formatter_separator%%
	<a class="editor-bold-action" tabindex="0" title="%%editor_bold_caption%%">%%icon_editor_bold%%</a>
	<a class="editor-italic-action" tabindex="0" title="%%editor_italic_caption%%">%%icon_editor_italic%%</a>
	<a class="editor-strikethrough-action" tabindex="0" title="%%editor_strikethrough_caption%%">%%icon_editor_strikethrough%%</a>
	<a class="editor-code-action" tabindex="0" title="%%editor_code_caption%%">%%icon_editor_code%%</a>
	%%editor_formatter_separator%%
	<a class="editor-header2-action" tabindex="0" title="%%editor_header2_caption%%">%%icon_editor_header2%%</a>
	<a class="editor-header3-action" tabindex="0" title="%%editor_header3_caption%%">%%icon_editor_header3%%</a>
	<a class="editor-quote-action" tabindex="0" title="%%editor_quote_caption%%">%%icon_editor_quote%%</a>
	%%editor_formatter_separator%%
	<a class="editor-separator-action" tabindex="0" title="%%editor_separator_caption%%">%%icon_editor_separator%%</a>

	`,
	icon_check: `<i class="icon check"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"/></svg></i>`,
	icon_editor: `<i class="icon editor"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7,17.013l4.413-0.015l9.632-9.54c0.378-0.378,0.586-0.88,0.586-1.414s-0.208-1.036-0.586-1.414l-1.586-1.586 c-0.756-0.756-2.075-0.752-2.825-0.003L7,12.583V17.013z M18.045,4.458l1.589,1.583l-1.597,1.582l-1.586-1.585L18.045,4.458z M9,13.417l6.03-5.973l1.586,1.586l-6.029,5.971L9,15.006V13.417z"></path><path d="M5,21h14c1.103,0,2-0.897,2-2v-8.668l-2,2V19H8.158c-0.026,0-0.053,0.01-0.079,0.01c-0.033,0-0.066-0.009-0.1-0.01H5V5 h6.847l2-2H5C3.897,3,3,3.897,3,5v14C3,20.103,3.897,21,5,21z"></path></svg></i>`,
	icon_editor_quote: `<i class="icon editor-quote"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M19.417 6.679C20.447 7.773 21 9 21 10.989c0 3.5-2.457 6.637-6.03 8.188l-.893-1.378c3.335-1.804 3.987-4.145 4.247-5.621-.537.278-1.24.375-1.929.311-1.804-.167-3.226-1.648-3.226-3.489a3.5 3.5 0 0 1 3.5-3.5c1.073 0 2.099.49 2.748 1.179zm-10 0C10.447 7.773 11 9 11 10.989c0 3.5-2.457 6.637-6.03 8.188l-.893-1.378c3.335-1.804 3.987-4.145 4.247-5.621-.537.278-1.24.375-1.929.311C4.591 12.322 3.17 10.841 3.17 9a3.5 3.5 0 0 1 3.5-3.5c1.073 0 2.099.49 2.748 1.179z"/></svg></i>`,
	icon_editor_bold: `<i class="icon editor-bold"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M8 11h4.5a2.5 2.5 0 1 0 0-5H8v5zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5zM8 13v5h5.5a2.5 2.5 0 1 0 0-5H8z"/></svg></i>`,
	icon_editor_italic: `<i class="icon editor-italic"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M15 20H7v-2h2.927l2.116-12H9V4h8v2h-2.927l-2.116 12H15z"/></svg></i>`,
	icon_editor_strikethrough: `<i class="icon editor-strikethrough"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M13 9h-2V6H5V4h14v2h-6v3zm0 6v5h-2v-5h2zM3 11h18v2H3v-2z"/></svg></i>`,
	icon_editor_header2: `<i class="icon editor-header2"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M4 4v7h7V4h2v16h-2v-7H4v7H2V4h2zm14.5 4c2.071 0 3.75 1.679 3.75 3.75 0 .857-.288 1.648-.772 2.28l-.148.18L18.034 18H22v2h-7v-1.556l4.82-5.546c.268-.307.43-.709.43-1.148 0-.966-.784-1.75-1.75-1.75-.918 0-1.671.707-1.744 1.606l-.006.144h-2C14.75 9.679 16.429 8 18.5 8z"/></svg></i>`,
	icon_editor_header3: `<i class="icon editor-header3"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M22 8l-.002 2-2.505 2.883c1.59.435 2.757 1.89 2.757 3.617 0 2.071-1.679 3.75-3.75 3.75-1.826 0-3.347-1.305-3.682-3.033l1.964-.382c.156.806.866 1.415 1.718 1.415.966 0 1.75-.784 1.75-1.75s-.784-1.75-1.75-1.75c-.286 0-.556.069-.794.19l-1.307-1.547L19.35 10H15V8h7zM4 4v7h7V4h2v16h-2v-7H4v7H2V4h2z"/></svg></i>`,
	icon_editor_code: `<i class="icon editor-code"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M23 12l-7.071 7.071-1.414-1.414L20.172 12l-5.657-5.657 1.414-1.414L23 12zM3.828 12l5.657 5.657-1.414 1.414L1 12l7.071-7.071 1.414 1.414L3.828 12z"/></svg></i>`,
	icon_editor_image: `<i class="icon editor-image"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="7.499" cy="9.5" r="1.5"></circle><path d="M10.499 14L8.999 12 5.999 16 8.999 16 11.999 16 17.999 16 13.499 10z"></path><path d="M19.999,4h-16c-1.103,0-2,0.897-2,2v12c0,1.103,0.897,2,2,2h16c1.103,0,2-0.897,2-2V6C21.999,4.897,21.102,4,19.999,4z M3.999,18V6h16l0.002,12H3.999z"></path>
			</svg></i>`,
	icon_editor_attach_image: `<i class="icon editor-image"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M4,5h13v7h2V5c0-1.103-0.897-2-2-2H4C2.897,3,2,3.897,2,5v12c0,1.103,0.897,2,2,2h8v-2H4V5z"></path><path d="M8 11L5 15 16 15 12 9 9 13z"></path><path d="M19 14L17 14 17 17 14 17 14 19 17 19 17 22 19 22 19 19 22 19 22 17 19 17z"></path></svg></i>`,
	icon_editor_plus: `<i class="icon editor-plus"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 11L13 11 13 5 11 5 11 11 5 11 5 13 11 13 11 19 13 19 13 13 19 13z"></path></svg></i>`,
	icon_editor_separator: `<i class="icon editor-separator"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M2 11h2v2H2v-2zm4 0h12v2H6v-2zm14 0h2v2h-2v-2z"/></svg></i>`,
	header_back_action: `<a tabindex="0" class="back-action" title="Назад" data-force="{force}">{icon}</a>`,
	header_link: '<div class="link grow"><div class="header-link-wrapper"><input type="text" class="header-link" value="{link}"><div class="header-link-icons">{icons}</div></div></div>',
	header_link_icons: `
		<i tabindex="0" class="icon copy icon-copy-action" title="Копировать адрес"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20,2H10C8.897,2,8,2.897,8,4v4H4c-1.103,0-2,0.897-2,2v10c0,1.103,0.897,2,2,2h10c1.103,0,2-0.897,2-2v-4h4 c1.103,0,2-0.897,2-2V4C22,2.897,21.103,2,20,2z M4,20V10h10l0.002,10H4z M20,14h-4v-4c0-1.103-0.897-2-2-2h-4V4h10V14z"/></svg></i>
		<i tabindex="0" class="icon search icon-search-action" title="Перейти"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.023,16.977c-0.513-0.488-1.004-0.997-1.367-1.384c-0.372-0.378-0.596-0.653-0.596-0.653l-2.8-1.337 C15.34,12.37,16,10.763,16,9c0-3.859-3.14-7-7-7S2,5.141,2,9s3.14,7,7,7c1.763,0,3.37-0.66,4.603-1.739l1.337,2.8 c0,0,0.275,0.224,0.653,0.596c0.387,0.363,0.896,0.854,1.384,1.367c0.494,0.506,0.988,1.012,1.358,1.392 c0.362,0.388,0.604,0.646,0.604,0.646l2.121-2.121c0,0-0.258-0.242-0.646-0.604C20.035,17.965,19.529,17.471,19.023,16.977z M9,14 c-2.757,0-5-2.243-5-5s2.243-5,5-5s5,2.243,5,5S11.757,14,9,14z"/></svg></i>`,
	header_caption: '<div class="caption grow">{caption}</div>',
	header_caption_link: '<a data-href="{link}" tabindex="0" class="caption grow">{caption}</a>',
	icon_link: '<a tabindex="0" class="{action}-action{addon}" title="{caption}">{icon}</a>',
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
	profile_default_avatar: 'data:image/png;base64,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',//default.png
	new_object_link: '<a tabindex="0" data-href="dapp:publish" title="Написать">{icon_new_object}</a>',

	publish_caption: 'Публикация',
	publish_empty_text: 'Введите текст публикации',
	publish_success: 'Запись успешно опубликована&hellip;',
	publish_success_link: 'Запись успешно опубликована: <a tabindex="0" data-href="viz://@{account}/{block}/">ссылка</a>',

	object_type_publication_full: `
		<div class="publication-readline" data-object="{link}"><div class="fill-level"></div></div>
		<div class="object type-text" data-link="{link}" data-publication="true">
			<div class="author-view">
				<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
				<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a></div>
			</div>
			<div class="object-column">
				<div class="article">{context}</div>
				<div class="date-view" data-timestamp="{timestamp}">&hellip;</div>
				<div class="actions-view">{actions}</div>
			</div>
		</div>`,
	object_type_publication: `
		<div class="object type-text" data-link="{link}">
			<div class="author-view">
				<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
				<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a></div>
			</div>
			<div class="object-column">
				<div class="preview-wrapper{class_addon}"{addon}>{context}</div>
				<div class="date-view" data-timestamp="{timestamp}">&hellip;</div>
				<div class="actions-view">{actions}</div>
			</div>
		</div>`,
	object_type_publication_preview: `
		<div class="object type-text-preview" data-account="{account}" data-block="{block}" data-link="{link}" data-previous="{previous}" data-is-reply="{is_reply}" data-is-share="{is_share}">
			<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
			<div class="object-column">
				<div class="author-view">
					<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a><a tabindex="0" data-href="{link}" class="short-date-view" data-timestamp="{timestamp}">&hellip;</a></div>
				</div>
				<div class="preview-article-wrapper{class_addon}"{addon}>{context}</div>
				<div class="actions-view">{actions}</div>
			</div>
		</div>`,
	object_type_text: `
		<div class="object type-text" data-link="{link}">
			<div class="author-view">
				<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
				<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a></div>
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
	<a tabindex="0" class="reply-action" title="Комментировать">{icon_reply}</a>
	<a tabindex="0" class="share-action" title="Поделиться">{icon_share}</a>
	<a tabindex="0" class="award-action" title="Наградить">{icon_award}</a>
	<a tabindex="0" class="copy-link-action" title="Копировать ссылку">{icon_copy_link}</a>`,
	object_type_text_pinned: `<div class="object type-text-loading pinned-object" data-link="{link}">{context}</div>`,
	object_type_text_pinned_caption: `
	<div class="share-view">{icon} Закрепленная запись</div>
	<div class="load-content"><div class="load-placeholder"><span class="loading-ring"></span></div></div>`,
	object_type_text_loading: `<div class="object type-text-loading" data-account="{account}" data-block="{block}" data-link="{link}" data-previous="{previous}" data-is-reply="{is_reply}" data-is-share="{is_share}">{context}</div>`,
	object_type_text_wait_loading: `<div class="object type-text-wait-loading" data-link="{link}"><div class="load-content"><div class="load-placeholder"><span class="loading-ring"></span></div></div></div>`,
	object_type_text_share: `
	<div class="share-view"><a tabindex="0" data-href="{link}">{caption}</a> поделился:{comment}</div>
	<div class="load-content"><div class="load-placeholder"><span class="loading-ring"></span></div></div>`,
	object_type_text_share_comment: ` <div class="comment-view">{comment}</div>`,
	object_type_text_preview: `
		<div class="object type-text-preview" data-account="{account}" data-block="{block}" data-link="{link}" data-previous="{previous}" data-is-reply="{is_reply}" data-is-share="{is_share}">
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
		<div class="object type-text-preview" data-link="{link}">
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
		<div class="object type-text-preview" data-link="{link}">
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
	feed_new_objects: 'Показать новые обновления: {items}',
	feed_no_new_objects: 'Новых обновлений нет',

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
			'1': ` янв.`,
			'2': ` фев.`,
			'3': ` мар.`,
			'4': ` апр.`,
			'5': ` мая`,
			'6': ` июн.`,
			'7': ` июл.`,
			'8': ` авг.`,
			'9': ` сен.`,
			'10': ` окт.`,
			'11': ` ноя.`,
			'12': ` дек.`,
		},
	},

	fast_publish: `
	<div class="fast-publish-wrapper" data-reply="{reply}" data-share="{share}" tabindex="0" title="Форма быстрой публикации">
		<div class="avatar" alt=""><img src="{avatar}"></div>
		<div class="placeholder">{placeholder}</div>
		<div class="text" data-placeholder="true" contenteditable="true"></div>
		<div class="buttons">
			<div tabindex="0" class="button fast-publish-attach-action" title="Добавить файл">{attach}</div>
			<div tabindex="0" class="button fast-publish-action" title="Опубликовать">{button}</div>
		</div>
	</div>`,
	fast_publish_feed: `Что нового?`,
	fast_publish_reply: `Написать в ответ`,
	fast_publish_share: `Добавить комментарий`,
	fast_publish_button: `Отправить`,
};