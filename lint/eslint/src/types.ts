import type { ConfigFactory, PresetFactory } from '@budsbox/eslint~core';

export interface CreateConfigEntry {
  tsconfigFile: string;
  presets?: PresetFactory[];
  configs?: ConfigFactory[];
}

export interface CreateFlatConfigParams {
  importMeta: ImportMeta;
  ignores?: readonly string[];
  entries: readonly CreateConfigEntry[];
}
