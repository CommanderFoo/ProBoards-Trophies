$.extend(trophies, {

	show_in_members_list: function(){
		if($("td[class^=trophies-members-list]").length){
			return;
		}

		this.refresh_user_data_table();

		var self = this;
		var table = $("div.content.cap-bottom table.list");

		if(table.find("th.trophies-members-list-th").length == 0){
			$("<th class=\"trophies-members-list-th sortable\" style=\"width: 11%\">Trophies</th>").insertAfter(table.find("tr.head th.posts"));
		}

		table.find("tr.member[id=*member]").each(function(){
			if(this.id.match(/^member\-(\d+)/i)){
				var user_id = RegExp.$1;
				var data = self.data(user_id);

				data.calculate_stats();

				var cups_html = "";

				cups_html += "<span class='trophies-tiptip' title='Bronze'>" + data.get.stat.cups.bronze() + " <img src='" + self.images.bronze + "' /></span>";
				cups_html += "<span class='trophies-tiptip' title='Silver'>" + data.get.stat.cups.silver() + " <img src='" + self.images.silver + "' /></span>";
				cups_html += "<span class='trophies-tiptip' title='Gold'>" + data.get.stat.cups.gold() + " <img src='" + self.images.gold + "' /></span>";

				var td = $("<td class=\"trophies-members-list-cups\">" + cups_html + "</td>");

				td.insertAfter($(this).find("td.posts"));
			}
		});
	}

});