/// <reference types="./typedoc-plugins.d.ts" />

import { load as loadImportTarget } from 'typedoc-plugin-import-target';
import { load as loadMdnLinks } from 'typedoc-plugin-mdn-links';
import { load as loadGithubTheme } from 'typedoc-github-theme';

/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
  entryPoints: ['./lib/es'],
  entryPointStrategy: 'packages',
  outputs: [
    {
      name: 'html',
      path: './.ignored/docs',
    },
  ],
  // excludeNotDocumented: true,
  // excludeNotDocumentedKinds: ['Function'],
  plugin: [loadImportTarget, loadMdnLinks, loadGithubTheme],
  packageOptions: {
    includeVersion: true,
  },
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
};

export default config;
