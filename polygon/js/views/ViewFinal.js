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


	p.render = function(org) {
		this.glFilterHBlur.apply([org], this.outputHBlur);
        this.glFilterVBlur.apply([this.outputHBlur], this.outputBlur);
        // this.glFilterMix.apply([org, this.outputBlur, this.outputBlur], this.output);
        this.glFilterEdgeBlur.apply([this.outputBlur, org], this.output);

        renderImage(this.gl, this.output);
	}
})();