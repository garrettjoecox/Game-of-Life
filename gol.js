"use strict";

class GoL {

  constructor(options, id) {
    var self = this;

    self.options = JSON.parse(JSON.stringify(options));
    self.canvasElement = document.querySelector(id);
    self.canvasElement.setAttribute('width', self.options.width);
    self.canvasElement.setAttribute('height', self.options.height);
    self.context = self.canvasElement.getContext('2d');
    self.options.wCells = Math.floor(options.width / options.cellSize);
    self.options.hCells = Math.floor(options.height / options.cellSize);
    self.options.rgb = hexToRgb(self.options.cellColor);
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

    for (var i = 0; i < self.options.wCells; i++) {
      self.cells[i] = [];
      for (var j = 0; j < self.options.hCells; j++) {
        self.cells[i][j] = {life: 0};
      }
    }

    if (localStorage.options && localStorage.cells) {
      self.options = JSON.parse(localStorage.options);
      self.cells = JSON.parse(localStorage.cells);
    } else if (self.options.preset) {
      self.options.preset.forEach(function(coord) {
        if (self.cells[coord[0]] && self.cells[coord[0]][coord[1]]) {
          self.cells[coord[0]][coord[1]] = {
            life: 1,
            r: self.options.rgb.r,
            g: self.options.rgb.g,
            b: self.options.rgb.b,
          };
        }
      });
    }

    self.render();
  }

  save() {
    var self = this;

    localStorage.options = JSON.stringify(self.options)
    localStorage.cells = JSON.stringify(self.cells)
  }

  defaults() {
    var self = this;
    localStorage.removeItem('options');
    localStorage.removeItem('cells');
    self.options = defaults;
    self.init();
  }

  step() {
    var self = this;
    var newCells = [];

    self.cells.forEach(function(row, x) {
      newCells[x] = [];
      row.forEach(function(cell, y) {
        var alive = {life: 0};
        var count = countNeighbours(x, y);

        if (cell.life) {
          alive.life = count === 2 || count === 3 ? cell.life + 1 : 0;
        } else {
          alive.life = count === 3 ? 1 : 0;
        }

        newCells[x][y] = alive;
      });
    });

    self.cells = newCells;
    self.render();

    function countNeighbours(x, y) {
      var count = 0;
      if (isFilled(x-1, y  )) count++; // Left
      if (isFilled(x-1, y-1)) count++;
      if (isFilled(x,   y-1)) count++; // Above
      if (isFilled(x+1, y-1)) count++;
      if (isFilled(x+1, y  )) count++; // Right
      if (isFilled(x+1, y+1)) count++;
      if (isFilled(x,   y+1)) count++; // Below
      if (isFilled(x-1, y+1)) count++;
      return count;
    }
    function isFilled(x, y) {
      return self.cells[x] && self.cells[x][y] && self.cells[x][y].life;
    }
  }

  render() {
    var self = this;

    self.context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    self.cells.forEach(function(row, x) {
      row.forEach(function(cell, y) {
        self.context.beginPath();
        self.context.rect(x * self.options.cellSize, y * self.options.cellSize, self.options.cellSize, self.options.cellSize);
        if (cell.life) {
          self.context.fillStyle = self.getColor(cell);
          self.context.fill();
        }
        else self.context.stroke();
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
          r: self.options.rgb.r,
          g: self.options.rgb.g,
          b: self.options.rgb.b,
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
      self.canvasElement.onmousemove = function(e) {
        if (!e.buttons) {
          self.canvasElement.onmousemove = null;
          return;
        }
        self.mouseMoved = true;
        self.toggleCell(e.x, e.y);
      };
    })
    self.canvasElement.addEventListener('mouseup', function() {
      if (!self.options.interactive) return;
      self.canvasElement.onmousemove = null;
    });
    self.canvasElement.addEventListener('click', function(e) {
      if (!self.options.interactive) return;
      if (!self.mouseMoved) {
        self.toggleCell(e.x, e.y, true)
      }
    });
  }

  getColor(cell) {
    var self = this;

    if (self.options.opacity && self.options.inheritColors) {
      return 'rgba(' + cell.r + ',' + cell.g + ',' + cell.b + ',' + (cell.life * 0.1) + ')';
    } else if (self.options.opacity) {
      return 'rgba(' + self.options.rgb.r + ',' + self.options.rgb.g + ',' + self.options.rgb.b + ',' + (cell.life * 0.1) + ')';
    } else if (self.options.inheritColors) {
      return 'rgb(' + cell.r + ',' + cell.g + ',' + cell.b + ')';
    } else {
      return 'rgb(' + self.options.rgb.r + ',' + self.options.rgb.g + ',' + self.options.rgb.b + ')';
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
