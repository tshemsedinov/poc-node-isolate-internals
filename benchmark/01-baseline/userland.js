'use strict';

Promise.prototype.userlandTag = 'userland';
Array.prototype.userlandTag = 'userland';
Error.prototype.userlandTag = 'userland';

const runScenario = async (internalApi) => {
  const promise = internalApi.getNumbers();
  const result = await promise;
  return {
    userlandPromiseInstanceof: promise instanceof Promise,
    userlandPromiseTagged: promise.userlandTag === 'userland',
    internalPromiseTagged: result.internalPromiseTagged,
    internalArrayTagged: result.internalArrayTagged,
    returnedArrayInstanceof: result.numbers instanceof Array,
    returnedArrayTagged: result.numbers.userlandTag === 'userland',
    returnedNumbers: Array.from(result.numbers),
  };
};

module.exports = {
  runScenario,
};
