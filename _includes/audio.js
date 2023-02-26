/*
 * Copyright 2020, Jesús Abelardo Saldívar Aguilar
 */


// para navegadores antiguos
const AudioContext = window.AudioContext || window.webkitAudioContext;


function Sonido(){
  this.ctx = new AudioContext();

  this.ruido = this.ctx.createBuffer(1, 44100, 44100);
  var lastOut = 0.0;
  var samples = this.ruido.getChannelData(0);
  for(var i = 0; i < samples.length; i++){
    var white = Math.random() * 2 - 1;
    samples[i] = (lastOut + (0.05 * white)) / 1.05;
    lastOut = samples[i];
    samples[i] *= 2; // (roughly) compensate for gain
  }

  var filtro = this.ctx.createBiquadFilter();
  filtro.type = "lowpass";
  filtro.frequency.value = 600;
  filtro.Q.value = 100;
  this.filtro = filtro;
  //filtro.connect(this.ctx.destination);
}
Sonido.prototype.hazRuido = function(){
  let duracion = 2;
  var source = this.ctx.createBufferSource();
  var expGain = this.ctx.createGain();
  expGain.gain.setValueAtTime(1, this.ctx.currentTime);
  //expGain.gain.exponentialRampToValueAtTime(1, this.ctx.currentTime + (duracion / 12));
  expGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duracion);
  source.buffer = this.ruido;
  source.loop = true;
  source.connect(expGain);
  expGain.connect(this.ctx.destination);
  source.start();
  source.stop(this.ctx.currentTime + duracion);
  //this.filtro.stop(this.ctx.currentTime + duracion);
  //console.log(source);

  source.onended = function(){
    source.disconnect();
    expGain.disconnect();
  };
};
Sonido.prototype.dispara = function(){
  let duracion = 2;
  var disparoOSC = this.ctx.createOscillator();
  disparoOSC.type = 'square';
  var disparoGain = this.ctx.createGain();
  disparoOSC.frequency.setValueAtTime(1000, this.ctx.currentTime);

  disparoGain.gain.cancelScheduledValues(this.ctx.currentTime);
  disparoGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
  disparoOSC.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + duracion);
  //disparoOSC.detune.exponentialRampToValueAtTime(1000, this.ctx.currentTime + duracion);
  disparoGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duracion);
  disparoOSC.connect(disparoGain).connect(this.ctx.destination);
  disparoOSC.start();
  disparoOSC.stop(this.ctx.currentTime + duracion);

  disparoOSC.onended = function(){
    //console.log('oscilador teminó');
    //console.log(disparoOSC);
    disparoOSC.disconnect();
    disparoGain.disconnect();
  };
};

