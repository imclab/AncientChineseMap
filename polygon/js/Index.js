(function() {
	var W, H, NUM;
	W = window.innerWidth;
	H = window.innerHeight*2;
	NUM = 20;

	Index = function(map, gl) {
		if(map == undefined) return;
		this.map = map;
		this.gl = gl;
		this.elevator = new google.maps.ElevationService();
		this.useFakeData = true;
		this.size = 50;
		
		//	LIGHT
		this.lightX = 0.1;
		this.lightY = 0.1;
		this.lightZ = 0.1;
	}

	var p = Index.prototype;

	p.init = function() {
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.top = '0px';
        document.body.appendChild( this.stats.domElement );
		
		var that = this;
        google.maps.event.addListener(this.map, 'click', function(event) {
			that._placeMarker(event.latLng);
        });
		
		this.coords = [];
		for ( var i=0; i<NUM; i++) this.coords[i] = [];
		
		this._init3D();
		scheduler.addEF(this, this.render, []);
		return this;
	}
	
	
	p._init3D = function() {
		console.log("Initialize 3D");
		this.model = new bongiovi.GLModel(this.gl, (NUM-1)*(NUM-1)*4);
		this.shader = new bongiovi.GLModelShader(this.gl, "shader-vs", "shader-fs");
        this.shader.setParameter("uAmbientColor", "uniform3fv", [.2, .2, .2]);
        this.shader.setParameter("uDirectionalColor", "uniform3fv", [1, 1, 1]);
		this.model.setTexture(0, texture);
		this.model.setAttribute(0, "aVertexNormal", 3);
        this.projection = new bongiovi.ProjectionPerspectiveMatrix();
        this.projection.perspective(45, W/H, .1, 10000);
        this.camera = new bongiovi.HoverCamera().init(2000);   
	}
	
	
	p._placeMarker = function(location) {
		console.log("Place Marker : " + location.lat() + "/" + location.lng() );
		
        var marker = new google.maps.Marker(	{ position: location, map: this.map}	);
		
		if(this.p0 == undefined ) {
			this.p0 = [ location.lat(), location.lng() ];
		} else {
			this.p1 = [ location.lat(), location.lng() ];
			this.getDepthData();
			this.p0 = undefined;
			// this.p1 = undefined;
		}
	}
	
	
	p.getDepthData = function() {
		if(this.useFakeData) {
			for ( var i=0; i<NUM; i++) {
				for ( var j=0; j<NUM; j++) {
					this.coords[i][j] = Math.random() * 1000;
				}
			}
			this.drawDepthMap();
		} else {
			
		}
	}
	
	
	p.drawDepthMap = function() {
		var offset = (NUM-1)*this.size/2;
		
        for ( var i=0; i<(NUM-1); i++) {
            for ( var j=0; j< (NUM-1); j++) {
                var index = i*(NUM-1) + j;
				
				var p0 = vec3.create([i*this.size-this.size-offset, -this.coords[i][j]/10,    j*this.size-this.size-offset]);
				var p1 = vec3.create([i*this.size-offset, -this.coords[i+1][j]/10,       j*this.size-this.size-offset]);
				var p2 = vec3.create([i*this.size-offset, -this.coords[i+1][j+1]/10,     j*this.size-offset]);
				var p3 = vec3.create([i*this.size-this.size-offset, -this.coords[i][j+1]/10,  j*this.size-offset]);
				
                this.model.updateVertex(index*4,    i*this.size-this.size-offset, -this.coords[i][j]/10,    j*this.size-this.size-offset); 
                this.model.updateVertex(index*4+1,  i*this.size-offset, -this.coords[i+1][j]/10,       j*this.size-this.size-offset); 
                this.model.updateVertex(index*4+2,  i*this.size-offset, -this.coords[i+1][j+1]/10,     j*this.size-offset); 
                this.model.updateVertex(index*4+3,  i*this.size-this.size-offset, -this.coords[i][j+1]/10,  j*this.size-offset);

                this.model.updateTextCoord(index*4,   0, 0);
                this.model.updateTextCoord(index*4+1, 1, 0);
                this.model.updateTextCoord(index*4+2, 1, 1);
                this.model.updateTextCoord(index*4+3, 0, 1); 
				
				// var v01 = vec3.subtract(p0, p1);
				// var v21 = vec3.subtract(p2, p1);
				// var n0 = vec3.cross(v01, v21);
				// vec3.normalize(n0);
				
				n0 = computeSurfaceNormal(p0, p1, p2);
				
				// var v03 = vec3.subtract(p0, p3);
				// var v23 = vec3.subtract(p2, p3);
				// var n1 = vec3.cross(v23, v03);
				// vec3.normalize(n1);
				
				n1 = computeSurfaceNormal(p0, p2, p3);
				
				this.model.updateAttribute(0, index*4,     n0);
				this.model.updateAttribute(0, index*4+1,   n0);
				this.model.updateAttribute(0, index*4+2,   n0);
				this.model.updateAttribute(0, index*4+3,   n0);
            }
        }
		
		this.model.generateBuffer();
	}
	
	
	p.reset = function() {
		this.drawDepthMap();
	}
	
	
	p.render = function() {
		this.stats.update();
		if(this.p1 == undefined) return;
        this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.BLEND);
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		renderImage(this.gl, texture);
		this.gl.enable(this.gl.DEPTH_TEST);
		
        var lightingDirection = [this.lightX, this.lightY, this.lightZ];
        var adjustedLD = vec3.create();
        vec3.normalize(lightingDirection, adjustedLD);
        vec3.scale(adjustedLD, -1);

		var matrix = this.camera.update();
        var normalMatrix = mat3.create();
        mat4.toInverseMat3(matrix, normalMatrix);
        mat3.transpose(normalMatrix);
        this.shader.setParameter("uNMatrix", "uniformMatrix3fv", normalMatrix);
		this.shader.setParameter("uLightingDirection", "uniform3fv", adjustedLD);

        this.model.render(this.shader, matrix, this.projection.matrix);
	}
	
	
	var computeSurfaceNormal = function(p1, p2, p3) {
		var tmp = [];
		
		var u = vec3.subtract(p2, p1);
		var v = vec3.subtract(p3, p1);
		tmp[0] = u[1] * v[2] - u[2] * v[1];
		tmp[1] = u[2] * v[0] - u[0] * v[2];
		tmp[2] = u[0] * v[1] - u[1] * v[0];
		
		var v = vec3.create(tmp);
		vec3.normalize(v);
		tmp = [v[0], v[1], v[2]];
		
		return tmp;
	}

})();