import { NodePackageImporter } from 'sass-embedded';

import { createBaseConfig } from './lib.js';

export const usePlainConfig = createBaseConfig(({ mode }) => ({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName:
        mode === 'production' ? '[hash:hex]' : '[path][name]__[local]',
    },
    preprocessorOptions: {
      scss: {
        importers: [new NodePackageImporter()],
      },
    },
  },
}));
