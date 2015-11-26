trophies.utils = {

	trophy: {

		exists: function(trophy_id){
			if(!trophies.list[trophy_id]){
				return false;
			}

			return true;
		}

	}

};