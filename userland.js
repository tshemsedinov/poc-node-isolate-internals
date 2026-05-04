'use strict';

Promise.prototype.patched = 'userland';
Array.prototype.patched = 'userland';
Object.prototype.patched = 'userland';
Error.prototype.patched = 'userland';

const runUserland = async (internal) => {
  const promise = internal.getNumbers();
  const numbers = await promise;
  console.log('userland promise instanceof', promise instanceof Promise);
  console.log('userland numbers instanceof:', numbers instanceof Array);
  try {
    const promise = internal.failWithError();
    const result = await promise;
  } catch (error) {
    console.log('userland error instanceof:', error instanceof Error);
  }
  const array = new Array(1, 2, 3);
  console.log('userland array instanceof:', array instanceof Array);
  console.log('userland array patched:', array.patched);
};

module.exports = runUserland;
