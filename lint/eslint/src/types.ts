import type { Linter } from 'eslint';
import type {
  Arrayable,
  EmptyObject,
  HasRequiredKeys,
  PackageJson,
  SetOptional,
  TsConfigJson,
} from 'type-fest';

import type {
  JsSourceType,
  QueryJsExtensionsParams,
} from '@budsbox/lib-extensions';
import type { Awaitable, Maybe, NonNil } from '@budsbox/lib-types';

import type { configDefaults, configLevels, eslintSymbol } from './const.js';

export interface BaseContext {
  importMeta: ImportMeta;
  packageJsonPath: string;
  packageJson: PackageJson;
  tsconfigPath: string;
  tsconfig: TsConfigJson;
  sourceType: JsSourceType;
}

export type ConfigLevel = keyof typeof configLevels;

/**
 *  This interface can be augmented in other configs via interface merging
 *  to provide correct typings for the `name` and `modifies` properties of `Config`.
 *  Use a property's name as a type of value to create a non-namespaced config's name;
 *  Use any other primitive value or union to create namespaced names.
 */
export interface ConfigNamespaces {
  core: 'core';
  common: ConfigLevel;
  node: 'node';
}

export type ConfigName = {
  [K in keyof ConfigNamespaces]: ConfigNamespaces[K] extends K ? K
  : `${K}/${ConfigNamespaces[K]}`;
}[keyof ConfigNamespaces];

export type ModifiesKey = ConfigName | '*';

export interface Config {
  readonly name: ConfigName;
  readonly modifies: readonly ModifiesKey[];
  readonly configs: readonly Linter.Config[];
  readonly level: ConfigLevel;
  readonly [eslintSymbol]: true;
}

export type CreateConfigOptions = Omit<
  SetOptional<Config, keyof typeof configDefaults>,
  typeof eslintSymbol
>;

export interface ConfigFactoryContext extends BaseContext {
  matchIncludes: (
    this: void,
    query: Readonly<QueryJsExtensionsParams>,
  ) => string[];
  createConfig: (this: void, options: CreateConfigOptions) => Config;
}

export interface ConfigFactory {
  (
    this: void,
    ctx: Readonly<ConfigFactoryContext>,
  ): Awaitable<Arrayable<Maybe<Config>>>;
}

export type ConfigFactoryCreate<TOptions extends object = EmptyObject> = (
  this: void,
  ...args: HasRequiredKeys<TOptions> extends true ?
    readonly [options: Readonly<TOptions>]
  : readonly [options?: Readonly<TOptions>]
) => ConfigFactory;

export interface PresetContext extends BaseContext {}

export type ResolvedPreset = ConfigFactory[];

export type PresetFactory = (
  ctx: Readonly<PresetContext>,
) => Awaitable<ResolvedPreset>;

export type Preset<TOptions extends object = EmptyObject> = (
  this: void,
  ...args: HasRequiredKeys<TOptions> extends true ?
    readonly [options: Readonly<TOptions>]
  : readonly [options?: Readonly<TOptions>]
) => PresetFactory;

export interface CreateFlatConfigEntry {
  tsconfigFile: string;
  presets?: PresetFactory[];
  configs?: ConfigFactory[];
}

export interface CreateFlatConfigParams {
  importMeta: ImportMeta;
  ignores?: readonly string[];
  lintWorkspaces?: boolean;
  inspectConfig?:
    | boolean
    | Readonly<NonNil<Parameters<typeof console.dir>[1]>>
    | ((configs: readonly Linter.Config[]) => void);
  entries: ReadonlyArray<Readonly<CreateFlatConfigEntry>>;
}
