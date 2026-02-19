/**
 * @module
 * This module provides type guards for various JavaScript types.
 * @categoryDescription Checks
 * Type guards for JavaScript primitives and common types.
 */

import type { Primitive } from 'type-fest';

import type {
  AnyFunction,
  Nil,
  NonNil,
  Undef,
  UnknownFunction,
  WithFallback,
} from '@budsbox/lib-types';

import { describePredicate, describeTypePredicate } from './describe.js';

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ PRIMITIVES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

export type { Primitive };

/* ─────────────────────────────── Nullables ──────────────────────────────── */

/**
 * Checks if the provided value is `undefined`.
 *
 * @param value - The value to check for `undefined`.
 * @returns `true` if the value is `undefined`, otherwise `false`.
 * @example
 * ```typescript
 * isUndef(undefined); // true
 * isUndef(null); // false
 * isUndef(0); // false
 * ```
 * @category Checks
 */
export function isUndef(value: unknown): value is Undef {
  return value === undefined;
}

describeTypePredicate(isUndef, 'undefined');

/**
 * {@label OVERLOAD_T}
 *
 * Checks if a given value is defined (not `undefined`).
 *
 * @param value - The value to check.
 * @returns `true` if the value is defined, otherwise `false`.
 * @typeParam T - Type of the input value.
 * @example
 * ```typescript
 * isDef(undefined); // false
 * isDef(null); // true
 * isDef(42); // true
 * ```
 * @category Checks
 */
export function isDef<T>(value: T): value is NonNil<T> | (null & T);

/**
 * Checks if a given value is defined (not `undefined`).
 *
 * @param value - The value to check.
 * @returns `true` if the value is defined, otherwise `false`.
 * @example
 * ```typescript
 * isDef(undefined); // false
 * isDef(null); // true
 * isDef(42); // true
 * ```
 * @category Checks
 */
export function isDef(value: unknown): boolean {
  return value !== undefined;
}

describeTypePredicate(isDef, 'not undefined');

/**
 * Checks if the provided value is `null` or `undefined`.
 *
 * @param value - The value to be checked.
 * @returns `true` if the value is `null` or `undefined`, otherwise `false`.
 * @example
 * ```typescript
 * isNil(null); // true
 * isNil(undefined); // true
 * isNil(false); // false
 * isNil(''); // false
 * ```
 * @category Checks
 */
export function isNil(value: unknown): value is Nil {
  return value == null;
}

describeTypePredicate(isNil, 'null or undefined');

/**
 * {@label OVERLOAD_VALUE}
 *
 * Checks if the provided value is not `null` or `undefined`.
 *
 * @param value - The value to be checked.
 * @returns `true` if the value is not `null` or `undefined`; otherwise, `false`.
 * @example
 * ```typescript
 * isNotNil(null); // false
 * isNotNil(undefined); // false
 * isNotNil(0); // true
 * isNotNil(''); // true
 * ```
 * @category Checks
 */
export function isNotNil(value: unknown): value is NonNil;

/**
 * {@label OVERLOAD_UNKNOWN}
 *
 * Checks if the provided value is not `null` or `undefined`.
 *
 * @param value - The value to be checked.
 * @returns `true` if the value is not `null` or `undefined`; otherwise, `false`.
 * @example
 * ```typescript
 * isNotNil(null); // false
 * isNotNil(undefined); // false
 * isNotNil(0); // true
 * isNotNil(''); // true
 * ```
 * @category Checks
 */
export function isNotNil(value: unknown): boolean {
  return !isNil(value);
}

describeTypePredicate(isNotNil, 'non-nullable');

/* ──────────────────────────────── Boolean ───────────────────────────────── */

/**
 * Checks if the given value is of type ``boolean``.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a `boolean`, otherwise `false`.
 * @example
 * ```typescript
 * isBoolean(true); // true
 * isBoolean(false); // true
 * isBoolean(1); // false
 * isBoolean('true'); // false
 * ```
 * @category Checks
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

describeTypePredicate(isBoolean, 'boolean');

/**
 * Checks if the provided value is strictly equal to `true`.
 *
 * @param value - The value to check.
 * @returns `true` if the value is strictly `true`, otherwise `false`.
 * @example
 * ```typescript
 * isTrue(true); // true
 * isTrue(1); // false
 * isTrue('true'); // false
 * isTrue(false); // false
 * ```
 * @category Checks
 */
export function isTrue(value: unknown): value is true {
  return value === true;
}

describeTypePredicate(isTrue, 'true');

