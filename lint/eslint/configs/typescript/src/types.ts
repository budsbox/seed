import type { ConfigLevel } from '@budsbox/eslint';

declare module '@budsbox/eslint' {
  interface ConfigNameSpace {
    typescript: ConfigLevel | 'commonjs' | 'import';
  }
}
