'use strict';

const { Array, Promise, Error } = require('./boundary.js').internal;

Promise.prototype.patched = 'internal';
Array.prototype.patched = 'internal';
Error.prototype.patched = 'internal';

const getNumbers = () => {
  const result = Promise
    .resolve([1, 2, 3])
    .then((numbers) => {
      numbers.push(4);
      const array = Array.from(numbers);

      const a1 = new Array(1, 2, 3);
      console.log('internal array instanceof Array:', a1 instanceof Array);
      console.log('internal array patched:', a1.patched);

      const a2 = [1, 2, 3];
      console.log('internal literal instanceof Array:', a2 instanceof Array);
      console.log('internal literal patched:', a2.patched);

      return array;
    });
  return result;
};

const failSomething = () => {
  try {
    throw new Error('boom from internal');
  } catch (error) {
    console.log('internal caught instanceof Error:', error instanceof Error);
    console.log('internal error patched:', error.patched);
    return error;
  }
};

module.exports = { getNumbers, failSomething };
