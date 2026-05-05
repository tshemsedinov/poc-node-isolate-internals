'use strict';

const benchmark = async (internal, iterations) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  let checksum = 0;
  for (let index = 0; index < iterations; index++) {
    const result = await internal.sumNumbers(numbers);
    checksum += result.total;
  }
  return checksum;
};

module.exports = { benchmark };
