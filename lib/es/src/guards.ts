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
export function isArray<T>(value: readonly T[] | T): value is readonly T[];
/**
 * Checks if the provided value is an array.
 *
 * @typeParam T - type of the value to be checked.
 * @param value - The value to be checked.
 * @returns True if the value is an array, otherwise false.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
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
 * Determines whether the provided value is an iterable.
 *
 * @param value - The value to be checked.
 * @returns `true` if the value is iterable, otherwise `false`.
 */
export function isIterable(value: unknown): value is Iterable<unknown> {
  return hasProp(value, Symbol.iterator, isFunction, true);
}

// eslint-disable-next-line jsdoc/require-jsdoc
export function hasProp(
  source: Nil,
  prop: PropertyKey,
  checkProto?: boolean,
): false;
// eslint-disable-next-line jsdoc/require-jsdoc
export function hasProp(
  source: Nil,
  key: PropertyKey,
  test?: Predicate<unknown>,
  checkProto?: boolean,
): false;
/**
 * Checks if a property exists on the provided source object.
 *
 * Narrows the source type to include the specified property key with an unknown value.
 *
 * @param source - The object to check.
 * @param key - The property key to verify.
 * @param checkProto - Whether to check the prototype chain.
 * @returns Type guard indicating whether the property exists.
 */
export function hasProp<TSource, TKey extends PropertyKey>(
  source: TSource,
  key: TKey,
  checkProto?: boolean,
): source is TSource & Record<TKey, unknown>;
// eslint-disable-next-line jsdoc/require-jsdoc
export function hasProp<
  TSource extends NonNil,
  TKey extends keyof TSource,
  TNarrowed extends TSource[TKey],
>(
  source: TSource,
  key: TKey,
  test: TypeGuard<TSource[TKey], TNarrowed>,
  checkProto?: boolean,
): source is TSource & Record<TKey, TNarrowed>;
/**
 * Checks if a property exists on a non-null source and passes a type guard test.
 *
 * Narrows both the source type and the property value type based on the provided type guard.
 *
 * @param source - The object to check.
 * @param key - The property key to verify.
 * @param test - A type guard to narrow the property value type.
 * @param checkProto - Whether to check the prototype chain.
 * @returns Type guard indicating whether the property exists and satisfies the test.
 */
export function hasProp<TSource, TKey extends PropertyKey, TNarrowed>(
  source: TSource,
  key: TKey,
  test: TypeGuard<unknown, TNarrowed>,
  checkProto?: true,
): source is TSource & Record<TKey, TNarrowed>;
// eslint-disable-next-line jsdoc/require-jsdoc
export function hasProp<TSource extends NonNil, TKey extends keyof TSource>(
  source: TSource,
  key: TKey,
  test: Predicate<TSource[TKey]>,
  checkProto?: boolean,
): source is TSource & Record<TKey, unknown>;
/**
 * Checks if a property exists on the provided source and optionally passes a test.
 *
 * Narrows the source type to include the specified property key with an unknown value.
 *
 * @param source - The object to check.
 * @param key - The property key to verify.
 * @param test - An optional predicate or type guard to test the property value.
 * @param checkProto - Whether to check the prototype chain.
 * @returns Type guard indicating whether the property exists and passes the test.
 */
export function hasProp<TSource, TKey extends PropertyKey>(
  source: TSource,
  key: TKey,
  test?: Predicate<unknown>,
  checkProto?: boolean,
): source is TSource & Record<TKey, unknown>;
export function hasProp(
  source: unknown,
  key: PropertyKey,
  option1?: boolean | Nil | Predicate<unknown>,
  option2?: boolean | Nil,
): boolean {
  // Guard against prototype pollution
  if (key === '__proto__' || key === 'constructor') {
    return false;
  }

  let test: Predicate<unknown> | undefined,
    checkProto: boolean = false;
  if (isFunction(option1)) {
    test = option1;

    if (isBoolean(option2)) {
      checkProto = option2;
    }
  } else if (isBoolean(option1)) {
    checkProto = option1;
  }

  return (
    isNotNil(source) &&
    (checkProto ? key in source : Object.hasOwn(source, key)) &&
    (!isFunction(test) || test(source[key as never]))
  );
}
