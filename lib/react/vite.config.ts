import packageJson from '#package.json' with { type: 'json' };
import {
  formatFileName,
  formatVarName,
  useReactConfig,
} from '@budsbox/builder_vite';

export default useReactConfig(() => ({
  build: {
    lib: {
      entry: 'index.ts',
      name: formatVarName(packageJson.name),
      fileName: formatFileName,
      cssFileName: 'index',
    },
  },
}));
