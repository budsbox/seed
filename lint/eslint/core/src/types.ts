import type { configDefaults, coreSymbol } from './const.js';
import type {
  JsSourceType,
  QueryJsExtensionsParams,
} from '@budsbox/lib-extensions';
import type { Awaitable } from '@budsbox/lib-types';

import type { Linter } from 'eslint';
import type {
  HasRequiredKeys,
  PackageJson,
  SetOptional,
  TsConfigJson,
} from 'type-fest';

export interface BaseContext {
  importMeta: ImportMeta;
  packageJsonPath: string;
  packageJson: PackageJson;
  tsconfigPath: string;
  tsconfig: TsConfigJson;
  sourceType: JsSourceType;
}

/**
 *  This interface can be augmented in other configs via interface merging
 *  to provide correct typings for the `name` and `dependsOn` properties of Config.
 *  The local symbol is used as a value's type to prevent different configs using same name.
 */
export interface ConfigNameDict
  extends Record<
    'core' | 'common/strict' | 'common/opinionated',
    typeof coreSymbol
  > {}

export type ConfigName = keyof ConfigNameDict;

export type DependsOnKey = ConfigName | '*';

export interface Config {
  readonly name: ConfigName;
  readonly dependsOn: readonly DependsOnKey[];
  readonly configs: readonly Linter.FlatConfig[];
  readonly opinionated: boolean;
  readonly strict: boolean;
  readonly [coreSymbol]: true;
}

export type CreateConfigOptions = Omit<
  SetOptional<Config, keyof typeof configDefaults>,
  typeof coreSymbol
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
  ): Awaitable<Config[] | Config>;
}

export type ConfigFactoryCreate<TOptions extends object> = (
  this: void,
  ...args: HasRequiredKeys<TOptions> extends true ?
    [options: Readonly<TOptions>]
  : [options?: Readonly<TOptions>]
) => ConfigFactory;

export interface PresetOptions {
  tsconfigFile: string;
}

export interface PresetContext extends BaseContext {}

export type ResolvedPreset = ConfigFactory[];

export type PresetFactory = (
  ctx: Readonly<PresetContext>,
) => Awaitable<ResolvedPreset>;

export type Preset<TOptions extends PresetOptions = PresetOptions> = (
  this: void,
  params: Readonly<TOptions>,
) => PresetFactory;
