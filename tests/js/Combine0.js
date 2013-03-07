// Combine0.js

(function() {
	Combine0 = function() {
		this.gl = null;
		this.viewBG;
	}


	var p = Combine0.prototype;


	p.init = function(gl) {
		this.gl = gl;
		this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		this.gl.enable(gl.CULL_FACE);

		this.projection = new bongiovi.ProjectionPerspectiveMatrix();
        this.projection.perspective(45, W/H, .1, 10000);
        this.camera = new bongiovi.HoverCamera().init(1500);   
		this._initViews();
		scheduler.addEF(this, this.render, []);

		return this;
	}


	p._initViews = function() {
		this.viewBG = new ViewBackground(this.gl, "shader-vs-bg", "shader-fs");
		this.viewSun = new ViewSun(this.gl, "shader-vs-bg", "shader-fs");
		this.viewMoutains = new ViewMountain(this.gl, "shader-vs-facefront", "shader-fs");
		this.viewGiant = new ViewGiant(this.gl, "shader-vs-facefront", "shader-fs-cutting");
	}


	p.render = function() {
		// this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

		var matrix = this.camera.update();
        var invert = mat4.create(matrix);
        mat4.inverse(invert)
        var invertCamera = mat4.toInverseMat3(invert);

		this.viewBG.render(this.camera.y / 2000 * .25);
		this.viewSun.render(this.camera.y / 2000 * .25);
		this.viewMoutains.render(matrix, this.projection.matrix, invertCamera);
		this.viewGiant.render();
	}

})();