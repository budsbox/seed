import type { ConfigFactory, ConfigFactoryCreate } from './types.js';

import eslint from '@eslint/js';

import { getEcmaVersionFromContext } from './lib.js';

export const coreConfigFactory: ConfigFactory = (ctx) => {
  const { matchIncludes, createConfig } = ctx;
  return createConfig({
    name: 'core',
    level: 'basic',
    configs: [
      {
        name: 'ecma-version',
        files: matchIncludes({ jsx: true, sourceType: undefined }),
        languageOptions: {
          ecmaVersion: getEcmaVersionFromContext(ctx) ?? 'latest',
        },
      },
      {
        name: 'module',
        files: matchIncludes({ jsx: true, targetSourceType: 'module' }),
        languageOptions: { sourceType: 'module' },
      },
      {
        name: 'commonjs',
        files: matchIncludes({ jsx: true, targetSourceType: 'commonjs' }),
        languageOptions: { sourceType: 'commonjs' },
      },
    ],
  });
};

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
