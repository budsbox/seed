import { isNil, isNotNil } from '@budsbox/lib-es/guards';

import { type Constraint, getRootWs } from '../utils.js';

/**
 * A constraint function that enforces the consistency of dependencies among Yarn workspaces.
 * It ensures that if a dependency exists with multiple version ranges across different workspaces,
 * the root workspace is informed about the discrepancy and either displays an error or synchronizes the dependency to the root level.
 *
 * This function processes all the dependencies of the workspaces except for the root.
 * If it detects that the same dependency exists in different workspaces with differing version ranges, it raises an error.
 * Otherwise, it synchronizes the dependency to the root workspace if it is missing from there.
 *
 * @param Yarn - A Yarn utility object that provides functions for managing dependencies and workspaces.
 */
export const constraintRootDependencies: Constraint = ({ Yarn }) => {
  const root = getRootWs(Yarn);

  for (const ws of Yarn.workspaces()) {
    if (ws !== root && isNotNil(ws.ident)) {
      root.set(['dependencies', ws.ident], 'workspace:^');
    }
  }

  type DepRanges = Record<string, string[]>;
  const dependencyRecords = Yarn.workspaces()
    .filter((ws) => ws !== root)
    .reduce<DepRanges>(
      (acc, workspace) =>
        Yarn.dependencies({ workspace }).reduce<DepRanges>(
          (depAcc, { ident, range }) =>
            (
              [
                Yarn.dependency({ workspace: root, ident }),
                Yarn.workspace({ ident }),
              ].every(isNil)
            ) ?
              {
                ...depAcc,
                [ident]: [...(depAcc[ident] ?? []), range],
              }
            : depAcc,
          acc,
        ),
      {},
    );

  for (const [ident, ranges] of Object.entries(dependencyRecords)) {
    if (ranges.length > 1) {
      const rangeSet = new Set(ranges);
      if (rangeSet.size > 1) {
        root.error(
          `More than one workspaces have dependency "${ident}" with following ranges: "${[...rangeSet].join('", "')}".
  Please add this dependency to the root workspace manually`,
        );
      } else if (isNil(Yarn.dependency({ workspace: root, ident }))) {
        root.set(['dependencies', ident], rangeSet.values().next().value);
      }
    }
  }
};
