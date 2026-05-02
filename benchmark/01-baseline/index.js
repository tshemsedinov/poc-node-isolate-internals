'use strict';

const createScenario = () => ({
  internalApi: require('./internal.js'),
  userland: require('./userland.js'),
});

const runDemo = async () => {
  const { internalApi, userland } = createScenario();
  return userland.runScenario(internalApi);
};

const main = async () => {
  process.stdout.write(JSON.stringify(await runDemo(), null, 2));
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  createScenario,
  runDemo,
};
