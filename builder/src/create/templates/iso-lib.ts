import type { ArchetypeFiles } from '../types.js';

export const files = {
  'tsconfig.lib.json': `
{
  "extends": "@budsbox/tsconfigs/tsconfig.iso.lib.json"
}
  `,
  'eslint.config.js': `
import { createFlatConfig } from '@budsbox/eslint';
import { eslintPresetLib } from '@budsbox/eslint_presets-lib';
import { eslintPresetTools } from '@budsbox/eslint_presets-tools';

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
  `,
} as const satisfies ArchetypeFiles;
