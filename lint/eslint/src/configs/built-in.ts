import type { ConfigFactoryCreate } from '#types';

import eslint from '@eslint/js';

/**
 * Creates a `ConfigFactory` function which provides configuration for built-in ESLint rules.
 *
 * @returns A `ConfigFactory` function.
 */
export const createBuiltInConfigFactory: ConfigFactoryCreate = () => (ctx) => {
  const { matchIncludes, createConfig } = ctx;

  return [
    createConfig({
      name: 'builtin/recommended',
      level: 'recommended',
      modifies: ['core'],
      configs: [
        {
          files: matchIncludes({ jsx: true }),
          rules: eslint.configs.recommended.rules,
        },
      ],
    }),

    createConfig({
      name: 'builtin/strict',
      level: 'strict',
      modifies: ['builtin/recommended'],
      configs: [
        {
          files: matchIncludes({ jsx: true }),
          linterOptions: {
            reportUnusedDisableDirectives: 'error',
            reportUnusedInlineConfigs: 'error',
          },
        },
      ],
    }),

    createConfig({
      name: 'builtin/opinionated',
      modifies: ['builtin/recommended', 'builtin/strict'],
      configs: [
        {
          files: matchIncludes({ jsx: true }),
          rules: {
            'eqeqeq': ['error', 'always', { null: 'ignore' }],
            'no-console': ['error', { allow: ['error'] }],
            'no-constant-binary-expression': 'error',
            'no-debugger': 'error',
            'no-extra-boolean-cast': 'off',
            'no-useless-concat': 'error',
            'quotes': [
              'error',
              'single',
              { allowTemplateLiterals: false, avoidEscape: true },
            ],
            // disabled by default but can be enabled if needed
            'sort-keys': [
              'error',
              'asc',
              { allowLineSeparatedGroups: true, natural: false, minKeys: 5 },
            ],
          },
        },
      ],
    }),
  ];
};
