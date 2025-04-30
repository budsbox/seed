import { isFunction, isNotNil, isTrue } from './type-guards.js';

/**
 * The `FValue` type represents a union type that can be either a value of type `T` or a function
 * that takes a parameter of type `A` and returns a value of type `T`.
 *
 * @template A - The type of the parameter for the function.
 * @template T - The type of the value or the return type of the function.
 */
export type FValue<A, T> = T | ((value: A) => T);

type TypeGuard<T, V extends T> = (value: T) => value is V;
type TestFn<T> = (value: T) => boolean;
type TestParam<ValueType = never, NarrowedType extends ValueType = ValueType> =
  | TypeGuard<ValueType, NarrowedType>
  | TestFn<ValueType>;
type TestResultType<
  ValueType,
  TestType extends TestParam,
  BranchType extends boolean,
> =
  TestType extends TypeGuard<unknown, infer NarrowedType> ?
    BranchType extends true ?
      Extract<ValueType, NarrowedType>
    : Exclude<ValueType, NarrowedType>
  : TestType extends TestFn<infer OriginalType> ? OriginalType
  : never;

type OnTrueParam<ValueType, TestType extends TestParam, ReturnType> = FValue<
  TestResultType<ValueType, TestType, true>,
  ReturnType
>;
type OnFalseParam<ValueType, TestType extends TestParam, ReturnType> = FValue<
  TestResultType<ValueType, TestType, false>,
  ReturnType
>;

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
 * Evaluates a condition and returns a value or executes a function based on the result.
 *
 * @template TrueType - The type of the value or the return type of the function if the condition is true.
 * @template FalseType - The type of the value or the return type of the function if the condition is false, defaults to null.
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
 * Ensures that the provided value is not null or undefined, and triggers appropriate callbacks
 * based on the evaluation.
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
