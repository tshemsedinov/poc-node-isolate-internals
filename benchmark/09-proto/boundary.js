'use strict';

const NativeObject = globalThis.Object;
const NativeArray = globalThis.Array;
const NativePromise = globalThis.Promise;
const NativeSymbol = globalThis.Symbol;
const reflectConstruct = globalThis.Reflect.construct;

const objectCreate = NativeObject.create;
const defineProperty = NativeObject.defineProperty;
const getOwnPropertyNames = NativeObject.getOwnPropertyNames;
const getOwnPropertySymbols = NativeObject.getOwnPropertySymbols;
const getOwnPropertyDescriptor = NativeObject.getOwnPropertyDescriptor;

const nativeArrayFrom = NativeArray.from;
const nativeArrayOf = NativeArray.of;
const nativeArrayIsArray = NativeArray.isArray;

const nativePromiseResolve = NativePromise.resolve.bind(NativePromise);
const nativePromiseReject = NativePromise.reject.bind(NativePromise);
const nativePromiseAll = NativePromise.all.bind(NativePromise);
const nativePromiseRace = NativePromise.race.bind(NativePromise);
const nativePromiseAllSettled = NativePromise.allSettled.bind(NativePromise);
const nativePromiseAny = NativePromise.any.bind(NativePromise);

const symbolHasInstance = NativeSymbol.hasInstance;
const symbolSpecies = NativeSymbol.species;

const copyOwnMethods = (target, source) => {
  const names = getOwnPropertyNames(source);
  for (let i = 0; i < names.length; i++) {
    const key = names[i];
    if (
      key === 'constructor' || key === 'length' ||
      key === 'name' || key === 'prototype'
    ) continue;
    const descriptor = getOwnPropertyDescriptor(source, key);
    if (!descriptor.writable) continue;
    target[key] = source[key];
  }
  const symbols = getOwnPropertySymbols(source);
  for (let i = 0; i < symbols.length; i++) {
    const sym = symbols[i];
    if (sym === symbolHasInstance || sym === symbolSpecies) continue;
    const descriptor = getOwnPropertyDescriptor(source, sym);
    if (!descriptor.writable) continue;
    target[sym] = source[sym];
  }
};

function Object() {
  if (!new.target) return NativeObject.apply(null, arguments);
  return reflectConstruct(NativeObject, arguments, new.target);
}

Object.prototype = objectCreate(NativeObject.prototype);
Object.prototype.constructor = Object;
copyOwnMethods(Object.prototype, NativeObject.prototype);
copyOwnMethods(Object, NativeObject);
defineProperty(Object, symbolHasInstance, {
  value: (value) => {
    if (value === null) return false;
    const type = typeof value;
    return type === 'object' || type === 'function';
  },
  configurable: true,
  writable: true,
});

function Array() {
  if (!new.target) return NativeArray.apply(null, arguments);
  return reflectConstruct(NativeArray, arguments, new.target);
}

Array.prototype = objectCreate(NativeArray.prototype);
Array.prototype.constructor = Array;
copyOwnMethods(Array.prototype, NativeArray.prototype);

Array.from = (...args) => nativeArrayFrom.apply(Array, args);
Array.of = (...args) => nativeArrayOf.apply(Array, args);
Array.isArray = nativeArrayIsArray;
defineProperty(Array, symbolHasInstance, {
  value: (value) => value instanceof NativeArray,
  configurable: true,
  writable: true,
});

function Promise(executor) {
  if (!new.target) return new Promise(executor);
  return reflectConstruct(NativePromise, [executor], new.target);
}

Promise.prototype = objectCreate(NativePromise.prototype);
Promise.prototype.constructor = Promise;
copyOwnMethods(Promise.prototype, NativePromise.prototype);

Promise.resolve = nativePromiseResolve;
Promise.reject = nativePromiseReject;
Promise.all = nativePromiseAll;
Promise.race = nativePromiseRace;
Promise.allSettled = nativePromiseAllSettled;
Promise.any = nativePromiseAny;
defineProperty(Promise, symbolHasInstance, {
  value: (value) => value instanceof NativePromise,
  configurable: true,
  writable: true,
});

module.exports = {
  internal: { Object, Array, Promise },
  userland: { Object: NativeObject, Array: NativeArray, Promise: NativePromise },
};
