// eslint.config.js
import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';

export default [
  // Base
  js.configs.recommended,
  // Vue 3
  ...vue.configs['flat/recommended'],

  // Reglas generales del proyecto
  {
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: typescriptParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: {
        // Browser
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        alert: 'readonly',
        requestAnimationFrame: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        crypto: 'readonly', // window.crypto

        // Node
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        globalThis: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      vue,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { 
          argsIgnorePattern: '^_|^e$|^id$|^name$|^payload$|^args$',
          varsIgnorePattern: '^_|^vi$'
        },
      ],
      'no-unused-vars': [
        'error',
        { 
          argsIgnorePattern: '^_|^e$|^id$|^name$|^payload$|^args$',
          varsIgnorePattern: '^_|^vi$'
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/attributes-order': 'off',
      'no-console': 'warn',
      'no-debugger': 'error',
    },
  },

  // 🔧 TS y Vue: desactivar no-undef (evita falsos positivos con tipos DOM)
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.vue'],
    rules: {
      'no-undef': 'off',
    },
  },

  // 🧪 Tests (Vitest/JSDOM)
  {
    files: ['tests/**/*.{ts,tsx,js}'],
    languageOptions: {
      globals: {
        // Vitest
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',

        // Node/JS DOM en tests
        global: 'readonly',
        DOMException: 'readonly',
        crypto: 'readonly',
      },
    },
    rules: {
      // Test-specific rules
      'no-console': 'off',
    },
  },

  // Ignorados
  {
    ignores: [
      'node_modules/**', 
      '.nuxt/**', 
      '.output/**', 
      'dist/**', 
      '*.config.js',
      'scripts/qa-smoke.mjs'
    ],
  },
];
