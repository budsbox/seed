/**
 * This module provides utility types for most common TypeScript programming tasks.
 *
 * @module
 * @importTarget .
 * @categoryDescription Core
 * Utility types for most common TypeScript programming tasks.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IsNever } from 'type-fest';

/**
 * Represents a type that excludes `undefined` and `void` from the given type `T`.
 *
 * The `Def` type is used to ensure that the resulting type does not include
 * undefined or void values, effectively creating a "defined value only" type
 * from the provided type parameter.
 *
 * @typeParam T - The original type from which `undefined` and `void` will be excluded.
 * @category Core
 */
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
export type Def<T> = Exclude<T, undefined | void>;

/**
 * A utility type that represents a value of the specified type `T` or `undefined`.
 *
 * @typeParam T - The type of the value. Defaults to `never` if not specified.
 * @category Core
 */
export type Undef<T = never> = T | undefined;

/**
 * Represents a value that can either be `null` or `undefined`.
 *
 * @category Core
 */
export type Nil = null | undefined;

/**
 * Represents an optional value that can either contain a value of type `T`
 * or a `Nil` type, where `Nil` typically represents `null` or `undefined`.
 *
 * @typeParam T - The type of the value that might be present.
 * @category Core
 */
export type Maybe<T = never> = Nil | T;

/**
 * A utility type that ensures the given type `T` excludes `null` and `undefined`.
 *
 * This type alias is used to create types where `null` and `undefined` are not permitted,
 * making the resulting type strictly non-nil.
 *
 * @typeParam T - The type to be filtered to exclude `null` and `undefined`. Defaults to `unknown` if not provided.
 * @category Core
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
 * @category Core
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
 *
 * @category Core
 */
export type Falsy = 0 | '' | false | Nil;

/**
 * A utility type that filters out `Falsy` values from the given type `T`.
 *
 * The `Truthy` type ensures that only values that are not considered "falsy"
 * are retained. Falsy values include `false`, `0`, `""` (empty string),
 * `null`, `undefined`, and `NaN`.
 *
 * @returns A type that excludes all falsy values from the provided type `T`.
 * @remarks The utility has limitations, e.g. `Truthy<string>` would still be `string`, so it works with literals only.
 * @typeParam T - The type from which falsy values are filtered out.
 * @typeParam T - The input type that will be evaluated to exclude falsy members.
 * @category Core
 */
export type Truthy<T = unknown> = T extends Falsy ? never : T;

/**
 * A type alias representing a set that can hold values of any type.
 *
 * @typeParam T - The type of elements in the set. Defaults to `any`.
 * @category Core
 */
export type AnySet<T = any> = Set<T>;

/**
 * Represents a set that can be either a mutable `Set` or an immutable `ReadonlySet`.
 *
 * @typeParam T - The type of elements contained in the set. Defaults to `any`.
 * @category Core
 */
export type AnyReadableSet<T = any> = ReadonlySet<T> | Set<T>;

/**
 * Represents a map structure that can hold key-value pairs with any type for the keys and values.
 * It is a type alias for the standard `Map` object in JavaScript.
 *
 * @typeParam K - The type of keys in the map. Defaults to `any`.
 * @typeParam V - The type of values in the map. Defaults to `any`.
 * @category Core
 */
export type AnyMap<K = any, V = any> = Map<K, V>;

/**
 * Represents a type that can either be a mutable `Map` or an immutable `ReadonlyMap`,
 * though the any readable (but not
 *
 * @typeParam K - The type of keys in the map.
 * @typeParam V - The type of values in the map.
 * @category Core
 */
export type AnyReadableMap<K = any, V = any> = Map<K, V> | ReadonlyMap<K, V>;

/**
 * A utility type that evaluates whether a given type is `Nil`, i.e. `null | undefined`.
 * This type resolves to `true` if the provided type extends `Nil`,
 * otherwise it resolves to `false`.
 *
 * @typeParam TValue - The type to be checked against `Nil`.
 * @category Core
 */
export type IsNil<TValue> = [TValue] extends [Nil] ? true : false;

/**
 * A utility type that evaluates to the fallback type `TFallbackType` if `T` is determined to be `never`.
 * Otherwise, it resolves to `T`.
 *
 * @typeParam T - The primary type to evaluate.
 * @typeParam TFallbackType - The fallback type to use if `T` is `never`. Defaults to `unknown`.
 * @category Core
 */
export type WithFallback<T, TFallbackType = unknown> =
  IsNever<T> extends true ? TFallbackType : T;
