var assert = require('assert');
var Aleatory = require('../aleatory');
var Fraction = require('fraction.js');

describe('always', function () {
  it('assigns probability 1 to the argument', function () {
    assert.equal(Aleatory.always(6).probabilityAt(6).valueOf(), 1);
    assert.equal(Aleatory.always(0).probabilityAt(0).valueOf(), 1);
    assert.equal(Aleatory.always("foo").probabilityAt("foo").valueOf(), 1);
  });

  it('assigns probability 0 to other values', function () {
    assert.equal(Aleatory.always(6).probability(function (x) { return x !== 6; }).valueOf(), 0);
    assert.equal(Aleatory.always(0).probability(function (x) { return x !== 0; }).valueOf(), 0);
    assert.equal(Aleatory.always("foo").probability(function (x) { return x !== "foo"; }).valueOf(), 0);
  });
});

describe('uniform', function () {
  it('assigns the same probability to all elements', function () {
    assert(Aleatory.uniform([1, 2, 3, 4, 5]).probabilityAt(1).equals(Fraction(1/5)));
    assert(Aleatory.uniform([1, 2, 3]).probabilityAt(2).equals(Fraction(1/3)));
    assert(Aleatory.uniform([1, 2, 3, 4]).probabilityAt(3).equals(Fraction(1/4)));
  });

  it('assigns probability 0 to other elements', function () {
    assert(Aleatory.uniform([1, 2, 3, 4]).probabilityAt(6).equals(Fraction(0)));
    assert(Aleatory.uniform([1, 2]).probabilityAt(0).equals(Fraction(0)));
  });

  it('is undefined when the list of elements is empty', function () {
    assert.equal(Aleatory.uniform([]), undefined);
  });

  it('assigns a probability proportional to the number of occurences', function () {
    assert(Aleatory.uniform([1, 2, 1, 1]).probabilityAt(1).equals(Fraction(3/4)));
    assert(Aleatory.uniform([1, 2, 1, 1]).probabilityAt(2).equals(Fraction(1/4)));
    assert(Aleatory.uniform([1, 2, 1, 1]).probabilityAt(3).equals(Fraction(0)));
    assert(Aleatory.uniform([0, 1, 2, 1, 2, 1, 1, 0, 3, 2]).probabilityAt(1).equals(Fraction(4/10)));
  });
});

describe('weighted', function () {

  it('uses the value parameter for the actual value', function () {
    var domain = Aleatory.weighted([{value: 1, weight: 0.3}, {value: 2, weight: 0.65}, {value: 3, weight: 0.05}]).domain();
    assert.equal(domain.length, 3);
    assert.equal(domain.find(function (x) { return x === 1; }), 1);
    assert.equal(domain.find(function (x) { return x === 2; }), 2);
    assert.equal(domain.find(function (x) { return x === 3; }), 3);
  });

  it('assigns the probability proportional to the weight for all elements', function () {
    assert(Aleatory.weighted([{value: 1, weight: 1}, {value: 2, weight: 2}, {value: 3, weight: 3}]).probabilityAt(1).equals(Fraction(1/6)));
    assert(Aleatory.weighted([{value: 1, weight: 1}, {value: 2, weight: 2}, {value: 3, weight: 3}]).probabilityAt(2).equals(Fraction(1/3)));
    assert(Aleatory.weighted([{value: 1, weight: 1}, {value: 2, weight: 2}, {value: 3, weight: 3}]).probabilityAt(3).equals(Fraction(1/2)));

    assert(Aleatory.weighted([{value: 1, weight: 0.3}, {value: 2, weight: 0.65}, {value: 3, weight: 0.05}]).probabilityAt(1).equals(Fraction(0.3)));
    assert(Aleatory.weighted([{value: 1, weight: 0.3}, {value: 2, weight: 0.65}, {value: 3, weight: 0.05}]).probabilityAt(2).equals(Fraction(0.65)));
    assert(Aleatory.weighted([{value: 1, weight: 0.3}, {value: 2, weight: 0.65}, {value: 3, weight: 0.05}]).probabilityAt(3).equals(Fraction(0.05)));
  });

  it('assigns probability 0 to other elements', function () {
    assert(Aleatory.weighted([{value: 1, weight: 0.3}, {value: 2, weight: 0.65}, {value: 3, weight: 0.05}]).probabilityAt(0).equals(Fraction(0)));
    assert(Aleatory.weighted([{value: 1, weight: 1}, {value: 3, weight: 12}]).probabilityAt(4).equals(Fraction(0)));
  });

  it('is undefined when the list of elements is empty', function () {
    assert.equal(undefined, Aleatory.weighted([]));
  });

  it('supports weights of 0', function () {
    var random = Aleatory.weighted([
      { value: 1, weight: 0 },
      { value: 2, weight: 1 },
      { value: 2, weight: 0 }
    ]);

    assert(random.domain().length === 1);
    assert(random.probabilityAt(2).equals(Fraction(1)));
  });

  it('is undefined when some weights are negative', function () {
    assert.equal(Aleatory.weighted([{value: 1, weight: 1}, {value: 2, weight: -2}, {value: 3, weight: 3}]), undefined);
    assert.equal(Aleatory.weighted([{value: 1, weight: 1}, {value: 2, weight: 2}, {value: 3, weight: -1}]), undefined);
  });

  it('is undefined when all weights are 0', function () {
    assert.equal(Aleatory.weighted([{value: 1, weight: 0}, {value: 2, weight: 0}, {value: 3, weight: 0}]), undefined);
  });

  it('assigns a probability proportional to the sum of the weights of the occurences', function () {
    assert(Aleatory.weighted([{value: 1, weight: 1}, {value: 1, weight: 2}, {value: 3, weight: 3}]).probabilityAt(1).equals(Fraction(1/2)));
  });
});

