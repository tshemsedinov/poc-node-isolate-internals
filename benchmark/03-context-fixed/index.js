'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const evaluateCommonJs = ({ context, filename, dependencies = {} }) => {
  const source = fs.readFileSync(filename, 'utf8');
  const signature = '((require, module, __filename, __dirname) => {';
  const code = `${signature}\n${source}\n})`;
  const wrapper = vm.runInContext(code, context, { filename });
  const module = { exports: {} };

  const localRequire = (specifier) => {
    if (Object.hasOwn(dependencies, specifier)) {
      return dependencies[specifier];
    }
    throw new Error(`Unknown module: ${specifier}`);
  };

  const dirname = path.dirname(filename);
  wrapper(localRequire, module, filename, dirname);
  return module.exports;
};

const internalContext = vm.createContext({ console });
const userlandContext = vm.createContext({ console });

const src = '({ Promise, Array, Object })';

const boundary = {
  internal: vm.runInContext(src, internalContext),
  userland: vm.runInContext(src, userlandContext),
};

const internal = evaluateCommonJs({
  context: internalContext,
  filename: path.join(__dirname, 'internal.js'),
  dependencies: { boundary },
});

const userland = evaluateCommonJs({
  context: userlandContext,
  filename: path.join(__dirname, 'userland.js'),
});

const benchmark = (iterations) => userland.benchmark(internal, iterations);

module.exports = { benchmark };
