import { defineConfig, globalIgnores } from "eslint/config";
import { fileURLToPath } from "node:url";
import path from "node:path";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tailwindcss from "eslint-plugin-tailwindcss";
import prettierRecommended from "eslint-plugin-prettier/recommended";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tailwindcss.configs["flat/recommended"],
  {
    // Point eslint-plugin-tailwindcss at our CSS-based Tailwind v4 entry file.
    // Absolute path ensures tailwindcss is resolved from the project root
    // where node_modules lives, not from the CSS file's subdirectory.
    settings: {
      tailwindcss: {
        config: path.join(__dirname, "app/globals.css"),
      },
    },
    rules: {
      // Prettier handles class ordering — disable to avoid conflicts
      "tailwindcss/classnames-order": "off",
    },
  },
  prettierRecommended,
  {
    rules: {
      // TypeScript strict typing constraints
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],

      // Standard Javascript best practices
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public",
    "features/pwa",
    "robots.ts",
    "sitemap.ts",
  ]),
]);

export default eslintConfig;
