import react from '@vitejs/plugin-react';

import { createBaseConfig } from './lib.js';
import { usePlainConfig } from './plain.js';

export const useReactConfig = createBaseConfig(
  usePlainConfig(() => ({
    plugins: [
      react({
        babel: {
          plugins: ['babel-plugin-react-compiler'],
        },
      }),
    ],
  })),
);
