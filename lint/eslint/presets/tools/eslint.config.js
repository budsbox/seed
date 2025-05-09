import { createFlatConfig } from '@budsbox/eslint';
import { eslintPresetNodeLib } from '@budsbox/eslint~presets-node-lib';

import { eslintPresetTools } from './dist/index.js';


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
