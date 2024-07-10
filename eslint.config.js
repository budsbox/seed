import { presets, globs, withNested } from '@budsbox/linting/eslint';

export default [
  ...presets.node,
  {
    files: withNested(globs.all),
    ignorePatterns: ['packages'],
  },
];
