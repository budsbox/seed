import type { FileExtension } from './types.js';

export const fileTypeCodeToExtensions = {
  js: ['js', 'jsx', 'mjs', 'cjs', 'es', 'node'],
  ts: ['ts', 'tsx', 'mts', 'cts'],
  json: ['json'],
} as const;

export const jsxExtensions = [
  'jsx',
  'tsx',
] as const satisfies readonly FileExtension[];

export const jsSourceTypeToExtensions = {
  ambiguous: ['js', 'jsx', 'ts', 'tsx'],
  commonjs: ['cjs', 'cts', 'node'],
  module: ['mjs', 'mts'],
} as const satisfies Record<string, FileExtension[]>;
