'use strict';

const boundary = require('boundary');
const {
  Promise: InternalPromise,
  Array: InternalArray,
  Object: InternalObject,
  Error: InternalError,
} = boundary.internal;

const createExportedResult = (numbers) => {
  const result = new InternalObject();
  result.numbers = InternalArray.from(numbers);
  return result;
};

const getNumbers = () => (
  new InternalPromise((resolve, reject) => {
    Promise
      .resolve([1, 2, 3])
      .then((numbers) => {
        numbers.push(4);
        resolve(createExportedResult(numbers));
      })
      .catch((error) => {
        const exportedError = new InternalError(error.message);
        exportedError.name = error.name;
        reject(exportedError);
      });
  })
);

module.exports = { getNumbers };
