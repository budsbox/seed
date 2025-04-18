import { createFlatConfig, createCommonConfigFactory } from '@budsbox/eslint';
import { createTypescriptConfig } from '@budsbox/eslint~config-typescript';
import { createImportConfigFactory } from '@budsbox/eslint~config-import';

const config = await createFlatConfig({
  importMeta: import.meta,
  entries: [
    {
      tsconfigFile: './tsconfig.lib.json',
      configs: [
        createCommonConfigFactory(),
        createCommonConfigFactory(),
        createTypescriptConfig(),
        createImportConfigFactory(),
      ],
    },
  ],
});

console.log(config);
export default config;
