'use strict';

const boundary = require('./boundary.js');
const {
  Promise: InternalPromise,
  Array: InternalArray,
  Object: InternalObject,
  Error: InternalError,
} = boundary.internal;
const {
  PromiseResolve,
  PromisePrototypeThen,
  ArrayPrototypePush,
} = boundary.primordials;

const createExportedResult = (numbers) => {
  const result = new InternalObject();
  result.numbers = InternalArray.from(numbers);
  return result;
};

const getNumbers = () => (
  new InternalPromise((resolve, reject) => {
    const work = PromiseResolve([1, 2, 3]);
    PromisePrototypeThen(
      work,
      (numbers) => {
        ArrayPrototypePush(numbers, 4);
        resolve(createExportedResult(numbers));
      },
      (error) => {
        const exportedError = new InternalError(error.message);
        exportedError.name = error.name;
        reject(exportedError);
      },
    );
  })
);

module.exports = { getNumbers };
