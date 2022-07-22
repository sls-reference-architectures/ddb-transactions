module.exports = {
  env: {
    jest: true,
    node: true,
  },
  extends: ['airbnb-base', 'airbnb-typescript/base', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['no-only-tests'],
  root: true,
  rules: {
    'import/extensions': 0,
    'no-only-tests/no-only-tests': 'error',
    'no-console': 1,
    'no-use-before-define': 0,
    '@typescript/no-use-before-define': 0,
  },
  settings: {
    'import/resolver': 'node',
  },
};
