/**
 * This module provides utility types for working with functions and predicates.
 *
 * @module
 * @importTarget .
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * The `FValue` type represents a union type that can be either a value of type `T` or a function
 * that takes a parameter of type `A` and returns a value of type `T`.
 *
 * @typeParam A - The type of the parameter for the function.
 * @typeParam T - The type of the value or the return type of the function.
 * @category Function
 */
export type FValue<A, T> = T | ((value: A) => T);

/**
 * A one-parameter type guard that checks a value of type `T` and narrows it to `V` when true.
 *
 * @param value - The value to be checked.
 * @typeParam T - The broad input type.
 * @typeParam TNarrowed - The narrowed subtype of `T`.
 * @category Function
 */
export type TypePredicate<T = any, TNarrowed extends T = T> = (
  value: T,
) => value is TNarrowed;

/**
 * A boolean predicate over values of type `T`.
 *
 * @param value - The value to be checked.
 * @typeParam T - The input value type.
 * @category Function
 */
export type ValuePredicate<T = any> = (value: T) => boolean;

/**
 * Union of a plain predicate and a type guard for a given input type.
 *
 * @typeParam TValue - The base type to be tested or narrowed. Defaults to `any`.
 * @typeParam TNarrowed - The narrowed subtype of `TValue`. Defaults to `TValue`.
 * @category Function
 */
export type Predicate<TValue = any, TNarrowed extends TValue = TValue> =
  | TypePredicate<TValue, TNarrowed>
  | ValuePredicate<TValue>;

/**
 * Extracts the narrowed type from a {@link TypePredicate type predicate} (one-parameter type guard).
 *
 * @returns The narrowed type of the given type predicate.
 * @typeParam TGuard - A `TypePredicate` type from which the narrowed type should be extracted.
 * @remarks This type is limited by design, because there's no universal way to describe all the possible type guards.
 * @category Function
 */
export type NarrowedType<TGuard extends TypePredicate> =
  TGuard extends TypePredicate<any, infer TNarrowed> ? TNarrowed : never;

/**
 * Represents a function that accepts any number of arguments and returns a value of the unknown type.
 *
 * @param args - The arguments passed to the function.
 * @category Function
 */
export type UnknownFunction = (...args: readonly unknown[]) => unknown;

/**
 * Represents a function that accepts any number of arguments and returns a value of any type.
 * Useful for generic types that accept a function with arbitrary arguments and return values.
 *
 * @param args - The arguments passed to the function.
 * @category Function
 */
export type AnyFunction = (...args: readonly any[]) => any;
