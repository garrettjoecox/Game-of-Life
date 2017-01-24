
options
init (reset)
redraw
save
defaults

class GoL {

  constructor(options, canvas) {

    this.options = options;
    this.board = new Board(options, canvas);

    this.init();

    let self = this;

    (function c() {
      if (self.options.state === 'Play') {

        self.matrix.step();
        self.board.render(self.matrix.cells);

      }
      setTimeout(c, self.options.speed);
    })();
  }

  init() {

    this.matrix = new Matrix(this.options.rows, this.options.columns, this.options.preset);
    this.board.render(this.matrix.cells);

  }

  export() {

  }

}

class Board {

  constructor(options, canvas) {

    this.options = options;
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
    this.canvas.setAttribute('width', this.options.columns * this.options.cellSize)
    this.canvas.setAttribute('height', this.options.rows * this.options.cellSize)

  }

  render(matrix) {

    this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.context.strokeStyle = this.options.borderColor;
    matrix.forEach(row => {
      row.forEach(cell => {
        this.context.beginPath();
        this.context.rect(cell.x * this.options.cellSize, cell.y * this.options.cellSize, this.options.cellSize, this.options.cellSize);

        if (cell.age) {
          this.context.fillStyle = this.options.cellColor;
          this.context.fill();
        } else {
          this.context.stroke();
        }
      });
    });

  }

}

class Matrix {

  constructor(rows, columns, preset) {
    this.cells = [];

    for (let r = 0; r < rows; r++) {
      this.cells[r] = [];
      for (let c = 0; c < columns; c++) {
        this.cells[r][c] = new Cell({
          matrix: this,
          x: r,
          y: c
        });
      }
    }

    if (preset) {
      preset.forEach(c => {
        c.matrix = this;
        if (this.cells[c.x] && this.cells[c.x][c.y]) this.cells[c.x][c.y] = new Cell(c);
      });
    }
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

  step() {
    this.cells.forEach(row => row.forEach(cell => cell.step()));
  }

}

class Cell {

  constructor({ age = 0, r = 255, g = 255, b = 255, x = 0, y = 0, matrix }) {
    this.age = age;
    this.r = r;
    this.g = g;
    this.b = b;
    this.x = x;
    this.y = y;
    this.matrix = matrix;
  }

  toggle() {

  }

