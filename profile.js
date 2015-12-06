$.extend(trophies, {

	create_tab: function(){
		var active = (location.href.match(/\/user\/\d+\/trophies/i))? true : false;
		var first_box = $("form.form_user_status .content-box:first");

		if(first_box.length){
			this.data(yootil.page.member.id() || yootil.user.id()).calculate_stats();

			var trophy_stats = yootil.create.profile_content_box();
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

				var trophy_list = yootil.create.profile_content_box();

				if(this.packs.length > 1){
					this.create_pack_tabs();
					trophy_list.addClass("trophies-content-box-list")
				}

				trophy_list.html(this.build_trophy_list()).appendTo($("form.form_user_status").parent());
			}

			yootil.create.profile_tab("Trophies", "trophies", active);
		}
	},

	create_pack_tabs: function(){
		var tabs_html = '<div class="trophies-pack-tabs ui-tabMenu"><ul class="ui-helper-clearfix">';

		// Add an "All" tab and make it the first active one

		tabs_html += '<li title="All trophies" class="ui-active trophies-tiptip" id="trophy_pack_tab__all__"><a href="#">All</a></li>';

		for(var index in this.packs){
			var pack_info= this.utils.get.pack(this.packs[index]);

			if(pack_info){
				tabs_html += '<li title="' + yootil.html_encode(pack_info.desc) + '" class="trophies-tiptip" id="trophy_pack_tab_' + yootil.html_encode(pack_info.pack) + '"><a href="#">' + yootil.html_encode(pack_info.name) + '</a></li>';
			}
		}

		tabs_html += "</ul><br style='clear: both' /></div>";

		tabs_html = $(tabs_html);

		tabs_html.find("a").click(function(){
			trophies.switch_trophy_pack_list($(this).parent());
			return false;
		});

		tabs_html.appendTo($("form.form_user_status").parent());
	},

	switch_trophy_pack_list: function(li){
		var pack_id = li.attr("id").split("trophy_pack_tab_")[1];
		var all_lis = li.parent().children();

		// remove active class

		all_lis.each(function(){
			$(this).removeClass("ui-active");
		});

		// Now add it to the one clicked.

		li.addClass("ui-active");

		// If the pack id is __all__, then show all trophies in the list.

		if(pack_id == "_all__"){
			$("div.trophy-list-trophy").show();
		} else {
			$("div.trophy-list-trophy[data-pack=" + pack_id + "]").show();
			$("div.trophy-list-trophy:not([data-pack=" + pack_id + "])").hide();
		}

	},

	build_trophy_list: function(){
		var trophy_list = "";
		var counter = 0;
		var time_24 = (yootil.user.logged_in() && yootil.user.time_format() == "12hr")? false : true;
		var the_user = yootil.page.member.id() || yootil.user.id();
		var list = this.utils.get.all_trophies(the_user);

		for(var trophy in list){
			if(trophy.disabled){
				continue;
			}

			var has_earned = (yootil.user.logged_in() && this.data(the_user).trophy.earned(list[trophy]))? true : false;
			var cup_big = this.images.bronze_big;
			var cup_small = this.images.bronze;
			var trophy_img = (has_earned)? this.utils.fetch_image(list[trophy]) : this.images["locked"];
			var alt = "Bronze";
			var first = (!counter)? " trophy-list-trophy-first" : "";
			var opacity = (has_earned)? "" : " trophy-list-trophy-not-earned";

			switch(list[trophy].cup){

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
			var user_trophy = this.data(the_user).get.trophy(list[trophy], false, true);
			var title = "";
			var big_cup_img = "<img class='trophies-tiptip' src='" + yootil.html_encode(cup_big) + "' title='" + alt + "' alt='" + alt + "' />";
			var small_cup_img = "<img class='trophies-tiptip' src='" + yootil.html_encode(cup_small) + "' title='" + alt + "' alt='" + alt + "' />";

			if(user_trophy && user_trophy.t && has_earned){
				var date = new Date(user_trophy.t);
				var day = date.getDate() || 1;
				var month = yootil.month(date.getMonth(), true);
				var year = date.getFullYear();
				var hours = date.getHours();
				var mins = date.getMinutes();
				var am_pm = "";

				mins = (mins < 10)? "0" + mins : mins;
				date_str = "Earned on " + day + yootil.suffix(day) + " of " + month + ", " + year;

				if(!time_24){
					am_pm = (hours > 11)? "pm" : "am";
					hours = hours % 12;
					hours = (hours)? hours : 12;
				}

				date_str += ", at " + hours + ":" + mins + am_pm;
				title = "Trophy Earned";
			} else {
				title = "Trophy Not Earned";
			}

			// Details for staff

			if(yootil.user.is_staff() && this.settings.show_details){
				title += "<br />Trophy Pack: " + list[trophy].pack + "<br />Trophy ID: " + list[trophy].id;
			}

			trophy_list += "<div class='trophy-list-trophy" + opacity + "' data-pack='" + yootil.html_encode(list[trophy].pack) + "'>";
			trophy_list += "<div class='trophy-list-trophy-img'><img class='trophies-tiptip' title='" + title + "' src='" + trophy_img + "' /></div>";
			trophy_list += "<div class='trophy-list-trophy-title-desc'>";
			trophy_list += "<div class='trophy-list-trophy-title'><span class='trophy-list-trophy-title-cup'>" + small_cup_img + "</span> <strong>" + yootil.html_encode(list[trophy].title) + "</strong></div>";
			trophy_list += "<div class='trophy-list-trophy-desc'>" + yootil.html_encode(list[trophy].description) + ".</div></div>";
			trophy_list += "<div class='trophy-list-trophy-big-cup'>" + big_cup_img + "</div>";
			trophy_list += "<div class='trophy-list-trophy-earned-date'>" + date_str + "</div>";
			trophy_list += "<br style='clear: both' /></div>";

			counter ++;
		}

		// If there are no trophies, then show something.

		if(!trophy_list.length){
			var to_user = (yootil.user.id() == yootil.page.member.id())? "You have" : (yootil.page.member.name() + " has");

			trophy_list = "<div class='trophies-list-profile trophies-list-none'>" + yootil.html_encode(to_user, true) + " not earned any trophies.</div>";
		}

		return trophy_list;
	},

	// This appears on the trophy page and the profile page

	create_trophy_stats: function(){
		var data = this.data(yootil.page.member.id());
		var html = "";

		html += "<div class='trophy-table'>";
			html += "<div class='trophy-row'>";
				html += "<div class='trophy-cell'>";
					html += "<div class='trophy-table'>";
						html += "<div class='trophy-row trophy-stats'>";
							html += "<div class='trophy-cell'><h4>Level</h4><span class='trophies-tiptip' title='Current level'>" + data.get.stat.current_level() + "</span></div>";
							html += "<div class='trophy-cell'><h4>Progress</h4><span class='trophies-tiptip' title='Progress of current level'>" + data.get.stat.level_percentage() + "%</span></div>";
							html += "<div class='trophy-cell'><h4>Trophies</h4><span class='trophies-tiptip' title='Total trophies earned'>" + data.get.stat.total_trophies() + "</span></div>";
							html += "<div class='trophy-cell'><h4>Bronze</h4><span class='trophies-tiptip' title='Total bronze trophies earned'>" + data.get.stat.cups.bronze() + "<img src='" + this.images.bronze + "' /></span></div>";
							html += "<div class='trophy-cell'><h4>Silver</h4><span class='trophies-tiptip' title='Total silver trophies earned'>" + data.get.stat.cups.silver() + "<img src='" + this.images.silver + "' /></span></div>";
							html += "<div class='trophy-cell'><h4>Gold</h4><span class='trophies-tiptip' title='Total gold trophies earned'>" + data.get.stat.cups.gold() + "<img src='" + this.images.gold + "' /></span></div>";
						html += "</div>";
					html += "</div>";
				html += "</div>";
			html += "</div>";
			html += "<div class='trophy-row'>";
				html += "<div class='trophy-cell'>";
					html += "<div class='trophy-table'>";
						html += "<div class='trophy-row'>";
							html += "<div class='trophy-cell'> &nbsp; </div>";
							html += "<div class='trophy-cell'>";
								html += "<div class='trophy-stats-level-info'>";
									html += "<div class='trophy-stats-current-level'>Level " + data.get.stat.current_level() + "</div>";
									html += "<div class='trophy-stats-next-level'>Next " + data.get.stat.next_level() + "</div>";
									html += "<br style='clear: both' />";
								html += "</div>";
								html += "<div class='trophy-stats-progress-bar'>";
									html += "<div class='trophy-stats-progress-highlight' style='width: " + data.get.stat.level_percentage() + "%;'>&nbsp;</div>";
								html += "</div>";
							html += "</div>";
							html += "<div class='trophy-cell'> &nbsp; </div>";
						html += "</div>";
					html += "</div>";
				html += "</div>";
			html += "</div>";
		html += "</div>";

		return html;
	}

});