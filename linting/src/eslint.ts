import type {
  Def,
  EmptyRecord,
  Infer,
  Key,
  OmitNeverProps,
  RequiredKeys,
  Value,
} from '@budsbox/types';

import type { ESLint, Linter } from 'eslint';

import eslint from '@eslint/js';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import * as eslintTs from 'typescript-eslint';

import { type MatchOptions, match, queryExtensions } from '#match';

const configFactories = {
  common: (options: ConfigFactoryDefaultOptions): Linter.FlatConfig[] => {
    const { ecmaVersion, sourceType, ...restOptions } = options;

    return [
      {
        name: '@budsbox/linting/common',

        files: match({
          ...restOptions, // to exclude sourceType
          lang: 'all',

          jsx: true,
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
        name: '@budsbox/linting/common/commonjs',

        files: match({
          ...options,
          lang: 'all',

          jsx: true,
          targetSourceType: 'commonjs',
        }),

        languageOptions: { sourceType: 'commonjs' },
      },

      {
        name: '@budsbox/linting/common/esm',

        files: match({
          ...options,
          lang: 'all',

          jsx: true,
          targetSourceType: 'module',
        }),
        languageOptions: { sourceType: 'module' },
      },
    ];
  },

  node: (options: ConfigFactoryDefaultOptions): Linter.FlatConfig[] => [
    {
      name: '@budsbox/linting/node',

      files: match({
        ...options,
        lang: 'all',
        targetSourceType: 'module',
      }),
      languageOptions: { globals: { ...globals.nodeBuiltin } },
    },
    {
      name: '@budsbox/linting/node/commonJs',

      files: match({
        ...options,
        lang: 'all',
        targetSourceType: 'commonjs',
      }),
      languageOptions: { globals: { ...globals.node } },
    },
  ],

  import: (options: ConfigFactoryDefaultOptions): Linter.FlatConfig[] => {
    const configBaseName = '@budsbox/linting/import';
    const extensions = queryExtensions({
      ...options,
      lang: 'all',

      jsx: true,
      targetSourceType: 'module',
    }).map((ext) => `.${ext}`);

    return [
      {
        name: configBaseName,

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
        name: `${configBaseName}/ts`,

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

  client: (options: ConfigFactoryDefaultOptions): Linter.FlatConfig[] => [
    {
      name: '@budsbox/linting/client',

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

  ts: (options: ConfigFactoryDefaultOptions): Linter.FlatConfig[] => [
    {
      ...eslintTs.configs.base,
      name: '@budsbox/linting/ts',

      files: match({
        ...options,
        lang: 'ts',

        jsx: true,
      }),
      languageOptions: {
        sourceType: options.sourceType,

        parser: eslintTs.parser as Linter.FlatConfigParserModule,
        parserOptions: {
          EXPERIMENTAL_useProjectService: true,
        },
      },
      plugins: {
        '@typescript-eslint': eslintTs.plugin as ESLint.Plugin,
      },

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
} as const;

type ConfigFactoryMap = typeof configFactories;

export type ConfigFactoryName = Key<ConfigFactoryMap>;

export type ConfigFactory<Name extends ConfigFactoryName = ConfigFactoryName> =
  Value<Pick<ConfigFactoryMap, Name>>;

export type ConfigFactoryOptions<
  Name extends ConfigFactoryName = ConfigFactoryName,
> = Infer<Parameters<ConfigFactory<Name>>[0]>;

export type ConfigFactoryUncommonOptions<
  Name extends ConfigFactoryName = ConfigFactoryName,
> = Infer<
  Readonly<Omit<ConfigFactoryOptions<Name>, Key<ConfigFactoryDefaultOptions>>>
>;

export type CreateConfigOptions<
  Name extends ConfigFactoryName = ConfigFactoryName,
> = Infer<
  Readonly<ConfigFactoryUncommonOptions<Name> & ConfigFactoryCommonOptions>
>;

export type CreateConfigNameNoRequiredOptions = Key<
  OmitNeverProps<{
    [K in ConfigFactoryName]: EmptyRecord extends CreateConfigOptions<K> ? K
    : never;
  }>
>;

export type CreateConfigNameWithDefaultOptions = Key<
  OmitNeverProps<{
    [K in ConfigFactoryName]: Required<ConfigFactoryDefaultOptions> extends (
      Required<ConfigFactoryOptions<K>>
    ) ?
      K
    : never;
  }>
>;

export type PresetOptions<Name extends ConfigFactoryName> = Infer<
  Readonly<
    ConfigFactoryCommonOptions &
      OmitNeverProps<
        {
          [K in Name & CreateConfigNameWithDefaultOptions]: never;
        } & {
          [K in Name &
            CreateConfigNameNoRequiredOptions]?: ConfigFactoryUncommonOptions<K>;
        } & {
          [K in Exclude<
            Name,
            CreateConfigNameNoRequiredOptions
          >]: ConfigFactoryUncommonOptions<K>;
        }
      >
  >
>;

export function createConfig<Name extends ConfigFactoryName>(
  name: Name,
  options: CreateConfigOptions<Name>,
): Linter.FlatConfig[];
export function createConfig<Name extends CreateConfigNameNoRequiredOptions>(
  name: Name,
  options?: CreateConfigOptions<Name>,
): Linter.FlatConfig[];
export function createConfig(
  name: ConfigFactoryName,
  options?: CreateConfigOptions,
): Linter.FlatConfig[] {
  return configFactories[name]({
    ...configFactoryDefaultOptions,
    ...options,
  }).filter((config) => {
    if (Array.isArray(config.files)) {
      return config.files.length > 0;
    }

    return Object.keys(config).length === 1 && Object.hasOwn(config, 'ignores');
  });
}

function createConfigFromPresetOptions<Name extends ConfigFactoryName>(
  name: Name,
  options: PresetOptions<Name>,
): Linter.FlatConfig[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return createConfig<Name>(name, {
    ...extractCommonOptions(options),
    //@ts-expect-error TS2536 because ts is pretty dumb inside of generic functions
    ...(Object.hasOwn(options, name) ? options[name] : null),
  });
}

function extractCommonOptions<T extends ConfigFactoryCommonOptions>(
  options: T,
): ConfigFactoryCommonOptions {
  return Object.fromEntries(
    Object.entries(options).filter(([k]) =>
      Object.hasOwn(configFactoryDefaultOptions, k),
    ),
  );
}

export const presets = {
  node({
    ecmaVersion = 2022,
    ...options
  }: PresetOptions<
    'common' | 'ts' | 'node' | 'import'
  > = {}): Linter.FlatConfig[] {
    const configs = [
      ...(['common', 'import', 'node', 'ts'] as const).flatMap((name) =>
        createConfigFromPresetOptions(name, { ...options, ecmaVersion }),
      ),
    ];

    return configs;
  },

  clientApp(
    options: PresetOptions<'common' | 'ts' | 'client' | 'import'> = {},
  ): Linter.FlatConfig[] {
    const configs = [
      ...(['common', 'import', 'ts', 'client'] as const).flatMap((name) =>
        createConfigFromPresetOptions(name, options),
      ),
    ];

    return configs;
  },
};

const configFactoryDefaultOptions = {
  dirs: ['**'],
  ecmaVersion: 2021,
  sourceType: 'module',
} as const satisfies ConfigFactoryDefaultOptions;

export const globalIgnores: Readonly<Def<Linter.FlatConfig['ignores']>> = [
  '**/dist/',
  '.husky/',
  '.idea/',
  '.pnp.*',
  '**/*.scss.d.ts',
];

// export type PresetOptions<Name extends ConfigFactoryName>
interface ConfigFactoryCommonOptions
  extends Pick<MatchOptions, 'sourceType' | 'dirs' | 'files'> {
  readonly ecmaVersion?: Def<Linter.ParserOptions['ecmaVersion']>;
}

interface ConfigFactoryDefaultOptions
  extends RequiredKeys<
    ConfigFactoryCommonOptions,
    'ecmaVersion' | 'sourceType'
  > {}
