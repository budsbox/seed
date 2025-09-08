import {
  type Preset,
  createBrowserConfigFactory,
  createBuiltInConfigFactory,
} from '@budsbox/eslint';
import { createImportConfigFactory } from '@budsbox/eslint_configs-import';
import { createJsdocConfigFactory } from '@budsbox/eslint_configs-jsdoc';
import { createPrettierConfigFactory } from '@budsbox/eslint_configs-prettier';
import { createPromiseConfigFactory } from '@budsbox/eslint_configs-promise';
import { createReactConfigFactory } from '@budsbox/eslint_configs-react';
import { createTypescriptConfigFactory } from '@budsbox/eslint_configs-typescript';

/**
 * A predefined ESLint configuration preset designed for browser-based applications.
 *
 * This preset provides a comprehensive ESLint configuration setup by composing multiple
 * configuration factories tailored for modern JavaScript/TypeScript development in the
 * context of browser applications. It includes rules and plugins for code quality,
 * style consistency, and best practices.
 *
 * The configuration includes:
 * - Core ESLint rules via `createBuiltInConfigFactory`.
 * - Browser-specific rules via `createBrowserConfigFactory`.
 * - Import/export rules via `createImportConfigFactory`.
 * - JSDoc validation via `createJsdocConfigFactory`.
 * - Prettier integration for consistent formatting via `createPrettierConfigFactory`.
 * - Promise handling improvements via `createPromiseConfigFactory`.
 * - TypeScript-specific rules via `createTypescriptConfigFactory`.
 * - React-specific rules and optimizations via `createReactConfigFactory`, with additional
 *   support for enabling the Fast Refresh plugin.
 *
 * The preset is structured to allow extensions or overrides in the ESLint configuration,
 * making it modular and adaptable for various project requirements.
 *
 * @returns A `Preset` function.
 */
export const eslintPresetBrowserApp: Preset = () => () => [
  createBuiltInConfigFactory(),
  createBrowserConfigFactory(),
  createImportConfigFactory(),
  createJsdocConfigFactory(),
  createPrettierConfigFactory(),
  createPromiseConfigFactory(),
  createTypescriptConfigFactory(),
  createReactConfigFactory({ enableRefreshPlugin: true }),
];
