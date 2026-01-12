import type { IterableElement } from 'type-fest';

import type {
  AnyReadableSet,
  AnySet,
  ArrayItemsIntersection,
  Nil,
} from '@budsbox/lib-types';

/**
 * Computes the union of multiple sets and returns a new set containing all unique elements.
 *
 * @param sets - A collection of sets to be unified.
 * @returns A new set containing all unique elements present in any of the input sets.
 * @typeParam TSets - An array of sets whose elements extend the type `UnknownSet`.
 */
export const union = <TSets extends readonly AnyReadableSet[]>(
  ...sets: TSets
): Set<IterableElement<IterableElement<TSets>>> => {
  const unionSet = new Set<IterableElement<IterableElement<TSets>>>();

  for (const set of sets) {
    for (const element of set) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      unionSet.add(element);
    }
  }

  return unionSet;
};

/**
 * Computes the intersection of multiple sets, returning a new set containing only the elements
 * that are present in all the provided sets.
 *
 * @param sets - A variable number of sets to compute the intersection from.
 * @returns A new set containing the elements that are common to all provided sets.
 * @typeParam TSets - A tuple of sets, where each set contains elements of any type.
 * The resulting set contains elements that are a union of all possible intersections
 * of the provided sets' elements.
 */
export const intersection = <TSets extends readonly AnyReadableSet[]>(
  ...sets: TSets
): Set<ArrayItemsIntersection<ItemsOfSetsArray<TSets>>> => {
  const { length } = sets;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const counters = new Map<any, number>();

  for (const set of sets) {
    for (const element of set) {
      const count = counters.get(element) ?? 0;

      counters.set(element, count + 1);
    }
  }

  const intersectionSet = new Set<
    ArrayItemsIntersection<ItemsOfSetsArray<TSets>>
  >();
  for (const [element, count] of counters) {
    if (count === length) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      intersectionSet.add(element);
    }
  }

  return intersectionSet;
};

/**
 * A read-only implementation of the `Set` interface. This class allows for creating immutable sets,
 * providing the same methods as a standard `Set`, but without mutation capabilities.
 *
 * @typeParam T - The type of elements stored in the set.
 */
export class ROSet<T = undefined> implements ReadonlySet<T> {
  /**
   * Constructs a new instance of the class.
   *
   * @param input - An iterable object that contains elements of type `T` to initialize the set,
   * or `Nil` to create an empty set.
   * @typeParam T - The type of the elements in the set.
   */
  public constructor(input?: Iterable<T> | Nil) {
    this.#set = new Set(input);
  }

  /* eslint-disable jsdoc/require-returns */

  /**
   * Iterates over values in the set.
   *
   * @returns An iterator that yields the values of the set.
   */
  public [Symbol.iterator](): SetIterator<T> {
    return this.#set[Symbol.iterator]();
  }

  /**
   * Returns the number of elements in the set.
   */
  public get size(): number {
    return this.#set.size;
  }

  /**
   * Checks if the given item is present in the set.
   * This method works as type guard and narrow the type of the type of the items of the set.
   *
   * @param item - The item to check for existence in the set.
   * @returns Returns `true` if the item exists in the set; otherwise, returns `false`.
   * @typeParam TValue - The type of the item being checked.
   */
  public has(item: unknown): item is T extends Nil ? T : T & {} {
    return this.#set.has(item as never);
  }

  /**
   * Iterates over each value of the set, invoking the provided callback function for each element.
   *
   * @param callback - A function that is executed for each element of the set.
   * It receives the current value, the second occurrence of the same value, the set itself, and an optional `thisArg` context.
   * @param thisArg - The value to use as `this` inside the callback function.
   * @typeParam T - The type of elements stored in the set.
   * @typeParam TThis - The type of the `this` context to be used inside the callback.
   */
  public forEach<TThis>(
    callback: (
      this: TThis,
      value: T,
      value2: T,
      set: ROSet<T>,
      thisArg?: unknown,
    ) => void,
    thisArg: TThis,
  ): void;

  /**
   * Executes the provided callback function once for each value in the set, in insertion order.
   *
   * @param callback - A function to execute for each value in the set.
   * The function is invoked with three arguments: the current value, the same value (to match the Map-like callback signature), and the set itself.
   * @typeParam T - The type of elements in the set.
   */
  public forEach(callback: (value: T, value2: T, set: ROSet<T>) => void): void;

  // eslint-disable-next-line jsdoc/require-jsdoc
  public forEach(
    callback: (value: T, value2: T, set: ROSet<T>) => void,
    thisArg: unknown = globalThis,
  ): void {
    this.#set.forEach(
      (value) => void callback.call(thisArg, value, value, this),
    );
  }

  /**
   * Returns an iterable of [v,v] pairs for every value `v` in the set.
   */
  public entries(): SetIterator<[T, T]> {
    return this.#set.entries();
  }

  /**
   * Despite its name, returns an iterable of the values in the set.
   *
   * @returns An iterable of the values in the set.
   */
  public keys(): SetIterator<T> {
    return this.#set.keys();
  }

  /**
   * Returns an iterable of values in the set.
   *
   * @returns An iterable of values in the set.
   */
  public values(): SetIterator<T> {
    return this.#set.values();
  }

  /**
   * Returns a native representation of the set for better debugging and inspection.
   */
  public toDebug(): Set<T> {
    const output = new Set<T>(this.#set);
    Object.defineProperty(output, Symbol.toStringTag, { value: 'read-only' });
    return output;
  }

  /**
   * Returns a native representation of the set for better debugging and inspection in Node.js environments
   */
  public [Symbol.for('nodejs.util.inspect.custom')](): Set<T> {
    return this.toDebug();
  }

  /* eslint-enable jsdoc/require-returns */

  readonly #set: Set<T>;
}

/*
 * It seems a bit hacky, but I plan to use it as an actual implementation for the `ReadonlySet` type,
 * so I guess it's reasonable.
 */
(
  [
    [ROSet, 'name'],
    [ROSet.prototype, Symbol.toStringTag],
  ] as const
).forEach(([obj, prop]) => {
  Object.defineProperty(obj, prop, {
    value: 'ReadonlySet',
    configurable: true,
  });
});

type ItemsOfSetsArray<TSets extends readonly AnyReadableSet[]> =
  TSets extends readonly [infer TSet, ...infer TRest] ?
    [
      TSet extends Set<infer T> ? T : never,
      ...(TRest extends readonly AnySet[] ? ItemsOfSetsArray<TRest> : []),
    ]
  : TSets extends readonly [] ? []
  : TSets extends ReadonlyArray<Set<infer T>> ? T[]
  : never;
