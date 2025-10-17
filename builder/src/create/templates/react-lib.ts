import type { ArchetypeFiles } from '../types.js';

export const files: ArchetypeFiles = {
  'vite.config.ts': `
import { useReactConfig } from '@budsbox/builder_vite';

export default useReactConfig({}, { lib: true });
`,
  'src/index.html': `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Index page</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script type="module" src="./main.tsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
  `,
  'src/main.tsx': `
import { createRoot } from 'react-dom/client';

import { sure } from '@budsbox/lib-es/logical';

import { Playground } from './Playground';

sure(
  document.getElementById('root'),
  (root) => void createRoot(root).render(<Playground />),
);
  `,
  'src/Playground.tsx': `
import type { FC } from 'react';

/**
 * Represents a functional React component for a library playground.
 *
 * @returns A JSX element.
 */
export const Playground: FC = () => {
  return <div>Playground</div>;
};
  `,
};
