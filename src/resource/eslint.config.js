import antfu from "@antfu/eslint-config";

export default antfu(
  {
    lessOpinionated: true,
    ignores: [
      "types/auto-imports.d.ts",
      "types/components.d.ts",
      "src/utils/uploader.ts",
      "src/utils/simple-uploader/**",
      "src/components/verify/**",
    ],
  },
  {
    files: ["**/*.vue"],
    rules: {
      "vue/max-attributes-per-line": [
        "error",
        {
          singleline: {
            max: 5,
          },
        },
      ],
    },
  },
  {
    files: ["**/*.ts"],
    rules: {
      "no-useless-constructor": "error",
      "constructor-super": "error",
      "ts/no-use-before-define": "off",
    },
  },
  {
    files: ["**/*.vue", "**/*.ts"],
    rules: {
      curly: ["error", "multi-line"],
      "default-case": "error",
      "max-depth": "error",
      // 强制变量、函数名字小驼峰
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "objectLiteralProperty",
          format: null,
        },
        {
          selector: "variableLike",
          format: ["camelCase"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
          custom: {
            regex: "^I[A-Z]",
            match: false,
          },
        },
      ],

      "style/semi": ["error", "never"],
      "style/quote-props": ["error", "as-needed"],
      "style/brace-style": ["error", "1tbs"],

      "unicorn/prefer-number-properties": "off",

      "no-console": "off",
      "no-inner-declarations": "error",
      "no-param-reassign": "error",
      "no-void": "error",
      "no-useless-escape": "error",
      "no-underscore-dangle": "error",
    },
  },
);
