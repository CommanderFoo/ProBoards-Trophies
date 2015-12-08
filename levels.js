$.extend(trophies, {

	generate_xp_levels: function(){
		var levels = [];
		var modifier = this.settings.xp_modifier;
		var max_level = this.settings.max_level;
		var level = 0;

		while(level < max_level){
			levels[level] = Math.floor(((level * 30) * (level * modifier)));
			level ++;
		}

		this.levels = levels;
	}

});