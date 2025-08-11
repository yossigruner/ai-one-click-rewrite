module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
    webextensions: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended', // Must be last to override other configs
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'scripts/*.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react-refresh', '@typescript-eslint', 'prettier'],
  rules: {
    // Prettier integration
    'prettier/prettier': 'error',

    // React specific
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

    // TypeScript specific
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',

    // General code quality
    'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
    'no-debugger': 'warn',
    'no-unused-expressions': 'error',
    'prefer-const': 'error',
    'no-var': 'error',

    // Import/Export
    'no-duplicate-imports': 'error',

    // Chrome Extension specific
    'no-undef': 'off', // TypeScript handles this, and chrome global can cause issues
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
