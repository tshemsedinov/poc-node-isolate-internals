'use strict';

const internal = require('./internal.js');
const userland = require('./userland.js');

const benchmark = (iterations) => userland.benchmark(internal, iterations);

module.exports = { benchmark };
