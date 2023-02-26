/*
 * Copyright 2020, 2023 Jesús Abelardo Saldívar Aguilar
 */

function Roca(){
  //this.pointsCount = 33;
}
Roca.prototype = new Sprite();

Roca.prototype.getPositionBuffer = function(){
  return this.geometry[this.indiceGrafico];
};
Roca.prototype.getColorBuffer = function(){
  return this.colors[this.indiceGrafico];
};
Roca.prototype.pointsCount = function(){
  return this.points[this.indiceGrafico];
}
Roca.prototype.primitive = function(){
  return this.gl.TRIANGLE_FAN;
}
Roca.prototype.subframe = function (){
  var e = this.escenario;
  var d = [];
  d[0] = this.velocidad * Math.sin(this.direccion);
  d[1] = this.velocidad * Math.cos(this.direccion);
  return d;
}
Roca.prototype.protoInit = function(escenario){
  var gl = escenario.gl;
  this.gl = gl;
  this.geometry = [];
  this.colors = [];
  this.points = [];

  for (var i = 0; i < this.graficos.length; i++){
    console.log(i);
    this.geometry[i] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.geometry[i]);
    console.log(this.graficos[i].geometry);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.graficos[i].geometry), gl.STATIC_DRAW);
    this.colors[i] = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colors[i]);
    console.log(this.graficos[i].color);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.graficos[i].color), gl.STATIC_DRAW);
    console.log(this.graficos[i].points);
    this.points[i] = this.graficos[i].points;
  }
}
Roca.prototype.graficos = [
  {
    geometry: [
      0, 0, 0,
      -0.5, 0.5, 0,
      -0.5, 1, 0,
      0.5, 1, 0,
      1, 0.5, 0,
      1, 0, 0,
      0.5, -0.5, 0,
      0.5, -1, 0,
      0, -1, 0,
      -0.5, -0.5, 0,
      -1, -0.5, 0,
      -1, 0, 0,
      -0.5, 0.5, 0
    ],
    color: [
      0.9, 0.75, 0.2, 1,
      0.9, 0.75, 0.3, 1,
      0.8, 0.8, 0.2, 1,
      0.8, 0.5, 0.2, 1,
      0.9, 0.65, 0.15, 1,
      0.9, 0.75, 0.25, 1,
      0.8, 0.75, 0.2, 1,
      0.9, 0.65, 0.2, 1,
      0.9, 0.7, 0.25, 1,
      0.95, 0.85, 0.15, 1,
      0.8, 0.6, 0.3, 1,
      0.8, 0.75, 0.4, 1,
      0.8, 0.65, 0.1, 1,
    ],
    points: 13
  },
  {
    geometry: [
      0, 0, 0,
      -0.75, 0.65, 0,
      -0.85, 0.7, 0,
      0.65, 0.5, 0,
      0.9, 0.35, 0,
      0.7, 0.1, 0,
      0.35, -0.65, 0,
      0.25, -1.2, 0,
      0.1, -0.85, 0,
      -0.65, -0.65, 0,
      -0.9, -0.75, 0,
      -0.85, 0.25, 0
    ],
    color: [
      0.9, 0.75, 0.2, 1,
      0.9, 0.75, 0.3, 1,
      0.8, 0.8, 0.2, 1,
      0.8, 0.5, 0.2, 1,
      0.9, 0.65, 0.15, 1,
      0.9, 0.75, 0.25, 1,
      0.8, 0.75, 0.2, 1,
      0.9, 0.65, 0.2, 1,
      0.9, 0.7, 0.25, 1,
      0.95, 0.85, 0.15, 1,
      0.8, 0.6, 0.3, 1,
      0.8, 0.75, 0.4, 1,
    ],
    points: 12
  },
  {
    geometry: [
      0, 0.5, 0,
      0.5, 0.5, 0,
      0.5, 0, 0,
      0.5, -0.5, 0,
      0, -0.5, 0,
      -0.5, 0, 0,
      -0.5, 0.5, 0
    ],
    color: [
      0.9, 0.75, 0.2, 1,
      0.9, 0.75, 0.3, 1,
      0.8, 0.8, 0.2, 1,
      0.8, 0.5, 0.2, 1,
      0.9, 0.65, 0.15, 1,
      0.9, 0.75, 0.25, 1,
      0.8, 0.75, 0.2, 1,
    ],
    points: 7
  },
  {
    geometry: [
      0, 0.5, 0,
      0.5, 0, 0,
      0, -0.5, 0,
      -0.25, 0, 0,
      -0.5, 0, 0
    ],
    color: [
      0.9, 0.65, 0.2, 1,
      0.9, 0.7, 0.25, 1,
      0.95, 0.85, 0.15, 1,
      0.8, 0.6, 0.3, 1,
      0.8, 0.75, 0.4, 1
    ],
    points: 5
  }
];
Roca.prototype.clasesGraficas = [
  {
    graf: [2, 3],
    radio: 0.75,
    velocidad: 0.15
  },
  {
    graf: [0, 1],
    radio: 1,
    velocidad: 0.05
  }
];
Roca.prototype.radio = function(){
  return this.clasegrafica.radio;
};
Roca.prototype.inicializa = function(escenario, tamano = 1){
  Sprite.prototype.inicializa.call(this, escenario);

  this.tamano = tamano;
  this.clasegrafica = this.clasesGraficas[tamano];
  this.indiceGrafico = this.clasegrafica.graf[Math.floor(Math.random() * this.clasegrafica.graf.length)];

  this.velocidad = this.clasegrafica.velocidad;
  this.direccion = Math.random() * 2 * Math.PI;

  var w = escenario.zoom * escenario.resolution[0] * 2;
  this.translacion[0] = (w * Math.random()) - (w / 2);
  var h = escenario.zoom * escenario.resolution[1] * 2;
  this.translacion[1] = (h * Math.random()) - (h / 2);
}


