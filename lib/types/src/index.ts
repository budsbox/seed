import type { Tagged, UnwrapTagged } from 'type-fest';

import type { NonNil } from '#core';
import type { InferObject } from '#object';

// shorthand
export type { UnwrapTagged as UnTag };

// Value exports
export * from '#core';

/**
 * The general version of InferObject
 */
export type Infer<T> =
  unknown extends T ? T
  : T extends object ? InferObject<T>
  : T;

/**
 * Represents a type for a tuple with a specific length `N` and elements of type `T`.
 * This is a recursive type that generates a tuple type of exactly `N` elements.
 *
 * @typeParam N - The desired length of the tuple. If `N` is a `number`, it defines the fixed size.
 * @typeParam T - The type of the elements in the tuple. Defaults to `unknown` if not specified.
 * @remarks
 * - If `N` is of type `number`, it determines the length of the tuple.
 * - If `N` is not a fixed finite number, the type resolves to an array of `T[]`.
 * @example
 * You can use `TupleN` to define a tuple of a fixed size with elements of a specific type.
 */
export type TupleN<N extends number, T> =
  // this is for a distribution of the union of numbers
  N extends N ?
    number extends N ?
      T[]
    : _TupleN<T, N, []>
  : never;

type _TupleN<T, N extends number, R extends unknown[]> =
  R['length'] extends N ? R : _TupleN<T, N, [T, ...R]>;

/**
 * A utility type that removes tags from properties in a given type `T`.
 * The type iterates over all properties in `T` and checks if the property
 * type extends a `Tagged` or `Readonly<Tagged>` type. If it does, it applies
 * the `UnTag` transformation to remove the tags. Otherwise, the original
 * property type is retained.
 *
 * This is useful for scenarios where tagged types are used to add metadata to
 * properties, but a different shape of the type is needed with those tags removed.
 *
 * @typeParam T - The type whose properties are to be processed. This must extend `NonNil`.
 */
export type UnTagProperties<T extends NonNil> = {
  [K in keyof T]: T[K] extends Tagged<PropertyKey, PropertyKey, unknown> ?
    UnwrapTagged<T[K]>
  : T[K];
};
