import fs from 'node:fs';
import path from 'node:path';

type Importer = (
  url: string,
  prev: string,
) => {
  file: string;
  contents: string;
} | null;

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

export function createVirtualImporter(name: string, data: object): Importer {
  const fullName = `virtual:${name}`;

  try {
    const contents = generateSassModuleFromObject(data);
    return (url) =>
      url === fullName ?
        {
          file: fullName,
          contents,
        }
      : null;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(
        `Failed to create the virtual importer "${fullName}": ${err.message}`,
      );
    }

    throw err;
  }
}

export function generateSassModuleFromJson(json: string): string {
  try {
    return generateSassModuleFromObject(JSON.parse(json) as object);
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(
        `failed to generate a SASS module out of the provided JSON: ${err.message}`,
      );
    }

    throw err;
  }
}

export function generateSassModuleFromObject(obj: object): string {
  if (!isObject(obj)) {
    throw new TypeError(
      `expected a value of type "object", got "${typeof obj}"`,
    );
  }

  return Object.entries(obj).reduce<string>(
    (acc, [key, value]) => `${acc}$${key}: ${stringifyValue(value, '')};\n`,
    '',
  );
}

function toAbs(url: string, prev: string): string {
  return path.posix.isAbsolute(url) ?
      url
    : path.posix.resolve(path.posix.dirname(prev), url);
}

function stringifyValue(value: unknown, tabs: string): string {
  if (Array.isArray(value)) {
    return `(\n${value
      .map((v) => `${tab(tabs)}${stringifyValue(v, tab(tabs))}`)
      .join(',\n')}\n${tabs})`;
  }

  if (isObject(value)) {
    return stringifyDict(value, tabs);
  }

  return JSON.stringify(value);
}

function stringifyDict(object: object, tabs: string): string {
  const map = Object.entries(object).reduce<string>((acc, [key, value]) => {
    const newTabs = tab(tabs);
    return `${acc}\n${newTabs}${JSON.stringify(key)}: ${stringifyValue(
      value,
      newTabs,
    )},`;
  }, '');

  return `(${map}\n${tabs})`;
}

function tab(current: string, decrease = false): string {
  const tabStr = '  ';
  return decrease ? current.replace(tabStr, '') : `${tabStr}${current}`;
}

function isObject(value: unknown): value is object {
  return typeof value === 'object' && value != null;
}
