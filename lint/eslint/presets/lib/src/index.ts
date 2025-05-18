import { type Preset, createBuiltInConfigFactory } from '@budsbox/eslint';
import { createImportConfigFactory } from '@budsbox/eslint~configs-import';
import { createJsdocConfigFactory } from '@budsbox/eslint~configs-jsdoc';
import { createPrettierConfigFactory } from '@budsbox/eslint~configs-prettier';
import { createPromiseConfigFactory } from '@budsbox/eslint~configs-promise';
import { createTypescriptConfigFactory } from '@budsbox/eslint~configs-typescript';

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