describe('dice', function () {
  it('assigns the same probability to all number between 1 and n', function () {
    assert(Aleatory.dice(6).probabilityAt(1).equals(Fraction(1/6)));
    assert(Aleatory.dice(3).probabilityAt(3).equals(Fraction(1/3)));
    assert(Aleatory.dice(20).probabilityAt(7).equals(Fraction(1/20)));
  });

  it('assigns probability 0 to other elements', function () {
    assert(Aleatory.dice(3).probabilityAt(0).equals(Fraction(0)));
    assert(Aleatory.dice(20).probabilityAt(21).equals(Fraction(0)));
  });

  it('is undefined when n is non-positive', function () {
    assert.equal(Aleatory.dice(0), undefined);
    assert.equal(Aleatory.dice(-12), undefined);
  });
});

describe('trials', function () {
  it('returns 0 with probability 1 when 0 trials are performed.', function () {
    assert(Aleatory.always(true).trials(0).probabilityAt(0).equals(Fraction(1)));
    assert(Aleatory.always(false).trials(0).probabilityAt(0).equals(Fraction(1)));
    assert(Aleatory.always(true).trials(0).probability(function (x) { return x !== 0; }).equals(Fraction(0)));
  });

  it('is undefined when a negative number of trials are performed.', function () {
    assert.equal(Aleatory.always(true).trials(-1), undefined);
    assert.equal(Aleatory.always(false).trials(-4), undefined);
  });

  it('considers all falsy values to be failures', function () {
    assert(Aleatory.uniform([false, undefined, NaN, null, 0, '']).trials(10).probabilityAt(0).equals(Fraction(1)));
    assert(Aleatory.uniform([false, undefined, NaN, null, 0, '']).trials(3).probabilityAt(0).equals(Fraction(1)));
  });

  it('considers all truthy values to be successes', function () {
    assert(Aleatory.uniform([true, 1, 10, 42, "0"]).trials(10).probabilityAt(10).equals(Fraction(1)));
    assert(Aleatory.uniform([true, 1, 10, 42, "0"]).trials(3).probabilityAt(3).equals(Fraction(1)));
  });

  it('correctly compute probabilities of successes', function () {
    var trials = Aleatory.uniform([true, true, false]).trials(3);
    assert(trials.probabilityAt(0).equals(Fraction(1/27)));
    assert(trials.probabilityAt(1).equals(Fraction(6/27)));
    assert(trials.probabilityAt(2).equals(Fraction(12/27)));
    assert(trials.probabilityAt(3).equals(Fraction(8/27)));
  });
});

describe('assume', function () {
  it('returns undefined when the predicate does not hold on any value', function () {
    assert.equal(Aleatory.uniform([1, 2, 3, 4]).assume(function (x) { return x > 5; }), undefined);
  });

  it('returns only and all values that satisfy the predicate', function () {
    var domain = Aleatory.uniform([1, 2, 3, 4, 5, 6]).assume(function (x) { return x > 2 && x < 6; }).domain();
    assert.equal(domain.find(function (x) { return x === 3; }), 3);
    assert.equal(domain.find(function (x) { return x === 4; }), 4);
    assert.equal(domain.find(function (x) { return x === 5; }), 5);
    assert.equal(domain.length, 3);
  });

  it('correctly compute probabilities of elements satisfying the predicate', function () {
    var random = Aleatory.uniform([1, 1, 1, 2, 3, 3, 4, 4, 4, 4]).assume(function (x) { return x % 2 !== 0; });
    assert(random.probabilityAt(1).equals(Fraction(3/5)));
    assert(random.probabilityAt(3).equals(Fraction(2/5)));
  });
});

