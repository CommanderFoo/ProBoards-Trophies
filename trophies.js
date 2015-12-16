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
	 * @property {Object} settings Default settings which can be overwritten from setup.
	 * @property {Boolean} settings.notification_disable
	 * @property {Number} settings.notification_position Position of the notification when it shows.
	 * @property {Number} settings.notification_theme
	 * @property {Number} settings.notification_duration How long the notification shows for.
	 * @property {Boolean} settings.notification_custom_enabled
	 * @property {String} settings.notification_custom_tpl Custom template created by the user.
	 *
	 * @property {Boolean} settings.show_stats_on_profile
	 * @property {Boolean} settings.show_in_members_list
	 * @property {Boolean} settings.show_trophies_on_profile
	 *
	 * @property {Boolean} settings.show_pack_tabs
	 *
	 * @property {Boolean} settings.show_mini_profile_total_trophies
	 * @property {Boolean} settings.show_mini_profile_total_cups
	 * @property {Boolean} settings.show_mini_profile_current_level
	 *
	 * @property {Boolean} settings.show_date
	 * @property {Boolean} settings.show_time
	 *
	 * @property {Boolean} settings.show_details
	 *
	 * @property {Number} settings.stats_animation_speed_profile
	 * @property {Number} settings.stats_animation_speed_page
	 *
	 * @property {Number} settings.max_level
	 * @property {Number} settings.xp_modifier
	 *
	 * @property {Number} settings.bronze_xp
	 * @property {Number} settings.silver_xp
	 * @property {Number} settings.gold_xp
	 */

	settings: {

		notification_disable: false,
		notification_position: 1,
		notification_theme: 2,
		notification_duration: 3000,
		notification_custom_enabled: false,
		notification_custom_tpl: "",

		show_stats_on_profile: true,
		show_in_members_list: true,
		show_trophies_on_profile: true,

		show_pack_tabs: true,

		show_mini_profile_total_trophies: true,
		show_mini_profile_total_cups: true,
		show_mini_profile_current_level: true,

		show_date: true,
		show_time: false,

		show_details: false,

		stats_animation_speed_profile: 4000,
		stats_animation_speed_page: 1500,

		max_level: 99,
		xp_modifier: 25,

		bronze_xp: 5,
		silver_xp: 15,
		gold_xp: 40

	},

	/**
	 * @property {Object} events
	 */

	events: {},

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

	/**
	 * @property {Object} lookup Pack lookup table.
	 */

	lookup: {},

	/**
	 * @property {Array} packs The packs installed.
	 */

	packs: [],

	/**
	 * @property {Array} inits An array of functions to call for the registered packs.
	 */

	inits: [],

	/**
	 * @property {Boolean} submit_fired Used when submitting a form to tell if it has been submitted or not.
	 */

	submit_fired: false,

	intervals: {},

	sync: {},

	/**
	 * In here we do a few things like setup, generate XP levels, and also the ready event is called here.
	 */

	init: function(){
		if(typeof yootil == "undefined"){
			return;
		}

		this.queue = new yootil.queue();

		this.setup();
		this.generate_xp_levels();

		$($.proxy(this.ready, this));

		return this;
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
	 * Handles registering packs, setting up the data tale, and a few other things once
	 * the DOM is ready.
	 */

	ready: function(){
		this.register_trophy_packs();
		this.setup_user_data_table();

		if(yootil.user.logged_in() && this.allowed_to_earn_trophies()){
			this.show_unseen_trophies();
			this.call_pack_inits();
			this.init_trophy_checks();
			this.bind_events();
			//this.sync.init();
		}

		if(yootil.location.profile()){
			this.create_tab();
		} else if(this.settings.show_in_members_list && yootil.location.members()){
			this.show_in_members_list(true);
			yootil.ajax.after_search(this.show_in_members_list, this);
		} else {
			var location_check = (yootil.location.search_results() || yootil.location.message_thread() || yootil.location.thread() || yootil.location.recent_posts());

			if((this.settings.show_mini_profile_total_trophies || this.settings.show_mini_profile_total_cups || this.settings.show_mini_profile_current_level) && location_check){
				this.show_in_mini_profile(true);
				yootil.ajax.after_search(this.show_in_mini_profile, this);
			}
		}

		// Tip Tip is a jQuery plugin that ProBoards uses.

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

			this.settings.notification_disable = (!! ~~ settings.disable_notification)? true : false;
			this.settings.notification_position = (~~ settings.notification_position) || 1;
			this.settings.notification_theme = (~~ settings.notification_theme) || 2;
			this.settings.notification_duration = (parseFloat(settings.notification_duration) * 1000) || 3000;

			this.settings.notification_custom_enabled = (!! ~~ settings.custom_notificaiton)? true : false;
			this.settings.notification_custom_tpl = (settings.notification_template)? settings.notification_template : "";

			this.settings.show_stats_on_profile = (!! ~~ settings.show_stats_on_profile)? true : false;
			this.settings.show_in_members_list = (!! ~~ settings.show_in_members_list)? true : false;
			this.settings.show_details = (!! ~~ settings.show_details)? true : false;
			this.settings.show_date = (!! ~~ settings.show_date)? true : false;
			this.settings.show_time = (!! ~~ settings.show_time)? true : false;
			this.settings.show_trophies_on_profile = (!! ~~ settings.show_trophies_on_profile)? true : false;
			this.settings.show_pack_tabs = (!! ~~ settings.show_pack_tabs)? true : false;

			this.settings.max_level = ((~~ settings.max_level) > 0)? (~~ settings.max_level) : this.settings.max_level;

			this.settings.xp_modifier = (Math.abs(~~ settings.xp_modifier) > 0)? Math.abs(~~ settings.xp_modifier) : this.settings.xp_modifier;

			this.settings.bronze_xp = (~~ settings.bronze_xp)? (~~ settings.bronze_xp) : this.settings.bronze_xp;
			this.settings.silver_xp = (~~ settings.silver_xp)? (~~ settings.silver_xp) : this.settings.silver_xp;
			this.settings.gold_xp = (~~ settings.gold_xp)? (~~ settings.gold_xp) : this.settings.gold_xp;

			this.settings.show_mini_profile_total_trophies = (!! ~~ settings.show_total_trophies)? true : false;
			this.settings.show_mini_profile_total_cups = (!! ~~ settings.show_trophy_cups)? true : false;
			this.settings.show_mini_profile_current_level = (!! ~~ settings.show_trophy_level)? true : false;
		}
	},

	/**
	 * This looks for packs that have been registered, and adds them to the packs and lookup properties.
	 */

	register_trophy_packs: function(){
		if(typeof TROPHY_REGISTER != "undefined"){
			for(var p in TROPHY_REGISTER){
				var the_pack = yootil.html_encode(p);

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

					// Make sure values are safe

					TROPHY_REGISTER[the_pack].name = yootil.html_encode(TROPHY_REGISTER[the_pack].name);
					TROPHY_REGISTER[the_pack].description = yootil.html_encode(TROPHY_REGISTER[the_pack].description);

					// Do we have an init?

					if(typeof TROPHY_REGISTER[the_pack].init != "undefined"){
						this.inits.push({

							pack: {

								plugin_id: TROPHY_REGISTER[the_pack].plugin_id,
								plugin_key: TROPHY_REGISTER[the_pack].plugin_key,
								trophies_key: TROPHY_REGISTER[the_pack].trophies_key,
								trophies_data_key: TROPHY_REGISTER[the_pack].trophies_data_key,
								name: TROPHY_REGISTER[the_pack].name,
								description: TROPHY_REGISTER[the_pack].description

							},

							func: TROPHY_REGISTER[the_pack].init

						});
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

	/**
	 * Packs need to register trophies to the lookup table.  This is done automatically.
	 *
	 * @param {Object} trophy The trophy to be registered.
	 */

	register_trophy: function(trophy){
		if(typeof trophy == "undefined" || typeof trophy.id == "undefined" || !(~~ trophy.id)){
			return;
		}

		if(!this.lookup[trophy.pack]){
			this.lookup[trophy.pack] = {};
		}

		trophy.id = ~~ trophy.id;
		trophy.title = yootil.html_encode(trophy.title);
		trophy.description = yootil.html_encode(trophy.description);

		if(!this.lookup[trophy.pack][trophy.id]){
			this.lookup[trophy.pack][trophy.id] = trophy;
		}
	},

	/**
	 * Binds a submit handler to the posting and messaging forms for moving local data to the key.
	 *
	 * If a submit should fail (i.e no message), then the sync will not happen again.
	 */

	bind_events: function(){
		var hook;
		var the_form;

		if(yootil.location.posting()){
			the_form = yootil.form.post();
			hook = (yootil.location.posting_thread())? "thread_new" : "post_new";
		} else if(yootil.location.editing()){
			the_form = yootil.form.edit_post();
			hook = "post_edit";
		} else if(yootil.location.thread() || yootil.location.message_thread()){
			the_form = yootil.form.quick_reply();
			hook = "post_quick_reply";
		} else if(yootil.location.messaging()){
			the_form = yootil.form.conversation();
			hook = (yootil.location.posting_thread())? "conversation_new" : "message_new";
		}

		if(the_form && the_form.length){
			the_form.on("submit", $.proxy(function(){
				if(!this.submit_fired){
					this.data(yootil.user.id()).sync_to_keys(hook);
					this.submit_fired = true;
				}
			}, this));

		}
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
	 * Calls any "init" functions registered by packs.
	 */

	call_pack_inits: function(){
		for(var k in this.inits){
			var methods = (TROPHY_REGISTER[this.inits[k].pack.plugin_id].methods)? TROPHY_REGISTER[this.inits[k].pack.plugin_id].methods : null;

			this.inits[k].func(this.inits[k].pack, this.events, methods);
		}
	},

	/**
	 * Each trophy has it's own method to be called.  Here we call those methods.
	 */

	init_trophy_checks: function(){
		var self = this;

		for(var pack in this.lookup){
			for(var trophy_id in this.lookup[pack]){
				var trophy = this.lookup[pack][trophy_id];
	
				if(!trophy.disabled && typeof trophy.callback != "undefined" && !this.data(yootil.user.id()).trophy.earned(trophy)){
					if(trophy.interval){
						if(!this.intervals[pack]){
							this.intervals[pack] = {};
						}

						this.intervals[pack][trophy_id] = setInterval(function(t){

							if(t){
								t.callback.call(self, t);
							}
						}, trophy.interval, trophy);
					}

					trophy.callback.call(this, trophy);
				}
			}
		}
	}

});