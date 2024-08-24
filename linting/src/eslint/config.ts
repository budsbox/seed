import type {
  EmptyRecord,
  Infer,
  Key,
  Maybe,
  OmitNeverProps,
  Sure,
  Value,
} from '@budsbox/types';
import type { ESLint, Linter } from 'eslint';
import type { ParsedCommandLine } from 'typescript';

import eslint from '@eslint/js';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginJsdoc from 'eslint-plugin-jsdoc';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import * as eslintTs from 'typescript-eslint';

import { fifs, sure } from '@budsbox/iso-utils/logical';
import { parsePackageJsonNamespace } from '@budsbox/iso-utils/string';
import { isNil, isNotNil } from '@budsbox/iso-utils/type-guards';
import {
  extractTargetFromConfig,
  getFilesList,
  makeGlobsByDirs,
} from '@budsbox/node-utils/tsconfig';

import { type MatchOptions, match, queryExtensions } from '#match';
import packageJson from '#package.json' with { type: 'json' };

export function createConfig<Name extends FactoryName>(
  name: Name,
  options: CreateConfigOptions<Name>,
): Linter.FlatConfig[];
export function createConfig<Name extends ConfigWithoutRequiredOptionsName>(
  name: Name,
  options?: CreateConfigOptions<Name>,
): Linter.FlatConfig[];
export function createConfig<Name extends ConfigWithoutRequiredOptionsName>(
  name: Name,
  options?: CreateConfigOptions<Name>,
): Linter.FlatConfig[] {
  return config[name](normalizeOptions(options ?? {})).filter((config) => {
    if (Array.isArray(config.files)) {
      return config.files.length > 0;
    }

    // global ignores
    return Object.keys(config).length === 1 && Object.hasOwn(config, 'ignores');
  });
}

export interface CommonOptions
  extends Pick<MatchOptions, 'sourceType' | 'dirs' | 'files'> {
  readonly ecmaVersion?: Linter.ParserOptions['ecmaVersion'];
  readonly tsconfig?: Maybe<ParsedCommandLine>;
  readonly packageJson?: Maybe<{
    readonly name: string;
    readonly type?: string;
  }>;
}

export const defaultOptions: CommonOptionsNormal = {
  dirs: ['**'],
  files: [],
  ecmaVersion: 2021,
  sourceType: 'commonjs',
  tsconfig: undefined,
  packageJson: undefined,
};

const tsConfig = {
  languageOptions: {
    parser: eslintTs.parser as Linter.FlatConfigParserModule,
    parserOptions: {
      projectService: true,
    },
  },
  plugins: {
    '@typescript-eslint': eslintTs.plugin as ESLint.Plugin,
  },
} as const satisfies Pick<Linter.FlatConfig, 'languageOptions' | 'plugins'>;

