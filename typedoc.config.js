/// <reference types="./typedoc-plugins.d.ts" />

import { load as loadImportTarget } from 'typedoc-plugin-import-target';
import { load as loadDtLinks } from 'typedoc-plugin-dt-links';
import { load as loadMdnLinks } from 'typedoc-plugin-mdn-links';
import { load as loadGithubTheme } from 'typedoc-github-theme';

import { OptionDefaults } from 'typedoc';

/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
  entryPoints: ['./lib/es', './lib/types'],
  entryPointStrategy: 'packages',
  outputs: [
    {
      name: 'html',
      path: './docs',
    },
  ],
  navigation: {
    includeCategories: true,
    includeFolders: false,
  },
  plugin: [loadImportTarget, loadMdnLinks, loadDtLinks, loadGithubTheme],
  packageOptions: {
    includeVersion: true,
    blockTags: [...OptionDefaults.blockTags, '@importTarget'],
    // some strange empty category...
    excludeCategories: ['Type'],
    externalSymbolLinkMappings: {
      global: {
        TypeError:
          'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError',
      },
      typescript: {
        TypeError:
          'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypeError',
      },
    },
  },
};

export default config;
