import {
  type Preset,
  createBuiltInConfigFactory,
  createNodeConfigFactory,
} from '@budsbox/eslint';
import { createImportConfigFactory } from '@budsbox/eslint_configs-import';
import { createPrettierConfigFactory } from '@budsbox/eslint_configs-prettier';
import { createPromiseConfigFactory } from '@budsbox/eslint_configs-promise';
import { createTypescriptConfigFactory } from '@budsbox/eslint_configs-typescript';

/**
 * A preset for ESLint to use for linting configuration files of developer tools (like `eslint.config.js`).
 *
 * @returns A `Preset` function.
 */
export const eslintPresetTools: Preset = () => () => [
  createNodeConfigFactory(),
  createBuiltInConfigFactory(),
  createTypescriptConfigFactory(),
  createImportConfigFactory(),
  createPromiseConfigFactory(),
  createPrettierConfigFactory(),
];
