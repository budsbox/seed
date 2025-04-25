import type { ConfigFactoryCreate } from '#types';

import globals from 'globals';

export const createNodeConfigFactory: ConfigFactoryCreate = () => (ctx) => {
  const { createConfig, matchIncludes } = ctx;

  return [
    createConfig({
      name: 'node',
      modifies: ['core'],
      configs: [
        {
          name: 'esm',
          files: matchIncludes({ targetSourceType: 'module' }),
          languageOptions: { globals: { ...globals.nodeBuiltin } },
        },
        {
          name: 'commonjs',
          files: matchIncludes({ targetSourceType: 'commonjs' }),
          languageOptions: { globals: { ...globals.node } },
        },
      ],
    }),
  ];
};
