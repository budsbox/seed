import { globs, presets, withNested } from '#eslint';

export default [
  ...presets.node,
  {
    files: withNested(globs.js),
    rules: {
      'sort-keys': [
        'error',
        'asc',
        { allowLineSeparatedGroups: true, natural: false },
      ],
    },
  },
];
