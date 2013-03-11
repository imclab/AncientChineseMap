// SoundMixer.js


(function() {
	SoundMixer = function() {
		this.ctx = null;
		this._isSoundLoaded = false;
		this.loader = null;
	}


	var p = SoundMixer.prototype;

	p.init = function() {
		try {
			this.ctx = new webkitAudioContext();
		} catch (e) {
			console.log( "Can't create Web Audio" );
			return this;
		}	

		console.log( this.ctx );
		this._loadSounds();
		return this;
	}


	p._loadSounds = function() {
		var sources = ['sounds/01.mp3', 'sounds/02.mp3', 'sounds/03.mp3'];
		// var sources = ['sounds/bar.mp3', 'sounds/monk.mp3', 'sounds/wd.mp3'];
		// var sources = ['sounds/bar.mp3', 'sounds/monk.mp3', 'sounds/wd.mp3', 'sounds/wiz.mp3'];
		var that = this;
		this.loader = new BufferLoader(this.ctx, sources, function(e){ that._onLoaded(e);	});
		this.loader.load();
	}


	p._onLoaded = function(buffers) {
		this._isSoundLoaded = true;
		console.log( "Sound Loaded : " + buffers );
		this.ctx.buffers = buffers;
		this.sources = new Array(3);
		this.gains = new Array(3);


		var targetStart = this.ctx.currentTime + 0.1;
        for (var i = 0, length = this.ctx.buffers.length; i < length; i++) {
            this.playSound(i, targetStart);
        }
        this.setIntensity(0);
	}


	p.setIntensity = function (normVal) {
	    var value = normVal * (this.gains.length - 1);
	    for (var i = 0; i < this.gains.length; i++) {
	        this.gains[i].gain.value = 0;
	    }
	    var leftNode = Math.floor(value);
	    var x = value - leftNode;
	    var gain1 = Math.cos(x * 0.5 * Math.PI);
	    var gain2 = Math.cos((1.0 - x) * 0.5 * Math.PI);

	    this.gains[leftNode].gain.value = gain1;
	    if (leftNode < this.gains.length - 1) {
	        this.gains[leftNode + 1].gain.value = gain2;
	    }
	}


	p.playSound = function(index, targetTime) {
	    var buffer = this.ctx.buffers[index];
	    var source = this.ctx.createBufferSource();
	    source.buffer = buffer;
	    source.loop = true;
	    var gainNode = this.ctx.createGainNode();
	    source.connect(gainNode);
	    gainNode.connect(this.ctx.destination);
	    this.sources[index] = source;
	    this.gains[index] = gainNode;
	    source.noteOn(targetTime);
	}



	p.update = function(angle) {
		if(!this.gains || this.gains.length<3) return;

		var offset;
		if(angle > 90 && angle < 210) offset = 0;
		else if ( angle > 210 && angle < 330) offset = 1;
		else offset = 2;

		var range = 30;
		var gain0, gain1;
		var theta;
		var PI2 = Math.PI * .5;

		if(angle > (210 - range) && angle < 210 ) {
			theta = (angle - ( 210 - range)) / range * PI2;
			this.gains[0].gain.value = Math.cos(theta);
			this.gains[1].gain.value = Math.cos(PI2 - theta);
			this.gains[2].gain.value = 0;
		} else if(angle > (330 - range) && angle < 330 ) {
			theta = (angle - ( 330 - range)) / range * PI2;
			this.gains[0].gain.value = 0;
			this.gains[1].gain.value = Math.cos(theta);
			this.gains[2].gain.value = Math.cos(PI2 - theta);
		} else if(angle > (90 - range) && angle < 90 ) {
			theta = (angle - ( 90 - range)) / range * PI2;
			this.gains[0].gain.value = Math.cos(PI2 - theta);
			this.gains[1].gain.value = 0;
			this.gains[2].gain.value = Math.cos(theta);
		} 

		 
	}

})();