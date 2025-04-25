import { type Preset, createCommonConfigFactory } from '@budsbox/eslint';
import { createImportConfigFactory } from '@budsbox/eslint~configs-import';
import { createTypescriptConfigFactory } from '@budsbox/eslint~configs-typescript';

export const eslintPresetLib: Preset = () => () => [
  createCommonConfigFactory(),
  createTypescriptConfigFactory(),
  createImportConfigFactory(),
];
