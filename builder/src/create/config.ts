import type { ArchetypeMap } from './types.js';

import * as baseTpl from './templates/base.js';
import * as browserLib from './templates/browser-lib.js';
import * as browser from './templates/browser.js';
import * as isoLibTpl from './templates/iso-lib.js';
import * as lib from './templates/lib.js';
import * as nodeLib from './templates/node-lib.js';
import * as reactComponentLarge from './templates/react-component-large.js';
import * as reactComponent from './templates/react-component.js';
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
          import: {
            development: './src/index.ts',
            default: './dist/index.js',
            types: './dist/index.d.ts',
          },
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
        prepack: 'NODE_ENV=production yarn vite build; yarn p:ts:build',
      },
      exports: {
        '.': {
          import: {
            development: './src/index.ts',
            production: './dist/index.mjs',
            types: './dist/index.d.ts',
            default: './dist/index.mjs',
          },
          require: {
            development: './src/index.ts',
            production: './dist/index.cjs',
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
        '#lib': {
          import: {
            development: './src/lib.ts',
            types: './dist/lib.d.ts',
            default: './dist/index.mjs',
          },
        },
        '#model': {
          import: {
            development: './src/model.ts',
            types: './dist/model.d.ts',
            default: './dist/index.mjs',
          },
        },
        '#ui': {
          import: {
            development: './src/ui/index.ts',
            types: './dist/ui/index.d.ts',
            default: './dist/index.mjs',
          },
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
          import: {
            development: './src/ui/index.ts',
            types: './dist/ui/index.d.ts',
            default: './dist/ui/index.js',
          },
        },
        '#model': {
          import: {
            development: './src/model/index.ts',
            types: './dist/model/index.d.ts',
            default: './dist/index.mjs',
          },
        },
      },
    },
    files: reactComponentLarge.files,
  },
} as const satisfies ArchetypeMap;
