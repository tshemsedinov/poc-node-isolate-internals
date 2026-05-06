'use strict';

const getNumbers = () => {
  const result = Promise
    .resolve([1, 2, 3])
    .then((numbers) => {
      numbers.push(4);
      const arr = Array.from(numbers);

      const a1 = new Array(1, 2, 3);
      console.log('internal array instanceof Array:', a1 instanceof Array);
      console.log('internal array patched:', a1.patched);

      const literal = [1, 2, 3];
      console.log('internal literal instanceof Array:', literal instanceof Array);
      console.log('internal literal patched:', literal.patched);

      return arr;
    });
  return result;
};

const failSomething = () => {
  try {
    throw new Error('boom from internal');
  } catch (error) {
    console.log('internal caught instanceof Error:', error instanceof Error);
    console.log('internal error tag:', error.patched);
    return error;
  }
};

module.exports = { getNumbers, failSomething };
