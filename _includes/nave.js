/*
 * Copyright 2020, 2023 Jesús Abelardo Saldívar Aguilar
 */


function Nave(){}
Nave.prototype = new Sprite();
Nave.prototype.tiposColisiona = function(){
  return [Roca];
};
Nave.prototype.eventoColisiona = function(spcon){
  if (spcon instanceof Roca){
    this.escenario.removeSprite(this);
    this.escenario.sonido.hazRuido();
    var e = new Explosion();
    let nvx = this.velocidadAvanza[0] / 3;
    let nvy = this.velocidadAvanza[1] / 3;
    e.inicializa(this.escenario, this.translacion, [nvx, nvy]);
    this.escenario.sprites.push(e);
  }
};
Nave.prototype.protoInit = function(escenario){
  Sprite.prototype.protoInit.call(this, escenario);
  this.velocidadRota = 4;
  this.velocidadAvanza = [0, 0];
  this.aceleraAvanza = 1;
}
Nave.prototype.inicializa = function(escenario){
  Sprite.prototype.inicializa.call(this, escenario);
  //this.setScale(2.5);
  //this.pointsCount = 6;

  // TODO: Mover estos a su propia función u objeto de contol por teclado (o joystick)
  this.kmas = false;
  this.kmenos = false;
  this.kleft = false;
  this.kright = false;
  this.kup = false;
  // this.space = false;

  s = this;
  // Manejador de teclado
  window.addEventListener("keydown", function(e){
    // console.log(e);
    switch(e.key){
      case '+':
        s.kmas = true;
        break;
      case '-':
        s.kmenos = true;
        break;
      case 'ArrowLeft':
        s.kleft = true;
        break;
      case 'ArrowRight':
        s.kright = true;
        break;
      case 'ArrowUp':
        s.kup = true;
        break;
      case ' ':
        s.dispara();
        break;
      default:
        return;
    }
    e.preventDefault();
    return;
  }, false);

  window.addEventListener("keyup", function(e){
    switch(e.key){
      case '+':
        s.kmas = false;
        break;
      case '-':
        s.kmenos = false;
        break;
      case 'ArrowLeft':
        s.kleft = false;
        break;
      case 'ArrowRight':
        s.kright = false;
        break;
      case 'ArrowUp':
        s.kup = false;
        break;
    }
  });
}
Nave.prototype.setGeometry = function(){
  var gl = this.gl;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0, 1, 0,
    0.75, -1, 0,
    0, -0.5, 0,
    0, -0.5, 0,
    -0.75, -1, 0,
    0, 1, 0
  ]), gl.STATIC_DRAW);
};
Nave.prototype.setColors = function(){
  var gl = this.gl;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    0.75, 1, 0.8, 1,
    0.2, 0.5, 0.75, 1,
    0.2, 1, 0.8, 1,
    0.25, 0.75, 0.8, 1,
    0.5, 0.75, 0.9, 1,
    0.5, 0.65, 0.75, 1
  ]), gl.STATIC_DRAW);
};
Nave.prototype.pointsCount = function(){
  return 6;
}
Nave.prototype.subframe = function(){
  const deltaTime = 0.03;
  var e = this.escenario;

  if (this.kmas){
    this.zoom += deltaTime * this.velocidadZoom;
  }
  if (this.kmenos){
    this.zoom -= deltaTime * this.velocidadZoom;
  }
  if (this.kleft){
    this.rotacion -= deltaTime * this.velocidadRota;
  }
  if (this.kright){
    this.rotacion += deltaTime * this.velocidadRota;
  }
  if (this.kup){
    // rotacion += deltaTime * velocidadRota;
    this.velocidadAvanza[0] += deltaTime * this.aceleraAvanza * Math.sin(this.rotacion);
    this.velocidadAvanza[1] += deltaTime * this.aceleraAvanza * Math.cos(this.rotacion);
  } else {
    if (this.velocidadAvanza[0] > 0) {
      this.velocidadAvanza[0] -= deltaTime * this.aceleraAvanza * 0.25;
    } else if  (this.velocidadAvanza[0] < 0) {
      this.velocidadAvanza[0] += deltaTime * this.aceleraAvanza * 0.25;
    }
    if (this.velocidadAvanza[1] > 0) {
      this.velocidadAvanza[1] -= deltaTime * this.aceleraAvanza * 0.25;
    } else if  (this.velocidadAvanza[1] < 0) {
      this.velocidadAvanza[1] += deltaTime * this.aceleraAvanza * 0.25;
    }
  }

  return this.velocidadAvanza;
}
Nave.prototype.dispara = function(){
  var b = new Bala();
  var t = [this.translacion[0], this.translacion[1]];
  b.inicializa(this.escenario, t, this.rotacion, this.velocidadAvanza[0], this.velocidadAvanza[1]);
  this.escenario.sprites.push(b);
  this.escenario.sonido.dispara();
}

