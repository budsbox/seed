import { parsePackageName, stringifyPackageName } from '@budsbox/lib-es/string';

import {
  type Constraint,
  type ConstraintFactory,
  getManifest,
  getRootWs,
} from './utils';
import { isNil } from '@budsbox/lib-es/guards';

/**
 * The `constraintPackageName` variable is a constraint function that performs
 * validation and modification on package names within a monorepo managed by Yarn.
 *
 * This function ensures that each workspace within the root workspace has a
 * valid package name, and enforces a naming convention where the namespace (scope)
 * of the root package is applied to any workspace whose package name lacks a namespace.
 *
 * Behavior:
 * - Validates that the root package has a defined name in its `package.json` file.
 *   If the name is missing, an error is logged.
 * - Extracts the namespace (scope) from the root package's name, if one exists.
 * - Iterates over all Yarn workspaces and checks each workspace's package name:
 *   - If a workspace has no name defined in its `package.json`, an error is logged.
 *   - If a workspace's package name lacks a namespace, the root's namespace is
 *     applied to it as a prefix, and the name is updated accordingly.
 *
 * @param Yarn - The Yarn API instance, which provides access to the root workspace
 * and all associated workspaces for validation and name modifications.
 */
export const constraintPackageName: Constraint = ({ Yarn }) => {
  const root = getRootWs(Yarn);
  const rootIdent = root.ident;

  if (rootIdent == null) {
    root.error('Missing field "name" in the root\'s package.json');
    return;
  }

  const { scope } = parsePackageName(rootIdent);

  if (scope != null) {
    for (const workspace of Yarn.workspaces()) {
      const { ident } = workspace;
      if (isNil(ident)) {
        workspace.error(`The workspace "${workspace.cwd}" has no package name`);
      } else {
        const parsedIdent = parsePackageName(ident);
        if (parsedIdent.scope == null) {
          workspace.set('name', stringifyPackageName({ scope, name: ident }));
        }
      }
    }
  }
};

/**
 * A function that creates a constraint to enforce specific fields in the package manifests across multiple workspaces.
 * This ensures the consistency of `sharedFields` in all workspace manifests by aligning them with the root workspace's manifest
 * and validates that `requiredFields` are present in each workspace manifest. If a required field is missing and a default
 * value is provided, it will be added. Otherwise, an error will be reported.
 *
 * @param options - The options object of constraint.
 * @param options.sharedFields - A list of fields that need to be shared across all workspace manifests. Each workspace will inherit the
 * corresponding values from the root workspace's manifest for these fields.
 * @param options.requiredFields - An optional list of fields that must be present in each workspace manifest. Each field can either
 * be:
 * - A string indicating just the field name, in which case it is checked for existence and an error is raised if it is missing.
 * - A tuple where the first element is the field name and the second element is the default value to be added if the field is missing.
 * @returns A constraint function that can be applied to validate and enforce the specified manifest fields in all workspaces.
 */
export const createManifestFieldsConstraint: ConstraintFactory<{
  readonly sharedFields: readonly string[];
  readonly requiredFields?: ReadonlyArray<string | [string, unknown]>;
}> = ({ sharedFields, requiredFields = [] }) =>
  function constraintManifestFields({ Yarn }) {
    const rootManifest = getManifest(getRootWs(Yarn));
    for (const workspace of Yarn.workspaces()) {
      for (const field of sharedFields) {
        workspace.set(field, rootManifest[field]);
      }

      for (const field of [['type', 'module'], ...requiredFields]) {
        const [key, value] = Array.isArray(field) ? field : [field, null];
        const manifest = getManifest(workspace);
        if (!Object.hasOwn(manifest, key)) {
          if (value != null) {
            workspace.set(key, value);
          } else {
            workspace.error(`Missing field ${key} in package.json`);
          }
        }
      }
    }
  };
