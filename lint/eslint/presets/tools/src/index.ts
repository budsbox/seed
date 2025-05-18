import {
  type Preset,
  createBuiltInConfigFactory,
  createNodeConfigFactory,
} from '@budsbox/eslint';
import { createImportConfigFactory } from '@budsbox/eslint~configs-import';
import { createPrettierConfigFactory } from '@budsbox/eslint~configs-prettier';
import { createPromiseConfigFactory } from '@budsbox/eslint~configs-promise';
import { createTypescriptConfigFactory } from '@budsbox/eslint~configs-typescript';

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
