import type {
  ArchetypeExtendControlSymbol,
  ArchetypeManifest,
  ArchetypeMap,
  ArchetypeName,
  ArchetypeResolved,
  Command,
  ResolvedCommand,
} from './types.js';

import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';

import chalk from 'chalk';
import { execaCommand } from 'execa';
import { merge } from 'ts-deepmerge';

import { dedupe, ensureArray, union } from '@budsbox/lib-es/array';
import {
  isArray,
  isNil,
  isNotNil,
  isObject,
  isString,
  isTrue,
} from '@budsbox/lib-es/guards';
import { serializePackageName } from '@budsbox/lib-es/string';
import { getWorkspace } from '@budsbox/lib-yarn';

import { archetypeExtendControlSymbol } from './const.js';

/* eslint-disable no-console */
export const log = {
  error: (msg: string): void => void console.log(`❌ ${chalk.red(msg)}`),
  info: (msg: string): void => void console.log(`ℹ️ ${msg}`),
  step: (msg: string): void => void console.log(`▶️  ${msg}`),
  success: (msg: string): void => void console.log(`✅ ${msg}`),
  warn: (msg: string): void => void console.log(`⚠️  ${chalk.yellow(msg)}`),
};
/* eslint-enable no-console */

/**
 * Checks if a given path exists in the file system.
 *
 * @param path - The file system path to check for existence.
 * @returns A promise which resolves to `true` if the path exists, otherwise `false`.
 */
