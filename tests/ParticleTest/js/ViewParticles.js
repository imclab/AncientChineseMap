// ViewParticles.js

(function() {
	ViewParticles = function(gl, idVertexShader, idFragmentShader) {
		if(gl == undefined) return;
		View.call(this, gl, idVertexShader, idFragmentShader);
	}

	var p = ViewParticles.prototype = new View();
	var s = View.prototype;

	p._init = function() {

	}


	p.render = function() {
		
	}
})();