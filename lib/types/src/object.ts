/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  ArrayTail,
  ConditionalExcept,
  ConditionalPick,
  IsLiteral,
  IsNever,
  LiteralToPrimitive,
  Merge,
  OverrideProperties,
  UnknownRecord,
} from 'type-fest';

import type { IsNil, TupleN } from './core.js';

/**
 * Hack to show the inferred type (instead of union, intersections, generics, etc.) in tips
 *
 * @typeParam TObject - The object type to infer.
 * @example
 * ```typescript
 * // a tip for Foo would be like { bla: string } & { bla?: string; lol?: string; }
 * type Foo = { bla: string } & { bla?: string; lol?: string; };
 *
 * // {bla: string; lol?: string}
 * type Bla = InferObj<Foo>;
 * ```
 */
export type InferObject<TObject extends object> = {
  foo: {
    [K in keyof TObject]: TObject[K];
  };
}['foo'];

/**
 * This type computes the difference between two object types.
 *
 * It extracts properties from the first object type `T1` that do not exist in the second object type `T2`.
 * The resulting object contains only the properties of `T1` that are not present in both `T1` and `T2`.
 *
 * @typeParam T1 - The first object type.
 * @typeParam T2 - The second object type.
 */
export type Diff<T1 extends object, T2 extends object> = InferObject<
  Omit<T1, keyof T2 & keyof T1>
>;

/**
 * This type creates an immutable and optional record structure.
 * Useful for generic interfaces that accept a record of properties
 * and for the usage in function arguments.
 *
 * @typeParam TKey - The type of the property keys. Defaults to `PropertyKey`.
 * @typeParam TValue - The type of the property values. Defaults to `any`.
 */
export type AnyRecord<
  TKey extends PropertyKey = PropertyKey,
  TValue = any,
> = CustomRecord<TKey, TValue, true, true>;

/**
 * Creates a customizable record type with configurable partiality and mutability.
 *
 * This type allows you to define a record where you can control whether properties
 * are partial (optional) and/or readonly through boolean type parameters.
 *
 * @typeParam TKey - The type of the property keys. Defaults to `PropertyKey`.
 * @typeParam TValue - The type of the property values. Defaults to `any`.
 * @typeParam TPartial - When `true`, makes literal keys optional using {@link ConditionalPartial}. Defaults to `false`.
 * @typeParam TReadOnly - When `true`, makes all properties readonly using {@link ConditionalReadonly}. Defaults to `false`.
 * @see {@link AnyRecord} for a specialized version with both partial and readonly behavior.
 */
export type CustomRecord<
  TKey extends PropertyKey = PropertyKey,
  TValue = any,
  TPartial extends boolean = false,
  TReadOnly extends boolean = false,
> = ConditionalPartial<
  ConditionalReadonly<Record<TKey, TValue>, TReadOnly>,
  TPartial
>;

/**
 * Conditionally makes literal keys of a type optional based on a boolean parameter.
 *
 * When `TPartial` is `true`, this type applies {@link LiteralKeysPartial} to make
 * literal string/number/symbol keys optional while preserving index signatures as required.
 * When `TPartial` is `false`, the source type is returned unchanged.
 *
 * @typeParam TSource - The source type to potentially make partial.
 * @typeParam TPartial - When `true`, applies partial behavior to literal keys. Defaults to `false`.
 * @see {@link LiteralKeysPartial} for the underlying transformation logic.
 */
export type ConditionalPartial<TSource, TPartial extends boolean = false> =
  TPartial extends true ? LiteralKeysPartial<TSource> : TSource;

/**
 * Makes only literal keys of an object type optional while preserving index signatures as is.
 *
 * This type splits properties into two groups: literal keys (specific string/number/symbol literals)
 * become optional, while index signatures (e.g., `[x: string]: T`) remain required. This prevents
 * `undefined` from being added to the value type when using index signatures, which would occur
 * with a simple `Partial<T>`.
 *
 * This type scope of application is other generic types,
 * and `undefined` may interfere with type safety and expected behavior.
 *
 * @typeParam TSource - The source object type to transform.
 * @example
 * ```typescript
 * type Example = { foo: string; bar: number; [x: string]: string | number };
 *
 * // Result: { foo?: string; bar?: number; [x: string]: string | number }
 * type Result = LiteralKeysPartial<Example>;
 * ```
 */
export type LiteralKeysPartial<TSource> = InferObject<
  {
    [K in keyof TSource as IsLiteral<K> extends true ? K : never]?: TSource[K];
  } & {
    [K in keyof TSource as IsLiteral<K> extends false ? K : never]: TSource[K];
  }
