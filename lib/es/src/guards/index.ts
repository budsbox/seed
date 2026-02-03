import type { Predicate } from '@budsbox/lib-types';

import {
  invariant as _invariant,
  invariantPredicate as _invariantPredicate,
  assertBoolean,
  assertFunction,
  assertString,
} from './assert.js';
import { isFunction, isString, isTrue } from './check.js';
import {
  type PredicateDescriptor,
  describePredicate as _describePredicate,
  describeTypePredicate as _describeTypePredicate,
  getPredicateDescriptor as _getPredicateDescriptor,
} from './describe.js';
import {
  formatPredicateExpectedMessage as _formatPredicateExpectedMessage,
  debugValueType,
} from './message.js';
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

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ SAFE WRAPPERS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

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
    `Expected message to be a string or function, got ${debugValueType(message)} instead`,
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

/**
 *
 * @param predicate
 * @param value
 * @param valueName
 */
export const formatPredicateExpectedMessage: typeof _formatPredicateExpectedMessage =
  (predicate, value, valueName = 'value') => {
    assertFunction(predicate);
    assertString(valueName, 'valueName');

    return _formatPredicateExpectedMessage(predicate, value, valueName);
  };
