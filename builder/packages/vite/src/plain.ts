import type { PackageJson } from 'type-fest';

import { availableParallelism } from 'node:os';
import { env } from 'node:process';

import { NodePackageImporter } from 'sass-embedded';
import { defaultClientConditions } from 'vite';
import richSvg, { type PluginOptions } from 'vite-plugin-react-rich-svg';

import { isNotNil } from '@budsbox/lib-es/guards';
import { fifs } from '@budsbox/lib-es/logical';
import { parsePackageName } from '@budsbox/lib-es/string';
import { findCurrentPackageJson } from '@budsbox/lib-node/pckg';

import packageJson from '#package.json' with { type: 'json' };

import {
  createConfigFactory,
  formatFileName,
  formatVarName,
  generateScopedNameFactory,
} from './lib.js';

/**
 * Extended configuration options for the `vite-plugin-react-rich-svg` plugin.
 *
 * @see https://github.com/iGoodie/vite-plugin-react-rich-svg?tab=readme-ov-file#plugin-configurations
 */
export interface CustomReactRichSvgOptions extends PluginOptions {
  /**
   * Enables/disables SVGO optimization for the whole plugin.
   * Defaults to `true` when `NODE_ENV` is `production`. May be overridden by sub-options (like `rawLoaderOptions.svgoEnabled`).
   */
  svgoEnabled?: boolean;

  /**
   * Default SVGO configuration for the whole plugin.
   */
  svgoConfig?: NonNullable<PluginOptions['rawLoaderOptions']>['svgoConfig'];
}

/**
 * Represents configuration options for plain configurations.
 */
export interface PlainConfigOptions {
  /**
   * The `import.meta` object.
   */
  importMeta?: ImportMeta;

  /**
   * Whether the configuration is for a library.
   */
  lib?: boolean;

  /**
   * An array of strings representing the chunks to exclude from the path part when generating scoped names for CSS modules.
   */
  generateScopedNameExcludedPathChunks?: readonly string[];

  /**
   * Whether to add the scope of the package to the conditions for module `exports` resolution.
   */
  addScopeToConditions?: boolean;

  /**
   * Options for the `vite-plugin-react-rich-svg` plugin.
   */
  reactRichSvgOptions?: CustomReactRichSvgOptions;
}

export const usePlainConfig = createConfigFactory<PlainConfigOptions>(
  async (
    { mode },
    {
      importMeta,
      lib = false,
      generateScopedNameExcludedPathChunks,
      addScopeToConditions = false,
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      reactRichSvgOptions = {} as CustomReactRichSvgOptions,
    } = {},
  ) => {
    const basePackage = await findCurrentPackageJson(importMeta);
    const { scope: baseScope } = parsePackageName(
      basePackage.json.name ?? 'anon',
      true,
    );

    const clientConditions =
      (
        (addScopeToConditions ||
          // enabled by default in this monorepo
          sameScope(packageJson, basePackage.json)) &&
        isNotNil(baseScope)
      ) ?
        [baseScope, ...defaultClientConditions]
      : [...defaultClientConditions];

    const svgoEnabled =
      reactRichSvgOptions.svgoEnabled ?? env.NODE_ENV === 'production';
    const svgoConfig = reactRichSvgOptions.svgoConfig ?? {};

    return {
      plugins: [
        richSvg({
          ...reactRichSvgOptions,
          base64LoaderOptions: {
            svgoEnabled,
            svgoConfig,
            ...reactRichSvgOptions.base64LoaderOptions,
          },
          componentLoaderOptions: {
            ...reactRichSvgOptions.componentLoaderOptions,
            svgrConfig: {
              svgo: svgoEnabled,
              svgoConfig,
              ...reactRichSvgOptions.componentLoaderOptions?.svgrConfig,
            },
          },
          rawLoaderOptions: {
            svgoEnabled,
            svgoConfig,
            ...reactRichSvgOptions.rawLoaderOptions,
          },
          urlLoaderOptions: {
            svgoEnabled,
            svgoConfig,
            ...reactRichSvgOptions.urlLoaderOptions,
          },
        }),
      ],
      resolve: {
        conditions: clientConditions,
      },
      root: 'src',

      build: {
        outDir: '../dist',
        emptyOutDir: true,
        cssMinify: 'lightningcss',

        ...fifs(lib, {
          lib: {
            entry: 'index.ts',
            name: formatVarName(basePackage.json.name ?? '_anon_'),
            fileName: formatFileName,
            cssFileName: 'index',
          },
        }),
      },
      css: {
        modules: {
          localsConvention: 'camelCaseOnly',
          generateScopedName:
            mode === 'production' ? '[hash:hex]' : (
              generateScopedNameFactory(
                basePackage,
                generateScopedNameExcludedPathChunks,
              )
            ),
        } as const,
        preprocessorMaxWorkers: Math.ceil(availableParallelism() / 2),
        preprocessorOptions: {
          scss: {
            importers: [new NodePackageImporter()],
          },
        },
      },
    };
  },
);

const sameScope = (
  p1: Readonly<Pick<PackageJson, 'name'>>,
  p2: Readonly<Pick<PackageJson, 'name'>>,
): boolean =>
  parsePackageName(p1.name ?? '', true).scope ===
  parsePackageName(p2.name ?? '', true).scope;
