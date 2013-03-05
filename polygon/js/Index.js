(function() {
	var W, H, NUM;
	W = window.innerWidth;
	H = window.innerHeight*2;
	NUM = 25;

	Index = function(map, gl) {
		if(map == undefined) return;

		this.useFakeData = false;

		this.map = map;
		this.gl = gl;
		this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.enable(this.gl.CULL_FACE);
        this.ratio = 1;
        this.tl = [];
        this.br = [];


        this.viewMountain = new ViewMountain(this.gl);
        this.viewDepth = new ViewDepthMap(this.gl);
        this.viewFinal = new ViewFinal(this.gl);
		
		this.elevator = new google.maps.ElevationService();
						
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
        this.projection = new bongiovi.ProjectionPerspectiveMatrix();
        this.projection.perspective(45, W/H, .1, 5000);
        this.camera = new bongiovi.HoverCamera().init(2000);   
		renderImage(this.gl, textureBG);
	}
	
	
	p._placeMarker = function(location) {
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
		if(this.useFakeData) {
			for ( var i=0; i<NUM; i++) {
				for ( var j=0; j<NUM; j++) {
					this.coords[i][j] = Math.random() * 1000;
				}
			}
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
		var distX = this.br[0] - this.tl[0];
		var distY = this.br[1] - this.tl[1];
		var diffX = distX / NUM;
		var diffY = distY / NUM;
		this.ratio = distX / distY;


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
	}
	

	p._onGetElevationData = function(results, status) {	polygon.fillElevations(results); }
	

	p.fillElevations = function(results) {
		for ( var i=0; i<NUM; i++) {
			this.coords[this.fillIndex][i] = results[i].elevation;
		}

		this.fillIndex ++;
		
		if(this.fillIndex == NUM ) {
			this.drawDepthMap();
		}
		
	}
	
	p.drawDepthMap = function() {
		this.viewMountain.generateMap(this.coords, this.ratio);
		this.viewDepth.generateMap(this.coords, this.ratio);
		this.isReadyToRender = true;
	}
	
	p.render = function() {
		this.stats.update();
		
		if(!this.isReadyToRender) return;
		if(this.p1 == undefined) return;
		
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		this.gl.enable(this.gl.CULL_FACE);
		this.gl.disable(this.gl.DEPTH_TEST);
		renderImage(this.gl, textureBG);
        this.gl.enable(this.gl.BLEND);
		
        
		this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		
		var cam = this.camera.update();
		
		this.viewMountain.render(cam, this.projection.matrix);
		this.viewDepth.render(cam, this.projection.matrix);
		
		// console.log(this.viewMountain.output);
		// renderImage(this.gl, this.viewMountain.output);
		
		this.viewFinal.render(this.viewMountain.output, this.viewDepth.output);
        // this.viewFinal.render(this.viewMountain.output);
	}
	
	var min = function(a, b) { 	return a > b ? b : a;	}
	var max = function(a, b) { 	return a < b ? b : a;	}

})();