'use strict';

const { Promise, Array } = require('./boundary.js').internal;

const getNumbers = () => {
  const result = Promise
    .resolve([1, 2, 3])
    .then((numbers) => {
      numbers.push(4);
      const result = Array.from(numbers);

      const a1 = new Array(1, 2, 3);
      console.log('internal array instanceof:', a1 instanceof Array);
      console.log('internal array patched:', a1.patched);

      return result;
    });
  return result;
};

module.exports = { getNumbers };
