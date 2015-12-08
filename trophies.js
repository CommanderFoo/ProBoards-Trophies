/**
 * @class Trophies
 * @static
 *
 * Main class.
 */

$.extend(trophies, {

	/**
	 * Holds the latest version of this plugin.
	 * @property {String} VERSION
	 */

	VERSION: "{VER}",

	/**
	 * This is the ProBoards plugin key we are using.
	 * @property {String} KEY
	 */

	KEY: "pixeldepth_trophies",

	/**
	 * This is the min required Yootil version that is needed.
	 * @property {String} required_yootil_version
	 */

	required_yootil_version: "1.1.0",

	/**
	 * This holds a reference to the plugin object returned by ProBoards.
	 * @property {Object} plugin
	 */

	plugin: null,

	/**
	 * Route gets cached here, as it gets wrote over by some AJAX responses.
	 * We shouldn't need it, as Yootil does caching as well.
	 *
	 * @property {String} route
	 */

	route: "",

	/**
	 * @property {Object} params Reference to ProBoards page params.
	 */

	params: null,

	/**
	 * @property {Object} images Reference to the images object from ProBoards for this plugin.
	 */

	images: null,

	/**
	 * @property {Object} user_data_table A lookup table for user data objects on the page, always check here first before making a new Data instance.
	 */

	user_data_table: {},

	/**
	 * @propety {Boolean} showing Used when the notification is showing.
	 */

	showing: false,

	/**
	 * @property {Object} settings Default settings which can be overwritten from setup.
	 * @property {Boolean} settings.notification_disable
	 * @property {Boolean} settings.show_on_profile
	 * @property {Boolean} settings.show_in_mini_profile
	 * @property {Boolean} settings.show_on_members_list
	 */

	settings: {

		notification_disable: false,

		show_stats_on_profile: true,
		show_in_mini_profile: true,
		show_in_members_list: true,
		show_trophies_on_profile: true,
		show_pack_tabs: true,

		show_date: true,
		show_time: false,

		show_details: false,

		stats_animation_speed_profile: 4000,
		stats_animation_speed_page: 1500,

		max_level: 99,
		xp_modifier: 0.10,

		bronze_xp: 5,
		silver_xp: 15,
		gold_xp: 40

	},

	/**
	 * @property {Array} banned_members Members who are banned from earning trophies.
	 */

	banned_members: [],

	/**
	 * @property {Array} banned_groups Groups who are banned from earning trophies.
	 */

	banned_groups: [],

	/**
	 * @property {Object} queue Yootil queue instance.
	 */

	queue: null,

	lookup: {},

	packs: [],

	/**
	 * Starts the magic.
	 * Various this happening here.  We do Yootil checks, setup user lookup table, and other things.
	 */

	init: function(){
		if(!this.check_yootil()){
			return;
		}

		this.queue = new yootil.queue();

		this.setup();
		this.generate_xp_levels();
		this.register_trophy_pack();
		this.setup_user_data_table();

		if(yootil.user.logged_in() && this.allowed_to_earn_trophies()){
			this.show_unseen_trophies();
			this.init_trophy_checks();
			this.bind_events();
		}

		if(yootil.location.profile()){
			this.create_tab();
		} else if(this.settings.show_in_members_list && yootil.location.members()){
			this.show_in_members_list();
			yootil.ajax.after_search(this.show_in_members_list, this);
		} else {
			var location_check = (yootil.location.search_results() || yootil.location.message_thread() || yootil.location.thread() || yootil.location.recent_posts());

			if(this.settings.show_in_mini_profile && location_check){
				this.show_in_mini_profile();
				yootil.ajax.after_search(this.show_in_mini_profile, this);
			}
		}

		$(".trophies-tiptip").tipTip({

			defaultPosition: "right",
			maxWidth: "auto"

		});
	},

	/**
	 * Handles overwriting default values.  These come from the plugin settings.
	 */

	setup: function(){
		this.route = (proboards.data("route") && proboards.data("route").name)? proboards.data("route").name.toLowerCase() : "";
		this.params = (this.route && proboards.data("route").params)? proboards.data("route").params : "";
		this.plugin = proboards.plugin.get("pixeldepth_trophies");

		if(this.plugin && this.plugin.settings){
			this.images = this.plugin.images;

			var settings = this.plugin.settings;

			if(this.images.gold && yootil.user.logged_in()){
				var link = "/user/" + yootil.user.id() + "/trophies";

				yootil.bar.add(link, this.images.gold, "Trophies", "pdtrophies");
			}
			
			this.banned_members = settings.banned_members;
			this.banned_groups = settings.banned_groups;

			this.settings.show_in_mini_profile = (!! ~~ settings.show_in_mini_profile)? true : false;
			this.settings.show_stats_on_profile = (!! ~~ settings.show_stats_on_profile)? true : false;
			this.settings.show_in_members_list = (!! ~~ settings.show_in_members_list)? true : false;
			this.settings.show_details = (!! ~~ settings.show_details)? true : false;
			this.settings.show_date = (!! ~~ settings.show_date)? true : false;
			this.settings.show_time = (!! ~~ settings.show_time)? true : false;
			this.settings.show_trophies_on_profile = (!! ~~ settings.show_trophies_on_profile)? true : false;
			this.settings.show_pack_tabs = (!! ~~ settings.show_pack_tabs)? true : false;

			this.settings.max_level = ((~~ settings.max_level) > 0)? (~~ settings.max_level) : this.settings.max_level;
			this.settings.xp_modifier = (Math.abs(parseFloat(settings.xp_modifier)) > 0)? (Math.abs(parseFloat(settings.xp_modifier))) : this.settings.xp_modifier;

			this.settings.bronze_xp = (~~ settings.bronze_xp)? (~~ settings.bronze_xp) : this.settings.bronze_xp;
			this.settings.silver_xp = (~~ settings.silver_xp)? (~~ settings.silver_xp) : this.settings.silver_xp;
			this.settings.gold_xp = (~~ settings.gold_xp)? (~~ settings.gold_xp) : this.settings.gold_xp;
		}
	},

	register_trophy_pack: function(){
		if(typeof TROPHY_REGISTER != "undefined"){
			for(var p in TROPHY_REGISTER){
				var the_pack = p;

				if(typeof TROPHY_REGISTER[the_pack].trophies != "undefined" && TROPHY_REGISTER[the_pack].trophies.constructor == Array && TROPHY_REGISTER[the_pack].trophies.length && typeof TROPHY_REGISTER[the_pack].name != "undefined"){
					this.packs.push(the_pack);

					TROPHY_REGISTER[the_pack].pack = the_pack;
					TROPHY_REGISTER[the_pack].total_trophies = TROPHY_REGISTER[the_pack].trophies.length;

					if(!TROPHY_REGISTER[the_pack].plugin_id){
						TROPHY_REGISTER[the_pack].plugin_id = TROPHY_REGISTER[the_pack].plugin_key || null;
					}

					if(!TROPHY_REGISTER[the_pack].plugin_key){
						TROPHY_REGISTER[the_pack].plugin_key = TROPHY_REGISTER[the_pack].plugin_id || null;
					}

					if(!TROPHY_REGISTER[the_pack].trophies_key){
						TROPHY_REGISTER[the_pack].trophies_key = "t";
					}

					if(!TROPHY_REGISTER[the_pack].trophies_data_key){
						TROPHY_REGISTER[the_pack].trophies_data_key = false;
					}

					if(!TROPHY_REGISTER[the_pack].description){
						TROPHY_REGISTER[the_pack].description = TROPHY_REGISTER[the_pack].name;
					}

					for(var t in TROPHY_REGISTER[the_pack].trophies){
						var the_trophy = TROPHY_REGISTER[the_pack].trophies[t];

						the_trophy.pack = the_pack;
						the_trophy.pack_name = TROPHY_REGISTER[the_pack].name;

						this.register_trophy(the_trophy);
					}
				}
			}
		}
	},

	register_trophy: function(trophy){
		if(typeof trophy == "undefined" || typeof trophy.id == "undefined"){
			return;
		}

		if(!this.lookup[trophy.pack]){
			this.lookup[trophy.pack] = {};
		}

		if(!this.lookup[trophy.pack][trophy.id]){
			this.lookup[trophy.pack][trophy.id] = trophy;
		}
	},

	/**
	 * Binds a submit handler to the posting and messaging forms for moving local data to the key.
	 */

	bind_events: function(){
		var posting = (yootil.location.thread() || yootil.location.editing() || yootil.location.posting());
		var messaging = (yootil.location.conversation_new() || yootil.location.messaging());

		if(posting || messaging){
			var the_form;

			if(posting){
				the_form = yootil.form.any_posting();
			} else{
				the_form = yootil.form.any_messaging();
			}

			if(the_form.length == 1){
				the_form.bind("submit", $.proxy(function(){
					this.data(yootil.user.id()).sync_to_keys();
				}, this));
			}
		}
	},

	/**
	 * Gets current version of the plugin.
	 *
	 * @return {String}
	 */

	version: function(){
		return this.VERSION;
	},

	/**
	 * Checks to see if the user is allowed to earn trophies.
	 *
	 * @returns {Boolean}
	 */

	allowed_to_earn_trophies: function(){
		if(!yootil.user.logged_in()){
			return false;	
		}
		
		if(this.settings.banned_members && this.settings.banned_members.length){
			if($.inArrayLoose(yootil.user.id(), this.settings.banned_members) > -1){
				return false;
			}
		}

		if(this.settings.banned_groups && this.settings.banned_groups.length){
			var user_groups = yootil.user.group_ids();

			for(var g = 0, l = user_groups.length; g < l; g ++){
				if($.inArrayLoose(user_groups[g], this.settings.banned_groups) > -1){
					return false;
				}
			}
		}

		return true;
	},

	/**
	 * This sets up the lookup table for all users on the current page.  Each entry is an instance of Data.  Always
	 * look here before creating your own instance, as multiple instances would not be good.
	 *
	 *  It is recommended that if you do create an instance of Data to update the lookup table (key being user id).
	 */

	setup_user_data_table: function(){
		this.user_data_table = {};

		for(var pack in this.packs){
			var pack_data = proboards.plugin.keys.data[this.packs[pack]];
			var local_data = yootil.storage.get(this.packs[pack], true) || {};

			for(var user in pack_data){
				this.data(user).add.pack_data(this.packs[pack], this.utils.check_data(pack_data[user]));
			}

			this.data(yootil.user.id()).add.pack_local_data(this.packs[pack], local_data);
		}
	},

	/**
	 * Refreshes the user data lookup table.
	 */

	refresh_user_data_table: function(){
		this.setup_user_data_table();
	},

	/**
	 * This is used to get the instance of the users Data class from the lookup table.  Please see the Data
	 * class to see methods available.
	 *
	 * @param {Number} user_id The user id of the users data you want.
	 * @return {Object}
	 */

	data: function(user_id){
		var user_data = this.user_data_table[((user_id)? user_id : yootil.user.id())];

		if(!user_data){
			user_data = new this.Data(user_id);

			// Create pack objects

			for(var pack in this.packs){
				user_data.pack.create(this.packs[pack]);
				user_data.pack.create(this.packs[pack], true);
			}

			this.user_data_table[user_id] = user_data;
		}

		return user_data;
	},

	/**
	 * Each trophy has it's own method to be called.  Here we call those methods.
	 */

	init_trophy_checks: function(){
		for(var pack in this.lookup){
			for(var id in this.lookup[pack]){
				var trophy = this.lookup[pack][id];
	
				if(!trophy.disabled && typeof trophy.callback != "undefined" && !this.data(yootil.user.id()).trophy.earned(trophy)){
					trophy.callback.call(this, trophy);
				}
			}
		}
	},

	/**
	 * Yootil is needed, so we check for it, and also check that we are using the needed version.
	 *
	 * @return {Boolean}
	 */

	check_yootil: function(){
		if(proboards.data && proboards.data("user") && proboards.data("user").id == 1){
			var body = "";
			var title = "";

			if(typeof yootil == "undefined"){
				title = "<div class=\"title-bar\"><h2>Trophies - Yootil Not Found</h2></div>";
				body = "<p>You do not have the <a href='http://support.proboards.com/thread/429360/'>Yootil</a> plugin installed.</p>";
				body += "<p>Without the <a href='http://support.proboards.com/thread/429360/'>Yootil</a> plugin, the Trophies plugin will not work.</p>";
			} else {
				var versions = yootil.convert_versions(yootil.version(), this.required_yootil_version);

				if(versions[0] < versions[1]){
					title = "<div class=\"title-bar\"><h2>Trophies - Yootil Needs Updating</h2></div>";
					body += "<p>The Trophies plugin requires at least " + yootil.html_encode(this.required_yootil_version) + " of the <a href='http://support.proboards.com/thread/429360/'>Yootil</a> plugin.</p>";
				}
			}

			if(title.length){
				var msg = "<div class='trophiy-notification-content'>";

				msg += body;
				msg += "</div>";

				var notification = "<div class=\"container trophy-yootil-notification\">";

				notification += title;
				notification += "<div class=\"content pad-all\">" + msg + "</div></div>";

				$("div#content").prepend(notification);

				return false;
			}
		}

		return true;
	}

});