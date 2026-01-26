import type { IsNever, Primitive } from 'type-fest';

import type {
  AnyFunction,
  Nil,
  NonNil,
  Undef,
  WithFallback,
} from '@budsbox/lib-types';
import type {
  AnyRecord,
  DistributedPropValue,
} from '@budsbox/lib-types/object';

import type {
  NarrowedType,
  PlainPredicate,
  Predicate,
  PredicateDescriptor,
  TypeGuard,
} from './types.js';

const descriptionSymbol = Symbol.for('@budsbox/lib-es#predicateDescription');

/**
 * Adds a human-readable description to a given type guard function, enhancing its metadata.
 * This metadata can later be used for debugging, logging, or explanatory purposes.
 *
 * @param typeGuard - The type guard function responsible for evaluating whether a value satisfies
 *                    a specific type predicate.
 * @param typeDescription - A string description of the type that the `typeGuard` validates.
 * @throws {TypeError} If `typeGuard` is not a function or `typeDescription` is not a string.
 */
export const describeTypeGuard = (
  typeGuard: TypeGuard,
  typeDescription: string,
): void => {
  if (!isFunction(typeGuard))
    throw new TypeError('Expected typeGuard to be a function');
  if (!isString(typeDescription))
    throw new TypeError('Expected typeDescription to be a string');
  Object.defineProperty(typeGuard, descriptionSymbol, {
    value: { type: typeDescription } as const satisfies PredicateDescriptor,
  });
};

/**
 * Adds a human-readable description to a given predicate function, enhancing its metadata.
 * This metadata can later be used for debugging, logging, or explanatory purposes.
 *
 * @param predicate - The predicate function to associate with a description. Must be a valid function.
 * @param conditionDescription - A description explaining the condition represented by the predicate. Must be a string.
 * @throws {TypeError} If `predicate` is not a function or `conditionDescription` is not a string.
 */
export const describePredicate = (
  predicate: Predicate,
  conditionDescription: string,
): void => {
  if (!isFunction(predicate))
    throw new TypeError(
      `Expected predicate to be a function, got ${typeof predicate} instead.`,
    );
  if (!isString(conditionDescription))
    throw new TypeError(
      `Expected predicateDescription to be a string, got ${typeof conditionDescription} instead.`,
    );
  Object.defineProperty(predicate, descriptionSymbol, {
    value: {
      condition: conditionDescription,
    } as const satisfies PredicateDescriptor,
  });
};

/**
 * Retrieves the descriptor associated with a given predicate function, if available.
 *
 * @param predicate - A predicate function to retrieve the descriptor from.
 * @returns The `PredicateDescriptor` associated with the predicate, or `undefined` if not present.
 * @throws {TypeError} If the provided `predicate` is not a function.
 */
export const getPredicateDescriptor = (
  predicate: Predicate,
): PredicateDescriptor | undefined => {
  if (!isFunction(predicate))
    throw new TypeError(
      `Expected predicate to be a function, got ${typeof predicate} instead.`,
    );

  if (hasProp(predicate, descriptionSymbol, isObject)) {
    return predicate[descriptionSymbol] as PredicateDescriptor;
  }

  return;
};

/**
 * Generates a textual description for a given predicate function.
 *
 * @param predicate - The predicate function for which to generate a description.
 * @returns A string describing the predicate, including its condition or type,
 *          or a fallback description when no descriptor is available.
 */
export const getPredicateDescription = (predicate: Predicate): string => {
  const descriptor = getPredicateDescriptor(predicate);

  if (isNotNil(descriptor)) {
    if (hasProp(descriptor, 'condition')) {
      return descriptor.condition;
    } else {
      return `to be ${descriptor.type}`;
    }
  }

  const name = predicate.name || '(anonymous)';

  return `to satisfy predicate ${name}`;
};

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
 * @typeParam U - Type of the input value.
 */
export function isDef<U>(value: Undef<U>): value is U;

