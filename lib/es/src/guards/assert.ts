/**
 * @module
 * Provides assertion functions for runtime type checking and validation.
 */

import type {
  AnyFunction,
  NarrowedType,
  NonNil,
  Predicate,
  TypeGuard,
  Undef,
  UnknownFunction,
  WithFallback,
} from '@budsbox/lib-types';

import {
  isArray,
  isBoolean,
  isFunction,
  isNotNil,
  isNumber,
  isObject,
  isPropKey,
  isString,
  isSymbol,
  isTrue,
} from './check.js';
import {
  debugValueString,
  debugValueType,
  formatPredicateExpectedMessage,
} from './message.js';

/**
 * Asserts that a given condition is true. Throws an error if the condition is false.
 * The error message can be a string or a lazily evaluated function that returns a string.
 *
 * @internal
 * @param condition - A boolean expression that is expected to evaluate to true.
 * @param message - An optional error message or a function that generates the error message
 *                if the condition evaluates to false. Defaults to 'Expected condition to be true'.
 * @throws {TypeError} If the condition evaluates to false.
 */
export function invariant(
  condition: boolean,
  message: string | (() => string) = formatPredicateExpectedMessage(
    isTrue,
    false,
    'condition',
  ),
): asserts condition is true {
  if (!isTrue(condition))
    throw new TypeError(isFunction(message) ? message() : message);
}

// eslint-disable-next-line jsdoc/require-jsdoc
export function invariantPredicate<TNarrowed>(
  predicate: TypeGuard<unknown, TNarrowed>,
  value: unknown,
  valueName?: string,
): asserts value is TNarrowed;

// eslint-disable-next-line jsdoc/require-jsdoc
export function invariantPredicate<
  TValue extends TGuardInput,
  TGuardInput,
  TNarrowed extends TGuardInput,
>(
  predicate: TypeGuard<TGuardInput, TNarrowed>,
  value: TValue,
  valueName?: string,
): asserts value is TValue extends TNarrowed ? TValue : never;

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
export function invariantPredicate<TValue>(
  predicate: Predicate<TValue>,
  value: TValue,
  valueName?: string,
): void;

export function invariantPredicate(
  predicate: Predicate,
  value: unknown,
  valueName = 'value',
): void {
  invariant(callPredicate(predicate, value), () =>
    formatPredicateExpectedMessage(predicate, value, valueName),
  );
}

// eslint-disable-next-line jsdoc/require-jsdoc
export function callPredicate<TNarrowed>(
  predicate: TypeGuard<unknown, TNarrowed>,
  value: unknown,
  predicateName?: string,
): value is TNarrowed;

// eslint-disable-next-line jsdoc/require-jsdoc
export function callPredicate<
  TValue extends TGuardInput,
  TGuardInput,
  TNarrowed extends TGuardInput,
>(
  predicate: TypeGuard<TGuardInput, TNarrowed>,
  value: TValue,
  predicateName?: string,
): value is WithFallback<Extract<TValue, TNarrowed>, TValue & TNarrowed>;

/**
 * Evaluates a given predicate function with the specified value and an optional predicate name.
 * Narrows the type of the value if the predicate is a type guard.
 *
 * @param predicate - A function that takes a value of type `TValue` and returns a boolean.
 * @param value - The value to be passed to the predicate function.
 * @param predicateName - An optional name for the predicate, used for identification or debugging purposes.
 * @returns Returns `true` if the predicate function evaluates the value as valid, otherwise `false`.
 * @throws {@link TypeError} in the following cases:
 * - If the provided `predicate` is not a function.
 * - If the predicate function does not return a boolean.
 * @typeParam TValue - The type of the value to be tested by the predicate.
 */
export function callPredicate<TValue>(
  predicate: Predicate<TValue>,
  value: TValue,
  predicateName?: string,
): boolean;
export function callPredicate(
  predicate: Predicate,
  value: unknown,
  predicateName = 'predicate',
): boolean {
  if (!isFunction(predicate))
    throw new TypeError(
      formatPredicateExpectedMessage(isFunction, predicate, predicateName),
    );

  const result = predicate(value);
  if (!isBoolean(result))
    throw new TypeError(
      formatPredicateExpectedMessage(isBoolean, result, 'predicate result'),
    );
  return result;
}

/**
 * Asserts that the provided value is neither null nor undefined.
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @throws {TypeError} If the value is null or undefined.
 */
