/*
 * Copyright 2020, 2023 Jesús Abelardo Saldívar Aguilar
 */


function Bala(){}
Bala.prototype = new Sprite();
Bala.prototype.tiposColisiona = function(){
  return [Roca];
};
Bala.prototype.eventoColisiona = function(spcon){
  if (spcon instanceof Roca){
    console.log("colision:");
    console.log(this);
    console.log(spcon);
    this.escenario.removeSprite(spcon);
    this.escenario.removeSprite(this);
    this.escenario.sonido.hazRuido();


    if (spcon.tamano > 0){
      var t = spcon.tamano - 1;
      var r1 = new Roca();
      r1.inicializa(this.escenario, t);
      r1.translacion[0] = spcon.translacion[0];
      r1.translacion[1] = spcon.translacion[1];
      this.escenario.sprites.push(r1);

      var r2 = new Roca();
      r2.inicializa(this.escenario, t);
      r2.translacion[0] = spcon.translacion[0];
      r2.translacion[1] = spcon.translacion[1];
      this.escenario.sprites.push(r2);
    }
  }
};
Bala.prototype.radio = function(){
  return 0;
};
Bala.prototype.setGeometry = function(){
  var gl = this.gl;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 0, 0
    ]), gl.STATIC_DRAW);
};
Bala.prototype.setColors = function(){
  var gl = this.gl;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    1, 0, 0.25, 1,
  ]), gl.STATIC_DRAW);
};
Bala.prototype.pointsCount = function(){
  return 1;
};
Bala.prototype.primitive = function(){
  return this.gl.POINTS;
};
Bala.prototype.inicializa = function(escenario, translacion, direccion, nvx, nvy){
  Sprite.prototype.inicializa.call(this, escenario);

  translacion[0] += 1 * Math.sin(direccion);
  translacion[1] += 1 * Math.cos(direccion);

  this.translacion = translacion;
  //this.direccion = direccion;
  var velocidad = 0.25;
  this.vx = (velocidad * Math.sin(direccion)) + nvx;
  this.vy = (velocidad * Math.cos(direccion)) + nvy;
  this.duracion = (escenario.zoom - 1) * 2 / velocidad;
  //console.log(escenario);
};
Bala.prototype.subframe = function(){
  var e = this.escenario;

  this.duracion --;
  if (this.duracion <= 0){
    e.removeSprite(this);
  }

  //this.translacion[0] += this.vx;
  //this.translacion[1] += this.vy;
  return [this.vx, this.vy];
}

