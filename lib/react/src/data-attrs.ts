import type {
  IsEqual,
  IsNever,
  Join,
  KebabCase,
  UnionToIntersection,
} from 'type-fest';

import type { Infer, Nil } from '@budsbox/lib-types';
import type { EntryDeep, UnknownNestedEntry } from '@budsbox/lib-types/object';

import {
  isArray,
  isFalse,
  isNotNil,
  isObject,
  isTrue,
} from '@budsbox/lib-es/guards';
import { kebabCase } from '@budsbox/lib-es/string';

/**
 * Processes the provided input object and resolves it into a structured form suitable for handling data attributes.
 *
 * @param input - The input object containing key-value pairs that represent data attributes to be processed.
 * @returns The resolved object containing the processed data attributes.
 */
export function dataAttrs<TInput extends DataAttrsInput>(
  input: TInput,
): DataAttrsResolved<TInput>;
// eslint-disable-next-line jsdoc/require-jsdoc
export function dataAttrs(input: Readonly<DataAttrsInput>): DataAttrsResolved;
export function dataAttrs(input: Readonly<DataAttrsInput>): DataAttrsResolved {
  const queue: DataAttrEntry[] = Object.entries(input).map(([key, value]) => [
      `data-${kebabCase(key)}`,
      value,
    ]),
    processed: Array<[`data-${string}`, DataAttrArray | DataAttrPrimitive]> =
      [];

  while (queue.length) {
    const [key, value] = queue.shift()!;

    if (isArray(value) || !isObject(value)) {
      processed.push([key, value]);
    } else {
      queue.push(
        ...Object.entries(value).map(
          ([k, v]): DataAttrEntry => [`${key}-${kebabCase(k)}`, v],
        ),
      );
    }
  }

  const result = processed.reduce<DataAttrsResolved>((acc, [key, value]) => {
    if (isArray(value)) {
      const filtered = value.filter((v) => testItem(v));
      if (filtered.length) {
        acc[key] = filtered.join(' ');
      }
    } else if (testItem(value)) {
      // `true` replaced with an empty string to make a data-attr present but empty
      acc[key] = isTrue(value) ? '' : value;
    }

    return acc;
  }, {});

  return result;
}

const testItem = (item: DataAttrPrimitive): item is DataAttrPrimitiveInclude =>
  isNotNil(item) && !isFalse(item) && item !== '';

/**
 * Represents the resolved data attributes structure based on the input type `TInput`.
 * This type processes the data attributes structure by filtering and reducing the entries
 * to produce a final resolved type, which is used to define strongly
 * typed data attributes in applications.
 *
 * The transformation process of the type follows these steps:
 * - If `TInput` is equal to `DataAttrsInput`, it uses a default record structure with
 *   `DataAttrArray` and `DataAttrPrimitive` types as the values.
 * - `EntryDeep` is applied to convert the input type into a union of nested entries.
 * - `FilterDataEntry` filters specific entries based on provided conditions.
 * - `ReduceDataEntry` processes and reduces the entries into a final usable structure.
 * - `DataAttrsOfEntry` maps the reduced entries to the resolved data attributes format.
 *
 * @typeParam TInput - The input type used to generate the resolved data attributes structure.
 *                     Defaults to `DataAttrsInput`.
 */
export type DataAttrsResolved<TInput extends DataAttrsInput = DataAttrsInput> =
  DataAttrsOfEntry<
    ReduceDataEntry<
      FilterDataEntry<
        EntryDeep<
          IsEqual<TInput, DataAttrsInput> extends true ?
            Record<string, DataAttrArray | DataAttrPrimitive>
          : TInput,
          6
        >
      >
    >
  >;

type DataAttrPrimitive = boolean | number | string | Nil;

type DataAttrArray = ReadonlyArray<number | string | Nil>;

type DataAttrValue = DataAttrArray | DataAttrPrimitive | DataAttrRecordType;

interface DataAttrRecord {
  readonly [key: string]: DataAttrValue;
}

// a little hack to avoid interfaces in types
type DataAttrRecordType<T extends DataAttrRecord = DataAttrRecord> = {
  [K in keyof T]: T[K];
};

type DataAttrsInput = Record<string, DataAttrValue>;

type DataAttrEntry = [DataAttrKey, DataAttrValue];

type DataAttrExclude = '' | false | Nil | Nil[] | [];

type DataAttrPrimitiveInclude = Exclude<DataAttrPrimitive, DataAttrExclude>;

type FilterDataEntry<TEntry extends UnknownNestedEntry> =
  TEntry extends [infer TKey, infer TValue] ?
    DataAttrArray | DataAttrPrimitive extends TValue ? TEntry
    : IsNever<Exclude<TValue, DataAttrExclude>> extends true ? never
    : [
        TKey,
        TValue extends Array<infer TItem> ?
          TItem extends DataAttrExclude ?
            never
          : TValue
        : TValue,
      ]
  : never;

type ReduceDataEntry<TEntry extends UnknownNestedEntry> =
  TEntry extends [infer TKey, infer TValue] ?
    [
      TKey,
      TValue extends readonly unknown[] ? string | undefined
      : IsNever<Extract<DataAttrExclude, TValue>> extends true ?
        TValue extends true ?
          ''
        : TValue
      : Exclude<TValue, DataAttrExclude> | undefined,
    ]
  : never;

type DataAttrKey<TParts extends readonly string[] = string[]> =
  `data-${KebabCase<Join<TParts, '-'>>}`;

type DataAttrsOfEntry<TEntry extends UnknownNestedEntry> = Infer<
  UnionToIntersection<
    TEntry extends readonly [infer TKey, infer TValue] ?
      TKey extends readonly string[] ?
        undefined extends TValue ?
          Partial<Record<DataAttrKey<TKey>, TValue & {}>>
        : Record<DataAttrKey<TKey>, TValue & {}>
      : never
    : never
  >
>;

// type tests

// type TestDefaults = DataAttrsResolved;
//
// type TestRecord = DataAttrsResolved<Record<`lolKek-${string}`, boolean>>;
//
// type TestSink = DataAttrsResolved<{
//   foo: number;
//   bar: boolean | null;
//   true: true;
//   drop: [];
//   arr: DataAttrArray;
//   tuple: [number, string];
//   baz: string;
//   lol: { kekTo: boolean; empty: []; arr: DataAttrArray };
// }>;
//
// // step by step test
// type TestInput = EntryDeep<DataAttrsInput, 1>;
//
// type TestInputFilter = FilterDataEntry<TestInput>;
//
// type TestInputReduce = ReduceDataEntry<TestInputFilter>;
//
// type TestInputResolved = DataAttrsOfEntry<TestInputReduce>;
//
// type TestBool =
//   TestInputReduce extends [infer TKey, infer TValue] ?
//     undefined extends TValue ?
//       Partial<Record<DataAttrKey<TKey>, NonNullable<TValue>>>
//     : 'TValue is not undefined'
//   : never;
