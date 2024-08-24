import { defaultIgnores, presets } from '#eslint';
import packageJson from '#package.json' with { type: 'json' };

const config = [
  { ignores: defaultIgnores },
  ...presets.node({
    tsconfig: import.meta.resolve('./tsconfig.tools.json'),
    packageJson,
  }),
  ...presets.node({
    tsconfig: import.meta.resolve('./tsconfig.lib.json'),
    packageJson,
  }),
  {
    files: ['./src/eslint/config.ts'],
    rules: {
      'sort-keys': [
        'error',
        'asc',
        { allowLineSeparatedGroups: true, natural: false },
      ],
    },
  },
];

// console.log(config);

export default config;
