import type { ConfigFactory } from '#types';

import { getEcmaVersionFromContext } from '#lib';

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
