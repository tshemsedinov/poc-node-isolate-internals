'use strict';

const { internal } = require('./boundary.js');
const { Promise, Array, Error } = internal;

const getNumbers = () => {
  const result = Promise
    .resolve([1, 2, 3])
    .then((numbers) => {
      numbers.push(4);
      return Array.from(numbers);
    });
  return result;
};

const failWithError = () => {
  const error = new Error('internal failure');
  return Promise.reject(error);
};

module.exports = { getNumbers, failWithError };
