import type { Arrayable, Merge } from 'type-fest';

import type { Infer, Nil } from '@budsbox/lib-types';

import type { MimeTypeEssence } from '#types';

import type { MimeDb, MimeDbRecord, MimeDbSource } from './mime-db-wrapper.js';

export type MimeTypeMeta = Infer<
  Merge<MimeDbRecord, { readonly extensions: ReadonlySet<string> }>
>;

export type MimeTypeCollectedMeta = Infer<
  Omit<MimeTypeMeta, 'source'> & {
    readonly canonical: MimeTypeResolvedMeta;
  }
>;

export interface MimeTypeResolvedMeta {
  essence: MimeTypeEssence;
  type: string;

  source?: MimeDbSource;
}

export interface EssenceAliasesMap {
  readonly [essence: MimeTypeEssence]: Readonly<Arrayable<MimeTypeEssence>>;
}

export type EssenceLookup = Map<MimeTypeEssence, MimeTypeEssence>;

export interface MetaResolveOptions {
  readonly aliases?: EssenceAliasesMap;
  readonly db?: MimeDb;
  readonly noDefaultCharset?: boolean;
  readonly noMerge?: boolean;
}

export type ResolveMetaInput =
  | MimeDbRecord
  | MimeTypeEssence
  | MimeTypeMeta
  | Nil;
