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

	required_yootil_version: "1.0.0",

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

		show_on_profile: true,
		show_in_mini_profile: true,
		show_on_members_list: false,

		show_id: false

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
	 * @property {Array} months An array of months used throughout the plugin and it's modules.
	 */

	months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],

	/**
	 * @property {Array} days An array of days used throughout the plugin and it's modules.
	 */

	days: ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"],

	/**
	 * @property {Object} queue Yootil queue instance.
	 */

	queue: null,

	list: {},

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
		this.register_trophy_pack();
		this.setup_user_data_table();

		if(yootil.user.logged_in() && this.allowed_to_earn_trophies()){
			//this.show_unseen_trophies();
			this.init_trophy_checks();
			this.bind_events();
		}

		if(yootil.location.profile()){
			//this.create_tab();
		}
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
			this.settings.show_on_profile = (!! ~~ settings.show_on_profile)? true : false;
			this.settings.show_on_members_list = (!! ~~ settings.show_on_members_list)? true : false;
			this.settings.show_id = (!! ~~ settings.show_id)? true : false;
		}
	},

	register_trophy_pack: function(){
		if(typeof TROPHY_REGISTER != "undefined"){
			for(var p in TROPHY_REGISTER){
				var the_pack = p;

				if(typeof TROPHY_REGISTER[the_pack].trophies != "undefined" && TROPHY_REGISTER[the_pack].trophies.constructor == Array && TROPHY_REGISTER[the_pack].trophies.length){
					this.packs.push(the_pack);

					for(var t in TROPHY_REGISTER[the_pack].trophies){
						var the_trophy = TROPHY_REGISTER[the_pack].trophies[t];
						the_trophy.pack = the_pack;
						this.register_trophy(the_trophy);
					}
				}
			}
		}
	},

	register_trophy: function(trophy){
		if(typeof trophy == "undefined" || typeof trophy.id == "undefined" || this.list[trophy.id]){
			return;
		}

		this.list[trophy.id] = trophy;
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
					//this.data(yootil.user.id()).clear.synced();
					//this.data(yootil.user.id()).save_to_keys(this.KEY, this.packs);
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
		for(var pack in this.packs){
			var pack_data = proboards.plugin.keys.data[this.packs[pack]];
			var local_data = yootil.storage.get(this.packs[pack], true) || {};

			for(var user in pack_data){
				this.data(user).add.pack(this.packs[pack], this.utils.check_data(pack_data[user]), (yootil.user.id() == user)? local_data : {});
			}
		}
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
			this.user_data_table[user_id] = user_data;
		}

		return user_data;
	},

	/**
	 * Each trophy has it's own method to be called.  Here we call those methods.
	 */

	init_trophy_checks: function(){
		for(var key in this.list){
			var t = this.list[key];
	
			if(!t.disabled && typeof t.callback != "undefined" && !this.data(yootil.user.id()).trophy.earned(t)){
				t.callback.call(this, t);
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