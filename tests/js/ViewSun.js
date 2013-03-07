// ViewSun.js

(function(){
	ViewSun = function(gl, idVertexShader, idFragmentShader) {
		if(gl == undefined) return;
		View.call(this, gl, idVertexShader, idFragmentShader);
	}


	var p = ViewSun.prototype = new View();
	var s = View.prototype;


	p._init = function() {
		this.matrix = mat4.create();
		mat4.identity(this.matrix);

		this.mvMatrix = mat4.create();
		mat4.identity(this.mvMatrix);

		this.model = new bongiovi.GLModel(gl, 4);
		var size = .4;
		var ratio = H/W;
        this.model.updateVertex(0, -size*ratio, -size, 0.8);
        this.model.updateVertex(1,  size*ratio, -size, 0.8);
        this.model.updateVertex(2,  size*ratio,  size, 0.8);
        this.model.updateVertex(3, -size*ratio,  size, 0.8);

        this.model.updateTextCoord(0, 0, 0);
        this.model.updateTextCoord(1, 1, 0);
        this.model.updateTextCoord(2, 1, 1);
        this.model.updateTextCoord(3, 0, 1); 
        this.model.setTexture(0, textureSUN);
        this.model.generateBuffer();

        this.shader.setParameter("yoffset", "uniform1f", 0);
	}


	p.render = function(yoffset) {
		mat4.identity(this.mvMatrix);
		mat4.translate(this.mvMatrix, [0, -yoffset*2+.25, 0]);
		this.model.render(this.shader, this.mvMatrix, this.matrix);
	}

})();