/**
 * Determines if the provided value is strictly `false`.
 *
 * @param value - The value to be checked.
 * @returns `true` if the value is `false`, otherwise `false`.
 * @example
 * ```typescript
 * isFalse(false); // true
 * isFalse(0); // false
 * isFalse(''); // false
 * isFalse(true); // false
 * ```
 * @category Checks
 */
export function isFalse(value: unknown): value is false {
  return value === false;
}

describeTypePredicate(isFalse, 'false');

/**
 * Determines if the given value is truthy, i.e., converts to `true` when used in a `boolean` context.
 *
 * @param value - The value to be tested for truthiness.
 * @returns `true` if the value is truthy, `false` otherwise.
 * @example
 * ```typescript
 * isTruly(true); // true
 * isTruly(1); // true
 * isTruly('hello'); // true
 * isTruly(0); // false
 * isTruly(''); // false
 * isTruly(null); // false
 * ```
 * @category Checks
 */
export function isTruly(value: unknown): boolean {
  return Boolean(value);
}

describePredicate(isTruly, 'to evaluates to true when coerced to a boolean');

/**
 * Determines if a given value is falsy.
 * A value is considered falsy if it evaluates to `false` when coerced to a `boolean`.
 *
 * @param value - The value to be tested.
 * @returns `true` if the value is falsy, otherwise `false`.
 * @example
 * ```typescript
 * isFalsy(false); // true
 * isFalsy(0); // true
 * isFalsy(''); // true
 * isFalsy(null); // true
 * isFalsy(undefined); // true
 * isFalsy('hello'); // false
 * ```
 * @category Checks
 */
export function isFalsy(value: unknown): boolean {
  return !isTruly(value);
}

describePredicate(isFalsy, 'to evaluates to false when coerced to a boolean');

/* ──────────────────────────────── Numeric ───────────────────────────────── */

/**
 * Checks if the provided value is a `number` and not {@link NaN}.
 *
 * @param value - The value to be checked.
 * @returns `true` if the value is a `number` and not {@link NaN}, otherwise `false`.
 * @example
 * ```typescript
 * isNumber(42); // true
 * isNumber(3.14); // true
 * isNumber(NaN); // false
 * isNumber('42'); // false
 * isNumber(null); // false
 * ```
 * @category Checks
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

describeTypePredicate(isNumber, 'number');

/**
 * Checks if a given value is of type `bigint`.
 *
 * @param value - The value to be checked.
 * @returns `true` if the value is a `bigint`, otherwise `false`.
 * @example
 * ```typescript
 * isBigint(42n); // true
 * isBigint(42); // false
 * isBigint('42'); // false
 * isBigint(BigInt(42)); // true
 * ```
 * @category Checks
 */
export function isBigint(value: unknown): value is bigint {
  return typeof value === 'bigint';
}

describeTypePredicate(isBigint, 'bigint');

/**
 * Determines whether a given number is positive.
 *
 * @param num - The `number` or `bigint` to check.
 * @returns `true` if the input is greater than zero, otherwise `false`.
 * @example
 * ```typescript
 * isPositive(42); // true
 * isPositive(0); // false
 * isPositive(-5); // false
 * isPositive(100n); // true
 * ```
 * @category Checks
 */
export function isPositive(num: bigint | number): boolean {
  return isBigint(num) ? num > 0n : num > 0;
}

describePredicate(isPositive, 'to be greater than zero');

/**
 * Determines whether a given number is non-negative.
 *
 * @param num - The number to check. It can be a `bigint` or a `number`.
 * @returns `true` if the provided number is greater than or equal to zero, otherwise `false`.
 * @example
 * ```typescript
 * isNonNegative(42); // true
 * isNonNegative(0); // true
 * isNonNegative(-1); // false
 * isNonNegative(0n); // true
 * ```
 * @category Checks
 */
export function isNonNegative(num: bigint | number): boolean {
  return isBigint(num) ? num >= 0n : num >= 0;
}

describePredicate(isNonNegative, 'to be greater than or equal to zero');

/**
 * Checks if the provided value is an integer.
 *
 * @param value - The value to check, which can be a `bigint` or `number`.
 * @returns `true` if the value is an integer, otherwise `false`.
 * @example
 * ```typescript
 * isInteger(42); // true
 * isInteger(3.14); // false
 * isInteger(42n); // true
 * ```
 * @category Checks
 */
export function isInteger(value: unknown): value is bigint | number {
  return isBigint(value) || Number.isInteger(value);
}

describeTypePredicate(isInteger, 'integer');

