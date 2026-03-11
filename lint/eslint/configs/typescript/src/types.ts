import type { TypeOrValueSpecifier } from '@typescript-eslint/type-utils';

import type { ConfigLevel } from '@budsbox/eslint';

declare module '@budsbox/eslint' {
  interface ConfigNameSpace {
    typescript: 'commonjs' | 'import' | 'js' | ConfigLevel;
  }
}

/**
 * Options for configuring the behavior of the `TypeScriptConfigFactory`.
 */
export interface TypeScriptConfigFactoryOptions {
  /* eslint-disable jsdoc/informative-docs */

  /**
   * Extends a list of the allowed type specifiers for readonly parameters.
   *
   * @see {https://typescript-eslint.io/rules/prefer-readonly-parameter-types/#allow @typescript-eslint/prefer-readonly-parameter-types#allow}
   */
  readonly 'prefer-readonly-parameter-types.allow'?: readonly TypeOrValueSpecifier[];
  /* eslint-enable jsdoc/informative-docs */
}
