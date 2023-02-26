
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




