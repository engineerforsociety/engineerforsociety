import nextPlugin from "@next/eslint-plugin-next";
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";

const eslintConfig = [
    js.configs.recommended,
    {
        ignores: [
            ".next/**/*",
            "node_modules/**/*",
            "public/**/*",
            "out/**/*",
            "*.config.js",
            "*.config.ts",
            "*.config.mjs",
        ],
    },
    {
        files: ["**/*.{js,jsx,ts,tsx}"],
        plugins: {
            "@next/next": nextPlugin,
            "@typescript-eslint": tsPlugin,
        },
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
            },
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs["core-web-vitals"].rules,
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "off", // Can enable later: ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }]
            "no-console": "off", // Allow console in development
            "react/no-unescaped-entities": "off",
            "no-undef": "off", // TypeScript handles this
            "no-useless-escape": "off", // Allow regex escapes for clarity
        },
    },
];

export default eslintConfig;
