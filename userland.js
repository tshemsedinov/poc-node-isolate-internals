'use strict';

Promise.prototype.patched = 'userland';
Array.prototype.patched = 'userland';

const runUserland = async (internal) => {
  const promise = internal.getNumbers();
  const result = await promise;
  console.log('userland promise instanceof', promise instanceof Promise);
  console.log('userland result instanceof:', result instanceof Array);
  
  const a1 = new Array(1, 2, 3);
  console.log('userland array instanceof:', a1 instanceof Array);
  console.log('userland array patched:', a1.patched);
};

module.exports = runUserland;
