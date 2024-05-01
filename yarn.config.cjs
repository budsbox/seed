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

      if (!workspace.ident.startsWith('@')) {
        workspace.set('name', `${ns}${workspace.ident}`);
      }

      const { exports } = workspace.manifest;
      if (exports != null) {
        for (const [exportName, path] of Object.entries(exports)) {
          const importName =
            exportName === '.' ? '#@' : exportName.replace('./', '#');

          workspace.set(['imports', importName], path);
        }

        Object.entries(exports)
          .map(([submodule, path]) => [
            submodule === '.' ? '#@' : submodule.replace('./', '#'),
            path,
          ])
          .forEach(([submodule, path]) => {
            workspace.set(['imports', submodule], path);
          });
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
