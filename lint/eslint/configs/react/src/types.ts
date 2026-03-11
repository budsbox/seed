import type { ConfigLevel } from '@budsbox/eslint';

declare module '@budsbox/eslint' {
  interface ConfigNameSpace {
    react: 'jsx-runtime' | ConfigLevel;
  }
}

/**
 * Options for configuring a React configuration factory for ESLint.
 */
export interface ReactConfigFactoryOptions {
  /**
   * Determines whether the refresh plugin is enabled or disabled (default).
   * Requires the `eslint-plugin-react-refresh` package to be installed.
   */
  enableRefreshPlugin?: boolean;

  /**
   * Represents an optional array of strings where each string corresponds to
   * a component associated with the concept of a "link."
   *
   * The array can be undefined if no components need to be specified.
   */
  linkComponents?: string[];
}