/**
 * Checks if a given value is defined (not `undefined`).
 *
 * @param value - The value to be checked.
 * @returns Returns true if the value is defined, otherwise false.
 */
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
 * Checks if the provided value is a record.
 *
 * A record is considered an object where the keys are property keys,
 * and the values can be any type. The function also checks whether
 * empty records are allowed based on the specified flag.
 *
 * @param value - The value to check.
 * @param allowEmpty - Determines whether empty records are allowed.
 * @returns A boolean indicating whether the value is a record.
 * @deprecated Use `isObject` instead and check property keys manually.
 */
export function isRecord(
  value: unknown,
  allowEmpty: boolean = false,
): value is Record<PropertyKey, unknown> {
  return isObject(value) && (allowEmpty || Object.keys(value).length > 0);
}

// eslint-disable-next-line @typescript-eslint/no-deprecated
describeTypeGuard(isRecord, 'record (object with property keys)');

/**
 * Checks if the given value is an array.
 *
 * @param value - The value to check.
 * @returns True if the value is an array, otherwise false.
 * @typeParam T - Type of the value to be checked.
 */
export function isArray<T>(value: readonly T[] | T): value is readonly T[];

/**
 * Checks if the provided value is an array.
 *
 * @param value - The value to be checked.
 * @returns True if the value is an array, otherwise false.
 * @typeParam T - type of the value to be checked.
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

describeTypeGuard(isArray, 'array');

/**
 * Determines if the provided value is a function.
 *
 * @param value - The value to check.
 * @returns A narrowed type indicating whether the value is a function.
 * @typeParam T - The type of the value being checked.
 */
export function isFunction<T>(value: T): value is IsNever<
  T extends AnyFunction ? T : never
> extends true ?
  CallableFunction & T
: T extends AnyFunction ? T
: never;

/**
 * Determines if the provided value is of type Function.
 *
 * @param value - The value to be checked.
 * @returns True if the value is a function; otherwise, false.
 * @typeParam TFn - Function type to narrow to when the check passes.
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function isFunction<TFn extends CallableFunction = CallableFunction>(
  value: unknown,
): value is TFn;
export function isFunction(value: unknown): boolean {
  return typeof value === 'function';
}

describeTypeGuard(isFunction, 'function');

/**
 * Determines whether the provided value is iterable.
 *
 * @param value - The value to be checked.
 * @returns `true` if the value is iterable, otherwise `false`.
 */
export function isIterable(value: unknown): value is Iterable<unknown> {
  return hasProp(value, Symbol.iterator, isFunction, true);
}

describePredicate(isIterable, 'to be iterable');

/* ──────────────────────────────── hasProp ───────────────────────────────── */

// eslint-disable-next-line jsdoc/require-jsdoc
export function hasProp(
  source: Nil,
  prop: PropertyKey,
  ...rest:
    | readonly [checkProto?: boolean]
    | readonly [test?: PlainPredicate, checkProto?: boolean]
): source is never;

// eslint-disable-next-line jsdoc/require-jsdoc
export function hasProp(
  source: unknown,
  prop: '__proto__' | 'constructor',
  ...rest:
    | readonly [checkProto?: boolean]
    | readonly [test?: PlainPredicate, checkProto?: boolean]
): source is never;

/**
 * Checks if a property exists on the provided source object.
 *
 * Narrows the source type to include the specified property key with an unknown value.
 *
 * @param source - The object to check.
 * @param key - The property key to verify.
 * @param checkProto - Whether to check the prototype chain.
 * @returns Type guard indicating whether the property exists.
 * @throws {TypeError} If the provided key is not a valid property key.
 * @throws {TypeError} If the provided checkProto flag is not a boolean.
 * @throws {TypeError} If the provided test is not a function.
 * @throws {TypeError} If the provided test function does not return a boolean.
 * @typeParam TSource - The source object type.
 * @typeParam TKey - The property key type.
 * @remarks The `__proto__` and `constructor` keys are always considered non-existent.
 */
export function hasProp<TSource, TKey extends PropertyKey>(
  source: TSource,
  key: TKey,
  checkProto?: boolean,
): source is WithFallback<
  TSource extends AnyRecord<TKey, unknown> ?
    TSource &
      Record<TKey, WithFallback<DistributedPropValue<TSource, TKey, true>>>
  : never,
  TSource &
    Record<TKey, WithFallback<DistributedPropValue<TSource, TKey, true>>>
