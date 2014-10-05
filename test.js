'use strict';

var assert = require('assert');
var lz = require('lz-string');
var tiny = require('./tiny-json');

describe('public', function () {

  it('pack', function () {
    var pattern = ['any'];
    assert.strictEqual(tiny.pack('something', pattern), 'something');
  });

  it('unpack', function () {
    var pattern = ['any'];
    assert.strictEqual(tiny.unpack('something', pattern), 'something');
  });

});

describe('compress', function () {

  it('object', function () {
    var pattern = ['object', { key: ['any'] }];
    assert.strictEqual(
      JSON.stringify(tiny._compress({ key: 'value' }, pattern)),
      JSON.stringify(['value'])
    );
  });

  it('array', function () {
    var pattern = ['array', ['any']];
    assert.strictEqual(
      JSON.stringify(tiny._compress([1, 2, 3], pattern)),
      JSON.stringify([1, 2, 3])
    );
  });

  it('any', function () {
    var pattern = ['any'];
    assert.strictEqual(tiny._compress('anything', pattern), 'anything');
  });

  it('boolean', function () {
    var pattern = ['boolean'];
    assert.strictEqual(tiny._compress(false, pattern), 0);
    assert.strictEqual(tiny._compress(true, pattern), 1);
  });

  it('enum', function () {
    var pattern = ['enum', ['FOO', 'BAR', 'BAZ']];
    assert.strictEqual(tiny._compress('FOO', pattern), 0);
    assert.strictEqual(tiny._compress('BAR', pattern), 1);
    assert.strictEqual(tiny._compress('BAZ', pattern), 2);
    assert.throws(function () { tiny._compress('QUX', pattern); });
  });

  it('string', function () {
    var pattern = ['string'];
    assert.strictEqual(
      tiny._compress('foobar', pattern),
      lz.compress('foobar')
    );
  });

  it('number', function () {
    var pattern = ['number'];
    assert.strictEqual(tiny._compress(1337, pattern), 1337);
  });

});

describe('decompress', function () {

  it('object', function () {
    var pattern = ['object', { key: ['any'] }];
    assert.strictEqual(
      JSON.stringify(tiny._decompress(['value'], pattern)),
      JSON.stringify({ key: 'value' })
    );
  });

  it('array', function () {
    var pattern = ['array', ['any']];
    assert.strictEqual(
      JSON.stringify(tiny._decompress([1, 2, 3], pattern)),
      JSON.stringify([1, 2, 3])
    );
  });

  it('any', function () {
    var pattern = ['any'];
    assert.strictEqual(tiny._decompress('anything', pattern), 'anything');
  });

  it('boolean', function () {
    var pattern = ['boolean'];
    assert.strictEqual(tiny._decompress(0, pattern), false);
    assert.strictEqual(tiny._decompress(1, pattern), true);
  });

  it('enum', function () {
    var pattern = ['enum', ['FOO', 'BAR', 'BAZ']];
    assert.strictEqual(tiny._decompress(0, pattern), 'FOO');
    assert.strictEqual(tiny._decompress(1, pattern), 'BAR');
    assert.strictEqual(tiny._decompress(2, pattern), 'BAZ');
    assert.throws(function () { tiny._decompress(3, pattern); });
  });

  it('string', function () {
    var pattern = ['string'];
    assert.strictEqual(
      tiny._decompress(lz.compress('foobar'), pattern), 
      'foobar'
    );
  });

  it('number', function () {
    var pattern = ['number'];
    assert.strictEqual(tiny._decompress(1337, pattern), 1337);
  });

});