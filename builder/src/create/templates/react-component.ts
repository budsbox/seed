import type { ArchetypeFiles } from '../types.js';

export const files: ArchetypeFiles = {
  'src/lib.ts': "import type {} from '#types'",
  'src/model.ts': "import type {} from '#types'",
  'src/ui/index.ts': "export type * from './types'",
  'src/ui/style.module.scss': '\n',
  'src/ui/types.ts': "import type {} from '#types'",
};
