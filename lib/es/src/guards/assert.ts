/**
 * @module
 * Provides assertion functions for runtime type checking and validation.
 * @categoryDescription Assertions
 * Assertion functions for runtime type checking and validation.
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

import type {
  InvariantFn,
  InvariantPredicateFn,
  NormalizedOptionalRest,
} from './types.js';

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
 * {@link InvariantFn} implementation.
 *
 * @inheritDoc {@link InvariantFn}
 */
export const invariant: InvariantFn = (
  condition: boolean,
  message: string | (() => string) = formatPredicateExpectedMessage(
    isTrue,
    false,
    'condition',
  ),
) => {
  if (!isTrue(condition))
    throw new TypeError(isFunction(message) ? message() : message);
};

/**
 * {@link InvariantPredicateFn} implementation.
 *
 * @inheritDoc {@link InvariantPredicateFn}
 */
export const invariantPredicate: InvariantPredicateFn = (
  predicate: Predicate,
  value: unknown,
  valueName = 'value',
) => {
  invariant(callPredicate(predicate, value), () =>
    formatPredicateExpectedMessage(predicate, value, valueName),
  );
};

/**
 * Evaluates a given predicate function with the specified value and an optional predicate name.
 * Narrows the type of the value if the predicate is a type guard.
 *
 * @param predicate - A function that takes a value of type `TValue` and returns a boolean.
 * @param value - The value to be passed to the predicate function.
 * @param predicateName - An optional name for the predicate, used for identification or debugging purposes.
 * @returns Returns `true` if the predicate function evaluates the value as valid, otherwise `false`.
 * @throws {@link !TypeError} in the following cases:
 * - If the provided `predicate` is not a function.
 * - If the predicate function does not return a boolean.
 * @typeParam TValue - The type of the value to be tested by the predicate.
 * @typeParam TGuardInput - The type of the input to the predicate in case it's a type guard.
 * @typeParam TNarrowed - The narrowed type of the value if the predicate is a type guard.
 * @category Other
 */
export function callPredicate<TNarrowed>(
  predicate: TypePredicate<unknown, TNarrowed>,
  value: unknown,
  predicateName?: string,
): value is TNarrowed;

export function callPredicate<
  TValue extends TGuardInput,
  TGuardInput,
  TNarrowed extends TGuardInput,
>(
  predicate: TypePredicate<TGuardInput, TNarrowed>,
  value: TValue,
  predicateName?: string,
): value is WithFallback<Extract<TValue, TNarrowed>, TValue & TNarrowed>;

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

/*
 * This function defined here, because it's required for some internal use cases,
 * such as in `assertProp` or `assertArray`. It's the internal implementation,
 * but it's reexported in `@budsbox/lib-es/function` for external use (with assertion checks).
 */
// eslint-disable-next-line jsdoc/require-jsdoc
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
 * @throws {@link !TypeError} If the value is undefined.
 * @typeParam T - The type of the value being asserted.
 * @category Assertions
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
 * @throws {@link !TypeError} If the value is null or undefined.
 * @category Assertions
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
 * @throws {@link !TypeError} If the value is not a string.
 * @category Assertions
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
 * @throws {@link !TypeError} If the value is not a number or NaN.
 * @remarks Throws a {@link !TypeError} if the value is NaN.
 * @category Assertions
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
 * @throws {@link !TypeError} If the value is not a symbol.
 * @category Assertions
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
 * @throws {@link !TypeError} If the value is not a valid property key.
 * @category Assertions
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
 * @throws {@link !TypeError} If the value is not a boolean.
 * @category Assertions
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
 * @throws {@link !TypeError} If the value is not a primitive type.
 * @category Assertions
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
 * @throws {@link !TypeError} If the value is not an object.
 * @category Assertions
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
 * @throws {@link !TypeError} If the value is not an array.
 * @typeParam T - The type of elements in the array.
 * @category Assertions
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
 * @throws {@link !TypeError} If the value is not a function.
 * @typeParam T - The type being checked.
 * @category Assertions
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
 * @throws {@link !TypeError} If the value is not a Date object.
 * @category Assertions
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
 * @throws {@link !TypeError} If the value is not a RegExp object.
 * @category Assertions
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
 * @throws {@link !TypeError} If the value is not an Error object.
 * @category Assertions
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
 * @throws {@link !TypeError} If the value is not a Map object.
 * @category Assertions
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
 * @throws {@link !TypeError} If the value is not a Set object.
 * @category Assertions
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
 * @throws {@link !TypeError} If the value is not a WeakMap object.
 * @category Assertions
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
 * @throws {@link !TypeError} If the value is not a WeakSet object.
 * @category Assertions
 */
export function assertWeakSetLike(
  value: unknown,
  name?: string,
): asserts value is WeakSet<WeakKey> {
  invariantPredicate(isWeakSetLike, value, name);
}
