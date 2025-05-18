import type { ConfigLevel } from '@budsbox/eslint';

declare module '@budsbox/eslint' {
  interface ConfigNameSpace {
    jsdoc: ConfigLevel;
  }
}
