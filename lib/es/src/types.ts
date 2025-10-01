/**
 * The `FValue` type represents a union type that can be either a value of type `T` or a function
 * that takes a parameter of type `A` and returns a value of type `T`.
 *
 * @typeParam A - The type of the parameter for the function.
 * @typeParam T - The type of the value or the return type of the function.
 */
export type FValue<A, T> = T | ((value: A) => T);

/**
 * A type representing a type guard function that determines if a given value of type `T`
 * conforms to a more specific type `V`, where `V` is a subtype of `T`.
 *
 * This function should be implemented to return `true` if the provided value matches
 * the more specific type `V`, and `false` otherwise. By using a type guard, TypeScript can
 * narrow the type of variable within the scope of a condition.
 *
 * @typeParam T - The broader type against which the value will be checked.
 * @typeParam V - The narrowed type that `T` is tested against. V must extend T.
 * @param value - The value of type `T` to be tested against the narrowed type `V`.
 * @returns A boolean value indicating whether the input value is of type `V`.
 */
export type TypeGuard<T, V extends T> = (value: T) => value is V;

/**
 * A type definition for a function that performs a boolean test on a given value.
 *
 * This generic type accepts a parameter `T`, which represents the type of the input
 * that the function will evaluate. The function returns a boolean indicating the
 * result of the test.
 *
 * @typeParam T - The type of the input value that the function will evaluate.
 * @param value - The input value to test.
 * @returns A boolean indicating the result of the test.
 */
export type Predicate<T> = (value: T) => boolean;

/**
 * Represents a type that can either be a `TypeGuard` or a `TestFn`.
 *
 * `TestParam` is a utility type that allows defining parameters used in testing or
 * type-checking procedures. It accommodates both type guard functions and test
 * functions for more comprehensive type handling.
 *
 * @typeParam TValue - The base type to be tested or narrowed. Defaults to `any`.
 * @typeParam TNarrowed - A subtype of `ValueType` that represents the narrowed type.
 *                          Defaults to `ValueType`.
 */
export type TestFn<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TValue = any,
  TNarrowed extends TValue = TValue,
> = Predicate<TValue> | TypeGuard<TValue, TNarrowed>;

/**
 * Represents a type that evaluates to a specific result based on the provided test conditions.
 *
 * @typeParam TValue - The type of value being tested.
 * @typeParam TTestFn - The type of test being applied. This could be a type guard or a test function.
 * @typeParam TBranch - A boolean that determines the branch type. If true, the resulting type will
 * focus on the narrowed type; otherwise, it excludes the narrowed type.
 *
 * The type resolves based on the following rules:
 * 1. If `TestType` is a type guard:
 *    - If `BranchType` is `true`, the resulting type includes only the portion of `ValueType` that
 *      conforms to the narrowed type.
 *    - If `BranchType` is `false`, the resulting type excludes the portion of `ValueType` that
 *      conforms to the narrowed type.
 * 2. If `TestType` is a test function, the resulting type will be the original type inferred by
 *    the test function.
 * 3. If neither condition applies, the resulting type will be `never`.
 */
export type TestFnResult<
  TValue,
  TTestFn extends TestFn,
  TBranch extends boolean,
> =
  TTestFn extends TypeGuard<unknown, infer TNarrowed> ?
    TBranch extends true ?
      Extract<TValue, TNarrowed>
    : Exclude<TValue, TNarrowed>
  : TTestFn extends Predicate<infer TOriginal> ? TOriginal
  : never;

/**
 * A type definition that represents a resolved value when a certain test condition is true.
 *
 * @typeParam ValueType - Represents the type of the input value being tested.
 * @typeParam TestType - Extends the `TestParam` type and defines the parameters for the test condition.
 * @typeParam ReturnType - Specifies the type of the resulting value after the test condition is satisfied.
 *
 * This type combines the test result with a return type, capturing the transformed value
 * or operation result when the test evaluates to `true`.
 */
export type FValueTrue<TValue, TTestFn extends TestFn, TResult> = FValue<
  TestFnResult<TValue, TTestFn, true>,
  TResult
>;
/**
 * Represents a type that maps a test result to a specific return type when the test evaluates to false.
 *
 * This type is a utility that processes the result of a test operation (`TestResultType`)
 * when the provided test condition evaluates as false, associating it with a specific return type (`ReturnType`).
 *
 * @typeParam ValueType - The type of the primary value being tested.
 * @typeParam TestType - A type extending `TestParam` representing the condition being tested.
 * @typeParam ReturnType - The type of the result or output when the test condition evaluates to false.
 */
export type FValueFalse<TValue, TTestFn extends TestFn, TResult> = FValue<
  TestFnResult<TValue, TTestFn, false>,
  TResult
>;

/**
 * Represents a parsed Node.js (npm) package name split into its optional scope and the bare name.
 */
export interface ParsedPackageName {
  /**
   * The scope part of the package name (organization/user), with or without the leading "@" and trail "/".
   * If the package is unscoped, this will be `null` or `undefined`.
   *
   * @example "scope" for "@scope/pkg", or "undefined" for "pkg"
   */
  scope?: string | null;
  /**
   * The unscoped package name (the segment after the scope or the whole name if unscoped).
   * For "@scope/pkg", this is "pkg"; for "pkg", this is "pkg".
   */
  name: string;
}
