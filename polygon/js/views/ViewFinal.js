// ViewFinal.js

(function() {
	W = window.innerWidth;
	H = window.innerHeight*2;

	ViewFinal = function(gl) {
		if(gl == undefined) return;

		this.gl = gl;
		this._init();
	}	

	var p = ViewFinal.prototype;


	p._init = function() {
		console.log("Initialize Final");
		this.model = new bongiovi.GLModel(this.gl, 4);
		this.shader = new bongiovi.GLModelShader(this.gl, "shader-vs-otho", "shader-fs-hblur");
		this.shaderVBlur = new bongiovi.GLModelShader(this.gl, "shader-vs-otho", "shader-fs-vblur");
		this.shaderHBlur = new bongiovi.GLModelShader(this.gl, "shader-vs-otho", "shader-fs-hblur");
		
		this.model.setTexture(0, texture);
		this.model.updateVertex(0, -1, -1, 0);
		this.model.updateVertex(1,  1, -1, 0);
		this.model.updateVertex(2,  1,  1, 0);
		this.model.updateVertex(3, -1,  1, 0);
		
		this.model.updateTextCoord(0, 0, 0);
		this.model.updateTextCoord(1, 1, 0);
		this.model.updateTextCoord(2, 1, 1);
		this.model.updateTextCoord(3, 0, 1);
		
		this.model.generateBuffer();

		this.camera = mat4.create();
		this.projection = mat4.create();
		mat4.identity(this.camera);
		mat4.identity(this.projection);

		// return;
		
		
		var scale = 1;
		var blur = 2/1024;
		this.outputHBlur = new GLTexture(this.gl, null, 1024/scale, 1024/scale);
		this.outputBlur = new GLTexture(this.gl, null, 1024/scale, 1024/scale);
		this.output = new GLTexture(this.gl, null, 1024/scale, 1024/scale);
		this.glFilterHBlur = new GLTextureFilter(this.gl, "shader-vs-otho", "shader-fs-hblur");
		this.glFilterHBlur.setParameter("h", "uniform1f", blur);
		this.glFilterVBlur = new GLTextureFilter(this.gl, "shader-vs-otho", "shader-fs-vblur");
		this.glFilterVBlur.setParameter("v", "uniform1f", blur);
		this.glFilterMix = new GLTextureFilter(this.gl, "shader-vs-otho", "shader-fs-mix");
		this.glFilterEdgeBlur = new GLTextureFilter(this.gl, "shader-vs-otho", "shader-fs-edgeblur");
	}


	p.render = function(org, depth) {
		// this.model.setTexture(0, depth);
		// this.model.render(this.shader, this.camera, this.projection);
		// 
		// return;
		this.glFilterHBlur.apply([org], this.outputHBlur);
        this.glFilterVBlur.apply([this.outputHBlur], this.outputBlur);
        // this.glFilterMix.apply([org, this.outputBlur, this.outputBlur], this.output);
        this.glFilterEdgeBlur.apply([this.outputBlur, org], this.output);

        renderImage(this.gl, this.output);
	}
})();