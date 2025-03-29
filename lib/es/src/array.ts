/**
 * Ensures that the provided value is returned as an array. If the value is already an array,
 * it is returned as-is. If the value is not an array, it is wrapped in a new array.
 *
 * @param value - The value to be checked and converted into an array if necessary.
 * @return An array containing the original value or the original array if it was already an array.
 */
export function ensureArray<T>(value: T | readonly T[]): readonly T[];
export function ensureArray<T>(value: T | T[]): T[];
export function ensureArray(value: unknown): unknown[] {
  return Array.isArray(value) ? (value as unknown[]) : [value];
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
 * @return An array containing unique elements from all input arrays.
 */
export function union<T>(...arrays: ReadonlyArray<T | readonly T[]>): T[] {
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
  ...arrays: ReadonlyArray<T | readonly T[]>
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
 * Computes the difference between two arrays by returning elements that are present in the first array but not in the second array.
 *
 * @param a - The first array to compare.
 * @param b - The second array to compare with the first array.
 * @return An array containing the elements that are in the first array but not in the second array.
 */
export function diff<T>(a: readonly T[], b: readonly T[]): T[] {
  const set = new Set(b);
  return a.filter((v) => !set.has(v));
}
