
Aleatory.js
===========

[![NPM Package](https://img.shields.io/npm/v/aleatory.js.svg?style=flat)](https://npmjs.org/package/aleatory.js "View this project on npm")
![Bower version](https://img.shields.io/bower/v/aleatory.js.svg)
[![Build Status](https://travis-ci.org/redelmann/Aleatory.js.svg?branch=master)](https://travis-ci.org/redelmann/Aleatory.js "View this project on Travis-CI")
[![Apache-2.0 license](http://img.shields.io/badge/license-Apache-orange.svg)](http://opensource.org/licenses/Apache-2.0 "View the Apache-2.0 License")

> <b>aleatory</b> <i>|ˈeɪlɪət(ə)ri, ˈalɪət(ə)ri|</i> 
>
> depending on the throw of a dice or on chance; random.
>
> -- <cite>Oxford English Dictionary</cite>

Aleatory.js is a Javascript library to work with discrete random variables.
The library exposes an expressive and functional API to create, manipulate, compose and query random variables.


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
d6.mean().toFraction();  // 7/2, as expected!
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

Random values can also be sampled from those objects.
To do so, one must first create a `Generator` from the random variable.

```javascript
var gen = combined.createGenerator();
```

The generator can then be sampled using its `next` method.
The distribution of values sampled from the generator follows the random variable it was derived from.

```javascript
var sum = 0;
var n = 1000000;

for (var i = 0; i < n; i++) {
  sum += gen.next();
}

meanNext = sum / n;

meanNext;  // The mean of generated values: 7.8341 (may change, it's random!)

combined.mean().valueOf();  // The mean of the random variable: 7.833333333333333
```

Aleatory variables have many more methods that can be used to transform them and query them in many interesting ways.
Have a look at them in the documentation below!

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

##### Example:

```javascript
var forecast = Aleatory.always("sunny");
forecast.probabilityAt("sunny").toFraction();  // 1
forecast.probabilityAt("cloudy").toFraction();  // 0
```



#### (static) dice(n) → {Aleatory}

Uniform Aleatory variable over numbers between `1` and `n` inclusive.

##### Parameters:

| Name | Type     | Description                                 |
|------|----------|---------------------------------------------|
| `n`  | `number` | The maximum value of the Aleatory variable. |

##### Returns:

The uniform random variable of numbers between `1` and `n` inclusive.

##### Example:

```javascript
var d3 = Aleatory.dice(3);
d3.mean().toFraction();  // 2
```



#### (static) uniform(elements) → {Aleatory}

Uniform distribution of the elements.
In case of duplicate elements, the probability of each element is proportional to its number of occurences.

##### Parameters:

| Name       | Type    | Description         |
|------------|---------|---------------------|
| `elements` | `Array` | An array of values. |

##### Returns:

The uniform random variable over the elements.

##### Example:

```javascript
var colors = Aleatory.uniform(["red", "green", "blue", "yellow"]);
colors.probabilityAt("red").toFraction();  // 1/4
```



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

##### Example:

```javascript
var names = Aleatory.weighted([
  { value: "Alice", weight: 6 },
  { value: "Bob", weight: 2 },
  { value: "Charles", weight: 3 },
  { value: "Douglas", weight: 1 }
]);
names.probabilityAt("Bob").toFraction();  // 1/6
```



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

##### Example:

```javascript
var result = Aleatory.dice(6).map(function (n) {
  if (n <= 1) {
    return "Critical failure";
  }
  if (n <= 3) {
    return "Failure";
  }
  if (n <= 5) {
    return "Success";
  }
  return "Critical success";
})
result.probabilityAt("Critical failure").toFraction();  // 1/6
result.probabilityAt("Success").toFraction();  // 1/3
```



#### flatMap(toAleatory) → {Aleatory}

Applies a function that returns an aleatory variable to each possible value of this aleatory variable.
The resulting aleatory variable assigns to each result the probability of this result to be obtained.

##### Parameters:

| Name         | Type       | Description                          |
|--------------|------------|--------------------------------------|
| `toAleatory` | `function` | The function to apply on each value. |


##### Returns:

The random variable of the results.

##### Example:

```javascript
var result = Aleatory.dice(6).flatMap(function (n) {
  if (n <= 3) {
    return Aleatory.always(0);
  }
  return Aleatory.dice(3);
})
result.probabilityAt(0).toFraction();  // 1/2
result.probabilityAt(1).toFraction();  // 1/6
```



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

##### Example:

```javascript
var result = Aleatory.dice(6).assume(function (n) {
  return n % 2 == 0;
})
result.probabilityAt(2).toFraction();  // 1/3
result.probabilityAt(5).toFraction();  // 0
```



#### combine(combiner, that) → {Aleatory}

Combines two random variables using a combiner function.

##### Parameters:

| Name       | Type       | Description                                             |
|------------|------------|---------------------------------------------------------|
| `combiner` | `function` | The binary function to combine values of this and that. |
| `that`     | `Aleatory` | The other Aleatory variable.                            |


##### Returns:

The random variable of the combinations.

##### Example:

```javascript
var result = Aleatory.dice(6).combine(function (a, b) { 
  return a - b;
}, Aleatory.dice(3))
result.probabilityAt(2).toFraction();  // 1/6
result.probabilityAt(5).toFraction();  // 1/18
```



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

##### Example:

```javascript
var tenD3 = Aleatory.dice(3).times(10);
tenD3.mean().toFraction();  // 20
tenD3.probability(function (n) { return n >= 20; }).toFraction();  // 34001/59049
```




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

##### Example:

```javascript
var trials = Aleatory.dice(6).map(function (n) {
  return n === 1 || n === 6;
}).trials(10);
trials.mean().toFraction();  // 10/3
```


### Measuring random variables



#### domain() → {Array}

Returns all values with non-zero probability.

##### Returns:

Values with non-zero probability.

##### Example:

```javascript
var twoD6 = Aleatory.dice(6).times(2);
twoD6.domain();  // [ 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 ]
```


#### probabilityAt(value) → {Fraction}

Returns the probability of a certain value.

##### Parameters:

| Name    | Type | Description        |
|---------|------|--------------------|
| `value` | *    | The value to test. |

##### Returns:

The probability of the value.

##### Example:

```javascript
var d6 = Aleatory.dice(6);
d6.probabilityAt(1).toFraction();  // 1/6
d6.probabilityAt(6).toFraction();  // 1/6
d6.probabilityAt(0).toFraction();  // 0
d6.probabilityAt("6").toFraction();  // 0
```



#### probability(predicate) → {Fraction}

Returns the probability of a certain predicate being true.

##### Parameters:

| Name        | Type     | Description            |
|-------------|----------|------------------------|
| `predicate` | function | The predicate to test. |

##### Returns:

The probability of having a value that satifies the predicate.

##### Example:

```javascript
var d6 = Aleatory.dice(6);
d6.probability(function (n) { return n >= 3; }).toFraction();  // 2/3
```



#### mean() → {Fraction}

Computes the mean, or expectation of this random variable.

##### Returns:

The mean of this random variable.

##### Example:

```javascript
var d6 = Aleatory.dice(6);
d6.mean().toFraction();  // 7/2
```



#### variance() → {Fraction}

Computes the variance of this random variable.

##### Returns:

The variance of this random variable.

##### Example:

```javascript
var d6 = Aleatory.dice(6);
d6.variance().toFraction();  // 35/12
```



### Sampling random values



#### createGenerator() → {Generator}

Creates a random value generator.
The random generator is used to get random values from this Aleatory variable.

Takes time linear in the number of values.

The generator has a single method, called `next`, which returns a random
value from the generator. Each `value` is returned with probability `this.probabilityAt(value)`.
Calling `next` takes only constant time.

##### Returns:

A random value generator which follows the distribution of values described by this random variable.

##### Example:

```javascript
var gen = Aleatory.dice(6).times(2).createGenerator();
gen.next();  // 7
gen.next();  // 8
gen.next();  // 6
gen.next();  // 10
gen.next();  // 7
```



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
