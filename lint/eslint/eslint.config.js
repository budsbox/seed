import { eslintPresetNodeLib } from '@budsbox/eslint_presets-node-lib';
import { eslintPresetTools } from '@budsbox/eslint_presets-tools';

import { createFlatConfig } from './dist/index.js';

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
