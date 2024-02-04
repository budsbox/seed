import type { CLIOptions } from 'typed-scss-modules/dist/lib/core';
import { createImporter } from './build/json-to-sass.mjs';

export const config: Partial<CLIOptions> = {
  exportType: 'default',
  implementation: 'sass',
  updateStaleOnly: true,
  importer: [createImporter()],
};
