import type { ConditionalExcept } from 'type-fest';

import type { Key, OmitNilProps, Value } from '@budsbox/lib-types/object';

import { isNotNil } from '#guards';

export function pick<T extends object, Keys extends PropertyKey = keyof T>(
  source: T,
  ...keys: readonly Keys[]
): Pick<T, Keys & keyof T>;
export function pick(
  source: Record<PropertyKey, unknown>,
  ...keys: readonly PropertyKey[]
): Record<PropertyKey, unknown> {
  return keys.reduce(
    (acc, key) =>
      Object.hasOwn(source, key) ? { ...acc, [key]: source[key] } : acc,
    {},
  );
}

export const pickStrict: <T extends object, Keys extends keyof T = keyof T>(
  source: T,
  ...keys: readonly Keys[]
) => Pick<T, Keys> = pick;

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

export const omitStrict: <TSource extends object, TKey extends keyof TSource>(
  source: TSource,
  ...keys: readonly TKey[]
) => Omit<TSource, TKey> = omit;

export function filterBy<T, K extends string, R extends T>(
  value: Partial<Record<K, T>>,
  test: (value: T) => value is R,
): ConditionalExcept<Record<K, T>, R>;
export function filterBy<T, K extends string, R extends T>(
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  value: Partial<Record<K, T>> | Record<K, T>,
  test: (value: T) => value is R,
): ConditionalExcept<Record<K, T>, R>;
export function filterBy<V extends object>(
  obj: V,
  filter: (value: V[keyof V], key: keyof V, obj: V) => boolean,
): Partial<V>;
export function filterBy(
  obj: object,
  filter: (value: unknown, key: PropertyKey, obj: object) => boolean,
): object {
  const newObj: Record<string, unknown> = {};

  for (const key in obj) {
    if (!Object.hasOwn(obj, key)) {
      break;
    }

    const value = (obj as Record<string, unknown>)[key];

    if (filter(value, key, obj)) {
      newObj[key] = value;
    }
  }

  return newObj;
}

export function omitNils<T extends object>(object: T): OmitNilProps<T> {
  return filterBy(object, isNotNil) as never;
}

export function reduce<U>(
  obj: Readonly<Record<string, unknown>>,
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
export function getKey(value: object): Key | undefined {
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
