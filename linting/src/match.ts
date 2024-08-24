import type { Undef } from '@budsbox/types';

import path from 'node:path';

import micromatch from 'micromatch';

const langExtensions: Readonly<Record<LangOption, string[]>> = {
  all: [],
  js: ['js', 'jsx', 'mjs', 'cjs'],
  ts: ['ts', 'tsx', 'mts', 'cts'],
};
langExtensions.all.push(...Object.values(langExtensions).flatMap((v) => v));

const jsxExtensions = ['jsx', 'tsx'];

const sourceTypeExtensions: Readonly<Record<SourceTypeExtensions, string[]>> = {
  ambiguous: ['js', 'jsx', 'ts', 'tsx'],
  commonjs: ['cjs', 'cts'],
  module: ['mjs', 'mts'],
};

export const queryExtensions = ({
  lang,
  sourceType,
  targetSourceType = sourceType,
  jsx = false,
}: ExtensionsOptions): string[] => {
  const langExts = langExtensions[lang];

  return diff(
    intersection(
      langExts,
      targetSourceType == null ? langExts : (
        union(
          sourceTypeExtensions[targetSourceType],
          targetSourceType === sourceType ? sourceTypeExtensions.ambiguous : [],
        )
      ),
    ),
    jsx ? [] : jsxExtensions,
  );
};

/**
 *
 * @param options
 */
export function match({ files, dirs, ...rest }: MatchOptions): string[] {
  const extGlob = `*.{${queryExtensions(rest).join(',')}}`;

  return [
    ...micromatch(files ?? [], extGlob, {
      basename: true,
      dot: true,
      format: (s: string) => s.replace(/^(\.\/)?/, ''),
    }),
    ...(dirs ?? []).map((dir) =>
      path.posix.join(dir.replace(/\/\*$/, ''), extGlob),
    ),
  ];
}

export type LangCode = 'js' | 'ts';

export type LangOption = LangCode | 'all';

export type SourceType = 'commonjs' | 'module';

type SourceTypeExtensions = SourceType | 'ambiguous';

export interface ExtensionsOptions {
  readonly lang: LangOption;
  readonly sourceType?: Undef<SourceType>;
  readonly targetSourceType?: Undef<SourceType>;
  readonly jsx?: boolean;
}

export interface GlobsOptions extends ExtensionsOptions {
  readonly dirs?: Undef<readonly string[]>;
}
export interface MatchOptions extends GlobsOptions {
  readonly files?: Undef<readonly string[]>;
}

/**
 *
 * @param arrays {ReadonlyArray<ReadonlyArray<string> | string>}
 * @return {string[]}
 */
function union(...arrays: ReadonlyArray<string | readonly string[]>): string[] {
  return [...new Set(arrays.flatMap((v) => v))];
}

/**
 *
 * @param arrays
 */
function intersection(
  ...arrays: ReadonlyArray<string | readonly string[]>
): string[] {
  const united = union(...arrays);
  const sets = arrays.map((v) => new Set(v));

  return united.filter((v) => sets.every((set) => set.has(v)));
}

/**
 *
 * @param a
 * @param b
 */
function diff(a: readonly string[], b: readonly string[]): string[] {
  const set = new Set(b);
  return a.filter((v) => !set.has(v));
}
