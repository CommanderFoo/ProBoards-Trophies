trophies.Data = (function(){

	function Data(user_id, data, local_data){
		this.user_id = user_id;
		this.data = data || {};
		this.local = {};		
		
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

		this.error = "";

		this.update = function(skip_update, options, sync){
			if(!skip_update){

				// Lets put in a length check on the data so we can get a reason why
				// the data was not updated.

				if(JSON.stringify(this.data).length > proboards.data("plugin_max_key_length")){
					this.error = "Data length has gone over it's limit of " + proboards.data("plugin_max_key_length");
				}

				// No need to stop update if limit has been reached, ProBoards should handle this
				// for us and stop the update of the key.

				var key_obj = proboards.plugin.key(trophies.KEY);

				if(key_obj){
					key_obj.set(this.user_id, this.data, options);

					if(sync){
						//trophies.sync.trigger();
					}
				}
			}
		};

		var self = this;

		this.get = {

			data: function(){
				return self.data;
			},
			
			local_data: function(){
				return self.local;	
			},
			
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

		this.set = {

			data: function(data, skip_update, opts, sync){
				self.data = data;
				self.update(skip_update, opts, sync);
			},
			
			local_data: function(data){
				self.local = data;
				
				for(var id in data){
					self.data[id] = data[id];	
				}	
			},
			
			local: {
				
				trophy: function(trophy){
					self.local[trophy.id] = {
							
						t: (+ new Date()),
						s: 0
							
					};
						
					yootil.storage.set("pixeldepth_trophies", self.local, true, true);
				},
				
				seen: function(trophy_id){
					if(self.local[trophy_id]){
						self.local[trophy_id].s = 1;	
					}
					
					yootil.storage.set("pixeldepth_trophies", self.local, true, true);	
				}
				
			}

		};

		this.clear = {

			data: function(skip_update, opts, sync){
				self.data = {};
				self.update(skip_update, opts, sync);
			}

		};
		
		this.trophy = {
			
			earned: function(trophy){
				if(!self.data[trophy.id]){
					return false;	
				}
				
				return true;
			}
			
		};
		
		this.has = {
		
			seen: function(trophy){
				if(self.data[trophy.id]){
					return (self.data[trophy.id].s)? true : false;
				}
				
				return false;
			}	
			
		};

		if(local_data && local_data.constructor == Object){	
			this.set.local_data(local_data);
		}
		
		if(this.data && this.data.constructor == Object){
			for(var id in this.data){
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