import js from "@eslint/js";
import globals from "globals";
import stylisticJs from '@stylistic/eslint-plugin-js';

export default [
    {
        ...js.configs.recommended,
        files: ["src/**/*.js", "test/**/*.js"],
        ignores: ["src/js/lib/*"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser,
                __USE_SERVICE_WORKERS__: "readonly"
            }
        }
    },
    {
        plugins: {
            '@stylistic/js': stylisticJs
        },
        files: ["src/**/*.js", "test/**/*.js"],
        ignores: ["src/js/lib/*"],
        rules: {
            "prefer-const": ["error"],
            "require-await": ["error"],
            "@stylistic/js/indent": [
                "error",
                4
            ],
            "@stylistic/js/linebreak-style": [
                "error",
                "windows"
            ],
            "@stylistic/js/quotes": [
                "error",
                "double"
            ],
            "@stylistic/js/semi": [
                "error",
                "always"
            ],
            "@stylistic/js/comma-spacing": ["error"],
            "@stylistic/js/no-multi-spaces": ["error"]
        }
    },
    {
        ignores: ["old/*", "android/*", "docs/*", "src/js/lib/*"]
    }
];