describe('map', function () {
  it('applies the function to all the values', function () {
    var mapped = Aleatory.uniform([1, 2, 3, 4, 5]).map(function (x) {
      return x * 2;
    });
    assert(mapped.probabilityAt(2).equals(Fraction(1/5)));
    assert(mapped.probabilityAt(4).equals(Fraction(1/5)));
    assert(mapped.probabilityAt(6).equals(Fraction(1/5)));
    assert(mapped.probabilityAt(8).equals(Fraction(1/5)));
    assert(mapped.probabilityAt(10).equals(Fraction(1/5)));
  });

  it('correctly handles non-injective functions', function () {
    var mapped = Aleatory.uniform([1, 2, 3, 4, 5]).map(function (x) {
      return x % 3;
    });
    assert(mapped.probabilityAt(0).equals(Fraction(1/5)));
    assert(mapped.probabilityAt(1).equals(Fraction(2/5)));
    assert(mapped.probabilityAt(2).equals(Fraction(2/5)));
  });
});

describe('flatMap', function () {
  it('applies the function to all the values and combine resulting variables', function () {
    var mapped = Aleatory.uniform([1, 2, 3]).flatMap(function (n) {
      return Aleatory.dice(n);
    });
    assert(mapped.probabilityAt(1).equals(Fraction(1/3).add(Fraction(1/6)).add(Fraction(1/9))));
    assert(mapped.probabilityAt(2).equals(Fraction(1/6).add(Fraction(1/9))));
    assert(mapped.probabilityAt(3).equals(Fraction(1/9)));
  });
});

describe('combine', function () {
  it('combines two random variables using a parameter function', function () {
    var first = Aleatory.dice(5);
    var second = Aleatory.dice(3);
    var combiner = function (a, b) {
      return a - b;
    };
    var combined = first.combine(combiner, second);
    assert(combined.probabilityAt(-2).equals(Fraction(1/15)));
    assert(combined.probabilityAt(-1).equals(Fraction(2/15)));
    assert(combined.probabilityAt(0).equals(Fraction(3/15)));
    assert(combined.probabilityAt(1).equals(Fraction(3/15)));
    assert(combined.probabilityAt(2).equals(Fraction(3/15)));
    assert(combined.probabilityAt(3).equals(Fraction(2/15)));
    assert(combined.probabilityAt(4).equals(Fraction(1/15)));
  });
});

describe('times', function () {
  it('uses addition to combine by default', function () {
    var combined = Aleatory.dice(6).times(3);
    assert(combined.probabilityAt(3).equals(new Fraction(1/216)));
    assert(combined.probabilityAt(4).equals(new Fraction(3/216)));
    assert(combined.mean().equals(new Fraction(21/2)));
  });

  it('supports custom combiner function', function () {
    var combined = Aleatory.dice(6).times(3, function(x, y) {
      return x * y;
    });
    assert(combined.probabilityAt(1).equals(new Fraction(1/216)));
    assert(combined.probabilityAt(4).equals(new Fraction(6/216)));
  });
});