>;

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
 * @throws {TypeError} If the provided key is not a valid property key.
 * @throws {TypeError} If the provided checkProto flag is not a boolean.
 * @throws {TypeError} If the provided test is not a function.
 * @throws {TypeError} If the provided test function does not return a boolean.
 * @typeParam TSource - The source object type.
 * @typeParam TKey - The property key type.
 * @typeParam TGuard - The type guard type.
 * @remarks The `__proto__` and `constructor` keys are always considered non-existent.
 */
export function hasProp<
  TSource,
  TKey extends PropertyKey,
  TGuard extends TypeGuard<
    WithFallback<DistributedPropValue<TSource, TKey, true>>
  >,
>(
  source: TSource,
  key: TKey,
  test: TGuard,

  checkProto?: boolean,
): source is WithFallback<
  TSource extends AnyRecord<TKey, unknown> ?
    IsNever<TSource[TKey & keyof TSource] & NarrowedType<TGuard>> extends true ?
      never
    : TSource & Record<TKey, NarrowedType<TGuard>>
  : never,
  TSource & Record<TKey, NarrowedType<TGuard>>
>;

/**
 * Checks if a property exists on the provided source and optionally passes a test.
 *
 * @param source - The object to check.
 * @param key - The property key to verify.
 * @param test - An optional predicate to test the property value.
 * @param checkProto - Whether to check the prototype chain.
 * @returns The boolean result of the test.
 * @throws {TypeError} If the provided key is not a valid property key.
 * @throws {TypeError} If the provided checkProto flag is not a boolean.
 * @throws {TypeError} If the provided test is not a function.
 * @throws {TypeError} If the provided test function does not return a boolean.
 * @remarks This overload does not narrow the type
 * because the predicate may reject valid property values without invalidating their existence,
 * which would cause incorrect type elimination in the `else` branch.
 * If you need type narrowing for the property value, use the {@link TypeGuard} overload instead.
 * Alternatively, you can split the checks: `hasProp(source, key) && test(source[key])`.
 * @typeParam TSource - The source object type.
 * @typeParam TKey - The property key type.
 * @remarks The `__proto__` and `constructor` keys are always considered non-existent.
 */
export function hasProp<TSource, TKey extends PropertyKey>(
  source: TSource,
  key: TKey,
  test: PlainPredicate<WithFallback<DistributedPropValue<TSource, TKey, true>>>,
  checkProto?: boolean,
): boolean;

export function hasProp(
  source: unknown,
  key: PropertyKey,
  ...rest:
    | readonly [checkProto?: Undef<boolean>]
    | readonly [
        test?: Undef<PlainPredicate<unknown>>,
        checkProto?: Undef<boolean>,
      ]
): boolean {
  // a little guard against prototype pollution
  if (key === '__proto__' || key === 'constructor') {
    return false;
  }

  if (!isPropKey(key)) {
    throw new TypeError(
      `Expected key to be a valid property key (string, symbol, or number), got ${typeof key} instead.`,
    );
  }

  let test: PlainPredicate<unknown> | undefined,
    checkProto: boolean = false;
  if (isFunction(rest[0])) {
    [test, checkProto = false] = rest;
    if (!isBoolean(checkProto)) {
      throw new TypeError(
        `Expected checkProto to be a boolean, got ${typeof checkProto} instead.`,
      );
    }
  } else if (isBoolean(rest[0])) {
    [checkProto] = rest;
  } else if (rest.length > 0) {
    throw new TypeError('Invalid arguments to hasProp');
  }

  const existenceResult =
    isNotNil(source) &&
    // cast Object(source) because "in" operator throws on primitive right values
    (checkProto ? key in Object(source) : Object.hasOwn(source, key));

  const testResult =
    existenceResult && isFunction(test) ? test(source[key as never]) : true;

  if (!isBoolean(testResult))
    throw new TypeError(
      `Expected test to return a boolean, got ${typeof testResult} instead.`,
    );

  return existenceResult && testResult;
}
