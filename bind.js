
function $(el) {
  return document.querySelector(el);
}

Element.prototype.on = function(event, callback) {
  this.addEventListener(event, callback);
  return this;
}

var $body = $('body');
var $canvas = $('#canvas');
var $configB = $('#configButton');
var $configM = $('#configMenu');
var $stateB = $('#stateButton');
var $resetB = $('#resetButton');
var $speedS = $('#speedSlider');
var $widthMB = $('#widthMinusButton');
var $widthI = $('#widthInput');
var $widthAB = $('#widthAddButton');
var $heightMB = $('#heightMinusButton');
var $heightI = $('#heightInput');
var $heightAB = $('#heightAddButton');
var $cellSizeMB = $('#cellSizeMinusButton');
var $cellSizeI = $('#cellSizeInput');
var $cellSizeAB = $('#cellSizeAddButton');
var $brushColorI = $('#brushColorInput');
var $boardColorB = $('#boardColorButton');
var $opacityB = $('#opacityButton');
var $colorsB = $('#colorsButton');
var $mouseB = $('#mouseButton');
var $saveB = $('#saveButton');
var $defaultB = $('#defaultButton');

// Config Button

$configB.on('click', function() {
  $configM.classList.toggle('open');
  this.classList.toggle('open');
});

// Playback Buttons

$stateB.value = gol.options.state === 'Play' ? 'Pause' : 'Play';

$stateB.on('click', function() {
  gol.options.state = this.value;
  this.value = this.value === 'Play' ? 'Pause' : 'Play';
});

$resetB.on('click', function() {
  gol.init();
});

// Speed Slider

$speedS.value = gol.options.speed;

$speedS.on('input', function() {
  gol.options.speed = this.value;
});

// Width Buttons

$widthI.value = gol.options.widthCells;

$widthI.on('input', function() {
  var maxW = Math.floor(window.innerWidth / gol.options.cellSize);

  if (this.value > maxW) this.value = maxW;
  gol.options.widthCells = this.value;
  gol.init();
});

$widthMB.on('click', function() {
  gol.options.widthCells = $widthI.value-= 1;
  gol.init();
});

$widthAB.on('click', function() {
  var maxW = Math.floor(window.innerWidth / gol.options.cellSize);
  var newW = +$widthI.value + 1;

  if (newW > maxW) return;
  gol.options.widthCells = $widthI.value = newW;
  gol.init();
});

// Height Buttons

$heightI.value = gol.options.heightCells;

$heightI.on('input', function() {
  var maxH = Math.floor(window.innerHeight / gol.options.cellSize);

  if (this.value > maxH) this.value = maxH;
  gol.options.heightCells = this.value;
  gol.init();
});

$heightMB.on('click', function() {
  gol.options.heightCells = $heightI.value-= 1;
  gol.init();
});

$heightAB.on('click', function() {
  var maxH = Math.floor(window.innerHeight / gol.options.cellSize);
  var newH = +$heightI.value + 1;

  if (newH > maxH) return;
  gol.options.heightCells = $heightI.value = newH;
  gol.init();
});

// Cell Size Buttons

$cellSizeI.value = gol.options.cellSize;

$cellSizeI.on('change', function() {
  gol.options.cellSize = this.value;
  var maxW = Math.floor(window.innerWidth / gol.options.cellSize);
  var maxH = Math.floor(window.innerHeight / gol.options.cellSize);

  if ($widthI.value > maxW) {
    $widthI.value = maxW;
    gol.options.widthCells = maxW;
  }
  if ($heightI.value > maxH) {
    $heightI.value = maxH;
    gol.options.heightCells = maxH;
  }
  gol.init();
});

$cellSizeMB.on('click', function() {
  gol.options.cellSize = $cellSizeI.value-= 1;
  gol.init();
});

$cellSizeAB.on('click', function() {
  gol.options.cellSize = $cellSizeI.value = (+$cellSizeI.value + 1);
  var maxW = Math.floor(window.innerWidth / gol.options.cellSize);
  var maxH = Math.floor(window.innerHeight / gol.options.cellSize);

  if ($widthI.value > maxW) {
    $widthI.value = maxW;
    gol.options.widthCells = maxW;
  }
  if ($heightI.value > maxH) {
    $heightI.value = maxH;
    gol.options.heightCells = maxH;
  }
  gol.init();
});

// Brush/Cell Color Input

$brushColorI.value = gol.options.cellColor;

$brushColorI.on('input', function() {
  gol.options.brush = hexToRgb(this.value);
  gol.render();
});

// Board Color Button

$boardColorB.value = gol.options.boardColor === 'Dark Mode' ? 'Light Mode' : 'Dark Mode';
if (gol.options.boardColor === 'Dark Mode') $body.classList.add('dark');

$boardColorB.on('click', function() {
  gol.options.boardColor = this.value;
  this.value = this.value === 'Dark Mode' ? 'Light Mode' : 'Dark Mode';
  $body.classList.toggle('dark');
  gol.render();
});

// Opacity Button

if (gol.options.opacity) $opacityB.classList.add('active');

$opacityB.on('click', function() {
  gol.options.opacity = !gol.options.opacity;
  this.classList.toggle('active');
  gol.render();
});

// Colors Button

if (gol.options.inheritColors) $colorsB.classList.add('active');
$('#colorTitle').innerText = gol.options.inheritColors ? 'Brush Color' : 'Cell Color';

$colorsB.on('click', function() {
  gol.options.inheritColors = !gol.options.inheritColors;
  this.classList.toggle('active');
  $('#colorTitle').innerText = gol.options.inheritColors ? 'Brush Color' : 'Cell Color';
  gol.render();
});

// Mouse Button

if (gol.options.interactive) {
  $mouseB.classList.add('active');
  $canvas.classList.add('pointer');
}

$mouseB.on('click', function() {
  gol.options.interactive = !gol.options.interactive;
  this.classList.toggle('active');
  $canvas.classList.toggle('pointer');
});

// Save Button

$saveB.on('click', function() {
  gol.save();
});

// Default Button

$defaultB.on('click', function() {
  gol.defaults();
});
