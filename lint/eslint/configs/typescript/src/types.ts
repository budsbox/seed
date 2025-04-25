import type { ConfigLevel } from '@budsbox/eslint';

declare module '@budsbox/eslint' {
  interface ConfigNamespaces {
    typescript: ConfigLevel | 'commonjs' | 'import';
  }
}
