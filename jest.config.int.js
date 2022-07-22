const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  globalSetup: './test/jest.setup.ts',
  testTimeout: 600000,
};
