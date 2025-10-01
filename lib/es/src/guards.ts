import type { Def, Nil, NonNil, Undef } from '@budsbox/lib-types';

import type { Predicate, TypeGuard } from './types.js';

/**
 * Checks if the provided value is `undefined`.
 *
 * @param value - The value to check for `undefined`.
 * @returns `true` if the value is `undefined`, otherwise `false`.
 */
export function isUndef(value: unknown): value is Undef {
  return value === undefined;
}

/**
 * Checks if a given value is defined (not `undefined`).
 *
 * @param value - The value to check.
 * @returns Whether the value is defined.
 */
export function isDef<U>(value: U): value is Def<U>;
/**
 * Checks if a given value is defined (not `undefined`).
 *
 * @param value - The value to be checked.
 * @returns Returns true if the value is defined, otherwise false.
 */
export function isDef(value: unknown): boolean {
  return value !== undefined;
}

/**
 * Checks if the provided value is `null` or `undefined`.
 *
 * @param value - The value to be checked.
 * @returns Returns `true` if the value is `null` or `undefined`, otherwise `false`.
 */
export function isNil(value: unknown): value is Nil {
  return value == null;
}

/**
 * Checks if the provided value is not null or undefined.
 *
 * @param value - The value to be checked.
 * @returns Returns true if the value is not null or undefined; otherwise, false.
 */
export function isNotNil<T>(value: T): value is NonNil<T>;
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

/**
 * Checks if the provided value is strictly equal to true.
 *
 * @param value - The value to check.
 * @returns Returns true if the value is strictly true, otherwise false.
 */
export function isTrue(value: unknown): value is true {
  return value === true;
}

/**
 * Determines if the provided value is strictly `false`.
 *
 * @param value - The value to be checked.
 * @returns Returns `true` if the value is `false`, otherwise returns `false`.
 */
export function isFalse(value: unknown): value is false {
  return value === false;
}

/**
 * Determines if the given value is truly, i.e., converts to true when used in a boolean context.
 *
 * @param value - The value to be tested for truthiness.
 * @returns Returns true if the value is truthy, false otherwise.
 */
export function isTruly(value: unknown): boolean {
  return Boolean(value);
}

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

/**
 * Checks if the given value is an object.
 *
 * @param value - The value to check.
 * @returns True if the value is an object, false otherwise.
 */
export function isObject(value: unknown): value is object {
  return value != null && typeof value === 'object';
}

/**
 * Checks if the provided value is a record.
 *
 * A record is considered an object where the keys are property keys,
 * and the values can be any type. The function also checks whether
 * empty records are allowed based on the specified flag.
 *
 * @param value - The value to check.
 * @param allowEmpty - Determines whether empty records are allowed.
 * @returns A boolean indicating whether the value is a record.
 */
export function isRecord(
  value: unknown,
  allowEmpty: boolean = false,
): value is Record<PropertyKey, unknown> {
  return isObject(value) && (allowEmpty || Object.keys(value).length > 0);
}

/**
 * Checks if the given value is an array.
 *
 * @typeParam T - Type of the value to be checked.
 * @param value - The value to check.
 * @returns True if the value is an array, otherwise false.
 */
export function isArray<T>(value: T | readonly T[]): value is readonly T[];
/**
 * Checks if the provided value is an array.
 *
 * @typeParam T - type of the value to be checked.
 * @param value - The value to be checked.
 * @returns True if the value is an array, otherwise false.
 */
export function isArray<T>(value: T | T[]): value is T[];
/**
 * Checks if the given value is an array.
 *
 * @param value - The value to be checked.
 * @returns Returns true if the value is an array, otherwise false.
 */
