import js from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import prettier from "@vue/eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "cypress/videos/**",
      "cypress/screenshots/**",
    ],
  },

  js.configs.recommended,

  ...pluginVue.configs["flat/recommended"],

  prettier,

  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest,
      },
    },

    rules: {
      "vue/multi-word-component-names": "off",
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];
