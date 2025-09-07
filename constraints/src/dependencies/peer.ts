import {
  type ConstraintFactory,
  getManifest,
  getRangeConsideringRoot,
  softUpdate,
} from '../utils';
import {
  hasProp,
  isNotNil,
  isNil,
  isTrue,
  isTruly,
} from '@budsbox/lib-es/guards';
import * as micromatch from 'micromatch';
import { sure } from '@budsbox/lib-es/logical';
import type { Yarn as YarnType } from '@yarnpkg/types';

/**
 * Configuration options for defining constraints on peer dependencies.
 */
export interface PeerDependenciesConstraintOptions {
  /**
   * Indicates whether private workspaces can have peer dependencies.
   */
  readonly allowPrivates?: boolean;
  /**
   * Specifies an optional list of glob patterns used to automatically
   * identify and import peer dependencies.
   *
   * The property defines a set of patterns (e.g., 'package-name', 'module-name')
   * that determine which peer dependencies should be automatically imported
   * and managed by the dependency constraints. These patterns make it easier
   * to include relevant peer dependencies without manual configuration.
   *
   * @example
   * // Example usage in configuration options:
   * const options: PeerDependenciesConstraintOptions = {
   *   autoImportFrom: ['eslint-plugin-*', 'packages/*']
   * };
   *
   * // Patterns like 'eslint-plugin-*' can match all peer dependencies
   * // starting with 'eslint-plugin-' (e.g., `eslint-plugin-react`).
   * @see {@link micromatch} for supported glob syntax.
   */

  /**
   * Glob patterns of direct dependencies whose `peerDependencies` should be
   * propagated to the dependant workspace.
   *
   * If a workspace (A) depends on a package (B) whose name matches any pattern
   * in this list, then all peerDependencies declared by B will be ensured on A.
   * For example, if A depends on `package-B`, B has a peer dependency C, and
   * `autoImportFrom` is `['package-*']`, then A will be made to declare C as dependency as well.
   *
   * Behavior:
   * - When B is a "dependencies" entry of A, B's peerDependencies are added to
   *   A's "dependencies" (if not already present) and removed from A's
   *   "devDependencies".
   * - Otherwise (e.g., B is only a devDependency), B's peerDependencies are
   *   added to A's "devDependencies" if missing.
   *
   * Patterns use micromatch-style globs. This list augments built-in matchers
   * used by the constraint (e.g., scoped workspace wildcard, common presets).
   *
   * @example
   * // Propagate peers from any package starting with "package-"
   * autoImportFrom: ['package-*']
   * @example
   * // Propagate peers from all packages within a scope
   * autoImportFrom: ['@my-scope/*']
   */
  readonly autoImportFrom?: string[];
}

/**
 * Factory function to create a peer dependencies constraint for Yarn workspaces.
 * This constraint ensures proper handling of peer dependencies in relation to other dependency types across workspaces,
 * while also considering options for private packages and auto-import rules.
 *
 * @param options - Configuration options for the constraint. These include:
 * - `allowPrivates`: A boolean indicating whether private workspaces are allowed to have peer dependencies. Defaults to `false`.
 * - `autoImportFrom`: An array of glob patterns specifying auto-import rules for peer dependencies. Defaults to an empty array.
 * @returns A function that defines the peer dependencies constraint logic. This function acts on Yarn dependency graphs to enforce consistency between peer dependencies, workspace-level dependencies, private workspace handling, and automatic peer dependency propagation from specific dependencies.
 *
 * ### Behavior:
 * 1. Ensures that private packages (if `allowPrivates` is `false`) do not have peer dependencies.
 * 2. Eliminates duplicate dependencies that are redundantly specified in both `dependencies` and `peerDependencies` for the same workspace.
 * 3. Handles auto-importing of peer dependencies based on the specified `autoImportFrom` patterns and the project's scope.
 * 4. Automatically ensures that required peer dependencies are included in appropriate workspaces, propagating them as needed to meet constraints.
 */
