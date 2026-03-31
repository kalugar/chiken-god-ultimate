// @ts-check

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import unicorn from 'eslint-plugin-unicorn'
import sonarjs from 'eslint-plugin-sonarjs'
import perfectionist from 'eslint-plugin-perfectionist'
import importX from 'eslint-plugin-import-x'
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default defineConfig([
  globalIgnores([
    'dist',
    'build',
    'node_modules',
    'eslint.config.mjs',
    'bundler/**/*.js',
    'src/**/*.wgsl'
  ]),

  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  unicorn.configs.recommended,
  /** @type {any} */ (sonarjs).configs.recommended,

  {
    files: ['**/*.ts', '**/*.tsx'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },

    plugins: {
      perfectionist,
      'import-x': importX
    },

    settings: {
      'import-x/resolver': {
        typescript: true,
        node: true
      }
    },

    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      'no-duplicate-imports': 'off',
      'import-x/no-duplicates': 'error',
      'import-x/no-cycle': ['error', { maxDepth: 10, ignoreExternal: true }],

      'no-unused-vars': 'off',
      'no-explicit-any': 'off',
      'no-var': 'error',
      'no-console': 'off',
      'no-new': 'warn',
      'no-loop-func': 'error',
      'prefer-const': 'error',

      'perfectionist/sort-imports': 'error',

      'sonarjs/pseudo-random': 'off',

      'unicorn/no-new-buffer': 'warn',
      'unicorn/no-process-exit': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prefer-modern-math-apis': 'error',
      'unicorn/prefer-dom-node-remove': 'off',
      'unicorn/prefer-global-this': 'off',
      'unicorn/prevent-abbreviations': 'off'
    }
  },
  prettier
])
