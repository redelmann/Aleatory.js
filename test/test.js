var assert = require('assert');
var Aleatory = require('../aleatory');
var Fraction = require('fraction.js');

describe('always', function () {
  it('assigns probability 1 to the argument', function () {
    assert.equal(1, Aleatory.always(6).probabilityAt(6).valueOf());
    assert.equal(1, Aleatory.always(0).probabilityAt(0).valueOf());
    assert.equal(1, Aleatory.always("foo").probabilityAt("foo").valueOf());
  });

  it('assigns probability 0 to other values', function () {
    assert.equal(0, Aleatory.always(6).probability(function (x) { return x !== 6; }).valueOf());
    assert.equal(0, Aleatory.always(0).probability(function (x) { return x !== 0; }).valueOf());
    assert.equal(0, Aleatory.always("foo").probability(function (x) { return x !== "foo"; }).valueOf());
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
    assert.equal(undefined, Aleatory.uniform([]));
  });

  it('assigns a probability proportional to the number of occurences', function () {
    assert(Aleatory.uniform([1, 2, 1, 1]).probabilityAt(1).equals(Fraction(3/4)));
    assert(Aleatory.uniform([1, 2, 1, 1]).probabilityAt(2).equals(Fraction(1/4)));
    assert(Aleatory.uniform([1, 2, 1, 1]).probabilityAt(3).equals(Fraction(0)));
    assert(Aleatory.uniform([0, 1, 2, 1, 2, 1, 1, 0, 3, 2]).probabilityAt(1).equals(Fraction(4/10)));
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
    assert.equal(undefined, Aleatory.dice(0));
    assert.equal(undefined, Aleatory.dice(-12));
  });
});

describe('trials', function () {
  it('returns 0 with probability 1 when 0 trials are performed.', function () {
    assert(Aleatory.trials(0, Aleatory.always(true)).probabilityAt(0).equals(Fraction(1)));
    assert(Aleatory.trials(0, Aleatory.always(false)).probabilityAt(0).equals(Fraction(1)));
    assert(Aleatory.trials(0, Aleatory.always(true)).probability(function (x) { return x !== 0; }).equals(Fraction(0)));
  });

  it('is undefined when a negative number of trials are performed.', function () {
    assert.equal(undefined, Aleatory.trials(-1, Aleatory.always(true)));
    assert.equal(undefined, Aleatory.trials(-4, Aleatory.always(false)));
  });

  it('considers all falsy values to be failures', function () {
    assert(Aleatory.trials(10, Aleatory.uniform([false, undefined, NaN, null, 0, ''])).probabilityAt(0).equals(Fraction(1)));
    assert(Aleatory.trials(3, Aleatory.uniform([false, undefined, NaN, null, 0, ''])).probabilityAt(0).equals(Fraction(1)));
  });

  it('considers all truthy values to be successes', function () {
    assert(Aleatory.trials(10, Aleatory.uniform([true, 1, 10, 42, "0"])).probabilityAt(10).equals(Fraction(1)));
    assert(Aleatory.trials(3, Aleatory.uniform([true, 1, 10, 42, "0"])).probabilityAt(3).equals(Fraction(1)));
  });

  it('correctly compute probabilities of successes', function () {
    var trials = Aleatory.trials(3, Aleatory.uniform([true, true, false]));
    assert(trials.probabilityAt(0).equals(Fraction(1/27)));
    assert(trials.probabilityAt(1).equals(Fraction(6/27)));
    assert(trials.probabilityAt(2).equals(Fraction(12/27)));
    assert(trials.probabilityAt(3).equals(Fraction(8/27)));
  });
});

describe('assume', function () {
  it('returns undefined when the predicate does not hold on any value', function () {
    assert.equal(undefined, Aleatory.uniform([1, 2, 3, 4]).assume(function (x) { return x > 5; }));
  });

  it('returns only and all values that satisfy the predicate', function () {
    var domain = Aleatory.uniform([1, 2, 3, 4, 5, 6]).assume(function (x) { return x > 2 && x < 6; }).domain();
    assert.equal(3, domain.find(function (x) { return x === 3; }));
    assert.equal(4, domain.find(function (x) { return x === 4; }));
    assert.equal(5, domain.find(function (x) { return x === 5; }));
    assert.equal(3, domain.length);
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

