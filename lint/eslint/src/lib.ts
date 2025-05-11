import type { Linter } from 'eslint';

import type {
  BaseContext,
  Config,
  ConfigFactoryContext,
  ConfigName,
  CreateConfigOptions,
} from '#types';

import { basename, posix } from 'node:path';

import { ensureArray } from '@budsbox/lib-es/array';
import { hasProp, isArray, isNil } from '@budsbox/lib-es/guards';
import { sure } from '@budsbox/lib-es/logical';
import { parsePackageName } from '@budsbox/lib-es/string';
import {
  type FileExtension,
  globFromExtensions,
  queryJsExtensions,
} from '@budsbox/lib-extensions';
import { separateIncludes } from '@budsbox/lib-node/ts';

import { configDefaults, eslintSymbol } from '#const';

export const createMatchIncludes = ({
  tsconfig,
  sourceType,
}: Readonly<BaseContext>): ConfigFactoryContext['matchIncludes'] => {
  const { allowJs = false } = tsconfig.compilerOptions ?? {};
  const { dirs, files } = separateIncludes(tsconfig.include ?? []);

  const matchIncludes: ConfigFactoryContext['matchIncludes'] = ({
    lang,
    ...query
  }) => {
    const extensions = queryJsExtensions({
      sourceType,
      lang:
        allowJs ? lang : (
          ensureArray(lang ?? (['ts'] as const)).filter((l) => l !== 'js')
        ),
      ...query,
    });
    if (!extensions.length) return [];

    const extGlob = globFromExtensions(extensions);
    const oneLevelGlobRegex = /\/\*$/;
    return [
      ...files.filter((file) =>
        extensions.includes(posix.extname(file).slice(1) as FileExtension),
      ),
      ...dirs.map((dir) =>
        posix.join(
          ...(oneLevelGlobRegex.test(dir) ?
            [dir.replace(oneLevelGlobRegex, '')]
          : [dir, '**']),
          extGlob,
        ),
      ),
    ];
  };

  return matchIncludes;
};

export const sortConfigs = (configs: readonly Config[]): Config[] => {
  const nameToConfig = new Map<ConfigName, Config>(
    configs.map((config) => [config.name, config]),
  );

  const withoutWildcards = new Set(
    configs
      .filter(({ modifies }) => !modifies.includes('*'))
      .map(({ name }) => name),
  );
  const visited = new Set<ConfigName>();

  const getWithDeps = (
    name: ConfigName,
    stack: readonly ConfigName[] = [],
  ): Config[] => {
    if (visited.has(name) || !nameToConfig.has(name)) return [];
    if (stack.includes(name)) {
      throw new Error(
        `Circular dependency detected: ${[...stack, name].join(' -> ')}`,
      );
    }

    const config = nameToConfig.get(name)!;
    const modifiesKeys = config.modifies.flatMap((dep) =>
      dep === '*' ? [...withoutWildcards] : dep,
    );
    const deps = modifiesKeys.flatMap((dep) =>
      getWithDeps(dep, [...stack, name]),
    );
    visited.add(name);
    return (
        modifiesKeys.length === 0 ||
          modifiesKeys.some((dep) => visited.has(dep))
      ) ?
        [...deps, config]
      : [];
  };

  return configs.flatMap(({ name }) => getWithDeps(name));
};

const configMap = new WeakMap<Linter.Config, Config>();

export const createConfig = (
  { name: configName, configs, ...restOptions }: CreateConfigOptions,
  { packageJson, tsconfigPath }: Readonly<BaseContext>,
): Config => {
  const packageJsonSuffix = parsePackageName(packageJson.name ?? '').name;
  const tsconfigFileSuffix =
    /tsconfig\.(.+)$/.exec(basename(tsconfigPath, '.json'))?.[1] ?? '[index]';

  const config: Config = {
    ...configDefaults,
    ...restOptions,
    name: configName,
    configs: Object.freeze(
      configs
        .filter(({ files }) => isArray(files) && files.length > 0)
        .map(
          ({ name, ...rest }, index, { length }): Linter.Config => ({
            name: [
              [packageJsonSuffix, tsconfigFileSuffix].join('#'),
              [
                configName,
                ...sure(name, ensureArray, () =>
                  length > 1 ? [index.toFixed(0)] : [],
                ),
              ].join('#'),
            ].join(':'),
            ...rest,
          }),
        ),
    ),
  };

  // reconfigure to make it non-enumerable
  Object.defineProperty(config, eslintSymbol, {
    value: config[eslintSymbol],
    enumerable: false,
  });

  config.configs.forEach((flatConfig) => {
    configMap.set(flatConfig, config);
  });

  return Object.freeze(config);
};

export const getConfigByFlatConfig = (
  flatConfig: Linter.Config,
): Config | null => configMap.get(flatConfig) ?? null;

export const isConfig = (value: unknown): value is Config =>
  hasProp(value, eslintSymbol, (v) => v === configDefaults[eslintSymbol]);

export const getEcmaVersionFromContext = ({
  tsconfig,
}: Readonly<BaseContext>): Linter.ParserOptions['ecmaVersion'] | undefined => {
  const regex = /^es(\d+)$/i;
  const target = tsconfig.compilerOptions?.target;

  if (target === 'esnext') {
    return 'latest';
  }

  return !isNil(target) && regex.test(target) ?
      (parseInt(
        target.replace(regex, '$1'),
        10,
      ) as Linter.ParserOptions['ecmaVersion'])
    : undefined;
};
