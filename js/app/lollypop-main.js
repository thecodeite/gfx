define(function (require) {
  var sequence = require('sequence');
  //var NiceSpacialRandom = require('NiceSpacialRandom');
  var BoxedRandom = require('BoxedRandom');
  var P = require('P');
  var Box = require('Box');
  var rand = require('rand');


  var canvas = document.getElementById('main');
  var context = canvas.getContext('2d');

  var lollies = [];
  var limbs = [];
  var nextAction = 'add';
  var limbless = [];
  var width = 128;
  var height = 128;
  var interval = 100;
  var scaleF = 3;
  var center = new P(width/2, height/2);
  var lollyCount = 0;
  var maxLimbLength = 64;
  var deiredLollyCount = 40;

  // var randomGen = new NiceSpacialRandom(width, height, {
  //   minDistance: 7,
  //   rowSafe: true,
  //   columnSafe: true
  // });

  var randomGen = new BoxedRandom(width, height, {
     minDistance: 7,
     rowSafe: true,
     columnSafe: true,
     margin: 2
  });

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

  paint(context);

  setInterval(function(c){
    paint(c);
  }, 500, context);

  var stopped = true;

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



  function addt () {
    
    if(nextAction === 'add') {
      try {
        var p = randomGen.next();
        if(p) {
          console.log('add', p);
          var lolly = new Lolly(p)
          lollies.push(lolly);
          limbless.push(lolly);
          lollyCount++;
          paint(context);
        } else {
          console.error('randomGen didnt get');
          paint(context);
        }
        if(!stopped){
           timeout = setTimeout(addt, interval);
        }
      } catch(e){
        console.error(e);
      }

      nextAction = 'growLimbs';

    } else if(nextAction === 'growLimbs') {
      var bigBox = new Box(new P(0,0), new P(width, height));

      limbless.forEach(function (lolly) {
        lolly.limbSize++;
        lolly.limbs.forEach(function(limb){
          limb.grow();

          if(!bigBox.contains(limb.end)){
            lolly.limbs.splice(lolly.limbs.indexOf(limb), 1);
          }
        });

        if(lolly.limbSize > maxLimbLength) {
          //var limb = rand(lolly.limbs);
          var limb = lolly.limbs.reduce(function(p, c, i) {
            
            if(!p) return c;

            var pDist = center.distToSq(p.end);
            var cDist = center.distToSq(c.end);

            var chose = pDist < cDist ? p : c;
            //console.log('p, c', p, c, 'chose:' ,chose);
            return chose;
          });

          lolly.limbs = [limb];
          limbless.splice(limbless.indexOf(lolly), 1);
          limbs.push(limb);
          boxLimb(limb);
        }


      //});



      //limbless.slice(0).forEach(function (lolly) {
        var otherLollies = limbless.slice(0);
        //console.log('1lolly, limbless', index, lolly, limbless);
        var index = otherLollies.indexOf(lolly);
        otherLollies.splice(index, 1);
        //console.log('2lolly, otherLollies', index, lolly, otherLollies);
        var limbsToWatch = limbs;
        if(otherLollies){
          otherLollies.forEach(function (otherLolly) {
            limbsToWatch = limbsToWatch.concat(otherLolly.limbs);
          });
        }

        lolly.limbs.slice(0).forEach(function(limb) {
          if(intersectLimbs(limb, limbsToWatch)){
            
            limbless.splice(limbless.indexOf(lolly), 1);
            lolly.limbs = [limb];
            limbs.push(limb);
            boxLimb(limb);
          }
        })
      });

      paint(context);
    }

    if(!stopped){
           timeout = setTimeout(addt, interval);
        }

    if(limbless.length === 0) {
      if(lollyCount < deiredLollyCount){
        nextAction = 'add';
      } else {
        console.log("Done");
        nextAction = "nothing";
        stopped = true;
      }

    }

  }
  var timeout;

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
  }

  function Limb(lolly, scale, direction) {
    var that = this;
    this.scale = scale;
    this.direction = direction;

    this.start = lolly.p.add(direction.multi(lolly.radius));
    this.end = this.start.add(direction.multi(scale));

    this.grow = function() {
      that.scale++;

      that.end = that.start.add(that.direction.multi(that.scale));
    }
  }

  function Lolly(p) {
    var obj = {
      p: p,
      limbSize: 0,
      limbs: [],
      radius: 2,

      render: render
    }

    obj.limbs.push(new Limb(obj, 0, new P(0, 1)));
    obj.limbs.push(new Limb(obj, 0, new P(0, -1)));
    obj.limbs.push(new Limb(obj, 0, new P(1, 0)));
    obj.limbs.push(new Limb(obj, 0, new P(-1, 0)));
    return obj;

    function render(ctx, sf, tr) {
      var p = this.p;
      var c = this.p.multi(sf).add(tr);
      //console.log(c);

      ctx.beginPath();
      ctx.arc(c.x, c.y, this.radius*sf, 0, 2 * Math.PI, false);
      ctx.fillStyle = '#CEF2FC';
      ctx.fill();
      ctx.lineWidth = 0.2 * sf;
      ctx.strokeStyle = '#003300';
      ctx.stroke();

      this.limbs.forEach(function (limb) {

        //var start = c.add(limb.direction.multi(sf));
        //var end = limb.direction.multi(limb.scale).add(p).multi(sf).add(tr);
        var start = limb.start.multi(sf).add(tr);
        var end = limb.end.multi(sf).add(tr);

        // console.log(c, limb.direction, end);

        ctx.lineWidth = 0.4 * sf;

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.lineCap = 'round';
        ctx.stroke();
      });
    }

  }
});