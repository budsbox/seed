import type { ConfigLevel } from '@budsbox/eslint';

declare module '@budsbox/eslint' {
  interface ConfigNamespaces {
    import: ConfigLevel;
  }
}

export interface ImportConfigFactoryOptions {
  readonly scopeSubgroupsPrefixes?: readonly string[];
}
