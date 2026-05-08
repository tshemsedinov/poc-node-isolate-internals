'use strict';

const NativeArray = globalThis.Array;
const NativePromise = globalThis.Promise;

class Promise extends NativePromise {
  static get [Symbol.species]() {
    return NativePromise;
  }

  static [Symbol.hasInstance](value) {
    return value instanceof NativePromise;
  }
}

class Array extends NativeArray {
  static get [Symbol.species]() {
    return NativeArray;
  }

  static [Symbol.hasInstance](value) {
    return value instanceof NativeArray;
  }
}

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
