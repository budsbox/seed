import type { Maybe, Undef } from '@budsbox/lib-types';

/**
 * The `FValue` type represents a union type that can be either a value of type `T` or a function
 * that takes a parameter of type `A` and returns a value of type `T`.
 *
 * @typeParam A - The type of the parameter for the function.
 * @typeParam T - The type of the value or the return type of the function.
 */
export type FValue<A, T> = T | ((value: A) => T);

/**
 * A user-defined type guard that checks a value of type `T` and refines it to `V` when true.
 *
 * @param value - The value to be checked.
 * @typeParam T - The broad input type.
 * @typeParam V - The narrowed subtype of `T`.
 */
export type TypeGuard<T, V extends T> = (value: T) => value is V;

/**
 * A boolean predicate over values of type `T`.
 *
 * @param value - The value to be checked.
 * @typeParam T - The input value type.
 */
export type Predicate<T> = (value: T) => boolean;

/**
 * Union of a predicate and a type guard for a given input type.
 *
 * @typeParam TValue - The base type to be tested or narrowed. Defaults to `any`.
 * @typeParam TNarrowed - The narrowed subtype of `TValue`. Defaults to `TValue`.
 */
export type TestFn<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TValue = any,
  TNarrowed extends TValue = TValue,
> = Predicate<TValue> | TypeGuard<TValue, TNarrowed>;

/**
 * Resolves to a type based on a predicate or type guard and the selected branch.
 *
 * @typeParam TValue - The value type under test.
 * @typeParam TTestFn - A `Predicate` or `TypeGuard` applied to `TValue`.
 * @typeParam TBranch - If `true`, keep the narrowed part; if `false`, exclude it.
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
 * Maps the "true" branch of a test to a value or function result type.
 *
 * @typeParam TValue - The input value type being tested.
 * @typeParam TTestFn - The test (predicate or type guard).
 * @typeParam TResult - The resulting value type.
 */
export type FValueTrue<TValue, TTestFn extends TestFn, TResult> = FValue<
  TestFnResult<TValue, TTestFn, true>,
  TResult
>;

/**
 * Maps the "false" branch of a test to a value or function result type.
 *
 * @typeParam TValue - The input value type being tested.
 * @typeParam TTestFn - The test (predicate or type guard).
 * @typeParam TResult - The resulting value type.
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
   * The unscoped package name (the segment after the scope or the whole name if unscoped).
   * For "@scope/pkg", this is "pkg"; for "pkg", this is "pkg".
   */
  name: string;

  /**
   * The scope part of the package name (organization/user), with or without the leading "@" and trail "/".
   * If the package is unscoped, this will be `null` or `undefined`.
   *
   * @example "scope" for "@scope/pkg", or "undefined" for "pkg"
   */
  scope?: string | null;
}

/**
 * Options for formatting the package name.
 */
export interface PackageNameFormatOptions {
  /**
   * Array of path chunks to be excluded when constructing the path.
   *
   * @defaultValue `['packages']`
   */
  excludePathChunks?: Undef<readonly string[]>;

  /**
   * The delimiter used to separate parents name from the base name of the package.
   *
   * @defaultValue `'_'`
   */
  nameDelimiter?: Undef<string>;

  /**
   * The parent package name.
   *
   * @defaultValue `options.root`
   */
  parent?: Maybe<string>;

  /**
   * The delimiter used to separate path chunks.
   *
   * @defaultValue `'-'`
   */
  pathDelimiter?: Undef<string>;

  /**
   * The path to the package, relative to its parent.
   *
   * @defaultValue `''`
   */
  relCwd?: Undef<string>;

  /**
   * The root identifier for the package.
   *
   * @defaultValue `null`
   */
  root?: Maybe<string>;
}
