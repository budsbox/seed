import type { Def, FilteredByType, WithoutNilProps, Value } from './types.ts';

import { isNotNil } from './guards.ts';

export function filterBy<T, Key extends string, R extends T>(
  value: Partial<Record<Key, T>>,
  test: (value: T) => value is R,
): FilteredByType<Record<Key, T>, R>;
export function filterBy<T, Key extends string, R extends Def<T>>(
  value: Partial<Record<Key, T>>,
  test: (value: T) => value is R,
): FilteredByType<Record<Key, T>, R>;
export function filterBy<T, Key extends string, R extends T>(
  value: Record<Key, T>,
  test: (value: T) => value is R,
): FilteredByType<Record<Key, T>, R>;
export function filterBy<V extends object>(
  obj: V,
  filter: (value: V[keyof V], key: keyof V & string, obj: V) => boolean,
): Partial<V>;
export function filterBy<V extends object>(
  obj: V,
  filter: (value: V[keyof V], key: keyof V & string, obj: V) => boolean,
): Partial<V> {
  const newObj: Partial<V> = {};

  for (const key in obj) {
    if (!Object.hasOwn(obj, key)) {
      break;
    }

    const value = obj[key];

    if (filter(value, key, obj)) {
      newObj[key] = value;
    }
  }

  return newObj;
}

export function filterOutNilProps<T extends object>(
  object: T,
): WithoutNilProps<T> {
  return filterBy(object, isNotNil) as never;
}

export function reduce<U>(
  obj: Record<string, unknown>,
  callback: (
    previousValue: U,
    currentValue: Value<typeof obj>,
    currentKey: keyof typeof obj,
    object: typeof obj,
  ) => U,
  initialValue: Partial<U>,
): U {
  return Object.entries(obj).reduce<U>(
    (acc, [key, value]) => callback(acc, value, key, obj),
    initialValue,
  );
}

/**
 * Returns the first key of the given object.
 * Useful when working with objects that have only one key.
 *
 * @param value
 */

export function getKey<T extends string>(value: Record<T, unknown>): T;
export function getKey<T extends string>(
  value: Partial<Record<T, unknown>>,
): T | undefined;
export function getKey<T extends object>(value: T): keyof T;
export function getKey(value: object): keyof any | undefined {
  for (const key in value) {
    if (Object.hasOwn(value, key)) {
      return key;
    } else {
      /*
       Modern JS interpreters in the for..in loop
        first traverse the object's own properties,
        and then the inherited ones. Therefore, you can end the loop
        if the own property has never been encountered
       */
      break;
    }
  }

  return undefined;
}
