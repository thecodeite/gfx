define(["P"], function (P) {
  function Limb(lolly, scale, direction) {
    var that = this;
    this.scale = scale;
    this.direction = direction;
    this.isCurrent = false;
    this.isGrowing = false;
    
    this.reset = function (lolly) { 
      this.start = lolly.p.add(direction.multi(lolly.radius));
      this.end = this.start.add(direction.multi(scale));
    }
    this.reset(lolly);
    this.buds = [];

    this.growBuds = function (trimEnd) {
      this.buds = [];
      var d1 = this.direction.swap();
      var d2 = d1.multi(-1);
      var limit = this.scale;

      if(trimEnd > 0) {
        limit -= trimEnd;
      }

      for(var i=1; i<=limit; i++){
        var p1 = {
          pos: this.start.add(direction.multi(i)),
          dir: d1,
          idx: i
        };

        var p2 = {
          pos: this.start.add(direction.multi(i)),
          dir: d2,
          idx: i
        };

        this.buds.push(p1);
        this.buds.push(p2);
      }
    }

    this.grow = function () {
      that.scale++;

      that.end = that.start.add(that.direction.multi(that.scale));
    }

    this.render = function(ctx, sf, tr) {
      if(this.isCurrent ) {
          ctx.strokeStyle = 'red';
          ctx.lineWidth = 1 * sf;
      } else if(this.isGrowing ) {
          ctx.strokeStyle = 'purple';
          ctx.lineWidth = 1 * sf;
      } else {
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 0.4 * sf;
      }
      
      var start = this.start.multi(sf).add(tr);
      var end = this.end.multi(sf).add(tr);

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.lineCap = 'round';
      ctx.stroke();

      this.buds.forEach(function (p){
        ctx.beginPath();
        var point = p.pos.add(p.dir).multi(sf).add(tr);
        ctx.arc(point.x, point.y, 0.3*sf, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'green';
        ctx.fill();
      });
    }
  }

  return Limb;

});