define(function () {
  
  return function sequence(start, end) {
    if(end === undefined) {
      end = start;
      start = 0;
    }

    var dir = Math.abs(end-start)/(end-start);
    var length = (end-start) * dir;
    var arr = new Array(length);
    var val = start;
    for(var index = 0; index < length; index++, val += dir) {
      arr[index] = val;
    }
    return arr;
  } 

});