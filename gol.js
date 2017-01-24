
/**
 class GoL
 @method init()
   Resets entire game
 @method step()
   Advance a step in the game
 @method redraw()
   Redraws board with current game and settings
 */
class GoL {

  constructor(options) {

    this.options = options;
    this.options.brush = hexToRgb(this.options.cellColor);
    this.board = new Board(this.options);

    this.init();

    const self = this;
    (function clock() {
      if (self.options.running) self.step();

      setTimeout(clock, self.options.speed);
    })();
  }

  init() {

    this.matrix = new Matrix(this.options.width, this.options.height, this.options.preset);
    this.board.onCellClick(cell => {
      if (this.options.interactive) {
        this.matrix.toggle({
          age: 1,
          x: cell.x,
          y: cell.y,
          r: this.options.brush.r,
          g: this.options.brush.g,
          b: this.options.brush.b,
          canRemove: cell.canRemove
        });

        this.redraw();
      }
    });
    this.redraw();
  }

  redraw() {

    this.board.render(this.matrix);
  }

  step() {

    this.matrix.step();
    this.redraw();
  }
}


/**
 class Board
 @constructor(options)
 @method render(matrix)
   Draw the provided matrix onto the canvas
 @method onCellClick(callback)
   Attach listener for toggle cell events
 */
class Board {

  constructor(options) {

    this.options = options;

    if (typeof this.options.canvas === 'string') this.canvas = document.querySelector(this.options.canvas);
    else if (this.options.canvas instanceof HTMLElement) this.canvas = this.options.canvas;
    else {
      this.canvas = document.createElement('canvas');
      document.body.appendChild(this.canvas);
    }

    this.canvas.setAttribute('width', this.options.width * this.options.cellSize);
    this.canvas.setAttribute('height', this.options.height * this.options.cellSize);
    this.context = this.canvas.getContext('2d');

    this.bindMouseEvents();
  }

  render(matrix) {

    this.canvas.setAttribute('width', this.options.width * this.options.cellSize);
    this.canvas.setAttribute('height', this.options.height * this.options.cellSize);
    this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.context.strokeStyle = this.options.borderColor;

    matrix.cells.forEach(row => {

      row.forEach(cell => {

        this.context.beginPath();
        this.context.rect(cell.x * this.options.cellSize, cell.y * this.options.cellSize, this.options.cellSize, this.options.cellSize);

        if (cell.age) {
          this.context.fillStyle = this.getColor(cell);
          this.context.fill();
        }

        this.context.stroke();
      });
    });
  }

  getColor(cell) {

    if (this.options.opacity && this.options.inheritColors) {
      return `rgba(${cell.r}, ${cell.g}, ${cell.b}, ${cell.age * 0.1})`;
    } else if (this.options.opacity) {
      return `rgba(${this.options.brush.r}, ${this.options.brush.g}, ${this.options.brush.b}, ${cell.age * 0.1})`;
    } else if (this.options.inheritColors) {
      return `rgb(${cell.r}, ${cell.g}, ${cell.b})`;
    } else {
      return `rgb(${this.options.brush.r}, ${this.options.brush.g}, ${this.options.brush.b})`;
    }
  }

  onCellClick(callback) {

    this.onCellClickCallback = callback;
  }

  bindMouseEvents() {
    let mouseMoved = false;

    this.canvas.addEventListener('mousedown', () => {
      mouseMoved = false;
      this.canvas.addEventListener('mousemove', mouseMove, true);
    });

    this.canvas.addEventListener('mouseup', () => {
      this.canvas.removeEventListener('mousemove', mouseMove, true);
    });

    this.canvas.addEventListener('click', e => {
      if (!mouseMoved) toggle(e.offsetX, e.offsetY, true);
    });

    const self = this;
    function mouseMove(e) {
      if (!e.buttons && !e.which) {
        self.canvas.removeEventListener('mousemove', mouseMove, true);
        return;
      }

      mouseMoved = true;
      toggle(e.offsetX , e.offsetY);
    }
    function toggle(x, y, canRemove) {
      self.onCellClickCallback({
        x: Math.floor(x / self.options.cellSize),
        y: Math.floor(y / self.options.cellSize),
        canRemove: canRemove
      });
    }
  }
}


/**
 class Matrix
 @constructor(width, height, preset)
 @method step()
   Advance all cells a single step
 */
class Matrix {

  constructor(width, height, preset) {
    this.cells = [];

    for (let w = 0; w < width; w++) {
      this.cells[w] = [];
      for (let h = 0; h < height; h++) {
        this.cells[w][h] = new Cell({ x: w, y: h });
      }
    }

    if (preset) {
      preset.forEach(cell => {
        if (this.cells[cell.x] && this.cells[cell.x][cell.y]) this.cells[cell.x][cell.y] = new Cell(cell);
      });
    }

  }

  step() {
    let cells = [];

    this.cells.forEach((row, w) => {
      cells[w] = [];

      row.forEach((oldCell, h) => {
        let cell = cells[w][h] = new Cell(oldCell);
        let neighbours = this.getNeighbours(cell);

        // If alive
        if (cell.age > 0) {
          // if too many or too little neighbours
          if (neighbours.length > 3 || neighbours.length < 2) cell.age = 0;
          else cell.age++;

        // If dead and 3 neighbours
        } else if (neighbours.length === 3) {
          cell.age++;
          cell.r = neighbours[0].r;
          cell.g = neighbours[1].g;
          cell.b = neighbours[2].b;
        }
      });
    });

    this.cells = cells;
  }

  getNeighbours(cell) {
    let self = this;
    let neighbours = [];
    pushIfAlive(cell.x-1, cell.y  );
    pushIfAlive(cell.x-1, cell.y-1);
    pushIfAlive(cell.x  , cell.y-1);
    pushIfAlive(cell.x+1, cell.y-1);
    pushIfAlive(cell.x+1, cell.y  );
    pushIfAlive(cell.x+1, cell.y+1);
    pushIfAlive(cell.x  , cell.y+1);
    pushIfAlive(cell.x-1, cell.y+1);
    return neighbours;

    function pushIfAlive(x, y) {
      if (self.cells[x] && self.cells[x][y] && self.cells[x][y].age > 0) neighbours.push(self.cells[x][y]);
    }
  }

  toggle(cell) {
    if (this.cells[cell.x] && this.cells[cell.x][cell.y]) {
      if (this.cells[cell.x][cell.y].age > 0 && cell.canRemove) this.cells[cell.x][cell.y].age = 0;
      else {
        this.cells[cell.x][cell.y] = new Cell(cell);
      }
    }
  }
}


class Cell {
  constructor({ age = 0, r = 255, g = 255, b = 255, x = 0, y = 0 }) {
    this.age = age;
    this.r = r;
    this.g = g;
    this.b = b;
    this.x = x;
    this.y = y;
  }
}

function hexToRgb(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : {r: 255, g: 255, b: 255};
}