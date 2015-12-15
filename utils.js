trophies.utils = {

	trophy: {

		/**
		 * Checks to see if a trophy exists.
		 *
		 * @param {Object} trophy The trophy to check.
		 * @return {Boolean}
		 */

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

	/**
	 * Fetches the image for the trophy.  If not found, a "missing" image is used.
	 *
	 * @param {Object} trophy The trophy.
	 * @return {String}
	 */

	fetch_image: function(trophy){
		var pack_info = this.get.pack(trophy.pack);

		if(pack_info){
			var plugin = proboards.plugin.get(pack_info.plugin_id);

			if(plugin && plugin.images && plugin.images[trophy.image]){
				return plugin.images[trophy.image];
			}
		}

		return trophies.images.missing;
	},

	get: {

		/**
		 * Get a pack that is in the register.
		 *
		 * @param {String} pack The pack ID
		 * @return {Object}
		 */

		pack: function(pack){
			if(TROPHY_REGISTER[pack]){
				return TROPHY_REGISTER[pack];
			}

			return null;
		},

		/**
		 * Get a trophy from a pack.
		 *
		 * @param {String} pack Pack ID
		 * @param {Number} id The trophy ID
		 * @return {Object} If exists, then the trophy is returned.
		 */

		trophy: function(pack, id){
			if(trophies.utils.pack.exists(pack)){
				var pack_info = trophies.utils.get.pack(pack);

				if(pack_info){
					var the_trophy = {

						id: id,
						pack: pack

					};

					if(trophies.utils.trophy.exists(the_trophy)){
						return trophies.lookup[pack_info.pack][id];
					}
				}
			}

			return false;
		},

		/**
		 * Gets all the trophies a user has earned.
		 *
		 * @param {Number} user
		 * @param {Boolean} sort Tries to sort the trophies.
		 * @param {Array}
		 */

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
				list.sort(trophies.utils.sorting_func);
			}

			return list;
		},

		/**
		 * Gets all trophies in all packs as one list.
		 *
		 * @param {Boolean} sort Tries to sort them.
		 * @return {Array}
		 */

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
				all_trophies.sort(trophies.utils.sorting_func);
			}

			return all_trophies;
		}

	},

	pack: {

		/**
		 * Checks if a pack exists.
		 *
		 * @param {String} pack The pack ID
		 * @return {Boolean}
		 */

		exists: function(pack){
			if($.inArray(pack, trophies.packs) > -1){
				return true;
			}

			return false;
		}

	},

	/**
	 * Clears any intervals and deletes the record.
	 *
	 * @param {Object} trophy
	 */

	clear_interval: function(trophy){
		if(trophies.intervals[trophy.pack] && trophies.intervals[trophy.pack][trophy.id]){
			clearInterval(trophies.intervals[trophy.pack][trophy.id]);
			delete trophies.intervals[trophy.pack][trophy.id];
		}
	},

	// A mess to be honest, it's a bit of a pain sorting them.
	// I've rewrote this too many times now, however I think this one
	// works a little better.

	// Basically I get the first 4 characters and the first number in the string
	// I attempt to order based on the number first.

	// a_str and b_str are made up of the 4 chars + the number for the final check.

	sorting_func: function(a, b) {
		var k = (a.sort_on)? a.sort_on : "title";
		var _a = a[k].substr(0, 4).replace(/[^\w]/g, "");
		var _b = b[k].substr(0, 4).replace(/[^\w]/g, "");
		var _a_num = ~~ ((a[k].match(/([\d\,]+)/g))? RegExp.$1 : "").replace(/\D/g, "");
		var _b_num = ~~ ((b[k].match(/([\d\,]+)/g))? RegExp.$1 : "").replace(/\D/g, "");
		var a_str = _a + _a_num;
		var b_str = _b + _b_num;

		if(_a_num && _b_num){
			if(_a_num > _b_num){
				return 1;
			} else if(_a_num < _b_num){
				return -1;
			}
		}

		if(a_str > b_str){
			return 1;
		} else if(a_str < b_str){
			return -1;
		}

		return 0;
	}

};