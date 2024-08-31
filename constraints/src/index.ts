import type { Constraint, ConstraintOptions } from './utils.js';

export async function runConstraintsSequence(
  options: ConstraintOptions,
  ...constraints: readonly Constraint[]
): Promise<void> {
  for (const constraint of constraints) {
    await constraint(options);
  }
}

export {
  constraintPackageName,
  createManifestFieldsConstraint,
} from './base.js';
export { constraintExports, constraintImports } from './esm.js';
export {
  constraintRootDependencies,
  createPeerDependenciesConstraint,
  createWorkspaceDependenciesConstraint,
} from './dependencies/index.js';
