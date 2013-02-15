(function() {
	var W, H, NUM;
	W = window.innerWidth;
	H = window.innerHeight*2;
	NUM = 25;

	Index = function(map, gl) {
		if(map == undefined) return;
		this.map = map;
		this.gl = gl;
		this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		
		this.elevator = new google.maps.ElevationService();
		this.useFakeData = false;
		this.size = 50;
		this.tl = [];
		this.br = [];
		this.fillIndex = 0;
		this.isReadyToRender = false;
		
		this.ambientColor = [30, 30, 30];
		
		//	LIGHT 0
		this.light0X = 0.0;
		this.light0Y = 1.0;
		this.light0Z = 0.0;
		this.lightColor0 = [255, 255, 255];
		this.lightWeight0 = 0.66;
		
		//	LIGHT 1
		this.light1X = 1.0;
		this.light1Y = 0.0;
		this.light1Z = 1.0;
		this.lightColor1 = [200, 200, 255];
		this.lightWeight1 = 0.5;
		
		//	LIGHT 2
		this.light2X = -1.0;
		this.light2Y = 0.0;
		this.light2Z = -1.0;
		this.lightColor2 = [255, 255, 200];
		this.lightWeight2 = 0.5;
						
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
		this.model.setTexture(0, texture);
		this.model.setAttribute(0, "aVertexNormal", 3);
        this.projection = new bongiovi.ProjectionPerspectiveMatrix();
        this.projection.perspective(45, W/H, .1, 10000);
        this.camera = new bongiovi.HoverCamera().init(2000);   
		this.apply();
		renderImage(this.gl, textureBG);
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
		}
	}
	
	
	p.getDepthData = function() {
		// this.useFakeData = true;
		if(this.useFakeData) {
			for ( var i=0; i<NUM; i++) {
				for ( var j=0; j<NUM; j++) {
					this.coords[i][j] = Math.random() * 1000;
				}
			}
			console.log(this.coords);
			this.drawDepthMap();
		} else {
			this._getElevation();
		}
	}
	
	
	p._getElevation = function() {
		this.tl[0] = min(this.p0[0], this.p1[0]);
		this.tl[1] = min(this.p0[1], this.p1[1]);
		this.br[0] = max(this.p0[0], this.p1[0]);
		this.br[1] = max(this.p0[1], this.p1[1]);
		var diffX = (this.br[0] - this.tl[0]) / NUM;
		var diffY = (this.br[1] - this.tl[1]) / NUM;
		this.fillIndex = 0;
		
		for ( j=0; j<NUM; j++) {
			var positions = [];
			var sx = this.tl[0];
			var sy = this.tl[1] + diffY * j;
			for (i=0; i<NUM; i++) {
				var tx = sx + diffX * i;
				var ty = sy;
				positions.push(new google.maps.LatLng(tx, ty) );
			}
			
			var positionalRequest = {   'locations': positions  };
			this.elevator.getElevationForLocations(positionalRequest, this._onGetElevationData);
		}
		
		// var positionalRequest = {   'locations': locations  };
	}
	
	p._onGetElevationData = function(results, status) {
		polygon.fillElevations(results);
	}
	
	p.fillElevations = function(results) {
		for ( var i=0; i<NUM; i++) {
			this.coords[this.fillIndex][i] = results[i].elevation;
		}

		this.fillIndex ++;
		
		if(this.fillIndex == NUM ) {
			console.log(this.coords);
			this.drawDepthMap();
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
				
				n0 = computeSurfaceNormal(p0, p1, p2);
				n1 = computeSurfaceNormal(p0, p2, p3);
				
				this.model.updateAttribute(0, index*4,     n0);
				this.model.updateAttribute(0, index*4+1,   n0);
				this.model.updateAttribute(0, index*4+2,   n0);
				this.model.updateAttribute(0, index*4+3,   n0);
            }
        }
		
		this.model.generateBuffer();
		this.isReadyToRender = true;
	}
	
	
	p.reset = function() {
		this.drawDepthMap();
	}
	
	
	p.render = function() {
		this.stats.update();
		if(!this.isReadyToRender) return;
		if(this.p1 == undefined) return;
        // this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        // this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.BLEND);
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		renderImage(this.gl, textureBG);
		this.gl.enable(this.gl.DEPTH_TEST);
		
        this.model.render(this.shader, this.camera.update(), this.projection.matrix);
	}
	
	
	p.apply = function() {
        var lightingDirection0 = [this.light0X, this.light0Y, this.light0Z];
        var adjustedLD0 = vec3.create();
        vec3.normalize(lightingDirection0, adjustedLD0);
        vec3.scale(adjustedLD0, -1);

        var lightingDirection1 = [this.light1X, this.light1Y, this.light1Z];
        var adjustedLD1 = vec3.create();
        vec3.normalize(lightingDirection1, adjustedLD1);
        vec3.scale(adjustedLD1, -1);
		
        var lightingDirection2 = [this.light2X, this.light2Y, this.light2Z];
        var adjustedLD2 = vec3.create();
        vec3.normalize(lightingDirection2, adjustedLD2);
        vec3.scale(adjustedLD2, -1);
		
		
		this.shader.setParameter("uAmbientColor", "uniform3fv", [this.ambientColor[0]/255, this.ambientColor[1]/255, this.ambientColor[2]/255] );
		this.shader.setParameter("uLightingDirection0", "uniform3fv", adjustedLD0);
		this.shader.setParameter("uDirectionalColor0", "uniform3fv", [this.lightColor0[0]/255, this.lightColor0[1]/255, this.lightColor0[2]/255] );
		this.shader.setParameter("lightWeight0", "uniform1f", this.lightWeight0 );

		this.shader.setParameter("uLightingDirection1", "uniform3fv", adjustedLD1);
		this.shader.setParameter("uDirectionalColor1", "uniform3fv", [this.lightColor1[0]/255, this.lightColor1[1]/255, this.lightColor1[2]/255] );
		this.shader.setParameter("lightWeight1", "uniform1f", this.lightWeight1 );
			
		this.shader.setParameter("uLightingDirection2", "uniform3fv", adjustedLD2);
		this.shader.setParameter("uDirectionalColor2", "uniform3fv", [this.lightColor2[0]/255, this.lightColor2[1]/255, this.lightColor2	[2]/255] );
		this.shader.setParameter("lightWeight2", "uniform1f", this.lightWeight2 );
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
	
	
	var min = function(a, b) { 	return a > b ? b : a;	}
	var max = function(a, b) { 	return a < b ? b : a;	}

})();