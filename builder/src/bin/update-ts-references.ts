import type { TsConfigJson } from 'type-fest';

import { promises as fs } from 'node:fs';
import { join, posix, relative } from 'node:path';

import { getPluginConfiguration } from '@yarnpkg/cli';
import { Configuration, Project, type Workspace } from '@yarnpkg/core';
import { type PortablePath, ppath } from '@yarnpkg/fslib';

import { hasProp, isNil, isNotNil } from '@budsbox/lib-es/guards';

import { getTsConfig } from '@budsbox/lib-node/ts';

const configuration = await Configuration.find(
  ppath.cwd(),
  getPluginConfiguration(),
);
const { project: rootProject, workspace: rootWorkspace } = await Project.find(
  configuration,
  ppath.cwd(),
);

if (isNil(rootWorkspace)) throw new Error('No root workspace found');

function getWsDirectDependencies(workspace: Workspace): Workspace[] {
  const { dependencies } = workspace.manifest;
  return [...workspace.getRecursiveWorkspaceDependencies()].filter(
    ({ manifest: { name } }) =>
      isNotNil(name) && dependencies.has(name.identHash),
  );
}

const getWsLocalTsconfigPaths = (() => {
  const fn = async (workspace: Workspace): Promise<readonly string[]> => {
    const { cwd } = workspace;
    const tsconfigPath = join(cwd, 'tsconfig.json');
    try {
      const stats = await fs.stat(tsconfigPath);
      if (!stats.isFile()) return [];
    } catch (e) {
      if (!hasProp(e, 'code', (code) => code === 'ENOENT')) throw e;
      return [];
    }

    if (isNil(tsconfigPath)) return [];
    const { references } = await getTsConfig(tsconfigPath, {
      absolutePaths: true,
      stupid: true,
    });
    return (
      references
        ?.map(({ path }) => path)
        .filter(
          (path) =>
            !relative(cwd, path).startsWith('..') &&
            !path.endsWith('tsconfig.tools.json'),
        ) ?? []
    );
  };

  const cache = new Map<Workspace, Promise<readonly string[]>>();

  return ((workspace) => {
    if (!cache.has(workspace)) cache.set(workspace, fn(workspace));
    return cache.get(workspace)!;
  }) as typeof fn;
})();

const updateTsconfigsReferences = async (
  workspace: Workspace,
  refPaths: readonly string[],
): Promise<void> => {
  const { manifest } = workspace;
  const tsconfigPaths = await getWsLocalTsconfigPaths(workspace);
  await Promise.all(
    tsconfigPaths.map(async (tsconfigPath) => {
      const [tsconfig, rawTsconfig] = await Promise.all([
        getTsConfig(tsconfigPath, {
          absolutePaths: true,
          stupid: true,
        }),
        JSON.parse(await fs.readFile(tsconfigPath, 'utf8')) as TsConfigJson,
      ]);
      const { references } = tsconfig;
      const currentSet = new Set(references?.map(({ path }) => path) ?? []);
      const newSet = new Set(refPaths).union(
        new Set(
          [...currentSet].filter((path) => {
            const dirname = posix.dirname(path);
            const pathWs = rootProject.getWorkspaceByFilePath(
              dirname as PortablePath,
            );

            return (
              isNotNil(pathWs.manifest.name) &&
              manifest.hasDependency(pathWs.manifest.name)
            );
          }),
        ),
      );

      if (
        newSet.size !== currentSet.size ||
        newSet.size !== newSet.union(currentSet).size
      ) {
        const newReferences = [...newSet].toSorted().map((path) => ({
          path: posix.relative(posix.dirname(tsconfigPath), path),
        }));

        const relativePath = relative(rootWorkspace.cwd, tsconfigPath);
        // eslint-disable-next-line no-console
        console.log(`Update references in ${relativePath}...`);

        await fs.writeFile(
          tsconfigPath,
          JSON.stringify(
            {
              ...rawTsconfig,
              references: newReferences,
            },
            null,
            2,
          ),
        );
      }
    }),
  );
};

await Promise.all(
  rootWorkspace.getRecursiveWorkspaceChildren().map(async (workspace) => {
    const children = getWsDirectDependencies(workspace);
    const childrenPaths = await Promise.all(
      children.map(getWsLocalTsconfigPaths),
    );

    await updateTsconfigsReferences(workspace, childrenPaths.flat());
  }),
);
