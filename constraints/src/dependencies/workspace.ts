import { type Constraint, getRootWs } from '../utils';

export const createWorkspaceDependenciesConstraint = ({
  bannedDependencies,
}: {
  readonly bannedDependencies?: readonly string[];
} = {}): Constraint =>
  function constraintWorkspaceDependencies({ Yarn }) {
    const root = getRootWs(Yarn);
    const workspaces = Yarn.workspaces();
    for (const workspace of workspaces) {
      if (workspace !== root) {
        for (const { ident, range } of Yarn.dependencies({ workspace: root })) {
          Yarn.dependency({ workspace, ident })?.update(range);
        }
      }

      const banned = new Set([
        root.ident,
        workspace.ident,
        ...(bannedDependencies ?? []),
      ]);
      for (const dep of Yarn.dependencies({ workspace })) {
        if (banned.has(dep.ident)) {
          dep.delete();
        } else if (Yarn.workspace({ ident: dep.ident }) != null) {
          dep.update('workspace:^');
        }
      }
    }
  };
