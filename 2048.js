var index = 0;
var n = 4;

var ai = {weights: [1, 1], depth: 1};

var cells = [];
var table = document.querySelector(".entrada");
for (var i = 0; i < n; i++) {
  var tr = document.createElement("tr");
  cells[i] = [];
  for (var j = 0; j < n; j++) {
    cells[i][j] = document.createElement("td");
    tr.appendChild(cells[i][j])
  }
  table.appendChild(tr);
}

var cells_salida = [];
var table_salida = document.querySelector(".salida");
for (var i = 0; i < n; i++) {
  var tr = document.createElement("tr");
  cells_salida[i] = [];
  for (var j = 0; j < n; j++) {
    cells_salida[i][j] = document.createElement("td");
    tr.appendChild(cells_salida[i][j])
  }
  table_salida.appendChild(tr);
}

function updateUI(ai) {
  cells.forEach(function(a, i) {
    a.forEach(function(el, j) {
      el.innerHTML = ai.grid[i][j] || ''
    })
  });
}

function updateUISalida(ai) {
  cells_salida.forEach(function(a, i) {
    a.forEach(function(el, j) {
      el.innerHTML = ai.grid[i][j] || ''
    })
  });
}

function initialize(input,ai) {
  ai.grid = [];
  for (var i = 0; i < n; i++) {
    ai.grid[i] = input[index].split(' ').map(function(item) {
      var num = parseInt(item, 10);
      if ((num & (num - 1)) == 0){
        return num;
      }else {
        return 0;
      }
    });
    index++;
  }
  ai.steps = 0;
}

function move(p, ai) { //0:ARRIBA, 1:DERECHA, 2:ABAJO, 3:IZQUIERDA
  var newgrid = mv(p, ai.grid);
  if (!equal(newgrid, ai.grid)) {
    ai.grid = newgrid;
    try {
      rand(ai.grid)
      ai.steps++;
    } catch (e) {
      console.log('no room', e)
    }
  }
}

window.onload = function() {
  var fileInput = document.getElementById('file');

  fileInput.addEventListener('change', function(e) {
    var file = fileInput.files[0];
    var textType = /text.*/;

    if (file.type.match(textType)) {
        var reader = new FileReader();

        reader.onload = function(e) {
          input = this.result.split('\n');
          initialize(input,ai);
          updateUI(ai);
          var movements = input[index];
          var M_max = Math.pow(10, 5);
          if(movements>=1 && movements<=M_max){
            for(var i =0; i < movements;i++){
              index++;
              var movement = input[index];
              movement = movement.replace(/(\r\n|\n|\r)/gm,"");

              switch(movement.split("/n")[0]) {
                case "Izquierda":
                    p = 3;
                    break;
                case "Derecha":
                    p = 1;
                    break;
                case "Arriba":
                    p = 0;
                    break;
                case "Abajo":
                    p = 2;
                    break;
                default:
                    p = -1;
              }
              if(p!==-1){
                 move(p,ai);
                 ai.maxValue = maxValue(ai.grid); 
              }
            }

            updateUISalida(ai);
          }
        }

        reader.readAsText(file);    
    } else {
        log("File not supported!");
    }
  });
}

function maxValue(grid) {
  return Math.max.apply(null, grid.map(function(a) {
    return Math.max.apply(null, a)
  }));
}

function freeCells(grid) {
  return grid.reduce(function(v, a) {
    return v + a.reduce(function(t, x) {
      return t + (x == 0)
    }, 0)
  }, 0)
}

function mv(k, grid) {
  var tgrid = M.itransform(k, grid);
  for (var i = 0; i < tgrid.length; i++) {
    var a = tgrid[i];
    for (var j = 0, jj = 0; j < a.length; j++)
      if (a[j]) a[jj++] = (j < a.length - 1 && a[j] == a[j + 1]) ? 2 * a[j++] : a[j]
    for (; jj < a.length; jj++)
      a[jj] = 0;
  }
  return M.transform(k, tgrid);
}

function rand(grid) {
  var r = Math.floor(Math.random() * freeCells(grid)),
    _r = 0;
  for (var i = 0; i < grid.length; i++) {
    for (var j = 0; j < grid.length; j++) {
      if (!grid[i][j]) {
        if (_r == r) {
          grid[i][j] = Math.random() < .9 ? 2 : 4
        }
        _r++;
      }
    }
  }
}

function equal(grid1, grid2) {
  for (var i = 0; i < grid1.length; i++)
    for (var j = 0; j < grid1.length; j++)
      if (grid1[i][j] != grid2[i][j]) return false;
  return true;
}


function MatrixTransform(n) {
  var g = [],
    ig = [];
  for (var i = 0; i < n; i++) {
    g[i] = [];
    ig[i] = [];
    for (var j = 0; j < n; j++) {
      g[i][j] = [[j, i],[i, n-1-j],[j, n-1-i],[i, j]]; // transformation matrix in the 4 directions g[i][j] = [up, right, down, left]
      ig[i][j] = [[j, i],[i, n-1-j],[n-1-j, i],[i, j]]; // the inverse tranformations
    }
  }
  this.transform = function(k, grid) {
    return this.transformer(k, grid, g)
  }
  this.itransform = function(k, grid) { // inverse transform
    return this.transformer(k, grid, ig)
  }
  this.transformer = function(k, grid, mat) {
    var newgrid = [];
    for (var i = 0; i < grid.length; i++) {
      newgrid[i] = [];
      for (var j = 0; j < grid.length; j++)
        newgrid[i][j] = grid[mat[i][j][k][0]][mat[i][j][k][1]];
    }
    return newgrid;
  }
  this.copy = function(grid) {
    return this.transform(3, grid)
  }
}

var M = new MatrixTransform(n);