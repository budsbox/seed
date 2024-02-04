import fs from 'node:fs';
import path from 'node:path';

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

function toAbs(url, prev) {
  return path.posix.isAbsolute(url) ?
      url
    : path.posix.resolve(path.posix.dirname(prev), url);
}

export function generateModuleFromJson(json) {
  return generateModuleFromDict(JSON.parse(json));
}

function generateModuleFromDict(dict) {
  return Object.entries(dict).reduce(
    (acc, [key, value]) => `${acc}$${key}: ${stringifyValue(value, '')};\n`,
    '',
  );
}

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

function tab(current, decrease = false) {
  const tabStr = '  ';
  return decrease ? current.replace(tabStr, '') : `${tabStr}${current}`;
}

function isObject(object) {
  return typeof object === 'object' && object != null;
}
