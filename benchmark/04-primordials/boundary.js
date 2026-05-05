'use strict';

const { resolve: PromiseResolve } = Promise;
const { reduce: ArrayPrototypeReduce } = Array.prototype;

module.exports = {
  internal: {
    Object,
    PromiseResolve: (value) => PromiseResolve.call(Promise, value),
    ArrayPrototypeReduce: (array, callback, initialValue) => (
      ArrayPrototypeReduce.call(array, callback, initialValue)
    ),
  },
};
