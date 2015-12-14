if(typeof TROPHY_REGISTER == "undefined"){
	TROPHY_REGISTER = {};
}

TROPHY_REGISTER["pixeldepth_trophies"] = {

	name: "Core Pack",
	description: "Default trophies that come with the plugin",

	plugin_id: "pixeldepth_trophies",
	plugin_key: "pixeldepth_trophies",

	// This is used for local and key data

	trophies_key: "t",

	// This is used for local and key data

	trophies_data_key: "d",

	init: function(pack, events){
		var user_data = trophies.data(yootil.user.id());
		var pack_data = user_data.get.pack_data(pack.plugin_id);
		var local_pack_data = user_data.get.local_pack_data(pack.plugin_id);

		if(!pack_data.st && !local_pack_data.st){
			local_pack_data.st = yootil.timestamp();
		} else if(pack_data.st){
			delete local_pack_data.st;
		}

		user_data.save_local(pack);

		// Handle reading topics
		// We perform another update to local but delayed.

		// Check for pack data
		// This will overwrite pack data when an action
		// is performed.

		var read = 0;

		if(pack_data.tr){
			read = pack_data.tr;
		}

		// Now see what's in local.  If there is nothing in local
		// and we have pack data, then set local to pack data.
		// Otherwise local has the right to overwrite pack data.

		if(local_pack_data.tr){
			read = local_pack_data.tr;
		} else {
			local_pack_data.tr = read;
		}

		// Check location; if reading a topic, increment counter
		// and save to local.

		if(yootil.location.thread()){

			// Wait a little while to prevent people getting
			// this trophy too quickly.

			// We will do sync checking at some point so that
			// a user can't just open 50 topics all in one go.

			setTimeout(function(){
				local_pack_data.tr ++;
				user_data.save_local(pack);
			}, 15000) // 15 seconds, then it will increment the counter
		}

		// Perform some stuff before keys are synced

		$(events).on("trophies.before_syncing", function(evt, user_data, hook){
			var pack_data = user_data.get.pack_data(pack.plugin_id);
			var local_pack_data = user_data.get.local_pack_data(pack.plugin_id);

			if(yootil.location.posting_thread()){

				// Topics posted

				if(!pack_data.tp){
					pack_data.tp = 0;
				}

				pack_data.tp ++;
			}

			// Logged in start time

			var data_start_time = (pack_data.st)? pack_data.st : 0;

			if(!data_start_time){
				var local_data_start_time = (local_pack_data.st)? local_pack_data.st : 0;
				var start_time = ((data_start_time)? data_start_time : local_data_start_time) || yootil.timestamp();

				pack_data.st = start_time;
			}

			// Handle topics read

			if(local_pack_data.tr){
				pack_data.tr = local_pack_data.tr;
				local_pack_data.tr = 0;
			}

			user_data.set.pack_data(pack.plugin_id, pack_data);
		});
	},

	"trophies": [

		{

			id: 1,
			cup: "bronze",
			title: "Welcome",
			image: "logged_in",
			description: "Logged in to your account",
			disabled: false,
			callback: function(trophy){
				this.show_notification(trophy);
			}

		},

		{

			id: 2,
			cup: "bronze",
			title: "First Post",
			image: "post_1",
			description: "Made 1 post on the forum",
			sort_on: "description",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() >= 1){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 3,
			cup: "bronze",
			title: "10 Posts",
			image: "post_10",
			description: "Made 10 posts on the forum",
			sort_on: "description",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() >= 10){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 4,
			cup: "bronze",
			title: "25 Posts",
			image: "post_25",
			description: "Made 25 posts on the forum",
			sort_on: "description",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() >= 25){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 5,
			cup: "bronze",
			title: "50 Posts",
			image: "post_50",
			description: "Made 50 posts on the forum",
			sort_on: "description",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() >= 50){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 6,
			cup: "bronze",
			title: "Forum Century",
			image: "post_100",
			description: "Made 100 posts on the forum",
			sort_on: "description",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() >= 100){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 7,
			cup: "silver",
			title: "Posting Maniac",
			image: "post_250",
			description: "Made 250 posts on the forum",
			sort_on: "description",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() >= 250){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 8,
			cup: "silver",
			title: "Tree Fiddy",
			image: "post_350",
			description: "Made 350 posts on the forum",
			sort_on: "description",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() >= 350){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 9,
			cup: "silver",
			title: "500 Club",
			image: "post_500",
			description: "Made 500 posts on the forum",
			sort_on: "description",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() >= 500){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 10,
			cup: "gold",
			title: "Part of the Community",
			image: "post_1000",
			description: "Made 1,000 posts on the forum",
			sort_on: "description",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() >= 1000){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 11,
			cup: "gold",
			title: "Forum Spammer",
			image: "post_5000",
			description: "Made 5,000 posts on the forum",
			sort_on: "description",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() >= 5000){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 12,
			cup: "gold",
			title: "Over 9000",
			image: "post_9001",
			description: "Made over 9,000 posts",
			sort_on: "description",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() > 9000){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 13,
			cup: "bronze",
			title: "Nosey",
			image: "view_profile",
			description: "Viewed another members profile",
			disabled: false,
			callback: function(trophy){
				if(yootil.location.check.profile() && yootil.user.id() != yootil.page.member.id()){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 14,
			cup: "bronze",
			title: "First Topic",
			image: "topic_1",
			description: "Created 1 topic on the forum",
			sort_on: "description",
			disabled: false,
			callback: function(trophy){
				var data = trophies.data(yootil.user.id()).get.pack_data(trophy.pack);
				var current_topics = data.tp || 0;

				if(current_topics >= 1){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 15,
			cup: "bronze",
			title: "5 Topics",
			image: "topic_5",
			description: "Created 5 topics on the forum",
			sort_on: "description",
			disabled: false,
			callback: function(trophy){
				var data = trophies.data(yootil.user.id()).get.pack_data(trophy.pack);
				var current_topics = data.tp || 0;

				if(current_topics >= 5){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 16,
			cup: "silver",
			title: "15 Topics",
			image: "topic_15",
			description: "Created 15 topics on the forum",
			sort_on: "description",
			disabled: false,
			callback: function(trophy){
				var data = trophies.data(yootil.user.id()).get.pack_data(trophy.pack);
				var current_topics = data.tp || 0;

				if(current_topics >= 15){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 17,
			cup: "gold",
			title: "30 Topics",
			image: "topic_30",
			description: "Created 30 topics on the forum",
			sort_on: "description",
			disabled: false,
			callback: function(trophy){
				var data = trophies.data(yootil.user.id()).get.pack_data(trophy.pack);
				var current_topics = data.tp || 0;

				if(current_topics >= 30){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 18,
			cup: "gold",
			title: "Conversation Starter",
			image: "topic_50",
			description: "Created 50 topics on the forum",
			sort_on: "description",
			disabled: false,
			callback: function(trophy){
				var data = trophies.data(yootil.user.id()).get.pack_data(trophy.pack);
				var current_topics = data.tp || 0;

				if(current_topics >= 50){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 19,
			cup: "gold",
			title: "Christmas Eve",
			image: "24th",
			description: "Was on the forum on Christmas Eve",
			disabled: false,
			callback: function(trophy){
				var now = new Date(proboards.dataHash.serverDate);

				if((now.getMonth() + 1) == 12 && now.getDate() == 24){
					this.show_notification(trophy, false, false);
				}
			}

		},

		{

			id: 20,
			cup: "gold",
			title: "Christmas Day",
			image: "25th",
			description: "Was on the forum on Christmas Day",
			disabled: false,
			callback: function(trophy){
				var now = new Date(proboards.dataHash.serverDate);

				if((now.getMonth() + 1) == 12 && now.getDate() == 25){
					this.show_notification(trophy, false, false);
				}
			}

		},

		{

			id: 21,
			cup: "bronze",
			title: "A Quick 5 Minutes",
			image: "time_5mins",
			description: "Been on the forum for at least 5 minutes",
			disabled: false,
			callback: function(trophy){
				var user_data = trophies.data(yootil.user.id());
				var pack_data = user_data.get.pack_data(trophy.pack);
				var local_pack_data = user_data.get.local_pack_data(trophy.pack);
				var start_time = (pack_data.st)? pack_data.st : local_pack_data.st;

				if(start_time){
					var diff = (yootil.timestamp() - start_time);
					var mins = Math.floor(diff / 6000);

					if(mins >= 5){
						this.show_notification(trophy);
					}
				}
			}

		},

		{

			id: 22,
			cup: "bronze",
			title: "30 Minutes",
			image: "time_30mins",
			description: "Been on the forum for at least 30 minutes",
			disabled: false,
			callback: function(trophy){
				var user_data = trophies.data(yootil.user.id());
				var pack_data = user_data.get.pack_data(trophy.pack);
				var local_pack_data = user_data.get.local_pack_data(trophy.pack);
				var start_time = (pack_data.st)? pack_data.st : local_pack_data.st;

				if(start_time){
					var diff = (yootil.timestamp() - start_time);
					var mins = Math.floor(diff / 6000);

					if(mins >= 30){
						this.show_notification(trophy);
					}
				}
			}

		},

		{

			id: 23,
			cup: "silver",
			title: "60 Minutes",
			image: "time_1hr",
			description: "Been on the forum for at least 1 hour",
			disabled: false,
			callback: function(trophy){
				var user_data = trophies.data(yootil.user.id());
				var pack_data = user_data.get.pack_data(trophy.pack);
				var local_pack_data = user_data.get.local_pack_data(trophy.pack);
				var start_time = (pack_data.st)? pack_data.st : local_pack_data.st;

				if(start_time){
					var diff = (yootil.timestamp() - start_time) / 1000;
					var hrs = Math.floor(diff / 3600);

					if(hrs >= 1){
						this.show_notification(trophy);
					}
				}
			}

		},

		{

			id: 24,
			cup: "gold",
			title: "AFK",
			image: "time_12hrs",
			description: "Been on the forum for at least 12 hours",
			disabled: false,
			callback: function(trophy){
				var user_data = trophies.data(yootil.user.id());
				var pack_data = user_data.get.pack_data(trophy.pack);
				var local_pack_data = user_data.get.local_pack_data(trophy.pack);
				var start_time = (pack_data.st)? pack_data.st : local_pack_data.st;

				if(start_time){
					var diff = (yootil.timestamp() - start_time) / 1000;
					var hrs = Math.floor(diff / 3600);

					if(hrs >= 12){
						this.show_notification(trophy);
					}
				}
			}

		},

		{

			id: 25,
			cup: "bronze",
			title: "I Can Read",
			image: "read_1",
			description: "Has read 1 topic",
			disabled: false,
			sort_on: "description",
			callback: function(trophy){
				var user_data = trophies.data(yootil.user.id());
				var local_pack_data = user_data.get.local_pack_data(trophy.pack);
				var topics_read = local_pack_data.tr || 0;

				if(topics_read >= 1){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 26,
			cup: "bronze",
			title: "5 Read Topics",
			image: "read_5",
			description: "Has read 5 topics",
			disabled: false,
			sort_on: "description",
			callback: function(trophy){
				var user_data = trophies.data(yootil.user.id());
				var local_pack_data = user_data.get.local_pack_data(trophy.pack);
				var topics_read = local_pack_data.tr || 0;

				if(topics_read >= 5){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 27,
			cup: "silver",
			title: "Keen Reader",
			image: "read_25",
			description: "Has read 25 topics",
			disabled: false,
			sort_on: "description",
			callback: function(trophy){
				var user_data = trophies.data(yootil.user.id());
				var local_pack_data = user_data.get.local_pack_data(trophy.pack);
				var topics_read = local_pack_data.tr || 0;

				if(topics_read >= 25){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 28,
			cup: "gold",
			title: "Big Reader",
			image: "read_50",
			description: "Has read 50 topics",
			disabled: false,
			sort_on: "description",
			callback: function(trophy){
				var user_data = trophies.data(yootil.user.id());
				var local_pack_data = user_data.get.local_pack_data(trophy.pack);
				var topics_read = local_pack_data.tr || 0;

				if(topics_read >= 50){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 29,
			cup: "gold",
			title: "Topic Lover",
			image: "read_100",
			description: "Has read 100 topics",
			disabled: false,
			sort_on: "description",
			callback: function(trophy){
				var user_data = trophies.data(yootil.user.id());
				var local_pack_data = user_data.get.local_pack_data(trophy.pack);
				var topics_read = local_pack_data.tr || 0;

				if(topics_read >= 100){
					this.show_notification(trophy);
				}
			}

		}

	]

};