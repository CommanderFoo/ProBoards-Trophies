if(typeof PD_DEBUG === "undefined"){
	PD_DEBUG = true;
}

if(typeof pixeldepth == "undefined"){
	pixeldepth = {};
}

pixeldepth.trophies = (function(){
	{PLUGIN}
	return trophies;

})();

$(function(){
	pixeldepth.trophies.init();
});