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
        this.model.updateVertex(0, -1, -1, .9);
        this.model.updateVertex(1,  1, -1, .9);
        this.model.updateVertex(2,  1,  1, .9);
        this.model.updateVertex(3, -1,  1, .9);

        this.model.updateTextCoord(0, 0, .25);
        this.model.updateTextCoord(1, 1, .25);
        this.model.updateTextCoord(2, 1, .75);
        this.model.updateTextCoord(3, 0, .75); 
        this.model.setTexture(0, textureBG);
        this.model.generateBuffer();
	}


	p.render = function(yoffset) {
		this.shader.setParameter("yoffset", "uniform1f", yoffset);
		this.model.render(this.shader, this.matrix, this.matrix);
	}

})();