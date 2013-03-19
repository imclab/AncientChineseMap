// Index.js

(function() {
	var MAX = 1000;


	Index = function(gl) {
		if(gl == undefined) return;
		this.gl = gl;
		this.bg = null;
		this.particle = null;
		this.textureBg = null;
		this.textureParticle = null;
	}

	var p = Index.prototype;

	p.init = function() {
		var that = this;
		this.loader = new PxLoader();
		this.bg = this.loader.addImage("images/giantBG.jpg");
		this.particle = this.loader.addImage("images/sun.png");
		this.loader.addCompletionListener(function(){ that._onImageLoaded()} );
		this.loader.start();

		return this;
	}


	p._onImageLoaded = function() {
		this.textureBg = new GLTexture(this.gl, this.bg);
		this.textureParticle = new GLTexture(this.gl, this.particle);

		this.viewParticles = new ViewParticles(this.gl, "shader-vs-particle", "shader-fs");

		scheduler.addEF(this, this._loop, []);
	}


	p._loop = function() {
		renderImage(this.gl, this.textureBg);
	}
})();