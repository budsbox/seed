import { type Preset, createNodeConfigFactory } from '@budsbox/eslint';
import { eslintPresetLib } from '@budsbox/eslint~presets-lib';

export const eslintPresetNodeLib: Preset = () => async (ctx) => [
  createNodeConfigFactory(),
  ...(await eslintPresetLib()(ctx)),
];
