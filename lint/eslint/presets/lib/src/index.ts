import { type Preset, createBuiltInConfigFactory } from '@budsbox/eslint';
import { createImportConfigFactory } from '@budsbox/eslint_configs-import';
import { createJsdocConfigFactory } from '@budsbox/eslint_configs-jsdoc';
import { createPrettierConfigFactory } from '@budsbox/eslint_configs-prettier';
import { createPromiseConfigFactory } from '@budsbox/eslint_configs-promise';
import { createTypescriptConfigFactory } from '@budsbox/eslint_configs-typescript';

/**
 * A preset for ESLint to use for linting runtime-agnostic libraries.
 *
 * @returns A `Preset` function.
 */
export const eslintPresetLib: Preset = () => () => [
  createBuiltInConfigFactory(),
  createImportConfigFactory(),
  createJsdocConfigFactory(),
  createPrettierConfigFactory(),
  createPromiseConfigFactory(),
  createTypescriptConfigFactory(),
];
