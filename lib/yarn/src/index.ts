import { join, relative } from 'node:path/posix';
import { env } from 'node:process';

import { getPluginConfiguration } from '@yarnpkg/cli';
import { Configuration, Project, type Workspace } from '@yarnpkg/core';
import { type Path, npath } from '@yarnpkg/fslib';

import { globFromExtensions } from '@budsbox/lib-extensions';

const cwd = npath.toPortablePath(env.INIT_CWD ?? npath.cwd());

const configuration = await Configuration.find(cwd, getPluginConfiguration());
const { project: cwdProject } = await Project.find(configuration, cwd);
const rootWorkspace = cwdProject.topLevelWorkspace;
const rootProject = rootWorkspace.project;

export const getRootWorkspace = (): Workspace => rootWorkspace;
export const getRootProject = (): Project => rootProject;

export const getAllWorkspaces = (): readonly Workspace[] =>
  rootWorkspace.getRecursiveWorkspaceChildren();

export const tryWorkspaceByFilepath = (
  path: string | Readonly<Path>,
): Workspace | null =>
  rootProject.tryWorkspaceByFilePath(npath.toPortablePath(path));

export const getWorkspaceByFilepath = (
  path: string | Readonly<Path>,
): Workspace => rootProject.getWorkspaceByFilePath(npath.toPortablePath(path));

export const getWorkspaceFilesGlob = (
  workspace: Workspace,
  extensions: readonly string[] = ['*'],
): string => {
  const { cwd: wsCwd, relativeCwd } = workspace;

  const nestedChildren = workspace
    .getRecursiveWorkspaceChildren()
    // I'm not sure if non-nested (in terms of fs) children is a real case for workspaces, but it's possible
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
