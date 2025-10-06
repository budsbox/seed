import type { Tagged, UnwrapTagged } from 'type-fest';

import type { NonNil } from '#core';
import type { InferObject } from '#object';

// Type exports
export type * from '#core';

// shorthand
export type { UnwrapTagged as UnTag };

/**
 * The general version of InferObject
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
