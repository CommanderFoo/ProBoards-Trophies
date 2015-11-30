trophies.utils = {

	trophy: {
		exists: function(trophy_id){
			if(!trophies.list[trophy_id]){
				return false;
			}
			return true;
		}
	},

	/**
	 * MOVE TO YOOTIL
	 * Checks a number and returns the correct suffix to be used with it.
	 *
	 *     trophies.get_suffix(3); // "rd"
	 *
	 * @param {Number} n The number to be checked.
	 * @return {String}
	 */

	get_suffix: function(n){
		var j = (n % 10);

		if(j == 1 && n != 11){
			return "st";
		}

		if(j == 2 && n != 12){
			return "nd";
		}

		if(j == 3 && n != 13) {
			return "rd";
		}

		return "th";
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

		return this.images.missing;
	},

	get: {

		pack: function(pack){
			if(TROPHY_REGISTER[pack]){
				return TROPHY_REGISTER[pack];
			}

			return null;
		}

	}

};