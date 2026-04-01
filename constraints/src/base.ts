import type { Arrayable } from 'type-fest';

import {
  hasProp,
  isArray,
  isNil,
  isNotNil,
  isString,
} from '@budsbox/lib-es/guards';
import {
  joinPath,
  parsePackageName,
  serializePackageName,
} from '@budsbox/lib-es/string';

import {
  type Constraint,
  type ConstraintFactory,
  getManifest,
  getRootWs,
} from './utils.js';

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
          workspace.set('name', serializePackageName({ scope, name: ident }));
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
  readonly requiredFields?: ReadonlyArray<
    string | [Arrayable<string>, unknown]
  >;
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
        if (isNotNil(value)) {
          if (isArray(key) || !hasProp(manifest, key)) {
            workspace.set(key, value);
          }
        } else if (!isArray(key) && !hasProp(manifest, key))
          workspace.error(`Missing field ${key} in package.json`);
      }
    }
  };

/**
 * Factory function to create a constraint that ensures the `homepage` field
 * in package manifests is correctly set based on a provided base URL for all
 * Yarn workspaces.
 *
 * This constraint will:
 * 1. Check if the root workspace (package) has the `homepage` field set.
 *    - If unset or invalid, it will set it to the given `baseUrl`.
 * 2. Iterate through all non-root workspaces and validate their `homepage` fields.
 *    - If unset or inconsistent, it will compute the `homepage` field by
 *      appending the workspace's relative path to the given `baseUrl` and
 *      update it accordingly.
 *
 * @param config - The configuration for the constraint factory.
 * Contains the `baseUrl` that serves as the foundation for `homepage` URLs.
 * @returns A constraint function that applies the `homepage` validation and update logic
 * across all workspaces within a Yarn project.
 * @typeParam TConfig - An object type for the constraint configuration.
 * It includes:
 * - `baseUrl` (readonly): The base URL used as the root for constructing `homepage` fields.
 */
export const createHomepageConstraint: ConstraintFactory<{
  readonly baseUrl: string;
}> = ({ baseUrl }) =>
  function constraintHomepage({ Yarn }) {
    const rootWs = getRootWs(Yarn);
    const rootManifest = getManifest(rootWs);
    if (!isString(rootManifest.homepage)) rootWs.set('homepage', baseUrl);

    for (const workspace of Yarn.workspaces()) {
      if (workspace === getRootWs(Yarn)) continue;
      const workspaceUrl = new URL(baseUrl);
      workspaceUrl.pathname = joinPath(workspaceUrl.pathname, workspace.cwd);

      const workspaceManifest = getManifest(workspace);
      if (workspaceManifest.homepage !== workspaceUrl.toString())
        workspace.set('homepage', workspaceUrl.toString());
    }
  };
