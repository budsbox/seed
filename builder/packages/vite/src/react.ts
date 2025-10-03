import type { UserConfig } from 'vite';

import react from '@vitejs/plugin-react';

import { isTrue } from '@budsbox/lib-es/guards';
import { fif } from '@budsbox/lib-es/logical';

import { createConfigFactory } from './lib.js';
import { type PlainConfigOptions, usePlainConfig } from './plain.js';

/**
 * Represents configuration options for Vite+React configurations.
 */
export interface ReactConfigOptions extends PlainConfigOptions {}

export const useReactConfig = createConfigFactory<ReactConfigOptions>(
  (env, options) =>
    usePlainConfig(() => {
      const libConfig = fif(options?.lib, isTrue, {
        build: {
          rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
              globals: {
                'react': 'React',
                'react-dom': 'ReactDOM',
              },
            },
          },
        },
      } as const satisfies UserConfig);

      return {
        plugins: [
          react({
            babel: {
              plugins: ['babel-plugin-react-compiler'],
            },
          }),
        ],
        ...libConfig,
      };
    }, options)(env),
);
