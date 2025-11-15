/// <reference types="@budsbox/lib-types/exec-dependency" />
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
async function main() {
  /** @type {[string, string][]} */
  const urls = [
    [
      'generated',
      'https://raw.githubusercontent.com/web-platform-tests/wpt/refs/heads/master/mimesniff/mime-types/resources/generated-mime-types.json',
    ],
    [
      'hand-crafted',
      'https://raw.githubusercontent.com/web-platform-tests/wpt/refs/heads/master/mimesniff/mime-types/resources/mime-types.json',
    ],
  ];

  const fetches = await Promise.all(
    urls.map(async ([name, url]) => {
      /** @type {[string, Response]} */
      const result = [name, await fetch(url, { credentials: 'omit' })];
      return result;
    }),
  );

  const tests = await Promise.all(
    fetches.map(async ([name, res]) => {
      if (!res.ok) {
        throw new Error(
          `Failed to fetch ${name}: ${res.status.toFixed(0)} ${res.statusText}`,
        );
      }

      /** @type {[string, Array<string | object> | null]} */
      const result = [
        name,
        /** @type {Array<string | object>} */ (await res.json()),
      ];
      return result;
    }),
  );

  await Promise.all(
    tests.map(([name, test]) => {
      if (!test) {
        throw new Error(`Failed to parse ${name}`);
      }

      return fs.promises.writeFile(
        path.join(execEnv.buildDir, `./${name}.json`),
        JSON.stringify(
          test.filter((t) => typeof t === 'object'),
          null,
          2,
        ) + '\n',
        'utf-8',
      );
    }),
  );

  await fs.promises.writeFile(
    path.join(execEnv.buildDir, './package.json'),
    JSON.stringify(
      {
        name: 'mime-sniff-test-data',
        version: '2.0.0',
        type: 'module',
        exports: Object.fromEntries(
          tests.map(([name]) => {
            const subpath = `./${name}.json`;
            return [subpath, subpath];
          }),
        ),
      },
      null,
      2,
    ) + '\n',
    'utf-8',
  );
}

void main().then((r) => r);
