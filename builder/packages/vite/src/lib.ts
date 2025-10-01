import {
  type LibraryOptions,
  type UserConfigExport,
  type UserConfigFnPromise,
  mergeConfig,
} from 'vite';

import { isFunction, isNotNil } from '@budsbox/lib-es/guards';
import { fif } from '@budsbox/lib-es/logical';
import { camelCase, parsePackageName } from '@budsbox/lib-es/string';

/**
 * Creates a base configuration function that merges a provided base configuration
 * with a custom configuration. The result is a function that resolves and merges
 * both configurations based on the given environment.
 *
 * @param base - The base configuration, which can either be a `UserConfigExport` object
 * or a function that resolves to a `UserConfigExport` object based on the provided environment.
 * @returns A function that accepts a custom configuration of type `UserConfigExport`
 * and returns a promise-based configuration function (`UserConfigFnPromise`) that resolves
 * to a merged configuration.
 */
export function createBaseConfig(
  base: UserConfigExport,
): (custom?: UserConfigExport) => UserConfigFnPromise {
  return (custom) => async (env) => {
    const resolvedBase = await fif(
      await base,
      isFunction,
      (baseFn) => baseFn(env),
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
