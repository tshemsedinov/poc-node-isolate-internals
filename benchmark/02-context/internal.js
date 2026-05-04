'use strict';

const getNumbers = () => (
  Promise
    .resolve([1, 2, 3])
    .then((numbers) => {
      numbers.push(4);
      return { numbers };
    })
);

module.exports = { getNumbers };
