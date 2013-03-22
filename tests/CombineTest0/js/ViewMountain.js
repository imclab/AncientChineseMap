// ViewMountain.js

(function(){
	var NUM_MOUNTAINS = 100;
	var num = 20;

	ViewMountain = function(gl, idVertexShader, idFragmentShader) {
		if(gl == undefined) return;
		this.mountains = [];
		View.call(this, gl, idVertexShader, idFragmentShader);
	}


	var p = ViewMountain.prototype = new View();
	var s = View.prototype;


	p._init = function() {
		this._initMountains();

		this.model = new bongiovi.GLModel(this.gl, this.mountains.length * 4);
        this.model.setAttribute(0, "sizeOffset", 2);
        var range = 75;

        for ( var i=0; i<this.mountains.length; i++) {
			var o = this.mountains[i];
			var tx = (o.y - num/2) * range;
			var tz = -(o.x - num/2) * range;
			var ty = o.height;

			var yoffset = 300;

			this.model.updateVertex(i*4+1, tx, yoffset, tz);
			this.model.updateVertex(i*4+2, tx, yoffset, tz);
			this.model.updateVertex(i*4+3, tx, yoffset, tz);
			this.model.updateVertex(i*4+0, tx, yoffset, tz);
            
            this.model.updateAttribute(0, i*4+0, [-ty/2,  0]);
            this.model.updateAttribute(0, i*4+1, [ ty/2,  0]);
            this.model.updateAttribute(0, i*4+2, [ ty/2,  ty]);
            this.model.updateAttribute(0, i*4+3, [-ty/2,  ty]);

            var xoff = 0;
            var yoff = 0;
            if ( o.type == 1) yoff = .5;
            else if ( o.type == 2) xoff = yoff = .5;
			this.model.updateTextCoord(i*4,   0+xoff, 0+yoff);
            this.model.updateTextCoord(i*4+1, .5+xoff, 0+yoff);
            this.model.updateTextCoord(i*4+2, .5+xoff, .5+yoff);
            this.model.updateTextCoord(i*4+3, 0+xoff, .5+yoff); 
		}

		this.model.setTexture(0, textureMountain);
		this.model.generateBuffer();
	}



	p._initMountains = function() {
		for ( var i=0; i<NUM_MOUNTAINS; i++) {
			var tx = Math.floor(Math.random() * num);
			var ty = Math.floor(Math.random() * num);
			var top = Math.floor(250 + Math.random() * 500);
			var type = Math.floor(Math.random() * 3);
			var o = {x:tx, y:ty, height:top, type:type};
			this.mountains.push(o);
		}
	}


	p.render = function(camera, projection, invertCamera) {
        this.shader.setParameter("invertCamera", "uniformMatrix3fv", invertCamera);

		this.model.render(this.shader, camera, projection);
	}
})();