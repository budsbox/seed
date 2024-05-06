import fs from 'node:fs';
import path from 'node:path';

/** @type { import('./json-to-sass.d.mjs.ts').createImporter } */
export function createImporter() {
  return (url, prev) => {
    if (!/\.json$/.test(url)) {
      return null;
    }

    const filepath = toAbs(url, prev);
    const input = fs.readFileSync(filepath, 'utf8');
    const output = generateModuleFromJson(input);

    return {
      file: filepath,
      contents: output,
    };
  };
}

/** @type { import('./json-to-sass.d.mjs.ts').createVirtualImporter } */
export function createVirtualImporter(name, data) {
  const fullName = `virtual:${name}`;
  const contents = generateModuleFromDict(data);
  return (url) =>
    url === fullName ?
      {
        file: fullName,
        contents,
      }
    : null;
}

/**
 * @param {string} url
 * @param {string} prev
 */
function toAbs(url, prev) {
  return path.posix.isAbsolute(url) ?
      url
    : path.posix.resolve(path.posix.dirname(prev), url);
}

/**
 * @param {string} json
 */
export function generateModuleFromJson(json) {
  return generateModuleFromDict(JSON.parse(json));
}

/**
 * @param {object} dict
 */
function generateModuleFromDict(dict) {
  return Object.entries(dict).reduce(
    (acc, [key, value]) => `${acc}$${key}: ${stringifyValue(value, '')};\n`,
    '',
  );
}

/**
 * @param {any[]} value
 * @param {string} tabs
 * @return {string}
 */
function stringifyValue(value, tabs) {
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

/**
 * @param {{ [s: string]: any; } | ArrayLike<any>} object
 * @param {string} tabs
 */
function stringifyDict(object, tabs) {
  const map = Object.entries(object).reduce((acc, [key, value]) => {
    const newTabs = tab(tabs);
    return `${acc}\n${newTabs}${JSON.stringify(key)}: ${stringifyValue(
      value,
      newTabs,
    )},`;
  }, '');

  return `(${map}\n${tabs})`;
}

/**
 * @param {string} current
 * @param {boolean?} decrease
 */
function tab(current, decrease = false) {
  const tabStr = '  ';
  return decrease ? current.replace(tabStr, '') : `${tabStr}${current}`;
}

/**
 * @param {unknown} object
 */
function isObject(object) {
  return typeof object === 'object' && object != null;
}
