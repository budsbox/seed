import react from '@vitejs/plugin-react';

import { createImporter, createVirtualImporter } from './json-to-sass.mjs';

/** @type { import("./vite-config-factory.d.mjs.js").ViteConfigFactory } */
export function createViteConfig({ viteEnv: { mode } }) {
  return {
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
        generateScopedName:
          mode === 'production' ? '[hash:hex]' : '[path][name]__[local]',
      },
      preprocessorOptions: {
        scss: {
          importer: [
            createImporter(),
            createVirtualImporter('envs', { lol: 1 }),
          ],
        },
      },
    },
    plugins: [react()],
  };
}
