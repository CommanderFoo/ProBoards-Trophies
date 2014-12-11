var trophies = {

	VERSION: "{VER}",

	KEY: "pixeldepth_trophies",

	showing: false,

	plugin: null,
	route: null,
	params: null,
	images: null,

	trigger_caller: false,

	user_data_table: {},

	settings: {

		notification_disable: false,

		show_on_profile: true,
		show_in_mini_profile: true,
		show_on_members_list: true

	},
	
	banned_members: [],
	banned_groups: [],

	modules: [],

	months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"],
	days: ["Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat"],
	
	queue: null,
	
	init: function(){
		this.queue = new yootil.queue();
		this.setup();
		this.setup_user_data_table();
		this.init_trophy_checks();
				
		if(yootil.location.check.profile()){
			this.create_tab();
		}
	},

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
		}
	},
	
	version: function(){
		return this.VERSION;
	},
	
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

	check_data: function(data){
		if(typeof data == "string" && yootil.is_json(data)){
			data = JSON.parse(data);
		}

		return data;
	},
	
	setup_user_data_table: function(){
		var all_data = proboards.plugin.keys.data[this.KEY];
		var got_data = false;
		var local_data = yootil.storage.get("pixeldepth_trophies", true) || {};
		
		for(var key in all_data){
			var data = this.check_data(all_data[key]);
			var local = {};
			
			if(yootil.user.logged_in() && key == yootil.user.id()){
				local = local_data;
			}
			
			if(key == yootil.user.id()){
				got_data = true;	
			}
					
			this.user_data_table[key] = new this.Data(key, data, local);
		}
		
		if(!got_data && yootil.user.logged_in()){
			this.user_data_table[yootil.user.id()] = new this.Data(yootil.user.id(), data, local_data);
		}
		
		this.show_unseen_trophies();
	},

	data: function(user_id){
		var user_data = this.user_data_table[((user_id)? user_id : yootil.user.id())];

		if(!user_data){
			user_data = new this.Data(user_id);
			this.user_data_table[user_id] = user_data;
		}

		return user_data;
	},
	
	refresh_user_data_table: function(){
		this.setup_user_data_table();
	},

	init_trophy_checks: function(){
		if(yootil.user.logged_in() && this.allowed_to_earn_trophies()){
			for(var key in this.list){
				var t = this.list[key];
	
				if(!t.disabled && typeof this.check[t.method] != "undefined"){
					this.check[t.method].call(this, t);
				}
			}
		}
	},

	create_notification: function(trophy){
		var notification = "";

		notification += "<div id='trophy-" + trophy.id + "' class='trophy-notification' style='display: none;'>";
		notification += "<div class='trophy-notification-left'><img class='trophy-notification-img' src='" + this.images[trophy.image] + "' /></div>";
		notification += "<div class='trophy-notification-title' class='trophy-notification-left'>You have earned a trophy.";
		notification += "<p class='trophy-notification-info'><img class='trophy-notification-cup' src='" + this.images[trophy.cup] + "' /> ";
		notification += "<span class='trophy-notification-txt'>" + trophy.title + "</span></p></div></div>";

		$("body").append($(notification));

		return notification;
	},

	show_notification: function(trophy){
		if(!this.allowed_to_earn_trophies() || this.data(yootil.user.id()).has.seen(trophy)){
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
		var trophies = this.data(yootil.user.id()).get.data();
		
		for(var t in trophies){
			if(!trophies[t].s){
				this.show_notification(this.list[t]);
			} 	
		}
	},
	
	create_tab: function(){
		var active = (location.href.match(/\/user\/\d+\/trophies/i))? true : false;
		var form = $("div.show-user form.form_user_status");

		if(form.length){
			var trophy_stats = yootil.create.profile_content_box();
			var trophy_list = yootil.create.profile_content_box();
			var stats_html = this.create_trophy_stats();

			container_parent = form.parent();
			yootil.create.profile_tab("Trophies", "trophies", active);

			trophy_stats.html(stats_html).appendTo(container_parent);
			trophy_list.html(this.build_trophy_list()).appendTo(container_parent);
		}
	},
	
	build_trophy_list: function(){
		var trophy_list = "";
		var counter = 0;
		var time_24 = (yootil.user.logged_in() && yootil.user.time_format() == "12hr")? false : true;
		
		for(var id in this.list){
			var trophy = this.list[id];
			
			if(trophy.disabled){
				continue;	
			}
			
			var has_earned = (yootil.user.logged_in() && this.data(yootil.user.id()).trophy.earned(trophy))? true : false;
			var cup_big = this.images.bronze_big;
			var cup_small = this.images.bronze;
			var trophy_img = this.images[((has_earned)? trophy.image : "locked")]; 
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
			var the_trophy = this.data(yootil.page.member.id()).get.trophy(id);
			
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
			
			trophy_list += "<div class='trophy-list-trophy" + first + opacity + "'>";
			trophy_list += "<div class='trophy-list-trophy-img'><img src='" + yootil.html_encode(trophy_img) + "' /></div>";
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
	}

};