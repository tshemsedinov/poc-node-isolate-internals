'use strict';

const benchmark = async (internal, iterations) => {
  let checksum = 0;
  for (let index = 0; index < iterations; index++) {
    const result = await internal.getNumbers();
    checksum += result.numbers.length + result.numbers[0];
  }
  return checksum;
};

module.exports = { benchmark };
