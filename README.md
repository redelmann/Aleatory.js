
Aleatory.js
===========

[![NPM Package](https://img.shields.io/npm/v/aleatory.js.svg?style=flat)](https://npmjs.org/package/aleatory.js "View this project on npm")
![Bower version](https://img.shields.io/bower/v/aleatory.js.svg)
[![Build Status](https://travis-ci.org/redelmann/Aleatory.js.svg?branch=master)](https://travis-ci.org/redelmann/Aleatory.js "View this project on Travis-CI")
[![Apache-2.0 license](http://img.shields.io/badge/license-Apache-orange.svg)](http://opensource.org/licenses/Apache-2.0 "View the Apache-2.0 License")

A discrete random variable library in Javascript with a functional interface.

Example
-------

Aleatory.js is a library to handle [random variables][0].
A random variable is a collection of values, each associated with some probability.
The sum of all probabilities is always equal to 1.

As an example, let's consider a dice.
A dice can be thought of as a random variable that associates to the numbers 1 to 6 the probability 1/6. 
This random variable can be created as follows:

```javascript
var d6 = Aleatory.dice(6);
```

Now that we have this random variable, we can query it.

```javascript
// We verify that it is fair...
d6.probabilityAt(1).toFraction();  // 1/6, good.
d6.probabilityAt(6).toFraction();  // Still 1/6. Sounds about right!
d6.probabilityAt(7).toFraction();  // 0, nobody's that lucky!
```

Random variables can also be derived from existing random variables.
For instance, let's create a second dice, starting from our fair dice.
But this time, we are going to cheat a bit! Whenever the fair dice would give a 1,
we will change to a 6.

```javascript
var cheaterD6 = d6.map(function (n) { 
  if (n === 1) {
    return 6;
  }
  return n;
});
```

Just as before, let's query this dice!

```javascript
cheaterD6.probabilityAt(1).toFraction();  // 0, something's fishy!
cheaterD6.probabilityAt(2).toFraction();  // 1/6... sounds okay.
cheaterD6.probabilityAt(6).toFraction();  // Ha! 1/3. That's cheating!
```

It is worth noting that the original dice `d6` remains unchanged and can still be used!
All of the methods of Aleatory do not mutate the object.

Let's now define the random variable that corresponds to the sum of those two dice.
To create this variable, we make use of the `combine` method.

```javascript
var combined = d6.combine(function (n, m) { return n + m; }, cheaterD6);
```

Now, let's compute to probability to get at least 7 on those two dice.

```javascript
combined.probability(function (n) { return n >= 7 }).toFraction()  // 13/18, good odds!
```

Aleatory variables have many more methods that can be used to transform them and query them in many interesting ways.
You can have a look at them in the documentation below.

Install
-------

### Using npm

To install this library with `npm`:

```
npm install aleatory.js
```

### Using bower

To install this library with `bower`:

```
bower install aleatory.js
```

Use
---

### In Node.js

```javascript
var Aleatory = require('aleatory.js');
```

### Manually on your website

To use this library on your website, simply download the library and [its Fraction.js dependency][1].
You can then include them in your HTML as follows:

```html
<script type="text/javascript" src="fraction.js"></script>
<script type="text/javascript" src="aleatory.js"></script>
```

### Using Require.js

Aleatory.js is compatible with [Require.js][3].

```html
<script type="text/javascript" src="require.js"></script>
<script type="text/javascript">
requirejs(['aleatory.js'], function(Aleatory) {
  // Your code using Aleatory.
});
</script>
```

Be careful to include [Fraction.js][1] before this library.

Documentation
-------------

### Creating random variables



#### (static) always(value) → {Aleatory}

Random variable that always returns the same value.

##### Parameters:

| Name    | Type | Description                            |
|---------|------|----------------------------------------|
| `value` | *    | The only value in the random variable. |

##### Returns:

The random variable that assigns to the value the probability `1`.



#### (static) dice(n) → {Aleatory}

Uniform Aleatory variable over numbers between `1` and `n` inclusive.

##### Parameters:

| Name | Type     | Description                                 |
|------|----------|---------------------------------------------|
| `n`  | `number` | The maximum value of the Aleatory variable. |

##### Returns:

The uniform random variable of numbers between `1` and `n` inclusive.




#### (static) uniform(elements) → {Aleatory}

Uniform distribution of the elements.
In case of duplicate elements, the probability of each element is proportional to its number of occurences.

##### Parameters:

| Name       | Type    | Description         |
|------------|---------|---------------------|
| `elements` | `Array` | An array of values. |

##### Returns:

The uniform random variable over the elements.




#### (static) weighted(elements) → {Aleatory}

Weighted distribution of the elements.
Each element of `elements` should be an object with a `value` field and a `weight` field.
In case of duplicate elements, the probability of each element is proportional to the sum of the weights of its occurences.

##### Parameters:

| Name       | Type  | Description                            |
|------------|-------|----------------------------------------|
| `elements` | Array | An array of `{value, weight}` objects. |


##### Returns:

The weighted random variable over the elements.



### Modifying random variables



#### map(toResult) → {Aleatory}

Applies a function to the values of this random variable.
The resulting random variable assigns to each result the probability of this result to be obtained.

##### Parameters:

| Name       | Type       | Description                          |
|------------|------------|--------------------------------------|
| `toResult` | `function` | The function to apply on each value. |

##### Returns:

The aleatory variable of the results.



#### flatMap(toAleatory) → {Aleatory}

Applies a function that returns an aleatory variable to each possible value of this aleatory variable.
The resulting aleatory variable assigns to each result the probability of this result to be obtained.

##### Parameters:

| Name         | Type       | Description                          |
|--------------|------------|--------------------------------------|
| `toAleatory` | `function` | The function to apply on each value. |


##### Returns:

The random variable of the results.



#### assume(predicate) → {Aleatory}

Returns this random variable conditioned by the predicate.
All the values in the resulting random variable satisfy the given predicate.
Their probability is proportional to the probability the had in this random variable.
As always, the sum of all probabilities in the resulting variable is 1.
If none of the values satisfy the predicate, this function returns `undefined`.

##### Parameters:

| Name        | Type       | Description                          |
|-------------|------------|--------------------------------------|
| `predicate` | `function` | The predicate that values must hold. |

##### Returns:

The random variable that contains all values which satisfy the predicate.



#### combine(combiner, that) → {Aleatory}

Combines two random variables using a combiner function.

##### Parameters:

| Name       | Type       | Description                                             |
|------------|------------|---------------------------------------------------------|
| `combiner` | `function` | The binary function to combine values of this and that. |
| `that`     | `Aleatory` | The other Aleatory variable.                            |


##### Returns:

The random variable of the combinations.



### Repeating random experiments



#### times(n, combiner=addition) → {Aleatory}

Take `n` independant values from this random variable and combine them using `combiner`.
Returns the random variable of the combinations.

##### Parameters:

| Name       | Type     | Attributes | Description                                                                          |
|------------|----------|------------|--------------------------------------------------------------------------------------|
| `n`        | number   |            | Number of times values are taken from `this`.                                        |
| `combiner` | function | optional   | Binary function used to combine values. Should be associative. Defaults to addition. |

##### Returns:

The random variable of combinations.



#### trials(n) → {Aleatory}

Bernouli trials distribution.
Each number `i` between `0` and `n` inclusive is associated with the probability of having exactly i successful outcomes in n trials of given Aleatory variable.
A value is considered to be a successful outcome if it is "truthy". All "falsy" values (i.e. `false`, `undefined`, `NaN`, `null`, `0`, `""`) are considered to be failures.

##### Parameters:

| Name | Type   | Description           |
|------|--------|-----------------------|
| `n`  | number | The number of trials. |

##### Returns:

The random variable of the numbers of successful outcomes.



### Measuring random variables



#### domain() → {Array}

Returns all values with non-zero probability.

##### Returns:

Values with non-zero probability.



#### probabilityAt(value) → {Fraction}

Returns the probability of a certain value.

##### Parameters:

| Name    | Type | Description        |
|---------|------|--------------------|
| `value` | *    | The value to test. |

##### Returns:

The probability of the value.



#### probability(predicate) → {Fraction}

Returns the probability of a certain predicate being true.

##### Parameters:

| Name        | Type     | Description            |
|-------------|----------|------------------------|
| `predicate` | function | The predicate to test. |

##### Returns:

The probability of having a value that satifies the predicate.



#### mean() → {Fraction}

Computes the mean, or expectation of this random variable.

##### Returns:

The mean of this random variable.



#### variance() → {Fraction}

Computes the variance of this random variable.

##### Returns:

The variance of this random variable.


JSDoc
-----

The library is fully documented using [JSDoc][2] syntax.
You can generate the documentation with:

```
jsdoc aleatory.js
```

License
-------

This library is released under the [Apache-2.0](http://opensource.org/licenses/Apache-2.0) license.
See the LICENSE file for details.

[0]: https://en.wikipedia.org/wiki/Random_variable
[1]: https://github.com/infusion/Fraction.js/
[2]: https://github.com/jsdoc3/jsdoc
[3]: http://requirejs.org
