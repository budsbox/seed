/* eslint-disable jsdoc/informative-docs */

/**
 * This module provides string utility functions for common operations like case conversion, trimming, splitting, etc.
 *
 * @module
 * @importTarget ./string
 * @showCategories
 * @categoryDescription Package Name
 * This category contains functions for manipulating and formatting names of packages.
 * @categoryDescription Casing
 * This category contains functions for converting strings to different casing formats.
 * @categoryDescription Paths
 * This category contains functions for manipulating and formatting paths.
 */

import type {
  CamelCase,
  DelimiterCase,
  KebabCase,
  PascalCase,
  SnakeCase,
} from 'type-fest';

import type { Nil, Undef } from '@budsbox/lib-types';

import type { PackageNameFormatOptions, ParsedPackageName } from './types.js';

import {
  assertArray,
  assertBoolean,
  assertNotNil,
  assertObject,
  assertOptionalProp,
  assertProp,
  assertSome,
  assertString,
  isBoolean,
  isNil,
  isNotNil,
  isNumber,
  isObject,
  isString,
  isUndef,
  somePredicate,
} from '#guards';
import { joinWithConjunction as _joinWithConjunction } from '#guards/format';

export type { PackageNameFormatOptions, ParsedPackageName };

/**
 * Parses a package name string to extract its scope and name.
 *
 * @param packageName - The full name of the package, potentially including a scope.
 * @param clean - A flag indicating whether to return a cleaned version (i.e., without a leading `@` and trailing `/`) of the scope. Defaults to false.
 * @returns An object containing the parsed scope and name of the package. The scope will be `null` if no scope is present.
 * @category Package Name
 */
export function parsePackageName(
  packageName: string,
  clean: boolean = false,
): Required<ParsedPackageName> {
  assertString(packageName, 'packageName');
  assertBoolean(clean, 'clean');
  const [scope, cleanScope] = /^@([^/]+)\//.exec(packageName) ?? [null, null];
  return {
    scope: clean ? cleanScope : scope,
    name: packageName.replace(scope ?? '', ''),
  };
}

function normalizePackageName(
  ident: string | Readonly<ParsedPackageName>,
  clean?: boolean,
): Required<ParsedPackageName> {
  assertSome(ident, 'ident', isString, isObject);

  if (isObject(ident)) {
    assertProp(ident, 'name', isString);
    assertOptionalProp(ident, 'scope', somePredicate(isString, isNil));
    return {
      ...ident,
      scope: ident.scope ?? null,
    };
  }

  return parsePackageName(ident, clean);
}

/**
 * Converts a ParsedPackageName object into its string representation.
 *
 * @param parsedPackageName - An object representing the parsed package name with fields such as `scope` and `name`.
 * @returns The string representation of the package name, including the scope if it exists.
 * @category Package Name
 */
export function serializePackageName(
  parsedPackageName: Readonly<ParsedPackageName>,
): string;

/**
 * Converts a parsed package name object or a Nil value into a string representation.
 *
 * @param parsedPackageName - A parsed package name object of type `ParsedPackageName` or a Nil value.
 * @param allowNil - A boolean flag specifying whether Nil values are allowed for conversion.
 * @returns The string representation of the package name if valid, or an empty string if `allowNil` is true and the input is Nil.
 * @category Package Name
 */
export function serializePackageName(
  parsedPackageName: Nil | Readonly<ParsedPackageName>,
  allowNil: true,
): string;
export function serializePackageName(
  parsedPackageName: Nil | Readonly<ParsedPackageName>,
  allowNil: boolean = false,
): string {
  if (!allowNil) {
    assertNotNil(parsedPackageName, 'parsedPackageName');
  }
  const { scope, name } = normalizePackageName(
    parsedPackageName ?? { scope: null, name: '' },
  );
  return joinPath(scope?.replace(/^@?/, '@'), name);
}

/**
 * Resolves the package name based on the provided identifier and options.
 * Can return either a string representing the package name or a parsed package name object.
 *
 * @param ident - The package identifier, either as a string or a parsed package name object.
 * @param options - Optional settings to modify the resolution behavior.
 *                  Includes an optional `baseScope` to use as a default scope and a `parsed` flag
 *                  to indicate whether the result should be returned as a parsed package name object.
 * @returns The resolved package name as a string if `parsed` is false or not specified,
 *         or as a `ParsedPackageName` object if `parsed` is true.
 * @typeParam TParsed - Controls the return type: when `true`, returns `ParsedPackageName`; when `false` (default), returns `string`.
 * @category Package Name
 */
