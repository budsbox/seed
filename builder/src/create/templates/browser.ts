import type { ArchetypeFiles } from '../types.js';

export const files = {
  'src/index.html': `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Index page</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script type="module" src="./index"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`,
} as const satisfies ArchetypeFiles;
