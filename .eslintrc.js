export default {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    eqeqeq: 'error',
    complexity: ['warn', 10],
    'max-len': [
      'warn',
      {
        code: 120,
        ignoreComments: true,
        ignoreStrings: true,
      },
    ],
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    complexity: ['warn', 15], // Légèrement plus permissif
    'max-len': [
      'warn',
      {
        code: 120,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
    'prefer-const': 'error',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
};
