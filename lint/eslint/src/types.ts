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

import type {
  configDefaults,
  configLevels,
  eslintSymbol,
  wildcard,
} from './const.js';

/**
 * Represents the base context containing essential metadata and configuration
 * needed for managing and processing a project or module.
 */
export interface BaseContext {
  /**
   * An `import.meta` object of the `eslint.config.js` module.
   */
  readonly importMeta: Readonly<ImportMeta>;
  /**
   * An absolute path to the `package.json` file of the linted project.
   */
  readonly packageJsonPath: string;
  /**
   * A parsed `package.json` file of the linted project.
   */
  readonly packageJson: PackageJson;
  /**
   * An absolute path to the `tsconfig.json` file specified for the current lint entry.
   */
  readonly tsconfigPath: string;
  /**
   * A compiled (i.e. printed using `tsc --showConfig`) and parsed version of the referenced `tsconfig.json` file
   * specified for the current lint entry.
   */
  readonly tsconfig: TsConfigJson;

  /**
   * The value of the `type` property from the `package.json` file of the linted project: `module` or `commonjs`.
   *
   * @see {@link https://nodejs.org/docs/latest-v22.x/api/packages.html#type}
   */
  readonly sourceType: JsSourceType;
}

/**
 * Represents a configuration level specified by the `level` property of the configuration options.
 * It is useful for filtering configurations.
 *
 * This type essentially maps directly to the keys of the `configLevels` object,
 * ensuring that only valid configurations defined within it can be used wherever this type is specified.
 */
export type ConfigLevel = keyof typeof configLevels;

/**
 * This interface can be extended in other configurations using interface merging
 * to provide accurate typings for the `name` and `modifies` properties of `Config`.
 * Use a property's name as its type to create a non-namespaced config name
 * (e.g. `core: 'core'` for `name: 'core'`).
 * Use any other primitive value or union to create namespaced names
 * (e.g. `builtin: ConfigLevel` for `name: 'builtin/basic'`, `name: 'builtin/recommended'`, etc.).
 *
 * @see {@link https://www.typescriptlang.org/docs/handbook/declaration-merging.html#merging-interfaces}
 */
export interface ConfigNameSpace {
  /* eslint-disable jsdoc/require-jsdoc */
  core: 'core';
  builtin: ConfigLevel;
  node: 'node';
  /* eslint-enable jsdoc/require-jsdoc */
}

/**
 * Represents a union type of string literals to be used as the `name` property of `Config`.
 *
 * This type is derived dynamically based on the structure of `ConfigNameSpace`.
 * For each key `K` in `ConfigNameSpace`:
 * - If the value of `ConfigNameSpace[K]` equals `K`, the result will simply be `K`.
 * - Otherwise, the result is a concatenated string in the format `${K}/${ConfigNameSpace[K]}`.
 */
export type ConfigName = {
  [K in keyof ConfigNameSpace]: ConfigNameSpace[K] extends K ? K
  : `${K}/${ConfigNameSpace[K]}`;
}[keyof ConfigNameSpace];

/**
 * Represents a type alias for items in the `modifies` property,
 * which accepts an array of either a specific configuration name or the wildcard symbol (`'*'`).
 */
export type ModifiesKey = ConfigName | typeof wildcard;

/**
 * Represents a configuration object that can be used to create a new ESLint configuration.
 */
export interface Config {
  /**
   * A unique name for the configuration.
   */
  readonly name: ConfigName;
  /**
   * An array of configuration names that this configuration modifies.
   *
   * @see {@link ConfigName}
   * @see {@link ModifiesKey}
   * @see {@link wildcard}
   */
  readonly modifies: readonly ModifiesKey[];
  /**
   * An array of ESLint configuration objects.
   */
  readonly configs: readonly Linter.Config[];
  /**
   * The level of the configuration.
   *
   * @see {@link ConfigLevel}
   */
  readonly level: ConfigLevel;
  /**
   * A non-enumerable symbol used to ensure that all the plugins use the same interface.
   */
  readonly [eslintSymbol]: true;
}

/**
 * Represents the options that can be passed to the `createConfig` function.
 */
export type CreateConfigOptions = Omit<
  SetOptional<Config, keyof typeof configDefaults>,
  typeof eslintSymbol
>;

/**
 * The `ConfigFactoryContext` interface extends the `BaseContext` and provides
 * methods for handling configuration creation and matching inclusion queries.
 *
 * @see {@link BaseContext}
 */
export interface ConfigFactoryContext extends BaseContext {
  /**
   * A function used to configure file matching logic based on TypeScript configuration settings.
   * This function processes the `tsconfig` object to determine include patterns, file extensions, and directories
   * relevant for file matching, then filters and resolves files and directories
   * based on the specified language and query parameters.
   *
   * @returns An array of matching file paths or glob patterns based on
   * the specified language and query parameters.
   * @param query - A query object for the `queryJsExtensions` function.
   * @see {@link QueryJsExtensionsParams}
   * @see {@link @budsbox/lib-extensions#queryJsExtensions}
   */
  matchIncludes: (
    this: void,
    query: Readonly<QueryJsExtensionsParams>,
  ) => string[];

  /**
   * Creates a configuration object based on the provided options.
   *
   * @param options - An object containing the configuration parameters
   *                  required to generate the resulting `Config` object.
   * @returns The generated configuration object.
   */
  createConfig: (this: void, options: CreateConfigOptions) => Config;
}

