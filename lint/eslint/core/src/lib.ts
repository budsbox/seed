import type { BaseContext, Config, CreateConfigOptions } from './types.js';
import type { Linter } from 'eslint';

import { basename } from 'node:path';

import { ensureArray } from '@budsbox/lib-es/array';
import { hasProp, isArray, isNil, isTrue } from '@budsbox/lib-es/guards';
import { sure } from '@budsbox/lib-es/logical';

import { parsePackageName } from '@budsbox/lib-es/string';

import { configDefaults, coreSymbol } from './const.js';

const configMap = new WeakMap<Linter.FlatConfig, Config>();

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
          ({ name, ...rest }, index, { length }): Linter.FlatConfig => ({
            name: [
              packageJsonSuffix,
              tsconfigFileSuffix,
              configName,
              ...sure(name, ensureArray, () =>
                length > 1 ? [index.toFixed(0)] : [],
              ),
            ].join(':'),
            ...rest,
          }),
        ),
    ),
  };

  // reconfigure to make it non-enumerable
  Object.defineProperty(config, coreSymbol, {
    value: config[coreSymbol],
    enumerable: false,
  });

  config.configs.forEach((flatConfig) => {
    configMap.set(flatConfig, config);
  });

  return Object.freeze(config);
};

export const getConfigByFlatConfig = (
  flatConfig: Linter.FlatConfig,
): Config | null => configMap.get(flatConfig) ?? null;

export const isConfig = (value: unknown): value is Config =>
  hasProp(value, coreSymbol, (v) => v === configDefaults[coreSymbol]);

export const getEcmaVersionFromContext = ({
  tsconfig,
}: BaseContext): Linter.ParserOptions['ecmaVersion'] | undefined => {
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

export const unopinionated = (
  ...configs: Array<Linter.FlatConfig | Config>
): Array<Linter.FlatConfig | Config> =>
  configs.filter(
    (configOrFlat) =>
      !hasProp(
        isConfig(configOrFlat) ? configOrFlat : (
          getConfigByFlatConfig(configOrFlat)
        ),
        'opinionated',
        isTrue,
      ),
  );

export const loose = (
  ...configs: Array<Linter.FlatConfig | Config>
): Array<Linter.FlatConfig | Config> =>
  configs.filter(
    (configOrFlat) =>
      !hasProp(
        isConfig(configOrFlat) ? configOrFlat : (
          getConfigByFlatConfig(configOrFlat)
        ),
        'strict',
        isTrue,
      ),
  );
