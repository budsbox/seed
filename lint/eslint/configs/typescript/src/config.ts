/// <reference types="@budsbox/eslint~configs-import/types" />
import type { ESLint, Linter } from 'eslint';

import type { ConfigFactoryCreate } from '@budsbox/eslint';


import * as eslintTs from 'typescript-eslint';

import { readonlyParamAllowSpecifiers } from './const.js';

export const createTypescriptConfigFactory: ConfigFactoryCreate =
  () =>
  ({ createConfig, matchIncludes }) => {
    return [
      createConfig({
        name: 'typescript/basic',
        level: 'basic',
        configs: [
          {
            files: matchIncludes({
              lang: 'ts',
              jsx: true,
              sourceType: undefined,
            }),
            languageOptions: {
              parser: eslintTs.parser as Linter.Parser,
              parserOptions: {
                projectService: true,
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
        configs: [
          {
            files: matchIncludes({
              lang: 'ts',
              jsx: true,
              sourceType: undefined,
            }),
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
            files: matchIncludes({
              lang: 'ts',
              jsx: true,
              sourceType: undefined,
            }),
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
        modifies: ['typescript/strict'],
        configs: [
          {
            files: matchIncludes({
              lang: 'ts',
              jsx: true,
              sourceType: undefined,
            }),
            rules: {
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
              '@typescript-eslint/prefer-nullish-coalescing': 'error',
              '@typescript-eslint/prefer-optional-chain': 'error',
              '@typescript-eslint/prefer-regexp-exec': 'error',
              '@typescript-eslint/prefer-readonly-parameter-types': [
                'warn',
                {
                  ignoreInferredTypes: true,
                  allow: [...readonlyParamAllowSpecifiers],
                },
              ],
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
              lang: 'ts',
              targetSourceType: 'commonjs',
            }),
            rules: {
              '@typescript-eslint/no-require-imports': 'off',
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
            files: matchIncludes({
              jsx: true,
              targetSourceType: 'module',
            }),
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
