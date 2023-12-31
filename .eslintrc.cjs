const esmExtensions = ['*.mjs', '*.ts', '*.tsx'];

module.exports = {
  root: true,
  env: { es2021: true },
  extends: ['eslint:recommended'],
  ignorePatterns: ['dist', '.husky', '.idea', '.pnp.*', '*.scss.d.ts'],
  rules: {
    /* eslint sort-keys: ["error", "asc", {"natural": false, "allowLineSeparatedGroups": true}] */
    'no-console': 'error',
    'quotes': [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: false },
    ],
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'curly': 'error',
    'no-constant-binary-expression': 'error',
    'no-debugger': 'error',
    'no-extra-boolean-cast': 'off',
    'no-useless-concat': 'error',
    /* eslint sort-keys: "off" */
  },
  overrides: [
    {
      files: ['*.cjs', './*.mjs'],
      env: { node: true },
    },

    {
      // lint imports
      files: esmExtensions,
      plugins: ['import'],
      extends: ['plugin:import/recommended'],
      rules: {
        /* eslint sort-keys: ["error", "asc", {"natural": false, "allowLineSeparatedGroups": true}] */
        'sort-imports': ['error', { ignoreDeclarationSort: true }],

        'import/extensions': [
          'error',
          'always',
          esmExtensions.reduce((acc, ext) => ({
            ...acc,
            [ext.replace('*.', '')]: 'never',
          })),
        ],
        'import/first': 'error',
        'import/newline-after-import': ['error', { considerComments: true }],
        'import/no-absolute-path': 'error',
        'import/no-commonjs': 'error',
        'import/no-duplicates': 'error',
        'import/no-empty-named-blocks': 'error',
        'import/no-extraneous-dependencies': [
          'error',
          { bundledDependencies: false },
        ],
        'import/no-mutable-exports': 'error',
        'import/no-self-import': 'error',
        'import/no-unassigned-import': ['error', { allow: ['**/*.scss'] }],
        'import/no-useless-path-segments': 'error',
        'import/no-webpack-loader-syntax': 'error',
        'import/order': [
          'error',
          {
            'groups': [
              'type',
              'builtin',
              'external',
              'internal',
              'parent',
              'sibling',
              'index',
            ],
            'pathGroups': [
              {
                pattern: '*.svg',
                patternOptions: { matchBase: true },
                group: 'type',
                position: 'after',
              },

              {
                pattern: './*.module.scss',
                group: 'sibling',
                position: 'after',
              },
            ],
            'distinctGroup': true,
            'pathGroupsExcludedImportTypes': ['builtin', 'type'],
            'newlines-between': 'always-and-inside-groups',
            'alphabetize': { order: 'asc' },
          },
        ],
        /* eslint sort-keys: "off" */
      },
    },

    {
      // lint files for browser's runtime
      files: esmExtensions.map((ext) => `src/**/${ext}`),
      env: { browser: true, node: false },
      settings: { react: { version: 'detect', linkComponents: ['Link'] } },
      plugins: ['react', 'react-hooks', 'react-refresh'],
      extends: [
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
      ],
      rules: {
        /* eslint sort-keys: ["error", "asc", {"natural": false, "allowLineSeparatedGroups": true}] */
        'no-alert': 'error',

        'react/boolean-prop-naming': 'error',
        'react/button-has-type': 'error',
        'react/destructuring-assignment': 'error',
        'react/function-component-definition': [
          'error',
          {
            namedComponents: 'arrow-function',
            unnamedComponents: 'arrow-function',
          },
        ],
        'react/hook-use-state': 'error',
        'react/iframe-missing-sandbox': 'error',
        'react/jsx-child-element-spacing': 'error',
        'react/jsx-curly-brace-presence': [
          'error',
          { props: 'always', children: 'never', propElementValues: 'always' },
        ],
        'react/jsx-fragments': 'error',
        'react/jsx-handler-names': 'error',
        'react/jsx-newline': 'error',
        'react/jsx-no-constructed-context-values': 'error',
        'react/jsx-no-leaked-render': 'error',
        'react/jsx-no-script-url': 'error',
        'react/jsx-no-target-blank': 'error',
        'react/jsx-no-useless-fragment': 'error',
        'react/no-array-index-key': 'warn',
        'react/no-danger': 'error',
        'react/no-unsafe': 'error',
        'react/no-unstable-nested-components': 'error',
        'react/void-dom-elements-no-children': 'error',
        'react/prop-types': 'off',
        'react-hooks/exhaustive-deps': 'error',
        /* eslint sort-keys: "off" */
      },
    },

    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        sourceType: 'module',
        tsconfigRootDir: __dirname,
        project: true,
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:@typescript-eslint/strict-type-checked', // includes recommended and recommended-type-checked
        'plugin:import/typescript',
      ],
      settings: {
        'import/resolver': { typescript: { alwaysTryTypes: true } },
      },
      rules: {
        /* eslint sort-keys: ["error", "asc", {"natural": false, "allowLineSeparatedGroups": true}] */
        /** @see https://typescript-eslint.io/linting/troubleshooting/performance-troubleshooting#eslint-plugin-import */
        'import/named': 'off',
        'import/default': 'off',
        'import/namespace': 'off',
        'import/no-named-as-default-member': 'off',

        'import/consistent-type-specifier-style': 'off', // use consistent-type-imports instead
        'import/extensions': [
          'error',
          'always',
          {
            ts: 'never',
            tsx: 'never',
          },
        ],

        '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
        '@typescript-eslint/await-thenable': 'error',
        '@typescript-eslint/consistent-type-assertions': [
          'error',
          { objectLiteralTypeAssertions: 'never' },
        ],
        '@typescript-eslint/consistent-type-definitions': [
          'error',
          'interface',
        ],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { fixStyle: 'inline-type-imports' },
        ],
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          {
            allowConciseArrowFunctionExpressionsStartingWithVoid: true,
          },
        ],
        '@typescript-eslint/explicit-member-accessibility': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        '@typescript-eslint/method-signature-style': 'error',
        '@typescript-eslint/naming-convention': [
          'error',
          [
            {
              selector: 'default',
              format: ['camelCase'],
              leadingUnderscore: 'allow',
              trailingUnderscore: 'allow',
            },

            {
              selector: 'import',
              format: ['camelCase', 'PascalCase'],
            },

            {
              selector: 'variable',
              format: ['camelCase', 'UPPER_CASE'],
              leadingUnderscore: 'allow',
              trailingUnderscore: 'allow',
            },

            {
              selector: 'typeLike',
              format: ['PascalCase'],
            },

            {
              selector: 'global',
              format: ['UPPER_CASE'],
            },

            {
              selector: ['typeLike', 'variableLike'],
              modifiers: 'unused',
              leadingUnderscore: 'require',
            },
          ],
        ],
        '@typescript-eslint/no-base-to-string': 'error',
        '@typescript-eslint/no-confusing-void-expression': [
          'error',
          { ignoreVoidOperator: true },
        ],
        '@typescript-eslint/no-import-type-side-effects': 'error',
        '@typescript-eslint/no-duplicate-enum-values': 'error',
        '@typescript-eslint/no-dynamic-delete': 'warn',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-non-null-assertion': 'warn',
        '@typescript-eslint/no-misused-promises': [
          'error',
          {
            checksVoidReturn: {
              attributes: false,
            },
          },
        ],
        '@typescript-eslint/no-parameter-properties': 'error',
        '@typescript-eslint/no-shadow': 'error',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/prefer-reduce-type-parameter': 'error',
        '@typescript-eslint/prefer-regexp-exec': 'error',
        '@typescript-eslint/prefer-readonly-parameter-types': 'error',
        '@typescript-eslint/prefer-ts-expect-error': 'error',
        '@typescript-eslint/require-array-sort-compare': 'error',
        '@typescript-eslint/strict-boolean-expressions': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/unified-signatures': 'error',

        'react-refresh/only-export-components': [
          'error',
          { allowConstantExport: true },
        ],
        /* eslint sort-keys: "off" */
      },
    },
    {
      /*
       * It's important to turn off all the conflicting rules in eslint
       * when using prettier
       * The last item in 'overrides' has the highest priority over the config
       */
      extends: ['prettier'],
    },
  ],
};
