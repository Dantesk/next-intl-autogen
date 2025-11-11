import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  // Base configuration for JavaScript
  js.configs.recommended,

  // Global environment for Node.js
  {
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },

  // TypeScript configuration for source files
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs['recommended-requiring-type-checking'].rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off', // Allow any for AST manipulation and dynamic JSON
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off', // Allow for dynamic imports
      '@typescript-eslint/no-unsafe-member-access': 'off', // Allow for dynamic object access
      '@typescript-eslint/no-unsafe-call': 'off', // Allow for dynamic function calls
      '@typescript-eslint/no-unsafe-return': 'off', // Allow for dynamic returns
      '@typescript-eslint/no-unsafe-argument': 'off', // Allow for dynamic arguments
      'prefer-const': 'error',
      'no-console': 'off',
      'no-useless-escape': 'error',
    },
  },

  // TypeScript configuration for test files (without type checking)
  {
    files: ['test/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-var-requires': 'off',
      'prefer-const': 'error',
      'no-console': 'off',
    },
  },

  // Ignore patterns
  {
    ignores: ['dist/', 'node_modules/', '*.js', '*.d.ts'],
  },
];