/* ────────────────────────────────── Misc ────────────────────────────────── */

/**
 * Determines if the provided value is a `string`.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a `string`, otherwise `false`.
 * @example
 * ```typescript
 * isString('hello'); // true
 * isString(42); // false
 * ```
 * @category Checks
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

describeTypePredicate(isString, 'string');

/**
 * Checks if the provided value is of type ``symbol``.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a `symbol`, otherwise `false`.
 * @example
 * ```typescript
 * isSymbol(Symbol('foo')); // true
 * isSymbol('foo'); // false
 * ```
 * @category Checks
 */
export const isSymbol = (value: unknown): value is symbol =>
  typeof value === 'symbol';

describeTypePredicate(isSymbol, 'symbol');

/**
 * Determines whether the given value is a valid JavaScript property key.
 *
 * A property key in JavaScript can be a `string`, `symbol`, or `number`, as these are
 * the types allowed for indexing object properties.
 *
 * @param value - The value to be checked as a potential property key.
 * @returns `true` if the value is a valid property key, otherwise `false`.
 * @example
 * ```typescript
 * isPropKey('foo'); // true
 * isPropKey(123); // true
 * isPropKey(Symbol('bar')); // true
 * isPropKey({}); // false
 * ```
 * @category Checks
 */
export const isPropKey = (value: unknown): value is PropertyKey =>
  isString(value) || isSymbol(value) || isNumber(value);

describeTypePredicate(
  isPropKey,
  'valid property key (string, symbol, or number)',
);

/**
 * Checks if a given value is a {@link Primitive} type (`null`, `undefined`, `boolean`, `string`, `number`, `symbol`, or `bigint`).
 *
 * @param value - The value to check.
 * @returns `true` if the value is a {@link Primitive} type, otherwise `false`.
 * @example
 * ```typescript
 * isPrimitive(42); // true
 * isPrimitive('foo'); // true
 * isPrimitive(null); // true
 * isPrimitive({}); // false
 * ```
 * @category Checks
 */
export const isPrimitive = (value: unknown): value is Primitive =>
  isNil(value) ||
  isBoolean(value) ||
  isString(value) ||
  isNumber(value) ||
  Number.isNaN(value) ||
  isSymbol(value) ||
  isBigint(value);

describeTypePredicate(
  isPrimitive,
  'a primitive (null, undefined, boolean, string, number, symbol, or bigint)',
);

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ OBJECT-LIKE ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Checks if the given value is an {@link object}.
 *
 * @param value - The value to check.
 * @returns `true` if the value is an {@link object}, `false` otherwise.
 * @example
 * ```typescript
 * isObject({}); // true
 * isObject([]); // true
 * isObject(null); // false
 * ```
 * @category Checks
 */
export function isObject(value: unknown): value is object {
  return value !== null && typeof value === 'object';
}

describeTypePredicate(isObject, 'object');

/**
 * Checks if the given value is an {@link Array}.
 *
 * @param value - The value to check.
 * @returns `true` if the value is an {@link Array}, otherwise `false`.
 * @typeParam T - Type of the value to be checked.
 * @example
 * ```typescript
 * isArray([1, 2, 3]); // true
 * isArray('foo'); // false
 * ```
 * @category Checks
 */
export function isArray<T>(
  value: T,
): value is WithFallback<Extract<T, readonly unknown[]>, T & unknown[]> {
  return Array.isArray(value);
}

describeTypePredicate(isArray, 'array');

/**
 * {@label OVERLOAD_T}
 *
 * Determines if the provided value is a function.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a function, otherwise `false`.
 * @typeParam T - The type of the value being checked.
 * @example
 * ```typescript
 * isFunction(() => {}); // true
 * isFunction(42); // false
 * ```
 * @category Checks
 */
export function isFunction<T>(
  value: T,
): value is WithFallback<Extract<T, AnyFunction>, UnknownFunction & T>;

/**
 * {@label OVERLOAD_TFN}
 *
 * Determines if the provided value is of type {@link Function}.
 *
 * @param value - The value to be checked.
 * @returns `true` if the value is a function, otherwise `false`.
 * @typeParam TFn - Function type to narrow to when the check passes.
 * @example
 * ```typescript
 * isFunction<() => void>(() => {}); // true
 * ```
 * @category Checks
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function isFunction<TFn extends AnyFunction = UnknownFunction>(
  value: unknown,
): value is TFn;

/**
 * {@label OVERLOAD_UNKNOWN}
 *
 * Determines if the provided value is a function.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a function, otherwise `false`.
 * @category Checks
 */
