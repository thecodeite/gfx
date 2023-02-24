define(function () {
  return function P(x, y) {
    this.x = x;
    this.y = y;
    this.clone = function() {
      return new P(this.x, this.y);
    }
    this.add = function(a) {
      if(a instanceof P){
        return new P(this.x+a.x, this.y+a.y);
      } else {
        return new P(this.x+a, this.y+a);
      }
    };
    this.multi = function(a){
      return new P(this.x*a, this.y*a);
    };

    this.distToSq = function(other) {
      var dx = this.x - other.x;
      var dy = this.y - other.y;
      return (dx*dx) + (dy * dy);
    };

    this.distTo = function(other) {
      return Math.sqrt(this.distToSq);
    };

    this.swap = function() {
      return new P(this.y, this.x);
    };
  }
})