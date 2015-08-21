"use strict";

class GoL {

  constructor(options, id) {
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

  init() {

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

  loadPreset() {
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

  save() {
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

  defaults() {
    var self = this;

    localStorage.removeItem('preset');
    self.init();
  }

  step() {
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

  render() {
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

  toggleCell(x, y, canRemove) {
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

  bindMouseEvents() {
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
      self.toggleCell(e.x, e.y);
    };
  }

  getColor(cell) {
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
