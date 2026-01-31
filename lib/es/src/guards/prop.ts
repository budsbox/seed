import type { IsNever, IterableElement, KeysOfUnion } from 'type-fest';

import type {
  AnyRecord,
  DistributedPropValue,
  NarrowedType,
  Nil,
  NonNil,
  PlainPredicate,
  Predicate,
  TypeGuard,
  Undef,
  WithFallback,
} from '@budsbox/lib-types';

import {
  assertBoolean,
  assertNotNil,
  assertPropKey,
  invariant,
} from './assert.js';
import { isBoolean, isFunction, isNil, isString } from './check.js';
import {
  debugValueString,
  debugValueType,
  formatAccessString,
  formatPredicateExpectedMessage,
} from './message.js';

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ hasProp ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

// eslint-disable-next-line jsdoc/require-jsdoc
export function hasProp(
  source: Nil,
  prop: PropertyKey,
  ...rest: HasPropRest
): source is never;

// eslint-disable-next-line jsdoc/require-jsdoc
export function hasProp(
  source: unknown,
  prop: ProtectedKey,
  ...rest: HasPropRest
): source is never;

/**
 * Checks if a property exists on the provided source object.
 *
 * Narrows the source type to include the specified property key with an unknown value.
 *
 * @param source - The object to check.
 * @param key - The property key to verify.
 * @param checkProto - Whether to check the prototype chain.
 * @returns Boolean indicating whether the property exists.
 * @throws {@link TypeError} If the provided key is not a valid property key.
 * @throws {@link TypeError} If the provided checkProto flag is not a boolean.
 * @typeParam TSource - The source object type.
 * @typeParam TKey - The property key type.
 * @remarks The `__proto__` and `constructor` keys are always considered non-existent.
 * {@label NO_PREDICATE}
 */
export function hasProp<TSource, TKey extends PropertyKey>(
  source: TSource,
  key: TKey,
  checkProto?: boolean,
): source is SourceNarrowed<TSource, TKey>;

/**
 * Checks if a property exists on a non-null source and passes a type guard test.
 *
 * Narrows both the source type and the property value type based on the provided type guard.
 *
 * @param source - The object to check.
 * @param key - The property key to verify.
 * @param typeGuard - A type guard to narrow the property value type.
 * Accepts the property value as the only parameter.
 * @param checkProto - Whether to check the prototype chain.
 * @returns Boolean indicating whether the property exists and satisfies the type guard.
 * @throws {@link TypeError} In the following cases:
 * - If the provided `key` is not a valid property key.
 * - If the provided `checkProto` flag is not a boolean.
 * - If the provided type guard is not a function.
 * - If the provided type guard does not return a boolean.
 * @typeParam TSource - The source object type.
 * @typeParam TKey - The property key type.
 * @typeParam TGuard - The type guard type.
 * @remarks The `__proto__` and `constructor` keys are always considered non-existent.
 * {@label TYPE_GUARD}
 */
export function hasProp<
  TSource,
  TKey extends PropertyKey,
  TGuard extends TypeGuard<PropValue<TSource, TKey>>,
>(
  source: TSource,
  key: TKey,
  typeGuard: TGuard,
  checkProto?: boolean,
): source is SourceNarrowedWithTypeGuard<TSource, TKey, TGuard>;

/**
 * Checks if a property exists on the provided source and optionally passes a test.
 *
 * @param source - The object to check.
 * @param key - The property key to verify.
 * @param predicate - An optional predicate to test the property value.
 * Accepts the property value as the only parameter.
 * @param checkProto - Whether to check the prototype chain.
 * @returns Boolean indicating whether the property exists and satisfies the test.
 * @throws {@link TypeError} In the following cases:
 * - If the provided key is not a valid property key.
 * - If the provided checkProto flag is not a boolean.
 * - If the provided predicate is not a function.
 * - If the provided predicate does not return a boolean.
 * @remarks
 * This overload doesn't narrow the type,
 * because the predicate may reject valid property values without invalidating their existence,
 * which would cause incorrect type elimination in the `else` branch.
 * If you need type narrowing for the property value, use the {@link hasProp:TYPE_GUARD} overload instead.
 * Alternatively, you can split the checks: `hasProp(source, key) && test(source[key])`.
 * @typeParam TSource - The source object type.
 * @typeParam TKey - The property key type.
 * @remarks The `__proto__` and `constructor` keys are always considered non-existent.
 * {@label PREDICATE}
 */
