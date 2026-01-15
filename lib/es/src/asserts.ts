import type { IsNever } from 'type-fest';

import type { AnyFunction, Nil, NonNil, Undef } from '@budsbox/lib-types';
import type { AnyRecord } from '@budsbox/lib-types/object';

import type { Predicate, TypeGuard } from './types.js';

import {
  type HasPropRestArg,
  hasProp,
  isArray,
  isBoolean,
  isFunction,
  isIterable,
  isNil,
  isNumber,
  isObject,
  isPropKey,
  isString,
  isTrue,
} from '#guards';

/**
 * @module
 * Provides assertion functions for runtime type checking and validation.
 */

/**
 * Enforces that a condition is true, otherwise throws an error with the provided message.
 *
 * @param condition - A boolean expression that must evaluate to true. If false, an error is thrown.
 * @param message - An optional custom error message to include if the condition is not met. Defaults to 'Expected condition to be true'.
 * @throws {TypeError} If the condition is false, an error is thrown with the provided message.
 */
export function invariant(
  condition: boolean,
  message = 'Expected condition to be true',
): asserts condition is true {
  if (!isTrue(condition)) throw new TypeError(message);
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
  name = 'value',
): asserts value is NonNil {
  if (isNil(value))
    throw new TypeError(
      `Expected ${name} to be non-nullable, got ${String(value)} instead`,
    );
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
  name = 'value',
): asserts value is string {
  if (!isString(value))
    throw new TypeError(
      `Expected ${name} to be a string, got ${typeof value} instead`,
    );
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
  name = 'value',
): asserts value is number {
  if (!isNumber(value)) {
    throw new TypeError(
      `Expected ${name} to be a number, got ${typeof value} instead`,
    );
  }
}

/**
 * Asserts that the provided value is a valid property key (string, number, or symbol).
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @throws {TypeError} If the value is not a valid property key.
 */
export function assertPropertyKey(
  value: unknown,
  name = 'value',
): asserts value is PropertyKey {
  if (!isPropKey(value)) {
    throw new TypeError(
      `Expected ${name} to be a valid property key (string, symbol, or number), got ${typeof value} instead`,
    );
  }
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
  name = 'value',
): asserts value is boolean {
  if (!isBoolean(value)) {
    throw new TypeError(
      `Expected ${name} to be a boolean, got ${typeof value} instead`,
    );
  }
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
  name = 'value',
): asserts value is object {
  if (!isObject(value)) {
    throw new TypeError(
      `Expected ${name} to be an object, got ${String(value)} instead`,
    );
  }
}

/**
 * Asserts that the provided value is an array.
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @throws {TypeError} If the value is not an array.
 * @typeParam T - The type of elements in the array.
 */
export function assertArray<T>(
  value: readonly T[] | T,
  name = 'value',
): asserts value is readonly T[] {
  if (!isArray(value)) {
    throw new TypeError(
      `Expected ${name} to be an array, got ${String(value)} instead`,
    );
  }
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
): asserts value is IsNever<T extends AnyFunction ? T : never> extends true ?
  CallableFunction & T
: T extends AnyFunction ? T
: never;
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function assertFunction<TFn extends CallableFunction = CallableFunction>(
  value: unknown,
  name?: string,
): asserts value is TFn;
export function assertFunction(value: unknown, name = 'value'): void {
  if (!isFunction(value)) {
    throw new TypeError(
      `Expected ${name} to be a function, got ${String(value)} instead`,
    );
  }
}

/**
 * Asserts that the provided value is iterable.
 *
 * @param value - The value to check.
 * @param name - The name of the value for the error message.
 * @throws {TypeError} If the value is not iterable.
 */
export function assertIterable(
  value: unknown,
  name = 'value',
): asserts value is Iterable<unknown> {
  if (!isIterable(value)) {
    throw new TypeError(
      `Expected ${name} to be iterable, got ${String(value)} instead`,
    );
  }
}

// eslint-disable-next-line jsdoc/require-jsdoc
export function assertProp(
  source: Nil,
  prop: PropertyKey,
  checkProto?: boolean,
  sourceName?: string,
): never;

// eslint-disable-next-line jsdoc/require-jsdoc
export function assertProp(
  source: Nil,
  key: PropertyKey,
  test?: Predicate<unknown>,
  checkProto?: boolean,
  sourceName?: string,
): never;

/**
 * Asserts that a source object has a specific property.
 *
 * @param source - The source object.
 * @param key - The property key to check.
 * @param checkProto - Whether to check the prototype chain.
 * @param sourceName - The name of the source for error messages.
 * @returns void
 * @throws {TypeError} If the property does not exist on the source.
 * @typeParam TSource - The type of the source object.
 * @typeParam TKey - The type of the property key.
 * @remarks By default, only the own properties of the source object are checked.
 * Use the `checkProto` flag to check the prototype chain.
 */
