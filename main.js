'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const evaluateCommonJs = ({ context, filename, dependencies = {} }) => {
  const source = fs.readFileSync(filename, 'utf8');
  const signature = '((require, module, __filename, __dirname) => {';
  const code = `${signature}\n${source}\n})`;
  const wrapper = vm.runInContext(code, context, { filename });
  const module = { exports: {} };

  const localRequire = (specifier) => {
    if (Object.hasOwn(dependencies, specifier)) {
      return dependencies[specifier];
    }
    throw new Error(`Unknown module: ${specifier}`);
  };

  const dirname = path.dirname(filename);
  wrapper(localRequire, module, filename, dirname);
  return module.exports;
};

const internalContext = vm.createContext({ console });
const userlandContext = vm.createContext({ console });

const userland = {
  Promise: vm.runInContext('Promise', userlandContext),
  Array: vm.runInContext('Array', userlandContext),
  Object: vm.runInContext('Object', userlandContext),
  Error: vm.runInContext('Error', userlandContext),
};

const isThenable = (value) => (
  value !== null &&
  (typeof value === 'object' || typeof value === 'function') &&
  typeof value.then === 'function'
);

const toUserlandError = (value = {}) => {
  if (value instanceof userland.Error) return value;
  const { message = '', name, code, stack } = value;
  const error = new userland.Error(message);
  if (name) error.name = name;
  if (code) error.code = code;
  if (stack) error.stack = stack;
  return error;
};

const toUserlandPromise = (value) => (
  userland.Promise
    .resolve(value)
    .catch((error) => {
      throw toUserlandError(error);
    })
);

const exposeFunction = (fn) => (...args) => {
  let result;
  try {
    result = fn(...args);
  } catch (error) {
    return userland.Promise.reject(toUserlandError(error));
  }
  if (!isThenable(result)) return result;
  return toUserlandPromise(result);
};

const boundary = Object.freeze({
  userland,
  expose(api) {
    for (const key of Object.keys(api)) {
      const method = api[key];
      if (typeof method === 'function') {
        api[key] = exposeFunction(method);
      }
    }
    return Object.freeze(api);
  },
});

const internalApi = evaluateCommonJs({
  context: internalContext,
  filename: path.join(__dirname, 'internal.js'),
  dependencies: { boundary },
});

evaluateCommonJs({
  context: userlandContext,
  filename: path.join(__dirname, 'userland.js'),
  dependencies: { internal: internalApi },
});
