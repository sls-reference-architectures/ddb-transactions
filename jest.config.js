module.exports = {
  setupFilesAfterEnv: ['jest-extended/all'],
  transform: {
    '^.+\\.jsx?$': '@swc/jest',
  },
  transformIgnorePatterns: ['node_modules/(?!@faker-js/faker/)'],
  testEnvironment: 'node',
};
