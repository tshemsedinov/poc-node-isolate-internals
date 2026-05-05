'use strict';

const InternalPromise = globalThis.Promise;
const InternalArray = globalThis.Array;

function UserlandPromise(executor) {
  return new InternalPromise(executor);
}

UserlandPromise.prototype = Object.create(InternalPromise.prototype, {
  constructor: { value: UserlandPromise, configurable: true, writable: true },
});

UserlandPromise.resolve = (value) => InternalPromise.resolve(value);
UserlandPromise.reject = (reason) => InternalPromise.reject(reason);
UserlandPromise.all = (values) => InternalPromise.all(values);
UserlandPromise.race = (values) => InternalPromise.race(values);
UserlandPromise.allSettled = (values) => InternalPromise.allSettled(values);
UserlandPromise.any = (values) => InternalPromise.any(values);

Object.defineProperty(UserlandPromise, Symbol.species, {
  get: () => InternalPromise,
  configurable: true,
});

Object.defineProperty(UserlandPromise, Symbol.hasInstance, {
  value: (instance) => instance instanceof InternalPromise,
  configurable: true,
  writable: true,
});

function UserlandArray(...args) {
  if (args.length === 1 && typeof args[0] === 'number') {
    return new InternalArray(args[0]);
  }

  return new InternalArray(...args);
}

UserlandArray.prototype = Object.create(InternalArray.prototype, {
  constructor: { value: UserlandArray, configurable: true, writable: true },
});

UserlandArray.from = (...args) => InternalArray.from(...args);
UserlandArray.of = (...args) => InternalArray.of(...args);
UserlandArray.isArray = (value) => InternalArray.isArray(value);

Object.defineProperty(UserlandArray, Symbol.species, {
  get: () => InternalArray,
  configurable: true,
});

Object.defineProperty(UserlandArray, Symbol.hasInstance, {
  value: (instance) => instance instanceof InternalArray,
  configurable: true,
  writable: true,
});

globalThis.Promise = UserlandPromise;
globalThis.Array = UserlandArray;

module.exports = {
  internal: {
    Promise: InternalPromise,
    Array: InternalArray,
  },
  userland: {
    Promise: UserlandPromise,
    Array: UserlandArray,
  },
};
