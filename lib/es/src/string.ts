import type {
  CamelCase,
  DelimiterCase,
  KebabCase,
  PascalCase,
  SnakeCase,
} from 'type-fest';

import type { Nil } from '@budsbox/lib-types';

import type { ParsedPackageName } from './types.js';

import { isNil, isNotNil } from '#guards';

export type { ParsedPackageName };

/**
 * Parses a package name string to extract its scope and name.
 *
 * @param packageName - The full name of the package, potentially including a scope.
 * @param clean - A flag indicating whether to return a cleaned version (i.e., without a leading `@` and trailing `/`) of the scope. Defaults to false.
 * @returns An object containing the parsed scope and name of the package. The scope will be `null` if no scope is present.
 */
export function parsePackageName(
  packageName: string,
  clean: boolean = false,
): Required<ParsedPackageName> {
  const [scope, cleanScope] = /^@([^/]+)\//.exec(packageName) ?? [null, null];
  return {
    scope: clean ? cleanScope : scope,
    name: packageName.replace(scope ?? '', ''),
  };
}

/**
 * Converts a ParsedPackageName object into its string representation.
 *
 * @param parsedPackageName - An object representing the parsed package name with fields such as `scope` and `name`.
 * @returns The string representation of the package name, including the scope if it exists.
 */
export function stringifyPackageName(
  parsedPackageName: Readonly<ParsedPackageName>,
): string;
/**
 * Converts a parsed package name object or a Nil value into a string representation.
 *
 * @param parsedPackageName - A parsed package name object of type `ParsedPackageName` or a Nil value.
 * @param allowNil - A boolean flag specifying whether Nil values are allowed for conversion.
 * @returns The string representation of the package name if valid, or an empty string if `allowNil` is true and the input is Nil.
 */
export function stringifyPackageName(
  parsedPackageName: Readonly<ParsedPackageName> | Nil,
  allowNil: true,
): string;
export function stringifyPackageName(
  parsedPackageName: Readonly<ParsedPackageName> | Nil,
  allowNil: boolean = false,
): string {
  if (!allowNil && isNil(parsedPackageName)) {
    throw new TypeError('Expected a non-nil value');
  }
  const { scope, name } = parsedPackageName ?? { scope: null, name: '' };
  return joinPath(scope?.replace(/^@?/, '@'), name);
}

/**
 * Converts the provided value to a string representation suitable for debugging purposes.
 *
 * @param value - The value to be converted to its string representation. Can be of any type.
 * @returns A string representation of the input value.
 * If the value cannot be serialized using JSON.stringify, it falls back to using String conversion.
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
 */
export function joinPath(
  ...parts: ReadonlyArray<string | number | boolean | null | undefined>
): string {
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
 * Transforms a given string into camelCase format.
 *
 * @param str - The string to be converted to camelCase.
 * @returns The input string transformed into camelCase.
 */
export function camelCase<T extends string>(str: T): CamelCase<T>;
export function camelCase(name: string): string {
  return clampWS(name).replace(/[-_\s]+([^-_\s])/g, (_, suffix: string) =>
    suffix.toUpperCase(),
  );
}

/**
 * Converts a given string to PascalCase format.
 *
 * @param str - The string to be transformed into PascalCase.
 * @returns The transformed string in PascalCase format.
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
 */
export function delimCase<T extends string, D extends string>(
  name: T,
  delimiter: D,
): DelimiterCase<T, D>;
export function delimCase(name: string, delimiter = '-'): string {
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
 */
export function snakeCase<T extends string>(name: T): SnakeCase<T>;
export function snakeCase(name: string): string {
  return delimCase(name, '_');
}