export function resolvePackageName<TParsed extends boolean = false>(
  ident: string | Readonly<ParsedPackageName>,
  options?: Readonly<{ baseScope?: Undef<string>; parsed?: TParsed }>,
): TParsed extends true ? ParsedPackageName : string;
export function resolvePackageName(
  ident: string | Readonly<ParsedPackageName>,
  {
    baseScope,
    parsed = false,
  }: { baseScope?: Undef<string>; parsed?: boolean } = {},
): string | ParsedPackageName {
  const { scope, name } = normalizePackageName(ident);

  const parsedIdent: ParsedPackageName = {
    scope: scope ?? baseScope ?? null,
    name,
  };

  return parsed ? parsedIdent : serializePackageName(parsedIdent);
}

/**
 * Formats a package name by combining the base name with processed parent and directory path details.
 *
 * @param base - The base name of the package, without the scope or any prefixes.
 * @param options - An object providing configuration options for formatting the package name.
 * @param options.root - The root identifier for the package. Defaults to `null`.
 * @param options.parent - The parent package name. Defaults to the value of `root`.
 * @param options.relCwd - The path to the package, relative to its parent. Defaults to an empty string.
 * @param options.pathDelimiter - The delimiter used to separate path chunks. Defaults to `'-'`.
 * @param options.nameDelimiter - The delimiter used to separate parents name from the base name of the package. Defaults to `'_'`.
 * @param options.excludePathChunks - Array of path chunks to be excluded when constructing the path. Defaults to `['packages']`.
 * @returns The formatted package name as a string.
 * @category Package Name
 */
export function formatPackageName(
  base: string,
  options: Readonly<PackageNameFormatOptions> = {},
): string {
  assertString(base, 'base');
  assertObject(options, 'options');
  (['root', 'parent'] as const).forEach((key) => {
    assertOptionalProp(options, key, somePredicate(isString, isNil), 'options');
  });
  (['relCwd', 'pathDelimiter', 'nameDelimiter'] as const).forEach((key) => {
    assertOptionalProp(
      options,
      key,
      somePredicate(isString, isUndef),
      'options',
    );
  });

  const {
    root = null,
    parent = root,
    relCwd = '',
    pathDelimiter = '-',
    nameDelimiter = '_',
    excludePathChunks = ['packages'],
  } = options;
  assertArray(excludePathChunks, isString, 'excludePathChunks');

  [
    ['relCwd', relCwd],
    ['pathDelimiter', pathDelimiter],
    ['nameDelimiter', nameDelimiter],
  ].forEach(([name, value]) => void assertString(value, name));
  assertArray(excludePathChunks, isString, 'options.excludePathChunks');

  const topLevel = parent === root;
  const exclude = new Set(excludePathChunks);
  const pathChunks = splitPath(relCwd).filter((chunk) => !exclude.has(chunk));
  if (pathChunks.at(-1) === base) {
    pathChunks.pop();
  }
  const { scope, name: parentName } = normalizePackageName(parent ?? '');

  return serializePackageName({
    scope,
    name: [
      ...(topLevel ? [] : [parentName]),
      [...pathChunks, base].join(pathDelimiter),
    ].join(nameDelimiter),
  });
}

/**
 * Converts the provided value to a string representation suitable for debugging purposes.
 *
 * @param value - The value to be converted to its string representation. Can be of any type.
 * @returns A string representation of the input value.
 * If the value cannot be serialized using JSON.stringify, it falls back to using String conversion.
 * @deprecated Use `formatDebugValue` from `@budsbox/lib-es/guards` instead.
 */
