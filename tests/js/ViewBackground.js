// ViewBackground.js

(function(){
	ViewBackground = function(gl, idVertexShader, idFragmentShader) {
		if(gl == undefined) return;
		View.call(this, gl, idVertexShader, idFragmentShader);
	}


	var p = ViewBackground.prototype = new View();
	var s = View.prototype;


	p._init = function() {
		this.matrix = mat4.create();
		mat4.identity(this.matrix);

		this.model = new bongiovi.GLModel(gl, 4);
        this.model.updateVertex(0, -1, -1, .99);
        this.model.updateVertex(1,  1, -1, .99);
        this.model.updateVertex(2,  1,  1, .99);
        this.model.updateVertex(3, -1,  1, .99);

        this.model.updateTextCoord(0, 0, 0);
        this.model.updateTextCoord(1, 1, 0);
        this.model.updateTextCoord(2, 1, .5);
        this.model.updateTextCoord(3, 0, .5); 
        this.model.setTexture(0, textureBG);
        this.model.generateBuffer();
	}


	p.render = function(yoffset) {
		yoffset = 0.37;
		this.shader.setParameter("yoffset", "uniform1f", yoffset);
		this.model.render(this.shader, this.matrix, this.matrix);
	}

})();