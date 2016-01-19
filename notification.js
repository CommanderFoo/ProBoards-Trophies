$.extend(trophies, {

	template: {

		/**
		 * Try to cache templates so we don't have to keep building and assigning to variables
		 *
		 * @property {String} cache
		 */

		cache: "",

		/**
		 * This is the PS3 theme (meh, it's Ok).
		 */

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

		/**
		 * PS4 theme (I like this one, so it is the default)
		 */

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

		/**
		 * If the user has created a custom template then we don't
		 * need to build anything here.
		 *
		 * @param {String} custom_tpl The template (from the settings).
		 */

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
	 * @returns {Object} The template jQuery wrapped.
	 */

	create_notification: function(trophy){
		var notification = this.parse_template(this.get_template(), trophy, this.get_position_klass());

		$("body").append(notification);

		return notification;
	},

	/**
	 * Here we parse the template.  Replace any template variables with the data.
	 *
	 * @param {String} tpl The template to use.
	 * @param {Object} trophy The trophy for this notification.
	 * @param {String} position The CSS class for the position of the notification.
	 * @return {Object} The notification parsed and jQuery wrapped ready for DOM insertion.
	 */

	parse_template: function(tpl, trophy, position){
		var tmp_trophy = $.extend({}, trophy);

		tmp_trophy.position = position;

		for(var key in tmp_trophy){
			if(key == "callback" || key == "disabled"){
				continue;
			}

			var re = new RegExp("\{TROPHY\." + key.toString().toUpperCase() + "\}", "gmi");

			if(re.test(tpl)){
				if(key == "cup"){
					tmp_trophy[key] = trophies.images[tmp_trophy[key]];
				} else if(key == "image"){
					tmp_trophy[key] = trophies.utils.fetch_image(trophy);
				}

				tpl = tpl.replace(re, tmp_trophy[key]);
			}
		}

		tpl = tpl.replace(/\{TROPHY\.\w+\}/gmi, "");

		return $(tpl).attr("id", "trophy-" + trophy.id).attr("data-pack", trophy.pack).hide();
	},

	/**
	 * Gets the template chosen by the forum.  Default is PS4.
	 *
	 * @return {String}
	 */

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

	/**
	 * Gets the position class based on the setting .
	 *
	 * @return {String}
	 */

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

	/**
	 * Handles showing the trophy notification to the user.
	 *
	 * @param {Object} trophy The trophy the user has earned.
	 */

	show_notification: function(trophy){

		// Fetch the data for this user

		var data = this.data(yootil.user.id());

		// Has the user already seen this notification?

		if(data.trophy.seen(trophy)){
			return;
		}

		// Add the trophy to local and data objects.

		data.add.trophy(trophy, true, true);

		// Sync to other tabs

		this.sync.trigger();

		// Create the notification (appended to the DOM).

		this.create_notification(trophy);

		// Custom event for any packs that want to modify the notification
		// after it has been created.

		$(this.events).trigger("trophies.notification_created", [$("#trophy-" + trophy.id), trophy]);

		var self = this;

		// Queue it, in case there are multiple trophies earned.

		this.queue.add(function(){
			$("#trophy-" + trophy.id).delay(200).fadeIn("normal", function(){

				// Set the trophy as seen once the notification has shown up.

				data.set.trophy.seen(trophy);

				// Sync again, as data has changed.

				self.sync.trigger();

			}).delay(self.settings.notification_duration).fadeOut("normal", function(){
				$(this).remove();
				$(self.events).trigger("trophies.notification_removed", [trophy]);
				self.queue.next();
			});
		});
	},

	/**
	 * Handles showing trophies in local that have not been seen yet, but earned.
	 */

	show_unseen_trophies: function(){

		// Get local data

		var local_data = this.data(yootil.user.id()).get.local_data();

		// Loop over all packs in the local data

		for(var pack in local_data){

			// Make sure the pack still exists (local data can hang around)

			if(this.utils.pack.exists(pack)){

				// Get the pack info

				var pack_info = trophies.utils.get.pack(pack);

				// Make sure we have pack info, and check the trophies key does exist

				if(pack_info && local_data[pack_info.pack][pack_info.trophies_key]){
					var local_trophies = local_data[pack_info.pack][pack_info.trophies_key];

					// Loop over the trophies and show the notification if the trophy
					// still exists.

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