// @ts-check

/** @type {import('@yarnpkg/types')} */
const { defineConfig } = require(`@yarnpkg/types`);
const packageJson = require('./package.json');

const sharedFields = new Set(['packageManager', 'type', 'license']);
const forbiddenDependencies = new Set(['@budsbox/root']);

module.exports = defineConfig({
  constraints: async ({ Yarn }) => {
    const rootIdent = packageJson.name;
    const [ns] = rootIdent.match(/^@[^/]+\//);
    const rootWs = Yarn.workspace({ ident: rootIdent });
    const rootDependencies = Yarn.dependencies({ workspace: rootWs });

    for (const workspace of Yarn.workspaces()) {
      for (const field of sharedFields) {
        workspace.set(field, rootWs.manifest[field]);
      }

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
      }

      if (workspace !== rootWs) {
        for (const { ident, range } of rootDependencies) {
          Yarn.dependency({ workspace, ident })?.update(range);
        }
      }

      for (const dep of Yarn.dependencies({ workspace })) {
        if (forbiddenDependencies.has(dep.ident)) {
          dep.delete();
        } else if (dep.ident.startsWith(ns)) {
          dep.update('workspace:^');
        }
      }
    }
  },
});
