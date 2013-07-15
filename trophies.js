var trophies = {

	VERSION: "1.0.0",
	
	data: {
				
	},
	
	plugin: null,
	route: null,
	params: null,
	images: null,

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
		this.build_notification();
	},
		
	setup: function(){
		if(yootil.key.has_value("pixeldepth_trophies")){
			var data = yootil.key.value("pixeldepth_trophies", null, true);
			
			if(data){
				this.data = (data && typeof data == "object")? data : this.data;
			}
		}			
			
		this.route = (proboards.data("route") && proboards.data("route").name)? proboards.data("route").name.toLowerCase() : "";
		this.params = (this.route && proboards.data("route").params)? proboards.data("route").params : "";
		this.plugin = proboards.plugin.get("pixeldepth_trophies");
		
		if(this.plugin && this.plugin.settings){
			var settings = this.plugin.settings;
		}
	},
	
	build_notification: function(){
		var notification = "";
		
		notification += "<div id='trophy-notification' style='display: none;'>";
		notification += "<div class='trophy-notification-left'><img id='trophy-notification-img' src='" + this.image_host + "images/misc/blank.png' /></div>";
		notification += "<div id='trophy-notification-title' class='trophy-notification-left'>You have earned a trophy.";
		notification += "<p id='trophy-notification-info'><img id='trophy-notification-cup' src='" + this.image_host + "images/misc/blank.png' /> ";
		notification += "<span id='trophy-notification-txt'></span></p></div></div>";
		
		$("body").append($(notification));
	},
	
	show_notification: function(trophy){
		var notification = $("#trophy-notification");
		
		notification.find("#trophy-notification-img").attr("src", this.image_host + "trophies/" + trophy.image + ".png");
		notification.find("#trophy-notification-cup").attr("src", this.image_host + "icons/cups/" + trophy.cup + ".png");
		notification.find("#trophy-notification-txt").html(trophy.title);
		
		notification.fadeIn("normal", function(){
			$(this).delay(5000).fadeOut("normal");
		});
		
		yootil.sound.play(this.sound_host + "trophy.mp3");
	}
	
};