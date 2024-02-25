// @ts-check

/** @type {import('@yarnpkg/types')} */
const { defineConfig } = require(`@yarnpkg/types`);
const packageJson = require('./package.json');

module.exports = defineConfig({
  constraints: async ({ Yarn }) => {
    const rootIdent = packageJson.name;
    const [ns] = rootIdent.match(/^@[^/]+\//);
    const rootWs = Yarn.workspace({ ident: rootIdent });
    const rootDependencies = Yarn.dependencies({ workspace: rootWs });

    for (const workspace of Yarn.workspaces()) {
      workspace.set('type', 'module');

      if (!workspace.ident.startsWith(ns)) {
        workspace.set('name', `${ns}${workspace.ident}`);
      }

      const { exports } = workspace.manifest;
      if (exports != null) {
        const imports = Object.fromEntries(
          Object.entries(exports).map(([submodule, path]) => [
            submodule === '.' ? '#@' : submodule.replace('./', '#'),
            path,
          ]),
        );

        workspace.set('imports', imports);
      }

      if (workspace !== rootWs) {
        for (const { ident, range } of rootDependencies) {
          Yarn.dependency({ workspace, ident })?.update(range);
        }
      }

      for (const dep of Yarn.dependencies({ workspace })) {
        if (dep.ident.startsWith(ns)) {
          dep.update('workspace:^');
        }
      }
    }
  },
});
