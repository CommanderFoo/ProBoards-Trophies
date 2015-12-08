if(typeof TROPHY_REGISTER == "undefined"){
	TROPHY_REGISTER = {};
}

TROPHY_REGISTER["trophies_xmas_pack"] = {

	name: "Christmas Pack",
	description: "Christmas trophy pack",

	plugin_id: "trophy_xmas_pack",
	plugin_key: "trophies_xmas_pack",

	trophies_key: "t",
	trophies_data_key: "d",

	"trophies": [

		{

			id: 1,
			cup: "silver",
			title: "Was here on Christmas Eve",
			image: "here_xmas_eve",
			description: "You were on the forum on Christmas Eve",
			disabled: false,
			callback: function(trophy){
				var now = new Date(proboards.dataHash.serverDate);

				if((now.getMonth() + 1) == 12 && now.getDate() == 24){
					this.show_notification(trophy, false, false);
				}
			}

		},

		{

			id: 2,
			cup: "gold",
			title: "Was here on Christmas Day",
			image: "here_xmas_day",
			description: "You were on the forum on Christmas Day",
			disabled: false,
			callback: function(trophy){
				var now = new Date(proboards.dataHash.serverDate);

				if((now.getMonth() + 1) == 12 && now.getDate() == 25){
					this.show_notification(trophy, false, false);
				}
			}

		}

	]

};