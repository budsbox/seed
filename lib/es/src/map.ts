import type { Nil } from '@budsbox/lib-types';

/**
 * A read-only Map implementation that conforms to the `ReadonlyMap` interface.
 * This class provides a wrapper around `Map` to enforce immutability.
 *
 * @typeParam K - The type of keys maintained by this map.
 * @typeParam V - The type of mapped values.
 */
export class ROMap<K, V> implements ReadonlyMap<K, V> {
  /**
   * Constructs a new instance of the class with an optional collection of entries.
   *
   * @param entries - An optional iterable object containing key-value pairs (tuples) to initialize the map.
   * If not provided or set to `Nil`, the map will be empty.
   * @typeParam K - The type of the keys in the map.
   * @typeParam V - The type of the values in the map.
   */
  public constructor(entries?: Iterable<readonly [K, V]> | Nil) {
    this.#map = new Map(entries);
  }

  /* eslint-disable jsdoc/require-returns */

  /**
   * Returns the number of key-value pairs in the map.
   */
  public get size(): number {
    return this.#map.size;
  }

  /**
   * Checks if the given key exists in the map.
   * This method works as type guard and narrows the type of the key to check to the type of keys of the map.
   *
   * @param key - The key to check for existence in the map.
   */
  public has(key: unknown): key is K extends Nil ? K : K & {} {
    return this.#map.has(key as never);
  }

  /**
   * Returns the value associated with the given key, or `undefined` if the key does not exist in the map.
   *
   * @param key - The key of the element to return from the map.
   */
  public get(key: K): V | undefined {
    return this.#map.get(key);
  }

  /**
   * Executes the provided callback function once for each key-value pair in the map.
   *
   * @param callback - A function to execute for each key-value pair in the map.
   * The callback receives the current value, key, and the map itself as arguments.
   */
  public forEach(callback: (value: V, key: K, map: ROMap<K, V>) => void): void;

  /**
   * Executes a provided callback function once for each key-value pair in the map.
   *
   * @param callback - A function that is called for each element in the map.
   * It receives the current element's value, key, and the map itself as arguments.
   * @param thisArg - A value to use as `this` when executing the callback function.
   * @returns Returns nothing.
   * @typeParam TThis - The type to use as `this` when executing the callback function.
   */
  public forEach<TThis>(
    callback: (this: TThis, value: V, key: K, map: ROMap<K, V>) => unknown,
    thisArg: TThis,
  ): void;

  // eslint-disable-next-line jsdoc/require-jsdoc
  public forEach(
    callback: (value: V, key: K, map: ROMap<K, V>) => unknown,
    thisArg: unknown = globalThis,
  ): void {
    this.#map.forEach((value, key) => callback.call(thisArg, value, key, this));
  }

  /**
   * Returns an iterable of entries in the map.
   */
  public [Symbol.iterator](): MapIterator<[K, V]> {
    return this.#map[Symbol.iterator]();
  }

  /**
   * Returns an iterable of key, value pairs for every entry in the map.
   */
  public entries(): MapIterator<[K, V]> {
    return this.#map.entries();
  }

  /**
   * Returns an iterable of keys in the map
   */
  public keys(): MapIterator<K> {
    return this.#map.keys();
  }

  /**
   * Returns an iterable of values in the map
   */
  public values(): MapIterator<V> {
    return this.#map.values();
  }

  /**
   * Returns a native representation of the map for better debugging and inspection.
   */
  public toDebug(): Map<K, V> {
    const output = new Map<K, V>(this.#map);
    Object.defineProperty(output, Symbol.toStringTag, { value: 'read-only' });
    return output;
  }

  /**
   * Returns a native representation of the map for better debugging and inspection in Node.js environments.
   */
  public [Symbol.for('nodejs.util.inspect.custom')](): ReadonlyMap<K, V> {
    return this.toDebug();
  }

  readonly #map: Map<K, V>;

  /* eslint-enable jsdoc/require-returns */
}

/*
 * It seems a bit hacky, but I plan to use it as an actual implementation for the `ReadonlyMap` type,
 * so I guess it's reasonable.
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
