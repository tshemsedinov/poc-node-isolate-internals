'use strict';

const NativeObject = globalThis.Object;
const NativeArray = globalThis.Array;
const NativePromise = globalThis.Promise;
const NativeSymbol = globalThis.Symbol;

const NativePromisePrototype = NativePromise.prototype;
const nativePromiseResolve = NativePromise.resolve.bind(NativePromise);
const nativePromiseReject = NativePromise.reject.bind(NativePromise);
const nativePromiseAll = NativePromise.all.bind(NativePromise);
const nativePromiseRace = NativePromise.race.bind(NativePromise);
const nativePromiseAllSettled = NativePromise.allSettled.bind(NativePromise);
const nativePromiseAny = NativePromise.any.bind(NativePromise);

const defineProperty = NativeObject.defineProperty;
const objectCreate = NativeObject.create;
const getPrototypeOf = NativeObject.getPrototypeOf;
const objectKeys = NativeObject.keys;

const exportArray = (value) => {
  if (!(value instanceof NativeArray)) return value;
  if (getPrototypeOf(value) === Array.prototype) {
    return value;
  }
  setPrototypeOf(value, Array.prototype);
  return value;
};

const exportPromise = (value) => {
  if (!(value instanceof NativePromise)) return value;
  if (getPrototypeOf(value) === Promise.prototype) {
    return value;
  }
  setPrototypeOf(value, Promise.prototype);
  return value;
};

const exportObject = (value) => {
  if (!value || typeof value !== 'object') return value;
  if (value instanceof NativeArray) return exportArray(value);
  if (value instanceof NativePromise) return exportPromise(value);

  for (const key of objectKeys(value)) {
    value[key] = exportValue(value[key]);
  }
  return value;
};

const exportValue = (value) => {
  if (value instanceof NativeArray) return exportArray(value);
  if (value instanceof NativePromise) return exportPromise(value);
  if (value && typeof value === 'object') return exportObject(value);
  return value;
};

function Promise(executor) {
  return exportPromise(new NativePromise(executor));
};

Promise.prototype = objectCreate(
  NativePromisePrototype,
  {
    constructor: {
      value: Promise,
      configurable: true,
      writable: true,
    },
  },
);

defineProperty(Promise.prototype, 'then', {
  value: function(onFulfilled, onRejected) {
    const result = NativePromisePrototype.then.call(
      this,
      onFulfilled,
      onRejected,
    );
    return exportPromise(result);
  },
  configurable: true,
  writable: true,
  enumerable: false,
});

defineProperty(Promise.prototype, 'catch', {
  value: function(onRejected) {
    const result = NativePromisePrototype.catch.call(this, onRejected);
    return exportPromise(result);
  },
  configurable: true,
  writable: true,
  enumerable: false,
});

defineProperty(Promise.prototype, 'finally', {
  value: function(onFinally) {
    const result = NativePromisePrototype.finally.call(this, onFinally);
    return exportPromise(result);
  },
  configurable: true,
  writable: true,
  enumerable: false,
});

defineProperty(Promise, 'resolve', {
  value: (value) => exportPromise(nativePromiseResolve(value)),
  configurable: true,
  writable: true,
  enumerable: false,
});

defineProperty(Promise, 'reject', {
  value: (reason) => exportPromise(nativePromiseReject(reason)),
  configurable: true,
  writable: true,
  enumerable: false,
});

defineProperty(Promise, 'all', {
  value: (values) => exportPromise(nativePromiseAll(values)),
  configurable: true,
  writable: true,
  enumerable: false,
});

defineProperty(Promise, 'race', {
  value: (values) => exportPromise(nativePromiseRace(values)),
  configurable: true,
  writable: true,
  enumerable: false,
});

defineProperty(Promise, 'allSettled', {
  value: (values) => exportPromise(nativePromiseAllSettled(values)),
  configurable: true,
  writable: true,
  enumerable: false,
});

defineProperty(Promise, 'any', {
  value: (values) => exportPromise(nativePromiseAny(values)),
  configurable: true,
  writable: true,
  enumerable: false,
});

defineProperty(Promise, NativeSymbol.species, {
  get: () => Promise,
  configurable: true,
  enumerable: false,
});

defineProperty(Promise, NativeSymbol.hasInstance, {
  value: (instance) => instance instanceof NativePromise,
  configurable: true,
  writable: true,
  enumerable: false,
});

function Array(...args) {
  if (args.length === 1 && typeof args[0] === 'number') {
    return exportArray(new NativeArray(args[0]));
  }
  return exportArray(new NativeArray(...args));
}

Array.prototype = objectCreate(
  NativeArray.prototype,
  {
    constructor: {
      value: Array,
      configurable: true,
      writable: true,
    },
  },
);

defineProperty(Array, 'from', {
  value: (...args) => exportArray(nativeArrayFrom(...args)),
  configurable: true,
  writable: true,
  enumerable: false,
});

defineProperty(Array, 'of', {
  value: (...args) => exportArray(nativeArrayOf(...args)),
  configurable: true,
  writable: true,
  enumerable: false,
});

defineProperty(Array, 'isArray', {
  value: (value) => value instanceof NativeArray,
  configurable: true,
  writable: true,
  enumerable: false,
});

defineProperty(Array, NativeSymbol.species, {
  get: () => Array,
  configurable: true,
  enumerable: false,
});

defineProperty(Array, NativeSymbol.hasInstance, {
  value: (instance) => instance instanceof NativeArray,
  configurable: true,
  writable: true,
  enumerable: false,
});

module.exports = {
  internal: {
    Array: NativeArray,
    Promise: NativePromise,
  },
  userland: {
    Array,
    Promise,
  },
};
