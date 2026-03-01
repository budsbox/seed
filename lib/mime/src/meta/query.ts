/**
 * Provides utilities for querying and resolving MIME type metadata, including
 * canonicalization, charset resolution, and structured data type detection.
 *
 * @module
 */

import type {
  EssenceAliasesMap,
  MimeTypeEssence,
  MimeTypeInput,
  OutputType,
} from '#types';

import type {
  EssenceLookup,
  ResolveMetaInput as MergeMetaInput,
  MetaResolveOptions,
  MimeTypeMeta,
} from './types.js';

import { ensureArray } from '@budsbox/lib-es/array';
import {
  assertSome,
  assertString,
  hasProp,
  isKeyOf,
  isMap,
  isObject,
  isString,
  isUndef,
} from '@budsbox/lib-es/guards';
import { entries } from '@budsbox/lib-es/object';
import { ROSet, union } from '@budsbox/lib-es/set';
import { formatPropAccessor } from '@budsbox/lib-es/string';

import { parse, produceOutput, setParameter, update } from '#lib';

import {
  defaultAliasesMap,
  defaultMeta,
  defaultResolveOptions,
  suffixToMediaTypeLookup,
} from './const.js';
import { type MimeDbSource, mimeDb } from './mime-db-wrapper.js';

/** @ignore */
export function canonicalize(
  essence: MimeTypeEssence,
  options?: MetaResolveOptions & { setCharset?: false },
): MimeTypeEssence;

/**
 * Resolves a MIME type to its canonical form, optionally adding a default charset.
 *
 * @param mimeInput - The MIME type to canonicalize
 * @param options - Resolution options including alias mappings and charset behavior
 * @returns The canonical MIME type in the same format as the input
 * @typeParam TInput - The input MIME type format (string or {@link MimeType} object)
 * @see {@link defaultAliasesMap defaultAliasesMap} — for default canonical to aliases mapping.
 * @example
 * ```typescript
 * // default canonicalization
 * canonicalize('application/javascript');
 * // => 'text/javascript'
 *
 * // set alias for the type
 * canonicalize('application/javascript', {aliases: {'text/ecmascript': 'application/javascript'}});
 * // => 'text/ecmascript'
 *
 * // override the default canonical type
 * canonicalize('application/javascript', {aliases: {'application/ecmascript': 'text/javascript'}});
 * // => 'application/ecmascript'
 * ```
 * @category General
 */
export function canonicalize<TInput extends MimeTypeInput>(
  mimeInput: TInput,
  options?: MetaResolveOptions,
): OutputType<TInput>;
export function canonicalize(
  mimeInput: MimeTypeInput,
  options: MetaResolveOptions = {},
): OutputType {
  const mimeType = parse(mimeInput);
  const { aliases, setCharset } = normalizeOptions(options);
  const lookup = buildExtendedLookup(aliases);
  const resolvedEssence = lookup.get(mimeType.essence) ?? mimeType.essence;
  const resolvedMimeType =
    resolvedEssence === mimeType.essence ?
      mimeType
    : update(mimeType, 'essence', resolvedEssence);
  if (setCharset && !mimeType.parameters.has('charset')) {
    const { charset } = getMergedMeta(resolvedEssence, options);

    return produceOutput(
      mimeInput,
      isString(charset) ?
        setParameter(resolvedMimeType, 'charset', charset)
      : resolvedMimeType,
    );
  }

  return produceOutput(mimeInput, resolvedMimeType);
}

/**
 * Retrieves complete metadata information for a MIME type.
 *
 * Returns metadata including file extensions, compressibility, charset, and source database.
 * By default, this function merges metadata from canonical forms and aliases. Set
 * `options.noMerge` to `true` to retrieve only direct database metadata.
 *
 * @param mimeInput - {@link MimeTypeInput MIME type} to query (string or object)
 * @param options - Resolution options controlling metadata merging and alias handling
 * @returns Complete metadata object for the MIME type
 * @example
 * ```typescript
 * getMeta('application/json');
 * // {
 * // extensions: ReadonlySet(2) { 'json', 'map' },
 * // source: 'iana',
 * // charset: 'UTF-8',
 * // compressible: true
 * // }
 * ```
 * @category General
 */
export function getMeta(
  mimeInput: MimeTypeInput,
  options?: MetaResolveOptions,
): MimeTypeMeta {
  const mimeType = parse(mimeInput);
  const normOptions = normalizeOptions(options);
  return normOptions.noMerge ?
      resolveMeta(mimeType.essence, normOptions)
    : getMergedMeta(mimeType.essence, normOptions);
}

/**
 * Retrieves the source database of a MIME type entry.
 *
 * The source indicates which database originally defined the MIME type.
 * Possible values are:
 * - `'iana'` - Internet Assigned Numbers Authority
 * - `'apache'` - Apache HTTP Server
 * - `'nginx'` - nginx web server list
 *
 * @param mimeInput - The MIME type to query (string or object)
 * @returns The source database identifier, or `null` if not found
 * @example
 * ```typescript
 * getSource('application/json');
 * // => 'iana'
 *
 * getSource('application/custom-type');
 * // => null
 * ```
 * @category General
 */
