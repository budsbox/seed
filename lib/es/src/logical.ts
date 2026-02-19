/**
 * This module provides functional logical operations and utilities.
 *
 * @module
 * @importTarget ./logical
 */

import type { Predicate } from '@budsbox/lib-types';

import type { FValueFalse, FValueTrue } from './types.js';

import { callPredicate, isFunction, isNotNil, isTrue } from '#guards';

export type { FValueFalse, FValueTrue };

/**
 * Functional If
 *
 * Evaluates a value with a given test and returns a value (or executes a function and returns its result) based on the result.
 *
 * @param value - The value to test against the provided test function.
 * @param test - A function to evaluate the provided value.
 * @param onTrue - A function or value to execute or return if the test evaluates to true.
 * @param onFalse - A function or value to execute or return if the test evaluates to false.
 * @returns The value or the result of the function based on the test result
 * @typeParam TValue - The type of the value to be tested.
 * @typeParam TTestFn - The type of the test function that takes the value as a parameter and returns a boolean.
 * @typeParam TTrue - The type of the value or the return type of the function if the test's result is true.
 * @typeParam TFalse - The type of the value or the return type of the function if the test's result is true.
 * @example
 * ```ts
 * const result1 = fif(10, (n) => n > 5, 'Greater', 'Smaller');
 * // result1 is 'Greater'
 *
 * const result2 = fif(3, (n) => n > 5, (n) => `${n} greater than 5`, (n) => `${n} below 5`);
 * // result2 is '3 below 5'
 * ```
 */
export function fif<
  TValue,
  TTestFn extends Predicate<TValue>,
  TTrue,
  TFalse = undefined,
>(
  value: TValue,
  test: TTestFn,
  onTrue: FValueTrue<TValue, TTestFn, TTrue>,
  onFalse?: FValueFalse<TValue, TTestFn, TFalse>,
): TFalse | TTrue;
export function fif(
  value: unknown,
  test: Predicate,
  onTrue: unknown,
  onFalse: unknown,
): unknown {
  return (
    callPredicate(test, value, 'test') ?
      isFunction(onTrue) ? onTrue(value)
      : onTrue
    : isFunction(onFalse) ? onFalse(value)
    : onFalse
  );
}

/**
 * Functional If (Static)
 *
 * Evaluates a condition and returns a value or executes a function based on the result.
 *
 * @param condition - The condition to evaluate.
 * @param onTrue - The value or function to return/execute if the condition is true. If it's a function, it receives `true` as an argument.
 * @param onFalse - The value or function to return/execute if the condition is false. If it's a function, it receives `false` as an argument.
 * @returns The value or the result of the function based on the evaluated condition.
 * @typeParam TTrue - The type of the value or the return type of the function if the condition is true.
 * @typeParam TFalse - The type of the value or the return type of the function if condition is true.
 */
export function fifs<TTrue, TFalse = undefined>(
  condition: boolean,
  onTrue: FValueTrue<boolean, typeof isTrue, TTrue>,
  onFalse?: FValueFalse<boolean, typeof isTrue, TFalse>,
): TFalse | TTrue {
  return fif(condition, isTrue, onTrue, onFalse);
}

/**
 * Ensures that the provided value is not null or undefined
 * and returns a value (or executes a function and returns it's result) based on the result.
 *
 * @param value - The value to be checked.
 * @param onTrue - Callback function to be executed if the value is not null or undefined.
 * @param onFalse - (Optional) Callback function to be executed if the value is null or undefined.
 * @returns The result of the appropriate callback function based on the evaluation of the value.
 * @typeParam TValue - The type of the value to be checked.
 * @typeParam TTrue - The type of the value or the return type of the function if the value is not null or undefined.
 * @typeParam TFalse - The type of the value or the return type of the function if the value is null or undefined.
 */
export function sure<TValue, TTrue, TFalse = undefined>(
  value: TValue,
  onTrue: FValueTrue<TValue, typeof isNotNil, TTrue>,
  onFalse?: FValueFalse<TValue, typeof isNotNil, TFalse>,
): TFalse | TTrue {
  return fif(value, isNotNil, onTrue, onFalse);
}
