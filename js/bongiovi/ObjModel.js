// ObjModel.js

(function() {
	ObjModel = function(path) {
		if(path == undefined) return;
		this._path = path;
		this._req = new XMLHttpRequest();
		this._init();
	}

	var p = ObjModel.prototype;


	p._init = function() {
		
	}
})();