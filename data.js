/**
 * @class trophies.Data
 * @constructor
 * Wrapper class around the users trophy data for key and local that gets instantiated for each users data on the page.
 *
 *     var data = new trophies.Data(yootil.user.id())
 *
 * Note:  You need to create an instance for each user.  Trophies already does this for you.
 *
 * @param {Number} user_id
 * @param {Object} data This is the data that comes from the key for the user.
 * @param {Object} local_data This is the local data for the user.
 */

trophies.Data = (function(){

	function Data(user_id, the_data, local_data){

		/**
		 * @property {Number} user_id The user id for this user.
		 */

		this.user_id = user_id;

		/**
		 * @property {Object} data Data object for the user.
		 */

		this.data = {

			d: {},
			t: {}

		};

		/**
		 * @property {Object} local Local data object for the user.
		 */

		this.local = {};

		/**
		 * @property {Object} stats Holds various trophy stats.
		 * @property {Array} stats.earned_trophies All the trophies the user has earned.
		 * @property {Number} stats.total_trophies Total number of trophies earned.
		 * @property {Number} stats.total_points Total trophy points.
		 * @property {Number} stats.current_level Current trophy level.
		 * @property {Number} stats.next_level Next level the user will be.
		 * @property {Number} stats.level_percentage Current level percentage.
		 * @property {Object} stats.cups Holds stats about types of trophies the user has.
		 * @property {Object} stats.cups.total The total cups.
		 * @property {Object} stats.cups.bronze Total bronze trophies earned.
		 * @property {Object} stats.cups.silver Total silver trophies earned.
		 * @property {Object} stats.cups.gold Total gold trophies earned.
		 */

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

		/**
		 * @property {String} error Holds the last error.
		 */

		this.error = "";

		/**
		 * Updates the key data, however you can avoid an actual AJAX request if needed.  Usually this is called internally.
		 *
		 * @param {Boolean} skip_update Pass true if you do not want to perform an actual AJAX update.
		 * @param {Object} callbacks Yootil key options that get passed on to the set method.
		 */

		this.update = function(skip_update, key, data, callbacks){
			if(!skip_update){

				// Lets put in a length check on the data

				if(!yootil.key.has_space(key)){
					this.error = "Data length has gone over it's limit of " + yootil.forum.plugin_max_key_length();

					pb.window.dialog("data_limit", {

						title: "Key Data Limit Reached",
						modal: true,
						height: 200,
						width: 350,
						resizable: false,
						draggable: false,
						html: "Unfortunately we can not save anymore data in the key.<br /><br />Plugin: Trophies - [" + key + "]",

						buttons: {

							Close: function () {
								$(this).dialog("close");
							}

						}

					});

					return;
				}

				yootil.key.set(key, data, this.user_id, callbacks);
			}
		};

		var self = this;

		this.save_to_keys = function(core, packs){

			// Handle core first

			var core_data = {};

			for(var core_trophy in self.data.t){
				if(this.data.t[core_trophy].p == "core"){
					core_data[core_trophy] = {

						t: self.data.t[core_trophy].t

					};
				}
			}

			core_data.d = self.data.d;

			self.update(false, core, core_data);

			// Now packs

			var pack_data = {};

			for(var p in packs){
				if(typeof pack_data[packs[p]] == "undefined"){
					pack_data[packs[p]] = {};
				}

				for(var trophy in this.data){
					if(this.data[trophy].p == packs[p]){
						pack_data[packs[p]][trophy] = {
							t: this.data[trophy].t
						};
					}
				}
			}

			for(var pack in pack_data){
				var the_pack_data = pack_data[pack];

				pack_data
				this.update(false, "trophy_" + pack + "_pack", the_pack_data);
			}
		};

		/**
		 * @class trophies.Data.get
		 * @static
		 * Note:  You need to create an instance.  Trophies already does this for you.
		 *
		 *     var data = new trophies.Data(yootil.user.id());
		 *
		 *     data.get.trophy(34);
		 *
		 */

		this.get = {

			/**
			 * Gets the last error stored in the error property.
			 *
			 * @returns {String}
			 */

			error: function(){
				return self.error;
			},

			/**
			 * Gets the internal data object for this user.
			 *
			 * @returns {Object}
			 */

			data: function(){
				return self.data;
			},

			/**
			 * Gets the internal local data object for this user.
			 *
			 * @returns {Object}
			 */

			local_data: function(){
				return self.local;	
			},

			/**
			 * Gets a trophy the user may have earned.
			 *
			 * @param {Number} id The trophy id to check for.
			 * @returns {Number} Timestamp of when the trophy was earned.
			 */

			trophy: function(id){
				if(id && self.data[id]){
					return self.data[id];
				}
				
				return null;
			},
			
			trophies: function(){
				return self.data;
			},

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
			
		};

		this.remove = {

			// Do we need to update local storage right away??

			trophy: function(id, update_local){
				if(self.data[id]){
					delete self.data[id];
				}

				if(self.local[id]){
					delete self.local[id];
				}

				if(update_local){
					yootil.storage.set("pixeldepth_trophies", self.local, true, true);
				}
			}

		};

		this.set = {

			data: function(data, skip_update, opts, sync){
				self.data = data;
			},
			
			local_data: function(data){
				self.local = data;
				
				for(var id in data){
					if(trophies.exist(id)){
						self.data[id] = {

							t: data[id].t,
							p: data[id].p

						};
					}
				}	
			},
			
			local: {

				// Consider pushing trophy to the data tables??

				trophy: function(trophy){
					self.local[trophy.id] = {
							
						t: (+ new Date()),
						s: 0,
						p: (trophy.pack)? trophy.pack : "core"
							
					};
						
					yootil.storage.set("pixeldepth_trophies", self.local, true, true);
				},
				
				seen: function(trophy_id){
					if(self.local[trophy_id]){
						self.local[trophy_id].s = 1;	
					}
					
					yootil.storage.set("pixeldepth_trophies", self.local, true, true);	
				}
				
			},

			// Need to add to earned trophies array as well.

			trophy: function(id, ts){
				if(!this.data[id]){
					this.data[id] = ts;
				}
			}

		};

		this.clear = {

			local: function(){
				self.local = {};
				yootil.storage.set("pixeldepth_trophies", {}, true, true);
			},

			synced: function(){
				for(var id in self.local){
					if(!trophies.exist(id) || (self.local[id].s == 1 && self.data[id])){
						delete self.local[id];
					}
				}

				yootil.storage.set("pixeldepth_trophies", self.local, true, true);
			}

		};
		
		this.trophy = {
			
			earned: function(trophy){
				if(!self.data[trophy.id]){
					return false;	
				}
				
				return true;
			},

			seen: function(trophy){
				if(self.local[trophy.id]){
					return (self.local[trophy.id].s)? true : false;
				} else if(self.data[trophy.id]){
					return true;
				}
				
				return false;
			}
			
		};

		if(local_data && local_data.constructor == Object){
			this.set.local_data(local_data);
		}

		// Populate the data object by merging core and packs together.

		if(the_data && the_data.data_core){
			for(var t in the_data.data_core){
				this.data[t] = {

					t: the_data.data_core[t].t,
					p: "core"

				}
			}
		}

		// Now handle packs

		if(the_data && the_data.data_pack){
			for(var p in the_data.data_pack){
				for(var t in the_data.data_pack[p]){
					this.data[t] = {

						t: the_data.data_pack[p][t].t,
						p: p

					};
				}
			}
		}

		/*console.log("----")
		console.log(user_id);
		console.log(this.data);
		console.log("----")*/

		if(this.data && this.data.constructor == Object){
			for(var id in this.data){
				if(!trophies.exist(id)){
					delete this.data[id];
					continue;
				}

				if(trophies.list[id] && !trophies.list[id].disabled){
					this.stats.earned_trophies.push(this.data[id]);
					this.stats.total_trophies ++;
					
					switch(trophies.list[id].cup){

						case "bronze" :
							this.stats.total_points += 30;
							this.stats.cups.bronze ++;
							break;
		
						case "silver" :
							this.stats.total_points += 60;
							this.stats.cups.silver ++;
							break;
		
						case "gold" :
							this.stats.total_points += 120;
							this.stats.cups.gold ++;
							break;
							
					}
				}
			}
			
			if(this.stats.total_points > 0){
				for(var level in pixeldepth.trophies.levels){
					if(this.stats.total_points >= trophies.levels[level] && this.stats.total_points < trophies.levels[(parseInt(level) + 1).toString()]){
						this.stats.current_level = level;
						this.stats.next_level = (parseInt(level) + 1);
						break;
					}
				}
			}
			
			var next_level_points = pixeldepth.trophies.levels[this.stats.next_level];
			var points_needed = (next_level_points - this.stats.total_points);
			var pecent = 0;
			
			if(next_level_points){
				percent = ((this.stats.total_points / next_level_points) * 100).toFixed(0);
			}

			if(percent > 100){
				percent = 100;
			}
			
			this.stats.level_percentage = percent;
		}
		
		return this;
	}

	return Data;

})();