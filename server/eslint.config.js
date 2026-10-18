import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["coverage/", "node_modules/"] },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node,
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_|^next$" }],
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
    },
  },
];
