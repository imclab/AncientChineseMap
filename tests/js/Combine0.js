// Combine0.js

(function() {
	Combine0 = function() {
		this.gl = null;
		this.viewBG = null;
		this.viewSun = null;
		this.viewMountains = null;
		this.viewGiant = null;
		this.projection = null;
		this.camera = null;
		this.gui  = null;
		this.v0 = null;
		this.mixer = null;
	}


	var p = Combine0.prototype;


	p.init = function(gl) {
		this.gl = gl;
		this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.enable(this.gl.CULL_FACE);

		this.projection = new bongiovi.ProjectionPerspectiveMatrix();
        this.projection.perspective(45, W/H, .1, 10000);
        this.camera = new bongiovi.HoverCamera().init(1500);   
		this._initViews();
		this._initControls();
		this.cross = vec3.create([1, 1, 1]);
		scheduler.addEF(this, this.render, []);

		this.mixer = new SoundMixer().init();
		return this;
	}
	
	
	p._initControls = function() {
		this.gui = new dat.GUI();
	}
	
	
	p.update = function() {
		
	}


	p._initViews = function() {
		this.viewBG = new ViewBackground(this.gl, "shader-vs-bg", "shader-fs");
		this.viewSun = new ViewSun(this.gl, "shader-vs-bg", "shader-fs");
		this.viewMountains = new ViewMountain(this.gl, "shader-vs-facefront", "shader-fs");
		this.viewGiant = new ViewGiant(this.gl, "shader-vs-facefront", "shader-fs-cutting");
	}


	p.render = function() {
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		var matrix = this.camera.update();
        var invert = mat4.create(matrix);
        mat4.inverse(invert)
        var invertCamera = mat4.toInverseMat3(invert);

        var theta = Math.atan2(this.camera.z , this.camera.x);
        this.mixer.update(theta * 180 / Math.PI + 180);


        this.gl.enable(this.gl.DEPTH_TEST);
		this.viewBG.render((this.camera.y / 2000 + 1) * .25);
		this.viewSun.render(this.camera.y / 2000 * .25);	
		
		this.gl.disable(this.gl.DEPTH_TEST);
		this.viewMountains.render(matrix, this.projection.matrix, invertCamera);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.viewGiant.render();
	}


})();