'use strict';

const { Promise, Array } = require('./boundary.js').internal;

const sumNumbers = (array) => {
  const map = (sum, number) => sum + number;
  const total = Array.from(array).reduce(map, 0);
  return Promise.resolve({ total });
};

module.exports = { sumNumbers };
