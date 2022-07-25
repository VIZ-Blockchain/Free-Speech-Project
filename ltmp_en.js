var ltmp_en_arr = {
	reg_service_domain: `start.viz.plus`,
	reg_service_link: `https://start.viz.plus/`,
	reg_service_caption: `Sign Up`,
	left_addon_reg_button: '<div taborder="0" class="reg-button">%%reg_service_caption%%</div>',

	preset_view_account: `
	<div class="object type-text">
		<div class="object-column">
			<div class="content-view" data-tab="credentials">
				<p>VIZ account:</p>
				<p><input type="text" name="viz_account" value=""></p>
				<div class="input-addon">(registration via <a href="%%reg_service_link%%" target="_blank">%%reg_service_domain%%</a>)</div>
				<p>Private regular key:</p>
				<p><input type="password" name="viz_regular_key" value=""></p>
				<div class="input-addon">(regular private key)</div>
				<p class="error save-account-error"></p>
				<p class="success save-account-success"></p>
				<p><a class="button save-account-action">Save</a><span class="submit-button-ring"></span></p>
				<hr>
				<p><a class="button neutral-button remove-account-action">Sign out of VIZ Account</a></p>
			</div>
			<div class="content-view" data-tab="profile">
				<p>Name:</p>
				<p><input type="text" name="nickname" value=""></p>
				<div class="input-addon">(will be displayed next to the account <span class="viz_account">&hellip;</span>)</div>

				<p>A little about myself:</p>
				<p><input type="text" name="about" value=""></p>
				<div class="input-addon">(displayed on your profile)</div>

				<p>Link to avatar:</p>
				<p><input type="text" name="avatar" value="" placeholder="https://"></p>
				<div class="input-addon">(upload image via: <a class="ipfs-upload-profile-avatar-action">IPFS</a>, <a class="sia-upload-profile-avatar-action">Sia</a>, allowed links https://, ipfs://, sia://, minimum image size 49x49 pixels)</div>

				<p>Interests:</p>
				<p><input type="text" name="interests" value=""></p>
				<div class="input-addon">(separate with commas, will be converted to tags for search in profile)</div>

				<p>Categories:</p>
				<p><input type="text" name="categories" value=""></p>
				<div class="input-addon">(separate with commas, will be converted to tags to categorize posts in profile)</div>

				<p>Pinned post:</p>
				<p><input type="text" name="pinned_object" value=""></p>
				<div class="input-addon">(provide a link like viz://@account/block/)</div>

				<p>Telegram:</p>
				<p><input type="text" name="telegram" value=""></p>
				<div class="input-addon">(enter username without «@» symbol)</div>

				<p>GitHub:</p>
				<p><input type="text" name="github" value=""></p>
				<div class="input-addon">(enter username)</div>

				<p class="error save-profile-error"></p>
				<p class="success save-profile-success"></p>
				<p><a class="button save-profile-action">Save</a><span class="submit-button-ring"></span></p>
				<p><em>Attention! All information will be recorded in the blockchain, it can be replaced, but it will not be possible to «delete» or «erase» from history.</em></p>
			</div>
			<div class="content-view" data-tab="qr">
				<p>You can import account by scan this QR-code from another device.</p>
				<div class="objects"></div>
			</div>
			<div class="content-view" data-tab="scan_qr">
				<p>Open “Account”&rarr;“Export via QR” on device with signed account and scan QR-code from it.</p>
				<div class="objects"></div>
			</div>
		</div>
	</div>
	`,
	preset_view_app_settings: `
	<div class="object type-text">
		<div class="object-column">
			<div class="content-view" data-tab="main">
				<p>Maximum number of stored user activity:</p>
				<p><input type="text" name="activity_size" placeholder="0" value=""></p>
				<div class="input-addon">(0 — unrestricted)</div>

				<p>Frequency of loading user activity:</p>
				<p><input type="text" name="activity_period" placeholder="30" value=""></p>
				<div class="input-addon">(in minutes after the update)</div>

				<p>Load depth of user activity:</p>
				<p><input type="text" name="activity_deep" placeholder="50" value=""></p>
				<div class="input-addon">(applies when the update is triggered)</div>

				<p>Frequency of user profile updates:</p>
				<p><input type="text" name="user_profile_ttl" placeholder="60" value=""></p>
				<div class="input-addon">(in minutes after the update)</div>

				<p>Duration of storage of cache of unknown users:</p>
				<p><input type="text" name="user_cache_ttl" placeholder="10" value=""></p>
				<div class="input-addon">(in minutes after loading)</div>

				<p>Duration of storage of activity of unknown users:</p>
				<p><input type="text" name="object_cache_ttl" placeholder="10" value=""></p>
				<div class="input-addon">(in minutes after loading)</div>

				<p>Duration of link preview storage:</p>
				<p><input type="text" name="preview_cache_ttl" placeholder="7200" value=""></p>
				<div class="input-addon">(in minutes after loading)</div>

				<hr>
				<p>Settings for <span class="tooltip" title="Not safe/suitable for work — content containing information for adults">NSFW content</span>:</p>
				<p><label><input type="checkbox" name="nsfw_warning"> &mdash; hide behind a spoiler with a warning</label></p>
				<div class="input-addon">(when clicked, the content will be shown)</div>

				<p>Tags for marking records as containing NSFW content:</p>
				<p><input type="text" name="nsfw_hashtags" placeholder="nsfw, sex, porn..." value=""></p>
				<div class="input-addon">(list, separated by commas, applicable to new items)</div>

				<hr>
				<p>Award settings:</p>
				<p><label><input type="checkbox" name="silent_award"> &mdash; clear the memo</label></p>
				<div class="input-addon">(no one will know what the award is for)</div>

				<p>The percentage of energy used for the award:</p>
				<p><input type="text" name="energy" placeholder="1%" value=""></p>
				<div class="input-addon">(regenerates 20% per day)</div>

				<p class="error save-settings-error"></p>
				<p class="success save-settings-success"></p>
				<p><a class="button save-settings-action">Save</a><span class="submit-button-ring"></span></p>
				<hr>
				<p><a class="button neutral-button install-action"></a></p>
				<p><a class="button neutral-button reset-settings-action">Reset all settings</a></p>
				<p><a class="button neutral-button reset-database-action">Reset database state</a></p>
			</div>
			<div class="content-view" data-tab="feed">
				<p>Maximum number of entries in the news feed:</p>
				<p><input type="text" name="feed_size" placeholder="10000" value=""></p>
				<hr>
				<p>Adding to the news feed:</p>
				<p><label><input type="checkbox" name="feed_subscribe_text"> &mdash; posts</label></p>
				<p><label><input type="checkbox" name="feed_subscribe_shares"> &mdash; reposts</label></p>
				<p><label><input type="checkbox" name="feed_subscribe_mentions"> &mdash; mentions</label></p>
				<p><label><input type="checkbox" name="feed_subscribe_replies"> &mdash; replies to other users</label></p>

				<p class="error save-feed-settings-error"></p>
				<p class="success save-feed-settings-success"></p>
				<p><a class="button save-feed-settings-action">Save</a><span class="submit-button-ring"></span></p>
			</div>
			<div class="content-view" data-tab="theme">
				<p>Theme used:</p>
				<p><label><input type="radio" name="theme-mode" value="light"> &mdash; light</label></p>
				<p><label><input type="radio" name="theme-mode" value="night"> &mdash; night</label></p>
				<p><label><input type="radio" name="theme-mode" value="auto"> &mdash; automatic mode</label></p>
				<hr>
				<p>Night theme:</p>
				<p><label><input type="radio" name="theme-night-mode" value="midnight"> &mdash; midnight</label></p>
				<p><label><input type="radio" name="theme-night-mode" value="dark"> &mdash; dark</label></p>
				<hr>
				<p>Automatic mode</p>
				<p>The day starts:</p>
				<p><input type="text" name="theme-auto-light" placeholder="06:00" value=""></p>
				<p>The night starts:</p>
				<p><input type="text" name="theme-auto-night" placeholder="21:00" value=""></p>
				<div class="input-addon">(time in HH:MM format)</div>

				<p class="error save-theme-settings-error"></p>
				<p class="success save-theme-settings-success"></p>
				<p><a class="button save-theme-settings-action">Save</a><span class="submit-button-ring"></span></p>
			</div>
			<div class="content-view" data-tab="connection">
				<p>Select node from the list:</p>
				<div class="api-gates-list">
				</div>
				<p>Set the node address manually:</p>
				<p><input type="text" name="api_gate_str" placeholder="https://" value=""></p>
				<div class="input-addon">(it is recommended to use the HTTPS protocol for privacy)</div>
				<hr>
				<p class="error save-connection-settings-error"></p>
				<p class="success save-connection-settings-success"></p>
				<p><a class="button save-connection-settings-action">Save</a><span class="submit-button-ring"></span></p>
			</div>
			<div class="content-view" data-tab="languages">
				<p>Select your preferred language for headlines, buttons, and other text:</p>
				<div class="languages-list">
				</div>
				<p><a class="button save-languages-settings-action">Save</a></p>
			</div>
			<div class="content-view" data-tab="sync">
				<p><label><input type="checkbox" name="sync-cloud"> &mdash; automatic synchronization with the cloud</label></p><hr>
				<p>
					<strong>Attention!</strong>
					The export is focused on saving the latest items from the application database, the private key is not saved.
				</p>
				<p>
					Synchronization with cloud storage verifies that the data is signed with the account private key and allows you to synchronize the latest subscription changes between multiple instances of the app (for example, on a PC and a smartphone). To do this, simply sign in to the app on the other device and wait until synchronization is complete.
				</p>
				<p>
					If you have synchronization with the cloud enabled, actions with users and tags will be restored on another instance of the application. Saving the backup is a new reference point (synchronization will start from it).
				</p>
				<p><label><input type="checkbox" name="sync-users"> &mdash; users</label></p>
				<p><label><input type="checkbox" name="sync-feed"> &mdash; news feed</label></p>
				<p><label><input type="checkbox" name="sync-replies"> &mdash; replies</label></p>
				<p><label><input type="checkbox" name="sync-hashtags"> &mdash; tags</label></p>
				<p><label><input type="checkbox" name="sync-awards"> &mdash; awards</label></p>
				<p><label><input type="checkbox" name="sync-settings"> &mdash; settings</label></p>
				<p>Maximum number of items:</p>
				<p><input type="text" name="sync-size" placeholder="" value=""></p>
				<div class="input-addon">(for news feed, replies, tags, awards)</div>

				<p class="error sync-export-error"></p>
				<p class="success sync-export-success"></p>
				<p><a class="button sync-export-file-action">Export to file</a><span class="submit-button-ring" rel="export-file"></span></p>
				<p><a class="button sync-export-cloud-action">Save the backup to the cloud</a><span class="submit-button-ring" rel="export-cloud"></span></p>
				<hr>
				<p>
					Importing the saved state is done in several steps, old application data will be deleted, new data will be restored, and the application will be restarted automatically.
				</p>
				<p class="success sync-import-success"></p>
				<p class="error sync-import-error"></p>
				<p><a class="button sync-import-file-action">Import from a file</a><span class="submit-button-ring" rel="import-file"></span></p>
				<p><a class="button sync-import-cloud-action">Reset and sync from the cloud</a><span class="submit-button-ring" rel="import-cloud"></span></p>
			</div>
		</div>
	</div>`,
	api_list_item:`<p><label><input type="radio" name="api_gate" value="{value}"{selected}> &mdash; {domain}</label></p>`,
	languages_list_item:`<p><label><input type="radio" name="language" value="{value}"{selected}> &mdash; {caption}</label></p>`,
	languages_short_list_item:`<div class="select-language-wrapper"><a class="select-language{selected}" data-value="{value}">{caption}</a></div>`,

	node_request:'Sending a request to a node&hellip;',
	node_not_respond:'Node is not responding',
	node_wrong_response:'Node response does not match the format',
	node_protocol_error:'Address must contain the protocol (http/https/ws/wss)',
	node_empty_error:'Address cannot be empty',
	node_success:'Node is set as the default',

	gate_connection_error:'<div class="gate-connection-error">Connection error, <a tabindex="0" data-href="dapp:app_settings/connection/">check the settings&hellip;</a></div>',

	install_caption: `Install as App on Home screen`,
	publish_interests: `Add tags for your interests:<div class="interests">{interests}</div>`,
	publish_interests_item: `<a class="publish-add-interest-action" data-hashtag="{hashtag}">#{caption}</a>`,
	publish_categories: `Add a tag for your categories:<div class="categories">{categories}</div>`,
	publish_categories_item: `<a class="publish-add-category-action" data-hashtag="{hashtag}">#{caption}</a>`,
	article_settings: `
	<p>Annotation for publication:</p>
	<p><input type="text" name="description" value=""></p>
	<div class="input-addon">(just text without markup)</div>
	<p>Thumbnail:</p>
	<p><input type="text" name="thumbnail" value=""></p>
	<div class="input-addon">(Upload image via: <a class="ipfs-upload-article-thumbnail-action">IPFS</a>, <a class="sia-upload-article-thumbnail-action">Sia</a>, allowed links https://, ipfs://, sia://)</div>
	<div class="add-interests"></div>
	<div class="add-categories"></div>

	<div class="edit-event-addon">
		<hr>
		<p>Editable object:</p>
		<p><input type="text" name="edit-event-object" value=""></p>
		<div class="input-addon">(optional field, contains the address to the object)</div>
	</div>

	<div class="toggle-publish-addons"><a tabindex="0" class="toggle-publish-addons-action">%%open_publish_addons%%</a></div>
	<div class="publish-addons">%%publish_addons%%</div>
	`,

	open_publish_addons: `&#x25B8; Additional settings`,
	close_publish_addons: `&#x25BE; Additional settings`,
	publish_addons: `
	<div class="beneficiaries-list">
		<div class="beneficiaries-list-caption">%%beneficiaries_list_caption%%</div>
		<div class="beneficiaries-list-desription">%%beneficiaries_list_description%%</div>
		%%beneficiaries_list_add%%
	</div>`,

	beneficiaries_list_caption: `Beneficiaries`,
	beneficiaries_list_description: `Specify the users who will receive some of the rewards.`,
	beneficiaries_list_add: `%%beneficiaries_item%% %%beneficiaries_add_item%%`,
	beneficiaries_item: `<div class="beneficiaries-item"><input type="text" name="account" class="round" placeholder="Login" value="{account}"><input type="text" name="weight" class="round" placeholder="Percent of reward" value="{weight}"></div>`,
	beneficiaries_add_item: `<a tabindex="0" class="beneficiaries-add-item-action" title="Add benificary">%%icon_editor_plus%%</a>`,

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
						<p>Message text:</p>
						<p><textarea name="text"></textarea></p>
						<div class="input-addon">(just text without markup, attach file: <a tabindex="0" class="publish-attach-sia-action">sia</a>)</div>
						<div class="add-interests"></div>
						<div class="add-categories"></div>
					</div>
					<div class="comment-addon">
						<p>Comment text:</p>
						<p><input type="text" name="comment" value=""></p>
						<div class="input-addon">(just text without markup)</div>
						<div class="add-interests"></div>
						<div class="add-categories"></div>
					</div>
					<div class="reply-addon">
						<p>Commented object:</p>
						<p><input type="text" name="reply" value=""></p>
						<div class="input-addon">(optional field, contains the address to the object)</div>
					</div>
					<div class="share-addon">
						<p>Sharing the content:</p>
						<p><input type="text" name="share" value=""></p>
						<div class="input-addon">(optional field, contains the address to the object)</div>
					</div>
					<div class="loop-addon">
						<p>Block number to create a loop:</p>
						<p><input type="text" name="loop" value=""></p>
						<div class="input-addon">(you can hide recent entries or vice versa: re-establish link)</div>
					</div>
					<div class="edit-event-addon">
						<hr>
						<p>Editable object:</p>
						<p><input type="text" name="edit-event-object" value="" disabled></p>
						<div class="input-addon">(optional field, contains the address to the object)</div>
					</div>
				</div>
				<p class="error publish-error"></p>
				<p class="success publish-success"></p>
				<p><a class="button publish-action">Publish</a><span class="submit-button-ring"></span></p>
				<p><em>Attention! All information will be recorded in the blockchain from account <span class="viz_account">&hellip;</span>, it not be possible to «erase» from history.</em></p>
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
	dapp_notice: `<div class="menu-notice">To fill out a news feed, you need to sign in, find and subscribe to users you are interested in (similar to the new phone number - there is no shared address book, you need to enter a new contact manually).</div>`,
	brand_caption: `Readdle.Me`,
	brand_link: `https://readdle.me/`,
	right_addon_links: `<div class="links"><a tabindex="0" data-href="dapp:manual">Help Center</a></div>`,
	manual_caption: `Help Center`,
	manual_arr: {
		introduction: {
			title: 'Introduction', html: `
			<p>Welcome to the dApp The Free Speech Project guide under the <a href="%%brand_link%%" target="_blank">%%brand_caption%%</a> brand.</p>
			<p>Here you will find answers to frequently asked questions and help in using this application.</p>
			<p>You are using a Decentralized Application (short: dApp), which aims to allow VIZ blockchain participants to communicate and interact in a distributed social network via the V (Voice) protocol.</p>
			<p>The distributed social network paradigm is different from the usual centralized one. The basis of such a concept is the rejection of intermediaries. To do this, it is necessary to take the familiar and necessary elements of society to a new level. For example, a news feed. If in the modern world the provider of the social network generates the feed for its users, he can also edit it by hiding some posts or adding advertising. In order not to depend on other people’s decisions, you have to take responsibility and play a role yourself.</p>
			<p>You are using experimental Software, where the social networking algorithm is embedded in the code. You have to find the users you are interested in and subscribe to them yourself. Moreover, no one will know about it unless you publicly announce it. There is no list of subscribers, because it’s up to you who to read and when.</p>
			<p>When you send notes, publications, comments, profile updates - the data is written to the blockchain. <b>It will not be possible to delete them.</b> You can remain anonymous if you wish, but if you disclose any information about yourself, that’s your area of responsibility. Be vigilant!</p>
			<p>Now we will continue the adventure and understand the different terms and nuances of dApp.</p>
		`},
		viz: {
			title: 'VIZ', html: `
			<p>Blockchain VIZ is a social platform based on distributed ledger technology (DLT). It is what this application runs on, so you need a VIZ account and a regular private key (account can be registered through the service <a href="%%reg_service_link%%" target="_blank">%%reg_service_domain%%</a>).</p>
			<p>VIZ is fast (the block is generated every 3 seconds), is managed through the DAO (witness selection, committee voting, competition for the reward fund), and provides unique features such as:
			<ul>
			<li>Unified namespace for accounts</li>
			<li>The economics of distributing digital social capital from the treasury based on fair competition (reward fund)</li>
			<li>Ownership of a share of the network bandwidth</li>
			<li>Ability to create new protocols and write data directly to the blockchain</li>
			</ul>
			</p>
			<p>The dApp leverages all of VIZ’s strengths for user interaction - its own V (Voice) protocol, storage and modification of user profile metadata, links to recent activity in the protocol to check and load records to build your news feed. And, of course, rewarding the authors of your favorite posts.</p>
			<p>To reward a user, just click on the crystal icon %%icon_gem%%, and you will see a approximately calculated reward amount (digital social capital symbol Ƶ) in a pop-up notification.</p>
			<p>Learn more about VIZ and its concept at <a href="https://viz.plus/" target="_blank">viz.plus</a> and <a href="https://about.viz.plus/" target="_blank">about.viz.plus</a>.</p>
		`},
		users: {
			title: 'Users', html: `
			<p>By default you are subscribed to the users defined in the application itself (for example, to <a tabindex="0" data-href="viz://@readdle/">@readdle</a> or <a tabindex="0" data-href="viz://@on1x/">@on1x</a>).</p>
			<p>You won’t get bored with spammers, annoying service sellers, and weird personalities. On the other hand, you will have to build your own social network by adding people you know step by step.</p>
			<p>You can expand your list of users in another way - meet their mentions, reposts, or replies from your existing subscriptions, or visit them through an external link.</p>
			<p>Over time, there may be services that provide user-friendly searches by various parameters (since public profiles are quite extensible and accessible in the blockchain).</p>
			<p>To subscribe to a user, just click on his avatar and click on the icon %%icon_subscribe%% in the header of his profile.</p>
			<p>If you do not want to see the user, his posts, which are reposted by your mutual friends - just click on the icon %%icon_ignore%% to add him to the ignore list.</p>
		`},
		settings: {
			title: 'Main menu', html: `
			<p>%%icon_feed%% "Feed" of activities or news shows the last records of the users you are subscribed to. When new posts appear, a button will be shown to notify you of this (if activated, they will appear above it).</p>
			<hr><p>The %%icon_notify%% "Notifications" item allows you to manage recent updates (such as replies to your posts or mentions).</p>
			<hr><p>In the %%icon_users%% "Users" section, you can see all of the members you’ve met. For example, you can find there the profiles of those whose posts have been reposted by users to whom you are subscribed.</p>
			<p>Note that other members of the network do not know who you are subscribed to or who is on the ignore list.</p>
			<hr><p>The  %%icon_gem%% "Rewards" item stores a personal directory of notes that you have awarded. The amount of rewards can be viewed on the PC by hovering your cursor over the crystal icon.</p>
			<hr><p>In the %%icon_settings%% "Settings" section, you can change the parameters related to the frequency of loading user activity, the time of storage in the cache of unknown profiles and their record, the percentage of energy consumed for awards.</p>
			<p>The design theme is separately configurable. It is possible to set a schedule for switching between night and light themes.</p>
			<p>The "Data Transfer" tab allows you to set up synchronization with the cloud and make a separate data backup to transfer to another device.</p>
			<hr><p>%%icon_account_settings%% "Account" allows you to delete data about the used account or change the private key. In a separate tab you can modify the public profile.</p>
		`},
		tags: {
			title: 'Tags', html: `
			<p>%%icon_hashtag%% Hashtags (or just tags) are a good way to further organize disparate content.</p>
			<p>To use them, just add the "#" grating symbol before the keyword in the note.</p>
			<p>It is recommended to replace spaces with the underscore character "_" if you want to make a tag from a phrase.</p>
			<p>The dApp processes all loaded records and checks them for tags. After that, it creates a link between the record and the tag. Then you can click on a tag in any record and get a selection of all posts associated with it.</p>
			<hr><p>Tags can be %%icon_pin%% pinned or %%icon_eye_ignore%% ignored, to do this, go to an existing tag and click the appropriate icon in the header.</p>
			<p>The pinned tags will be displayed in the right-hand menu on the PC version and below the main menu on the mobile version.</p>
			<hr><p>When editing your profile, you can set up interests (overlapping tags) and categories (unique tags) that will be available to other members when they view your profile. Using these, they will be able to make quick selections for your notes and publications.</p>
			<hr><p>In the settings, you can set tags that will mark new objects as NSFW content (containing information for adults). The default tags are: nsfw, porn, sex. Such content is hidden behind a spoiler with a warning and an option to show it when clicked. The spoiler can be disabled to display such content immediately.</p>
		`},
		publish: {
			title: 'Publications', html: `
			<p>Publications come in two varieties — as short notes or as a record with extended markup specifically created for articles.</p>
			<p>Forms for publishing short notes are available both from the feed and by replying or reposting other posts.</p>
			<p>Advanced markup is available through the editor icon %%icon_editor%% (<a tabindex="0" href="dapp:publish">«Post»</a> menu item).</p>
			<p>The editor allows you to design a complete publication with a header, subheadings, links, images and quotes. In the settings you need to specify an annotation, a link to a thumbnail and optionally add tags from your profile.</p>
			<p>You can also specify the beneficiaries in the advanced settings by specifying the accounts that will share the reward you receive and the percentages to distribute it.</p>
			<p>Extended Publications has a separate viewer in the PC version and feels like a popular blogging platform.</p>
		`},
		uri: {
			title: 'VIZ links', html: `
			<p>To work with the protocol in VIZ, it was decided to make its own scheme viz for  <a href="https://ru.wikipedia.org/wiki/URI" target="_blank">URI</a>. The link contains a pointer to the account and the block number where the V (Voice) protocol entry is stored.</p>
			<p>The public profile is available at the link like viz://@login/</p>
			<p>Record at the link viz://@login/[block]/</p>
			<p>Publication at viz://@login/[block]/publication/</p>
			<p>If you want to pin an entry on your profile, you should copy the link in the viz diagram, and paste it into the "Pinned entry" field of your profile settings.</p>
		`},
		storage: {
			title: 'File storage', html: `
			<p>The problem of downloading and storing files on the Internet has always been an issue. In today’s Internet, storage costs are charged to services that make money by selling advertising or user data. But what to do for users who have taken responsibility for the service themselves?</p>
			<p>The answer is simple — store the files yourself. But there are not many solutions. Either create your own file storage (ftp/web), or rent space and bandwidth from hosting providers.</p>
			<p>There are not many technological solutions: IPFS, Filecoin, Storj, SIA. And all of them are controversial.</p>
			<p>IPFS is the closest to a possible solution, but its difficulty lies in the lack of an economic model. This is meant to be solved by other projects that use their own token on top of IPFS for file space leasing deals, but they have many limitations, including the lack of libraries to implement client-side (browser-side) interaction.</p>
			<p>A temporary solution was provided by IPFS and SIA providers, which, for now, allow free downloads.</p>
			<p>They quite often lag, crash and hang for a couple of minutes, but this is the most available at the moment.</p>
			<p>Alternatively, users can always upload files to classic hosting providers and insert a standard link.</p>
		`},
		services: {
			title: 'Microservices', html: `
			<p>Some of the usual services are simply not available on the browser side. Some of the current problems are link previews and synchronization between devices.</p>
			<p>Additional microservices can be developed to solve these problems. For example, ReaddleMe uses passwordless authentication to store and load account actions (such as subscribing to users, ignoring tags, settings).</p>
			<p>A separate microservice creates a preview for links, telling the browser the meta-information about the requested url. For example, this provides a player for audio files.</p>
			<p>In the future, it may be possible to bring the microservices provider into a separate application, adding to this the storage of files and records with the ability to delete them according to GDRP.</p>
		`},
		terms_of_use: {title: '%%terms_of_use_caption%%', html: `<div class="terms-of-use-inherit">%%terms_of_use_html%%</div>`},
	},
	manual_next_link: `<br><p><a tabIndex="0" data-href="dapp:manual/{item}/">Continue &rarr;</a></p>`,
	manual_contents_link: `<hr><p><a tabIndex="0" data-href="dapp:manual">&larr; Back to content</a></p>`,
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
	settings_sync_export_cloud_success: 'Export to cloud completed, you can now sync the app on another device',
	settings_sync_export_cloud_error: 'Error uploading data to the cloud, please try again later or reduce the number of records to export',
	settings_sync_export_file_success: 'Export to file completed, check downloads',
	settings_sync_select_file_error: 'Select file to restore',
	settings_sync_import_backup_error: 'Invalid file format, possibly corrupted',
	settings_sync_import_another_user: 'Importing account data {account}',
	settings_sync_import_settings_success: 'Settings have been imported',
	settings_sync_import_feed_success: 'Feed import completed',
	settings_sync_import_replies_success: 'Answer tree import completed',
	settings_sync_import_hashtags_success: 'Tags import completed',
	settings_sync_import_hashtags_feed_success: 'Tag feed import completed',
	settings_sync_import_awards_success: 'Rewards import completed',
	settings_sync_import_users_success: 'User import completed',
	settings_sync_import_finished: '<strong> Import completed successfully!</strong>',
	settings_sync_import_cloud_started: 'Synchronization started successfully',
	settings_sync_import_cloud_error: 'Connection error',
	settings_activity_period: `Frequency of loading user activity`,
	settings_addon_activity_period: `in minutes after update`,
	users_settings_buttons: `
	<p class="error save-users-settings-error"></p>
	<p class="success save-users-settings-success"></p>
	<p><a class="button save-users-settings-action">Save</a><span class="submit-button-ring"></span></p>
	<hr>
	<p><a class="button neutral-button reset-users-settings-action">Reset</a></p>`,
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

	render_preview_image: `<div class="preview-image"{addon}>{prepand}<img src="{image}" alt="Image"></div>`,
	render_preview_image_addon: `<div class="preview-image-background" style="background-image:url('{image}');"></div>`,
	render_preview_large_image: `<div class="preview-large-image"{addon}><img src="{image}" alt="Image"></div>`,
	render_preview_link: `<div class="preview-link"{addon}>
		<div class="preview-link-title">{title}</div>
		<div class="preview-link-descr">{descr}</div>
		<div class="preview-link-source">{source}</div>
	</div>`,

	render_preview_article_image: `<a tabindex="0" data-href="{link}publication/" class="preview-article-image"{addon}><img src="{image}" alt="Image"></a>`,
	render_article_preview: `<div class="preview-article-link"{addon}>
		<a tabindex="0" data-href="{link}publication/" class="preview-article-link-title">{title}</a>
		<a tabindex="0" data-href="{link}publication/" class="preview-article-link-descr">{descr}</a>
	</div>`,
	render_preview_wrapper: `<a tabindex="0" class="preview-wrapper" href="{link}" target="_blank"{addon}>{context}</a>`,

	render_audio_wrapper: `<div tabindex="0" class="preview-wrapper audio-player" title="Audio">{context}</div>`,
	render_audio_player: `
	<audio class="audio-source">
		<source src="{link}" type="{mime}">
		Your browser does not support the audio element.
	</audio>
	<a class="audio-toggle-action" tabindex="0" title="%%audio_player_play_caption%%">%%icon_player_play%%</a>
	<div class="audio-progress" tabindex="0" role="slider" aria-label="%%audio_player_progress_caption%%" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="00:00"><div class="fill-range"><div class="fill-level"></div></div></div>
	<time title="%%audio_player_duration_caption%%">0 / 0</time>
	`,
	audio_player_play_caption: `Play`,
	audio_player_pause_caption: `Pause`,
	audio_player_progress_caption: `Position slider`,
	audio_player_duration_caption: `Duration`,

	hashtags_addon_caption: '# Tags',
	hashtags_addon_button: '<a tabindex="0" data-href="dapp:hashtags" title="Tags management">{icon}</a>',
	hashtags_pinned_caption: 'Pinned',
	hashtags_popular_caption: 'Popular',
	hashtags_main_tab: 'Everyone',
	hashtags_pinned_tab: 'Pinned',
	hashtags_ignored_tab: 'Ignored',
	hashtags_objects_header: `<div class="hashtag-item nohover"><div class="hashtag-item-num">№</div><div class="hashtag-item-caption">Tag</div><div class="hashtag-item-count">Count</div></div>`,
	hashtags_objects_item: `<div class="hashtag-item" data-hashtag-id="{id}"><div class="hashtag-item-num">{num}</div><div class="hashtag-item-caption"><a data-href="dapp:hashtags/{tag}">#{tag}{addon}</a></div><div class="hashtag-item-count">{count}</div></div>`,

	found_results: 'Found: {count}',

	profile_main_tab: 'Everyone',
	profile_posts_tab: 'Posts',
	profile_shares_tab: 'Reposts',
	profile_replies_tab: 'Replies',

	users_qr_code_link: '<a tabindex="0" data-href="dapp:users/?{select_tab}" title="QR code" class="{addon}">%%icon_qr_code%%</a>',
	users_main_tab: 'Everyone',
	users_subscribed_tab: 'Subscriptions',
	users_ignored_tab: 'Ignored',
	users_qr_code_tab: 'Provide',
	users_scan_qr_code_tab: 'Scan',
	users_scan_retrieving: 'Retrieving video...',
	scan_qr_unable: 'Unable to access video stream (please make sure you have a webcam enabled)',
	scan_qr_error: '<div class="scan-qr-error-icon">{icon}</div><div class="scan-qr-error-text">{text}</div>',
	scan_qr_error_browser: 'Browser not support video capture',
	scan_qr_error_subscribe: 'Error to subscribe <a tabindex="0" data-href="viz://@{account}/">@{account}</a>',
	scan_qr_successfull: '<div class="scan-qr-successfull-icon">{icon}</div><div class="scan-qr-successfull-text">{text}</div>',
	scan_qr_successfull_subscribe: 'Successfully subscribed to <a tabindex="0" data-href="viz://@{account}/">@{account}</a>',

	users_objects_box: `<div class="user-item-box">{context}</div>`,
	users_objects_header: `
	<div class="user-item-box"><input type="text" class="user-item-search" placeholder="Quick Search" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></div>
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
		error: 'Error',
		attention: 'Attention!',
		upload: 'Upload',
		sync: 'Sync',
		sync_import: 'Synchronizing with the cloud&hellip;',
		sync_import_error: 'Invalid data format ',
		sync_import_success: 'Data transfer completed successfully ',
		award_success: 'You awarded @{account}',
		award_info: '≈{amount}Ƶ [{percent}]',
		award_error: 'Error when awarding @{account}',
		new_reply: 'New answer from @{account}',
		new_share: 'Repost from @{account}',
		new_mention: 'Mention from @{account}',
		idb_error: 'Database crash, application restarted',
		upload_incorrect_format: 'Invalid file format',
		upload_percent: 'Uploading: {percent}%',
		beneficiaries_summary_weight: 'Check the total beneficiaries percentage',
		category_is_founded: 'Category already found in the text',
	},
	notifications_all_tab: 'All',
	notifications_new_tab: 'New',
	notifications_readed_tab: 'Read',
	error_title: 'Error',

	awarded_amount: 'Awarded {amount} Ƶ',

	menu_session_empty: '<div class="avatar"><img src="{avatar}" data-href="dapp:account"></div><a tabindex="0" data-href="dapp:account">{caption}</a>',
	menu_session_login: 'Sign in',
	menu_session_error: '<span class="error">Error</span>',
	menu_session_account: '<div class="avatar"><div class="shadow" data-href="viz://@{account}/"></div><img src="{avatar}"></div><div class="account"><a class="account-name" tabindex="0" data-href="viz://@{account}/">{nickname}</a><a class="account-login" tabindex="0" data-href="viz://@{account}/">{account}</a></div>',

	none_notice: '<div class="none-notice"><em>News feed is not working yet, please try searching.<!--<br>Nothing found.--></em></div>',
	whitelabel_notice: `<div class="load-more-end-notice"><em>Loading recent posts @{account}&hellip;</em><span class="submit-button-ring"></span></div>`,
	feed_end_notice: '<div class="load-more-end-notice"><em>End of feed.</em></div>',
	load_more_end_notice: '<div class="load-more-end-notice"><em>Nothing else found.</em></div>',
	error_notice: '<div class="error-notice"><em>{error}</em></div>',
	empty_loader_notice: '<div class="loader-notice"><span class="submit-button-ring"></span></div>',
	loader_notice: '<div class="loader-notice" data-account="{account}" data-block="{block}"><span class="submit-button-ring"></span></div>',
	feed_loader_notice: '<div class="loader-notice" data-feed-time="{time}"><span class="submit-button-ring"></span></div>',
	notifications_loader_notice: '<div class="loader-notice" data-notifications-id="{id}"><span class="submit-button-ring"></span></div>',
	awards_loader_notice: '<div class="loader-notice" data-awards-id="{id}"><span class="submit-button-ring"></span></div>',
	hashtags_loader_notice: '<div class="loader-notice" data-hashtags-id="{tag_id}" data-hashtags-feed-id="{id}"><span class="submit-button-ring"></span></div>',

	toggle_menu: '<a tabindex="0" title="{title}" class="toggle-menu adaptive-show-inline mobile">{icon}</a>',
	toggle_menu_title: 'Toggle menu',
	toggle_menu_icon: '<div><a tabindex="0" title="{title}" class="toggle-menu-icon">{icon}</a></div>',

	toggle_theme_icon: '<div><a tabindex="0" title="{title}" class="toggle-theme-icon toggle-theme-action">{icon}</a></div>',
	toggle_theme_title: 'Customize appearance',

	icon_counter: `<div class="icon-counter counter-{name}">{count}</div>`,

	account_settings: '<a tabindex="0" data-href="dapp:account" title="Account settings">{icon_account_settings}</a>',
	account_settings_caption: 'Account settings',
	account_settings_empty_account: 'Please enter account',
	account_settings_empty_regular_key: 'Enter a regular key',
	account_settings_account_not_found: 'Account not found',
	account_settings_saved: 'Account data saved',
	account_settings_reset: 'Account data has been deleted',
	account_credentials_tab: 'Account',
	account_profile_tab: 'Profile',
	account_qr_tab: 'Export via QR',
	account_scan_qr_tab: 'Import via QR',

	notifications_caption: 'Notifications',
	awards_caption: 'Awards',
	hashtags_caption: 'Tags',
	users_caption: 'Users',
	app_settings_caption: 'Application Settings',
	app_settings_saved: 'Settings saved',
	app_settings_reset: 'Settings reset',
	app_settings_main_tab: 'General',
	app_settings_feed_tab: 'News Feed',
	app_settings_theme_tab: 'Color Theme',
	app_settings_sync_tab: 'Data Transfer',
	app_settings_connection_tab: 'Connection',
	app_settings_languages_tab: 'Languages',

	view_profile: '<a tabindex="0" data-href="viz://@{account}/" title="View profile">{icon_view_profile}</a>',

	invalid_regular_key: 'The provided key is invalid',
	not_found_regular_key: 'The provided key does not match',

	search_caption: 'Search',
	search_empty_input: 'Enter address to search',

	left_addon_publish_button: '<div taborder="0" data-href="dapp:publish" class="publish-button">%%icon_editor_plus%% Publish</div>',
	footer_publish_button: '<div taborder="0" data-href="dapp:publish" class="publish-button">%%icon_editor_plus%%</div>',

	gateway_error: 'Error, please try later',
	account_not_found: 'User not found',
	object_not_found: 'Object not found',
	block_not_found: 'Block not found, please try later',
	object_is_hidden: 'Author decided to hide content',
	data_not_found: 'No data found',
	hashtags_not_found: 'Tag not found',
	users_not_found: 'No users found',
	event_not_found: 'Requested event not found',

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
	menu_primary_pinned_tags_caption: `Pinned tags:`,
	menu_feed: 'Feed',
	menu_hashtags: 'Tags',
	menu_users: 'Users',
	menu_notifications: 'Notifications',
	menu_awards: 'Awards',
	menu_app_settings: 'Settings',
	menu_account_settings: 'Account',
	menu_languages: 'Display language',
	menu_connection: 'Connection',
	menu_manual: 'Help Center',

	footer_link: `<div><a tabindex="0" data-href="{link}" class="{class}">{icon}</a></div>`,

	article_publish_caption: `Publish`,
	article_settings_caption: `Settings`,
	editor_caption: `Extended publication`,

	header_back_action: `<a tabindex="0" class="back-action" title="Back" data-force="{force}">{icon}</a>`,
	header_link: '<div class="link grow"><div class="header-link-wrapper"><input type="text" class="header-link" value="{link}"><div class="header-link-icons">{icons}</div></div></div>',
	header_link_icons: `
		<i tabindex="0" class="icon copy icon-copy-action" title="Copy address">%%icon_copy_svg%%</i>
		<i tabindex="0" class="icon search icon-search-action" title="Go to">%%icon_search_svg%%</i>`,
	header_caption: '<div class="caption grow">{caption}</div>',
	header_caption_link: '<a data-href="{link}" tabindex="0" class="caption grow">{caption}</a>',
	header_icon_link: '<a tabindex="0" class="{action}-action{addon}" title="{caption}">{icon}</a>',
	clear_awards_caption: 'Clear reward history',
	pin_hashtags_caption: 'Pin',
	ignore_hashtags_caption: 'Ignore',
	clear_hashtags_caption: 'Remove tag',
	mark_readed_notifications_caption: 'Mark as read',
	clear_readed_notifications_caption: 'Clear read notifications',

	user_actions_open: '<div class="user-actions" data-user="{user}">',
	user_actions_close: '</div>',
	subscribe_link: '<a tabindex="0" class="subscribe-action" title="Subscribe to this user">{icon}</a>',
	subscribed_link: '<a tabindex="0" class="subscribed-action positive" title="You are subscribed to this user">{icon}</a>',
	unsubscribe_link: '<a tabindex="0" class="unsubscribe-action" title="Unsubscribe from user">{icon}</a>',
	ignore_link: '<a tabindex="0" class="ignore-action" title="Ignore user">{icon}</a>',
	ignored_link: '<a tabindex="0" class="ignored-action negative" title="You are ignoring this user">{icon}</a>',
	unignore_link: '<a tabindex="0" class="unignore-action" title="Stop ignoring this user">{icon}</a>',
	edit_profile_link: '<a tabindex="0" data-href="dapp:account/profile" title="Edit Profile">{icon_edit_profile}</a>',
	edit_profile_saved: 'Profile saved',

	new_object_link: '<a tabindex="0" data-href="dapp:publish" title="Publish">{icon_new_object}</a>',

	publish_caption: 'Publish',
	publish_empty_text: 'Enter publish text',
	publish_success: 'Post published successfully &hellip;',
	publish_success_link: 'Post has been published successfully: <a tabindex="0" data-href="viz://@{account}/{block}/{addon}">link</a>',

	object_type_publication_full: `
		<div class="publication-readline" data-object="{link}"><div class="fill-level"></div></div>
		<div class="object type-text" data-link="{link}" data-events="{events}" data-publication="true">
			<div class="author-view">
				<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
				<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a></div>
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
	more_column: `<div class="more-column"><a tabindex="0" class="more-action" title="Available actions" data-account="{account}" data-block="{block}">%%icon_more%%</a></div>`,
	more_actions: `<a class="edit-more-action">Edit</a><a class="hide-more-action">Hide</a><a class="cancel-more-action">Cancel</a>`,
	confirm_hide_event: `Are you sure that you want to hide this entry?`,
	object_type_text: `
		<div class="object type-text" data-link="{link}" data-events="{events}">
			<div class="author-view">
				<div class="avatar-column"><div class="avatar"><div class="shadow" data-href="viz://{author}/"></div><img src="{avatar}"></div></div>
				<div class="author-column"><a tabindex="0" data-href="viz://{author}/" class="profile-name">{nickname}</a><a tabindex="0" data-href="viz://{author}/" class="profile-link">{author}</a></div>
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
	<a tabindex="0" class="reply-action" title="Comment">{icon_reply}<span class="replies-count"></span></a>
	<a tabindex="0" class="share-action" title="Repost">{icon_repost}</a>
	<a tabindex="0" class="award-action" title="Award">{icon_award}</a>
	<a tabindex="0" class="external-share-action" title="Share">{icon_share}</a>`,
	object_type_text_pinned: `<div class="object type-text-loading pinned-object" data-link="{link}" data-events="{events}">{context}</div>`,
	object_type_text_pinned_caption: `
	<div class="share-view">{icon} Pinned post</div>
	<div class="load-content"><div class="load-placeholder"><span class="loading-ring"></span></div></div>`,
	object_type_text_loading: `<div class="object type-text-loading" data-account="{account}" data-block="{block}" data-link="{link}" data-events="{events}" data-previous="{previous}" data-is-reply="{is_reply}" data-is-share="{is_share}">{context}</div>`,
	object_type_text_wait_loading: `<div class="object type-text-wait-loading" data-link="{link}" data-events="{events}"><div class="load-content"><div class="load-placeholder"><span class="loading-ring"></span></div></div></div>`,
	object_type_text_share: `
	<div class="share-view"><a tabindex="0" data-href="{link}">{caption}</a> shared:{comment}</div>
	<div class="load-content"><div class="load-placeholder"><span class="loading-ring"></span></div></div>`,
	object_type_text_share_link: `
	<div class="object type-text-share-link" data-account="{account}" data-block="{block}" data-link="{link}" data-events="{events}" data-previous="{previous}" data-is-reply="{is_reply}" data-is-share="{is_share}">
		<div class="share-view"><a tabindex="0" data-href="viz://{author}/">{caption}</a> shared:{comment}</div>
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
	object_type_text_reply_nested_count: '<a tabindex="0" class="load-nested-replies-action"><div class="branch-more">&bull;</div>Number of responses: <span class="nested-replies-count">{count}</span></a>',
	object_type_text_reply_branch_line: '<div class="branch-line"></div>',
	object_type_text_reply_internal: '<div class="reply-view">Replying to <a tabindex="0" data-href="{link}">{caption}</a></div>',
	object_type_text_reply_external: '<div class="reply-view">Reply to <a tabindex="0" href="{link}" target="_blank">{caption}</a></div>',

	new_objects: '<a class="new-objects load-new-objects-action" data-items="0">&hellip;</a>',
	feed_new_objects: 'Show latest updates: {items}',
	feed_no_new_objects: 'Nothing new',

	nsfw_warning: '<div tabindex="0" class="nsfw-warning nsfw-reveal-action">This content may contain adult information.<br>Click to show.</div>',

	plural: {
		hours: {
			'1': 'hour',
			'2': 'hours',
			'5': 'hours',
		},
		minutes: {
			'1': 'minute',
			'2': 'minutes',
			'5': 'minutes',
		},
	},
	date: {
		now: `now`,
		full_format: `{time} · {date}`,
		time_format: `{hour}:{min}{times}`,
		times_am: ``,//ante meridiem
		times_pm: ``,//post meridiem
		date_format: `{day}{short_month}{year}`,
		passed_minutes: `{minutes} min`,
		passed_hours: `{hours} h`,
		aria_passed: `{number} {plural} back`,
		year: ` {year} y.`,
		short_month: {
			'1': ` jan.`,
			'2': ` feb.`,
			'3': ` mar.`,
			'4': ` apr.`,
			'5': ` may`,
			'6': ` june`,
			'7': ` july`,
			'8': ` aug.`,
			'9': ` sep.`,
			'10': ` oct.`,
			'11': ` nov.`,
			'12': ` dec.`,
		},
	},

	fast_publish: `
	<div class="fast-publish-wrapper" data-reply="{reply}" data-share="{share}" tabindex="0" title="Fast publication form">
		<div class="avatar" alt=""{avatar_addon}><img src="{avatar}"></div>
		<div class="placeholder">{placeholder}</div>
		<div class="text" data-placeholder="true" contenteditable="true"></div>
		<div class="buttons">
			<div tabindex="0" class="button fast-publish-attach-action" title="Attach file">{attach}</div>
			<div tabindex="0" class="button fast-publish-action" title="Publish">{button}</div>
		</div>
	</div>`,
	fast_publish_avatar_addon:' data-href="viz://@{account}/" tabindex="0" title="Go to profile"',
	fast_publish_feed: `What’s new?`,
	fast_publish_reply: `Post a reply`,
	fast_publish_share: `Add comment`,
	fast_publish_button: `Submit`,

	terms_of_use_wrapper: `
	<div class="terms-of-use-wrapper">
	<div class="terms-of-use-readline"><div class="fill-level"></div></div>
		<div class="content">
			<div class="header space-between"><div class="caption grow">%%terms_of_use_caption%%</div></div>
			<div class="view">
				<div class="languages-short-list"></div>
				%%terms_of_use_html%%
			</div>
		</div>
	</div>`,
	terms_of_use_caption: `Terms of Use`,
	terms_of_use_html: `
	<p class="boldest bigger">Readdle.me Manifesto</p>

	<p>Classic social networks has given everyone a loudspeaker.</p>

	<p class="boldest">And that’s a problem.</p>

	<p>You read everyone who wants to speak out.<br>

	%%svg_bad_face%%
	<span class="big2">Even spammers.</span><br>
	<span class="big">Even abusers.</span><br>
	Even idiots.<br>
	Everywhere.<br>
	<span class="smaller">And everyone.</span></p>

	<p>Readdle.me is <strong>changing the established rules</strong>. It runs on VIZ Blockchain and uses the Voice protocol.<br>
	Voice — <a href="https://github.com/VIZ-Blockchain/Free-Speech-Project/blob/master/README.md" target="_blank">global protocol</a> for the social network of free speech.</p>

	%%svg_hand_like%%
	<p><span class="big2">No Ads.</span><br>
	<span class="big">No Spam.</span><br>
	No Replies<br>
	<span class="smaller">from strangers.</span></p>

	<p>Only Readdles Posts and Replies
	and Shared content.</p>

	<p>You only read those to whom you are subscribed.</p>

	<p>You are the Social Network itself!</p>

	<p>If you have something to say, put yourself in the our shared <strong>history of freedom</strong>.</p>

	<p>What about the hatespeech? No one will hear it. The six handshake theory works as a filter against shitty content.</p>

	%%svg_incognito%%
	<p class="smaller">Just not readdle bad actors.</p>

	<p>By continuing you understand and accept that:</p>
	<ul>
		<li>The Readdle.me code is technology-neutral, like websites or torrents.</li>
		<li>Neither you nor anyone else can see who is reading or ignoring who. Because <strong>IT’S NOT YOUR BUSINESS</strong>. You can only guess by replies or reposts.</li>
		<li>If you are a child under the age of 99, close this window immediately.</li>
		<li>All you see is unmoderated content and it cannot be moderated.</li>
		<li>If you readdle an artist drawing illustrations for children's books, you will see the activity of this artist. If you readdle a porn actress, you will see the activity of that porn actress. It's your own fault for what you see. Don't like someone, don't readdle them. Or add them to the ignore list.</li>
		<li>The content you submit may not be deleted or hidden from the public blockchain.</li>
		<li>Behind the public names may be fraudsters or cybersquatters. Make sure through other public channels that the author of the content is really who you expect.</li>
		<li>Blockchain nodes are not responsible for the content sent by network participants.</li>
		<li>You cannot make content disappear.</li>
		<li>The developers and software are not responsible for user behavior. If you’re offended by someone, talk to a therapist and add the user to your ignore list.</li>
	</ul>
	<a class="button terms-of-use-accept-action">%%terms_of_use_accept%%</a>
	`,
	terms_of_use_accept: `I read and agree with the terms of use`,
};