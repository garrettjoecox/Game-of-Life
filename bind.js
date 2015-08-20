
function $(el) {
  return document.querySelector(el);
}

Element.prototype.on = function(event, callback) {
  this.addEventListener(event, callback);
  return this;
}

$('.configButtonContainer').on('click', function() {
  $('.config').classList.toggle('open');
  $('.configButtonContainer').classList.toggle('open');
});

$('#stateButton').on('click', function() {
  if (this.value === 'Play') {
    this.value = 'Pause';
    gol.options.state = 'Play';
  } else {
    this.value = 'Play';
    gol.options.state = 'Pause';
  }
});

$('#resetButton').on('click', function() {
  gol.init();
});

$('#speed').on('input', function() {
  gol.options.speed = this.value;
}).value = gol.options.speed;

var $width = $('#width');

$width.on('change', function() {
  gol.options.wCells = this.value;
  gol.init();
}).value = gol.options.wCells;

$('#minusWidth').on('click', function() {
  gol.options.wCells = $width.value-= 1;
  gol.init();
});

$('#addWidth').on('click', function() {
  gol.options.wCells = $width.value = (+$width.value + 1);
  gol.init();
});

var $height = $('#height');

$height.on('change', function() {
  gol.options.hCells = this.value;
  gol.init();
}).value = gol.options.hCells;

$('#minusHeight').on('click', function() {
  gol.options.hCells = $height.value-= 1;
  gol.init();
});

$('#addHeight').on('click', function() {
  gol.options.hCells = $height.value = (+$height.value + 1);
  gol.init();
});

var $size = $('#cellSize');

$size.on('change', function() {
  gol.options.cellSize = this.value;
  gol.init();
}).value = gol.options.cellSize;

$('#minusCellSize').on('click', function() {
  gol.options.cellSize = $size.value-= 1;
  gol.init();
});

$('#addCellSize').on('click', function() {
  gol.options.cellSize = $size.value = (+$size.value + 1);
  gol.init();
});

$('#cellColor').on('change', function() {
  gol.options.rgb = hexToRgb(this.value);
}).value = gol.options.cellColor;

$('#opacity').on('click', function() {
  gol.options.opacity = !gol.options.opacity;
  this.classList.toggle('active');
});

if (gol.options.opacity) {
  $('#opacity').classList.toggle('active');
}

$('#interactive').on('click', function() {
  gol.options.interactive = !gol.options.interactive;
  this.classList.toggle('active');
  $('#canvas').classList.toggle('pointer');
});

if (gol.options.interactive) {
  $('#interactive').classList.toggle('active');
  $('#canvas').classList.toggle('pointer');
}
