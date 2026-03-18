import type { PackageJson } from 'type-fest';

import type { ResolvedJson } from '@budsbox/lib-node/pckg';

import type {
  ConfigFactoryWithOptions,
  CustomUserConfigFn,
  ScopedNameGenerator,
} from './types.js';

import { readFileSync } from 'node:fs';
import { basename, dirname, relative } from 'node:path';

import cssesc from 'cssesc';
import {
  type LibraryOptions,
  type UserConfigExport,
  type UserConfigFnPromise,
  mergeConfig,
} from 'vite';

import { createCachedFn } from '@budsbox/lib-es/function';
import { isFunction, isNil, isNotNil, isString } from '@budsbox/lib-es/guards';
import { fif } from '@budsbox/lib-es/logical';
import { camelCase, parsePackageName, splitPath } from '@budsbox/lib-es/string';
import { lookupFileSync } from '@budsbox/lib-node/fs';

/**
 * Creates a configuration factory that extends or modifies a base configuration.
 *
 * @param base - A custom user configuration function that defines the base options.
 * @returns A configuration factory function that accepts a custom config and an options object to customize or extend the base configuration.
 * @typeParam TOptions - The type of options accepted by the custom user configuration function.
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

/**
 * Factory function for creating a `ScopedNameGenerator` that generates scoped,
 * unique CSS class names based on file paths, package details, and additional rules.
 *
 * @param basePackage - The resolved package.json of the base package as a read-only object.
 *   This package serves as the reference point for relative path calculations and scoping.
 * @param excludePathChunks - An optional array of path chunks to exclude from being used in
 *   generated scoped names. Defaults to ['src', 'dist', 'build', 'node_modules'].
 * @returns A `ScopedNameGenerator` function that takes a local CSS class name and a file path
 *   as input and returns a generated scoped name.
 */
export const generateScopedNameFactory = (
  basePackage: Readonly<ResolvedJson<PackageJson>>,
  excludePathChunks: readonly string[] = [
    'src',
    'dist',
    'build',
    'node_modules',
  ],
): ScopedNameGenerator => {
  const excludeSet = new Set(excludePathChunks);
  const { scope: baseScope } = parsePackageName(
    basePackage.json.name ?? 'anon',
    true,
  );

  const lookupCache = new Map<string, string>();
  const packageCache = new Map<string, PackageJson>();
  const scopedNameCache = new Map<string, string>();

  const scopedNameGenerator: ScopedNameGenerator = (localName, filepath) => {
    const foundPath = lookupFileSync({
      startDir: dirname(filepath),
      filename: 'package.json',
      cache: lookupCache,
    });

    let pckgPrefix = '';
    if (isString(foundPath)) {
      if (foundPath !== basePackage.path) {
        const pckg = readPackageJson(packageCache, foundPath);
        const { scope, name } = parsePackageName(pckg.name ?? '', true);
        pckgPrefix =
          scope === baseScope || isNil(scope) ? name : `${scope}_-_${name}`;
      }
    } else {
      pckgPrefix = '-standalone-';
    }

    const subPath = relative(dirname(foundPath ?? basePackage.path), filepath);
    const pathPart = splitPath(dirname(subPath))
      .map((chunk) => (chunk === '..' ? '_--_' : chunk))
      .filter((chunk) => !excludeSet.has(chunk))
      .join('-');

    const nameChunks = basename(filepath)
      .split('.')
      // remove extension
      .slice(0, -1);
    // remove `module` sub-extension
    if (nameChunks.at(-1) === 'module') {
      nameChunks.pop();
    }
    // remove common filename
    if (nameChunks.at(-1) === 'style') {
      nameChunks.pop();
    }

    return cssesc(
      [
        pckgPrefix,
        [pathPart, nameChunks.join('-')].filter(Boolean).join('_'),
        localName,
      ]
        .filter(Boolean)
        .join('__'),
    );
  };

  const cached = createCachedFn(scopedNameGenerator, (...args) =>
    args.join(':'),
  );

  const generateScopedName: ScopedNameGenerator = (localName, filepath) =>
    cached(scopedNameCache, localName, filepath);

  return generateScopedName;
};

const readPackageJson = createCachedFn((path: string): PackageJson => {
  if (!path.endsWith('package.json'))
    throw new Error(`Not a package.json path: ${path}`);
  return JSON.parse(readFileSync(path, 'utf-8')) as PackageJson;
});
