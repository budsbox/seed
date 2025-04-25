import type { ConfigFactoryCreate } from '#types';

import eslint from '@eslint/js';

export const createCommonConfigFactory: ConfigFactoryCreate = () => (ctx) => {
  const { matchIncludes, createConfig } = ctx;

  return [
    createConfig({
      name: 'common/recommended',
      level: 'recommended',
      configs: [
        {
          files: matchIncludes({ jsx: true, sourceType: undefined }),
          rules: eslint.configs.recommended.rules,
        },
      ],
    }),

    createConfig({
      name: 'common/strict',
      level: 'strict',
      configs: [
        {
          files: matchIncludes({ jsx: true, sourceType: undefined }),
          linterOptions: {
            reportUnusedDisableDirectives: 'error',
            // reportUnusedInlineConfigs: 'error',
          },
        },
      ],
    }),

    createConfig({
      name: 'common/opinionated',
      configs: [
        {
          files: matchIncludes({ jsx: true, sourceType: undefined }),
          rules: {
            'curly': 'error',
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
          },
        },
      ],
    }),
  ];
};
