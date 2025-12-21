import type { IsNever, IsNumericLiteral, NonNegativeInteger } from 'type-fest';

/**
 * Represents a type that excludes `undefined` and `void` from the given type `T`.
 *
 * The `Def` type is used to ensure that the resulting type does not include
 * undefined or void values, effectively creating a "defined value only" type
 * from the provided type parameter.
 *
 * @typeParam T - The original type from which `undefined` and `void` will be excluded.
 */
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type Def<T> = Exclude<T, undefined | void>;

/**
 * A utility type that represents a value of the specified type `T` or `undefined`.
 *
 * @typeParam T - The type of the value. Defaults to `never` if not specified.
 */
export type Undef<T = never> = T | undefined;

/**
 * Represents a value that can either be `null` or `undefined`.
 */
export type Nil = null | undefined;

/**
 * Represents an optional value that can either contain a value of type `T`
 * or a `Nil` type, where `Nil` typically represents `null` or `undefined`.
 *
 * @typeParam T - The type of the value that might be present.
 */
export type Maybe<T = never> = Nil | T;

/**
 * A utility type that ensures the given type `T` excludes `null` and `undefined`.
 *
 * This type alias is used to create types where `null` and `undefined` are not permitted,
 * making the resulting type strictly non-nil.
 *
 * @typeParam T - The type to be filtered to exclude `null` and `undefined`. Defaults to `unknown` if not provided.
 */
export type NonNil<T = unknown> = NonNullable<T>;

/**
 * Represents a type that can either be a value of type `T` or a Promise resolving to a value of type `T`.
 *
 * This utility type is often used to describe return values or parameters that might be asynchronous in nature
 * but are not guaranteed to be so. It simplifies handling values that can be either synchronous or asynchronous,
 * allowing the caller to process them uniformly.
 *
 * @typeParam T - The type of the value, whether synchronous or asynchronous.
 */
export type Awaitable<T> = Promise<T> | T;

/**
 * A type alias representing falsy values in JavaScript.
 *
 * The `Falsy` type includes the following values:
 * - `false`: The boolean literal representing a false value.
 * - `0`: The numeric value zero.
 * - An empty string (`''`): A string literal with no content.
 * - `null`: A null value indicating the absence of any object value.
 * - `undefined`: A value indicating that a variable has not been assigned a value.
 *
 * This type is useful for cases where you need to explicitly represent or handle values
 * that JavaScript considers as falsy during logical operations.
 */
export type Falsy = 0 | '' | false | Nil;

/**
 * A utility type that filters out `Falsy` values from the given type `T`.
 *
 * The `Truthy` type ensures that only values that are not considered "falsy"
 * are retained. Falsy values include `false`, `0`, `""` (empty string),
 * `null`, `undefined`, and `NaN`.
 *
 * Note that the utility has limitations, e.g. `Truthy<string>` would still be `string`, so it works with literals only.
 *
 * @returns A type that excludes all falsy values from the provided type `T`.
 * @typeParam T - The type from which falsy values are filtered out.
 * @typeParam T - The input type that will be evaluated to exclude falsy members.
 */
export type Truthy<T = unknown> = T extends Falsy ? never : T;

/**
 * Represents a function that accepts any number of arguments and returns a value of any type.
 *
 * @param args - The arguments passed to the function.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: readonly any[]) => any;

/**
 * Represents a utility type for defining an object where keys are restricted
 * to a specific type and values are of a specified type.
 * This type creates an immutable and optional record structure.
 * Useful for generic interfaces that accept a record of properties,
 *
 * @typeParam TKey - The type of the property keys. Defaults to `PropertyKey`.
 * @typeParam TValue - The type of the property values. Defaults to `any`.
 */
export type AnyRecord<
  TKey extends PropertyKey = PropertyKey,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TValue = any,
> = Partial<Readonly<Record<TKey, TValue>>>;

/**
 * Represents a function that accepts any number of arguments and returns a value of unknown type.
 *
 * @param args - The arguments passed to the function.
 */
export type UnknownFunction = (...args: readonly unknown[]) => unknown;

/**
 * A utility type that evaluates whether a given type is `Nil`, i.e. `null | undefined`.
 * This type resolves to `true` if the provided type extends `Nil`,
 * otherwise it resolves to `false`.
 *
 * @typeParam TValue - The type to be checked against `Nil`.
 */
export type IsNil<TValue> = [TValue] extends [Nil] ? true : false;

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
export type TupleN<N extends number, T = unknown> =
  // this is to distribute a numbers union, so `TupleN<2 | 3 | 4>` will become `TupleN<2> | TupleN<3> | TupleN<4>``
  N extends N ?
    IsNumericLiteral<N> extends true ?
      IsNever<NonNegativeInteger<N>> extends true ?
        never
      : _TupleN<T, N, []>
    : T[]
  : never;

type _TupleN<T, N extends number, R extends unknown[]> =
  R['length'] extends N ? R : _TupleN<T, N, [T, ...R]>;
