var trophies = {

	VERSION: "1.0.0",
	
	data: {
				
	},
	
	plugin: null,
	route: null,
	params: null,
	images: null,
		
	modules: [],
	
	init: function(){
		console.log(1);
		this.setup();
	},
		
	setup: function(){
		if(yootil.key.has_value("pixeldepth_trophies")){
			var data = yootil.key.value("pixeldepth_trophies", null, true);
			
			if(data){
				this.data = (data && typeof data == "object")? data : this.data;
			}
		}			
			
		this.route = (proboards.data("route") && proboards.data("route").name)? proboards.data("route").name.toLowerCase() : "";
		this.params = (this.route && proboards.data("route").params)? proboards.data("route").params : "";
		this.plugin = proboards.plugin.get("pixeldepth_trophies");
		
		if(this.plugin && this.plugin.settings){
			var settings = this.plugin.settings;
		}
	}
	
};