import process from 'node:process';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const { env } = process;
const isProd = env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: isProd ? '[hash:hex]' : '[path][name]__[local]',
    },
  },
  plugins: [react()],
  server: {
    port: Number(env.PORT),
  },
});
