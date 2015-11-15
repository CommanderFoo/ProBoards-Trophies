if(typeof TROPHY_REGISTER == "undefined"){
	TROPHY_REGISTER = {};
}

$.extend(TROPHY_REGISTER, {

	"xmas": [

		{

			id: "xmas1",
			cup: "silver",
			title: "Was here on Christmas Eve",
			image: "here_xmas_eve",
			description: "You were on the forum on Christmas Eve",
			disabled: false,
			callback: function(trophy){
				var now = new Date();

				if((now.getMonth() + 1) == 12 && now.getDate() == 24){
					this.show_notification(trophy, false, false);
				}
			}

		},

		{

			id: "xmas2",
			cup: "gold",
			title: "Was here on Christmas Day",
			image: "here_xmas_day",
			description: "You were on the forum on Christmas Day",
			disabled: false,
			callback: function(trophy){
				var now = new Date();

				if((now.getMonth() + 1) == 12 && now.getDate() == 25){
					this.show_notification(trophy, false, false);
				}
			}

		}

	]

});