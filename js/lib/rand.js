define(function () {
  return function rand(a, b, c) {
    //console.log('a, b', a, b, typeof(a), typeof(b));

    if(typeof(a) === 'object') {
      if(a instanceof Array ) {
        var index = ~~(Math.random() * a.length);
        var res = a[index];

        if(b) {
          a.splice(index, 1);
        }
        return res;
        
      }
    }

    if(typeof(a) === 'number') {
      if(typeof(b) === 'undefined' && typeof(c) === 'undefined') {
        return ~~(Math.random() * a);
      } else if(typeof(b) === 'number' && typeof(c) === 'undefined') {
        return a + ~~(Math.random() * (b-a));
      } else if(typeof(b) === 'number' && typeof(c) === 'number') {
        return ( ~~(a/c) + ~~(Math.random() * ((b-a)/c))) * c;
      }
    }
  }
});