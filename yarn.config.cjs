// @ts-check

/** @type {import('@yarnpkg/types')} */
const { defineConfig } = require('@yarnpkg/types');
const packageJson = require('#package.json');

const sharedFields = new Set(['packageManager', 'type', 'license']);
const prohibitedDependencies = new Set([packageJson.name]);

/**
 * @typedef {Object} ConstraintOptions
 * @prop {import('@yarnpkg/types').Yarn.Constraints.Workspace} root - root workspace
 * @prop {string} ns — monorepo's default namespace (includes leading "/")
 * @prop {import('@yarnpkg/types').Yarn.Constraints.Yarn} Yarn — Yarn object
 *
 * @typedef {(options: ConstraintOptions) => void | Promise<void>} Constraint
 */

module.exports = defineConfig({
  constraints: async ({ Yarn }) => {
    const rootIdent = packageJson.name;
    const [ns] = rootIdent.match(/^@[^/]+\//);
    const root = Yarn.workspace({ ident: rootIdent });

    /** @type {ConstraintOptions} */
    const options = { root, ns, Yarn };

    [
      constraintIdent,
      constraintSharedFields,
      constraintExports,
      constraintImports,
      constraintRootDependencies,
      constraintPeerDependencies,
      constraintWsDependencies,
    ].forEach((constraint) => constraint(options));
  },
});

/** @type {Constraint} */
const constraintIdent = ({ Yarn, ns }) => {
  for (const workspace of Yarn.workspaces()) {
    if (!workspace.ident.startsWith('@')) {
      workspace.set('name', `${ns}${workspace.ident}`);
    }
  }
};

/** @type {Constraint} */
const constraintSharedFields = ({ Yarn, root }) => {
  for (const workspace of Yarn.workspaces()) {
    for (const field of sharedFields) {
      workspace.set(field, root.manifest[field]);
    }
  }
};

/** @type {Constraint} */
const constraintExports = ({ Yarn }) => {
  for (const workspace of Yarn.workspaces()) {
    workspace.set(['exports', './package.json'], './package.json');
  }
};

/** @type {Constraint} */
const constraintImports = ({ Yarn }) => {
  for (const workspace of Yarn.workspaces()) {
    const { exports } = workspace.manifest;
    if (exports != null) {
      for (const [exportName, path] of Object.entries(exports)) {
        const importName =
          exportName === '.' ? '#@' : exportName.replace('./', '#');

        workspace.set(['imports', importName], path);
      }
    }
  }
};

/** @type {Constraint} */
const constraintRootDependencies = ({ Yarn, root }) => {
  /** @type {Record<string, string[]>} */
  const dependencyRecords = {};

  for (const workspace of Yarn.workspaces()) {
    if (workspace !== root) {
      for (const dep of Yarn.dependencies({ workspace })) {
        if (Yarn.dependency({ workspace: root, ident: dep.ident }) == null) {
          dependencyRecords[dep.ident] = [
            ...(dependencyRecords[dep.ident] ?? []),
            dep.range,
          ];
        }
      }
    }
  }

  for (const [ident, ranges] of Object.entries(dependencyRecords)) {
    if (ranges.length > 1) {
      const rangeSet = new Set(ranges);
      if (rangeSet.size > 1) {
        root.error(
          `More than one workspaces has dependency "${ident}" with following ranges: "${[...rangeSet].join('", "')}".
Please add this dependency to the root workspace manually`,
        );
      } else {
        root.set(['dependencies', ident], rangeSet.values().next().value);
      }
    }
  }
};

const constraintPeerDependencies = ({ Yarn }) => {
  const workspaces = Yarn.workspaces();

  /** @type {Map<string, import('@yarnpkg/types').Yarn.Constraints.Dependency[]>} */
  const wsPeersMap = new Map();

  for (const workspace of workspaces) {
    const peers = Yarn.dependencies({ workspace, type: 'peerDependencies' });

    if (peers.length > 0) {
      wsPeersMap.set(workspace.ident, peers);
    }
  }

  for (const workspace of workspaces) {
    for (const [ident, peers] of wsPeersMap) {
      const wsDep = Yarn.dependency({ workspace, ident });

      if (wsDep != null) {
        for (const peer of peers) {
          const peerInWs = Yarn.dependency({
            workspace,
            ident: peer.ident,
          });

          if (peerInWs == null) {
            if (peer.ident !== workspace.ident) {
              workspace.set([wsDep.type, peer.ident], peer.range);
            }
          } else {
            peerInWs.update(peer.range);
          }
        }
      }
    }
  }
};

/** @type {Constraint} */
const constraintWsDependencies = ({ Yarn, root }) => {
  const workspaces = Yarn.workspaces();
  for (const workspace of workspaces) {
    if (workspace !== root) {
      for (const { ident, range } of Yarn.dependencies({ workspace: root })) {
        Yarn.dependency({ workspace, ident })?.update(range);
      }
    }

    const prohibited = new Set([workspace.ident, ...prohibitedDependencies]);
    for (const dep of Yarn.dependencies({ workspace })) {
      if (prohibited.has(dep.ident)) {
        dep.delete();
      } else if (Yarn.workspace({ ident: dep.ident }) != null) {
        dep.update('workspace:^');
      }
    }
  }
};
