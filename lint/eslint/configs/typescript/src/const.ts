import type {
  PackageSpecifier,
  TypeOrValueSpecifier,
} from '@typescript-eslint/type-utils';

import globals from 'globals';

import { dedupe, diff } from '@budsbox/lib-es/array';

const libTypes = diff(
  dedupe(
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
    .concat(['ImportMeta', 'ReadonlyMap', 'ReadonlySet', 'ReadonlyArray']),
  ['Set', 'Map', 'Array'],
);

const packageSpecifiers = {
  '@yarnpkg/core': [
    'Configuration',
    'Project',
    'Workspace',
    'Manifest',
    'Locator',
  ],
  'eslint': ['Linter', 'Linter.Config', 'Config'],
  'react': [
    'ComponentClass',
    'ComponentRef',
    'ComponentType',
    'Context',
    'ElementRef',
    'ExoticComponent',
    'FocusEvent',
    'ForwardRefExoticComponent',
    'FunctionComponent',
    'KeyboardEvent',
    'LegacyRef',
    'MouseEvent',
    'NamedExoticComponent',
    'PointerEvent',
    'ReactElement',
    'ReactFragment',
    'ReactNode',
    'ReactPortal',
    'RefObject',
    'RefCallback',
    'Ref',
  ],
  'type-fest': ['PackageJson', 'TsConfigJson', 'EmptyObject', 'Tag', 'Tagged'],
  'vite': ['UserConfig'],
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
