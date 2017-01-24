
function $(el) {
  return document.querySelector(el);
}

Element.prototype.on = function(event, callback) {
  this.addEventListener(event, callback);
  return this;
}

const $body = $('body');
const $canvas = $('#canvas');

// Config Button

const $cog = $('.cogContainer');
const $config = $('.configContainer');

$cog.on('click', function() {
  $config.classList.toggle('open');
});

// Playback Buttons

const $runningB = $('#runningButton');
const $stepB = $('#stepButton');
const $resetB = $('#resetButton');

$runningB.value = gol.options.running ? 'Pause' : 'Play';

$runningB.on('click', () => {
  if ($runningB.value === 'Play') {
    gol.options.running = true;
    $runningB.value = 'Pause';
  } else {
    gol.options.running = false;
    $runningB.value = 'Play';
  }
});

$stepB.on('click', () => gol.step());

$resetB.on('click', () => gol.init());

// Speed Slider

const $speedS = $('#speedSlider');

$speedS.value = gol.options.speed;

$speedS.on('input', () => gol.options.speed = $speedS.value);

// Width Buttons

const $widthSB = $('#widthSButton');
const $widthAB = $('#widthAButton');
const $widthI = $('#widthInput');

$widthI.value = gol.options.width;

$widthI.on('change', () => {
  gol.options.width = $widthI.value = Math.max(1, Math.min(Math.floor(window.innerWidth / gol.options.cellSize), $widthI.value)) || 1;
  gol.init();
});

$widthSB.on('click', () => {
  gol.options.width = $widthI.value = Math.max($widthI.value - 1, 1);
  gol.init();
});

$widthAB.on('click', () => {
  gol.options.width = $widthI.value = Math.min(+$widthI.value + 1, Math.floor(window.innerWidth / gol.options.cellSize));
  gol.init();
});

// Height Buttons

const $heightSB = $('#heightSButton');
const $heightAB = $('#heightAButton');
const $heightI = $('#heightInput');

$heightI.value = gol.options.height;

$heightI.on('change', () => {
  gol.options.height = $heightI.value = Math.max(1, Math.min(Math.floor(window.innerHeight / gol.options.cellSize), $heightI.value)) || 1;
  gol.init();
});

$heightSB.on('click', () => {
  gol.options.height = $heightI.value = Math.max($heightI.value - 1, 1);
  gol.init();
});

$heightAB.on('click', () => {
  gol.options.height = $heightI.value = Math.min(+$heightI.value + 1, Math.floor(window.innerHeight / gol.options.cellSize));
  gol.init();
});

// Cell Size Buttons

const $cellSizeSB = $('#cellSizeSButton');
const $cellSizeAB = $('#cellSizeAButton');
const $cellSizeI = $('#cellSizeInput');

$cellSizeI.value = gol.options.cellSize;

$cellSizeI.on('change', () => {
  gol.options.cellSize = $cellSizeI.value = Math.max(1, $cellSizeI.value) || 1;
  gol.options.width = $widthI.value = Math.max(1, Math.min(Math.floor(window.innerWidth / gol.options.cellSize), $widthI.value)) || 1;
  gol.options.height = $heightI.value = Math.max(1, Math.min(Math.floor(window.innerHeight / gol.options.cellSize), $heightI.value)) || 1;

  gol.init();
});

$cellSizeSB.on('click', () => {
  gol.options.cellSize = $cellSizeI.value = Math.max(1, $cellSizeI.value - 1) || 1;
  gol.init();
});

$cellSizeAB.on('click', () => {
  gol.options.cellSize = $cellSizeI.value = Math.max(1, +$cellSizeI.value + 1) || 1;
  gol.options.width = $widthI.value = Math.max(1, Math.min(Math.floor(window.innerWidth / gol.options.cellSize), $widthI.value)) || 1;
  gol.options.height = $heightI.value = Math.max(1, Math.min(Math.floor(window.innerHeight / gol.options.cellSize), $heightI.value)) || 1;

  gol.init();
});

// Brush/Cell Color Input

const $cellColorT = $('#cellColorTitle');
const $cellColorI = $('#cellColorInput');

$cellColorI.value = gol.options.cellColor;

$cellColorI.on('input', () => {
  gol.options.brush = hexToRgb($cellColorI.value);
  gol.redraw();
});

// Board Theme Buttons

const $lightB = $('#lightThemeButton');
const $darkB = $('#darkThemeButton');

$lightB.on('click', () => {
  $body.classList.remove('dark');
  $darkB.classList.remove('active');
  $lightB.classList.add('active');
  gol.options.borderColor = '#EEE';

  gol.redraw();
});

$darkB.on('click', () => {
  $body.classList.add('dark');
  $lightB.classList.remove('active');
  $darkB.classList.add('active');
  gol.options.borderColor = '#333';

  gol.redraw();
});

// Toggles Buttons

const $opacityB = $('#opacityButton');
const $colorsB = $('#colorsButton');
const $mouseB = $('#mouseButton');

if (gol.options.opacity) $opacityB.classList.add('active');
if (gol.options.inheritColors) $colorsB.classList.add('active');
if (gol.options.interactive) $mouseB.classList.add('active');

$opacityB.on('click', () => {
  gol.options.opacity = !gol.options.opacity;
  $opacityB.classList.toggle('active');
  gol.redraw();
});

$colorsB.on('click', () => {
  gol.options.inheritColors = !gol.options.inheritColors;
  $cellColorT.innerText = gol.options.inheritColors ? 'Brush Color' : 'Cell Color';
  $colorsB.classList.toggle('active');
  gol.redraw();
});

$mouseB.on('click', () => {
  gol.options.interactive = !gol.options.interactive;
  $mouseB.classList.toggle('active');
});

// // Save Button

// $saveB.on('click', function() {
//   gol.save();
// });

// // Default Button

// $defaultB.on('click', function() {
//   gol.defaults();
// });
