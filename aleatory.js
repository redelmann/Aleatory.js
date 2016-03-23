/*
 *  Copyright 2016 Romain Edelmann
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

(function (root) {

    "use strict";

    function factory(Fraction) {

        /**
         * An Item is a pair of a value and its probability.
         *
         * @constructor
         * @param {*} value - The value.
         * @param {Fraction} probability - The probability, between 0 and 1.
         */
        function Item(value, probability) {

            if (!(this instanceof Item)) {
                return new Item(value, probability);
            }

            this.value = value;
            this.probability = probability;
        }

        /**
         * Aleatory is a random variable.
         * It is essentially a mapping from values to their probability.
         * For non-empty variables, the sum of all probabilities
         * should always be 1.
         *
         * The constructor is not intended to be used directly. Instead,
         * the methods and static functions of this class should be used.
         *
         * @constructor
         * @param {Object} content - An associative array mapping values to Item objects.
         */
        function Aleatory(content) {

            if (!(this instanceof Aleatory)) {
                return new Aleatory(content);
            }

            // The hashtable mapping values to pairs of values and probability.
            //
            // We store the pair of value and probability instead of simply the
            // probability due to the fact that the key of the hashmap is converted
            // to a string.
            this.content = content;
        }

        //---- Methods ----//

        /**
         * Applies a function to the values of this aleatory variable.
         *
         * The resulting aleatory variable assigns to each result
         * the probability of this result to be obtained.
         *
         * @param {Function} toResult - The function to apply on each value.
         * @return {Aleatory} The aleatory variable of the results.
         */
        Aleatory.prototype.map = function (toResult) {
            var newContent = {};
            var domain = this.domain();
            for (var i = 0; i < domain.length; i++) {
                var oldValue = domain[i];
                var newValue = toResult(oldValue);
                var aliasItem = newContent[newValue];
                var newProb = this.content[oldValue].probability;
                if (aliasItem !== undefined) {
                    newProb = newProb.add(aliasItem.probability);
                }
                newContent[newValue] = new Item(newValue, newProb);
            }
            return new Aleatory(newContent);
        };

        /**
         * Applies a function that returns an aleatory variable
         * to each possible value of this aleatory variable.
         *
         * The resulting aleatory variable assigns to each result
         * the probability of this result to be obtained.
         *
         * @param {Function} toAleatory - The function to apply on each value.
         * @return {Aleatory} The Aleatory variable of results.
         */
        Aleatory.prototype.flatMap = function (toAleatory) {
            var newContent = {};
            var oldDomain = this.domain();
            for (var i = 0; i < oldDomain.length; i++) {
                var oldValue = oldDomain[i];
                var newDistribution = toAleatory(oldValue);
                var newDomain = newDistribution.domain();
                for (var j = 0; j < newDomain.length; j++) {
                    var newValue = newDomain[j];
                    var aliasItem = newContent[newValue];
                    var newProb = newDistribution.content[newValue].probability.mul(
                        this.content[oldValue].probability);
                    if (aliasItem !== undefined) {
                        newProb = newProb.add(aliasItem.probability);
                    }
                    newContent[newValue] = new Item(newValue, newProb);
                }
            }
            return new Aleatory(newContent);
        };

        /**
         * Combines two Aleatory variables using a combiner function.
         *
         * @param {Function} combiner - The binary function to combine values of this and that.
         * @param {Aleatory} that - The other Aleatory variable.
         * @return {Aleatory} The Aleatory variable of the combinations.
         */
        Aleatory.prototype.combine = function (combiner, that) {
            var newContent = {};
            var thisDomain = this.domain();
            var thatDomain = that.domain();
            for (var i = 0; i < thisDomain.length; i++) {
                var thisValue = thisDomain[i];
                var thisProb = this.content[thisValue].probability;
                for (var j = 0; j < thatDomain.length; j++) {
                    var thatValue = thatDomain[j];
                    var thatProb = that.content[thatValue].probability;
                    var newValue = combiner(thisValue, thatValue);
                    var aliasItem = newContent[newValue];
                    var newProb = thisProb.mul(thatProb);
                    if (aliasItem !== undefined) {
                        newProb = newProb.add(aliasItem.probability);
                    }
                    newContent[newValue] = new Item(newValue, newProb);
                }
            }
            return new Aleatory(newContent);
        };

        /**
         * Returns this Aleatory variable conditioned by the predicate.
         *
         * All the values in the resulting Aleatory variable satisfy
         * the given predicate. Their probability is proportional to the
         * probability the had in this Aleatory variable. As always, the
         * sum of all probabilities in the resulting variable is 1.
         *
         * If none of the values satisfy the predicate, this function
         * return undefined.
         *
         * @param {Function} predicate - The predicate that values must hold.
         * @return {Aleatory} The Aleatory variable that contains all values which
         *                    satisfy the predicate.
         */
        Aleatory.prototype.assume = function (predicate) {
            var totalProbability = Fraction(0);
            var successes = [];
            var domain = this.domain();
            var item, i;
            for (i = 0; i < domain.length; i++) {
                item = this.content[domain[i]];
                if (predicate(item.value)) {
                    totalProbability = totalProbability.add(item.probability);
                    successes.push(new Item(item.value, item.probability));
                }
            }
            if (totalProbability.equals(Fraction(0))) {
                // The predicate never holds.
                return undefined;
            }
            var newContent = {};
            for (i = 0; i < successes.length; i++) {
                item = successes[i];
                item.probability = item.probability.div(totalProbability);
                newContent[item.value] = item;
            }
            return new Aleatory(newContent);
        };

        /**
         * Returns all values with non-zero probability.
         *
         * @return {Array} Values with non-zero probability.
         */
        Aleatory.prototype.domain = function () {
            var keys = [];
            for (var key in this.content) {
                if (this.content.hasOwnProperty(key)) {
                    keys.push(this.content[key].value);
                }
            }
            return keys;
        };

        /**
         * Returns the probability of a certain value.
         *
         * @param {*} value - The value to test.
         * @return {Fraction} The probability of the value.
         */
        Aleatory.prototype.probabilityAt = function (value) {
            var item = this.content[value];
            if (item !== undefined) {
                return item.probability;
            }
            return Fraction(0);
        };

        //---- Static functions ----//

        /**
         * Returns the probability of a certain predicate being true.
         *
         * @param {Function} predicate - The predicate to test.
         * @return {Fraction} The probability of having a value
         *                    that satifies the predicate.
         */
        Aleatory.prototype.probability = function (predicate) {
            var domain = this.domain();
            var prob = Fraction(0);
            for (var i = 0; i < domain.length; i++) {
                if (predicate(domain[i])) {
                    prob = prob.add(this.probabilityAt(domain[i]));
                }
            }
            return prob;
        };

        /**
         * Uniform distribution of the elements.
         *
         * In case of duplicate elements, the probability of each element
         * is proportional to its number of occurences.
         *
         * @param {Array} elements - An array of values.
         * @return {Aleatory} The uniform Aleatory variable over the elements.
         */
        Aleatory.uniform = function (elements) {
            var n = elements.length;

            if (n <= 0) {
                return undefined;
            }

            var p = new Fraction(1).div(n);
            var content = {};
            for (var i = 0; i < n; i++) {
                var aliasItem = content[elements[i]];
                var item = new Item(elements[i], p);
                if (aliasItem !== undefined) {
                    item.probability = item.probability.add(aliasItem.probability);
                }
                content[elements[i]] = item;
            }
            return new Aleatory(content);
        };

        /**
         * Aleatory variable that always returns the same value.
         *
         * @param {*} value - The only value in the Aleatory variable.
         * @return {Aleatory} The Aleatory variable that assigns to the value
         *                    the probability 1.
         */
        Aleatory.always = function (value) {
            return Aleatory.uniform([value]);
        };

        /**
         * Uniform Aleatory variable over numbers between 1 and n inclusive.
         *
         * @param {number} n - The maximum value of the Aleatory variable.
         * @return {Aleatory} The uniform Aleatory variable of numbers
         *                    between 1 and n inclusive.
         */
        Aleatory.dice = function (n) {
            var values = [];
            for (var i = 1; i <= n; i++) {
                values.push(i);
            }
            return Aleatory.uniform(values);
        };

        /**
         * Bernouli trials distribution.
         * Each number i between 0 and n inclusive is associated
         * with the probability of having exactly i successful outcomes
         * in n trials of given Aleatory variable.
         *
         * A value is considered to be a successful outcome if it is "truthy".
         * All "falsy" values (i.e. false, undefined, NaN, null, 0, "") are
         * considered to be failures.
         *
         * @param {number} n - The number of trials.
         * @param {Aleatory} aleatory - The Aleatory variable.
         * @return {Aleatory} The Aleatory variable of the numbers of
         *                    successful outcomes.
         */
        Aleatory.trials = function (n, aleatory) {

            if (n < 0) {
                return undefined;
            }

            if (n === 0) {
                return Aleatory.always(0);
            }

            var p = aleatory.probability(function (x) { return x; });
            var q = Fraction(1).sub(p);

            if (q.equals(Fraction(1))) {
                return Aleatory.always(0);
            }

            if (p.equals(Fraction(1))) {
                return Aleatory.always(n);
            }

            var current = Fraction(1);
            var ps = [current];
            for (var i = 1; i <= n; i++) {
                current = current.mul(p);
                ps[i] = current;
            }

            current = Fraction(1);
            var qs = [];
            qs[n] = current;
            for (i = n - 1; i >= 0; i--) {
                current = current.mul(q);
                qs[i] = current;
            }

            var coefs = [Fraction(1)];
            current = Fraction(1);
            for (i = 0; i < n; i++) {
                current = current.mul(Fraction(n - i)).div(Fraction(i + 1));
                coefs.push(current);
            }

            var content = {};
            for (i = 0; i <= n; i++) {
                content[i] = new Item(i, coefs[i].mul(ps[i]).mul(qs[i]));
            }

            return new Aleatory(content);
        };

        return Aleatory;
    }

    //---- Module export ----//

    if (typeof define === 'function' && define.amd) {
        define(['fraction.js'], function (fractionjs) {
            return factory(fractionjs);
        });
    } else if (typeof exports === 'object') {
        var fractionjs = require('fraction.js');
        module.exports = factory(fractionjs);
    } else {
        root.Aleatory = factory(Fraction);
    }
})(this);