export function getSource(mimeInput: MimeTypeInput): MimeDbSource | null {
  return getMeta(mimeInput, { noMerge: true }).source ?? null;
}

/**
 * Resolves the charset for a MIME type.
 *
 * This function first checks for an explicit `charset` parameter in the MIME type.
 * If not present, it falls back to the default charset from the metadata database.
 * Text-based MIME types typically have a default charset (usually `utf-8`).
 *
 * @param mimeInput - The MIME type to query (string or object)
 * @param options - Resolution options controlling metadata merging and alias handling
 * @returns The charset string if available, otherwise `undefined`
 * @example
 * ```typescript
 * getCharset('text/html;charset=iso-8859-1');
 * // => 'iso-8859-1'
 *
 * getCharset('text/html');
 * // => 'utf-8' (default from metadata)
 *
 * getCharset('image/png');
 * // => undefined (binary types don't have charsets)
 * ```
 * @category General
 */
export function getCharset(
  mimeInput: MimeTypeInput,
  options?: MetaResolveOptions,
): string | undefined {
  const mimeType = parse(mimeInput);
  return (
    ensureArray(mimeType.parameters.get('charset'))[0] ??
    getMeta(mimeType, options).charset
  );
}

/**
 * Determines the structured data type from a MIME type's suffix.
 *
 * Many MIME types use suffixes (like `+json`, `+xml`) to indicate the underlying
 * structured format. This function extracts the base data type from such suffixes.
 * If no recognized suffix is present, returns the original MIME type essence.
 *
 * @param mimeInput - The MIME type to analyze (string or object)
 * @returns The essence of the underlying structured data format
 * @example
 * ```typescript
 * getStructuredDataType('application/vnd.api+json');
 * // => 'application/json'
 *
 * getStructuredDataType('application/atom+xml');
 * // => 'application/xml'
 *
 * getStructuredDataType('application/json');
 * // => 'application/json' (no suffix, returns original)
 * ```
 * @category General
 */
export function getStructuredDataType(
  mimeInput: MimeTypeInput,
): MimeTypeEssence {
  const { suffix, essence } = parse(mimeInput);
  return isString(suffix) && isKeyOf(suffix, suffixToMediaTypeLookup) ?
      suffixToMediaTypeLookup[suffix]
    : essence;
}

/**
 * Retrieves all MIME types associated with a file extension.
 *
 * Returns an array of MIME type essences sorted by priority. Priority is determined
 * by the source database (IANA types are prioritized) and the position in the
 * extensions list for each MIME type.
 *
 * @param extOrName - File extension (with or without dot) or full filename
 * @param customMap - A lookup from extension to mime type (essence). Overrides the default lookup.
 * @returns Array of MIME type essences sorted by priority, or empty array if none found.
 * @remarks This function **always** returns {@link defaultAliasesMap canonical types}, though you can override them using `customMap`.
 * @example
 * ```typescript
 * getMimesByExtension('json');
 * // => ['application/json']
 *
 * getMimesByExtension('.txt');
 * // => ['text/plain']
 *
 * getMimesByExtension('index.js', {js: 'application/javascript'});
 * // => ['application/javascript']
 *
 * getMimeByExtension('')
 * ```
 * @category General
 */
export function getMimesByExt(
  extOrName: string,
  customMap?:
    | Map<string, MimeTypeEssence>
    | { readonly [x: string]: MimeTypeEssence },
): MimeTypeEssence[] {
  assertString(extOrName, 'extOrName');
  assertSome(customMap, 'customMap', isMap, isObject, isUndef);

  const ext = extOrName.split('.').at(-1) ?? '';

  if (isMap(customMap) && customMap.has(ext)) {
    const value = customMap.get(ext);
    assertString(value, 'customMap.get("${ext}")');
    return [value];
  } else if (hasProp(customMap, ext)) {
    const value = customMap[ext];
    assertString(value, formatPropAccessor('customMap', ext));
    return [value];
  }

  if (ext === '') return ['application/octet-stream'];

  return entries(defaultExtensionsLookup.get(ext) ?? {})
    .toSorted(([, v1], [, v2]) => v2 - v1)
    .map(([essence]) => essence);
}

/**
 * Retrieves the primary MIME type for a file extension.
 *
 * Returns the highest priority MIME type associated with the given extension.
 * This is a convenience function that returns the first element from {@link getMimesByExt}.
 *
 * @param extOrName - File extension (with or without dot) or full filename
 * @param customMap - Custom lookup of file extensions to MIME types.
 * @returns The primary MIME type essence, or `undefined` if no match found
 * @example
 * ```typescript
 * getMimeByExtension('json');
 * // => 'application/json'
 *
 * getMimeByExtension('.html');
 * // => 'text/html'
 *
 * getMimeByExtension('document.zip');
 * // => 'application/zip'
 *
 * getMimeByExtension('unknown');
 * // => undefined
 * ```
 * @category General
 */
