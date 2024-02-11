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
      if (workspace === rootWs) continue;
      workspace.set('type', 'module');

      if (!workspace.ident.startsWith(ns)) {
        workspace.set('name', `${ns}${workspace.ident}`);
      }

      for (const { ident, range } of rootDependencies) {
        Yarn.dependency({ workspace, ident })?.update(range);
      }
    }
  },
});
