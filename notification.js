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
		var unseen_trophies = this.data(yootil.user.id()).get.local_data();

		for(var pack in unseen_trophies){
			if(this.utils.pack.exists(pack)){
				for(var trophy in unseen_trophies[pack]){
					var the_trophy = {

						id: trophy,
						pack: pack,
						s: unseen_trophies[pack][trophy].s || 0

					};

					if(this.utils.trophy.exists(the_trophy) && !this.data(yootil.user.id()).trophy.seen(the_trophy)){
						this.show_notification(this.lookup[pack][trophy]);
					}
				}
			}
		}

		/*
		con
		//unseen_trophies = this.sort_unseen_trophies(trophies);

		for(var t in unseen_trophies){
			if(!this.utils.trophy.exists(t)){
				this.data(yootil.user.id()).remove.trophy(t, true);
			} else if(!unseen_trophies[t].s){
				this.show_notification(this.list[t]);
			}
		}*/
	}

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

});