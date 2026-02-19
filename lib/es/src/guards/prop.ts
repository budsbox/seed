import type {
  IsNever,
  IsUnknown,
  IterableElement,
  KeysOfUnion,
} from 'type-fest';

import type {
  AnyRecord,
  CustomRecord,
  DistributedPropValue,
  Infer,
  IsEmptyObject,
  NarrowedType,
  Nil,
  NonNil,
  Predicate,
  TypePredicate,
  Undef,
  ValuePredicate,
  WithFallback,
} from '@budsbox/lib-types';

import {
  assertFunction,
  assertNotNil,
  assertPropKey,
  callPredicate,
  invariant,
  normalizeOptionalRest,
} from './assert.js';
import { isBoolean, isFunction, isNil, isString } from './check.js';
import {
  formatAccessString,
  formatDebugValue,
  formatPredicateExpectedMessage,
} from './format.js';

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ hasProp ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/** @ignore */
export function hasProp(
  source: Nil,
  prop: PropertyKey,
  ...rest: HasPropRest
): source is never;

/** @ignore */
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
 * @category Checks
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
  TGuard extends TypePredicate<PropValue<TSource, TKey>>,
>(
  source: TSource,
  key: TKey,
  typeGuard: TGuard,
  checkProto?: boolean,
): source is SourceNarrowedWithTypeGuard<TSource, TKey, TGuard>;

/**
 * Checks if a property exists on the provided source and optionally passes a test.
 *
 * This overload doesn't narrow a type,
 * because the predicate may reject valid property values without invalidating their existence,
 * which would cause incorrect type elimination in the `else` branch.
 * If you need type narrowing for the property value, use the type guard overload instead.
 * Alternatively, you can split the checks: `hasProp(source, key) && test(source[key])`.
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
 * @remarks The `__proto__` and `constructor` keys are always considered non-existent.
 * @typeParam TSource - The source object type.
 * @typeParam TKey - The property key type.
 * {@label PREDICATE}
 */
export function hasProp<TSource, TKey extends PropertyKey>(
  source: TSource,
  key: TKey,
  predicate: ValuePredicate<PropValue<TSource, TKey>>,
  checkProto?: boolean,
): boolean;

