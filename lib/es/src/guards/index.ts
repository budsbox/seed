import type { Constructor, IterableElement } from 'type-fest';

import type {
  ArrayItemsIntersection,
  NarrowedType,
  Predicate,
  TypePredicate,
} from '@budsbox/lib-types';

import {
  invariant as _invariant,
  invariantPredicate as _invariantPredicate,
  assertArray,
  assertBoolean,
  assertError,
  assertFunction,
  assertString,
} from './assert.js';
import { isFunction, isString, isTrue } from './check.js';
import {
  type PredicateDescriptor,
  describePredicate as _describePredicate,
  describeTypePredicate as _describeTypePredicate,
  getPredicateDescriptor as _getPredicateDescriptor,
  describeComplexPredicate,
} from './describe.js';
import {
  formatError as _formatError,
  formatPredicateExpectedMessage as _formatPredicateExpectedMessage,
  formatDebugType,
  objectTag,
} from './format.js';
import { assertProp, hasProp } from './prop.js';

// Value exports
export {
  assertArray,
  assertBoolean,
  assertFunction,
  assertNotNil,
  assertNumber,
  assertObject,
  assertPropKey,
  assertString,
  assertSymbol,
} from './assert.js';
export * from './check.js';
export * from './prop.js';

export type { PredicateDescriptor };
export { objectTag };

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~ HIGH-LEVEL FUNCTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*
 * Those functions use functions from several other submodules,
 * that's why they're not placed in more appropriate places, like './assert.ts' or './check.ts'.
 */

/**
 * Determines whether the provided value is iterable.
 *
 * @param value - The value to be checked.
 * @returns `true` if the value is iterable, otherwise `false`.
 * @privateRemarks This function defined here and not in './check.ts' because it uses hasProp
 */
export function isIterable(value: unknown): value is Iterable<unknown> {
  return hasProp(value, Symbol.iterator, isFunction, true);
}

_describePredicate(isIterable, 'to be iterable');

/**
 * Asserts that the provided value is iterable.
 *
 * @param value - The value to be checked for iterable compatibility.
 * @param valueName - The name of the value for the error message. Defaults to 'value'.
 * @throws {@link TypeError} If the provided value is not iterable.
 * @privateRemarks This function defined here and not in './assert.ts' because it uses assertProp
 */
export function assertIterable(
  value: unknown,
  valueName = 'value',
): asserts value is Iterable<unknown> {
  assertString(valueName, 'valueName');
  assertProp(value, Symbol.iterator, isFunction, true, valueName);
}

/**
 * Creates a type predicate that checks whether a value is an instance of the provided constructor.
 * The returned predicate acts as a type guard for narrowing the value to the constructor's type.
 *
 * @param ctor - A constructor function to check against.
 * @returns A type predicate function that narrows the value type to an instance of the constructor.
 * @throws {@link TypeError} If `ctor` is not a function.
 * @typeParam T - The type of instances produced by the constructor.
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
 * @throws {@link TypeError} If `ctor` is not a function or if the value is not an instance of the constructor.
 * @typeParam T - The type of instances produced by the constructor.
 */
export function assertOfType<T>(
  ctor: Constructor<T>,
  value: unknown,
  name = 'value',
): asserts value is T {
  assertFunction(ctor, 'ctor');
  invariantPredicate(ofType(ctor), value, name);
}

// eslint-disable-next-line jsdoc/require-jsdoc
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
 */
export function somePredicate<TPredicates extends readonly Predicate[]>(
  ...predicates: TPredicates
): Predicate<ArrayItemsIntersection<PredicatesListArg<TPredicates>>>;

export function somePredicate(
  ...predicates: readonly Predicate[]
): Predicate<unknown> {
  assertArray(predicates, isFunction);

  const fn: Predicate<unknown> = (value) => {
    return predicates.some((predicate) => predicate(value));
  };

  return describeComplexPredicate(fn, false, ...predicates);
}

// eslint-disable-next-line jsdoc/require-jsdoc
export function everyPredicate<TGuards extends readonly TypePredicate[]>(
  ...predicates: TGuards
): TypePredicate<
  ArrayItemsIntersection<PredicatesListArg<TGuards>>,
  ArrayItemsIntersection<TypePredicatesListNarrows<TGuards>> &
    ArrayItemsIntersection<PredicatesListArg<TGuards>>
>;

/**
 * Creates a predicate that returns true if all the provided predicates are satisfied.
 *
 * @param predicates - A list of predicate functions to evaluate.
 * @returns A predicate function that checks if every predicate matches.
 * @typeParam TPredicates - The type of the list of predicates.
 */
export function everyPredicate<TPredicates extends readonly Predicate[]>(
  ...predicates: readonly Predicate[]
): Predicate<ArrayItemsIntersection<PredicatesListArg<TPredicates>>>;

