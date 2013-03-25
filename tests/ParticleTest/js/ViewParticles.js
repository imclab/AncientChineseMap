// ViewParticles.js

(function() {
	var that = this;
	ViewParticles = function(gl, idVertexShader, idFragmentShader, texture) {
		if(gl == undefined) return;
		that= this;
		this._particles = [];
		this.numParticles = 1000;
		this.numEmit = 60;
		this.minLife = 75;
		this.maxLife = 185;
		this.minSize = 10;
		this.maxSize = 40;
		this.speed = 6;
		this.range = 50;
		this.camera = null;
		this.texture = texture;
		View.call(this, gl, idVertexShader, idFragmentShader);
	}

	var p = ViewParticles.prototype = new View();
	var s = View.prototype;


	p._init = function() {
	}


	p.render = function(projection) {
		this._updateParticles();
		this._generateParticles();
		this._updateModel();

		// var matrix = this.camera.update();
  //       var invert = mat4.create(matrix);
  //       mat4.inverse(invert)
  //       var invertCamera = mat4.toInverseMat3(invert);

		// this.shader.setParameter("invertCamera", "uniformMatrix3fv", invertCamera);
		this.model.render(this.shader, this.camera.update(), projection);
	}


	p._generateParticles = function() {
		var vr = .1;
		for ( var i=0; i<this.numEmit; i++) {
			if(this._particles.length > this.numParticles) return;
			var p = new Particle(random(this.range, -this.range), random(this.range, -this.range), random(this.range, -this.range));
			p.vx = random(-this.speed, this.speed);
			p.vy = random(-this.speed, this.speed);
			p.vz = random(-this.speed, this.speed);
			p.vrx = random(-vr, vr);
			p.vry = random(-vr, vr);
			p.vrz = random(-vr, vr);
			p.u = Math.random() > .5 ? 0 : .5;
			p.v = Math.random() > .5 ? 0 : .5;
			var life = Math.floor(random(this.minLife, this.maxLife));
			p.life = p.maxLife = life;
			p.size = random(this.minSize, this.maxSize);

			this._particles.push(p);
		}
	}


	p._updateParticles = function() {
		var tmp = [];
		for ( var i=0; i<this._particles.length; i++) {
			var p = this._particles[i];
			p.update();
			if(p.life > 0) tmp.push(p);
		}
		this._particles = tmp;
	}


	p._updateModel = function() {
		// console.log( this._particles.length );
		this.model = new bongiovi.GLModel(this.gl, this._particles.length*4);
		this.model.setAttribute(0, "sizeOffset", 2);
		this.model.setAttribute(1, "rotations", 4);

		for (var i = this._particles.length - 1; i >= 0; i--) {
			var p = this._particles[i];

			this.model.updateVertex(0+i*4, p.x, p.y, p.z);
	        this.model.updateVertex(1+i*4, p.x, p.y, p.z);
	        this.model.updateVertex(2+i*4, p.x, p.y, p.z);
	        this.model.updateVertex(3+i*4, p.x, p.y, p.z);

	        this.model.updateAttribute(0, i*4+0, [-p.size,   p.size]);
            this.model.updateAttribute(0, i*4+1, [ p.size,   p.size]);
            this.model.updateAttribute(0, i*4+2, [ p.size,  -p.size]);
            this.model.updateAttribute(0, i*4+3, [-p.size,  -p.size]);

            var life = Math.sin( (p.life / p.maxLife) * Math.PI);
            this.model.updateAttribute(1, i*4+0, [p.rx, p.ry, p.rz, life]);
            this.model.updateAttribute(1, i*4+1, [p.rx, p.ry, p.rz, life]);
            this.model.updateAttribute(1, i*4+2, [p.rx, p.ry, p.rz, life]);
            this.model.updateAttribute(1, i*4+3, [p.rx, p.ry, p.rz, life]);

	        this.model.updateTextCoord(0+i*4, p.u, p.v);
	        this.model.updateTextCoord(1+i*4, p.u + .5, p.v);
	        this.model.updateTextCoord(2+i*4, p.u + .5, p.v + .5);
	        this.model.updateTextCoord(3+i*4, p.u, p.v + .5);
		};

		this.model.setTexture(0, this.texture);
		this.model.generateBuffer();
	}


	var random = function(min, max) {	return min + Math.random() * ( max - min);	}


})();