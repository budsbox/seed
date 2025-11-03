/// <reference types="@budsbox/lib-types/exec-dependency" />
async function main() {
  const testsUrl =
    'https://raw.githubusercontent.com/web-platform-tests/wpt/2fefbd3faf1023649a94875b1b98c792d6836c9e/mimesniff/mime-types/resources/generated-mime-types.json';

  const fetchTests = await fetch(testsUrl, { credentials: 'omit' });

  if (!fetchTests.ok) throw new Error(`Failed to fetch ${testsUrl}`);

  const tests = await fetchTests.json();

  if (!tests) throw new Error('Failed to parse tests data');

  fs.writeFileSync(
    path.join(execEnv.buildDir, './tests.json'),
    JSON.stringify(tests, null, 2) + '\n',
    'utf-8',
  );

  fs.writeFileSync(
    path.join(execEnv.buildDir, './package.json'),
    JSON.stringify({
      name: 'mimesniff-tests',
      version: '1.0.0',
      type: 'module',
      exports: { '.': './tests.json' },
    }),
    'utf-8',
  );
}

main().then((r) => r);
