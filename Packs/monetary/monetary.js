if(typeof TROPHY_REGISTER == "undefined"){
	TROPHY_REGISTER = {};
}

TROPHY_REGISTER["trophies_monetary_pack"] = {

	name: "Monetary Pack",
	description: "Trophies for the Monetary System and Shop",

	plugin_id: "trophies_monetary_pack",
	plugin_key: "trophies_monetary_pack",

	trophies_key: "t",
	trophies_data_key: "d",

	pre_init: function(pack){

		// Need to do text replacements
		
		//test

		for(var t in trophies.lookup[pack.plugin_id]){
			var trophy = trophies.lookup[pack.plugin_id][t];

			if(trophy.title.match(/\{([\.\w]+)\}/g) || trophy.description.match(/\{([\.\w]+)\}/g)){
				var keys = RegExp.$1.toLowerCase().split(".");
				var last = monetary[keys[0]];

				for(var i = 1; i < keys.length; i ++){
					console.log(keys[i]);
					if(last[keys[i]]){
						last = last[keys[i]];
					}
				}

				trophies.lookup[pack.plugin_id][t].title = trophy.title.replace(/\{[\.\w]+\}/g, last);
				trophies.lookup[pack.plugin_id][t].description = trophy.description.replace(/\{[\.\w]+\}/g, last.toLowerCase());
			}
		}
	},

	init: function(pack, events, self){
		self.pack = pack;
		self.events = events;
		self.user_data = trophies.data(yootil.user.id());
		self.pack_data = self.user_data.get.pack_data(pack.plugin_id);
		self.local_pack_data = self.user_data.get.local_pack_data(pack.plugin_id);
	},

	methods: {

	},

	"trophies": [

		{

			id: 1,
			cup: "bronze",
			title: "{SETTINGS.MONEY_TEXT} Maker",
			image: "money_maker",
			description: "Made some {MONETARY.MONEY_TEXT}",
			disabled: false,
			callback: function(trophy){
				if(monetary.data(yootil.user.id()).get.money() > 0){
					this.show_notification(trophy);
				}
			}

		},

		{

			id: 2,
			cup: "bronze",
			title: "Savings",
			image: "savings",
			description: "Has had some savings in the {BANK.SETTINGS.TEXT.BANK}",
			disabled: false,
			callback: function(trophy){
				if(monetary.data(yootil.user.id()).get.bank() > 0){
					this.show_notification(trophy);
				}
			}

		}

	]

};