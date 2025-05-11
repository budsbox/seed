import type { ConfigFactoryCreate } from '@budsbox/eslint';

import eslintPluginJsdoc from 'eslint-plugin-jsdoc';

export const createJsdocConfigFactory: ConfigFactoryCreate =
  () =>
  ({ createConfig, matchIncludes }) => {
    return [
      createConfig({
        name: 'jsdoc/basic',
        level: 'basic',
        modifies: ['core'],
        configs: [
          {
            files: matchIncludes({ jsx: true, sourceType: undefined }),
            plugins: {
              jsdoc: eslintPluginJsdoc,
            },
            rules: {},
          },
        ],
      }),

      createConfig({
        name: 'jsdoc/recommended',
        level: 'recommended',
        modifies: ['jsdoc/basic'],
        configs: [
          {
            files: matchIncludes({ jsx: true, sourceType: undefined }),
            rules: {
              ...eslintPluginJsdoc.configs['flat/recommended-typescript'].rules,
            },
          },
        ],
      }),

      createConfig({
        name: 'jsdoc/strict',
        level: 'strict',
        modifies: ['jsdoc/basic', 'jsdoc/recommended'],
        configs: [
          {
            files: matchIncludes({ jsx: true, sourceType: undefined }),
            rules: {
              ...eslintPluginJsdoc.configs['flat/recommended-typescript-error']
                .rules,
            },
          },
        ],
      }),

      createConfig({
        name: 'jsdoc/opinionated',
        modifies: ['jsdoc/basic', 'jsdoc/recommended', 'jsdoc/strict'],
        configs: [
          {
            files: matchIncludes({ jsx: true, sourceType: undefined }),
            rules: {},
          },
        ],
      }),
    ];
  };
