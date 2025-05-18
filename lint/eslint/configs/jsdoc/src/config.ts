import type { ConfigFactoryCreate } from '@budsbox/eslint';

import eslintPluginJsdoc from 'eslint-plugin-jsdoc';

import { contextsRequireDescription, contextsRequireParam } from '#const';

/**
 * Creates a `ConfigFactory` function which provides ESLint configuration for the plugin `eslint-plugin-jsdoc`.
 *
 * @returns A `ConfigFactory` function.
 */
export const createJsdocConfigFactory: ConfigFactoryCreate =
  () =>
  ({ createConfig, matchIncludes }) => {
    const requireJsdocOptions = {
      contexts: [...contextsRequireDescription],
      require: {
        ArrowFunctionExpression: true,
        ClassDeclaration: true,
        FunctionDeclaration: true,
        FunctionExpression: true,
        MethodDefinition: true,
      },
    } as const;

    const requireParamOptions = {
      unnamedRootBase: ['param'],
      contexts: [...contextsRequireParam],
    };

    const checkTagNamesOptions = {
      definedTags: ['remarks', 'privateRemarks'],
    };

    return [
      createConfig({
        name: 'jsdoc/basic',
        level: 'basic',
        modifies: ['core'],
        configs: [
          {
            files: matchIncludes({ jsx: true }),
            plugins: {
              jsdoc: eslintPluginJsdoc,
            },
          },
        ],
      }),

      createConfig({
        name: 'jsdoc/recommended',
        level: 'recommended',
        modifies: ['jsdoc/basic'],
        configs: [
          {
            name: 'ts',
            files: matchIncludes({ lang: 'ts', jsx: true }),
            rules: {
              ...eslintPluginJsdoc.configs['flat/recommended-typescript'].rules,
            },
          },
          {
            name: 'js',
            files: matchIncludes({ lang: 'js', jsx: true }),
            rules: {
              ...eslintPluginJsdoc.configs['flat/recommended-typescript-flavor']
                .rules,
            },
          },
        ],
      }),

      createConfig({
        name: 'jsdoc/strict',
        level: 'strict',
        modifies: ['jsdoc/basic', 'jsdoc/recommended'],
        configs: [
          {
            name: 'ts',
            files: matchIncludes({ lang: 'ts', jsx: true }),
            rules: {
              ...eslintPluginJsdoc.configs['flat/recommended-typescript-error']
                .rules,
            },
          },
          {
            name: 'js',
            files: matchIncludes({ lang: 'js', jsx: true }),
            rules: {
              ...eslintPluginJsdoc.configs[
                'flat/recommended-typescript-flavor-error'
              ].rules,
            },
          },
        ],
      }),

      createConfig({
        name: 'jsdoc/opinionated',
        modifies: ['jsdoc/basic', 'jsdoc/recommended', 'jsdoc/strict'],
        configs: [
          {
            name: 'all',
            files: matchIncludes({ jsx: true }),
            rules: {
              'jsdoc/informative-docs': 'error',
              'jsdoc/check-tag-names': [
                'error',
                {
                  ...checkTagNamesOptions,
                },
              ],
              'jsdoc/multiline-blocks': [
                'error',
                {
                  noSingleLineBlocks: true,
                },
              ],
              'jsdoc/no-bad-blocks': 'error',
              'jsdoc/require-asterisk-prefix': 'error',
              'jsdoc/require-description': [
                'error',
                {
                  contexts: [...contextsRequireDescription],
                },
              ],
              'jsdoc/require-hyphen-before-param-description': [
                'error',
                'always',
                { tags: { property: 'always', typeParam: 'always' } },
              ],
              'jsdoc/require-jsdoc': ['error', requireJsdocOptions],
              'jsdoc/require-param': ['error', { ...requireParamOptions }],
              'jsdoc/tag-lines': ['error', 'never', { startLines: 1 }],
            },
          },

          {
            name: 'ts',
            files: matchIncludes({ lang: 'ts', jsx: true }),
            settings: {
              jsdoc: {
                tagNamePreference: {
                  template: 'typeParam',
                },
              },
            },
            rules: {
              'jsdoc/check-param-names': [
                'error',
                { checkDestructured: false },
              ],
              'jsdoc/check-tag-names': [
                'error',
                {
                  ...checkTagNamesOptions,
                  typed: true,
                },
              ],
              'jsdoc/require-jsdoc': [
                'error',
                {
                  ...requireJsdocOptions,
                  require: {
                    ...requireJsdocOptions.require,
                    FunctionDeclaration: false,
                  },
                },
              ],
              'jsdoc/require-param': [
                'error',
                {
                  ...requireParamOptions,
                  checkDestructured: false,
                },
              ],
              'jsdoc/require-param-name': 'off',
            },
          },
          {
            name: 'js',
            files: matchIncludes({ lang: 'js', jsx: true }),
            rules: {
              'jsdoc/require-description': [
                'error',
                { exemptedBy: ['type', 'inheritdoc'] },
              ],
            },
          },
        ],
      }),
    ];
  };
