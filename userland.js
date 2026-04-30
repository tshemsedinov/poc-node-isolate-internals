'use strict';

const internal = require('internal');

Promise.prototype.patched = 'userland';
Array.prototype.patched = 'userland';
Object.prototype.patched = 'userland';
Error.prototype.patched = 'userland';

(async () => {
  const promise = internal.getNumbers();

  console.log('userland instanceof Promise:', promise instanceof Promise);
  console.log('userland promise patched:', promise.patched);

  const numbers = await promise;

  console.log('userland result patched:', numbers.patched);
  console.log('userland result instanceof Array:', numbers instanceof Array);

  try {
    await internal.failWithError();
  } catch (error) {
    console.log('error instanceof Error:', error instanceof Error);
    console.log('error patched:', error.patched);
  }
})();
