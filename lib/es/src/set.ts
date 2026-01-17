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
export class ROSet<T> extends Set<T> implements ReadonlySet<T> {
  /**
   * Constructs a new instance of the class.
   *
   * @param input - An iterable object that contains elements of type `T` to initialize the set,
   * or `Nil` to create an empty set.
   * @typeParam T - The type of the elements in the set.
   */
  public constructor(input?: Iterable<T> | Nil) {
    super(input);
    createdSets.add(this);
  }

  /**
   * Throws a `TypeError` exception because set is read-only.
   *
   * @param value - The value to add to set.
   * @returns This method does not return a value.
   */
  public override add(value: T): never {
    if (createdSets.has(this)) {
      throw new TypeError(
        `Cannot add value ${String(value)}: set is read-only`,
      );
    }

    return super.add(value) as never;
  }

  /**
   * Throws a `TypeError` exception because set is read-only.
   *
   * @param value - The value to remove from set.
   */
  public override delete(value: T): never {
    throw new TypeError(
      `Cannot delete value ${String(value)}: set is read-only`,
    );
  }

  /**
   * Throws a `TypeError` exception because set is read-only.
   */
  public override clear(): never {
    throw new TypeError('Cannot clear set: set is read-only');
  }
}

const createdSets = new WeakSet<ROSet<unknown>>();

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
