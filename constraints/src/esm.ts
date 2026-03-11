import type { Constraint } from './utils.js';

/**
 * A constraint function that ensures all workspaces have a proper `./package.json` export.
 *
 * This function iterates through all workspaces in the Yarn project and sets the
 * `exports['./package.json']` field to `./package.json` in each workspace's manifest.
 * This ensures that the `package.json` file can be resolved as a subpath export.
 *
 * @param options - The constraint options containing the Yarn instance.
 */
export const constraintExports: Constraint = ({ Yarn }) => {
  for (const workspace of Yarn.workspaces()) {
    workspace.set(['exports', './package.json'], './package.json');
  }
};

/**
 * A constraint function that automatically generates `imports` based on `exports` in each workspace.
 *
 * For each workspace that defines `exports`, this function mirrors those exports in the `imports` field
 * by replacing the `./` prefix with `#`. It skips the root export (`.`).
 *
 * This allows using the same paths for internal imports and external consumers while using the `#` prefix
 * for better clarity and alignment with ESM standards.
 *
 * @param options - The constraint options containing the Yarn instance.
 */
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
