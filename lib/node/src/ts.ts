import type { ResolvedJson } from './types.js';
import type { TsConfigJson } from 'type-fest';

import { promises as fs } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { cwd } from 'node:process';
import { fileURLToPath } from 'node:url';

import { execa } from 'execa';

import { hasProp, isArray, isString } from '@budsbox/lib-es/guards';

export type { TsConfigJson };

/**
 * Reads and processes a TypeScript configuration file (`tsconfig.json`) from a specified path.
 *
 * @param tsconfigPath - The path or URL to the `tsconfig.json` file. It can be an absolute or relative path, or a `URL`.
 * @param options - An object containing optional configuration settings:
 *   @param options.stupid - A boolean indicating whether to directly read the `tsconfig.json` file (if `true`), instead of using the TypeScript compiler (`tsc`) to process the configuration. Defaults to `false`.
 *   @param options.workdir - A directory to resolve the `tsconfigPath` from, if the path is relative. Defaults to the current working directory.
 *   @param options.absolutePaths - A boolean indicating whether file paths in the configuration (e.g., `include`, `exclude`, and `references`) should be converted to absolute paths. Defaults to `false`.
 *   @param options.normalizeRelativePaths - A boolean indicating whether relative paths in the configuration should be normalized. This is useful for consistent formatting. Defaults to `false`.
 * @returns A `Promise` resolving to the parsed `tsconfig.json` as a `TsConfigJson` object, with optional transformations based on the provided options.
 */
export async function getTsConfig(
  tsconfigPath: string | URL,
  {
    stupid = false,
    workdir = cwd(),
    absolutePaths = false,
    normalizeRelativePaths = false,
  }: {
    readonly stupid?: boolean;
    readonly workdir?: string;
    readonly absolutePaths?: boolean;
    readonly normalizeRelativePaths?: boolean;
  } = {},
): Promise<ResolvedJson<TsConfigJson>> {
  let absPath: string;

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

  let tsconfigJson: string;

  if (stupid) {
    tsconfigJson = await fs.readFile(tsconfigFilePath, 'utf8');
  } else {
    const { stdout } =
      await execa`yarn tsc --project ${tsconfigFilePath} --showConfig`;
    tsconfigJson = stdout;
  }
  const tsconfig = JSON.parse(tsconfigJson) as TsConfigJson;

  if (hasProp(tsconfig, 'references', isArray)) {
    tsconfig.references = tsconfig.references.filter((ref) =>
      hasProp(ref, 'path', isString),
    );
  }

  if (absolutePaths) {
    if (hasProp(tsconfig, 'references', isArray)) {
      tsconfig.references = tsconfig.references.map((ref) => ({
        ...ref,
        path: resolve(tsconfigDir, ref.path),
      }));
    }
  } else {
    (['include', 'exclude'] as const).forEach((key) => {
      if (hasProp(tsconfig, key, isArray)) {
        tsconfig[key] = tsconfig[key].map((abs) =>
          relativePath(abs, tsconfigDir, normalizeRelativePaths),
        );
      }
    });

    if (hasProp(tsconfig, 'references', isArray)) {
      tsconfig.references = tsconfig.references.map((ref) => ({
        ...ref,
        path: relativePath(
          join(tsconfigDir, ref.path),
          tsconfigDir,
          normalizeRelativePaths,
        ),
      }));
    }
  }

  return { path: tsconfigFilePath, json: tsconfig };
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
