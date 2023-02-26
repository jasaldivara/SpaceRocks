/*
 * Copyright 2020, 2023 Jesús Abelardo Saldívar Aguilar
 */


function Sprite(){
}
Sprite.prototype = {
  firstPoint: function(){
    return 0;
  },
  pointsCount: function(){
    return 0;
  },
  primitive: function(){
    return this.gl.TRIANGLES;
  },
  tiposColisiona: function(){
    return null;
  },
  eventoColisiona: function(spcon){},
  radio: function(){
    return 1;
  },
  getPositionBuffer: function(){
    return this.positionBuffer;
  },
  getColorBuffer: function(){
    return this.colorBuffer;
  },
  protoInit: function(escenario){
    var gl = this.gl = escenario.gl;

    this.positionBuffer = escenario.gl.createBuffer();
    this.colorBuffer = escenario.gl.createBuffer();

    escenario.gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
    this.setGeometry();
    escenario.gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
    this.setColors();

  },
  inicializa: function(escenario){
    this.translacion = [0, 0]
    this.rotacion = 0;
    this.scale = 1;

    this.escenario = escenario;
    //escenario.addSprite(this);

  },
  setTranslacion: function(translacion){
    this.translacion = translacion;
  },
  setRotacion: function(rotacion){
    this.rotacion = rotacion;
  },
  setScale: function(scale){
    this.scale = scale;
  },
  setGeometry: function(){},
  setColors: function(){},
  draw: function(){
    var gl = this.escenario.gl;
    gl.enableVertexAttribArray(this.escenario.positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.getPositionBuffer());
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 3;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        this.escenario.positionAttributeLocation, size, type, normalize, stride, offset);
    gl.enableVertexAttribArray(this.escenario.colorLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.getColorBuffer());
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 4;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        this.escenario.colorLocation, size, type, normalize, stride, offset);
    gl.uniform2fv(this.escenario.translationLocation, this.translacion);
    gl.uniform1f(this.escenario.rotacionUniformLocation, this.rotacion);
    gl.uniform1f(this.escenario.spriteScaleUniformLocation, this.scale);
    gl.drawArrays(this.primitive(), this.firstPoint(), this.pointsCount());  // La cantidad de puntos a procesar depende de la clase en particular
  },
  frame: function(){
    var delta = this.subframe();
    var e = this.escenario;

    if ((delta[0] > 0) && (this.translacion[0] + delta[0] > (e.zoom * e.resolution[0]) + 1)){
      this.translacion[0] = (e.zoom * e.resolution[0] * -1) - 1;
    } else if ((delta[0] < 0) && (this.translacion[0] + delta[0] < (e.zoom * e.resolution[0] * -1) - 1)){
      this.translacion[0] = (e.zoom * e.resolution[0]) + 1;
    } else {
      this.translacion[0] += delta[0]
    }
    if ((delta[1] > 0) && (this.translacion[1] + delta[1] > (e.zoom * e.resolution[1]) + 1)){
      this.translacion[1] = (e.zoom * e.resolution[1] * -1) - 1;
    } else if ((delta[1] < 0) && (this.translacion[1] + delta[1] < (e.zoom * e.resolution[1] * -1) - 1)){
      this.translacion[1] = (e.zoom * e.resolution[1]) + 1;
    } else {
      this.translacion[1] += delta[1]
    }

  },
  subframe: function(){
    return [0,0];
  }
};

