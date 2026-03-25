import type { ESLint } from 'eslint';

import type { ConfigFactoryCreate } from '@budsbox/eslint';

import type { ImportConfigFactoryOptions } from '#types';

import importX from 'eslint-plugin-import-x';
import perfectionist from 'eslint-plugin-perfectionist';

import { sure } from '@budsbox/lib-es/logical';
import { parsePackageName } from '@budsbox/lib-es/string';
import { prependDot, queryJsExtensions } from '@budsbox/lib-extensions';

/**
 * Creates a `ConfigFactory` function which provides ESLint configuration for the plugin `eslint-plugin-import-x`,
 * also other imports-related configurations.
 *
 * @param param - options to configure the resulted factory function.
 * @returns A `ConfigFactory` function.
 */
export const createImportConfigFactory: ConfigFactoryCreate<
  ImportConfigFactoryOptions
> =
  ({ scopeSubgroupsPrefixes = ['lib', 'eslint'] } = {}) =>
  ({ createConfig, matchIncludes, packageJson, sourceType }) => {
    const extensions = queryJsExtensions({
      jsx: true,
      sourceType: 'module',
    }).map(prependDot);
    const files = matchIncludes({
      jsx: true,
      sourceType,
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
              'import-x/internal-regex': `^(?:#|${scope ?? '[]'})`,
              'import-x/parsers': {
                '@typescript-eslint/parser': extensions,
              },
              'import-x/resolver': {
                typescript: extensions,
              },
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
            plugins: {
              perfectionist,
            },
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
                  'alphabetize': { order: 'asc' },
                  'distinctGroup': true,
                  'groups': [
                    'type',
                    'builtin',
                    'external',
                    'internal',
                    'parent',
                    ['sibling', 'index'],
                  ],
                  'newlines-between': 'always',
                  'newlines-between-types': 'always',
                  'pathGroups': [
                    ...sure(
                      scope,
                      (s) => [
                        ...scopeSubgroupsPrefixes.toSorted().map((prefix) => ({
                          pattern: `${s}{${prefix}*,${prefix}*/**}`,
                          group: 'internal',
                          position: 'before',
                        })),
                        {
                          pattern: `${s}!{${scopeSubgroupsPrefixes.join(',')}}`,
                          group: 'internal',
                          position: 'before',
                        },
                      ],
                      [],
                    ),
                  ],
                  'pathGroupsExcludedImportTypes': ['builtin'],
                  'sortTypesGroup': true,
                  'warnOnUnassignedImports': true,
                },
              ],

              'perfectionist/sort-exports': [
                'error',
                {
                  newlinesBetween: 1,
                  groups: [
                    { commentAbove: 'Type exports', group: 'type-export' },
                    { commentAbove: 'Value exports', group: 'value-export' },
                  ],
                },
              ],
              'perfectionist/sort-named-exports': [
                'error',
                {
                  groups: ['type-export', 'value-export'],
                },
              ],
            },
          },
        ],
      }),
    ];
  };
