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
		this.local_data = {};

		this.stats = {

			earned_trophies: [],
			total_trophies: 0,
			total_points: 0,
			current_level: 1,
			next_level: 2,
			level_percentage: 0,

			cups: {

				total: 0,
				bronze: 0,
				silver: 0,
				gold: 0

			}
		};

		var self = this;

		this.add = {

			pack: function(pack, data, local_data){
				self.data[pack] = data;

				if(local_data){
					self.local_data[pack] = local_data;
				}
			},

			trophy: function(trophy, data, local){
				if(trophy && trophy.id && trophy.pack){
					if(data){
						self.pack.create(trophy.pack);
						self.data[trophy.pack][trophy.id] = yootil.timestamp();
					}

					if(local){
						self.pack.create(trophy.pack, true);
						self.local_data[trophy.pack][trophy.id] = {

								s: 0,
								t: yootil.timestamp()

						};

						var key = trophies.utils.get.pack(trophy.pack).key;

						if(key){
							yootil.storage.set(key, self.local_data[trophy.pack], true, true);
						}
					}
				}
			}

		};

		this.pack = {

			exists: function(pack,  local){
				if(!self[((local)? "local_data" : "data")][pack]){
					return false;
				}

				return true;
			},

			create: function(pack, local){
				if(!self.pack.exists(pack, local)){
					self[((local)? "local_data" : "data")][pack] = {};
				}
			}

		};

		this.get = {

			data: function(){
				return self.data;
			},

			local_data: function(){
				return self.local_data;
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
			},

			local_pack_data: function(pack_id){
				if(self.local_data[pack_id]){
					return self.local_data[pack_id];
				}

				return null;
			},

			trophy: function(trophy, local){
				if(self.trophy.exists(trophy, local)){
					var where = (local)? self.data : self.local_data;

					return where[trophy.pack][trophy.id];
				}

				return false;
			},

			stat: {

				earned_trophies: function(){
					return self.stats.earned_trophies;
				},

				total_trophies: function(){
					return self.stats.total_trophies;
				},

				total_points: function(){
					return self.stats.total_points;
				},

				current_level: function(){
					return self.stats.current_level;
				},

				next_level: function(){
					return self.stats.next_level;
				},

				level_percentage: function(){
					return self.stats.level_percentage;
				},

				cups: {

					bronze: function(){
						return self.stats.cups.bronze;
					},

					silver: function(){
						return self.stats.cups.silver;
					},

					gold: function(){
						return self.stats.cups.gold;
					}

				}

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
			},

			trophy: {

				seen: function(trophy){
					if(self.trophy.exists(trophy, true)){
						self.local_data[trophy.pack][trophy.id].s = 1;
					}

					var key = trophies.utils.get.pack(trophy.pack).key;

					if(key){
						yootil.storage.set(key, self.local_data[trophy.pack], true, true);
					}
				}

			}

		};

		this.remove = {

			trophy: function(trophy, local){
				if(self.trophy.exists(trophy, local)){
					delete self[((local)? "local_data" : "data")][trophy.pack][trophy.id];
				}
			}

		};

		this.trophy = {

			earned: function(trophy){

			},

			seen: function(trophy){
				var user_trophy = self.get.trophy(trophy, true);

				if(user_trophy){
					if(user_trophy.s){
						return true;
					}
				} else if(self.get.trophy(trophy)){
					return true;
				}

				return false;
			},

			exists: function(trophy, local){
				var store = self[((local)? "local_data" : "data")];

				if(trophy && store[trophy.pack] && store[trophy.pack][trophy.id]){
					return true;
				}

				return false;
			}

		}

	}

	return Data;

})();