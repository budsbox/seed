/**
 * @module
 * Provides assertion functions for runtime type checking and validation.
 */

import type { Primitive } from 'type-fest';

import type {
  AnyFunction,
  NarrowedType,
  NonNil,
  Predicate,
  TypePredicate,
  Undef,
  UnknownFunction,
  WithFallback,
} from '@budsbox/lib-types';

import type { NormalizedOptionalRest } from './types.js';

import {
  isArray,
  isBoolean,
  isDate,
  isDef,
  isError,
  isFunction,
  isMap,
  isNotNil,
  isNumber,
  isObject,
  isPrimitive,
  isPropKey,
  isRegExp,
  isSet,
  isString,
  isSymbol,
  isTrue,
  isWeakMapLike,
  isWeakSetLike,
} from './check.js';
import { describeComplexPredicate } from './describe.js';
import {
  formatAccessString,
  formatPredicateExpectedMessage,
} from './format.js';

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ GENERAL ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

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
  predicate: TypePredicate<unknown, TNarrowed>,
  value: unknown,
  valueName?: string,
): asserts value is TNarrowed;

// eslint-disable-next-line jsdoc/require-jsdoc
export function invariantPredicate<
  TValue extends TGuardInput,
  TGuardInput,
  TNarrowed extends TGuardInput,
>(
  predicate: TypePredicate<TGuardInput, TNarrowed>,
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
  predicate: TypePredicate<unknown, TNarrowed>,
  value: unknown,
  predicateName?: string,
): value is TNarrowed;

// eslint-disable-next-line jsdoc/require-jsdoc
export function callPredicate<
  TValue extends TGuardInput,
  TGuardInput,
  TNarrowed extends TGuardInput,
