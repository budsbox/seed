/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * The `FValue` type represents a union type that can be either a value of type `T` or a function
 * that takes a parameter of type `A` and returns a value of type `T`.
 *
 * @typeParam A - The type of the parameter for the function.
 * @typeParam T - The type of the value or the return type of the function.
 */
export type FValue<A, T> = T | ((value: A) => T);

/**
 * A user-defined type guard that checks a value of type `T` and narrows it to `V` when true.
 *
 * @param value - The value to be checked.
 * @typeParam T - The broad input type.
 * @typeParam V - The narrowed subtype of `T`.
 */
export type TypeGuard<T = any, V extends T = T> = (value: T) => value is V;

/**
 * A boolean predicate over values of type `T`.
 *
 * @param value - The value to be checked.
 * @typeParam T - The input value type.
 */
export type PlainPredicate<T = any> = (value: T) => boolean;

/**
 * Union of a plain predicate and a type guard for a given input type.
 *
 * @typeParam TValue - The base type to be tested or narrowed. Defaults to `any`.
 * @typeParam TNarrowed - The narrowed subtype of `TValue`. Defaults to `TValue`.
 */
export type Predicate<TValue = any, TNarrowed extends TValue = TValue> =
  | PlainPredicate<TValue>
  | TypeGuard<TValue, TNarrowed>;

/**
 * Represents an assertion function used to narrow the type of a given value.
 * It checks whether a value meets certain criteria and narrows its type accordingly when the assertion passes.
 *
 * @param value - The value to be tested by the assertion function.
 * @throws {TypeError} If the assertion fails.
 * @typeParam TValue - The base type of the value being asserted.
 * @typeParam TNarrowed - The narrowed type of the value after the assertion is validated. Defaults to the base type.
 */
export type Assertion<TValue = any, TNarrowed extends TValue = TValue> = (
  value: TValue,
) => asserts value is TNarrowed;

/**
 * Extracts the narrowed type from a type guard or assertion function.
 *
 * @returns The narrowed type of the given type guard.
 * @typeParam TGuard - A `TypeGuard` type from which the narrowed type should be extracted.
 */
export type NarrowedType<TGuard extends Assertion | TypeGuard> =
  TGuard extends TypeGuard<any, infer TNarrowed> ? TNarrowed
  : TGuard extends Assertion<any, infer TNarrowed> ? TNarrowed
  : never;

/**
 * Represents a function that accepts any number of arguments and returns a value of unknown type.
 *
 * @param args - The arguments passed to the function.
 */
export type UnknownFunction = (...args: readonly unknown[]) => unknown;

/**
 * Represents a function that accepts any number of arguments and returns a value of any type.
 * Useful for generic interfaces that accept a function with arbitrary arguments and return values.
 *
 * @param args - The arguments passed to the function.
 */
export type AnyFunction = (...args: readonly any[]) => any;
