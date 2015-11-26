/**
 * @class Trophies
 * @static
 *
 * Main class.
 */

var trophies = {

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

	route: null,

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

		/*
		this.init_trophy_checks();
				
		if(yootil.location.profile()){
			this.create_tab();
		}

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
				this.bind_form_submit(the_form);
			}
		}*/
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
	 *
	 * @param {Object} the_form The form getting the handler.
	 */

	bind_form_submit: function(the_form){
		the_form.bind("submit", $.proxy(this.move_to_key, this));
	},

	/**
	 * We need to move local trophy data that has been seen to the key.
	 */

	move_to_key: function(){
		//this.data(yootil.user.id()).clear.synced();
		//this.data(yootil.user.id()).save_to_keys(this.KEY, this.packs);
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
	 * MOVE TO YOOTIL
	 * Checks a number and returns the correct suffix to be used with it.
	 *
	 *     trophies.get_suffix(3); // "rd"
	 *
	 * @param {Number} n The number to be checked.
	 * @return {String}
	 */

	get_suffix: function(n){
		var j = (n % 10);

		if(j == 1 && n != 11){
			return "st";
		}

		if(j == 2 && n != 12){
		    return "nd";
		}

		if(j == 3 && n != 13) {
			return "rd";
		}

		return "th";
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
	 * Checks the data type to make sure it's correct.  The reason for this is because ProBoards
	 * never used to JSON stringify values, so we check to make sure it's not double stringified.
	 *
	 * @param {String} data The key data.
	 * @return {Object}
	 */

	check_data: function(data){
		if(typeof data == "string" && yootil.is_json(data)){
			data = JSON.parse(data);
		}

		return data;
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
				this.data(user).add.pack(this.packs[pack], this.check_data(pack_data[user]));

				if(yootil.user.logged_in() && user == yootil.user.id()){
				//	this.data(user).setup_pack_local_data
				}
			}
		}



		/*
		var core_data = proboards.plugin.keys.data[this.KEY];
		var got_data = false;
		var local_data = yootil.storage.get("pixeldepth_trophies", true) || {};
		
		for(var key in core_data){
			var data = this.check_data(core_data[key]);
			var local = {};
			
			if(yootil.user.logged_in() && key == yootil.user.id()){
				local = local_data;
			}
			
			if(key == yootil.user.id()){
				got_data = true;	
			}

			this.user_data_table[key] = {

				data_core: data,
				data_local: local,
				data_pack: {}

			};
		}

		if(this.packs.length){
			for(var p in this.packs){
				var pack_data = proboards.plugin.keys.data["trophy_" + this.packs[p] + "_pack"];

				for(var user in pack_data){
					var user_data = this.check_data(pack_data[user]);

					this.user_data_table[user].data_pack[this.packs[p]] = user_data;
				}
			}
		}

		for(var u in this.user_data_table){
			this.user_data_table[u] = new this.Data(u, this.user_data_table[u], local);
		}

		if(!got_data && yootil.user.logged_in()){
			this.user_data_table[yootil.user.id()] = new this.Data(yootil.user.id(), {}, {});
		}
		
		this.show_unseen_trophies();*/
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
		if(yootil.user.logged_in() && this.allowed_to_earn_trophies()){
			for(var key in this.list){
				var t = this.list[key];
	
				if(!t.disabled && typeof t.callback != "undefined" && !this.data(yootil.user.id()).trophy.earned(t)){
					t.callback.call(this, t);
				}
			}
		}
	},

	fetch_image: function(trophy){
		var plugin = proboards.plugin.get(trophy.pack);

		if(plugin && plugin.images && plugin.images[trophy.image]){
			return plugin.images[trophy.image];
		}

		return this.images.missing;
	},

	/**
	 * Creates the trophy notification html.
	 *
	 * @param {Object} trophy The trophy data to be shown to the user.
	 * @returns {String}
	 */

	create_notification: function(trophy){
		var notification = "";

		notification += "<div id='trophy-" + trophy.id + "' class='trophy-notification' style='display: none;'>";
		notification += "<div class='trophy-notification-left'><img class='trophy-notification-img' src='" + trophies.fetch_image(trophy) + "' /></div>";
		notification += "<div class='trophy-notification-title' class='trophy-notification-left'>You have earned a trophy.";
		notification += "<p class='trophy-notification-info'><img class='trophy-notification-cup' src='" + this.images[trophy.cup] + "' /> ";
		notification += "<span class='trophy-notification-txt'>" + trophy.title + "</span></p></div></div>";

		$("body").append($(notification));

		return notification;
	},

	show_notification: function(trophy){
		if(!this.allowed_to_earn_trophies() || this.data(yootil.user.id()).trophy.seen(trophy)){
			return;	
		}

		this.data(yootil.user.id()).set.local.trophy(trophy);
		
		var notification = this.create_notification(trophy);
		var self = this;

		this.queue.add(function(){
			$("div#trophy-" + trophy.id).delay(200).fadeIn("normal", function(){
				self.data(yootil.user.id()).set.local.seen(trophy.id);
			}).delay(3500).fadeOut("normal", function(){
				$(this).remove();
				self.queue.next();
			});
		});
	},
	
	show_unseen_trophies: function(){
		var unseen_trophies = this.data(yootil.user.id()).get.local_data();

		//trophies = this.sort_unseen_trophies(trophies);

		for(var t in unseen_trophies){
			if(!this.exist(t)){
				this.data(yootil.user.id()).remove.trophy(t, true);

			} else if(!unseen_trophies[t].s){
				this.show_notification(this.list[t]);
			}
		}
	},

	/*sort_unseen_trophies: function(trophies){
		var sorted_trophies = [];

		for(var t in trophies){
			sorted_trophies.push({key: t, value: trophies[t]})
		}

		sorted_trophies.sort(function(a, b){
			return a.key - b.key;
		});

		return sorted_trophies;
	},*/
	
	create_tab: function(){
		var active = (location.href.match(/\/user\/\d+\/trophies/i))? true : false;
		var first_box = $("form.form_user_status .content-box:first");

		if(first_box.length){
			var trophy_stats = yootil.create.profile_content_box();
			var trophy_list = yootil.create.profile_content_box();
			var stats_html = (this.settings.show_on_profile)? this.create_trophy_stats() : "";

			if(stats_html.length){
				trophy_stats.html(stats_html);
			}

			if(!active){
				if(this.settings.show_on_profile){
					if(yootil.user.id() == yootil.page.member.id()){
						trophy_stats.insertAfter(first_box);
					} else{
						trophy_stats.insertBefore(first_box);
					}
				}
			} else {
				trophy_stats.appendTo($("form.form_user_status").parent());
				trophy_list.html(this.build_trophy_list()).appendTo($("form.form_user_status").parent());
			}

			yootil.create.profile_tab("Trophies", "trophies", active);
		}
	},
	
	build_trophy_list: function(){
		var trophy_list = "";
		var counter = 0;
		var time_24 = (yootil.user.logged_in() && yootil.user.time_format() == "12hr")? false : true;
		var the_user = yootil.page.member.id() || yootil.user.id();

		for(var id in this.list){
			var trophy = this.list[id];
			
			if(trophy.disabled){
				continue;	
			}
			
			var has_earned = (yootil.user.logged_in() && this.data(the_user).trophy.earned(trophy))? true : false;
			var cup_big = this.images.bronze_big;
			var cup_small = this.images.bronze;
			var trophy_img = (has_earned)? this.fetch_image(trophy) : this.images["locked"];
			var alt = "Bronze";
			var first = (!counter)? " trophy-list-trophy-first" : "";
			var opacity = (has_earned)? "" : " trophy-list-trophy-not-earned";
									
			switch(trophy.cup){
				
				case "silver" :
					cup_big = this.images.silver_big;
					cup_small = this.images.silver;
					alt = "Silver";
					
					break;

				case "gold" :
					cup_big = this.images.gold_big;
					cup_small = this.images.gold;
					alt = "Gold";
					
					break;
									
			}
			
			var date_str = "";
			var the_trophy = this.data(the_user).get.trophy(id);
			
			if(the_trophy && the_trophy.t && has_earned){
				var date = new Date(the_trophy.t);
				var day = date.getDate() || 1;
				var month = this.months[date.getMonth()];
				var year = date.getFullYear();
				var hours = date.getHours();
				var mins = date.getMinutes();
				var am_pm = "";
	
				mins = (mins < 10)? "0" + mins : mins;
				date_str = "Earned on " + day + this.get_suffix(day) + " of " + month + ", " + year;
	
				if(!time_24){
					am_pm = (hours > 11)? "pm" : "am";
					hours = hours % 12;
					hours = (hours)? hours : 12;
				}
	
				date_str += ", at " + hours + ":" + mins + am_pm;
			}
			
			var big_cup_img = "<img src='" + yootil.html_encode(cup_big) + "' title='" + alt + "' alt='" + alt + "' />";
			var small_cup_img = "<img src='" + yootil.html_encode(cup_small) + "' title='" + alt + "' alt='" + alt + "' />";

			var title = "";

			if(this.settings.show_id){
				title = "title='Trophy ID: " + id + "' ";
			}

			trophy_list += "<div class='trophy-list-trophy" + first + opacity + "'>";
			trophy_list += "<div class='trophy-list-trophy-img'><img " + title + "src='" + trophy_img + "' /></div>";
			trophy_list += "<div class='trophy-list-trophy-title-desc'>";
			trophy_list += "<div class='trophy-list-trophy-title'><span class='trophy-list-trophy-title-cup'>" + small_cup_img + "</span> <strong>" + yootil.html_encode(trophy.title) + "</strong></div>";
			trophy_list += "<div class='trophy-list-trophy-desc'>" + yootil.html_encode(trophy.description) + ".</div></div>";
			trophy_list += "<div class='trophy-list-trophy-big-cup'>" + big_cup_img + "</div>";
			trophy_list += "<div class='trophy-list-trophy-earned-date'>" + date_str + "</div>";
			trophy_list += "<br style='clear: both' /></div>";
			
			counter ++;
		}
		
		if(!trophy_list.length){
			var to_user = (yootil.user.id() == yootil.page.member.id())? "You have" : (yootil.page.member.name() + " has");
			
			trophy_list = "<div class='trophies-list-profile trophies-list-none'>" + yootil.html_encode(to_user) + " not earned any trophies.</div>";	
		}
		
		return trophy_list;
	},

	create_trophy_stats: function(){
		var data = this.data(yootil.page.member.id());
		var html = "";

		html += "<div class='trophy-stats-wrapper'>";
		html += "<div class='trophy-stats-big-cup'><img src='" + this.images.trophy_level + "' /></div>";
		html += "<div class='trophy-stats-level-wrapper'><strong>Level</strong><br /><strong class='trophy-stats-level'>" + data.get.current_level() + "</strong></div>";
		html += "<div class='trophy-stats-percent-wrapper'><div class='trophy-stats-percent-bar-wrapper'><div class='trophy-stats-percent-bar' style='width: " + data.get.level_percentage() + "%;'> </div></div></div>";
		html += "<div class='trophy-stats-total-cups-wrapper'><ul>";
		html += "<li class='trophy-stats-cup-bronze-img'><img src='" + this.images.bronze + "' /></li>";
		html += "<li class='trophy-stats-cup-bronze-total'>" + data.get.cups.bronze() + "</li>";
		html += "<li class='trophy-stats-cup-spacer'> </li>";
		html += "<li class='trophy-stats-cup-silver-img'><img src='" + this.images.silver + "' /></li>";
		html += "<li class='trophy-stats-cup-silver-total'>" + data.get.cups.silver() + "</li>";
		html += "<li class='trophy-stats-cup-spacer'> </li>";
		html += "<li class='trophy-stats-cup-gold-img'><img src='" + this.images.gold + "' /></li>";
		html += "<li class='trophy-stats-cup-gold-total'>" + data.get.cups.gold() + "</li>";
		html += "</ul><br style='clear: both' /></div>";
		html += "<div class='trophy-stats-total-trophies-wrapper'><strong>Trophies</strong><br /><strong class='trophy-stats-total-trophies'>" + data.get.total_trophies() + "</strong></div>";
		html += "</div>";

		return html;
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
	},

	exist: function(id){
		if(!this.list[id]){
			return false
		}

		return true;
	}

};