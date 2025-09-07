/**
 * @type {import('@yarnpkg/types')}
 */
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

/**
 * @type {import('@yarnpkg/types').Yarn.Config}
 */
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
        requiredFields: [
          // @ts-expect-error TS2322 — temporary workaround
          [['scripts', 'name'], 'echo $npm_package_name'],
          ['version', '0.0.0'],
          ['files', ['dist/**/*.js', 'dist/**/*.d.ts']],
        ],
      }),
      constraintExports,
      constraintImports,
      constraintRootDependencies,
      createPeerDependenciesConstraint(),
      createWorkspaceDependenciesConstraint(),
    );
  },
});
