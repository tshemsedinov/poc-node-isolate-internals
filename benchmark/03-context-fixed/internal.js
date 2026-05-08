'use strict';

const { userland } = require('boundary');

const sumNumbers = (array) => {
  const map = (sum, number) => sum + number;
  const total = Array.prototype.reduce.call(array, map, 0);
  const result = new userland.Object();
  result.total = total;
  return userland.Promise.resolve(result);
};

module.exports = { sumNumbers };
