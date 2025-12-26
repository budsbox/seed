import type { KeysOfUnion, SetOptional } from 'type-fest';

import mimeDbRaw from 'mime-db/db.json' with { type: 'json' };

export type MimeDbKey = keyof typeof mimeDbRaw;

export type MimeDbSource = 'apache' | 'iana' | 'nginx';

export type MimeDbRecord = Readonly<
  UndefinedToOptional<{
    [K in MimeDbRecordKeys]: Readonly<DistributedValueOf<MimeDbRecordUnion, K>>;
  }> & { source?: MimeDbSource }
>;

export type MimeDb = Record<`${string}/${string}` | MimeDbKey, MimeDbRecord>;

export const mimeDb = mimeDbRaw as MimeDb;

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