export function hasProp<TSource, TKey extends PropertyKey>(
  source: TSource,
  key: TKey,
  predicate: PlainPredicate<PropValue<TSource, TKey>>,
  checkProto?: boolean,
): boolean;

export function hasProp(
  source: unknown,
  key: PropertyKey,
  ...rest: HasPropRest
): boolean {
  // a little guard against prototype pollution
  if (protectedKeys.has(key as never)) {
    return false;
  }

  assertPropKey(key, 'key');

  invariant(
    rest.length <= 2,
    () =>
      `Expected 2, 3, or 4 arguments, got ${String(rest.length + 2)} instead.`,
  );

  if (isNil(source)) return false;

  let predicate: PlainPredicate<unknown> | undefined,
    checkProto: boolean = false,
    index = 0;

  if (isFunction(rest[index])) predicate = rest[index++] as Predicate;
  if (isBoolean(rest[index])) checkProto = rest[index++] as boolean;

  invariant(
    index >= rest.length,
    () =>
      `Invalid argument combination. Unexpected arguments at position ${String(
        index + 2,
      )}: ${debugValueString(rest.slice(index).map(debugValueType))}`,
  );

  if (propExists(source, key, checkProto)) {
    if (isFunction(predicate)) {
      const result = predicate(source[key as never]);
      assertBoolean(result, 'predicate result');
      return result;
    }

    return true;
  }

  return false;
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ assertProp ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

// eslint-disable-next-line jsdoc/require-jsdoc
export function assertProp(
  source: Nil,
  key: PropertyKey,
  ...rest: AssertPropRest
): never;

// eslint-disable-next-line jsdoc/require-jsdoc
export function assertProp(
  source: unknown,
  key: ProtectedKey,
  ...rest: AssertPropRest
): never;

/**
 * Asserts that a property exists on the provided source object.
 *
 * Narrows the source type to include the specified property key with an unknown value.
 *
 * @param source - The object to check.
 * @param key - The property key to verify.
 * @param rest - Optional parameters: checkProto flag and sourceName for error messages.
 * @returns void if the assertion succeeds, otherwise throws an error.
 * {@label NO_PREDICATE}
 * @throws {@link TypeError} In the following cases:
 * - If the source is nil.
 * - If the provided key is not a valid property key.
 * - If the property does not exist.
 * @typeParam TSource - The source object type.
 * @typeParam TKey - The property key type.
 * @remarks The `__proto__` and `constructor` keys are always considered non-existent.
 */
export function assertProp<TSource, TKey extends StrictKey<TSource>>(
  source: TSource,
  key: TKey,
  ...rest: WithoutPredicate<AssertPropRest>
): asserts source is SourceNarrowed<TSource, TKey>;

/**
 * Asserts that a property exists on a non-null source and passes a type guard test.
 *
 * Narrows both the source type and the property value type based on the provided type guard.
 *
 * @param source - The object to check.
 * @param key - The property key to verify.
 * @param typeGuard - A type guard to narrow the property value type.
 * Accepts the property value as the only parameter.
 * @param rest - Optional parameters: `checkProto` flag and `sourceName` for error messages.
 * @returns void if the assertion succeeds, otherwise throws an error.
 * {@label TYPE_GUARD}
 * @throws {@link TypeError} In the following cases:
 * - If the source is nil.
 * - If the provided key is not a valid property key.
 * - If the property does not exist.
 * - If the provided type guard is not a function.
 * - If the provided type guard does not return a boolean.
 * - If the property value fails the type guard test.
 * @typeParam TSource - The source object type.
 * @typeParam TKey - The property key type.
 * @typeParam TGuard - The type guard type.
 * @remarks The `__proto__` and `constructor` keys are always considered non-existent.
 */
export function assertProp<
  TSource,
  TKey extends StrictKey<TSource>,
  TGuard extends TypeGuard,
>(
  source: TSource,
  key: TKey,
  typeGuard: TGuard,
  ...rest: WithoutPredicate<AssertPropRest>
): asserts source is SourceNarrowedWithTypeGuard<TSource, TKey, TGuard>;

/**
 * Asserts that a property exists on the provided source and optionally passes a test.
 *
 * @param source - The object to check.
 * @param key - The property key to verify.
 * @param predicate - An optional predicate to test the property value.
 * Accepts the property value as the only parameter.
 * @param rest - Optional parameters: checkProto flag and sourceName for error messages.
 * @returns void if the assertion succeeds, otherwise throws an error.
 * {@label PREDICATE}
 * @throws {@link TypeError} In the following cases:
 * - If the source is nil.
 * - If the provided key is not a valid property key.
 * - If the property does not exist.
 * - If the provided predicate is not a function.
 * - If the provided predicate does not return a boolean.
 * - If the property value fails the predicate test.
 * @typeParam TSource - The source object type.
 * @typeParam TKey - The property key type.
 * @remarks The `__proto__` and `constructor` keys are always considered non-existent.
 */
export function assertProp<TSource, TKey extends StrictKey<TSource>>(
  source: TSource,
  key: TKey,
  predicate?: PlainPredicate<PropValue<TSource, TKey>>,
  ...rest: WithoutPredicate<AssertPropRest>
): asserts source is SourceNarrowed<TSource, TKey>;

export function assertProp(
  source: unknown,
  key: PropertyKey,
  ...rest: AssertPropRest
): void {
  assertPropKey(key, 'key');

  const [predicate, checkProto, sourceName] = normalizeAssertRest(
    'assertProp',
    ...rest,
  );
  assertNotNil(source, sourceName);
  invariant(
    !protectedKeys.has(key as never) && propExists(source, key, checkProto),
    () =>
      checkProto ?
        `Expected ${formatAccessString(sourceName, key)} to exist`
      : `Expected ${sourceName} to have own property ${debugValueString(key)}`,
  );
  const propValue = source[key as never];
  const result = predicate(propValue);
  assertBoolean(result, 'predicate result');

  invariant(result, () =>
    formatPredicateExpectedMessage(
      predicate,
      propValue,
      formatAccessString(sourceName, key),
    ),
  );
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~ assertOptionalProp ~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Internals ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const protectedKeys = new Set(['constructor', '__proto__'] as const);

const normalizeAssertRest = (
  fnName: string,
  ...rest: AssertPropRest
): [predicate: Predicate, checkProto: boolean, sourceName: string] => {
  const argShift = 2; // source, key

  invariant(
    rest.length <= 3,
    () =>
      `Expected 2–5 arguments, got ${String(rest.length + argShift)} instead.`,
  );

  let predicate: Predicate = () => true,
    checkProto: boolean = false,
    sourceName = 'source';
  let index = 0;

  if (isFunction(rest[index])) predicate = rest[index++] as Predicate;
  if (isBoolean(rest[index])) checkProto = rest[index++] as boolean;
  if (isString(rest[index])) sourceName = rest[index++] as string;

  invariant(
    index >= rest.length,
    () =>
      `Invalid argument combination for ${fnName}. Unexpected arguments at position ${String(
        index + argShift,
      )}: ${debugValueString(rest.slice(index).map(debugValueType))}`,
  );

  return [predicate, checkProto, sourceName];
};

const propExists = (
  source: NonNil,
  key: PropertyKey,
  checkProto: boolean,
): boolean => (checkProto ? key in Object(source) : Object.hasOwn(source, key));

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Types ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

type PropValue<TSource, TKey extends PropertyKey> = WithFallback<
  DistributedPropValue<TSource, TKey, true>
>;

type StrictKey<TSource> = WithFallback<KeysOfUnion<TSource>, PropertyKey>;

type SourceNarrowed<TSource, TKey extends PropertyKey> = WithFallback<
  TSource extends AnyRecord<TKey, unknown> ?
    TSource & Record<TKey, PropValue<TSource, TKey>>
  : never,
  TSource & Record<TKey, PropValue<TSource, TKey>>
>;

type SourceNarrowedWithTypeGuard<
  TSource,
  TKey extends PropertyKey,
  TGuard extends TypeGuard,
> = WithFallback<
  TSource extends AnyRecord<TKey, unknown> ?
    IsNever<TSource[TKey & keyof TSource] & NarrowedType<TGuard>> extends true ?
      never
    : TSource & Record<TKey, NarrowedType<TGuard>>
  : never,
  TSource & Record<TKey, NarrowedType<TGuard>>
>;

type HasPropRest =
  | readonly [checkProto?: Undef<boolean>]
  | readonly [predicate?: Undef<Predicate>, checkProto?: Undef<boolean>]
  | readonly [predicate?: Undef<Predicate>];

type AssertPropRest = readonly [
  ...(HasPropRest | []),
  sourceName?: Undef<string>,
];

type WithoutPredicate<TRest extends readonly unknown[]> = Exclude<
  TRest,
  readonly [predicate?: Undef<Predicate>, ...rest: unknown[]]
>;

type ProtectedKey = IterableElement<typeof protectedKeys>;
