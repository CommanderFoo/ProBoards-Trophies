var trophies = {

	VERSION: "1.0.0",
	
	data: {},
	local: {},
	
	earned_trophies: {},
	
	showing: false,
	
	plugin: null,
	route: null,
	params: null,
	images: null,
	
	settings: {
	
		notification_disable: false,
		sound_disabled: false,
		
		show_on_profile: true,
		show_in_mini_profile: true,
		show_on_members_list: true
	
	},

	sound_host: "http://pixeldepth.net/proboards/plugins/trophies/sound/",
	image_host: "http://pixeldepth.net/proboards/plugins/trophies/images/",
	
	modules: [],
	
	cups: {

		gold: "images/icons/cups/gold.png",
		silver: "images/icons/cups/silver.png",
		bronze: "images/icons/cups/bronze.png"

	},
	
	init: function(){
		this.setup();
		this.get_data();
		this.queue = new yootil.queue();
		this.parse_trophies();
		
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
		}
	},
	
	clear_trophies: function(){
		this.data = {};
		this.local = {};
		this.earned_trophies = {};
		
		yootil.storage.set("pixeldepth_trophies", {}, true, true);
		yootil.key.set("pixeldepth_trophies", {}, null, true);
	},
	
	get_data: function(){
		if(yootil.key.has_value("pixeldepth_trophies")){
			var data = yootil.key.value("pixeldepth_trophies", null, true);
			
			if(data){
				this.data = (data && typeof data == "object")? data : this.data;
			}
		}
		
		this.local  = yootil.storage.get("pixeldepth_trophies", true) || [];
	},
	
	parse_trophies: function(){
		if(yootil.user.logged_in()){
			for(var key in trophies.list){
				var t = trophies.list[key];
				
				if(!t.disabled && typeof trophies.check[t.method] != "undefined"){
					trophies.check[t.method].call(this, t);
				}
			}
		}
	},
	
	create_notification: function(trophy){
		var notification = "";
		
		notification += "<div id='trophy-" + trophy.id + "' class='trophy-notification' style='display: none;'>";
		notification += "<div class='trophy-notification-left'><img class='trophy-notification-img' src='" + this.image_host + "trophies/" + trophy.image + ".png' /></div>";
		notification += "<div class='trophy-notification-title' class='trophy-notification-left'>You have earned a trophy.";
		notification += "<p class='trophy-notification-info'><img class='trophy-notification-cup' src='" + this.image_host + "icons/" + trophy.cup + ".png' /> ";
		notification += "<span class='trophy-notification-txt'>" + trophy.title + "</span></p></div></div>";

		$("body").append($(notification));
		
		return notification;
	},
	
	show_notification: function(trophy, no_notification, local){
		if(this.earned_trophy(trophy)){
			return;
		}
		
		this.save_trophy(trophy, local || false);
		
		if(no_notification === false || no_notification === 0){
			return;
		}	
		
		var notification = this.create_notification(trophy);
		var self = this;
		
		this.queue.add(function(){
			yootil.sound.play(self.sound_host + "trophy.mp3");
			
			$("div#trophy-" + trophy.id).delay(200).fadeIn("normal").delay(3500).fadeOut("normal", function(){
				$(this).remove();
				self.queue.next();
			});
		});
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
			trophy_list.html("Trophy List Here").appendTo(container_parent);
		}
	},
	
	create_trophy_stats: function(){
		var html = "";
		var trophy_stats = this.get_next_level();
		console.log(trophy_stats);
		html += "<div>";
		html += "<div style='float: left; margin-right: 20px'><img src='" + this.images.trophy_level + "' /></div>";
		html += "<div style='float: left; margin-right: 20px; font-weight: 16px; text-align: center;'><strong>Level</strong><br /><strong style='font-size: 40px;'>" + trophy_stats.level + "</strong></div>";
		html += "<div style='float: left;'><div style='margin-top: 25px; border: 1px solid black; padding: 1px; height: 15px; width: 400px'><div style='background-color: #D6A314; width: " + trophy_stats.percent + "%; height: 15px'> </div></div></div>";
		html += "<div style='float: right'>AAA</div>";
		html += "<div style='float: right'>BBB</div>";
		html += "</div>";		
		
		return html;
	},
	
	get_trophies: function(ary){
		if(ary){
			var trophies = [];
			
			for(var key in this.data){
				if(!trophies.list[key].disabled){
					trophies.push(this.data[key]);
				}
			}
			
			return trophies;
		}
		
		return this.data;
	},
	
	get_points: function(t){
		var points = 0;

		for(var id in t){
			if(trophies.list[id] && !trophies.list[id].disabled){
				switch(trophies.list[id].cup){
	
					case "bronze" :
						points += 30;
						break;
	
					case "silver" :
						points += 60;
						break;
	
					case "gold" :
						points += 120;
						break;	
				}
			}
		}

		return points;
	},
	
	get_level: function(points){
		var lev = 1;

		if(points && parseInt(points) > 0){
			for(var level in trophies.levels){
				if(points >= trophies.levels[level] && points < trophies.levels[(parseInt(level) + 1).toString()]){
					lev = level;
				}
			}
		}

		return parseInt(lev);
	},
	
	get_next_level: function(){
		var points = this.get_points(this.get_trophies());
		var level = this.get_level(points);
		var next_level_points = trophies.levels[(level + 1).toString()];
		var points_needed = (next_level_points - points);
		var obj = {

			percent: 0,
			needed: points_needed,
			total: points,
			level: level

		};

		if(next_level_points){
			obj.percent = ((points / next_level_points) * 100).toFixed(0);
		}

		if(obj.percent > 100){
			obj.percent = 100;
		}

		return obj;
	},
	
	earned_trophy: function(trophy){
		if(this.data[trophy.id]){
			return true;
		}
		
		return false;
	},
	
	save_local: function(trophy_id){
		if(this.local[trophy_id]){
			this.local[trophy_id] = {
				id: trophy_id,
				s: 0
			};
			
			yootil.storage.set("pixeldepth_trophies", this.local, true, true);
		}
	},
	
	save_trophy: function(trophy, local){
		if(trophy && !this.earned_trophy(trophy)){
			if(local){
				this.save_local(trophy.id);
			}
			
			this.data[trophy.id] = {
				t: (+ new Date)
			};
			
			yootil.key.set("pixeldepth_trophies", this.data, null, true);
		}
	}
	
};