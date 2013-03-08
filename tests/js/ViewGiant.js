// ViewGiant.js

(function(){
	ViewGiant = function(gl, idVertexShader, idFragmentShader) {
		if(gl == undefined) return;
		View.call(this, gl, idVertexShader, idFragmentShader);
	}


	var p = ViewGiant.prototype = new View();
	var s = View.prototype;


	p._init = function() {
		this.matrix = mat4.create();
		mat4.identity(this.matrix);

		this.model = new bongiovi.GLModel(gl, 4);
		var size = .37;
		var ratio = H/W;
		var yoffset = -.35;

        this.model.updateVertex(0, -size*ratio,  yoffset, 0.5);
        this.model.updateVertex(1,  size*ratio,  yoffset, 0.5);
        this.model.updateVertex(2,  size*ratio,  size*2+yoffset, 0.5);
        this.model.updateVertex(3, -size*ratio,  size*2+yoffset, 0.5);

        this.model.updateTextCoord(0, 0, 0);
        this.model.updateTextCoord(1, 1, 0);
        this.model.updateTextCoord(2, 1, 1);
        this.model.updateTextCoord(3, 0, 1); 
        this.model.setTexture(0, textureGiant);
        this.model.generateBuffer();

        this.shader.setParameter("yoffset", "uniform1f", 0);
	}


	p.render = function() {
		if( videoColor.readyState != 4) return;

		if(this.textureColor == undefined) {
			this.textureColor = new GLTexture(this.gl, videoColor);
			this.model.setTexture(1, this.textureColor);
		}
		else this.textureColor.updateTexture(videoColor);

		this.model.render(this.shader, this.matrix, this.matrix);
	}

})();