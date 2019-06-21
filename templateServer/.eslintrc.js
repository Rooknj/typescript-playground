module.exports = {
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  env: {
    commonjs: true,
    es6: true,
    node: true,
    jest: true
  },
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module" // Allows for the use of imports
  },
  settings: {
    "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"]
    },
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
      }
    }
  },
  extends: [
    // Shared Configs
    "eslint:recommended",
    "plugin:eslint-comments/recommended",
    "plugin:jest/recommended",
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    // Project Specific Configs
    "airbnb-base",
    // Make sure this is last
    "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    "plugin:prettier/recommended"
  ],
  plugins: [
    // Shared Plugins
    "import",
    "prettier",
    "jest"
    // Project Specific Plugins
  ],
  rules: {
    // Shared Rules
    "no-console": "warn",
    "no-unused-vars": "warn",
    "prefer-destructuring": "warn",
    radix: "off",
    "no-underscore-dangle": "off",
    "prettier/prettier": "off",
    "import/prefer-default-export": "off"
    // Project Specific Rules
  }
};
