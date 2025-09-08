import { type Preset, createBrowserConfigFactory } from '@budsbox/eslint';
import { createReactConfigFactory } from '@budsbox/eslint_configs-react';
import { eslintPresetLib } from '@budsbox/eslint_presets-lib';

/**
 * `eslintPresetBrowserLib` is a preset configuration for ESLint tailored for libraries
 * designed to run in browser environments. This preset extends a base library preset
 * and adds additional configurations suited for browser-based projects, including
 * React-specific linting with support for the React Fast Refresh plugin.
 *
 * This preset, when invoked, produces an array of ESLint configuration factories.
 * The factories include:
 * - A configuration for general browser environments.
 * - The base library preset configurations.
 * - A React configuration with optional features enabled.
 *
 * @returns A function that resolves to an array of configuration factories for ESLint.
 */
export const eslintPresetBrowserLib: Preset = () => async (ctx) => [
  createBrowserConfigFactory(),
  ...(await eslintPresetLib()(ctx)),
  createReactConfigFactory({ enableRefreshPlugin: true }),
];
