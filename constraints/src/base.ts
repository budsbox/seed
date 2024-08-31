import { type ConstraintFactory, getManifest, parsePackageName } from './utils';

import { type Constraint, getRootWs } from './utils';

export const constraintPackageName: Constraint = ({ Yarn }) => {
  const root = getRootWs(Yarn);
  const rootIdent = root.ident;

  if (rootIdent == null) {
    root.error('Missing field "name" in the root\'s package.json');
    return;
  }

  const { ns } = parsePackageName(rootIdent);

  if (ns != null) {
    for (const workspace of Yarn.workspaces()) {
      const { ident } = workspace;
      if (ident == null) {
        workspace.error(`The workspace "${workspace.cwd}" has no package name`);
      } else {
        const parsedIdent = parsePackageName(ident);
        if (parsedIdent.ns == null) {
          workspace.set('name', `${ns}${ident}`);
        }
      }
    }
  }
};

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