export async function pathExists(path: string): Promise<boolean> {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensures that a directory exists at the specified path. If the directory does not exist,
 * it creates the directory. Logs the operation in detail, including dry-run simulation.
 *
 * @param path - The file system path of the directory to ensure.
 * @param options - Configuration options for the operation.
 * @param options.dryRun - If true, simulates the directory creation without making any changes.
 * @returns A promise that resolves when the operation is complete, or immediately in dry-run mode.
 */
export async function ensureDirVerbose(
  path: string,
  { dryRun = false } = {},
): Promise<void> {
  if (dryRun) {
    log.info(chalk.gray(`dry-run: mkdir -p ${path}`));
    return;
  }
  await fs.mkdir(path, { recursive: true });
  log.step(`created directory ${path}`);
}

/**
 * Writes content to a specified file path with optional verbose logging and dry-run functionality.
 *
 * @param path - The file system path where the content should be written.
 * @param content - The content to write to the file. Can be a string or Uint8Array.
 * @param options - Object containing optional parameters:
 *   - dryRun: If true, logs the action without actually writing the file.
 * @returns A promise that resolves when the file operation is completed.
 */
export async function writeFileVerbose(
  path: string,
  content: string | Uint8Array,
  { dryRun = false } = {},
): Promise<void> {
  if (dryRun) {
    log.info(chalk.gray(`dry-run: write ${path}`));
    return;
  }
  await fs.mkdir(dirname(path), { recursive: true });
  await fs.writeFile(path, content);
  log.step(`wrote ${path}`);
}

function mergeArraysWithSpread<T>(
  parent: readonly T[] | undefined,
  child: ReadonlyArray<ArchetypeExtendControlSymbol | T> | undefined,
): T[] {
  if (!isArray(child)) return isArray(parent) ? [...parent] : [];

  return child.flatMap((str) =>
    str === archetypeExtendControlSymbol ? parent ?? [] : str,
  );
}

/**
 * Merges multiple manifests into a single manifest object, while ensuring unique array items.
 *
 * @param manifests - A list of manifest objects or undefined values to be merged. Only non-nil manifest objects will be processed.
 * @returns A single merged manifest object containing the combined data from the provided manifests.
 */
export function mergeManifests(
  ...manifests: ReadonlyArray<ArchetypeManifest | undefined>
): ArchetypeManifest {
  return manifests
    .filter((v) => isNotNil(v))
    .reduce<ArchetypeManifest>((acc, { imports, exports, ...rest }) => {
      const merged = merge.withOptions({ uniqueArrayItems: true }, acc, rest);
      const mergedExports = overrideExports(acc.exports, exports);
      if (isObject(mergedExports)) {
        merged.exports = mergedExports;
      }

      const mergedImports = overrideExports(acc.imports, imports);
      if (isObject(mergedImports)) {
        merged.imports = mergedImports;
      }

      return merged as ArchetypeManifest;
    }, {});
}

type Exports = ArchetypeManifest['exports'];

const overrideExports = (parent: Exports, children: Exports): Exports => {
  if (isObject(parent) && isObject(children)) {
    return {
      ...parent,
      ...children,
    };
  }

  return parent ?? children;
};

/**
 * Throws an error when an unknown archetype is encountered.
 *
 * @param name - The name of the archetype that is not recognized.
 * @param archetypes - A map containing all known archetypes.
 * @param parentChain - An optional set representing the chain of parent archetypes, if applicable.
 * @throws {@link Error} when an unknown archetype is encountered.
 */
export function throwUnknownArchetype(
  name: ArchetypeName,
  archetypes: ArchetypeMap,
  parentChain?: Set<ArchetypeName>,
): never {
  throw new Error(
    `Unknown archetype "${name}"${isNotNil(parentChain) ? `found in "extends" chain ${[...parentChain].join(' -> ')}` : ''}, known archetypes: ${Object.keys(
      archetypes,
    )
      .filter((an) => !isTrue(archetypes[an].internal))
      .join(',')}`,
  );
}

/**
 * Resolves an archetype configuration by merging its properties with those of its inherited archetypes
 * to form a fully resolved archetype object.
 *
 * @param archetypes - A map of archetype names to their corresponding properties and configuration.
 * @param name - The name of the archetype to resolve.
 * @returns The fully resolved archetype configuration for the specified archetype name.
 * @typeParam TName - Extends `ArchetypeName` and denotes the specific archetype identifiers
 * used to extend or reference archetypes in the configuration.
 */
export function resolveArchetype<TName extends ArchetypeName>(
  archetypes: ArchetypeMap,
  name: TName,
): ArchetypeResolved<TName> {
  const _resolve = (
    n: ArchetypeName,
    seen: Set<ArchetypeName>,
  ): ArchetypeResolved<ArchetypeName> => {
    if (seen.has(n))
      throw new Error(
        `Archetype cycle detected at "${[...seen].join(' -> ')}" -> "${n}"`,
      );
    seen.add(n);
    const node = archetypes[n];
    if (isNil(node)) throwUnknownArchetype(name, archetypes);
    const ext: readonly ArchetypeName[] = ensureArray(node.extends ?? []);

    const joinedParent = ext.reduce<ArchetypeResolved<ArchetypeName>>(
      (acc, currentName) => {
        const current = _resolve(currentName, new Set([...seen, n]));

        return {
          at: current.at === '.' ? acc.at : current.at,
          commands: union(acc.commands, current.commands),
          files: { ...acc.files, ...current.files },
          internal: false,
          manifest: mergeManifests(acc.manifest, current.manifest),

          dependencies: union(acc.dependencies, current.dependencies),
          devDependencies: union(acc.devDependencies, current.devDependencies),
          peerDependencies: union(
            acc.peerDependencies,
            current.peerDependencies,
          ),
        };
      },
      {
        at: '.',
        commands: [],
        files: {},
        internal: false,
        manifest: {},

        dependencies: [],
        devDependencies: [],
        peerDependencies: [],
      },
    );

    const _resolved = {
      at: node.at ?? joinedParent.at,
      commands: mergeArraysWithSpread(joinedParent.commands, node.commands),
      files: { ...joinedParent.files, ...node.files },
      internal: isTrue(node.internal),
      manifest: mergeManifests(joinedParent.manifest, node.manifest),

      dependencies: dedupe(
        mergeArraysWithSpread(joinedParent.dependencies, node.dependencies),
      ),
      devDependencies: dedupe(
        mergeArraysWithSpread(
          joinedParent.devDependencies,
          node.devDependencies,
        ),
      ),
      peerDependencies: dedupe(
        mergeArraysWithSpread(
          joinedParent.peerDependencies,
          node.peerDependencies,
        ),
      ),
    };

    return _resolved;
  };
  return _resolve(name, new Set());
}

/**
 * Executes a shell command in verbose mode, logging the command being run and redirecting output to the current process's standard I/O streams.
 *
 * @param cmd - An object containing the command details.
 * @param options - Optional settings for execution.
 * @param options.dryRun - A boolean flag indicating whether to perform a dry run (default is `false`).
 * @returns A promise that resolves when the command execution is complete.
 */
export async function runCommandVerbose(
  cmd: ResolvedCommand,
  { dryRun = false } = {},
): Promise<void> {
  if (dryRun) {
    log.info(chalk.gray(`dry-run: would run "${cmd.exec}" in ${cmd.cwd}`));
    return;
  }

  log.step(`$ ${cmd.exec} ${chalk.gray(`(in ${cmd.cwd})`)}`);
  await execaCommand(cmd.exec, {
    ...cmd.options,
    cwd: cmd.cwd,
    stdio: 'inherit',
    shell: true,
  });
}

/**
 * Resolves a command configuration by merging the provided command with default values.
 * If the command is a string, it is treated as an executable command and combined with the defaults.
 * If the command is an object, additional resolution is performed for the workspace and execution context.
 *
 * @param cmd - The command to resolve, which can be a string (treated as an executable) or an object
 *              containing additional command configuration details.
 * @param defaults - Default parameters that include predefined workspace and current working directory (`cwd`).
 * @returns A resolved command object containing the workspace, current working directory (`cwd`),
 *          and executable command.
 */
export const resolveCommand = (
  cmd: Readonly<Command>,
  defaults: Readonly<Pick<ResolvedCommand, 'cwd' | 'workspace'>>,
): ResolvedCommand => {
  if (isString(cmd)) {
    return {
      ...defaults,
      exec: cmd,
    };
  }

  const { workspace, exec } = cmd;

  if (isNil(workspace)) {
    return {
      ...defaults,
      exec,
      options: cmd.options,
    };
  }

  const ws = getWorkspace(workspace, true);

  return {
    workspace: serializePackageName(ws.manifest.name, true),
    cwd: ws.cwd,
    exec,
    options: cmd.options,
  };
};
