import type {
  EssenceAliasesMap,
  MimeTypeEssence,
  MimeTypeInput,
  OutputType,
} from '#types';

import type { MimeDbSource } from './mime-db-wrapper.js';
import type {
  EssenceLookup,
  ResolveMetaInput as MergeMetaInput,
  MetaResolveOptions,
  MimeTypeMeta,
} from './types.js';

import { ensureArray } from '@budsbox/lib-es/array';
import { hasProp, isString } from '@budsbox/lib-es/guards';
import { entries } from '@budsbox/lib-es/object';
import { ROSet, union } from '@budsbox/lib-es/set';

import { parse, produceOutput, setParameter, update } from '#lib';

import {
  defaultAliasesMap,
  defaultMeta,
  defaultResolveOptions,
  suffixToMediaTypeLookup,
} from './const.js';

export function canonicalize(
  essence: MimeTypeEssence,
  options?: MetaResolveOptions & { noDefaultCharset: true },
): MimeTypeEssence;
export function canonicalize<TInput extends MimeTypeInput>(
  mimeInput: TInput,
  options?: MetaResolveOptions,
): OutputType<TInput>;
export function canonicalize(
  mimeInput: MimeTypeInput,
  options: MetaResolveOptions = {},
): OutputType {
  const mimeType = parse(mimeInput);
  const { aliases, noDefaultCharset } = normalizeOptions(options);
  const lookup = buildExtendedLookup(aliases);

  const resolvedEssence = lookup.get(mimeType.essence) ?? mimeType.essence;
  const resolvedMimeType =
    resolvedEssence === mimeType.essence ?
      mimeType
    : update(mimeType, 'essence', resolvedEssence);
  if (noDefaultCharset || mimeType.parameters.has('charset')) {
    return produceOutput(mimeInput, resolvedMimeType);
  } else {
    const { charset } = getMergedMeta(resolvedEssence, options);

    return produceOutput(
      mimeInput,
      isString(charset) ?
        setParameter(resolvedMimeType, 'charset', charset)
      : resolvedMimeType,
    );
  }
}

export function getMetaInfo(
  mimeInput: MimeTypeInput,
  options?: MetaResolveOptions,
): MimeTypeMeta {
  const mimeType = parse(mimeInput);
  const normOptions = normalizeOptions(options);
  return normOptions.noMerge ?
      resolveMeta(mimeType.essence)
    : getMergedMeta(mimeType.essence, normOptions);
}

export function getSource(mimeInput: MimeTypeInput): MimeDbSource | null {
  return getMetaInfo(mimeInput, { noMerge: true }).source ?? null;
}

export function getCharset(
  mimeInput: MimeTypeInput,
  options?: MetaResolveOptions,
): string | undefined {
  const mimeType = parse(mimeInput);
  return (
    ensureArray(mimeType.parameters.get('charset'))[0] ??
    getMetaInfo(mimeType, options).charset
  );
}

export function getStructuredDataType(
  mimeInput: MimeTypeInput,
): MimeTypeEssence {
  const { suffix, essence } = parse(mimeInput);
  return isString(suffix) && hasProp(suffixToMediaTypeLookup, suffix) ?
      (suffixToMediaTypeLookup[suffix] as MimeTypeEssence)
    : essence;
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

  return mergeMeta(...typesToMerge);
};

const mergeMeta = (...input: readonly MergeMetaInput[]): MimeTypeMeta => {
  const info = input.reduce((meta, inputItem) => {
    const typeMeta = resolveMeta(inputItem);
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
  const { db } = normalizeOptions(options);

  const dbRecord =
    isString(essenceOrDbRecord) ? db[essenceOrDbRecord] : essenceOrDbRecord;

  return {
    ...defaultMeta,
    ...dbRecord,
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

const defaultLookup = buildAliasLookup(defaultAliasesMap);

const normalizeOptions = (
  options: MetaResolveOptions = {},
): Required<MetaResolveOptions> => ({
  ...defaultResolveOptions,
  ...options,
});
