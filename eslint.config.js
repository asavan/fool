import js from "@eslint/js";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        rules: {
            semi: ["error", "always"],
            "indent": ["error", 4],
            "linebreak-style": [
                "warn",
                "windows"
            ],
            "quotes": [
                "error",
                "double"
            ],
            "require-await": ["error"],
            "comma-spacing": ["error"],
            "prefer-const": ["error"],
            "no-multi-spaces": ["error"]
        }
    },
    {
        languageOptions: {
            globals: {
                ...globals.browser,
                __USE_SERVICE_WORKERS__: "readonly"
            }
        }
    },
    {
        ignores: ["old/*", "android/*", "docs/*"]
    }
];
