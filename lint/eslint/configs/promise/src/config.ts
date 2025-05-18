import type { ConfigFactoryCreate } from '@budsbox/eslint';

import eslintPluginPromise from 'eslint-plugin-promise';

/**
 * Creates a `ConfigFactory` function which provides ESLint configuration for the plugin `eslint-plugin-promise`.
 *
 * @returns A `ConfigFactory` function.
 */
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
            files: matchIncludes({ jsx: true }),
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
            files: matchIncludes({ jsx: true }),
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
            files: matchIncludes({ jsx: true }),
            rules: {
              'promise/no-multiple-resolved': 'error',
            },
          },
        ],
      }),
    ];
  };
