const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  globalSetup: './test/jest.setup.js',
  testTimeout: 600000,
};
