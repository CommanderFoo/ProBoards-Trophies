$.extend(trophies, {

	/**
	 * Creates the trophy notification html.
	 *
	 * @param {Object} trophy The trophy data to be shown to the user.
	 * @returns {String}
	 */

	create_notification: function(trophy){
		var notification = "";

		notification += "<div id='trophy-" + trophy.id + "' class='trophy-notification' style='display: none;'>";
		notification += "<div class='trophy-notification-left'><img class='trophy-notification-img' src='" + this.utils.fetch_image(trophy) + "' /></div>";
		notification += "<div class='trophy-notification-title' class='trophy-notification-left'>You have earned a trophy.";
		notification += "<p class='trophy-notification-info'><img class='trophy-notification-cup' src='" + this.images[trophy.cup] + "' /> ";
		notification += "<span class='trophy-notification-txt'>" + trophy.title + "</span></p></div></div>";

		$("body").append($(notification));

		return notification;
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
			$("div#trophy-" + trophy.id).delay(200).fadeIn("normal", function(){
				data.set.trophy.seen(trophy);
			}).delay(3500).fadeOut("normal", function(){
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