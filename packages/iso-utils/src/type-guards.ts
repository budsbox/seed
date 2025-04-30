import type { Def, Falsy, Nil, Sure, Undef } from '@budsbox/types';

/**
 * Checks if the provided value is undefined.
 *
 * @param value - The value to check for undefined.
 * @return `true` if the value is undefined, otherwise `false`.
 */
export function isUndef(value: unknown): value is Undef {
  return value === undefined;
}

/**
 * Checks if a given value is defined (not `undefined`).
 *
 * @param value - The value to check.
 * @return Whether the value is defined.
 */
export function isDef<U>(value: U): value is Def<U>;
/**
 * Checks if a given value is defined (not `undefined`).
 *
 * @param value - The value to be checked.
 * @return Returns true if the value is defined, otherwise false.
 */
export function isDef(value: unknown): boolean {
  return value !== undefined;
}

/**
 * Checks if the provided value is `null` or `undefined`.
 *
 * @param value - The value to be checked.
 * @return - Returns `true` if the value is `null` or `undefined`, otherwise `false`.
 */
export function isNil(value: unknown): value is Nil {
  return value == null;
}

/**
 * Checks if the provided value is not null or undefined.
 *
 * @param value - The value to be checked.
 * @return - Returns true if the value is not null or undefined; otherwise, false.
 */
export function isNotNil<T>(value: T): value is Sure<T> {
  return !isNil(value);
}

/**
 * Checks if the provided value is strictly equal to true.
 *
 * @param {unknown} value - The value to check.
 * @return {value is true} - Returns true if the value is strictly true, otherwise false.
 */
export function isTrue(value: unknown): value is true {
  return value === true;
}

/**
 * Determines if the provided value is strictly `false`.
 *
 * @param value - The value to be checked.
 * @return Returns `true` if the value is `false`, otherwise returns `false`.
 */
export function isFalse(value: unknown): value is false {
  return value === false;
}

/**
 * Determines if the given value is truly, i.e., converts to true when used in a boolean context.
 *
 * @param {unknown} value - The value to be tested for truthiness.
 * @return {boolean} - Returns true if the value is truthy, false otherwise.
 */
export function isTruly<T>(value: T): value is Exclude<T, Falsy> {
  return Number.isNaN(value) ? true : Boolean(value);
}

/**
 * Determines if a given value is falsy.
 * A value is considered falsy if it evaluates to false when coerced to a boolean.
 *
 * @param {unknown} value The value to be tested.
 * @return {boolean} True if the value is falsy, otherwise false.
 */
export function isFalsy(value: unknown): value is Falsy {
  return !isTruly(value);
}

/**
 * Checks if the given value is an object.
 *
 * @param {unknown} value - The value to check.
 * @return {boolean} True if the value is an object, false otherwise.
 */
export function isObject(value: unknown): value is object {
  return value != null && typeof value === 'object';
}

/**
 * Checks if a given value is a non-empty object record.
 *
 * @param {unknown} value - The value to check.
 * @return {value is Record<string, unknown>} - Returns true if the value is a non-empty object record, otherwise false.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return isObject(value) && Object.keys(value).length > 0;
}

/**
 * Checks if the given value is an array.
 *
 * @template T - Type of the value to be checked.
 * @param value - The value to check.
 * @return True if the value is an array, otherwise false.
 */
export function isArray<T>(value: T | readonly T[]): value is readonly T[];

/**
 * Checks if the provided value is an array.
 *
 * @template T - type of the value to be checked.
 * @param value - The value to be checked.
 * @return True if the value is an array, otherwise false.
 */
export function isArray<T>(value: T | T[]): value is T[];
/**
 * Checks if the given value is an array.
 *
 * @param value - The value to be checked.
 * @return Returns true if the value is an array, otherwise false.
 */
export function isArray(value: unknown): value is unknown[];
export function isArray(value: unknown): boolean {
  return Array.isArray(value);
}

/**
 * Determines if the provided value is of type Function.
 *
 * @param value - The value to be checked.
 * @return True if the value is a function; otherwise, false.
 */
export function isFunction(value: unknown): value is Function;
/**
 * Checks if the given value is a function.
 *
 * @param {unknown} value - The value to be checked.
 * @return {boolean} Returns true if the value is a function, otherwise false.
 */
export function isFunction(value: unknown): boolean {
  return typeof value === 'function';
}

/**
 * Determines if the provided value is a string.
 *
 * @param value - The value to check.
 * @return True if the value is a string, otherwise false.
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Checks if the provided value is a number and not NaN.
 *
 * @param {unknown} value - The value to be checked.
 * @return {boolean} Returns true if the value is a number and not NaN, otherwise false.
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Checks if the given value is of type boolean.
 *
 * @param value - The value to check.
 * @return A boolean indicating whether the value is a boolean or not.
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}
