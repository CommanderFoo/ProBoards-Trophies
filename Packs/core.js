if(typeof TROPHY_REGISTER == "undefined"){
	TROPHY_REGISTER = {};
}

TROPHY_REGISTER["pixeldepth_trophies"] = {

	name: "Core Pack",
	description: "Default trophies that come with the plugin",

	plugin_id: "pixeldepth_trophies",
	plugin_key: "pixeldepth_trophies",

	trophies_key: "t",
	trophies_data_key: "d",

	init: function(events){
		$(events).on("trophies.form_submit", function(evt){
			//console.log("hmm");
			//console.log(evt);
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
			image: "made_1_post",
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
			image: "made_10_posts",
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
			image: "made_25_posts",
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
			image: "made_50_posts",
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
			image: "made_100_posts",
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
			image: "made_250_posts",
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
			image: "made_350_posts",
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
			image: "made_500_posts",
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
			image: "made_1000_posts",
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
			image: "made_5000_posts",
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
			image: "over_9000",
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
			image: "made_1_topic",
			description: "Made 1 topic on the forum",
			disabled: false,
			callback: function(trophy){
				var data = trophies.data(yootil.user.id()).get.pack_data(trophy.pack);
				var current_topics = data.topics || 0;

				if(current_topics >= 1){
					this.show_notification(trophy);
				}
			}

		}

	]

};