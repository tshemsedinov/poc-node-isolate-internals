'use strict';

const { resolve: PromiseResolve } = Promise;
const { then: PromisePrototypeThen } = Promise.prototype;
const { push: ArrayPrototypePush } = Array.prototype;

module.exports = {
  primordials: {
    PromiseResolve: (value) => PromiseResolve.call(Promise, value),
    PromisePrototypeThen: (promise, onFulfilled, onRejected) => (
      PromisePrototypeThen.call(
        promise,
        onFulfilled,
        onRejected,
      )
    ),
    ArrayPrototypePush: (array, value) => (
      ArrayPrototypePush.call(array, value)
    ),
  },
  internal: {
    Promise,
    Array,
    Object,
    Error,
  },
};
