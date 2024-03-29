define(["Box", "P", "rand", "sequence"], 
  function (Box, P, rand, sequence) {
  return function BoxedRandom(width, height, options) {

    var created = [];
    var grid = new Box(new P(0, 0), new P(width, height));
    var boxes = [];

    this.width = width;
    this.height = height;
    var full = false;

    this.next = function(){
      var gen = null;
      var tries = 1000;
      while(!full && !gen) {
        gen = lookForSpace();

        if(gen === "empty"){
          return null;
        }

        if(tries-- < 0) {
          throw "Ran out of tries";
        }
      }

      return gen;
    }

    function addSpaces(box) {
      console.log('addSpaces start', box.tl, box.br);
      box.spaces = new Array(box.area);
      var slot = 0;
      for(var x = box.tl.x; x<box.br.x; x++) {
        for(var y = box.tl.y; y<box.br.y; y++) {
          box.spaces[slot++] = {x: x, y: y};
        }
      }
      console.log('addSpaces done');
    }

    this.addExcludeBox = function addExcludeBox (box) {
      var overlaps = boxes.filter(function (b) {
        return box.overlap(b);
      });

      for(var x = box.tl.x; x<box.br.x; x++) {
        for(var y = box.tl.y; y<box.br.y; y++) {
          overlaps.find(function (b) {

            var xy = b.spaces.find(function (n) {
              return n.x === x && n.y === y;
            });

            if(xy) {
              b.spaces.splice(b.spaces.indexOf(xy), 1);
              return true;
            }

          })
        }
      }
    };

    this.addBox = function addBox (box) {
      box = box.normal().clipTo(grid);
      

      if(boxes.length === 0) {
        addSpaces(box);
        boxes.push(box);
        return;
      }

      var overlapper = boxes.find(function (b) {
        if(box.overlap(b))
          return b;
      });

      if(overlapper) {
        var newBoxes = overlapper.disect(box);
        //boxes = boxes.concat(newBoxes);
        console.log('Added ', newBoxes.length);

        newBoxes.forEach(function (b) {
          addBox.call(this, b);
        });
      } else {
        addSpaces(box);
        boxes.push(box);
        var that = this;
        
        //setTimeout(function(t){
          simplify.call(this);
        //}, 4000, this);
      }

    };

    this.simplify = simplify;

    function simplify () {
      console.log('boxes', boxes);
      var found = boxes.some(function (box) {
        
        var otherBoxes = boxes.slice(0);
        otherBoxes.splice(otherBoxes.indexOf(box), 1);

        return otherBoxes.some(function (other) {
          if(box.tl.x === other.tl.x && box.br.x === other.br.x) {
            if(box.tl.y === other.br.y) {
              boxes.splice(boxes.indexOf(box), 1);
              boxes.splice(boxes.indexOf(other), 1);
              //console.log('x=x removing', box, other);
              var newBox = new Box(
                new P(box.tl.x, other.tl.y),
                new P(box.br.x, box.br.y )
              );
              boxes.push(newBox);
              newBox.spaces = box.spaces.concat(other.spaces);

              return true;
            }
          } else if(box.tl.y === other.tl.y && box.br.y === other.br.y) {
            if(box.tl.x === other.br.x) {
              boxes.splice(boxes.indexOf(box), 1);
              boxes.splice(boxes.indexOf(other), 1);
              //console.log('y=y removing', box, other);
              var newBox = new Box(
                new P(other.tl.x, other.tl.y),
                new P(box.br.x, box.br.y )
              );
              boxes.push(newBox);
              newBox.spaces = box.spaces.concat(other.spaces);

              return true;
            }
          }
        });
      });

      //if(found){
      //  simplify.call(this);
      //}
    }

    function lookForSpace() {
      if(boxes.length === 0) {
        var p = new P (
              rand(grid.tl.x, grid.br.x),
              rand(grid.tl.y, grid.br.y)
            );
        created.push(p);
        return p;
      } else {
        //var box = rand(boxes);
        var boxesWithSpace = boxes.filter(function (b) {
          return b.spaces.length > 0
        });

        if(boxesWithSpace.length === 0) {
          return "empty";
        }

        var ob = boxesWithSpace.map(function (b) {
          return {area: b.area, box: b};
        });

        var tArea = ob.reduce(function(p, c){
          return p + c.area;
        }, 0);

        var ran = (~~(Math.random() * tArea));

        var tot = 0;
        var boxCont = ob.find(function (b) {
          var res;
          tot += b.area;

          if(tot > ran)
            res = true;

          //console.log('tot, b, ran, res', tot, b, ran, res);
          return res;
        });

        var box = boxCont.box;
        
        var xy = rand(box.spaces, true);

        //console.log('xy', xy);
        var p = new P(xy.x, xy.y);
        /*
        var p = new P (
              rand(box.tl.x, box.br.x),
              rand(box.tl.y, box.br.y)
            );
        */

        if(pointOk(p)) {
          created.push(p);
          return p;
        }
      }
    }

    function pointOk(p) {
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
          return Math.abs(a.y-p.y) <= options.margin;
        })
      }

      if(!existing && options.columnSafe) {
        existing |= created.some(function(a){
          return Math.abs(a.x-p.x) <= options.margin;
        })
      }

      return !existing;
    }

    var goldenRatioConjugate = 0.618033988749895;
    var h = Math.random();
    var v = 0.95;

    function nextColor() {
      h = (h + goldenRatioConjugate) % 1;
      v -= 0.01;
      return HSVtoRGB(h, 0.5, v);
    }

    function HSVtoRGB(h, s, v) {
        var r, g, b, i, f, p, q, t;
        if (arguments.length === 1) {
            s = h.s, v = h.v, h = h.h;
        }
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        //console.log('r, g, b', r, g, b);

        var R = (~~(r * 255)).toString(16).toUpperCase();
        var G = (~~(g * 255)).toString(16).toUpperCase();
        var B = (~~(b * 255)).toString(16).toUpperCase();
        var col =  '#' + R + G + B;

        //console.log('col = R, G, B', col, R, G, B);
        
        return col;
        
    }

    function canvas_arrow(ctx, fromx, fromy, tox, toy){
      var headlen = 10;   // length of head in pixels
      var angle = Math.atan2(toy-fromy,tox-fromx);
      ctx.beginPath();
      ctx.moveTo(fromx, fromy);
      ctx.lineTo(tox, toy);
      ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
      ctx.moveTo(tox, toy);
      ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
      ctx.stroke();
  }
    

    this.render = function (ctx, scale, translate) {
      h = 0.5;
      v = 0.95;
     
      ctx.lineWidth = 0.5;
      ctx.fillStyle = nextColor();

      var tl = grid.tl.multi(scale).add(translate);
      var br = grid.br.multi(scale).add(translate);

      ctx.strokeRect(tl.x+0.5, tl.y+0.5, (br.x-tl.x)-0.5, (br.y-tl.y)-0.5);

      boxes.forEach(function (box) {
        ctx.fillStyle = nextColor();
        tl = box.tl.multi(scale).add(translate);
        br = box.br.multi(scale).add(translate);
        //console.log('r', tl, br);
        ctx.fillRect(tl.x+0.5, tl.y+0.5, (br.x-tl.x)-0.5, (br.y-tl.y)-0.5);

        ctx.fillStyle = 'black';
        box.spaces.forEach(function(sp) {
          ctx.fillRect((sp.x*scale)+translate.x,(sp.y*scale)+translate.y,0.5,0.5);
        });
        //ctx.strokeColor = '#000000';
        //canvas_arrow(ctx, tl.x+0.5, tl.y+0.5, br.x-0.5, br.y-0.5);
      });


      if(false) created.forEach(function (p) {
        ctx.fillStyle = "#99FF99";
        
        if(options.columnSafe) {
          tl = new P(p.x-options.margin, 0).multi(scale).add(translate);
          br = new P(p.x+options.margin, height).multi(scale).add(translate);
          ctx.fillRect(tl.x, tl.y, (br.x-tl.x), (br.y-tl.y));
        }

        if(options.rowSafe) {
          tl = new P(0, p.y-options.margin).multi(scale).add(translate);
          br = new P(width, p.y+options.margin).multi(scale).add(translate);
          ctx.fillRect(tl.x, tl.y, (br.x-tl.x), (br.y-tl.y));
        }
      });

    }
  }
});