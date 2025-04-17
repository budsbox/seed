import type { CreateFlatConfigParams } from './types.js';
import type { Linter } from 'eslint';

import {
  type BaseContext,
  type Config,
  type ConfigFactory,
  type ConfigFactoryContext,
  type CreateConfigOptions,
  coreConfigFactory,
  createConfig as createConfigPure,
  defaultIgnores,
} from '@budsbox/eslint~core';

import { isArray, isNotNil } from '@budsbox/lib-es/guards';

import { findCurrentPackageJson } from '@budsbox/lib-node/pckg';
import { getTsConfig } from '@budsbox/lib-node/ts';

import { createMatchIncludes, sortConfigs } from './lib.js';

export async function createFlatConfig({
  importMeta,
  entries,
  ignores = defaultIgnores,
}: Readonly<CreateFlatConfigParams>): Promise<Linter.FlatConfig[]> {
  const allConfigs: Config[] = [];
  const packageJson = await findCurrentPackageJson(importMeta);
  const globalCtx = {
    importMeta,
    packageJsonPath: packageJson.path,
    packageJson: packageJson.json,
    sourceType: packageJson.json.type ?? 'commonjs',
  } as const satisfies Partial<BaseContext>;

  await Promise.all(
    entries.map(async (entry) => {
      const tsconfig = await getTsConfig(entry.tsconfigFile, {
        workdir: importMeta.dirname,
      });

      const baseContext = {
        ...globalCtx,
        tsconfigPath: tsconfig.path,
        tsconfig: tsconfig.json,
      } as const satisfies BaseContext;

      const factories: ConfigFactory[] = [
        coreConfigFactory,
        ...(isArray(entry.presets) ?
          await Promise.all(entry.presets.map((preset) => preset(baseContext)))
        : []
        ).flat(),
        ...(entry.configs ?? []),
      ];

      const matchIncludes = createMatchIncludes(baseContext);
      const createConfig: ConfigFactoryContext['createConfig'] = (
        options: CreateConfigOptions,
      ) => createConfigPure(options, baseContext);

      const configFactoryContext = {
        ...baseContext,
        matchIncludes,
        createConfig,
      } as const satisfies ConfigFactoryContext;

      allConfigs.push(
        ...sortConfigs(
          (
            await Promise.all(
              factories.map((factory) => factory(configFactoryContext)),
            )
          )
            .flat()
            .filter((v) => isNotNil(v)),
        ),
      );
    }),
  );

  return [
    { ignores: [...ignores] },
    ...allConfigs.flatMap(({ configs }) => configs),
  ];
}
