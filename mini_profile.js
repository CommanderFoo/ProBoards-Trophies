$.extend(trophies, {

	show_in_mini_profile: function(){
		var minis = yootil.get.mini_profiles();

		if(minis && minis.length){
			if(minis.find("div.trophies-mini-profile").length){
				return;
			}

			this.refresh_user_data_table();

			var self = this;

			minis.each(function(){
				var user_link = $(this).find("a.user-link[href*='user']:first");

				if(user_link && user_link.length){
					var user_id_match = user_link.attr("href").match(/\/user\/(\d+)\/?/i);

					if(user_id_match && user_id_match.length == 2){
						var user_id = parseInt(user_id_match[1]);

						if(!user_id){
							return;
						}

						var elem = ($(this).find(".trophies-custom-mini-profile").length == 1)? $(this).find(".trophies-custom-mini-profile") : $(this).find(".info");

						if(elem && elem.length){
							elem.append(self.create_cup_stats(user_id));
						}
					}
				}
			});
		}
	},

	create_cup_stats: function(user_id){
		var data = this.data(user_id);
		var cups_html = "<div class='trophies-mini-profile'>";

		data.calculate_stats();

		cups_html += "<span class='trophies-tiptip' title='Bronze'><img src='" + this.images.bronze + "' /> x " + data.get.stat.cups.bronze() + "</span>";
		cups_html += "<span class='trophies-tiptip' title='Silver'><img src='" + this.images.silver + "' /> x " + data.get.stat.cups.silver() + "</span>";
		cups_html += "<span class='trophies-tiptip' title='Gold'><img src='" + this.images.gold + "' /> x " + data.get.stat.cups.gold() + "</span>";

		cups_html += "</div>";

		return $(cups_html);
	}

});