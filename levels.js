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
		var base = (this.settings.bronze_xp * 2);
		var total = 0;

		while(level < max_level){
			levels[level] = total;

			var xp = ((this.settings.bronze_xp * 2) + this.settings.silver_xp + this.settings.gold_xp);
			var additional = (total * .15);

			total += (!total)? base : Math.ceil((xp + additional) * modifier);
			level ++;
		}

		this.levels = levels;
	}

});