import { type Preset, createNodeConfigFactory } from '@budsbox/eslint';
import { eslintPresetLib } from '@budsbox/eslint_presets-lib';

/**
 * A preset for ESLint to use for linting Node.js libraries.
 *
 * @returns A `Preset` function.
 */
export const eslintPresetNodeLib: Preset = () => async (ctx) => [
  createNodeConfigFactory(),
  ...(await eslintPresetLib()(ctx)),
];
