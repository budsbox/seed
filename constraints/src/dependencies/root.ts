import { type Constraint, getRootWs } from '../utils';

/**
 * This function ensures that packages that more than one workspace depends on are added to the root workspace dependencies.
 *
 * @param Yarn
 */
export const constraintRootDependencies: Constraint = ({ Yarn }) => {
  const root = getRootWs(Yarn);

  type DepRanges = Record<string, string[]>;
  const dependencyRecords = Yarn.workspaces()
    .filter((ws) => ws !== root)
    .reduce<DepRanges>(
      (acc, workspace) => ({
        ...acc,
        ...Yarn.dependencies({ workspace }).reduce<DepRanges>(
          (depAcc, { ident, range }) =>
            (
              Yarn.dependency({ workspace: root, ident }) == null &&
              Yarn.workspace({ ident }) == null
            ) ?
              {
                ...depAcc,
                [ident]: [...(depAcc[ident] ?? []), range],
              }
            : depAcc,
          {},
        ),
      }),
      {},
    );

  for (const [ident, ranges] of Object.entries(dependencyRecords)) {
    if (ranges.length > 1) {
      const rangeSet = new Set(ranges);
      if (rangeSet.size > 1) {
        root.error(
          `More than one workspaces has dependency "${ident}" with following ranges: "${[...rangeSet].join('", "')}".
  Please add this dependency to the root workspace manually`,
        );
      } else if (Yarn.dependency({ workspace: root, ident }) == null) {
        root.set(['dependencies', ident], rangeSet.values().next().value);
      }
    }
  }
};
