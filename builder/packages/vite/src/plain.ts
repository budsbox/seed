import type { PackageJson } from 'type-fest';

import { readFileSync } from 'node:fs';
import { basename, dirname, relative } from 'node:path';

import cssesc from 'cssesc';
import { NodePackageImporter } from 'sass-embedded';
import { defaultClientConditions } from 'vite';

import { createCachedFn } from '@budsbox/lib-es/function';
import { isNil, isNotNil, isString } from '@budsbox/lib-es/guards';
import { fifs } from '@budsbox/lib-es/logical';
import { parsePackageName, splitPath } from '@budsbox/lib-es/string';
import { lookupFileSync } from '@budsbox/lib-node/fs';
import { findCurrentPackageJson } from '@budsbox/lib-node/pckg';

import packageJson from '#package.json' with { type: 'json' };

import { createConfigFactory, formatFileName, formatVarName } from './lib.js';

const readPackageJson = createCachedFn((path: string): PackageJson => {
  if (!path.endsWith('package.json'))
    throw new Error(`Not a package.json path: ${path}`);
  return JSON.parse(readFileSync(path, 'utf-8')) as PackageJson;
});

/**
 * Represents configuration options for plain configurations.
 */
export interface PlainConfigOptions {
  /**
   * The `import.meta` object.
   */
  importMeta?: ImportMeta;

  /**
   * Whether the configuration is for a library.
   */
  lib?: boolean;

  /**
   * An array of strings representing the chunks to exclude from the path part when generating scoped names for CSS modules.
   *
   * @default ['src']
   */
  generateScopedNameExcludedPathChunks?: readonly string[];

  /**
   * Whether to add the scope of the package to the conditions for module `exports` resolution.
   */
  addScopeToConditions?: boolean;
}

export const usePlainConfig = createConfigFactory<PlainConfigOptions>(
  async (
    { mode },
    {
      importMeta,
      lib = false,
      generateScopedNameExcludedPathChunks = ['src'],
      addScopeToConditions = false,
    } = {},
  ) => {
    const runnerPackage = await findCurrentPackageJson(importMeta);
    const { scope: runnerScope } = parsePackageName(
      runnerPackage.json.name ?? 'anon',
      true,
    );
    const lookupCache = new Map<string, string>();
    const packageCache = new Map<string, PackageJson>();
    const excludeChunks = new Set(generateScopedNameExcludedPathChunks);

    const clientConditions =
      (
        (addScopeToConditions ||
          // enabled by default in this monorepo
          sameScope(packageJson, runnerPackage.json)) &&
        isNotNil(runnerScope)
      ) ?
        [runnerScope, ...defaultClientConditions]
      : [...defaultClientConditions];

    const generateScopedName = createCachedFn(
      (localName: string, filepath: string) => {
        const foundPath = lookupFileSync({
          startDir: dirname(filepath),
          filename: 'package.json',
          cache: lookupCache,
        });

        let pckgPrefix = '';
        if (isString(foundPath)) {
          if (foundPath !== runnerPackage.path) {
            const pckg = readPackageJson(packageCache, foundPath);
            const { scope, name } = parsePackageName(pckg.name ?? '', true);
            pckgPrefix =
              scope === runnerScope || isNil(scope) ?
                name
              : `${scope}_-_${name}`;
          }
        } else {
          pckgPrefix = '-standalone-';
        }

        const subPath = relative(
          dirname(foundPath ?? runnerPackage.path),
          filepath,
        );
        const pathPart = splitPath(dirname(subPath))
          .map((chunk) => (chunk === '..' ? '_--_' : chunk))
          .filter((chunk) => !excludeChunks.has(chunk))
          .join('-');

        const nameChunks = basename(filepath).split('.').slice(0, -1);
        if (nameChunks.at(-1) === 'module') {
          nameChunks.pop();
        }
        if (nameChunks.at(-1) === 'style') {
          nameChunks.pop();
        }

        return cssesc(
          [
            pckgPrefix,
            [pathPart, nameChunks.join('-')].filter(Boolean).join('_'),
            localName,
          ]
            .filter(Boolean)
            .join('__'),
        );
      },
      (...args) => args.join(':'),
    );

    const scopedNameCache = new Map<string, string>();

    return {
      root: 'src',
      build: {
        outDir: '../dist',
        emptyOutDir: true,

        ...fifs(lib, {
          lib: {
            entry: 'index.ts',
            name: formatVarName(runnerPackage.json.name ?? '_anon_'),
            fileName: formatFileName,
            cssFileName: 'index',
          },
        }),
      },
      resolve: {
        conditions: clientConditions,
      },
      css: {
        modules: {
          localsConvention: 'camelCaseOnly',
          generateScopedName:
            mode === 'production' ? '[hash:hex]' : (
              (localName, filepath) =>
                generateScopedName(scopedNameCache, localName, filepath)
            ),
        } as const,
        preprocessorOptions: {
          scss: {
            importers: [new NodePackageImporter()],
          },
        },
      },
    };
  },
);

const sameScope = (
  p1: Readonly<Pick<PackageJson, 'name'>>,
  p2: Readonly<Pick<PackageJson, 'name'>>,
): boolean =>
  parsePackageName(p1.name ?? '', true).scope ===
  parsePackageName(p2.name ?? '', true).scope;
