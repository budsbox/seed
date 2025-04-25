import {
  type Preset,
  createCommonConfigFactory,
  createNodeConfigFactory,
} from '@budsbox/eslint';
import { createImportConfigFactory } from '@budsbox/eslint~configs-import';
import { createPrettierConfigFactory } from '@budsbox/eslint~configs-prettier';
import { createPromiseConfigFactory } from '@budsbox/eslint~configs-promise';
import { createTypescriptConfigFactory } from '@budsbox/eslint~configs-typescript';

export const eslintPresetTools: Preset = () => () => [
  createNodeConfigFactory(),
  createCommonConfigFactory(),
  createTypescriptConfigFactory(),
  createImportConfigFactory(),
  createPromiseConfigFactory(),
  createPrettierConfigFactory(),
];
