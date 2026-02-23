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

/**
 * A valid MIME type key from the mime-db database.
 *
 * @example
 * ```typescript
 * const key: MimeDbKey = 'application/json';
 * ```
 */
export type MimeDbKey = keyof typeof mimeDbRaw;

/**
 * The source of a MIME type entry in the database.
 *
 * Can be one of the following:
 * - `apache` - Apache HTTP Server
 * - `iana` - Internet Assigned Numbers Authority
 * - `nginx` - nginx web server list
 */
export type MimeDbSource = 'apache' | 'iana' | 'nginx';

/**
 * A record representing a MIME type entry with normalized optional fields.
 *
 * @interface
 * @remarks This interface actually is inferred type.
 * This type normalizes the union of all possible MIME type records from the database,
 * converting properties that may be {@link undefined} into optional properties.
 * It's a **readonly** type, though TypeDoc may not display it correctly.
 * @example
 * ```typescript
 * const record: MimeDbRecord = {
 *   source: 'iana',
 *   compressible: true,
 *   extensions: ['json']
 * };
 * ```
 */
export type MimeDbRecord = Infer<
  Readonly<
    UndefinedToOptional<{
      [K in KeysOfUnion<MimeDbRecordUnion>]: Readonly<
        DistributedPropValue<MimeDbRecordUnion, K>
      >;
    }> & { readonly source?: MimeDbSource }
  >
>;

/**
 * A dictionary mapping MIME type strings to their corresponding metadata records.
 *
 * Keys are MIME types in the format `type/subtype` (e.g., `application/json`).
 */
export type MimeDb = Record<`${string}/${string}` | MimeDbKey, MimeDbRecord>;

/**
 * The mime-db database containing MIME type metadata.
 *
 * This object maps MIME type strings to their corresponding {@link MimeDbRecord} entries,
 * including information about file extensions, compressibility, character sets, and sources.
 *
 * @example
 * ```typescript
 * // Look up a MIME type
 * const jsonType = mimeDb['application/json'];
 * console.log(jsonType?.extensions); // ['json']
 * ```
 */
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
