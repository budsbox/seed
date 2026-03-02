import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { cwd } from 'node:process';

const links = {
  generated:
    'https://github.com/web-platform-tests/wpt/raw/14fb71ca173ec0e09c051c1378999dd19b897371/mimesniff/mime-types/resources/generated-mime-types.json',
  handCrafted:
    'https://raw.githubusercontent.com/web-platform-tests/wpt/14fb71ca173ec0e09c051c1378999dd19b897371/mimesniff/mime-types/resources/mime-types.json',
  groups:
    'https://github.com/web-platform-tests/wpt/raw/14fb71ca173ec0e09c051c1378999dd19b897371/mimesniff/mime-types/resources/mime-groups.json',
  minimized:
    'https://github.com/web-platform-tests/wpt/raw/14fb71ca173ec0e09c051c1378999dd19b897371/mimesniff/mime-types/resources/mime-types-minimized.json',
};

const outputDir = join(cwd(), 'dist');
await mkdir(outputDir, { recursive: true });

const entries = Object.entries(links);
for (const [name, link] of entries) {
  const response = await fetch(link);
  const json = await response.json();
  await writeFile(
    join(outputDir, `${name}.json`),
    JSON.stringify(json, null, 2),
    'utf-8',
  );
}