>;

/**
 * Conditionally makes a type readonly based on a boolean parameter.
 *
 * When `TReadOnly` is `true`, applies `Readonly<T>` to make all properties immutable.
 * When `TReadOnly` is `false`, returns the type unchanged.
 *
 * @typeParam T - The type to potentially make readonly.
 * @typeParam TReadOnly - When `true`, makes all properties readonly. Defaults to `false`.
 */
export type ConditionalReadonly<T, TReadOnly extends boolean = false> =
  TReadOnly extends true ? Readonly<T> : T;

/**
 * Represents a mapped type that transforms an object type `T` into a union of tuples.
 * Each tuple consists of a key-value pair from the original object.
 *
 * The `EntryUnion` type takes an object type `T` and creates a union of tuples,
 * where each tuple contains a key from `T` and its corresponding value.
 *
 * @typeParam T - The object type to transform into a union of key-value tuple pairs.
 * @remarks
 * The main difference from `type-fest`'s `Entry<T>` is that `EntryUnion<T>` returns a union of tuples, not a tuple of unions.
 * So if `T` is `{ a: number; b: string }`, then `EntryUnion<T>` will resolve to `[ "a", number ] | [ "b", string ]`,
 * while `Entry<T>` will resolve to `[ 'a' | 'b', number | string ]`.
 * Also, it's intended to work with objects only, not with arrays, Maps or Sets. Use `Entry<T>` for those cases.
 */
export type EntryUnion<T extends object> =
  T extends object ?
    {
      [K in keyof T]: [K, T[K]];
    }[keyof T]
  : never;

/**
 * Represents a general type of object where the first item is a key of type `PropertyKey`
 * and the second item is an associated value of any type.
 */
export type UnknownEntry = readonly [key: PropertyKey, value: unknown];

/**
 * Represents a nested entry where the first element is an immutable array of strings
 * and the second element is an associated value of any type.
 *
 * This is useful for representing data structures such as hierarchical
 * keys or paths paired with a corresponding value.
 */
export type UnknownNestedEntry = readonly [
  key: readonly PropertyKey[],
  value: unknown,
];

/**
 * A utility type that transforms an entry type by prepending a given prefix
 * to the key portion of the nested entry.
 *
 * The type supports entries in the form of tuples where the first element is
 * the key and the second element is the value. The key can be a tuple (array of keys),
 * an array of key parts, or a single key. The prefix will be prepended to the key structure.
 *
 * @typeParam TEntry - The entry to be transformed, extending either `UnknownEntry` or `UnknownNestedEntry`.
 * @typeParam TPrefix - A tuple of keys to be used as a prefix to the entry's key. Defaults to an empty tuple.
 * @remarks
 * - If `TEntry` is a tuple with a key (`TKey`) and a value (`TValue`):
 *   - If `TKey` is a tuple, the `TPrefix` will be prepended to `TKey`, resulting in a new tuple `[[...TPrefix, ...TKeyTuple], TValue]`.
 *   - If `TKey` is an array of key parts (`TKeyParts`), `TPrefix` will be prepended to an array of keys,
 *      resulting in a new tuple `[[...TPrefix, ...TKeyParts[]], TValue]`.
 *   - Otherwise (if `TKey` is a single key), `TPrefix` will be prepended to a single key, resulting in a new tuple `[[...TPrefix, TKey], TValue]`.
 */
export type PrependEntryKey<
  TEntry extends UnknownEntry | UnknownNestedEntry,
  TPrefix extends readonly PropertyKey[] = [],
> =
  TEntry extends readonly [infer TKey, infer TValue] ?
    TKey extends [...infer TKeyTuple] ? [[...TPrefix, ...TKeyTuple], TValue]
    : TKey extends Array<infer TKeyParts> ?
      [[...TPrefix, ...TKeyParts[]], TValue]
    : [[...TPrefix, TKey], TValue]
  : never;

type ExpandedEntry<
  TEntry extends UnknownEntry | UnknownNestedEntry,
  TMaxDepth extends number = 4,
> = _ExpandedEntry<
  TEntry extends UnknownEntry ? PrependEntryKey<TEntry> : TEntry,
  TupleN<TMaxDepth>
>;

type _ExpandedEntry<
  TEntries extends UnknownNestedEntry,
  DepthTuple extends unknown[] = TupleN<4>,
