import type { Constraint } from './utils.js';

export const constraintExports: Constraint = ({ Yarn }) => {
  for (const workspace of Yarn.workspaces()) {
    workspace.set(['exports', './package.json'], './package.json');
  }
};

export const constraintImports: Constraint = ({ Yarn }) => {
  for (const workspace of Yarn.workspaces()) {
    const { exports } = workspace.manifest as {
      exports?: Record<string, unknown>;
    };

    if (exports != null) {
      for (const [exportName, value] of Object.entries(exports)) {
        if (exportName !== '.') {
          workspace.set(['imports', exportName.replace('./', '#')], value);
        }
      }
    }
  }
};
