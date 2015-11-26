trophies.Data = (function(){

	function Data(user_id){

		/**
		 * @property {Number} user_id The user id for this user.
		 */

		this.user_id = user_id;

		/**
		 * @property {Object} data Data object for the user, contains all data for each pack (trophies earned, and other
		 * random data that may be needed for that pack).
		 */

		this.data = {};

		var self = this;

		this.add = {

			pack: function(pack, data){
				self.data[pack] = data;
			},

			trophy: function(){

			}

		};

		this.get = {

			data: function(){
				return self.data;
			},

			pack: function(pack_id){
				if(self.data[pack_id]){
					return self.data[pack_id];
				}

				return null;
			},

			pack_trophies: function(pack_id){
				if(self.data[pack_id] && self.data[pack_id].t){
					return self.data[pack_id].t;
				}

				return null;
			},

			pack_data: function(pack_id){
				if(self.data[pack_id].d && self.data[pack_id].d){
					return self.data[pack_id].d;
				}

				return null;
			}

		};

		this.set = {

			data: function(data){
				self.data = data;
			},

			pack: function(pack_id, pack){
				self.data[pack_id] = pack;
			},

			pack_trophies: function(pack_id, pack_trophies){
				if(self.data[pack_id]){
					self.data[pack_id].t = pack_trophies;
					return true;
				}

				return null;
			},

			pack_data: function(pack_id, pack_data){
				if(self.data[pack_id]){
					self.data[pack_id].d = pack_data;
					return true;
				}

				return null;
			}

		};

		this.remove = {

			trophy: function(pack, trophy_id){
				if(self.data[pack] && self.data[pack][trophy_id]){
					delete self.data[pack][trophy_id];
					return true;
				}

				return false;
			}

		};

	}

	return Data;

})();