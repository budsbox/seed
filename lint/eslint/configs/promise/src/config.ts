import type { ConfigFactoryCreate } from '@budsbox/eslint';

import eslintPluginPromise from 'eslint-plugin-promise';

export const createPromiseConfigFactory: ConfigFactoryCreate =
  () =>
  ({ createConfig, matchIncludes }) => {
    return [
      createConfig({
        name: 'promise/basic',
        level: 'basic',
        modifies: ['core'],
        configs: [
          {
            files: matchIncludes({ jsx: true, sourceType: undefined }),
            plugins: {
              promise: eslintPluginPromise,
            },
            rules: {},
          },
        ],
      }),

      createConfig({
        name: 'promise/recommended',
        level: 'recommended',
        modifies: ['promise/basic'],
        configs: [
          {
            files: matchIncludes({ jsx: true, sourceType: undefined }),
            rules: {
              ...eslintPluginPromise.configs['flat/recommended'].rules,
            },
          },
        ],
      }),

      createConfig({
        name: 'promise/opinionated',
        modifies: ['promise/basic', 'promise/recommended'],
        configs: [
          {
            files: matchIncludes({ jsx: true, sourceType: undefined }),
            rules: {
              'promise/no-multiple-resolved': 'error',
            },
          },
        ],
      }),
    ];
  };
