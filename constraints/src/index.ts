import type { Constraint, ConstraintOptions } from './utils.js';

// Value exports
export {
  constraintPackageName,
  createHomepageConstraint,
  createManifestFieldsConstraint,
} from './base.js';
export {
  constraintRootDependencies,
  createPeerDependenciesConstraint,
  createWorkspaceDependenciesConstraint,
} from './dependencies/index.js';
export { constraintExports, constraintImports } from './esm.js';

/**
 * Runs a sequence of constraint functions in order.
 *
 * This utility function takes a set of constraint options and a list of constraint functions,
 * then executes each constraint one after another. This is useful for organizing multiple
 * constraints into a single execution pipeline.
 *
 * @param options - The common constraint options (containing the Yarn instance) to be passed to each constraint.
 * @param constraints - A rest parameter containing the constraint functions to execute.
 * @returns A promise that resolves when all constraints in the sequence have finished executing.
 */
export async function runConstraintsSequence(
  options: ConstraintOptions,
  ...constraints: readonly Constraint[]
): Promise<void> {
  for (const constraint of constraints) {
    await constraint(options);
  }
}
