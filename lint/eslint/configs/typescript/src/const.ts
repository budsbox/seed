import type {
  PackageSpecifier,
  TypeOrValueSpecifier,
} from '@typescript-eslint/type-utils';

import globals from 'globals';

import { dedupe } from '@budsbox/lib-es/array';

const libTypes = dedupe(
  (
    [
      'builtin',
      'es2025',
      'node',
      'browser',
      'worker',
      'serviceworker',
    ] as const satisfies Array<keyof typeof globals>
  ).flatMap((key) => Object.keys(globals[key]) as string[]),
)
  .filter((key) => /^[A-Z]/.test(key))
  .concat(['ImportMeta']);

const packageSpecifiers = {
  'type-fest': ['PackageJson', 'TsConfigJson', 'EmptyObject'],
  'eslint': ['Linter', 'Linter.Config', 'Config'],
  '@yarnpkg/core': [
    'Configuration',
    'Project',
    'Workspace',
    'Manifest',
    'Locator',
  ],
} as const satisfies Record<string, string[]>;

export const readonlyParamAllowSpecifiers: TypeOrValueSpecifier[] = [
  { from: 'lib', name: libTypes },
  ...Object.entries(packageSpecifiers).map(
    ([packageName, name]): PackageSpecifier => ({
      from: 'package',
      package: packageName,
      name,
    }),
  ),
];