/**
 * Represents a factory function to generate configuration objects based on the provided context.
 *
 * @param ctx - A read-only context object passed to the factory, providing necessary contextual information.
 * @returns A Promise or immediate value that resolves to a single or an array of configuration objects.
 * The configuration objects can be undefined or null.
 */
export type ConfigFactory = (
  this: void,
  ctx: Readonly<ConfigFactoryContext>,
) => Awaitable<Arrayable<Maybe<Config>>>;

/**
 * A type representing a factory function for creating configuration objects.
 *
 * @typeParam TOptions - The type of the option object used for creating the configuration. Defaults to `EmptyObject`.
 * @remarks
 * - When `TOptions` has required keys, the `options` parameter must be passed to the factory function.
 * - When `TOptions` has no required keys, the `options` parameter can be omitted.
 * @param options - A read-only object containing configuration parameters used to create the `ConfigFactory`.
 * The type of this parameter (`TOptions`) adjusts based on whether the object has required keys.
 * @returns A `ConfigFactory` instance constructed using the provided options.
 */
export type ConfigFactoryCreate<TOptions extends object = EmptyObject> =
  HasRequiredKeys<TOptions> extends true ?
    // eslint-disable-next-line jsdoc/require-jsdoc
    (this: void, options: Readonly<TOptions>) => ConfigFactory
  : // eslint-disable-next-line jsdoc/require-jsdoc
    (this: void, options?: Readonly<TOptions>) => ConfigFactory;

/**
 * The `PresetContext` interface extends the `BaseContext` interface.
 * It serves as a foundational structure for defining the context
 * in which a preset is applied or operates.
 *
 * @see {@link BaseContext}
 */
export interface PresetContext extends BaseContext {}

/**
 * Represents the result of executing a preset factory:
 * an array of configuration factories.
 */
export type ResolvedPreset = ConfigFactory[];

/**
 * Represents a factory function type returned by a preset.
 * This function generates a new set of configuration factories using the provided context.
 *
 * @param ctx - A read-only context object that provides necessary information.
 * @returns A `Promise` resolving to an array of configuration factories, or the array directly.
 */
export type PresetFactory = (
  ctx: Readonly<PresetContext>,
) => Awaitable<ResolvedPreset>;

/**
 * Defines a configuration preset that allows optional customisation settings.
 *
 * A `Preset` is a callable type that acts as a factory producing a `PresetFactory`.
 * It can optionally accept an `options` object as an argument:
 * - If `TOptions` has any required properties, the `options` argument must be provided.
 * - If `TOptions` has no required properties, the `options` argument is optional.
 *
 * @typeParam TOptions - The structure of the configurable `options` object. Defaults to `EmptyObject` if not specified.
 * @param options - A read-only object of type `TOptions` containing configuration for the preset's behaviour.
 * @returns An instance of `PresetFactory` configured per the provided options.
 */
export type Preset<TOptions extends object = EmptyObject> =
  HasRequiredKeys<TOptions> extends true ?
    // eslint-disable-next-line jsdoc/require-jsdoc
    (this: void, options: Readonly<TOptions>) => PresetFactory
  : // eslint-disable-next-line jsdoc/require-jsdoc
    (this: void, options?: Readonly<TOptions>) => PresetFactory;

/**
 * Represent a single entrypoint for creating a flat ESLint configuration.
 *
 * @param tsconfigFile - The path to the `tsconfig.json` file to use for the configuration.
 * @param presets - An array of preset factories to apply to the configuration.
 * @param configs - An array of configuration factories to apply to the configuration.
 * @returns
 */
export interface CreateFlatConfigEntry {
  /**
   * The path (relative or absolute) to the `tsconfig.json` file to use for the configuration.
   */
  tsconfigFile: string;
  /**
   * An array of preset factories to apply to the configuration.
   */
  presets?: PresetFactory[];
  /**
   * An array of configuration factories to apply to the configuration.
   */
  configs?: ConfigFactory[];
}

/**
 * A callback function type used when inspecting the resulting flat ESLint configurations.
 *
 * @param configs - An array of readonly ESLint configuration objects.
 */
export type InspectConfigCallback = (configs: readonly Linter.Config[]) => void;

/**
 * Interface representing the parameters required to create a flat ESLint configuration.
 */
export interface CreateFlatConfigParams {
  /**
   * An `import.meta` object of the `eslint.config.js` module.
   */
  importMeta: ImportMeta;
  /**
   * This option configures "global" ignores for the entire flat config.
   */
  ignores?: readonly string[];
  /**
   * Set it to `true` to enable linting of sub-workspaces.
   */
  lintWorkspaces?: boolean;

  /**
   * Optional configuration for customising the inspection behaviour.
   *
   * This property can either enable a simple toggle with a boolean value, specify
   * detailed options for inspection when using `console.dir`, or define a custom
   * inspection logic through a callback function.
   *
   * - If `true`, a basic inspection (`console.log`) is enabled.
   * - If configured with an object, it's used as options (the second argument) for `console.dir`.
   * - If a function is provided, it will be invoked with an array of readonly ESLint configuration objects as its only argument.
   */
  inspectConfig?:
    | boolean
    | Readonly<NonNil<Parameters<typeof console.dir>[1]>>
    | InspectConfigCallback;
  /**
   * Represents a collection of flat configuration entries.
   */
  entries: ReadonlyArray<Readonly<CreateFlatConfigEntry>>;
}
