// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
/**
 * Represents a type that excludes `undefined` and `void` from the given type `T`.
 *
 * The `Def` type is used to ensure that the resulting type does not include
 * undefined or void values, effectively creating a "defined value only" type
 * from the provided type parameter.
 *
 * @template T - The original type from which `undefined` and `void` will be excluded.
 */
export type Def<T> = Exclude<T, undefined | void>;

/**
 * A utility type that represents a value of the specified type `T` or `undefined`.
 *
 * @template T - The type of the value. Defaults to `never` if not specified.
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
 * @template T - The type of the value that might be present.
 */
export type Maybe<T = never> = T | Nil;

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
 * @template T - The type of the value, whether synchronous or asynchronous.
 */
export type Awaitable<T> = T | Promise<T>;

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
export type Falsy = false | 0 | '' | Nil;

/**
 * A utility type that filters out `Falsy` values from the given type `T`.
 *
 * The `Truthy` type ensures that only values that are not considered "falsy"
 * are retained. Falsy values include `false`, `0`, `""` (empty string),
 * `null`, `undefined`, and `NaN`.
 *
 * Note that the utility has limitations, e.g. `Truthy<string>` would still be `string`, so it works with literals only.
 *
 * @template T - The type from which falsy values are filtered out.
 * @typeParam T - The input type that will be evaluated to exclude falsy members.
 * @returns A type that excludes all falsy values from the provided type `T`.
 */
export type Truthy<T = unknown> = T extends Falsy ? never : T;