>(
  predicate: TypePredicate<TGuardInput, TNarrowed>,
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
 * Normalizes a sequence of optional rest arguments by matching them against a series of type predicates.
 *
 * This function takes an array of arguments and attempts to match each argument against the corresponding
 * predicate in the sequence. Arguments that match their predicates are placed at their respective positions
 * in the output array, while unmatched positions are filled with `undefined`. This enables flexible function
 * signatures where arguments can be provided with gaps as long as they're in the right order.
 *
 * The function validates that:
 * - No more arguments are provided than there are predicates
 * - Each argument matches its corresponding predicate in sequence
 * - Any remaining arguments after a successful match also satisfy the subsequent predicates
 *
 * @param predicateSequence - An ordered array of type predicates that define the expected types for each position.
 * @param args - The actual arguments to normalize against the predicate sequence.
 * @param restShift - An optional offset added to argument indices in error messages, useful when these
 *                   arguments are part of a larger parameter list. Defaults to 0.
 * @returns A tuple where each element is either the matched argument value or `undefined` if no match was found
 *         at that position. The length matches the predicate sequence length.
 * @throws {TypeError} If more arguments are provided than predicates in the sequence.
 * @throws {TypeError} If an argument doesn't match any of the remaining predicates in the sequence.
 * @typeParam TPredicateSequence - a tuple of predicate types.
 * @remarks For this function to work, a predicate sequence has to be tuple. Use `as const` to convert array to tuple.
 * @example
 * ```typescript
 * normalizeOptionalRest([isString, isBoolean, isNumber], ['foo'])
 * // Returns: ['foo', undefined, undefined]
 *
 * normalizeOptionalRest([isString, isBoolean, isNumber], [true])
 * // Returns: [undefined, true, undefined]
 *
 * normalizeOptionalRest([isString, isBoolean, isNumber], ['foo', true, 1])
 * // Returns: ['foo', true, 1]
 *
 * normalizeOptionalRest([isString, isBoolean, isNumber] as const, ['foo', 1])
 * // Returns: ['foo', undefined, 1]
 *
 * // Using restShift for better error messages in nested contexts
 * normalizeOptionalRest([isString, isBoolean] as const, ['foo', 'bar'], 2)
 * // Throws: TypeError with message referencing rest[3] instead of rest[1]
 *
 * // Trailing undefined values are ignored
 * normalizeOptionalRest([isString, isBoolean, isNumber] as const, ['foo', true, undefined])
 * // Returns: ['foo', true, undefined]
 * ```
 */
export function normalizeOptionalRest<
  TPredicateSequence extends ReadonlyArray<Predicate<unknown>>,
>(
  predicateSequence: TPredicateSequence,
  args: readonly unknown[],
  restShift?: number,
): NormalizedOptionalRest<TPredicateSequence>;
export function normalizeOptionalRest(
  predicateSequence: ReadonlyArray<Predicate<unknown>>,
  args: readonly unknown[],
  restShift: number = 0,
): unknown[] {
  if (args.length > predicateSequence.length)
    throw new TypeError(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      `Too many arguments provided. Expected at most ${predicateSequence.length + restShift}, got ${args.length + restShift}`,
    );

  const output = new Array<unknown>(predicateSequence.length).fill(undefined);
  let predicateSuccessIndex = -1,
    argIndex = 0;

  for (let i = 0; i < predicateSequence.length; i++) {
    const predicate = predicateSequence[i]!;
    if (callPredicate(predicate, args[argIndex])) {
      predicateSuccessIndex = i;
      output[i] = args[argIndex++];
    }
  }

  if (
    argIndex < args.length &&
    !args.slice(argIndex).every((v) => v === undefined)
  ) {
    invariantPredicate(
      describeComplexPredicate(
        () => false, // dummy
        false,
        ...predicateSequence.slice(predicateSuccessIndex + 1),
      ),
      args[argIndex],
      formatAccessString('args', argIndex + restShift),
    );
  }

  return output;
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ASSERTIONS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Asserts that the given value is defined (not undefined).
 *
 * @param value - The value to be checked for being defined.
 * @param name - An optional name or description of the value included in the error message if the assertion fails.
 * @throws {TypeError} If the value is undefined.
 * @typeParam T - The type of the value being asserted.
 */
export function assertDef<T>(
  value: T,
  name?: string,
): asserts value is NonNil<T> | (null & T) {
  invariantPredicate(isDef, value, name);
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
 * Asserts that the provided value is a primitive type (string, number, boolean, bigint, symbol, null, or undefined).
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @throws {TypeError} If the value is not a primitive type.
 */
export function assertPrimitive(
  value: unknown,
  name?: string,
): asserts value is Primitive {
  invariantPredicate(isPrimitive, value, name);
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
  TGuard extends TypePredicate<
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
  const [predicate, name = 'valueName'] = normalizeOptionalRest(
    [isFunction, isString] as const,
    rest,
    1,
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

/**
 * Asserts that the provided value is a Date object.
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @throws {TypeError} If the value is not a Date object.
 */
export function assertDate(
  value: unknown,
  name?: string,
): asserts value is Date {
  invariantPredicate(isDate, value, name);
}

/**
 * Asserts that the provided value is a RegExp object.
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @throws {TypeError} If the value is not a RegExp object.
 */
export function assertRegExp(
  value: unknown,
  name?: string,
): asserts value is RegExp {
  invariantPredicate(isRegExp, value, name);
}

/**
 * Asserts that the provided value is an Error object.
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @throws {TypeError} If the value is not an Error object.
 */
export function assertError(
  value: unknown,
  name?: string,
): asserts value is Error {
  invariantPredicate(isError, value, name);
}

/**
 * Asserts that the provided value is a Map object.
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @throws {TypeError} If the value is not a Map object.
 */
export function assertMap(
  value: unknown,
  name?: string,
): asserts value is Map<unknown, unknown> {
  invariantPredicate(isMap, value, name);
}

/**
 * Asserts that the provided value is a Set object.
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @throws {TypeError} If the value is not a Set object.
 */
export function assertSet(
  value: unknown,
  name?: string,
): asserts value is Set<unknown> {
  invariantPredicate(isSet, value, name);
}

/**
 * Asserts that the provided value is WeakMap-like (a WeakMap object).
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @throws {TypeError} If the value is not a WeakMap object.
 */
export function assertWeakMapLike(
  value: unknown,
  name?: string,
): asserts value is WeakMap<WeakKey, unknown> {
  invariantPredicate(isWeakMapLike, value, name);
}

/**
 * Asserts that the provided value is WeakSet-like (a WeakSet object).
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @throws {TypeError} If the value is not a WeakSet object.
 */
export function assertWeakSetLike(
  value: unknown,
  name?: string,
): asserts value is WeakSet<WeakKey> {
  invariantPredicate(isWeakSetLike, value, name);
}
