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

const toUserlandError = (value = {}) => {
  if (value instanceof userland.Error) return value;
  const { message = '', name, code, stack } = value;
  const error = new userland.Error(message);
  if (name) error.name = name;
  if (code) error.code = code;
  if (stack) error.stack = stack;
  return error;
};

const toUserlandValue = (value) => {
  if (Array.isArray(value)) {
    return userland.Array.from(value, (item) => toUserlandValue(item));
  }
  if (!value) return value;
  if (typeof value !== 'object') return value;
  if (value instanceof Error) return toUserlandError(value);
  const record = new userland.Object();
  for (const key of Object.keys(value)) {
    record[key] = toUserlandValue(value[key]);
  }
  return record;
};

const toUserlandPromise = (internalPromise) => (
  new userland.Promise((resolve, reject) => {
    internalPromise.then(
      (value) => resolve(toUserlandValue(value)),
      (error) => reject(toUserlandError(error)),
    );
  })
);

const exposeFunction = (fn) => (...args) => {
  const callPromise = Promise.resolve().then(() => fn(...args));
  const convertedPromise = callPromise.catch((error) =>
    Promise.reject(toUserlandError(error)));
  const userlandPromise = toUserlandPromise(convertedPromise);
  return userlandPromise;
};

const boundary = Object.freeze({
  expose(api) {
    const frozenApi = Object.freeze(api);
    const wrapped = new userland.Object();
    for (const key of Object.keys(frozenApi)) {
      const method = frozenApi[key];
      if (typeof method === 'function') {
        wrapped[key] = exposeFunction(method);
      }
    }
    return Object.freeze(wrapped);
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
