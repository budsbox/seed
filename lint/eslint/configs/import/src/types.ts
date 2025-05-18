import type { ConfigLevel } from '@budsbox/eslint';

declare module '@budsbox/eslint' {
  interface ConfigNameSpace {
    import: ConfigLevel;
  }
}

/**
 * Options for configuring the behaviour of the `ImportConfigFactory`.
 */
export interface ImportConfigFactoryOptions {
  /**
   * Defines prefixes within the current scope to group them separately.
   * For example, set this property as [`lib`] to group all the packages starting with `@<current-scope>/lib` into a separate group.
   */
  readonly scopeSubgroupsPrefixes?: readonly string[];
}
