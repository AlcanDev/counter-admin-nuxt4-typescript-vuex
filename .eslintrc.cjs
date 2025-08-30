/* eslint-disable */
module.exports = {
  root: true,
  env: { browser: true, es2023: true, node: true },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'eslint:recommended',
    'prettier'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off'
  }
};
