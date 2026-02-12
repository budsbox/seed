import type { Predicate } from '@budsbox/lib-types';

import {
  invariant as _invariant,
  invariantPredicate as _invariantPredicate,
  assertBoolean,
  assertError,
  assertFunction,
  assertString,
} from './assert.js';
import {
  isFunction,
  isInteger,
  isNonNegative,
  isNumber,
  isObject,
  isString,
  isTrue,
  isUndef,
  isWeakSetLike,
} from './check.js';
import {
  type PredicateDescriptor,
  describePredicate as _describePredicate,
  describeTypePredicate as _describeTypePredicate,
  getPredicateDescriptor as _getPredicateDescriptor,
} from './describe.js';
import {
  type FormatOptions,
  formatDebugValue as _formatDebugValue,
  formatError as _formatError,
  formatPredicateExpectedMessage as _formatPredicateExpectedMessage,
  objectTag,
} from './format.js';
import { assertSome, everyPredicate } from './hlf.js';
import { assertOptionalProp } from './prop.js';

// Value exports
export {
  assertArray,
  assertBoolean,
  assertDate,
  assertDef,
  assertError,
  assertFunction,
  assertMap,
  assertNotNil,
  assertNumber,
  assertObject,
  assertPrimitive,
  assertPropKey,
  assertRegExp,
  assertSet,
  assertString,
  assertSymbol,
  assertWeakMapLike,
  assertWeakSetLike,
  callPredicate,
} from './assert.js';
export * from './check.js';
export * from './hlf.js';
export * from './prop.js';

export type { PredicateDescriptor };
export { objectTag };

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~ TYPE-SAFE WRAPPERS ~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

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
  assertSome(message, 'message', isString, isFunction);
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
  assertFormatOptions(options);

  return _formatError(error, options);
};

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
 */
export const formatDebugValue: typeof _formatDebugValue = (value, options) => {
  assertFormatOptions(options);

  return _formatDebugValue(value, options);
};

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ INTERNALS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/* ─────────────────────────────── Utilities ──────────────────────────────── */

function assertFormatOptions(
  options?: FormatOptions,
): asserts options is FormatOptions {
  assertSome(options, 'options', isObject, isUndef);
  const numberKeys = ['maxDepth', 'maxLength', 'maxItems'] as const;
  for (const key of numberKeys)
    assertOptionalProp(
      options,
      key,
      everyPredicate(isNumber, isNonNegative, isInteger),
    );
  assertOptionalProp(options, 'seen', isWeakSetLike, 'options');
}
