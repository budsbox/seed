import type { Config } from './types.js';
import type { Def } from '@budsbox/lib-types';

import type { Linter } from 'eslint';

export const defaultIgnores: Readonly<Def<Linter.FlatConfig['ignores']>> = [
  '**/.ignored/',
  '**/dist/',
  '.husky/',
  '.idea/',
  '.yarn',
  '.pnp.*',
  '**/*.scss.d.ts',
];

export const coreSymbol = Symbol('@budsbox/eslint~core#symbol');

export const configDefaults = {
  modifies: [],
  level: 'opinionated',
  [coreSymbol]: true,
} as const satisfies Partial<Config>;

export const configLevels = {
  basic: 0,
  recommended: 100,
  strict: 200,
  opinionated: 300,
};
