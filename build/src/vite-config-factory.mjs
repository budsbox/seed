import react from '@vitejs/plugin-react';

import {
  createJsonImporter,
  createVirtualImporter,
} from '@budsbox/sass-importers';

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
            createJsonImporter(),
            createVirtualImporter('envs', { lol: 1 }),
          ],
        },
      },
    },
    plugins: [react()],
  };
}
