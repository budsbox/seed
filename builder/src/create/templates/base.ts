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
} as const;
