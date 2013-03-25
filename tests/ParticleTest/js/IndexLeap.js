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

		this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

		this.viewParticles = null;
		// this.gl.disable(this)
	}

	var p = Index.prototype;

	p.init = function() {
		var that = this;
		this.loader = new PxLoader();
		this.bg = this.loader.addImage("images/giantBG.jpg");
		this.particle = this.loader.addImage("images/flower.png");
		this.sun = this.loader.addImage("images/sun.png");
		this.loader.addCompletionListener(function(){ that._onImageLoaded()} );
		this.loader.start();

		return this;
	}


	p._onImageLoaded = function() {
		this.textureBg = new GLTexture(this.gl, this.bg);
		this.textureParticle = new GLTexture(this.gl, this.particle);
		this.textureSun = new GLTexture(this.gl, this.sun);

		this.projection = new bongiovi.ProjectionPerspectiveMatrix();
        this.projection.perspective(45, W/H, .1, 10000);
        this.camera = new bongiovi.HoverCamera().init(3500);   

		this.viewBg = new ViewBg(this.gl, "shader-vs-bg", "shader-fs", this.textureBg);
		this.viewParticles = new ViewParticles(this.gl, "shader-vs-particle", "shader-fs-particle", this.textureParticle);
		this.viewSun = new ViewSun(this.gl, "shader-vs-bg", "shader-fs", this.textureSun);

		gui = new dat.GUI();
		gui.add(this.viewParticles, "numParticles", 500, 1000);
		gui.add(this.viewParticles, "numEmit", 50, 100);
		gui.add(this.viewParticles, "minLife", 10, 100);
		gui.add(this.viewParticles, "maxLife", 10, 200);
		gui.add(this.viewParticles, "minSize", 10, 200);
		gui.add(this.viewParticles, "maxSize", 10, 200);
		gui.add(this.viewParticles, "speed", 1, 50);
		gui.add(this.viewParticles, "range", 1, 10);

		scheduler.addEF(this, this._loop, []);
	}


	p._loop = function() {
		this.viewBg.render();
		this.viewSun.render();
		this.viewParticles.camera = this.camera;
		this.viewParticles.render(this.projection.matrix);
	}
})();