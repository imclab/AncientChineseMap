(function() {
	var that;
	var W, H;
	W = window.innerWidth;
	H = window.innerHeight;

	Index = function() {
		that = this;
	}

	var p = Index.prototype;

	p.init = function() {
		this.canvasGL = document.createElement("canvas");
		this.canvasGL.id = "canvasGL";
		this.canvasGL.width = window.innerWidth;
		this.canvasGL.height = window.innerHeight;
		this.canvasGL.style.position = "absolute";
		this.canvasGL.style.zIndex = "0";

		this.gl = this.canvasGL.getContext("experimental-webgl");
		this.gl.viewportWidth = window.innerWidth;
		this.gl.viewportHeight = window.innerHeight;
		document.body.appendChild(this.canvasGL);

		this.stats = new Stats();
		this.stats.domElement.style.position = 'absolute';
		this.stats.domElement.style.top = '0px';
		document.body.appendChild( this.stats.domElement );

		this.loader = new PxLoader();
		this.img = this.loader.addImage("images/mountains.png");
		this.imgBlur = this.loader.addImage("images/mountainsBlur.png");
		this.bg = this.loader.addImage("images/bg.jpg");
		this.loader.addCompletionListener(function(){ that._onImageLoaded()} );
		this.loader.start();

		this.mouse = {x:0, y:0};
		document.addEventListener("mousemove", function(e) {	
			that.mouse.x = e.clientX;
			that.mouse.y = e.clientY;
		} );
	}


	p._onImageLoaded = function(e) {
		this.texture = new GLTexture(this.gl, this.img);
		this.textureBlur = new GLTexture(this.gl, this.imgBlur);
		this.bg = new GLTexture(this.gl, this.bg);
		this.shader = new bongiovi.GLModelShader(this.gl, "shader-vs", "shader-fs");

		this._initParticles();

		this.model = new bongiovi.GLModel(this.gl, this.numParticles*4);
		// var size = 2;

		this.model.setAttribute(0, "sizeOffset", 2);

		for ( var i=0; i<this.numParticles; i++ ) {
			var p = this.particles[i];
			this.model.updateVertex(i*4, 	p.x, p.y, p.z);	
			this.model.updateVertex(i*4+1, 	p.x, p.y, p.z);	
			this.model.updateVertex(i*4+2, 	p.x, p.y, p.z);	
			this.model.updateVertex(i*4+3, 	p.x, p.y, p.z);	

			this.model.updateTextCoord(i*4,   p.uv[0], p.uv[1]);
			this.model.updateTextCoord(i*4+1, p.uv[2], p.uv[3]);
			this.model.updateTextCoord(i*4+2, p.uv[4], p.uv[5]);
			this.model.updateTextCoord(i*4+3, p.uv[6], p.uv[7]);

			this.model.updateAttribute(0, i*4, 	 [-p.size,  0]);
			this.model.updateAttribute(0, i*4+1, [ p.size,  0]);
			this.model.updateAttribute(0, i*4+2, [ p.size,  p.size*2]);
			this.model.updateAttribute(0, i*4+3, [-p.size,  p.size*2]);
		}


		this.model.setTexture(0, this.texture);
		this.model.setTexture(1, this.textureBlur);
		this.model.generateBuffer();

		this.mvMatrix = mat4.create();
	  	this.pMatrix = mat4.create();
	  	mat4.identity(this.pMatrix);
	  	mat4.identity(this.mvMatrix);

	  	this.projection = new bongiovi.ProjectionPerspectiveMatrix();
	  	this.projection. perspective(45, W/H, .1, 1000);
	  	this.camera = new bongiovi.HoverCamera().init(200);

		this.loop();
	}


	p._initParticles = function() {
		this.numParticles = 300;
		this.particles = [];
		var range = 400;
		for ( var i=0; i<this.numParticles; i++) {
			var x = random(-range, range);
			var y = 0;
			var z = random(-range, range);

			var size = random(5, 35);

			var uvx = Math.floor(Math.random() * 2);
			var uvy = Math.floor(Math.random() * 4);

			var rect = [
						uvx*.25, uvy*.25,
						uvx*.25+.25, uvy*.25,
						uvx*.25+.25, uvy*.25+.25,
						uvx*.25, uvy*.25+.25
						]


			this.particles.push( {x:x, y:y, z:z, size:size, uv:rect} );
		}
	}


	p.loop = function() {
		requestAnimFrame(that.loop);
    	that.render();
    	that.stats.update();
	}


	p.render = function() {
		this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
	    this.gl.enable(this.gl.BLEND);

	    renderImage(this.gl, this.bg);
	    var matrix = this.camera.update();
	    var invert = mat4.create(matrix);
	    mat4.inverse(invert)

	    var invertCamera = mat4.toInverseMat3(invert);
	    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

	    this.shader.setParameter("brightness", "uniform1f", this.mouse.x/window.innerWidth * .5);
	    this.shader.setParameter("invertCamera", "uniformMatrix3fv", invertCamera);

	    this.model.render(this.shader, matrix, this.projection.matrix);
	    // renderImage(this.gl, this.output);
	}


	var random = function(min, max) {
		return min + Math.random() * ( max - min);
	}

})();