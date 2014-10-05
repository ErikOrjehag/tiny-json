
'use strict';

var lz = require('lz-string');

module.exports = (function () {

  function pack (value, pattern) {
    // todo: compress the packed stuff some more
    return compress(value, pattern);
  }

  function unpack (value, pattern) {
    // todo: decompress the unpacked stuff some more
    return decompress(value, pattern);
  }

  function compress (value, pattern) {
    return compress[pattern[0]](value, pattern[1]);
  }

  function decompress (value, pattern) {
    return decompress[pattern[0]](value, pattern[1]);
  }

  compress.mismatch = function (value, pattern) {
    return new Error('compress: value ' + value + ' did not match pattern ' + pattern);
  }

  decompress.mismatch = function (value, pattern) {
    return new Error('decompress: value ' + value + ' did not match pattern ' + pattern);
  }

  compress.object = function (value, pattern) {
    var obj = [], key;
    for (key in value) {
      obj.push(compress(value[key], pattern[key]));
    }
    return obj;
  };

  decompress.object = function (value, pattern) {
    var obj = {}, i = 0, key;
    for (key in pattern) {
      obj[key] = decompress(value[i], pattern[key]);
      i += 1;
    }
    return obj;
  };

  compress.array = function (value, pattern) {
    var arr = [], i;
    for (i = 0; i < value.length; i++) {
      arr.push(compress(value[i], pattern));
    }
    return arr;
  };

  decompress.array = function (value, pattern) {
    var arr = [], i;
    for (i = 0; i < value.length; i++) {
      arr.push(decompress(value[i], pattern));
    }
    return arr;
  };

  compress.any = function (value, pattern) {
    return value;
  };

  decompress.any = function (value, pattern) {
    return value;
  };

  compress.boolean = function (value, pattern) {
    return value ? 1 : 0;
  };

  decompress.boolean = function (value, pattern) {
    return value === 1;
  };

  compress.enum = function (value, pattern) {
    var index = pattern.indexOf(value)
    if (~index) {
      return index;
    } else {
      throw compress.mismatch(value, pattern);
    }
  };

  decompress.enum = function (value, pattern) {
    var out = pattern[value];
    if (out) {
      return out;
    } else {
      throw decompress.mismatch(value, pattern);
    }
  }

  compress.string = function (value, pattern) {
    return lz.compress(value);
  };

  decompress.string = function (value, pattern) {
    return lz.decompress(value);
  }

  compress.number = function (value, pattern) {
    return value;
  };

  decompress.number = function (value, pattern) {
    return value;
  }

  return {
    // public
    pack: pack,
    unpack: unpack,
    // testing
    _compress: compress,
    _decompress: decompress
  };
})();