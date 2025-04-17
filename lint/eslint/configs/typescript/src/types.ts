import type { ConfigLevel } from '@budsbox/eslint~core';

declare module '@budsbox/eslint~core' {
  interface ConfigNamespaces {
    typescript: ConfigLevel | 'commonjs';
  }
}
