'use strict';

const bridge = require('bridge');

const getNumbers = () => {
  const result = Promise
    .resolve([1, 2, 3])
    .then((numbers) => {
      numbers.push(4);
      console.log('internal Array patched:', numbers.patched);
      return numbers;
    });
  console.log('internal Promise patched:', result.patched);
  return result;
};

const failWithError = () => (
  Promise.resolve().then(() => {
    const error = new Error('internal failure');
    console.log('internal Error patched:', error.patched);
    throw error;
  })
);

module.exports = bridge.exposeApi({
  getNumbers,
  failWithError,
});
