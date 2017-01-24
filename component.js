export default {

  _init() {
    const state = this.api.inputState.export();

    const options = {
      canvas: this.api.layoutElement,
      preset: state.data,

      width: state.size.width,
      height: state.size.height,
      cellSize: state.size.cellSize,

      opacity: state.visual.opacity,
      inheritColors: state.visual.inheritColors,
      borderColor: state.visual.borderColor,
      cellColor: state.visual.cellColor,

      interactive: state.other.interactive,
      speed: state.other.speed,
      running: state.other.running
    };

    this.gol = new GoL(options);
  },

  size() {
    const state = this.api.inputState.export();

    this.gol.options.width = state.size.width;
    this.gol.options.height = state.size.height;
    this.gol.options.cellSize = state.size.cellSize;

    this.gol.init();
  },

  visual() {
    const state = this.api.inputState.export();

    this.gol.options.opacity = state.visual.opacity;
    this.gol.options.inheritColors = state.visual.inheritColors;
    this.gol.options.borderColor = state.visual.borderColor;
    this.gol.options.cellColor = state.visual.cellColor;

    this.gol.redraw();
  },

  other() {
    const state = this.api.inputState.export();

    this.gol.options.interactive = state.other.interactive;
    this.gol.options.speed = state.other.speed;
    this.gol.options.running = state.other.running;
  },

  normalize() {
    this.data();
  },

  data() {
    const state = this.api.inputState.export();

    if (state.normalize) {
      const max = { x:0, y:0, r:0, g:0, b:0 };

      state.data.cell.forEach(pixel => {
        if (pixel.x > max.x) max.x = pixel.x;
        if (pixel.y > max.y) max.y = pixel.y;
        if (pixel.r > max.r) max.r = pixel.r;
        if (pixel.g > max.g) max.g = pixel.g;
        if (pixel.b > max.b) max.b = pixel.b;
      });
      max.x = this.gol.options.width / max.x;
      max.y = this.gol.options.height / max.y;
      max.r = 255 / max.r;
      max.g = 255 / max.g;
      max.b = 255 / max.b;
      state.data.cell.forEach(pixel => {
        pixel.x = Math.floor(pixel.x * max.x);
        pixel.y = Math.floor(pixel.y * max.y);
        pixel.r = Math.floor(pixel.r * max.r);
        pixel.g = Math.floor(pixel.g * max.g);
        pixel.b = Math.floor(pixel.b * max.b);
      });
    }

    this.gol.options.preset = state.data.cell;
    this.gol.init();
  },

  reset() {
    this.gol.init();
  }

};