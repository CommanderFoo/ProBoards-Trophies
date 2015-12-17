// Test pack

if(typeof TROPHY_REGISTER == "undefined"){
	TROPHY_REGISTER = {};
}

TROPHY_REGISTER["trophies_test_pack"] = {

	name: "Test Pack",
	description: "Test trophy pack",

	plugin_id: "trophies_test_pack",
	plugin_key: "trophies_test_pack",

	// This is used for local and key data

	trophies_key: "t",

	// This is used for local and key data

	trophies_data_key: "d",

	init: function(pack, events, self){
		self.pack = pack;
		self.events = events;
		self.user_data = trophies.data(yootil.user.id());
		self.pack_data = self.user_data.get.pack_data(pack.plugin_id);
		self.local_pack_data = self.user_data.get.local_pack_data(pack.plugin_id);

		console.log("test init");

		self.test();
		self.bind_sync_event();

	},

	methods: {

		test: function(){
			console.log("test method");

			// Simple counter

			var pack_data = this.user_data.get.pack_data(this.pack.plugin_id);
			var local_pack_data = this.user_data.get.local_pack_data(this.pack.plugin_id);
			var counter = (~~ (pack_data.c))? pack_data.c : 0;

			if(~~ local_pack_data.c){
				counter = local_pack_data.c;
			}

			local_pack_data.c = counter + 1;
			this.user_data.save_local(this.pack.plugin_id, local_pack_data, true);
		},

		bind_sync_event: function(){
			var self = this;

			$(this.events).on("trophies.before_syncing", function(evt, user_data, hook){
				var pack_data = self.user_data.get.pack_data(self.pack.plugin_id);
				var local_pack_data = self.user_data.get.local_pack_data(self.pack.plugin_id);

				if(local_pack_data.c){
					pack_data.c = local_pack_data.c;
					local_pack_data.c = 0;
				}

				self.user_data.set.pack_data(self.pack.plugin_id, pack_data);
			});
		}

	},

	"trophies": [

		{

			id: 1,
			cup: "bronze",
			title: "Just A Test Trophy",
			image: "test",
			description: "Test trophy",
			disabled: false,
			callback: function(trophy){
				this.show_notification(trophy);
			}

		},

		{

			id: 2,
			cup: "silver",
			title: "Counter Reached 5",
			image: "test2",
			description: "Test trophy 2",
			disabled: false,
			callback: function(trophy){
				var user_data = this.data(yootil.user.id());
				var local_pack_data = user_data.get.local_pack_data(trophy.pack);
				var counter = local_pack_data.c || 0;

				if(counter >= 5){
					this.show_notification(trophy);
				}
			}

		}

	]

};