/**
 * Object utility functions for selecting, omitting, filtering, reducing, and
 * strongly-typing common object operations.
 *
 * @module
 * @importTarget ./object
 */

import type { ValueOf } from 'type-fest';

import type {
  AnyRecord,
  EntryUnion,
  OmitNilProps,
} from '@budsbox/lib-types/object';

import { isNotNil } from '#guards';

/**
 * Creates an object composed of the picked `source` properties.
 *
 * @param source - The source object.
 * @param keys - The property keys to pick.
 * @returns A new object with the picked properties.
 * @typeParam TSource - The type of the source object.
 * @typeParam TKeys - The type of the keys to pick.
 */
export function pick<
  TSource extends object,
  TKeys extends PropertyKey = keyof TSource,
>(
  source: TSource,
  ...keys: readonly TKeys[]
): Pick<TSource, TKeys & keyof TSource>;
export function pick(
  source: Readonly<Record<PropertyKey, unknown>>,
  ...keys: readonly PropertyKey[]
): Record<PropertyKey, unknown> {
  return keys.reduce(
    (acc, key) =>
      Object.hasOwn(source, key) ? { ...acc, [key]: source[key] } : acc,
    {},
  );
}

/**
 * A strict version of {@link pick} that restricts keys to those present in `TSource`.
 *
 * @param source - The source object.
 * @param keys - The property keys to pick.
 * @returns A new object with the picked properties.
 * @typeParam TSource - The type of the source object.
 * @typeParam Keys - The type of the keys to pick, restricted to keys of `TSource`.
 */
export const pickStrict: <
  TSource extends object,
  Keys extends keyof TSource = keyof TSource,
>(
  source: TSource,
  ...keys: readonly Keys[]
) => Pick<TSource, Keys> = pick;

/**
 * The opposite of {@link pick}; this method creates an object
 * composed of the own enumerable string keyed properties of `source` that are not omitted.
 *
 * @param source - The source object.
 * @param keys - The property keys to omit.
 * @returns A new object without the omitted properties.
 * @typeParam T - The type of the source object.
 * @typeParam K - The type of the keys to omit.
 */
export function omit<T extends object, K extends PropertyKey>(
  source: T,
  ...keys: readonly K[]
): Omit<T, K>;
export function omit(source: object, ...keys: readonly PropertyKey[]): object {
  const keySet = new Set(keys);

  return Object.fromEntries(
    Object.entries(source).filter(([key]) => !keySet.has(key)),
  );
}

/**
 * A strict version of {@link omit} that restricts keys to those present in `TSource`.
 *
 * @param source - The source object.
 * @param keys - The property keys to omit.
 * @returns A new object without the omitted properties.
 * @typeParam TSource - The type of the source object.
 * @typeParam TKey - The type of the keys to omit, restricted to keys of `TSource`.
 */
export const omitStrict: <TSource extends object, TKey extends keyof TSource>(
  source: TSource,
  ...keys: readonly TKey[]
) => Omit<TSource, TKey> = omit;

/**
 * Iterates over own enumerable string keyed properties of an object and returns a new object
 * with all properties that pass `test`.
 *
 * @param obj - The object to filter.
 * @param test - The function invoked per iteration.
 * @returns A new object containing properties that satisfy the predicate.
 * @typeParam TSource - The type of the source object.
 */
export function filter<TSource extends object>(
  obj: TSource,
  test: (value: ValueOf<TSource>, key: keyof TSource, obj: TSource) => boolean,
): Partial<TSource>;

export function filter(
  obj: object,
  test: (value: unknown, key: PropertyKey, obj: object) => boolean,
): object {
  const newObj: Record<string, unknown> = {};

  for (const key in obj) {
    if (!Object.hasOwn(obj, key)) {
      break;
    }

    const value = (obj as Record<string, unknown>)[key];

    if (test(value, key, obj)) {
      newObj[key] = value;
    }
  }

  return newObj;
}

/**
 * Returns a new object with all `null` or `undefined` properties removed using {@link filter} and {@link isNotNil}.
 *
 * @param object - The object to strip of nils.
 * @returns A new object without nil properties.
 * @typeParam T - The type of the source object.
 */
export function omitNils<T extends object>(object: T): OmitNilProps<T> {
  return filter(object, isNotNil) as never;
}

/**
 * Transforms the values of an object using the provided callback function.
 *
 * @param object - The source object whose values are to be transformed.
 * @param callback - A function that is called for each key-value pair in the source object.
 * It receives the value, key, and the original object as arguments and returns the transformed value.
 * @returns A new object with the same keys as the source object but with values transformed by the callback function.
 * @typeParam TSource - The type of the source object.
 * @typeParam TValue - The type of the transformed values in the resulting object.
 */
export const map = <TSource extends AnyRecord, TValue>(
  object: TSource,
  callback: (
    value: ValueOf<TSource>,
    key: keyof TSource,
    object: TSource,
  ) => TValue,
): Record<keyof TSource, TValue> => {
  return reduce(
    object,
    (acc, value, key, obj) => {
      acc[key] = callback(value, key, obj);
      return acc;
    },
    {},
  );
};

/**
 * Reduces `obj` to a value which is the accumulated result of running each element in `obj`
 * through `callback`.
 *
 * @param obj - The object to iterate over.
 * @param callback - The function invoked per iteration.
 * @param initialValue - The initial value of the accumulation.
 * @returns The accumulated value.
 * @typeParam TSource - The type of the source object.
 * @typeParam TResult - The type of the accumulated result.
 */
export function reduce<TSource extends object, TResult>(
  obj: TSource,
  callback: (
    previousValue: TResult,
    currentValue: ValueOf<TSource>,
    currentKey: keyof TSource,
    object: TSource,
  ) => TResult,
  initialValue: Partial<TResult>,
): TResult;
export function reduce(
  source: object,
  callback: (
    previousValue: unknown,
    currentValue: unknown,
    currentKey: PropertyKey,
    source: object,
  ) => unknown,
  initialValue: unknown,
): unknown {
  return Object.entries(source).reduce(
    (acc, [key, value]) => callback(acc, value, key, source),
    initialValue,
  );
}

/**
 * Returns an array of a given object's own enumerable string-keyed property [key, value] pairs, typed as {@link EntryUnion}.
 *
 * @param source - The object whose entries are to be returned.
 * @returns An array of entry tuples.
 * @typeParam T - The type of the source object.
 */
export const entries = <T extends object>(source: T): Array<EntryUnion<T>> =>
  Object.entries(source) as Array<EntryUnion<T>>;
