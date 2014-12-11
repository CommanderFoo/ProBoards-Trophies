trophies.check = (function(){

	return {

		logged_in: function(trophy){
			this.show_notification(trophy, false, false);
		},
		
		viewed_profile: function(trophy){
			if(yootil.location.check.profile() && yootil.user.id() != yootil.page.member.id()){
				this.show_notification(trophy, false, false);
			}
		},
		
		made_10_posts: function(trophy){
			if(yootil.user.posts() >= 10){
				this.show_notification(trophy, false, false);
			}
		},
		
		made_25_posts: function(trophy){
			if(yootil.user.posts() >= 25){
				this.show_notification(trophy, false, false);
			}
		},
		
		made_50_posts: function(trophy){
			if(yootil.user.posts() >= 50){
				this.show_notification(trophy, false, false);
			}
		},
		
		made_100_posts: function(trophy){
			if(yootil.user.posts() >= 100){
				this.show_notification(trophy, false, false);
			}
		},
		
		made_250_posts: function(trophy){
			if(yootil.user.posts() >= 250){
				this.show_notification(trophy, false, false);
			}
		},
		
		made_500_posts: function(trophy){
			if(yootil.user.posts() >= 500){
				this.show_notification(trophy, false, false);
			}
		},
		
		made_1000_posts: function(trophy){
			if(yootil.user.posts() >= 1000){
				this.show_notification(trophy, false, false);
			}
		},
		
		made_5000_posts: function(trophy){
			if(yootil.user.posts() >= 5000){
				this.show_notification(trophy, false, false);
			}
		}
		
	}
	
})();