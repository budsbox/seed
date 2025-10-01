import type { TupleN } from '@budsbox/lib-types';

import type { FValue } from './types.js';

import { isFunction } from '#guards';

/**
 * Ensures that the provided value is returned as an array. If the value is already an array,
 * it is returned as-is. If the value is not an array, it is wrapped in a new array.
 *
 * @param value - The value to be checked and converted into an array if necessary.
 * @returns An array containing the original value or the original array if it was already an array.
 */
export function ensureArray<T>(value: T | T[]): T[];
// eslint-disable-next-line jsdoc/require-jsdoc
export function ensureArray<T>(value: readonly T[] | T): readonly T[];
export function ensureArray(value: unknown): unknown[] {
  return Array.isArray(value) ? (value as unknown[]) : [value];
}

/**
 * Creates an array of a fixed length with all elements initialized to the specified value.
 *
 * @param n - The length of the array to create.
 * @param value - The value to fill the array with. Defaults to `null`.
 * @returns A tuple of the specified length with all elements set to the given value.
 */
export function nArray<N extends number, T = null>(
  n: N,
  value?: FValue<number, T>,
): TupleN<N, T>;
export function nArray(n: number, value: unknown = null): unknown[] {
  // eslint-disable-next-line jsdoc/require-jsdoc
  if (isFunction<(n: number) => unknown>(value)) {
    const newArray: unknown[] = new Array(n);
    for (let i = 0; i < newArray.length; i++) {
      newArray[i] = value(i);
    }

    return newArray;
  }

  return new Array<unknown>(n).fill(value);
}

/**
 * Removes duplicate elements from the provided array while preserving the order of the first occurrence of each element.
 *
 * @param items - The array of items from which duplicates should be removed.
 *                The array is expected to be read-only and can contain elements of any type.
 * @returns A new array containing only the unique elements from the input array, in the order of their first occurrence.
 */
export const dedupe = <T>(items: readonly T[]): T[] =>
  Array.from(new Set(items));

/**
 * Creates an array of unique values from the combined elements of the input arrays.
 *
 * @param arrays - The arrays to be merged and deduplicated.
 * @returns An array containing unique elements from all input arrays.
 */
export function union<T>(...arrays: ReadonlyArray<readonly T[] | T>): T[] {
  return dedupe(arrays.flatMap((v) => v));
}

/**
 * Computes the intersection of multiple arrays, returning an array that contains
 * all elements that are present in every input array.
 *
 * @param arrays - A variadic parameter allowing multiple arrays or single elements.
 * Each array or element will be checked for intersection.
 * @returns An array containing elements that are present in all input arrays.
 */
export function intersection<T>(
  ...arrays: ReadonlyArray<readonly T[] | T>
): T[] {
  const { length } = arrays;
  const counters = new Map<T, number>();

  for (const array of arrays) {
    for (const item of ensureArray(array)) {
      const count = counters.get(item) ?? 0;
      counters.set(item, count + 1);
    }
  }

  return [...counters]
    .filter(([, count]) => count === length)
    .map(([item]) => item);
}

/**
 * Computes the difference between a source array and one or more arrays of exclusions.
 * Returns a new array containing elements from the source array that are not present in any of the exclusion arrays.
 *
 * @param source - The source array to compare against.
 * @param excludes - Arrays containing elements to be excluded from the source array.
 * @returns A new array containing elements from the source array that are not in the exclusion arrays.
 */
export function diff<T>(
  source: readonly T[],
  ...excludes: ReadonlyArray<readonly T[]>
): T[] {
  const set = new Set(excludes.flatMap((v) => v));
  return source.filter((v) => !set.has(v));
}
