/**
 * @type {import('@yarnpkg/types')}
 */
const { defineConfig } = require('@yarnpkg/types');

/**
 * @type {import('@budsbox/constraints')}
 */
const {
  constraintPackageName,
  createManifestFieldsConstraint,
  constraintExports,
  constraintImports,
  constraintRootDependencies,
  createPeerDependenciesConstraint,
  createWorkspaceDependenciesConstraint,
  runConstraintsSequence,
  createHomepageConstraint,
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
          'license',
          'packageManager',
          'repository',
        ],
        requiredFields: [
          [['scripts', 'name'], 'echo $npm_package_name'],
          ['version', '0.0.0'],
          ['type', 'module'],
          ['files', ['dist/**/*.js', 'dist/**/*.d.ts']],
        ],
      }),
      createHomepageConstraint({
        baseUrl: 'https://github.com/budsbox/seed/tree/trunk',
      }),
      constraintExports,
      constraintImports,
      constraintRootDependencies,
      createPeerDependenciesConstraint({
        autoImportFrom: ['eslint-*'],
      }),
      createWorkspaceDependenciesConstraint(),
    );
  },
});
