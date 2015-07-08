define(["Box", "P", "rand", "sequence"], 
  function (Box, P, rand, sequence) {
  return function NiceSpacialRandom(width, height, options) {
    console.log('options', options);
    var created = [];
    var grid = [new Box(new P(0, 0), new P(width, height))];
    var freeGridSpots = [grid[0]];
    var splitHorizontal = true;

    this.width = width;
    this.height = height;
    var full = false;

    this.next = function(){
      var gen = null;
      while(!full && !gen) {
        gen = lookForSpace();
      }

      return gen;
    }

    function lookForSpace() {
      
      //console.log('gridSpot', gridSpot, freeGridSpots);
      function pick() {
        var spaces = (gridSpot.br.x - gridSpot.tl.x) *  (gridSpot.br.y - gridSpot.tl.y);
        var range;
        var func;

        if(spaces > 100) {
          range = new Array(100);
          func = function(){
            return {
              x: rand(gridSpot.tl.x, gridSpot.br.x),
              y: rand(gridSpot.tl.y, gridSpot.br.y)
            };
          };

        } else {
          range = sequence(spaces);
          var stride = gridSpot.br.y - gridSpot.tl.y;
          func = function(n) {
            var yOff = n % stride;
            var xOff =  ~~(n / stride);
            //console.log('xOff, yOff', xOff, yOff, 'n, stride', n, stride, 'spaces', spaces);
            return {
              x: gridSpot.tl.x + xOff, 
              y: gridSpot.tl.y + yOff
            };
          };
        }
        //var xSpaces = sequence(gridSpot.tl.x, gridSpot.br.x);
        //var ySpaces = sequence(gridSpot.tl.y, gridSpot.br.y);
        //var space = cross(xSpaces, ySpaces, 'x', 'y');
        var tries = 0;
        console.log(range.map(func));
        while(range.length > 0) {
          tries++;
          var f = rand(range, true);
          var v = func(f);
          var p = new P(
            //gridSpot.tl.x + ((gridSpot.br.x - gridSpot.tl.x)/2.5), 
            //rand(gridSpot.tl.x, gridSpot.br.x), 
            v.x,
            //gridSpot.tl.y + ((gridSpot.br.y - gridSpot.tl.y)/2.5)
            //rand(gridSpot.tl.y, gridSpot.br.y)
            v.y
          ); 

          var minDist = options.minDistance * options.minDistance;
          //console.log('minDist', minDist, minDistance);
          var existing = created.some(function(a) {
            var dx = a.x-p.x;
            var dy = a.y-p.y;
            var dist = (dx*dx)+(dy*dy);
            var tooClose = dist < minDist;
            // console.log('t', minDist, a, p, dx, dy, 'dist', dist);
            return tooClose;
          });

          if(!existing && options.rowSafe) {
            existing |= created.some(function(a){
              return a.y == p.y;
            })
          }

          if(!existing && options.columnSafe) {
            existing |= created.some(function(a){
              return a.x == p.x;
            })
          }

          //console.log('existing', existing);
          if(!existing){
            gridSpot.p = p;
            created.push(p);
            //console.log('tries, range.length', tries, range.length);
            return p;
          }
        }

        console.log('gave up after tries:', tries);
        //console.error('Grid probably full', gridSpot);
        gridSpot.p = 'full';
        var index = grid.indexOf(gridSpot);
        if (index != -1) grid.splice(index, 1);

        index =  grid.indexOf(gridSpot.twin);
        if (index != -1) grid.splice(index, 1);

        index =  freeGridSpots.indexOf(gridSpot.twin);
        if (index != -1) freeGridSpots.splice(index, 1);

        //clearInterval(interval);
        return null;

      }

      function rebuildGrid(){
        grid.forEach(function(ebox){

          var newBox;

          if(splitHorizontal) {
            var newY = ~~(ebox.tl.y + ((ebox.br.y-ebox.tl.y)/2));
            newBox = new Box(new P(ebox.tl.x, newY), ebox.br.clone());
            ebox.br.y = newY;
          } else {
            var newX = ~~(ebox.tl.x + ((ebox.br.x-ebox.tl.x)/2));
            newBox = new Box(new P(newX, ebox.tl.y), ebox.br.clone());
            ebox.br.x = newX;
          }

          newBox.twin = ebox;
          ebox.twin = newBox;

          if(newBox.contains(ebox.p)){
            newBox.p = ebox.p;
            ebox.p = null;
            freeGridSpots.push(ebox);
          } else {
            freeGridSpots.push(newBox);
          }

          grid.push(newBox);
        });
        splitHorizontal = !splitHorizontal;
      }

      if(grid.length === 0) {
        full = true;
        console.log('full!');
        return null;
      }

      var gridSpot = rand(freeGridSpots, true);
      console.log('gridSpot', gridSpot.tl, gridSpot.br);

      var picked = pick();
      
      if(freeGridSpots.length === 0) {
        rebuildGrid();
      }

      return picked;
    };

    this.render = function (ctx, scale, translate) {

     
      ctx.lineWidth = 0.5;

      grid.forEach(function(box){

        if(box.p === 'full'){
           ctx.fillStyle = '#FF9999';
        } else if(box.p === null || box.p === undefined) {
           ctx.fillStyle = '#99FF99';
        } else {
           ctx.fillStyle = '#9999FF';
        }

        var tl = box.tl.multi(scale).add(translate.x);
        var br = box.br.multi(scale).add(translate.y);
        //console.log('r', tl, br);
        ctx.fillRect(tl.x+0.5, tl.y+0.5, (br.x-tl.x)-0.5, (br.y-tl.y)-0.5);
      }); 
    }
  }
});