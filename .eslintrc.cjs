module.exports = {
    parser: "@typescript-eslint/parser",
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:astro/recommended",
      "prettier"
    ],
    plugins: ["@typescript-eslint", "astro"],
    rules: {
      "no-unused-vars": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "astro/no-set-html-directly": "warn", // Evitar problemas de seguridad con XSS
      "prettier/prettier": ["error"]
    },
    overrides: [
      {
        files: ["*.astro"],
        parser: "astro-eslint-parser",
        rules: {
          "prettier/prettier": "off"
        }
      }
    ]
  }
  