export function getMimeByExt(
  extOrName: string,
  customMap?:
    | Map<string, MimeTypeEssence>
    | { readonly [x: string]: MimeTypeEssence },
): MimeTypeEssence | undefined {
  return getMimesByExt(extOrName, customMap)[0];
}

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ INTERNALS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

const getMergedMeta = (
  typeEssence: MimeTypeEssence,
  options?: MetaResolveOptions,
): MimeTypeMeta => {
  const { aliases } = normalizeOptions(options);
  const lookup = buildExtendedLookup(aliases);
  const typesToMerge = [...lookup].flatMap(([alias, canonical]) =>
    alias === typeEssence || canonical === typeEssence ?
      ([alias, canonical] as const)
    : [],
  );
  typesToMerge.push(
    canonicalize(typeEssence, { ...options, setCharset: false }),
  );

  return mergeMeta(typesToMerge);
};

const mergeMeta = (
  input: readonly MergeMetaInput[],
  options?: MetaResolveOptions,
): MimeTypeMeta => {
  const info = input.reduce((meta, inputItem) => {
    const typeMeta = resolveMeta(inputItem, options);
    return {
      ...meta,
      ...typeMeta,
      extensions: union(meta.extensions, typeMeta.extensions),
    };
  }, resolveMeta());

  return {
    ...info,
    extensions: new ROSet(info.extensions),
  };
};

const resolveMeta = (
  essenceOrDbRecord?: MergeMetaInput,
  options: MetaResolveOptions = {},
): MimeTypeMeta => {
  const { db, keepCharsetCase } = normalizeOptions(options);

  const dbRecord =
    isString(essenceOrDbRecord) ? db[essenceOrDbRecord] : essenceOrDbRecord;

  return {
    ...defaultMeta,
    ...dbRecord,
    ...(!keepCharsetCase && hasProp(dbRecord, 'charset') ?
      { charset: dbRecord.charset.toLowerCase() }
    : undefined),
    extensions: new ROSet(dbRecord?.extensions ?? defaultMeta.extensions),
  };
};

const lookupCache = new WeakMap<EssenceAliasesMap, EssenceLookup>();

const buildExtendedLookup = (aliasesMap: EssenceAliasesMap): EssenceLookup => {
  if (Object.keys(aliasesMap).length < 1) return defaultLookup;
  if (lookupCache.has(aliasesMap)) return lookupCache.get(aliasesMap)!;

  const mainLookup = buildAliasLookup(aliasesMap);
  const lookup = new Map([
    ...[...defaultLookup].map(([alias, canonical]) => {
      return [
        alias,
        mainLookup.get(alias) ?? mainLookup.get(canonical) ?? canonical,
      ] as const;
    }),
    ...mainLookup,
  ]);
  lookupCache.set(aliasesMap, lookup);

  return lookup;
};

const buildAliasLookup = (
  aliasesMap: EssenceAliasesMap,
): Map<MimeTypeEssence, MimeTypeEssence> =>
  new Map(
    entries(aliasesMap).flatMap(([preferred, aliases]) =>
      ensureArray(aliases).map((alias) => [
        parse(alias).essence,
        parse(preferred).essence,
      ]),
    ),
  );

const normalizeOptions = (
  options?: MetaResolveOptions,
): Required<MetaResolveOptions> => {
  assertSome(options, 'options', isObject, isUndef);

  return {
    ...defaultResolveOptions,
    ...options,
  };
};

const defaultLookup = buildAliasLookup(defaultAliasesMap);

export const defaultsMeta = Object.keys(mimeDb).reduce<
  Map<MimeTypeEssence, MimeTypeMeta>
>((map, essence) => {
  const canonical = canonicalize(essence);
  if (!map.has(canonical)) {
    map.set(canonical, getMeta(canonical));
  }

  return map;
}, new Map());

const defaultExtensionsLookup = [...defaultsMeta]
  .flatMap(([essence, { extensions, source }]) => {
    // prioritize iana
    const sourceWt = source === 'iana' ? 100 : 0;
    // deprioritize application/octet-stream
    const octetStreamWt = essence === 'application/octet-stream' ? -50 : 0;
    return [...extensions.keys()].map(
      (ext, i) => [ext, essence, sourceWt + octetStreamWt + 5 - i] as const,
    );
  })
  .reduce<Map<string, Record<MimeTypeEssence, number>>>(
    (map, [ext, essence, shift]) => {
      if (!map.has(ext)) map.set(ext, {});
      const record = map.get(ext)!;

      if (!(essence in record)) {
        record[essence] = shift;
      }

      return map;
    },
    new Map(),
  );
