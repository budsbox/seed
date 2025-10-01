import type { ArchetypeFiles } from '../types.js';

export const files = {
  'tsconfig.lib.json': `
{
  "extends": "@budsbox/tsconfigs/tsconfig.browser.lib.json"
}
  `,
  'eslint.config.js': `
import { createFlatConfig } from '@budsbox/eslint';
import { eslintPresetBrowserLib } from '@budsbox/eslint_presets-browser-lib';
import { eslintPresetTools } from '@budsbox/eslint_presets-tools';

export default createFlatConfig({
  importMeta: import.meta,
  entries: [
    {
      tsconfigFile: 'tsconfig.lib.json',
      presets: [eslintPresetBrowserLib()],
    },
    {
      tsconfigFile: 'tsconfig.tools.json',
      presets: [eslintPresetTools()],
    },
  ],
});
  `,
} as const satisfies ArchetypeFiles;
