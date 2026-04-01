import type { ESLint, Linter } from 'eslint';

import type { ConfigFactoryCreate } from '@budsbox/eslint';

import type { Awaitable } from '@budsbox/lib-types';

import type { ReactConfigFactoryOptions } from '#types';

import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';

const withRefreshPluginFactory =
  (enabled: boolean) =>
  async (
    configFactory: (
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports,@typescript-eslint/prefer-readonly-parameter-types
      refresh: (typeof import('eslint-plugin-react-refresh'))['reactRefresh'],
    ) => Awaitable<Linter.Config[]>,
  ): Promise<Linter.Config[]> => {
    if (enabled) {
      const pluginReactRefresh = await import('eslint-plugin-react-refresh');
      return await configFactory(pluginReactRefresh.reactRefresh);
    }
    return [];
  };

/**
 * A factory function to create React-specific ESLint configurations.
 *
 * This function provides several levels of configurations tailored for React applications, including support for
 * JSX runtime, React Refresh, and opinionated coding standards. It dynamically combines and extends configurations
 * for various use cases such as basic React rules, recommended practices, and opinionated rules.
 *
 * The configuration supports optional React Refresh and can detect `jsx` options from the provided TypeScript
 * configuration. The resulting rules adapt based on whether the `react-jsx` runtime is in use.
 *
 * @param options - Configuration options for the factory.
 * @param options.enableRefreshPlugin - A boolean to enable or disable React Refresh plugin integration.
 * @param options.linkComponents - An array of custom link components to detect for accessibility checks.
 * @returns A promise that resolves to an array of ESLint configurations for React projects, including plugins,
 *          rules, and parsing options.
 */
export const createReactConfigFactory: ConfigFactoryCreate<
  ReactConfigFactoryOptions
> =
  ({ enableRefreshPlugin = false, linkComponents = [] } = {}) =>
  async ({ createConfig, matchIncludes, tsconfig }) => {
    const isJsxRuntime = /^react-jsx(?:dev)?$/.test(
      tsconfig.compilerOptions?.jsx ?? '',
    );
    const withRefreshPlugin = withRefreshPluginFactory(enableRefreshPlugin);

    return [
      createConfig({
        name: 'react/basic',
        level: 'basic',
        modifies: ['core'],
        configs: [
          {
            name: 'main',

            files: matchIncludes({ jsx: true }),
            languageOptions: {
              parserOptions: {
                ecmaFeatures: { jsx: true },
              },
            },
            plugins: {
              'react': eslintPluginReact,
              'react-hooks': eslintPluginReactHooks as ESLint.Plugin,
            },
            settings: {
              react: {
                version: 'detect',
                linkComponents,
              },
            },
          },
          ...(await withRefreshPlugin((eslintPluginReactRefresh) => [
            {
              name: 'refresh',
              files: matchIncludes({ jsx: true }),
              plugins: {
                'react-refresh':
                  eslintPluginReactRefresh.plugin as ESLint.Plugin,
              },
            },
          ])),
        ],
      }),

      ...(isJsxRuntime ?
        [
          createConfig({
            name: 'react/jsx-runtime',
            level: 'basic',
            modifies: ['react/basic', 'react/recommended', 'react/opinionated'],
            configs: [
              {
                files: matchIncludes({ jsx: true }),
                languageOptions: {
                  parserOptions: {
                    jsxPragma: null,
                  },
                },
                rules: {
                  ...eslintPluginReact.configs['jsx-runtime'].rules,
                },
              },
            ],
          }),
        ]
      : []),

      createConfig({
        name: 'react/recommended',
        level: 'recommended',
        modifies: ['react/basic'],
        configs: [
          {
            name: 'main',
            files: matchIncludes({ jsx: true }),
            rules: {
              ...eslintPluginReact.configs.recommended.rules,
              ...eslintPluginReactHooks.configs.recommended.rules,
            },
          },
          ...(await withRefreshPlugin((eslintPluginReactRefresh) => [
            {
              name: 'refresh',
              files: matchIncludes({ jsx: true }),
              rules: {
                ...eslintPluginReactRefresh.configs.recommended().rules,
              },
            },
          ])),
        ],
      }),

      createConfig({
        name: 'react/opinionated',
        modifies: ['react/basic', 'react/recommended'],
        configs: [
          {
            name: 'main',
            files: matchIncludes({ jsx: true }),
            rules: {
              'react/boolean-prop-naming': 'error',
              'react/button-has-type': 'error',
              'react/destructuring-assignment': 'error',
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
              'react/no-unstable-nested-components': 'error',
              'react/prop-types': 'off',
              'react/void-dom-elements-no-children': 'error',

              'react-hooks/exhaustive-deps': 'error',
            },
          },
          ...(await withRefreshPlugin((eslintPluginReactRefresh) => [
            {
              name: 'refresh',
              files: matchIncludes({ jsx: true }),
              rules: {
                ...eslintPluginReactRefresh.configs.vite().rules,
              },
            },
          ])),
        ],
      }),
    ];
  };
