import type { Importer } from 'sass-embedded';

import fs from 'node:fs';

import {
  isFunction,
  isNotNil,
  isObject,
  isString,
} from '@budsbox/lib-es/guards';
import {} from '@budsbox/lib-es/guards';

import {
  generateSassModuleFromJson,
  generateSassModuleFromObject,
  toAbs,
} from './utils';

export function joinImporters(...importers: readonly Importer[]): Importer {
  return (url, prev) => {
    for (const importer of importers) {
      const result = importer(url, prev);

      if (isNotNil(result)) {
        return result;
      }
    }

    return null;
  };
}

export function createJsonImporter(): Importer {
  return (url, prev) => {
    if (!/\.json$/.test(url)) {
      return null;
    }

    const filepath = toAbs(url, prev);
    try {
      const input = fs.readFileSync(filepath, 'utf8');
      const output = generateSassModuleFromJson(input);
      return {
        file: filepath,
        contents: output,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to import the file ${filepath}. ${error.message}`,
        );
      }

      throw error;
    }
  };
}

export function createVirtualImporter(
  url: string,
  data: object | Importer | string,
  schema: `${string}:` = 'virtual:',
): Importer {
  const fullName = `${schema}${url}`;

  try {
    const contents =
      isString(data) ? data
      : isObject(data) ? generateSassModuleFromObject(data)
      : null;

    return (matchUrl, prev) => {
      if (matchUrl !== fullName) {
        return null;
      }

      if (isNotNil(contents)) {
        return { url, contents };
      }

      if (isFunction(data)) {
        return data(matchUrl, prev);
      }
    };
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(
        `Failed to create the virtual importer "${fullName}": ${err.message}`,
      );
    }

    throw err;
  }
}
