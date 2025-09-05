import { sure } from '@budsbox/lib-es/logical';
import type { Awaitable } from '@budsbox/lib-types';
import type { Yarn as YarnNS } from '@yarnpkg/types';
import type { PackageJson } from 'type-fest';

/**
 * Interface representing the constraint options for configurations.
 */
export interface ConstraintOptions {
  /**
   * Yarn object provided to `constraints` methode in `yarn.config.cjs` config.
   */
  readonly Yarn: YarnNS.Constraints.Yarn;
}

/**
 * Represents a constraint function that takes a set of options and performs an asynchronous validation.
 *
 * @param options - An object containing the options required for the constraint validation.
 * @returns A promise that resolves when the validation completes successfully, or rejects with an error if it fails.
 */
export type Constraint = (options: ConstraintOptions) => Awaitable<void>;

/**
 * Represents a factory function type that generates a `Constraint` object.
 * The specific signature depends on whether the `Options` type is an empty object.
 *
 * - If `Options` is an empty object, the factory function can be called with or without the `options` parameter.
 * - Otherwise, the `options` parameter is required when calling the factory function.
 *
 * @typeParam Options - The type of the option parameter used to configure the `Constraint`.
 * @param options - An optional or required configuration object, depending on whether `Options` is an empty object or not.
 * @returns A `Constraint` object configured based on the provided options.
 */
export type ConstraintFactory<Options extends object> =
  object extends Options ? (options?: Options) => Constraint
  : (options: Options) => Constraint;

/**
 * Retrieves the root workspace for the given yarn constraints.
 *
 * @param yarn - The Yarn constraints object used to fetch workspaces.
 * @returns The root workspace from the provided Yarn constraints.
 * @throws Error if the root workspace cannot be determined.
 */
export function getRootWs(
  yarn: YarnNS.Constraints.Yarn,
): YarnNS.Constraints.Workspace {
  const [root] = yarn.workspaces({ cwd: '.' });

  if (root == null) {
    throw new Error('Failed to find the root workspace');
  }

  return root;
}
/**
 * Retrieves the manifest of the provided workspace. If the workspace's manifest is null,
 * an error is thrown.
 *
 * @param workspace - The workspace whose manifest is to be retrieved.
 * @returns The manifest of the provided workspace as an object of type T.
 */
export function getManifest<
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  T extends object = PackageJson,
>(workspace: YarnNS.Constraints.Workspace): T {
  if (workspace.manifest == null) {
    throw new Error(`Workspace manifest is ${String(workspace.manifest)}`);
  }

  return workspace.manifest as T;
}

/**
 * Determines the appropriate range for a given dependency, considering the root workspace
 * dependency range if it exists; otherwise, it defaults to the provided dependency range.
 *
 * @param yarn - The Yarn constraints instance to operate on.
 * @param dependency - The dependency for which the range is being calculated.
 * @returns The dependency range considering the root workspace dependency if present,
 * otherwise the original dependency range.
 */
export const getRangeConsideringRoot = (
  yarn: YarnNS.Constraints.Yarn,
  dependency: Readonly<Pick<YarnNS.Constraints.Dependency, 'range' | 'ident'>>,
): string =>
  sure(
    yarn.dependency({
      workspace: getRootWs(yarn),
      ident: dependency.ident,
    }),
    ({ range }) => range,
    dependency.range,
  );

/**
 * Updates the version range of a dependency if it differs from the current range.
 *
 * This function calculates a new version range for the given dependency using the root context
 * and updates the dependency if the calculated range is different from the current one. The
 * updated range is then returned.
 *
 * @param Yarn - The Yarn constraints object that provides utility methods for dependency updates.
 * @param dependency - The dependency object which includes the current range and an update method.
 * @param range - The desired version range for the dependency.
 * @returns The new version range after considering the root context of dependencies.
 */
export const softUpdate = (
  Yarn: YarnNS.Constraints.Yarn,
  dependency: YarnNS.Constraints.Dependency,
  range: string,
): string => {
  const newRange = getRangeConsideringRoot(Yarn, { ...dependency, range });
  // this check helps to avoid conflicts when apply dependency.delete() in other constraints
  if (newRange !== dependency.range) {
    dependency.update(newRange);
  }

  return newRange;
};