const config = {
  common: ({
    ecmaVersion,
    ...restOptions
  }: CommonOptionsNormal): Linter.FlatConfig[] => {
    const configNameCommon = (...names: readonly string[]): string =>
      configName('common', ...names);

    return [
      {
        name: configNameCommon(),

        files: match({
          ...restOptions,
          lang: 'all',

          jsx: true,
          sourceType: undefined,
        }),
        languageOptions: { ecmaVersion },
        linterOptions: {
          reportUnusedDisableDirectives: 'error',
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

      {
        name: configNameCommon('commonjs'),

        files: match({
          ...restOptions,
          lang: 'all',

          jsx: true,
          targetSourceType: 'commonjs',
        }),

        languageOptions: { sourceType: 'commonjs' },
      },

      {
        name: configNameCommon('esm'),

        files: match({
          ...restOptions,
          lang: 'all',

          jsx: true,
          targetSourceType: 'module',
        }),
        languageOptions: { sourceType: 'module' },
      },

      {
        name: configNameCommon('import-attributes-workaround'),

        files: match({
          ...restOptions,
          lang: 'js',

          targetSourceType: 'module',
        }),
        ...tsConfig,
      },
    ];
  },

  node: (options: CommonOptionsNormal): Linter.FlatConfig[] => [
    {
      name: configName('node'),

      files: match({
        ...options,
        lang: 'all',
        targetSourceType: 'module',
      }),
      languageOptions: { globals: { ...globals.nodeBuiltin } },
    },
    {
      name: configName('node', 'commonJs'),

      files: match({
        ...options,
        lang: 'all',
        targetSourceType: 'commonjs',
      }),
      languageOptions: { globals: { ...globals.node } },
    },
  ],

  import: (options: CommonOptionsNormal): Linter.FlatConfig[] => {
    const configNameImport = (...names: readonly string[]): string =>
      configName('import', ...names);
    const extensions = queryExtensions({
      ...options,
      lang: 'all',

      jsx: true,
      targetSourceType: 'module',
    }).map((ext) => `.${ext}`);

    return [
      {
        name: configNameImport(),

        files: match({
          ...options,
          lang: 'all',

          jsx: true,
          targetSourceType: 'module',
        }),
        plugins: { import: eslintPluginImport },
        settings: {
          'import/extensions': extensions,
          'import/external-module-folders': [
            'node_modules',
            'node_modules/@types',
          ],
          'import/parsers': {
            '@typescript-eslint/parser': extensions,
          },
          'import/resolver': {
            typescript: { alwaysTryTypes: true, project: true },
          },
        },

        rules: {
          ...eslintPluginImport.configs.recommended.rules,

          'sort-imports': ['error', { ignoreDeclarationSort: true }],

          'import/extensions': ['error', 'ignorePackages'],
          'import/first': 'error',
          'import/newline-after-import': ['error', { considerComments: true }],
          'import/no-absolute-path': 'error',
          'import/no-amd': 'error',
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

                ...sure(
                  parsePackageJsonNamespace(options.packageJson?.name ?? ''),
                  (ns) => [
                    {
                      pattern: `${ns}**/*`,

                      group: 'external',
                      position: 'after',
                    },
                  ],
                  [],
                ),
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
        name: configNameImport('ts'),

        files: match({
          ...options,
          lang: 'ts',

          jsx: true,
          targetSourceType: 'module',
        }),
        rules: {
          'import/extensions': [
            'error',
            'ignorePackages',
            queryExtensions({
              lang: 'ts',

              jsx: true,
            }).reduce<Record<string, string>>(
              (acc, ext) => ({ ...acc, [ext]: 'never' }),
              {},
            ),
          ],
        },
      },
    ];
  },

  client: (options: CommonOptionsNormal): Linter.FlatConfig[] => [
    {
      name: configName('client'),

      files: match({ ...options, jsx: true, lang: 'ts' }),

      languageOptions: {
        globals: { ...globals.browser },
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      plugins: {
        'react': eslintPluginReact,
        'react-hooks': eslintPluginReactHooks,
        'react-refresh': eslintPluginReactRefresh,
      },
      settings: { react: { linkComponents: ['Link'], version: 'detect' } },

      rules: {
        ...eslintPluginReact.configs.recommended.rules,
        ...eslintPluginReact.configs['jsx-runtime'].rules,
        ...eslintPluginReactHooks.configs.recommended.rules,

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

  ts: (options: CommonOptionsNormal): Linter.FlatConfig[] => [
    {
      ...tsConfig,
      name: configName('ts'),

      files: match({
        ...options,
        lang: 'ts',

        jsx: true,
      }),

      rules: {
        ...eslintTs.configs.strictTypeChecked.reduce<Linter.RulesRecord>(
          (acc, { rules }) => ({
            ...acc,
            ...((rules ?? {}) as Linter.RulesRecord),
          }),
          {},
        ),

        '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
        '@typescript-eslint/await-thenable': 'error',
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
          },
        ],
        '@typescript-eslint/explicit-member-accessibility': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'error',
        '@typescript-eslint/method-signature-style': 'error',
        '@typescript-eslint/no-base-to-string': 'error',
        '@typescript-eslint/no-confusing-void-expression': [
          'error',
          { ignoreVoidOperator: true },
        ],
        '@typescript-eslint/no-duplicate-enum-values': 'error',
        '@typescript-eslint/no-dynamic-delete': 'warn',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-import-type-side-effects': 'error',
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
        '@typescript-eslint/prefer-nullish-coalescing': 'error',
        '@typescript-eslint/prefer-optional-chain': 'error',
        '@typescript-eslint/prefer-readonly-parameter-types': [
          'warn',
          { ignoreInferredTypes: true },
        ],
        '@typescript-eslint/prefer-reduce-type-parameter': 'error',
        '@typescript-eslint/prefer-regexp-exec': 'error',
        '@typescript-eslint/prefer-ts-expect-error': 'error',
        '@typescript-eslint/require-array-sort-compare': 'error',
        '@typescript-eslint/strict-boolean-expressions': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/unified-signatures': 'error',
      },
    },
  ],

  jsdoc: (options: CommonOptionsNormal): Linter.FlatConfig[] => [
    {
      ...eslintPluginJsdoc.configs['flat/recommended-typescript-error'],
      name: configName('jsdoc'),

      files: match({
        ...options,
        lang: 'all',

        jsx: true,
      }),
    },
  ],
} as const;

export interface CommonOptionsNormal extends Required<CommonOptions> {
  readonly ecmaVersion: Sure<CommonOptions['ecmaVersion']>;
  readonly sourceType: Sure<CommonOptions['sourceType']>;
}

export function normalizeOptions(options: CommonOptions): CommonOptionsNormal {
  const ecmaVersion: CommonOptionsNormal['ecmaVersion'] =
    extractEcmaVersionFromOptions(options) ?? defaultOptions.ecmaVersion;

  const sourceType: CommonOptionsNormal['sourceType'] =
    options.sourceType ??
    sure(options.packageJson, ({ type }) =>
      fifs(type === 'module', 'module'),
    ) ??
    defaultOptions.sourceType;

  return {
    ...defaultOptions,
    ...options,
    ...extractFilesAndDirsFromOptions(options),
    ecmaVersion,
    sourceType,
  };
}

type FactoryMap = typeof config;

export type FactoryName = Key<FactoryMap>;

export type Factory<Name extends FactoryName = FactoryName> = Value<
  Pick<FactoryMap, Name>
>;

export type FactoryOptions<Name extends FactoryName = FactoryName> = Infer<
  Parameters<Factory<Name>>[0]
>;

export type UncommonOptions<Name extends FactoryName = FactoryName> = Infer<
  Readonly<Omit<FactoryOptions<Name>, Key<CommonOptionsNormal>>>
>;

export type CreateConfigOptions<Name extends FactoryName = FactoryName> = Infer<
  Readonly<UncommonOptions<Name> & CommonOptions>
>;

export type ConfigWithoutRequiredOptionsName = Key<
  OmitNeverProps<{
    [K in FactoryName]: EmptyRecord extends CreateConfigOptions<K> ? K : never;
  }>
>;

export type ConfigWithDefaultOptionsName = Key<
  OmitNeverProps<{
    [K in FactoryName]: Required<CommonOptionsNormal> extends (
      Required<FactoryOptions<K>>
    ) ?
      K
    : never;
  }>
>;

function configName(...name: readonly string[]): string {
  return [packageJson.name, ...name].join('/');
}

function extractEcmaVersionFromOptions({
  ecmaVersion,
  tsconfig,
}: CommonOptions): CommonOptionsNormal['ecmaVersion'] | undefined {
  if (isNotNil(ecmaVersion)) {
    return ecmaVersion;
  }

  if (isNotNil(tsconfig)) {
    const regex = /^es(\d+)$/i;
    const target = extractTargetFromConfig(tsconfig);
    if (isNil(target) || !regex.test(target)) {
      return undefined;
    }

    return parseInt(
      target.replace(regex, '$1'),
      10,
    ) as CommonOptionsNormal['ecmaVersion'];
  }

  return undefined;
}

function extractFilesAndDirsFromOptions(
  options: CommonOptions,
): Pick<CommonOptions, 'files' | 'dirs'> | undefined {
  if (isNotNil(options.files) || isNotNil(options.dirs)) {
    return {
      files: options.files ?? [],
      dirs: options.dirs ?? [],
    };
  }

  const { tsconfig } = options;
  if (isNotNil(tsconfig)) {
    const daf = {
      dirs: makeGlobsByDirs(tsconfig),
      files: getFilesList(tsconfig),
    };

    return daf;
  }

  return undefined;
}