export function everyPredicate(
  ...predicates: readonly Predicate[]
): Predicate<unknown> {
  assertArray(predicates, isFunction);

  const fn: Predicate<unknown> = (value) => {
    return predicates.every((predicate) => predicate(value));
  };

  return describeComplexPredicate(fn, true, ...predicates);
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ SAFE WRAPPERS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/* ─────────────────────────────── assert.ts ──────────────────────────────── */

/**
 * Asserts that a given condition is true. Throws an error if the condition is false.
 * The error message can be a string or a lazily evaluated function that returns a string.
 *
 * @param condition - A boolean expression that is expected to evaluate to true.
 * @param message - An optional error message or a function that generates the error message
 * if the condition evaluates to false. Defaults to 'Expected condition to be true'.
 * @throws {TypeError} In the following cases:
 * - If the provided `condition` is not a boolean.
 * - If the condition evaluates to false.
 */
export function invariant(
  condition: boolean,
  message: string | (() => string) = formatPredicateExpectedMessage(
    isTrue,
    false,
    'condition',
  ),
): asserts condition is true {
  assertBoolean(condition, 'condition');
  _invariant(
    isString(message) || isFunction(message),
    `Expected message to be a string or function, got ${formatDebugType(message)} instead`,
  );
  _invariant(
    condition,
    isString(message) ? message : (
      () => {
        const result = message();
        assertString(result, 'message function result');
        return result;
      }
    ),
  );
}

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
 */
export const invariantPredicate: typeof _invariantPredicate = (
  predicate: Predicate,
  value: unknown,
  valueName = 'value',
) => {
  assertFunction(predicate);
  assertString(valueName);
  _invariantPredicate(predicate, value, valueName);
};

/* ────────────────────────────── describe.ts ─────────────────────────────── */

/**
 * Adds a human-readable description to a given type guard function, enhancing its metadata.
 * This metadata can later be used for debugging, logging, or explanatory purposes.
 *
 * @internal
 * @param typeGuard - The type guard function responsible for evaluating whether a value satisfies
 *                    a specific type predicate.
 * @param typeDescription - A string description of the type that the `typeGuard` validates.
 * @returns The original type guard function, with the description attached.
 * @throws {TypeError} If `typeGuard` is not a function or `typeDescription` is not a string.
 */
export const describeTypePredicate: typeof _describeTypePredicate = (
  typeGuard,
  typeDescription,
) => {
  assertFunction(typeGuard, 'typeGuard');
  assertString(typeDescription, 'typeDescription');
  return _describeTypePredicate(typeGuard, typeDescription);
};

/**
 * Adds a human-readable description to a given predicate function, enhancing its metadata.
 * This metadata can later be used for debugging, logging, or explanatory purposes.
 *
 * @param predicate - The predicate function to associate with a description. Must be a valid function.
 * @param conditionDescription - A description explaining the condition represented by the predicate. Must be a string.
 * @returns The original predicate function, with the description attached.
 * @throws {TypeError} If `predicate` is not a function or `conditionDescription` is not a string.
 */
export const describePredicate: typeof _describePredicate = (
  predicate,
  conditionDescription,
) => {
  assertFunction(predicate, 'predicate');
  assertString(conditionDescription, 'conditionDescription');

  return _describePredicate(predicate, conditionDescription);
};

/**
 * Retrieves the descriptor associated with a given predicate function, if available.
 *
 * @internal
 * @param predicate - A predicate function to retrieve the descriptor from.
 * @returns The `PredicateDescriptor` associated with the predicate, or `undefined` if not present.
 * @throws {TypeError} If the provided `predicate` is not a function.
 */
export const getPredicateDescriptor: typeof _getPredicateDescriptor = (
  predicate,
) => {
  assertFunction(predicate, 'predicate');
  return _getPredicateDescriptor(predicate);
};

/* ─────────────────────────────── format.ts ──────────────────────────────── */

/**
 * Formats an error message indicating the expected condition for a predicate function.
 *
 * @param predicate - The predicate function to generate an error message for.
 * @param value - The value that failed to satisfy the predicate.
 * @param valueName - The name of the value for the error message. Defaults to 'value'.
 * @returns A formatted error message describing what was expected.
 * @throws {TypeError} If `predicate` is not a function or `valueName` is not a string.
 */
export const formatPredicateExpectedMessage: typeof _formatPredicateExpectedMessage =
  (predicate, value, valueName = 'value') => {
    assertFunction(predicate);
    assertString(valueName, 'valueName');

    return _formatPredicateExpectedMessage(predicate, value, valueName);
  };

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
 */
export const formatError: typeof _formatError = (error, options) => {
  assertError(error);

  return _formatError(error, options);
};

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ INTERNALS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

type PredicatesListArg<TPredicates extends readonly Predicate[]> =
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

type TypePredicatesListNarrows<TPredicates extends readonly TypePredicate[]> =
  TPredicates extends [infer TLeft, ...infer TRight] ?
    [
      TLeft extends TypePredicate<infer _, infer TNarrow> ? TNarrow : never,
      ...TypePredicatesListNarrows<
        TRight extends readonly TypePredicate[] ? TRight : never
      >,
    ]
  : TPredicates extends readonly [] ? []
  : TPredicates extends ReadonlyArray<TypePredicate<infer TArg>> ? TArg[]
  : never;
