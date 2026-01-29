import type { ConfigFactory, ConfigFactoryCreate } from '@budsbox/eslint';

import type { JsdocConfigFactoryOptions } from '#types';

import eslintPluginJsdoc from 'eslint-plugin-jsdoc';
import { lt } from 'semver';

import { isString } from '@budsbox/lib-es/guards';
import { fif, fifs } from '@budsbox/lib-es/logical';

import { contextsRequireDescription, contextsRequireParam } from '#const';

/**
 * Creates a {@link ConfigFactory `ConfigFactory`} function which provides ESLint configuration for the plugin `eslint-plugin-jsdoc`.
 *
 * @param options - {@link JsdocConfigFactoryOptions Configuration options} for the factory.
 * @returns A `ConfigFactory` function.
 */
export const createJsdocConfigFactory: ConfigFactoryCreate<
  JsdocConfigFactoryOptions
> =
  ({ optionalTillVersion = '0.1.0', docTool = 'typedoc' } = {}) =>
  ({ createConfig, matchIncludes, packageJson }) => {
    const inDev = fif(
      optionalTillVersion,
      isString,
      (version) => lt(packageJson.version ?? '0.0.0', version),
      Boolean,
    );

    const requireJsdocOptions = {
      publicOnly: true,
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
      inlineTags: [
        'link',
        'linkcode',
        'linkplain',
        'tutorial',
        'inheritdoc',
        'label',
      ],
    } as const;

    const typedocCheckTagNamesOptions = {
      ...checkTagNamesOptions,
      definedTags: [
        ...checkTagNamesOptions.definedTags,
        'author',
        'document',
        'license',

        'category',
        'categoryDescription',
        'showCategories',
        'hideCategories',

        'group',
        'groupDescription',
        'showGroups',
        'hideGroups',
        'disableGroups',

        'include',
        'includeCode',

        'inline',
        'inlineType',
        'preventInline',

        'expand',
        'expandType',
        'preventExpand',

        'module',
        'mergeModuleWith',

        'primaryExport',
        'sortStrategy',
        'useDeclaredType',
      ],
      inlineTags: [
        ...checkTagNamesOptions.inlineTags,
        'include',
        'includeCode',
        'license',
      ],
    };

    return [
      createConfig({
        name: 'jsdoc/basic',
        level: 'basic',
        modifies: ['core'],
        configs: [
          {
            name: 'plugin',
            files: matchIncludes({ jsx: true }),
            plugins: {
              jsdoc: eslintPluginJsdoc,
            },
          },
          fifs(docTool === 'typedoc', () => ({
            name: 'typedoc',
            files: matchIncludes({ jsx: true }),
            rules: {
              'jsdoc/check-tag-names': [
                'error',
                { ...typedocCheckTagNamesOptions },
              ],
            },
          })),
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

      fifs(inDev, () =>
        createConfig({
          name: 'jsdoc/strict',
          level: 'strict',
          modifies: ['jsdoc/basic', 'jsdoc/recommended'],
          configs: [
            {
              name: 'ts',
              files: matchIncludes({ lang: 'ts', jsx: true }),
              rules: {
                ...eslintPluginJsdoc.configs[
                  'flat/recommended-typescript-error'
                ].rules,
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
      ),

      createConfig({
        name: 'jsdoc/opinionated',
        modifies: ['jsdoc/basic', 'jsdoc/recommended', 'jsdoc/strict'],
        configs: [
          {
            name: 'all',
            files: matchIncludes({ jsx: true }),
            settings: {
              jsdoc: {
                tagNamePreference: {
                  default: 'defaultValue',
                  event: 'eventProperty',
                  hidden: 'ignore',
                  inheritdoc: 'inheritDoc',
                  template: 'typeParam',
                },
              },
            },

            rules: {
              'jsdoc/check-tag-names': ['error', { ...checkTagNamesOptions }],
              'jsdoc/informative-docs': 'error',
              'jsdoc/lines-before-block': 'error',
              'jsdoc/multiline-blocks': [
                'error',
                {
                  noSingleLineBlocks: true,
                  singleLineTags: ['inheritdoc', 'type'],
                },
              ],
              'jsdoc/no-bad-blocks': 'error',
              'jsdoc/require-asterisk-prefix': 'error',
              'jsdoc/require-description': [
                'error',
                {
                  contexts: [...contextsRequireDescription],
                  exemptedBy: ['type', 'inheritdoc'],
                },
              ],
              'jsdoc/require-hyphen-before-param-description': [
                'error',
                'always',
                { tags: { property: 'always', typeParam: 'always' } },
              ],
              'jsdoc/require-jsdoc': [
                inDev ? 'off' : 'error',
                requireJsdocOptions,
              ],
              'jsdoc/require-param': ['error', { ...requireParamOptions }],
              'jsdoc/require-throws': 'error',
              'jsdoc/require-throws-description': 'error',
              'jsdoc/sort-tags': 'error',
              'jsdoc/tag-lines': ['error', 'never', { startLines: 1 }],
            },
          },

          {
            name: 'ts',
            files: matchIncludes({ lang: 'ts', jsx: true }),
            rules: {
              'jsdoc/check-param-names': [
                'error',
                { checkDestructured: false },
              ],
              'jsdoc/check-tag-names': [
                'error',
                { ...checkTagNamesOptions, typed: true },
              ],
              'jsdoc/require-jsdoc': [
                inDev ? 'off' : 'error',
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
              'jsdoc/require-template': [
                'error',
                { requireSeparateTemplates: true },
              ],
            },
          },
          fifs(docTool === 'typedoc', () => ({
            name: 'typedoc',
            files: matchIncludes({ lang: 'ts', jsx: true }),
            settings: {
              jsdoc: {
                tagNamePreference: {
                  abstract: false,
                  access: false,
                  augments: false,
                  callback: false,
                  class: false,
                  constant: false,
                  constructs: false,
                  enum: 'enum',
                  export: false,
                  exports: false,
                  function: false,
                  global: false,
                  implements: false,
                  inherits: false,
                  instance: false,
                  // it's intentional, as typedoc infers a "full" type of type alias when `@interface` presented
                  interface: 'interface',
                  member: false,
                  memberOf: false,
                  memberof: false,
                  method: false,
                  mixes: false,
                  mixin: false,
                  module: false,
                  name: false,
                  // can be used to tell TypeDoc to convert a variable as a namespace
                  namespace: 'namespace',
                  override: false,
                  // when using typedoc, `module` preferred as it matches with `@mergeModuleWith`
                  packageDocumentation: 'module',
                  private: false,
                  property: false,
                  protected: false,
                  public: false,
                  readonly: false,
                  requires: false,
                  static: false,
                  this: false,
                  type: false,
                  typedef: false,
                },
              },
            },
            rules: {
              'jsdoc/check-tag-names': [
                'error',
                {
                  ...typedocCheckTagNamesOptions,
                  typed: false,
                },
              ],
              // typedoc allows non-empty `@inheritDoc`, and there's no way to configure the rule to exclude the tag
              'jsdoc/empty-tags': 'off',
              // doesnt support {@link ErrorType} syntax
              'jsdoc/require-throws-type': 'off',
            },
          })),
        ],
      }),
    ];
  };
