import type { ConfigFactoryCreate } from '#types';

import globals from 'globals';

/**
 * Creates a `ConfigFactory` function which provides ESLint configuration for the Node.js environment.
 *
 * @returns A `ConfigFactory` function.
 */
export const createNodeConfigFactory: ConfigFactoryCreate = () => (ctx) => {
  const { createConfig, matchIncludes, sourceType } = ctx;

  return [
    createConfig({
      name: 'node',
      modifies: ['core'],
      configs: [
        {
          name: 'esm',
          files: matchIncludes({ sourceType, targetSourceType: 'module' }),
          languageOptions: { globals: { ...globals.nodeBuiltin } },
        },
        {
          name: 'commonjs',
          files: matchIncludes({ sourceType, targetSourceType: 'commonjs' }),
          languageOptions: { globals: { ...globals.node } },
        },
      ],
    }),
  ];
};
