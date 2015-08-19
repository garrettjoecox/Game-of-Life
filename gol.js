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
    self.context.strokeStyle = options.gridColor;
    self.context.fillStyle = options.cellColor;
    self.cells = [];

    if (self.options.interactive) {
      self.canvasElement.addEventListener('mousedown', function() {
        self.mouseMoved = false;
        self.canvasElement.onmousemove = mouseMove;
      })
      self.canvasElement.addEventListener('mouseup', function() {
        self.canvasElement.onmousemove = null;
      });
      self.canvasElement.addEventListener('click', function(e) {
        if (!self.mouseMoved) {
          self.click(e.x, e.y)
        }
      });
      function mouseMove(e) {
        if (!e.buttons) {
          self.canvasElement.onmousemove = null;
          return;
        }
        self.mouseMoved = true;
        self.drag(e.x, e.y);
      }
    }

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
          alive = count === 2 || count === 3 ? 1 : 0;
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
        if (cell) self.context.fill();
        else self.context.stroke();
      });
    });

    setTimeout(function() {
      self.step();
    }, self.options.speed);
  }

  click(x, y) {
    var self = this;

    x = Math.floor(x/self.options.cellSize);
    y = Math.floor(y/self.options.cellSize);
    if (self.cells[x] && self.cells[x][y] !== undefined) {
      if (self.cells[x][y] === 1) {
        self.cells[x][y] = 0;
        self.context.clearRect(x * self.options.cellSize, y * self.options.cellSize, self.options.cellSize, self.options.cellSize);
        self.context.beginPath();
        self.context.rect(x * self.options.cellSize, y * self.options.cellSize, self.options.cellSize, self.options.cellSize);
        self.context.stroke();
      } else {
        self.cells[x][y] = 1;
        self.context.beginPath();
        self.context.rect(x * self.options.cellSize, y * self.options.cellSize, self.options.cellSize, self.options.cellSize);
        self.context.fill();
      }
    }
  }

  drag(x, y) {
    var self = this;

    x = Math.floor(x/self.options.cellSize);
    y = Math.floor(y/self.options.cellSize);
    if (self.cells[x] && self.cells[x][y] !== undefined) {
      self.cells[x][y] = 1;
      self.context.beginPath();
      self.context.rect(x * self.options.cellSize, y * self.options.cellSize, self.options.cellSize, self.options.cellSize);
      self.context.fill();
    }
  }
}
