'use strict';

const internal = { Promise, Array, Object, Error };

const userland = {
  Promise: class extends Promise {},
  Array: class extends Array {},
  Object: class extends Object {},
  Error: class extends Error {},
};

globalThis.Array = userland.Array;
globalThis.Promise = userland.Promise;
globalThis.Object = userland.Object;
globalThis.Error = userland.Error;

module.exports = { internal, userland };