export function isArray(value: unknown): value is unknown[];
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}
/**
 * Determines if the provided value is of type Function.
 *
 * @param value - The value to be checked.
 * @returns True if the value is a function; otherwise, false.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function isFunction<TFn extends CallableFunction = CallableFunction>(
  value: unknown,
): value is TFn {
  return typeof value === 'function';
}

/**
 * Determines if the provided value is a string.
 *
 * @param value - The value to check.
 * @returns True if the value is a string, otherwise false.
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Checks if the provided value is a number and not NaN.
 *
 * @param value - The value to be checked.
 * @returns Returns true if the value is a number and not NaN, otherwise false.
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Checks if the given value is of type boolean.
 *
 * @param value - The value to check.
 * @returns A boolean indicating whether the value is a boolean or not.
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Determines if a given property exists on a source object and optionally
 * evaluates it with a provided predicate function.
 *
 * @param source - The object to check for the property existence. Can be `null` or `undefined`.
 * @param prop - The property key to check on the source.
 * @param test - Optional predicate function used to evaluate the property's value.
 * @returns Returns `false` since the source is `null` or `undefined` in this function signature.
 */
export function hasProp(
  source: Nil,
  prop: PropertyKey,
  test?: Predicate<unknown>,
): false;
/**
 * Checks if a given property exists on the provided object.
 *
 * @param source - The object to check for the property.
 * @param prop - The property key to check for existence on the object.
 * @returns A boolean indicating whether the property exists on the object.
 */
export function hasProp<TKey extends PropertyKey>(
  source: NonNil,
  prop: TKey,
): source is Record<TKey, unknown>;
/**
 * Checks if the given object has a specific property that meets the criteria
 * defined by a type guard function.
 *
 * @param source - The object to check for the property.
 * @param prop - The key of the property to check for in the object.
 * @param test - A type guard function that tests the property value against a type.
 * @returns Returns `true` if the object has the specified property and the value passes
 * the type guard, otherwise returns `false`.
 */
export function hasProp<
  TValue extends NonNil,
  TKey extends keyof TValue,
  TNarrowed extends TValue[TKey],
>(
  source: TValue,
  prop: TKey,
  test: TypeGuard<Required<TValue>[TKey], TNarrowed>,
): source is TValue & Record<TKey, TNarrowed>;
/**
 * Checks if the given `source` object has a property specified by `prop` and verifies
 * that the value of the property satisfies the condition defined by the `test` function.
 *
 * @param source - The object to be checked for the specified property.
 * @param prop - The key of the property to check for existence in the `source`.
 * @param test - A type guard function used to validate the type of the property's value.
 * @returns A boolean indicating whether the `source` has the specified property and the value
 * satisfies the type guard test.
 */
export function hasProp<TKey extends PropertyKey, TNarrowed>(
  source: unknown,
  prop: TKey,
  test: TypeGuard<unknown, TNarrowed>,
): source is Record<TKey, TNarrowed>;
/**
 * Checks if a given property exists on a source object and satisfies a specified test condition.
 *
 * @param source - The source object to check for the property.
 * @param prop - The property key to check in the source object.
 * @param test - A predicate function to test the value of the specified property.
 * @returns True if the property exists on the source object and the test predicate returns true; otherwise, false.
 */
export function hasProp<TValue extends NonNil, TKey extends keyof TValue>(
  source: TValue,
  prop: TKey,
  test: Predicate<Required<TValue>[TKey]>,
): boolean;
/**
 * Checks if a given property exists on the specified source object and optionally validates it using a predicate function.
 *
 * @param source - The object on which the property check is performed.
 * @param prop - The property key to check for existence in the source object.
 * @param test - An optional predicate function to validate the property value.
 * @returns Returns true if the property exists on the source object and the predicate (if provided) evaluates to true; otherwise, false.
 */
export function hasProp(
  source: unknown,
  prop: PropertyKey,
  test?: Predicate<unknown>,
): boolean;
export function hasProp(
  source: unknown,
  prop: PropertyKey,
  test?: Predicate<unknown>,
): boolean {
  return (
    isNotNil(source) &&
    Object.hasOwn(source, prop) &&
    (!isFunction(test) || test(source[prop as never]))
  );
}
