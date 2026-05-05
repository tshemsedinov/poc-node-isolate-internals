'use strict';

const InternalPromise = globalThis.Promise;
const InternalArray = globalThis.Array;

const defineValue = (target, key, value) => {
  Object.defineProperty(target, key, {
    value,
    configurable: true,
    writable: true,
    enumerable: false,
  });
};

const PromisePrototype = Object.create(InternalPromise.prototype);
const ArrayPrototype = Object.create(InternalArray.prototype);

const Promise = function(executor) {
  if (!new.target) {
    throw new TypeError(
      `Class constructor Promise cannot be invoked without 'new'`
    );
  }
  return new InternalPromise(executor);
};

const Array = function(...args) {
  if (!new.target) {
    return InternalArray(...args);
  }

  return new InternalArray(...args);
};

defineValue(Promise, 'resolve', (value) => InternalPromise.resolve(value));
defineValue(Promise, 'reject', (value) => InternalPromise.reject(value));
defineValue(Promise, 'all', (value) => InternalPromise.all(value));
defineValue(Promise, 'race', (value) => InternalPromise.race(value));
defineValue(Promise, 'allSettled', (value) => InternalPromise.allSettled(value));
defineValue(Promise, 'any', (value) => InternalPromise.any(value));
defineValue(Promise, Symbol.hasInstance, (value) => (
  value instanceof InternalPromise
));

defineValue(Array, 'from', (...args) => InternalArray.from(...args));
defineValue(Array, 'of', (...args) => InternalArray.of(...args));
defineValue(Array, 'isArray', (value) => InternalArray.isArray(value));
defineValue(Array, Symbol.hasInstance, (value) => (
  value instanceof InternalArray
));

defineValue(PromisePrototype, 'constructor', Promise);
defineValue(ArrayPrototype, 'constructor', Array);

Promise.prototype = PromisePrototype;
Array.prototype = ArrayPrototype;

globalThis.Promise = Promise;
globalThis.Array = Array;

module.exports = {
  internal: {
    Promise: InternalPromise,
    Array: InternalArray,
  },
  userland: {
    Promise,
    Array,
  },
};
