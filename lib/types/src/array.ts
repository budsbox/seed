/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  IsNever,
  IsNumericLiteral,
  IterableElement,
  NonNegativeInteger,
  UnknownArray,
} from 'type-fest';

/**
 * A recursive utility type for generating all possible subsets of a tuple.
 *
 * Given a tuple type `T`, `PowerTuple` constructs a type representing all
 * possible combinations of elements from `T` while maintaining the order of elements.
 *
 * @typeParam T - A tuple type from which the power set is generated. Must extend `UnknownArray`.
 * @remarks
 * - The generated power set includes the empty tuple and original tuple as subsets.
 * - Keep in mind that the **number of subsets grows exponentially**
 * with the size of the input tuple (e.g., for a 10-tuple, there will be 1024 subsets.),
 * so use it with caution for large tuples.
 */
export type PowerSet<T extends UnknownArray> =
  T extends readonly [infer THead, ...infer TRest] ?
    readonly [THead, ...PowerSet<TRest>] | PowerSet<TRest>
  : readonly [];

/**
 * Represents a type for a tuple with a specific length `N` and elements of type `T`.
 * This is a recursive type that generates a tuple type of exactly `N` elements.
 *
 * @typeParam N - The desired length of the tuple. It should be a non-negative integer or a union of non-negative integers.
 * @typeParam T - The type of the elements in the tuple. Defaults to `unknown` if not specified.
 * @remarks
 * - If `N` is of type `number`, it determines the length of the tuple.
 * - If `N` is not a fixed finite number, the type resolves to an array of `T[]`.
 * @example
 * You can use `TupleN` to define a tuple of a fixed size with elements of a specific type.
 */
export type TupleN<N extends number, T = unknown> =
  // this is to distribute a numbers union, so `TupleN<2 | 3 | 4>` becomes `TupleN<2> | TupleN<3> | TupleN<4>``
  N extends N ?
    IsNumericLiteral<N> extends true ?
      IsNever<NonNegativeInteger<N>> extends true ?
        never
      : _TupleN<T, N, []>
    : T[]
  : never;

type _TupleN<T, N extends number, R extends unknown[]> =
  R['length'] extends N ? R : _TupleN<T, N, [T, ...R]>;

/**
 * Represents the intersection of the item types in an array or tuple type.
 *
 * This utility type recursively computes the intersection of all element types
 * in the provided array or tuple type `TArray`. If `TArray` is empty, it defaults to `never`.
 *
 * @typeParam TArray - A tuple or array type whose item types will be intersected.
 */
export type ArrayItemsIntersection<TArray extends readonly any[]> =
  TArray extends readonly [infer TLeft, ...infer TRight] ?
    TLeft & (TRight extends [] ? unknown : ArrayItemsIntersection<TRight>)
  : IterableElement<TArray>;
