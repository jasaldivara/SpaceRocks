/*
 * Copyright 2020, 2023 Jesús Abelardo Saldívar Aguilar
 */

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}


function Escenario(gl, tipos){
  this.gl = gl;
  this.tipos = tipos;
  this.sprites = [];
  var es = this;
  console.log(tipos);

  var vertexShaderSource = `
  // an attribute will receive data from a buffer
  attribute vec3 a_position;
  attribute vec4 a_color;

  uniform float u_sprite_scale;
  uniform vec2 u_resolution;
  uniform float u_escala;
  uniform float u_rotacion;
  uniform vec2 u_translation;

  varying vec4 v_color;

  // all shaders have a main function
  void main() {

    vec3 posicionScale = a_position * u_sprite_scale;
    vec2 posicionRotada = vec2 (
      posicionScale.y * sin(u_rotacion) - posicionScale.x * cos(u_rotacion),
      posicionScale.x * sin(u_rotacion) + posicionScale.y * cos(u_rotacion));

    vec2 position = posicionRotada + u_translation;

    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = position / ( u_resolution * u_escala );

    gl_Position = vec4(zeroToOne, posicionScale.z, 1);

    v_color = a_color;
    gl_PointSize = 4.0;
  }
  `;
  var fragmentShaderSource = `
  // fragment shaders don't have a default precision so we need
  // to pick one. mediump is a good default
  precision mediump float;

  // uniform vec4 u_color;

  varying vec4 v_color;

  void main() {
    // gl_FragColor is a special variable a fragment shader
    // is responsible for setting
    gl_FragColor = v_color;

  }
  `;

  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  var program = createProgram(gl, vertexShader, fragmentShader);
  this.program = program;

  // attribute Locations
  this.positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  this.colorLocation = gl.getAttribLocation(program, "a_color");

  // Uniform locations
  this.resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  this.escalaUniformLocation = gl.getUniformLocation(program, "u_escala");
  this.rotacionUniformLocation = gl.getUniformLocation(program, "u_rotacion");
  this.spriteScaleUniformLocation = gl.getUniformLocation(program, "u_sprite_scale");
  // var colorUniformLocation = gl.getUniformLocation(program, "u_color");
  this.translationLocation = gl.getUniformLocation(program, "u_translation");

  this.resolution = [1, 1];
  this.zoom = 16;
  this.t = 0;

  if ( gl.canvas.width >  gl.canvas.height ){
    this.resolution[0] =  gl.canvas.width /  gl.canvas.height;
  } else {
    this.resolution[1] = gl.canvas.height / gl.canvas.width;
  }

  this.sonido = new Sonido();

  tipos.forEach(function(item, index){
    //console.log(item);
    item.prototype.protoInit(es);
  });
}
Escenario.prototype = {
  /*
  addSprite: function (sprite){
    this.sprites.push(sprite);
  },
  */
  crearSprite: function(prototipo){
    var s = new prototipo();
    s.inicializa(this);
    this.sprites.push(s);
    return s;
  },
  removeSprite: function (sprite){
    var i  = this.sprites.indexOf(sprite);
    if (i > -1){
      this.sprites.splice(i, 1);
    }
  },
  draw: function (tiempo){
    this.gl.useProgram(this.program);
    var gl = this.gl;

    // set the resolution
    this.gl.uniform2f(this.resolutionUniformLocation, this.resolution[0], this.resolution[1]);
    this.gl.uniform1f(this.escalaUniformLocation, this.zoom);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // Clear the canvas
    // var b = this.t / 100;
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Iterar en todos los sprites registrados, llamar Sprite.draw()
    this.sprites.forEach(function(item, index){
      item.draw();
    });

    // console.log(this);
    var e = this;
    setTimeout(function(){
      e.frame();
    }, 30);
    return;
  },
  frame: function (){
    this.t ++;
    var e = this;
    // console.log(this);
    // console.log(this.draw);

    // Iterar en todos los sprites registrados, llamar Sprite.frame()
    this.sprites.forEach(function(item, index){
      item.frame();
    });

    // Loop de detección de colisiones
    var spclon = this.sprites.slice();

    spclon.forEach(function(item, index){
      spclon.forEach(function(item2, index2){
        if (item2 === item){
          return;
        }
        var instancia = false;
        var tipos = item.tiposColisiona();
        if (! tipos){
          return;
        }
        for (var a = 0; a < tipos.length; a++){
          if (item2 instanceof tipos[a]){
            instancia = true;
            break;
          }
        }
        if (! instancia){
          return;
        }
        var dx = Math.abs(item.translacion[0] - item2.translacion[0]);
        var dy = Math.abs(item.translacion[1] - item2.translacion[1]);
        var d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
        var sr = item.radio() + item2.radio();
        if (sr > d){
          //alert('Colision');
          item.eventoColisiona(item2);
        }
      });
    });

    requestAnimationFrame(function(tiempo){
      e.draw(tiempo);
    });
    return;
  }
};


