'use strict';

const getNumbers = () => (
  Promise
    .resolve([1, 2, 3])
    .then((numbers) => {
      numbers.push(4);
      return {
        internalPromiseTagged: Promise.prototype.userlandTag === 'userland',
        internalArrayTagged: Array.prototype.userlandTag === 'userland',
        numbers,
      };
    })
);

module.exports = {
  getNumbers,
};
