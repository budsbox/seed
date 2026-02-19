/**
 * Due to their reliance on features from several other submodules,
 * these functions are not located in more fitting areas, such as './assert.ts' or './check.ts'.
 *
 * @module high-level-functions
 */

import type { Constructor, IterableElement } from 'type-fest';

import type {
  ArrayItemsIntersection,
  NarrowedType,
  Predicate,
  TypePredicate,
} from '@budsbox/lib-types';

import type { PredicatesListArg, PredicatesListNarrowed } from './types.js';

import {
  assertArray,
  assertFunction,
  assertString,
  callPredicate,
  invariantPredicate,
} from './assert.js';
import { isFunction, isString, sameValueZero } from './check.js';
import {
  describeComplexPredicate,
  describePredicate,
  describeTypePredicate,
} from './describe.js';
import { formatDebugValue, joinWithConjunction } from './format.js';
import { assertProp, hasProp } from './prop.js';

/* ──────────────────────────────── Iterable ──────────────────────────────── */

/**
 * Determines whether the provided value is iterable.
 *
 * @param value - The value to be checked.
 * @returns `true` if the value is iterable, otherwise `false`.
 * @category Checks
 */
export function isIterable(value: unknown): value is Iterable<unknown> {
  return hasProp(value, Symbol.iterator, isFunction, true);
}

describePredicate(isIterable, 'to be iterable');

/**
 * Asserts that the provided value is iterable.
 *
 * @param value - The value to be checked for iterable compatibility.
 * @param valueName - The name of the value for the error message. Defaults to 'value'.
 * @throws {@link !TypeError} If the provided value is not iterable.
 * @category Assertions
 */
export function assertIterable(
  value: unknown,
  valueName = 'value',
): asserts value is Iterable<unknown> {
  // This assertion offers a more informative error message compared to the default one provided by assertProp.
  assertString(valueName, 'valueName');
  assertProp(value, Symbol.iterator, isFunction, true, valueName);
}

/* ──────────────────────────────── Of Type ───────────────────────────────── */

/**
 * Creates a type predicate that checks whether a value is an instance of the provided constructor.
 * The returned predicate acts as a type guard for narrowing the value to the constructor's type.
 *
 * @param ctor - A constructor function to check against.
 * @returns A type predicate function that narrows the value type to an instance of the constructor.
 * @throws {@link !TypeError} If `ctor` is not a function.
 * @typeParam T - The type of instances produced by the constructor.
 * @category Checks
 */
export const ofType = <T>(ctor: Constructor<T>): TypePredicate<unknown, T> => {
  assertFunction(ctor, 'ctor');

  return describeTypePredicate(
    (value): value is T => value instanceof ctor,
    `instance of ${ctor.name ? ctor.name : 'anonymous class'}`,
  );
};

/**
 * Asserts that a value is an instance of the provided constructor.
 * If the assertion succeeds, the value is narrowed to the constructor's type.
 *
 * @param ctor - A constructor function to check against.
 * @param value - The value to be verified as an instance of the constructor.
 * @param name - The name of the value for the error message. Defaults to 'value'.
 * @throws {@link !TypeError} If `ctor` is not a function or if the value is not an instance of the constructor.
 * @typeParam T - The type of instances produced by the constructor.
 * @category Assertions
 */
export function assertOfType<T>(
  ctor: Constructor<T>,
  value: unknown,
  name = 'value',
): asserts value is T {
  assertFunction(ctor, 'ctor');
  assertString(name, 'valueName');
  invariantPredicate(ofType(ctor), value, name);
}

/* ────────────────────────────────── Some ────────────────────────────────── */

/** @ignore */
export function somePredicate<TGuards extends readonly TypePredicate[]>(
  ...predicates: TGuards
): TypePredicate<
  ArrayItemsIntersection<PredicatesListArg<TGuards>>,
  NarrowedType<IterableElement<TGuards>>
>;

/**
 * Creates a predicate that returns true if at least one of the provided predicates is satisfied.
 *
 * @param predicates - A list of predicate functions to evaluate.
 * @returns A predicate function that checks if any predicate matches.
 * @typeParam TPredicates - The type of the list of predicates.
 * @category Checks
 */
export function somePredicate<TPredicates extends readonly Predicate[]>(
  ...predicates: TPredicates
): Predicate<ArrayItemsIntersection<PredicatesListArg<TPredicates>>>;

export function somePredicate(
  ...predicates: readonly Predicate[]
): Predicate<unknown> {
  assertPredicates(predicates);

  const compositePredicate: Predicate<unknown> = (value) =>
    predicates.some((predicate) => callPredicate(predicate, value));

  return describeComplexPredicate(compositePredicate, false, ...predicates);
}

