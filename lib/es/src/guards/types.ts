import type { Predicate, TypePredicate } from '@budsbox/lib-types';

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ASSERTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Extracts the narrowed types from a list of predicates into a corresponding tuple.
 *
 * This helper type recursively processes a tuple of predicates and extracts the second type parameter
 * (the narrowed type) from each predicate. The result is a new tuple where each element represents
 * what the input type would be narrowed to if that predicate's type guard succeeds.
 *
 * When used with {@link TypePredicate} types, this is particularly useful for functions like
 * {@link everyPredicate} that need to intersect all narrowed types, or {@link somePredicate}
 * that need to union them.
 *
 * @typeParam TPredicates - A readonly tuple of {@link Predicate} types to extract narrow types from.
 * @example
 * ```typescript
 * type Guard1 = (v: unknown) => v is string;
 * type Guard2 = (v: unknown) => v is { name: string };
 * type Narrowed = PredicatesListNarrowType<[Guard1, Guard2]>;
 * // Narrowed = [string, { name: string }]
 * ```
 * @example
 * ```typescript
 * // Used in practice with everyPredicate
 * const isString = (v: unknown): v is string => typeof v === 'string';
 * const hasLength = (v: unknown): v is { length: number } => 'length' in (v as any);
 * const predicate = everyPredicate(isString, hasLength);
 * // The type system narrows to: string & { length: number }
 * ```
 */
export type PredicatesListNarrowed<TPredicates extends readonly Predicate[]> =
  TPredicates extends [infer TLeft, ...infer TRight] ?
    [
      TLeft extends Predicate<infer _, infer TNarrow> ? TNarrow : never,
      ...PredicatesListNarrowed<
        TRight extends readonly Predicate[] ? TRight : never
      >,
    ]
  : // without readonly duplication it breaks some code ><
  TPredicates extends readonly [infer TLeft, ...infer TRight] ?
    [
      TLeft extends Predicate<infer _, infer TNarrow> ? TNarrow : never,
      ...PredicatesListNarrowed<
        TRight extends readonly Predicate[] ? TRight : never
      >,
    ]
  : TPredicates extends readonly [] ? []
  : TPredicates extends ReadonlyArray<Predicate<infer _, infer TNarrow>> ?
    TNarrow[]
  : never;

/**
 * Extracts the input argument types from a list of predicates into a corresponding tuple.
 *
 * This helper type recursively processes a tuple of predicates and extracts the first type parameter
 * (the input type) from each predicate. The result is a new tuple where each element represents
 * the type that the predicate expects as input.
 *
 * @typeParam TPredicates - A readonly tuple of {@link Predicate} types to extract argument types from.
 * @example
 * ```typescript
 * type Guard1 = (v: string) => boolean;
 * type Guard2 = (v: string) => boolean;
 * type Args = PredicatesListArg<[Guard1, Guard2]>;
 * // Args = [string, string]
 * ```
 * @example
 * ```typescript
 * // Used in practice with everyPredicate
 * const isLongerThan5 = (v: string) => v.length > 5;
 * const isUpperCase = (v: string) => v === v.toUpperCase();
 * const predicate = everyPredicate(isLongerThan5, isUpperCase);
 * // Both predicates require string input, so the value must be a string
 * ```
 */
export type PredicatesListArg<TPredicates extends readonly Predicate[]> =
  TPredicates extends [infer TLeft, ...infer TRight] ?
    [
      TLeft extends Predicate<infer TArg, infer _> ? TArg : never,
      ...PredicatesListArg<
        TRight extends readonly Predicate[] ? TRight : never
      >,
    ]
  : TPredicates extends readonly [] ? []
  : TPredicates extends ReadonlyArray<Predicate<infer TArg>> ? TArg[]
  : never;

