import type { CLIOptions } from 'typed-scss-modules/dist/lib/core';

export const config: Partial<CLIOptions> = {
  exportType: 'default',
  implementation: 'sass',
  updateStaleOnly: true,
};
