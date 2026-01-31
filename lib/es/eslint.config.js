import { createFlatConfig } from '@budsbox/eslint';
import { eslintPresetLib } from '@budsbox/eslint_presets-lib';
import { eslintPresetTools } from '@budsbox/eslint_presets-tools';

export default await createFlatConfig({
  importMeta: import.meta,
  // inspectConfig: { depth: 6 },
  entries: [
    {
      tsconfigFile: './tsconfig.lib.json',
      presets: [eslintPresetLib()],
    },
    {
      tsconfigFile: 'tsconfig.tools.json',
      presets: [eslintPresetTools()],
    },
    {
      tsconfigFile: 'tsconfig.test.json',
      presets: [eslintPresetLib()],
    },
  ],
});
