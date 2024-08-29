/** @type {import('@yarnpkg/types')} */
const { defineConfig } = require('@yarnpkg/types');
const {
  constraintPackageName,
  createManifestFieldsConstraint,
  constraintExports,
  constraintImports,
  constraintRootDependencies,
  constraintPeerDependencies,
  createWorkspaceDependenciesConstraint,
  runConstraintsSequence,
} = require('@budsbox/constraints');

module.exports = defineConfig({
  constraints: async ({ Yarn }) => {
    await runConstraintsSequence(
      { Yarn },
      constraintPackageName,
      createManifestFieldsConstraint({
        sharedFields: [
          'author',
          'bugs',
          'homepage',
          'license',
          'packageManager',
        ],
      }),
      constraintExports,
      constraintImports,
      constraintRootDependencies,
      constraintPeerDependencies,
      createWorkspaceDependenciesConstraint(),
    );
  },
});
