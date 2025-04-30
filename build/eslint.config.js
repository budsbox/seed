import { defaultIgnores, presets } from '@budsbox/linting/eslint';

import packageJson from '#package.json' with { type: 'json' };

const config = [
  { ignores: defaultIgnores },
  ...presets.node({
    tsconfig: import.meta.resolve('./tsconfig.json'),
    packageJson,
  }),
];

export default config;
