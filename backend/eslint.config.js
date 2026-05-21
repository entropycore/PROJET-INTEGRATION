const js = require('@eslint/js')
const globals = require('globals')

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'src/generated/**',
      'generated/**',
      'prisma/migrations/**'
    ]
  },

  js.configs.recommended,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },

    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off'
    }
  }
]