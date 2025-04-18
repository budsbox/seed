/** @type {import('@yarnpkg/types')} */
const { defineConfig } = require('@yarnpkg/types');
const {
  constraintPackageName,
  createManifestFieldsConstraint,
  constraintExports,
  constraintImports,
  constraintRootDependencies,
  createPeerDependenciesConstraint,
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
          'repository',
        ],
        requiredFields: [[['scripts', 'name'], 'echo $npm_package_name']],
      }),
      constraintExports,
      constraintImports,
      constraintRootDependencies,
      createPeerDependenciesConstraint(),
      createWorkspaceDependenciesConstraint(),
    );
  },
});
