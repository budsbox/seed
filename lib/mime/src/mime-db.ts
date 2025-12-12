import type { KeysOfUnion, SetOptional, Simplify } from 'type-fest';

import mimeDbRaw from 'mime-db/db.json' with { type: 'json' };

export type MimeDbKey = keyof typeof mimeDbRaw;

export type MimeDbRecord = Simplify<
  UndefinedToOptional<{
    readonly [K in MimeDbRecordKeys]: Readonly<
      DistributedValueOf<MimeDbRecordUnion, K>
    >;
  }>
>;

export type MimeDb = Record<MimeDbKey, MimeDbRecord>;

export const mimeDb: MimeDb = mimeDbRaw;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ UTILITY TYPES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

type MimeDbRecordUnion = (typeof mimeDbRaw)[MimeDbKey];
type MimeDbRecordKeys = KeysOfUnion<MimeDbRecordUnion>;

type DistributedValueOf<TSource, TKey extends PropertyKey> =
  TSource extends Record<TKey, infer TValue> ? TValue : undefined;

type UndefinedToOptional<TSource extends Record<PropertyKey, unknown>> =
  ExcludeFromValues<
    SetOptional<
      TSource,
      keyof {
        [K in keyof TSource as undefined extends TSource[K] ? K : never]: null;
      }
    >,
    undefined
  >;
type ExcludeFromValues<
  TSource extends Record<PropertyKey, unknown>,
  TExclude,
> = {
  [K in keyof TSource]: Exclude<TSource[K], TExclude>;
};
