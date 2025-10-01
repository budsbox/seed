import type { ArchetypeFiles } from '../types.js';

export const files = {
  'tsconfig.json': `
{
  "extends": "@budsbox/tsconfigs/tsconfig.index.json",
  "references": [
    { "path": "tsconfig.tools.json" },
    { "path": "tsconfig.lib.json" }
  ]
}
  `,
  'src/index.ts': '\n',
  'src/types.ts': '\n',
} as const satisfies ArchetypeFiles;
