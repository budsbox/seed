import type { ConfigFactory } from '#types';

import { getEcmaVersionFromContext } from '#lib';

/**
 * Creates the most basic configuration for ESLint, providing basic settings such as `ecmaVersion` and `sourceType`.
 *
 * @param ctx - The context object for a config factory.
 * @returns A `Config` object.
 */
export const coreConfigFactory: ConfigFactory = (ctx) => {
  const { matchIncludes, createConfig, sourceType } = ctx;
  return createConfig({
    name: 'core',
    level: 'basic',
    configs: [
      {
        name: 'ecma-version',
        files: matchIncludes({ jsx: true }),
        languageOptions: {
          ecmaVersion: getEcmaVersionFromContext(ctx) ?? 'latest',
        },
      },
      {
        name: 'module',
        files: matchIncludes({
          jsx: true,
          sourceType,
          targetSourceType: 'module',
        }),
        languageOptions: { sourceType: 'module' },
      },
      {
        name: 'commonjs',
        files: matchIncludes({
          jsx: true,
          sourceType,
          targetSourceType: 'commonjs',
        }),
        languageOptions: { sourceType: 'commonjs' },
      },
    ],
  });
};
