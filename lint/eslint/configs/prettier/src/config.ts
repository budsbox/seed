import type { ConfigFactoryCreate } from '@budsbox/eslint';

import eslintConfigPrettier from 'eslint-config-prettier';

/**
 * Creates a `ConfigFactory` function which provides ESLint configuration to disable all the rules which may conflict with Prettier.
 *
 * @returns A `ConfigFactory` function.
 */
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
            files: matchIncludes({ jsx: true }),
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
            files: matchIncludes({ jsx: true }),
            rules: {
              // re-enable this to auto-replace ` with ' for string literals
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
