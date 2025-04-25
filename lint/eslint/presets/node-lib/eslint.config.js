import { createFlatConfig } from '@budsbox/eslint';
import { eslintPresetTools } from '@budsbox/eslint~presets-tools';

import { eslintPresetNodeLib } from './dist/index.js';

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
