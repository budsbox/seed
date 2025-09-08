import type { ConfigFactoryCreate } from '#types';

import globals from 'globals';

/**
 * A factory function that creates a Node.js-specific configuration.
 *
 * This function handles the creation of a configuration object tailored for Node.js environments.
 * It takes the context, deconstructs relevant utilities from it, and returns an array of
 * configuration objects based on the provided context data.
 *
 * The configuration includes two main settings:
 * - `esm`: Configurations for handling ECMAScript Module (ESM) files.
 * - `commonjs`: Configurations for handling CommonJS files.
 *
 * @returns A function that accepts the context and returns an array containing the node configuration object.
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

/**
 * Factory function to create browser-specific ESLint configurations.
 *
 * This factory produces an array of configuration objects tailored for browser environments.
 * It defines both basic and opinionated configurations with specific file matching and rule adjustments.
 *
 * @returns A function that accepts a configuration context and returns an array of browser-related ESLint configurations.
 */
export const createBrowserConfigFactory: ConfigFactoryCreate = () => (ctx) => {
  const { createConfig, matchIncludes } = ctx;

  return [
    createConfig({
      name: 'browser/basic',
      level: 'basic',
      modifies: ['core'],
      configs: [
        {
          files: matchIncludes({ jsx: true }),
          languageOptions: { globals: { ...globals.browser } },
        },
      ],
    }),

    createConfig({
      name: 'browser/opinionated',
      modifies: ['core'],
      configs: [
        {
          files: matchIncludes({ jsx: true }),
          rules: {
            'no-alert': 'error',
          },
        },
      ],
    }),
  ];
};
