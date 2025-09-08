import { createFlatConfig } from '@budsbox/eslint';
import { eslintPresetNodeLib } from '@budsbox/eslint_presets-node-lib';
import { eslintPresetTools } from '@budsbox/eslint_presets-tools';

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
