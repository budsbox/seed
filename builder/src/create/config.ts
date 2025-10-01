import type { ArchetypeMap } from './types.js';

import * as baseTpl from './templates/base.js';
import * as browserLib from './templates/browser-lib.js';
import * as browser from './templates/browser.js';
import * as isoLibTpl from './templates/iso-lib.js';
import * as lib from './templates/lib.js';
import * as nodeLib from './templates/node-lib.js';
import * as reactLib from './templates/react-lib.js';
import * as react from './templates/react.js';

export const archetypes = {
  'base': {
    internal: true,

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
          types: './dist/types.d.ts',
        },
      },
      exports: {
        '.': {
          import: './dist/index.js',
          types: './dist/index.d.ts',
        },
      },
      files: [
        'dist/**/*.js',
        'dist/**/*.mjs',
        'dist/**/*.cjs',
        'dist/**/*.d.ts',
      ],
      scripts: {
        prepack: 'yarn p:ts:prepack',
        watch: 'yarn p:ts:watch',
      },
    },
    files: lib.files,
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
        prepack: 'yarn vite build; yarn p:ts:build',
        serve: 'vite',
      },
      exports: {
        '.': {
          import: {
            production: {
              types: './dist/index.d.ts',
              default: './dist/index.mjs',
            },
            development: {
              default: './src/index.ts',
            },
          },
          require: {
            types: './dist/index.d.ts',
            default: './dist/index.cjs',
          },
        },
        './*.css': './dist/*.css',
      },
    },
    files: browserLib.files,
  },
  'iso-lib': {
    extends: ['base', 'lib'],
    devDependencies: ['...', '@budsbox/eslint_presets-lib'],
    files: isoLibTpl.files,
  },
  'node-lib': {
    extends: ['base', 'lib'],
    devDependencies: ['...', '@budsbox/eslint_presets-node-lib'],
    files: nodeLib.files,
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
        '#ui': {
          import: {
            types: './dist/ui/index.d.ts',
            default: './dist/ui/index.js',
          },
        },
        '#model': {
          import: {
            types: './dist/model.d.ts',
            default: './dist/model.js',
          },
        },
      },
    },
  },
} as const satisfies ArchetypeMap;
