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
  removeDot,
} from '@budsbox/lib-extensions';
import { separateIncludes } from '@budsbox/lib-node/ts';

import { configDefaults, eslintSymbol } from '#const';

/**
 * Creates a `matchIncludes` function for filtering and constructing
 * file patterns based on the provided TypeScript configuration and
 * query parameters.
 *
 * @param context - The context object containing the TypeScript configuration
 * @returns A function that takes extensions filter parameters and returns an array of globs.
 * @remarks
 * The returned function uses the following logic:
 * - Determines extensions to match based on the given language and `allowJs` flag.
 * - Converts these extensions into a glob pattern.
 * - Filters explicitly specified files that match the extensions.
 * - Constructs directory glob patterns using the given directories and extensions.
 * @see {@link ConfigFactoryContext#matchIncludes}
 */
export const createMatchIncludes = ({
  tsconfig,
}: Readonly<BaseContext>): ConfigFactoryContext['matchIncludes'] => {
  const { allowJs = false } = tsconfig.compilerOptions ?? {};
  const { dirs, files } = separateIncludes(tsconfig.include ?? []);

  const matchIncludes: ConfigFactoryContext['matchIncludes'] = ({
    lang,
    ...query
  }) => {
    const extensions = queryJsExtensions({
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
        extensions.includes(removeDot(posix.extname(file)) as FileExtension),
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

/**
 * Sorts an array of configuration objects based on their dependencies.
 *
 * Each configuration has a `modifies` property, which defines the configuration names
 * it depends on. The function resolves these dependencies to determine the order
 * in which the configurations should be returned. Configurations with circular
 * dependencies will throw an error.
 *
 * - Configurations that have `'*'` in their `modifies` list are treated as modifying
 *   all configurations that do not modify others (wildcard handling).
 * - Configurations without dependencies or with dependencies already resolved
 *   are added into the sorted list in a dependency-respecting order.
 *
 * @param configs - The input array of configuration objects. This array is immutable,
 * as the function does not modify the original array but returns a new array
 * representing the sorted order.
 * @returns A new array of configurations sorted in an order based on dependency resolution.
 * @throws If any circular dependencies are detected among configurations, an error is thrown.
 */
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

/**
 * Generates and returns a fully constructed `Config` object with the provided options
 * and context. The function processes configuration parameters, applies defaults,
 * and transforms the input into a standardised configuration format.
 *
 * @param options - An object containing configuration {@link CreateConfigOptions options}.
 * @param ctx - A readonly {@link BaseContext context object} containing metadata.
 * @returns A {@link Config `Config` object} that includes the processed configuration data,
 *   with frozen properties for immutability.
 */
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

/**
 * Retrieves the corresponding configuration object from the configuration map
 * based on the provided flat configuration.
 *
 * @param flatConfig - A {@link Linter#Config flat configuration object} used as a key
 *                     to look up a matching configuration from the configuration map.
 * @returns The corresponding {@link Config configuration object} if found, or `null` if not found.
 */
export const getConfigByFlatConfig = (
  flatConfig: Linter.Config,
): Config | null => configMap.get(flatConfig) ?? null;

/**
 * Checks if the provided value is a {@link Config `Config` object}.
 *
 * @param value - The value to be evaluated.
 * @returns A boolean indicating whether the value is a valid {@link Config `Config` object}.
 */
export const isConfig = (value: unknown): value is Config =>
  hasProp(value, eslintSymbol, (v) => v === configDefaults[eslintSymbol]);

/**
 * Derives the appropriate {@link Linter#ParserOptions#ecmaVersion ESLint-compatible ECMAScript version} from the provided {@link BaseContext context}.
 *
 * Determines the ESLint-compatible ECMAScript version value based on the `target` field in the `compilerOptions` of `tsconfig`.
 * If the `target` is `'esnext'`, it returns `'latest'`. If the `target` matches the form `'es{number}'`,
 * it extracts the number and returns it as the ECMAScript version. Returns `undefined` if no compatible
 * ECMAScript version can be determined.
 *
 * @param context - A {@link BaseContext context object}.
 * @returns The {@link Linter#ParserOptions#ecmaVersion ECMAScript version} represented, or `undefined` if it cannot be determined.
 */
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
