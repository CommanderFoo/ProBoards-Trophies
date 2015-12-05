if(typeof TROPHY_REGISTER == "undefined"){
	TROPHY_REGISTER = {};
}

TROPHY_REGISTER["pixeldepth_trophies"] = {

	plugin_id: "pixeldepth_trophies",
	plugin_key: "pixeldepth_trophies",

	trophies_key: "t",
	trophies_data_key: "d",

	"trophies": [

		{

			id: 1,
			cup: "bronze",
			title: "Logged In",
			image: "logged_in",
			description: "You have logged in to your account",
			disabled: false,
			callback: function(trophy){
				this.show_notification(trophy, false, false);
			}

		},

		{

			id: 2,
			cup: "bronze",
			title: "Viewed A Profile",
			image: "view_profile",
			description: "Viewed another members profile",
			disabled: false,
			callback: function(trophy){
				if(yootil.location.check.profile() && yootil.user.id() != yootil.page.member.id()){
					this.show_notification(trophy, false, false);
				}
			}

		},

		{

			id: 3,
			cup: "bronze",
			title: "Made 10 Posts",
			image: "made_10_posts",
			description: "Made 10 posts on the forum",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() >= 10){
					this.show_notification(trophy, false, false);
				}
			}

		},

		{

			id: 4,
			cup: "bronze",
			title: "Made 25 Posts",
			image: "made_25_posts",
			description: "Made 25 posts on the forum",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() >= 25){
					this.show_notification(trophy, false, false);
				}
			}

		},

		{

			id: 5,
			cup: "bronze",
			title: "Made 50 Posts",
			image: "made_50_posts",
			description: "Made 50 posts on the forum",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() >= 50){
					this.show_notification(trophy, false, false);
				}
			}

		},

		{

			id: 6,
			cup: "bronze",
			title: "Made 100 Posts",
			image: "made_100_posts",
			description: "Made 100 posts on the forum",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() >= 100){
					this.show_notification(trophy, false, false);
				}
			}

		},

		{

			id: 7,
			cup: "bronze",
			title: "Made 250 Posts",
			image: "made_250_posts",
			description: "Made 250 posts on the forum",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() >= 250){
					this.show_notification(trophy, false, false);
				}
			}

		},

		{

			id: 8,
			cup: "bronze",
			title: "Made 500 Posts",
			image: "made_500_posts",
			description: "Made 500 posts on the forum",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() >= 500){
					this.show_notification(trophy, false, false);
				}
			}

		},

		{

			id: 9,
			cup: "silver",
			title: "Made 1,000 Posts",
			image: "made_1000_posts",
			description: "Made 1,000 posts on the forum",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() >= 1000){
					this.show_notification(trophy, false, false);
				}
			}

		},

		{

			id: 10,
			cup: "gold",
			title: "Made 5,000 Posts",
			image: "made_5000_posts",
			description: "Made 5,000 posts on the forum",
			disabled: false,
			callback: function(trophy){
				if(yootil.user.posts() >= 5000){
					this.show_notification(trophy, false, false);
				}
			}

		}

	]

};