export function debugString(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/**
 * Trims leading and trailing whitespace from the input string and collapses
 * multiple consecutive whitespace characters into a single space.
 *
 * @param str - The input string to be processed.
 * @returns The processed string with trimmed and normalized whitespace.
 */
export function clampWS(str: string): string {
  assertString(str, 'str');
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Joins multiple parts of a path into a single string.
 * It ensures that there are no duplicate slashes between the parts
 * and trims leading/trailing slashes where necessary.
 *
 * @param parts - An array of path parts to join. Each part can be a string, number, boolean, null, or undefined.
 * Non-string values will be serialized, and null/undefined values are ignored.
 * @returns The combined path as a single string, with proper slash formatting.
 * @category Paths
 */
export function joinPath(
  ...parts: ReadonlyArray<boolean | number | string | null | undefined>
): string {
  assertArray(
    parts,
    somePredicate(isString, isNumber, isBoolean, isNil),
    'parts',
  );
  return parts
    .filter(isNotNil)
    .reduce<string>(
      (acc, part) =>
        acc.length === 0 ?
          String(part)
        : `${acc.replace(/\/+$/, '')}/${String(part).replace(/^\/+/, '')}`,
      '',
    );
}

/**
 * Splits a given Unix-like path into an array of its components based on the "/" delimiter.
 * Optionally keeps empty chunks in the result.
 *
 * @param path - The file path to be split into an array of components.
 * @param keepEmptyChunks - A boolean indicating whether empty strings (resulting from consecutive delimiters)
 * should be preserved in the output array. Defaults to `false`.
 * @returns An array of strings representing the components of the path.
 * @category Paths
 */
export function splitPath(path: string, keepEmptyChunks = false): string[] {
  assertString(path, 'path');
  assertBoolean(keepEmptyChunks, 'keepEmptyChunks');
  const splitted = path.split(keepEmptyChunks ? '/' : /\/+/);
  return keepEmptyChunks ? splitted : (
      splitted.filter((chunk) => chunk.length > 0)
    );
}

/**
 * Transforms a given string into camelCase format.
 *
 * @param str - The string to be converted to camelCase.
 * @returns The input string transformed into camelCase.
 * @typeParam T - The input string type; used to derive the resulting `CamelCase<T>` type.
 * @category Casing
 */
export function camelCase<T extends string>(str: T): CamelCase<T>;
export function camelCase(name: string): string {
  assertString(name, 'name');
  return clampWS(name).replace(/[-_\s]+([^-_\s])/g, (_, suffix: string) =>
    suffix.toUpperCase(),
  );
}

/**
 * Converts a given string to PascalCase format.
 *
 * @param str - The string to be transformed into PascalCase.
 * @returns The transformed string in PascalCase format.
 * @typeParam T - The input string type; used to derive the resulting `PascalCase<T>` type.
 * @category Casing
 */
export function pascalCase<T extends string>(str: T): PascalCase<T>;
export function pascalCase(name: string): string {
  return camelCase(name).replace(/^./, (c) => c.toUpperCase());
}

/**
 * Converts a given string to a delimited case using the specified delimiter.
 *
 * @param name - The input string that will be converted to the delimited case.
 * @param delimiter - The character or string to use as a delimiter in the transformed output.
 * @returns The input string transformed into the delimited case format using the given delimiter.
 * @typeParam T - The input string type; used to derive the resulting `DelimiterCase<T, D>` type.
 * @typeParam D - The delimiter string type used to separate words in the result.
 * @category Casing
 */
export function delimCase<T extends string, D extends string>(
  name: T,
  delimiter: D,
): DelimiterCase<T, D>;
export function delimCase(name: string, delimiter = '-'): string {
  assertString(name, 'name');
  assertString(delimiter, 'delimiter');
  return clampWS(name)
    .replace(/(.)([A-Z])/g, `$1${delimiter}$2`)
    .replace(/[-_\s]+/g, delimiter)
    .toLowerCase();
}

/**
 * Converts a given string to kebab-case format.
 *
 * @param name - The string input to be converted to kebab-case. The input should be a string type.
 * @returns The transformed string in kebab-case format.
 * @typeParam T - The input string type; used to derive the resulting `KebabCase<T>` type.
 * @category Casing
 */
export function kebabCase<T extends string>(name: T): KebabCase<T>;
export function kebabCase(name: string): string {
  return delimCase(name, '-');
}

/**
 * Converts a given string to snake_case format.
 *
 * @param name - The string to be converted to snake_case.
 * @returns The converted string in snake_case format.
 * @typeParam T - The input string type; used to derive the resulting `SnakeCase<T>` type.
 * @category Casing
 */
export function snakeCase<T extends string>(name: T): SnakeCase<T>;
export function snakeCase(name: string): string {
  return delimCase(name, '_');
}

/**
 * Joins an array of strings into a single formatted string using the specified conjunction.
 *
 * @param items - An array of strings to be joined. If the array is empty, an empty string is returned.
 * @param conjunction - A word or phrase (`and` or `or`) to be used as the conjunction between the last two items.
 * @returns A formatted string where the items are separated by commas and the conjunction is added before the final item.
 */
export function joinWithConjunction(
  items: readonly string[],
  conjunction: string,
): string {
  assertArray(items, isString, 'items');
  assertString(conjunction, 'conjunction');

  return _joinWithConjunction(items, conjunction);
}
