import type {
  BaseContext,
  Config,
  ConfigFactoryContext,
  ConfigName,
} from '@budsbox/eslint~core';

import { posix } from 'node:path';

import { ensureArray } from '@budsbox/lib-es/array';
import { isTrue } from '@budsbox/lib-es/guards';
import { type FileExtension, queryJsExtensions } from '@budsbox/lib-extensions';
import { separateIncludes } from '@budsbox/lib-node/ts';

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

    const extGlob = `*.${extensions.length > 1 ? `{${extensions.join(',')}}` : extensions[0]!}`;
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

export const sortConfigs = (configs: Config[]): Config[] => {
  const nameToConfig = new Map<ConfigName, Config>(
    configs.map((config) => [config.name, config]),
  );

  const withoutWildcards = new Set(
    configs
      .filter(({ modifies }) => !isTrue(modifies.includes('*')))
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
