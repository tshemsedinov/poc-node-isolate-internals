'use strict';

const { Array, Promise } = require('./boundary.js').internal;

const sumNumbers = (array) => {
  const map = (sum, number) => sum + number;
  const total = Array.prototype.reduce.call(array, map, 0);
  return Promise.resolve({ total });
};

module.exports = { sumNumbers };
