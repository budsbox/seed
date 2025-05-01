import { stat } from 'node:fs/promises';
import { join, normalize, resolve } from 'node:path';
import { cwd } from 'node:process';

import { isObject } from '@budsbox/iso-utils/type-guards';

export async function lookupFile({
  startDir = cwd(),
  filename,
  stopDir = '/',
}: {
  startDir?: string;
  filename: string;
  stopDir?: string;
}): Promise<string | null> {
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
      if (isObject(e) && 'code' in e && e.code === 'ENOENT') {
        currentDir = resolve(currentDir, '..');
      } else {
        throw e;
      }
    }
  }

  return filepath;
}
