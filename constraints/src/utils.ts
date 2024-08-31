import type { AsyncV } from '@budsbox/types';
import type { Yarn } from '@yarnpkg/types';

export interface ConstraintOptions {
  readonly Yarn: Yarn.Constraints.Yarn;
}

export type Constraint = (options: ConstraintOptions) => AsyncV<void>;

export type ConstraintFactory<Options extends object> =
  object extends Options ? (options?: Options) => Constraint
  : (options: Options) => Constraint;

export function getRootWs(
  yarn: Yarn.Constraints.Yarn,
): Yarn.Constraints.Workspace {
  const [root] = yarn.workspaces({ cwd: '.' });

  if (root == null) {
    throw new Error('Failed to get root workspace');
  }

  return root;
}
export function getManifest<
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  T extends object = Record<string, unknown>,
>(workspace: Yarn.Constraints.Workspace): T {
  if (workspace.manifest == null) {
    throw new Error(`Workspace manifest is ${String(workspace.manifest)}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return workspace.manifest;
}

export function getRangeConsideringRoot(
  yarn: Yarn.Constraints.Yarn,
  dependency: Yarn.Constraints.Dependency,
): string {
  const rootDep = yarn.dependency({
    workspace: getRootWs(yarn),
    ident: dependency.ident,
  });

  return rootDep == null ? dependency.range : rootDep.range;
}

export function parsePackageName(packageName: string): {
  ns: `@${string}/` | null;
  name: string;
} {
  const [ns] = (/^@[^/]+\//.exec(packageName) as [`@${string}/`] | null) ?? [
    null,
  ];
  return {
    ns,
    name: packageName.replace(ns ?? '', ''),
  };
}
