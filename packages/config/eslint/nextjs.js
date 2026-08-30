import base from "./base.js"
import nextPlugin from "@next/eslint-plugin-next"

/** @type {import("typescript-eslint").Config} */
export default [
  ...base,
  {
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
]
