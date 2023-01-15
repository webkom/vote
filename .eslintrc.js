module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 8,
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': [2, { args: 'none' }],
    '@typescript-eslint/no-unused-vars': ['error', { args: 'none' }],
    'new-cap': [
      2,
      {
        capIsNewExceptions: [
          'Router',
          'Before',
          'BeforeFeatures',
          'AfterFeatures',
          'Then',
          'When',
          'Given',
        ],
      },
    ],
  },
  env: {
    es6: true,
    mocha: true,
    node: true,
    protractor: true,
    browser: true,
  },
  globals: {
    angular: true,
    io: true,
    chrome: true,
  },
  overrides: [
    {
      files: ['**/*.ts'],
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
    },
  ],
};
