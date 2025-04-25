import { createFlatConfig } from '@budsbox/eslint';
import { eslintPresetLib } from '@budsbox/eslint~presets-lib';
import { eslintPresetTools } from '@budsbox/eslint~presets-tools';

export default await createFlatConfig({
  importMeta: import.meta,
  entries: [
    {
      tsconfigFile: './tsconfig.lib.json',
      presets: [eslintPresetLib()],
    },
    {
      tsconfigFile: 'tsconfig.tools.json',
      presets: [eslintPresetTools()],
    },
  ],
});
