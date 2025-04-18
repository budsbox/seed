import type { ConfigFactoryCreate } from '@budsbox/eslint~core';

import type { ESLint } from 'eslint';

import importX from 'eslint-plugin-import-x';

import { sure } from '@budsbox/lib-es/logical';
import { parsePackageName } from '@budsbox/lib-es/string';
import { dotMapper, queryJsExtensions } from '@budsbox/lib-extensions';

export const createImportConfigFactory: ConfigFactoryCreate =
  () =>
  ({ createConfig, matchIncludes, packageJson }) => {
    const extensions = queryJsExtensions({
      jsx: true,
      sourceType: 'module',
    }).map(dotMapper);
    const files = matchIncludes({
      jsx: true,
      targetSourceType: 'module',
    });
    const { scope } = parsePackageName(packageJson.name ?? '');

    return [
      createConfig({
        name: 'import/basic',
        level: 'basic',
        configs: [
          {
            files,
            plugins: {
              'import-x': importX as unknown as ESLint.Plugin,
            },
            settings: {
              'import-x/extensions': extensions,
              'import-x/external-module-folders': ['.yarn', 'node_modules'],
              'import-x/parsers': {
                '@typescript-eslint/parser': extensions,
              },
              'import-x/resolver': {
                typescript: extensions,
              },
              ...sure(scope, (s) => ({
                'import-x/internal-regex': `^${s}`,
              })),
            },
          },
        ],
      }),

      createConfig({
        name: 'import/recommended',
        level: 'recommended',
        modifies: ['import/basic'],
        configs: [
          {
            files,
            rules: {
              ...importX.flatConfigs.recommended.rules,
            },
          },
        ],
      }),

      createConfig({
        name: 'import/opinionated',
        modifies: ['import/recommended'],
        configs: [
          {
            files,
            rules: {
              'sort-imports': ['error', { ignoreDeclarationSort: true }],

              'import-x/first': 'error',
              'import-x/newline-after-import': [
                'error',
                { considerComments: true },
              ],
              'import-x/no-absolute-path': 'error',
              'import-x/no-amd': 'error',
              'import-x/no-commonjs': 'error',
              'import-x/no-duplicates': [
                'error',
                {
                  'considerQueryString': true,
                  'prefer-inline': true,
                },
              ],
              'import-x/no-empty-named-blocks': 'error',
              'import-x/no-extraneous-dependencies': [
                'error',
                { bundledDependencies: false },
              ],
              'import-x/no-mutable-exports': 'error',
              'import-x/no-named-as-default-member': 'error',
              'import-x/no-self-import': 'error',
              'import-x/no-unassigned-import': [
                'error',
                { allow: ['**/*.{css,scss}'] },
              ],
              'import-x/no-useless-path-segments': 'error',
              'import-x/no-webpack-loader-syntax': 'error',
              'import-x/order': [
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
                    ...sure(
                      scope,
                      (s) => [
                        ...['lib', 'eslint', ''].map((subpath) => ({
                          pattern: `${s}${subpath}*`,
                          group: 'internal',
                          position: 'after',
                        })),
                      ],
                      [],
                    ),
                  ],
                  'alphabetize': { order: 'asc' },
                  'distinctGroup': true,
                  'newlines-between': 'always',
                  'newlines-between-types': 'always',
                  'pathGroupsExcludedImportTypes': ['builtin'],
                  'sortTypesGroup': true,
                },
              ],
            },
          },
        ],
      }),
    ];
  };
