import type { Linter } from 'eslint';

import type {
  BaseContext,
  Config,
  ConfigFactory,
  ConfigFactoryContext,
  CreateConfigOptions,
  CreateFlatConfigParams,
} from '#types';

import {
  isArray,
  isFalse,
  isFunction,
  isNotNil,
  isObject,
} from '@budsbox/lib-es/guards';
import { fifs } from '@budsbox/lib-es/logical';
import { findCurrentPackageJson } from '@budsbox/lib-node/pckg';
import { getTsConfig } from '@budsbox/lib-node/ts';

import { coreConfigFactory } from '#configs';
import { defaultIgnores } from '#const';
import {
  createConfig as createConfigPure,
  createMatchIncludes,
  sortConfigs,
} from '#lib';

/**
 * Creates and returns a flattened configuration for ESLint based on the given parameters.
 * @param params - An object containing the parameters required to construct the ESLint configuration.
 * @param params.importMeta - `import.meta` of `eslint.config.js` module.
 * @param params.entries - A list of configuration entry points used to construct the flattened configuration.
 * @param params.ignores - An array of paths or patterns to be ignored globally. Defaults to `defaultIgnores` if not provided.
 * @param params.inspectConfig - A flag or function to inspect the generated configuration. Can be `true`, a custom inspection function, or options object for `console.dir()`.
 * @param params.lintWorkspaces - A boolean indicating whether to include sub-workspaces patterns in linting. Defaults to `false`.
 * @returns A promise that resolves to ESLint Flat Config.
 */
export async function createFlatConfig({
  importMeta,
  entries,
  ignores = defaultIgnores,
  inspectConfig = false,
  lintWorkspaces = false,
}: Readonly<CreateFlatConfigParams>): Promise<Linter.Config[]> {
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

  const flatConfig = [
    {
      ignores: [
        ...ignores,
        ...fifs(lintWorkspaces, [], () => {
          const { workspaces } = packageJson.json;

          return (
            isArray(workspaces) ? workspaces : workspaces?.packages ?? []).map(
            (pattern) =>
              pattern.replace(/^\.\//, '').replace(/(?:\/\*)?$/, '/'),
          );
        }),
      ],
    },
    ...allConfigs.flatMap(({ configs }) => configs),
  ];
  if (isFunction(inspectConfig)) {
    inspectConfig(flatConfig);
  } else if (!isFalse(inspectConfig)) {
    // eslint-disable-next-line no-console
    console.dir(flatConfig, isObject(inspectConfig) ? inspectConfig : {});
  }

  return flatConfig;
}
