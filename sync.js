$.extend(trophies.sync, {

	trigger_caller: false,

	init: function(){

		// Trigger now to make sure the latest data
		// is being stored

		this.trigger(false);

		var self = this;

		setTimeout(function(){
			$(window).on("storage", $.proxy(self.handle_syncing, self));
		}, 100);
	},

	handle_syncing: function(evt){
		if(evt && evt.originalEvent && /_(data|local)/.test(evt.originalEvent.key)){
			if(this.trigger_caller){
				this.trigger_caller = false;
				return;
			}

			this.sync_data(evt.originalEvent);
		}
	},

	sync_data: function(evt){
		var old_data = evt.oldValue;
		var new_data = evt.newValue;

		if(old_data == new_data){
			return;
		}

		if(new_data && yootil.is_json(new_data)){
			new_data = JSON.parse(new_data);
		} else {
			return;
		}

		var local = (evt.key.match("_local_sync"))? true : false;
		var id = evt.key.replace(/_(data|local)_sync/, "");
		var pack_info = trophies.utils.get.pack(id);

		if(pack_info){
			if(local){
				trophies.data(yootil.user.id()).set.local_pack(id, new_data);
			} else {
				trophies.data(yootil.user.id()).set.pack(id, new_data);
			}
		}
	},

	trigger: function(val){
		this.trigger_caller = (typeof val == "undefined" || val)? true : false;

		if(trophies.packs.length){
			for(var pack in trophies.packs){
				var pack_info = trophies.utils.get.pack(trophies.packs[pack]);

				if(pack_info && pack_info.plugin_key){
					yootil.storage.set(pack_info.plugin_key + "_data_sync", trophies.data(yootil.user.id()).get.pack(pack_info.pack), true, true);
					yootil.storage.set(pack_info.plugin_key + "_local_sync", trophies.data(yootil.user.id()).get.local_pack(pack_info.pack), true, true);

				}
			}
		}
	}

});