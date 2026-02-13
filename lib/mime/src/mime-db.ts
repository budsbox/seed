/**
 * This module is just the conventional wrapper for the `mime-db` package.
 *
 * @module
 */

import type { KeysOfUnion } from 'type-fest';

import type {
  AnyRecord,
  Def,
  DistributedPropValue,
  Infer,
} from '@budsbox/lib-types';

import mimeDbRaw from 'mime-db/db.json' with { type: 'json' };

export type MimeDbKey = keyof typeof mimeDbRaw;

export type MimeDbSource = 'apache' | 'iana' | 'nginx';

export type MimeDbRecord = Infer<
  Readonly<
    UndefinedToOptional<{
      [K in KeysOfUnion<MimeDbRecordUnion>]: Readonly<
        DistributedPropValue<MimeDbRecordUnion, K>
      >;
    }> & { readonly source?: MimeDbSource }
  >
>;

export type MimeDb = Record<`${string}/${string}` | MimeDbKey, MimeDbRecord>;

export const mimeDb = mimeDbRaw as MimeDb;

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ UTILITY TYPES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

type MimeDbRecordUnion = (typeof mimeDbRaw)[MimeDbKey];

type UndefinedToOptional<TSource extends AnyRecord> = Infer<
  {
    [K in keyof TSource as undefined extends TSource[K] ? never
    : K]: TSource[K];
  } & {
    [K in keyof TSource as undefined extends TSource[K] ? K : never]?: Def<
      TSource[K]
    >;
  }
>;
