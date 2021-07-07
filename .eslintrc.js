module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "airbnb-typescript/base",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "no-underscore-dangle": ["error", { allowAfterThis: true }],

    /**
     * Using the any type defeats the purpose of using TypeScript.
     * When any is used, all compiler type checks around that value are ignored.
     * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/no-explicit-any.md
     */
    "@typescript-eslint/no-explicit-any": [
      "warn",
      {
        fixToUnknown: true,
        ignoreRestArgs: true,
      },
    ],
  },
  overrides: [
    {
      files: ["./build.js"],
      rules: {
        "import/no-extraneous-dependencies": [
          "error",
          { devDependencies: true },
        ],
        "no-console": "off",
      },
    },
  ],
};
