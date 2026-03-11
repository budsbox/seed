import type { FileExtension } from './types.js';

/**
 * Mapping of file type codes to their corresponding file extensions.
 */
export const fileTypeCodeToExtensions = {
  js: ['js', 'jsx', 'mjs', 'cjs', 'es', 'node'],
  ts: ['ts', 'tsx', 'mts', 'cts'],
  json: ['json'],
} as const;

/**
 * List of file extensions that support JSX syntax.
 *
 * @see {@link FileExtension}
 */
export const jsxExtensions = [
  'jsx',
  'tsx',
] as const satisfies readonly FileExtension[];

/**
 * Mapping of JavaScript source types to their corresponding file extensions.
 *
 * - `ambiguous`: Standard or mixed source files.
 * - `commonjs`: CommonJS module files.
 * - `module`: ECMAScript module files.
 */
export const jsSourceTypeToExtensions = {
  ambiguous: ['js', 'jsx', 'ts', 'tsx'],
  commonjs: ['cjs', 'cts', 'node'],
  module: ['mjs', 'mts'],
} as const satisfies Record<string, FileExtension[]>;