> =
  DepthTuple extends [] ? TEntries
  : TEntries extends [infer TKey, infer TValue] ?
    TKey extends string[] ?
      IsNever<Exclude<TValue, UnknownRecord>> extends true ?
        TValue extends UnknownRecord ?
          PrependEntryKey<
            _ExpandedEntry<
              PrependEntryKey<EntryUnion<TValue>>,
              ArrayTail<DepthTuple>
            >,
            TKey
          >
        : never
      : | (TValue extends UnknownRecord ?
            PrependEntryKey<
              _ExpandedEntry<
                PrependEntryKey<EntryUnion<TValue>>,
                ArrayTail<DepthTuple>
              >,
              TKey
            >
          : never)
        | [TKey, Exclude<TValue, UnknownRecord>]
    : never
  : never;

/**
 * Defines a type `EntryDeep` that extends a given object type `T` and expands its entries
 * up to a specified maximum depth, `TMaxDepth`. This type enables recursive exploration
 * of entries within a deeply nested object with a controlled depth limit.
 *
 * This is particularly useful when working with nested data structures, and you want
 * to iterate, manipulate, or validate entries at various levels without exceeding
 * a pre-determined depth.
 *
 * @typeParam T - The base object type to define the entries from.
 * @typeParam TMaxDepth - The maximum depth to which the entries are expanded. Defaults to 4.
 */
export type EntryDeep<
  T extends object,
  TMaxDepth extends number = 4,
> = ExpandedEntry<EntryUnion<T>, TMaxDepth>;

/**
 * A utility type that removes properties of the type `never` from an object type `T`.
 *
 * This type evaluates each property in `T` and omits properties where the type is `never`.
 * The resulting type includes only properties where the type is not `never`.
 *
 * This can be useful when working with mapped types or conditional types that
 * generate `never` values for specific keys.
 *
 * @typeParam T - The object type to process and omit `never` properties from.
 */
export type OmitNeverProps<T extends object> =
  T extends unknown ?
    { [K in keyof T as IsNever<T[K]> extends true ? never : K]: T[K] }
  : never;

/**
 * A utility type that omits properties from an object type where the property type can resolve to `Nil`, i.e., `null` or `undefined`
 *
 * @typeParam T - The object type to process for excluding `Nil` properties.
 */
export type OmitNilProps<T extends object> =
  T extends unknown ?
    { [K in keyof T as IsNil<T[K]> extends true ? never : K]: T[K] }
  : never;

/**
 * Extracts the value type of property from a union of object types distributively.
 *
 * This type distributes over union members of `TSource` and extracts the value type
 * associated with the specified key `TKey`. It handles both explicit properties
 * and index signatures.
 *
 * @typeParam TSource - The source type (typically a union of objects) to extract the property value from.
 * @typeParam TKey - The property key to look up.
 * @typeParam TStripPartial - When `true`, excludes `undefined` from the result for optional/index signature matches.
 *   Defaults to `false`.
 * @example
 * ```typescript
 * type Union = { foo: string } | { foo: number } | { bar: boolean };
 *
 * // Resolves to: string | number
 * type FooValue = DistributedPropValue<Union, 'foo'>;
 *
 * type WithIndex = { [x: string]: number };
 *
 * // Resolves to: number | undefined
 * type IndexValue = DistributedPropValue<WithIndex, 'anyKey'>;
 *
 * // Resolves to: number (undefined stripped)
 * type IndexValueStripped = DistributedPropValue<WithIndex, 'anyKey', true>;
 * ```
 */
export type DistributedPropValue<
  TSource,
  TKey extends PropertyKey,
  TStripPartial extends boolean = false,
> = TSource extends AnyRecord ? PropValue<TSource, TKey, TStripPartial> : never;

type NoPropValue<T extends boolean> = T extends true ? never : undefined;

type PropValue<
  TSource,
  TKey extends PropertyKey,
  TStripPartial extends boolean = false,
  TSourceKey extends keyof TSource = keyof TSource,
> =
  [LiteralToPrimitive<TKey>] extends [TSourceKey] ?
    NoPropValue<TStripPartial> | TSource[TKey & TSourceKey]
  : [TKey] extends [TSourceKey] ?
    TStripPartial extends true ?
      ValueOfPartial<TSource, TKey>
    : TSource[TKey & TSourceKey]
  : NoPropValue<TStripPartial>;

type ValueOfPartial<TSource, TKey extends keyof TSource> =
  TSource extends AnyRecord<TKey, infer TValue> ? TValue : never;

