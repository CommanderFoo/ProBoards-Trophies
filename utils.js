trophies.utils = {

	trophy: {

		exists: function(trophy){
			if(!trophy || !trophy.id || !trophy.pack || !trophies.lookup[trophy.pack] || !trophies.lookup[trophy.pack][trophy.id]){
				return false;
			}

			return true;
		}

	},

	/**
	 * Checks the data type to make sure it's correct.  The reason for this is because ProBoards
	 * never used to JSON stringify values, so we check to make sure it's not double stringified.
	 *
	 * @param {String} data The key data.
	 * @return {Object}
	 */

	check_data: function(data){
		if(typeof data == "string" && yootil.is_json(data)){
			data = JSON.parse(data);
		}

		return data;
	},

	fetch_image: function(trophy){
		var plugin = proboards.plugin.get(trophy.pack);

		if(plugin && plugin.images && plugin.images[trophy.image]){
			return plugin.images[trophy.image];
		}

		return trophies.images.missing;
	},

	get: {

		pack: function(pack){
			if(TROPHY_REGISTER[pack]){
				return TROPHY_REGISTER[pack];
			}

			return null;
		},

		trophies: function(user, sort){
			var list = [];
			var user_trophies = trophies.data(user).get.trophies();

			for(var pack in user_trophies){
				if(trophies.utils.pack.exists(pack)){
					var pack_info = trophies.utils.get.pack(pack);

					if(pack_info){
						for(var trophy in user_trophies[pack]){
							if(!trophies.lookup[pack][trophy] || trophies.lookup[pack][trophy].disabled){
								continue;
							}

							var the_trophy = trophies.lookup[pack][trophy];

							$.extend(the_trophy, {

								date_earned: user_trophies[pack][trophy].t

							});

							list.push(the_trophy);
						}
					}
				}
			}

			if(sort){
				list.sort(function(a, b){
					return a.title - b.title;
				});
			}

			return list;
		},

		all_trophies: function(sort){
			var all_trophies = [];

			for(var pack in trophies.lookup){
				if(trophies.utils.pack.exists(pack)){
					var pack_info = trophies.utils.get.pack(pack);

					if(pack_info){
						for(var trophy in trophies.lookup[pack]){
							if(trophies.lookup[pack][trophy].disabled){
								continue;
							}

							all_trophies.push(trophies.lookup[pack][trophy]);
						}
					}
				}
			}

			if(sort){
				all_trophies.sort(function(a, b){
					return a.title - b.title;
				});
			}

			return all_trophies;
		}

	},

	pack: {

		exists: function(pack){
			if($.inArray(pack, trophies.packs) > -1){
				return true;
			}

			return false;
		}

	}

};