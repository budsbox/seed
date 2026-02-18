import type { Predicate } from '@budsbox/lib-types';

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