/**
 * A conditional type that evaluates whether a given object type `T` is an empty object (`{}`).
 *
 * The type resolves to `true` when the following conditions are met:
 * - The type `T` extends `Record<PropertyKey, never>`, indicating it's a record without properties and methods.
 * - The keys of `T` are determined to be of `never` type using the `IsNever` utility type.
 *
 * If the conditions are not met, the type resolves to `false`.
 *
 * @typeParam T - The object type to evaluate as an empty object.
 * @remarks It's superior to `type-fest`'s `IsEmptyObject<T>` because it handles `Record<symbol, never>` correctly.
 */
export type IsEmptyObject<T> =
  T extends Record<PropertyKey, never> ? IsNever<keyof T> : false;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ DEPRECATED ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

/**
 * Represents a utility type `Override` that combines the properties of a `Source` object
 * with the properties from a `Values` object. The resulting type overrides the properties
 * in `Source` with the corresponding properties in `Values`.
 *
 * This type is particularly useful when creating a new object type by mixing in specific overrides
 * to an existing source object type.
 *
 * @typeParam TSource - The base object type whose properties may be overridden.
 * @typeParam TValues - An object type that defines properties to override in the `Source` type.
 *                    Each key in `Values` must exist in the `Source` type.
 * @deprecated Use `Mixin<Source, Values>` from `type-fest` instead.
 */
export type Override<
  TSource extends object,
  TValues extends Partial<Record<keyof TSource, unknown>> & {
    [TKey in keyof TValues]: TKey extends keyof TSource ? TValues[TKey] : never;
  },
> = OverrideProperties<TSource, TValues>;

/**
 * Constructs a type by omitting properties from `T` that are assignable to the type `U`.
 *
 * This utility type iterates over the properties of `T` and excludes properties whose types can be assigned to `U`.
 *
 * @typeParam T - The base object type.
 * @typeParam U - The type to omit properties by.
 * @remarks
 * Any property in `T`, whose type is a subtype or is assignable to `U`, will be omitted in the resulting type.
 * @deprecated Use `ConditionalExcept<T, U>` from `type-fest` instead.
 */
export type OmitByType<T, U> = ConditionalExcept<T, U>;

/**
 * A utility type to filter the properties of a given object type `T` and retain
 * only those properties, whose values are assignable to the type, `U`.
 *
 * The resulting type is an object type derived from `T`, where only the properties
 * with value types that match `U` are included.
 *
 * @typeParam T - The source object type whose properties are to be filtered.
 * @typeParam U - The type to filter properties by.
 * @deprecated Use `ConditionalPick<T, U>` from `type-fest` instead.
 */
export type FilterByType<T, U> = ConditionalPick<T, U>;

/**
 * A utility type `Key` that extracts the keys of an object type `T`.
 * If `T` is a record type, it infers the keys from the record.
 * If `T` is a general object, it determines the keys using `keyof`.
 * If `T` is not an object, it resolves to `never`.
 *
 * @typeParam T - The type from which keys are to be extracted. Default is `any`.
 * @deprecated Use `KeysOfUnion<T>` from `type-fest` or simple `keyof <Type>` instead.
 */
export type Key<T = any> =
  T extends Record<infer K, unknown> ? K
  : T extends object ? keyof T
  : never;

/**
 * Represents the value type associated with a specified key of an object.
 *
 * This type alias is a utility type that extracts the type of a property
 * within an object. It ensures type safety by enforcing that the provided
 * key is a valid key in the provided object type. If the provided key is
 * not valid in the object type, it resolves to `never`.
 *
 * @typeParam T - The object type from which the value type is to be extracted.
 *                Defaults to `object` if not specified.
 * @typeParam K - The key of the object for which the value type needs to be determined.
 *                Must be a valid key in the object type `T`.
 * @deprecated Use `ValueOf<T, K>` from `type-fest` instead.
 */
export type Value<T = object, K extends PropertyKey = PropertyKey> =
  T extends object ?
    K extends keyof T ?
      T[K]
    : never
  : never;

/**
 * A utility type `Mixin` that combines properties from two object types, `Parent` and `Child`.
 *
 * `Mixin` omits the keys from `Parent` that are also present in `Child`, then merges
 * the resulting subset of `Parent` with `Child`. This results in a type that has all
 * properties of `Child`, along with only those properties of `Parent` that do not overlap
 * with `Child`.
 *
 * @typeParam TParent - The base object type whose non-overlapping properties are included.
 * @typeParam TChild - The object type whose properties take precedence.
 * @deprecated Use `Merge<Destination, Source>` from `type-fest` instead.
 */
export type Mixin<TParent extends object, TChild extends object> = Merge<
  TParent,
  TChild
>;
