// ViewDepthMap.js

(function() {
	var W, H, NUM;
	W = window.innerWidth;
	H = window.innerHeight*2;
	NUM = 25;

	ViewDepthMap = function(gl) {
		if(gl == undefined) return;
		this.gl = gl;

		this.size = 50;
		this.coords = null;
		this.ratio = 1;

		this._init();
	}


	var p = ViewDepthMap.prototype;


	p._init = function() {
		console.log( 'Initialize View Depth' );
		this.model = new bongiovi.GLModel(this.gl, (NUM-1)*(NUM-1)*4);
		this.shader = new bongiovi.GLModelShader(this.gl, "shader-vs-depth-map", "shader-fs-depth-map");

        this.output = new GLTexture(this.gl, null, 2048, 2048);
	}


	p.generateMap = function(coords, ratio) {
		this.ratio = ratio;
		this.coords = coords;
		var offset = (NUM-1)*this.size/2;

        for ( var i=0; i<(NUM-1); i++) {
            for ( var j=0; j< (NUM-1); j++) {
                var index = i*(NUM-1) + j;
                this.model.updateVertex(index*4,    i*this.size-this.size-offset, -this.coords[i][j]/10,    (j*this.size-this.size-offset)*this.ratio ); 
                this.model.updateVertex(index*4+1,  i*this.size-offset, -this.coords[i+1][j]/10,       (j*this.size-this.size-offset)*this.ratio); 
                this.model.updateVertex(index*4+2,  i*this.size-offset, -this.coords[i+1][j+1]/10,     (j*this.size-offset)*this.ratio); 
                this.model.updateVertex(index*4+3,  i*this.size-this.size-offset, -this.coords[i][j+1]/10,  (j*this.size-offset)*this.ratio);

                this.model.updateTextCoord(index*4,   0, 0);
                this.model.updateTextCoord(index*4+1, 1, 0);
                this.model.updateTextCoord(index*4+2, 1, 1);
                this.model.updateTextCoord(index*4+3, 0, 1); 
            }
        }
		
		this.model.generateBuffer();
	}


	p.render = function(camera, projection) {
        this.model.render(this.shader, camera, projection, this.output);
	}


})();