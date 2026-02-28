import type { Arrayable, Merge } from 'type-fest';

import type { Infer, Nil } from '@budsbox/lib-types';

import type { MimeTypeEssence } from '#types';

import type { MimeDb, MimeDbRecord } from './mime-db-wrapper.js';

/**
 * Extended metadata for a MIME type, including extensions as a readonly {@link Set}.
 *
 * Merges {@link MimeDbRecord} properties with a strongly-typed extensions set.
 *
 * @interface
 * @inline
 * @example
 * ```typescript
 * const meta: MimeTypeMeta = {
 *   charset: 'utf-8',
 *   compressible: true,
 *   extensions: new Set(['html', 'htm']),
 *   source: 'iana'
 * };
 * ```
 */
export type MimeTypeMeta = Infer<
  Merge<
    MimeDbRecord,
    {
      readonly extensions: ReadonlySet<string>;
      readonly compressible?: boolean;
    }
  >
>;

/**
 * Mapping of canonical MIME type essences to their aliases.
 *
 * Each key is a canonical essence, and the value is one or more alias essences
 * that should resolve to the canonical form.
 *
 * @example
 * ```typescript
 * const aliases: EssenceAliasesMap = {
 *   'text/javascript': ['application/javascript', 'application/x-javascript']
 * };
 * ```
 * @example
 * ```typescript
 * const singleAlias: EssenceAliasesMap = {
 *   'text/html': 'text/x-html'
 * };
 * ```
 */
export interface EssenceAliasesMap {
  readonly [essence: MimeTypeEssence]: Readonly<Arrayable<MimeTypeEssence>>;
}

/**
 * Lookup map from alias essences to their canonical essence forms.
 *
 * Used internally to quickly resolve MIME type aliases to their canonical representations.
 * Usually it's constructed from {@link EssenceAliasesMap}.
 *
 * @example
 * ```typescript
 * const lookup: EssenceLookup = new Map([
 *   ['text/javascript', 'application/javascript'],
 *   ['application/x-javascript', 'application/javascript']
 * ]);
 * ```
 */
export type EssenceLookup = Map<MimeTypeEssence, MimeTypeEssence>;

/**
 * Configuration options for MIME type metadata-related functions (combined).
 *
 * Controls alias resolution, database selection, charset behavior, and metadata merging.
 *
 * @inline
 */
export interface MetaResolveOptions {
  /**
   * Custom mapping of canonical MIME type essences to their aliases.
   *
   * `aliases` lets you **override what counts as canonical** for specific MIME values.
   * Think of it as: “when you see this alias, canonicalize it to that preferred type.”
   * The object key is the preferred result, and the value is one alias (or many aliases) that should collapse to that key.
   * During canonicalization, your custom aliases are applied together with the {@link defaultAliasesMap defaults},
   * but your entries can redirect resolution (including aliases already known by default).
   * So you can either add support for new alias strings or change which canonical type an existing alias resolves to.
   *
   * @see {@link defaultAliasesMap defaultAliasesMap} — for default canonical to aliases mapping.
   */
  readonly aliases?: EssenceAliasesMap;

  /**
   * Custom db to search records into. It should conform the {@link MimeDb MIME database schema}.
   */
  readonly db?: MimeDb;

  /**
   * Specifies whether the `charset` parameter should preserve its original case (if present in `mime-db`).
   * Applicable in {@link canonicalize} and {@link getCharset} functions.
   */
  readonly keepCharsetCase?: boolean;

  /**
   * If `true`, aliased records won't be merged into the result (only the record of a given type will be returned).
   */
  readonly noMerge?: boolean;

  /**
   * Specifies whether a `charset` parameter should be set to default value (if present in `mime-db`).
   * Applicable in {@link canonicalize} function.
   */
  readonly setCharset?: boolean;
}

/**
 * Input types accepted for metadata resolution.
 *
 * Can be a database record, a MIME type essence string, extended metadata, or a nullish value.
 *
 * @internal
 * @example
 * ```typescript
 * const input1: ResolveMetaInput = 'text/html';
 * const input2: ResolveMetaInput = { charset: 'utf-8', extensions: ['html'] };
 * const input3: ResolveMetaInput = null;
 * ```
 */
export type ResolveMetaInput =
  | MimeDbRecord
  | MimeTypeEssence
  | MimeTypeMeta
  | Nil;

/**
 * Represents a mapping between file extensions and their corresponding MIME type essence.
 */
export type FileExtLookup = Map<string, MimeTypeEssence>;
