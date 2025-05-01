import { defaultIgnores, presets } from '@budsbox/linting/eslint';

import packageJson from '#package.json' with { type: 'json' };

const config = [
  { ignores: [...defaultIgnores, 'test.js'] },
  ...presets.node({
    tsconfig: import.meta.resolve('./tsconfig.tools.json'),
    packageJson,
  }),
  ...presets.node({
    tsconfig: import.meta.resolve('./tsconfig.lib.json'),
    packageJson,
  }),
];

export default config;
