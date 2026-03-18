/* eslint-disable jsdoc/informative-docs */
import type {
  FValue,
  Maybe,
  Predicate,
  TypePredicate,
  Undef,
  ValuePredicate,
} from '@budsbox/lib-types';

/**
 * Resolves to a type based on a predicate or type guard and the selected branch.
 *
 * @typeParam TValue - The value type under test.
 * @typeParam TTestFn - A `Predicate` or `TypePredicate` applied to `TValue`.
 * @typeParam TBranch - If `true`, keep the narrowed part; if `false`, exclude it.
 */
export type TestFnResult<
  TValue,
  TTestFn extends Predicate,
  TBranch extends boolean,
> =
  TTestFn extends TypePredicate<unknown, infer TNarrowed> ?
    TBranch extends true ?
      Extract<TValue, TNarrowed>
    : Exclude<TValue, TNarrowed>
  : TTestFn extends ValuePredicate<infer TOriginal> ? TOriginal
  : never;

/**
 * Maps the "true" branch of a test to a value or function result type.
 *
 * @typeParam TValue - The input value type being tested.
 * @typeParam TTestFn - The test (predicate or type guard).
 * @typeParam TResult - The resulting value type.
 */
export type FValueTrue<TValue, TTestFn extends Predicate, TResult> = FValue<
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
export type FValueFalse<TValue, TTestFn extends Predicate, TResult> = FValue<
  TestFnResult<TValue, TTestFn, false>,
  TResult
>;

/**
 * Represents a parsed Node.js (npm) package name split into its optional scope and the bare name.
 *
 * @inline
 * @category Package Name
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
 *
 * @inline
 * @category Package Name
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
