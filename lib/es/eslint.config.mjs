import { createFlatConfig } from '@budsbox/eslint';

const config = await createFlatConfig({
  importMeta: import.meta,
  entries: [{ tsconfigFile: './tsconfig.tools.json' }],
});
console.log(config);
export default config;
