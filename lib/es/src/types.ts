/**
 * The `FValue` type represents a union type that can be either a value of type `T` or a function
 * that takes a parameter of type `A` and returns a value of type `T`.
 *
 * @template A - The type of the parameter for the function.
 * @template T - The type of the value or the return type of the function.
 */
export type FValue<A, T> = T | ((value: A) => T);

export type TypeGuard<T, V extends T> = (value: T) => value is V;
export type TestFn<T> = (value: T) => boolean;
export type TestParam<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ValueType = any,
  NarrowedType extends ValueType = ValueType,
> = TypeGuard<ValueType, NarrowedType> | TestFn<ValueType>;
export type TestResultType<
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

export type OnTrueParam<
  ValueType,
  TestType extends TestParam,
  ReturnType,
> = FValue<TestResultType<ValueType, TestType, true>, ReturnType>;
export type OnFalseParam<
  ValueType,
  TestType extends TestParam,
  ReturnType,
> = FValue<TestResultType<ValueType, TestType, false>, ReturnType>;

export interface ParsedPackageName {
  scope?: string | null;
  name: string;
}
