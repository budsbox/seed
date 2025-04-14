import { stat } from 'node:fs/promises';
import { join, normalize, resolve } from 'node:path';
import { cwd } from 'node:process';

import { hasProp } from '@budsbox/lib-es/guards';

/**
 * Searches for a specified file starting from a given directory and traversing the directory tree upwards
 * until the file is found or a specified stop directory is reached.
 *
 * @param startDir - The directory to start the search from. Defaults to the current working directory.
 * @param filename - The name of the file to locate.
 * @param stopDir - The directory where the search should stop if the file is not found. Defaults to the filesystem root (`/`).
 * @returns A promise that resolves to the full path of the located file if found, or `null` if the file is not found.
 */
export async function lookupFile({
  startDir = cwd(),
  filename,
  stopDir = '/',
}: Readonly<{
  startDir?: string;
  filename: string;
  stopDir?: string;
}>): Promise<string | null> {
  let currentDir: string = normalize(startDir);
  const stopDirNormalized = normalize(stopDir);
  let filepath: string | null = null;

  while (resolve(stopDirNormalized, '..') !== currentDir) {
    try {
      const tryPath = join(currentDir, filename);

      const stats = await stat(tryPath);

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

  return filepath;
}
