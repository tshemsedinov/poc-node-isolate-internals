'use strict';

Promise.prototype.patched = 'userland';
Array.prototype.patched = 'userland';
Error.prototype.patched = 'userland';

const runUserland = async (internal) => {
  const promise = internal.getNumbers();
  const result = await promise;

  console.log('userland promise instanceof:', promise instanceof Promise);
  console.log('userland result instanceof:', result instanceof Array);
  console.log('userland result patched:', result.patched);

  const a1 = new Array(1, 2, 3);
  console.log('userland new Array instanceof:', a1 instanceof Array);
  console.log('userland new Array patched:', a1.patched);

  const error = internal.failSomething();
  console.log('userland error instanceof:', error instanceof Error);
  console.log('userland error patched:', error.patched);

  const ownError = new Error('from userland');
  console.log('userland Error instanceof:', ownError instanceof Error);
  console.log('userland Error patched:', ownError.patched);
};

module.exports = runUserland;
