$.extend(trophies, {

	template: {

		cache: "",

		ps3: function(){
			if(this.cache){
				return this.cache;
			}

			var tpl = "";

			tpl += "<div data-pack='{TROPHY.PACK}' id='trophy-{TROPHY.ID}' class='trophy-notification-wrapper trophy-theme-ps3 {TROPHY.POSITION}'>";
				tpl += "<div class='trophy-notification-theme-ps3'>";
					tpl += "<div class='trophy-notification-theme-ps3-left'>";
						tpl += "<img src='{TROPHY.IMAGE}' />";
					tpl += "</div>";
					tpl += "<div class='trophy-notification-theme-ps3-title'>";
						tpl +="You have earned a trophy!";
						tpl += "<p class='trophy-notification-theme-ps3-info'>";
							tpl += "<img class='trophy-notification-theme-ps3-cup' src='{TROPHY.CUP}' /> ";
							tpl += "<span class='trophy-notification-theme-ps3-txt'>{TROPHY.TITLE}</span>";
						tpl += "</p>";
					tpl += "</div>";
				tpl += "</div>";
			tpl += "</div>";

			this.cache = tpl;

			return tpl;
		},

		ps4: function(){
			if(this.cache){
				return this.cache;
			}

			var tpl = "";

			tpl += "<div data-pack='{TROPHY.PACK}' id='trophy-{TROPHY.ID}' class='trophy-notification-wrapper trophy-theme-ps4 {TROPHY.POSITION}'>";
				tpl += '<div class="trophy-notification-theme-ps4-wrapper">';
					tpl += '<div class="trophy-notification-theme-ps4-inner">';
						tpl += '<div class="trophy-notification-theme-ps4-image">';
							tpl += "<img src='{TROPHY.IMAGE}' />";
						tpl += '</div>';
						tpl += '<div class="trophy-notification-theme-ps4-info">';
							tpl += "<img class='trophy-notification-theme-ps4-cup' src='{TROPHY.CUP}' /> ";
							tpl += "<span class='trophy-notification-theme-ps4-title'>{TROPHY.TITLE}</span>";
							tpl += "<p class='trophy-notification-theme-ps4-desc'>You have earned a trophy!</p>";
						tpl += '</div>';
					tpl += '</div>';
				tpl += '</div>';
			tpl += '</div>';

			this.cache = tpl;

			return tpl;
		},

		custom: function(custom_tpl){
			if(this.cache){
				return this.cache;
			}

			this.cache = custom_tpl;

			return custom_tpl;
		}

	},

	/**
	 * Creates the trophy notification html.
	 *
	 * @param {Object} trophy The trophy data to be shown to the user.
	 * @returns {String}
	 */

	create_notification: function(trophy){
		var notification = this.parse_template(this.get_template(), trophy, this.get_position_klass());

		$("body").append(notification);

		return notification;
	},

	parse_template: function(tpl, trophy, position){
		var tmp = trophy;

		tmp.position = position;

		for(var key in tmp){
			if(key == "callback" || key == "disabled"){
				continue;
			}

			var re = new RegExp("\{TROPHY\." + key.toString().toUpperCase() + "\}", "gmi");

			if(re.test(tpl)){
				if(key == "cup"){
					tmp[key] = trophies.images[tmp[key]];
				} else if(key == "image"){
					tmp[key] = trophies.utils.fetch_image(trophy);
				}

				tpl = tpl.replace(re, tmp[key]);
			}
		}

		tpl = tpl.replace(/\{TROPHY\.\w+\}/gmi, "");

		return $(tpl).attr("id", "trophy-" + trophy.id).attr("data-pack", trophy.pack).hide();
	},

	get_template: function(){
		if(this.settings.notification_custom_enabled && this.settings.notification_custom_tpl.length){
			return this.template["custom"](this.settings.notification_custom_tpl);
		}

		var tpl = "ps4";

		switch(this.settings.notification_theme){

			case 1 :
				tpl = "ps3";
				break;

			case 2 :
				tpl = "ps4";
				break;

		}

		return this.template[tpl]();
	},

	get_position_klass: function(){
		var klass = "top-right";

		switch(this.settings.notification_position){

			case 1:
				klass = "top-left";
				break;

			case 3:
				klass = "bottom-left";
				break;

			case 4:
				klass = "bottom-right";
				break;

		}

		return "trophy-notification-pos-" + klass;
	},

	show_notification: function(trophy){
		var data = this.data(yootil.user.id());

		if(data.trophy.seen(trophy)){
			return;
		}

		data.add.trophy(trophy, true, true);
		this.create_notification(trophy);

		var self = this;

		this.queue.add(function(){
			$("#trophy-" + trophy.id).delay(200).fadeIn("normal", function(){
				data.set.trophy.seen(trophy);
			}).delay(self.settings.notification_duration).fadeOut("normal", function(){
				$(this).remove();
				self.queue.next();
			});
		});
	},

	show_unseen_trophies: function(){
		var local_data = this.data(yootil.user.id()).get.local_data();

		for(var pack in local_data){
			if(this.utils.pack.exists(pack)){
				var pack_info = trophies.utils.get.pack(pack);

				if(pack_info && local_data[pack_info.pack][pack_info.trophies_key]){
					var local_trophies = local_data[pack_info.pack][pack_info.trophies_key];

					for(var trophy in local_trophies){
						var the_trophy = {

							id: trophy,
							pack: pack,
							s: local_trophies[trophy].s || 0

						};

						if(this.utils.trophy.exists(the_trophy) && this.data(yootil.user.id()).trophy.exists(the_trophy, true) && !this.data(yootil.user.id()).trophy.seen(the_trophy)){
							this.show_notification(this.lookup[pack_info.pack][trophy]);
						}
					}
				}
			}
		}

	}

});