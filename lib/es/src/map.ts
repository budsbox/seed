/**
 * This module provides Map-related utilities, including a read-only Map implementation.
 *
 * @module
 * @importTarget ./map
 */

import type { Nil } from '@budsbox/lib-types';

/**
 * A read-only Map implementation that conforms to the `ReadonlyMap` interface.
 * This class provides a wrapper around `Map` to enforce immutability.
 *
 * @typeParam K - The type of keys maintained by this map.
 * @typeParam V - The type of mapped values.
 */
export class ROMap<K, V> extends Map<K, V> implements ReadonlyMap<K, V> {
  /**
   * Constructs a new instance of the class with an optional collection of entries.
   *
   * @param entries - An optional iterable object containing key-value pairs (tuples) to initialize the map.
   * If not provided or set to `Nil`, the map will be empty.
   * @typeParam K - The type of the keys in the map.
   * @typeParam V - The type of the values in the map.
   */
  public constructor(entries?: Iterable<readonly [K, V]> | Nil) {
    super(entries);
    createdMaps.add(this);
  }

  /**
   * Throws a `TypeError` exception because the map is read-only.
   *
   * @param args - The arguments to be passed to the `Map.set` method.
   * @returns This method does not return a value.
   * @throws {@link !TypeError} Indeed: map is read-only.
   * @privateRemarks It works as original `Map#set` when invoked from the constructor.
   */
  public override set(...args: readonly [key: K, value: V]): never {
    if (createdMaps.has(this)) {
      throw new TypeError(
        `Cannot set key ${String(args[0])}: map is read-only`,
      );
    }

    // reachable from constructor only
    return super.set(...args) as never;
  }

  /**
   * Throws a `TypeError` exception because the map is read-only.
   *
   * @param key - The key of the element to remove from the map.
   * @throws {@link !TypeError} Indeed: map is read-only.
   */
  public override delete(key: K): never {
    throw new TypeError(`Cannot delete key ${String(key)}: map is read-only`);
  }

  /**
   * Throws a `TypeError` exception because the map is read-only.
   *
   * @throws {@link !TypeError} Indeed: map is read-only.
   */
  public override clear(): never {
    throw new TypeError('Cannot clear map: map is read-only');
  }
}

const createdMaps = new WeakSet<ROMap<unknown, unknown>>();

/*
 * This approach is slightly unconventional, but it allows the class to serve as
 * a transparent implementation of the `ReadonlyMap` type.
 */
(
  [
    [ROMap, 'name'],
    [ROMap.prototype, Symbol.toStringTag],
  ] as const
).forEach(([obj, prop]) => {
  Object.defineProperty(obj, prop, {
    value: 'ReadonlyMap',
    configurable: true,
  });
});
