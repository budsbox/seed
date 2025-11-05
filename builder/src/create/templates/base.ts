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
  'tsconfig.tools.json': `
{
  "extends": "@budsbox/tsconfigs/tsconfig.tools.json"
}
  `,
  'tsconfig.test.json': `
{
  "extends": "@budsbox/tsconfigs/tsconfig.iso.test.json"
}
  `,
} as const;
