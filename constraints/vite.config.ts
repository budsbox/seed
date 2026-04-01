import packageJson from '#package.json' with { type: 'json' };
import { usePlainConfig } from '@budsbox/builder_vite';

export default usePlainConfig(
  {
    build: {
      rollupOptions: {
        external: Object.keys(packageJson.dependencies).filter(
          (dep) => !dep.startsWith('@budsbox/'),
        ),
      },
    },
  },
  { importMeta: import.meta, lib: true },
);
