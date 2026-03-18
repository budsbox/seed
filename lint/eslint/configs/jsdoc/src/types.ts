/* eslint-disable */ // temp
import type { ConfigLevel } from '@budsbox/eslint';

declare module '@budsbox/eslint' {
  interface ConfigNameSpace {
    jsdoc: ConfigLevel;
  }
}

type DocToolName = 'typedoc' | 'api-extractor';

export interface JsdocConfigFactoryOptions {
  optionalTillVersion?: false | string;
  docTool?: DocToolName;
}
