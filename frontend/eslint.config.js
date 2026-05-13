import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import prettier from '@vue/eslint-config-prettier'

export default [
  js.configs.recommended,

  ...pluginVue.configs['flat/recommended'],

  prettier,

  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-unused-vars': 'warn',
      'no-console': 'off'
    }
  }
]