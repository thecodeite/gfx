define(function (require) {
  var sequence = require('sequence');
  //var NiceSpacialRandom = require('NiceSpacialRandom');
  var BoxedRandom = require('BoxedRandom');
  var P = require('P');
  var Box = require('Box');
  var rand = require('rand');
  var Lolly = require('./Lolly');
  var Limb = require('./Limb');


  var canvas = document.getElementById('main');
  var context = canvas.getContext('2d');

  var lollies = [];
  var limbs = [];
  var limbless = [];
  var width = 32;
  var height = 32;
  var interval = 100;
  var scaleF = 6;
  var center = new P(width/2, height/2);
  var lollyCount = 0;
  var maxLimbLength = 16;
  var deiredLollyCount = 400;
  var linesSpace = 3;
  var grid = new Box(0, 0, width, height);

  if(!Array.prototype.remove) {
    Array.prototype.remove = function(obj) {
      var idx = this.indexOf(obj);
      if(idx != -1) {
        return this.splice(idx, 1);
      }
      return undefined;
    }
  }


  // var randomGen = new NiceSpacialRandom(width, height, {
  //   minDistance: 7,
  //   rowSafe: true,
  //   columnSafe: true
  // });

  // var randomGen = new BoxedRandom(width, height, {
  //    minDistance: 7,
  //    rowSafe: true,
  //    columnSafe: true,
  //    margin: 2
  // });

  //randomGen.addBox(new Box(new P(0, 0), new P(20,20)));
  //randomGen.addBox(new Box(new P(40, 40), new P(60,60)));

  //randomGen.addBox(new Box(new P(10, 10), new P(50,50)));


 


  //var ap = randomGen.next();
  //var bp = niceSpacialRandom.next().add(1).multi(25);

  //var a = new Lolly(ap);
  //var b = new Lolly(bp, null);

  //lollies.push(a);
  //limbless.push(a);
  //lollies.push(b);

  //var meetingPoint = new P(a.p.x, b.p.y);
  //a.lineP = meetingPoint;
  //b.lineP = meetingPoint;

  var initialLolly = new Lolly(new P(width/4, height/4));
  var initialLimb = new Limb(initialLolly, maxLimbLength, new P(1, 0) );
  initialLimb.growBuds();
  initialLolly.limb=initialLimb;

  lollies.push(initialLolly);
  limbs.push(initialLimb);

  paint(context);

  setInterval(function(c){
    paint(c);
  }, 500, context);

  var stopped = true;
/*
  function boxLimb(limb) {
    if(limb.start.x === limb.end.x) {
      // Verticale line

      var inBox = new Box(
        new P(limb.start.x-maxLimbLength, limb.start.y),
        new P(limb.end.x+maxLimbLength, limb.end.y)
      ).normal();

      var outBox = new Box(
        new P(limb.start.x-4, limb.start.y),
        new P(limb.end.x+4, limb.end.y)
      ).normal();

      randomGen.addBox(inBox);
      randomGen.addExcludeBox(outBox);

    } else {
      // Hoz line

      var inBox = new Box(
        new P(limb.start.x, limb.start.y-maxLimbLength),
        new P(limb.end.x, limb.end.y+maxLimbLength)
      ).normal();

      var outBox = new Box(
        new P(limb.start.x, limb.start.y-4),
        new P(limb.end.x, limb.end.y+4)
      ).normal();

      randomGen.addBox(inBox);
      randomGen.addExcludeBox(outBox);
    }
  }
*/

  var timeout;

  function limbLength(limb) {
    return limb.buds.length * 2;
  }

  function weightedRand(arr, weightF) {
    var totalWeight = 0;
    var withWeight = arr.map(function (obj) {
      var weight = weightF(obj);
      totalWeight += weight;
      return {weight: weight, obj: obj};
    }).filter(function(container) {
      return container.weight > 0;
    });

    if(withWeight.length === 0) {
      console.log('No objects have any weight');
      return null;
    }

    var ran = (~~(Math.random() * totalWeight));
    var tot = 0;
    var container = withWeight.find(function (container) {
      var res;
      tot += container.weight;

      if(tot > ran)
        res = true;

      //console.log('tot, b, ran, res', tot, b, ran, res);
      return res;
    });

    if(container) { 
      return container.obj;
    } else {
      throw('Something went wrong with weightedRand')
    }
  }

  var currentLimb;
  var currentBud;
  var growingLolly;

  function addt () {
    
    if(!currentLimb) {
      currentLimb = weightedRand(limbs, limbLength);
      currentLimb.isCurrent = true;
      console.log('Picked limb', currentLimb);
    } else if(!currentBud) {
      currentBud = pickBud(currentLimb);
    } else if(!growingLolly) {
      growingLolly = new Lolly(currentBud.pos.add(currentBud.dir.multi(4)))
      growingLolly.limb = new Limb(growingLolly, 2, currentBud.dir.multi(-1) );
      growingLolly.limb.isGrowing = true;
      //var fakeLolly = {p: currentBud.pos, radius: 0};
      //growingLimb = new Limb(fakeLolly, 1, currentBud.dir);
    } else {
      
      growingLolly.grow();
      var innerGrid = grid.contract(2);
      //console.log('innerGrid', innerGrid.toString());

      var ep = growingLolly.p.clone();

      if(growingLolly.limb.scale > maxLimbLength-1
        || !innerGrid.contains(ep)) {

        growingLolly.limb.growBuds(linesSpace);
        lollies.push(growingLolly);
        limbs.push(growingLolly.limb);

        reset();
      } else {
        
        var otherLimbs = limbs.filter(function (l){
          return l !== currentLimb;
        });
        if(intersectLimbs(growingLolly.limb, otherLimbs) || overlapLolly(growingLolly, lollies)) {
          reset();
        }
        
      }
    }
      

    paint(context);
    if(!stopped) setTimeout(addt, interval);
  }

  function overlapLolly (targetLolly, otherLollies) {
    return otherLollies.some(function (l){
      return targetLolly.headBox.overlap(l.headBox);
    })
  }

  function overlapLimbs (targetLolly, otherLimbs) {
    return otherLollies.some(function (l){
      return targetLolly.headBox.overlap(l.headBox);
    })
  }

  function reset() {
    if(currentLimb) currentLimb.isCurrent = false;
    if(growingLolly) growingLolly.limb.isGrowing = false;

    growingLolly = null;
    currentBud = null;
    currentLimb = null;
  }

  function pickBud(limb) {
    var buds = limb.buds;
    var pickedBud = rand(buds);

    buds.slice().forEach(function (p) {
      if(p.idx == pickedBud.idx){
        buds.remove(p);
      }

      //console.log(Math.abs(p.idx - pickedBud.idx) <= linesSpace, 'pickBud:', p.dir === pickedBud.dir, p.idx,  pickedBud.idx,  Math.abs(p.idx - pickedBud.idx));
      if(p.dir === pickedBud.dir && Math.abs(p.idx - pickedBud.idx) <= linesSpace) {
        buds.remove(p);
      }
    });

    return pickedBud;
  }
  

  function intersectLimbs(limb, limbs) {
    return limbs.some(function (l) {
      var doesIntersect = linesIntersect(limb.start, limb.end, l.start, l.end);
      //console.log('doesIntersect', doesIntersect, limb.start, limb.end, l.start, l.end);
      return doesIntersect;
    });
  }

  function linesIntersect(a1, b1, a2, b2) {
    return lineIntersect(a1.x, a1.y, b1.x, b1.y, a2.x, a2.y, b2.x, b2.y);
  }


  function lineIntersect(a,b,c,d, p,q,r,s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      return (0 <= lambda && lambda <= 1) && (0 <= gamma && gamma <= 1);
    }
  }


  document.getElementById('stop').addEventListener('click', function() {
    stopped = true;
    clearTimeout(timeout);
  });

  document.getElementById('go').addEventListener('click', function() {
    stopped = false;
    addt();
  });

  document.getElementById('add').addEventListener('click', function () {
    stopped = true;
    addt();
  });

  function paint(ctx) {
    var scaleFactor = scaleF;
    var translate =  new P(scaleF, scaleF)
    canvas.width = canvas.width;

    //randomGen.render(ctx, scaleFactor, translate);
    lollies.forEach(function(lolly){
      lolly.render(ctx, scaleFactor, translate);
    });

    renderProgress(ctx, scaleFactor, translate);
  }

  function renderProgress(ctx, sf, tr) {
   
    if(currentBud) {
      ctx.beginPath();
      var point = currentBud.pos.add(currentBud.dir).multi(sf).add(tr);
      ctx.arc(point.x, point.y, 0.3*sf, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'orange';
      ctx.fill();
    }

    if(growingLolly) {
      growingLolly.render(ctx, sf, tr);
    }
  }

});