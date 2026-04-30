'use strict';

const boundary = require('boundary');

const getNumbers = () => {
  const result = Promise
    .resolve([1, 2, 3])
    .then((numbers) => {
      numbers.push(4);
      console.log('internal Array patched:', numbers.patched);
      return numbers;
    });
  console.log('internal Promise patched:', result.patched);
  return result;
};

const failWithError = () => {
  const error = new Error('internal failure');
  console.log('internal Error patched:', error.patched);
  return Promise.reject(error);
};

module.exports = boundary.expose({
  getNumbers,
  failWithError,
});