export function assertNotNil(
  value: unknown,
  name?: string,
): asserts value is NonNil {
  invariantPredicate(isNotNil, value, name);
}

/**
 * Asserts that the provided value is a string.
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @throws {TypeError} If the value is not a string.
 */
export function assertString(
  value: unknown,
  name?: string,
): asserts value is string {
  invariantPredicate(isString, value, name);
}

/**
 * Asserts that the provided value is a number and not NaN.
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @throws {TypeError} If the value is not a number or NaN.
 * @remarks Throws a {@link TypeError} if the value is NaN.
 */
export function assertNumber(
  value: unknown,
  name?: string,
): asserts value is number {
  invariantPredicate(isNumber, value, name);
}

/**
 * Asserts that the provided value is a symbol.
 *
 * @param value - The value to be checked.
 * @param name - An optional name for the value, used in the error message if the assertion fails. Defaults to 'value'.
 * @throws {TypeError} If the value is not a symbol.
 */
export function assertSymbol(
  value: unknown,
  name?: string,
): asserts value is symbol {
  invariantPredicate(isSymbol, value, name);
}

/**
 * Asserts that the provided value is a valid property key (string, number, or symbol).
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @throws {TypeError} If the value is not a valid property key.
 */
export function assertPropKey(
  value: unknown,
  name?: string,
): asserts value is PropertyKey {
  invariantPredicate(isPropKey, value, name);
}

/**
 * Asserts that the provided value is a boolean.
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @throws {TypeError} If the value is not a boolean.
 */
export function assertBoolean(
  value: unknown,
  name?: string,
): asserts value is boolean {
  invariantPredicate(isBoolean, value, name);
}

/**
 * Asserts that the provided value is an object.
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @throws {TypeError} If the value is not an object.
 */
export function assertObject(
  value: unknown,
  name?: string,
): asserts value is object {
  invariantPredicate(isObject, value, name);
}

/**
 * Asserts that the provided value is an array.
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @returns void
 * @throws {TypeError} If the value is not an array.
 * @typeParam T - The type of elements in the array.
 */
export function assertArray<T>(
  value: T,
  name?: string,
): asserts value is WithFallback<Extract<T, readonly unknown[]>, T & unknown[]>;
export function assertArray<
  TValue,
  TGuard extends TypeGuard<
    WithFallback<TValue extends ReadonlyArray<infer TItem> ? TItem : never>
  >,
>(
  value: TValue,
  typeGuard: TGuard,
  name?: string,
): asserts value is WithFallback<
  Extract<TValue, Array<NarrowedType<TGuard>>>,
  TValue & Array<NarrowedType<TGuard>>
>;
export function assertArray<TValue>(
  value: TValue,
  predicate: Predicate<
    WithFallback<TValue extends ReadonlyArray<infer TItem> ? TItem : never>
  >,
  name?: string,
): asserts value is WithFallback<
  Extract<TValue, readonly unknown[]>,
  TValue & unknown[]
>;
export function assertArray(
  value: unknown,
  ...rest:
    | readonly [name?: Undef<string>]
    | readonly [predicate: Predicate, name?: Undef<string>]
): void {
  invariant(
    rest.length <= 2,
    `Expected 1–3 arguments, got: ${String(rest.length + 1)}`,
  );
  let predicate: Predicate | undefined,
    name: string | undefined = 'value',
    index = 0;
  if (isFunction(rest[index])) predicate = rest[index++] as Predicate;
  if (isString(rest[index])) name = rest[index++] as string;
  invariant(
    index === rest.length,
    () =>
      `Invalid argument combination. Unexpected arguments at position ${String(
        index + 1,
      )}: ${debugValueString(rest.slice(index).map(debugValueType))}`,
  );

  invariantPredicate(isArray, value, name);
  if (isFunction(predicate))
    value.forEach(
      (el, i) =>
        void invariantPredicate(predicate, el, `${name}[${String(i)}]`),
    );
}

/**
 * Asserts that the provided value is a function.
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @returns void
 * @throws {TypeError} If the value is not a function.
 * @typeParam T - The type being checked.
 */
export function assertFunction<T>(
  value: T,
  name?: string,
): asserts value is WithFallback<Extract<T, AnyFunction>, UnknownFunction & T>;
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function assertFunction<TFn extends AnyFunction = UnknownFunction>(
  value: unknown,
  name?: string,
): asserts value is TFn;
export function assertFunction(value: unknown, name?: string): void {
  invariantPredicate(isFunction, value, name);
}
