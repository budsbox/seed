import type { ArchetypeMap } from './types.js';

import { isString } from '@budsbox/lib-es/guards';
import { parsePackageName } from '@budsbox/lib-es/string';
import { findCurrentPackageJson } from '@budsbox/lib-node/pckg';

import * as baseTpl from './templates/base.js';
import * as browserLib from './templates/browser-lib.js';
import * as browser from './templates/browser.js';
import * as isoLibTpl from './templates/iso-lib.js';
import * as lib from './templates/lib.js';
import * as nodeLib from './templates/node-lib.js';
import * as peggy from './templates/peggy.js';
import * as reactComponentLarge from './templates/react-component-large.js';
import * as reactComponent from './templates/react-component.js';
import * as reactLib from './templates/react-lib.js';
import * as react from './templates/react.js';

const cwdPckg = await findCurrentPackageJson();
const { scope } = parsePackageName(cwdPckg.json.name ?? '', true);

const scopedExports =
  isString(scope) ?
    (subpath: string) => ({
      [scope]: subpath,
    })
  : () => undefined;

export const archetypes = {
  'base': {
    internal: true,

    manifest: {
      scripts: {
        test: 'vitest',
      },
    },

    commands: ['yarn p:format'],
    dependencies: [
      'tslib',
      '@budsbox/lib-es',
      '@budsbox/lib-types',
      'type-fest',
    ],
    devDependencies: [
      'typescript',
      '@budsbox/tsconfigs',
      '@budsbox/eslint',
      '@budsbox/eslint_presets-tools',
      'vitest',
    ],
    files: baseTpl.files,
  },

  'app': {
    internal: true,
    at: 'apps',
    manifest: {
      private: true,
    },
  },
  'lib': {
    internal: true,
    at: 'lib',
    manifest: {
      imports: {
        '#types': {
          ...scopedExports('./src/types.ts'),
          types: './dist/types.d.ts',
        },
      },
      exports: {
        '.': {
          ...scopedExports('./src/index.ts'),
          types: './dist/index.d.ts',
          default: './dist/index.js',
        },
      },
      files: [
        'dist/**/*.js',
        'dist/**/*.mjs',
        'dist/**/*.cjs',
        'dist/**/*.d.ts',
      ],
      scripts: {
        watch: 'yarn p:ts:watch',
      },
    },
    files: lib.files,
  },
  'parser': {
    internal: true,
    at: 'parse',
  },

  'browser': {
    internal: true,
    devDependencies: ['sass-embedded', 'vite', '@budsbox/builder_vite'],
    manifest: {
      scripts: {
        serve: 'vite',
      },
      sideEffects: ['./**/*.scss', './**/*.css'],
    },
    files: browser.files,
  },
  'node': {
    internal: true,
  },
  'react': {
    internal: true,
    devDependencies: ['react', 'react-dom', 'clsx'],
    files: react.files,
  },

  'browser-lib': {
    extends: ['base', 'browser', 'lib'],
    devDependencies: ['...', '@budsbox/eslint_presets-browser-lib'],
    manifest: {
      files: ['dist/**/*.css'],
      scripts: {
        prepack: 'yarn p:lib:browser:prepack',
      },
      exports: {
        '.': {
          ...scopedExports('./src/index.ts'),
          types: './dist/index.d.ts',
          default: './dist/index.js',
        },
        './*.css': './dist/*.css',
      },
    },
    files: browserLib.files,
  },
  'iso-lib': {
    extends: ['base', 'lib'],
    devDependencies: ['...', '@budsbox/eslint_presets-lib'],
    manifest: {
      scripts: {
        prepack: 'yarn p:lib:iso:prepack',
      },
    },
    files: isoLibTpl.files,
  },
  'node-lib': {
    extends: ['base', 'lib'],
    devDependencies: ['...', '@budsbox/eslint_presets-node-lib'],
    manifest: {
      scripts: {
        prepack: 'yarn p:lib:node:prepack',
      },
    },
    files: nodeLib.files,
  },
  'peggy': {
    extends: ['iso-lib', 'parser'],

    devDependencies: ['...', 'peggy'],
    files: peggy.files,
    manifest: {
      scripts: {
        build: 'run p:peggy:build; run p:ts:build',
        prepack: 'run p:peggy:prepack; run p:ts:prepack',
        test: 'vitest',
        trace: 'run p:ts:watch:no-clear & run p:peggy:trace',
        watch: 'run p:ts:watch:no-clear & run p:peggy:watch',
      },
      imports: {
        '#parser': {
          types: './dist/parser.d.ts',
          default: './dist/parser.js',
        },
      },
      exports: {
        '.': {
          types: './dist/index.d.ts',
          import: {
            production: './dist/index.min.js',
            default: './dist/index.js',
          },
          require: './dist/index.min.cjs',
          default: './dist/index.js',
        },
      },
    },
  },
  'react-lib': {
    extends: ['base', 'react', 'browser-lib'],
    peerDependencies: [
      '...',
      'react',
      'react-dom',
      '@types/react',
      '@types/react-dom',
    ],
    files: reactLib.files,
  },

  'react-app': {
    extends: ['base', 'browser', 'app', 'react'],
  },
  'react-component': {
    extends: ['react-lib'],
    at: 'ui/components',
    manifest: {
      imports: {
        '#lib': {
          ...scopedExports('./src/lib.ts'),
          types: './dist/lib.d.ts',
          default: './dist/index.mjs',
        },
        '#model': {
          ...scopedExports('./src/model.ts'),
          types: './dist/model.d.ts',
          default: './dist/index.mjs',
        },
        '#ui': {
          ...scopedExports('./src/ui/index.ts'),
          types: './dist/ui/index.d.ts',
          default: './dist/index.mjs',
        },
      },
    },
    files: reactComponent.files,
  },
  'react-component-large': {
    extends: ['react-component'],
    manifest: {
      imports: {
        '#ui': {
          ...scopedExports('./src/ui/index.ts'),
          types: './dist/ui/index.d.ts',
          default: './dist/ui/index.js',
        },
        '#model': {
          ...scopedExports('./src/model/index.ts'),
          types: './dist/model/index.d.ts',
          default: './dist/index.mjs',
        },
      },
    },
    files: reactComponentLarge.files,
  },
} as const satisfies ArchetypeMap;