/**
 * Asserts that a value satisfies at least one of the provided predicates.
 *
 * If none of the predicates are satisfied, a {@link !TypeError} is thrown **with default value name**.
 * When type predicates are used, the value is narrowed to the union of their narrowed types.
 *
 * @param value - The value to validate against the predicates.
 * @param predicates - One or more predicate functions to check. At least one must return true.
 * @returns void.
 * @throws {TypeError} in the following cases:
 * - If the value does not satisfy any of the provided predicates.
 * - If any of the predicates is not a function
 * - If `valueName` is not a string.
 * @typeParam TGuards - The type of the list of type predicates.
 * {@label DEFAULT_NAME}
 * @category Assertions
 */
export function assertSome<TGuards extends readonly TypePredicate[]>(
  value: ArrayItemsIntersection<PredicatesListArg<TGuards>>,
  ...predicates: TGuards
): asserts value is NarrowedType<IterableElement<TGuards>>;

/**
 * Asserts that a value satisfies at least one of the provided predicates.
 *
 * If none of the predicates are satisfied, a {@link !TypeError} is thrown **with the specified value name**.
 * When type predicates are used, the value is narrowed to the union of their narrowed types.
 *
 * @param value - The value to validate against the predicates.
 * @param valueName - Optional name of the value for the error message.
 * @param predicates - One or more predicate functions to check. At least one must return true.
 * @returns void.
 * @throws {TypeError} in the following cases:
 * - If the value does not satisfy any of the provided predicates.
 * - If any of the predicates is not a function
 * - If `valueName` is not a string.
 * @typeParam TGuards - The type of the list of type predicates.
 * {@label CUSTOM_NAME}
 * @category Assertions
 */
export function assertSome<TGuards extends readonly TypePredicate[]>(
  value: ArrayItemsIntersection<PredicatesListArg<TGuards>>,
  valueName: string,
  ...predicates: TGuards
): asserts value is NarrowedType<IterableElement<TGuards>>;

export function assertSome<TPredicates extends readonly Predicate[]>(
  value: ArrayItemsIntersection<PredicatesListArg<TPredicates>>,
  ...predicates: TPredicates
): void;

export function assertSome<TPredicates extends readonly Predicate[]>(
  value: ArrayItemsIntersection<PredicatesListArg<TPredicates>>,
  valueName: string,
  ...predicates: TPredicates
): void;

export function assertSome(
  value: unknown,
  ...rest:
    | readonly [valueName: string, ...predicates: Predicate[]]
    | readonly Predicate[]
): void {
  let valueName: string | undefined, predicates: Predicate[];
  if (isString(rest[0])) {
    [valueName, ...predicates] = rest as [
      valueName: string,
      ...predicates: readonly Predicate[],
    ];
  } else {
    predicates = rest as Predicate[];
  }

  invariantPredicate(somePredicate(...predicates), value, valueName);
}

/* ───────────────────────────────── Every ────────────────────────────────── */

/** @ignore */
export function everyPredicate<TPredicates extends readonly TypePredicate[]>(
  ...predicates: TPredicates
): TypePredicate<
  ArrayItemsIntersection<PredicatesListArg<TPredicates>>,
  ArrayItemsIntersection<PredicatesListNarrowed<TPredicates>> &
    ArrayItemsIntersection<PredicatesListArg<TPredicates>>
>;

/**
 * Creates a predicate that returns true if all the provided predicates are satisfied.
 *
 * @param predicates - A list of predicate functions to evaluate.
 * @returns A predicate function that checks if every predicate matches.
 * @typeParam TPredicates - The type of the list of predicates.
 * @category Checks
 */
export function everyPredicate<TPredicates extends readonly Predicate[]>(
  ...predicates: readonly Predicate[]
): Predicate<ArrayItemsIntersection<PredicatesListArg<TPredicates>>>;

export function everyPredicate(
  ...predicates: readonly Predicate[]
): Predicate<unknown> {
  assertPredicates(predicates);

  const compositePredicate: Predicate<unknown> = (value) =>
    predicates.every((predicate) => callPredicate(predicate, value));

  return describeComplexPredicate(compositePredicate, true, ...predicates);
}

/**
 * Asserts that a value satisfies all the provided predicates.
 *
 * If any predicate fails, a {@link !TypeError} is thrown **with default name**.
 * When type predicates are used, the value is narrowed to the intersection of their narrowed types.
 *
 * @param value - The value to validate against the predicates.
 * @param rest - Either predicates only, or a value name followed by predicates. All predicates must return true.
 * @returns void.
 * @throws {TypeError} If the value does not satisfy all of the provided predicates.
 * @typeParam TPredicates - The type of the list of predicates.
 * @example
 * ```typescript
 * assertEvery(value, isObject, hasName); // value must be object AND have name
 * assertEvery(value, 'config', isObject, hasName); // with custom name
 * ```
 * @category Assertions
 */
