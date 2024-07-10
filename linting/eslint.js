import globals from 'globals';
import eslint from '@eslint/js';
import eslintTs from 'typescript-eslint';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginReactRefresh from 'eslint-plugin-react-hooks';

/* eslint  */

export const globs = {
  commonJs: ['*.cjs', '*.cts'],
  esm: ['*.mjs', '*.js', '*.ts', '*.tsx'],
  js: ['*.js', '*.mjs', '*.cjs'],
  ts: ['*.ts', '*.tsx', '*.cts'],
};
globs.all = union(Object.values(globs));

const ecmaVersion = 2021;

/** @type { Record<string, import("@types/eslint").FlatConfig[]> } */
export const configs = {
  common: [
    {
      files: withNested(globs.all),
      ignorePatterns: ['dist', '.husky', '.idea', '.pnp.*', '*.scss.d.ts'],
      languageOptions: {
        ecmaVersion,
        globals: { ...globals[`es${ecmaVersion}`] },
      },
      rules: {
        ...eslint.configs.recommended.rules,
        'curly': 'error',
        'eqeqeq': ['error', 'always', { null: 'ignore' }],
        'no-console': 'error',
        'no-constant-binary-expression': 'error',
        'no-debugger': 'error',
        'no-extra-boolean-cast': 'off',
        'no-useless-concat': 'error',
        'quotes': [
          'error',
          'single',
          { allowTemplateLiterals: false, avoidEscape: true },
        ],
      },
    },
  ],

  node: [
    {
      files: withNested(globs.all),
      languageOptions: { globals: { ...globals.nodeBuiltin } },
    },
    {
      files: withNested(globs.commonJs),
      languageOptions: { globals: { ...globals.node } },
    },
  ],

  import: [
    {
      files: withNested(globs.esm),
      languageOptions: {
        sourceType: 'module',
      },
      plugins: [eslintPluginImport],
      rules: {
        ...eslintPluginImport.configs.recommended.rules,

        'sort-imports': ['error', { ignoreDeclarationSort: true }],

        'import/extensions': ['error', 'always'],
        'import/first': 'error',
        'import/newline-after-import': ['error', { considerComments: true }],
        'import/no-absolute-path': 'error',
        'import/no-commonjs': 'error',
        'import/no-duplicates': 'error',
        'import/no-empty-named-blocks': 'error',
        'import/no-extraneous-dependencies': [
          'error',
          { bundledDependencies: false },
        ],
        'import/no-mutable-exports': 'error',
        'import/no-self-import': 'error',
        'import/no-unassigned-import': ['error', { allow: ['**/*.scss'] }],
        'import/no-useless-path-segments': 'error',
        'import/no-webpack-loader-syntax': 'error',
        'import/order': [
          'error',
          {
            'groups': [
              'type',
              'builtin',
              'external',
              'internal',
              'parent',
              'sibling',
              'index',
            ],
            'pathGroups': [
              {
                pattern: '*.svg',

                group: 'type',
                patternOptions: { matchBase: true },
                position: 'after',
              },

              {
                pattern: './*.module.scss',

                group: 'sibling',
                position: 'after',
              },
            ],

            'alphabetize': { order: 'asc' },
            'distinctGroup': true,
            'newlines-between': 'always-and-inside-groups',
            'pathGroupsExcludedImportTypes': ['builtin', 'type'],
          },
        ],
      },
    },

    {
      files: withNested(intersection(globs.esm, globs.js)),
      settings: {
        'import/extensions': intersection(globs.esm, globs.js).map((v) =>
          v.replace('*', ''),
        ),
      },

      rules: {
        'import/extensions': [
          'error',
          'ignorePackages',
          intersection(globs.esm, globs.js).reduce(
            (acc, ext) => ({ ...acc, [ext.replace('*.', '')]: 'never' }),
            {},
          ),
        ],
      },
    },

    {
      files: withNested(intersection(globs.esm, globs.ts)),
      settings: {
        'import/external-module-folders': [
          'node_modules',
          'node_modules/@types',
        ],
        'import/parsers': {
          '@typescript-eslint/parser': globs.ts,
        },
        'import/resolver': {
          typescript: { alwaysTryTypes: true, project: true },
        },
      },
    },
  ],

  client: [
    {
      files: withNested(globs.esm),
      globals: { ...globals.browser },
      languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
      plugins: [
        eslintPluginReact,
        eslintPluginReactHooks,
        eslintPluginReactRefresh,
      ],
      settings: { react: { linkComponents: ['Link'], version: 'detect' } },

      rules: {
        ...eslintPluginReact.configs.recommended.rules,
        ...eslintPluginReactHooks.configs.recommended.rules,
        ...eslintPluginReactRefresh.configs.recommended.rules,

        'no-alert': 'error',

        'react/boolean-prop-naming': 'error',
        'react/button-has-type': 'error',
        'react/destructuring-assignment': 'error',
        'react/function-component-definition': [
          'error',
          {
            namedComponents: 'arrow-function',
            unnamedComponents: 'arrow-function',
          },
        ],
        'react/hook-use-state': 'error',
        'react/iframe-missing-sandbox': 'error',
        'react/jsx-child-element-spacing': 'error',
        'react/jsx-curly-brace-presence': [
          'error',
          {
            children: 'never',
            propElementValues: 'always',
            props: 'never',
          },
        ],
        'react/jsx-fragments': 'error',
        'react/jsx-handler-names': 'error',
        'react/jsx-newline': 'error',
        'react/jsx-no-constructed-context-values': 'error',
        'react/jsx-no-leaked-render': 'error',
        'react/jsx-no-script-url': 'error',
        'react/jsx-no-target-blank': 'error',
        'react/jsx-no-useless-fragment': 'error',
        'react/no-array-index-key': 'warn',
        'react/no-danger': 'error',
        'react/no-unsafe': 'error',
        'react/no-unstable-nested-components': 'error',
        'react/prop-types': 'off',
        'react/void-dom-elements-no-children': 'error',

        'react-hooks/exhaustive-deps': 'error',

        'react-refresh/only-export-components': [
          'error',
          { allowConstantExport: true },
        ],
      },
    },
  ],

  ts: [
    eslintTs.configs.strictTypeChecked,
    {
      files: withNested(intersection(globs.ts, globs.esm)),
    },
  ],
};

export const presets = {
  node: [...configs.common, ...configs.node, ...configs.import],
};

export function withNested(...globs) {
  return union(...globs).map((glob) => `**/${glob}`);
}

function union(...arrays) {
  return [...new Set(arrays.flatMap((v) => v))];
}

function intersection(...arrays) {
  const united = union(...arrays);
  const sets = arrays.map((v) => new Set(v));

  return united.filter((v) => sets.every((set) => set.has(v)));
}
