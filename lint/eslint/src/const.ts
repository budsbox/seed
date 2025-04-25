import type { Linter } from 'eslint';

import type { Config } from '#types';

import type { Def } from '@budsbox/lib-types';

export const defaultIgnores: Readonly<Def<Linter.FlatConfig['ignores']>> = [
  '**/.ignored/',
  '**/dist/',
  '.husky/',
  '.idea/',
  '.yarn',
  '.pnp.*',
  '**/*.scss.d.ts',
];

export const eslintSymbol = Symbol('@budsbox/eslint');

export const configDefaults = {
  modifies: [],
  level: 'opinionated',
  [eslintSymbol]: true,
} as const satisfies Partial<Config>;

export const configLevels = {
  basic: 0,
  recommended: 100,
  strict: 200,
  opinionated: 300,
};
