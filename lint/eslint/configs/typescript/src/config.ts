/// <reference types="@budsbox/eslint_configs-import/types" />
import type { ESLint, Linter } from 'eslint';

import type { ConfigFactoryCreate } from '@budsbox/eslint';

import type { TypeScriptConfigFactoryOptions } from '#types';

import { dirname } from 'node:path';

import perfectionist from 'eslint-plugin-perfectionist';
import * as eslintTs from 'typescript-eslint';

import { readonlyParamAllowSpecifiers } from './const.js';

/**
 * Creates a `ConfigFactory` function which provides ESLint configuration for the plugin `typescript-eslint`.
 *
 * @param options - Optional configuration options.
 * @returns A `ConfigFactory` function.
 */
export const createTypescriptConfigFactory: ConfigFactoryCreate<
  TypeScriptConfigFactoryOptions
> =
  (options = {}) =>
  ({ createConfig, matchIncludes, sourceType, tsconfigPath }) => {
    return [
      createConfig({
        name: 'typescript/basic',
        level: 'basic',
        configs: [
          {
            files: matchIncludes({ jsx: true }),
            languageOptions: {
              parser: eslintTs.parser as Linter.Parser,
              parserOptions: {
                projectService: true,
                tsconfigRootDir: dirname(tsconfigPath),
              },
            },
            plugins: {
              '@typescript-eslint': eslintTs.plugin as ESLint.Plugin,
            },
          },
        ],
      }),

      createConfig({
        name: 'typescript/recommended',
        level: 'recommended',
        modifies: ['typescript/basic'],
        configs: [
          {
            files: matchIncludes({ jsx: true }),
            rules:
              eslintTs.configs.recommendedTypeChecked.reduce<Linter.RulesRecord>(
                (acc, { rules }) => ({
                  ...acc,
                  ...((rules ?? {}) as Linter.RulesRecord),
                }),
                {},
              ),
          },
        ],
      }),

      createConfig({
        name: 'typescript/strict',
        level: 'strict',
        modifies: ['typescript/recommended'],
        configs: [
          {
            files: matchIncludes({ jsx: true }),
            rules:
              eslintTs.configs.strictTypeChecked.reduce<Linter.RulesRecord>(
                (acc, { rules }) => ({
                  ...acc,
                  ...((rules ?? {}) as Linter.RulesRecord),
                }),
                {},
              ),
          },
        ],
      }),

      createConfig({
        name: 'typescript/opinionated',
        modifies: [
          'typescript/strict',
          'builtin/basic',
          'builtin/strict',
          'builtin/recommended',
          'builtin/opinionated',
        ],
        configs: [
          {
            files: matchIncludes({ jsx: true }),
            plugins: {
              perfectionist,
            },
            rules: {
              'no-undef': ['off'],

              '@typescript-eslint/array-type': [
                'error',
                { default: 'array-simple' },
              ],
              '@typescript-eslint/ban-ts-comment': [
                'error',
                {
                  'ts-expect-error': {
                    descriptionFormat: '^: TS\\d+ because .+$',
                  },
                },
              ],
              '@typescript-eslint/consistent-type-assertions': [
                'error',
                { assertionStyle: 'as', objectLiteralTypeAssertions: 'never' },
              ],
              '@typescript-eslint/consistent-type-definitions': [
                'error',
                'interface',
              ],
              '@typescript-eslint/consistent-type-imports': [
                'error',
                { fixStyle: 'inline-type-imports' },
              ],
              '@typescript-eslint/explicit-function-return-type': [
                'error',
                {
                  allowConciseArrowFunctionExpressionsStartingWithVoid: true,
                  allowExpressions: true,
                },
              ],
              '@typescript-eslint/explicit-member-accessibility': 'error',
              '@typescript-eslint/explicit-module-boundary-types': 'error',
              '@typescript-eslint/method-signature-style': 'error',
              '@typescript-eslint/no-confusing-void-expression': [
                'error',
                { ignoreVoidOperator: true },
              ],
              '@typescript-eslint/no-empty-object-type': [
                'error',
                { allowInterfaces: 'with-single-extends' },
              ],
              '@typescript-eslint/no-import-type-side-effects': 'error',
              '@typescript-eslint/no-invalid-void-type': [
                'error',
                {
                  allowAsThisParameter: true,
                  allowInGenericTypeArguments: true,
                },
              ],
              '@typescript-eslint/no-meaningless-void-operator': 'off',
              '@typescript-eslint/no-misused-promises': [
                'error',
                {
                  checksVoidReturn: {
                    attributes: false,
                  },
                },
              ],
              '@typescript-eslint/no-non-null-assertion': 'warn',
              '@typescript-eslint/no-shadow': 'error',
              '@typescript-eslint/no-unused-vars': 'off',
              '@typescript-eslint/non-nullable-type-assertion-style': 'error',
              '@typescript-eslint/prefer-function-type': 'error',
              '@typescript-eslint/prefer-nullish-coalescing': 'error',
              '@typescript-eslint/prefer-optional-chain': 'error',
              '@typescript-eslint/prefer-readonly-parameter-types': [
                'warn',
                {
                  ignoreInferredTypes: true,
                  treatMethodsAsReadonly: true,
                  allow: [
                    ...readonlyParamAllowSpecifiers,
                    ...(options['prefer-readonly-parameter-types.allow'] ?? []),
                  ],
                },
              ],
              '@typescript-eslint/prefer-regexp-exec': 'error',
              '@typescript-eslint/require-array-sort-compare': 'error',
              '@typescript-eslint/return-await': ['error', 'always'],
              '@typescript-eslint/strict-boolean-expressions': 'error',
              '@typescript-eslint/switch-exhaustiveness-check': [
                'error',
                { requireDefaultForNonUnion: true },
              ],
              '@typescript-eslint/unified-signatures': [
                'error',
                { ignoreDifferentlyNamedParameters: true },
              ],

              'perfectionist/sort-enums': [
                'error',
                {
                  type: 'natural',

                  fallbackSort: { type: 'line-length', order: 'asc' },
                  ignoreCase: false,
                  partitionByComment: true,
                  partitionByNewLine: true,
                },
              ],
              'perfectionist/sort-heritage-clauses': [
                'error',
                {
                  type: 'natural',

                  fallbackSort: { type: 'line-length', order: 'asc' },
                  ignoreCase: false,
                },
              ],
              'perfectionist/sort-interfaces': [
                'error',
                {
                  ignoreCase: false,
                  type: 'natural',

                  customGroups: [
                    ...['required', 'optional'].map((modifier) => ({
                      groupName: 'callbacks',
                      type: 'natural',
                      newlinesInside: 0,
                      anyOf: ['method', 'member', 'property'].map(
                        (selector) => ({
                          selector,
                          modifiers: [modifier],
                          elementNamePattern: 'on[A-Z0-9]',
                        }),
                      ),
                    })),
                  ],
                  groups: [
                    ['required-index-signature', 'optional-index-signature'],
                    ['required-property', 'required-member'],
                    ['required-method'],
                    { newlinesBetween: 1 },
                    ['optional-property', 'optional-member'],
                    ['optional-method'],
                    { newlinesBetween: 1 },
                    ['callbacks'],
                  ],
                },
              ],
              'perfectionist/sort-union-types': [
                'error',
                {
                  type: 'natural',

                  fallbackSort: { type: 'line-length', order: 'asc' },
                  groups: [
                    'conditional',
                    'literal',
                    'keyword',
                    'operator',
                    ['named', 'import'],
                    'tuple',
                    'intersection',
                    'union',
                    'object',
                    'function',
                    'unknown',
                    'nullish',
                  ],
                  ignoreCase: false,
                  partitionByComment: true,
                  partitionByNewLine: true,
                },
              ],
            },
          },
        ],
      }),

      createConfig({
        name: 'typescript/commonjs',
        level: 'recommended',
        modifies: ['typescript/recommended', 'typescript/strict'],
        configs: [
          {
            files: matchIncludes({
              sourceType,
              targetSourceType: 'commonjs',
            }),
            rules: {
              '@typescript-eslint/no-require-imports': 'off',
            },
          },
        ],
      }),

      createConfig({
        name: 'typescript/js',
        level: 'recommended',
        modifies: [
          'typescript/recommended',
          'typescript/strict',
          'typescript/opinionated',
        ],
        configs: [
          {
            files: matchIncludes({ lang: 'js', jsx: true }),
            rules: {
              '@typescript-eslint/explicit-module-boundary-types': 'off',
            },
          },
        ],
      }),

      createConfig({
        name: 'typescript/import',
        level: 'recommended',
        modifies: ['import/recommended', 'import/opinionated'],
        configs: [
          {
            files: matchIncludes({ jsx: true }),
            rules: {
              // https://typescript-eslint.io/troubleshooting/typed-linting/performance#eslint-plugin-import
              'import-x/default': 'off',
              'import-x/namespace': 'off',
              'import-x/no-named-as-default-member': 'off',
              'import-x/no-unresolved': 'off',
            },
          },
        ],
      }),
    ];
  };
