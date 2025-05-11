import { type Preset, createCommonConfigFactory } from '@budsbox/eslint';
import { createImportConfigFactory } from '@budsbox/eslint~configs-import';
import { createJsdocConfigFactory } from '@budsbox/eslint~configs-jsdoc';
import { createPrettierConfigFactory } from '@budsbox/eslint~configs-prettier';
import { createPromiseConfigFactory } from '@budsbox/eslint~configs-promise';
import { createTypescriptConfigFactory } from '@budsbox/eslint~configs-typescript';

export const eslintPresetLib: Preset = () => () => [
  createCommonConfigFactory(),
  createImportConfigFactory(),
  createJsdocConfigFactory(),
  createPrettierConfigFactory(),
  createPromiseConfigFactory(),
  createTypescriptConfigFactory(),
];
