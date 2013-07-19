var trophies = {

	VERSION: "1.0.0",
	
	data: [],
	display_data: [],
	
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
		this.queue = new yootil.queue();
		this.show_undisplayed_trophies();
	},
		
	setup: function(){
		if(yootil.key.has_value("pixeldepth_trophies")){
			var data = yootil.key.value("pixeldepth_trophies", null, true);
			
			if(data){
				this.data = (data && typeof data == "object")? data : this.data;
			}
			
			this.display_data = yootil.storage.get("pixeldepth_trophies", true)  || [];
		}			
			
		this.route = (proboards.data("route") && proboards.data("route").name)? proboards.data("route").name.toLowerCase() : "";
		this.params = (this.route && proboards.data("route").params)? proboards.data("route").params : "";
		this.plugin = proboards.plugin.get("pixeldepth_trophies");
		
		if(this.plugin && this.plugin.settings){
			var settings = this.plugin.settings;
			
			
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
	
	show_notification: function(trophy){
		var notification = this.create_notification(trophy);
		var self = this;
				
		this.queue.add(function(){
			yootil.sound.play(self.sound_host + "trophy.mp3");
			
			$("div#trophy-" + trophy.id).fadeIn("normal").delay(4000).fadeOut("normal", function(){
				$(this).remove();
				self.queue.next();
			});
		});
	},
	
	show_undisplayed_trophies: function(){		
		if(this.display_data.length){
			
		}
	}
	
};