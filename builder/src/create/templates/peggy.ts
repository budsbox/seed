import type { ArchetypeFiles } from '../types.js';

export const files = {
  '.swcrc': `
{
  "$schema": "https://swc.rs/schema.json",
  "jsc": {
    "loose": true,
    "externalHelpers": false,
    "keepClassNames": false,
    "minify": {
      "compress": {
        "ecma": 2021,
        "keep_infinity": true,
        "module": true,
        "passes": 2,
        "toplevel": true,
        "unsafe_arrows": true,
        "unsafe": true,
        "unsafe_comps": true
      },
      "mangle": {
        "toplevel": true
      },
      "format": {
        "ecma": 2021,
        "indent_level": 0
      }
    }
  },
  "env": {
    "targets": "defaults, maintained node versions, not op_mini all"
  },
  "minify": true,
  "isModule": true
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
  'peggy.config.js': `
export default {
  input: 'src/parser.peggy',
  output: 'dist/parser.js',
  format: 'es',
  allowedStartRules: ['main'],
  test: true,
  testFile: 'src/.test.txt',
  returnTypes: {
    additive: 'number',
    main: 'number',
  },
  dependencies: {},
  dts: true,
};
  `,
  'tsconfig.lib.json': `
{
  "extends": "@budsbox/tsconfigs/tsconfig.iso.lib.json"
}
  `,

  'src/.test.txt': '',
  'src/index.ts': null,
  'src/parser.peggy': '',
  'src/types.ts': null,
} as const satisfies ArchetypeFiles;