export const createPeerDependenciesConstraint: ConstraintFactory<
  PeerDependenciesConstraintOptions
> = ({ allowPrivates = false, autoImportFrom = [] } = {}) =>
  function constraintPeerDependencies({ Yarn }) {
    const autoImportMatchers = [
      ...Yarn.workspaces().map(({ ident }) => ident ?? ''),
      ...autoImportFrom,
    ]
      .filter(isTruly)
      .map((glob) => micromatch.matcher(glob));

    const depsToAutoImportPeersFrom = new Map(
      Yarn.dependencies()
        .filter(
          ({ ident, resolution, type }) =>
            type !== 'peerDependencies' &&
            sure(resolution, (res) => res.peerDependencies.size > 0, false) &&
            autoImportMatchers.some((matcher) => matcher(ident)),
        )
        .map((dep) => [
          dep,
          new Map(
            dep
              .resolution!.peerDependencies.entries()
              .filter(
                ([ident]) =>
                  !getManifest(dep.workspace).peerDependenciesMeta?.[ident]
                    ?.optional,
              ),
          ),
        ]),
    );

    for (const workspace of Yarn.workspaces()) {
      const isPrivate = hasProp(getManifest(workspace), 'private', isTrue);
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

          if (isNil(Yarn.workspace({ ident: peerDependency.ident }))) {
            const devDependency = Yarn.dependency({
              ...query,
              type: 'devDependencies',
            });
            // the code below needed to properly update peer dependencies
            if (isNil(devDependency)) {
              workspace.set(
                ['devDependencies', peerDependency.ident],
                getRangeConsideringRoot(Yarn, peerDependency),
              );
            } else {
              softUpdate(Yarn, peerDependency, devDependency.range);
            }
          }
        }
      }
    }

    // Ensures that peerDependencies of workspaces are met in dependent workspaces
    for (const workspace of Yarn.workspaces()) {
      depsToAutoImportPeersFrom
        .entries()
        .filter(([dep]) => dep.workspace === workspace)
        .forEach(([dep, peers]) => {
          const { ident, type: peerType } = dep;
          const query = { workspace, ident };

          const samePeerExists = isNotNil(
            Yarn.dependency({ ...query, type: 'peerDependencies' }),
          );

          if (peerType === 'dependencies') {
            if (!samePeerExists) {
              peers.forEach((range, subPeerIdent) => {
                const subPeerQuery = { workspace, ident: subPeerIdent };

                if (
                  subPeerIdent !== workspace.ident &&
                  isNil(
                    Yarn.dependency({
                      ...subPeerQuery,
                      type: 'peerDependencies',
                    }),
                  )
                ) {
                  if (
                    isNil(
                      Yarn.dependency({
                        ...subPeerQuery,
                        type: 'dependencies',
                      }),
                    )
                  ) {
                    workspace.set(
                      ['dependencies', subPeerIdent],
                      getRangeConsideringRoot(Yarn, {
                        ident: subPeerIdent,
                        range,
                      }),
                    );
                  }

                  Yarn.dependency({
                    ...subPeerQuery,
                    type: 'devDependencies',
                  })?.delete();
                }
              });
            }
          } else if (
            isNil(Yarn.dependency({ ...query, type: 'dependencies' }))
          ) {
            peers.forEach((range, subPeerIdent) => {
              if (
                subPeerIdent !== workspace.ident &&
                (
                  [
                    'devDependencies',
                    'dependencies',
                    'peerDependencies',
                  ] as const satisfies YarnType.Constraints.DependencyType[]
                )
                  .map((type) =>
                    Yarn.dependency({ workspace, ident: subPeerIdent, type }),
                  )
                  .every(isNil)
              ) {
                workspace.set(
                  ['devDependencies', subPeerIdent],
                  getRangeConsideringRoot(Yarn, { ident: subPeerIdent, range }),
                );
              }
            });
          }
        });
    }
  };