export function assertEvery<TPredicates extends readonly Predicate[]>(
  value: ArrayItemsIntersection<PredicatesListArg<TPredicates>>,
  ...rest: TPredicates
): asserts value is ArrayItemsIntersection<PredicatesListNarrowed<TPredicates>>;

/**
 * Asserts that a value satisfies all the provided predicates.
 *
 * If any predicate fails, a {@link !TypeError} is thrown **with the specified value name**.
 * When type predicates are used, the value is narrowed to the intersection of their narrowed types.
 *
 * @param value - The value to validate against the predicates.
 * @param valueName - Optional name of the value to be used in error messages.
 * @param rest - Either predicates only, or a value name followed by predicates. All predicates must return true.
 * @returns void.
 * @throws {TypeError} If the value does not satisfy all of the provided predicates.
 * @typeParam TPredicates - The type of the list of predicates.
 * @example
 * ```typescript
 * assertEvery(value, isObject, hasName); // value must be object AND have name
 * assertEvery(value, 'config', isObject, hasName); // with custom name
 * ```
 * @category Assertions
 */
export function assertEvery<TPredicates extends readonly Predicate[]>(
  value: ArrayItemsIntersection<PredicatesListArg<TPredicates>>,
  valueName: string,
  ...rest: TPredicates
): asserts value is ArrayItemsIntersection<PredicatesListNarrowed<TPredicates>>;

export function assertEvery(
  value: unknown,
  ...rest: readonly [valueName: string, ...Predicate[]] | readonly Predicate[]
): void {
  let valueName: string | undefined, predicates: Predicate[];

  if (isString(rest[0])) {
    [valueName, ...predicates] = rest as [
      valueName: string,
      ...predicates: Predicate[],
    ];
  } else {
    predicates = rest as Predicate[];
  }

  invariantPredicate(everyPredicate(...predicates), value, valueName);
}

/* ───────────────────────────────── Any Of ───────────────────────────────── */

/**
 * Creates a type predicate that checks if a given value matches any of the specified values.
 *
 * This function accepts a set of possible values and returns a predicate function
 * that evaluates if an input value exists within the set of those specified values.
 *
 * @param values - The set of values to match the input against.
 * @returns A type predicate that verifies whether a value is one of the specified values.
 * @typeParam TValues - A tuple type of all possible values to check against.
 * @remarks Value equality is based on the {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness#same-value-zero_equality SameValueZero algorithm}.
 * @example
 * ```typescript
 * const isColor = anyOf('red', 'green', 'blue');
 * const test = 'red';
 * if (isColor(test)) {
 *   console.log("It\'s a color!");
 * }
 * ```
 * @category Checks
 */
export const anyOf = <TValues extends readonly unknown[]>(
  ...values: TValues
): Predicate<unknown, IterableElement<TValues>> => {
  const testSet = new Set<unknown>(values);

  return describePredicate(
    (value) => testSet.has(value),
    `to be any of: ${joinWithConjunction(
      values.map((v) => formatDebugValue(v, { maxDepth: 1 })),
      'or',
    )}`,
  ) as TypePredicate<unknown, IterableElement<TValues>>;
};

/**
 * Asserts that the given value matches any of the values within the specified iterable.
 *
 * @param values - An iterable containing the values to match against.
 * @param value - The value to assert is one of the specified values.
 * @param valueName - An optional name for the value being asserted, typically used for error messages.
 * @returns This function does not return a value. It throws an error if the assertion fails.
 * @typeParam TValues - A tuple of allowed values to assert against.
 * @remarks This function accepts values as iterable argument, not as `...rest` argument,
 * because there's no way to distinguish between `valueName` and `values` when using `...rest`.
 * @category Assertions
 */
export function assertAnyOf<TValues extends Iterable<unknown>>(
  values: TValues,
  value: unknown,
  valueName?: string,
): asserts value is IterableElement<TValues>;
export function assertAnyOf(
  values: Iterable<unknown>,
  value: unknown,
  valueName: string = 'value',
): void {
  assertIterable(values, 'values');
  assertString(valueName, 'valueName');

  const debugValues = [] as unknown[];

  for (const example of values) {
    if (sameValueZero(example, value)) return;

    debugValues.push(example);
  }

  throw new TypeError(
    `Expected ${valueName} to be any of: ${joinWithConjunction(
      debugValues.map((v) => formatDebugValue(v, { maxDepth: 1 })),
      'or',
    )}, got ${formatDebugValue(value)} instead.`,
  );
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ INTERNALS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

function assertPredicates(
  predicates: unknown,
): asserts predicates is Predicate[] {
  assertArray(predicates, isFunction, 'predicates');
}

/* ───────────────────────────────── Types ────────────────────────────────── */