/**
 * Transforms a list of predicates' narrowed types into a tuple where each element is optional.
 *
 * This type extracts the narrowed types from each predicate using {@link PredicatesListNarrowed},
 * then makes each type in the resulting tuple optional by unioning it with undefined.
 * Useful for cases where partial satisfaction of predicates is acceptable.
 *
 * @typeParam TPredicates - A readonly tuple of {@link Predicate} types to normalize.
 * @example
 * ```typescript
 * type Guard1 = (v: unknown) => v is string;
 * type Guard2 = (v: unknown) => v is number;
 * type Normalized = NormalizedOptionalRest<[Guard1, Guard2]>;
 * // Normalized = [string | undefined, number | undefined]
 * ```
 * @example
 * ```typescript
 * // Applied to type predicates with different narrowed types
 * type Predicates = [
 *   (v: unknown) => v is boolean,
 *   (v: unknown) => v is { id: string }
 * ];
 * type Result = NormalizedOptionalRest<Predicates>;
 * // Result = [boolean | undefined, { id: string } | undefined]
 * ```
 */
export type NormalizedOptionalRest<TPredicates extends readonly Predicate[]> =
  OptionalsTuple<PredicatesListNarrowed<TPredicates>>;

type OptionalsTuple<TTuple extends readonly unknown[]> =
  TTuple extends readonly [] ? []
  : TTuple extends readonly [infer THead, ...infer TRest] ?
    [THead | undefined, ...OptionalsTuple<TRest>]
  : never;

/**
 * Asserts that a given condition is true. Throws an error if the condition is false.
 * The error message can be a string or a lazily evaluated function that returns a string.
 *
 * @param condition - A boolean expression that is expected to evaluate to true.
 * @param message - An optional error message or a function that generates the error message
 *                if the condition evaluates to false. Defaults to 'Expected condition to be true'.
 * @throws {@link TypeError} in the following cases:
 * - if the condition evaluates to false
 * - if the condition is not a boolean
 * - if the message is not a string or a function that returns a string
 * @inline
 * @category Assertions
 */
export type InvariantFn = (
  condition: boolean,
  message?: string | (() => string),
) => asserts condition is true;

/**
 * Asserts that the given value satisfies the specified predicate function. If the value
 * does not satisfy the predicate, an error will be thrown. If the predicate is a type guard,
 * the value will be narrowed accordingly.
 *
 * @internal
 * @param predicate - A predicate function used to validate the value. Optionally, the predicate
 * may act as a type guard and narrow the type of the value.
 * @param value - The value to be verified against the predicate.
 * @param valueName - The name of the value for the error message. Defaults to 'value'.
 * @throws {TypeError} - if the value does not meet the requirements defined by the predicate.
 * @typeParam TValue - The type of the value being checked.
 * @typeParam TGuardInput - The type of the input to the predicate.
 * @typeParam TNarrowed - The narrowed type of the value if the predicate is a type guard.
 * @category Assertions
 */
export interface InvariantPredicateFn {
  <TNarrowed>(
    predicate: TypePredicate<unknown, TNarrowed>,
    value: unknown,
    valueName?: string,
  ): asserts value is TNarrowed;

  <TValue extends TGuardInput, TGuardInput, TNarrowed extends TGuardInput>(
    predicate: TypePredicate<TGuardInput, TNarrowed>,
    value: TValue,
    valueName?: string,
  ): asserts value is TValue extends TNarrowed ? TValue : TValue & TNarrowed;

  <TValue>(
    predicate: Predicate<TValue>,
    value: TValue,
    valueName?: string,
  ): void;