export function assertProp<TSource, TKey extends PropertyKey>(
  source: TSource,
  key: TKey,
  checkProto?: boolean,
  sourceName?: string,
): asserts source is TSource &
  Record<TKey, TSource extends AnyRecord<PropertyKey, infer T> ? T : unknown>;

export function assertProp<TSource, TKey extends PropertyKey>(
  source: TSource,
  key: TKey,
  sourceName?: string,
): asserts source is TSource &
  Record<TKey, TSource extends AnyRecord<PropertyKey, infer T> ? T : unknown>;

/**
 * Asserts that a source object has a specific property that satisfies a {@link TypeGuard}.
 *
 * @param source - The source object.
 * @param key - The property key to check.
 * @param test - A {@link TypeGuard} to narrow the property value.
 * @param checkProto - Whether to check the prototype chain.
 * @param sourceName - The name of the source for error messages.
 * @returns void
 * @throws {TypeError} If the property does not exist or fails the type guard.
 * @typeParam TSource - The type of the source object.
 * @typeParam TKey - The type of the property key.
 * @typeParam TNarrowed - The type to narrow the property to.
 * @remarks By default, only the own properties of the source object are checked.
 * Use the `checkProto` flag to check the prototype chain.
 */
export function assertProp<TSource, TKey extends PropertyKey, TNarrowed>(
  source: TSource | null,
  key: TKey,
  test: TSource extends AnyRecord<TKey, infer TValue> ?
    TypeGuard<TValue, TValue & TNarrowed>
  : TypeGuard<unknown, TNarrowed>,
  checkProto?: boolean,
  sourceName?: string,
): asserts source is TSource & Record<TKey, TNarrowed>;

/**
 * Asserts that a source object has a specific property that satisfies a {@link Predicate}.
 *
 * @param source - The source object.
 * @param key - The property key to check.
 * @param test - A {@link Predicate} to test the property value.
 * @param checkProto - Whether to check the prototype chain.
 * @param sourceName - The name of the source for error messages.
 * @returns void
 * @throws {TypeError} If the property does not exist or fails the predicate.
 * @typeParam TSource - The type of the source object.
 * @typeParam TKey - The type of the property key.
 * @remarks By default, only the own properties of the source object are checked.
 * Use the `checkProto` flag to check the prototype chain.
 */
export function assertProp<TSource, TKey extends PropertyKey>(
  source: TSource,
  key: TKey,
  test: Predicate<
    TSource extends AnyRecord<TKey, infer TValue> ? TValue
    : TSource extends AnyRecord<PropertyKey, infer TValue> ? TValue
    : unknown
  >,
  checkProto?: boolean,
  sourceName?: string,
): asserts source is TSource &
  Record<
    TKey,
    TSource extends AnyRecord<PropertyKey, infer TValue> ? TValue : unknown
  >;
export function assertProp(
  source: unknown,
  key: PropertyKey,
  ...rest:
    | readonly [checkProto?: Undef<boolean>, sourceName?: Undef<string>]
    | readonly [sourceName?: Undef<string>]
    | readonly [
        test?: Undef<Predicate<unknown>>,
        checkProto?: Undef<boolean>,
        sourceName?: Undef<string>,
      ]
): void {
  assertPropertyKey(key, 'key');

  let testFn: Predicate<unknown> | undefined,
    checkProto: boolean = false,
    sourceName = 'source',
    hasPropArgs: HasPropRestArg = [];

  if (isFunction(rest[0])) {
    testFn = rest[0];
    rest = rest.slice(1) as unknown as readonly [
      checkProto?: Undef<boolean>,
      sourceName?: Undef<string>,
    ];
    hasPropArgs = [testFn];
  }

  if (isBoolean(rest[0])) {
    checkProto = rest[0];
    rest = rest.slice(1) as unknown as readonly [sourceName?: Undef<string>];
    hasPropArgs = [...hasPropArgs, checkProto] as HasPropRestArg;
  }

  if (isString(rest[0])) {
    sourceName = rest[0];
    rest = [];
  }

  if (rest.length > 0) {
    throw new TypeError('Invalid arguments to assertProp');
  }

  assertNotNil(source, sourceName);

  if (!hasProp(source, key, ...hasPropArgs)) {
    const displayKey = isString(key) ? JSON.stringify(key) : String(key);

    // prop doesn't exist on a source
    if (!hasProp(source, key, checkProto)) {
      throw new TypeError(
        `Expected ${sourceName} to have${checkProto ? '' : ' own'} property ${displayKey}`,
      );
    } else {
      const testFnName = testFn!.name || '(anonymous function)';
      if (/^is/.test(testFnName)) {
        const expectedType = testFnName
          .replace(/(.)([A-Z])/g, '$1$2')
          .slice(2)
          .toLowerCase();
        throw new TypeError(
          `Expected ${sourceName}[${displayKey}] to be ${expectedType}`,
        );
      } else {
        throw new TypeError(
          `Expected ${sourceName}[${displayKey}] to satisfy the predicate ${testFnName})`,
        );
      }
    }
  }
}
