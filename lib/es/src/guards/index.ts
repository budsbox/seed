/**
 * This module provides type guards, assertions, and related utilities for JavaScript types.
 *
 * @module
 * @showCategories
 * @importTarget ./guards
 */

import type { Predicate } from '@budsbox/lib-types';

import type {
  DescribePredicateFn,
  DescribeTypePredicateFn,
  FormatDebugValueFn,
  FormatErrorFn,
  FormatOptions,
  FormatPredicateExpectedMessageFn,
  GetPredicateDescriptorFn,
  InvariantFn,
  InvariantPredicateFn,
} from './types.js';

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
  describePredicate as _describePredicate,
  describeTypePredicate as _describeTypePredicate,
  getPredicateDescriptor as _getPredicateDescriptor,
} from './describe.js';
import {
  formatDebugValue as _formatDebugValue,
  formatError as _formatError,
  formatPredicateExpectedMessage as _formatPredicateExpectedMessage,
  objectTag,
  shortObjectTag,
} from './format.js';
import { assertSome, everyPredicate } from './hlf.js';
import { assertOptionalProp } from './prop.js';

// Type exports
export type * from './types.js';

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
export { formatDebugType } from './format.js';
export * from './hlf.js';
export * from './prop.js';

export { objectTag, shortObjectTag };

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~ TYPE-SAFE WRAPPERS ~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/* ─────────────────────────────── assert.ts ──────────────────────────────── */

/**
 * {@link InvariantFn} implementation.
 *
 * @inheritDoc {@link InvariantFn}
 * @category Assertions
 */
export const invariant: InvariantFn = (
  condition,
  message = formatPredicateExpectedMessage(isTrue, false, 'condition'),
) => {
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
};

/**
 * {@link InvariantPredicateFn} implementation.
 *
 * @inheritDoc {@link InvariantPredicateFn}
 * @category Assertions
 */
export const invariantPredicate: InvariantPredicateFn = (
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
 * {@link DescribeTypePredicateFn} implementation.
 *
 * @inheritDoc {@link DescribeTypePredicateFn}
 * @category Describing
 */
export const describeTypePredicate: DescribeTypePredicateFn = (
  typeGuard,
  typeDescription,
) => {
  assertFunction(typeGuard, 'typeGuard');
  assertString(typeDescription, 'typeDescription');
  return _describeTypePredicate(typeGuard, typeDescription);
};

/**
 * {@link DescribePredicateFn} implementation.
 *
 * @inheritDoc {@link DescribePredicateFn}
 * @category Describing
 */
export const describePredicate: DescribePredicateFn = (
  predicate,
  conditionDescription,
) => {
  assertFunction(predicate, 'predicate');
  assertString(conditionDescription, 'conditionDescription');

  return _describePredicate(predicate, conditionDescription);
};

/**
 * {@link GetPredicateDescriptorFn} implementation.
 *
 * @inheritDoc {@link GetPredicateDescriptorFn}
 * @category Describing
 */
export const getPredicateDescriptor: GetPredicateDescriptorFn = (predicate) => {
  assertFunction(predicate, 'predicate');
  return _getPredicateDescriptor(predicate);
};

/* ─────────────────────────────── format.ts ──────────────────────────────── */

/**
 * {@link FormatPredicateExpectedMessageFn} implementation.
 *
 * @inheritDoc {@link FormatPredicateExpectedMessageFn}
 * @category Formatting
 */
export const formatPredicateExpectedMessage: FormatPredicateExpectedMessageFn =
  (predicate, value, valueName = 'value') => {
    assertFunction(predicate);
    assertString(valueName, 'valueName');

    return _formatPredicateExpectedMessage(predicate, value, valueName);
  };

/**
 * {@link FormatErrorFn} implementation.
 *
 * @inheritDoc {@link FormatErrorFn}
 * @category Formatting
 */
export const formatError: FormatErrorFn = (error, options) => {
  assertError(error);
  assertFormatOptions(options);

  return _formatError(error, options);
};

/**
 * {@link FormatDebugValueFn} implementation.
 *
 * @inheritDoc {@link FormatDebugValueFn}
 * @category Formatting
 */
export const formatDebugValue: FormatDebugValueFn = (value, options) => {
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
