"use strict";

class GoL {

  constructor(options, id) {
    var self = this;
    var w = (options.width) / options.cellSize;
    var h = (options.height) / options.cellSize;
    var prefilled = [[1, 5],[1, 6],[2, 5],[2, 6],[11, 5],[11, 6],[11, 7],[12, 4],[12, 8],[13, 3],[13, 9],[14, 3],[14, 9],[15, 6],[16, 4],[16, 8],[17, 5],[17, 6],[17, 7],[18, 6],[21, 3],[21, 4],[21, 5],[22, 3],[22, 4],[22, 5],[23, 2],[23, 6],[25, 1],[25, 2],[25, 6],[25, 7],[35, 3],[35, 4],[36, 3],[36, 4]];

    self.options = options;
    self.canvasElement = document.querySelector(id);
    self.canvasElement.setAttribute('width', options.width);
    self.canvasElement.setAttribute('height', options.height);
    self.context = self.canvasElement.getContext('2d');
    self.options.rgb = hexToRgb(options.cellColor);
    self.context.strokeStyle = options.gridColor;
    self.cells = [];

    if (self.options.interactive) self.bindMouseEvents();

    for (var i = 0; i < w; i++) {
      self.cells[i] = [];
      for (var j = 0; j < h; j++) {
        self.cells[i][j] = 0;
      }
    }

    prefilled.forEach(function(coord) {
      self.cells[coord[0]][coord[1]] = 1;
    });

    self.step();
  }

  step() {
    var self = this;
    var newCells = [];

    self.cells.forEach(function(row, x) {
      newCells[x] = [];
      row.forEach(function(cell, y) {
        var alive = 0;
        var count = countNeighbours(x, y);

        if (cell) {
          alive = count === 2 || count === 3 ? cell + 1 : 0;
        } else {
          alive = count === 3 ? 1 : 0;
        }

        newCells[x][y] = alive;
      });
    });

    self.cells = newCells;
    self.render();

    function countNeighbours(x, y) {
      var count = 0;
      if (isFilled(x-1, y-1)) count++;
      if (isFilled(x,   y-1)) count++;
      if (isFilled(x+1, y-1)) count++;
      if (isFilled(x-1, y  )) count++;
      if (isFilled(x+1, y  )) count++;
      if (isFilled(x-1, y+1)) count++;
      if (isFilled(x,   y+1)) count++;
      if (isFilled(x+1, y+1)) count++;
      return count;
    }
    function isFilled(x, y) {
      return self.cells[x] && self.cells[x][y];
    }
  }

  render() {
    var self = this;

    self.context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    self.cells.forEach(function(row, x) {
      row.forEach(function(cell, y) {
        self.context.beginPath();
        self.context.rect(x * self.options.cellSize, y * self.options.cellSize, self.options.cellSize, self.options.cellSize);
        if (cell) {
          self.context.fillStyle = self.getColor(cell);
          self.context.fill();
        }
        else self.context.stroke();
      });
    });

    setTimeout(function() {
      self.step();
    }, self.options.speed);
  }

  toggleCell(x, y, canRemove) {
    var self = this;

    x = Math.floor(x/self.options.cellSize);
    y = Math.floor(y/self.options.cellSize);
    if (self.cells[x] && self.cells[x][y] !== undefined) {
      if (self.cells[x][y] > 0 && canRemove) {
        self.cells[x][y] = 0;
        self.context.clearRect(x * self.options.cellSize, y * self.options.cellSize, self.options.cellSize, self.options.cellSize);
        self.context.beginPath();
        self.context.rect(x * self.options.cellSize, y * self.options.cellSize, self.options.cellSize, self.options.cellSize);
        self.context.stroke();
      } else if (self.cells[x][y] === 0){
        self.cells[x][y] = 1;
        self.context.fillStyle = self.getColor();
        self.context.beginPath();
        self.context.rect(x * self.options.cellSize, y * self.options.cellSize, self.options.cellSize, self.options.cellSize);
        self.context.fill();
      }
    }
  }

  bindMouseEvents() {
    var self = this;
    
    self.canvasElement.addEventListener('mousedown', function() {
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
      self.canvasElement.onmousemove = null;
    });
    self.canvasElement.addEventListener('click', function(e) {
      if (!self.mouseMoved) {
        self.toggleCell(e.x, e.y, true)
      }
    });
  }

  getColor(cell) {
    var self = this;

    if (self.options.opacity) {
      if (cell) return 'rgba(' + self.options.rgb.r + ',' + self.options.rgb.g + ',' + self.options.rgb.b + ',' + (cell * 0.1) + ')';
      else return 'rgba(' + self.options.rgb.r + ',' + self.options.rgb.g + ',' + self.options.rgb.b + ', 0.1)';
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
    } : null;
}
