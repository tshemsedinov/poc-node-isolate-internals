'use strict';

const InternalObject = globalThis.Object;
const InternalArray = globalThis.Array;
const InternalPromise = globalThis.Promise;
const InternalSymbol = globalThis.Symbol;

const defineValue = (target, key, value) => {
  InternalObject.defineProperty(target, key, {
    value,
    configurable: true,
    writable: true,
    enumerable: false,
  });
};

const defineGetter = (target, key, get) => {
  InternalObject.defineProperty(target, key, {
    get,
    configurable: true,
    enumerable: false,
  });
};

const exportArray = (value) => {
  if (!(value instanceof InternalArray)) return value;
  if (InternalObject.getPrototypeOf(value) === UserlandArray.prototype) {
    return value;
  }

  InternalObject.setPrototypeOf(value, UserlandArray.prototype);
  return value;
};

const exportPromise = (value) => {
  if (!(value instanceof InternalPromise)) return value;
  if (InternalObject.getPrototypeOf(value) === UserlandPromise.prototype) {
    return value;
  }

  InternalObject.setPrototypeOf(value, UserlandPromise.prototype);
  return value;
};

const exportObject = (value) => {
  if (!value || typeof value !== 'object') return value;
  if (value instanceof InternalArray) return exportArray(value);
  if (value instanceof InternalPromise) return exportPromise(value);

  for (const key of InternalObject.keys(value)) {
    value[key] = exportValue(value[key]);
  }

  return value;
};

const exportValue = (value) => {
  if (value instanceof InternalArray) return exportArray(value);
  if (value instanceof InternalPromise) return exportPromise(value);
  if (value && typeof value === 'object') return exportObject(value);
  return value;
};

const UserlandPromise = function(executor) {
  return exportPromise(new InternalPromise(executor));
};

UserlandPromise.prototype = InternalObject.create(
  InternalPromise.prototype,
  {
    constructor: {
      value: UserlandPromise,
      configurable: true,
      writable: true,
    },
  },
);

defineValue(
  UserlandPromise.prototype,
  'then',
  function(onFulfilled, onRejected) {
    const result = InternalPromise.prototype.then.call(
      this,
      onFulfilled,
      onRejected,
    );

    return exportPromise(result);
  },
);

defineValue(
  UserlandPromise.prototype,
  'catch',
  function(onRejected) {
    const result = InternalPromise.prototype.catch.call(this, onRejected);
    return exportPromise(result);
  },
);

defineValue(
  UserlandPromise.prototype,
  'finally',
  function(onFinally) {
    const result = InternalPromise.prototype.finally.call(this, onFinally);
    return exportPromise(result);
  },
);

defineValue(
  UserlandPromise,
  'resolve',
  (value) => exportPromise(InternalPromise.resolve(value)),
);

defineValue(
  UserlandPromise,
  'reject',
  (reason) => exportPromise(InternalPromise.reject(reason)),
);

defineValue(
  UserlandPromise,
  'all',
  (values) => exportPromise(InternalPromise.all(values)),
);

defineValue(
  UserlandPromise,
  'race',
  (values) => exportPromise(InternalPromise.race(values)),
);

defineValue(
  UserlandPromise,
  'allSettled',
  (values) => exportPromise(InternalPromise.allSettled(values)),
);

defineValue(
  UserlandPromise,
  'any',
  (values) => exportPromise(InternalPromise.any(values)),
);

defineGetter(
  UserlandPromise,
  InternalSymbol.species,
  () => UserlandPromise,
);

defineValue(
  UserlandPromise,
  InternalSymbol.hasInstance,
  (instance) => instance instanceof InternalPromise,
);

const UserlandArray = function(...args) {
  if (args.length === 1 && typeof args[0] === 'number') {
    return exportArray(new InternalArray(args[0]));
  }

  return exportArray(new InternalArray(...args));
};

UserlandArray.prototype = InternalObject.create(
  InternalArray.prototype,
  {
    constructor: {
      value: UserlandArray,
      configurable: true,
      writable: true,
    },
  },
);

defineValue(
  UserlandArray,
  'from',
  (...args) => exportArray(InternalArray.from(...args)),
);

defineValue(
  UserlandArray,
  'of',
  (...args) => exportArray(InternalArray.of(...args)),
);

defineValue(
  UserlandArray,
  'isArray',
  (value) => value instanceof InternalArray,
);

defineGetter(
  UserlandArray,
  InternalSymbol.species,
  () => UserlandArray,
);

defineValue(
  UserlandArray,
  InternalSymbol.hasInstance,
  (instance) => instance instanceof InternalArray,
);

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
  exportArray,
  exportPromise,
  exportObject,
  exportValue,
};