  step() {
    let neighbours = this.matrix.getNeighbours(this);

    if (this.age > 0) {

      if (neighbours.length === 2 || neighbours.length === 3) {
        this.age++;
      } else {
        this.age = 0;
      }

    } else if (neighbours.length === 3) {

      this.age++;
      this.r = neighbours[0].r;
      this.g = neighbours[1].g;
      this.b = neighbours[2].b;

    }
  }

}

function GoL(options, id){

  var self = this;

  // Hacky, fix this.
  self.options = JSON.parse(JSON.stringify(options));

  self.canvasElement = document.querySelector(id);
  self.canvasElement.setAttribute('width', self.options.width);
  self.canvasElement.setAttribute('height', self.options.height);
  self.context = self.canvasElement.getContext('2d');
  self.options.widthCells = Math.floor(options.width / options.cellSize);
  self.options.heightCells = Math.floor(options.height / options.cellSize);
  self.options.brush = hexToRgb(self.options.cellColor);
  self.context.strokeStyle = self.options.gridColor;

  self.bindMouseEvents();
  self.init();

  (function c() {
    if (self.options.state === 'Play') self.step();
    setTimeout(c, self.options.speed);
  })();
}

GoL.prototype.init = function() {

  var self = this;
  self.cells = [];

  for (var i = 0; i < self.options.widthCells; i++) {
    self.cells[i] = [];
    for (var j = 0; j < self.options.heightCells; j++) {
      self.cells[i][j] = { life: 0 };
    }
  }

  self.loadPreset();
  self.render();
}

GoL.prototype.loadPreset = function() {
  var self = this;
  var preset = localStorage.preset ? JSON.parse(localStorage.preset) : self.options.preset

  if (preset) {
    preset.forEach(function(cell) {
      if (Array.isArray(cell) && self.cells[cell[0]] && self.cells[cell[0]][cell[1]]) {
        self.cells[cell[0]][cell[1]] = {
          life: 1,
          r: 255,
          g: 255,
          b: 255
        }
      } else if(cell.x && cell.y && self.cells[cell.x] && self.cells[cell.x][cell.y]) {
        self.cells[cell.x][cell.y] = {
          life: cell.life || 1,
          r: cell.r === undefined ? 255 : cell.r,
          g: cell.g === undefined ? 255 : cell.g,
          b: cell.b === undefined ? 255 : cell.b
        }
      }
    });
  }
}

GoL.prototype.save = function() {
  var self = this;
  var snapshot = [];

  self.cells.forEach(function(row, x) {
    row.forEach(function(cell, y) {
      if (cell.life) {
        cell.x = x;
        cell.y = y;
        snapshot.push(cell);
      };
    });
  });

  localStorage.preset = JSON.stringify(snapshot);
}

GoL.prototype.defaults = function() {
  var self = this;

  localStorage.removeItem('preset');
  self.init();
}

GoL.prototype.step = function() {
  var self = this;
  var newCells = [];

  self.cells.forEach(function(row, x) {
    newCells[x] = [];
    row.forEach(function(cell, y) {
      var neighbours = getNeighbours(x, y);
      var newCell = {life: 0};

      if (cell.life) {
        if (neighbours.length === 2 || neighbours.length === 3) {
          newCell.life = (cell.life + 1);
          newCell.r = cell.r;
          newCell.g = cell.g;
          newCell.b = cell.b;
        }
      } else if(neighbours.length === 3) {
        newCell.life = 1;
        newCell.r = neighbours[0].r;
        newCell.g = neighbours[1].g;
        newCell.b = neighbours[2].b;
      }

      newCells[x][y] = newCell;

    });
  });

  self.cells = newCells;
  self.render();

  function getNeighbours(x, y) {
    var neighbours = [];
    if (isFilled(x-1, y  )) neighbours.push(self.cells[x-1][y]); // Left
    if (isFilled(x-1, y-1)) neighbours.push(self.cells[x-1][y-1]);
    if (isFilled(x,   y-1)) neighbours.push(self.cells[x][y-1]); // Above
    if (isFilled(x+1, y-1)) neighbours.push(self.cells[x+1][y-1]);
    if (isFilled(x+1, y  )) neighbours.push(self.cells[x+1][y]); // Right
    if (isFilled(x+1, y+1)) neighbours.push(self.cells[x+1][y+1]);
    if (isFilled(x,   y+1)) neighbours.push(self.cells[x][y+1]); // Below
    if (isFilled(x-1, y+1)) neighbours.push(self.cells[x-1][y+1]);
    return neighbours;
  }
  function isFilled(x, y) {
    return self.cells[x] && self.cells[x][y] && self.cells[x][y].life;
  }
}

GoL.prototype.render = function() {
  var self = this;

  self.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  self.context.strokeStyle = self.options.boardColor === 'Dark Mode' ? '#272727' : '#EEE';

  self.cells.forEach(function(row, x) {
    row.forEach(function(cell, y) {
      self.context.beginPath();
      self.context.rect(x * self.options.cellSize, y * self.options.cellSize, self.options.cellSize, self.options.cellSize);
      if (cell.life) {
        self.context.fillStyle = self.getColor(cell);
        self.context.fill();
      }
      else {
        self.context.stroke();
      }
    });
  });
}

GoL.prototype.toggleCell = function(x, y, canRemove) {
  var self = this;

  x = Math.floor(x/self.options.cellSize);
  y = Math.floor(y/self.options.cellSize);
  if (self.cells[x] && self.cells[x][y] !== undefined) {
    if (self.cells[x][y].life > 0 && canRemove) {
      self.cells[x][y] = { life: 0 };
      self.context.clearRect(x * self.options.cellSize, y * self.options.cellSize, self.options.cellSize, self.options.cellSize);
      self.context.beginPath();
      self.context.rect(x * self.options.cellSize, y * self.options.cellSize, self.options.cellSize, self.options.cellSize);
      self.context.stroke();
    } else if (self.cells[x][y].life === 0){
      self.cells[x][y] = {
        life: 1,
        r: self.options.brush.r,
        g: self.options.brush.g,
        b: self.options.brush.b,
      };
      self.context.fillStyle = self.getColor(self.cells[x][y]);
      self.context.beginPath();
      self.context.rect(x * self.options.cellSize, y * self.options.cellSize, self.options.cellSize, self.options.cellSize);
      self.context.fill();
    }
  }
}

GoL.prototype.bindMouseEvents = function() {
  var self = this;

  self.canvasElement.addEventListener('mousedown', function() {
    if (!self.options.interactive) return;
    self.mouseMoved = false;
    self.canvasElement.addEventListener('mousemove', mouseMove, true);
  })
  self.canvasElement.addEventListener('mouseup', function() {
    self.canvasElement.removeEventListener('mousemove', mouseMove, true);
  });
  self.canvasElement.addEventListener('click', function(e) {
    if (!self.options.interactive) return;
    if (!self.mouseMoved) {
      self.toggleCell(e.x, e.y, true)
    }
  });

  function mouseMove(e) {
    if (!e.buttons && !e.which) {
      self.canvasElement.removeEventListener('mousemove', mouseMove, true);
      return;
    }
    self.mouseMoved = true;
    self.toggleCell(e.x || e.clientX, e.y || e.clientY);
  };
}

GoL.prototype.getColor = function(cell) {
  var self = this;

  if (self.options.opacity && self.options.inheritColors) {
    return 'rgba(' + cell.r + ',' + cell.g + ',' + cell.b + ',' + (cell.life * 0.1) + ')';
  } else if (self.options.opacity) {
    return 'rgba(' + self.options.brush.r + ',' + self.options.brush.g + ',' + self.options.brush.b + ',' + (cell.life * 0.1) + ')';
  } else if (self.options.inheritColors) {
    return 'rgb(' + cell.r + ',' + cell.g + ',' + cell.b + ')';
  } else {
    return 'rgb(' + self.options.brush.r + ',' + self.options.brush.g + ',' + self.options.brush.b + ')';
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
