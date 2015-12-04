$.extend(trophies, {

	create_tab: function(){
		var active = (location.href.match(/\/user\/\d+\/trophies/i))? true : false;
		var first_box = $("form.form_user_status .content-box:first");

		if(first_box.length){
			this.data(yootil.page.member.id() || yootil.user.id()).calculate_stats();

			var trophy_stats = yootil.create.profile_content_box();
			var trophy_list = yootil.create.profile_content_box();
			var stats_html = (this.settings.show_on_profile)? this.create_trophy_stats() : "";

			if(stats_html.length){
				trophy_stats.html(stats_html);
			}

			if(!active){
				if(this.settings.show_on_profile){
					if(yootil.user.id() == yootil.page.member.id()){
						trophy_stats.insertAfter(first_box);
					} else{
						trophy_stats.insertBefore(first_box);
					}
				}
			} else {
				trophy_stats.appendTo($("form.form_user_status").parent());
				trophy_list.html(this.build_trophy_list()).appendTo($("form.form_user_status").parent());
			}

			yootil.create.profile_tab("Trophies", "trophies", active);
		}
	},

	build_trophy_list: function(){
		var trophy_list = "";
		var counter = 0;
		var time_24 = (yootil.user.logged_in() && yootil.user.time_format() == "12hr")? false : true;
		var the_user = yootil.page.member.id() || yootil.user.id();
		var list = this.utils.get.all_trophies(the_user);

		console.log(list);

		/*for(var id in this.list){
			var trophy = this.list[id];

			if(trophy.disabled){
				continue;
			}

			var has_earned = (yootil.user.logged_in() && this.data(the_user).trophy.earned(trophy))? true : false;
			var cup_big = this.images.bronze_big;
			var cup_small = this.images.bronze;
			var trophy_img = (has_earned)? this.utils.fetch_image(trophy) : this.images["locked"];
			var alt = "Bronze";
			var first = (!counter)? " trophy-list-trophy-first" : "";
			var opacity = (has_earned)? "" : " trophy-list-trophy-not-earned";

			switch(trophy.cup){

				case "silver" :
					cup_big = this.images.silver_big;
					cup_small = this.images.silver;
					alt = "Silver";

					break;

				case "gold" :
					cup_big = this.images.gold_big;
					cup_small = this.images.gold;
					alt = "Gold";

					break;

			}

			var date_str = "";
			var the_trophy = this.data(the_user).get.trophy(id);

			if(the_trophy && the_trophy.t && has_earned){
				var date = new Date(the_trophy.t);
				var day = date.getDate() || 1;
				var month = this.months[date.getMonth()];
				var year = date.getFullYear();
				var hours = date.getHours();
				var mins = date.getMinutes();
				var am_pm = "";

				mins = (mins < 10)? "0" + mins : mins;
				date_str = "Earned on " + day + this.utils.get_suffix(day) + " of " + month + ", " + year;

				if(!time_24){
					am_pm = (hours > 11)? "pm" : "am";
					hours = hours % 12;
					hours = (hours)? hours : 12;
				}

				date_str += ", at " + hours + ":" + mins + am_pm;
			}

			var big_cup_img = "<img src='" + yootil.html_encode(cup_big) + "' title='" + alt + "' alt='" + alt + "' />";
			var small_cup_img = "<img src='" + yootil.html_encode(cup_small) + "' title='" + alt + "' alt='" + alt + "' />";

			var title = "";

			if(this.settings.show_id){
				title = "title='Trophy ID: " + id + "' ";
			}

			trophy_list += "<div class='trophy-list-trophy" + first + opacity + "'>";
			trophy_list += "<div class='trophy-list-trophy-img'><img " + title + "src='" + trophy_img + "' /></div>";
			trophy_list += "<div class='trophy-list-trophy-title-desc'>";
			trophy_list += "<div class='trophy-list-trophy-title'><span class='trophy-list-trophy-title-cup'>" + small_cup_img + "</span> <strong>" + yootil.html_encode(trophy.title) + "</strong></div>";
			trophy_list += "<div class='trophy-list-trophy-desc'>" + yootil.html_encode(trophy.description) + ".</div></div>";
			trophy_list += "<div class='trophy-list-trophy-big-cup'>" + big_cup_img + "</div>";
			trophy_list += "<div class='trophy-list-trophy-earned-date'>" + date_str + "</div>";
			trophy_list += "<br style='clear: both' /></div>";

			counter ++;
		}*/

		if(!trophy_list.length){
			var to_user = (yootil.user.id() == yootil.page.member.id())? "You have" : (yootil.page.member.name() + " has");

			trophy_list = "<div class='trophies-list-profile trophies-list-none'>" + yootil.html_encode(to_user, true) + " not earned any trophies.</div>";
		}

		return trophy_list;
	},

	create_trophy_stats: function(){
		var data = this.data(yootil.page.member.id());
		var html = "";

		html += "<div class='trophy-stats-wrapper'>";
		html += "<div class='trophy-stats-big-cup'><img src='" + this.images.trophy_level + "' /></div>";
		html += "<div class='trophy-stats-level-wrapper'><strong>Level</strong><br /><strong class='trophy-stats-level'>" + data.get.stat.current_level() + "</strong></div>";
		html += "<div class='trophy-stats-percent-wrapper'><div class='trophy-stats-percent-bar-wrapper'><div class='trophy-stats-percent-bar' style='width: " + data.get.stat.level_percentage() + "%;'> </div></div></div>";
		html += "<div class='trophy-stats-total-cups-wrapper'><ul>";
		html += "<li class='trophy-stats-cup-bronze-img'><img src='" + this.images.bronze + "' /></li>";
		html += "<li class='trophy-stats-cup-bronze-total'>" + data.get.stat.cups.bronze() + "</li>";
		html += "<li class='trophy-stats-cup-spacer'> </li>";
		html += "<li class='trophy-stats-cup-silver-img'><img src='" + this.images.silver + "' /></li>";
		html += "<li class='trophy-stats-cup-silver-total'>" + data.get.stat.cups.silver() + "</li>";
		html += "<li class='trophy-stats-cup-spacer'> </li>";
		html += "<li class='trophy-stats-cup-gold-img'><img src='" + this.images.gold + "' /></li>";
		html += "<li class='trophy-stats-cup-gold-total'>" + data.get.stat.cups.gold() + "</li>";
		html += "</ul><br style='clear: both' /></div>";
		html += "<div class='trophy-stats-total-trophies-wrapper'><strong>Trophies</strong><br /><strong class='trophy-stats-total-trophies'>" + data.get.stat.total_trophies() + "</strong></div>";
		html += "</div>";

		return html;
	}

});