import type { ConfigFactoryCreate } from '@budsbox/eslint';

import eslintConfigPrettier from 'eslint-config-prettier';

export const createPrettierConfigFactory: ConfigFactoryCreate =
  () =>
  ({ createConfig, matchIncludes }) => {
    return [
      createConfig({
        name: 'prettier/basic',
        level: 'basic',
        modifies: ['*'],
        configs: [
          {
            files: matchIncludes({ jsx: true, sourceType: undefined }),
            rules: {
              ...eslintConfigPrettier.rules,
            },
          },
        ],
      }),

      createConfig({
        name: 'prettier/opinionated',
        modifies: ['*', 'prettier/basic'],
        configs: [
          {
            files: matchIncludes({ jsx: true, sourceType: undefined }),
            rules: {
              // auto-replace ` with ' for string literals
              quotes: [
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