describe('Aleatory', function () {
  it('distinguishes numbers and strings with the same string representation', function () {
    var mixed = Aleatory.uniform([0, 0, "0", "1", 2]);
    assert(mixed.probabilityAt(0).equals(new Fraction(2 / 5)));
    assert(mixed.probabilityAt("0").equals(new Fraction(1 / 5)));
    assert(mixed.probabilityAt(1).equals(new Fraction(0)));
    assert(mixed.probabilityAt("1").equals(new Fraction(1 / 5)));
    assert(mixed.probabilityAt(2).equals(new Fraction(1 / 5)));
    assert(mixed.probabilityAt("2").equals(new Fraction(0)));
  });

  it('uses the toHash method of objects for their indentity, if present', function () {
    var a1 = {x: 2, y: 3, toHash: function () { return "123456"; }, toString: function () { return "foo"; }};
    var Foo = function (hash) { this.hash = hash; };
    Foo.prototype.toHash = function () { return this.hash; };
    var a2 = new Foo("123456");
    var Bar = function () {};
    var a3 = Object.create(Bar.prototype);
    a3.toHash = function () { return "123456"; };
    var b1 = {x: 2, y: 3, toHash: function () { return "000000"; }, toString: function () { return "foo"; }};
    var b2 = new Foo("000000");
    var b3 = new Bar();
    b3.toHash = function () { return "000000"; };

    var merged = Aleatory.uniform([a1, a2, a3, b1]);
    assert(merged.probabilityAt(a1).equals(new Fraction(3 / 4)));
    assert(merged.probabilityAt(a2).equals(new Fraction(3 / 4)));
    assert(merged.probabilityAt(a3).equals(new Fraction(3 / 4)));
    assert(merged.probabilityAt(b1).equals(new Fraction(1 / 4)));
    assert(merged.probabilityAt(b2).equals(new Fraction(1 / 4)));
    assert(merged.probabilityAt(b3).equals(new Fraction(1 / 4)));
  });

  it('uses the toString method of objects for their indentity, if toHash is absent', function () {
    var a1 = {x: 2, y: 3, toString: function () { return "123456"; }};
    var Foo = function () {};
    Foo.prototype.toString = function () { return "123456"; };
    var a2 = new Foo();
    var Bar = function () {};
    var a3 = Object.create(Bar.prototype);
    a3.toString = function () { return "123456"; };

    var merged = Aleatory.uniform([a1, a2, a3]);
    assert(merged.probabilityAt(a1).equals(new Fraction(1)));
    assert(merged.probabilityAt(a2).equals(new Fraction(1)));
    assert(merged.probabilityAt(a3).equals(new Fraction(1)));
  });

  it('distinguishes between an object with a toHash method and an object with a corresponding toString', function () {
    var a1 = {x: 2, y: 3, toHash: function () { return "123456"; }};
    var Foo = function () {};
    Foo.prototype.toString = function () { return "123456"; };
    var a2 = new Foo();

    var mixed = Aleatory.uniform([a1, a2]);
    assert(mixed.probabilityAt(a1).equals(new Fraction(1/2)));
    assert(mixed.probabilityAt(a2).equals(new Fraction(1/2)));
  });

  it('distinguishes between a hashable object, an object, a number and a string with the same value', function () {
    var o1 = {toHash: function () { return "42"; }};
    var o2 = {toString: function () { return "42"; }};

    var mixed = Aleatory.uniform([o1, o1, o1, o1, o2, o2, o2, 42, 42, "42"]);
    assert(mixed.probabilityAt(o1).equals(new Fraction(4 / 10)));
    assert(mixed.probabilityAt(o2).equals(new Fraction(3 / 10)));
    assert(mixed.probabilityAt(42).equals(new Fraction(2 / 10)));
    assert(mixed.probabilityAt("42").equals(new Fraction(1 / 10)));
  });

  it('doesn\'t flatten arrays for equalitity', function () {
    var a1 = [1, 2, 3];
    var a2 = ["1", 2, 3];
    var a3 = [1, [2, 3]];
    var a4 = [[1, 2], "3"];

    var mixed = Aleatory.uniform([a1, a2, a3, a4]);

    assert(mixed.probabilityAt(a1).equals(new Fraction(1/4)));
    assert(mixed.probabilityAt(a2).equals(new Fraction(1/4)));
    assert(mixed.probabilityAt(a3).equals(new Fraction(1/4)));
    assert(mixed.probabilityAt(a4).equals(new Fraction(1/4)));
  });
});

describe('mean', function () {
  it('computes the mean', function () {
    assert(Aleatory.uniform([1, 2, 3, 4, 5]).mean().equals(new Fraction(3)));
    assert(Aleatory.weighted([
      { value: 1, weight: 2 },
      { value: 4, weight: 16 },
      { value: 7, weight: 13 },
      { value: 12, weight: 5 },
      { value: 9, weight: 14 }
    ]).mean().equals(new Fraction(343/50)));
  });
});

describe('variance', function () {
  it('computes the variance ', function () {
    assert(Aleatory.uniform([1, 2, 3, 4]).variance().equals(new Fraction(5/4)));
  });
});

describe('Generator table', function () {
  it('contains one entry per value', function () {
    assert(Aleatory.dice(76).createGenerator().table.length, 76);
    assert(Aleatory.dice(22).createGenerator().table.length, 22);
  });

  it('gives values space proportional to their probability', function () {
    function checkTable(aleatory) {

      var table = aleatory.createGenerator().table;
      var probabilities = [];

      var i;
      for (i = 0; i < table.length; i++) {
        probabilities[i] = table[i].stay;
      }

      for (i = 0; i < table.length; i++) {
        var alias = table[i].alias;
        probabilities[alias] = probabilities[alias].add(new Fraction(1)).sub(table[i].stay);
      }

      for (i = 0; i < table.length; i++) {
        assert(aleatory.probabilityAt(table[i].value).equals(probabilities[i].div(table.length)));
      }
    }

    checkTable(Aleatory.uniform([1, 2, 3, 4]));
    checkTable(Aleatory.dice(12));
    checkTable(Aleatory.dice(4).times(3));
    checkTable(Aleatory.weighted([
      {value: 1, weight: 12},
      {value: 3, weight: 7},
      {value: 4, weight: 6},
      {value: 9, weight: 117}
    ]));
    checkTable(Aleatory.weighted([
      {value: 1, weight: 10},
      {value: 3, weight: 7},
      {value: 4, weight: 13},
      {value: 9, weight: 10},
      {value: 17, weight: 15},
      {value: 23, weight: 5}
    ]));
  });
});