# tiny-json
This is a node module that takes an unique approach to packing JSON data. Perfect if you've got a lot of JSON objects with a similar structure!

It is said that 99.9% of human DNA is exactly the same in all people. The most efficient way of storing information about a million people must therefore be to store what they have in common (the 99.9%) in one place, and then all the million small things (0.1%) that makes us unique separate. You'll often find that JSON objects also have a lot in common, and this the idea behind tiny-json.

This is super useful if you want to save a lot a similar JSON data as strings in a key value database like Redis. You'll save a lot of space and have great performance improvments. Long strings makes Redis queries slow!

# How it works
First define a pattern that all your JSON objects will match, the more specific you are the better compression you'll get. Anything that's valid JSON can be written as a pattern. Next use the pack and unpack methods together with your pattern to compress and uncompress your data. The result can then be converted into a string with JSON.stringify() and put in a key value database like Redis, while your pattern is stored in your application source.

```javascript
var tiny = require('tiny-json');

var pattern = ['object', {
  foo: ['array', ['number']],
  bar: ['boolean']
}];

var firstData = {
  foo: [1337, 42, 127],
  bar: true
};

var secondData = {
  foo: [17, 123],
  bar: false
};

var firstPacked = tiny.pack(firstData, pattern);
// [[1337,42,127],1]
// 32 -> 17 chars: 47% compression!

var secondPacked = tiny.pack(secondData, pattern);
// [[17,123],0]
// 28 -> 12 chars: 57% compression!

var firstUnpacked = tiny.unpack(data, pattern);
var secondUnpacked = tiny.unpack(data, pattern);
```

String compression is not fantastic but still pretty decent.

```javascript
var pattern = ['array',
  ['object', {
    id: ['number'],
    description: ['string'],
    status: ['enum', ['PENDING', 'CONFIRMED', 'REJECTED']]
  }]
];

var data = [
  { id: 17, description: 'this is pretty cool', status: 'REJECTED' },
  { id: 12, description: 'one small step for man...', status: 'PENDING' },
  { id: 15, description: 'okay lets get this party started', status: 'CONFIRMED' },
];

tiny.pack(data, pattern);
// [[17,'஀낦Ӧ@阌��⮁豍勉Ǎꀐ턓ꀆ찀Ტ씤耀',2],
//  [12,'㶃낦@츋悆ư琂㡀曀ᎅ㨒耀',0],
//  [15,'㶆낆ৠЃ悦Ű㎔๨ꠠᘄ녀᳀ু梐墄저',1]]

// 235 -> 81 chars: 66% compression!

```

Booleans and enums are pretty great though.

```javascript
var pattern = ['object', {
  someBooleanValue: ['boolean'],
  anotherBooleanValue: ['boolean'],
  arrayOfBooleans: ['array', ['boolean']],
  someEnum: ['enum', ['START', 'STOP', 'PAUSE']],
  someOtherEnum: ['enum', ['COOL', 'AWESOME', 'WICKED']]
}];

var data = {
  someBooleanValue: true,
  anotherBooleanValue: false,
  arrayOfBooleans: [true, false, false, true],
  someEnum: 'PAUSE',
  someOtherEnum: 'AWESOME'
};

tiny.pack(data, pattern);
// [1,0,[1,0,0,1],2,1]

// 140 -> 19 chars: 86% compression!
```

This is pretty pointless but it works.

```javascript
var pattern = ['number'];

var data = 42;

tiny.pack(data, pattern);
// 42

// 2 -> 2 chars: 0% compression! :P
```

You can store intermediate patterns so that you dont repeat yourself.

```javascript
var person = ['object', {
  name: ['string'],
  age: ['number'],
  favoriteColor: ['enum', ['RED', 'GREEN', 'BLUE', 'PINK', 'YELLOW', 'ORANGE', 'PURPLE']]
}];

var pattern = {
  mother: person,
  father: person,
  children: ['array', person]
};

var family = {
  mother: { name: 'Jenny', age: 47, favoriteColor: 'PINK' },
  father: { name: 'Bob', age: 50, favoriteColor: 'GREEN' },
  children: [
    { name: 'Kim', age: 19,  favoriteColor: 'BLUE' },
    { name: 'Mikael', age: 15, favoriteColor: 'YELLOW' },
    { name: 'Sara', age: 14, favoriteColor: 'PURPLE' }
  ]
};

tiny.pack(family, pattern);
// [['ᒅぶ悞䀀',47,3],
//  ['ႇ끆䀀',50,1],
//  [['㒄낶䀀',19,2],['Ⲅ냖ࡠꘃ搀',15,4],['㊄ぎ␀',14,6]]]

// 278 -> 71 chars: 74% compression!

```

# Full list of patterns
`['object', { key: *pattern*, ... }]` An object litteral with keys and values that are other patterns. Can be nested.


`['array', *pattern*]` An array with a pattern describing the elements in it. Can be nested, ex multi dimensional array of objects.

`['boolean']` A boolean value, true or false.

`['enum', *array of strings*]` One of the strings provided in the array of strings, its convetion to use uppercase words.

`['string']` A string, will be compressed with lz-string compression.

`['number', *options*]` A number, can take an optional object with the following keys: `gt: number` greater than, `lh: number` less than.

`['any']`
Any value, will not be compressed.

# How to contribute
The source is well structured and easy to expand upon. If you come up with a way to compress a certain data type your contribution is welcome. Read this [blog post](http://www.davidhampgonsalves.com/Compress-JSON.js/) written by David Hamp-Gonsalves for some great inspiration.

It's only a few simple steps.

1) Add a compress method:
```javscript
compress.something = function (value, pattern) {
  // Compress the value in some smart way.
  // If you pass options to your type
  // those will be availible in the pattern.
  return value;
};
```

2) Add a uncompress method:
```javascript
uncompress.something = function (value, pattern) {
  // Undo whatever you did to compress the value.
  return value;
};
```

3) Add a test for each of the methods:
```javascript
it('something', function () {
  assert.strictEqual(tiny._compress('my value'), 'my value');
});
```

4) Add the type to the "full list of patterns" in the README.

And thats it! Commit and push your changes and they will be merged asap.
