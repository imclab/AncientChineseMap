// ViewTree.js


(function() {
	ViewTree = function(gl, idVertexShader, idFragmentShader, texture) {
		if(gl == undefined) return;
		this.texture = texture;
		this._vertices = [];
		this._uvs = [];
		this._indices = [];
		View.call(this, gl, idVertexShader, idFragmentShader);
	}

	var p = ViewTree.prototype = new View();
	var s = View.prototype;


	p._init = function() {
		var req = new XMLHttpRequest();
		req.open("GET", "./objs/tree.obj", false);
		req.send();
		// var data = eval("("+req.responseText+")");
		// console.log( data  + "/" + data.data.length);
		console.log( req.responseText );
		var ary = req.responseText.split("\n");

		for ( var i =0; i<ary.length; i++) {
			var tmp = ary[i].split(" ");
			var type = tmp[0];

			if(type == 'v') {
				var o = { x:Number(tmp[1]), y:Number(tmp[2]), z:Number(tmp[3]) };
				console.log( o );
				this._vertices.push( o );
			} else if( type == 'vt') {
				this._uvs.push( {u:tmp[1], v:tmp[2]} );
			} else if ( type == 'f') {
				var indices = tmp[1].split("/").concat(tmp[2].split("/")).concat(tmp[3].split("/"));
				console.log( indices );
				this._indices.push( indices );
			}
			
		}


		console.log( this._vertices.length );
		console.log( this._uvs.length );
		console.log( this._indices.length );
	}

})();