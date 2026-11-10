// noinspection ES6UnusedImports,JSUnresolvedVariable,JSUnresolvedFunction,NpmUsedModulesInstalled
import js from "@eslint/js";
// noinspection NpmUsedModulesInstalled
import markdown from "@eslint/markdown";
// noinspection NpmUsedModulesInstalled
import tsParser from "@typescript-eslint/parser";
// noinspection NpmUsedModulesInstalled
import jsdoc from "eslint-plugin-jsdoc";
// noinspection NpmUsedModulesInstalled
import jsxA11y from "eslint-plugin-jsx-a11y";
// noinspection NpmUsedModulesInstalled
import react from "eslint-plugin-react";
// noinspection NpmUsedModulesInstalled
import reactHooks from "eslint-plugin-react-hooks";
// noinspection NpmUsedModulesInstalled
import tseslint from "typescript-eslint";
import plainTextParser from "./eslint-parsers/plain-text.mjs";
import markdownSnippetsProcessor from "./eslint-processors/markdown-snippets.mjs";
import unicodePolicy from "./eslint-rules/unicode-policy.mjs";
import { VENDOR_GLOBS } from "./scripts/lib/vendor-dirs.mjs";

export default [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      // Служебные файлы прогонов и состояние opencode: скриншоты verify:effects,
      // выгрузки IDE, цель сессии.
      ".cache/**",
      ".opencode/**",
      // Вендорные скилы агентов: чужие emoji, console.log и markdown — не наш код.
      ...VENDOR_GLOBS,
      "next-env.d.ts",
      "tsconfig.tsbuildinfo",
    ],
  },
  ...markdown.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs,mts,cts}"],
    ...js.configs.recommended,
  },
  ...tseslint.configs.recommended,
  {
    files: ["**/*.md"],
    processor: markdownSnippetsProcessor,
  },
  {
    // Non-JS fenced snippets: the policy works on raw text, the parser returns an
    // empty Program for any content. JS/TS snippets are handled by the block below.
    files: ["**/*.md/*.*"],
    ignores: ["**/*.md/*.{ts,tsx,js,jsx,mjs,cjs,mts,cts}", "**/*.md/*.md"],
    languageOptions: { parser: plainTextParser },
    linterOptions: { reportUnusedDisableDirectives: false },
    plugins: { "unicode-policy": unicodePolicy },
    rules: {
      "unicode-policy/emoji": "error",
      "unicode-policy/unicode-graphics": "error",
    },
  },
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs,mts,cts}"],
    linterOptions: { reportUnusedDisableDirectives: false },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      jsdoc,
      react,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      "unicode-policy": unicodePolicy,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "unicode-policy/emoji": "error",
      "unicode-policy/unicode-graphics": "error",
      "no-irregular-whitespace": "error",
      "no-var": "error",
      "prefer-const": "error",
      // TypeScript resolves globals itself; keeping the core rule on would flag
      // `window`, `document`, `WebGL2RenderingContext` members in TSX files.
      "no-undef": "off",
      "jsdoc/require-jsdoc": [
        "error",
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            ArrowFunctionExpression: true,
            MethodDefinition: true,
          },
        },
      ],
      "jsdoc/require-param": "off",
      "jsdoc/require-returns": "off",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-has-content": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/label-has-associated-control": "error",
      "jsx-a11y/no-redundant-roles": "error",
    },
  },
  {
    // Tooling under scripts/ runs in plain Node: TS annotations are not parseable
    // there, so the return-type rule is off and JSDoc param/returns are required.
    files: ["**/*.{js,mjs,cjs}", "scripts/**", "eslint-rules/**", "eslint-parsers/**", "eslint-processors/**"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "jsdoc/require-param": "error",
      "jsdoc/require-returns": "error",
    },
  },
  {
    // Playwright verification script: it drives a browser and prints a report.
    files: ["scripts/**"],
    rules: {
      "no-console": "off",
      "jsdoc/require-jsdoc": "off",
      "jsdoc/require-param": "off",
      "jsdoc/require-returns": "off",
    },
  },
  {
    // Config files are consumed by Next/PostCSS and are not part of the public API.
    files: ["next.config.ts", "postcss.config.mjs", "eslint.config.js"],
    rules: {
      "jsdoc/require-jsdoc": "off",
    },
  },
];
