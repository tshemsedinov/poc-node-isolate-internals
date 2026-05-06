'use strict';

require('./boundary.js');

const internal = require('./internal.js');
const runUserland = require('./userland.js');

runUserland(internal);
