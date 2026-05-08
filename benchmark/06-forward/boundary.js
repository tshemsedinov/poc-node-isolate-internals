'use strict';

const NativePromise = globalThis.Promise;
const NativeArray = globalThis.Array;

const PromisePrototype = Object.create(NativePromise.prototype);
const ArrayPrototype = Object.create(NativeArray.prototype);

function Promise(executor) {
  if (!new.target) {
    throw new TypeError(
      `Class constructor Promise cannot be invoked without 'new'`
    );
  }
  return new NativePromise(executor);
};

function Array(...args) {
  if (!new.target) return NativeArray(...args);
  return new NativeArray(...args);
};

Object.defineProperty(Promise, 'resolve', { value: (value) => NativePromise.resolve(value), configurable: true, writable: true, enumerable: false });
Object.defineProperty(Promise, 'reject', { value: (value) => NativePromise.reject(value), configurable: true, writable: true, enumerable: false });
Object.defineProperty(Promise, 'all', { value: (value) => NativePromise.all(value), configurable: true, writable: true, enumerable: false });
Object.defineProperty(Promise, 'race', { value: (value) => NativePromise.race(value), configurable: true, writable: true, enumerable: false });
Object.defineProperty(Promise, 'allSettled', { value: (value) => NativePromise.allSettled(value), configurable: true, writable: true, enumerable: false });
Object.defineProperty(Promise, 'any', { value: (value) => NativePromise.any(value), configurable: true, writable: true, enumerable: false });
Object.defineProperty(Promise, Symbol.hasInstance, { value: (value) => value instanceof NativePromise, configurable: true, writable: true, enumerable: false });

Object.defineProperty(Array, 'from', { value: (...args) => NativeArray.from(...args), configurable: true, writable: true, enumerable: false });
Object.defineProperty(Array, 'of', { value: (...args) => NativeArray.of(...args), configurable: true, writable: true, enumerable: false });
Object.defineProperty(Array, 'isArray', { value: (value) => NativeArray.isArray(value), configurable: true, writable: true, enumerable: false });
Object.defineProperty(Array, Symbol.hasInstance, { value: (value) => value instanceof NativeArray, configurable: true, writable: true, enumerable: false });

Object.defineProperty(PromisePrototype, 'constructor', { value: Promise, configurable: true, writable: true, enumerable: false });
Object.defineProperty(ArrayPrototype, 'constructor', { value: Array, configurable: true, writable: true, enumerable: false });

Promise.prototype = PromisePrototype;
Array.prototype = ArrayPrototype;

module.exports = {
  internal: {
    Array,
    Promise,
  },
  userland: {
    Array: NativeArray,
    Promise: NativePromise,
  },
};
