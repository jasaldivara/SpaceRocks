/*
 * Copyright 2023 Jesús Abelardo Saldívar Aguilar
 */

function Explosion(){}
Explosion.prototype = new Sprite();

Explosion.prototype.numPuntos = 256;
Explosion.prototype.pointsCount = function(){
  return this.numPuntos;
};
Explosion.prototype.primitive = function(){
  return this.gl.POINTS;
};
Explosion.prototype.setGeometry = function (){
  var puntos = [];
  for (let i = 0; i < this.numPuntos; i ++){
    let angz = Math.random() * Math.PI * 2;
    let angy = Math.random() * Math.PI * 2;
    let x = Math.cos(angz);
    let y = Math.sin(angz);
    x = (x * Math.cos(angy));
    let z = x * Math.sin(angy);
    puntos.push(x);
    puntos.push(y);
    puntos.push(z);
  }
  this.gl.bufferData(this.gl.ARRAY_BUFFER,
    new Float32Array(puntos),
    this.gl.STATIC_DRAW);
};
Explosion.prototype.setColors = function(){
  var colores = [];
  for (let i = 0; i < this.numPuntos; i ++){
    colores.push(Math.random());
    colores.push(Math.random());
    colores.push(Math.random());
    colores.push(1.0);
  }
  this.gl.bufferData(this.gl.ARRAY_BUFFER,
    new Float32Array(colores),
    this.gl.STATIC_DRAW);
};

Explosion.prototype.subframe = function(){
  //console.log("Hola");

  this.duracion --;
  if (this.duracion <= 0){
    this.escenario.removeSprite(this);
  }

  this.setScale(this.scale * 1.05);
  //this.rotacion += 0.05;
  //console.log("Explosion Velocidad: " + this.velocidad);
  return this.velocidad;
}

Explosion.prototype.inicializa = function(escenario, translacion, velocidadxy){
  Sprite.prototype.inicializa.call(this, escenario);
  this.velocidad = velocidadxy;
  this.translacion = translacion;
  this.setScale(1);
  this.duracion = 60;
}


