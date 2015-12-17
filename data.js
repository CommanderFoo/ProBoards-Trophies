trophies.Data = (function(){

	function Data(user_id){

		/**
		 * @property {Number} user_id The user id for this user.
		 */

		this.user_id = user_id;

		/**
		 * @property {Object} trophy_data Data stored in the key.
		 */

		this.trophy_data = {};

		/**
		 * @property {Object} trophy_local_data Data stored in local storage.
		 */

		this.trophy_local_data = {};

		/**
		 * @property {Object} user_trophies Internally used when doing calculations for stats.
		 */

		this.user_trophies = {};

		/**
		 * Holds stats that is populated when they are manually calculated.
		 *
		 * @property {Object} stats
		 * @property {Number} stats.total_trophies
		 * @property {Number} stats.total_points
		 * @property {Number} stats.current_level
		 * @property {Number} stats.next_level
		 * @property {Number} stats.level_percentage
		 * @property {Boolean} stats.maxed
		 *
		 * @property {Object} stats.cups Holds cup stats
		 * @property {Number} stats.cups.total
		 * @property {Number} stats.cups.bronze
		 * @property {Number} stats.cups.silver
		 * @property {Number} stats.cups.gold
		 */

		this.stats = {

			total_trophies: 0,
			total_points: 0,
			current_level: 1,
			next_level: 2,
			level_percentage: 0,
			maxed: false,
			calculated: false,

			cups: {

				total: 0,
				bronze: 0,
				silver: 0,
				gold: 0

			}
		};

		var self = this;

		/**
		 * This can be called at anytime if you need to sync the data from local to the keys.
		 * When this is called, 2 events are triggered.
		 *
		 * Basically what this does, is loop over all packs and checks if there is local data.  If there
		 * is local data, then it merges that into the key data for that pack and clears out the local data.
		 * Then we loop over the packs again, but this time for key data.  Simple.
		 *
		 *
		 * @param {String} hook The hook we are using for this key.
		 * @param {Boolean} skip_key_update We can skip updating the key and sync from local to keys without saving.
		 * @param {Object} callbacks If not hooking, we can use callbacks (see http://yootil.pixeldepth.net/#!/api/yootil.key-method-set).
		 */

		this.sync_to_keys = function(hook, skip_key_update, callbacks){

			/**
			 * Triggers before the data is synced to keys.
			 *
			 * @event trophies.before_syncing
			 */

			$(trophies.events).trigger("trophies.before_syncing", [this, hook]);

			// Update all pack keys with the data and trophies

			if(trophies.packs.length){
				for(var pack in trophies.packs){
					var pack_info = trophies.utils.get.pack(trophies.packs[pack]);

					if(pack_info){

						// First we need to move local trophies to the key

						var _local_data = self.get.local_pack_trophies(pack_info.pack);

						if(_local_data){
							for(var trophy_id in _local_data){
								var the_trophy = trophies.utils.get.trophy(pack_info.pack, trophy_id);

								if(the_trophy){

									// Add to key data

									self.add.trophy(the_trophy, true);

									// Now we need to remove the trophy from local if
									// it has been seen.

									if(_local_data[trophy_id].s){
										self.remove.trophy(the_trophy, true);
									}
								}
							}

							// Now update local storage

							if(pack_info.plugin_key){
								yootil.storage.set(pack_info.plugin_key, self.get.local_pack(pack_info.pack), true, true);
							}
						}

						// Now we need to do key updates

						if(!skip_key_update){

							// Check if we have space, otherwise let the user know and then bail out

							if(!yootil.key.has_space(pack_info.plugin_key)){
								this.error = "Data length has gone over it's limit of " + yootil.forum.plugin_max_key_length();

								pb.window.dialog("data_limit", {

									title: "Key Data Limit Reached",
									modal: true,
									height: 200,
									width: 350,
									resizable: false,
									draggable: false,
									html: "Unfortunately we can not save anymore data in the key.<br /><br />Plugin: Trophies - [" + pack_info.plugin_key + "]",

									buttons: {

										Close: function () {
											$(this).dialog("close");
										}

									}

								});

								return;
							}

							if(hook){
								yootil.key.set_on(pack_info.plugin_key, self.get.pack(pack_info.pack), this.user_id, hook);
							} else {
								yootil.key.set(pack_info.plugin_key, self.get.pack(pack_info.pack), this.user_id, callbacks);
							}
						}
					}
				}
			}


			/**
			 * Triggers after the data is synced to keys.
			 *
			 * @event trophies.after_syncing
			 */

			$(trophies.events).trigger("trophies.after_syncing", [this, hook]);
		};

		/**
		 * Saves just local data for all packs or specific pack.
		 *
		 * @param {String} pack_id Can save a specific pack if needed.
		 */

		this.save_local = function(pack_id, local_data_to_save, sync){
			if(pack_id){
				var pack_info = trophies.utils.get.pack(pack_id);

				if(pack_info && pack_info.plugin_key){
					if(local_data_to_save){
						self.set.local_pack_data(pack_info.pack, local_data_to_save);
					}

					yootil.storage.set(pack_info.plugin_key, self.get.local_pack(pack_info.pack), true, true);
				}
			} else {
				if(trophies.packs.length){
					for(var pack in trophies.packs){
						var pack_info = trophies.utils.get.pack(trophies.packs[pack]);

						if(pack_info && pack_info.plugin_key){
							yootil.storage.set(pack_info.plugin_key, self.get.local_pack(pack_info.pack), true, true);
						}
					}
				}
			}

			if(sync){
				trophies.sync.trigger();
			}
		};

		this.add = {

			/**
			 * Adds data to a pack for key object.
			 *
			 * @param {String} pack
			 * @param {Object} data
			 */

			pack_data: function(pack, data){
				self.trophy_data[pack] = data;
			},

			/**
			 * Adds data to a pack for the local object.
			 *
			 * @param {String} pack
			 * @param {Object} data
			 */

			pack_local_data: function(pack, data){
				self.trophy_local_data[pack] = data;
			},

			/**
			 * Adds a trophy to pack data, local or key data.
			 *
			 * @param {Object} trophy
			 * @param {Boolean} data Pass true to add to key object.
			 * @param {Boolean} local Pass true to add to local data object.
			 */

			trophy: function(trophy, data, local){
				if(trophy && trophy.id && trophy.pack){
					var pack_info = trophies.utils.get.pack(trophy.pack);

					if(pack_info){
						var trophies_key = pack_info.trophies_key;

						if(data){
							self.pack.create(pack_info.pack);
							self.trophy_data[pack_info.pack][trophies_key][trophy.id] = trophy.t || yootil.timestamp();
						}

						if(local){
							self.pack.create(trophy.pack, true);

							if(self.trophy_local_data[trophy.pack] && self.trophy_local_data[trophy.pack][trophies_key]){
								self.trophy_local_data[trophy.pack][trophies_key][trophy.id] = {

										s: 0,
										t: trophy.t || yootil.timestamp()

								};

								if(pack_info.plugin_key){
									yootil.storage.set(pack_info.plugin_key, self.trophy_local_data[pack_info.pack], true, true);
								}
							}
						}
					}
				}
			}

		};

		this.pack = {

			/**
			 * Checks to see if a pack exists.
			 *
			 * @param {String} pack
			 * @param {Boolean} local Check local or key object.
			 * @return {Boolean}
			 */

			exists: function(pack,  local){
				if(!self[((local)? "trophy_local_data" : "trophy_data")][pack]){
					return false;
				}

				return true;
			},

			/**
			 * Creates a new pack object.
			 *
			 * @param {String} pack
			 * @param {Boolean} local Create in local.
			 */

			create: function(pack, local){
				var the_data = self[((local)? "trophy_local_data" : "trophy_data")];

				if(!self.pack.exists(pack, local)){
					the_data[pack] = {};
				}

				var pack_info = trophies.utils.get.pack(pack);

				if(pack_info){
					if(!the_data[pack][pack_info.trophies_key]){
						the_data[pack][pack_info.trophies_key] = {};
					}

					if(!the_data[pack][pack_info.trophies_data_key]){
						the_data[pack][pack_info.trophies_data_key] = {};
					}
				}
			}

		};

		this.get = {

			/**
			 * Gets the key data for all packs.
			 *
			 * @return {Object}
			 */

			data: function(){
				return self.trophy_data;
			},

			/**
			 * Gets the local data for all packs.
			 *
			 * @return {Object}
			 */

			local_data: function(){
				return self.trophy_local_data;
			},

			/**
			 * Gets a pack from the key data.
			 *
			 * @param {String} pack_id
			 * @return {Object}
			 */

			pack: function(pack_id){
				if(self.trophy_data[pack_id]){
					return self.trophy_data[pack_id];
				}

				return null;
			},

			/**
			 * Gets a pack from the local data.
			 *
			 * @param {String} pack_id
			 * @return {Object}
			 */

			local_pack: function(pack_id){
				if(self.trophy_local_data[pack_id]){
					return self.trophy_local_data[pack_id];
				}

				return null;
			},

			/**
			 * Gets the trophies for a pack from the key object.
			 *
			 * @param {String} pack_id
			 * @return {Object}
			 */

			pack_trophies: function(pack_id){
				var pack_info = trophies.utils.get.pack(pack_id);

				if(pack_info){
					if(self.trophy_data[pack_id] && self.trophy_data[pack_id][pack_info.trophies_key]){
						return self.trophy_data[pack_id][pack_info.trophies_key];
					}
				}

				return null;
			},

			/**
			 * Gets the trophies for a pack from the local object.
			 *
			 * @param {String} pack_id
			 * @return {Object}
			 */

			local_pack_trophies: function(pack_id){
				var pack_info = trophies.utils.get.pack(pack_id);

				if(pack_info){
					if(self.trophy_local_data[pack_id] && self.trophy_local_data[pack_id][pack_info.trophies_key]){
						return self.trophy_local_data[pack_id][pack_info.trophies_key];
					}
				}

				return null;
			},

			/**
			 * Gets the custom data for a pack from the key object.
			 *
			 * @param {String} pack_id
			 * @return {Object}
			 */

			pack_data: function(pack_id){
				var pack_info = trophies.utils.get.pack(pack_id);

				if(pack_info){
					if(self.trophy_data[pack_id] && self.trophy_data[pack_id][pack_info.trophies_data_key]){
						return self.trophy_data[pack_id][pack_info.trophies_data_key];
					}
				}

				return {};
			},

			/**
			 * Gets the custom data for a pack from the local object.
			 *
			 * @param {String} pack_id
			 * @return {Object}
			 */

			local_pack_data: function(pack_id){
				var pack_info = trophies.utils.get.pack(pack_id);

				if(pack_info){
					if(self.trophy_local_data[pack_id] && self.trophy_local_data[pack_id][pack_info.trophies_data_key]){
						return self.trophy_local_data[pack_id][pack_info.trophies_data_key];
					}
				}

				return {};
			},

			/**
			 * Gets a trophy.
			 *
			 * @param {Object} trophy
			 * @param {Boolean} local
			 * @param {Boolean} anywhere Gets from local or key.
			 * @return {Object}
			 */

			trophy: function(trophy, local, anywhere){
				var pack_info = trophies.utils.get.pack(trophy.pack);

				if(pack_info){
					if(anywhere){
						if(self.trophy.exists(trophy)){
							if(self.trophy_data[pack_info.pack] && self.trophy_data[pack_info.pack][pack_info.trophies_key] && self.trophy_data[pack_info.pack][pack_info.trophies_key][trophy.id]){
								return self.trophy_data[pack_info.pack][pack_info.trophies_key][trophy.id];
							}
						} else if(self.trophy.exists(trophy, true)){
							if(self.trophy_local_data[pack_info.pack] && self.trophy_local_data[pack_info.pack][pack_info.trophies_key] && self.trophy_local_data[pack_info.pack][pack_info.trophies_key][trophy.id]){
								return self.trophy_local_data[pack_info.pack][pack_info.trophies_key][trophy.id];
							}
						}
					} else {
						if(self.trophy.exists(trophy, local)){
							var where = (local)? self.trophy_local_data : self.trophy_data;

							if(where[pack_info.pack] && where[pack_info.pack][pack_info.trophies_key] && where[pack_info.pack][pack_info.trophies_key][trophy.id]){
								return where[pack_info.pack][pack_info.trophies_key][trophy.id];
							}
						}
					}
				}

				return false;
			},

			stat: {

				/**
				 * Total trophies.
				 *
				 * @return {Number}
				 */

				total_trophies: function(){
					return self.stats.total_trophies;
				},

				/**
				 * Total points / xp.
				 *
				 * @return {Number}
				 */

				total_points: function(){
					return self.stats.total_points;
				},

				/**
				 * Current trophy level.
				 *
				 * @return {Number}
				 */

				current_level: function(){
					return self.stats.current_level;
				},

				/**
				 * Next trophy level.
				 *
				 * @return {Number}
				 */

				next_level: function(){
					return self.stats.next_level;
				},

				/**
				 * Current progress of level.
				 *
				 * @return {Number}
				 */

				level_percentage: function(){
					return self.stats.level_percentage;
				},

				/**
				 * Is the user at max level.
				 *
				 * @return {Boolean}
				 */

				maxed: function(){
					return this.stats.maxed;
				},

				cups: {

					/**
					 * Total bronze trophies earned.
					 *
					 * @return {Number}
					 */

					bronze: function(){
						return self.stats.cups.bronze;
					},

					/**
					 * Total silver trophies earned.
					 *
					 * @return {Number}
					 */

					silver: function(){
						return self.stats.cups.silver;
					},

					/**
					 * Total gold trophies earned.
					 *
					 * @return {Number}
					 */

					gold: function(){
						return self.stats.cups.gold;
					}

				}

			},

			/**
			 * lookup object for this users trophies.
			 *
			 * @return {Object}
			 */

			trophies: function(){
				return self.user_trophies;
			}

		};

		this.set = {

			/**
			 * Sets the trophy data (all packs).
			 *
			 * @param {Object} data
			 */

			data: function(data){
				self.trophy_data = data;
			},

			/**
			 * Sets the local trophy data (all packs).
			 *
			 * @param {Object} data
			 */

			local_data: function(data){
				self.trophy_local_data = data;
			},

			/**
			 * Sets the pack data for key object.
			 *
			 * @param {String} pack_id
			 * @param {Object} data
			 */

			pack: function(pack_id, pack){
				self.trophy_data[pack_id] = pack;
			},

			/**
			 * Sets the pack data for local object.
			 *
			 * @param {String} pack_id
			 * @param {Object} data
			 */

			local_pack: function(pack_id, pack){
				self.trophy_local_data[pack_id] = pack;
			},

			/**
			 * Sets the pack trophies for key object.
			 *
			 * @param {String} pack_id
			 * @param {Object} pack_trophies
			 */

			pack_trophies: function(pack_id, pack_trophies){
				var pack_info = trophies.utils.get.pack(pack_id);

				if(pack_info){
					if(self.trophy_data[pack_id]){
						self.trophy_data[pack_id][pack_info.trophies_key] = pack_trophies;

						return true;
					}
				}

				return null;
			},

			/**
			 * Sets the pack trophies for the local object.
			 *
			 * @param {String} pack_id
			 * @param {Object} pack_trophies
			 */

			local_pack_trophies: function(pack_id, pack_trophies){
				var pack_info = trophies.utils.get.pack(pack_id);

				if(pack_info){
					if(self.trophy_local_data[pack_id]){
						self.trophy_local_data[pack_id][pack_info.trophies_key] = pack_trophies;

						return true;
					}
				}

				return null;
			},

			/**
			 * Sets the pack data for the key object.
			 *
			 * @param {String} pack_id
			 * @param {Object} pack_data
			 */

			pack_data: function(pack_id, pack_data){
				var pack_info = trophies.utils.get.pack(pack_id);

				if(pack_info){
					if(self.trophy_data[pack_id] && self.trophy_data[pack_id][pack_info.trophies_data_key]){
						self.trophy_data[pack_id][pack_info.trophies_data_key] = pack_data;

						return true;
					}
				}

				return null;
			},

			/**
			 * Sets the pack data for the local object.
			 *
			 * @param {String} pack_id
			 * @param {Object} pack_data
			 */

			local_pack_data: function(pack_id, pack_data){
				var pack_info = trophies.utils.get.pack(pack_id);

				if(pack_info){
					if(self.trophy_local_data[pack_id] && self.trophy_local_data[pack_id][pack_info.trophies_data_key]){
						self.trophy_local_data[pack_id][pack_info.trophies_data_key] = pack_data;

						return true;
					}
				}

				return null;
			},

			trophy: {

				/**
				 * Marks a trophy as seen, and updates local storage.
				 *
				 * @param {Object} trophy
				 */

				seen: function(trophy){
					var pack_info = trophies.utils.get.pack(trophy.pack);

					if(pack_info){
						if(self.trophy.exists(trophy, true)){
							if(self.trophy_local_data[trophy.pack] && self.trophy_local_data[trophy.pack][pack_info.trophies_key]){
								self.trophy_local_data[trophy.pack][pack_info.trophies_key][trophy.id].s = 1;
							}
						}

						if(pack_info.plugin_key){
							yootil.storage.set(pack_info.plugin_key, self.trophy_local_data[trophy.pack], true, true);
						}
					}
				}

			}

		};

		this.remove = {

			/**
			 * Removes a trophy.
			 *
			 * @param {Object} trophy
			 * @param {Boolean} local Remove from local, otherwise it will remove from key data.
			 */

			trophy: function(trophy, local){
				var pack_info = trophies.utils.get.pack(trophy.pack);

				if(pack_info){
					if(self.trophy.exists(trophy, local)){
						if(local && self.trophy_local_data[trophy.pack] && self.trophy_local_data[trophy.pack][pack_info.trophies_key]){
							delete self.trophy_local_data[trophy.pack][pack_info.trophies_key][trophy.id];

						} else if(self.trophy_data[trophy.pack] && self.trophy_data[trophy.pack][pack_info.trophies_key]){
							delete self.trophy_data[trophy.pack][pack_info.trophies_key][trophy.id];
						}
					}
				}
			}

		};

		this.clear = {

			/**
			 * Clears everything.
			 *
			 * @param {Boolean} skip_key_update Pass true to not save the keys.
			 * @param {Object} callbacks
			 */

			everything: function(skip_key_update, callbacks, sync){
				for(var pack in trophies.packs){
					var pack_info = trophies.utils.get.pack(trophies.packs[pack]);

					if(pack_info){
						if(pack_info.plugin_key){
							yootil.storage.remove(pack_info.plugin_key);

							self.trophy_data = {};
							self.trophy_local_data = {};
							self.user_trophies = {};

							if(!skip_key_update){
								yootil.key.set(pack_info.plugin_key, {}, this.user_id, callbacks);
							}
						}
					}
				}

				if(sync){
					trophies.sync.trigger();
				}
			}

		};

		this.trophy = {

			/**
			 * Checks to see if a trophy has been earned.
			 *
			 * @param {Object} trophy
			 * @return {Boolean}
			 */

			earned: function(trophy){
				if(self.trophy.exists(trophy) || self.trophy.exists(trophy, true)){
					return true;
				}

				return false;
			},

			/**
			 * Checks to see if a trophy has been seen.
			 *
			 * @param {Object} trophy
			 * @return {Boolean}
			 */

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

			/**
			 * Checks to see if a trophy exists.
			 *
			 * @param {Object} trophy
			 * @param {Boolean} local Check in local instead.
			 * @return {Boolean}
			 */

			exists: function(trophy, local){
				var store = self[((local)? "trophy_local_data" : "trophy_data")];
				var pack_info = trophies.utils.get.pack(trophy.pack);

				if(pack_info){
					if(trophy && store[trophy.pack] && store[trophy.pack][pack_info.trophies_key] && store[trophy.pack][pack_info.trophies_key][trophy.id]){
						return true;
					}
				}

				return false;
			}

		};

		/**
		 * Calculates all the stats for the user.
		 *
		 * @param {Boolean} force_recalculations If you need to recalculate, pass true.
		 */

		this.calculate_stats = function(force_recalculations){
			if(this.stats.calculated && !force_recalculations){
				return;
			}

			for(var pack in this.trophy_data){
				if(trophies.utils.pack.exists(pack)){
					var pack_info = trophies.utils.get.pack(pack);

					if(pack_info){
						if(!this.user_trophies[pack]){
							this.user_trophies[pack] = {};
						}

						for(var trophy in this.trophy_data[pack][pack_info.trophies_key]){
							var the_trophy = {

								id: trophy,
								pack: pack

							};

							if(trophies.utils.trophy.exists(the_trophy)){
								this.user_trophies[pack][trophy] = this.trophy_data[pack][pack_info.trophies_key][trophy];
							}
						}
					}
				}
			}

			for(var pack in this.trophy_local_data){
				if(trophies.utils.pack.exists(pack)){
					var pack_info = trophies.utils.get.pack(pack);

					if(pack_info){
						if(!this.user_trophies[pack]){
							this.user_trophies[pack] = {};
						}

						for(var trophy in this.trophy_local_data[pack][pack_info.trophies_key]){
							var the_trophy = {

								id: trophy,
								pack: pack

							};

							if(trophies.utils.trophy.exists(the_trophy)){
								if(!this.user_trophies[pack][trophy]){
									this.user_trophies[pack][trophy] = this.trophy_local_data[pack][pack_info.trophies_key][trophy];
								}
							}
						}
					}
				}
			}

			for(var pack in this.user_trophies){
				for(var trophy in this.user_trophies[pack]){
					if(!trophies.lookup[pack][trophy] || trophies.lookup[pack][trophy].disabled){
						continue;
					}

					var lookup_trophy = trophies.lookup[pack][trophy];

					this.stats.total_trophies ++;

					switch(lookup_trophy.cup){

						case "bronze" :
							this.stats.total_points += trophies.settings.bronze_xp;
							this.stats.cups.bronze ++;
							break;

						case "silver" :
							this.stats.total_points += trophies.settings.silver_xp;
							this.stats.cups.silver ++;
							break;

						case "gold" :
							this.stats.total_points += trophies.settings.gold_xp;
							this.stats.cups.gold ++;
							break;

					}
				}
			}

			if(this.stats.total_points > 0){
				if(this.stats.total_points > trophies.levels[trophies.levels.length - 1]){
					this.stats.current_level = trophies.levels.length;
					this.stats.next_level = this.stats.current_level + 1;

					this.stats.maxed = true;
				} else {
					for(var i = 0, l = trophies.levels.length; i < l; i ++){
						if(this.stats.total_points >= trophies.levels[i] && this.stats.total_points < trophies.levels[i + 1]){
							this.stats.current_level = i + 1;
							this.stats.next_level = this.stats.current_level + 1;

							break;
						}
					}
				}
			}

			var percentage = 0;

			if(!this.stats.maxed){
				var next_level_points = trophies.levels[this.stats.next_level - 1];
				var current_level_points = trophies.levels[this.stats.current_level - 1];
				var points_so_far = (this.stats.total_points % current_level_points) || this.stats.total_points;
				var diff = (next_level_points % current_level_points) || next_level_points;

				if(next_level_points){
					percentage = ((points_so_far / diff) * 100).toFixed(0);
				}

				if(percentage > 100){
					percentage = 100;
				}
			} else {
				percentage = 100;
			}

			this.stats.level_percentage = percentage;
			this.stats.calculated = true;
		}
	}

	return Data;

})();