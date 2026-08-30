import js from "@eslint/js"
import tseslint from "typescript-eslint"

/** @type {import("typescript-eslint").Config} */
export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", ".next/**"],
  }
)
