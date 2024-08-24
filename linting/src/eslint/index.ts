import type { Def } from '@budsbox/types';

import type { Linter } from 'eslint';

export const defaultIgnores: Readonly<Def<Linter.FlatConfig['ignores']>> = [
  '**/dist/',
  '.husky/',
  '.idea/',
  '.pnp.*',
  '**/*.scss.d.ts',
];

export { presets } from './presets.js';
