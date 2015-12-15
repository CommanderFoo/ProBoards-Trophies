$.extend(trophies, {

	/**
	 * Creates a tab on the profile.
	 */

	create_tab: function(){
		var active = (location.href.match(/\/user\/\d+\/trophies/i))? true : false;
		var first_box = $("form.form_user_status .content-box:first");
		var custom = $("#trophies-custom-profile");

		if(first_box.length || custom.length == 1){

			// We might be looking at a members profile, so try and get the
			// member id first.

			var the_user = yootil.page.member.id() || yootil.user.id();

			// This is not done on every page, we do this manually, otherwise
			// it's a waste doing it for no reason.

			this.data(the_user).calculate_stats();

			var trophy_stats = yootil.create.profile_content_box();
			var stats_html = (this.settings.show_stats_on_profile || active)? this.create_trophy_stats() : "";

			if(stats_html.length){
				trophy_stats.html(stats_html);
			}

			// If not active, then we are on the profile
			// summary and not the actual full trophy page.

			if(!active){
				var quick_list = null;

				// Check if we need to show the quick list of trophies

				if(this.settings.show_trophies_on_profile){
					var quick_list_html = this.build_quick_trophy_list();
					var trophy_quick_list = yootil.create.profile_content_box().addClass("trophies-quick-list");

					if(quick_list_html.length){
						quick_list = trophy_quick_list;
						trophy_quick_list.html(quick_list_html);

					//	if(yootil.user.id() == yootil.page.member.id()){
					//		trophy_quick_list.insertAfter(first_box);
					//	} else {
							if(custom.length){
								custom.append(trophy_quick_list);
							} else {
								trophy_quick_list.insertBefore(first_box);
							}
					//	}
					}
				}

				if(stats_html){
					if(quick_list){
						trophy_stats.insertBefore(quick_list);
					//} else if(yootil.user.id() == yootil.page.member.id()){
						//trophy_stats.insertAfter(first_box);
					} else {
						if(custom.length){
							custom.append(trophy_quick_list);
						} else {
							trophy_stats.insertBefore(first_box);
						}
					}
				}
			} else {
				trophy_stats.appendTo($("form.form_user_status").parent());

				var trophy_list = yootil.create.profile_content_box();

				if(this.packs.length > 1){
					if(this.settings.show_pack_tabs){
						this.create_pack_tabs();
					}

					trophy_list.addClass("trophies-content-box-list")
				}

				trophy_list.html(this.build_trophy_list()).appendTo($("form.form_user_status").parent());
			}

			if(stats_html){
				this.setup_animations(the_user, active);
			}

			yootil.create.profile_tab("Trophies", "trophies", active);
		}
	},

	/**
	 * Some fun animations of the stats while the page is loading to give
	 * the user that feeling the numbers are being crunched and worked out.
	 *
	 * @param {Number} user_id
	 * @param {Boolean} active If true, then on the trophies page, speed up animations
	 */

	setup_animations: function(the_user, active){

		// Handle basic stats

		var spans = $(".trophy-table .trophy-cell span[id^=trophies-][data-value]");

		var interval = setInterval(function(){
			spans.each(function(){
				var num = Math.floor(Math.random() * 9);

				$(this).html(num);
			});
		}, 100);

		// Handle bar

		$(".trophy-stats-progress-highlight").animate({

			width: trophies.data(the_user).get.stat.level_percentage() + "%"

		}, ((active)? this.settings.stats_animation_speed_page : this.settings.stats_animation_speed_profile), $.easeOutCirc, function(){
			clearInterval(interval);

			spans.each(function(){
				$(this).text($(this).attr("data-value"));
			});

			$(".trophy-stats-progress-highlight").attr("title", trophies.data(the_user).get.stat.level_percentage() + "%");
		});
	},

	/**
	 * If there are other packs apart from the core, then we want to show the
	 * pack tab so users can quickly filter trophies.
	 */

	create_pack_tabs: function(){
		var the_packs = this.packs;
		var tabs_html = '<div class="trophies-pack-tabs ui-tabMenu"><ul class="ui-helper-clearfix">';

		// Add an "All" tab and make it the first active one

		tabs_html += '<li title="All trophies" class="ui-active trophies-tiptip" id="trophy_pack_tab__all__"><a href="#">All</a></li>';

		the_packs.sort();

		for(var index in the_packs){
			var pack_info= this.utils.get.pack(the_packs[index]);

			if(pack_info){
				tabs_html += '<li title="' + pack_info.description + '" class="trophies-tiptip" id="trophy_pack_tab_' + pack_info.pack + '"><a href="#">' + pack_info.name + '</a></li>';
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

	/**
	 * Handles showing and hiding of trophies when switching between tabs.
	 *
	 * @param {Object} li The tab being clicked on that has the data (id attr)
	 */

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

	/**
	 * Handles building the full trophy list for the trophy page.
	 *
	 * @return {String}
	 */

	build_trophy_list: function(){
		var trophy_list = "";
		var counter = 0;
		var time_24 = (yootil.user.time_format() == "12hr")? false : true;
		var the_user = yootil.page.member.id() || yootil.user.id();
		var list = this.utils.get.all_trophies(the_user, true);

		// The list is every trophy available, not earned by the user.

		for(var trophy in list){
			if(trophy.disabled){
				continue;
			}

			// Check if it has been earned.

			var has_earned = (this.data(the_user).trophy.earned(list[trophy]))? true : false;

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
			var big_cup_img = "<img class='trophies-tiptip' src='" + yootil.html_encode(cup_big) + "' title='" + alt + "' alt='" + alt + "' />";
			var small_cup_img = "<img class='trophies-tiptip' src='" + yootil.html_encode(cup_small) + "' title='" + alt + "' alt='" + alt + "' />";

			if(has_earned){
				var user_trophy = this.data(the_user).get.trophy(list[trophy], false, true);

				date_str = this.get_trophy_date_str(user_trophy, time_24);
			}

			// Details for staff

			var title = "";

			if(yootil.user.is_staff() && this.settings.show_details){
				title = "Trophy Pack Name: " + list[trophy].pack_name + "<br />Trophy Pack ID: " + list[trophy].pack + "<br />Trophy ID: " + list[trophy].id;
			}

			trophy_list += "<div class='trophy-list-trophy" + opacity + "' data-pack='" + list[trophy].pack + "'>";
			trophy_list += "<div class='trophy-list-trophy-img'><img class='trophies-tiptip' title='" + title + "' src='" + trophy_img + "' /></div>";
			trophy_list += "<div class='trophy-list-trophy-title-desc'>";
			trophy_list += "<div class='trophy-list-trophy-title'><span class='trophy-list-trophy-title-cup'>" + small_cup_img + "</span> <strong>" + list[trophy].title + "</strong></div>";
			trophy_list += "<div class='trophy-list-trophy-desc'>" + list[trophy].description + ".</div></div>";
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

	/**
	 * Creates the date string for when the trophy was earned.
	 *
	 * @param {Object} user_trophy The earned trophy to build the date from.
	 * @param {Boolean} time_24 User setting for 24 hour time or not.
	 * @return {String}
	 */

	get_trophy_date_str: function(user_trophy, time_24){
		var str = "";

		if(this.settings.show_date){
			if(user_trophy){
				var date = new Date(user_trophy.t || user_trophy);
				var day = date.getDate() || 1;
				var month = yootil.month(date.getMonth(), true);
				var year = date.getFullYear();
				var hours = date.getHours();
				var mins = date.getMinutes();
				var am_pm = "";

				mins = (mins < 10)? "0" + mins : mins;
				str = "Earned on, " + day + yootil.suffix(day) + " of " + month + ", " + year;

				if(this.settings.show_time){
					if(!time_24){
						am_pm = (hours > 11)? "pm" : "am";
						hours = hours % 12;
						hours = (hours)? hours : 12;
					}

					str += ", at " + hours + ":" + mins + am_pm;
				}
			}
		}

		return str;
	},

	/**
	 * Creates the trophy stats.  This shows on the profile and
	 * the full trophy page.
	 *
	 * @return {String}
	 */

	create_trophy_stats: function(){
		var data = this.data(yootil.page.member.id() || yootil.user.id());
		var html = "";

		html += "<div class='trophy-table'>";
			html += "<div class='trophy-row'>";
				html += "<div class='trophy-cell'>";
					html += "<div class='trophy-table'>";
						html += "<div class='trophy-row trophy-stats'>";
							html += "<div class='trophy-cell'><h4>Level</h4><span id='trophies-level' class='trophies-tiptip' title='Current level' data-value='" + data.get.stat.current_level() + "'>0</span></div>";
							html += "<div class='trophy-cell'><h4>Progress</h4><span class='trophies-tiptip' title='Progress of current level'><span id='trophies-progress' data-value='" + data.get.stat.level_percentage() + "'>0</span>%</span></div>";
							html += "<div class='trophy-cell'><h4>Trophies</h4><span id='trophies-total-trophies' class='trophies-tiptip' title='Total trophies earned' data-value='" + data.get.stat.total_trophies() + "'>0</span></div>";
							html += "<div class='trophy-cell'><h4>Bronze</h4><span class='trophies-tiptip' title='Total bronze trophies earned'><span id='trophies-total-bronze' data-value='" + data.get.stat.cups.bronze() + "'>0</span><img src='" + this.images.bronze + "' /></span></div>";
							html += "<div class='trophy-cell'><h4>Silver</h4><span class='trophies-tiptip' title='Total silver trophies earned'><span id='trophies-total-silver' data-value='" + data.get.stat.cups.silver() + "'>0</span><img src='" + this.images.silver + "' /></span></div>";
							html += "<div class='trophy-cell'><h4>Gold</h4><span class='trophies-tiptip' title='Total gold trophies earned'><span id='trophies-total-gold' data-value='" + data.get.stat.cups.gold() + "'>0</span><img src='" + this.images.gold + "' /></span></div>";
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
									html += "<div class='trophy-stats-current-level'>Level <span id='trophies-current-level' data-value='" + data.get.stat.current_level() + "'>0</span></div>";
									html += "<div class='trophy-stats-next-level'>Next <span id='trophies-next-level' data-value='" + data.get.stat.next_level() + "'>0</span></div>";
									html += "<br style='clear: both' />";
								html += "</div>";
								html += "<div class='trophy-stats-progress-bar'>";
									html += "<div class='trophy-stats-progress-highlight trophies-tiptip' style='width: 0%;'>&nbsp;</div>";
								html += "</div>";
							html += "</div>";
							html += "<div class='trophy-cell'> &nbsp; </div>";
						html += "</div>";
					html += "</div>";
				html += "</div>";
			html += "</div>";
		html += "</div>";

		return html;
	},

	/**
	 * Builds a quick trophy list for the profile page to show which
	 * trophies the user has earned.
	 *
	 * @return {String}
	 */

	build_quick_trophy_list: function(){
		var html = "";

		var the_user = yootil.page.member.id() || yootil.user.id();
		var list = this.utils.get.all_trophies(the_user, true);
		var has_trophies = false;
		var time_24 = (yootil.user.time_format() == "12hr")? false : true;

		for(var trophy in list){
			if(trophy.disabled){
				continue;
			}

			var has_earned = (this.data(the_user).trophy.earned(list[trophy]))? true : false;

			if(has_earned){
				var trophy_img = (has_earned)? this.utils.fetch_image(list[trophy]) : this.images["locked"];
				var title = "";
				var user_trophy = this.data(the_user).get.trophy(list[trophy], false, true);
				var date_str = this.get_trophy_date_str(user_trophy, time_24);

				title += list[trophy].description;

				if(date_str){
					title += "<br />" + date_str;
				}

				if(yootil.user.is_staff() && this.settings.show_details){
					title += "<br /><br />Trophy Pack Name: " + list[trophy].pack_name + "<br />Trophy Pack ID: " + list[trophy].pack + "<br />Trophy ID: " + list[trophy].id;
				}

				html += "<img class='trophies-tiptip' title='" + title + "' data-pack='" + list[trophy].pack + "' src='" + trophy_img + "' />";
				has_trophies = true;
			}
		}

		return html;
	}

});