module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  parser: 'babel-eslint',
  plugins: ['svelte3', '@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    module: 'esnext',
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
  settings: {
    'svelte3/typescript': () => require('typescript')
  },
  env: {
    es6: true,
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
    {
      files: ['*.svelte'],
      processor: 'svelte3/svelte3',
    },
  ],
};