export function hasProp(
  source: unknown,
  key: PropertyKey,
  ...rest: HasPropRest
): boolean {
  assertPropKey(key, 'key');

  invariant(
    rest.length <= 2,
    () =>
      `Expected 2, 3, or 4 arguments, got ${String(rest.length + 2)} instead.`,
  );

  let predicate: ValuePredicate<unknown> = () => true,
    checkProto: boolean = false,
    index = 0;

  if (isFunction(rest[index])) predicate = rest[index++] as Predicate;
  if (isBoolean(rest[index])) checkProto = rest[index++] as boolean;

  invariant(
    index >= rest.length,
    () =>
      `Invalid arguments. Unexpected arguments at position ${String(
        index + 2,
      )}: ${rest
        .slice(index)
        .map((arg) => formatDebugValue(arg, { maxDepth: 1 }))
        .join(', ')}`,
  );

  return (
    !isNil(source) &&
    propExists(source, key, checkProto) &&
    callPredicate(predicate, source[key as never])
  );
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ assertProp ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/** @ignore */
export function assertProp(
  source: Nil,
  key: PropertyKey,
  ...rest: AssertPropRest
): never;

/** @ignore */
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
 * @category Assertions
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
 * @category Assertions
 */
export function assertProp<
  TSource,
  TKey extends StrictKey<TSource>,
  TGuard extends TypePredicate<PropValue<TSource, TKey>>,
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
 * @category Assertions
 */
export function assertProp<TSource, TKey extends StrictKey<TSource>>(
  source: TSource,
  key: TKey,
  predicate?: ValuePredicate<PropValue<TSource, TKey>>,
  ...rest: WithoutPredicate<AssertPropRest>
): asserts source is SourceNarrowed<TSource, TKey>;

export function assertProp(
  source: unknown,
  key: PropertyKey,
  ...rest: AssertPropRest
): void {
  assertPropKey(key, 'key');

  const [predicate = () => true, checkProto = false, sourceName = 'source'] =
    normalizeOptionalRest([isFunction, isBoolean, isString] as const, rest, 2);

  assertNotNil(source, sourceName);
  invariant(propExists(source, key, checkProto), () =>
    checkProto ?
      `Expected ${formatAccessString(sourceName, key)} to exist`
    : `Expected ${sourceName} to have own property ${formatDebugValue(key)}`,
  );

  const propValue = source[key as never];
  invariant(callPredicate(predicate, propValue), () =>
    formatPredicateExpectedMessage(
      predicate,
      propValue,
      formatAccessString(sourceName, key),
    ),
  );
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~ assertOptionalProp ~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Asserts that a property either does not exist or passes a type guard test.
 *
 * Narrows both the source type and the property value type based on the provided type guard.
 *
 * @param source - The object to check.
 * @param key - The property key to verify.
 * @param typeGuard - A type guard to narrow the property value type.
 * Accepts the property value as the only parameter.
 * @param rest - Optional parameters: `checkProto` flag and `sourceName` for error messages.
 * @returns void.
 * {@label TYPE_GUARD}
 * @throws {@link TypeError} In the following cases:
 * - If the provided key is not a valid property key.
 * - If the provided type guard is not a function.
 * - If the provided type guard does not return a boolean.
 * - If the property exists but fails the type guard test.
 * @typeParam TSource - The source object type.
 * @typeParam TKey - The property key type.
 * @typeParam TGuard - The type guard type.
 * @remarks The `__proto__` and `constructor` keys are always considered non-existent.
 * @category Assertions
 */
export function assertOptionalProp<
  TSource,
  TKey extends PropertyKey,
  TGuard extends TypePredicate<PropValue<TSource, TKey>>,
>(
  source: TSource,
  key: TKey,
  typeGuard: TGuard,
  ...rest: WithoutPredicate<AssertPropRest>
): asserts source is
  | SourceEliminated<TSource, TKey>
  | SourceNarrowedWithTypeGuard<TSource, TKey, TGuard, true>;

/**
 * Asserts that a property either does not exist or passes a predicate test.
 *
 * @param source - The object to check.
 * @param key - The property key to verify.
 * @param predicate - A predicate to test the property value if it exists.
 * Accepts the property value as the only parameter.
 * @param rest - Optional parameters: `checkProto` flag and `sourceName` for error messages.
 * @returns void.
 * {@label PREDICATE}
 * @throws {@link TypeError} In the following cases:
 * - If the provided key is not a valid property key.
 * - If the provided predicate is not a function.
 * - If the provided predicate does not return a boolean.
 * - If the property exists but fails the predicate test.
 * @typeParam TSource - The source object type.
 * @typeParam TKey - The property key type.
 * @remarks The `__proto__` and `constructor` keys are always considered non-existent.
 * @category Assertions
 */
export function assertOptionalProp<TSource, TKey extends PropertyKey>(
  source: TSource,
  key: TKey,
  predicate: ValuePredicate<PropValue<TSource, TKey>>,
  ...rest: WithoutPredicate<AssertPropRest>
): asserts source is
  | SourceEliminated<TSource, TKey>
  | SourceNarrowed<TSource, TKey, true>;

export function assertOptionalProp(
  source: unknown,
  key: PropertyKey,
  predicate: Predicate,
  ...rest: AssertPropRest
): void {
  assertPropKey(key, 'key');
  assertFunction(predicate, 'predicate');

  const [checkProto = false, sourceName = 'source'] = normalizeOptionalRest(
    [isBoolean, isString] as const,
    rest,
    2,
  );

  if (isNil(source) || !propExists(source, key, checkProto)) return;

  const propValue = source[key as never];
  invariant(callPredicate(predicate, propValue), () =>
    formatPredicateExpectedMessage(
      predicate,
      propValue,
      formatAccessString(sourceName, key),
    ),
  );
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Internals ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const protectedKeys = new Set(['constructor', '__proto__'] as const);

const propExists = (
  source: NonNil,
  key: PropertyKey,
  checkProto: boolean,
): boolean =>
  // a little (not exhaustive) guard against prototype pollution
  !protectedKeys.has(key as never) &&
  (checkProto ? key in Object(source) : Object.hasOwn(source, key));

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ Types ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

type PropValue<TSource, TKey extends PropertyKey> = WithFallback<
  DistributedPropValue<TSource, TKey, true>
>;

type StrictKey<TSource> = WithFallback<KeysOfUnion<TSource>, PropertyKey>;

/**
 * Represents a utility type that narrows the source object `TSource`
 * to include a subset of properties defined by `TKey` with their respective value types.
 *
 * If `TSource` is compatible with the specified property key and value criteria,
 * it extends `CustomRecord` to provide the narrowed structure. Otherwise, it falls
 * back to the specified fallback type.
 *
 * @internal
 * @typeParam TSource - The source object type to be narrowed.
 * @typeParam TKey - The property key or keys to narrow down on.
 * @typeParam TPartial - A boolean flag indicating whether the properties in `TKey` should be optional.
 * @inline
 */
type SourceNarrowed<
  TSource,
  TKey extends PropertyKey,
  TPartial extends boolean = false,
> = WithFallback<
  TSource extends AnyRecord<TKey, unknown> ?
    TSource & CustomRecord<TKey, PropValue<TSource, TKey>, TPartial>
  : never,
  TSource & CustomRecord<TKey, PropValue<TSource, TKey>, TPartial>
>;

/**
 * @preventInline
 * @ignore
 */
type SourceNarrowedWithTypeGuard<
  TSource,
  TKey extends PropertyKey,
  TGuard extends TypePredicate,
  TPartial extends boolean = false,
> = WithFallback<
  TSource extends AnyRecord<TKey, unknown> ?
    IsNever<TSource[TKey & keyof TSource] & NarrowedType<TGuard>> extends true ?
      never
    : TSource & CustomRecord<TKey, NarrowedType<TGuard>, TPartial>
  : never,
  TSource & CustomRecord<TKey, NarrowedType<TGuard>, TPartial>
>;

/**
 * @preventInline
 * @ignore
 */
type SourceEliminated<TSource, TKey extends PropertyKey> =
  TSource extends Readonly<Record<TKey, unknown>> ? never
  : TSource extends AnyRecord<TKey, unknown> ?
    Infer<
      IsEmptyObject<Omit<TSource, TKey>> extends true ? never
      : TSource & CustomRecord<TKey, never, true>
    >
  : IsUnknown<TSource> extends true ? (null | undefined) & TSource
  : TSource;

type HasPropRest =
  | readonly [checkProto?: Undef<boolean>]
  | readonly [predicate?: Undef<Predicate>, checkProto?: Undef<boolean>]
  | readonly [predicate?: Undef<Predicate>];

type AssertPropRest = readonly [
  ...(HasPropRest | []),
  sourceName?: Undef<string>,
];

/**
 * @preventInline
 * @ignore
 */
type WithoutPredicate<TRest extends readonly unknown[]> = Exclude<
  TRest,
  readonly [predicate?: Undef<Predicate>, ...rest: unknown[]]
>;

type ProtectedKey = IterableElement<typeof protectedKeys>;
