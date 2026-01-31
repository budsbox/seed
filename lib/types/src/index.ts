import type { Tagged, UnwrapTagged } from 'type-fest';

import type { NonNil } from '#core';
import type { InferObject } from '#object';

// Type exports
export type * from '#core';
export type * from '#function';
export type * from '#object';

// shorthand
export type { UnwrapTagged as UnTag };

/**
 * The general version of InferObject
 *
 * @typeParam T - The type to infer
 */
export type Infer<T> =
  unknown extends T ? T
  : T extends object ? InferObject<T>
  : T;

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

/**
 * Represents a readonly version of a given collection type.
 *
 * The `ReadonlyCollection` type utility conditionally transforms the input type `T`
 * based on its structure:
 *
 * - If `T` is a `Map`, it produces a `ReadonlyMap` preserving the keys and values.
 * - If `T` is a `Set`, it produces a `ReadonlySet` preserving the value type.
 * - For any other type, it produces an immutable version of the input using `Readonly<T>`.
 *
 * @typeParam T - The base type for which a readonly version is constructed.
 */
export type ReadonlyCollection<T> =
  T extends Map<infer TKey, infer TValue> ? ReadonlyMap<TKey, TValue>
  : T extends Set<infer TValue> ? ReadonlySet<TValue>
  : Readonly<T>;

/**
 * A utility type that conditionally applies the `Readonly` utility type to the given type `TOriginal`
 * based on the boolean value of `TCondition`.
 *
 * If `TCondition` is `true`, the resulting type makes all properties of `TOriginal` read-only.
 * If `TCondition` is `false`, the resulting type remains the same as `TOriginal`.
 *
 * @typeParam TOriginal - The original type whose properties may be conditionally read-only.
 * @typeParam TCondition - A boolean value that determines whether to apply the `Readonly` utility type to `TOriginal`.
 */
export type ConditionalReadonly<TOriginal, TCondition extends boolean> =
  TCondition extends true ? ReadonlyCollection<TOriginal> : TOriginal;
