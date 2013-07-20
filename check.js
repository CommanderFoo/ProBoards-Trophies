trophies.check = (function(){

	return {

		logged_in: function(trophy){
			if(yootil.user.logged_in()){
				this.show_notification(trophy);
			}
		}
		
	}
	
})();