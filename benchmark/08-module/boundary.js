'use strict';

const Module = require('node:module');
const path = require('node:path');
const vm = require('node:vm');

const InternalObject = globalThis.Object;
const InternalArray = globalThis.Array;
const InternalPromise = globalThis.Promise;
const InternalError = globalThis.Error;
const InternalTypeError = globalThis.TypeError;
const InternalRangeError = globalThis.RangeError;
const InternalSyntaxError = globalThis.SyntaxError;
const InternalSymbol = globalThis.Symbol;
const InternalMap = globalThis.Map;
const InternalSet = globalThis.Set;

const ObjectCreate = InternalObject.create;
const ObjectDefineProperty = InternalObject.defineProperty;
const ObjectKeys = InternalObject.keys;
const ObjectGetOwnPropertyNames = InternalObject.getOwnPropertyNames;
const ObjectGetOwnPropertyDescriptor = InternalObject.getOwnPropertyDescriptor;

const defineValue = (target, key, value) => {
  ObjectDefineProperty(target, key, {
    value,
    configurable: true,
    writable: true,
    enumerable: false,
  });
};

const defineGetter = (target, key, get) => {
  ObjectDefineProperty(target, key, {
    get,
    configurable: true,
    enumerable: false,
  });
};

const buildUserland = (Internal, name) => {
  const Userland = function(...args) {
    if (new.target) return Reflect.construct(Internal, args, Userland);
    return Internal(...args);
  };

  Userland.prototype = ObjectCreate(Internal.prototype, {
    constructor: { value: Userland, configurable: true, writable: true },
  });

  for (const key of ObjectGetOwnPropertyNames(Internal)) {
    if (key === 'length' || key === 'name' || key === 'prototype') continue;
    const desc = ObjectGetOwnPropertyDescriptor(Internal, key);
    if (!desc) continue;
    try {
      ObjectDefineProperty(Userland, key, desc);
    } catch {}
  }
  defineValue(Userland, InternalSymbol.hasInstance, (instance) => (
    instance instanceof Internal
  ));
  defineGetter(Userland, InternalSymbol.species, () => Userland);
  defineValue(Userland, 'name', name);

  return Userland;
};

const UserlandArray = buildUserland(InternalArray, 'Array');
const UserlandPromise = buildUserland(InternalPromise, 'Promise');
const UserlandError = buildUserland(InternalError, 'Error');
const UserlandTypeError = buildUserland(InternalTypeError, 'TypeError');
const UserlandRangeError = buildUserland(InternalRangeError, 'RangeError');
const UserlandSyntaxError = buildUserland(InternalSyntaxError, 'SyntaxError');
const UserlandMap = buildUserland(InternalMap, 'Map');
const UserlandSet = buildUserland(InternalSet, 'Set');

const internalBindings = {
  Object: InternalObject,
  Array: InternalArray,
  Promise: InternalPromise,
  Error: InternalError,
  TypeError: InternalTypeError,
  RangeError: InternalRangeError,
  SyntaxError: InternalSyntaxError,
  Symbol: InternalSymbol,
  Map: InternalMap,
  Set: InternalSet,
};

const userlandBindings = {
  Object: InternalObject,
  Array: UserlandArray,
  Promise: UserlandPromise,
  Error: UserlandError,
  TypeError: UserlandTypeError,
  RangeError: UserlandRangeError,
  SyntaxError: UserlandSyntaxError,
  Symbol: InternalSymbol,
  Map: UserlandMap,
  Set: UserlandSet,
};

const internalParamNames = ObjectKeys(internalBindings);
const internalParamValues = internalParamNames.map((k) => internalBindings[k]);

const userlandParamNames = ObjectKeys(userlandBindings);
const userlandParamValues = userlandParamNames.map((k) => userlandBindings[k]);

const wrapHead = (paramNames) => ([
  'exports', 'require', 'module', '__filename', '__dirname',
  ...paramNames,
]);

const internalWrapperParams = wrapHead(internalParamNames);
const userlandWrapperParams = wrapHead(userlandParamNames);

const originalCompile = Module.prototype._compile;

Module.prototype._compile = function(content, filename) {
  if (filename.includes('node_modules')) {
    return originalCompile.call(this, content, filename);
  }
  const isInternal = filename.includes('internal');
  const wrapperParams = isInternal
    ? internalWrapperParams
    : userlandWrapperParams;
  const paramValues = isInternal
    ? internalParamValues
    : userlandParamValues;
  const compiledFn = vm.compileFunction(content, wrapperParams, {
    filename,
    lineOffset: 0,
    columnOffset: 0,
  });

  const requireFn = Module.createRequire(filename);
  const dirname = path.dirname(filename);

  return compiledFn.apply(this.exports, [
    this.exports,
    requireFn,
    this,
    filename,
    dirname,
    ...paramValues,
  ]);
};

globalThis.Array = UserlandArray;
globalThis.Promise = UserlandPromise;
globalThis.Error = UserlandError;
globalThis.TypeError = UserlandTypeError;
globalThis.RangeError = UserlandRangeError;
globalThis.SyntaxError = UserlandSyntaxError;
globalThis.Map = UserlandMap;
globalThis.Set = UserlandSet;

module.exports = {
  internal: internalBindings,
  userland: userlandBindings,
};
