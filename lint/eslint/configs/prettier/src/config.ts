import type { ConfigFactoryCreate } from '@budsbox/eslint';

import eslintConfigPrettier from 'eslint-config-prettier';

export const createPrettierConfigFactory: ConfigFactoryCreate =
  () =>
  ({ createConfig, matchIncludes }) => {
    return [
      createConfig({
        name: 'prettier',
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
    ];
  };
