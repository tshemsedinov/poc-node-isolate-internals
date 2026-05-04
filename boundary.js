'use strict';

const InternalPromise = globalThis.Promise;
const InternalArray = globalThis.Array;
const InternalObject = globalThis.Object;
const InternalError = globalThis.Error;

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

class Object extends InternalObject {
  static get [Symbol.species]() {
    return InternalObject;
  }

  static [Symbol.hasInstance](value) {
    return value instanceof InternalObject;
  }
}

class Error extends InternalError {
  static get [Symbol.species]() {
    return InternalError;
  }
  static [Symbol.hasInstance](value) {
    return value instanceof InternalError;
  }
}

globalThis.Promise = Promise;
globalThis.Array = Array;
globalThis.Object = Object;
globalThis.Error = Error;

module.exports = {
  internal: {
    Promise: InternalPromise,
    Array: InternalArray,
    Object: InternalObject,
    Error: InternalError,
  },
  userland: {
    Promise,
    Array,
    Object,
    Error,
  },
};
