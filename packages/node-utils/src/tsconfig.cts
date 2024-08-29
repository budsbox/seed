/**
 * @fileOverview For some reason yarn (probably) hangs when importing typescript as ESM,
 * so CommonJS is used
 */

import ts = require('typescript');
import url = require('url');
import path = require('path');

function getParsedConfig(rawPath: string): ts.ParsedCommandLine {
  const tsconfigPath =
    rawPath.startsWith('file://') ? url.fileURLToPath(rawPath) : rawPath;

  const tsConfigFile = ts.findConfigFile(
    './',
    // eslint-disable-next-line @typescript-eslint/unbound-method
    ts.sys.fileExists,
    tsconfigPath,
  );

  if (tsConfigFile == null) {
    throw new Error(`Failed to find tsconfig file at ${tsconfigPath}`);
  }

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const configFile = ts.readConfigFile(tsConfigFile, ts.sys.readFile);

  return ts.parseJsonConfigFileContent(configFile.config, ts.sys, './');
}

function extractTargetFromConfig(
  tsconfig: ts.ParsedCommandLine,
): keyof typeof ts.ScriptTarget | undefined {
  const rawTarget = tsconfig.options.target;
  if (rawTarget == null) {
    return undefined;
  }

  return ts.ScriptTarget[rawTarget] as keyof typeof ts.ScriptTarget;
}

function makeGlobsByDirs(tsconfig: ts.ParsedCommandLine): string[] {
  const { wildcardDirectories } = tsconfig;
  if (wildcardDirectories == null) {
    return [];
  }

  const { WatchDirectoryFlags } = ts;

  return Object.entries(wildcardDirectories).reduce<string[]>(
    (list, [p, flag]) => [
      ...list,
      `${p}/${flag === WatchDirectoryFlags.Recursive ? '**' : '*'}`,
    ],
    [],
  );
}

function getFilesList(tsconfig: ts.ParsedCommandLine): string[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const include = tsconfig.raw?.include as readonly string[] | undefined;

  if (Array.isArray(include)) {
    return include
      .filter((s) => path.extname(s) !== '')
      .map((s) => s.replace('${configDir}/', ''));
  }

  return [];
}

export = {
  getParsedConfig: getParsedConfig,
  extractTargetFromConfig: extractTargetFromConfig,
  makeGlobsByDirs: makeGlobsByDirs,
  getFilesList: getFilesList,
};
