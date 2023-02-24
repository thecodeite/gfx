define(["P"], function(P){
  return function Box(a, b, c, d) {

    if(a instanceof P && b instanceof P) {
      this.tl = a;
      this.br = b;
    } else {
      this.tl = new P(a, b);
      this.br = new P(c, d);
    }

    this.__defineGetter__("area", function() { 
      var dx = Math.abs(this.tl.x - this.br.x);
      var dy = Math.abs(this.tl.y - this.br.y);
      return dx * dy; 
    });

    this.toString = function(){
      return 'tl: '+this.tl.x+', '+this.tl.y+
        ' br: '+this.br.x+', '+this.br.y;
    };

    this.clone = function () {
      return new Box(
        new P(this.tl.x, this.tl.y),
        new P(this.br.x, this.br.y)
      );
    }

    this.contract = function(f) {
      return new Box(
        new P(this.tl.x+f, this.tl.y+f),
        new P(this.br.x-f, this.br.y-f)
      );
    }

    this.contains = function (p) {
      return p.x >= this.tl.x 
        && p.x <= this.br.x
        && p.y >= this.tl.y 
        && p.y <= this.br.y;
    }

    this.normal = function () {
      var minX = Math.min(this.tl.x, this.br.x);
      var maxX = Math.max(this.tl.x, this.br.x);

      var minY = Math.min(this.tl.y, this.br.y);
      var maxY = Math.max(this.tl.y, this.br.y);

      return new Box(
        new P(minX, minY),
        new P(maxX, maxY)
      );
    };

    this.overlap = function(other) {
      if (this.tl.x >= other.br.x) return false;
      if (this.br.x <= other.tl.x) return false;
      if (this.tl.y >= other.br.y) return false;
      if (this.br.y <= other.tl.y) return false;
      return true;
    }

    this.containsBox = function(other) {
      return this.contains(other.tl) && this.contains(other.br)
    }

    this.clipTo = function(outer) {
      if(!this.overlap(outer)){
        return null;
      }

      if(outer.containsBox(this)){
        return this.clone();
      }

      var left = Math.max(this.tl.x, outer.tl.x);
      var top = Math.max(this.tl.y, outer.tl.y);
      var right = Math.min(this.br.x, outer.br.x);
      var bottom = Math.min(this.br.y, outer.br.y);

      return new Box(
        new P(left, top),
        new P(right, bottom)
      );
    }

    this.disect = function(target) {
      var res = [];

      // top left
      if(target.tl.x < this.tl.x && target.tl.y < this.tl.y) {
        res.push(new Box(
          new P(target.tl.x, target.tl.y), 
          new P(this.tl.x, this.tl.y)));
      }

      // top
      if(target.tl.y < this.tl.y) {
        res.push(new Box(
          new P(Math.max(this.tl.x, target.tl.x), target.tl.y), 
          new P(Math.min(this.br.x, target.br.x), this.tl.y)));
      }

      // top right
      if(target.br.x > this.br.x && target.tl.y < this.tl.y) {
        res.push(new Box(
          new P(this.br.x, target.tl.y), 
          new P(target.br.x, this.tl.y)));
      }

      // left
      if(target.tl.x < this.tl.x) {
        res.push(new Box(
          new P(target.tl.x, Math.max(this.tl.y, target.tl.y)), 
          new P(this.tl.x, Math.min(this.br.y, target.br.y))));
      }

      // right
      if(target.br.x > this.br.x) {
        res.push(new Box(
          new P(this.br.x, Math.max(this.tl.y, target.tl.y)), 
          new P(target.br.x, Math.min(this.br.y, target.br.y))));
      }

      // bottom left
      if(target.tl.x < this.tl.x && target.br.y > this.br.y) {
        res.push(new Box(
          new P(target.tl.x, this.br.y), 
          new P(this.tl.x, target.br.y)));
      }

      // bottom
      if(target.br.y > this.br.y) {
        res.push(new Box(
          new P(Math.max(this.tl.x, target.tl.x), this.br.y), 
          new P(Math.min(this.br.x, target.br.x), target.br.y)));
      }

      // bottom right
      if(target.br.x > this.br.x && target.br.y > this.br.y) {
        res.push(new Box(
          new P(this.br.x, this.br.y), 
          new P(target.br.x, target.br.y)));
      }

      return res;
    }
  }
});