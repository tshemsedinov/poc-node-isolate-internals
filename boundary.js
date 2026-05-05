'use strict';

const InternalPromise = globalThis.Promise;
const InternalArray = globalThis.Array;

class Promise extends InternalPromise {
  static get [Symbol.species]() {
    return InternalPromise;
  }

  static [Symbol.hasInstance](value) {
    return value instanceof InternalPromise;
  }
}

class Array extends InternalArray {
  static get [Symbol.species]() {
    return InternalArray;
  }

  static [Symbol.hasInstance](value) {
    return value instanceof InternalArray;
  }
}

InternalArray.prototype.patched = 'internal';
InternalPromise.prototype.patched = 'internal';

globalThis.Promise = Promise;
globalThis.Array = Array;

module.exports = {
  internal: { Promise: InternalPromise, Array: InternalArray },
  userland: { Promise, Array },
};
