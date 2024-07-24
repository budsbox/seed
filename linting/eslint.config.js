import { globalIgnores, presets } from '#eslint';

const config = [
  { ignores: globalIgnores },
  ...presets.node(),
  {
    files: ['./src/eslint.ts'],
    rules: {
      'sort-keys': [
        'error',
        'asc',
        { allowLineSeparatedGroups: true, natural: false },
      ],
    },
  },
];

export default config;
