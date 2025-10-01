import type { ArchetypeFiles } from '../types.js';

export const files: ArchetypeFiles = {
  'vite.config.ts': `
import { useReactConfig } from '@budsbox/builder_vite';

export default useReactConfig();
  `,
};
