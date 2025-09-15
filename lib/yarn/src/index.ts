import { join, relative } from 'node:path/posix';
import { env } from 'node:process';

import { getPluginConfiguration } from '@yarnpkg/cli';
import { Configuration, Project, Workspace } from '@yarnpkg/core';
import { type Path, npath } from '@yarnpkg/fslib';

import { isNil, isString } from '@budsbox/lib-es/guards';
import {
  type ParsedPackageName,
  parsePackageName,
  serializePackageName,
} from '@budsbox/lib-es/string';
import { globFromExtensions } from '@budsbox/lib-extensions';

const cwd = npath.toPortablePath(env.INIT_CWD ?? npath.cwd());

const configuration = await Configuration.find(cwd, getPluginConfiguration());
const { project: cwdProject } = await Project.find(configuration, cwd);
const rootWorkspace = cwdProject.topLevelWorkspace;
const rootProject = rootWorkspace.project;

/**
 * Retrieves the root workspace instance.
 *
 * @returns The root workspace instance.
 */
export const getRootWorkspace = (): Workspace => rootWorkspace;

/**
 * Retrieves the root project instance.
 *
 * @returns The root project instance.
 */
export const getRootProject = (): Project => rootProject;

/**
 * Retrieves all workspaces in monorepo.
 *
 * This function fetches an array of all workspaces, including nested ones.
 *
 * @returns An array of workspaces as `readonly Workspace[]`.
 */
export const getAllWorkspaces = (): readonly Workspace[] =>
  rootProject.workspaces;

const serializeIdent = (
  ident: string | Readonly<ParsedPackageName>,
  autoScope = false,
): string => {
  const parsed = isString(ident) ? parsePackageName(ident) : ident;
  return serializePackageName(
    autoScope && !isString(parsed.scope) ?
      {
        ...parsed,
        scope: rootWorkspace.manifest.name?.scope ?? null,
      }
    : parsed,
  );
};

/**
 * Attempts to resolve and return a `Workspace` instance based on the provided identifier,
 * parsed package name, or an existing `Workspace` instance. If no matching workspace
 * is found, it returns `null`.
 *
 * If the input is already a `Workspace` instance, it is returned immediately. Otherwise,
 * the function serializes the identifier or parsed package name and searches through
 * all available workspaces to find a matching one.
 *
 * @param identOrWs - Can be a string identifier, a `ParsedPackageName` object,
 * or an existing `Workspace`. If it's a string or parsed package name, the function
 * attempts to locate the corresponding workspace.
 * @param autoScope - A boolean value indicating whether scope should be automatically
 * added when serializing the identifier. Defaults to `false`.
 * @returns The matching `Workspace` instance if found, otherwise `null`.
 */
export const tryWorkspace = (
  identOrWs: string | Readonly<ParsedPackageName> | Workspace,
  autoScope = false,
): Workspace | null => {
  if (identOrWs instanceof Workspace) {
    return identOrWs;
  }

  const ident = serializeIdent(identOrWs, autoScope);

  return (
    getAllWorkspaces().find(
      ({ manifest: { name } }) => serializePackageName(name, true) === ident,
    ) ?? null
  );
};

/**
 * Retrieves a `Workspace` instance based on the provided identifier or workspace object.
 *
 * @param identOrWs - The identifier of the workspace, which can be one of the following:
 *  - A string representing the workspace name
 *  - A readonly `ParsedPackageName` object
 *  - An existing `Workspace` instance
 * @param autoScope - Optional flag indicating whether to automatically scope the search for the workspace.
 *  Defaults to `false` if not provided.
 * @returns The corresponding `Workspace` instance if found.
 * @throws An error if the workspace could not be found.
 */
export const getWorkspace = (
  identOrWs: string | Readonly<ParsedPackageName> | Workspace,
  autoScope = false,
): Workspace => {
  const ws = tryWorkspace(identOrWs, autoScope);
  if (isNil(ws)) {
    const ident = identOrWs as string | ParsedPackageName;

    throw new Error(`Workspace "${serializeIdent(ident)}" not found`);
  }

  return ws;
};

/**
 * Attempts to retrieve the workspace associated with the given file path.
 *
 * This function takes a file path as input and tries to locate the corresponding
 * workspace within the project structure. If a workspace is found, it is returned;
 * otherwise, the function returns `null`.
 *
 * @param path - The file path for which to find the associated workspace. A string, plain or tagged.
 * @returns The workspace corresponding to the given file path, or `null` if no
 * matching workspace is found.
 */
export const tryWorkspaceByFilepath = (
  path: string | Readonly<Path>,
): Workspace | null =>
  rootProject.tryWorkspaceByFilePath(npath.toPortablePath(path));

/**
 * Retrieves the workspace associated with the given file path.
 *
 * This function resolves the workspace object corresponding to the
 * specified file path. The file path can be a string or a Readonly<Path>
 * object. It internally converts the provided path to a portable format
 * before querying the root project for the associated workspace.
 *
 * @param path - The file path for which the workspace is to be retrieved. A string, plain or tagged.
 * @returns The workspace object associated with the provided file path.
 */
export const getWorkspaceByFilepath = (
  path: string | Readonly<Path>,
): Workspace => rootProject.getWorkspaceByFilePath(npath.toPortablePath(path));

/**
 * Generates a glob pattern for matching files within a given workspace, optionally filtered by file extensions.
 *
 * This function constructs a glob that includes the specified workspace files and handles nested workspaces
 * appropriately to avoid accidentally matching files in child workspaces. It filters out non-nested children
 * based on their filesystem paths and allows for specifying file extensions to target.
 *
 * @param identOrWs - The workspace identifier, which can be a string or a `ParsedPackageName`, or a `Workspace` object.
 * @param extensions - An optional list of file extensions to include in the search glob pattern. Defaults to `['*']` if not provided.
 * @returns A string representing the glob pattern for matching files in the workspace.
 */
export const getWorkspaceFilesGlob = (
  identOrWs: string | Readonly<ParsedPackageName> | Workspace,
  extensions: readonly string[] = ['*'],
): string => {
  const workspace = getWorkspace(identOrWs);
  const { cwd: wsCwd, relativeCwd } = workspace;

  const nestedChildren = workspace
    .getRecursiveWorkspaceChildren()
    // I'm not sure if non-nested (in terms of fs) children is a real case for workspaces, but who knows
    .filter((children) => children.cwd.startsWith(wsCwd));

  const basenameGlob = globFromExtensions(extensions);

  if (nestedChildren.length === 0) {
    return join(relativeCwd, '**', basenameGlob);
  }

  return `{${[
    join(relativeCwd, basenameGlob),
    join(
      relativeCwd,
      // filter out nested workspaces using extglob negation
      `!(${nestedChildren
        .map((children) => relative(wsCwd, children.cwd).replace(/\//g, '[/]'))
        .join('|')}
        )`,
      '**',
      basenameGlob,
    ),
  ].join(',')}}`;
};
