import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import { env } from "process";


export default [
  {
    languageOptions: {
      globals: globals.browser
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReactConfig,
  {
    settings: {
      react: {
        version: "detect"
      }
    },
    plugins: {
      "react-hooks": eslintPluginReactHooks
    },
    env: {
      node: true,
    },
    rules: {
      "no-unused-vars": [
        "warn",
        {
          "vars": "all",
          "varsIgnorePattern": "^_",
          "args": "after-used",
          "argsIgnorePattern": "^_"
        }
      ],
      "@typescript-eslint/no-unused-vars": "warn",
      "react/react-in-jsx-scope": "off", // suppress errors for missing 'import React' in files
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": [
        "warn", {
          "additionalHooks": "(useRecoilCallback|useRecoilTransaction_UNSTABLE)"
        }
      ]
    }
  },
];