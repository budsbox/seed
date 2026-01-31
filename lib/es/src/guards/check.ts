import type { Primitive } from 'type-fest';

import type {
  AnyFunction,
  Nil,
  NonNil,
  Undef,
  UnknownFunction,
  WithFallback,
} from '@budsbox/lib-types';

import { describePredicate, describeTypeGuard } from './describe.js';

/**
 * Checks if the provided value is `undefined`.
 *
 * @param value - The value to check for `undefined`.
 * @returns `true` if the value is `undefined`, otherwise `false`.
 */
export function isUndef(value: unknown): value is Undef {
  return value === undefined;
}

describeTypeGuard(isUndef, 'undefined');

/**
 * Checks if a given value is defined (not `undefined`).
 *
 * @param value - The value to check.
 * @returns Whether the value is defined.
 * @typeParam T - Type of the input value.
 * @privateRemarks This "sophisticated" type guard narrows isDef(unknown) to `{} | null`
 */
export function isDef<T>(value: T): value is NonNil<T> | (null & T);
export function isDef(value: unknown): boolean {
  return value !== undefined;
}

describeTypeGuard(isDef, 'not undefined');

/**
 * Checks if the provided value is `null` or `undefined`.
 *
 * @param value - The value to be checked.
 * @returns Returns `true` if the value is `null` or `undefined`, otherwise `false`.
 */
export function isNil(value: unknown): value is Nil {
  return value == null;
}

describeTypeGuard(isNil, 'null or undefined');

/**
 * Checks if the provided value is not null or undefined.
 *
 * @param value - The value to be checked.
 * @returns Returns true if the value is not null or undefined; otherwise, false.
 */
export function isNotNil(value: unknown): value is NonNil;
export function isNotNil(value: unknown): boolean {
  return !isNil(value);
}

describeTypeGuard(isNotNil, 'non-nullable');

/**
 * Checks if the provided value is strictly equal to true.
 *
 * @param value - The value to check.
 * @returns Returns true if the value is strictly true, otherwise false.
 */
export function isTrue(value: unknown): value is true {
  return value === true;
}

describeTypeGuard(isTrue, 'true');

/**
 * Determines if the provided value is strictly `false`.
 *
 * @param value - The value to be checked.
 * @returns Returns `true` if the value is `false`, otherwise returns `false`.
 */
export function isFalse(value: unknown): value is false {
  return value === false;
}

describeTypeGuard(isFalse, 'false');

/**
 * Determines if the provided value is a string.
 *
 * @param value - The value to check.
 * @returns True if the value is a string, otherwise false.
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

describeTypeGuard(isString, 'string');

/**
 * Checks if the provided value is a number and not NaN.
 *
 * @param value - The value to be checked.
 * @returns Returns true if the value is a number and not NaN, otherwise false.
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

describeTypeGuard(isNumber, 'number');

/**
 * Checks if a given value is of type `bigint`.
 *
 * @param value - The value to be checked.
 * @returns Returns `true` if the value is a `bigint`, otherwise `false`.
 */
export function isBigint(value: unknown): value is bigint {
  return typeof value === 'bigint';
}

describeTypeGuard(isBigint, 'bigint');

/**
 * Checks if the given value is of type `boolean`.
 *
 * @param value - The value to check.
 * @returns A boolean indicating whether the value is a boolean or not.
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

describeTypeGuard(isBoolean, 'boolean');

/**
 * Checks if the provided value is of type `symbol`.
 *
 * @param value - The value to check.
 * @returns Returns `true` if the value is a symbol; otherwise, returns `false`.
 */
export const isSymbol = (value: unknown): value is symbol =>
  typeof value === 'symbol';

describeTypeGuard(isSymbol, 'symbol');

/**
 * Determines whether the given value is a valid JavaScript property key.
 *
 * A property key in JavaScript can be a string, symbol, or number, as these are
 * the types allowed for indexing object properties.
 *
 * @param value - The value to be checked as a potential property key.
 * @returns Returns `true` if the value is a valid property key; otherwise, returns `false`.
 */
export const isPropKey = (value: unknown): value is PropertyKey =>
  isString(value) || isSymbol(value) || isNumber(value);

describeTypeGuard(
  isPropKey,
  'valid property key (i.e., string, symbol, or number)',
);

/**
 * Checks if a given value is a primitive type.
 *
 * A value is considered primitive if it is `null`, `undefined`, `boolean`, `string`, `number`, `symbol`, or `bigint`.
 *
 * @param value - The value to check.
 * @returns A boolean indicating whether the value is a primitive type.
 */
export const isPrimitive = (value: unknown): value is Primitive =>
  isNil(value) ||
  isBoolean(value) ||
  isString(value) ||
  isNumber(value) ||
  Number.isNaN(value) ||
  isSymbol(value) ||
  isBigint(value);

/**
 * Determines if the given value is truly, i.e., converts to true when used in a boolean context.
 *
 * @param value - The value to be tested for truthiness.
 * @returns Returns true if the value is truthy, false otherwise.
 */
export function isTruly(value: unknown): boolean {
  return Boolean(value);
}

describePredicate(isTruly, 'to evaluates to true when coerced to a boolean');

/**
 * Determines if a given value is falsy.
 * A value is considered falsy if it evaluates to false when coerced to a boolean.
 *
 * @param value - The value to be tested.
 * @returns True if the value is falsy, otherwise false.
 */
export function isFalsy(value: unknown): boolean {
  return !isTruly(value);
}

describePredicate(isFalsy, 'to evaluates to false when coerced to a boolean');

/**
 * Checks if the given value is an object.
 *
 * @param value - The value to check.
 * @returns True if the value is an object, false otherwise.
 */
export function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

describeTypeGuard(isObject, 'object');

/**
 * Checks if the given value is an array.
 *
 * @param value - The value to check.
 * @returns True if the value is an array, otherwise false.
 * @typeParam T - Type of the value to be checked.
 */
export function isArray<T>(
  value: T,
): value is WithFallback<Extract<T, readonly unknown[]>, T & unknown[]> {
  return Array.isArray(value);
}

describeTypeGuard(isArray, 'array');

/**
 * Determines if the provided value is a function.
 *
 * @param value - The value to check.
 * @returns A narrowed type indicating whether the value is a function.
 * @typeParam T - The type of the value being checked.
 */
export function isFunction<T>(
  value: T,
): value is WithFallback<Extract<T, AnyFunction>, UnknownFunction & T>;

/**
 * Determines if the provided value is of type Function.
 *
 * @param value - The value to be checked.
 * @returns True if the value is a function; otherwise, false.
 * @typeParam TFn - Function type to narrow to when the check passes.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function isFunction<TFn extends AnyFunction = UnknownFunction>(
  value: unknown,
): value is TFn;
export function isFunction(value: unknown): boolean {
  return typeof value === 'function';
}

describeTypeGuard(isFunction, 'function');
