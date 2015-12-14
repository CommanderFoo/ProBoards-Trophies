$.extend(trophies, {

	/**
	 * This generates the XP levels.  A very basic way, but seems to work Ok.
	 * Ideally levels should ramp up nicely, but forums have control over the modifier
	 * if they want to make it slower or quicker to progress.
	 */

	generate_xp_levels: function(){
		var levels = [];
		var modifier = this.settings.xp_modifier / 100;
		var max_level = this.settings.max_level;
		var level = 0;
		var base = (this.settings.bronze_xp * 5);
		var total = 0;

		while(level < max_level){
			levels[level] = total;
			total += (!total)? base : Math.ceil(modifier * total);
			level ++;
		}

		this.levels = levels;
	}

});