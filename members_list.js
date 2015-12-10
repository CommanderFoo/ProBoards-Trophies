$.extend(trophies, {

	show_in_members_list: function(page_ran){
		if($("td[class^=trophies-members-list]").length){
			return;
		}

		if(!page_ran){
			this.refresh_user_data_table();
		}

		var self = this;
		var table = $("div.content.cap-bottom table.list");

		if(table.find("th.trophies-members-list-th").length == 0){
			$("<th class='trophies-members-list-th sortable'>Trophies</th>").insertAfter(table.find("tr.head th.posts"));
		}

		table.find("tr.member[id=*member]").each(function(){
			if(this.id.match(/^member\-(\d+)/i)){
				var user_id = RegExp.$1;
				var data = self.data(user_id);

				data.calculate_stats();

				var cups_html = "";

				cups_html += "<span class='trophies-tiptip' title='Bronze'><img src='" + self.images.bronze + "' /> x " + data.get.stat.cups.bronze() + "</span>";
				cups_html += "<span class='trophies-tiptip' title='Silver'><img src='" + self.images.silver + "' /> x " + data.get.stat.cups.silver() + "</span>";
				cups_html += "<span class='trophies-tiptip' title='Gold'><img src='" + self.images.gold + "' /> x " + data.get.stat.cups.gold() + "</span>";

				var td = $("<td class=\"trophies-members-list-cups\">" + cups_html + "</td>");

				td.insertAfter($(this).find("td.posts"));
			}
		});
	}

});