export function isFunction(value: unknown): value is AnyFunction;

/**
 * {@label OVERLOAD_BOOLEAN}
 *
 * Determines if the provided value is a function.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a function, otherwise `false`.
 * @category Checks
 */
export function isFunction(value: unknown): boolean {
  return typeof value === 'function';
}

describeTypePredicate(isFunction, 'function');

/**
 * Checks if the given value is a {@link Date} instance.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a {@link Date} instance, otherwise `false`.
 * @example
 * ```typescript
 * isDate(new Date()); // true
 * isDate('2023-01-01'); // false
 * ```
 * @category Checks
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

describeTypePredicate(isDate, 'Date');

/**
 * Checks if the given value is a {@link RegExp} instance.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a {@link RegExp} instance, otherwise `false`.
 * @example
 * ```typescript
 * isRegExp(/foo/); // true
 * isRegExp('foo'); // false
 * ```
 * @category Checks
 */
export function isRegExp(value: unknown): value is RegExp {
  return value instanceof RegExp;
}

describeTypePredicate(isRegExp, 'RegExp');

/**
 * Checks if the given value is an {@link Error} instance.
 *
 * @param value - The value to check.
 * @returns `true` if the value is an {@link Error} instance, otherwise `false`.
 * @example
 * ```typescript
 * isError(new Error('foo')); // true
 * isError({ message: 'foo' }); // false
 * ```
 * @category Checks
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

describeTypePredicate(isError, 'Error');

/**
 * Checks if the given value is a {@link Map} instance.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a {@link Map} instance, otherwise `false`.
 * @example
 * ```typescript
 * isMap(new Map()); // true
 * isMap({}); // false
 * ```
 * @category Checks
 */
export function isMap(value: unknown): value is Map<unknown, unknown> {
  return value instanceof Map;
}

describeTypePredicate(isMap, 'Map');

/**
 * Checks if the given value is a {@link Set} instance.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a {@link Set} instance, otherwise `false`.
 * @example
 * ```typescript
 * isSet(new Set()); // true
 * isSet([]); // false
 * ```
 * @category Checks
 */
export function isSet(value: unknown): value is Set<unknown> {
  return value instanceof Set;
}

describeTypePredicate(isSet, 'Set');

/**
 * Checks if the given value is a {@link WeakMap} or {@link Map} instance.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a {@link WeakMap} or {@link Map} instance, otherwise `false`.
 * @example
 * ```typescript
 * isWeakMapLike(new WeakMap()); // true
 * isWeakMapLike(new Map()); // true
 * isWeakMapLike({}); // false
 * ```
 * @category Checks
 */
export function isWeakMapLike(
  value: unknown,
): value is Map<unknown, unknown> | WeakMap<WeakKey, unknown> {
  return value instanceof WeakMap || isMap(value);
}

describeTypePredicate(isWeakMapLike, 'WeakMap or Map');

/**
 * Checks if the given value is a {@link WeakSet} or {@link Set} instance.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a {@link WeakSet} or {@link Set} instance, otherwise `false`.
 * @example
 * ```typescript
 * isWeakSetLike(new WeakSet()); // true
 * isWeakSetLike(new Set()); // true
 * isWeakSetLike([]); // false
 * ```
 * @category Checks
 */
export function isWeakSetLike(
  value: unknown,
): value is Set<unknown> | WeakSet<WeakKey> {
  return value instanceof WeakSet || value instanceof Set;
}

describeTypePredicate(isWeakSetLike, 'WeakSet or Set');

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ABSTRACT ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Determines whether two values are the same value using the
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness#same-value-zero_equality "SameValueZero" comparison algorithm}.
 *
 * @param x - The first value to be compared.
 * @param y - The second value to be compared.
 * @returns `true` if `x` and `y` are the same value according to the "SameValueZero" comparison, otherwise `false`.
 * @remarks
 * - It differs from strict equality (`===`) in that {@link NaN} is considered equal to itself.
 * - It differs from {@link Object.is} in that it considers `-0` and `+0` equal.
 * - It's the same algorithm used by {@link Set} and {@link Map} to compare elements.
 * @typeParam TValue - The type of the first value being compared.
 * @example
 * ```typescript
 * sameValueZero(0, -0); // true
 * sameValueZero(NaN, NaN); // true
 * sameValueZero(1, '1'); // false
 * ```
 * @category Checks
 */
export const sameValueZero = <TValue>(x: TValue, y: unknown): y is TValue =>
  Object.is(x, y) || (x === 0 && y === 0);
