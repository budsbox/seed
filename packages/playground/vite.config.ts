import process from 'node:process';

import { createViteConfig } from '@budsbox/build/vite-config-factory.mjs';
import { type UserConfig, defineConfig } from 'vite';

import packageJson from './package.json';

// https://vitejs.dev/config/
export default defineConfig((viteEnv): UserConfig => {
  return {
    ...createViteConfig({
      projectName: packageJson.name,
      viteEnv,
    }),
    server: {
      port: Number(process.env.PORT),
    },
  };
});
