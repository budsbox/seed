import type { PackageJson } from 'type-fest';

import type { Maybe } from '@budsbox/lib-types';

import type { ResolvedJson } from './types.js';

import { promises as fs } from 'node:fs';
import { cwd, env } from 'node:process';
import { fileURLToPath } from 'node:url';

import { hasProp, isNil, isNotNil, isString } from '@budsbox/lib-es/guards';

import { lookupFile } from '#fs';

/**
 * Finds the `package.json` file of the current package and returns its path along with the parsed JSON content.
 *
 * @param importMeta - An optional `ImportMeta` object, used to resolve the location of `package.json` if supported.
 * @returns A promise that resolves to an object containing:
 *         - `path`: The file path to the located `package.json`.
 *         - `json`: The parsed JSON content of the located `package.json`.
 * @throws If the `package.json` file of the current package cannot be found.
 */
export async function findCurrentPackageJson(
  importMeta?: ImportMeta,
): Promise<ResolvedJson<PackageJson>> {
  let path: Maybe<string> = null;

  if (isNotNil(importMeta)) {
    try {
      path = fileURLToPath(importMeta.resolve('#package.json'));
    } catch {
      /* ignore */
    }
  }

  if (isNil(path)) {
    path = await lookupFile({
      // https://yarnpkg.com/advanced/lifecycle-scripts#environment-variables
      startDir: hasProp(env, 'INIT_CWD', isString) ? env.INIT_CWD : cwd(),
      filename: 'package.json',
    });
  }

  if (isNil(path)) {
    throw new Error('Failed to find package.json of the current package');
  }

  return {
    path,
    json: JSON.parse(await fs.readFile(path, 'utf8')) as PackageJson,
  };
}
