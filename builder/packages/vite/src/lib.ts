import type { Awaitable, Undef } from '@budsbox/lib-types';

import {
  type ConfigEnv,
  type LibraryOptions,
  type UserConfig,
  type UserConfigExport,
  type UserConfigFnPromise,
  mergeConfig,
} from 'vite';

import { isFunction, isNotNil } from '@budsbox/lib-es/guards';
import { fif } from '@budsbox/lib-es/logical';
import { camelCase, parsePackageName } from '@budsbox/lib-es/string';

/**
 * Represents a custom user configuration function used to generate Vite configuration.
 *
 * @typeParam TOptions - The type of the custom options object, with a default to `object`.
 * @param viteEnv - A readonly object representing the Vite configuration environment.
 * @param options - An optional readonly object representing additional custom configuration options.
 * @returns A promise or value containing the generated Vite user configuration.
 */
export type CustomUserConfigFn<TOptions extends object = object> = (
  viteEnv: Readonly<ConfigEnv>,
  options?: Undef<Readonly<TOptions>>,
) => Awaitable<UserConfig>;

/**
 * A `ConfigFactory` is a function type that generates an asynchronous Vite's configuration object generator function.
 *
 * @param custom - An optional custom configuration of type `UserConfigExport`. It can be used
 * to override or extend default configurations.
 * @returns A function to be invoked by Vite to generate the final configuration object.
 */
export type ConfigFactory = (custom?: UserConfigExport) => UserConfigFnPromise;

/**
 * A `ConfigFactory` is a function type that generates an asynchronous Vite's configuration object generator function.
 *
 * @param custom - An optional custom configuration of type `UserConfigExport`. It can be used
 * to override or extend default configurations.
 * @param options - An optional object containing additional configuration options, specific to the factory.
 * @returns A function to be invoked by Vite to generate the final configuration object.
 */
export type ConfigFactoryWithOptions<TOptions extends object> = (
  custom?: UserConfigExport,
  options?: Readonly<Partial<TOptions>>,
) => UserConfigFnPromise;

/**
 * Creates a configuration factory that extends or modifies a base configuration.
 *
 * @param base - A custom user configuration function that defines the base options.
 * @returns A configuration factory function that accepts a custom config and an options object to customize or extend the base configuration.
 */
export function createConfigFactory<TOptions extends object>(
  base: CustomUserConfigFn<TOptions>,
): ConfigFactoryWithOptions<TOptions>;
/**
 * Creates a configuration factory function that merges a base configuration with a custom configuration.
 *
 * @param base - The base configuration to be used as the default.
 * @returns A function that accepts an optional custom configuration and returns a promise resolving to the merged configuration function.
 */
export function createConfigFactory(
  base: UserConfigExport,
): (custom?: UserConfigExport) => UserConfigFnPromise;
export function createConfigFactory(
  base: CustomUserConfigFn | UserConfigExport,
  // eslint-disable-next-line jsdoc/require-jsdoc
): (custom?: UserConfigExport, options?: object) => UserConfigFnPromise {
  return (custom, options) => async (env) => {
    const resolvedBase = await fif(
      await base,
      isFunction,
      (baseFn) => baseFn(env, options),
      (baseObj) => baseObj,
    );
    const resolvedCustom = await fif(
      await custom,
      isFunction,
      (customFn) => customFn(env),
      (customObj) => customObj,
    );

    return mergeConfig(resolvedBase, resolvedCustom ?? {});
  };
}

/**
 * Formats a package name into a standardized string format, suitable for use as a variable name.
 *
 * @param packageName - The full package name to be formatted. This can have an optional scope
 * and a package name separated by a forward slash.
 * @returns A formatted variable name string composed of the camelCase scope (if present),
 * the processed package name segments using camelCase, separated by a dollar sign ('$').
 */
export const formatVarName = (packageName: string): string => {
  const { scope, name } = parsePackageName(packageName, true);
  return [
    isNotNil(scope) ? camelCase(scope) : null,
    name.split('_').map(camelCase).join('_'),
  ]
    .filter(isNotNil)
    .join('$');
};

/**
 * Generates a formatted file name based on the provided library format.
 *
 * @param format - The library format to generate the file name for. It determines the file extension.
 * @param entryName - The name of the entry point file, used to generate the file name.
 * @returns The generated file name in the format `{format}.{extension}`,
 *          where the extension is either `mjs` for `es` format or `cjs` for other formats.
 */
export const formatFileName: Exclude<
  LibraryOptions['fileName'],
  string | undefined
> = (format, entryName): string =>
  `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`;
