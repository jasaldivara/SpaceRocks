
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
    vec2 posicionRotada = vec2 (posicionScale.y * sin(u_rotacion) - posicionScale.x * cos(u_rotacion),
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
    e.inicializa(this.escenario);
    e.translacion[0] = this.translacion[0];
    e.translacion[1] = this.translacion[1];
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
  return[0,0];
}

Explosion.prototype.inicializa = function(escenario, translacion, direccion, nvx, nvy){
  Sprite.prototype.inicializa.call(this, escenario);
  this.setScale(1);
  this.duracion = 60;
}


var tipos = [Nave, Roca, Bala, Explosion];

function inicializa(gl, elemento){
  console.log("WebGL está soportado por el navegador");
  console.log (gl);

  var e = new Escenario(gl, tipos);
  e.crearSprite(Nave);
  e.crearSprite(Roca);
  e.crearSprite(Roca);
  e.crearSprite(Roca);
  e.crearSprite(Roca);
  e.crearSprite(Roca);
  //e.crearSprite(Explosion);
  e.draw();

}



var btnInicia = document.getElementById('btnInicia');
btnInicia.addEventListener('click', function(e){
  //alert (this);

  // Borrando botón para prevenie errores de multiples inicializaiones
  // TODO: Hacer que se reinicie el juego al hqcer click
  this.parentElement.removeChild(this);

  var canvas = document.getElementById('areadejuego');
  canvas.setAttribute('width', window.screen.width);
  canvas.setAttribute('height', window.screen.height);
  //canvas.setAttribute('width', '1200');
  //canvas.setAttribute('height', '800');

  var btnFullscreen = document.getElementById('btn.fullscreen');

  btnFullscreen.addEventListener('click', function(e){
    canvas.requestFullscreen();
    e.preventDefault();
  });

  //var canvas = document.getElementById('lienzo');

  if (canvas.getContext) {

    var gl = canvas.getContext('webgl');
    if (gl){
      inicializa(gl, canvas);
      canvas.requestFullscreen();
    } else {
      alert("Error: Navegador no soporta WebGL");
    }

  } else {

    alert("Navegador no soporta elemento canvas");

  }
});


