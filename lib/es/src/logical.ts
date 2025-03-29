import type {
  OnFalseParam,
  OnTrueParam,
  TestParam,
  TestResultType,
} from './types.js';

import { isFunction, isNotNil, isTrue } from '#guards';

/**
 * Functional If
 *
 * Evaluates a value with a given test and returns a value (or executes a function and returns it's result) based on the result.
 *
 * @typeParam TrueType - The type of the value or the return type of the function if the test's result is true.
 * @typeParam FalseType - The type of the value or the return type of the function if the test's result is true, defaults to undefined.
 *
 * @param value - The value to test against the provided test function.
 * @param test - A function to evaluate the provided value.
 * @param onTrue - A function or value to execute or return if the test evaluates to true.
 * @param onFalse - A function or value to execute or return if the test evaluates to false.
 * @return The value or the result of the function based on the test result
 *
 * @example
 * ```ts
 * const result1 = fif(10, (n) => n > 5, 'Greater', 'Smaller');
 * // result1 is 'Greater'
 *
 * const result2 = fif(3, (n) => n > 5, (n) => `Above ${n}`, (n) => `Below ${n}`);
 * // result2 is 'Below 3'
 * ```
 */
export function fif<
  ValueType,
  TestParamType extends TestParam<ValueType>,
  TrueType,
  FalseType = undefined,
>(
  value: ValueType,
  test: TestParamType,
  onTrue: OnTrueParam<ValueType, TestParamType, TrueType>,
  onFalse?: OnFalseParam<ValueType, TestParamType, FalseType>,
): TrueType | FalseType {
  if (test(value)) {
    return isFunction(onTrue) ?
        onTrue(value as TestResultType<ValueType, TestParamType, true>)
      : onTrue;
  }

  if (isFunction(onFalse)) {
    return onFalse(value as TestResultType<ValueType, TestParamType, false>);
  }

  return onFalse!;
}

/**
 * Functional If (Static)
 *
 * Evaluates a condition and returns a value or executes a function based on the result.
 *
 * @typeParam TrueType - The type of the value or the return type of the function if the condition is true.
 * @typeParam FalseType - The type of the value or the return type of the function if the condition is false, defaults to null.
 *
 * @param condition - The condition to evaluate.
 * @param onTrue - The value or function to return/execute if the condition is true. If it's a function, it receives `true` as an argument.
 * @param onFalse - The value or function to return/execute if the condition is false. If it's a function, it receives `false` as an argument.
 * @return The value or the result of the function based on the evaluated condition.
 */
export function fifs<TrueType, FalseType = undefined>(
  condition: boolean,
  onTrue: OnTrueParam<boolean, typeof isTrue, TrueType>,
  onFalse?: OnFalseParam<boolean, typeof isTrue, FalseType>,
): TrueType | FalseType {
  return fif(condition, isTrue, onTrue, onFalse);
}

/**
 * Ensures that the provided value is not null or undefined,
 * and returns a value (or executes a function and returns it's result) based on the result.
 *
 * @param value - The value to be checked.
 * @param onTrue - Callback function to be executed if the value is not null or undefined.
 * @param onFalse - (Optional) Callback function to be executed if the value is null or undefined.
 * @return The result of the appropriate callback function based on the evaluation of the value.
 */
export function sure<ValueType, TrueType, FalseType = undefined>(
  value: ValueType,
  onTrue: OnTrueParam<ValueType, typeof isNotNil, TrueType>,
  onFalse?: OnFalseParam<ValueType, typeof isNotNil, FalseType>,
): TrueType | FalseType {
  return fif(value, isNotNil, onTrue, onFalse);
}
