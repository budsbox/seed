/**
 * @fileOverview For some reason yarn (probably) hangs when importing typescript as ESM,
 * so CommonJS is used
 */

import ts = require('typescript');
import url = require('url');
import path = require('path');
import { isNotNil } from '@budsbox/iso-utils/type-guards';

/* eslint-disable @typescript-eslint/unbound-method */

const diagnosticHost = {
  getCanonicalFileName: (filename: string): string => filename,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: (): string => ts.sys.newLine,
};

export function getParsedConfig(rawPath: string): ts.ParsedCommandLine {
  const tsconfigPath =
    rawPath.startsWith('file://') ? url.fileURLToPath(rawPath) : rawPath;

  const tsConfigFile = ts.findConfigFile('./', ts.sys.fileExists, tsconfigPath);

  if (tsConfigFile == null) {
    throw new Error(`Failed to find tsconfig file at ${tsconfigPath}`);
  }

  const configFile = ts.readConfigFile(tsConfigFile, ts.sys.readFile);

  if (isNotNil(configFile.error)) {
    throw new Error(
      `Failed to read config file at ${tsconfigPath}. \n${ts.formatDiagnostic(
        configFile.error,
        diagnosticHost,
      )}`,
    );
  }

  const result = ts.parseJsonConfigFileContent(configFile.config, ts.sys, './');

  if (result.errors.length > 0) {
    throw new Error(
      `Failed to parse config file at "${tsconfigPath}". \n${ts.formatDiagnostics(result.errors, diagnosticHost)}`,
    );
  }

  return result;
}

export function extractTargetFromConfig(
  tsconfig: ts.ParsedCommandLine,
): keyof typeof ts.ScriptTarget | undefined {
  const rawTarget = tsconfig.options.target;
  if (rawTarget == null) {
    return undefined;
  }

  return ts.ScriptTarget[rawTarget] as keyof typeof ts.ScriptTarget;
}

export function makeGlobsByDirs(tsconfig: ts.ParsedCommandLine): string[] {
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

export function getFilesList(tsconfig: ts.ParsedCommandLine): string[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const include = tsconfig.raw?.include as readonly string[] | undefined;

  if (Array.isArray(include)) {
    return include
      .filter((s) => path.extname(s) !== '')
      .map((s) => s.replace('${configDir}/', ''));
  }

  return [];
}
