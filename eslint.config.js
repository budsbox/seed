import { createFlatConfig } from '@budsbox/eslint';
import { eslintPresetTools } from '@budsbox/eslint~presets-tools';

export default createFlatConfig({
  importMeta: import.meta,
  entries: [
    {
      tsconfigFile: 'tsconfig.json',
      presets: [eslintPresetTools()],
    },
  ],
});
