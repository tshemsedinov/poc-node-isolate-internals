'use strict';

const sumNumbers = (array) => {
  const total = array.reduce((sum, number) => sum + number, 0);
  return Promise.resolve({ total });
};

module.exports = { sumNumbers };
