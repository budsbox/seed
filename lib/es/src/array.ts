import type { FValue, TupleN } from '@budsbox/lib-types';

import {
  assertArray,
  assertEvery,
  isArray,
  isFunction,
  isInteger,
  isNonNegative,
  isNumber,
} from '#guards';

/**
 * @module
 *
 * Array utility functions for common operations like deduplication, union, intersection, and difference.
 */

/**
 * {@label MUTABLE} Returns the value as an array. If already an array, returns it as-is; otherwise wraps it.
 *
 * @param value - The value to convert.
 * @returns An array containing the value.
 * @typeParam T - The element type.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export function ensureArray<T>(value: T | T[]): T[];

/**
 * {@label READONLY} Returns the value as an array. If already an array, returns it as-is; otherwise wraps it.
 *
 * @param value - The value to convert.
 * @returns An array containing the value.
 * @typeParam T - The element type.
 */
export function ensureArray<T>(value: readonly T[] | T): readonly T[];

export function ensureArray(value: unknown): unknown[] {
  return Array.isArray(value) ? (value as unknown[]) : [value];
}

/**
 * Creates a fixed-length array filled with a value or computed by a function.
 *
 * @param n - The desired array length.
 * @param value - The fill value or a function that receives the index and returns the element value. Defaults to `null`.
 * @returns A tuple of length N with all elements set to the value or computed result.
 * @typeParam N - The array length.
 * @typeParam T - The element type.
 */
export function nArray<N extends number, T = null>(
  n: N,
  value?: FValue<number, T>,
): TupleN<N, T>;
export function nArray(n: number, value: unknown = null): unknown[] {
  assertEvery(n, 'n', isNumber, isNonNegative, isInteger);
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
 * Removes duplicate elements from an array, preserving the order of the first occurrence.
 *
 * @param items - The array to deduplicate.
 * @returns A new array with unique elements in their original order.
 * @typeParam T - The element type.
 */
export const dedupe = <T>(items: readonly T[]): T[] => {
  assertArray(items, 'items');
  return Array.from(new Set(items));
};

/**
 * Creates an array of unique values from multiple input arrays.
 *
 * @param arrays - Arrays or individual elements to merge.
 * @returns A new array containing unique elements from all inputs.
 * @typeParam T - The element type.
 */
export function union<T>(...arrays: ReadonlyArray<readonly T[] | T>): T[] {
  return dedupe(arrays.flatMap((v) => v));
}

/**
 * Returns elements present in all input arrays.
 *
 * @param arrays - Arrays or individual elements to intersect.
 * @returns A new array containing elements common to all inputs.
 * @typeParam T - The element type.
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
 * Returns elements from the source array that are not in any exclusion arrays.
 *
 * @param source - The source array.
 * @param excludes - Arrays of elements to exclude.
 * @returns A new array with excluded elements removed.
 * @typeParam T - The element type.
 */
export function diff<T>(
  source: readonly T[],
  ...excludes: ReadonlyArray<readonly T[]>
): T[] {
  assertArray(excludes, isArray, 'excludes');
  const set = new Set(excludes.flatMap((v) => v));
  return source.filter((v) => !set.has(v));
}
