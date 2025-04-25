import { eslintPresetTools } from './dist/index.js';
import { eslintPresetNodeLib } from '@budsbox/eslint~presets-node-lib';

import { createFlatConfig } from '@budsbox/eslint';

export default createFlatConfig({
  importMeta: import.meta,
  entries: [
    {
      tsconfigFile: 'tsconfig.lib.json',
      presets: [eslintPresetNodeLib()],
    },
    {
      tsconfigFile: 'tsconfig.tools.json',
      presets: [eslintPresetTools()],
    },
  ],
});
