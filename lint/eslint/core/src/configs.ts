import type { ConfigFactory, ConfigFactoryCreate } from './types.js';

import type { EmptyObject } from 'type-fest';

import eslint from '@eslint/js';

import { getEcmaVersionFromContext } from './lib.js';

export const coreConfigFactory: ConfigFactory = (ctx) => {
  const { matchIncludes, createConfig } = ctx;
  return createConfig({
    name: 'core',
    opinionated: false,
    configs: [
      {
        name: 'ecma-version',
        files: matchIncludes({ jsx: true, sourceType: undefined }),
        languageOptions: { ecmaVersion: getEcmaVersionFromContext(ctx) },
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

export const createCommonConfigFactory: ConfigFactoryCreate<EmptyObject> =
  () => (ctx) => {
    const { matchIncludes, createConfig } = ctx;

    return [
      createConfig({
        name: 'common/strict',
        strict: true,
        opinionated: false,
        configs: [
          {
            files: matchIncludes({ jsx: true, sourceType: undefined }),
            linterOptions: {
              reportUnusedDisableDirectives: 'error',
            },
            rules: eslint.configs.recommended.rules,
          },
        ],
      }),

      createConfig({
        name: 'common/opinionated',
        configs: [
          {
            files: matchIncludes({ jsx: true, sourceType: undefined }),
            rules: {
              'curly': ['error', 'multi', 'consistent'],
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
