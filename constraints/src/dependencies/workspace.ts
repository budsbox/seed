import { type ConstraintFactory, getRootWs, softUpdate } from '../utils';
import { sure } from '@budsbox/lib-es/logical';
import { isNotNil } from '@budsbox/lib-es/guards';

/**
 * A factory function to create a constraint that ensures specific dependency policies
 * between Yarn workspaces within a monorepo. This includes managing dependency ranges,
 * restricting dependencies, and enforcing workspace protocol usage.
 *
 * The `createWorkspaceDependenciesConstraint` allows configurations for restricting
 * specific dependencies by marking them as banned and ensures that workspace dependencies
 * use the proper workspace protocol.
 *
 * @param config - An optional configuration object.
 * @param config.bannedDependencies - A list of dependencies that are banned across the workspaces.
 *                                     These dependencies will be removed if present.
 *                                     Defaults to an empty array if not provided.
 * @returns A workspace dependencies constraint function that operates on a Yarn project
 *          using provided configurations. The constraint function enforces prohibited
 *          dependencies and ensures that workspace dependencies follow the workspace protocol.
 */
export const createWorkspaceDependenciesConstraint: ConstraintFactory<{
  readonly bannedDependencies?: readonly string[];
}> = ({ bannedDependencies = [] } = {}) =>
  function constraintWorkspaceDependencies({ Yarn }) {
    const root = getRootWs(Yarn);
    const workspaces = Yarn.workspaces();
    for (const workspace of workspaces) {
      if (workspace !== root) {
        for (const { ident, range } of Yarn.dependencies({ workspace: root })) {
          sure(Yarn.dependency({ workspace, ident }), (dep) => {
            softUpdate(Yarn, dep, range);
          });
        }
      }

      const banned = new Set([
        root.ident,
        workspace.ident,
        ...bannedDependencies,
      ]);
      for (const dep of Yarn.dependencies({ workspace })) {
        if (
          banned.has(dep.ident) ||
          (dep.type === 'devDependencies' &&
            isNotNil(
              Yarn.dependency({
                workspace,
                ident: dep.ident,
                type: 'dependencies',
              }),
            ))
        ) {
          dep.delete();
        } else if (Yarn.workspace({ ident: dep.ident }) != null) {
          softUpdate(Yarn, dep, 'workspace:^');
        }
      }
    }
  };