  (predicate: Predicate, value: unknown, valueName?: string): void;
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ DESCRIBE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Represents a descriptor for a predicate.
 *
 * @category Describing
 */
export type PredicateDescriptor =
  | { and: readonly Predicate[] }
  | { condition: string }
  | { or: readonly Predicate[] }
  | { type: string };

/**
 * Adds a human-readable description to a given type guard function, enhancing its metadata.
 * This metadata can later be used for debugging, logging, or explanatory purposes.
 *
 * @internal
 * @param predicate - A predicate responsible for evaluating whether a value satisfies
 * a specific type.
 * @param typeDescription - A string description of the type that the `predicate` validates.
 * @returns The original predicate, with the description attached.
 * @throws {TypeError} If `typeGuard` is not a function or `typeDescription` is not a string.
 * @category Describing
 */
export type DescribeTypePredicateFn = <TPredicate extends Predicate>(
  predicate: TPredicate,
  typeDescription: string,
) => TPredicate;

/**
 * Adds a human-readable description to a given predicate function, enhancing its metadata.
 * This metadata can later be used for debugging, logging, or explanatory purposes.
 *
 * @param predicate - The predicate function to associate with a description. Must be a valid function.
 * @param conditionDescription - A description explaining the condition represented by the predicate. Must be a string.
 * @returns The original predicate function, with the description attached.
 * @throws {TypeError} If `predicate` is not a function or `conditionDescription` is not a string.
 * @category Describing
 */
export type DescribePredicateFn = <TPredicate extends Predicate>(
  predicate: TPredicate,
  conditionDescription: string,
) => TPredicate;

/**
 * Retrieves the descriptor associated with a given predicate function, if available.
 *
 * @internal
 * @param predicate - A predicate function to retrieve the descriptor from.
 * @returns The `PredicateDescriptor` associated with the predicate, or `undefined` if not present.
 * @throws {TypeError} If the provided `predicate` is not a function.
 * @category Describing
 */
export type GetPredicateDescriptorFn = (
  predicate: Predicate,
) => PredicateDescriptor | undefined;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ FORMAT ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Formats an error message indicating the expected condition for a predicate function.
 *
 * @param predicate - The predicate function to generate an error message for.
 * @param value - The value that failed to satisfy the predicate.
 * @param valueName - The name of the value for the error message. Defaults to 'value'.
 * @returns A formatted error message describing what was expected.
 * @throws {TypeError} If `predicate` is not a function or `valueName` is not a string.
 * @category Formatting
 */
export type FormatPredicateExpectedMessageFn = (
  predicate: Predicate,
  value: unknown,
  valueName?: string,
) => string;

/**
 * Formats an {@link Error} object into a concise debug string.
 *
 * Includes the error's name, message, optional `code` and `cause` properties,
 * and a truncated stack trace. Nested values are formatted using {@link formatDebugValue}.
 *
 * @param error - The error to format.
 * @param options - Optional formatting configuration via {@link FormatOptions}.
 * @returns A formatted string representation of the error.
 * @throws {TypeError} If `error` is not an instance of {@link Error}.
 * @category Formatting
 */
export type FormatErrorFn = (error: Error, options?: FormatOptions) => string;

/**
 * Formats a value into a human-readable debug string representation.
 *
 * Handles primitives, arrays, objects, functions, dates, errors, maps, sets,
 * and objects with custom `toString` methods. Circular references are detected
 * and marked as `[Circular]` for arrays or `{Circular}` for objects.
 *
 * @param value - The value to format for debugging purposes.
 * @param options - Optional formatting configuration via {@link FormatOptions}.
 * @returns A string representation suitable for debug output.
 * @throws {@link TypeError} in the following cases:
 * - `options` is not an object or `undefined`.
 * - `options` has a `maxDepth` property that is not a positive integer.
 * - `options` has a `maxArrayLength` property that is not a positive integer.
 * - `options` has a `maxStringLength` property that is not a positive integer.
 * @category Formatting
 */
export type FormatDebugValueFn = (
  value: unknown,
  options?: FormatOptions,
) => string;

/**
 * Configuration options for debug formatting functions.
 *
 * @category Formatting
 */
export interface FormatOptions {
  /**
   * Maximum recursion depth for nested structures.
   *
   * @defaultValue `2`
   */
  readonly maxDepth?: number;

  /**
   * Maximum number of items to display in arrays.
   *
   * @defaultValue `5`
   */
  readonly maxItems?: number;

  /**
   * Maximum string length before truncation.
   *
   * @defaultValue `15`
   */
  readonly maxLength?: number;

  /**
   * Set of already-seen objects for circular reference detection.
   *
   * @internal
   * @defaultValue `new WeakSet()`
   */
  readonly seen?: WeakSet<object>;
}
