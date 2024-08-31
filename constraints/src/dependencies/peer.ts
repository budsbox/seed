import type { Yarn as YarnType } from '@yarnpkg/types';

import {
  type ConstraintFactory,
  getManifest,
  getRangeConsideringRoot,
} from '../utils';

export const createPeerDependenciesConstraint: ConstraintFactory<{
  readonly allowPrivates?: boolean;
}> = ({ allowPrivates = false } = {}) =>
  function constraintPeerDependencies({ Yarn }) {
    for (const workspace of Yarn.workspaces()) {
      const isPrivate =
        getManifest<{ private?: boolean }>(workspace).private === true;
      for (const peerDependency of Yarn.dependencies({
        workspace,
        type: 'peerDependencies',
      })) {
        if (isPrivate && !allowPrivates) {
          // private packages should have no peer dependencies
          peerDependency.delete();
        } else {
          const query = { workspace, ident: peerDependency.ident } as const;
          // the same dependency both in "dependencies" and "peerDependencies" probably is a bug
          Yarn.dependency({ ...query, type: 'dependencies' })?.delete();

          if (Yarn.workspace({ ident: peerDependency.ident }) != null) {
            continue;
          }

          // a code below needed to properly update peer dependencies
          const devDependency = Yarn.dependency({
            ...query,
            type: 'devDependencies',
          });
          if (
            workspace.ident === '@budsbox/linting' &&
            peerDependency.ident === 'eslint-import-resolver-typescript'
          ) {
            // console.log(peerDependency, devDependency);
          }
          if (devDependency == null) {
            workspace.set(
              ['devDependencies', peerDependency.ident],
              getRangeConsideringRoot(Yarn, peerDependency),
            );
          } else if (peerDependency.range !== devDependency.range) {
            peerDependency.update(getRangeConsideringRoot(Yarn, devDependency));
          }
        }
      }
    }

    // Map<<workspace name>, <workspace peer dependencies without optional>>
    const peersMap = new Map<
      string,
      readonly YarnType.Constraints.Dependency[]
    >(
      Yarn.workspaces().flatMap((workspace) => {
        const { peerDependenciesMeta = {} } = getManifest<{
          peerDependenciesMeta?: Record<string, { optional?: boolean }>;
        }>(workspace);

        return workspace.ident != null ?
            [
              [
                workspace.ident,
                Yarn.dependencies({
                  workspace,
                  type: 'peerDependencies',
                }).filter(
                  ({ ident }) => peerDependenciesMeta[ident]?.optional !== true,
                ),
              ],
            ]
          : [];
      }),
    );

    // Ensures that peerDependencies of workspaces are met in dependent workspaces
    for (const workspace of Yarn.workspaces()) {
      for (const [ident, peers] of peersMap) {
        if (peers.length === 0) {
          continue;
        }

        const wsDependency = Yarn.dependency({ workspace, ident });

        if (wsDependency != null) {
          for (const peer of peers) {
            const peerInWs = Yarn.dependency({
              workspace,
              ident: peer.ident,
            });

            const range = getRangeConsideringRoot(Yarn, peer);
            if (peerInWs != null) {
              peerInWs.update(range);
            } else if (peer.ident !== workspace.ident) {
              workspace.set([wsDependency.type, peer.ident], range);
            }
          }
        }
      }
    }
  };
