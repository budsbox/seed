import type { Infer, Maybe, Undef } from '@budsbox/types';
import type { OmitNeverProps, Override } from '@budsbox/types/object';

import type { Linter } from 'eslint';

import { filterBy } from '@budsbox/iso-utils/object';
import { isString } from '@budsbox/iso-utils/type-guards';
import { getTsConfig } from '@budsbox/node-utils/tsconfig';

import {
  type CommonOptions,
  type ConfigWithDefaultOptionsName,
  type ConfigWithoutRequiredOptionsName,
  type FactoryName,
  type UncommonOptions,
  createConfig,
  defaultOptions,
  sortNames,
} from './config.js';

export const presets = {
  node(
    options: PresetOptions<'common' | 'import' | 'ts' | 'node'> = {},
  ): Linter.FlatConfig[] {
    const normalizedOptions = normalizeOptions(options);

    return [
      ...sortNames('common', 'import', 'node', 'ts').flatMap((name) =>
        createConfigFromPresetOptions(name, normalizedOptions),
      ),
    ];
  },

  isoLib(
    options: PresetOptions<'common' | 'import' | 'ts' | 'jsdoc'> = {},
  ): Linter.FlatConfig[] {
    const normalizedOptions = normalizeOptions(options);

    return [
      ...sortNames('common', 'import', 'ts', 'jsdoc').flatMap((name) =>
        createConfigFromPresetOptions(name, normalizedOptions),
      ),
    ];
  },

  nodeLib(
    options: PresetOptions<'common' | 'import' | 'ts' | 'node' | 'jsdoc'> = {},
  ): Linter.FlatConfig[] {
    const normalizedOptions = normalizeOptions(options);

    return [
      ...sortNames('common', 'import', 'ts', 'node', 'jsdoc').flatMap((name) =>
        createConfigFromPresetOptions(name, normalizedOptions),
      ),
    ];
  },

  clientLib(
    options: PresetOptions<
      'common' | 'import' | 'ts' | 'client' | 'jsdoc'
    > = {},
  ): Linter.FlatConfig[] {
    const normalizedOptions = normalizeOptions(options);

    return [
      ...sortNames('common', 'import', 'ts', 'client', 'jsdoc').flatMap(
        (name) => createConfigFromPresetOptions(name, normalizedOptions),
      ),
    ];
  },

  clientApp(
    options: PresetOptions<'common' | 'ts' | 'client' | 'import'> = {},
  ): Linter.FlatConfig[] {
    const normalizedOptions = normalizeOptions(options);

    return [
      ...sortNames('common', 'import', 'ts', 'client').flatMap((name) =>
        createConfigFromPresetOptions(name, normalizedOptions),
      ),
    ];
  },
} as const satisfies Record<
  string,
  (...args: readonly never[]) => Linter.FlatConfig[]
>;

function createConfigFromPresetOptions<Name extends FactoryName>(
  name: Name,
  options: PresetOptionsNormal<Name>,
): Linter.FlatConfig[] {
  const common = filterBy<CommonOptions>(options, (_, key) =>
    Object.hasOwn(defaultOptions, key),
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return createConfig<Name>(name, {
    ...common,
    // @ts-expect-error TS2536 because ts is pretty dumb inside of generic functions
    ...(Object.hasOwn(options, name) ? options[name] : null),
  });
}

function normalizeOptions<Name extends FactoryName>(
  options: PresetOptions<Name>,
): PresetOptionsNormal<Name> {
  return {
    ...options,
    tsconfig:
      isString(options.tsconfig) ? getTsConfig(options.tsconfig) : undefined,
  } as const as PresetOptionsNormal<Name>;
}

type PresetCommonOptions = Override<
  CommonOptions,
  {
    readonly tsconfig?: Maybe<string>;
  }
>;

export type PresetOptions<Name extends FactoryName> = Infer<
  Readonly<PresetCommonOptions & PresetSubOptions<Name>>
>;

type PresetOptionsNormal<Name extends FactoryName> = Infer<
  Readonly<CommonOptions & PresetSubOptions<Name>>
>;

type PresetSubOptions<Name extends FactoryName> = Infer<
  Readonly<
    OmitNeverProps<
      {
        [K in Name & ConfigWithDefaultOptionsName]: never;
      } & {
        [K in Name & ConfigWithoutRequiredOptionsName]?: Undef<
          UncommonOptions<K>
        >;
      } & {
        [K in Exclude<
          Name,
          ConfigWithoutRequiredOptionsName
        >]: UncommonOptions<K>;
      }
    >
  >
>;
