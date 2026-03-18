import type * as nodeFs from 'node:fs';
import type * as nodePath from 'node:path';

declare global {
  const fs: typeof nodeFs;
  const path: typeof nodePath;
  const execEnv: Readonly<Record<'tempDir' | 'buildDir' | 'locator', string>>;
}
