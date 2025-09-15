import type { ArchetypeMap } from './types.js';

import * as baseTpl from './templates/base.js';
import * as libIsoTpl from './templates/lib-iso.js';

export const archetypes = {
  'base': {
    at: '.',
    internal: true,
    dependencies: ['tslib'],
    devDependencies: [
      'typescript',
      '@budsbox/tsconfigs',
      '@budsbox/eslint',
      '@budsbox/eslint_presets-tools',
    ],
    commands: [{ exec: 'yarn relink', workspace: 'root' }, 'yarn p:format'],
    files: baseTpl.files,
  },
  'lib-iso': {
    extends: 'base',
    at: 'lib',
    devDependencies: ['...', '@budsbox/eslint_presets-lib'],
    files: libIsoTpl.files,
  },
  'lib-node': {},
  'lib-ui': {},
  'ui-component': {
    at: 'ui/components',
    devDependencies: ['typescript', '@budsbox/tsconfigs'],
    peerDependencies: ['react', 'react-dom'],
  },
} as const satisfies ArchetypeMap;
