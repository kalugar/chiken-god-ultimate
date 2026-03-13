// @ts-check

import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-config-prettier'
import unicorn from 'eslint-plugin-unicorn'
import sonarjs from 'eslint-plugin-sonarjs'
import perfectionist from 'eslint-plugin-perfectionist'
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default defineConfig([
  globalIgnores(['dist', 'build', 'node_modules', 'eslint.config.mjs', 'builder/**/*.js']),

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
        projectService: {
          allowDefaultProject: ['vite.config.ts']
        },
        tsconfigRootDir: import.meta.dirname
      }
    },

    plugins: {
      perfectionist
    },

    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': 'off',
      'no-duplicate-imports': 'error',
      'no-new': 'warn',
      'no-loop-func': 'error',
      'unicorn/no-process-exit': 'off',
      'unicorn/no-null': 'off',
      'import/order': 'off',
      'perfectionist/sort-imports': 'error',
      'unicorn/prefer-modern-math-apis': 'error'
    }
  },
  prettier
])
