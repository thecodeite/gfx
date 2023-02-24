define(['Box'], function (Box) {
  function Lolly(p) {
    this.p = p;
    this.limb = null;
    this.radius = 2;

    this.__defineGetter__("headBox", function() { 
      return new Box(p.add(-this.radius), p.add(this.radius));
    });

    return this;
  }

  Lolly.prototype.render = function (ctx, sf, tr) {
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

    this.limb.render(ctx, sf, tr);
  }

  Lolly.prototype.grow = function (f) {
    if (f === undefined) f = 1;
    var move = this.limb.direction.multi(-1*f);

    this.p = this.p.add(move);
    this.limb.reset(this);
    this.limb.grow();

  }



  return Lolly;
});