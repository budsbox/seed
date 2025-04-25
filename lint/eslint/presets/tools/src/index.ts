import {
  type Preset,
  createCommonConfigFactory,
  createNodeConfigFactory,
} from '@budsbox/eslint';
import { createImportConfigFactory } from '@budsbox/eslint~configs-import';
import { createTypescriptConfigFactory } from '@budsbox/eslint~configs-typescript';

export const eslintPresetTools: Preset = () => () => [
  createNodeConfigFactory(),
  createCommonConfigFactory(),
  createTypescriptConfigFactory(),
  createImportConfigFactory(),
];
