import type { ConfigLevel } from '@budsbox/eslint';

declare module '@budsbox/eslint' {
  interface ConfigNamespaces {
    promise: ConfigLevel;
  }
}
