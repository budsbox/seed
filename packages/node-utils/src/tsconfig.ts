import type { TsConfigJson } from 'type-fest';

import { dirname, extname, join, relative, resolve } from 'node:path';
import { cwd } from 'node:process';
import { fileURLToPath } from 'node:url';

import { execa } from 'execa';

export type { TsConfigJson };

export async function getTsConfig(
  tsconfigPath: string | URL,
  {
    workdir = cwd(),
    absolutePaths = false,
    normalizeRelativePath = false,
  }: {
    readonly workdir?: string;
    readonly absolutePaths?: boolean;
    readonly normalizeRelativePath?: boolean;
  } = {},
): Promise<TsConfigJson> {
  let absPath;

  try {
    absPath = fileURLToPath(tsconfigPath);
  } catch (e) {
    if (tsconfigPath instanceof URL || tsconfigPath.startsWith('file://')) {
      throw e;
    }

    absPath = resolve(workdir, tsconfigPath);
  }

  const tsconfigFilePath = join(
    absPath,
    extname(absPath) === '.json' ? '.' : 'tsconfig.json',
  );
  const tsconfigDir = dirname(tsconfigFilePath);
  const { stdout } =
    await execa`yarn tsc --project ${tsconfigFilePath} --showConfig`;
  const tsconfig = JSON.parse(stdout) as TsConfigJson;

  if (!absolutePaths) {
    if (Array.isArray(tsconfig.include)) {
      tsconfig.include = tsconfig.include.map((abs) =>
        relativePath(abs, tsconfigDir, normalizeRelativePath),
      );
    }

    if (Array.isArray(tsconfig.exclude)) {
      tsconfig.exclude = tsconfig.exclude.map((abs) =>
        relativePath(abs, tsconfigDir, normalizeRelativePath),
      );
    }
  }

  return tsconfig;
}

type SeparatedIncludeLike = Record<'files' | 'dirs', string[]>;

export function separateIncludes(
  includes: readonly string[],
): SeparatedIncludeLike {
  return includes.reduce<SeparatedIncludeLike>(
    (acc, include) => {
      acc[extname(include) === '' ? 'dirs' : 'files'].push(include);

      return acc;
    },
    { files: [], dirs: [] },
  );
}

const relativePath = (absPath: string, dir: string, normal = false): string => {
  const rel = relative(dir, absPath);
  return !normal || rel.startsWith('.') ? rel : `./${rel}`;
};
