import type { LookupFileOptions } from '#types';

import * as fs from 'node:fs';
import * as pfs from 'node:fs/promises';
import { join, normalize, resolve } from 'node:path';
import { cwd } from 'node:process';

import { hasProp, isString } from '@budsbox/lib-es/guards';

/**
 * Searches asynchronously for a file by its name starting from a specified directory and traversing up the directory tree.
 *
 * If the file is found, its absolute path is returned.
 * The search stops when the traversal reaches the specified stop directory or the root directory.
 * Optional caching is used to optimize repeated lookup operations for the same file.
 *
 * @param options - Configuration options for the file lookup.
 * @param options.startDir - The directory to start the search from. Defaults to the current working directory.
 * @param options.filename - The name of the file to search for.
 * @param options.stopDir - The directory at which to stop the search. Defaults to the root directory ('/').
 * @param options.cache - A `Map` object used to cache the lookup results. If not provided, the results will not be cached.
 * @returns A promise that resolves to the absolute path of the file if found, or `null` if the file does not exist within the directories searched.
 * @throws If an unexpected error occurs during file system operations (other than missing files).
 */
export async function lookupFile({
  startDir = cwd(),
  filename,
  stopDir = '/',
  cache,
}: Readonly<LookupFileOptions>): Promise<string | null> {
  let currentDir: string = normalize(startDir);
  const stopDirNormalized = normalize(stopDir);
  let filepath: string | null = null;

  const cacheKey = `${currentDir}:${filename}`;
  const cached = cache?.get(cacheKey);
  if (isString(cached)) {
    return cached;
  }

  while (resolve(stopDirNormalized, '..') !== currentDir) {
    try {
      const tryPath = join(currentDir, filename);

      const stats = await pfs.stat(tryPath);

      if (stats.isFile()) {
        filepath = tryPath;
        break;
      }
    } catch (e: unknown) {
      if (hasProp(e, 'code', (code) => code === 'ENOENT')) {
        currentDir = resolve(currentDir, '..');
      } else {
        throw e;
      }
    }
  }

  if (isString(filepath) && cache instanceof Map) {
    cache.set(cacheKey, filepath);
  }

  return filepath;
}

/**
 * Searches synchronously for a file by its name starting from a specified directory and traversing up the directory tree.
 *
 * If the file is found, its absolute path is returned. The search stops when the traversal reaches the specified stop directory or the root directory.
 * Optional caching is used to optimize repeated lookup operations for the same file.
 *
 * @param options - Configuration options for the file lookup.
 * @param options.startDir - The directory to start the search from. Defaults to the current working directory.
 * @param options.filename - The name of the file to search for.
 * @param options.stopDir - The directory at which to stop the search. Defaults to the root directory ('/').
 * @param options.cache - A `Map` object used to cache the lookup results. If not provided, the results will not be cached.
 * @returns The absolute path of the file if found, or `null` if the file does not exist within the directories searched.
 * @throws If an unexpected error occurs during file system operations (other than missing files).
 */
export const lookupFileSync = ({
  startDir = cwd(),
  filename,
  stopDir = '/',
  cache,
}: Readonly<LookupFileOptions>): string | null => {
  let currentDir: string = normalize(startDir);
  const stopDirNormalized = normalize(stopDir);
  let filepath: string | null = null;

  const cacheKey = `${currentDir}:${filename}`;
  const cached = cache?.get(cacheKey);
  if (isString(cached)) {
    return cached;
  }

  while (currentDir !== resolve(stopDirNormalized, '..')) {
    try {
      const tryPath = join(currentDir, filename);

      const stats = fs.statSync(tryPath);

      if (stats.isFile()) {
        filepath = tryPath;
        break;
      }
    } catch (e: unknown) {
      if (hasProp(e, 'code', (code) => code === 'ENOENT')) {
        currentDir = resolve(currentDir, '..');
      } else {
        throw e;
      }
    }
  }

  if (isString(filepath) && cache instanceof Map) {
    cache.set(cacheKey, filepath);
  }

  return filepath;
};
