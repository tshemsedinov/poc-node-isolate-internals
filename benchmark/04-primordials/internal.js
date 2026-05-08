'use strict';

const {
  Object,
  PromiseResolve,
  ArrayPrototypeReduce,
} = require('./boundary.js').internal;

const sumNumbers = (array) => {
  const map = (sum, number) => sum + number;
  const total = ArrayPrototypeReduce(array, map, 0);
  const result = new Object();
  result.total = total;
  return PromiseResolve(result);
};

module.exports = { sumNumbers };
