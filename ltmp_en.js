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
				<p><a class="button neutral-button remove-account-action">Remove</a></p>
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
	<div class="add-categories"></div>
	<div class="add-interests"></div>
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
	beneficiaries_item: `<div class="beneficiaries-item"><input type="text" name="account" class="round" placeholder="Login"><input type="text" name="weight" class="round" placeholder="Percent of reward"></div>`,
	beneficiaries_add_item: `<a tabindex="0" class="beneficiaries-add-item-action" title="Add benificary">%%icon_editor_plus%%</a>`,

	preset_view_publish: `
	<div class="object type-text">
		<div class="object-column">
			<div class="content-view hidden" data-type="article">
				<div class="article-settings">%%article_settings%%</div>
				<div class="article-editor">
					<div class="editor-formatter">%%editor_formatter%%</div>
					<div class="editor-text article" contenteditable="true">%%editor_text_preset%%</div>
					<div class="editor-placeholders article">
						<h1>Title</h1>
						<p>Just start writing&hellip;</p>
					</div>
				</div>
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
						<p>Redistributable object:</p>
						<p><input type="text" name="share" value=""></p>
						<div class="input-addon">(optional field, contains the address to the object)</div>
					</div>
					<div class="loop-addon">
						<p>Block number to create a loop:</p>
						<p><input type="text" name="loop" value=""></p>
						<div class="input-addon">(you can hide recent entries or vice versa: re-establish link)</div>
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
	data_not_found: 'No data found',
	hashtags_not_found: 'Tag not found',
	users_not_found: 'No users found',

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
	icon_scroll_top: `<i class="icon scroll"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 10.828l-4.95 4.95-1.414-1.414L12 8l6.364 6.364-1.414 1.414z"/></svg></i>`,
	icon_back: `<i class="icon back"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></i>`,
	icon_gem: `<i class="icon gem"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 6.3499998 6.3500002" height="24" width="24" fill="none" stroke="currentColor" stroke-width="0.4" stroke-linecap="round" stroke-linejoin="round"><path d="m 1.019418,1.20416 1.108597,0.36953 m 4.0648556,0.86224 -0.8622424,-1.23177 m -5.17345221,1.23177 3.07943611,3.07944 2.9562585,-3.07944 -1.6013069,0.49271 -1.3549516,2.58673 -1.4781293,-2.58673 -1.60130681,-0.49271 0.86224211,-1.23177 1.2317745,-0.36953 h 1.8476616 l 1.231774,0.36953 -1.1085967,0.36953 H 2.128015 l -0.3695322,1.35495 h 2.8330809 l -0.3695322,-1.35495"/></svg></i>`,
	icon_reply: `<i class="icon reply"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M14 22.5L11.2 19H6a1 1 0 0 1-1-1V7.103a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1h-5.2L14 22.5zm1.839-5.5H21V8.103H7V17H12.161L14 19.298 15.839 17zM2 2h17v2H3v11H1V3a1 1 0 0 1 1-1z"/></svg></i>`,
	icon_repost: `<i class="icon repost"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="m 20.487643,6.3415721 c 0,-0.5215181 -0.430486,-0.846961 -0.943073,-0.9430709 H 7.4732575 V 7.2846439 H 18.601499 v 4.7153571 h -2.829215 l 3.743051,4.715356 3.801521,-4.715356 H 20.487643 Z M 3.5123579,17.658428 c 0,0.521519 0.4215528,0.943071 0.9430714,0.943071 H 16.526743 V 16.715357 H 5.3985001 V 12 H 8.2277138 L 4.4554293,7.2846451 0.68314374,12 H 3.5123579 Z"></path></svg></i>`,
	icon_share: `<i class="icon share"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M3,12c0,1.654,1.346,3,3,3c0.794,0,1.512-0.315,2.049-0.82l5.991,3.424C14.022,17.734,14,17.864,14,18c0,1.654,1.346,3,3,3 s3-1.346,3-3s-1.346-3-3-3c-0.794,0-1.512,0.315-2.049,0.82L8.96,12.397C8.978,12.266,9,12.136,9,12s-0.022-0.266-0.04-0.397 l5.991-3.423C15.488,8.685,16.206,9,17,9c1.654,0,3-1.346,3-3s-1.346-3-3-3s-3,1.346-3,3c0,0.136,0.022,0.266,0.04,0.397 L8.049,9.82C7.512,9.315,6.794,9,6,9C4.346,9,3,10.346,3,12z"/></svg></i>`,

	icon_users: `<i class="icon users"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M2 22a8 8 0 1 1 16 0h-2a6 6 0 1 0-12 0H2zm8-9c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm8.284 3.703A8.002 8.002 0 0 1 23 22h-2a6.001 6.001 0 0 0-3.537-5.473l.82-1.824zm-.688-11.29A5.5 5.5 0 0 1 21 8.5a5.499 5.499 0 0 1-5 5.478v-2.013a3.5 3.5 0 0 0 1.041-6.609l.555-1.943z"/></svg></i>`,
	icon_link: `<i class="icon link"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8.465,11.293c1.133-1.133,3.109-1.133,4.242,0L13.414,12l1.414-1.414l-0.707-0.707c-0.943-0.944-2.199-1.465-3.535-1.465 S7.994,8.935,7.051,9.879L4.929,12c-1.948,1.949-1.948,5.122,0,7.071c0.975,0.975,2.255,1.462,3.535,1.462 c1.281,0,2.562-0.487,3.536-1.462l0.707-0.707l-1.414-1.414l-0.707,0.707c-1.17,1.167-3.073,1.169-4.243,0 c-1.169-1.17-1.169-3.073,0-4.243L8.465,11.293z"/><path d="M12,4.929l-0.707,0.707l1.414,1.414l0.707-0.707c1.169-1.167,3.072-1.169,4.243,0c1.169,1.17,1.169,3.073,0,4.243 l-2.122,2.121c-1.133,1.133-3.109,1.133-4.242,0L10.586,12l-1.414,1.414l0.707,0.707c0.943,0.944,2.199,1.465,3.535,1.465 s2.592-0.521,3.535-1.465L19.071,12c1.948-1.949,1.948-5.122,0-7.071C17.121,2.979,13.948,2.98,12,4.929z"/></svg></i>`,
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
	icon_translate: `<i class="icon translate"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M18.5 10l4.4 11h-2.155l-1.201-3h-4.09l-1.199 3h-2.154L16.5 10h2zM10 2v2h6v2h-1.968a18.222 18.222 0 0 1-3.62 6.301 14.864 14.864 0 0 0 2.336 1.707l-.751 1.878A17.015 17.015 0 0 1 9 13.725a16.676 16.676 0 0 1-6.201 3.548l-.536-1.929a14.7 14.7 0 0 0 5.327-3.042A18.078 18.078 0 0 1 4.767 8h2.24A16.032 16.032 0 0 0 9 10.877a16.165 16.165 0 0 0 2.91-4.876L2 6V4h6V2h2zm7.5 10.885L16.253 16h2.492L17.5 12.885z"/></svg></i>`,
	icon_connection: `<i class="icon connection"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M11 14v-3h2v3h5a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1h5zM2.51 8.837C3.835 4.864 7.584 2 12 2s8.166 2.864 9.49 6.837l-1.898.632a8.003 8.003 0 0 0-15.184 0l-1.897-.632zm3.796 1.265a6.003 6.003 0 0 1 11.388 0l-1.898.633a4.002 4.002 0 0 0-7.592 0l-1.898-.633zM7 16v4h10v-4H7z"/></svg></i>`,
	icon_qr_code: `<i class="icon qr-code"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M16 17v-1h-3v-3h3v2h2v2h-1v2h-2v2h-2v-3h2v-1h1zm5 4h-4v-2h2v-2h2v4zM3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zM6 6h2v2H6V6zm0 10h2v2H6v-2zM16 6h2v2h-2V6z"/></svg></i>`,

	svg_bad_face: `<i class="bad-face"><svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 15.229166 15.229168"
	height="50.0" width="50" fill="currentColor" stroke="currentColor"stroke-width="0.25"><path d="M 6.6146005,-3.0541736e-7 C 2.9627046,-3.0541736e-7 -9.9998713e-7,2.9626897 0,6.6145797 9.9998763e-7,10.26646 2.9627066,13.22917 6.6146005,13.22917 10.266494,13.22917 13.228998,10.26646 13.229,6.6145797 13.229,2.9626897 10.266496,-3.0541737e-7 6.6146005,-3.0541736e-7 Z m 0,0.20713999541736 c 3.5400575,0 6.4074605,2.86740001 6.4074595,6.40744001 -10e-7,3.5400503 -2.867403,6.4076503 -6.4074595,6.4076503 -3.5400553,0 -6.4084681,-2.8676 -6.4084691,-6.4076503 -1e-6,-3.54004 2.8684128,-6.40744001 6.4084691,-6.40744001 z m 3.9102355,3.43309001 -0.04365,0.0439 c -0.394648,0.39476 -0.7894973,0.7893 -1.1842464,1.18404 -0.394563,-0.39455 -0.789246,-0.78875 -1.183842,-1.18323 l -0.04385,-0.0437 -0.1748078,0.17441 0.044059,0.0438 c 0.394574,0.39446 0.788274,0.78946 1.1828321,1.18404 -0.3945891,0.3946 -0.7892341,0.78955 -1.1838421,1.18404 l -0.043849,0.0437 0.1756157,0.17562 0.04385,-0.0439 c 0.39463,-0.39452 0.789265,-0.78926 1.183842,-1.18384 0.3947621,0.39475 0.7895765,0.78906 1.1842465,1.18384 l 0.04365,0.0439 0.175616,-0.17562 -0.04385,-0.0437 c -0.394689,-0.3948 -0.7892897,-0.78929 -1.1840437,-1.18404 0.394738,-0.39473 0.7893737,-0.78925 1.1840437,-1.18404 l 0.04385,-0.0438 z m -5.4667309,0.54827 -0.043849,0.0436 c -0.394686,0.3948 -0.789462,0.78967 -1.184246,1.18445 C 3.435411,5.0219597 3.040798,4.6274297 2.646168,4.2329097 l -0.043849,-0.0438 -0.1750097,0.17521 0.043649,0.0438 c 0.394611,0.39449 0.789048,0.78923 1.1836401,1.18384 -0.3946181,0.39462 -0.7892021,0.78932 -1.1838421,1.18384 l -0.043849,0.0437 0.1754137,0.17542 0.043849,-0.0437 c 0.394661,-0.39454 0.789233,-0.78922 1.1838421,-1.18383 0.394798,0.39478 0.78954,0.78942 1.184246,1.18424 l 0.043849,0.0438 0.1754138,-0.17541 -0.043849,-0.0439 c -0.394726,-0.39484 -0.789456,-0.78946 -1.1842461,-1.18424 0.3947731,-0.39477 0.7895381,-0.78962 1.1842461,-1.18444 l 0.043849,-0.0436 z m 0,0.17521 2.02e-4,2.1e-4 c -0.394703,0.3948 -0.78947,0.78946 -1.184246,1.18424 l -0.043849,0.0438 0.043849,0.0437 c 0.394795,0.39479 0.789528,0.78963 1.184246,1.18445 l -2.02e-4,2e-4 c -0.394731,-0.39483 -0.789459,-0.78945 -1.184246,-1.18424 l -0.043849,-0.0439 -0.04385,0.0439 c -0.394617,0.39461 -0.789202,0.7893 -1.1838421,1.18384 l -2.019e-4,-4.1e-4 c 0.394651,-0.39455 0.789229,-0.78924 1.183842,-1.18384 l 0.043849,-0.0437 -0.043849,-0.0438 c -0.394582,-0.39458 -0.789013,-0.7893 -1.1836401,-1.18384 0.3946311,0.39451 0.7892551,0.78905 1.1838421,1.18364 l 0.04385,0.0439 0.043849,-0.0439 c 0.394766,-0.39477 0.789531,-0.78943 1.184246,-1.18425 z m 3.729971,3.90962 c -1.0475778,-0.0126 -2.5996342,0.18582 -3.6325632,0.50563 -1.1017971,0.34113 -1.6003138,0.82883 -2.0746538,1.2970103 a 0.10348033,0.10348005 0 1 0 0.1453022,0.14732 c 0.47434,-0.4681803 0.9242253,-0.9171903 1.9903818,-1.2472903 1.0661616,-0.3301 2.7616942,-0.53343 3.7655395,-0.49108 1.0038473,0.0423 1.3117494,0.30933 1.6627954,0.59879 a 0.10348033,0.10348005 0 1 0 0.131358,-0.15965 c -0.351047,-0.28946 -0.744853,-0.60136 -1.7856655,-0.64527 -0.065049,-0.003 -0.1326553,-0.005 -0.2024944,-0.005 z" /></svg></i>`,
	svg_hand_like: `<i class="hand-like"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.229166 13.229168"
	height="50.0" width="50" fill="currentColor" stroke="none"><path d="m 9.2115084,0.60541439 a 0.14112847,0.14112847 0 0 0 -0.014332,0.001103 0.14112847,0.14112847 0 0 0 -0.1168602,0.0832354 C 8.8588334,1.1845935 8.7504658,1.4149506 8.5952357,1.5562826 8.4400057,1.6976149 8.2027045,1.782863 7.6906707,1.9542693 a 0.14112847,0.14112847 0 0 0 0.00661,0.2706529 c 0.5126616,0.144759 0.7588272,0.2207528 0.9166932,0.3522347 0.157866,0.1314819 0.2661417,0.3478844 0.4746071,0.8207784 a 0.14112847,0.14112847 0 0 0 0.2585261,0 C 9.5597817,2.9102245 9.6593673,2.6855962 9.8013222,2.5336099 9.9432772,2.3816234 10.157094,2.2707966 10.62651,2.0375047 A 0.14112847,0.14112847 0 0 0 10.589027,1.7729152 C 10.09342,1.6798404 9.8747752,1.6309549 9.7473022,1.521004 9.6198291,1.4110533 9.5296158,1.1882431 9.3432519,0.69581577 A 0.14112847,0.14112847 0 0 0 9.2115084,0.60541439 Z M 5.2801506,0.84519857 A 0.11333149,0.13091542 77.335011 0 0 5.1798272,0.89315594 C 4.8882946,1.2263486 4.7530837,1.3706348 4.6082036,1.4272953 4.4633245,1.4839558 4.2428641,1.4751812 3.7615174,1.4460371 a 0.11333149,0.13091542 77.335011 0 0 -0.1361531,0.077172 0.11333149,0.13091542 77.335011 0 0 0.017088,0.1141042 c 0.3056411,0.330011 0.4455681,0.4879791 0.4927976,0.6498977 0.04723,0.1619182 0.013204,0.3647092 -0.070557,0.7992805 a 0.11333149,0.13091542 77.335011 0 0 0.2226963,0.087094 C 4.6283507,2.8452954 4.7969491,2.6896989 4.9725654,2.6179477 5.148181,2.5461967 5.3717115,2.5394477 5.8468128,2.5457369 A 0.11333149,0.13091542 77.335011 0 0 5.9592635,2.3555632 C 5.6555741,2.0344428 5.5160089,1.8851174 5.4543385,1.7293683 5.3926679,1.5736191 5.3958845,1.3790049 5.4107915,0.95489294 A 0.11333149,0.13091542 77.335011 0 0 5.2801506,0.84519857 Z M 9.2032399,1.0375771 C 9.3153254,1.3236948 9.4089336,1.601902 9.5637431,1.7354317 9.7065057,1.8585703 9.9772882,1.8953201 10.230729,1.9498595 9.9843272,2.0779499 9.7282526,2.1970834 9.5951631,2.3395776 9.4514629,2.4934325 9.3412154,2.7643127 9.2115084,3.056174 9.0781418,2.7707536 8.9633116,2.5004299 8.7953313,2.3605243 8.6418543,2.2326978 8.359371,2.1615896 8.093067,2.079398 8.356724,1.9837782 8.6364685,1.8997508 8.7848581,1.7646469 8.9479748,1.6161339 9.0651657,1.3357772 9.2032399,1.0375771 Z M 5.1677,1.2167262 C 5.16446,1.441248 5.149569,1.6698893 5.207388,1.815911 5.269817,1.9735748 5.4417897,2.1456155 5.6224626,2.3395776 5.3324232,2.3413276 5.0624167,2.3348976 4.8755489,2.4112366 4.704815,2.4809932 4.5242086,2.6647567 4.3414094,2.8329267 4.3785602,2.606672 4.4323096,2.3725395 4.3871612,2.2177562 4.3375319,2.0476113 4.1608803,1.8665814 3.9787014,1.6643234 4.2600366,1.6784609 4.5265147,1.703368 4.7024637,1.6345571 4.8647206,1.5711002 5.0129754,1.3847683 5.1677,1.2167262 Z M 5.1252556,3.4067549 C 5.0221405,3.3919503 4.9185959,3.4058693 4.82649,3.4613267 4.7352321,3.5162747 4.6847569,3.5975312 4.6528533,3.6823691 4.6209504,3.7672073 4.6055258,3.8599586 4.5927693,3.9657002 4.5672552,4.1771841 4.559122,4.4397321 4.5277243,4.7423804 4.4649318,5.3476656 4.310089,6.0888154 4.2058072,6.6363998 4.1015172,7.1840251 4.0626958,7.4718646 3.7229317,7.8645356 3.383194,8.2571753 2.7164747,8.760736 2.0890919,9.1985072 1.4617178,9.6362721 0.87623456,10.011824 0.28712755,10.388609 a 0.1704411,0.15004007 0 0 0 0.19899332,0.243643 C 1.0752279,10.255467 1.666647,9.8752487 2.3007634,9.4327793 2.4477717,9.3302004 2.5971143,9.2242478 2.744502,9.1169256 L 4.3750344,10.98614 c -0.6072696,0.518488 -1.252872,1.080644 -1.9006342,1.644313 a 0.17026077,0.14988133 0 1 0 0.2386817,0.212222 C 4.0378238,11.689913 5.363561,10.539342 6.3274836,9.7844625 7.2914376,9.0295592 7.8932829,8.6707419 8.5114491,8.3022106 a 0.17026077,0.14988133 0 0 0 0.00551,-0.00331 C 8.7402198,8.3006617 8.9854472,8.2430351 9.212611,8.1368423 9.5467786,7.9806276 9.7989802,7.7336543 9.8966852,7.4902518 9.9943662,7.2469045 9.8901022,7.0399073 9.8134492,6.893272 a 0.17026077,0.14988133 0 0 0 -0.01929,-0.028664 c 0.05818,-0.1422223 0.05681,-0.2810351 0.01213,-0.3941278 C 9.7566857,6.344923 9.6702839,6.2504306 9.5973682,6.1662023 c 6.88e-4,-0.00255 0.00209,-0.00517 0.00275,-0.00771 C 9.687696,5.8218615 9.5067321,5.5499146 9.3570326,5.3255795 9.3531062,5.2835539 9.3467973,5.2421095 9.3333299,5.2026556 9.2699755,5.0170742 9.1175082,4.8726038 8.9364457,4.7666346 8.5742839,4.5546734 8.0579456,4.483107 7.503253,4.6492229 6.9987198,4.8003172 6.4849345,5.1315721 5.972493,5.4727575 5.9606199,5.3015864 5.9569448,5.1139599 5.9548537,4.9127099 5.9518954,4.6280368 5.9427904,4.3357793 5.8545301,4.0831115 5.7662659,3.8304327 5.6046078,3.639444 5.4223674,3.5230643 5.3312476,3.464874 5.2283704,3.4215598 5.1252556,3.4067549 Z M 2.210362,3.4310093 c -0.018439,-5.176e-4 -0.037955,0.00414 -0.055674,0.015434 -0.2649488,0.1693649 -0.3851145,0.241084 -0.493349,0.2502575 -0.1082343,0.00917 -0.2527342,-0.04231 -0.5655599,-0.1615099 -0.037871,-0.014165 -0.081642,-0.00411 -0.10693834,0.024805 -0.020778,0.023114 -0.025788,0.054686 -0.013229,0.082133 0.13161664,0.2901624 0.19039274,0.427815 0.18686634,0.5490232 -0.00353,0.121209 -0.069813,0.2538393 -0.21883764,0.5357935 -0.040184,0.073092 0.051097,0.1480444 0.12898744,0.105836 C 1.3692895,4.6769733 1.5151501,4.6045774 1.647007,4.5913439 1.7788646,4.5781063 1.9722778,4.6699726 2.2858802,4.7721467 2.3603555,4.7964503 2.4313329,4.7296426 2.4010869,4.6641059 2.2688541,4.3804675 2.1648177,4.1986362 2.1574442,4.078702 2.1500732,3.9587653 2.1941232,3.8257782 2.2952511,3.5368448 2.3142979,3.4810033 2.2656801,3.4325614 2.210362,3.4310093 Z M 2.077516,3.6669346 C 2.0270583,3.8208505 1.9173612,4.0379174 1.9242746,4.1503616 1.9317416,4.2717713 2.0595572,4.3632613 2.1375999,4.5340162 1.9449481,4.4754869 1.7988881,4.3396865 1.6585828,4.3537647 1.5303912,4.366629 1.3391337,4.5313992 1.1817706,4.6095344 1.2550768,4.4614073 1.4038519,4.286073 1.4072228,4.1702057 1.4109242,4.0428387 1.2700509,3.9071021 1.1927952,3.7303257 1.3762574,3.7979966 1.5161131,3.9454207 1.6475582,3.9342802 1.7687745,3.92404 1.9387918,3.7507669 2.077516,3.6669346 Z m 2.94025,0.039688 c 0.00932,-0.00561 0.088713,-0.013159 0.2034034,0.060084 0.1146889,0.073242 0.239475,0.2111965 0.3070337,0.4046011 0.067562,0.1934164 0.081991,0.4646648 0.08489,0.7436067 0.00289,0.2789419 -0.00435,0.5666334 0.040791,0.814715 0.090285,0.4961823 0.3975395,0.759912 0.5749305,0.9773272 C 6.4061821,6.9243427 6.4993551,7.1302915 6.4856868,7.3645715 6.4720256,7.5987392 6.3368458,7.8943032 6.193536,8.200233 A 0.1718302,0.15126291 0 0 0 6.5110426,8.3159913 C 6.6543527,8.0100614 6.8063482,7.6938607 6.8246914,7.379455 6.8430278,7.065162 6.7114158,6.785107 6.5055304,6.5327688 6.3236154,6.3098092 6.1192407,6.1348365 6.0226546,5.8145188 a 0.1704143,0.15001649 0 0 0 0.00275,-0.00165 c 0.5628808,-0.3755674 1.122631,-0.7407533 1.5886431,-0.8803114 0.4660163,-0.1395596 0.8652631,-0.07255 1.1333247,0.084338 0.1340494,0.078454 0.225676,0.173907 0.2590772,0.2717555 0.033401,0.097847 0.023405,0.2052595 -0.090402,0.3516835 C 8.8022663,5.7867276 8.5697626,5.9686063 8.3124556,6.1099769 8.0551482,6.2513475 7.7682901,6.3543345 7.5760152,6.3729128 7.1913976,6.4100758 7.1027465,6.1950488 7.1493648,6.0873766 7.172691,6.0335016 7.2626567,5.9567442 7.4178128,5.8839735 7.5729683,5.8112022 7.7799125,5.7432744 7.9910899,5.6739555 A 0.17031631,0.14993023 0 1 0 7.8725758,5.3928295 C 7.6613982,5.4621477 7.4456667,5.5315687 7.2596103,5.6188329 7.0735535,5.7060969 6.9038443,5.8109057 6.8302036,5.9809896 c -0.1148025,0.265154 0.08599,0.5664038 0.4453921,0.6620249 -0.00781,0.089135 -0.014057,0.1851112 0.00938,0.285536 0.028006,0.1200844 0.1247962,0.2537282 0.2888433,0.3070339 0.014848,0.00482 0.030944,0.0071 0.046303,0.011024 -0.00422,0.04427 -0.00602,0.091077 0.0011,0.1416656 0.013181,0.093569 0.066398,0.1981161 0.1664709,0.2772677 0.0247,0.019537 0.058666,0.032787 0.088196,0.049611 0.01149,0.087329 0.023678,0.1845765 0.06725,0.2838822 0.029533,0.067314 0.08178,0.135841 0.1543438,0.1896228 C 7.5469479,8.5189154 6.9624319,8.8847715 6.1014802,9.5590103 5.9772274,9.6563169 5.8328061,9.7757042 5.6979816,9.8847861 L 4.0806786,7.9384003 C 4.3848503,7.5416168 4.4477227,7.1853534 4.5426076,6.6871127 4.6461461,6.1434338 4.801679,5.3958889 4.8667295,4.7688393 c 0.032525,-0.3135191 0.039787,-0.5789792 0.06284,-0.7700656 0.01153,-0.095544 0.029357,-0.1715782 0.047956,-0.2210423 0.018602,-0.049465 0.034732,-0.067793 0.040241,-0.071109 z m 5.913022,0.3235711 a 0.14112847,0.14112847 0 0 0 -0.136704,0.1830079 c 0.150565,0.4812676 0.210297,0.697393 0.173086,0.8615691 -0.03721,0.1641764 -0.191315,0.3483759 -0.53855,0.7441579 a 0.14112847,0.14112847 0 0 0 -0.01102,0.1708807 0.14112847,0.14112847 0 0 0 0.128436,0.063943 c 0.540893,-0.036837 0.795637,-0.049181 0.993312,0.021498 0.197676,0.070679 0.384346,0.2397424 0.776129,0.611312 a 0.14112847,0.14112847 0 0 0 0.23592,-0.1328466 C 12.438455,6.0331184 12.389834,5.7802652 12.431783,5.5791445 12.473733,5.3780235 12.613788,5.1804741 12.9334,4.7743516 A 0.14112847,0.14112847 0 0 0 12.81213,4.5461433 c -0.53046,0.041269 -0.775929,0.058922 -0.976777,0.00496 -0.200846,-0.053954 -0.398781,-0.1906705 -0.825188,-0.4955532 a 0.14112847,0.14112847 0 0 0 -0.07937,-0.025356 z m 0.187969,0.4161773 c 0.228799,0.1573905 0.454428,0.3275567 0.642732,0.3781425 0.203318,0.054619 0.493922,0.024196 0.81251,0.00165 -0.189361,0.2517811 -0.373747,0.4805407 -0.418382,0.6945471 -0.04078,0.1955294 0.02853,0.478164 0.08103,0.7518751 C 12.028413,6.0847144 11.823117,5.8776731 11.634151,5.8101087 11.426433,5.7358392 11.123847,5.7633118 10.795733,5.7814445 10.995705,5.5481249 11.197588,5.3353406 11.242779,5.1359564 11.284455,4.9520878 11.189615,4.69574 11.118753,4.4463703 Z M 9.2285965,5.7610497 c 0.048086,0.1079098 0.070197,0.213462 0.039688,0.3307367 -0.05642,0.2168922 -0.326899,0.5328552 -0.6636783,0.703367 -0.1683789,0.08525 -0.3611124,0.1418194 -0.5308323,0.1664708 -0.1697197,0.024652 -0.3195084,0.01314 -0.3820008,-0.00717 -0.056956,-0.018507 -0.059435,-0.028852 -0.072762,-0.085992 -0.010655,-0.045688 -0.00857,-0.1183003 -0.00331,-0.1967882 0.2806,-0.027389 0.5884928,-0.1499786 0.8753501,-0.3075852 0.2872854,-0.1578419 0.5484018,-0.3497971 0.7066742,-0.5534331 0.012737,-0.016389 0.019646,-0.033045 0.030869,-0.04961 z m 0.2072617,0.7265185 c 0.019467,0.028423 0.038389,0.05707 0.048508,0.082683 0.025996,0.065805 0.032189,0.1217044 -0.020395,0.2226964 C 9.3588388,6.9948665 8.9414404,7.3512495 8.6343728,7.4682022 8.3272727,7.5851677 8.0933052,7.5069178 8.01369,7.4439489 7.973855,7.4124419 7.966465,7.3911999 7.960772,7.3507919 7.957982,7.3309379 7.963382,7.2950709 7.965182,7.2670039 8.019537,7.2635539 8.0717093,7.2638139 8.1294479,7.2554279 8.3384135,7.2250745 8.5666736,7.1599528 8.7754874,7.0542304 9.0561674,6.9121215 9.284521,6.7081779 9.4358582,6.4875682 Z m 0.1427682,0.6973033 c 0.021276,0.064869 0.027449,0.1281661 -0.00386,0.2061593 -0.055681,0.1387226 -0.26309,0.3618004 -0.5209105,0.4823244 -0.2576917,0.120464 -0.6039353,0.1402779 -0.7061232,0.1041827 -0.051058,-0.018036 -0.066231,-0.035533 -0.087645,-0.084338 -0.00671,-0.015286 -0.00916,-0.046868 -0.014332,-0.06725 0.1570851,0.011199 0.3342165,-0.0095 0.5220131,-0.08103 0.2995605,-0.1140933 0.601838,-0.3287176 0.8108576,-0.5600484 z m 2.3217726,0.8643256 c -0.04028,0.00107 -0.08148,0.015001 -0.119065,0.044649 C 11.131504,8.6102578 10.940881,9.11282 10.63974,9.210634 10.3386,9.3084483 9.8648472,9.0222209 9.0748039,8.9625817 8.8715636,8.9488892 8.768065,9.2238985 8.9215627,9.3699391 9.4963616,9.9156681 9.9887502,10.211881 10.070873,10.4746 c 0.08212,0.262718 -0.2155558,0.610907 -0.3489274,1.466818 -0.01547,0.103437 0.034523,0.205496 0.1218216,0.249155 0.0701,0.03629 0.152517,0.0279 0.2155298,-0.02149 0.66676,-0.519206 0.88917,-0.95094 1.199472,-1.022527 0.3103,-0.07159 0.779868,0.199355 1.578165,0.382552 0.207807,0.05134 0.348178,-0.224829 0.198443,-0.39027 -0.55754,-0.633481 -1.042375,-0.911652 -1.147657,-1.2303447 -0.105282,-0.318694 0.140771,-0.7525549 0.230414,-1.5991124 0.01605,-0.1508163 -0.09689,-0.2633914 -0.217735,-0.2601796 z M 3.9307446,8.1715697 5.4807975,10.036374 4.541505,10.769508 2.9572758,8.9565183 C 3.2143532,8.7632719 3.4616499,8.5678764 3.6700138,8.3766264 Z m 7.8549984,0.3522347 c -0.04427,0.51724 -0.358833,1.113924 -0.246951,1.4530368 0.102339,0.3098318 0.83417,0.8604598 1.118442,1.1994728 -0.416604,-0.08387 -1.171843,-0.454843 -1.468471,-0.386411 -0.326066,0.07522 -0.758596,0.739944 -1.166398,1.048987 0.07834,-0.47523 0.447385,-1.120602 0.344517,-1.49879 C 10.27491,10.045871 9.5806215,9.5988057 9.2919879,9.3098554 9.7109934,9.3331413 10.460487,9.6694566 10.74282,9.577752 11.047663,9.4787355 11.393688,8.8308075 11.785743,8.5238044 Z M 4.2515593,8.8109941 a 0.08467709,0.08467709 0 0 0 -0.00827,5.512e-4 0.08467709,0.08467709 0 0 0 -0.045753,0.018742 l -0.579338,0.460275 A 0.08467709,0.08467709 0 1 0 3.7245852,9.4217546 L 4.1765923,9.0634565 4.2030512,9.4834921 3.8976707,9.6736657 a 0.07128562,0.07128562 0 1 0 0.074967,0.1212704 L 4.2129734,9.6438996 4.241086,10.092599 a 0.08467709,0.08467709 0 0 0 0.1356022,0.06229 L 4.9747704,9.7133541 A 0.08467709,0.08467709 0 1 0 4.8744468,9.5783034 L 4.3998394,9.927782 4.3755855,9.5419222 4.6473408,9.371593 A 0.07056424,0.07056424 0 0 0 4.6037942,9.2404006 0.07056424,0.07056424 0 0 0 4.5723737,9.2530793 L 4.3656635,9.3820662 4.3347945,8.890371 a 0.08467709,0.08467709 0 0 0 -0.083235,-0.079377 z" /></svg></i>`,
	svg_incognito: `<i class="incognito"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13.229166 13.229168"
	height="50.0" width="50" fill="currentColor" stroke="none"><path transform="scale(0.26458331)" d="M 25.652344 0.74609375 C 16.669037 0.74609379 9.359375 7.8607448 9.359375 16.638672 C 9.359375 21.183184 11.328748 25.271394 14.464844 28.167969 L 13.443359 30.796875 A 0.51234638 0.51234638 0 0 0 13.619141 31.402344 L 14.34375 31.919922 L 6.2011719 42.830078 L 5.0722656 42.445312 A 0.51234638 0.51234638 0 0 0 4.4589844 42.667969 L 2.953125 45.207031 A 0.51234638 0.51234638 0 0 0 3.1074219 45.900391 L 8.3789062 49.384766 A 0.51234638 0.51234638 0 0 0 9.0800781 49.259766 L 10.835938 46.875 A 0.51234638 0.51234638 0 0 0 10.798828 46.21875 L 10.060547 45.427734 L 17.509766 33.572266 L 18.322266 34.126953 A 0.51234638 0.51234638 0 0 0 18.978516 34.060547 L 21.097656 31.890625 C 22.544766 32.302025 24.070643 32.53125 25.652344 32.53125 C 34.63565 32.53125 41.943359 25.416599 41.943359 16.638672 C 41.943359 7.8607448 34.63565 0.74609375 25.652344 0.74609375 z M 25.652344 1.75 C 34.107964 1.75 40.939453 8.4159922 40.939453 16.638672 C 40.939453 24.861351 34.107964 31.527344 25.652344 31.527344 C 23.54653 31.527344 21.540785 31.113253 19.716797 30.365234 C 18.281639 29.671413 16.910331 28.907979 15.796875 28.015625 C 12.47546 25.284314 10.363281 21.204545 10.363281 16.638672 C 10.363281 8.4159922 17.196723 1.75 25.652344 1.75 z M 25.623047 2.671875 C 18.057482 2.671875 11.914062 8.8152945 11.914062 16.380859 C 11.914062 23.946424 18.057482 30.095703 25.623047 30.095703 C 33.188611 30.095703 39.330078 23.946424 39.330078 16.380859 C 39.330078 8.8152945 33.188611 2.671875 25.623047 2.671875 z M 25.623047 3.6757812 C 32.64732 3.6757812 38.333984 9.3565856 38.333984 16.380859 C 38.333984 23.405133 32.64732 29.091797 25.623047 29.091797 C 18.598773 29.091797 12.917969 23.405133 12.917969 16.380859 C 12.917969 9.3565856 18.598773 3.6757812 25.623047 3.6757812 z M 26.394531 6.4570312 C 24.5178 6.3564773 22.429307 7.5338682 22.390625 8.9296875 C 22.380722 9.2870849 22.793264 10.172434 23.71875 9.4726562 C 23.642231 7.561626 27.007807 6.7306407 27.714844 8.7207031 C 27.662681 11.819764 23.073549 11.620272 24.349609 14.804688 C 24.742342 15.01912 25.644867 15.111661 25.748047 14.644531 C 25.49507 11.462864 29.491884 12.419627 29.328125 9.5097656 C 29.185196 7.3879012 27.85421 6.5352395 26.394531 6.4570312 z M 19.074219 6.9648438 C 18.795775 6.9493082 18.508157 6.9931301 18.232422 7.1152344 C 15.636267 8.2674287 14.098433 10.809499 14.025391 14.912109 A 0.50005002 0.50005002 0 0 0 14.962891 15.169922 C 15.979748 13.373896 16.565756 12.80303 17.214844 12.474609 C 17.863932 12.146189 18.745381 12.039608 20.205078 11.375 A 0.50005002 0.50005002 0 0 0 20.255859 11.345703 C 20.864205 10.984006 21.220187 10.440579 21.318359 9.8769531 C 21.416532 9.3133276 21.276638 8.7546713 21.009766 8.2832031 C 20.742893 7.8117354 20.349009 7.4138159 19.865234 7.1757812 C 19.623347 7.0567639 19.352663 6.9803793 19.074219 6.9648438 z M 19.023438 7.9609375 C 19.152494 7.9693725 19.284467 8.0085618 19.421875 8.0761719 C 19.696692 8.211392 19.966085 8.4724436 20.138672 8.7773438 C 20.31126 9.082242 20.38795 9.4196378 20.337891 9.7070312 C 20.288886 9.9883842 20.131559 10.243018 19.753906 10.474609 C 18.431436 11.069406 17.611668 11.150005 16.757812 11.582031 C 16.324473 11.801289 15.847785 12.645089 15.419922 13.132812 C 15.855526 10.588339 16.836032 8.8312759 18.638672 8.03125 C 18.76752 7.9741924 18.894381 7.9525025 19.023438 7.9609375 z M 25.732422 15.921875 C 25.08386 15.862965 24.291378 16.247328 24.417969 16.748047 C 24.570334 17.828222 26.473135 17.855549 26.515625 16.578125 C 26.460659 16.153266 26.12156 15.957221 25.732422 15.921875 z M 19.160156 18.320312 C 17.92163 18.290568 16.540294 18.696634 14.978516 19.568359 C 14.978516 19.568361 15.311253 21.955115 18.294922 23.943359 C 21.278584 25.931603 24.757812 23.601562 24.757812 23.601562 C 24.75781 23.601562 27.671557 26.330209 32.091797 24.285156 C 36.512036 22.240106 36.195313 19.566406 36.195312 19.566406 C 32.258822 18.224488 28.660568 17.296993 24.875 20.935547 C 23.405478 18.610287 21.224367 18.369869 19.160156 18.320312 z M 18.488281 20.457031 C 18.646511 20.457396 18.854177 20.503652 19.117188 20.605469 C 20.397048 21.100943 22.164068 20.592208 23.140625 22.253906 C 23.140625 22.253906 22.699102 23.439418 20.578125 22.902344 C 19.131975 22.53615 17.890869 20.624551 18.488281 20.457031 z M 31.185547 20.746094 C 32.333396 20.868554 30.184183 23.172681 28.646484 23.371094 C 26.391239 23.662092 26.4375 22.408203 26.4375 22.408203 C 27.627977 20.87759 28.288656 21.561624 29.667969 21.216797 C 29.951415 21.145934 31.021569 20.728602 31.185547 20.746094 z M 15.283203 28.892578 C 16.626999 29.976069 18.158619 30.839407 19.8125 31.460938 C 19.874705 31.490154 19.935715 31.521858 19.998047 31.550781 L 18.542969 33.033203 L 17.658203 32.427734 A 0.51234638 0.51234638 0 0 0 16.933594 32.576172 L 8.984375 45.220703 A 0.51234638 0.51234638 0 0 0 9.0429688 45.841797 L 9.7597656 46.609375 L 8.5410156 48.263672 L 4.0820312 45.310547 L 5.1308594 43.544922 L 6.2226562 43.921875 A 0.51234638 0.51234638 0 0 0 6.7988281 43.744141 L 15.480469 32.119141 A 0.51234638 0.51234638 0 0 0 15.369141 31.394531 L 14.542969 30.796875 L 15.283203 28.892578 z" /></svg></i>`,

	icon_player_play: `<i class="icon player-play"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M7 6L7 18 17 12z"></path></svg></i>`,
	icon_player_pause: `<i class="icon player-pause"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 7H11V17H8zM13 7H16V17H13z"></path></svg></i>`,

	article_publish_caption: `Publish`,
	article_settings_caption: `Settings`,
	editor_caption: `Extended publication`,
	editor_attach_caption: `Add file`,
	editor_attach_image_caption: `Add Image`,
	editor_image_caption: `Insert image`,
	editor_link_caption: `Insert Link`,
	editor_link_prompt: `Enter URL for the link`,
	editor_image_prompt: `Enter image url`,
	editor_link_placeholder_prompt: `https://`,

	editor_error_empty_title: `Type the title of the publication`,
	editor_error_empty_markdown: `Type the publication text`,

	editor_bold_caption: `Bold`,
	editor_italic_caption: `Italic`,
	editor_strikethrough_caption: `Strikethrough`,
	editor_header2_caption: `Section`,
	editor_header3_caption: `Subsection`,
	editor_code_caption: `Code`,
	editor_quote_caption: `Quote`,
	editor_separator_caption: `Separator`,
	editor_ul_caption: `Unordered list`,
	editor_ol_caption: `Ordered list`,
	editor_reset_caption: `Clear and reset editor`,

	editor_text_preset: `<h1><br></h1><p><br></p>`,
	editor_formatter_separator: `<span class="separator"></span>`,
	editor_formatter: `
	<a class="editor-attach-action" tabindex="0" title="%%editor_attach_caption%%">%%icon_attach%%</a>
	<a class="editor-attach-image-action" tabindex="0" title="%%editor_attach_image_caption%%">%%icon_editor_attach_image%%</a>
	<a class="editor-image-action" tabindex="0" title="%%editor_image_caption%%">%%icon_editor_image%%</a>
	<a class="editor-link-action" tabindex="0" title="%%editor_link_caption%%">%%icon_link%%</a>
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
	<a class="editor-ul-action" tabindex="0" title="%%editor_ul_caption%%">%%icon_editor_ul%%</a>
	<a class="editor-ol-action" tabindex="0" title="%%editor_ol_caption%%">%%icon_editor_ol%%</a>
	%%editor_formatter_separator%%
	<a class="editor-separator-action" tabindex="0" title="%%editor_separator_caption%%">%%icon_editor_separator%%</a>
	%%editor_formatter_separator%%
	<a class="editor-reset-action" tabindex="0" title="%%editor_reset_caption%%">%%icon_editor_reset%%</a>
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
	icon_editor_ul: `<i class="icon editor-ul"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M8 4h13v2H8V4zM4.5 6.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm0 6.9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM8 11h13v2H8v-2zm0 7h13v2H8v-2z"/></svg></i>`,
	icon_editor_ol: `<i class="icon editor-ol"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor" stroke="none"><path d="M8 4h13v2H8V4zM5 3v3h1v1H3V6h1V4H3V3h2zM3 14v-2.5h2V11H3v-1h3v2.5H4v.5h2v1H3zm2 5.5H3v-1h2V18H3v-1h3v4H3v-1h2v-.5zM8 11h13v2H8v-2zm0 7h13v2H8v-2z"/></svg></i>`,
	icon_editor_reset: `<i class="icon editor-reset"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19.89 10.105a8.696 8.696 0 0 0-.789-1.456l-1.658 1.119a6.606 6.606 0 0 1 .987 2.345 6.659 6.659 0 0 1 0 2.648 6.495 6.495 0 0 1-.384 1.231 6.404 6.404 0 0 1-.603 1.112 6.654 6.654 0 0 1-1.776 1.775 6.606 6.606 0 0 1-2.343.987 6.734 6.734 0 0 1-2.646 0 6.55 6.55 0 0 1-3.317-1.788 6.605 6.605 0 0 1-1.408-2.088 6.613 6.613 0 0 1-.382-1.23 6.627 6.627 0 0 1 .382-3.877A6.551 6.551 0 0 1 7.36 8.797 6.628 6.628 0 0 1 9.446 7.39c.395-.167.81-.296 1.23-.382.107-.022.216-.032.324-.049V10l5-4-5-4v2.938a8.805 8.805 0 0 0-.725.111 8.512 8.512 0 0 0-3.063 1.29A8.566 8.566 0 0 0 4.11 16.77a8.535 8.535 0 0 0 1.835 2.724 8.614 8.614 0 0 0 2.721 1.833 8.55 8.55 0 0 0 5.061.499 8.576 8.576 0 0 0 6.162-5.056c.22-.52.389-1.061.5-1.608a8.643 8.643 0 0 0 0-3.45 8.684 8.684 0 0 0-.499-1.607z"></path></svg></i>`,

	header_back_action: `<a tabindex="0" class="back-action" title="Back" data-force="{force}">{icon}</a>`,
	header_link: '<div class="link grow"><div class="header-link-wrapper"><input type="text" class="header-link" value="{link}"><div class="header-link-icons">{icons}</div></div></div>',
	header_link_icons: `
		<i tabindex="0" class="icon copy icon-copy-action" title="Copy address"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20,2H10C8.897,2,8,2.897,8,4v4H4c-1.103,0-2,0.897-2,2v10c0,1.103,0.897,2,2,2h10c1.103,0,2-0.897,2-2v-4h4 c1.103,0,2-0.897,2-2V4C22,2.897,21.103,2,20,2z M4,20V10h10l0.002,10H4z M20,14h-4v-4c0-1.103-0.897-2-2-2h-4V4h10V14z"/></svg></i>
		<i tabindex="0" class="icon search icon-search-action" title="Go to"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.023,16.977c-0.513-0.488-1.004-0.997-1.367-1.384c-0.372-0.378-0.596-0.653-0.596-0.653l-2.8-1.337 C15.34,12.37,16,10.763,16,9c0-3.859-3.14-7-7-7S2,5.141,2,9s3.14,7,7,7c1.763,0,3.37-0.66,4.603-1.739l1.337,2.8 c0,0,0.275,0.224,0.653,0.596c0.387,0.363,0.896,0.854,1.384,1.367c0.494,0.506,0.988,1.012,1.358,1.392 c0.362,0.388,0.604,0.646,0.604,0.646l2.121-2.121c0,0-0.258-0.242-0.646-0.604C20.035,17.965,19.529,17.471,19.023,16.977z M9,14 c-2.757,0-5-2.243-5-5s2.243-5,5-5s5,2.243,5,5S11.757,14,9,14z"/></svg></i>`,
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
	signin_image: 'data:image/png;base64,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',
	profile_default_avatar: 'data:image/png;base64,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',//default.png
	new_object_link: '<a tabindex="0" data-href="dapp:publish" title="Publish">{icon_new_object}</a>',

	publish_caption: 'Publish',
	publish_empty_text: 'Enter publish text',
	publish_success: 'Post published successfully &hellip;',
	publish_success_link: 'Post has been published successfully: <a tabindex="0" data-href="viz://@{account}/{block}/">link</a>',

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
	<a tabindex="0" class="reply-action" title="Comment">{icon_reply}<span class="replies-count"></span></a>
	<a tabindex="0" class="share-action" title="Repost">{icon_repost}</a>
	<a tabindex="0" class="award-action" title="Award">{icon_award}</a>
	<a tabindex="0" class="external-share-action" title="Share">{icon_share}</a>`,
	object_type_text_pinned: `<div class="object type-text-loading pinned-object" data-link="{link}">{context}</div>`,
	object_type_text_pinned_caption: `
	<div class="share-view">{icon} Pinned post</div>
	<div class="load-content"><div class="load-placeholder"><span class="loading-ring"></span></div></div>`,
	object_type_text_loading: `<div class="object type-text-loading" data-account="{account}" data-block="{block}" data-link="{link}" data-previous="{previous}" data-is-reply="{is_reply}" data-is-share="{is_share}">{context}</div>`,
	object_type_text_wait_loading: `<div class="object type-text-wait-loading" data-link="{link}"><div class="load-content"><div class="load-placeholder"><span class="loading-ring"></span></div></div></div>`,
	object_type_text_share: `
	<div class="share-view"><a tabindex="0" data-href="{link}">{caption}</a> shared:{comment}</div>
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
	object_type_text_reply_nested_count: '<a tabindex="0" class="load-nested-replies-action"><div class="branch-more">&bull;</div>Number of responses: <span class="nested-replies-count">{count}</span></a>',
	object_type_text_reply_branch_line: '<div class="branch-line"></div>',
	object_type_text_reply_internal: '<div class="reply-view">Replying to <a tabindex="0" data-href="{link}">{caption}</a></div>',
	object_type_text_reply_external: '<div class="reply-view">Reply to <a tabindex="0" href="{link}" target="_blank">{caption}</a></div>',

	new_objects: '<a class="new-objects load-new-objects-action" data-items="0">&hellip;</a>',
	feed_new_objects: 'Show new updates: {items}',
	feed_no_new_objects: 'There are no new updates',

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
			<div class="view">%%terms_of_use_html%%</div>
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